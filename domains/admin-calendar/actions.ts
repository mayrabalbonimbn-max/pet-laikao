import { z } from "zod";

import { adminCalendarCategoryColors } from "@/domains/admin-calendar/types";
import { createAdminCalendarEventRecord } from "@/server/repositories/admin-calendar-repository";

const calendarEventSchema = z.object({
  serviceId: z.string().optional(),
  title: z.string().min(2),
  category: z.enum(["bath_grooming", "personal", "block", "pickup_delivery", "internal_admin"]),
  customerName: z.string().optional(),
  petName: z.string().optional(),
  notes: z.string().optional(),
  startsAt: z.string().min(10),
  endsAt: z.string().min(10),
  impactAvailability: z.boolean(),
  isAllDay: z.boolean().default(false),
  sourceType: z.string().default("admin_manual")
});

export async function createAdminCalendarEventAction(input: unknown) {
  const payload = calendarEventSchema.parse(input);
  await createAdminCalendarEventRecord({
    ...payload,
    colorToken: adminCalendarCategoryColors[payload.category]
  });
}
