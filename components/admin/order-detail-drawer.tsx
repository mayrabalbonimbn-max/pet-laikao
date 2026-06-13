"use client";

import { CircleDollarSign, ExternalLink, PackageCheck, ScrollText, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { OperationalStatusPill } from "@/components/status/operational-status-pill";
import { PaymentStatusPill } from "@/components/status/payment-status-pill";
import { inventoryStateLabels } from "@/domains/orders/constants";
import { OrderDetailView, OrderTransitionEvent } from "@/domains/orders/types";
import { paymentMethodLabels, paymentPurposeLabels } from "@/domains/payments/constants";
import { formatCurrency } from "@/lib/formatters";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

type OrderAction = {
  label: string;
  type: "payment_intent" | OrderTransitionEvent["type"];
  tone?: "danger";
};

function getVisibleActions(detail: OrderDetailView) {
  const actions: OrderAction[] = [];

  if (detail.order.paymentStatus !== "paid" && detail.order.status !== "cancelled" && detail.order.status !== "delivered") {
    actions.push({ label: "Gerar cobrança", type: "payment_intent" });
  }

  if (detail.order.status === "paid") {
    actions.push({ label: "Iniciar separação", type: "start_processing" });
  }

  if (detail.order.status === "processing") {
    actions.push({ label: "Marcar pronto", type: "mark_ready_for_pickup" });
    actions.push({ label: "Marcar enviado", type: "mark_shipped" });
  }

  if (detail.order.status === "ready_for_pickup" || detail.order.status === "shipped") {
    actions.push({ label: "Marcar entregue", type: "mark_delivered" });
  }

  if (detail.order.status !== "cancelled" && detail.order.status !== "delivered") {
    actions.push({ label: "Cancelar", type: "cancel", tone: "danger" });
  }

  return actions;
}

export function OrderDetailDrawer({ detail }: { detail: OrderDetailView }) {
  const router = useRouter();
  const visibleActions = getVisibleActions(detail);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function runAction(action: OrderAction) {
    setActionMessage(null);

    startTransition(async () => {
      try {
        if (action.type === "payment_intent") {
          const response = await fetch(`/api/orders/${detail.order.id}/payment-intent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ method: "pix" })
          });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(typeof payload?.message === "string" ? payload.message : "Não foi possível gerar a cobrança.");
          }

          setActionMessage({
            tone: "success",
            text: payload?.payment?.checkoutUrl
              ? "Cobrança gerada. O link aparece em pagamentos vinculados."
              : "Pedido atualizado, mas o provedor não retornou um link de pagamento."
          });
          router.refresh();
          return;
        }

        const response = await fetch(`/api/orders/${detail.order.id}/transition`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ event: action.type })
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(typeof payload?.message === "string" ? payload.message : "Não foi possível atualizar o pedido.");
        }

        setActionMessage({ tone: "success", text: "Pedido atualizado com segurança." });
        router.refresh();
      } catch (error) {
        setActionMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "Não foi possível concluir esta ação."
        });
      }
    });
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">
          Ver detalhe
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow">Detalhe do pedido</p>
            <h3 className="font-heading text-2xl font-semibold">{detail.order.orderNumber}</h3>
            <p className="text-sm text-stone-500">{detail.order.customerName}</p>
          </div>

          <div className="space-y-3 rounded-[var(--radius-lg)] bg-brand-50 p-4">
            <div className="flex flex-wrap gap-3">
              <OperationalStatusPill status={detail.order.status} />
              <PaymentStatusPill status={detail.order.paymentStatus} />
              <OperationalStatusPill status={detail.order.fulfillmentStatus} />
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 rounded-[var(--radius-md)] bg-white/80 p-3">
                <span className="text-stone-500">Total</span>
                <span className="font-semibold text-ink-900">{formatCurrency(detail.order.totalCents / 100)}</span>
              </div>
              <div className="flex justify-between gap-3 rounded-[var(--radius-md)] bg-white/80 p-3">
                <span className="text-stone-500">Estoque</span>
                <span className="font-semibold text-ink-900">{inventoryStateLabels[detail.order.inventoryState]}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Itens do pedido</p>
            </div>
            <div className="space-y-3">
              {detail.items.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{item.productName}</p>
                      <p className="text-xs text-stone-500">
                        {item.variantName} • SKU {item.sku}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink-900">{formatCurrency(item.lineTotalCents / 100)}</span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">{item.quantity} unidade(s)</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Pagamentos vinculados</p>
            </div>
            {detail.payments.length > 0 ? (
              <div className="space-y-3">
                {detail.payments.map((payment) => (
                  <div key={payment.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{paymentPurposeLabels[payment.purpose]}</p>
                        <p className="text-xs text-stone-500">
                          {paymentMethodLabels[payment.method]} • {payment.amountLabel}
                        </p>
                      </div>
                      <PaymentStatusPill status={payment.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-500">
                      <span>Criado em {formatDateTime(payment.createdAt)}</span>
                      {payment.paidAt ? <span>Pago em {formatDateTime(payment.paidAt)}</span> : null}
                    </div>
                    {payment.checkoutUrl ? (
                      <a
                        href={payment.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Abrir cobrança
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Nenhum pagamento vinculado a este pedido ainda.</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Timeline basica</p>
            </div>
            <div className="space-y-3">
              {detail.timeline.map((entry) => (
                <div key={entry.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                  <p className="text-sm font-semibold text-ink-900">{entry.label}</p>
                  <p className="mt-1 text-sm text-stone-500">{entry.description}</p>
                  <p className="mt-2 text-xs text-stone-500">{formatDateTime(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Acoes da etapa</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleActions.map((action) => (
                <Button
                  key={`${action.type}-${action.label}`}
                  variant={action.tone === "danger" ? "ghost" : "secondary"}
                  fullWidth
                  disabled={isPending}
                  onClick={() => runAction(action)}
                >
                  {isPending ? "Atualizando..." : action.label}
                </Button>
              ))}
            </div>
            {actionMessage ? (
              <p className={actionMessage.tone === "success" ? "text-sm font-semibold text-success-500" : "text-sm font-semibold text-error-500"}>
                {actionMessage.text}
              </p>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
