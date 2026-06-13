import { calculateSuggestedPrice } from "@/server/services/pricing-service";
import { listInventoryAdminRows } from "@/server/repositories/inventory-admin-repository";

export async function getPricingContext() {
  return listInventoryAdminRows();
}

export async function getPricingRecommendation(input: {
  costCents: number;
  desiredMarkupPercent: number;
  extraCostCents?: number;
}) {
  return calculateSuggestedPrice(input);
}
