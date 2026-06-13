import {
  addAppointmentTimeline,
  createAppointmentHoldRecord,
  createAppointmentRecord,
  createCustomerProfile,
  createPetProfile,
  getAppointmentById,
  getHoldDurationSeconds,
  listCustomers,
  listServices,
  saveAppointment,
  updateAppointmentHoldStatus
} from "@/server/repositories/appointment-repository";
import { mapAppointmentToHoldResponse } from "@/domains/appointments/mappers";
import { calculateAmounts } from "@/domains/appointments/policies";
import { getAvailabilityData } from "@/domains/appointments/queries";
import { appointmentHoldSchema, releaseHoldSchema } from "@/domains/appointments/schema";
import { transitionAppointment } from "@/domains/appointments/state-machine";
import { addMinutes } from "@/domains/appointments/utils";

async function getOrCreateCustomerAndPet(input: ReturnType<typeof appointmentHoldSchema.parse>) {
  const { customers, pets } = await listCustomers();

  let customer = input.customerId ? customers.find((item) => item.id === input.customerId) : undefined;
  if (!customer) {
    customer = await createCustomerProfile({
      fullName: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail || undefined
    });
  }

  let pet = input.petId ? pets.find((item) => item.id === input.petId && item.customerId === customer.id) : undefined;
  if (!pet) {
    pet = await createPetProfile({
      customerId: customer.id,
      name: input.petName,
      species: input.petSpecies,
      size: input.petSize,
      breed: input.petBreed
    });
  }

  return { customer, pet };
}

export async function createAppointmentHold(input: unknown) {
  const payload = appointmentHoldSchema.parse(input);
  const services = await listServices();
  const service = services.find((item) => item.id === payload.serviceId);

  if (!service) {
    throw new Error("Serviço não encontrado.");
  }

  const availability = await getAvailabilityData({
    serviceId: service.id,
    selectedDate: payload.selectedStartAt.slice(0, 10),
    view: "day"
  });
  const slot = availability.slots.find((item) => item.startAt === payload.selectedStartAt);

  if (!slot || slot.state === "blocked") {
    throw new Error("O horário selecionado não está mais disponível.");
  }

  const { customer, pet } = await getOrCreateCustomerAndPet(payload);
  const amounts = calculateAmounts(service.priceCents, payload.paymentOption);
  const holdDurationSeconds = await getHoldDurationSeconds();
  const holdExpiresAt = addMinutes(new Date(), Math.floor(holdDurationSeconds / 60)).toISOString();

  let appointment = await createAppointmentRecord({
    serviceId: service.id,
    serviceName: service.name,
    customerId: customer.id,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    petId: pet.id,
    petName: pet.name,
    petSpecies: pet.species,
    petSize: pet.size,
    scheduledStartAt: payload.selectedStartAt,
    scheduledEndAt: addMinutes(new Date(payload.selectedStartAt), service.durationMinutes).toISOString(),
    status: "draft",
    paymentStatus: "unpaid",
    paymentOption: payload.paymentOption,
    paymentMethod: payload.paymentMethod,
    amountDueCents: amounts.amountDueCents,
    amountPaidCents: 0,
    amountBalanceCents: amounts.amountDueCents
  });

  appointment = transitionAppointment(appointment, {
    type: "create_hold",
    holdExpiresAt
  });

  const saved = await saveAppointment(appointment);

  await createAppointmentHoldRecord({
    appointmentId: saved.id,
    serviceId: saved.serviceId,
    customerId: saved.customerId,
    petId: saved.petId,
    scheduledStartAt: saved.scheduledStartAt,
    scheduledEndAt: saved.scheduledEndAt,
    expiresAt: holdExpiresAt
  });

  await addAppointmentTimeline(saved.id, "Hold criado", "Slot temporariamente reservado aguardando pagamento.");

  const refreshed = await getAppointmentById(saved.id);
  if (!refreshed) {
    throw new Error("Agendamento não encontrado após criação do hold.");
  }

  return mapAppointmentToHoldResponse(refreshed);
}

export async function releaseAppointmentHold(input: unknown) {
  const payload = releaseHoldSchema.parse(input);
  const appointment = await getAppointmentById(payload.appointmentId);

  if (!appointment) {
    throw new Error("Agendamento não encontrado.");
  }

  if (appointment.status !== "hold_pending_payment") {
    return mapAppointmentToHoldResponse(appointment);
  }

  const transitioned = transitionAppointment(appointment, {
    type: payload.reason === "expired" ? "payment_expired" : "cancel"
  });

  const saved = await saveAppointment(transitioned);
  await updateAppointmentHoldStatus(saved.id, payload.reason === "expired" ? "expired" : "released");

  await addAppointmentTimeline(
    saved.id,
    payload.reason === "expired" ? "Hold expirado" : "Hold liberado",
    payload.reason === "expired"
      ? "O prazo do hold acabou e o slot foi liberado."
      : "O hold foi cancelado manualmente antes do pagamento."
  );

  const refreshed = await getAppointmentById(saved.id);
  if (!refreshed) {
    throw new Error("Agendamento não encontrado após liberar hold.");
  }

  return mapAppointmentToHoldResponse(refreshed);
}
