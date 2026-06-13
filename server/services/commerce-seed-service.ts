import { db } from "@/server/db/client";
import { ensureAppointmentSeedData } from "@/server/services/appointment-seed-service";
import { categorySeed } from "@/domains/catalog/constants";
import { cleanupLegacyDemoData } from "@/server/services/demo-data-hygiene-service";

declare global {
  // eslint-disable-next-line no-var
  var __laikaoCommerceSeedPromise: Promise<void> | undefined;
}

async function seed() {
  await ensureAppointmentSeedData();
  await cleanupLegacyDemoData();

  await normalizeCatalogTaxonomy();
}

async function normalizeCatalogTaxonomy() {
  const desiredBySlug = new Map(categorySeed.map((category) => [category.slug, category]));

  await db.$transaction(async (tx) => {
    for (const category of categorySeed) {
      await tx.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description ?? null,
          active: true,
          displayOrder: category.displayOrder,
          updatedAt: new Date()
        },
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? null,
          parentId: null,
          active: true,
          displayOrder: category.displayOrder
        }
      });
    }

    const allCategories = await tx.category.findMany();
    const legacyMap: Record<string, string> = {
      banho: "higiene-beleza",
      passeio: "acessorios",
      descanso: "casa"
    };

    for (const legacy of allCategories) {
      const targetSlug = legacyMap[legacy.slug];
      if (!targetSlug) continue;
      const target = allCategories.find((item) => item.slug === targetSlug);
      if (!target) continue;

      await tx.product.updateMany({
        where: { categoryId: legacy.id },
        data: { categoryId: target.id }
      });

      await tx.category.update({
        where: { id: legacy.id },
        data: {
          active: false,
          displayOrder: 999,
          updatedAt: new Date()
        }
      });
    }

    const refreshedCategories = await tx.category.findMany();
    const categoryBySlug = new Map(refreshedCategories.map((item) => [item.slug, item]));
    const products = await tx.product.findMany({ include: { category: true } });

    for (const product of products) {
      if (product.category?.slug && desiredBySlug.has(product.category.slug)) {
        continue;
      }

      const normalized = `${product.name} ${product.description}`.toLowerCase();
      let targetSlug = "acessorios";
      if (normalized.includes("shampoo") || normalized.includes("higiene") || normalized.includes("banho")) {
        targetSlug = "higiene-beleza";
      } else if (normalized.includes("cama") || normalized.includes("casa") || normalized.includes("descanso")) {
        targetSlug = "casa";
      } else if (normalized.includes("guia") || normalized.includes("coleira") || normalized.includes("peitoral")) {
        targetSlug = "acessorios";
      }

      const targetCategory = categoryBySlug.get(targetSlug);
      if (!targetCategory) continue;

      await tx.product.update({
        where: { id: product.id },
        data: { categoryId: targetCategory.id, updatedAt: new Date() }
      });
    }
  });
}

export async function ensureCommerceSeedData() {
  if (!global.__laikaoCommerceSeedPromise) {
    global.__laikaoCommerceSeedPromise = seed();
  }

  await global.__laikaoCommerceSeedPromise;
}
