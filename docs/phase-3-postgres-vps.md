# Fase 3 - Base Tecnica (PostgreSQL + Operacao VPS)

## 1) Banco de dados

O projeto agora esta configurado para **PostgreSQL** no Prisma (`prisma/schema.prisma`).

### Variavel obrigatoria

```env
DATABASE_URL="postgresql://laikao:trocar_senha@127.0.0.1:5432/laikao?schema=public"
```

### Subir Postgres local/VPS

```bash
docker compose -f docker-compose.postgres.yml up -d
```

### Aplicar schema

```bash
npm run db:generate
npm run db:push
```

Para producao com migracoes versionadas:

```bash
npm run db:deploy
```

## 2) Migracao de dados SQLite -> PostgreSQL

Se houver base SQLite antiga em producao, faca migracao em janela controlada:

1. Backup do arquivo SQLite e da pasta `public/uploads`.
2. Subir PostgreSQL.
3. Aplicar schema no PostgreSQL.
4. Rodar script interno de migracao de dados (proximo passo da Fase 3.1).
5. Validar contagens (produtos, categorias, pedidos, pagamentos, promocoes).
6. Apontar `DATABASE_URL` para PostgreSQL.
7. Reiniciar app (PM2).

## 3) Storage de midia

Mantido em VPS local, modular e pronto para troca futura:

- Promocoes: `public/uploads/promotions`
- Produtos: `public/uploads/products`

Metadados e URLs continuam persistidos no banco.

## 4) PM2 (exemplo)

```bash
pm2 start npm --name laikao-web -- start
pm2 save
pm2 startup
```

## 5) Nginx (direcao)

- `petlaikao.com.br` -> app publica
- `admin.petlaikao.com.br` -> mesma app com rotas `/admin` (ou upstream dedicado no proximo passo)

Garantir proxy headers:

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `Host`

## 6) Checklist de estabilidade

- [ ] `DATABASE_URL` apontando para PostgreSQL
- [ ] `npm run db:push`/`db:deploy` ok
- [ ] uploads com permissao de escrita em `public/uploads/*`
- [ ] webhook de pagamentos acessivel externamente
- [ ] healthcheck do Postgres ativo
- [ ] logs PM2 sem erro de conexao Prisma

