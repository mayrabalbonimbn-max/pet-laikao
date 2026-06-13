import { storageConfig } from "@/config/storage";
import { LocalPromotionImageStorage } from "@/server/storage/local-promotion-image-storage";
import { PromotionImageStorage } from "@/server/storage/types";

let singleton: PromotionImageStorage | null = null;

export function getPromotionImageStorage(): PromotionImageStorage {
  if (singleton) {
    return singleton;
  }

  switch (storageConfig.provider) {
    case "local":
    default:
      singleton = new LocalPromotionImageStorage();
      return singleton;
  }
}
