import { revalidatePath } from "next/cache";

import { EmptyState } from "@/components/feedback/empty-state";
import { MetricCard } from "@/components/admin/metric-card";
import { createSupplierAction, createInventoryMovementAction, updateVariantBusinessDataAction } from "@/domains/inventory-admin/actions";
import { getInventoryAdminSnapshot, listInventoryHistory, listInventorySuppliers } from "@/domains/inventory-admin/queries";
import { InventoryAdminMovementRecord, InventoryAdminRow, SupplierRecord, inventoryMovementTypeLabels } from "@/domains/inventory-admin/types";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

async function createSupplier(formData: FormData) {
  "use server";

  await createSupplierAction({
    name: String(formData.get("name") ?? ""),
    contactName: String(formData.get("contactName") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
    active: true
  });

  revalidatePath("/admin/estoque");
}

async function updateVariant(formData: FormData) {
  "use server";

  await updateVariantBusinessDataAction({
    variantId: String(formData.get("variantId") ?? ""),
    supplierId: String(formData.get("supplierId") ?? "") || undefined,
    costCents: Math.round(Number(formData.get("costReais") ?? 0) * 100),
    minimumStock: Number(formData.get("minimumStock") ?? 0),
    priceCents: Math.round(Number(formData.get("priceReais") ?? 0) * 100)
  });

  revalidatePath("/admin/estoque");
  revalidatePath("/admin/precificacao");
  revalidatePath("/admin/produtos");
}

async function createMovement(formData: FormData) {
  "use server";

  await createInventoryMovementAction({
    variantId: String(formData.get("variantId") ?? ""),
    movementType: String(formData.get("movementType") ?? "entry"),
    quantity: Number(formData.get("quantity") ?? 0),
    reason: String(formData.get("reason") ?? ""),
    notes: String(formData.get("notes") ?? "") || undefined,
    unitCostCents: formData.get("unitCostReais") ? Math.round(Number(formData.get("unitCostReais")) * 100) : undefined
  });

  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
}

export default async function AdminInventoryPage() {
  const [{ rows, totals }, suppliers, history] = await Promise.all([
    getInventoryAdminSnapshot(),
    listInventorySuppliers(),
    listInventoryHistory()
  ]);

  const metricCards = [
    {
      label: "SKUs operacionais",
      value: String(totals.skuCount),
      helper: "Variantes reais cadastradas com estoque.",
      tone: "neutral" as const
    },
    {
      label: "Alertas de estoque",
      value: String(totals.lowStockCount),
      helper: "Itens abaixo do minimo ou zerados.",
      tone: totals.lowStockCount > 0 ? ("warning" as const) : ("success" as const)
    },
    {
      label: "Valor do estoque",
      value: formatCurrency(totals.inventoryValueCents / 100),
      helper: "Leitura baseada no custo atual de cada variante.",
      tone: "success" as const
    },
    {
      label: "Unidades reservadas",
      value: String(totals.reservedUnits),
      helper: "Produtos separados por pedidos em aberto.",
      tone: "neutral" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Estoque com custo</p>
        <h1 className="page-title">Controle real de mercadoria com custo, fornecedor, minimo e historico de movimentacao.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} item={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-semibold text-ink-900">Base de estoque</h2>
            <p className="text-sm text-stone-500">Custo, margem atual, estoque minimo e fornecedor por variante.</p>
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title="Nenhuma variante encontrada"
              description="Cadastre produtos e variantes primeiro para transformar o admin em controle de estoque real."
            />
          ) : (
            <div className="space-y-4">
              {rows.map((row: InventoryAdminRow) => (
                <article key={row.variantId} className="rounded-[18px] border border-stone-100 p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900">{row.productName}</p>
                      <p className="text-sm text-stone-500">{row.variantName} • {row.sku} • {row.categoryName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-900">{formatCurrency(row.priceCents / 100)}</p>
                      <p className="text-xs text-stone-500">Margem atual {row.marginPercent.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="mb-4 grid gap-3 text-sm md:grid-cols-4">
                    <div className="rounded-[12px] bg-sand-50 p-3">
                      <p className="text-stone-500">Estoque</p>
                      <p className="font-semibold text-ink-900">{row.stockQuantity}</p>
                    </div>
                    <div className="rounded-[12px] bg-sand-50 p-3">
                      <p className="text-stone-500">Disponivel</p>
                      <p className="font-semibold text-ink-900">{row.availableQuantity}</p>
                    </div>
                    <div className="rounded-[12px] bg-sand-50 p-3">
                      <p className="text-stone-500">Minimo</p>
                      <p className="font-semibold text-ink-900">{row.minimumStock}</p>
                    </div>
                    <div className="rounded-[12px] bg-sand-50 p-3">
                      <p className="text-stone-500">Valor em estoque</p>
                      <p className="font-semibold text-ink-900">{formatCurrency(row.totalStockValueCents / 100)}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <form action={updateVariant} className="grid gap-3">
                      <input type="hidden" name="variantId" value={row.variantId} />
                      <select name="supplierId" defaultValue={row.supplierId ?? ""} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                        <option value="">Sem fornecedor</option>
                        {suppliers.map((supplier: SupplierRecord) => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input type="number" min="0" step="0.01" name="costReais" defaultValue={(row.costCents / 100).toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                        <input type="number" min="0" step="0.01" name="priceReais" defaultValue={(row.priceCents / 100).toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                        <input type="number" min="0" name="minimumStock" defaultValue={row.minimumStock} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                      </div>
                      <button className="rounded-[12px] bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Salvar dados do SKU</button>
                    </form>

                    <form action={createMovement} className="grid gap-3">
                      <input type="hidden" name="variantId" value={row.variantId} />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <select name="movementType" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                          <option value="entry">Entrada</option>
                          <option value="exit">Saida</option>
                          <option value="adjustment">Ajuste para valor final</option>
                        </select>
                        <input type="number" min="0" name="quantity" placeholder="Quantidade" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
                        <input type="number" min="0" step="0.01" name="unitCostReais" placeholder="Custo unitario" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                      </div>
                      <input name="reason" placeholder="Motivo da movimentacao" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
                      <textarea name="notes" rows={2} placeholder="Observacoes" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                      <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Registrar movimentacao</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl font-semibold text-ink-900">Fornecedor</h2>
            <p className="mt-1 text-sm text-stone-500">Base simples, clara e pronta para crescer.</p>
            <form action={createSupplier} className="mt-4 grid gap-3">
              <input name="name" placeholder="Nome do fornecedor" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              <input name="contactName" placeholder="Contato" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <input name="phone" placeholder="Telefone" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <input name="email" placeholder="E-mail" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <textarea name="notes" rows={2} placeholder="Observacoes" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Cadastrar fornecedor</button>
            </form>
          </section>

          <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl font-semibold text-ink-900">Historico</h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="rounded-[12px] border border-dashed border-stone-200 p-4 text-sm text-stone-500">Nenhuma movimentacao registrada ainda.</p>
              ) : (
                history.slice(0, 12).map((item: InventoryAdminMovementRecord) => (
                  <div key={item.id} className="rounded-[12px] border border-stone-100 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-900">{item.productName} • {item.variantName}</p>
                        <p className="text-xs text-stone-500">{inventoryMovementTypeLabels[item.movementType]} • {item.reason}</p>
                      </div>
                      <p className="font-semibold text-ink-900">{item.quantity}</p>
                    </div>
                    <p className="mt-2 text-xs text-stone-500">
                      Estoque apos movimento: {item.resultingStockQuantity ?? "-"} • {new Date(item.createdAt).toLocaleString("pt-BR", { timeZone: "UTC" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
