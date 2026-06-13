-- Migration manual: adiciona a coluna "brand" (marca) ao produto.
-- Nao destrutiva: coluna de texto opcional (nullable), sem default e sem mexer em dados.
-- Revisar e aplicar primeiro em laikao_dev, depois em producao (npm run db:deploy ou psql).
--
-- Reversao, se preciso:
--   ALTER TABLE "Product" DROP COLUMN "brand";

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brand" TEXT;
