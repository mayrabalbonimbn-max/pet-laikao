import type { AppointmentPaymentListItem } from "@/domains/payments/types";

export type AppointmentStatus =
  | "draft"
  | "hold_pending_payment"
  | "confirmed_partial"
  | "confirmed_paid"
  | "checked_in"
  | "in_service"
  | "completed"
  | "reschedule_requested"
  | "rescheduled"
  | "cancelled"
  | "no_show"
  | "payment_failed"
  | "payment_expired";

export type AppointmentPaymentStatus =
  | "unpaid"
  | "pending"
  | "partial"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export type PaymentOption = "deposit_50" | "full_100";
export type PaymentMethod = "pix" | "credit_card";
export type CalendarView = "month" | "week" | "day";
export type PetSpecies = "dog" | "cat" | "other";
export type PetSize = "small" | "medium" | "large" | "giant";
export type SlotState = "available" | "limited" | "blocked" | "selected";
export type AvailabilityDayState = "available" | "limited" | "blocked" | "selected";
export type AppointmentHoldStatus = "active" | "converted" | "expired" | "released";

export type AppointmentService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
  displayOrder: number;
  petSpecies?: PetSpecies | "all";
  petSize?: PetSize | "all";
};

export type CustomerProfile = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
};

export type PetProfile = {
  id: string;
  customerId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  size: PetSize;
};

export type AvailabilityRule = {
  id: string;
  serviceId: string | null;
  weekday: number;
  startsAt: string;
  endsAt: string;
  slotIntervalMinutes: number;
  capacity: number;
  active: boolean;
};

export type CalendarBlock = {
  id: string;
  serviceId?: string;
  startsAt: string;
  endsAt: string;
  reason: string;
};

export type AppointmentTimelineEntry = {
  id: string;
  label: string;
  description: string;
  createdAt: string;
};

export type AppointmentHoldRecord = {
  id: string;
  appointmentId: string;
  serviceId: string;
  customerId?: string;
  petId?: string;
  slotReference: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: AppointmentHoldStatus;
  createdAt: string;
  expiresAt: string;
  releasedAt?: string;
};

export type AppointmentRecord = {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  petId: string;
  petName: string;
  petSpecies: PetSpecies;
  petSize: PetSize;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
  paymentOption: PaymentOption;
  paymentMethod: PaymentMethod;
  amountDueCents: number;
  amountPaidCents: number;
  amountBalanceCents: number;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  timeline: AppointmentTimelineEntry[];
};

export type AppointmentTransitionEvent =
  | { type: "create_hold"; holdExpiresAt: string }
  | { type: "payment_confirmed"; paymentOption: PaymentOption }
  | { type: "payment_failed" }
  | { type: "payment_expired" }
  | { type: "check_in" }
  | { type: "start_service" }
  | { type: "complete" }
  | { type: "request_reschedule" }
  | { type: "mark_rescheduled" }
  | { type: "cancel" }
  | { type: "mark_no_show" };

export type AvailabilityDay = {
  dateKey: string;
  dayLabel: string;
  weekdayLabel: string;
  state: AvailabilityDayState;
  availableSlots: number;
};

export type TimeSlotOption = {
  startAt: string;
  endAt: string;
  label: string;
  state: SlotState;
};

export type AgendaBootstrapData = {
  services: AppointmentService[];
  customers: Array<CustomerProfile & { pets: PetProfile[] }>;
  initialSelectedDate: string;
  holdDurationSeconds: number;
};

export type AgendaAvailabilityResponse = {
  selectedDate: string;
  selectedView: CalendarView;
  days: AvailabilityDay[];
  slots: TimeSlotOption[];
};

export type AgendaSummary = {
  serviceName?: string;
  petName?: string;
  customerName?: string;
  selectedStartAt?: string;
  priceCents?: number;
  paymentOption: PaymentOption;
  amountToChargeNowCents?: number;
  balanceAfterPaymentCents?: number;
};

export type AppointmentAdminRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  petName: string;
  serviceName: string;
  scheduledStartAt: string;
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
  amountPaidCents: number;
  amountBalanceCents: number;
};

export type AppointmentAdminDetail = AppointmentAdminRow & {
  paymentOption: PaymentOption;
  paymentMethod: PaymentMethod;
  holdExpiresAt?: string;
  timeline: AppointmentTimelineEntry[];
  payments?: AppointmentPaymentListItem[];
};
