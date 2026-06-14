"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, ShoppingCart, TriangleAlert } from "lucide-react";

import { ProductRecord } from "@/domains/catalog/types";
import { addCartItem } from "@/lib/commerce-client";
import { ensureStoredCartKey } from "@/lib/cart-key";
import { StockStatusBadge } from "@/components/catalog/stock-status-badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { publicRoutes } from "@/lib/routes";
import { formatCurrency } from "@/lib/formatters";

function getVariantStockStatus(availableQuantity: number) {
  if (availableQuantity <= 0) return "out_of_stock" as const;
  if (availableQuantity <= 3) return "low_stock" as const;
  return "in_stock" as const;
}

export function ProductPurchasePanel({ product }: { product: ProductRecord }) {
  const activeVariants = useMemo(() => product.variants.filter((variant) => variant.active), [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState(activeVariants[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const stockStatus = selectedVariant ? getVariantStockStatus(selectedVariant.availableQuantity) : "out_of_stock";
  const priceLabel = selectedVariant ? formatCurrency(selectedVariant.priceCents / 100) : "Consultar";
  const hasDiscount = Boolean(selectedVariant?.compareAtCents && selectedVariant.compareAtCents > selectedVariant.priceCents);

  const handleAddToCart = () => {
    setMessage(null);

    if (!selectedVariant) {
      setMessageTone("error");
      setMessage("Escolha uma variante antes de adicionar ao carrinho.");
      return;
    }

    startTransition(async () => {
      try {
        const cartKey = ensureStoredCartKey();
        if (!cartKey) throw new Error("Não foi possível iniciar o carrinho neste dispositivo.");

        await addCartItem({
          cartKey,
          variantId: selectedVariant.id,
          quantity: 1
        });

        setMessageTone("success");
        setMessage("Produto adicionado ao carrinho com sucesso.");
      } catch (error) {
        setMessageTone("error");
        setMessage(error instanceof Error ? error.message : "Não foi possível adicionar o produto ao carrinho.");
      }
    });
  };

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-brand-100">
      <div className="flex flex-wrap items-center gap-2">
        <StockStatusBadge status={stockStatus} />
        <span className="inline-flex rounded-full bg-[var(--sun-100)] px-2.5 py-1 text-xs font-extrabold text-brand-950">Entrega ou retirada</span>
      </div>

      <div className="mt-5 rounded-[20px] bg-brand-50 p-4">
        <div className={activeVariants.length === 1 ? "grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center" : ""}>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-700">Comprar este produto</p>
            {hasDiscount ? <p className="mt-2 text-sm font-semibold text-stone-500 line-through">{formatCurrency((selectedVariant?.compareAtCents ?? 0) / 100)}</p> : null}
            <p className="mt-1 font-heading text-4xl font-extrabold text-[var(--magenta-600)]">{priceLabel}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              {selectedVariant && selectedVariant.availableQuantity > 0 ? `${selectedVariant.availableQuantity} unidade(s) disponíveis.` : "Indisponível para compra online agora."}
            </p>
            {activeVariants.length === 1 && selectedVariant ? <p className="mt-1 text-xs font-semibold text-stone-500">SKU {selectedVariant.sku}</p> : null}
          </div>
          {activeVariants.length === 1 ? (
            <Button className="sm:min-w-40" size="lg" fullWidth onClick={handleAddToCart} disabled={isPending || !selectedVariant || selectedVariant.availableQuantity <= 0}>
              <ShoppingCart className="h-4 w-4" />
              {isPending ? "Adicionando..." : "Comprar"}
            </Button>
          ) : null}
        </div>
      </div>

      {activeVariants.length > 1 ? <div className="mt-6 space-y-2">
        <p className="text-sm font-extrabold text-brand-900">Escolha a versao</p>
        <div className="grid gap-2">
          {activeVariants.map((variant) => {
            const selected = variant.id === selectedVariantId;
            const variantHasDiscount = Boolean(variant.compareAtCents && variant.compareAtCents > variant.priceCents);
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={[
                  "rounded-[var(--radius-lg)] border p-4 text-left transition-all",
                  selected ? "border-brand-300 bg-brand-50 shadow-[var(--shadow-soft)]" : "border-stone-100 bg-white hover:border-brand-200 hover:bg-brand-50/60"
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-brand-900">{variant.title}</p>
                    <p className="mt-1 text-sm text-stone-500">SKU {variant.sku}</p>
                  </div>
                  <div className="text-right">
                    {variantHasDiscount ? <p className="text-xs font-semibold text-stone-500 line-through">{formatCurrency((variant.compareAtCents ?? 0) / 100)}</p> : null}
                    <p className="font-extrabold text-[var(--magenta-600)]">{formatCurrency(variant.priceCents / 100)}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {variant.availableQuantity > 0 ? `${variant.availableQuantity} em estoque` : "Sem estoque no momento"}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <StockStatusBadge status={getVariantStockStatus(variant.availableQuantity)} />
                </div>
              </button>
            );
          })}
        </div>
      </div> : null}

      {message ? (
        <div
          className={[
            "mt-4 rounded-[var(--radius-lg)] border p-4 text-sm",
            messageTone === "success" ? "border-success-500/15 bg-success-500/5 text-success-500" : "border-error-500/15 bg-error-500/5 text-error-500"
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            {messageTone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {activeVariants.length > 1 ? (
          <Button size="lg" fullWidth onClick={handleAddToCart} disabled={isPending || !selectedVariant || selectedVariant.availableQuantity <= 0}>
            <ShoppingCart className="h-4 w-4" />
            {isPending ? "Adicionando..." : "Comprar"}
          </Button>
        ) : null}
        <Link href={publicRoutes.cart}>
          <Button variant="secondary" size="lg" fullWidth>
            Ver carrinho
          </Button>
        </Link>
        <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="lg" fullWidth>
            <MessageCircle className="h-4 w-4" />
            Tirar duvidas
          </Button>
        </a>
      </div>
    </div>
  );
}
