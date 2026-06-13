import { db } from "@/server/db/client";
import { ensureSqliteDatabaseSchema } from "@/server/db/bootstrap";
import {
  appointmentServicesSeed,
  availabilityRulesSeed
} from "@/domains/appointments/constants";
import { cleanupLegacyDemoData } from "@/server/services/demo-data-hygiene-service";

declare global {
  // eslint-disable-next-line no-var
  var __laikaoAppointmentSeedPromise: Promise<void> | undefined;
}

async function seed() {
  await ensureSqliteDatabaseSchema();
  await cleanupLegacyDemoData();

  await db.$transaction(async (tx) => {
    for (const service of appointmentServicesSeed) {
      await tx.appointmentService.upsert({
        where: { id: service.id },
        update: {},
        create: service
      });
    }

    for (const rule of availabilityRulesSeed) {
      await tx.availabilityRule.upsert({
        where: { id: rule.id },
        update: {},
        create: rule
      });
    }
  });
}

export async function ensureAppointmentSeedData() {
  if (!global.__laikaoAppointmentSeedPromise) {
    global.__laikaoAppointmentSeedPromise = seed();
  }

  await global.__laikaoAppointmentSeedPromise;
}
