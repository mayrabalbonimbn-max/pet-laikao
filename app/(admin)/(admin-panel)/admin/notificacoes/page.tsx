import { ReactNode } from "react";

import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { InlineNotice } from "@/components/feedback/inline-notice";

export default function AdminNotificationsPage() {
  const headers = ["Canal", "Evento", "Destinatario", "Status", "Referencia"];
  const rows: ReactNode[][] = [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Notificacoes</p>
        <h1 className="page-title">Fila de envio, falhas e rastreabilidade visiveis para operacao e suporte.</h1>
      </div>
      <FilterBar placeholder="Buscar por canal, evento ou destinatario" primaryFilterLabel="Canal" />

      <InlineNotice
        title="Painel em preparacao"
        description="Ainda nao existem registros persistidos de notificacao neste ambiente. Nenhum alerta ativo no momento."
      />

      <div className="space-y-3">
        <DataTable headers={headers} rows={rows} />
        <EmptyState
          title="Nenhuma notificacao registrada"
          description="Quando o envio persistente estiver ativo, eventos reais de e-mail, WhatsApp e PWA aparecerao aqui com status e referencia."
        />
      </div>
    </div>
  );
}

