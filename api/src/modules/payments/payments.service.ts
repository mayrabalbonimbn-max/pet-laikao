import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando server/repositories/payment-repository.ts + server/services/payments do Next.
 */
@Injectable()
export class PaymentsService {
  status() {
    return { module: "payments", status: "planned" as const };
  }
}
