import { Prisma } from "@prisma/client";

import { db } from "@/server/db/client";
import { PaymentMethod, PaymentPurpose } from "@/domains/payments/types";
import { OrderDetailView, OrderPaymentListItem, OrderRecord, OrderTimelineEntry } from "@/domains/orders/types";
import { formatCurrency } from "@/lib/formatters";
import { LEGACY_DEMO_ORDER_IDS } from "@/server/services/demo-data-hygiene-service";

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureInfrastructure() {
  return;
}

const orderInclude = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    items: {
      orderBy: {
        createdAt: "asc"
      }
    },
    payments: {
      orderBy: {
        createdAt: "desc"
      }
    },
    timeline: {
      orderBy: {
        createdAt: "desc"
      }
    }
  }
});

type OrderWithRelations = Prisma.OrderGetPayload<typeof orderInclude>;

function mapOrderRecord(order: OrderWithRelations): OrderRecord {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    cartId: order.cartId ?? undefined,
    customerId: order.customerId ?? undefined,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail ?? undefined,
    notes: order.notes ?? undefined,
    status: order.status as OrderRecord["status"],
    paymentStatus: order.paymentStatus as OrderRecord["paymentStatus"],
    fulfillmentStatus: order.fulfillmentStatus as OrderRecord["fulfillmentStatus"],
    inventoryState: order.inventoryState as OrderRecord["inventoryState"],
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

function mapTimelineEntry(entry: OrderWithRelations["timeline"][number]): OrderTimelineEntry {
  return {
    id: entry.id,
    label: entry.label,
    description: entry.description,
    createdAt: entry.createdAt.toISOString()
  };
}

function mapPaymentListItem(payment: OrderWithRelations["payments"][number]): OrderPaymentListItem {
  return {
    id: payment.id,
    purpose: payment.purpose as PaymentPurpose,
    method: payment.method as PaymentMethod,
    status: payment.status as OrderPaymentListItem["status"],
    amountLabel: formatCurrency(payment.amountCents / 100),
    createdAt: payment.createdAt.toISOString(),
    paidAt: payment.paidAt?.toISOString(),
    checkoutUrl: payment.checkoutUrl ?? undefined,
    providerPaymentId: payment.providerPaymentId ?? undefined
  };
}

async function getOrderWithRelations(id: string, tx: Prisma.TransactionClient | typeof db = db) {
  return tx.order.findUnique({
    where: { id },
    ...orderInclude
  });
}

export async function getOrderById(id: string, tx: Prisma.TransactionClient | typeof db = db) {
  if (LEGACY_DEMO_ORDER_IDS.includes(id)) {
    return null;
  }

  await ensureInfrastructure();
  const order = await getOrderWithRelations(id, tx);
  return order ? mapOrderRecord(order) : null;
}

export async function getOrderDetailByIdWithRelations(id: string): Promise<OrderDetailView | null> {
  if (LEGACY_DEMO_ORDER_IDS.includes(id)) {
    return null;
  }

  await ensureInfrastructure();
  const order = await getOrderWithRelations(id);
  if (!order) {
    return null;
  }

  return {
    order: mapOrderRecord(order),
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents
    })),
    timeline: order.timeline.map(mapTimelineEntry),
    payments: order.payments.map(mapPaymentListItem)
  };
}

export async function saveOrder(order: OrderRecord, tx: Prisma.TransactionClient | typeof db = db) {
  await ensureInfrastructure();

  await tx.order.update({
    where: { id: order.id },
    data: {
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      inventoryState: order.inventoryState,
      notes: order.notes ?? null,
      updatedAt: new Date()
    }
  });

  const saved = await getOrderWithRelations(order.id, tx);
  if (!saved) {
    throw new Error("Unable to reload order after update.");
  }

  return mapOrderRecord(saved);
}

export async function addOrderTimeline(
  orderId: string,
  label: string,
  description: string,
  tx: Prisma.TransactionClient | typeof db = db
) {
  await ensureInfrastructure();

  await tx.orderTimeline.create({
    data: {
      id: nextId("ordtl"),
      orderId,
      label,
      description
    }
  });
}

export async function listOrdersForLifecycle() {
  await ensureInfrastructure();
  const orders = await db.order.findMany({
    where: {
      id: { notIn: LEGACY_DEMO_ORDER_IDS }
    },
    orderBy: {
      createdAt: "desc"
    },
    ...orderInclude
  });

  return orders.map((order) => ({
    order: mapOrderRecord(order),
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents
    }))
  }));
}
