import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando server/repositories/inventory-admin-repository.ts do Next.
 */
@Injectable()
export class InventoryService {
  status() {
    return { module: "inventory", status: "planned" as const };
  }
}
