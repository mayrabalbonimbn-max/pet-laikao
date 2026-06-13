import { z } from "zod";

import { ProductStatus } from "@/domains/catalog/types";
import { updateProductAdminRecord, upsertCategoryRecord } from "@/server/repositories/commerce-repository";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  active: z.boolean(),
  displayOrder: z.number().int().nonnegative()
});

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(4),
  categoryId: z.string().optional(),
  status: z.custom<ProductStatus>((value) => ["draft", "active", "out_of_stock", "archived"].includes(String(value))),
  featured: z.boolean(),
  active: z.boolean(),
  imageLabel: z.string().min(2),
  mainImageUrl: z.string().optional(),
  images: z.array(z.object({
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
  })).optional(),
  variantPriceCents: z.number().int().nonnegative(),
  variantStockQuantity: z.number().int().nonnegative()
});

export async function upsertCategoryAction(input: unknown) {
  const payload = categorySchema.parse(input);
  await upsertCategoryRecord(payload);
}

export async function updateProductAdminAction(input: unknown) {
  const payload = productSchema.parse(input);
  await updateProductAdminRecord(payload);
}
