import { z } from "zod";

import { ProductStatus } from "@/domains/catalog/types";
import {
  createProductRecord,
  updateProductAdminRecord,
  upsertCategoryRecord,
  upsertProductBySlugRecord
} from "@/server/repositories/commerce-repository";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  active: z.boolean(),
  displayOrder: z.number().int().nonnegative()
});

const productImageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1),
  imagePath: z.string().min(1),
  imageThumbUrl: z.string().min(1),
  imageThumbPath: z.string().min(1),
  alt: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  displayOrder: z.number().int().nonnegative(),
  isPrimary: z.boolean()
});

const productStatusSchema = z.custom<ProductStatus>((value) =>
  ["draft", "active", "out_of_stock", "archived"].includes(String(value))
);

const baseProductShape = {
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "O slug aceita apenas letras minusculas, numeros e hifen."),
  brand: z.string().optional(),
  description: z.string().min(4),
  categoryId: z.string().optional(),
  status: productStatusSchema,
  featured: z.boolean(),
  active: z.boolean(),
  imageLabel: z.string().min(2),
  mainImageUrl: z.string().optional(),
  images: z.array(productImageSchema).optional(),
  variantPriceCents: z.number().int().nonnegative(),
  variantCompareAtCents: z.number().int().nonnegative().optional(),
  variantStockQuantity: z.number().int().nonnegative()
};

const updateProductSchema = z.object({ id: z.string().min(1), ...baseProductShape });
const createProductSchema = z.object({ id: z.string().optional(), ...baseProductShape });

export const productWriteSchema = createProductSchema;

export async function upsertCategoryAction(input: unknown) {
  const payload = categorySchema.parse(input);
  await upsertCategoryRecord(payload);
}

export async function updateProductAdminAction(input: unknown) {
  const payload = updateProductSchema.parse(input);
  await updateProductAdminRecord(payload);
}

export async function createProductAdminAction(input: unknown) {
  const payload = createProductSchema.parse(input);
  return createProductRecord(payload);
}

export async function upsertProductBySlugAction(input: unknown) {
  const payload = createProductSchema.parse(input);
  return upsertProductBySlugRecord(payload);
}
