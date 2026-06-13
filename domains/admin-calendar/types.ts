export type AdminCalendarCategory =
  | "bath_grooming"
  | "personal"
  | "block"
  | "pickup_delivery"
  | "internal_admin";

export type UnifiedCalendarView = "month" | "week" | "day";

export type AdminCalendarEventRecord = {
  id: string;
  serviceId?: string;
  serviceName?: string;
  title: string;
  category: AdminCalendarCategory;
  colorToken: string;
  customerName?: string;
  petName?: string;
  notes?: string;
  startsAt: string;
  endsAt: string;
  impactAvailability: boolean;
  isAllDay: boolean;
  sourceType: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
};

export type UnifiedCalendarItem = {
  id: string;
  title: string;
  category: AdminCalendarCategory;
  colorToken: string;
  startsAt: string;
  endsAt: string;
  impactAvailability: boolean;
  sourceType: "public_appointment" | "manual_event" | "calendar_block";
  serviceName?: string;
  customerName?: string;
  petName?: string;
  notes?: string;
};

export const adminCalendarCategoryLabels: Record<AdminCalendarCategory, string> = {
  bath_grooming: "Banho e tosa",
  personal: "Compromisso pessoal",
  block: "Bloqueio",
  pickup_delivery: "Entrega ou retirada",
  internal_admin: "Administracao interna"
};

export const adminCalendarCategoryColors: Record<AdminCalendarCategory, string> = {
  bath_grooming: "violet",
  personal: "amber",
  block: "rose",
  pickup_delivery: "sky",
  internal_admin: "emerald"
};
