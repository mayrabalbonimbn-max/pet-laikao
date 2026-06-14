/**
 * Conteúdo de apresentação dos serviços (categoria, "a partir de", tabelas).
 *
 * Os dados do serviço em si (nome, descrição, preço, duração, ativo) vivem no
 * banco, via cadastro em scripts/seed-services.ts e no admin de serviços.
 * Aqui ficam apenas os complementos de vitrine que não são colunas do modelo:
 * a categoria (Banho ou Tosa), se o preço é "a partir de", a tabela de banho
 * por porte e os níveis da tosa comercial.
 *
 * Fonte de verdade do conteúdo: servicos-laikao.md.
 */

export type ServiceCategory = "Banho" | "Tosa";

export type ServiceCatalogMeta = {
  category: ServiceCategory;
  priceFrom: boolean;
};

/** Categoria e regra de preço por slug de serviço. */
export const serviceCatalogMeta: Record<string, ServiceCatalogMeta> = {
  banho: { category: "Banho", priceFrom: true },
  "tosa-bebe": { category: "Tosa", priceFrom: true },
  "tosa-trimming": { category: "Tosa", priceFrom: true },
  "tosa-baixa": { category: "Tosa", priceFrom: true },
  "tosa-comercial": { category: "Tosa", priceFrom: true },
  "tosa-higienica": { category: "Tosa", priceFrom: true },
  "tosa-asiatica": { category: "Tosa", priceFrom: true }
};

export function getServiceMeta(slug: string): ServiceCatalogMeta {
  return serviceCatalogMeta[slug] ?? { category: "Tosa", priceFrom: true };
}

/** Tabela de banho "a partir de" por porte (servicos-laikao.md, seção 1). */
export const bathPriceTable: { porte: string; fromReais: number }[] = [
  { porte: "Porquinho da índia", fromReais: 45 },
  { porte: "Pinscher (mini)", fromReais: 50 },
  { porte: "Shih Tzu, Bulldog Francês, Dachshund", fromReais: 60 },
  { porte: "Dachshund pelo longo, gato", fromReais: 65 },
  { porte: "Beagle, Bulldog Inglês, Basset, gato Persa", fromReais: 70 },
  { porte: "Dálmata", fromReais: 75 },
  { porte: "American Bully, Boxer", fromReais: 85 },
  { porte: "Pitbull, Weimaraner", fromReais: 95 },
  { porte: "Dog Alemão, Cane Corso, Pastor Alemão", fromReais: 115 }
];

export const bathIncludesNote =
  "Todo banho inclui limpeza de ouvidos e corte de unhas. O valor final depende do porte, da raça e da pelagem, e é confirmado no agendamento.";

/** Níveis da tosa comercial (servicos-laikao.md, seção 2). */
export const commercialTosaTiers: { nome: string; fromReais: number }[] = [
  { nome: "Zero", fromReais: 100 },
  { nome: "Média", fromReais: 110 },
  { nome: "Alta na tesoura", fromReais: 130 }
];

export const BATH_SERVICE_SLUG = "banho";
export const COMMERCIAL_TOSA_SLUG = "tosa-comercial";
