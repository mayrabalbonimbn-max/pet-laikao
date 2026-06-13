import { createHash } from "node:crypto";

import { getPaymentProviderConfigurationError, isPaymentProviderConfigured, paymentsConfig } from "@/config/payments";
import { transitionAppointment } from "@/domains/appointments/state-machine";
import { AppointmentRecord } from "@/domains/appointments/types";
import { transitionOrder } from "@/domains/orders/state-machine";
import { OrderRecord } from "@/domains/orders/types";
import { mapPaymentToIntentView } from "@/domains/payments/mappers";
import {
  mapInfinitePayStatusToPaymentStatus,
  paymentNeedsSync,
  resolveAppointmentPaymentPurpose,
  resolveOrderPaymentAmountCents,
  resolvePaymentAmountCents
} from "@/domains/payments/policies";
import { PaymentMethod, PaymentPurpose, PaymentRecord, PaymentWebhookPayload } from "@/domains/payments/types";
import {
  addAppointmentTimeline,
  getAppointmentById,
  saveAppointment,
  updateAppointmentHoldStatus
} from "@/server/repositories/appointment-repository";
import {
  addOrderTimeline,
  getOrderById,
  listOrdersForLifecycle,
  saveOrder
} from "@/server/repositories/order-repository";
import {
  createIntegrationLog,
  createPaymentRecord,
  findLatestIntegrationLogByProviderEvent,
  findReusablePendingPayment,
  getPaymentById,
  getPaymentByProviderCheckoutId,
  getPaymentByProviderPaymentId,
  listPaymentsByAppointmentId,
  listPaymentsByOrderId,
  updateIntegrationLog,
  updatePaymentRecord
} from "@/server/repositories/payment-repository";
import {
  createInfinitePayCheckoutLink,
  fetchInfinitePayPaymentStatus,
  parseInfinitePayWebhookBody,
  verifyInfinitePayWebhook
} from "@/server/services/payments/infinitepay-adapter";
import { applyOrderTransition } from "@/server/services/order-lifecycle-service";

type InfinitePaySnapshot = {
  transactionNsu?: string;
  slug?: string;
  paid: boolean;
  providerStatus?: string;
  rawPayload: string;
};

function makeIdempotencyKey(seed: string) {
  return createHash("sha256").update(seed).digest("hex");
}

function toJsonString(value: unknown) {
  return JSON.stringify(value);
}

function getIntentExpiryIso(appointment: AppointmentRecord, purpose: PaymentPurpose) {
  if (purpose === "appointment_balance") {
    return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  }

  return appointment.holdExpiresAt ?? new Date(Date.now() + 1000 * 60 * 10).toISOString();
}

function getOrderIntentExpiryIso() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
}

function isInitialAppointmentPayment(purpose: PaymentPurpose) {
  return purpose === "appointment_deposit" || purpose === "appointment_full";
}

async function createPaymentIntentForAppointment({
  appointment,
  purpose,
  method
}: {
  appointment: AppointmentRecord;
  purpose: PaymentPurpose;
  method: PaymentMethod;
}) {
  if (!isPaymentProviderConfigured()) {
    throw new Error(getPaymentProviderConfigurationError());
  }

  const existing = await findReusablePendingPayment({
    appointmentId: appointment.id,
    purpose,
    method,
    provider: paymentsConfig.provider
  });

  if (existing) {
    return {
      payment: mapPaymentToIntentView(existing),
      appointment
    };
  }

  const amountCents = resolvePaymentAmountCents(appointment, purpose);
  const payment = await createPaymentRecord({
    appointmentId: appointment.id,
    provider: paymentsConfig.provider,
    providerPaymentId: undefined,
    providerCheckoutId: undefined,
    referenceType: "appointment",
    referenceId: appointment.id,
    purpose,
    method,
    status: "pending",
    providerStatus: "pending",
    amountCents,
    currency: paymentsConfig.currency,
    idempotencyKey: makeIdempotencyKey(`${paymentsConfig.provider}:${appointment.id}:${purpose}:${method}:${amountCents}`),
    expiresAt: getIntentExpiryIso(appointment, purpose),
    paidAt: undefined,
    checkoutUrl: undefined,
    rawPayload: undefined
  });

  try {
    const providerCheckout = await createInfinitePayCheckoutLink({
      payment,
      appointment,
      returnPath: "/agenda"
    });

    const savedPayment = await updatePaymentRecord(payment.id, {
      providerCheckoutId: providerCheckout.providerCheckoutId,
      checkoutUrl: providerCheckout.checkoutUrl,
      providerStatus: providerCheckout.providerStatus,
      rawPayload: providerCheckout.rawPayload,
      expiresAt: providerCheckout.expiresAt
    });

    await addAppointmentTimeline(
      appointment.id,
      "Cobranca criada",
      purpose === "appointment_balance"
        ? "Link de pagamento gerado para cobrar o saldo restante do agendamento."
        : "Cobranca online criada e vinculada ao agendamento."
    );

    return {
      payment: mapPaymentToIntentView(savedPayment),
      appointment
    };
  } catch (error) {
    await updatePaymentRecord(payment.id, {
      status: "failed",
      providerStatus: "checkout_error",
      rawPayload: JSON.stringify({
        message: error instanceof Error ? error.message : "Unknown checkout creation error."
      })
    });
    await addAppointmentTimeline(
      appointment.id,
      "Falha ao criar cobranca",
      "Nao foi possivel preparar a cobranca para este agendamento."
    );
    throw error;
  }
}

async function createPaymentIntentForOrder({
  order,
  purpose,
  method
}: {
  order: OrderRecord;
  purpose: PaymentPurpose;
  method: PaymentMethod;
}) {
  if (!isPaymentProviderConfigured()) {
    throw new Error(getPaymentProviderConfigurationError());
  }

  if (order.status === "cancelled" || order.status === "delivered") {
    throw new Error("Este pedido nao aceita nova cobranca.");
  }

  if (order.status === "payment_failed" || order.status === "payment_expired") {
    order = await applyOrderTransition({
      orderId: order.id,
      event: { type: "create_payment_intent" }
    });
  }

  const existing = await findReusablePendingPayment({
    orderId: order.id,
    purpose,
    method,
    provider: paymentsConfig.provider
  });

  if (existing) {
    return {
      payment: mapPaymentToIntentView(existing),
      order
    };
  }

  const amountCents = resolveOrderPaymentAmountCents(order, purpose);
  const payment = await createPaymentRecord({
    orderId: order.id,
    provider: paymentsConfig.provider,
    providerPaymentId: undefined,
    providerCheckoutId: undefined,
    referenceType: "order",
    referenceId: order.id,
    purpose,
    method,
    status: "pending",
    providerStatus: "pending",
    amountCents,
    currency: paymentsConfig.currency,
    idempotencyKey: makeIdempotencyKey(`${paymentsConfig.provider}:${order.id}:${purpose}:${method}:${amountCents}`),
    expiresAt: getOrderIntentExpiryIso(),
    paidAt: undefined,
    checkoutUrl: undefined,
    rawPayload: undefined
  });

  try {
    const providerCheckout = await createInfinitePayCheckoutLink({
      payment,
      order,
      returnPath: "/checkout"
    });

    const savedPayment = await updatePaymentRecord(payment.id, {
      providerCheckoutId: providerCheckout.providerCheckoutId,
      checkoutUrl: providerCheckout.checkoutUrl,
      providerStatus: providerCheckout.providerStatus,
      rawPayload: providerCheckout.rawPayload,
      expiresAt: providerCheckout.expiresAt
    });

    await addOrderTimeline(order.id, "Cobranca criada", "Cobranca online criada para este pedido.");

    return {
      payment: mapPaymentToIntentView(savedPayment),
      order
    };
  } catch (error) {
    await updatePaymentRecord(payment.id, {
      status: "failed",
      providerStatus: "checkout_error",
      rawPayload: JSON.stringify({
        message: error instanceof Error ? error.message : "Unknown checkout creation error."
      })
    });

    await applyOrderTransition({
      orderId: order.id,
      event: { type: "payment_failed" }
    });
    throw error;
  }
}

async function applyPaymentResultToAppointment({
  appointment,
  payment,
  nextPaymentStatus
}: {
  appointment: AppointmentRecord;
  payment: PaymentRecord;
  nextPaymentStatus: PaymentRecord["status"];
}) {
  if (nextPaymentStatus === "paid") {
    if (payment.purpose === "appointment_balance") {
      if (appointment.status !== "confirmed_partial") {
        await addAppointmentTimeline(
          appointment.id,
          "Pagamento do saldo aprovado fora da janela esperada",
          "O saldo foi aprovado, mas o agendamento nao estava mais em estado parcial. Revisao manual recomendada."
        );
        return appointment;
      }

      const transitioned = transitionAppointment(appointment, {
        type: "payment_confirmed",
        paymentOption: "full_100"
      });
      const saved = await saveAppointment(transitioned);
      await addAppointmentTimeline(saved.id, "Saldo quitado", "Pagamento do saldo restante confirmado.");
      return saved;
    }

    if (appointment.status === "payment_expired" || appointment.status === "cancelled") {
      await addAppointmentTimeline(
        appointment.id,
        "Pagamento aprovado apos expiracao/cancelamento",
        "O pagamento foi confirmado, mas a reserva ja nao era mais valida. Revisao manual necessaria."
      );
      return appointment;
    }

    if (appointment.status !== "hold_pending_payment") {
      return appointment;
    }

    const transitioned = transitionAppointment(appointment, {
      type: "payment_confirmed",
      paymentOption: payment.purpose === "appointment_deposit" ? "deposit_50" : "full_100"
    });
    const saved = await saveAppointment(transitioned);
    await updateAppointmentHoldStatus(saved.id, "converted");
    await addAppointmentTimeline(
      saved.id,
      payment.purpose === "appointment_deposit" ? "Sinal confirmado" : "Pagamento integral confirmado",
      payment.purpose === "appointment_deposit"
        ? "Pagamento de 50% confirmado."
        : "Pagamento integral confirmado."
    );
    return saved;
  }

  if (isInitialAppointmentPayment(payment.purpose) && nextPaymentStatus === "failed" && appointment.status === "hold_pending_payment") {
    const transitioned = transitionAppointment(appointment, { type: "payment_failed" });
    const saved = await saveAppointment(transitioned);
    await updateAppointmentHoldStatus(saved.id, "released");
    await addAppointmentTimeline(saved.id, "Pagamento falhou", "A tentativa de pagamento falhou e o slot foi liberado.");
    return saved;
  }

  if (isInitialAppointmentPayment(payment.purpose) && nextPaymentStatus === "expired" && appointment.status === "hold_pending_payment") {
    const transitioned = transitionAppointment(appointment, { type: "payment_expired" });
    const saved = await saveAppointment(transitioned);
    await updateAppointmentHoldStatus(saved.id, "expired");
    await addAppointmentTimeline(saved.id, "Cobranca expirada", "A cobranca expirou antes da confirmacao do pagamento.");
    return saved;
  }

  if (payment.purpose === "appointment_balance" && (nextPaymentStatus === "failed" || nextPaymentStatus === "expired")) {
    await addAppointmentTimeline(
      appointment.id,
      nextPaymentStatus === "failed" ? "Falha ao cobrar saldo" : "Cobranca do saldo expirou",
      "O agendamento continua confirmado com saldo pendente."
    );
  }

  return appointment;
}

async function applyPaymentResultToOrder({
  order,
  payment,
  nextPaymentStatus
}: {
  order: OrderRecord;
  payment: PaymentRecord;
  nextPaymentStatus: PaymentRecord["status"];
}) {
  if (nextPaymentStatus === "paid") {
    if (order.paymentStatus === "paid") {
      return order;
    }

    return applyOrderTransition({
      orderId: order.id,
      event: { type: "payment_confirmed" }
    });
  }

  if (nextPaymentStatus === "failed") {
    if (order.status === "pending_payment") {
      return applyOrderTransition({
        orderId: order.id,
        event: { type: "payment_failed" }
      });
    }
  }

  if (nextPaymentStatus === "expired") {
    if (order.status === "pending_payment") {
      return applyOrderTransition({
        orderId: order.id,
        event: { type: "payment_expired" }
      });
    }
  }

  return order;
}

async function reconcileProviderPayment({
  payment,
  providerSnapshot
}: {
  payment: PaymentRecord;
  providerSnapshot: InfinitePaySnapshot;
}) {
  const nextPaymentStatus = mapInfinitePayStatusToPaymentStatus({
    paid: providerSnapshot.paid,
    expiresAt: payment.expiresAt,
    providerStatus: providerSnapshot.providerStatus
  });

  const alreadyUpToDate =
    payment.providerPaymentId === providerSnapshot.transactionNsu &&
    payment.providerCheckoutId === providerSnapshot.slug &&
    payment.status === nextPaymentStatus &&
    payment.providerStatus === providerSnapshot.providerStatus &&
    payment.rawPayload === providerSnapshot.rawPayload;

  const savedPayment = alreadyUpToDate
    ? payment
    : await updatePaymentRecord(payment.id, {
        providerPaymentId: providerSnapshot.transactionNsu ?? payment.providerPaymentId,
        providerCheckoutId: providerSnapshot.slug ?? payment.providerCheckoutId,
        status: nextPaymentStatus,
        providerStatus: providerSnapshot.providerStatus ?? payment.providerStatus,
        rawPayload: providerSnapshot.rawPayload,
        paidAt: providerSnapshot.paid ? payment.paidAt ?? new Date().toISOString() : payment.paidAt
      });

  if (payment.referenceType === "appointment" && savedPayment.appointmentId) {
    const appointment = await getAppointmentById(savedPayment.appointmentId);
    if (!appointment) {
      return { payment: savedPayment, appointment: null, order: null };
    }

    if (alreadyUpToDate) {
      return { payment: savedPayment, appointment, order: null };
    }

    const updatedAppointment = await applyPaymentResultToAppointment({
      appointment,
      payment: savedPayment,
      nextPaymentStatus
    });

    return {
      payment: savedPayment,
      appointment: updatedAppointment,
      order: null
    };
  }

  if (payment.referenceType === "order" && savedPayment.orderId) {
    const order = await getOrderById(savedPayment.orderId);
    if (!order) {
      return { payment: savedPayment, appointment: null, order: null };
    }

    if (alreadyUpToDate) {
      return { payment: savedPayment, appointment: null, order };
    }

    const updatedOrder = await applyPaymentResultToOrder({
      order,
      payment: savedPayment,
      nextPaymentStatus
    });

    return {
      payment: savedPayment,
      appointment: null,
      order: updatedOrder
    };
  }

  return {
    payment: savedPayment,
    appointment: null,
    order: null
  };
}

export async function createInitialAppointmentPaymentIntent({
  appointmentId,
  method
}: {
  appointmentId: string;
  method: PaymentMethod;
}) {
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new Error("Agendamento nao encontrado.");
  }

  if (appointment.status !== "hold_pending_payment") {
    throw new Error("So e possivel gerar cobranca inicial para um agendamento em hold.");
  }

  return createPaymentIntentForAppointment({
    appointment,
    purpose: resolveAppointmentPaymentPurpose(appointment),
    method
  });
}

export async function createBalancePaymentIntent({
  appointmentId,
  method
}: {
  appointmentId: string;
  method: PaymentMethod;
}) {
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new Error("Agendamento nao encontrado.");
  }

  if (appointment.status !== "confirmed_partial" || appointment.amountBalanceCents <= 0) {
    throw new Error("Este agendamento nao possui saldo pendente para cobranca.");
  }

  return createPaymentIntentForAppointment({
    appointment,
    purpose: "appointment_balance",
    method
  });
}

export async function createOrderPaymentIntent({
  orderId,
  method
}: {
  orderId: string;
  method: PaymentMethod;
}) {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error("Pedido nao encontrado.");
  }

  if (order.paymentStatus === "paid") {
    throw new Error("Este pedido ja esta pago.");
  }

  return createPaymentIntentForOrder({
    order,
    purpose: "order_full",
    method
  });
}

export async function getPaymentStatusWithSync({
  paymentId,
  providerPaymentId,
  providerCheckoutId,
  sync
}: {
  paymentId: string;
  providerPaymentId?: string;
  providerCheckoutId?: string;
  sync: boolean;
}) {
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    throw new Error("Pagamento nao encontrado.");
  }

  let currentPayment = payment;
  let currentAppointment = payment.appointmentId ? await getAppointmentById(payment.appointmentId) : null;
  let currentOrder = payment.orderId ? await getOrderById(payment.orderId) : null;

  if (sync && (providerPaymentId || payment.providerPaymentId) && (providerCheckoutId || payment.providerCheckoutId) && paymentNeedsSync(payment.status)) {
    const providerResponse = await fetchInfinitePayPaymentStatus({
      payment,
      transactionNsu: providerPaymentId,
      slug: providerCheckoutId
    });
    const reconciled = await reconcileProviderPayment({
      payment,
      providerSnapshot: {
        transactionNsu: providerResponse.transactionNsu,
        slug: providerResponse.slug,
        paid: providerResponse.paid,
        providerStatus: providerResponse.providerStatus,
        rawPayload: providerResponse.rawPayload
      }
    });
    currentPayment = reconciled.payment;
    currentAppointment = reconciled.appointment;
    currentOrder = reconciled.order;
  }

  return {
    payment: currentPayment,
    appointment: currentAppointment,
    order: currentOrder
  };
}

export async function processPaymentProviderWebhook(payload: PaymentWebhookPayload) {
  const webhook = parseInfinitePayWebhookBody(payload.rawBody);
  const eventId = webhook.transaction_nsu
    ? `${webhook.order_nsu ?? "unknown"}:${webhook.transaction_nsu}`
    : webhook.invoice_slug
      ? `${webhook.order_nsu ?? "unknown"}:${webhook.invoice_slug}`
      : undefined;

  if (eventId) {
    const existing = await findLatestIntegrationLogByProviderEvent(paymentsConfig.provider, eventId);
    if (existing && (existing.status === "processed" || existing.status === "ignored")) {
      await createIntegrationLog({
        paymentId: existing.paymentId,
        provider: paymentsConfig.provider,
        eventType: "checkout.payment.approved",
        eventId,
        direction: "inbound",
        status: "ignored",
        referenceType: existing.referenceType,
        referenceId: existing.referenceId,
        idempotencyKey: existing.idempotencyKey,
        payload: payload.rawBody,
        responsePayload: JSON.stringify({ message: "Webhook duplicado ignorado." }),
        headers: toJsonString(payload.headers)
      });

      return { ignored: true, duplicate: true };
    }
  }

  const log = await createIntegrationLog({
    paymentId: undefined,
    provider: paymentsConfig.provider,
    eventType: "checkout.payment.approved",
    eventId,
    direction: "inbound",
    status: "received",
    referenceType: undefined,
    referenceId: webhook.order_nsu,
    idempotencyKey: webhook.transaction_nsu,
    payload: payload.rawBody,
    responsePayload: undefined,
    headers: toJsonString(payload.headers)
  });

  try {
    const isValid = verifyInfinitePayWebhook({
      payload,
      secret: paymentsConfig.webhookSecret
    });

    if (!isValid) {
      await updateIntegrationLog(log.id, {
        status: "failed",
        responsePayload: JSON.stringify({ message: "Invalid InfinitePay webhook token." }),
        processedAt: new Date().toISOString()
      });
      throw new Error("Invalid InfinitePay webhook token.");
    }

    if (!webhook.order_nsu) {
      await updateIntegrationLog(log.id, {
        status: "failed",
        responsePayload: JSON.stringify({ message: "InfinitePay webhook sem order_nsu." }),
        processedAt: new Date().toISOString()
      });
      throw new Error("InfinitePay webhook sem order_nsu.");
    }

    const payment =
      (await getPaymentById(webhook.order_nsu)) ??
      (webhook.transaction_nsu ? await getPaymentByProviderPaymentId(webhook.transaction_nsu) : null) ??
      (webhook.invoice_slug ? await getPaymentByProviderCheckoutId(webhook.invoice_slug) : null);

    if (!payment) {
      await updateIntegrationLog(log.id, {
        status: "failed",
        responsePayload: JSON.stringify({ message: "No internal payment found for InfinitePay event." }),
        processedAt: new Date().toISOString()
      });
      throw new Error("No internal payment found for InfinitePay event.");
    }

    const reconciled = await reconcileProviderPayment({
      payment,
      providerSnapshot: {
        transactionNsu: webhook.transaction_nsu,
        slug: webhook.invoice_slug,
        paid: true,
        providerStatus: "paid",
        rawPayload: payload.rawBody
      }
    });

    await updateIntegrationLog(log.id, {
      paymentId: reconciled.payment.id,
      referenceType: reconciled.payment.referenceType,
      referenceId: reconciled.payment.referenceId,
      status: "processed",
      responsePayload: JSON.stringify({
        paymentStatus: reconciled.payment.status,
        appointmentStatus: reconciled.appointment?.status ?? null,
        orderStatus: reconciled.order?.status ?? null,
        inventoryState: reconciled.order?.inventoryState ?? null
      }),
      processedAt: new Date().toISOString()
    });

    return {
      ignored: false,
      payment: reconciled.payment,
      appointment: reconciled.appointment,
      order: reconciled.order
    };
  } catch (error) {
    await updateIntegrationLog(log.id, {
      status: "failed",
      responsePayload: JSON.stringify({
        message: error instanceof Error ? error.message : "Unknown webhook error."
      }),
      processedAt: new Date().toISOString()
    });
    throw error;
  }
}

export async function listPaymentsForAppointment(appointmentId: string) {
  return listPaymentsByAppointmentId(appointmentId);
}

export async function listPaymentsForOrder(orderId: string) {
  return listPaymentsByOrderId(orderId);
}
