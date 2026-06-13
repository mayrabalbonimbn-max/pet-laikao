import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando server/repositories/promotion-repository.ts do Next.
 */
@Injectable()
export class PromotionsService {
  status() {
    return { module: "promotions", status: "planned" as const };
  }
}
