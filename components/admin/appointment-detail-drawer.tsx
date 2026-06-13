"use client";

import { CalendarClock, CircleDollarSign, CreditCard, ExternalLink, TimerReset } from "lucide-react";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BalanceDueIndicator } from "@/components/status/balance-due-indicator";
import { OperationalStatusPill } from "@/components/status/operational-status-pill";
import { PaymentStatusPill } from "@/components/status/payment-status-pill";
import { AppointmentAdminDetail } from "@/domains/appointments/types";
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

export function AppointmentDetailDrawer({ appointment }: { appointment: AppointmentAdminDetail }) {
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
            <p className="eyebrow">Detalhe do agendamento</p>
            <h3 className="font-heading text-2xl font-semibold">{appointment.id}</h3>
            <p className="text-sm text-stone-500">
              {appointment.customerName} • {appointment.petName}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[var(--radius-md)] bg-brand-50 p-4">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-brand-700" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{appointment.serviceName}</p>
                  <p className="text-sm text-stone-500">{formatDateTime(appointment.scheduledStartAt)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <OperationalStatusPill status={appointment.status} />
              <PaymentStatusPill status={appointment.paymentStatus} />
            </div>
            {appointment.amountBalanceCents > 0 ? (
              <BalanceDueIndicator value={formatCurrency(appointment.amountBalanceCents / 100)} />
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Leitura financeira</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-stone-100 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Pago ate agora</span>
                <span className="font-semibold text-ink-900">{formatCurrency(appointment.amountPaidCents / 100)}</span>
              </div>
              <div className="mt-3 flex justify-between gap-3">
                <span className="text-stone-500">Saldo restante</span>
                <span className="font-semibold text-ink-900">{formatCurrency(appointment.amountBalanceCents / 100)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Pagamentos vinculados</p>
            </div>
            {appointment.payments && appointment.payments.length > 0 ? (
              <div className="space-y-3">
                {appointment.payments.map((payment) => (
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
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
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
              <p className="text-sm text-stone-500">Nenhum pagamento vinculado a este agendamento ainda.</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TimerReset className="h-4 w-4 text-brand-700" />
              <p className="text-sm font-semibold text-ink-900">Timeline basica</p>
            </div>
            <div className="space-y-3">
              {appointment.timeline.map((entry) => (
                <div key={entry.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                  <p className="text-sm font-semibold text-ink-900">{entry.label}</p>
                  <p className="mt-1 text-sm text-stone-500">{entry.description}</p>
                  <p className="mt-2 text-xs text-stone-500">{formatDateTime(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" fullWidth>
              Check-in
            </Button>
            <Button variant="secondary" fullWidth>
              Reagendar
            </Button>
            <Button variant="secondary" fullWidth>
              Cancelar
            </Button>
            <Button variant="secondary" fullWidth>
              Cobrar saldo
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
