"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AlertTriangle, Percent, RefreshCw } from "lucide-react";

import { CartLineItem } from "@/components/commerce/cart-line-item";
import { CartSummary } from "@/components/commerce/cart-summary";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { InlineNotice } from "@/components/feedback/inline-notice";
import { PracticalLinksGrid } from "@/components/marketing/practical-links-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartView } from "@/domains/orders/types";
import { applyCartCoupon, fetchCart, removeCartItem, updateCartItem } from "@/lib/commerce-client";
import { ensureStoredCartKey } from "@/lib/cart-key";
import { formatCurrency } from "@/lib/formatters";
import { publicRoutes } from "@/lib/routes";

export function CartPageClient() {
  const [cart, setCart] = useState<CartView | null>(null);
  const [cartKey, setCartKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [couponTone, setCouponTone] = useState<"error" | "success" | "warning">("warning");
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isApplyingCoupon, startCouponTransition] = useTransition();

  const loadCart = async (key: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextCart = await fetchCart(key);
      setCart(nextCart);
      if (nextCart.couponCode) {
        setCouponCode(nextCart.couponCode);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível carregar o carrinho.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const key = ensureStoredCartKey();
    setCartKey(key);

    if (key) {
      void loadCart(key);
      return;
    }

    setError("Não foi possível iniciar o carrinho neste dispositivo.");
    setIsLoading(false);
  }, []);

  const notices = useMemo(() => {
    if (!cart) return [];

    const nextNotices: Array<{ tone: "warning" | "info" | "success"; title: string; description: string }> = [];

    if (cart.hasStockIssues) {
      nextNotices.push({
        tone: "warning",
        title: "Alguns itens precisam de revisao antes do checkout",
        description: "O servidor detectou estoque insuficiente em parte do carrinho. Ajuste a quantidade antes de seguir."
      });
    }

    if (cart.hasPriceChanges) {
      nextNotices.push({
        tone: "info",
        title: "Valor atualizado com base no catalogo atual",
        description: "O carrinho foi recalculado para refletir o preco mais recente das variantes selecionadas."
      });
    }

    if (cart.couponCode) {
      nextNotices.push({
        tone: "success",
        title: `Cupom ${cart.couponCode} aplicado`,
        description: "O desconto ja foi recalculado no resumo financeiro abaixo."
      });
    }

    return nextNotices;
  }, [cart]);

  const handleQuantityChange = async (itemId: string, nextQuantity: number) => {
    if (!cartKey || !cart) return;

    setPendingItemId(itemId);
    setCouponFeedback(null);

    try {
      const nextCart = await updateCartItem({ cartKey, itemId, quantity: nextQuantity });
      setCart(nextCart);
    } catch (nextError) {
      setCouponTone("error");
      setCouponFeedback(nextError instanceof Error ? nextError.message : "Não foi possível atualizar a quantidade.");
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!cartKey) return;

    setPendingItemId(itemId);
    setCouponFeedback(null);

    try {
      const nextCart = await removeCartItem({ cartKey, itemId });
      setCart(nextCart);
    } catch (nextError) {
      setCouponTone("error");
      setCouponFeedback(nextError instanceof Error ? nextError.message : "Não foi possível remover o item.");
    } finally {
      setPendingItemId(null);
    }
  };

  const handleApplyCoupon = () => {
    if (!cartKey || !couponCode.trim()) {
      setCouponTone("error");
      setCouponFeedback("Digite um cupom para aplicar no pedido.");
      return;
    }

    startCouponTransition(async () => {
      try {
        const nextCart = await applyCartCoupon({ cartKey, code: couponCode });
        setCart(nextCart);
        setCouponTone("success");
        setCouponFeedback("Cupom aplicado com sucesso.");
      } catch (nextError) {
        setCouponTone("error");
        setCouponFeedback(nextError instanceof Error ? nextError.message : "Não foi possível aplicar o cupom.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="surface-default h-40 animate-pulse border border-stone-100 bg-white" />
          ))}
        </div>
        <div className="surface-default h-80 animate-pulse border border-stone-100 bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <ErrorState title="Não foi possível carregar o carrinho" description={error} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mt-8 space-y-5">
        <EmptyState
          title="Seu carrinho esta vazio"
          description="A tela continua util mesmo sem itens: orienta a voltar para a loja e mantem o funil comercial vivo."
          actionLabel="Voltar para produtos"
          actionHref={publicRoutes.products}
        />
        <PracticalLinksGrid />
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.88fr]">
          {(notices.length > 0 ? notices : [
            {
              tone: "info" as const,
              title: "Carrinho sincronizado com o backend real",
              description: "Quantidade, subtotal, desconto e bloqueios ja saem da camada persistente da loja."
            },
            {
              tone: "success" as const,
              title: "Retirada gratuita na loja",
              description: "O backend ja prepara esse resumo de forma consistente para o checkout evoluir sem retrabalho."
            }
          ]).map((notice) => (
            <InlineNotice key={notice.title} tone={notice.tone} title={notice.title} description={notice.description} />
          ))}
        </div>

        <article className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">Cupom e promocao</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                O cupom agora e aplicado pelo servidor e recalcula subtotal, desconto e total de forma estruturada.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[28rem]">
              <div className="relative flex-1">
                <Percent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
                <Input
                  placeholder="Digite seu cupom"
                  className="pl-10"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                />
              </div>
              <Button variant="secondary" onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                {isApplyingCoupon ? "Aplicando..." : "Aplicar"}
              </Button>
            </div>
          </div>

          {couponFeedback ? (
            <div
              className={[
                "mt-4 rounded-[var(--radius-md)] border px-4 py-3 text-sm",
                couponTone === "error"
                  ? "border-error-500/15 bg-error-500/5 text-error-500"
                  : couponTone === "success"
                    ? "border-success-500/15 bg-success-500/5 text-success-500"
                    : "border-warning-500/15 bg-warning-500/5 text-warning-500"
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-medium">{couponFeedback}</p>
              </div>
            </div>
          ) : null}
        </article>

        <div className="space-y-4">
          {cart.items.map((item) => (
            <CartLineItem
              key={item.id}
              name={item.productName}
              price={formatCurrency(item.unitPriceCents / 100)}
              total={formatCurrency(item.lineTotalCents / 100)}
              category={item.categoryName}
              quantity={item.quantity}
              imageLabel={item.imageLabel}
              stockStatus={item.stockStatus}
              pending={pendingItemId === item.id}
              status={
                item.availableQuantity < item.quantity
                  ? `A quantidade escolhida passou do estoque disponível. Restam ${item.availableQuantity} unidade(s).`
                  : item.priceChanged
                    ? "O valor deste item foi atualizado e o carrinho ja reflete o preco mais recente."
                    : undefined
              }
              onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
              onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">Revisao final antes do checkout</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                O checkout so libera quando o servidor confirma que o carrinho esta consistente para virar pedido.
              </p>
            </div>
            <button type="button" onClick={() => cartKey && loadCart(cartKey)} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
              <RefreshCw className="h-4 w-4" />
              Atualizar carrinho
            </button>
          </div>
        </div>
      </section>

      <CartSummary
        sticky
        actionHref={publicRoutes.checkout}
        cta="Ir para checkout"
        summary={{
          subtotalLabel: cart.subtotalLabel,
          discountLabel: cart.discountLabel,
          shippingLabel: "Gratis",
          totalLabel: cart.totalLabel
        }}
        notice={{
          title: cart.issues.length > 0 ? "Carrinho com ajustes pendentes" : "Pedido pronto para seguir",
          description: cart.issues.length > 0
            ? "Revise os avisos do servidor antes de seguir para o checkout."
            : "No checkout, identificacao, retirada, revisao e criacao do pedido ja usam a camada real da loja."
        }}
      />
    </div>
  );
}
