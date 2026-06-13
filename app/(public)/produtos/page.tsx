import Link from "next/link";
import type { Route } from "next";
import { BadgePercent, Filter, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCatalogProducts, listPublicCatalogCategories } from "@/domains/catalog/queries";

export const dynamic = "force-dynamic";

type ProductSearchParams = {
  q?: string;
  categoria?: string;
  preco?: string;
  disponibilidade?: string;
  promocao?: string;
  ordem?: string;
};

const priceRanges = [
  { label: "Ate R$ 50", value: "ate-50" },
  { label: "R$ 50 a R$ 100", value: "50-100" },
  { label: "R$ 100 a R$ 200", value: "100-200" },
  { label: "Acima de R$ 200", value: "200-plus" }
];

const availabilityOptions = [
  { label: "Disponiveis", value: "disponivel" },
  { label: "Ultimas unidades", value: "baixo-estoque" },
  { label: "Indisponiveis", value: "indisponivel" }
];

const sortOptions = [
  { label: "Mais vendidos", value: "mais-vendidos" },
  { label: "Menor preco", value: "menor-preco" },
  { label: "Maior preco", value: "maior-preco" },
  { label: "Promocoes", value: "promocoes" }
];

function categoryHref(slug: string, params: ProductSearchParams) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (slug) query.set("categoria", slug);
  if (params.preco) query.set("preco", params.preco);
  if (params.disponibilidade) query.set("disponibilidade", params.disponibilidade);
  if (params.promocao) query.set("promocao", params.promocao);
  if (params.ordem) query.set("ordem", params.ordem);
  const suffix = query.toString();
  return suffix ? `/produtos?${suffix}` : "/produtos";
}

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<ProductSearchParams> }) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim().toLowerCase() ?? "";
  const categorySlug = params.categoria?.trim() ?? "";
  const priceRange = params.preco?.trim() ?? "";
  const availability = params.disponibilidade?.trim() ?? "";
  const promotion = params.promocao?.trim() ?? "";
  const sort = params.ordem?.trim() || "mais-vendidos";

  const [products, categories] = await Promise.all([listCatalogProducts(), listPublicCatalogCategories()]);
  const visibleCategories = categories;
  const selectedCategoryName = visibleCategories.find((category) => category.slug === categorySlug)?.name;

  const filteredProducts = products
    .filter((product) => {
      const priceCents = product.priceCents ?? 0;
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const matchesCategory = !selectedCategoryName || product.category === selectedCategoryName;
      const matchesPrice =
        priceRange.length === 0 ||
        (priceRange === "ate-50" && priceCents <= 5000) ||
        (priceRange === "50-100" && priceCents > 5000 && priceCents <= 10000) ||
        (priceRange === "100-200" && priceCents > 10000 && priceCents <= 20000) ||
        (priceRange === "200-plus" && priceCents > 20000);
      const matchesAvailability =
        availability.length === 0 ||
        (availability === "disponivel" && ["in_stock", "reserved"].includes(product.stockStatus)) ||
        (availability === "baixo-estoque" && product.stockStatus === "low_stock") ||
        (availability === "indisponivel" && product.stockStatus === "out_of_stock");
      const matchesPromotion = promotion !== "sim" || Boolean(product.onPromotion);

      return matchesQuery && matchesCategory && matchesPrice && matchesAvailability && matchesPromotion;
    })
    .sort((left, right) => {
      if (sort === "menor-preco") return (left.priceCents ?? 0) - (right.priceCents ?? 0);
      if (sort === "maior-preco") return (right.priceCents ?? 0) - (left.priceCents ?? 0);
      if (sort === "promocoes") return Number(Boolean(right.onPromotion)) - Number(Boolean(left.onPromotion));
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || (left.priceCents ?? 0) - (right.priceCents ?? 0);
    });

  return (
    <div className="content-container py-10 sm:py-14">
      <section className="rounded-[34px] bg-[linear-gradient(135deg,#6817b5_0%,#9f38f6_52%,#ef4fb3_100%)] p-1.5 shadow-[0_20px_54px_rgba(43,14,70,0.18)]">
        <div className="rounded-[28px] bg-[#fff9f2] p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <p className="promo-badge-hot">Loja Laikao</p>
              <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl lg:text-6xl">
                Produtos para o dia a dia do seu pet.
              </h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-brand-950/75">
                Racoes, petiscos, higiene, beleza e acessorios em uma vitrine mais clara, forte e facil de comprar.
              </p>
            </div>

            <div className="hidden rounded-[22px] bg-brand-900 px-5 py-4 text-white shadow-[0_16px_34px_rgba(43,14,70,0.16)] lg:block">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sun-300)]">Catalogo ativo</p>
              <p className="mt-1 font-heading text-3xl font-extrabold">{products.length}</p>
              <p className="text-sm font-semibold text-white/75">produtos na vitrine</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-white p-4 shadow-[inset_0_0_0_2px_rgba(104,23,181,0.1)]">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-700">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros da loja
            </p>
            <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.25fr_repeat(5,minmax(0,1fr))_auto]">
              <label className="relative block">
                <span className="sr-only">Buscar produto</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
                <Input name="q" defaultValue={params.q ?? ""} placeholder="Buscar produto" className="pl-10" />
              </label>

              <select name="categoria" defaultValue={categorySlug} className="h-11 min-w-0 rounded-[var(--radius-md)] border border-brand-100 bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-400">
                <option value="">Todas categorias</option>
                {visibleCategories.map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>

              <select name="preco" defaultValue={priceRange} className="h-11 min-w-0 rounded-[var(--radius-md)] border border-brand-100 bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-400">
                <option value="">Preco</option>
                {priceRanges.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>

              <select name="disponibilidade" defaultValue={availability} className="h-11 min-w-0 rounded-[var(--radius-md)] border border-brand-100 bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-400">
                <option value="">Disponibilidade</option>
                {availabilityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>

              <select name="promocao" defaultValue={promotion} className="h-11 min-w-0 rounded-[var(--radius-md)] border border-brand-100 bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-400">
                <option value="">Promocao</option>
                <option value="sim">Em promocao</option>
              </select>

              <select name="ordem" defaultValue={sort} className="h-11 min-w-0 rounded-[var(--radius-md)] border border-brand-100 bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-400">
                {sortOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>

              <Button type="submit" variant="secondary">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] bg-brand-900 p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sun-300)]">
              <BadgePercent className="h-4 w-4" />
              Faixa promocional
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-white">
              Compre pelo site, retire na loja ou acompanhe ofertas do Laikao.
            </h2>
          </div>
          <Link href="/promocoes"><Button variant="secondary">Ver promocoes</Button></Link>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link href={categoryHref("", params) as Route} className={["shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-colors", categorySlug.length === 0 ? "bg-[var(--sun-300)] text-brand-950" : "bg-brand-50 text-brand-900 hover:bg-brand-100"].join(" ")}>
            Todos
          </Link>
          {visibleCategories.map((category) => (
            <Link key={category.id} href={categoryHref(category.slug, params) as Route} className={["shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-colors", category.slug === categorySlug ? "bg-[var(--sun-300)] text-brand-950" : "bg-brand-50 text-brand-900 hover:bg-brand-100"].join(" ")}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-stone-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700">
              <Sparkles className="h-4 w-4" />
              Ordenado por {sortOptions.find((item) => item.value === sort)?.label.toLowerCase()}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Nenhum produto encontrado"
            description="Tente remover algum filtro ou buscar por outra categoria."
            actionLabel="Limpar filtros"
            actionHref="/produtos"
          />
        </div>
      )}
    </div>
  );
}
