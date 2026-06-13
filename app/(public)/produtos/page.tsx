import Link from "next/link";
import type { Route } from "next";

import { ProductCard } from "@/components/catalog/product-card";
import { listCatalogProducts, listPublicCatalogCategories } from "@/domains/catalog/queries";

export const dynamic = "force-dynamic";

type ProductSearchParams = {
  q?: string;
  categoria?: string;
  ordem?: string;
};

const sortOptions = [
  { label: "Relevancia", value: "relevancia" },
  { label: "Menor preco", value: "menor-preco" },
  { label: "Maior preco", value: "maior-preco" },
  { label: "Em promocao", value: "promocoes" }
];

function buildHref(next: ProductSearchParams): Route {
  const query = new URLSearchParams();
  if (next.q) query.set("q", next.q);
  if (next.categoria) query.set("categoria", next.categoria);
  if (next.ordem && next.ordem !== "relevancia") query.set("ordem", next.ordem);
  const suffix = query.toString();
  return (suffix ? `/produtos?${suffix}` : "/produtos") as Route;
}

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<ProductSearchParams> }) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim().toLowerCase() ?? "";
  const categorySlug = params.categoria?.trim() ?? "";
  const sort = params.ordem?.trim() || "relevancia";

  const [products, categories] = await Promise.all([listCatalogProducts(), listPublicCatalogCategories()]);
  const selectedCategoryName = categories.find((category) => category.slug === categorySlug)?.name;

  const countFor = (categoryName?: string) =>
    categoryName ? products.filter((product) => product.category === categoryName).length : products.length;

  const filteredProducts = products
    .filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const matchesCategory = !selectedCategoryName || product.category === selectedCategoryName;
      return matchesQuery && matchesCategory;
    })
    .sort((left, right) => {
      if (sort === "menor-preco") return (left.priceCents ?? 0) - (right.priceCents ?? 0);
      if (sort === "maior-preco") return (right.priceCents ?? 0) - (left.priceCents ?? 0);
      if (sort === "promocoes") return Number(Boolean(right.onPromotion)) - Number(Boolean(left.onPromotion));
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || (left.priceCents ?? 0) - (right.priceCents ?? 0);
    });

  const isFiltering = query.length > 0 || categorySlug.length > 0;

  return (
    <section className="sec" style={{ paddingTop: 40 }}>
      <div className="lk-wrap">
        <div style={{ maxWidth: 760 }}>
          <span className="selo sec-eyebrow">Loja Laikao</span>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3rem)", fontWeight: 800 }}>
            Tudo que seu pet precisa, <span style={{ color: "var(--rosa)" }}>em um lugar so.</span>
          </h1>
          <p className="sec-lead">Racao, petisco, higiene, beleza, acessorio e brinquedo. Compre e retire na loja ou peca pelo iFood.</p>
        </div>

        <div className="loja" style={{ marginTop: 30 }}>
          <aside className="filtros">
            <div className="grupo">
              <span className="glabel">Buscar</span>
              <form method="get" className="busca">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar produto" aria-label="Buscar produto" />
                {categorySlug ? <input type="hidden" name="categoria" value={categorySlug} /> : null}
                {sort !== "relevancia" ? <input type="hidden" name="ordem" value={sort} /> : null}
              </form>
            </div>

            <div className="grupo">
              <span className="glabel">Categorias</span>
              <div className="catlist">
                <Link className={categorySlug.length === 0 ? "catbtn ativo" : "catbtn"} href={buildHref({ q: params.q, ordem: sort })}>
                  <span>Todos</span>
                  <span className="qt">{countFor()}</span>
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    className={category.slug === categorySlug ? "catbtn ativo" : "catbtn"}
                    href={buildHref({ q: params.q, categoria: category.slug, ordem: sort })}
                  >
                    <span>{category.name}</span>
                    <span className="qt">{countFor(category.name)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="loja-topo">
              <p className="conta">
                <b>{filteredProducts.length}</b> {filteredProducts.length === 1 ? "produto" : "produtos"}
              </p>
              <form method="get" className="ordenar">
                <label htmlFor="ordem">Ordenar por</label>
                {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
                {categorySlug ? <input type="hidden" name="categoria" value={categorySlug} /> : null}
                <select id="ordem" name="ordem" defaultValue={sort}>
                  {sortOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button className="btn btn--linha" type="submit" style={{ minHeight: 40, padding: "0.5rem 1rem", fontSize: "0.92rem" }}>
                  Aplicar
                </button>
              </form>
            </div>

            <div className="grade">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <div className="vazio">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  <h3>Nenhum produto encontrado</h3>
                  <p>{isFiltering ? "Tente outra categoria ou limpe a busca." : "Logo mais teremos novidades por aqui."}</p>
                  {isFiltering ? (
                    <Link className="btn btn--rosa" href={"/produtos" as Route}>
                      Limpar filtros
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
