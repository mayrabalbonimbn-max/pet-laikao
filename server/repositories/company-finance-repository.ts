import { randomUUID } from "node:crypto";

import { db } from "@/server/db/client";
import {
  AnnualFinanceReport,
  AnnualReportCategoryTotal,
  AnnualReportRow,
  FinancialCategoryRecord,
  FinancialDirection,
  FinancialEntryFilters,
  FinancialEntryRecord,
  FinancialSummary
} from "@/domains/company-finance/types";
import {
  LEGACY_DEMO_APPOINTMENT_IDS,
  LEGACY_DEMO_ORDER_IDS
} from "@/server/services/demo-data-hygiene-service";

function nextId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

const prisma = db as any;

function parseDateRange(filters: FinancialEntryFilters) {
  return {
    gte: filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined,
    lte: filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : undefined
  };
}

function mapFinancialEntry(entry: {
  id: string;
  categoryId: string;
  direction: string;
  entryType: string;
  description: string;
  notes: string | null;
  occurredOn: Date;
  amountCents: number;
  paymentMethod: string;
  status: string;
  isRecurringFixed: boolean;
  referenceType: string | null;
  referenceId: string | null;
  category: { name: string };
}): FinancialEntryRecord {
  return {
    id: entry.id,
    categoryId: entry.categoryId,
    categoryName: entry.category.name,
    direction: entry.direction as FinancialDirection,
    entryType: entry.entryType as FinancialEntryRecord["entryType"],
    description: entry.description,
    notes: entry.notes ?? undefined,
    occurredOn: entry.occurredOn.toISOString(),
    amountCents: entry.amountCents,
    paymentMethod: entry.paymentMethod as FinancialEntryRecord["paymentMethod"],
    status: entry.status as FinancialEntryRecord["status"],
    isRecurringFixed: entry.isRecurringFixed,
    referenceType: entry.referenceType ?? undefined,
    referenceId: entry.referenceId ?? undefined
  };
}

export async function listFinancialCategories() {
  const categories = await prisma.financialCategory.findMany({
    orderBy: [{ direction: "asc" }, { name: "asc" }]
  });

  return categories.map((category: any) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    direction: category.direction as FinancialDirection,
    description: category.description ?? undefined,
    active: category.active
  }));
}

export async function createFinancialCategoryRecord(input: {
  name: string;
  slug: string;
  direction: FinancialDirection;
  description?: string;
  active: boolean;
}) {
  return prisma.financialCategory.create({
    data: {
      id: nextId("fincat"),
      name: input.name,
      slug: input.slug,
      direction: input.direction,
      description: input.description ?? null,
      active: input.active
    }
  });
}

export async function createFinancialEntryRecord(input: {
  categoryId: string;
  direction: FinancialDirection;
  entryType: FinancialEntryRecord["entryType"];
  description: string;
  notes?: string;
  occurredOn: string;
  amountCents: number;
  paymentMethod: FinancialEntryRecord["paymentMethod"];
  status: FinancialEntryRecord["status"];
  isRecurringFixed: boolean;
  referenceType?: string;
  referenceId?: string;
}) {
  return prisma.financialEntry.create({
    data: {
      id: nextId("fin"),
      categoryId: input.categoryId,
      direction: input.direction,
      entryType: input.entryType,
      description: input.description,
      notes: input.notes ?? null,
      occurredOn: new Date(input.occurredOn),
      amountCents: input.amountCents,
      paymentMethod: input.paymentMethod,
      status: input.status,
      isRecurringFixed: input.isRecurringFixed,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null
    }
  });
}

export async function listFinancialEntries(filters: FinancialEntryFilters = {}) {
  const entries = await prisma.financialEntry.findMany({
    where: {
      occurredOn: parseDateRange(filters),
      categoryId: filters.categoryId || undefined,
      direction: !filters.direction || filters.direction === "all" ? undefined : filters.direction,
      entryType: !filters.entryType || filters.entryType === "all" ? undefined : filters.entryType,
      status: !filters.status || filters.status === "all" ? undefined : filters.status
    },
    include: {
      category: true
    },
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }]
  });

  return entries.map((entry: any) => mapFinancialEntry(entry));
}

export async function getFinancialSummary(filters: FinancialEntryFilters = {}): Promise<FinancialSummary> {
  const entries = await listFinancialEntries(filters);
  const paidEntries = entries.filter((entry: FinancialEntryRecord) => entry.status === "paid");

  const inflowCents = paidEntries
    .filter((entry: FinancialEntryRecord) => entry.direction === "inflow")
    .reduce((total: number, entry: FinancialEntryRecord) => total + entry.amountCents, 0);
  const outflowCents = paidEntries
    .filter((entry: FinancialEntryRecord) => entry.direction === "outflow")
    .reduce((total: number, entry: FinancialEntryRecord) => total + entry.amountCents, 0);
  const pendingCents = entries
    .filter((entry: FinancialEntryRecord) => entry.status === "pending")
    .reduce((total: number, entry: FinancialEntryRecord) => total + entry.amountCents, 0);

  return {
    inflowCents,
    outflowCents,
    balanceCents: inflowCents - outflowCents,
    pendingCents,
    paidCount: paidEntries.length,
    entryCount: entries.length
  };
}

export async function buildAnnualFinanceReport(year: number): Promise<AnnualFinanceReport> {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;

  const [entries, appointmentPayments, orderPayments] = await Promise.all([
    listFinancialEntries({ from, to }),
    prisma.payment.findMany({
      where: {
        status: "paid",
        appointmentId: { not: null },
        referenceId: { notIn: LEGACY_DEMO_APPOINTMENT_IDS },
        paidAt: {
          gte: new Date(`${from}T00:00:00.000Z`),
          lte: new Date(`${to}T23:59:59.999Z`)
        }
      },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true
          }
        }
      },
      orderBy: { paidAt: "asc" }
    }),
    prisma.payment.findMany({
      where: {
        status: "paid",
        orderId: { not: null },
        referenceId: { notIn: LEGACY_DEMO_ORDER_IDS },
        paidAt: {
          gte: new Date(`${from}T00:00:00.000Z`),
          lte: new Date(`${to}T23:59:59.999Z`)
        }
      },
      include: {
        order: true
      },
      orderBy: { paidAt: "asc" }
    })
  ]);

  const rows: AnnualReportRow[] = [
    ...entries.map((entry: FinancialEntryRecord) => ({
      source: "manual_entry" as const,
      date: entry.occurredOn,
      category: entry.categoryName,
      description: entry.description,
      amountCents: entry.amountCents,
      direction: entry.direction,
      paymentMethod: entry.paymentMethod,
      status: entry.status
    })),
    ...appointmentPayments.map((payment: any) => ({
      source: "appointment_payment" as const,
      date: (payment.paidAt ?? payment.createdAt).toISOString(),
      category: "Recebimento de servico",
      description: payment.appointment
        ? `${payment.appointment.service.name} - ${payment.appointment.customer.fullName}`
        : payment.referenceId,
      amountCents: payment.amountCents,
      direction: "inflow" as const,
      paymentMethod: payment.method,
      status: payment.status
    })),
    ...orderPayments.map((payment: any) => ({
      source: "order_payment" as const,
      date: (payment.paidAt ?? payment.createdAt).toISOString(),
      category: "Recebimento de pedido",
      description: payment.order ? payment.order.orderNumber : payment.referenceId,
      amountCents: payment.amountCents,
      direction: "inflow" as const,
      paymentMethod: payment.method,
      status: payment.status
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const categoryTotalsMap = new Map<string, AnnualReportCategoryTotal>();
  for (const row of rows) {
    const key = `${row.direction}:${row.category}`;
    const current = categoryTotalsMap.get(key) ?? {
      category: row.category,
      direction: row.direction,
      totalCents: 0
    };
    current.totalCents += row.amountCents;
    categoryTotalsMap.set(key, current);
  }

  const inflowCents = rows.filter((row) => row.direction === "inflow").reduce((total, row) => total + row.amountCents, 0);
  const outflowCents = rows.filter((row) => row.direction === "outflow").reduce((total, row) => total + row.amountCents, 0);

  return {
    year,
    rows,
    categoryTotals: [...categoryTotalsMap.values()].sort((a, b) => a.category.localeCompare(b.category)),
    totals: {
      inflowCents,
      outflowCents,
      balanceCents: inflowCents - outflowCents
    }
  };
}
