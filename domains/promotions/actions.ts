import { promotionUpsertSchema } from "@/domains/promotions/schema";
import { getPromotionRecordById, upsertPromotionRecord } from "@/server/repositories/promotion-repository";

export async function upsertPromotionAction(payload: unknown) {
  const input = promotionUpsertSchema.parse(payload);
  const promotion = await upsertPromotionRecord(input);

  if (!promotion) {
    throw new Error("Falha ao persistir promocao.");
  }

  return promotion;
}

export async function togglePromotionActiveAction(id: string, active: boolean) {
  const promotion = await getPromotionRecordById(id);
  if (!promotion) {
    throw new Error("Promocao nao encontrada.");
  }

  return upsertPromotionRecord({
    id: promotion.id,
    slug: promotion.slug,
    title: promotion.title,
    description: promotion.description ?? undefined,
    type: promotion.type,
    status: promotion.status,
    startsAt: promotion.startsAt?.toISOString(),
    endsAt: promotion.endsAt?.toISOString(),
    priority: promotion.priority,
    highlightedOnHome: promotion.highlightedOnHome,
    ctaLabel: promotion.ctaLabel ?? undefined,
    ctaLink: promotion.ctaLink ?? undefined,
    campaignTag: promotion.campaignTag ?? undefined,
    active,
    items: promotion.items.map((item) => ({
      id: item.id,
      productId: item.productId ?? undefined,
      serviceId: item.serviceId ?? undefined,
      title: item.title ?? undefined,
      description: item.description ?? undefined,
      customPriceLabel: item.customPriceLabel ?? undefined,
      displayOrder: item.displayOrder,
      active: item.active
    })),
    banners: promotion.banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle ?? undefined,
      imageUrl: banner.imageUrl ?? undefined,
      imagePath: banner.imagePath ?? undefined,
      imageThumbUrl: banner.imageThumbUrl ?? undefined,
      imageThumbPath: banner.imageThumbPath ?? undefined,
      imageAlt: banner.imageAlt ?? undefined,
      imageMimeType: banner.imageMimeType ?? undefined,
      imageSizeBytes: banner.imageSizeBytes ?? undefined,
      imageWidth: banner.imageWidth ?? undefined,
      imageHeight: banner.imageHeight ?? undefined,
      mobileImageUrl: banner.mobileImageUrl ?? undefined,
      ctaLabel: banner.ctaLabel ?? undefined,
      ctaLink: banner.ctaLink ?? undefined,
      placement: banner.placement,
      displayOrder: banner.displayOrder,
      active: banner.active,
      startsAt: banner.startsAt?.toISOString(),
      endsAt: banner.endsAt?.toISOString()
    }))
  });
}
