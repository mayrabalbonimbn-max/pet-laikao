# Upload de imagens de promocoes (storage local)

## Onde os arquivos sao salvos
- Pasta local: `public/uploads/promotions/<ano>/<mes>/<dia>/`
- Arquivos gerados por upload:
  - imagem principal (`.webp`)
  - thumbnail (`-thumb.webp`)

## URL publica
- Base publica: `/uploads/promotions/...`
- As URLs sao retornadas pela API de upload e persistidas em `PromotionBanner`.

## Processamento aplicado
- Formatos aceitos: `jpg`, `jpeg`, `png`, `webp`
- Limite de tamanho: `PROMOTION_IMAGE_MAX_BYTES` (padrao: `8MB`)
- Normalizacao de orientacao (`rotate()`)
- Conversao/compressao para WebP
- Derivacoes:
  - principal: `1600x900`
  - thumb: `480x270`

## Troca futura de provider
- O dominio nao depende da UI.
- A abstracao esta em `server/storage/types.ts` e `server/storage/promotions-storage.ts`.
- Para trocar para outro provider, implementar a interface `PromotionImageStorage`.
