import path from "node:path";

import { getEnvOrDefault } from "@/lib/env";

export const storageConfig = {
  provider: getEnvOrDefault("STORAGE_PROVIDER", "local"),
  promotions: {
    maxUploadBytes: Number(getEnvOrDefault("PROMOTION_IMAGE_MAX_BYTES", String(8 * 1024 * 1024))),
    uploadRoot: path.join(process.cwd(), "public", "uploads", "promotions"),
    publicBaseUrl: "/uploads/promotions",
    main: {
      width: 1600,
      height: 900,
      quality: 82
    },
    thumb: {
      width: 480,
      height: 270,
      quality: 78
    }
  },
  products: {
    maxUploadBytes: Number(getEnvOrDefault("PRODUCT_IMAGE_MAX_BYTES", String(8 * 1024 * 1024))),
    uploadRoot: path.join(process.cwd(), "public", "uploads", "products"),
    publicBaseUrl: "/uploads/products",
    main: {
      width: 1200,
      height: 1200,
      quality: 84
    },
    thumb: {
      width: 480,
      height: 480,
      quality: 80
    }
  }
} as const;
