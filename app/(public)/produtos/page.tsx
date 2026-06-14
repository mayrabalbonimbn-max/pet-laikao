import Link from "next/link";
import type { Route } from "next";

import { ProductCard } from "@/components/catalog/product-card";
import { siteConfig } from "@/config/site";
import { listCatalogProducts, listPublicCatalogCategories } from "@/domains/catalog/queries";

export const dynamic = "force-dynamic";

function Paw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="9" r="2" />
      <circle cx="12" cy="6.5" r="2.1" />
      <circle cx="18" cy="9" r="2" />
      <path d="M12 11.5c-2.6 0-4.7 2-4.7 4.2 0 1.5 1.2 2.3 2.7 2.3.9 0 1.4-.3 2-.3s1.1.3 2 .3c1.5 0 2.7-.8 2.7-2.3 0-2.2-2.1-4.2-4.7-4.2z" />
    </svg>
  );
}

type ProductSearchParams = {
  q?: string;
  categoria?: string;
  ordem?: string;
};

const sortOptions = [
  { label: "Relevância", value: "relevancia" },
  { label: "Menor preço", value: "menor-preco" },
  { label: "Maior preço", value: "maior-preco" },
  { label: "Em promoção", value: "promocoes" }
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
    <>
    <section className="sec" style={{ paddingTop: 40 }}>
      <div className="lk-wrap">
        <div style={{ maxWidth: 760 }}>
          <span className="selo sec-eyebrow">Loja Laikão</span>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3rem)", fontWeight: 800 }}>
            Tudo que seu pet precisa, <span style={{ color: "var(--rosa)" }}>em um lugar só.</span>
          </h1>
          <p className="sec-lead">Ração, petisco, higiene, beleza, acessório e brinquedo. Compre e retire na loja ou peça pelo iFood.</p>
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

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="lk-wrap">
        <div className="promo-destaque">
          <div>
            <span className="selo">
              <Paw className="paw" /> Também no iFood
            </span>
            <h2>Receba em casa, no iFood até meia-noite.</h2>
            <p>
              Esqueceu a ração ou o petisco acabou tarde da noite? A Laikão entrega pelo iFood até meia-noite. E se preferir,
              você compra e retira na loja, sem frete.
            </p>
            <div className="acoes">
              <a className="btn btn--rosa" href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                Pedir no iFood
              </a>
              <a className="btn btn--linha" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="photo-frame photo-frame--quadro" aria-hidden="true" style={{ boxShadow: "none", outlineColor: "rgba(255,255,255,.5)" }}>
            <div className="ph-fallback">
              <svg className="big-paw" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 7h13v8H3z" />
                <path d="M16 10h3l2 3v2h-5z" />
                <circle cx="7" cy="17" r="1.8" />
                <circle cx="17" cy="17" r="1.8" />
              </svg>
              <span>Entrega ou retirada, do seu jeito</span>
            </div>
          </div>
        </div>

        <div className="promo-grid">
          <article className="promo">
            <span className="faixinha">Vantagem fixa</span>
            <h3>Retire na loja sem frete</h3>
            <p>Compre pelo site ou WhatsApp e retire na Laikão, na Vila Nova Cachoeirinha, sem pagar entrega.</p>
            <a className="btn btn--rosa promo-cta" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
              Falar no WhatsApp
            </a>
          </article>

          <article className="promo">
            <span className="faixinha">Vantagem fixa</span>
            <h3>Atendimento até meia-noite</h3>
            <p>Pedidos pelo iFood com a loja aberta até tarde, pros perrengues de última hora.</p>
            <a className="btn btn--rosa promo-cta" href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
              Pedir no iFood
            </a>
          </article>
        </div>
      </div>
    </section>
    </>
  );
}
