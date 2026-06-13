import { AppointmentDetailDrawer } from "@/components/admin/appointment-detail-drawer";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { BalanceDueIndicator } from "@/components/status/balance-due-indicator";
import { OperationalStatusPill } from "@/components/status/operational-status-pill";
import { PaymentStatusPill } from "@/components/status/payment-status-pill";
import { getAppointmentAdminDetail, listAdminAppointments } from "@/domains/appointments/queries";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const appointments = await listAdminAppointments();
  const headers = ["Código", "Cliente", "Serviço", "Status operacional", "Status financeiro", "Ação"];
  const detailEntries = await Promise.all(appointments.map((appointment) => getAppointmentAdminDetail(appointment.id)));
  const detailsById = new Map(
    detailEntries.filter(Boolean).map((detail) => [detail!.id, detail!])
  );
  const rows = appointments.map((appointment) => {
    const detail = detailsById.get(appointment.id);

    return [
      <div key={`${appointment.id}-code`}>
        <p className="font-semibold text-ink-900">{appointment.id}</p>
        <p className="text-xs text-stone-500">{appointment.petName}</p>
      </div>,
      <div key={`${appointment.id}-customer`}>
        <p className="font-medium text-ink-900">{appointment.customerName}</p>
        <p className="text-xs text-stone-500">{appointment.customerPhone}</p>
      </div>,
      <div key={`${appointment.id}-service`}>
        <p className="text-sm font-medium text-ink-900">{appointment.serviceName}</p>
        <p className="text-xs text-stone-500">
          {new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC"
          }).format(new Date(appointment.scheduledStartAt))}
        </p>
      </div>,
      <OperationalStatusPill key={`${appointment.id}-status`} status={appointment.status} />,
      <div key={`${appointment.id}-payment`} className="space-y-2">
        <PaymentStatusPill status={appointment.paymentStatus} />
        {appointment.amountBalanceCents > 0 ? (
          <BalanceDueIndicator value={formatCurrency(appointment.amountBalanceCents / 100)} compact />
        ) : null}
      </div>,
      detail ? (
        <AppointmentDetailDrawer key={`${appointment.id}-action`} appointment={detail} />
      ) : (
        <span key={`${appointment.id}-action`} className="text-sm text-stone-500">
          Sem detalhe
        </span>
      )
    ];
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Agendamentos</p>
        <h1 className="page-title">Agenda operacional funcional com status protegidos, hold visível e timeline básica.</h1>
      </div>
      <FilterBar placeholder="Buscar por cliente, pet ou código do agendamento" primaryFilterLabel="Status do atendimento" />
      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento registrado"
          description="Quando um cliente concluir uma reserva real pela agenda online, o atendimento aparecera aqui com tutor, pet, status financeiro e timeline."
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable headers={headers} rows={rows} />
          </div>
          <div className="grid gap-4 lg:hidden">
            {appointments.map((appointment) => {
              const detail = detailsById.get(appointment.id);

              return (
                <article key={appointment.id} className="surface-default space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{appointment.id}</p>
                      <p className="text-sm text-stone-500">{appointment.customerName}</p>
                      <p className="text-xs text-stone-500">{appointment.customerPhone}</p>
                    </div>
                    <OperationalStatusPill status={appointment.status} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-stone-500">Pet</span>
                      <span className="font-medium text-ink-900">{appointment.petName}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-stone-500">Serviço</span>
                      <span className="font-medium text-ink-900">{appointment.serviceName}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-stone-500">Financeiro</span>
                      <PaymentStatusPill status={appointment.paymentStatus} />
                    </div>
                  </div>

                  {appointment.amountBalanceCents > 0 ? (
                    <BalanceDueIndicator value={formatCurrency(appointment.amountBalanceCents / 100)} compact />
                  ) : null}

                  {detail ? <AppointmentDetailDrawer appointment={detail} /> : null}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
