import { Injectable } from "@nestjs/common";

/**
 * Esqueleto. Sera implementado na sua fase, reaproveitando server/storage/* do Next.
 */
@Injectable()
export class UploadsService {
  status() {
    return { module: "uploads", status: "planned" as const };
  }
}
