import { z } from "zod";

import {
  createInventoryAdminMovement,
  createSupplierRecord,
  updateVariantBusinessData
} from "@/server/repositories/inventory-admin-repository";

const supplierSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true)
});

const movementSchema = z.object({
  variantId: z.string().min(1),
  movementType: z.enum(["entry", "exit", "adjustment"]),
  quantity: z.number().int().nonnegative(),
  reason: z.string().min(2),
  notes: z.string().optional(),
  unitCostCents: z.number().int().nonnegative().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional()
});

const variantBusinessSchema = z.object({
  variantId: z.string().min(1),
  supplierId: z.string().optional(),
  costCents: z.number().int().nonnegative(),
  minimumStock: z.number().int().nonnegative(),
  priceCents: z.number().int().nonnegative().optional()
});

export async function createSupplierAction(input: unknown) {
  const payload = supplierSchema.parse(input);
  await createSupplierRecord(payload);
}

export async function createInventoryMovementAction(input: unknown) {
  const payload = movementSchema.parse(input);
  await createInventoryAdminMovement(payload);
}

export async function updateVariantBusinessDataAction(input: unknown) {
  const payload = variantBusinessSchema.parse(input);
  await updateVariantBusinessData(payload);
}
