import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando app/api/admin/reports/annual do Next.
 */
@Injectable()
export class ReportsService {
  status() {
    return { module: "reports", status: "planned" as const };
  }
}
