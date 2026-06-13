import { storageConfig } from "@/config/storage";
import { LocalProductImageStorage } from "@/server/storage/local-product-image-storage";
import { ProductImageStorage } from "@/server/storage/types";

let singleton: ProductImageStorage | null = null;

export function getProductImageStorage(): ProductImageStorage {
  if (singleton) return singleton;

  switch (storageConfig.provider) {
    case "local":
    default:
      singleton = new LocalProductImageStorage();
      break;
  }

  return singleton;
}

