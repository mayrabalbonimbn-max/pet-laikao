import { z } from "zod";

const optionalDateTime = z.string().datetime().optional();

export const promotionItemInputSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  title: z.string().min(1).max(140).optional(),
  description: z.string().max(600).optional(),
  customPriceLabel: z.string().max(40).optional(),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true)
});

export const promotionBannerInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(120),
  subtitle: z.string().max(220).optional(),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  imageThumbUrl: z.string().url().optional(),
  imageThumbPath: z.string().optional(),
  imageAlt: z.string().max(120).optional(),
  imageMimeType: z.string().optional(),
  imageSizeBytes: z.number().int().min(0).optional(),
  imageWidth: z.number().int().min(1).optional(),
  imageHeight: z.number().int().min(1).optional(),
  mobileImageUrl: z.string().url().optional(),
  ctaLabel: z.string().max(40).optional(),
  ctaLink: z.string().max(500).optional(),
  placement: z.enum(["home_hero", "home_strip", "promotions_page", "campaign"]),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  startsAt: optionalDateTime,
  endsAt: optionalDateTime
});

export const promotionUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(3).max(140),
  title: z.string().min(2).max(140),
  description: z.string().max(1000).optional(),
  type: z.enum(["campaign", "product", "service", "mixed"]),
  status: z.enum(["draft", "scheduled", "active", "expired", "paused"]),
  startsAt: optionalDateTime,
  endsAt: optionalDateTime,
  priority: z.number().int().min(0).max(999).default(0),
  highlightedOnHome: z.boolean().default(false),
  ctaLabel: z.string().max(40).optional(),
  ctaLink: z.string().max(500).optional(),
  campaignTag: z.string().max(60).optional(),
  active: z.boolean().default(true),
  items: z.array(promotionItemInputSchema).default([]),
  banners: z.array(promotionBannerInputSchema).default([])
});
