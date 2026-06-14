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

// Catálogo real de serviços (fonte de verdade do conteúdo: servicos-laikao.md).
// Duração padrão de 90 min confirmada pela Cris (1h30 por atendimento); pode ser
// refinada por serviço depois. Serviços com duração > 0 ficam agendáveis online.
// Serviços sem preço confirmado entram inativos (não aparecem na vitrine nem na agenda).
// Categoria, "a partir de", tabela de banho e níveis da tosa comercial ficam em
// config/services-content.ts (não são colunas do modelo).
export const appointmentServicesSeed: AppointmentService[] = [
  {
    id: "svc-banho",
    slug: "banho",
    name: "Banho",
    description:
      "Banho completo com produtos próprios pra cada tipo de pelo. O valor varia por porte, raça e pelagem. Todo banho inclui limpeza de ouvidos e corte de unhas.",
    durationMinutes: 90,
    priceCents: 4500,
    active: true,
    displayOrder: 1,
    petSpecies: "all",
    petSize: "all"
  },
  {
    id: "svc-tosa-bebe",
    slug: "tosa-bebe",
    name: "Tosa Bebê",
    description:
      "Dá forma ao corpo sem reduzir muito o pelo, com patas cilíndricas e aspecto arredondado. Indicada pra Shih Tzu, Lhasa, Yorkshire, Poodle e Maltês.",
    durationMinutes: 90,
    priceCents: 11000,
    active: true,
    displayOrder: 2,
    petSpecies: "all",
    petSize: "all"
  },
  {
    id: "svc-tosa-baixa",
    slug: "tosa-baixa",
    name: "Tosa Baixa",
    description:
      "Reduz bastante o comprimento, com visual leve e prático. Ideal pra climas quentes e pets que embolam o pelo com facilidade.",
    durationMinutes: 90,
    priceCents: 10000,
    active: true,
    displayOrder: 3,
    petSpecies: "all",
    petSize: "all"
  },
  {
    id: "svc-tosa-comercial",
    slug: "tosa-comercial",
    name: "Tosa Comercial",
    description:
      "Pelagem uniforme, em alturas diferentes. Níveis: Zero, Média e Alta na tesoura.",
    durationMinutes: 90,
    priceCents: 10000,
    active: true,
    displayOrder: 4,
    petSpecies: "all",
    petSize: "all"
  },
  {
    id: "svc-tosa-trimming",
    slug: "tosa-trimming",
    name: "Tosa Trimming",
    description:
      "Para pelagem dupla, como Lulu da Pomerânia e Spitz Alemão. Aparo estratégico, com aspecto de ursinho de pelúcia.",
    durationMinutes: 90,
    priceCents: 15000,
    active: true,
    displayOrder: 5,
    petSpecies: "all",
    petSize: "all"
  },
  // Pendentes de preço (servicos-laikao.md, seção 6). Ficam INATIVOS até a Cris
  // confirmar o valor. Sem preço fake: priceCents fica em 0 só como marcador.
  {
    id: "svc-hygiene",
    slug: "tosa-higienica",
    name: "Tosa Higiênica",
    description:
      "Foco em saúde e limpeza: patas, coxins, regiões íntimas, barriga e orelhas. Previne fungos e dermatites. Recomendada cerca de uma vez por mês.",
    durationMinutes: 90,
    priceCents: 0,
    active: false,
    displayOrder: 6,
    petSpecies: "all",
    petSize: "all"
  },
  {
    id: "svc-tosa-asiatica",
    slug: "tosa-asiatica",
    name: "Tosa Asiática",
    description:
      "Modelagem estilizada de rosto e corpo, no estilo bonequinho japonês ou coreano. Visual moderno e diferenciado.",
    durationMinutes: 90,
    priceCents: 0,
    active: false,
    displayOrder: 7,
    petSpecies: "all",
    petSize: "all"
  }
];

// IDs de serviços placeholder antigos que saem do catálogo real (preço/duração
// fictícios). Não são apagados (preserva histórico de agendamentos), apenas
// desativados pelo script de cadastro.
export const retiredServiceIds: string[] = [
  "svc-bath-premium",
  "svc-bath-therapy"
];

export const availabilityRulesSeed: AvailabilityRule[] = [
  { id: "rule-1", serviceId: null, weekday: 1, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-2", serviceId: null, weekday: 2, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-3", serviceId: null, weekday: 3, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-4", serviceId: null, weekday: 4, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-5", serviceId: null, weekday: 5, startsAt: "09:00", endsAt: "18:00", slotIntervalMinutes: 60, capacity: 1, active: true },
  { id: "rule-6", serviceId: null, weekday: 6, startsAt: "09:00", endsAt: "14:00", slotIntervalMinutes: 60, capacity: 1, active: true }
];
