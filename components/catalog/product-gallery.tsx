"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { ProductImageRecord } from "@/domains/catalog/types";

export function ProductGallery({
  images,
  fallbackLabel,
  categoryName,
  productName,
  fallbackImageUrl,
  featured,
  hasDiscount
}: {
  images: ProductImageRecord[];
  fallbackLabel: string;
  categoryName?: string;
  productName: string;
  fallbackImageUrl?: string;
  featured?: boolean;
  hasDiscount?: boolean;
}) {
  const orderedImages = useMemo(
    () => [...images].sort((left, right) => left.displayOrder - right.displayOrder),
    [images]
  );
  const [selectedImageId, setSelectedImageId] = useState(orderedImages.find((image) => image.isPrimary)?.id ?? orderedImages[0]?.id ?? "");
  const selectedImage = orderedImages.find((image) => image.id === selectedImageId) ?? orderedImages[0];

  return (
    <div className="space-y-4">
      <div className="relative min-h-[24rem] overflow-hidden rounded-[26px] bg-white shadow-[0_18px_44px_rgba(43,14,70,0.12)] ring-1 ring-brand-100 sm:min-h-[31rem]">
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          {featured ? <span className="promo-badge-hot">Mais vendido</span> : null}
          {hasDiscount ? <span className="promo-badge">Oferta</span> : null}
        </div>
        {selectedImage ? (
          <Image src={selectedImage.imageUrl} alt={selectedImage.alt || productName} fill className="object-cover" priority sizes="(min-width: 1280px) 50vw, 100vw" />
        ) : fallbackImageUrl ? (
          <Image src={fallbackImageUrl} alt={productName} fill className="object-cover" priority sizes="(min-width: 1280px) 50vw, 100vw" />
        ) : (
          <div className="flex h-full min-h-[24rem] items-center justify-center bg-[linear-gradient(135deg,#fff9f2_0%,#f5e9ff_100%)] p-8 text-center sm:min-h-[31rem]">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--magenta-600)]">{categoryName ?? "Laikao"}</p>
              <p className="mt-4 font-heading text-3xl font-extrabold text-brand-900">{fallbackLabel}</p>
            </div>
          </div>
        )}
      </div>

      {orderedImages.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {orderedImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImageId(image.id)}
              className={[
                "relative min-h-24 overflow-hidden rounded-[18px] bg-white shadow-[var(--shadow-soft)] ring-1 transition-all",
                image.id === selectedImage?.id ? "ring-2 ring-[var(--magenta-600)]" : "ring-brand-100 hover:ring-brand-300"
              ].join(" ")}
            >
              <Image src={image.imageThumbUrl} alt={image.alt} fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[fallbackLabel, categoryName ?? "Catalogo", "Produto"].map((label, index) => (
            <div key={`${label}-${index}`} className="flex min-h-24 items-center justify-center rounded-[18px] bg-white p-3 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-brand-900 shadow-[var(--shadow-soft)] ring-1 ring-brand-100">
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
