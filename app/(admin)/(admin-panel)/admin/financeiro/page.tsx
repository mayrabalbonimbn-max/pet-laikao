import { revalidatePath } from "next/cache";

import { EmptyState } from "@/components/feedback/empty-state";
import { MetricCard } from "@/components/admin/metric-card";
import { getCompanyFinancialSummary, listCompanyFinancialCategories, listCompanyFinancialEntries } from "@/domains/company-finance/queries";
import {
  createFinancialCategoryAction,
  createFinancialEntryAction
} from "@/domains/company-finance/actions";
import {
  FinancialCategoryRecord,
  FinancialEntryFilters,
  FinancialEntryRecord,
  financialDirectionLabels,
  financialEntryTypeLabels,
  financialPaymentMethodLabels,
  financialStatusLabels
} from "@/domains/company-finance/types";
import { getFinanceSummary } from "@/domains/payments/queries";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

async function createCategory(formData: FormData) {
  "use server";

  await createFinancialCategoryAction({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    direction: String(formData.get("direction") ?? "outflow"),
    description: String(formData.get("description") ?? "") || undefined,
    active: true
  });

  revalidatePath("/admin/financeiro");
}

async function createEntry(formData: FormData) {
  "use server";

  await createFinancialEntryAction({
    categoryId: String(formData.get("categoryId") ?? ""),
    direction: String(formData.get("direction") ?? "outflow"),
    entryType: String(formData.get("entryType") ?? "other"),
    description: String(formData.get("description") ?? ""),
    notes: String(formData.get("notes") ?? "") || undefined,
    occurredOn: String(formData.get("occurredOn") ?? ""),
    amountCents: Math.round(Number(formData.get("amountReais") ?? 0) * 100),
    paymentMethod: String(formData.get("paymentMethod") ?? "pix"),
    status: String(formData.get("status") ?? "paid"),
    isRecurringFixed: formData.get("isRecurringFixed") === "on",
    referenceType: String(formData.get("referenceType") ?? "") || undefined,
    referenceId: String(formData.get("referenceId") ?? "") || undefined
  });

  revalidatePath("/admin/financeiro");
}

export default async function AdminFinancePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const filters: FinancialEntryFilters = {
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
    categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
    direction:
      typeof params.direction === "string" && ["inflow", "outflow", "all"].includes(params.direction)
        ? (params.direction as FinancialEntryFilters["direction"])
        : undefined,
    entryType:
      typeof params.entryType === "string" &&
      ["income", "fixed_expense", "variable_expense", "inventory_purchase", "service_receipt", "withdrawal", "other", "all"].includes(params.entryType)
        ? (params.entryType as FinancialEntryFilters["entryType"])
        : undefined,
    status:
      typeof params.status === "string" && ["pending", "paid", "cancelled", "all"].includes(params.status)
        ? (params.status as FinancialEntryFilters["status"])
        : undefined
  };

  const [entries, categories, summary, gatewaySummary] = await Promise.all([
    listCompanyFinancialEntries(filters),
    listCompanyFinancialCategories(),
    getCompanyFinancialSummary(filters),
    getFinanceSummary()
  ]);

  const metricCards = [
    {
      label: "Entradas gerenciais",
      value: formatCurrency(summary.inflowCents / 100),
      helper: "Lancamentos pagos cadastrados no caixa gerencial.",
      tone: "success" as const
    },
    {
      label: "Saidas gerenciais",
      value: formatCurrency(summary.outflowCents / 100),
      helper: "Despesas, compras e retiradas registradas.",
      tone: "danger" as const
    },
    {
      label: "Saldo gerencial",
      value: formatCurrency(summary.balanceCents / 100),
      helper: "Leitura operacional, nao substitui contabilidade formal.",
      tone: summary.balanceCents >= 0 ? ("success" as const) : ("warning" as const)
    },
    {
      label: "Pendencias de lancamento",
      value: formatCurrency(summary.pendingCents / 100),
      helper: "Valores aguardando compensacao ou baixa manual.",
      tone: "warning" as const
    },
    {
      label: "Recebido via site",
      value: formatCurrency(gatewaySummary.paidTotalCents / 100),
      helper: "Pagamentos confirmados em agendamentos e pedidos.",
      tone: "neutral" as const
    },
    {
      label: "Falhas do gateway",
      value: String(gatewaySummary.failedCount),
      helper: "Pagamentos que falharam e precisam de atenção.",
      tone: gatewaySummary.failedCount > 0 ? ("danger" as const) : ("neutral" as const)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Financeiro</p>
        <h1 className="page-title">Caixa, despesas, compras e recebimentos organizados para você e para o contador.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} item={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[180px]">
              <p className="text-sm font-semibold text-ink-900">Filtros</p>
              <p className="text-xs text-stone-500">Período, categoria e tipo de movimentação.</p>
            </div>
            <form className="grid flex-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <input type="date" name="from" defaultValue={filters.from} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <input type="date" name="to" defaultValue={filters.to} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <select name="categoryId" defaultValue={filters.categoryId ?? ""} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                <option value="">Todas categorias</option>
                {categories.map((category: FinancialCategoryRecord) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <select name="direction" defaultValue={filters.direction ?? ""} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                <option value="">Todas as direções</option>
                {Object.entries(financialDirectionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select name="entryType" defaultValue={filters.entryType ?? ""} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                <option value="">Todos tipos</option>
                {Object.entries(financialEntryTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Filtrar</button>
            </form>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title="Nenhuma movimentação no caixa ainda"
              description="Os recebimentos do site seguem normais. Registre entradas, saídas e compras para acompanhar o caixa da loja por aqui."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-stone-500">
                  <tr>
                    <th className="pb-3 pr-4">Data</th>
                    <th className="pb-3 pr-4">Descrição</th>
                    <th className="pb-3 pr-4">Categoria</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Forma</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry: FinancialEntryRecord) => (
                    <tr key={entry.id} className="border-t border-stone-100">
                      <td className="py-3 pr-4">{formatDate(entry.occurredOn)}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-ink-900">{entry.description}</p>
                        {entry.notes ? <p className="text-xs text-stone-500">{entry.notes}</p> : null}
                      </td>
                      <td className="py-3 pr-4">{entry.categoryName}</td>
                      <td className="py-3 pr-4">{financialEntryTypeLabels[entry.entryType]}</td>
                      <td className="py-3 pr-4">{financialPaymentMethodLabels[entry.paymentMethod]}</td>
                      <td className="py-3 pr-4">{financialStatusLabels[entry.status]}</td>
                      <td className={`py-3 text-right font-semibold ${entry.direction === "inflow" ? "text-emerald-700" : "text-rose-700"}`}>
                        {entry.direction === "inflow" ? "+" : "-"}
                        {formatCurrency(entry.amountCents / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl font-semibold text-ink-900">Nova categoria</h2>
            <p className="mt-1 text-sm text-stone-500">Estruture o plano gerencial de contas sem inventar numeros.</p>
            <form action={createCategory} className="mt-4 grid gap-3">
              <input name="name" placeholder="Ex.: Despesa fixa" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              <input name="slug" placeholder="despesa-fixa" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              <select name="direction" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                <option value="outflow">Saida</option>
                <option value="inflow">Entrada</option>
              </select>
              <textarea name="description" rows={2} placeholder="Uso desta categoria" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <button className="rounded-[12px] bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Criar categoria</button>
            </form>
          </section>

          <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl font-semibold text-ink-900">Novo lançamento</h2>
            <p className="mt-1 text-sm text-stone-500">Entradas, saídas, compras e retiradas em um lugar só.</p>
            <form action={createEntry} className="mt-4 grid gap-3">
              <select name="categoryId" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required>
                <option value="">Selecione a categoria</option>
                {categories.map((category: FinancialCategoryRecord) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="direction" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                  {Object.entries(financialDirectionLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select name="entryType" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                  {Object.entries(financialEntryTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <input name="description" placeholder="Descrição do lançamento" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              <textarea name="notes" rows={2} placeholder="Observações" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="date" name="occurredOn" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
                <input type="number" min="0" step="0.01" name="amountReais" placeholder="Valor em reais" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="paymentMethod" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                  {Object.entries(financialPaymentMethodLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select name="status" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                  {Object.entries(financialStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" name="isRecurringFixed" />
                Marcar como despesa fixa recorrente
              </label>
              <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Registrar lancamento</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
