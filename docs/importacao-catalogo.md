# Importação do catálogo (carga inicial)

Ferramenta manual para subir muitos produtos de uma vez. O cadastro do dia a dia continua sendo o admin (`/admin/produtos`). Esta importação é só para a carga inicial em volume.

## Como funciona

- **Idempotente:** o produto é identificado pelo `slug`. Rodar de novo o mesmo arquivo atualiza, não duplica.
- **Fora do runtime:** é um comando de terminal, não roda junto com o site. Não semeia o banco automaticamente.
- **Mesma qualidade do admin:** as imagens passam pelo mesmo processamento (sharp, vira WebP otimizado).
- **Categorias:** se a categoria do produto ainda não existir, ela é criada automaticamente (pelo `categoria_slug`, ou gerado a partir do nome).

## Passo a passo

1. Copie o modelo `catalogo-modelo.csv` (na raiz do projeto) e preencha uma linha por produto.
2. (Opcional) Coloque as fotos em uma pasta e aponte o caminho na coluna `imagem`, ou use uma URL pública.
3. **Teste primeiro no banco de teste** (`laikao_dev`), nunca direto em produção:
   ```bash
   DATABASE_URL="postgresql://USUARIO:SENHA@127.0.0.1:5432/laikao_dev?schema=public" \
     npm run catalog:import -- caminho/do/seu/catalogo.csv
   ```
4. Confira o relatório no fim (criados, atualizados, ignorados, erros com a linha e o motivo).
5. Abra `/produtos` e confira alguns itens.
6. Só depois, com a Cris/Mayra de acordo, rode com o `DATABASE_URL` de produção.

## Colunas do CSV

A primeira linha é o cabeçalho. A ordem das colunas não importa.

| Coluna | Obrigatória | Descrição |
|---|---|---|
| `nome` | sim | Nome do produto. |
| `descricao` | sim | Descrição curta. |
| `preco` | sim | Preço normal, em reais. Aceita `199.90` ou `199,90`. |
| `marca` | não | Marca (ex: Premier). |
| `categoria` | não | Nome da categoria (ex: Rações). |
| `categoria_slug` | não | Slug da categoria (ex: `racoes`). Se vazio, é gerado do nome. |
| `preco_promocional` | não | Preço da oferta, **menor** que o normal. Preenchido, a loja cobra ele e risca o normal. |
| `estoque` | não | Quantidade em estoque (número). Padrão 0. |
| `imagem` | não | URL (`https://...`) ou caminho local do arquivo (jpg, png ou webp). |
| `ativo` | não | `sim`/`nao`. Padrão `sim` (aparece na loja). |
| `destaque` | não | `sim`/`nao`. Padrão `nao`. |
| `slug` | não | Link do produto na loja. Se vazio, é gerado do nome. |
| `status` | não | `active`, `draft`, `out_of_stock` ou `archived`. Padrão `active`. |

## Sobre as imagens

- Caminho local é relativo à pasta onde você roda o comando (ou absoluto).
- Formatos aceitos: JPG, PNG e WebP, até 8MB.
- Para não acumular arquivos a cada rodada, a importação só processa a imagem quando o produto é **novo** ou ainda **não tem foto**. Para trocar a foto de um produto que já tem imagem, use o admin.

## Relatório e erros

No fim aparece um resumo:

```
=== Relatorio da importacao ===
Criados:     2
Atualizados: 0
Ignorados:   0
Erros:       0
===============================
```

Linhas com problema saem com o número da linha e o motivo (preço inválido, imagem não encontrada, etc.). A importação não para no meio: processa o resto e lista tudo no final. O comando termina com código de saída diferente de zero quando houver erros.
