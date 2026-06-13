import {
  getServiceBySlug,
  getAppointmentById,
  getHoldDurationSeconds,
  listActiveAppointmentHolds,
  listAppointments,
  listAvailabilityRules,
  listCalendarBlocks,
  listCustomers,
  listServices,
  listServicesForAdmin
} from "@/server/repositories/appointment-repository";
import {
  AgendaAvailabilityResponse,
  AgendaBootstrapData,
  AppointmentAdminDetail,
  AppointmentAdminRow,
  AvailabilityDay,
  CalendarView,
  TimeSlotOption
} from "@/domains/appointments/types";
import { appointmentOccupiesSlot } from "@/domains/appointments/policies";
import { mapAppointmentToAdminDetail, mapAppointmentToAdminRow, mapCustomersWithPets } from "@/domains/appointments/mappers";
import { addMinutes, formatDateLabel, formatSlotLabel, makeUtcDate, rangesOverlap, toDateKey } from "@/domains/appointments/utils";
import { listAppointmentPaymentItems } from "@/domains/payments/queries";
import { listAdminCalendarEvents } from "@/server/repositories/admin-calendar-repository";

function startOfWeek(date: Date) {
  const clone = new Date(date);
  const day = clone.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  clone.setUTCDate(clone.getUTCDate() + diff);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addDays(date: Date, amount: number) {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + amount);
  return clone;
}

function getVisibleDateKeys(selectedDate: string, view: CalendarView) {
  const baseDate = new Date(`${selectedDate}T12:00:00.000Z`);

  if (view === "day") {
    return [selectedDate];
  }

  if (view === "week") {
    const start = startOfWeek(baseDate);
    return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
  }

  const monthStart = startOfMonth(baseDate);
  const gridStart = startOfWeek(monthStart);
  return Array.from({ length: 35 }, (_, index) => toDateKey(addDays(gridStart, index)));
}

export async function getAgendaBootstrapData(): Promise<AgendaBootstrapData> {
  const { customers, pets } = await listCustomers();
  return {
    services: await listServices(),
    customers: mapCustomersWithPets(customers, pets),
    initialSelectedDate: "2026-04-21",
    holdDurationSeconds: await getHoldDurationSeconds()
  };
}

export async function listPublicServices() {
  return listServices();
}

export async function listAdminServices() {
  return listServicesForAdmin();
}

export async function getPublicServiceDetail(slug: string) {
  return getServiceBySlug(slug);
}

export async function getAvailabilityData({
  serviceId,
  selectedDate,
  view,
  selectedStartAt
}: {
  serviceId: string;
  selectedDate: string;
  view: CalendarView;
  selectedStartAt?: string;
}): Promise<AgendaAvailabilityResponse> {
  const services = await listServices();
  const service = services.find((item) => item.id === serviceId);
  if (!service) {
    throw new Error("Service not found.");
  }
  const selectedService = service;

  const rules = await listAvailabilityRules();
  const blocks = await listCalendarBlocks();
  const appointments = await listAppointments();
  const activeHolds = await listActiveAppointmentHolds();
  const adminEvents = await listAdminCalendarEvents();

  function getApplicableRule(weekday: number) {
    return (
      rules.find((rule) => rule.serviceId === selectedService.id && rule.weekday === weekday) ??
      rules.find((rule) => rule.serviceId === null && rule.weekday === weekday) ??
      null
    );
  }

  function countOccupancy(startAt: Date, endAt: Date) {
    const appointmentsOccupancy = appointments.filter((appointment) => {
      if (!appointmentOccupiesSlot(appointment.status) || appointment.serviceId !== selectedService.id) {
        return false;
      }

      return rangesOverlap(startAt, endAt, new Date(appointment.scheduledStartAt), new Date(appointment.scheduledEndAt));
    }).length;

    const holdsOccupancy = activeHolds.filter((hold) => {
      if (hold.serviceId !== selectedService.id) {
        return false;
      }

      return rangesOverlap(startAt, endAt, new Date(hold.scheduledStartAt), new Date(hold.scheduledEndAt));
    }).length;

    return Math.max(appointmentsOccupancy, holdsOccupancy);
  }

  function isBlocked(startAt: Date, endAt: Date) {
    const blockedByCalendarBlock = blocks.some((block) => {
      if (block.serviceId && block.serviceId !== selectedService.id) {
        return false;
      }

      return rangesOverlap(startAt, endAt, new Date(block.startsAt), new Date(block.endsAt));
    });

    if (blockedByCalendarBlock) {
      return true;
    }

    return adminEvents.some((event: Awaited<ReturnType<typeof listAdminCalendarEvents>>[number]) => {
      if (!event.impactAvailability || event.status !== "active") {
        return false;
      }

      if (event.serviceId && event.serviceId !== selectedService.id) {
        return false;
      }

      return rangesOverlap(startAt, endAt, new Date(event.startsAt), new Date(event.endsAt));
    });
  }

  function buildSlotsForDate(dateKey: string) {
    const dayDate = new Date(`${dateKey}T12:00:00.000Z`);
    const weekday = dayDate.getUTCDay();
    const normalizedWeekday = weekday === 0 ? 7 : weekday;
    const rule = getApplicableRule(normalizedWeekday);

    if (!rule) {
      return [] as TimeSlotOption[];
    }

    const slots: TimeSlotOption[] = [];
    let cursor = makeUtcDate(dateKey, rule.startsAt);
    const endLimit = makeUtcDate(dateKey, rule.endsAt);

    while (cursor < endLimit) {
      const slotEnd = addMinutes(cursor, selectedService.durationMinutes);

      if (slotEnd <= endLimit) {
        const occupancy = countOccupancy(cursor, slotEnd);
        const blocked = isBlocked(cursor, slotEnd);
        let state: TimeSlotOption["state"] = "available";

        if (blocked || occupancy >= rule.capacity) {
          state = "blocked";
        }

        const startAt = cursor.toISOString();
        if (selectedStartAt === startAt) {
          state = "selected";
        }

        slots.push({
          startAt,
          endAt: slotEnd.toISOString(),
          label: formatSlotLabel(startAt),
          state
        });
      }

      cursor = addMinutes(cursor, rule.slotIntervalMinutes);
    }

    return slots;
  }

  const visibleDates = getVisibleDateKeys(selectedDate, view);
  const days: AvailabilityDay[] = visibleDates.map((dateKey) => {
    const slots = buildSlotsForDate(dateKey);
    const availableSlots = slots.filter((slot) => slot.state !== "blocked").length;

    let state: AvailabilityDay["state"] = "available";
    if (availableSlots === 0) {
      state = "blocked";
    } else if (availableSlots <= 2) {
      state = "limited";
    }

    if (dateKey === selectedDate) {
      state = "selected";
    }

    return {
      dateKey,
      dayLabel: dateKey.slice(-2),
      weekdayLabel: formatDateLabel(dateKey).split(",")[0],
      state,
      availableSlots
    };
  });

  return {
    selectedDate,
    selectedView: view,
    days,
    slots: buildSlotsForDate(selectedDate)
  };
}

export async function listAdminAppointments(): Promise<AppointmentAdminRow[]> {
  const appointments = await listAppointments();
  return appointments.map(mapAppointmentToAdminRow);
}

export async function getAppointmentAdminDetail(id: string): Promise<AppointmentAdminDetail | null> {
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    return null;
  }

  const detail = mapAppointmentToAdminDetail(appointment);
  detail.payments = await listAppointmentPaymentItems(id);
  return detail;
}
