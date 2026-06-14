import Link from "next/link";
import { revalidatePath } from "next/cache";

import { EmptyState } from "@/components/feedback/empty-state";
import { MetricCard } from "@/components/admin/metric-card";
import { createAdminCalendarEventAction } from "@/domains/admin-calendar/actions";
import { adminCalendarCategoryLabels, UnifiedCalendarItem } from "@/domains/admin-calendar/types";
import { getUnifiedAdminCalendar } from "@/domains/admin-calendar/queries";
import { listAdminServices } from "@/domains/appointments/queries";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function createEvent(formData: FormData) {
  "use server";

  await createAdminCalendarEventAction({
    serviceId: String(formData.get("serviceId") ?? "") || undefined,
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "internal_admin"),
    customerName: String(formData.get("customerName") ?? "") || undefined,
    petName: String(formData.get("petName") ?? "") || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    impactAvailability: formData.get("impactAvailability") === "on",
    isAllDay: formData.get("isAllDay") === "on",
    sourceType: "admin_manual"
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/agenda");
}

export default async function AdminAgendaPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const view = typeof params.view === "string" && ["month", "week", "day"].includes(params.view) ? params.view : "month";
  const date = typeof params.date === "string" ? params.date : new Date().toISOString().slice(0, 10);

  const [{ items }, services] = await Promise.all([
    getUnifiedAdminCalendar(view as "month" | "week" | "day", date),
    listAdminServices()
  ]);

  const groupedByDate = new Map<string, UnifiedCalendarItem[]>();
  for (const item of items) {
    const key = item.startsAt.slice(0, 10);
    groupedByDate.set(key, [...(groupedByDate.get(key) ?? []), item]);
  }

  const keys = [...groupedByDate.keys()].sort();
  const metricCards = [
    {
      label: "Itens na janela",
      value: String(items.length),
      helper: "Agendamentos públicos, eventos manuais e bloqueios.",
      tone: "neutral" as const
    },
    {
      label: "Impactam disponibilidade",
      value: String(items.filter((item: UnifiedCalendarItem) => item.impactAvailability).length),
      helper: "Tudo o que deve travar a agenda publica.",
      tone: "warning" as const
    },
    {
      label: "Compromissos pessoais",
      value: String(items.filter((item: UnifiedCalendarItem) => item.category === "personal").length),
      helper: "Visíveis junto da operação para evitar conflito real.",
      tone: "neutral" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Agenda</p>
        <h1 className="page-title">Toda a rotina em um lugar: banho e tosa, bloqueios e compromissos da loja.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} item={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold text-ink-900">Visualização</h2>
              <p className="text-sm text-stone-500">Veja por mês, semana ou dia, com tudo que ocupa a rotina.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/admin/agenda?view=month&date=${date}`} className={`rounded-full px-3 py-2 text-sm font-medium ${view === "month" ? "bg-brand-500 text-white" : "bg-sand-50 text-ink-900"}`}>Mensal</a>
              <a href={`/admin/agenda?view=week&date=${date}`} className={`rounded-full px-3 py-2 text-sm font-medium ${view === "week" ? "bg-brand-500 text-white" : "bg-sand-50 text-ink-900"}`}>Semanal</a>
              <a href={`/admin/agenda?view=day&date=${date}`} className={`rounded-full px-3 py-2 text-sm font-medium ${view === "day" ? "bg-brand-500 text-white" : "bg-sand-50 text-ink-900"}`}>Diária</a>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState
              title="Nada marcado neste período"
              description="Os agendamentos dos clientes seguem normais. Quando você adicionar bloqueios ou compromissos, eles aparecem aqui e podem fechar horários no site."
            />
          ) : view === "month" ? (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {keys.map((key) => (
                <div key={key} className="rounded-[18px] border border-stone-100 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink-900">{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", weekday: "short", timeZone: "UTC" }).format(new Date(`${key}T12:00:00.000Z`))}</p>
                    <span className="text-xs text-stone-500">{groupedByDate.get(key)?.length ?? 0} itens</span>
                  </div>
                  <div className="space-y-2">
                    {(groupedByDate.get(key) ?? []).slice(0, 4).map((item: UnifiedCalendarItem) => (
                      <div key={item.id} className="rounded-[12px] bg-sand-50 p-3 text-sm">
                        <p className="font-medium text-ink-900">{item.title}</p>
                        <p className="text-xs text-stone-500">{adminCalendarCategoryLabels[item.category]} • {formatDateTime(item.startsAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key} className="rounded-[18px] border border-stone-100 p-4">
                  <p className="mb-3 font-semibold text-ink-900">{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", weekday: "long", timeZone: "UTC" }).format(new Date(`${key}T12:00:00.000Z`))}</p>
                  <div className="space-y-2">
                    {(groupedByDate.get(key) ?? []).map((item: UnifiedCalendarItem) => (
                      <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] bg-sand-50 p-3 text-sm">
                        <div>
                          <p className="font-medium text-ink-900">{item.title}</p>
                          <p className="text-xs text-stone-500">{adminCalendarCategoryLabels[item.category]} • {item.sourceType}</p>
                          {(item.customerName || item.petName) ? (
                            <p className="text-xs text-stone-500">{item.customerName ?? "-"} • {item.petName ?? "-"}</p>
                          ) : null}
                        </div>
                        <div className="text-right text-xs text-stone-500">
                          <p>{formatDateTime(item.startsAt)}</p>
                          <p>{formatDateTime(item.endsAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface-default border border-stone-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-xl font-semibold text-ink-900">Novo evento</h2>
          <p className="mt-1 text-sm text-stone-500">Se marcar que fecha horário, o site deixa de oferecer esse período.</p>
          <form action={createEvent} className="mt-4 grid gap-3">
            <input name="title" placeholder="Título do evento" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="category" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                {Object.entries(adminCalendarCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select name="serviceId" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm">
                <option value="">Todos os serviços</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="datetime-local" name="startsAt" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
              <input type="datetime-local" name="endsAt" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="customerName" placeholder="Cliente (opcional)" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
              <input name="petName" placeholder="Pet (opcional)" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
            </div>
            <textarea name="notes" rows={3} placeholder="Observações" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
            <label className="inline-flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" name="impactAvailability" />
              Fechar este horário no site
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" name="isAllDay" />
              Evento de dia inteiro
            </label>
            <button className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Criar evento</button>
          </form>
        </section>
      </div>
    </div>
  );
}
