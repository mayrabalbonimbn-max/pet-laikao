import { FulfillmentStatus, InventoryState, OrderStatus } from "@/domains/orders/types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  payment_failed: "Pagamento falhou",
  payment_expired: "Pagamento expirou",
  paid: "Pago",
  processing: "Em processamento",
  ready_for_pickup: "Pronto para retirada",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado"
};

export const fulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  not_started: "Nao iniciado",
  reserved: "Reservado",
  picking: "Em separacao",
  ready_for_pickup: "Pronto para retirada",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado"
};

export const inventoryStateLabels: Record<InventoryState, string> = {
  not_reserved: "Nao reservado",
  reserved: "Reservado",
  decremented: "Baixado",
  released: "Liberado"
};

