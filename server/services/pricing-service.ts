import { PricingRecommendation } from "@/domains/pricing/types";

export function calculateSuggestedPrice(input: {
  costCents: number;
  desiredMarkupPercent: number;
  extraCostCents?: number;
}): PricingRecommendation {
  const costCents = Math.max(0, Math.round(input.costCents));
  const extraCostCents = Math.max(0, Math.round(input.extraCostCents ?? 0));
  const desiredMarkupPercent = Math.max(0, input.desiredMarkupPercent);
  const baseCostCents = costCents + extraCostCents;
  const suggestedPriceCents = Math.round(baseCostCents * (1 + desiredMarkupPercent / 100));
  const grossProfitCents = Math.max(0, suggestedPriceCents - baseCostCents);
  const marginPercent = suggestedPriceCents === 0 ? 0 : Number(((grossProfitCents / suggestedPriceCents) * 100).toFixed(2));

  return {
    costCents,
    extraCostCents,
    desiredMarkupPercent,
    suggestedPriceCents,
    grossProfitCents,
    marginPercent
  };
}
