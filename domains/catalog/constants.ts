import {
  CategoryRecord,
  InventoryMovementType,
  ProductStatus,
  StockStatus
} from "@/domains/catalog/types";

export const stockStatusLabels: Record<StockStatus, string> = {
  in_stock: "Em estoque",
  low_stock: "Estoque baixo",
  out_of_stock: "Sem estoque",
  reserved: "Reservado"
};

export const productStatusLabels: Record<ProductStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  out_of_stock: "Sem estoque",
  archived: "Arquivado"
};

export const inventoryMovementLabels: Record<InventoryMovementType, string> = {
  reserve: "Reserva",
  release: "Liberacao",
  decrement: "Baixa",
  adjustment: "Ajuste",
  restock: "Reposicao",
  entry: "Entrada",
  exit: "Saida"
};

export const categorySeed: CategoryRecord[] = [
  {
    id: "CAT-CACHORROS",
    name: "Cachorros",
    slug: "cachorros",
    description: "Produtos para cachorros.",
    active: true,
    displayOrder: 1
  },
  {
    id: "CAT-GATOS",
    name: "Gatos",
    slug: "gatos",
    description: "Produtos para gatos.",
    active: true,
    displayOrder: 2
  },
  {
    id: "CAT-RACOES",
    name: "Racoes",
    slug: "racoes",
    description: "Racoes para diferentes fases e portes.",
    active: true,
    displayOrder: 3
  },
  {
    id: "CAT-PETISCOS",
    name: "Petiscos",
    slug: "petiscos",
    description: "Petiscos e recompensas.",
    active: true,
    displayOrder: 4
  },
  {
    id: "CAT-HIGIENE-BELEZA",
    name: "Higiene e Beleza",
    slug: "higiene-beleza",
    description: "Banho, higiene e cuidado da pelagem.",
    active: true,
    displayOrder: 5
  },
  {
    id: "CAT-ACESSORIOS",
    name: "Acessorios",
    slug: "acessorios",
    description: "Guias, coleiras e utilidades.",
    active: true,
    displayOrder: 6
  },
  {
    id: "CAT-BRINQUEDOS",
    name: "Brinquedos",
    slug: "brinquedos",
    description: "Brinquedos para enriquecimento e diversao.",
    active: true,
    displayOrder: 7
  },
  {
    id: "CAT-MEDICAMENTOS",
    name: "Medicamentos",
    slug: "medicamentos",
    description: "Itens de saude e suporte.",
    active: true,
    displayOrder: 8
  },
  {
    id: "CAT-CASA",
    name: "Casa",
    slug: "casa",
    description: "Conforto e ambiente para o pet em casa.",
    active: true,
    displayOrder: 9
  }
];
