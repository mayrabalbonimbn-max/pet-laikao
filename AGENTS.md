# CLAUDE.md — Pet Shop Laikão (fonte de verdade única)

Este é o documento mestre do projeto. Ele consolida o escopo de produto (antigo `AGENTS.md`) e a lei de design/UX já aprovada. O conteúdo essencial de ambos está aqui, então **não é preciso ler outro arquivo de instrução**. Em qualquer conflito, este arquivo manda.

A referência visual pronta está nos arquivos HTML/CSS/JS em `laikao-site/` e no detalhamento em `guia-design-referencia.md`. Em dúvida de aparência, reproduza o que está lá. Reproduza, não reinvente.

---

## Como o Claude Code deve trabalhar neste projeto

Faça sempre nesta ordem:

1. **Ler este `CLAUDE.md` inteiro.**
2. **Explorar o repositório e reportar o estado real** antes de agir. Não assuma que uma feature está pronta só porque está listada aqui; confirme no código. Liste o que existe de fato (rotas, schema Prisma, integrações, scripts).
3. **Propor o plano da etapa** (objetivo, o que vai fazer, riscos, decisões) e **aguardar meu OK** antes de criar ou mover arquivos quando o assunto for amplo.
4. **Executar em branch isolada** (ou git worktree). Nada de commit direto na branch de produção.
5. **Validar com build/typecheck** e mostrar a saída real antes de dizer que terminou.
6. **Resumir** o que foi feito, o que ficou pendente e a próxima etapa lógica.

Guard-rails de produção (invioláveis):
- O site e o admin no ar (Next em `:3000`) precisam continuar funcionando o tempo todo.
- Não rodar migrations destrutivas nem `prisma migrate reset` contra o banco de produção. Gerar a migration e me mostrar o SQL antes de aplicar. Para testar, usar database separado (`laikao_dev`).
- Não tocar em nginx, PM2, `.env` de produção nem em arquivos fora do repo sem minha aprovação. Nunca colar conteúdo de `.env` na conversa.
- Antes de qualquer ação irreversível (mover/renomear pastas do app que está no ar, apagar arquivos, deletar dados), parar e confirmar.

---

## 0. Regras invioláveis

Quebrar qualquer uma destas é erro.

**Produto**
1. Não entregar solução genérica, improvisada ou superficial. Em dúvida entre "rápido" e "bem feito", escolher bem feito, com arquitetura correta.
2. Multi-page / multi-route de verdade. Nunca reduzir a one page nem a landing.
3. Mobile-first real (não desktop espremido). Funciona bem a partir de 360px.
4. Todo fluxo central tem estados claros de carregando, vazio, erro, sucesso, indisponível e confirmação.
5. Zero gaps entre front, backend, pagamentos, agenda, admin e notificações. Tudo conversa com tudo.

**Visual e copy**
6. O **roxo é a identidade da Laikão e domina o site** (fundo roxo estrutural), com rosa como acento. Seguir o design já feito, aplicado sobre base roxa. Áreas de catálogo, checkout e admin usam superfícies claras sobre o roxo para legibilidade. Deve parecer uma **rede grande e consolidada** na completude e no acabamento, com a cara roxa própria da marca. Não é SaaS frio nem o roxo lavado do site antigo, e não pode parecer loja pequena. (Ver seção 1.)
7. Nada de jargão técnico para o cliente (nada de "checkout integrado da InfinitePay", "state machine", "hold temporário"). Copy calorosa e simples.
8. As páginas Produtos e Promoções nunca aparecem vazias para o cliente. Nada de "0 produtos" ou "Em breve" como página. Vazio só quando o cliente filtra e não acha, com mensagem amigável e botão de limpar.
9. Sem em-dash (—) em nenhuma copy. Use vírgula, dois-pontos, ponto ou parênteses.
10. O toque humano da Cris aparece como **sinal de confiança** (quem cuida tem nome e rosto), de forma sutil e elegante, sem fazer o site parecer loja pequena. Manter os espaços de foto da Cris e da loja, integrados a um layout de rede grande.
11. Dados reais sempre (links, endereço, telefone, serviços e preços da seção 9). Não inventar contato.

---

## 1. Missão e marca

A Pet Shop Laikão fica na Vila Nova Cachoeirinha, Zona Norte de São Paulo, e é da Cris. Faz banho e tosa, vende produtos (ração, petisco, higiene, beleza, acessórios, brinquedos), entrega pelo iFood até meia-noite e atende presencialmente.

A dona quer que o site **pareça uma rede de pet shop grande, consolidada e profissional**, com venda online e agendamento de serviços funcionando direitinho. Não tratar como "site simples de pet shop": a referência de completude e operação é uma **plataforma comercial completa** no nível de Petz, Cobasi ou Petlove (catálogo forte, busca, carrinho, conta, checkout, agenda séria). Tudo polido, escalável e operacionalmente confiável.

**Identidade visual (decidida):** o **roxo é a identidade histórica da Laikão** e deve dominar. O site usa **fundo roxo** como cor estrutural da marca, com rosa como acento de ação e destaque. Seguir o design já feito (componentes, selo, tipografia, paleta), aplicado sobre base roxa. A completude e o profissionalismo são de rede grande; a cara é roxa e própria, não um clone claro de concorrente.

**Como fazer roxo dominante e ainda parecer rede grande (execução):** o roxo domina a estrutura (header, herói, faixas, seções de destaque, rodapé, navegação). As áreas de catálogo e leitura intensa (grade de produtos, página de produto, carrinho, checkout, formulários da agenda, admin) usam **cards e superfícies claras sobre o fundo roxo**, porque foto de produto e listas longas precisam de fundo claro para ler bem e valorizar a imagem. Resultado: marca roxa forte e e-commerce legível ao mesmo tempo.

**Toque humano:** a Cris aparece como sinal de confiança e diferencial (quem cuida tem nome e rosto), de forma elegante, sem fazer parecer loja pequena.

**Tagline oficial:** "Paixão que une, amor que cuida."

### DECISÃO DE BRAND (resolvida)
A Cris quer **fundo roxo**, mantendo o design já feito. Roxo sempre foi a identidade da Laikão. **Direção fixada: fundo roxo dominante (estrutura), rosa como acento, superfícies de catálogo/checkout/admin em claro sobre o roxo para legibilidade.** Os tokens da seção 6 continuam valendo; o que muda é a cor estrutural de fundo: o fundo geral passa de `--creme` para roxo (use `--roxo-profundo` como base estrutural, ou um roxo de fundo dedicado), e `--creme`/`--branco` passam a ser as superfícies dos cards e blocos de conteúdo. A paleta (rosa, roxo, lavanda) não muda. Base clara dominante fica descartada.

---

## 2. Arquitetura técnica

### Estado atual (confirmar no servidor/repo)
- Frontend Next do Laikão roda via **PM2** (`npm start`) em **`/var/www/laikao`**, porta **3000**. Os domínios `petlaikao.com.br` e `admin.petlaikao.com.br` apontam ambos para `127.0.0.1:3000` no nginx.
- Não existe API separada hoje. O que houver de agenda/produtos/admin está dentro do Next.
- **PostgreSQL** ativo em `127.0.0.1:5432` (localhost). **Prisma** em uso (reaproveitar o schema existente).
- Padrão dos outros projetos: backend próprio sob PM2 com sufixo `-api`.

### Alvo
- **Next.js** como frontend (preservado).
- **NestJS** como API principal, separada, modular.
- **PostgreSQL** definitivo (o que já existe), database dedicado `laikao`.
- **Prisma** mantido. **Sem Supabase.**
- shared types/schemas quando fizer sentido.

> Nota de convenção: NestJS é mais pesado que o padrão `src/server.js` dos outros `-api`. Mantido por ser o projeto robusto. Registrar essa divergência ao propor.

### Deploy e roteamento (não alterar sem aprovação)
- Nova API sobe no PM2 como **`laikao-api`**, porta **4018** (confirmar livre com `ss -tulpn | grep :4018`).
- nginx: adicionar `location /api/ { proxy_pass http://127.0.0.1:4018/; }` nos blocos de `petlaikao.com.br` e `admin.petlaikao.com.br`.

### Organização (monorepo, se não bagunçar)
Preferência: `apps/web` (Next), `apps/api` (NestJS), `packages/shared` (tipos/schemas). Risco: o deploy atual roda `npm start` em `/var/www/laikao`; o monorepo não pode quebrar isso nem o PM2 `laikao`. Ao propor, descrever exatamente como introduzir o monorepo sem derrubar produção (inclusive a opção de começar a API como app irmão em `/var/www/laikao/api` e consolidar depois). Se recomendar outra organização, justificar.

### Migração incremental (não reescrever tudo de uma vez)
Módulos previstos na API: `auth`, `appointments`, `catalog`, `promotions`, `uploads`, `orders`, `payments`, `inventory`, `finance`, `reports`, `notifications`.

Ordem de extração:
1. `auth` admin
2. `appointments` (agenda)
3. `catalog` (produtos, categorias, serviços)
4. `promotions`
5. `uploads`

Depois: `orders` → checkout → `payments` → `inventory` → `finance` → `reports`.

Compatibilidade temporária: o Next pode seguir chamando as rotas atuais enquanto a API sobe em paralelo, migrando rota a rota, sem big bang.

---

## 3. Sitemap

### Rotas públicas
`/` (Home), `/servicos`, `/servicos/[slug]`, `/agenda`, `/produtos`, `/produto/[slug]`, `/promocoes`, `/sobre`, `/contato`, `/carrinho`, `/checkout`, `/minha-conta` (se houver login cliente), e políticas (`/privacidade`, `/termos`, `/trocas-e-devolucoes`, `/politica-de-agendamento`).

> Observação: a referência estática em `laikao-site/` cobre Início, Serviços, Produtos, Promoções e Contato. O alvo completo acima é o destino; chegar lá por fases.

### Rotas administrativas
`/admin`, `/admin/dashboard`, `/admin/agendamentos`, `/admin/pedidos`, `/admin/produtos`, `/admin/clientes`, `/admin/servicos`, `/admin/calendario`, `/admin/cupons`, `/admin/notificacoes`, `/admin/banners`, `/admin/financeiro`, `/admin/automacoes`, `/admin/configuracoes`.

---

## 4. Domínio / entidades principais

Modelar no Prisma (confirmar o que já existe antes de criar). Núcleo esperado:

- **Usuario** (admin), com papel/permissão e auth segura.
- **Cliente** (tutor), opcional login; dados de contato e pets.
- **Pet** (nome, espécie, porte, observações), ligado ao Cliente.
- **Servico** (nome, slug, preço, duração, regras).
- **Agendamento** (serviço, pet, tutor, data, horário, status, valor pago, saldo pendente, forma de pagamento, observações). Estados claros e histórico.
- **DisponibilidadeAgenda / Bloqueio** (slots, intervalos, limites de encaixe, dias/horários bloqueados).
- **Categoria** e **Produto** (nome, slug, marca, descrição, fotos, preço, preço promocional, estoque, variações se houver, destaque, promo).
- **Pedido** e **ItemPedido** (itens, quantidades, subtotal, frete/retirada, cupom, status).
- **Pagamento** (origem: agendamento ou pedido; método Pix/cartão; valor pago; restante; status; referência do provedor; webhook).
- **Promocao / Cupom** (regra, validade, ativo).
- **Banner** e **ConteudoInstitucional** (gerenciáveis pelo admin).
- **Notificacao** (tipo, destino, status) e **Lead/Mensagem de contato**.
- **MovimentoEstoque** (entrada/saída) para o módulo de inventory/finance.

Para a vitrine, o formato que o frontend já espera (mantenha a forma de saída da API compatível):
```ts
type Produto = {
  id: string; nome: string; marca: string;
  cat: "Rações"|"Petiscos"|"Higiene"|"Beleza"|"Acessórios"|"Brinquedos";
  desc: string; preco: number; precoAntes?: number; promo?: boolean;
  estoque: "ok"|"pouco"|"fora"; // pouco => Últimas unidades; fora => Indisponível
};
```

---

## 5. Requisitos funcionais (alvo do produto)

### Home
Forte, comercial, clara, sem ser confusa nem longa demais: hero/banner, destaque de serviços, destaque de produtos, CTA de agendamento, prova de confiança/diferenciais, atalhos rápidos, bloco de contato/WhatsApp, chamada de promoções.

### Agenda online (parte crítica)
- Calendário com visões mensal, semanal e diária.
- Datas e horários disponíveis; bloqueio de indisponíveis; fluxo simples; mobile excelente; confirmação visual clara.
- Fluxo: escolher serviço → pet/infos → data → horário → resumo → pagamento → confirmação → e-mail para a Cris + admin atualizado.
- Regras: duração por serviço, intervalos, bloqueios, limite de encaixes, reagendamento, cancelamento com regras, observações, histórico.

### Pagamento do agendamento
- **50% via Pix** (reserva), **100% via Pix**, **cartão de crédito**.
- Integrado ao fluxo (não separar de forma confusa). Falha bem tratada. Status no admin e para o cliente. Se 50%: horário reservado + saldo restante registrado e visível no admin.

### Loja / vitrine
Grid responsivo, busca, filtros, categorias, página de produto, preço, estoque, fotos, descrição, variações, carrinho, checkout. Preparada para crescer (destaques, promoções, combos, banners, recomendados).

### Carrinho e checkout
Adicionar/remover, ajustar quantidade, subtotal, frete/retirada, cupom (se implementar), pagamento, confirmação e status do pedido. Sem atrito no celular.

### PWA
Instalável, responsivo de verdade, ícone próprio, splash, bom no touch, sem bugs de viewport/safe-area. Notificações para promoções, status de pedido, confirmação de agendamento e lembretes (estruturar a base sem prometer o que o navegador não entrega).

### E-mails automáticos
Para a Cris a cada novo agendamento, nova venda, pagamento confirmado, cancelamento, reagendamento (com nome, contato, serviço/pedido, data/hora, valor, status, link para o admin). Para o cliente: confirmações e atualização de status.

### Automação WhatsApp
Acionar comunicação no fluxo de agendamento (confirmação, lembrete do dia, mensagens operacionais, aviso à Cris). Arquitetura organizada, sem gambiarra; se depender de provedor/API, deixar o fluxo pronto e bem definido.

### Admin robusto
Gerenciar produtos, categorias, estoque, pedidos, banners, textos, serviços, agenda, horários, bloqueios, clientes, pagamentos, cupons, notificações, automações, conteúdo e configurações. Dashboard com visão de vendas, agendamentos e próximos atendimentos, atalhos, filtros, busca, status visuais claros. Bom no desktop, aceitável no tablet/mobile. Evitar excesso de cliques e telas quebradas.

---

## 6. Sistema visual (lei de design)

Detalhe completo e CSS de referência em `laikao-site/styles.css` e `guia-design-referencia.md`. Resumo normativo:

### 6.1 Tokens (não alterar os hex)
```css
:root{
  --rosa:#E5197F;          /* marca principal, CTAs */
  --rosa-claro:#FF4FA8;    /* hover de rosa */
  --rosa-suave:#FCE4F0;    /* fundos suaves, ícones */
  --roxo:#7B2D9E;          /* secundária */
  --roxo-profundo:#4A1568; /* títulos, rodapé, faixa escura */
  --lavanda:#F4E9FB;       /* seção alternada clara */
  --creme:#FFF5FA;         /* fundo do site */
  --branco:#FFFFFF;
  --carvao:#2A1B30;        /* texto corpo */
  --tinta-suave:#6B5570;   /* texto secundário */
  --linha:#EAD9EE;         /* bordas */
  --verde:#1FAE54;         /* WhatsApp */
  --ifood:#EA1D2C;         /* referência iFood */
  --raio:22px; --raio-sm:14px;
  --sombra:0 18px 40px -20px rgba(74,21,104,.35);
  --sombra-suave:0 10px 30px -18px rgba(74,21,104,.30);
  --container:1140px;
}
```
Uso (fundo roxo dominante): **fundo geral roxo** (`--roxo-profundo` como base estrutural); superfícies de conteúdo, cards de produto, painéis de catálogo, checkout e admin em `--branco`/`--creme` sobre o roxo, para leitura e para valorizar fotos; títulos sobre claro em `--roxo-profundo`, corpo `--carvao`, secundário `--tinta-suave`; sobre o roxo, texto em branco; botão rosa só para a ação principal de cada bloco; `--lavanda` para blocos claros suaves; WhatsApp sempre verde; iFood sempre na cor iFood. Garanta contraste AA em texto sobre roxo.

### 6.2 Tipografia

Duas fontes do Google Fonts. No Next, carregue com `next/font/google` e exponha como CSS variables.

- **Baloo 2** (display, arredondada, conversa com o logo): títulos `h1/h2/h3`, botões, números de preço, marca. Pesos 500, 600, 700, 800.
- **Nunito** (corpo): textos, parágrafos, labels. Pesos 400 a 800, com itálico 600/700 para a tagline.

```ts
// app/fonts.ts
import { Baloo_2, Nunito } from "next/font/google";
export const baloo = Baloo_2({ subsets: ["latin"], weight: ["500","600","700","800"], variable: "--fonte-display" });
export const nunito = Nunito({ subsets: ["latin"], weight: ["400","600","700","800"], style: ["normal","italic"], variable: "--fonte-corpo" });
```

Regras:
- `h1,h2,h3 { font-family: var(--fonte-display); line-height:1.08; letter-spacing:-.01em; color:var(--roxo-profundo); }`
- Corpo: `font-family: var(--fonte-corpo); line-height:1.6;`
- Tamanho de título responsivo com `clamp()`. Exemplo do h1 do herói: `clamp(2.4rem, 7.5vw, 4.1rem)`.
- A tagline aparece em Baloo 2, itálico, peso 600, na cor `--roxo` ou `--rosa`.

---

### 6.3 Elemento de assinatura: o selo

O selo é a marca registrada visual do site. Use no topo de cada seção principal, como "eyebrow".

- Pílula branca, texto rosa em caixa-alta, `letter-spacing:.14em`, fonte Baloo 2.
- Borda dupla: sombra interna criando moldura + borda tracejada rosa por cima (`::before` com `border:1.6px dashed var(--rosa)`).
- Ícone de patinha à esquerda.

Estrutura:
```html
<span class="selo"><svg class="paw">...patinha...</svg> Texto do selo</span>
```

A **patinha** (paw) é um SVG de 3 dedos + almofada, sempre `viewBox="0 0 24 24"` e `fill="currentColor"`. **Defina width/height via CSS** (ex.: `.selo .paw{width:15px;height:15px}`). Nunca deixe SVG sem tamanho: sem CSS ele estoura na tela.

---

### 6.4 Componentes (reproduzir exatamente)

Cada componente abaixo já existe no CSS de referência (`styles.css`). Porte-os como componentes React reutilizáveis.

#### Header / navegação (`<Header/>`)
- Sticky no topo, fundo `--creme` com `backdrop-filter: blur(10px)` e borda inferior `--linha`. Altura 70px.
- Esquerda: marca = selo redondo rosa com patinha + "Pet Shop" (roxo profundo) "Laikão" (rosa), em Baloo 2.
- Centro/direita (desktop ≥980px): nav com 5 links (Início, Serviços, Produtos, Promoções, Contato). O link da página atual recebe `aria-current="page"` e a classe ativa (cor rosa + sublinhado animado que cresce da esquerda).
- Direita: botão rosa "Agendar".
- Mobile (<980px): nav some, aparece o botão hambúrguer que abre um menu vertical (`.menu-mob`). O menu fecha ao clicar em qualquer link. Use `aria-expanded` no botão.

#### Botões (`<Botao/>`)
Variantes (pílula, min-height 48px, Baloo 2 peso 700):
- `btn--rosa`: fundo `--rosa`, hover `--rosa-claro` + translateY(-2px). Ação principal.
- `btn--roxo`: fundo `--roxo-profundo`. Ação secundária escura.
- `btn--linha`: fundo branco, borda interna `--linha`, hover borda rosa. Ação terciária.
- `btn--zap`: fundo `--verde`. Sempre que a ação for WhatsApp.
- `btn--claro`: translúcido branco, só dentro de bandas coloridas.
- Foco visível obrigatório: `outline:3px solid var(--rosa-claro); outline-offset:3px`.

#### Herói (home)
- Duas colunas no desktop (texto + moldura de foto), uma coluna no mobile.
- Blobs de fundo (rosa-suave e lavanda) com blur, decorativos, `z-index:0`.
- Conteúdo: selo, h1 com palavra-chave em rosa, tagline em itálico, subtítulo, dois botões (Agendar rosa + WhatsApp verde), e três "chips" (Banho e tosa, iFood até meia-noite, Entrega ou retirada).

#### Moldura de foto (`<MolduraFoto/>`)
- `aspect-ratio` 4/5 (ou 1/1 na variante quadro), cantos arredondados, `outline:5px solid #fff` por dentro, borda tracejada interna, sombra.
- **Fallback obrigatório:** quando não há foto, mostra fundo em degradê da marca + patinha grande + legenda ("Coloque aqui uma foto da Cris com um pet feliz"). Nunca pode aparecer espaço quebrado.
- Quando houver imagem real, ela cobre tudo com `object-fit:cover`.
- Componente recebe `src?`, `alt`, `legenda`, `variante`.

#### Cabeçalho de página interna (`<PageHead/>`)
Para Serviços, Produtos, Promoções e Contato. Selo + h1 (palavra em rosa) + parágrafo + ações opcionais. Blob radial decorativo no canto.

#### Faixa rápida
Barra `--roxo-profundo`, texto branco, 4 itens com ícone (horário, bairro, telefone, @instagram). Vira coluna no mobile.

#### Cards de serviço
Card branco, ícone em quadrado `--rosa-suave`, título, descrição, bloco de meta (Valor + Duração em Baloo 2) e duas ações: "Agendar" (rosa) e "Ver detalhes" (linha).

#### Loja / Produtos (ver seção 6 para a lógica)
- Layout duas colunas no desktop: sidebar de filtros (260px) + vitrine. Uma coluna no mobile.
- Sidebar: busca com ícone de lupa + lista de categorias (botões, o ativo fica rosa, com contagem).
- Topo da vitrine: contador "N produtos" + select de ordenação.
- Grade de produtos responsiva (1 / 2 / 3 colunas conforme largura).
- Card de produto: thumb com ícone-fallback por categoria, tag de categoria, selo de estado (Oferta / Últimas unidades / Indisponível), marca, nome, descrição, preço (com preço "antes" riscado quando em promoção) e botão "Adicionar". Estado indisponível desabilita o botão.

#### Carrinho (drawer)
- Botão flutuante `cart-fab` (roxo profundo) com badge de quantidade. Fica acima do botão de WhatsApp.
- Abre um drawer lateral da direita com overlay. Fecha por overlay, botão X ou tecla Esc.
- Lista de itens com thumb, nome, preço, controle de quantidade (− e +) e remover.
- Rodapé do drawer: total + nota sobre confirmação no atendimento + botão verde "Finalizar no WhatsApp".
- Estado vazio do carrinho: ícone + mensagem amigável.

#### Cards de promoção
Card branco com "faixinha" (categoria da oferta em rosa, caixa-alta), título, descrição e CTA. Variante `promo--futuro` (tracejada, fundo lavanda) para o estado "novas campanhas em breve". Destaque grande em degradê roxo→rosa no topo da página.

#### Contato
4 vcards (WhatsApp, Instagram, Endereço, Horário) com ícone, texto e link. Mapa do Google embutido via `<iframe>` (`output=embed`, sem precisar de API key). Nota de LGPD ligando à política de privacidade.

#### Rodapé
Fundo `--roxo-profundo`. Três colunas: marca + endereço + horário; navegação; canais. Linha final com copyright e links de privacidade/termos/trocas.

#### WhatsApp flutuante
Botão redondo verde fixo no canto inferior direito, em todas as páginas, com `aria-label`.

---

### 6.5 A loja: modelo de dados e comportamento

A loja é client-side na referência, com checkout via WhatsApp. No Next, monte como Client Component (ou conecte ao backend/checkout real da Laikão se já existir; nesse caso mantenha a mesma UI).

#### Modelo de produto
```ts
type Produto = {
  id: string;
  nome: string;
  marca: string;
  cat: "Rações"|"Petiscos"|"Higiene"|"Beleza"|"Acessórios"|"Brinquedos";
  desc: string;
  preco: number;
  precoAntes?: number;      // mostra preço riscado
  promo?: boolean;          // selo "Oferta"
  estoque: "ok"|"pouco"|"fora"; // "pouco" => Últimas unidades; "fora" => Indisponível
};
```

#### Comportamento exigido
- **Categorias:** "Todos" + as 6 categorias, cada uma com contagem real.
- **Busca:** filtra por nome, marca, descrição e categoria (case-insensitive).
- **Ordenação:** Relevância (ordem original), Menor preço, Maior preço, Em promoção.
- **Carrinho:** adicionar, somar quantidade, diminuir, remover. Persistir no navegador com `localStorage` dentro de try/catch (no Next, só no client). Total recalculado sempre.
- **Checkout WhatsApp:** monta mensagem com itens, quantidades, preços e total, e abre `https://wa.me/5511980512871?text=...`. Modelo da mensagem:
  ```
  Olá! Quero fazer um pedido na Pet Shop Laikão:

  • 2x Premier Fórmula Cães Adultos (R$ 199,90)
  • 1x Shampoo Neutro 500ml (R$ 32,90)

  Total: R$ 432,70

  Pode confirmar disponibilidade e a entrega/retirada?
  ```
- **Formatação de preço:** sempre `toLocaleString("pt-BR",{style:"currency",currency:"BRL"})`.
- **Estado vazio (só ao filtrar):** ícone de lupa + "Nenhum produto encontrado" + "Tente outra categoria ou limpe a busca" + botão "Limpar filtros". Isto é diferente da regra 2: aqui o vazio é resultado de filtro do cliente, não da página sem cadastro.

> Os produtos da referência são exemplos tirados da comunicação da Laikão, com **preços placeholder**. Substitua pelos itens e valores reais antes de publicar.

---

### 6.6 Estrutura de rotas (Next App Router)

5 páginas, header e footer compartilhados via layout. Não duplique header/footer em cada página: use um `layout.tsx`.

```
app/
  layout.tsx          // <html>, fontes, <Header/>, {children}, <Footer/>, <ZapFloat/>
  globals.css         // tokens da seção 2 + estilos base
  page.tsx            // Início
  servicos/page.tsx   // Serviços
  produtos/page.tsx   // Produtos (loja, client component)
  promocoes/page.tsx  // Promoções
  contato/page.tsx    // Contato
components/
  Header.tsx Footer.tsx Botao.tsx Selo.tsx MolduraFoto.tsx
  PageHead.tsx CardServico.tsx Loja.tsx CardProduto.tsx
  CarrinhoDrawer.tsx CardPromo.tsx VCard.tsx ZapFloat.tsx
```

- O link ativo do menu é definido comparando `usePathname()` com a rota.
- A loja (`Loja.tsx`, `CarrinhoDrawer.tsx`) usa `"use client"`. O resto pode ser Server Component.
- O botão "Agendar" aponta para a rota real de agenda do site (mantenha o fluxo de agendamento que já existe; só não exiba o jargão técnico).
- Metadata (title/description) por página, theme-color `#E5197F`.

---

### 6.7 Tom de voz e copy

Próximo, confiável e claro, profissional sem ser frio. Fala com o dono do pet de forma acessível, mas com a segurança de uma rede grande, não de loja pequena. Sem firula técnica e sem jargão de dev.

| Não escreva | Escreva |
|---|---|
| "Checkout integrado da InfinitePay" | "Finalize seu pedido pelo WhatsApp" |
| "Catálogo centralizado em domínio" | "Tudo que seu pet precisa, em um lugar só" |
| "Nenhum produto encontrado" (como página) | (nunca; só ao filtrar, com mensagem amigável) |
| "Em breve" (página inteira) | Ofertas reais + "novas campanhas em breve" como card |

Regras de copy:
- Sem em-dash. Use vírgula, dois-pontos, ponto ou parênteses.
- Frases curtas. Verbos no imperativo gentil ("Agende", "Monte seu pedido", "Vem falar com a gente").
- Repita a tagline "Paixão que une, amor que cuida" pelo menos uma vez (home).
- Sempre mencione que dá para retirar na loja ou receber pelo iFood.

---

### 6.8 Acessibilidade e responsividade

- Breakpoints usados na referência: 520, 680, 760, 900, 920, 980, 1020, 1080px. Mantenha a lógica mobile-first.
- Contraste: texto sobre fundo claro usa `--carvao`/`--roxo-profundo`; sobre rosa/roxo usa branco. Não use `--tinta-suave` sobre cor forte.
- Todo controle interativo tem foco visível (outline rosa).
- `prefers-reduced-motion`: desligar animações de reveal e transições. Já está no CSS de referência, mantenha.
- Imagens com `alt` descritivo. Ícones decorativos com `aria-hidden`. Botões de ícone com `aria-label`.
- Toque mínimo 44–48px de altura nos botões.
- Animação de entrada (`reveal`) via IntersectionObserver; no Next, encapsule num componente client ou use CSS puro. Conteúdo deve ser legível mesmo sem JS.

### 6.9 Admin (layout e padrão das abas)

Referência visual fiel: **`laikao-site/admin-modelo.html`** (a aba Pedidos serve de modelo para todas). O admin usa a identidade roxa na navegação e superfícies claras na área de trabalho. Reproduzir, não reinventar.

**Shell (igual em todas as abas):**
- Sidebar roxa escura (degradê), com: marca "Laikão Admin / Painel comercial", card "Hoje", e navegação agrupada em **Visão geral**, **Operação** e **Catálogo**. Item ativo vira pílula branca com ícone rosa. Colapsa abaixo de 920px (botão de menu na topbar).
- Topbar clara: eyebrow "Operação Laikão", busca global ("Buscar cliente, pet, pedido, agendamento ou pagamento"), sino de notificações, userchip (Gestão Laikão / Super admin) e botão SAIR.
- Área de conteúdo clara (creme/branco), cards brancos, títulos `--roxo-profundo`, acento `--rosa`.

**Os 5 blocos reutilizáveis (todos no `admin-modelo.html`):**
1. **Cabeçalho da página:** kicker + h1 operacional + subtítulo. Título útil, nunca jargão de dev.
2. **Linha de KPIs:** até 4 cards de número (label, número grande, ajuda), com borda superior colorida para status (âmbar = atenção, verde = ok).
3. **Barra de filtros:** busca + select de status + "Mais filtros" + ação principal rosa.
4. **Tabela (elemento central):** cabeçalho em `--lavanda`, linhas com hover, **selos de status padronizados** (pago = verde, aguardando = âmbar, em separação/processo = roxo, cancelado = vermelho) e botão de ação por linha. Variante com painel/formulário lateral para cadastro e edição.
5. **Estado vazio:** ícone + título + copy acolhedora e útil (nunca "0" seco). Vale a regra 8 também para o operador.

**Regras de copy do admin:**
- Operacional e clara para a Cris (não-dev). Proibido jargão de arquitetura ("fulfillment", "state machine", "base pronta para separar API"). O título descreve a tarefa, não a engenharia.
- Acentuação correta sempre (Operação, Promoções, Relatórios, Notificações, Serviços, Precificação, atenção, próximos). O admin atual está sem acentos; corrigir.
- Mesmo tom profissional e próximo do site.

**Mapa das abas (mesma estrutura, conteúdo diferente):**
- **Dashboard:** cabeçalho + KPIs (agendamentos de hoje, pedidos novos, recebimentos, falhas críticas, promoções ativas) + listas "próximos atendimentos" e "pedidos novos".
- **Agenda:** cabeçalho + KPIs + alternador Mensal/Semanal/Diária + calendário + painel "novo evento" (formulário lateral). Bloqueios marcam indisponibilidade no site público.
- **Agendamentos:** filtros + tabela (tutor, pet, serviço, data, status financeiro, status) + estado vazio.
- **Pedidos:** exatamente o `admin-modelo.html` (KPIs + filtros + tabela com selos + estado vazio).
- **Promoções:** KPIs + filtros + tabela (campanha, validade, ativo/encerrada).
- **Financeiro:** KPIs (recebido, a receber, 50% pendente de agendamentos) + tabela de lançamentos.
- **Relatórios:** KPIs + área de gráfico no lugar da tabela.
- **Notificações:** lista de eventos no lugar da tabela.
- **Catálogo (Categorias, Produtos, Estoque, Precificação, Serviços):** filtros + tabela + formulário lateral de criar/editar; Estoque e Precificação com colunas próprias.

**Auth admin:** login separado (a tela "Entrar no painel" já existe), sessão protegida por cookie httpOnly, bloqueio temporário após tentativas, e proteção de todas as rotas `/admin`.

---

## 7. Estados, qualidade e o que não fazer

**Estados obrigatórios** em cada fluxo: carregando, vazio, erro, sucesso, indisponível, confirmação. Feedback visual sempre.

**Critério de qualidade:** o projeto só é bom se entregar ao mesmo tempo visual forte, navegação clara, mobile excelente, agenda utilizável, pagamento bem integrado, loja convincente, admin robusto, automações úteis e base pronta para crescer. Se uma parte crítica estiver fraca, não está pronto.

**Prioridade em conflito:** (1) arquitetura certa, (2) mobile UX, (3) agenda + pagamento confiáveis, (4) admin robusto, (5) loja/checkout, (6) notificações/automações, (7) polimento visual.

**Não fazer:** reduzir a landing/one page; layout genérico de template; ignorar mobile ou admin; agenda superficial; e-commerce fake; pagamentos mal amarrados; deixar fluxo central sem estado de erro/sucesso; produto bonito e operacionalmente fraco (ou o contrário); tomar atalho que gere retrabalho grande; presumir que "depois arruma".

**Segurança:** auth admin segura, regras de permissão, validação no servidor, proteção de rotas admin, integridade de pagamentos, consistência entre agenda e pagamento, logs úteis, tratamento de erro real.

**SEO/performance:** carregamento rápido, imagens otimizadas, metadados por página, estrutura indexável, páginas de produto amigáveis, Core Web Vitals, mobile forte.

---

## 8. Fases de trabalho

Trabalhar em fases explícitas; ao iniciar uma, dizer objetivo, o que vai fazer e riscos; ao terminar, resumir o feito, o pendente e o próximo passo.

1. **Framing**: consolidar escopo, páginas, fluxos, módulos, entidades, integrações, prioridades.
2. **Arquitetura**: front, API (NestJS), banco (Prisma/Postgres), pagamentos, agenda, notificações, automações, admin, PWA. Justificar escolhas.
3. **Design system e UX**: já definido na seção 6; aplicar, não reinventar.
4. **Base**: app shell, rotas, layout, home, páginas principais, componentes.
5. **Módulos críticos** (ordem): agenda → pagamento do agendamento → loja/produtos → checkout → admin → e-mails → notificações → WhatsApp → PWA.
6. **QA e hardening**: fluxos quebrados, mobile, estados vazios, validações, acessibilidade, performance, integração.
7. **Polimento**: refino visual, microinterações, cópia, banners, otimizações.

Para a etapa atual da API: ler e reportar, propor arquitetura e plano de fases, esperar OK, então em branch criar o esqueleto NestJS (PrismaModule, config/env, healthcheck, CORS, tratamento de erro) e implementar `auth` admin (e encostar em `appointments` se seguro), rodar build/typecheck e mostrar a saída.

---

## 9. Conteúdo real (usar exatamente)

**Contato e endereço**
- Rua Franklin do Amaral, 271, Vila Nova Cachoeirinha, São Paulo SP
- Segunda a sábado, 8h às 19h (iFood até meia-noite)
- WhatsApp (11) 98051-2871 → `https://wa.me/5511980512871`
- Instagram @pet_laikao → `https://instagram.com/pet_laikao`
- iFood → `https://www.ifood.com.br/delivery/sao-paulo-sp/pet-shop-laikao-vila-nova-cachoeirinha/d7c31af8-0c1f-4649-b99b-0aaf09ce7adf?UTM_Medium=share`
- Mapa (iframe) → `https://www.google.com/maps?q=Rua+Franklin+do+Amaral+271,+Vila+Nova+Cachoeirinha,+Sao+Paulo,+SP&output=embed`

**Serviços (valores reais)**
- Banho e tosa premium: R$ 110, 90 min → `/servicos/banho-e-tosa-premium`
- Banho terapêutico: R$ 78, 60 min → `/servicos/banho-terapeutico`
- Tosa higiênica: R$ 65, 45 min → `/servicos/tosa-higienica`
- Também: hidratação, escovação, corte de unhas. Cães e gatos.
- Nota de cuidado (manter): pet com pulga ou carrapato precisa ser medicado na hora, para não contaminar o ambiente nem os outros clientes.

**Produtos da comunicação** (base; confirmar preços com a Cris): Premier (ração), Golden (ração), bifinho/petisco, Shampoo Neutro 500ml, Spray Hidratante 250ml, Spray Higiene e Perfume 250ml, coleira, comedouro, brinquedos.

---

## 10. Checklists

### Design / frontend
- [ ] Rotas existem e a navegação funciona, com link ativo correto.
- [ ] Header e footer vêm do layout compartilhado.
- [ ] Fundo roxo dominante aplicado, com cards/superfícies claras nas áreas de catálogo e checkout; rosa como acento; sem resquício do roxo lavado antigo.
- [ ] Nenhum SVG sem width/height.
- [ ] Baloo 2 + Nunito via next/font.
- [ ] Loja: busca, filtro, ordenação, carrinho e checkout funcionando; carrinho persiste e fecha por overlay/X/Esc.
- [ ] Produtos e Promoções nunca vazias para o cliente.
- [ ] Zero jargão técnico; zero em-dash.
- [ ] Fotos com fallback (nada quebrado sem imagem).
- [ ] Links reais (mapa, WhatsApp, Instagram, iFood).
- [ ] Responsivo em 360, 375, 768, 1024 e desktop.
- [ ] Foco visível e `prefers-reduced-motion` respeitado.
- [ ] Metadata e theme-color `#E5197F` por página.
- [ ] Admin segue o `admin-modelo.html`: sidebar roxa + conteúdo claro, os 5 blocos por aba, selos de status padronizados.
- [ ] Copy do admin operacional (sem jargão de dev) e com acentuação correta.
- [ ] Todas as rotas `/admin` protegidas por auth; login separado funcionando.

### API / backend
- [ ] Trabalho em branch isolada; produção intacta.
- [ ] Esqueleto NestJS com módulos previstos; PrismaModule + config/env + healthcheck + CORS + erro tratado.
- [ ] Schema Prisma existente reaproveitado, não recriado.
- [ ] Migrations revisadas (SQL mostrado) antes de aplicar; sem reset em produção.
- [ ] `auth` admin implementado e protegendo rotas.
- [ ] Build/typecheck passando, com saída mostrada.
- [ ] Plano de migração por fases, riscos e próximos passos entregues.
- [ ] Trechos de PM2 (`laikao-api`, porta 4018) e nginx (`/api/`) entregues para eu aplicar, não aplicados sem aprovação.

---

Em qualquer dúvida de aparência ou comportamento de UI, a verdade é `laikao-site/`. Em qualquer dúvida de escopo, é este arquivo. Reproduza o aprovado, confirme o que não tiver certeza, e não invente o que este `CLAUDE.md` não autorizar.