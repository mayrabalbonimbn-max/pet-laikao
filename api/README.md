# laikao-api (NestJS)

API propria do Pet Shop Laikao. Convive com o Next em producao: o Next continua
servindo o site, o admin e as rotas `/api/*` atuais; esta API sobe em paralelo na
porta `4018` e e exposta pelo nginx sob o prefixo `/apiv2` durante a transicao
(migracao rota a rota, sem big bang).

## Stack
- NestJS 10 (Express)
- Prisma 6 (schema compartilhado em `../prisma/schema.prisma`, mesmo PostgreSQL)
- npm (consistente com o repo e a VPS)

## Scripts
```bash
npm install
npm run prisma:generate   # gera o client a partir de ../prisma/schema.prisma
npm run build             # nest build -> dist/
npm run typecheck         # tsc --noEmit
npm run start:prod        # node dist/main.js
```

## Variaveis de ambiente
Ver `.env.example`. A `DATABASE_URL` aponta para o MESMO Postgres do Next.

## Modulos
- Implementados: `health`, `auth` (admin, cookie `laikao_admin_session`),
  `appointments` (somente leitura de servicos publicos).
- Esqueletos (proximas fases): `catalog`, `promotions`, `uploads`, `orders`,
  `payments`, `inventory`, `finance`, `reports`, `notifications`.

## Compatibilidade de auth
O modulo `auth` valida o MESMO cookie de sessao e a MESMA tabela `AdminSession`
do Next. Uma sessao criada por qualquer um dos lados vale nos dois durante a
transicao.

## Deploy (aplicar so apos aprovacao)
- PM2: `pm2 start npm --name laikao-api -- run start:prod` em `/var/www/laikao/api`.
- nginx: adicionar `location /apiv2/ { proxy_pass http://127.0.0.1:4018/; }` nos
  blocos de `petlaikao.com.br` e `admin.petlaikao.com.br` (com headers Host,
  X-Forwarded-For, X-Forwarded-Proto). NAO alterar o `location /` nem `/api/`.
