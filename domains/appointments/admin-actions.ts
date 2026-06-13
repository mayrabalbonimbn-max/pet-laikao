import { z } from "zod";

import { upsertServiceRecord } from "@/server/repositories/appointment-repository";

const serviceSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  description: z.string().min(4),
  durationMinutes: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
  petSpecies: z.enum(["dog", "cat", "other", "all"]).optional(),
  petSize: z.enum(["small", "medium", "large", "giant", "all"]).optional()
});

export async function upsertAdminServiceAction(input: unknown) {
  const payload = serviceSchema.parse(input);
  await upsertServiceRecord({
    ...payload,
    petSpecies: payload.petSpecies === "all" ? null : payload.petSpecies,
    petSize: payload.petSize === "all" ? null : payload.petSize
  });
}
