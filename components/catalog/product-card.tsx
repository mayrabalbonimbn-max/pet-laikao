import Link from "next/link";
import Image from "next/image";

import { ProductPreview } from "@/domains/catalog/types";
import { StockStatusBadge } from "@/components/catalog/stock-status-badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

export function ProductCard({ product, compact = false }: { product: ProductPreview; compact?: boolean }) {
  const hasDiscount = Boolean(product.compareAtCents && product.priceCents && product.compareAtCents > product.priceCents);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_14px_34px_rgba(43,14,70,0.1)] ring-1 ring-brand-100 transition-all hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(43,14,70,0.16)]">
      <div className={cn("relative flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#fff9f2_0%,#f5e9ff_100%)] p-5 text-center", compact ? "h-44" : "h-64")}>
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          {product.featured ? <span className="inline-flex rounded-full bg-[var(--magenta-600)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Mais vendido</span> : null}
          {hasDiscount ? <span className="inline-flex rounded-full bg-[var(--sun-300)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand-950">Oferta</span> : null}
        </div>
        {product.mainImageUrl ? (
          <>
            <Image src={product.mainImageUrl} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
            <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand-900 shadow-[var(--shadow-soft)]">
              {product.category}
            </p>
          </>
        ) : (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--magenta-600)]">{product.category}</p>
            <p className="mt-3 text-lg font-extrabold text-brand-900">{product.imageLabel}</p>
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-4", compact ? "p-4" : "p-5")}>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-extrabold leading-snug text-brand-900">{product.name}</h3>
            <StockStatusBadge status={product.stockStatus} />
          </div>
          <div>
            {hasDiscount ? (
              <p className="text-sm font-semibold text-stone-500 line-through">{formatCurrency((product.compareAtCents ?? 0) / 100)}</p>
            ) : null}
            <p className="font-heading text-3xl font-extrabold text-[var(--magenta-600)]">{product.priceLabel}</p>
          </div>
        </div>

        <div className="mt-auto grid gap-2 border-t border-brand-100 pt-4 sm:grid-cols-[1fr_0.8fr]">
          <Link href={`/produto/${product.slug}`} className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--magenta-600)] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[var(--magenta-500)]">Comprar</Link>
          <Link href={`/produto/${product.slug}`} className="inline-flex h-11 items-center justify-center rounded-full border border-brand-200 bg-white px-4 text-sm font-extrabold text-brand-900 transition-colors hover:border-brand-700 hover:bg-brand-50">Ver produto</Link>
        </div>
      </div>
    </article>
  );
}
