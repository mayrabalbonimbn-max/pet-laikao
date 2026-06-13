import { listInventoryAdminMovements, listInventoryAdminRows, listSuppliers } from "@/server/repositories/inventory-admin-repository";
import { InventoryAdminRow } from "@/domains/inventory-admin/types";

export async function getInventoryAdminSnapshot() {
  const rows = await listInventoryAdminRows();

  return {
    rows,
    totals: {
      skuCount: rows.length,
      lowStockCount: rows.filter((row: InventoryAdminRow) => row.stockStatus === "low" || row.stockStatus === "out").length,
      inventoryValueCents: rows.reduce((total: number, row: InventoryAdminRow) => total + row.totalStockValueCents, 0),
      reservedUnits: rows.reduce((total: number, row: InventoryAdminRow) => total + row.reservedQuantity, 0)
    }
  };
}

export async function listInventorySuppliers() {
  return listSuppliers();
}

export async function listInventoryHistory() {
  return listInventoryAdminMovements();
}
