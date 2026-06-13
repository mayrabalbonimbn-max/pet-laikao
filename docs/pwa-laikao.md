# PWA do Pet Shop Laikao

## Instalacao
- Android/Chrome: abrir o site e tocar em **Instalar app** no banner.
- iPhone/iOS: abrir no Safari, tocar em **Compartilhar** e depois **Adicionar a Tela de Inicio**.

## O que funciona offline
- Navegacao para paginas publicas em cache:
  - `/`
  - `/servicos`
  - `/produtos`
  - `/promocoes`
  - `/contato`
  - `/offline`
- Assets estaticos (css/js/font/imagens ja visitados) podem abrir sem rede.

## O que nao funciona offline
- Fluxos que dependem de backend em tempo real:
  - `/agenda`
  - `/carrinho`
  - `/checkout`
  - `/admin/*`
  - `/api/*`

## Estrategia de cache
- Navegacao publica: **network first** com fallback para cache/offline.
- Assets estaticos: **cache first** com preenchimento de runtime cache.
- Rotas sensiveis: sem interceptacao de cache.
