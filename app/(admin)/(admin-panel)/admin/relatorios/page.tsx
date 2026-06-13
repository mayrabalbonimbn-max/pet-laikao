import Link from "next/link";

import { MetricCard } from "@/components/admin/metric-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { getAnnualManagerialReport } from "@/domains/company-finance/queries";
import { financialDirectionLabels } from "@/domains/company-finance/types";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const year = Number(typeof params.year === "string" ? params.year : new Date().getUTCFullYear());
  const report = await getAnnualManagerialReport(year);

  const metricCards = [
    {
      label: "Entradas no ano",
      value: formatCurrency(report.totals.inflowCents / 100),
      helper: "Lançamentos e recebimentos do período.",
      tone: "success" as const
    },
    {
      label: "Saídas no ano",
      value: formatCurrency(report.totals.outflowCents / 100),
      helper: "Despesas, compras e retiradas registradas.",
      tone: "danger" as const
    },
    {
      label: "Saldo anual",
      value: formatCurrency(report.totals.balanceCents / 100),
      helper: "Apoio para a organização e a conversa com a contabilidade.",
      tone: report.totals.balanceCents >= 0 ? ("success" as const) : ("warning" as const)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Relatórios</p>
        <h1 className="page-title">Resumo anual do que entrou e saiu, pronto para exportar e levar ao contador.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} item={metric} />
        ))}
      </div>

      <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-900">Ano</label>
              <input type="number" name="year" defaultValue={year} className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
            </div>
            <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Atualizar relatório</button>
          </form>
          <a href={`/api/admin/reports/annual?year=${year}`} className="rounded-[12px] bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
            Exportar CSV anual
          </a>
        </div>
        <p className="mt-3 text-sm text-stone-500">
          Serve como organização gerencial para exportar e levar ao contador ou contadora. Não substitui obrigações fiscais oficiais.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-xl font-semibold text-ink-900">Resumo por categoria</h2>
          <div className="mt-4 space-y-3">
            {report.categoryTotals.length === 0 ? (
              <EmptyState
                title="Sem dados para este ano"
                description="Quando houver movimentações e recebimentos registrados, o resumo anual aparece aqui pronto para exportação."
              />
            ) : (
              report.categoryTotals.map((item) => (
                <div key={`${item.direction}-${item.category}`} className="flex items-center justify-between gap-3 rounded-[12px] border border-stone-100 p-3 text-sm">
                  <div>
                    <p className="font-medium text-ink-900">{item.category}</p>
                    <p className="text-xs text-stone-500">{financialDirectionLabels[item.direction]}</p>
                  </div>
                  <p className={`font-semibold ${item.direction === "inflow" ? "text-emerald-700" : "text-rose-700"}`}>
                    {formatCurrency(item.totalCents / 100)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-xl font-semibold text-ink-900">Linhas exportadas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-stone-500">
                <tr>
                  <th className="pb-3 pr-4">Data</th>
                  <th className="pb-3 pr-4">Origem</th>
                  <th className="pb-3 pr-4">Categoria</th>
                  <th className="pb-3 pr-4">Descrição</th>
                  <th className="pb-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.slice(0, 40).map((row, index) => (
                  <tr key={`${row.source}-${row.date}-${index}`} className="border-t border-stone-100">
                    <td className="py-3 pr-4">{new Date(row.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                    <td className="py-3 pr-4">{row.source}</td>
                    <td className="py-3 pr-4">{row.category}</td>
                    <td className="py-3 pr-4">{row.description}</td>
                    <td className={`py-3 text-right font-semibold ${row.direction === "inflow" ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatCurrency(row.amountCents / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
