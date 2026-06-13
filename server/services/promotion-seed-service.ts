import { db } from "@/server/db/client";
import { cleanupLegacyDemoData } from "@/server/services/demo-data-hygiene-service";

declare global {
  // eslint-disable-next-line no-var
  var __laikaoPromotionSeeded: boolean | undefined;
}

export async function ensurePromotionSeedData() {
  if (global.__laikaoPromotionSeeded) {
    return;
  }

  await cleanupLegacyDemoData();

  global.__laikaoPromotionSeeded = true;
}
