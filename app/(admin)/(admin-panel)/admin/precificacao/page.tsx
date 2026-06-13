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
      label: "Preço sugerido",
      value: formatCurrency(recommendation.suggestedPriceCents / 100),
      helper: "Calculado sobre custo + extras + margem desejada.",
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
      helper: "Margem percentual no preço sugerido.",
      tone: "warning" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Precificação</p>
        <h1 className="page-title">Calcule o preço de venda com custo, extras e a margem que você quer.</h1>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sem SKUs para precificar"
          description="Quando houver produtos no catálogo, esta tela funciona como calculadora e como atalho para atualizar o preço no estoque."
        />
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink-900">Resultado do cálculo <span className="font-normal text-stone-500">(muda conforme você preenche abaixo)</span></p>
            <div className="grid gap-4 md:grid-cols-3">
              {metricCards.map((metric) => (
                <MetricCard key={metric.label} item={metric} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h2 className="font-heading text-xl font-semibold text-ink-900">Passos 1 e 2: informe os custos</h2>
              <p className="mt-1 text-sm text-stone-500">Diga quanto o produto te custa e quanto de lucro você quer. O preço aparece nos números acima.</p>
              <form className="mt-4 grid gap-4">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-ink-900">Produto</span>
                  <span className="text-xs text-stone-500">Escolha o item que você quer precificar.</span>
                  <select name="variantId" defaultValue={selectedVariantId} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                    {rows.map((row: InventoryAdminRow) => (
                      <option key={row.variantId} value={row.variantId}>{row.productName} • {row.variantName}</option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-semibold text-ink-900">Custo (R$)</span>
                    <span className="text-xs text-stone-500">Quanto você paga no fornecedor.</span>
                    <input type="number" min="0" step="0.01" name="costReais" defaultValue={costReais.toFixed(2)} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-semibold text-ink-900">Custos extras (R$)</span>
                    <span className="text-xs text-stone-500">Frete, embalagem... pode deixar 0.</span>
                    <input type="number" min="0" step="0.01" name="extraCostReais" defaultValue={extraCostReais.toFixed(2)} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-semibold text-ink-900">Lucro desejado (%)</span>
                    <span className="text-xs text-stone-500">Ex.: 40 = 40% sobre o custo.</span>
                    <input type="number" min="0" step="0.01" name="markupPercent" defaultValue={desiredMarkupPercent.toFixed(2)} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                  </label>
                </div>
                <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Calcular preço</button>
              </form>
            </section>

            <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
              <h2 className="font-heading text-xl font-semibold text-ink-900">Passo 3: salve o preço no produto</h2>
              <p className="mt-1 text-sm text-stone-500">Gostou do preço sugerido? Salve direto no produto. Se não, ajuste o valor antes.</p>
              {selected ? (
                <form action={applyPricing} className="mt-4 grid gap-3">
                  <input type="hidden" name="variantId" value={selected.variantId} />
                  <input type="hidden" name="supplierId" value={selected.supplierId ?? ""} />
                  <input type="hidden" name="minimumStock" value={selected.minimumStock} />
                  <input type="hidden" name="costReais" value={costReais.toFixed(2)} />
                  <div className="rounded-[16px] bg-sand-50 p-4">
                    <p className="font-semibold text-ink-900">{selected.productName}</p>
                    <p className="text-sm text-stone-500">{selected.variantName} • {selected.sku}</p>
                    <p className="mt-2 text-sm text-stone-500">Preço atual: {formatCurrency(selected.priceCents / 100)}</p>
                  </div>
                  <label className="grid gap-1 text-sm">
                    <span className="font-semibold text-ink-900">Novo preço de venda (R$)</span>
                    <span className="text-xs text-stone-500">Já vem com o preço sugerido. Pode ajustar antes de salvar.</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="suggestedPriceReais"
                      defaultValue={(recommendation.suggestedPriceCents / 100).toFixed(2)}
                      className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <button className="rounded-[12px] bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Salvar preço no produto</button>
                </form>
              ) : null}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
