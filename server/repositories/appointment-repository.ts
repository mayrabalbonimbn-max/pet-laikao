import { Prisma } from "@prisma/client";

import { db } from "@/server/db/client";
import { HOLD_DURATION_SECONDS } from "@/domains/appointments/constants";
import {
  AppointmentHoldRecord,
  AppointmentRecord,
  AppointmentService,
  AppointmentHoldStatus,
  AvailabilityRule,
  CalendarBlock,
  CustomerProfile,
  PetProfile
} from "@/domains/appointments/types";
import { ensureAppointmentHoldWorker } from "@/server/services/appointment-hold-expiration-service";
import { ensureAppointmentSeedData } from "@/server/services/appointment-seed-service";
import {
  LEGACY_DEMO_APPOINTMENT_IDS,
  LEGACY_DEMO_CALENDAR_BLOCK_IDS,
  LEGACY_DEMO_CUSTOMER_IDS,
  LEGACY_DEMO_PET_IDS
} from "@/server/services/demo-data-hygiene-service";

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureInfrastructure() {
  await ensureAppointmentSeedData();
  ensureAppointmentHoldWorker();
}

const appointmentWithRelations = Prisma.validator<Prisma.AppointmentDefaultArgs>()({
  include: {
    service: true,
    customer: true,
    pet: true,
    timeline: true,
    holds: {
      orderBy: {
        createdAt: "desc"
      }
    }
  }
});

type AppointmentWithRelations = Prisma.AppointmentGetPayload<typeof appointmentWithRelations>;

function mapAppointmentRecord(appointment: AppointmentWithRelations): AppointmentRecord {
  const activeHold = appointment.holds.find((hold) => hold.status === "active");

  return {
    id: appointment.id,
    serviceId: appointment.serviceId,
    serviceName: appointment.service.name,
    customerId: appointment.customerId,
    customerName: appointment.customer.fullName,
    customerPhone: appointment.customer.phone,
    customerEmail: appointment.customer.email ?? undefined,
    petId: appointment.petId,
    petName: appointment.pet.name,
    petSpecies: appointment.pet.species as any,
    petSize: appointment.pet.size as any,
    scheduledStartAt: appointment.scheduledStartAt.toISOString(),
    scheduledEndAt: appointment.scheduledEndAt.toISOString(),
    status: appointment.status as any,
    paymentStatus: appointment.paymentStatus as any,
    paymentOption: appointment.paymentOption as any,
    paymentMethod: appointment.paymentMethod as any,
    amountDueCents: appointment.amountDueCents,
    amountPaidCents: appointment.amountPaidCents,
    amountBalanceCents: appointment.amountBalanceCents,
    holdExpiresAt: activeHold?.expiresAt.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    timeline: appointment.timeline
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        description: entry.description,
        createdAt: entry.createdAt.toISOString()
      }))
  };
}

function mapAppointmentHoldRecord(hold: {
  id: string;
  appointmentId: string;
  serviceId: string;
  customerId: string | null;
  petId: string | null;
  slotReference: string;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  releasedAt: Date | null;
}): AppointmentHoldRecord {
  return {
    id: hold.id,
    appointmentId: hold.appointmentId,
    serviceId: hold.serviceId,
    customerId: hold.customerId ?? undefined,
    petId: hold.petId ?? undefined,
    slotReference: hold.slotReference,
    scheduledStartAt: hold.scheduledStartAt.toISOString(),
    scheduledEndAt: hold.scheduledEndAt.toISOString(),
    status: hold.status as AppointmentHoldStatus,
    createdAt: hold.createdAt.toISOString(),
    expiresAt: hold.expiresAt.toISOString(),
    releasedAt: hold.releasedAt?.toISOString()
  };
}

async function getAppointmentWithRelations(where: { id: string }) {
  return db.appointment.findUnique({
    where,
    ...appointmentWithRelations
  });
}

export async function listServices() {
  await ensureInfrastructure();
  const services = await db.appointmentService.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { priceCents: "asc" }]
  });

  return services.map<AppointmentService>((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    active: service.active,
    displayOrder: service.displayOrder,
    petSpecies: (service.petSpecies as AppointmentService["petSpecies"]) ?? "all",
    petSize: (service.petSize as AppointmentService["petSize"]) ?? "all"
  }));
}

export async function listServicesForAdmin() {
  await ensureInfrastructure();
  const services = await db.appointmentService.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
  });

  return services.map<AppointmentService>((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    active: service.active,
    displayOrder: service.displayOrder,
    petSpecies: (service.petSpecies as AppointmentService["petSpecies"]) ?? "all",
    petSize: (service.petSize as AppointmentService["petSize"]) ?? "all"
  }));
}

export async function getServiceBySlug(slug: string) {
  await ensureInfrastructure();
  const service = await db.appointmentService.findUnique({ where: { slug } });
  if (!service || !service.active) {
    return null;
  }

  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    active: service.active,
    displayOrder: service.displayOrder,
    petSpecies: (service.petSpecies as AppointmentService["petSpecies"]) ?? "all",
    petSize: (service.petSize as AppointmentService["petSize"]) ?? "all"
  } satisfies AppointmentService;
}

export async function upsertServiceRecord(input: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
  displayOrder: number;
  petSpecies?: string | null;
  petSize?: string | null;
}) {
  await ensureInfrastructure();

  const id = input.id ?? nextId("svc");
  await db.appointmentService.upsert({
    where: { id },
    update: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      active: input.active,
      displayOrder: input.displayOrder,
      petSpecies: input.petSpecies ?? null,
      petSize: input.petSize ?? null,
      updatedAt: new Date()
    },
    create: {
      id,
      slug: input.slug,
      name: input.name,
      description: input.description,
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      active: input.active,
      displayOrder: input.displayOrder,
      petSpecies: input.petSpecies ?? null,
      petSize: input.petSize ?? null
    }
  });
}

export async function listCustomers() {
  await ensureInfrastructure();

  const [customers, pets] = await Promise.all([
    db.customer.findMany({
      where: { id: { notIn: LEGACY_DEMO_CUSTOMER_IDS } },
      orderBy: { fullName: "asc" }
    }),
    db.pet.findMany({
      where: { id: { notIn: LEGACY_DEMO_PET_IDS } },
      orderBy: { name: "asc" }
    })
  ]);

  return {
    customers: customers.map<CustomerProfile>((customer) => ({
      id: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email ?? undefined
    })),
    pets: pets.map<PetProfile>((pet) => ({
      id: pet.id,
      customerId: pet.customerId,
      name: pet.name,
      species: pet.species as any,
      breed: pet.breed ?? undefined,
      size: pet.size as any
    }))
  };
}

export async function listAvailabilityRules() {
  await ensureInfrastructure();
  const rules = await db.availabilityRule.findMany({
    where: { active: true }
  });

  return rules.map<AvailabilityRule>((rule) => ({
    id: rule.id,
    serviceId: rule.serviceId,
    weekday: rule.weekday,
    startsAt: rule.startsAt,
    endsAt: rule.endsAt,
    slotIntervalMinutes: rule.slotIntervalMinutes,
    capacity: rule.capacity,
    active: rule.active
  }));
}

export async function listCalendarBlocks() {
  await ensureInfrastructure();
  const blocks = await db.calendarBlock.findMany();

  return blocks
    .filter((block) => !LEGACY_DEMO_CALENDAR_BLOCK_IDS.includes(block.id))
    .map<CalendarBlock>((block) => ({
      id: block.id,
      serviceId: block.serviceId ?? undefined,
      startsAt: block.startsAt.toISOString(),
      endsAt: block.endsAt.toISOString(),
      reason: block.reason
    }));
}

export async function listAppointments() {
  await ensureInfrastructure();
  const appointments = await db.appointment.findMany({
    where: { id: { notIn: LEGACY_DEMO_APPOINTMENT_IDS } },
    ...appointmentWithRelations,
    orderBy: {
      scheduledStartAt: "asc"
    }
  });

  return appointments.map(mapAppointmentRecord);
}

export async function getAppointmentById(id: string) {
  if (LEGACY_DEMO_APPOINTMENT_IDS.includes(id)) {
    return null;
  }

  await ensureInfrastructure();
  const appointment = await getAppointmentWithRelations({ id });
  return appointment ? mapAppointmentRecord(appointment) : null;
}

export async function saveAppointment(appointment: AppointmentRecord) {
  await ensureInfrastructure();

  await db.appointment.update({
    where: { id: appointment.id },
    data: {
      status: appointment.status,
      paymentStatus: appointment.paymentStatus,
      paymentOption: appointment.paymentOption,
      paymentMethod: appointment.paymentMethod,
      amountDueCents: appointment.amountDueCents,
      amountPaidCents: appointment.amountPaidCents,
      amountBalanceCents: appointment.amountBalanceCents,
      scheduledStartAt: new Date(appointment.scheduledStartAt),
      scheduledEndAt: new Date(appointment.scheduledEndAt),
      updatedAt: new Date()
    }
  });

  const saved = await getAppointmentWithRelations({ id: appointment.id });

  if (!saved) {
    throw new Error("Unable to reload appointment after update.");
  }

  return mapAppointmentRecord(saved);
}

export async function addAppointmentTimeline(id: string, label: string, description: string) {
  await ensureInfrastructure();

  await db.appointmentTimeline.create({
    data: {
      id: nextId("tl"),
      appointmentId: id,
      label,
      description,
      createdAt: new Date()
    }
  });

  const saved = await getAppointmentWithRelations({ id });
  return saved ? mapAppointmentRecord(saved) : null;
}

export async function createCustomerProfile(input: Omit<CustomerProfile, "id">) {
  await ensureInfrastructure();
  const customer = await db.customer.create({
    data: {
      id: nextId("cust"),
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null
    }
  });

  return {
    id: customer.id,
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email ?? undefined
  } satisfies CustomerProfile;
}

export async function createPetProfile(input: Omit<PetProfile, "id">) {
  await ensureInfrastructure();
  const pet = await db.pet.create({
    data: {
      id: nextId("pet"),
      customerId: input.customerId,
      name: input.name,
      species: input.species,
      breed: input.breed ?? null,
      size: input.size
    }
  });

  return {
    id: pet.id,
    customerId: pet.customerId,
    name: pet.name,
    species: pet.species as any,
    breed: pet.breed ?? undefined,
    size: pet.size as any
  } satisfies PetProfile;
}

export async function createAppointmentRecord(
  input: Omit<AppointmentRecord, "id" | "createdAt" | "updatedAt" | "timeline">
) {
  await ensureInfrastructure();

  const appointment = await db.appointment.create({
    data: {
      id: nextId("APT"),
      serviceId: input.serviceId,
      customerId: input.customerId,
      petId: input.petId,
      scheduledStartAt: new Date(input.scheduledStartAt),
      scheduledEndAt: new Date(input.scheduledEndAt),
      status: input.status,
      paymentStatus: input.paymentStatus,
      paymentOption: input.paymentOption,
      paymentMethod: input.paymentMethod,
      amountDueCents: input.amountDueCents,
      amountPaidCents: input.amountPaidCents,
      amountBalanceCents: input.amountBalanceCents
    }
  });

  const saved = await getAppointmentWithRelations({ id: appointment.id });

  if (!saved) {
    throw new Error("Unable to load appointment after create.");
  }

  return mapAppointmentRecord(saved);
}

export async function createAppointmentHoldRecord({
  appointmentId,
  serviceId,
  customerId,
  petId,
  scheduledStartAt,
  scheduledEndAt,
  expiresAt
}: {
  appointmentId: string;
  serviceId: string;
  customerId?: string;
  petId?: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  expiresAt: string;
}) {
  await ensureInfrastructure();

  const slotReference = `${serviceId}:${scheduledStartAt}`;

  const existingActiveHold = await db.appointmentHold.findFirst({
    where: {
      slotReference,
      status: "active"
    }
  });

  if (existingActiveHold) {
    throw new Error("Já existe um hold ativo para este slot.");
  }

  return db.appointmentHold.create({
    data: {
      id: nextId("hold"),
      appointmentId,
      serviceId,
      customerId: customerId ?? null,
      petId: petId ?? null,
      slotReference,
      scheduledStartAt: new Date(scheduledStartAt),
      scheduledEndAt: new Date(scheduledEndAt),
      status: "active",
      expiresAt: new Date(expiresAt)
    }
  });
}

export async function listActiveAppointmentHolds() {
  await ensureInfrastructure();
  const holds = await db.appointmentHold.findMany({
    where: {
      status: "active"
    },
    orderBy: {
      expiresAt: "asc"
    }
  });

  return holds.map(mapAppointmentHoldRecord);
}

export async function updateAppointmentHoldStatus(
  appointmentId: string,
  status: AppointmentHoldStatus
) {
  await ensureInfrastructure();

  const activeHold = await db.appointmentHold.findFirst({
    where: {
      appointmentId,
      status: "active"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!activeHold) {
    return null;
  }

  return db.appointmentHold.update({
    where: { id: activeHold.id },
    data: {
      status,
      releasedAt: status === "active" ? null : new Date()
    }
  });
}

export async function getHoldDurationSeconds() {
  await ensureInfrastructure();
  return HOLD_DURATION_SECONDS;
}
