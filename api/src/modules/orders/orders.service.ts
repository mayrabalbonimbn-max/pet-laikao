import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando server/repositories/order-repository.ts do Next.
 */
@Injectable()
export class OrdersService {
  status() {
    return { module: "orders", status: "planned" as const };
  }
}
