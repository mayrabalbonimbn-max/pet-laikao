import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

/**
 * Etapa atual: somente leitura publica de servicos (paridade com
 * listPublicServices do Next). O fluxo transacional de agenda (holds,
 * disponibilidade, agendamento) permanece no Next ate ser migrado.
 */
@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicServices() {
    const services = await this.prisma.appointmentService.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    });

    return services.map((service) => ({
      slug: service.slug,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      petSpecies: service.petSpecies,
      petSize: service.petSize
    }));
  }
}
