import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { db } from "@/server/db/client";
import {
  LEGACY_DEMO_APPOINTMENT_IDS,
  LEGACY_DEMO_ORDER_IDS
} from "@/server/services/demo-data-hygiene-service";
import {
  IntegrationLogRecord,
  PaymentMethod,
  PaymentProvider,
  PaymentPurpose,
  PaymentRecord,
  PaymentStatus
} from "@/domains/payments/types";

async function ensureInfrastructure() {
  return;
}

const paymentWithRelations = Prisma.validator<Prisma.PaymentDefaultArgs>()({
  include: {
    appointment: {
      include: {
        customer: true,
        service: true,
        pet: true
      }
    },
    order: true,
    integrationLogs: {
      orderBy: {
        createdAt: "desc"
      }
    }
  }
});

type PaymentWithRelations = Prisma.PaymentGetPayload<typeof paymentWithRelations>;

function nextId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function mapPaymentRecord(payment: PaymentWithRelations): PaymentRecord {
  return {
    id: payment.id,
    appointmentId: payment.appointmentId ?? undefined,
    orderId: payment.orderId ?? undefined,
    provider: payment.provider as PaymentRecord["provider"],
    providerPaymentId: payment.providerPaymentId ?? undefined,
    providerCheckoutId: payment.providerCheckoutId ?? undefined,
    referenceType: payment.referenceType as PaymentRecord["referenceType"],
    referenceId: payment.referenceId,
    purpose: payment.purpose as PaymentPurpose,
    method: payment.method as PaymentMethod,
    status: payment.status as PaymentStatus,
    providerStatus: payment.providerStatus ?? undefined,
    amountCents: payment.amountCents,
    currency: payment.currency,
    idempotencyKey: payment.idempotencyKey,
    checkoutUrl: payment.checkoutUrl ?? undefined,
    rawPayload: payment.rawPayload ?? undefined,
    expiresAt: payment.expiresAt?.toISOString(),
    paidAt: payment.paidAt?.toISOString(),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString()
  };
}

function mapIntegrationLogRecord(log: {
  id: string;
  paymentId: string | null;
  provider: string;
  eventType: string;
  eventId: string | null;
  direction: string;
  status: string;
  referenceType: string | null;
  referenceId: string | null;
  idempotencyKey: string | null;
  payload: string;
  responsePayload: string | null;
  headers: string | null;
  createdAt: Date;
  processedAt: Date | null;
}): IntegrationLogRecord {
  return {
    id: log.id,
    paymentId: log.paymentId ?? undefined,
    provider: log.provider as IntegrationLogRecord["provider"],
    eventType: log.eventType,
    eventId: log.eventId ?? undefined,
    direction: log.direction as IntegrationLogRecord["direction"],
    status: log.status as IntegrationLogRecord["status"],
    referenceType: (log.referenceType as IntegrationLogRecord["referenceType"]) ?? undefined,
    referenceId: log.referenceId ?? undefined,
    idempotencyKey: log.idempotencyKey ?? undefined,
    payload: log.payload,
    responsePayload: log.responsePayload ?? undefined,
    headers: log.headers ?? undefined,
    createdAt: log.createdAt.toISOString(),
    processedAt: log.processedAt?.toISOString()
  };
}

async function getPaymentWithRelationsById(id: string) {
  return db.payment.findUnique({
    where: { id },
    ...paymentWithRelations
  });
}

export async function createPaymentRecord(input: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">) {
  await ensureInfrastructure();

  const payment = await db.payment.create({
    data: {
      id: nextId("pay"),
      appointmentId: input.appointmentId ?? null,
      orderId: input.orderId ?? null,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId ?? null,
      providerCheckoutId: input.providerCheckoutId ?? null,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      purpose: input.purpose,
      method: input.method,
      status: input.status,
      providerStatus: input.providerStatus ?? null,
      amountCents: input.amountCents,
      currency: input.currency,
      idempotencyKey: input.idempotencyKey,
      checkoutUrl: input.checkoutUrl ?? null,
      rawPayload: input.rawPayload ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      paidAt: input.paidAt ? new Date(input.paidAt) : null
    }
  });

  const saved = await getPaymentWithRelationsById(payment.id);
  if (!saved) {
    throw new Error("Unable to load payment after create.");
  }

  return mapPaymentRecord(saved);
}

export async function updatePaymentRecord(id: string, patch: Partial<Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">>) {
  await ensureInfrastructure();

  await db.payment.update({
    where: { id },
    data: {
      appointmentId: patch.appointmentId === undefined ? undefined : patch.appointmentId ?? null,
      orderId: patch.orderId === undefined ? undefined : patch.orderId ?? null,
      providerPaymentId: patch.providerPaymentId === undefined ? undefined : patch.providerPaymentId ?? null,
      providerCheckoutId: patch.providerCheckoutId === undefined ? undefined : patch.providerCheckoutId ?? null,
      status: patch.status,
      providerStatus: patch.providerStatus === undefined ? undefined : patch.providerStatus ?? null,
      checkoutUrl: patch.checkoutUrl === undefined ? undefined : patch.checkoutUrl ?? null,
      rawPayload: patch.rawPayload === undefined ? undefined : patch.rawPayload ?? null,
      expiresAt: patch.expiresAt === undefined ? undefined : patch.expiresAt ? new Date(patch.expiresAt) : null,
      paidAt: patch.paidAt === undefined ? undefined : patch.paidAt ? new Date(patch.paidAt) : null,
      updatedAt: new Date()
    }
  });

  const saved = await getPaymentWithRelationsById(id);
  if (!saved) {
    throw new Error("Unable to load payment after update.");
  }

  return mapPaymentRecord(saved);
}

export async function getPaymentById(id: string) {
  await ensureInfrastructure();
  const payment = await getPaymentWithRelationsById(id);
  return payment ? mapPaymentRecord(payment) : null;
}

export async function getPaymentByProviderPaymentId(providerPaymentId: string) {
  await ensureInfrastructure();
  const payment = await db.payment.findUnique({
    where: { providerPaymentId },
    ...paymentWithRelations
  });

  return payment ? mapPaymentRecord(payment) : null;
}

export async function getPaymentByProviderCheckoutId(providerCheckoutId: string) {
  await ensureInfrastructure();
  const payment = await db.payment.findFirst({
    where: { providerCheckoutId },
    ...paymentWithRelations
  });

  return payment ? mapPaymentRecord(payment) : null;
}

export async function findReusablePendingPayment({
  appointmentId,
  orderId,
  purpose,
  method,
  provider
}: {
  appointmentId?: string;
  orderId?: string;
  purpose: PaymentPurpose;
  method: PaymentMethod;
  provider?: PaymentProvider;
}) {
  await ensureInfrastructure();

  const payment = await db.payment.findFirst({
    where: {
      appointmentId: appointmentId ?? undefined,
      orderId: orderId ?? undefined,
      provider: provider ?? undefined,
      purpose,
      method,
      status: "pending"
    },
    orderBy: {
      createdAt: "desc"
    },
    ...paymentWithRelations
  });

  if (!payment) {
    return null;
  }

  if (payment.expiresAt && payment.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  if (!payment.checkoutUrl) {
    return null;
  }

  return mapPaymentRecord(payment);
}

export async function listPaymentsByOrderId(orderId: string) {
  await ensureInfrastructure();
  const payments = await db.payment.findMany({
    where: { orderId },
    orderBy: {
      createdAt: "desc"
    },
    ...paymentWithRelations
  });

  return payments.map(mapPaymentRecord);
}

export async function listPayments() {
  await ensureInfrastructure();
  const payments = await db.payment.findMany({
    where: {
      appointmentId: { notIn: LEGACY_DEMO_APPOINTMENT_IDS },
      orderId: { notIn: LEGACY_DEMO_ORDER_IDS },
      referenceId: { notIn: [...LEGACY_DEMO_APPOINTMENT_IDS, ...LEGACY_DEMO_ORDER_IDS] }
    },
    orderBy: {
      createdAt: "desc"
    },
    ...paymentWithRelations
  });

  return payments.map((payment) => ({
    ...mapPaymentRecord(payment),
    customerName: payment.appointment?.customer.fullName ?? payment.order?.customerName ?? "Cliente",
    serviceName: payment.appointment?.service.name,
    orderNumber: payment.order?.orderNumber
  }));
}

export async function listPaymentsByAppointmentId(appointmentId: string) {
  await ensureInfrastructure();
  const payments = await db.payment.findMany({
    where: { appointmentId },
    orderBy: {
      createdAt: "desc"
    },
    ...paymentWithRelations
  });

  return payments.map(mapPaymentRecord);
}

export async function createIntegrationLog(input: Omit<IntegrationLogRecord, "id" | "createdAt" | "processedAt">) {
  await ensureInfrastructure();

  const log = await db.integrationLog.create({
    data: {
      id: nextId("ilog"),
      paymentId: input.paymentId ?? null,
      provider: input.provider,
      eventType: input.eventType,
      eventId: input.eventId ?? null,
      direction: input.direction,
      status: input.status,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
      payload: input.payload,
      responsePayload: input.responsePayload ?? null,
      headers: input.headers ?? null
    }
  });

  return mapIntegrationLogRecord(log);
}

export async function updateIntegrationLog(
  id: string,
  patch: Partial<Pick<IntegrationLogRecord, "paymentId" | "status" | "responsePayload" | "processedAt" | "referenceType" | "referenceId">>
) {
  await ensureInfrastructure();

  const log = await db.integrationLog.update({
    where: { id },
    data: {
      paymentId: patch.paymentId === undefined ? undefined : patch.paymentId ?? null,
      status: patch.status,
      responsePayload: patch.responsePayload === undefined ? undefined : patch.responsePayload ?? null,
      processedAt: patch.processedAt === undefined ? undefined : patch.processedAt ? new Date(patch.processedAt) : null,
      referenceType: patch.referenceType === undefined ? undefined : patch.referenceType ?? null,
      referenceId: patch.referenceId === undefined ? undefined : patch.referenceId ?? null
    }
  });

  return mapIntegrationLogRecord(log);
}

export async function listIntegrationLogsByPaymentId(paymentId: string) {
  await ensureInfrastructure();
  const logs = await db.integrationLog.findMany({
    where: { paymentId },
    orderBy: {
      createdAt: "desc"
    }
  });

  return logs.map(mapIntegrationLogRecord);
}

export async function listIntegrationLogsByReference(referenceId: string) {
  await ensureInfrastructure();
  const logs = await db.integrationLog.findMany({
    where: { referenceId },
    orderBy: {
      createdAt: "desc"
    }
  });

  return logs.map(mapIntegrationLogRecord);
}

export async function findLatestIntegrationLogByProviderEvent(provider: PaymentProvider, eventId: string) {
  await ensureInfrastructure();

  const log = await db.integrationLog.findFirst({
    where: {
      provider,
      eventId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return log ? mapIntegrationLogRecord(log) : null;
}
