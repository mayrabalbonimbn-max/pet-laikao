export type InventoryAdminMovementType =
  | "entry"
  | "exit"
  | "adjustment"
  | "reserve"
  | "release"
  | "decrement"
  | "restock";

export type SupplierRecord = {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  active: boolean;
};

export type InventoryAdminRow = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  categoryName: string;
  supplierId?: string;
  supplierName?: string;
  costCents: number;
  priceCents: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  marginPercent: number;
  totalStockValueCents: number;
  stockStatus: "healthy" | "low" | "out" | "reserved";
};

export type InventoryAdjustmentInput = {
  variantId: string;
  movementType: "entry" | "exit" | "adjustment";
  quantity: number;
  reason: string;
  notes?: string;
  unitCostCents?: number;
  referenceType?: string;
  referenceId?: string;
};

export type InventoryAdminMovementRecord = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  movementType: InventoryAdminMovementType;
  quantity: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  unitCostCents?: number;
  totalCostCents?: number;
  notes?: string;
  resultingStockQuantity?: number;
  createdAt: string;
};

export const inventoryMovementTypeLabels: Record<InventoryAdminMovementType, string> = {
  entry: "Entrada",
  exit: "Saida",
  adjustment: "Ajuste",
  reserve: "Reserva",
  release: "Liberacao",
  decrement: "Baixa",
  restock: "Reposicao"
};
