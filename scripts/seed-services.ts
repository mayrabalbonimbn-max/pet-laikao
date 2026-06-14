/**
 * Cadastro idempotente dos serviços reais de banho e tosa.
 *
 * Uso:
 *   npm run services:seed
 *
 * - Idempotente: faz upsert por id (rodar de novo não duplica nem zera dados).
 * - Roda FORA do runtime (comando manual). Teste em laikao_dev antes de produção.
 * - Fonte de verdade do conteúdo: servicos-laikao.md.
 *
 * O que faz:
 *   1. Cadastra/atualiza os serviços reais (config em domains/appointments/constants.ts).
 *      Serviços sem preço confirmado entram inativos (não aparecem na vitrine nem na agenda).
 *   2. Desativa serviços placeholder antigos (preço/duração fictícios). Não apaga,
 *      pra preservar o histórico de agendamentos que apontam pra eles.
 *
 * Observação: duração fica em 0 ("a confirmar") de propósito. Os minutos reais
 * serão definidos na fase da agenda; não inventamos esse dado aqui.
 */
import { appointmentServicesSeed, retiredServiceIds } from "@/domains/appointments/constants";
import { db } from "@/server/db/client";

async function main() {
  console.log("Cadastro de serviços (banho e tosa)\n");

  for (const service of appointmentServicesSeed) {
    const data = {
      slug: service.slug,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      active: service.active,
      displayOrder: service.displayOrder,
      petSpecies: service.petSpecies ?? null,
      petSize: service.petSize ?? null
    };

    await db.appointmentService.upsert({
      where: { id: service.id },
      update: { ...data, updatedAt: new Date() },
      create: { id: service.id, ...data }
    });

    const status = service.active
      ? service.priceCents > 0
        ? `ativo, a partir de R$ ${(service.priceCents / 100).toFixed(2)}`
        : "ativo (sem preço)"
      : "INATIVO (preço a confirmar)";
    const duracao = service.durationMinutes > 0 ? `${service.durationMinutes} min` : "duração a confirmar";
    console.log(`  ok  ${service.name} (${service.slug}) - ${status}, ${duracao}`);
  }

  console.log("\nDesativando serviços placeholder antigos:");
  for (const id of retiredServiceIds) {
    const existing = await db.appointmentService.findUnique({ where: { id } });
    if (!existing) {
      console.log(`  --  ${id} não existe (nada a fazer)`);
      continue;
    }
    await db.appointmentService.update({
      where: { id },
      data: { active: false, updatedAt: new Date() }
    });
    console.log(`  ok  ${existing.name} (${id}) desativado`);
  }

  console.log("\nConcluído.");
}

main()
  .catch((error) => {
    console.error("Falha no cadastro de serviços:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
