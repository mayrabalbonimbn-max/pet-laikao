import { InlineNotice } from "@/components/feedback/inline-notice";
import { SuccessBanner } from "@/components/feedback/success-banner";
import { PaymentStatusPill } from "@/components/status/payment-status-pill";
import { Button } from "@/components/ui/button";
import { AppointmentPaymentStatus, AppointmentStatus } from "@/domains/appointments/types";
import { paymentMethodLabels, paymentPurposeLabels } from "@/domains/payments/constants";
import { PaymentIntentView } from "@/domains/payments/types";

type HoldResponse = {
  id: string;
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
  holdExpiresAt?: string;
  serviceName: string;
  customerName: string;
  petName: string;
  selectedStartAt: string;
  amountDueLabel: string;
  amountPaidLabel: string;
  amountBalanceLabel: string;
};

function formatExpiry(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function AppointmentConfirmationPanel({
  appointment,
  paymentIntent,
  paymentError,
  countdownLabel,
  isCreatingPayment,
  isCheckingStatus,
  onCreatePayment,
  onOpenCheckout,
  onCheckStatus,
  onRetry,
  onCreateBalancePayment
}: {
  appointment: HoldResponse;
  paymentIntent?: PaymentIntentView | null;
  paymentError?: string | null;
  countdownLabel?: string;
  isCreatingPayment?: boolean;
  isCheckingStatus?: boolean;
  onCreatePayment: () => void;
  onOpenCheckout: () => void;
  onCheckStatus: () => void;
  onRetry: () => void;
  onCreateBalancePayment?: () => void;
}) {
  const isHold = appointment.status === "hold_pending_payment";
  const isPartial = appointment.status === "confirmed_partial";
  const isPaid = appointment.status === "confirmed_paid";
  const isFailed = appointment.status === "payment_failed";
  const isExpired = appointment.status === "payment_expired";
  const hasPendingCheckout = paymentIntent?.status === "pending" && Boolean(paymentIntent.checkoutUrl);
  const canRegenerateCheckout = paymentIntent?.status === "failed" || paymentIntent?.status === "expired";
  const isBalanceIntent = paymentIntent?.purpose === "appointment_balance";

  return (
    <div className="surface-default space-y-4 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink-900">Confirmacao do fluxo</p>
        <p className="text-sm text-stone-500">
          O pagamento confirma a reserva e atualiza o painel da loja automaticamente.
        </p>
      </div>

      <div className="rounded-[var(--radius-md)] border border-stone-100 bg-stone-50/70 p-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-ink-900">{appointment.serviceName}</p>
            <p className="text-stone-500">
              {appointment.customerName} • {appointment.petName}
            </p>
          </div>
          <PaymentStatusPill status={appointment.paymentStatus} />
        </div>
        <div className="mt-3 grid gap-2 text-sm text-stone-600">
          <div className="flex justify-between gap-3">
            <span>Valor total</span>
            <span className="font-medium text-ink-900">{appointment.amountDueLabel}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Pago ate agora</span>
            <span className="font-medium text-ink-900">{appointment.amountPaidLabel}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Saldo restante</span>
            <span className="font-medium text-ink-900">{appointment.amountBalanceLabel}</span>
          </div>
        </div>
      </div>

      {paymentIntent ? (
        <div className="rounded-[var(--radius-md)] border border-brand-100 bg-brand-50 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink-900">{paymentPurposeLabels[paymentIntent.purpose]}</p>
              <p className="text-stone-500">
                {paymentMethodLabels[paymentIntent.method]} • {paymentIntent.amountLabel}
              </p>
            </div>
            <PaymentStatusPill status={paymentIntent.status} />
          </div>
          <div className="mt-3 space-y-1 text-xs text-stone-500">
            <p>Pagamento: {paymentIntent.id}</p>
            {paymentIntent.expiresAt ? <p>Expira em {formatExpiry(paymentIntent.expiresAt)}</p> : null}
            {paymentIntent.providerPaymentId ? <p>Transacao do pagamento: {paymentIntent.providerPaymentId}</p> : null}
            {paymentIntent.providerCheckoutId ? <p>Referencia da cobranca: {paymentIntent.providerCheckoutId}</p> : null}
          </div>
        </div>
      ) : null}

      {paymentError ? (
        <InlineNotice tone="danger" title="Nao foi possivel preparar a cobranca" description={paymentError} />
      ) : null}

      {isHold ? (
        <>
          <InlineNotice
            tone="warning"
            title="Hold ativo aguardando pagamento"
            description={`O horario esta reservado temporariamente.${countdownLabel ? ` Expira em ${countdownLabel}.` : ""}`}
          />

          {hasPendingCheckout ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button fullWidth onClick={onOpenCheckout}>
                Abrir cobrança
              </Button>
              <Button variant="secondary" fullWidth onClick={onCheckStatus} disabled={isCheckingStatus}>
                {isCheckingStatus ? "Verificando..." : "Ja paguei, verificar status"}
              </Button>
            </div>
          ) : (
            <Button fullWidth onClick={onCreatePayment} disabled={isCreatingPayment}>
              {isCreatingPayment ? "Gerando cobranca..." : "Gerar cobranca real"}
            </Button>
          )}

          {canRegenerateCheckout ? (
            <InlineNotice
              tone="warning"
              title="A cobranca anterior nao esta mais utilizavel"
              description="Voce pode gerar uma nova cobranca enquanto o hold continuar valido."
            />
          ) : null}
        </>
      ) : null}

      {isPartial ? (
        <>
          <SuccessBanner
            title="Agendamento confirmado com saldo pendente"
            description={`O sinal foi confirmado. Saldo restante: ${appointment.amountBalanceLabel}.`}
          />

          {isBalanceIntent && hasPendingCheckout ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button fullWidth onClick={onOpenCheckout}>
                Abrir cobranca do saldo
              </Button>
              <Button variant="secondary" fullWidth onClick={onCheckStatus} disabled={isCheckingStatus}>
                {isCheckingStatus ? "Verificando..." : "Atualizar status do saldo"}
              </Button>
            </div>
          ) : onCreateBalancePayment ? (
            <Button fullWidth onClick={onCreateBalancePayment} disabled={isCreatingPayment}>
              {isCreatingPayment ? "Gerando link..." : "Gerar link para pagar saldo"}
            </Button>
          ) : null}
        </>
      ) : null}

      {isPaid ? (
        <SuccessBanner
          title="Agendamento confirmado e quitado"
          description="O pagamento integral foi conciliado e a agenda operacional ja reflete esse status."
        />
      ) : null}

      {isFailed ? (
        <>
          <InlineNotice
            tone="danger"
            title="Pagamento falhou e o slot foi liberado"
            description="A tentativa ficou registrada. Para tentar novamente, reinicie a reserva e gere uma nova cobranca."
          />
          <Button fullWidth onClick={onRetry}>
            Recomeçar reserva
          </Button>
        </>
      ) : null}

      {isExpired ? (
        <>
          <InlineNotice
            tone="warning"
            title="O prazo da cobranca ou do hold expirou"
            description="O horario foi liberado automaticamente. Escolha outro slot para criar um novo hold."
          />
          <Button fullWidth onClick={onRetry}>
            Recomeçar reserva
          </Button>
        </>
      ) : null}
    </div>
  );
}
