import { revalidatePath } from "next/cache";

import { EmptyState } from "@/components/feedback/empty-state";
import { MetricCard } from "@/components/admin/metric-card";
import { getInventoryAdminSnapshot } from "@/domains/inventory-admin/queries";
import { updateVariantBusinessDataAction } from "@/domains/inventory-admin/actions";
import { InventoryAdminRow } from "@/domains/inventory-admin/types";
import { getPricingRecommendation } from "@/domains/pricing/queries";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

async function applyPricing(formData: FormData) {
  "use server";

  await updateVariantBusinessDataAction({
    variantId: String(formData.get("variantId") ?? ""),
    supplierId: String(formData.get("supplierId") ?? "") || undefined,
    costCents: Math.round(Number(formData.get("costReais") ?? 0) * 100),
    minimumStock: Number(formData.get("minimumStock") ?? 0),
    priceCents: Math.round(Number(formData.get("suggestedPriceReais") ?? 0) * 100)
  });

  revalidatePath("/admin/precificacao");
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
}

export default async function AdminPricingPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const { rows } = await getInventoryAdminSnapshot();
  const selectedVariantId = typeof params.variantId === "string" ? params.variantId : rows[0]?.variantId;
  const selected = rows.find((row: InventoryAdminRow) => row.variantId === selectedVariantId);
  const costReais = Number(typeof params.costReais === "string" ? params.costReais : selected ? (selected.costCents / 100).toFixed(2) : 0);
  const desiredMarkupPercent = Number(typeof params.markupPercent === "string" ? params.markupPercent : 40);
  const extraCostReais = Number(typeof params.extraCostReais === "string" ? params.extraCostReais : 0);
  const recommendation = await getPricingRecommendation({
    costCents: Math.round(costReais * 100),
    desiredMarkupPercent,
    extraCostCents: Math.round(extraCostReais * 100)
  });

  const metricCards = [
    {
      label: "Preco sugerido",
      value: formatCurrency(recommendation.suggestedPriceCents / 100),
      helper: "Calculado sobre custo + extras + markup desejado.",
      tone: "success" as const
    },
    {
      label: "Lucro bruto",
      value: formatCurrency(recommendation.grossProfitCents / 100),
      helper: "Antes de despesas fixas e impostos.",
      tone: "neutral" as const
    },
    {
      label: "Margem final",
      value: `${recommendation.marginPercent.toFixed(2)}%`,
      helper: "Margem percentual no preco sugerido.",
      tone: "warning" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Precificacao</p>
        <h1 className="page-title">Calculadora pratica para precificar mercadoria com mais seguranca operacional.</h1>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sem SKUs para precificar"
          description="Quando houver variantes no catalogo, esta tela passa a servir tanto como calculadora isolada quanto como atalho para atualizar o estoque."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} item={metric} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h2 className="font-heading text-xl font-semibold text-ink-900">Calculadora</h2>
              <p className="mt-1 text-sm text-stone-500">Use so para simular ou conecte o resultado ao SKU selecionado.</p>
              <form className="mt-4 grid gap-3">
                <select name="variantId" defaultValue={selectedVariantId} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                  {rows.map((row: InventoryAdminRow) => (
                    <option key={row.variantId} value={row.variantId}>{row.productName} • {row.variantName}</option>
                  ))}
                </select>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="number" min="0" step="0.01" name="costReais" defaultValue={costReais.toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                  <input type="number" min="0" step="0.01" name="extraCostReais" defaultValue={extraCostReais.toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                  <input type="number" min="0" step="0.01" name="markupPercent" defaultValue={desiredMarkupPercent.toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                </div>
                <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Recalcular</button>
              </form>
            </section>

            <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h2 className="font-heading text-xl font-semibold text-ink-900">Aplicar ao produto</h2>
              {selected ? (
                <form action={applyPricing} className="mt-4 grid gap-3">
                  <input type="hidden" name="variantId" value={selected.variantId} />
                  <input type="hidden" name="supplierId" value={selected.supplierId ?? ""} />
                  <input type="hidden" name="minimumStock" value={selected.minimumStock} />
                  <input type="hidden" name="costReais" value={costReais.toFixed(2)} />
                  <div className="rounded-[16px] bg-sand-50 p-4">
                    <p className="font-semibold text-ink-900">{selected.productName}</p>
                    <p className="text-sm text-stone-500">{selected.variantName} • {selected.sku}</p>
                    <p className="mt-2 text-sm text-stone-500">Preco atual: {formatCurrency(selected.priceCents / 100)}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="suggestedPriceReais"
                    defaultValue={(recommendation.suggestedPriceCents / 100).toFixed(2)}
                    className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm"
                  />
                  <button className="rounded-[12px] bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Aplicar preco sugerido</button>
                </form>
              ) : null}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
