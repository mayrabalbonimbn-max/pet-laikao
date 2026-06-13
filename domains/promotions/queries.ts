import { listPromotionRecords } from "@/server/repositories/promotion-repository";
import { PromotionView } from "@/domains/promotions/types";

function mapPromotion(record: Awaited<ReturnType<typeof listPromotionRecords>>[number]): PromotionView {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description ?? undefined,
    type: record.type as PromotionView["type"],
    status: record.status as PromotionView["status"],
    startsAt: record.startsAt?.toISOString(),
    endsAt: record.endsAt?.toISOString(),
    priority: record.priority,
    highlightedOnHome: record.highlightedOnHome,
    ctaLabel: record.ctaLabel ?? undefined,
    ctaLink: record.ctaLink ?? undefined,
    campaignTag: record.campaignTag ?? undefined,
    active: record.active,
    items: record.items.map((item) => ({
      id: item.id,
      productId: item.productId ?? undefined,
      serviceId: item.serviceId ?? undefined,
      title: item.title ?? undefined,
      description: item.description ?? undefined,
      customPriceLabel: item.customPriceLabel ?? undefined,
      displayOrder: item.displayOrder,
      active: item.active
    })),
    banners: record.banners.map((banner) => ({
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
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function isWithinSchedule(startsAt?: string, endsAt?: string) {
  const now = Date.now();
  const startOk = !startsAt || new Date(startsAt).getTime() <= now;
  const endOk = !endsAt || new Date(endsAt).getTime() >= now;
  return startOk && endOk;
}

export async function listAdminPromotions() {
  const records = await listPromotionRecords();
  return records.map(mapPromotion);
}

export async function listActivePromotions() {
  const promotions = await listAdminPromotions();
  return promotions.filter((promotion) => {
    if (!promotion.active) return false;
    if (promotion.status !== "active" && promotion.status !== "scheduled") return false;
    return isWithinSchedule(promotion.startsAt, promotion.endsAt);
  });
}

export async function listHomeHighlightedPromotions() {
  const promotions = await listActivePromotions();
  return promotions
    .filter((promotion) => promotion.highlightedOnHome)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
}

export async function listActivePromotionBanners(placement: string) {
  const promotions = await listActivePromotions();
  return promotions
    .flatMap((promotion) =>
      promotion.banners.filter(
        (banner) => banner.active && banner.placement === placement && isWithinSchedule(banner.startsAt, banner.endsAt)
      )
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
