import { z } from "zod";

import {
  FinancialDirection,
  FinancialEntryStatus,
  FinancialEntryType,
  FinancialPaymentMethod
} from "@/domains/company-finance/types";
import {
  createFinancialCategoryRecord,
  createFinancialEntryRecord
} from "@/server/repositories/company-finance-repository";

const financialCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  direction: z.custom<FinancialDirection>((value) => ["inflow", "outflow"].includes(String(value))),
  description: z.string().optional(),
  active: z.boolean().default(true)
});

const financialEntrySchema = z.object({
  categoryId: z.string().min(1),
  direction: z.custom<FinancialDirection>((value) => ["inflow", "outflow"].includes(String(value))),
  entryType: z.custom<FinancialEntryType>((value) =>
    ["income", "fixed_expense", "variable_expense", "inventory_purchase", "service_receipt", "withdrawal", "other"].includes(
      String(value)
    )
  ),
  description: z.string().min(2),
  notes: z.string().optional(),
  occurredOn: z.string().min(10),
  amountCents: z.number().int().positive(),
  paymentMethod: z.custom<FinancialPaymentMethod>((value) =>
    ["pix", "credit_card", "debit_card", "cash", "bank_transfer", "other"].includes(String(value))
  ),
  status: z.custom<FinancialEntryStatus>((value) => ["pending", "paid", "cancelled"].includes(String(value))),
  isRecurringFixed: z.boolean().default(false),
  referenceType: z.string().optional(),
  referenceId: z.string().optional()
});

export async function createFinancialCategoryAction(input: unknown) {
  const payload = financialCategorySchema.parse(input);
  await createFinancialCategoryRecord(payload);
}

export async function createFinancialEntryAction(input: unknown) {
  const payload = financialEntrySchema.parse(input);
  await createFinancialEntryRecord(payload);
}
