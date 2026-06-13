import { db } from "@/server/db/client";
import { transitionAppointment } from "@/domains/appointments/state-machine";
import { AppointmentRecord } from "@/domains/appointments/types";

declare global {
  // eslint-disable-next-line no-var
  var __laikaoHoldWorkerStarted: boolean | undefined;
}

function canRunWorker() {
  return process.env.NODE_ENV !== "test";
}

export async function expireAppointmentHoldsBatch() {
  const expiredHolds = await db.appointmentHold.findMany({
    where: {
      status: "active",
      expiresAt: {
        lte: new Date()
      }
    },
    include: {
      appointment: {
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
      }
    }
  });

  for (const hold of expiredHolds) {
    if (hold.appointment.status !== "hold_pending_payment") {
      await db.appointmentHold.update({
        where: { id: hold.id },
        data: {
          status: "expired",
          releasedAt: new Date()
        }
      });
      continue;
    }

    const activeHold = hold.appointment.holds.find((entry) => entry.status === "active");
    const appointmentRecord: AppointmentRecord = {
      id: hold.appointment.id,
      serviceId: hold.appointment.serviceId,
      serviceName: hold.appointment.service.name,
      customerId: hold.appointment.customerId,
      customerName: hold.appointment.customer.fullName,
      customerPhone: hold.appointment.customer.phone,
      customerEmail: hold.appointment.customer.email ?? undefined,
      petId: hold.appointment.petId,
      petName: hold.appointment.pet.name,
      petSpecies: hold.appointment.pet.species as AppointmentRecord["petSpecies"],
      petSize: hold.appointment.pet.size as AppointmentRecord["petSize"],
      scheduledStartAt: hold.appointment.scheduledStartAt.toISOString(),
      scheduledEndAt: hold.appointment.scheduledEndAt.toISOString(),
      status: hold.appointment.status as AppointmentRecord["status"],
      paymentStatus: hold.appointment.paymentStatus as AppointmentRecord["paymentStatus"],
      paymentOption: hold.appointment.paymentOption as AppointmentRecord["paymentOption"],
      paymentMethod: hold.appointment.paymentMethod as AppointmentRecord["paymentMethod"],
      amountDueCents: hold.appointment.amountDueCents,
      amountPaidCents: hold.appointment.amountPaidCents,
      amountBalanceCents: hold.appointment.amountBalanceCents,
      holdExpiresAt: activeHold?.expiresAt.toISOString(),
      createdAt: hold.appointment.createdAt.toISOString(),
      updatedAt: hold.appointment.updatedAt.toISOString(),
      timeline: hold.appointment.timeline.map((entry) => ({
        id: entry.id,
        label: entry.label,
        description: entry.description,
        createdAt: entry.createdAt.toISOString()
      }))
    };

    const transitioned = transitionAppointment(
      appointmentRecord,
      { type: "payment_expired" }
    );

    await db.$transaction([
      db.appointment.update({
        where: { id: hold.appointmentId },
        data: {
          status: transitioned.status,
          paymentStatus: transitioned.paymentStatus,
          updatedAt: new Date()
        }
      }),
      db.appointmentHold.update({
        where: { id: hold.id },
        data: {
          status: "expired",
          releasedAt: new Date()
        }
      }),
      db.appointmentTimeline.create({
        data: {
          id: `tl-exp-${hold.id}-${Date.now()}`,
          appointmentId: hold.appointmentId,
          label: "Hold expirado",
          description: "O prazo do hold acabou e o slot foi liberado automaticamente.",
          createdAt: new Date()
        }
      })
    ]);
  }
}

export function ensureAppointmentHoldWorker() {
  if (!canRunWorker() || global.__laikaoHoldWorkerStarted) {
    return;
  }

  global.__laikaoHoldWorkerStarted = true;

  void expireAppointmentHoldsBatch();
  setInterval(() => {
    void expireAppointmentHoldsBatch();
  }, 15_000);
}
