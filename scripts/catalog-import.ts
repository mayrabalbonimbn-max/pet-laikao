/**
 * Importacao em massa do catalogo (carga inicial).
 *
 * Uso:
 *   npm run catalog:import -- caminho/para/catalogo.csv
 *
 * - Idempotente: faz upsert por slug do produto (rodar de novo nao duplica).
 * - Roda FORA do runtime (comando manual). Teste em laikao_dev antes de producao.
 * - Reaproveita o mesmo pipeline de imagem (sharp) do admin.
 *
 * Colunas aceitas (cabecalho na primeira linha, em qualquer ordem):
 *   nome, marca, categoria, categoria_slug, descricao, preco,
 *   preco_promocional, estoque, imagem, ativo, destaque, slug, status
 */
import fs from "node:fs/promises";
import path from "node:path";

import { listCategoryRecords, upsertCategoryRecord, upsertProductBySlugRecord } from "@/server/repositories/commerce-repository";
import { getProductImageStorage } from "@/server/storage/products-storage";
import { ProductStatus } from "@/domains/catalog/types";

type RowReport = { line: number; slug?: string; name?: string; status: "created" | "updated" | "skipped" | "error"; message?: string };

const VALID_STATUS: ProductStatus[] = ["draft", "active", "out_of_stock", "archived"];
const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const text = content.replace(/^﻿/, "");

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // ignore, handled by \n
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

function parseBool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value.trim() === "") return fallback;
  return ["sim", "s", "true", "1", "yes", "y", "ativo"].includes(value.trim().toLowerCase());
}

function parseMoneyToCents(value: string | undefined) {
  if (!value) return 0;
  const normalized = value.trim().replace(/r\$/i, "").replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) && num > 0 ? Math.round(num * 100) : 0;
}

async function loadImageBytes(source: string): Promise<{ bytes: Buffer; mimeType: string; originalName: string }> {
  const trimmed = source.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const response = await fetch(trimmed);
    if (!response.ok) throw new Error(`Falha ao baixar imagem (${response.status}) de ${trimmed}`);
    const arrayBuffer = await response.arrayBuffer();
    const ext = path.extname(new URL(trimmed).pathname).toLowerCase();
    const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || MIME_BY_EXT[ext] || "image/jpeg";
    return { bytes: Buffer.from(arrayBuffer), mimeType, originalName: path.basename(new URL(trimmed).pathname) || "imagem" };
  }
  const absolute = path.isAbsolute(trimmed) ? trimmed : path.join(process.cwd(), trimmed);
  const bytes = await fs.readFile(absolute);
  const ext = path.extname(absolute).toLowerCase();
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) throw new Error(`Extensao de imagem nao suportada: ${ext || "(sem extensao)"} em ${trimmed}`);
  return { bytes, mimeType, originalName: path.basename(absolute) };
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Informe o arquivo CSV. Ex: npm run catalog:import -- catalogo.csv");
    process.exit(1);
  }

  const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
  const content = await fs.readFile(filePath, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) {
    console.error("CSV vazio ou sem linhas de dados.");
    process.exit(1);
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const index = (name: string) => header.indexOf(name);
  const cols = {
    nome: index("nome"),
    marca: index("marca"),
    categoria: index("categoria"),
    categoriaSlug: index("categoria_slug"),
    descricao: index("descricao"),
    preco: index("preco"),
    promo: index("preco_promocional"),
    estoque: index("estoque"),
    imagem: index("imagem"),
    ativo: index("ativo"),
    destaque: index("destaque"),
    slug: index("slug"),
    status: index("status")
  };

  if (cols.nome < 0 || cols.descricao < 0 || cols.preco < 0) {
    console.error("Cabecalho invalido. Colunas obrigatorias: nome, descricao, preco.");
    console.error("Cabecalho lido:", header.join(", "));
    process.exit(1);
  }

  const storage = getProductImageStorage();
  const categories = await listCategoryRecords();
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  let nextCategoryOrder = categories.reduce((max, category) => Math.max(max, category.displayOrder), 0);

  const report: RowReport[] = [];

  for (let r = 1; r < rows.length; r += 1) {
    const line = r + 1;
    const cells = rows[r];
    const get = (col: number) => (col >= 0 ? (cells[col] ?? "").trim() : "");

    try {
      const name = get(cols.nome);
      if (!name) {
        report.push({ line, status: "skipped", message: "Linha sem nome." });
        continue;
      }
      const slug = get(cols.slug) || slugify(name);
      const description = get(cols.descricao) || name;

      // Categoria (upsert por slug, criando se necessario).
      let categoryId: string | undefined;
      const categoryName = get(cols.categoria);
      const categorySlugRaw = get(cols.categoriaSlug) || (categoryName ? slugify(categoryName) : "");
      if (categorySlugRaw) {
        let category = categoryBySlug.get(categorySlugRaw);
        if (!category) {
          nextCategoryOrder += 1;
          await upsertCategoryRecord({
            name: categoryName || categorySlugRaw,
            slug: categorySlugRaw,
            active: true,
            displayOrder: nextCategoryOrder
          });
          const refreshed = await listCategoryRecords();
          refreshed.forEach((item) => categoryBySlug.set(item.slug, item));
          category = categoryBySlug.get(categorySlugRaw);
        }
        categoryId = category?.id;
      }

      // Preco: normal + promocional (menor). No banco o de venda e o menor.
      const normalCents = parseMoneyToCents(get(cols.preco));
      const promoCents = parseMoneyToCents(get(cols.promo));
      if (normalCents <= 0) {
        report.push({ line, slug, name, status: "error", message: "Preco invalido ou ausente." });
        continue;
      }
      const variantPriceCents = promoCents > 0 && promoCents < normalCents ? promoCents : normalCents;
      const variantCompareAtCents = promoCents > 0 && promoCents < normalCents ? normalCents : undefined;

      const statusRaw = get(cols.status).toLowerCase() as ProductStatus;
      const status = VALID_STATUS.includes(statusRaw) ? statusRaw : "active";
      const active = parseBool(get(cols.ativo), true);
      const featured = parseBool(get(cols.destaque), false);

      // Imagem: so processa em novo produto ou quando ainda nao ha foto (idempotente).
      let images: Awaited<ReturnType<typeof buildImage>> | undefined;
      const imageSource = get(cols.imagem);
      const existing = await findExistingProduct(slug);
      if (imageSource && (!existing || existing.imageCount === 0)) {
        images = await buildImage(storage, imageSource, name);
      }

      const result = await upsertProductBySlugRecord({
        name,
        slug,
        brand: get(cols.marca) || undefined,
        description,
        categoryId,
        status,
        featured,
        active,
        imageLabel: get(cols.marca) || name,
        images,
        variantPriceCents,
        variantCompareAtCents,
        variantStockQuantity: Math.max(0, Math.trunc(Number(get(cols.estoque) || 0)))
      });

      report.push({ line, slug, name, status: result.created ? "created" : "updated" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({ line, status: "error", message });
    }
  }

  printReport(report);
  const hasErrors = report.some((item) => item.status === "error");
  process.exit(hasErrors ? 2 : 0);
}

async function findExistingProduct(slug: string) {
  const { db } = await import("@/server/db/client");
  const product = await db.product.findUnique({ where: { slug }, include: { images: true } });
  return product ? { id: product.id, imageCount: product.images.length } : null;
}

async function buildImage(storage: ReturnType<typeof getProductImageStorage>, source: string, name: string) {
  const { bytes, mimeType, originalName } = await loadImageBytes(source);
  const stored = await storage.save({ bytes, mimeType, originalName });
  return [
    {
      imageUrl: stored.imageUrl,
      imagePath: stored.imagePath,
      imageThumbUrl: stored.imageThumbUrl,
      imageThumbPath: stored.imageThumbPath,
      alt: name,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      width: stored.width,
      height: stored.height,
      displayOrder: 0,
      isPrimary: true
    }
  ];
}

function printReport(report: RowReport[]) {
  const created = report.filter((item) => item.status === "created").length;
  const updated = report.filter((item) => item.status === "updated").length;
  const skipped = report.filter((item) => item.status === "skipped").length;
  const errors = report.filter((item) => item.status === "error");

  console.log("\n=== Relatorio da importacao ===");
  console.log(`Criados:     ${created}`);
  console.log(`Atualizados: ${updated}`);
  console.log(`Ignorados:   ${skipped}`);
  console.log(`Erros:       ${errors.length}`);

  const problems = report.filter((item) => item.status === "error" || item.status === "skipped");
  if (problems.length > 0) {
    console.log("\nDetalhes (linha / motivo):");
    for (const item of problems) {
      console.log(`  Linha ${item.line} [${item.status}]${item.slug ? ` ${item.slug}` : ""}: ${item.message ?? ""}`);
    }
  }
  console.log("===============================\n");
}

main().catch((error) => {
  console.error("Falha geral na importacao:", error);
  process.exit(1);
});
