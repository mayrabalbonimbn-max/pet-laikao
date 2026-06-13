import { randomUUID } from "node:crypto";

import { db } from "@/server/db/client";
import {
  InventoryAdminMovementRecord,
  InventoryAdminRow,
  SupplierRecord
} from "@/domains/inventory-admin/types";
import { calculateSuggestedPrice } from "@/server/services/pricing-service";
import {
  LEGACY_DEMO_INVENTORY_MOVEMENT_IDS,
  LEGACY_DEMO_PRODUCT_IDS,
  LEGACY_DEMO_VARIANT_IDS
} from "@/server/services/demo-data-hygiene-service";

function nextId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

const prisma = db as any;

function getStockStatus(stockQuantity: number, reservedQuantity: number, minimumStock: number) {
  const available = Math.max(stockQuantity - reservedQuantity, 0);

  if (available <= 0 && reservedQuantity > 0) return "reserved" as const;
  if (available <= 0) return "out" as const;
  if (available <= minimumStock) return "low" as const;
  return "healthy" as const;
}

export async function listSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }]
  });

  return suppliers.map((supplier: any) => ({
    id: supplier.id,
    name: supplier.name,
    contactName: supplier.contactName ?? undefined,
    phone: supplier.phone ?? undefined,
    email: supplier.email ?? undefined,
    notes: supplier.notes ?? undefined,
    active: supplier.active
  }));
}

export async function createSupplierRecord(input: Omit<SupplierRecord, "id">) {
  return prisma.supplier.create({
    data: {
      id: nextId("sup"),
      name: input.name,
      contactName: input.contactName ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      notes: input.notes ?? null,
      active: input.active
    }
  });
}

export async function listInventoryAdminRows() {
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { notIn: LEGACY_DEMO_VARIANT_IDS },
      productId: { notIn: LEGACY_DEMO_PRODUCT_IDS }
    },
    include: {
      product: {
        include: {
          category: true
        }
      },
      supplier: true
    },
    orderBy: [{ product: { name: "asc" } }, { title: "asc" }]
  });

  return variants.map((variant: any) => {
    const availableQuantity = Math.max(variant.stockQuantity - variant.reservedQuantity, 0);
    const pricing = calculateSuggestedPrice({
      costCents: variant.costCents,
      desiredMarkupPercent: 0
    });
    const grossProfitCents = Math.max(variant.priceCents - variant.costCents, 0);
    const marginPercent = variant.priceCents === 0 ? 0 : Number(((grossProfitCents / variant.priceCents) * 100).toFixed(2));

    return {
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      variantName: variant.title,
      sku: variant.sku,
      categoryName: variant.product.category?.name ?? "Sem categoria",
      supplierId: variant.supplierId ?? undefined,
      supplierName: variant.supplier?.name ?? undefined,
      costCents: variant.costCents,
      priceCents: variant.priceCents,
      stockQuantity: variant.stockQuantity,
      reservedQuantity: variant.reservedQuantity,
      availableQuantity,
      minimumStock: variant.minimumStock,
      marginPercent,
      totalStockValueCents: variant.costCents * variant.stockQuantity,
      stockStatus: getStockStatus(variant.stockQuantity, variant.reservedQuantity, variant.minimumStock)
    };
  });
}

export async function updateVariantBusinessData(input: {
  variantId: string;
  supplierId?: string;
  costCents: number;
  minimumStock: number;
  priceCents?: number;
}) {
  return prisma.productVariant.update({
    where: { id: input.variantId },
    data: {
      supplierId: input.supplierId ?? null,
      costCents: input.costCents,
      minimumStock: input.minimumStock,
      priceCents: input.priceCents ?? undefined,
      updatedAt: new Date()
    }
  });
}

export async function createInventoryAdminMovement(input: {
  variantId: string;
  movementType: "entry" | "exit" | "adjustment";
  quantity: number;
  reason: string;
  notes?: string;
  unitCostCents?: number;
  referenceType?: string;
  referenceId?: string;
}) {
  return prisma.$transaction(async (tx: any) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: input.variantId },
      include: {
        product: true
      }
    });

    if (!variant) {
      throw new Error("Variante nao encontrada para movimentacao de estoque.");
    }

    let nextStockQuantity = variant.stockQuantity;

    if (input.movementType === "entry") {
      nextStockQuantity += input.quantity;
    } else if (input.movementType === "exit") {
      if (variant.stockQuantity < input.quantity) {
        throw new Error("Nao ha estoque suficiente para registrar a saida.");
      }
      nextStockQuantity -= input.quantity;
    } else {
      nextStockQuantity = input.quantity;
    }

    const updated = await tx.productVariant.update({
      where: { id: variant.id },
      data: {
        stockQuantity: nextStockQuantity,
        costCents: input.unitCostCents ?? variant.costCents,
        updatedAt: new Date()
      }
    });

    await tx.inventoryMovement.create({
      data: {
        id: nextId("imv"),
        productId: variant.productId,
        variantId: variant.id,
        movementType: input.movementType,
        quantity: input.quantity,
        reason: input.reason,
        referenceType: input.referenceType ?? "admin_inventory",
        referenceId: input.referenceId ?? variant.id,
        unitCostCents: input.unitCostCents ?? null,
        totalCostCents: input.unitCostCents ? input.unitCostCents * input.quantity : null,
        notes: input.notes ?? null,
        resultingStockQuantity: updated.stockQuantity
      }
    });
  });
}

export async function listInventoryAdminMovements() {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      id: { notIn: LEGACY_DEMO_INVENTORY_MOVEMENT_IDS },
      productId: { notIn: LEGACY_DEMO_PRODUCT_IDS },
      variantId: { notIn: LEGACY_DEMO_VARIANT_IDS }
    },
    include: {
      product: true,
      variant: true
    },
    orderBy: [{ createdAt: "desc" }]
  });

  return movements.map((movement: any) => ({
    id: movement.id,
    productId: movement.productId,
    variantId: movement.variantId,
    productName: movement.product.name,
    variantName: movement.variant.title,
    sku: movement.variant.sku,
    movementType: movement.movementType as InventoryAdminMovementRecord["movementType"],
    quantity: movement.quantity,
    reason: movement.reason,
    referenceType: movement.referenceType,
    referenceId: movement.referenceId,
    unitCostCents: movement.unitCostCents ?? undefined,
    totalCostCents: movement.totalCostCents ?? undefined,
    notes: movement.notes ?? undefined,
    resultingStockQuantity: movement.resultingStockQuantity ?? undefined,
    createdAt: movement.createdAt.toISOString()
  }));
}
