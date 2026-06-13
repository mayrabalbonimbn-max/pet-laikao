import { NotificationStatus } from "@/domains/notifications/types";

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  queued: "Na fila",
  sent: "Enviado",
  failed: "Falhou",
  retrying: "Tentando novamente",
  cancelled: "Cancelado"
};

