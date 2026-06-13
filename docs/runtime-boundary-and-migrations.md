# Fronteira runtime e migrations

Este projeto ainda tem dois runtimes de backend:

- Next.js na raiz, hoje responsavel pelas rotas reais em `/api/*`, server actions, repositories e acesso Prisma usado pelo site e pelo admin em producao.
- NestJS em `api/`, hoje preparado como API propria em `/apiv2`, com `auth` e leitura basica de servicos de agenda implementados. Os demais modulos ainda sao estruturais.

## Decisao operacional atual

PostgreSQL via Prisma e a fonte principal do sistema. O runtime normal nao deve criar schema SQLite, rodar seed automatico em leitura, nem normalizar dados ao listar telas publicas ou administrativas.

Dados de catalogo, servicos, agenda, pedidos, pagamentos, financeiro e admin devem vir do banco real. Se faltar dado, a tela deve mostrar estado vazio honesto ou bloquear a acao, em vez de inserir exemplos automaticamente.

## Proxima migracao para Nest

Migrar sem big bang:

1. `appointments`: expor no Nest os mesmos contratos hoje usados por `/api/appointments/bootstrap`, `/api/appointments/availability`, `/api/appointments/hold`, `/api/appointments/:id/payment-intent` e `/api/appointments/:id/pay-balance`.
2. `catalog`: migrar leitura publica de categorias/produtos e CRUD admin depois que appointments estiver estavel.
3. `promotions` e `uploads`: migrar juntos para manter imagens e campanhas consistentes.
4. Depois: `orders`, `payments`, `inventory`, `finance`, `reports`, `notifications`.

Durante a transicao, o Next continua sendo a borda publica. Cada rota migra por contrato, com compatibilidade de payload antes de trocar a chamada.

## Migrations versionadas

Nao usar `prisma db push` como pratica normal. O caminho seguro e:

1. Criar migration sem aplicar em producao:
   ```bash
   npm run db:migrate:create -- --name nome_da_migration
   ```
2. Revisar o SQL gerado em `prisma/migrations/*/migration.sql`.
3. Testar contra banco separado, por exemplo `laikao_dev`.
4. Aplicar em producao somente depois de revisao:
   ```bash
   npm run db:deploy
   ```

Proibido usar `prisma migrate reset` contra producao.
