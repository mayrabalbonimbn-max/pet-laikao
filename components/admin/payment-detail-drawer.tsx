"use client";

import { ExternalLink, FileCode2, ReceiptText } from "lucide-react";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PaymentStatusPill } from "@/components/status/payment-status-pill";
import { integrationStatusLabels, paymentMethodLabels, paymentPurposeLabels } from "@/domains/payments/constants";
import { IntegrationLogRecord, PaymentIntentView } from "@/domains/payments/types";

function formatDateTime(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

function prettifyJson(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function PaymentDetailDrawer({
  detail
}: {
  detail: {
    payment: PaymentIntentView;
    logs: IntegrationLogRecord[];
  };
}) {
  const { payment, logs } = detail;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">
          Ver pagamento
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow">Financeiro</p>
            <h3 className="font-heading text-2xl font-semibold">{payment.id}</h3>
            <div className="flex flex-wrap items-center gap-3">
              <PaymentStatusPill status={payment.status} />
              <span className="text-sm text-stone-500">
                {paymentPurposeLabels[payment.purpose]} • {paymentMethodLabels[payment.method]}
              </span>
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-stone-100 bg-stone-50/70 p-4 text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Valor</span>
                <span className="font-semibold text-ink-900">{payment.amountLabel}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Pago em</span>
                <span className="font-medium text-ink-900">{formatDateTime(payment.paidAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Expira em</span>
                <span className="font-medium text-ink-900">{formatDateTime(payment.expiresAt)}</span>
              </div>
            </div>
            {payment.checkoutUrl ? (
              <a
                href={payment.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                Abrir cobrança
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Logs de integracao</p>
            </div>
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{log.eventType}</p>
                        <p className="text-xs text-stone-500">{integrationStatusLabels[log.status]}</p>
                      </div>
                      <p className="text-xs text-stone-500">{formatDateTime(log.createdAt)}</p>
                    </div>
                    {log.payload ? (
                      <details className="mt-3 rounded-[var(--radius-md)] bg-stone-950 p-3 text-xs text-stone-100">
                        <summary className="cursor-pointer text-stone-100">Payload bruto</summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap">{prettifyJson(log.payload)}</pre>
                      </details>
                    ) : null}
                    {log.responsePayload ? (
                      <details className="mt-3 rounded-[var(--radius-md)] bg-brand-950 p-3 text-xs text-white">
                        <summary className="cursor-pointer text-white">Resposta processada</summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap">{prettifyJson(log.responsePayload)}</pre>
                      </details>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Nenhum log de integracao registrado para este pagamento ainda.</p>
            )}
          </div>

          {payment.providerPaymentId ? (
            <div className="space-y-2 rounded-[var(--radius-md)] border border-stone-100 p-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-brand-700" />
                <p className="text-sm font-semibold text-ink-900">Referencia do provedor</p>
              </div>
              <p className="text-xs text-stone-500">{payment.providerPaymentId}</p>
              {payment.providerCheckoutId ? <p className="text-xs text-stone-500">Fatura: {payment.providerCheckoutId}</p> : null}
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
