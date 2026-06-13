import {
  AppointmentPaymentStatus,
  AppointmentService,
  AppointmentStatus,
  AvailabilityRule,
  PaymentOption,
} from "@/domains/appointments/types";

export const HOLD_DURATION_SECONDS = 10 * 60;

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  draft: "Rascunho",
  hold_pending_payment: "Aguardando pagamento",
  confirmed_partial: "Confirmado com saldo",
  confirmed_paid: "Confirmado quitado",
  checked_in: "Check-in realizado",
  in_service: "Em atendimento",
  completed: "Concluído",
  reschedule_requested: "Reagendamento solicitado",
  rescheduled: "Reagendado",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
  payment_failed: "Pagamento falhou",
  payment_expired: "Pagamento expirou"
};

export const appointmentPaymentStatusLabels: Record<AppointmentPaymentStatus, string> = {
  unpaid: "Não iniciado",
  pending: "Pendente",
  partial: "Parcial",
  paid: "Pago",
  failed: "Falhou",
  expired: "Expirado",
  cancelled: "Cancelado"
};

export const paymentOptionLabels: Record<PaymentOption, string> = {
  deposit_50: "Reservar com 50%",
  full_100: "Pagar 100%"
};

export const appointmentServicesSeed: AppointmentService[] = [
  {
    id: "svc-bath-premium",
    slug: "banho-e-tosa-premium",
    name: "Banho e tosa premium",
    description: "Serviço principal com ticket mais alto e operação completa.",
    durationMinutes: 90,
    priceCents: 11000,
    active: true,
    displayOrder: 1,
    petSpecies: "dog",
    petSize: "all"
  },
  {
    id: "svc-bath-therapy",
    slug: "banho-terapeutico",
    name: "Banho terapêutico",
    description: "Banho de cuidado especial com execução mais rápida.",
    durationMinutes: 60,
    priceCents: 7800,
    active: true,
    displayOrder: 2,
    petSpecies: "dog",
    petSize: "all"
  },
  {
    id: "svc-hygiene",
    slug: "tosa-higienica",
    name: "Tosa higiênica",
    description: "Serviço de manutenção com ótima conversão de entrada.",
    durationMinutes: 45,
    priceCents: 6500,
    active: true,
    displayOrder: 3,
    petSpecies: "dog",
    petSize: "all"
  }
];

export const availabilityRulesSeed: AvailabilityRule[] = [
  { id: "rule-1", serviceId: null, weekday: 1, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-2", serviceId: null, weekday: 2, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-3", serviceId: null, weekday: 3, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-4", serviceId: null, weekday: 4, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-5", serviceId: null, weekday: 5, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-6", serviceId: null, weekday: 6, startsAt: "09:00", endsAt: "14:00", slotIntervalMinutes: 60, capacity: 1, active: true }
];
