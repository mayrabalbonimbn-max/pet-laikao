import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando server/repositories/company-finance-repository.ts do Next.
 */
@Injectable()
export class FinanceService {
  status() {
    return { module: "finance", status: "planned" as const };
  }
}
