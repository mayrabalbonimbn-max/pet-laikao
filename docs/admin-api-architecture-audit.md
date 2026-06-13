# Auditoria estrutural do admin e plano de API propria

## Contexto

O projeto ja deixou de ser um site simples e hoje opera como plataforma: catalogo, promocoes, agenda, pagamentos, pedidos, financeiro, estoque, relatorios, admin e autenticacao. A base atual esta melhor organizada do que um app improvisado, porque ja existe separacao em `domains/`, `server/repositories`, `server/services`, `server/storage`, jobs e rotas `app/api`. Ainda assim, parte importante da regra de negocio continua acoplada ao runtime do Next.

## O que esta acoplado demais

- Autenticacao admin depende de cookies/headers do Next em `server/auth/admin-auth.ts`, o que dificulta reaproveitar a mesma sessao em API separada, jobs externos ou app mobile futuro.
- Agenda mistura leitura publica, reserva de horario, pagamento e telas admin dentro do mesmo projeto Next. O dominio existe, mas a fronteira HTTP ainda e pequena.
- Pagamentos e webhooks ja tem servico proprio, mas ainda estao expostos por route handlers do Next e dividem processo com UI.
- Pedidos, estoque e financeiro compartilham estado derivado. Crescendo assim, qualquer ajuste em checkout pode impactar relatorios e inventario se nao houver contratos claros.
- Relatorios rodam a partir do mesmo app e tendem a ficar caros para request/response do frontend conforme o historico crescer.
- Uploads de produtos/promocoes ainda estao perto do admin, quando idealmente devem passar por uma camada de media/storage da API.
- Jobs de expiracao, reconciliacao e notificacao existem, mas precisam virar workers com idempotencia, observabilidade e filas quando o volume aumentar.

## O que pode continuar no frontend por enquanto

- Layout publico, app shell, componentes visuais e rotas institucionais.
- Componentes de admin, filtros, tabelas e estados de UI.
- PWA manifest, service worker, instalacao e experiencia offline basica.
- Validacoes de formulario como UX, desde que a validacao final continue no servidor.
- Paginas de produto e catalogo publicas consumindo dados via camada de queries ate a API ficar pronta.

## Modulos que devem sair primeiro para API propria

1. Auth admin: base de sessao, login, logout, permissao e auditoria.
2. Agenda: disponibilidade, holds, bloqueios, reagendamento e cancelamento.
3. Pagamentos: criacao de checkout, webhook, conciliacao e idempotencia.
4. Pedidos: checkout, status, pagamento, baixa de estoque e historico.
5. Estoque: movimentos, reservas, alertas e reconciliacao com pedidos.
6. Financeiro: ledger de pagamentos, saldo pendente, falhas e fechamento.
7. Promocoes: regras comerciais e aplicacao em catalogo/checkout.
8. Relatorios: agregacoes, caches e exportacoes.

## Arquitetura alvo recomendada

- Frontend: Next.js continua como web/PWA, usando server components para paginas e client components para interacao.
- API propria: Node.js com Fastify ou NestJS. Para este projeto, Fastify e uma boa primeira API por ser leve, explicito e facil de migrar em fases.
- Banco: PostgreSQL com Prisma no curto prazo, mantendo os modelos atuais e migrando a propriedade dos repositories para a API.
- Autenticacao: cookies httpOnly para web admin, refresh/session table no banco, RBAC por papel e trilha de auditoria.
- Jobs: worker Node separado para expiracao de holds, reconciliacao de pagamento e envio de notificacoes.
- Filas: iniciar simples com tabela de outbox no PostgreSQL; evoluir para Redis/BullMQ quando volume ou retry exigirem.
- Storage: interface unica para imagens de produtos, banners e promocoes, com provider local em dev e S3/R2 em producao.
- Notificacoes: servico de notificacao com canais email, WhatsApp e push PWA, sempre acionado por eventos de dominio.

## Plano em fases sem quebrar o atual

### Fase 1: Fronteiras e contratos

- Criar contratos HTTP internos para auth, agenda, pagamentos, pedidos e estoque.
- Padronizar DTOs e schemas Zod por modulo.
- Manter as paginas atuais usando adaptadores que ainda chamam os dominios locais.
- Definir convencao de erros, status e idempotency keys.

### Fase 2: Auth + agenda na API

- Extrair login/logout/session para API propria.
- Mover disponibilidade, holds e bloqueios para endpoints da API.
- Manter o admin visual igual, trocando apenas o client de dados.
- Adicionar logs de auditoria para login, bloqueio de horario e mudanca de status.

### Fase 3: Pagamentos + pedidos

- Centralizar checkout de agendamento e pedido na API.
- Webhooks passam a cair na API, nao no Next.
- API atualiza Payment, Appointment, Order e ledger financeiro em transacao.
- Frontend recebe apenas status e URLs de pagamento.

### Fase 4: Estoque + financeiro

- Estoque vira servico de movimentos, reservas e ajuste.
- Financeiro vira ledger consultavel por periodo, status e origem.
- Relatorios deixam de calcular tudo no request do painel.

### Fase 5: Promocoes + relatorios + automacoes

- Promocoes viram motor de regras aplicado pela API no catalogo e checkout.
- Relatorios passam a usar agregacoes/caches.
- Outbox dispara emails, WhatsApp e push PWA por eventos de dominio.

## Riscos atuais

- Crescimento de consultas administrativas pode deixar paginas server-rendered lentas.
- Webhooks e UI no mesmo processo dificultam isolamento de falhas.
- Sem outbox, notificacoes podem falhar depois que o estado principal mudou.
- Auth amarrado ao Next reduz portabilidade para subdominio admin ou API separada.
- Relatorios tendem a virar gargalo se continuarem calculados sob demanda.

## Decisao desta etapa

Nesta etapa a prioridade correta e melhorar o admin e separar layouts sem reescrever dominios. A API propria deve entrar por contratos e adaptadores, com migracao modular. O primeiro modulo a extrair deve ser autenticacao, seguido de agenda e pagamentos, porque eles protegem a operacao e reduzem o maior risco de integridade.
