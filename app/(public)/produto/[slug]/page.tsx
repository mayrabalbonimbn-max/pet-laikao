import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgePercent, HeartHandshake, PackageCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductPurchasePanel } from "@/components/catalog/product-purchase-panel";
import { StockStatusBadge } from "@/components/catalog/stock-status-badge";
import { Button } from "@/components/ui/button";
import { getCatalogProductDetail, listCatalogProducts } from "@/domains/catalog/queries";

export const dynamic = "force-dynamic";

function getVariantStockStatus(availableQuantity: number) {
  if (availableQuantity <= 0) return "out_of_stock" as const;
  if (availableQuantity <= 3) return "low_stock" as const;
  return "in_stock" as const;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([getCatalogProductDetail(slug), listCatalogProducts()]);

  if (!product) {
    notFound();
  }

  const activeVariants = product.variants.filter((variant) => variant.active);
  const primaryVariant = activeVariants[0];
  const stockStatus = primaryVariant ? getVariantStockStatus(primaryVariant.availableQuantity) : "out_of_stock";
  const hasDiscount = Boolean(primaryVariant?.compareAtCents && primaryVariant.compareAtCents > primaryVariant.priceCents);
  const relatedProducts = allProducts
    .filter((item) => item.slug !== product.slug && item.category === (product.categoryName ?? ""))
    .slice(0, 3);
  const fallbackProducts = allProducts.filter((item) => item.slug !== product.slug).slice(0, 3);
  const suggestions = relatedProducts.length > 0 ? relatedProducts : fallbackProducts;

  return (
    <div className="content-container py-8 sm:py-12">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-extrabold text-brand-900">
        <Link href="/produtos" className="rounded-full bg-white px-4 py-2 shadow-[var(--shadow-soft)] ring-1 ring-brand-100 transition-colors hover:bg-brand-50">
          Loja
        </Link>
        <span className="text-brand-300">/</span>
        <Link href={`/produtos?q=${encodeURIComponent(product.categoryName ?? "")}`} className="rounded-full bg-brand-50 px-4 py-2 text-brand-900 transition-colors hover:bg-brand-100">
          {product.categoryName ?? "Produto"}
        </Link>
      </div>

      <section className="rounded-[34px] bg-[linear-gradient(125deg,var(--roxo-profundo)_0%,var(--roxo)_54%,var(--rosa)_100%)] p-1.5 shadow-[0_22px_60px_rgba(74,21,104,0.2)]">
        <div className="grid gap-6 rounded-[28px] bg-white p-5 sm:p-7 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
          <ProductGallery
            images={product.images}
            fallbackLabel={product.imageLabel}
            categoryName={product.categoryName}
            productName={product.name}
            fallbackImageUrl={product.mainImageUrl}
            featured={product.featured}
            hasDiscount={hasDiscount}
          />

          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="promo-badge-hot">{product.categoryName ?? "Produto"}</span>
                <StockStatusBadge status={stockStatus} />
              </div>
              {product.brand ? (
                <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--magenta-600)]">{product.brand}</p>
              ) : null}
              <h1 className="mt-2 font-heading text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-brand-950/75">
                {product.description}
              </p>
            </div>

            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, title: "Compra tranquila", text: "Você confirma a disponibilidade com a gente antes de fechar." },
          { icon: Truck, title: "Entrega ou retirada", text: "Receba pelo iFood até meia-noite ou retire na loja." },
          { icon: PackageCheck, title: "Sempre fresquinho", text: "Produtos certos pro dia a dia do seu pet." },
          { icon: HeartHandshake, title: "Atendida pela Cris", text: "A gente ajuda você a escolher o item certo." }
        ].map((item) => (
          <article key={item.title} className="rounded-[22px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-brand-100">
            <item.icon className="h-5 w-5 text-[var(--magenta-600)]" />
            <h2 className="mt-3 font-heading text-lg font-extrabold text-brand-900">{item.title}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-stone-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 rounded-[28px] bg-brand-900 p-5 text-white shadow-[0_18px_44px_rgba(43,14,70,0.16)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rosa-claro)]">
              <Sparkles className="h-4 w-4" />
              Como receber
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-white">Do seu jeito: retire na loja ou peca pelo iFood.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] bg-white/10 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--rosa-claro)]">Categoria</p>
              <p className="mt-1 font-semibold">{product.categoryName ?? "Loja Laikao"}</p>
            </div>
            <div className="rounded-[18px] bg-white/10 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--rosa-claro)]">Retirada</p>
              <p className="mt-1 font-semibold">Na loja, sem frete</p>
            </div>
            <div className="rounded-[18px] bg-white/10 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--rosa-claro)]">Entrega</p>
              <p className="mt-1 font-semibold">iFood ate meia-noite</p>
            </div>
          </div>
        </div>
      </section>

      {suggestions.length > 0 ? (
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--magenta-600)]">
                <BadgePercent className="h-4 w-4" />
                Sugestoes da loja
              </p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold text-brand-900">Produtos que combinam</h2>
            </div>
            <Link href="/produtos">
              <Button variant="secondary">Ver vitrine completa</Button>
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex">
        <Link href="/produtos" className="text-sm font-extrabold text-brand-700 hover:text-brand-900">
          Voltar para todos os produtos
        </Link>
      </div>
    </div>
  );
}
