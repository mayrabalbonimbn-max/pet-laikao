"use client";

import type { Route } from "next";
import Link from "next/link";
import { TicketPercent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CartSummary({
  cta = "Ir para checkout",
  title = "Resumo do pedido",
  showCoupon = false,
  sticky = false,
  actionHref,
  onAction,
  actionDisabled = false,
  actionLoading = false,
  couponValue,
  onCouponChange,
  onCouponApply,
  couponLoading = false,
  summary = {
    subtotalLabel: "R$ 319,80",
    discountLabel: "- R$ 20,00",
    shippingLabel: "Gratis",
    totalLabel: "R$ 299,80"
  },
  notice
}: {
  cta?: string;
  title?: string;
  showCoupon?: boolean;
  sticky?: boolean;
  actionHref?: Route;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  couponValue?: string;
  onCouponChange?: (value: string) => void;
  onCouponApply?: () => void;
  couponLoading?: boolean;
  summary?: {
    subtotalLabel: string;
    discountLabel: string;
    shippingLabel: string;
    totalLabel: string;
  };
  notice?: {
    title: string;
    description: string;
  };
}) {
  const actionButton = (
    <Button fullWidth size="lg" className="mt-5" onClick={onAction} disabled={actionDisabled || actionLoading}>
      {actionLoading ? "Processando..." : cta}
    </Button>
  );

  return (
    <aside
      className={[
        "surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6",
        sticky ? "xl:sticky xl:top-28" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="space-y-1">
        <p className="eyebrow">Fechamento</p>
        <h2 className="font-heading text-2xl font-semibold text-ink-900">{title}</h2>
      </div>

      {showCoupon ? (
        <div className="mt-5 rounded-[var(--radius-lg)] border border-brand-100 bg-brand-50/60 p-4">
          <div className="flex items-center gap-2 text-brand-700">
            <TicketPercent className="h-4 w-4" />
            <p className="text-sm font-semibold">Cupom ou promocao</p>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Digite seu cupom"
              className="sm:flex-1"
              value={couponValue ?? ""}
              onChange={(event) => onCouponChange?.(event.target.value)}
            />
            <Button variant="secondary" onClick={onCouponApply} disabled={couponLoading}>
              {couponLoading ? "Aplicando..." : "Aplicar"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 text-sm">
        <div className="mt-5 flex justify-between text-stone-500">
          <span>Subtotal</span>
          <span>{summary.subtotalLabel}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>Desconto</span>
          <span>{summary.discountLabel}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>Retirada</span>
          <span>{summary.shippingLabel}</span>
        </div>
        <div className="border-t border-stone-100 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold text-ink-900">Total</span>
            <span className="font-heading text-2xl font-semibold text-brand-700">{summary.totalLabel}</span>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="mt-5 rounded-[var(--radius-lg)] border border-info-500/15 bg-info-500/5 p-4">
          <p className="text-sm font-semibold text-info-500">{notice.title}</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">{notice.description}</p>
        </div>
      ) : null}

      {actionHref && !onAction ? <Link href={actionHref}>{actionButton}</Link> : actionButton}

      <p className="mt-3 text-xs leading-5 text-stone-500">
        Valores, disponibilidade e benefícios precisam continuar claros até o último passo para o cliente fechar com confiança.
      </p>

      <div className="mt-5 xl:hidden">
        <div className="fixed inset-x-4 bottom-4 z-30 rounded-[22px] border border-brand-100 bg-white/95 p-3 shadow-[var(--shadow-elevated)] backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">Total</p>
            <p className="font-heading text-xl font-semibold text-brand-700">{summary.totalLabel}</p>
          </div>
          {actionHref && !onAction ? <Link href={actionHref}>{actionButton}</Link> : actionButton}
        </div>
      </div>
    </aside>
  );
}
