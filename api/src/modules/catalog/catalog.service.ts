import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na fase 3 (produtos, categorias, servicos),
 * reaproveitando server/repositories/commerce-repository.ts do Next.
 */
@Injectable()
export class CatalogService {
  status() {
    return { module: "catalog", status: "planned" as const };
  }
}
