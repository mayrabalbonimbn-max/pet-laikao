export type PromotionKind = "campaign" | "product" | "service" | "mixed";
export type PromotionStatus = "draft" | "scheduled" | "active" | "expired" | "paused";

export type PromotionBannerView = {
  id: string;
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
};

export type PromotionItemView = {
  id: string;
  productId?: string;
  serviceId?: string;
  title?: string;
  description?: string;
  customPriceLabel?: string;
  displayOrder: number;
  active: boolean;
};

export type PromotionView = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: PromotionKind;
  status: PromotionStatus;
  startsAt?: string;
  endsAt?: string;
  priority: number;
  highlightedOnHome: boolean;
  ctaLabel?: string;
  ctaLink?: string;
  campaignTag?: string;
  active: boolean;
  items: PromotionItemView[];
  banners: PromotionBannerView[];
  createdAt: string;
  updatedAt: string;
};
