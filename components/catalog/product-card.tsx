import Link from "next/link";

import { ProductPreview } from "@/domains/catalog/types";
import { formatCurrency } from "@/lib/formatters";

function ThumbFallback() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16l-1 13H5z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

export function ProductCard({ product }: { product: ProductPreview; compact?: boolean }) {
  const hasDiscount = Boolean(product.compareAtCents && product.priceCents && product.compareAtCents > product.priceCents);
  const isOut = product.stockStatus === "out_of_stock";
  const isLow = product.stockStatus === "low_stock";
  const href = `/produto/${product.slug}` as const;

  return (
    <article className={isOut ? "prod indisp" : "prod"}>
      <Link href={href} className="thumb" aria-label={product.name}>
        {product.mainImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.mainImageUrl} alt={product.name} />
        ) : (
          <ThumbFallback />
        )}
        <span className="tag-cat">{product.category}</span>
        {hasDiscount || product.onPromotion ? <span className="tag-promo">Oferta</span> : null}
        {!hasDiscount && !product.onPromotion && isLow ? <span className="tag-promo">Ultimas unidades</span> : null}
      </Link>

      <div className="corpo">
        <span className="marca-prod">{product.brand ?? product.category}</span>
        <h3>
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="preco">
          <span className="agora">{product.priceLabel}</span>
          {hasDiscount ? <span className="antes">{formatCurrency((product.compareAtCents ?? 0) / 100)}</span> : null}
        </div>
        <div className="add">
          {isOut ? (
            <span className="btn" aria-disabled="true">
              Indisponível
            </span>
          ) : (
            <Link className="btn btn--rosa" href={href}>
              Ver produto
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
