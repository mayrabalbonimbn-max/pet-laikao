import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando notifications/ + domains/notifications do Next.
 */
@Injectable()
export class NotificationsService {
  status() {
    return { module: "notifications", status: "planned" as const };
  }
}
