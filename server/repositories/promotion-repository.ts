import { randomUUID } from "node:crypto";

import { db } from "@/server/db/client";
import { LEGACY_DEMO_PROMOTION_IDS } from "@/server/services/demo-data-hygiene-service";

function nextId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

export async function listPromotionRecords() {
  return db.promotion.findMany({
    where: {
      id: { notIn: LEGACY_DEMO_PROMOTION_IDS }
    },
    include: {
      items: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      },
      banners: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      }
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }]
  });
}

export async function getPromotionRecordById(id: string) {
  if (LEGACY_DEMO_PROMOTION_IDS.includes(id)) {
    return null;
  }

  return db.promotion.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      },
      banners: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });
}

export async function upsertPromotionRecord(input: {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  priority: number;
  highlightedOnHome: boolean;
  ctaLabel?: string;
  ctaLink?: string;
  campaignTag?: string;
  active: boolean;
  items: Array<{
    id?: string;
    productId?: string;
    serviceId?: string;
    title?: string;
    description?: string;
    customPriceLabel?: string;
    displayOrder: number;
    active: boolean;
  }>;
  banners: Array<{
    id?: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    imagePath?: string;
    imageThumbUrl?: string;
    imageThumbPath?: string;
    imageAlt?: string;
    imageMimeType?: string;
    imageSizeBytes?: number;
    imageWidth?: number;
    imageHeight?: number;
    mobileImageUrl?: string;
    ctaLabel?: string;
    ctaLink?: string;
    placement: string;
    displayOrder: number;
    active: boolean;
    startsAt?: string;
    endsAt?: string;
  }>;
}) {
  const promotionId = input.id ?? nextId("promo");

  await db.$transaction(async (tx) => {
    await tx.promotion.upsert({
      where: { id: promotionId },
      update: {
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        status: input.status,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        priority: input.priority,
        highlightedOnHome: input.highlightedOnHome,
        ctaLabel: input.ctaLabel ?? null,
        ctaLink: input.ctaLink ?? null,
        campaignTag: input.campaignTag ?? null,
        active: input.active
      },
      create: {
        id: promotionId,
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        status: input.status,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        priority: input.priority,
        highlightedOnHome: input.highlightedOnHome,
        ctaLabel: input.ctaLabel ?? null,
        ctaLink: input.ctaLink ?? null,
        campaignTag: input.campaignTag ?? null,
        active: input.active
      }
    });

    const incomingItemIds = input.items.map((item) => item.id).filter((id): id is string => Boolean(id));
    await tx.promotionItem.deleteMany({
      where: {
        promotionId,
        ...(incomingItemIds.length > 0 ? { id: { notIn: incomingItemIds } } : {})
      }
    });

    for (const item of input.items) {
      await tx.promotionItem.upsert({
        where: { id: item.id ?? `promoitem-${randomUUID()}` },
        update: {
          productId: item.productId ?? null,
          serviceId: item.serviceId ?? null,
          title: item.title ?? null,
          description: item.description ?? null,
          customPriceLabel: item.customPriceLabel ?? null,
          displayOrder: item.displayOrder,
          active: item.active
        },
        create: {
          id: item.id ?? `promoitem-${randomUUID()}`,
          promotionId,
          productId: item.productId ?? null,
          serviceId: item.serviceId ?? null,
          title: item.title ?? null,
          description: item.description ?? null,
          customPriceLabel: item.customPriceLabel ?? null,
          displayOrder: item.displayOrder,
          active: item.active
        }
      });
    }

    const incomingBannerIds = input.banners.map((banner) => banner.id).filter((id): id is string => Boolean(id));
    await tx.promotionBanner.deleteMany({
      where: {
        promotionId,
        ...(incomingBannerIds.length > 0 ? { id: { notIn: incomingBannerIds } } : {})
      }
    });

    for (const banner of input.banners) {
      await tx.promotionBanner.upsert({
        where: { id: banner.id ?? `promobn-${randomUUID()}` },
        update: {
          title: banner.title,
          subtitle: banner.subtitle ?? null,
          imageUrl: banner.imageUrl ?? null,
          imagePath: banner.imagePath ?? null,
          imageThumbUrl: banner.imageThumbUrl ?? null,
          imageThumbPath: banner.imageThumbPath ?? null,
          imageAlt: banner.imageAlt ?? null,
          imageMimeType: banner.imageMimeType ?? null,
          imageSizeBytes: banner.imageSizeBytes ?? null,
          imageWidth: banner.imageWidth ?? null,
          imageHeight: banner.imageHeight ?? null,
          mobileImageUrl: banner.mobileImageUrl ?? null,
          ctaLabel: banner.ctaLabel ?? null,
          ctaLink: banner.ctaLink ?? null,
          placement: banner.placement,
          displayOrder: banner.displayOrder,
          active: banner.active,
          startsAt: banner.startsAt ? new Date(banner.startsAt) : null,
          endsAt: banner.endsAt ? new Date(banner.endsAt) : null
        },
        create: {
          id: banner.id ?? `promobn-${randomUUID()}`,
          promotionId,
          title: banner.title,
          subtitle: banner.subtitle ?? null,
          imageUrl: banner.imageUrl ?? null,
          imagePath: banner.imagePath ?? null,
          imageThumbUrl: banner.imageThumbUrl ?? null,
          imageThumbPath: banner.imageThumbPath ?? null,
          imageAlt: banner.imageAlt ?? null,
          imageMimeType: banner.imageMimeType ?? null,
          imageSizeBytes: banner.imageSizeBytes ?? null,
          imageWidth: banner.imageWidth ?? null,
          imageHeight: banner.imageHeight ?? null,
          mobileImageUrl: banner.mobileImageUrl ?? null,
          ctaLabel: banner.ctaLabel ?? null,
          ctaLink: banner.ctaLink ?? null,
          placement: banner.placement,
          displayOrder: banner.displayOrder,
          active: banner.active,
          startsAt: banner.startsAt ? new Date(banner.startsAt) : null,
          endsAt: banner.endsAt ? new Date(banner.endsAt) : null
        }
      });
    }
  });

  return getPromotionRecordById(promotionId);
}
