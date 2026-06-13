import { ReactNode } from "react";

import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { InlineNotice } from "@/components/feedback/inline-notice";

export default function AdminNotificationsPage() {
  const headers = ["Canal", "Evento", "Destinatário", "Status", "Referência"];
  const rows: ReactNode[][] = [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Notificações</p>
        <h1 className="page-title">Avisos enviados aos clientes: e-mail, WhatsApp e push, com o status de cada envio.</h1>
      </div>
      <FilterBar placeholder="Buscar por canal, evento ou destinatário" primaryFilterLabel="Canal" />

      <InlineNotice
        title="Sem avisos por enquanto"
        description="Quando os envios automáticos forem ativados, cada e-mail, WhatsApp e push aparece aqui com o status."
      />

      <div className="space-y-3">
        <DataTable headers={headers} rows={rows} />
        <EmptyState
          title="Nenhuma notificação ainda"
          description="Assim que os envios forem ativados, os avisos de e-mail, WhatsApp e push aparecem aqui com status e referência."
        />
      </div>
    </div>
  );
}

