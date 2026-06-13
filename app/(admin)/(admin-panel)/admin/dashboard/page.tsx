import { DetailDrawer } from "@/components/admin/detail-drawer";
import { MetricCard } from "@/components/admin/metric-card";
import { InlineNotice } from "@/components/feedback/inline-notice";
import { listAdminAppointments } from "@/domains/appointments/queries";
import { listCommerceAdminOrders } from "@/domains/orders/queries";
import { getFinanceSummary } from "@/domains/payments/queries";
import { listAdminPromotions } from "@/domains/promotions/queries";
import { OperationalStatusPill } from "@/components/status/operational-status-pill";
import { BalanceDueIndicator } from "@/components/status/balance-due-indicator";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

function getDateKeyInTimeZone(value: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const [appointments, orders, promotions, financeSummary] = await Promise.all([
    listAdminAppointments(),
    listCommerceAdminOrders(),
    listAdminPromotions(),
    getFinanceSummary()
  ]);

  const todayKey = getDateKeyInTimeZone(new Date(), "America/Sao_Paulo");
  const todayAppointments = appointments.filter(
    (appointment) => getDateKeyInTimeZone(appointment.scheduledStartAt, "America/Sao_Paulo") === todayKey
  );
  const upcomingAppointments = appointments.filter((appointment) => new Date(appointment.scheduledStartAt).getTime() >= Date.now()).slice(0, 3);
  const recentOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").slice(0, 3);
  const activePromotions = promotions.filter((promotion) => promotion.active).length;
  const pendingAppointments = todayAppointments.filter((appointment) => appointment.status === "hold_pending_payment").length;
  const pendingOrders = recentOrders.filter((order) => order.paymentStatus === "pending").length;
  const criticalFailures = financeSummary.failedCount;

  const metrics = [
    {
      label: "Agendamentos de hoje",
      value: String(todayAppointments.length),
      helper:
        todayAppointments.length > 0
          ? `${pendingAppointments} com pendência de pagamento`
          : "Nenhum agendamento hoje",
      tone: pendingAppointments > 0 ? ("warning" as const) : ("neutral" as const)
    },
    {
      label: "Pedidos novos",
      value: String(recentOrders.length),
      helper: recentOrders.length > 0 ? `${pendingOrders} aguardando pagamento` : "Nenhum pedido novo",
      tone: "neutral" as const
    },
    {
      label: "Recebimentos confirmados",
      value: formatCurrency(financeSummary.paidTotalCents / 100),
      helper:
        financeSummary.paidTotalCents > 0
          ? "Total confirmado nos pagamentos recebidos"
          : "Sem recebimentos confirmados ainda",
      tone: financeSummary.paidTotalCents > 0 ? ("success" as const) : ("neutral" as const)
    },
    {
      label: "Falhas críticas",
      value: String(criticalFailures),
      helper: criticalFailures > 0 ? "Falhas de pagamento que precisam de atenção" : "Nenhuma falha crítica no período",
      tone: criticalFailures > 0 ? ("danger" as const) : ("success" as const)
    },
    {
      label: "Promoções ativas",
      value: String(activePromotions),
      helper: activePromotions > 0 ? "Campanhas no ar para os clientes" : "Nenhuma promoção ativa",
      tone: activePromotions > 0 ? ("success" as const) : ("neutral" as const)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Dashboard</p>
        <h1 className="page-title">O dia da Laikão em um lugar só: agenda, pedidos, recebimentos e o que precisa de atenção.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} item={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="surface-default p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold">Próximos atendimentos</h2>
              <p className="text-sm text-stone-500">O que precisa de atenção nas próximas horas.</p>
            </div>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="rounded-[var(--radius-md)] border border-dashed border-stone-200 p-4 text-sm text-stone-500">
                Sem agendamentos ainda.
              </p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{appointment.customerName}</p>
                      <p className="text-sm text-stone-500">
                        {appointment.petName} • {appointment.serviceName}
                      </p>
                    </div>
                    <OperationalStatusPill status={appointment.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {appointment.amountBalanceCents > 0 ? (
                      <BalanceDueIndicator value={formatCurrency(appointment.amountBalanceCents / 100)} compact />
                    ) : (
                      <span className="text-sm text-stone-500">Pagamento em dia</span>
                    )}
                    <DetailDrawer title={appointment.id} subtitle="Histórico, pagamento e status do atendimento." />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-default p-6">
            <h2 className="font-heading text-xl font-semibold">Pedidos novos</h2>
            <div className="mt-4 space-y-3">
              {recentOrders.length === 0 ? (
                <p className="rounded-[var(--radius-md)] border border-dashed border-stone-200 p-4 text-sm text-stone-500">
                  Nenhum pedido novo.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="rounded-[var(--radius-md)] border border-stone-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{order.orderNumber}</p>
                        <p className="text-sm text-stone-500">{order.customerName}</p>
                      </div>
                      <OperationalStatusPill status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <InlineNotice
            tone="warning"
            title="Fique de olho nas pendências"
            description="Saldo a receber, pagamento que falhou, estoque parado e aviso com erro aparecem aqui para você resolver primeiro."
          />
        </div>
      </div>
    </div>
  );
}

