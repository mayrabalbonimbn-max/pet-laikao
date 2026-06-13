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
      helper: "Itens abaixo do mínimo ou zerados.",
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
        <p className="eyebrow">Estoque</p>
        <h1 className="page-title">Controle do estoque com custo, fornecedor, mínimo e histórico de movimentação.</h1>
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
            <p className="text-sm text-stone-500">Custo, margem atual, estoque mínimo e fornecedor de cada item.</p>
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title="Nenhum item no estoque ainda"
              description="Cadastre produtos primeiro e o controle de estoque aparece aqui com custo, mínimo, fornecedor e histórico."
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
                      <p className="text-stone-500">Disponível</p>
                      <p className="font-semibold text-ink-900">{row.availableQuantity}</p>
                    </div>
                    <div className="rounded-[12px] bg-sand-50 p-3">
                      <p className="text-stone-500">Mínimo</p>
                      <p className="font-semibold text-ink-900">{row.minimumStock}</p>
                    </div>
                    <div className="rounded-[12px] bg-sand-50 p-3">
                      <p className="text-stone-500">Valor em estoque</p>
                      <p className="font-semibold text-ink-900">{formatCurrency(row.totalStockValueCents / 100)}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <form action={updateVariant} className="grid gap-3 rounded-[14px] border border-stone-100 bg-sand-50/40 p-4">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">1. Dados do item</p>
                        <p className="text-xs text-stone-500">Quanto custa, por quanto vende, o alerta de estoque baixo e o fornecedor. Use quando esses valores mudarem.</p>
                      </div>
                      <input type="hidden" name="variantId" value={row.variantId} />
                      <label className="grid gap-1 text-xs font-semibold text-stone-600">
                        Fornecedor
                        <select name="supplierId" defaultValue={row.supplierId ?? ""} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal">
                          <option value="">Sem fornecedor</option>
                          {suppliers.map((supplier: SupplierRecord) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                          ))}
                        </select>
                      </label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="grid gap-1 text-xs font-semibold text-stone-600">
                          Custo (R$)
                          <input type="number" min="0" step="0.01" name="costReais" defaultValue={(row.costCents / 100).toFixed(2)} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal" />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-stone-600">
                          Preço de venda (R$)
                          <input type="number" min="0" step="0.01" name="priceReais" defaultValue={(row.priceCents / 100).toFixed(2)} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal" />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-stone-600">
                          Alerta de mínimo
                          <input type="number" min="0" name="minimumStock" defaultValue={row.minimumStock} className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal" />
                        </label>
                      </div>
                      <button className="rounded-[12px] bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Salvar dados do item</button>
                    </form>

                    <form action={createMovement} className="grid gap-3 rounded-[14px] border border-stone-100 bg-sand-50/40 p-4">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">2. Entrada ou saída de estoque</p>
                        <p className="text-xs text-stone-500">
                          <b>Entrada</b>: chegou mercadoria. <b>Saída</b>: saiu sem ser venda (perda, uso, brinde). <b>Ajuste</b>: corrigir para a quantidade que você contou.
                        </p>
                      </div>
                      <input type="hidden" name="variantId" value={row.variantId} />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="grid gap-1 text-xs font-semibold text-stone-600">
                          O que aconteceu?
                          <select name="movementType" className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal">
                            <option value="entry">Entrada (chegou)</option>
                            <option value="exit">Saída (perda/uso)</option>
                            <option value="adjustment">Ajuste (contagem real)</option>
                          </select>
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-stone-600">
                          Quantidade
                          <input type="number" min="0" name="quantity" placeholder="Ex.: 10" className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal" required />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-stone-600">
                          Custo por unidade (R$)
                          <input type="number" min="0" step="0.01" name="unitCostReais" placeholder="Opcional" className="mt-1 rounded-[12px] border border-stone-200 px-3 py-2 text-sm font-normal" />
                        </label>
                      </div>
                      <input name="reason" placeholder="Motivo (ex.: compra do fornecedor, perda por validade)" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
                      <textarea name="notes" rows={2} placeholder="Observações (opcional)" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                      <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Registrar movimentação</button>
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
            <p className="mt-1 text-sm text-stone-500">Cadastre seus fornecedores para organizar as compras.</p>
            <form action={createSupplier} className="mt-4 grid gap-3">
              <input name="name" placeholder="Nome do fornecedor" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              <input name="contactName" placeholder="Contato" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <input name="phone" placeholder="Telefone" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <input name="email" placeholder="E-mail" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <textarea name="notes" rows={2} placeholder="Observações" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Cadastrar fornecedor</button>
            </form>
          </section>

          <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl font-semibold text-ink-900">Histórico</h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="rounded-[12px] border border-dashed border-stone-200 p-4 text-sm text-stone-500">Nenhuma movimentação registrada ainda.</p>
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
                      Estoque após o movimento: {item.resultingStockQuantity ?? "-"} • {new Date(item.createdAt).toLocaleString("pt-BR", { timeZone: "UTC" })}
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
