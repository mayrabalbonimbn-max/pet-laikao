import { z } from "zod";

export const calendarViewSchema = z.enum(["month", "week", "day"]);

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1),
  selectedDate: z.string().min(10),
  view: calendarViewSchema
});

export const appointmentHoldSchema = z.object({
  serviceId: z.string().min(1),
  selectedStartAt: z.string().datetime(),
  paymentOption: z.enum(["deposit_50", "full_100"]),
  paymentMethod: z.enum(["pix", "credit_card"]).default("pix"),
  customerId: z.string().optional(),
  petId: z.string().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().email().optional().or(z.literal("")),
  petName: z.string().min(2),
  petSpecies: z.enum(["dog", "cat", "other"]),
  petSize: z.enum(["small", "medium", "large", "giant"]),
  petBreed: z.string().optional()
});

export const releaseHoldSchema = z.object({
  appointmentId: z.string().min(1),
  reason: z.enum(["expired", "cancelled"]).default("expired")
});
