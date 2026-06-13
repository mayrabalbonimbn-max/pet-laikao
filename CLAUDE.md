# CLAUDE.md — Guia de Design e UI/UX do site Pet Shop Laikão

Este documento é a fonte de verdade para reconstruir o site da **Pet Shop Laikão** no projeto Next.js, seguindo **à risca** o design e a UX já aprovados. Leia tudo antes de escrever código. Não improvise estilo, cor, tom de voz ou estrutura: o que está aqui já foi decidido.

A referência visual pronta está nos arquivos HTML/CSS/JS de `laikao-site/` (versão com `styles.css` + `app.js` separados). Use-os como espelho fiel do resultado esperado.

---

## 0. Regras invioláveis (leia primeiro)

Estas regras valem para o site inteiro. Quebrar qualquer uma delas é considerado erro.

1. **Nada de jargão técnico para o cliente.** Nunca exibir termos como "checkout integrado da InfinitePay", "state machine", "hold temporário", "catálogo centralizado em domínio". O cliente é dono de pet, não desenvolvedor. Toda copy visível é calorosa e simples.
2. **As páginas Produtos e Promoções nunca podem aparecer vazias para o cliente.** Nada de "0 produtos", "Nenhum produto encontrado" como estado da página, nem "Em breve" como página inteira. Estado vazio só é aceitável quando o próprio cliente filtra e não acha nada (e mesmo assim com mensagem amigável e botão de limpar filtro).
3. **Identidade é rosa + roxo, calorosa e de bairro.** Não é SaaS minimalista, não é corporativo, não é o roxo lavado do site antigo. Use a paleta definida na seção 2.
4. **Sem em-dash (—) em nenhuma copy.** Use vírgula, dois-pontos, ponto ou parênteses.
5. **A Cris aparece.** Quem cuida tem nome e rosto. Mantenha os espaços de foto da Cris e da loja, e o selo "Atendida pela Cris".
6. **Mobile-first.** Tudo precisa funcionar bem a partir de 360px de largura.
7. **Dados reais sempre.** Use os links, endereço, telefone, serviços e preços da seção 8. Não invente dado de contato.

---

## 1. Contexto e objetivo

A Pet Shop Laikão é um pet shop de bairro na Vila Nova Cachoeirinha, Zona Norte de São Paulo, da Cris. Faz banho e tosa, vende produtos (ração, petisco, higiene, beleza, acessórios, brinquedos), entrega pelo iFood até meia-noite e atende presencialmente.

O site antigo falhava porque: traía a marca (roxo corporativo, sem rosa, sem pets, sem a Cris), tinha páginas mortas (Produtos com "0 produtos", Promoções com "Em breve"), vazava jargão de dev para o cliente e tinha copy que descrevia o próprio design em vez de falar com a pessoa.

O objetivo do novo site é parecer um pet shop querido e confiável, vender produtos de forma simples e deixar o agendamento fácil.

**Tagline oficial:** "Paixão que une, amor que cuida."

---

## 2. Design tokens

Defina exatamente estes valores. No Next, coloque em `app/globals.css` dentro de `:root` (ou no `@theme` se usar Tailwind v4). Não altere os hex.

```css
:root{
  /* cores */
  --rosa:#E5197F;          /* cor de marca principal, CTAs */
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

  /* forma */
  --raio:22px;             /* cards */
  --raio-sm:14px;
  --sombra:0 18px 40px -20px rgba(74,21,104,.35);
  --sombra-suave:0 10px 30px -18px rgba(74,21,104,.30);
  --container:1140px;      /* largura máxima do conteúdo */
}
```

Regra de uso de cor:
- Fundo geral do site: `--creme`. Seções alternadas: `--lavanda`.
- Texto de título: `--roxo-profundo`. Texto corpo: `--carvao`. Texto secundário: `--tinta-suave`.
- Ação principal (botão rosa) só para a ação mais importante de cada bloco. WhatsApp sempre verde. iFood sempre na cor iFood.
- Faixa e rodapé escuros usam `--roxo-profundo` com texto branco.

---

## 3. Tipografia

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

## 4. Elemento de assinatura: o selo

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

## 5. Componentes (reproduzir exatamente)

Cada componente abaixo já existe no CSS de referência (`styles.css`). Porte-os como componentes React reutilizáveis.

### 5.1 Header / navegação (`<Header/>`)
- Sticky no topo, fundo `--creme` com `backdrop-filter: blur(10px)` e borda inferior `--linha`. Altura 70px.
- Esquerda: marca = selo redondo rosa com patinha + "Pet Shop" (roxo profundo) "Laikão" (rosa), em Baloo 2.
- Centro/direita (desktop ≥980px): nav com 5 links (Início, Serviços, Produtos, Promoções, Contato). O link da página atual recebe `aria-current="page"` e a classe ativa (cor rosa + sublinhado animado que cresce da esquerda).
- Direita: botão rosa "Agendar".
- Mobile (<980px): nav some, aparece o botão hambúrguer que abre um menu vertical (`.menu-mob`). O menu fecha ao clicar em qualquer link. Use `aria-expanded` no botão.

### 5.2 Botões (`<Botao/>`)
Variantes (pílula, min-height 48px, Baloo 2 peso 700):
- `btn--rosa`: fundo `--rosa`, hover `--rosa-claro` + translateY(-2px). Ação principal.
- `btn--roxo`: fundo `--roxo-profundo`. Ação secundária escura.
- `btn--linha`: fundo branco, borda interna `--linha`, hover borda rosa. Ação terciária.
- `btn--zap`: fundo `--verde`. Sempre que a ação for WhatsApp.
- `btn--claro`: translúcido branco, só dentro de bandas coloridas.
- Foco visível obrigatório: `outline:3px solid var(--rosa-claro); outline-offset:3px`.

### 5.3 Herói (home)
- Duas colunas no desktop (texto + moldura de foto), uma coluna no mobile.
- Blobs de fundo (rosa-suave e lavanda) com blur, decorativos, `z-index:0`.
- Conteúdo: selo, h1 com palavra-chave em rosa, tagline em itálico, subtítulo, dois botões (Agendar rosa + WhatsApp verde), e três "chips" (Banho e tosa, iFood até meia-noite, Entrega ou retirada).

### 5.4 Moldura de foto (`<MolduraFoto/>`)
- `aspect-ratio` 4/5 (ou 1/1 na variante quadro), cantos arredondados, `outline:5px solid #fff` por dentro, borda tracejada interna, sombra.
- **Fallback obrigatório:** quando não há foto, mostra fundo em degradê da marca + patinha grande + legenda ("Coloque aqui uma foto da Cris com um pet feliz"). Nunca pode aparecer espaço quebrado.
- Quando houver imagem real, ela cobre tudo com `object-fit:cover`.
- Componente recebe `src?`, `alt`, `legenda`, `variante`.

### 5.5 Cabeçalho de página interna (`<PageHead/>`)
Para Serviços, Produtos, Promoções e Contato. Selo + h1 (palavra em rosa) + parágrafo + ações opcionais. Blob radial decorativo no canto.

### 5.6 Faixa rápida
Barra `--roxo-profundo`, texto branco, 4 itens com ícone (horário, bairro, telefone, @instagram). Vira coluna no mobile.

### 5.7 Cards de serviço
Card branco, ícone em quadrado `--rosa-suave`, título, descrição, bloco de meta (Valor + Duração em Baloo 2) e duas ações: "Agendar" (rosa) e "Ver detalhes" (linha).

### 5.8 Loja / Produtos (ver seção 6 para a lógica)
- Layout duas colunas no desktop: sidebar de filtros (260px) + vitrine. Uma coluna no mobile.
- Sidebar: busca com ícone de lupa + lista de categorias (botões, o ativo fica rosa, com contagem).
- Topo da vitrine: contador "N produtos" + select de ordenação.
- Grade de produtos responsiva (1 / 2 / 3 colunas conforme largura).
- Card de produto: thumb com ícone-fallback por categoria, tag de categoria, selo de estado (Oferta / Últimas unidades / Indisponível), marca, nome, descrição, preço (com preço "antes" riscado quando em promoção) e botão "Adicionar". Estado indisponível desabilita o botão.

### 5.9 Carrinho (drawer)
- Botão flutuante `cart-fab` (roxo profundo) com badge de quantidade. Fica acima do botão de WhatsApp.
- Abre um drawer lateral da direita com overlay. Fecha por overlay, botão X ou tecla Esc.
- Lista de itens com thumb, nome, preço, controle de quantidade (− e +) e remover.
- Rodapé do drawer: total + nota sobre confirmação no atendimento + botão verde "Finalizar no WhatsApp".
- Estado vazio do carrinho: ícone + mensagem amigável.

### 5.10 Cards de promoção
Card branco com "faixinha" (categoria da oferta em rosa, caixa-alta), título, descrição e CTA. Variante `promo--futuro` (tracejada, fundo lavanda) para o estado "novas campanhas em breve". Destaque grande em degradê roxo→rosa no topo da página.

### 5.11 Contato
4 vcards (WhatsApp, Instagram, Endereço, Horário) com ícone, texto e link. Mapa do Google embutido via `<iframe>` (`output=embed`, sem precisar de API key). Nota de LGPD ligando à política de privacidade.

### 5.12 Rodapé
Fundo `--roxo-profundo`. Três colunas: marca + endereço + horário; navegação; canais. Linha final com copyright e links de privacidade/termos/trocas.

### 5.13 WhatsApp flutuante
Botão redondo verde fixo no canto inferior direito, em todas as páginas, com `aria-label`.

---

## 6. A loja: modelo de dados e comportamento

A loja é client-side na referência, com checkout via WhatsApp. No Next, monte como Client Component (ou conecte ao backend/checkout real da Laikão se já existir; nesse caso mantenha a mesma UI).

### Modelo de produto
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

### Comportamento exigido
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

## 7. Estrutura de rotas (Next App Router)

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

## 8. Conteúdo real (usar exatamente)

**Contato e endereço**
- Endereço: Rua Franklin do Amaral, 271, Vila Nova Cachoeirinha, São Paulo SP
- Horário: segunda a sábado, das 8h às 19h (iFood até meia-noite)
- Telefone/WhatsApp: (11) 98051-2871 → link `https://wa.me/5511980512871`
- Instagram: @pet_laikao → `https://instagram.com/pet_laikao`
- iFood: `https://www.ifood.com.br/delivery/sao-paulo-sp/pet-shop-laikao-vila-nova-cachoeirinha/d7c31af8-0c1f-4649-b99b-0aaf09ce7adf?UTM_Medium=share`
- Mapa (iframe): `https://www.google.com/maps?q=Rua+Franklin+do+Amaral+271,+Vila+Nova+Cachoeirinha,+Sao+Paulo,+SP&output=embed`

**Serviços (valores reais)**
- Banho e tosa premium: R$ 110, 90 min. Detalhe: `/servicos/banho-e-tosa-premium`
- Banho terapêutico: R$ 78, 60 min. Detalhe: `/servicos/banho-terapeutico`
- Tosa higiênica: R$ 65, 45 min. Detalhe: `/servicos/tosa-higienica`
- Também fazem: hidratação, escovação, corte de unhas. Atendem cães e gatos.
- Nota de cuidado (manter): pet com pulga ou carrapato precisa ser medicado na hora, para não contaminar o ambiente nem os outros clientes.

**Produtos visíveis na comunicação** (use como base, confirme preços com a Cris): Premier (ração), Golden (ração), bifinho/petisco, Shampoo Neutro 500ml, Spray Hidratante 250ml, Spray Higiene e Perfume 250ml, coleira, comedouro, brinquedos.

**Páginas de política existentes** (linkar no rodapé): `/privacidade`, `/termos`, `/trocas-e-devolucoes`, `/politica-de-agendamento`.

---

## 9. Tom de voz e copy

Caloroso, de bairro, direto, sem firula técnica. Fala com o dono do pet, não com outro dev.

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

## 10. Acessibilidade e responsividade

- Breakpoints usados na referência: 520, 680, 760, 900, 920, 980, 1020, 1080px. Mantenha a lógica mobile-first.
- Contraste: texto sobre fundo claro usa `--carvao`/`--roxo-profundo`; sobre rosa/roxo usa branco. Não use `--tinta-suave` sobre cor forte.
- Todo controle interativo tem foco visível (outline rosa).
- `prefers-reduced-motion`: desligar animações de reveal e transições. Já está no CSS de referência, mantenha.
- Imagens com `alt` descritivo. Ícones decorativos com `aria-hidden`. Botões de ícone com `aria-label`.
- Toque mínimo 44–48px de altura nos botões.
- Animação de entrada (`reveal`) via IntersectionObserver; no Next, encapsule num componente client ou use CSS puro. Conteúdo deve ser legível mesmo sem JS.

---

## 11. Checklist final (rodar antes de dar como pronto)

- [ ] As 5 rotas existem e a navegação entre elas funciona, com link ativo correto.
- [ ] Header e footer vêm do layout compartilhado (não duplicados).
- [ ] Paleta rosa + roxo aplicada; nenhum resquício do roxo lavado antigo.
- [ ] Nenhum SVG sem width/height (nada de patinha gigante azul).
- [ ] Fontes Baloo 2 + Nunito carregando via next/font.
- [ ] Produtos: busca, filtro de categoria, ordenação, carrinho e checkout WhatsApp funcionando.
- [ ] Carrinho persiste e fecha por overlay/X/Esc.
- [ ] Produtos e Promoções nunca aparecem vazias para o cliente.
- [ ] Zero jargão técnico em texto visível.
- [ ] Zero em-dash na copy.
- [ ] Espaços de foto da Cris e da loja com fallback (nada quebrado sem imagem).
- [ ] Mapa, WhatsApp, Instagram e iFood com os links reais da seção 8.
- [ ] Responsivo testado em 360, 375, 768, 1024 e desktop.
- [ ] Foco visível e `prefers-reduced-motion` respeitado.
- [ ] Metadata e theme-color por página.

---

## 12. Como usar este guia

1. Comece pelos tokens (seção 2) e fontes (seção 3) em `globals.css` e `fonts.ts`.
2. Monte o layout compartilhado com Header, Footer e ZapFloat.
3. Construa os componentes da seção 5 isolados, conferindo contra `styles.css`.
4. Monte as 5 páginas com o conteúdo real da seção 8.
5. Implemente a loja (seção 6) por último, como client component.
6. Rode o checklist da seção 11.

Em qualquer dúvida de aparência, o comportamento correto é o que está nos arquivos de `laikao-site/`. Reproduza, não reinvente.
