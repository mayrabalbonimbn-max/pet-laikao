import { getPaymentProviderConfigurationError, paymentsConfig } from "@/config/payments";
import { AppointmentRecord } from "@/domains/appointments/types";
import { OrderRecord } from "@/domains/orders/types";
import { PaymentMethod, PaymentRecord, PaymentWebhookPayload } from "@/domains/payments/types";

type InfinitePayCreateCheckoutResponse = {
  url?: string;
  slug?: string;
  invoice_slug?: string;
  id?: string;
};

export type InfinitePayPaymentCheckResponse = {
  success?: boolean;
  paid?: boolean;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
};

export type InfinitePayWebhookBody = {
  invoice_slug?: string;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
  transaction_nsu?: string;
  order_nsu?: string;
  receipt_url?: string;
  items?: Array<{
    quantity?: number;
    price?: number;
    description?: string;
  }>;
};

function getApiBaseUrl() {
  return paymentsConfig.apiBaseUrl.replace(/\/$/, "");
}

function getRequiredHandle() {
  if (!paymentsConfig.handle) {
    throw new Error(getPaymentProviderConfigurationError());
  }

  return paymentsConfig.handle;
}

function buildWebhookUrl() {
  const baseUrl =
    paymentsConfig.webhookPublicUrl ||
    (paymentsConfig.appUrl.startsWith("http://localhost") ? undefined : `${paymentsConfig.appUrl}/api/webhooks/payments`);

  if (!baseUrl) {
    return undefined;
  }

  if (!paymentsConfig.webhookSecret) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("token", paymentsConfig.webhookSecret);
  return url.toString();
}

function buildReturnUrl(paymentId: string, path: string) {
  return `${paymentsConfig.appUrl}${path}?payment_intent=${paymentId}`;
}

function buildCaptureMethodPayload(method: PaymentMethod) {
  if (method === "pix") {
    return { capture_method: "pix" };
  }

  return {
    capture_method: "credit_card",
    installments: 1
  };
}

function normalizePhoneNumber(phone?: string) {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return undefined;
  }

  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
}

export async function createInfinitePayCheckoutLink({
  payment,
  appointment,
  order,
  returnPath
}: {
  payment: PaymentRecord;
  appointment?: AppointmentRecord;
  order?: OrderRecord;
  returnPath: string;
}) {
  const webhookUrl = buildWebhookUrl();
  const customerName = appointment?.customerName ?? order?.customerName;
  const customerEmail = appointment?.customerEmail ?? order?.customerEmail;
  const customerPhone = appointment?.customerPhone ?? order?.customerPhone;
  const description = appointment
    ? `${appointment.serviceName} • ${appointment.petName}`
    : order
      ? `Pedido ${order.orderNumber}`
      : `Pagamento ${payment.referenceId}`;

  const response = await fetch(`${getApiBaseUrl()}/invoices/public/checkout/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      handle: getRequiredHandle(),
      redirect_url: buildReturnUrl(payment.id, returnPath),
      webhook_url: webhookUrl,
      order_nsu: payment.id,
      items: [
        {
          quantity: 1,
          price: payment.amountCents,
          description
        }
      ],
      customer: {
        name: customerName,
        email: customerEmail ?? undefined,
        phone_number: normalizePhoneNumber(customerPhone)
      },
      ...buildCaptureMethodPayload(payment.method)
    })
  });

  const payloadText = await response.text();
  let payload: InfinitePayCreateCheckoutResponse | Record<string, unknown> = {};

  try {
    payload = payloadText ? (JSON.parse(payloadText) as InfinitePayCreateCheckoutResponse) : {};
  } catch {
    payload = { raw: payloadText };
  }

  if (!response.ok) {
    throw new Error(`InfinitePay respondeu com erro ao criar checkout (${response.status}).`);
  }

  if (typeof payload.url !== "string" || payload.url.length === 0) {
    throw new Error("InfinitePay nao retornou uma URL valida de checkout.");
  }

  return {
    providerCheckoutId:
      typeof payload.invoice_slug === "string"
        ? payload.invoice_slug
        : typeof payload.slug === "string"
          ? payload.slug
          : typeof payload.id === "string"
            ? payload.id
            : undefined,
    checkoutUrl: payload.url,
    rawPayload: JSON.stringify(payload),
    expiresAt: payment.expiresAt,
    providerStatus: "pending"
  };
}

export async function fetchInfinitePayPaymentStatus({
  payment,
  transactionNsu,
  slug
}: {
  payment: PaymentRecord;
  transactionNsu?: string;
  slug?: string;
}) {
  const resolvedTransactionNsu = transactionNsu ?? payment.providerPaymentId;
  const resolvedSlug = slug ?? payment.providerCheckoutId;

  if (!resolvedTransactionNsu || !resolvedSlug) {
    throw new Error("A InfinitePay ainda nao retornou transaction_nsu e slug suficientes para consultar este pagamento.");
  }

  const response = await fetch(`${getApiBaseUrl()}/invoices/public/checkout/payment_check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      handle: getRequiredHandle(),
      order_nsu: payment.id,
      transaction_nsu: resolvedTransactionNsu,
      slug: resolvedSlug
    })
  });

  const payloadText = await response.text();
  let payload: InfinitePayPaymentCheckResponse | Record<string, unknown> = {};

  try {
    payload = payloadText ? (JSON.parse(payloadText) as InfinitePayPaymentCheckResponse) : {};
  } catch {
    payload = { raw: payloadText };
  }

  if (!response.ok) {
    throw new Error(`InfinitePay respondeu com erro ao consultar o pagamento (${response.status}).`);
  }

  return {
    transactionNsu: resolvedTransactionNsu,
    slug: resolvedSlug,
    paid: payload.success === true && payload.paid === true,
    amountCents: typeof payload.amount === "number" ? payload.amount : undefined,
    paidAmountCents: typeof payload.paid_amount === "number" ? payload.paid_amount : undefined,
    installments: typeof payload.installments === "number" ? payload.installments : undefined,
    captureMethod: payload.capture_method,
    providerStatus: payload.success === true ? (payload.paid ? "paid" : "pending") : "failed",
    rawPayload: JSON.stringify(payload)
  };
}

export function parseInfinitePayWebhookBody(rawBody: string) {
  if (!rawBody) {
    throw new Error("Webhook da InfinitePay recebido sem payload.");
  }

  try {
    return JSON.parse(rawBody) as InfinitePayWebhookBody;
  } catch {
    throw new Error("Webhook da InfinitePay com JSON invalido.");
  }
}

export function verifyInfinitePayWebhook({
  payload,
  secret
}: {
  payload: PaymentWebhookPayload;
  secret?: string;
}) {
  if (!secret) {
    return true;
  }

  return payload.query.token === secret;
}
