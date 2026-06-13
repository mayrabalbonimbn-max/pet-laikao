import { randomUUID } from "node:crypto";

import { db } from "@/server/db/client";
import { appointmentOccupiesSlot } from "@/domains/appointments/policies";
import {
  AdminCalendarEventRecord,
  AdminCalendarCategory,
  UnifiedCalendarItem
} from "@/domains/admin-calendar/types";
import {
  LEGACY_DEMO_APPOINTMENT_IDS,
  LEGACY_DEMO_CALENDAR_BLOCK_IDS
} from "@/server/services/demo-data-hygiene-service";

function nextId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

const prisma = db as any;

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function mapAdminEvent(event: {
  id: string;
  serviceId: string | null;
  title: string;
  category: string;
  colorToken: string;
  customerName: string | null;
  petName: string | null;
  notes: string | null;
  startsAt: Date;
  endsAt: Date;
  impactAvailability: boolean;
  isAllDay: boolean;
  sourceType: string;
  status: string;
  referenceType: string | null;
  referenceId: string | null;
  service: { name: string } | null;
}): AdminCalendarEventRecord {
  return {
    id: event.id,
    serviceId: event.serviceId ?? undefined,
    serviceName: event.service?.name ?? undefined,
    title: event.title,
    category: event.category as AdminCalendarCategory,
    colorToken: event.colorToken,
    customerName: event.customerName ?? undefined,
    petName: event.petName ?? undefined,
    notes: event.notes ?? undefined,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    impactAvailability: event.impactAvailability,
    isAllDay: event.isAllDay,
    sourceType: event.sourceType,
    status: event.status,
    referenceType: event.referenceType ?? undefined,
    referenceId: event.referenceId ?? undefined
  };
}

export async function listAdminCalendarEvents(range?: { from?: Date; to?: Date }) {
  const events = await prisma.adminCalendarEvent.findMany({
    where: {
      startsAt: {
        gte: range?.from,
        lte: range?.to
      }
    },
    include: {
      service: true
    },
    orderBy: [{ startsAt: "asc" }]
  });

  return events.map((event: any) => mapAdminEvent(event));
}

export async function hasOperationalCalendarConflict(input: {
  startsAt: Date;
  endsAt: Date;
  serviceId?: string;
  impactAvailability: boolean;
}) {
  if (!input.impactAvailability) {
    return false;
  }

  const [appointments, holds, blocks, events] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        serviceId: input.serviceId ?? undefined
      }
    }),
    prisma.appointmentHold.findMany({
      where: {
        status: "active",
        serviceId: input.serviceId ?? undefined
      }
    }),
    prisma.calendarBlock.findMany({
      where: {
        OR: [{ serviceId: null }, { serviceId: input.serviceId ?? undefined }]
      }
    }),
    prisma.adminCalendarEvent.findMany({
      where: {
        impactAvailability: true,
        status: "active",
        OR: [{ serviceId: null }, { serviceId: input.serviceId ?? undefined }]
      }
    })
  ]);

  const conflictWithAppointment = appointments.some((appointment: any) =>
    appointmentOccupiesSlot(appointment.status as any) &&
    overlaps(input.startsAt, input.endsAt, appointment.scheduledStartAt, appointment.scheduledEndAt)
  );
  const conflictWithHold = holds.some((hold: any) =>
    overlaps(input.startsAt, input.endsAt, hold.scheduledStartAt, hold.scheduledEndAt)
  );
  const conflictWithBlock = blocks.some((block: any) =>
    overlaps(input.startsAt, input.endsAt, block.startsAt, block.endsAt)
  );
  const conflictWithEvent = events.some((event: any) =>
    overlaps(input.startsAt, input.endsAt, event.startsAt, event.endsAt)
  );

  return conflictWithAppointment || conflictWithHold || conflictWithBlock || conflictWithEvent;
}

export async function createAdminCalendarEventRecord(input: {
  serviceId?: string;
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
}) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
    throw new Error("Periodo invalido para o evento da agenda.");
  }

  const conflict = await hasOperationalCalendarConflict({
    startsAt,
    endsAt,
    serviceId: input.serviceId,
    impactAvailability: input.impactAvailability
  });

  if (conflict) {
    throw new Error("Este evento conflita com a agenda operacional atual.");
  }

  return prisma.adminCalendarEvent.create({
    data: {
      id: nextId("calevt"),
      serviceId: input.serviceId ?? null,
      title: input.title,
      category: input.category,
      colorToken: input.colorToken,
      customerName: input.customerName ?? null,
      petName: input.petName ?? null,
      notes: input.notes ?? null,
      startsAt,
      endsAt,
      impactAvailability: input.impactAvailability,
      isAllDay: input.isAllDay,
      sourceType: input.sourceType,
      status: "active"
    }
  });
}

export async function listUnifiedCalendarItems(range: { from: Date; to: Date }) {
  const [events, appointments, blocks] = await Promise.all([
    listAdminCalendarEvents(range),
    prisma.appointment.findMany({
      where: {
        id: { notIn: LEGACY_DEMO_APPOINTMENT_IDS },
        scheduledStartAt: {
          gte: range.from,
          lte: range.to
        }
      },
      include: {
        service: true,
        customer: true,
        pet: true
      },
      orderBy: [{ scheduledStartAt: "asc" }]
    }),
    prisma.calendarBlock.findMany({
      where: {
        id: { notIn: LEGACY_DEMO_CALENDAR_BLOCK_IDS },
        startsAt: {
          gte: range.from,
          lte: range.to
        }
      },
      include: {
        service: true
      },
      orderBy: [{ startsAt: "asc" }]
    })
  ]);

  const mappedEvents: UnifiedCalendarItem[] = events.map((event: any) => ({
    id: event.id,
    title: event.title,
    category: event.category,
    colorToken: event.colorToken,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    impactAvailability: event.impactAvailability,
    sourceType: "manual_event",
    serviceName: event.serviceName,
    customerName: event.customerName,
    petName: event.petName,
    notes: event.notes
  }));

  const mappedAppointments: UnifiedCalendarItem[] = appointments.map((appointment: any) => ({
    id: appointment.id,
    title: `${appointment.service.name} - ${appointment.customer.fullName}`,
    category: "bath_grooming",
    colorToken: "violet",
    startsAt: appointment.scheduledStartAt.toISOString(),
    endsAt: appointment.scheduledEndAt.toISOString(),
    impactAvailability: true,
    sourceType: "public_appointment",
    serviceName: appointment.service.name,
    customerName: appointment.customer.fullName,
    petName: appointment.pet.name,
    notes: appointment.status
  }));

  const mappedBlocks: UnifiedCalendarItem[] = blocks.map((block: any) => ({
    id: block.id,
    title: block.reason,
    category: "block",
    colorToken: "rose",
    startsAt: block.startsAt.toISOString(),
    endsAt: block.endsAt.toISOString(),
    impactAvailability: true,
    sourceType: "calendar_block",
    serviceName: block.service?.name ?? undefined,
    notes: block.reason
  }));

  return [...mappedAppointments, ...mappedBlocks, ...mappedEvents].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
}
