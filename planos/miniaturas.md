# Miniaturas na Mesa

O token pode aparecer no quadro como uma miniatura de pé, em pixel art e em 8 direções, no lugar do retrato no círculo.
O teste começou com um NPC só, o Uchiha Chunin do bestiário, em seis direções de arte.

## Como funciona

- **No banco:** `mesa_tokens.miniatura` guarda o id do catálogo (null = token redondo). `mesa_tokens.rumo` guarda para onde
  a peça olha na grade (0 sul ... 7 sudoeste) e muda a cada passo, junto com a posição.
- **No quadro:** a figura fica de pé sobre uma base oval na cor do dono, com a vida e o nome debaixo dos pés e os estados
  numa fileira em cima da cabeça. A direção mostrada segue a vista (na isométrica, o sul da grade aponta para baixo à
  esquerda). De cima, quem está mais embaixo na tela fica na frente.
- **Para o Mestre:**
  - no painel do token, "Peça no quadro" troca entre Token e Miniatura e escolhe a direção de arte;
  - a "Caixa de miniaturas" (no painel do token e no elenco, ao lado de NPCS) mostra a peça girando num pedestal, na
    escala do quadro, e troca os tokens do NPC na cena de uma vez.
- **Clones:** saem com a mesma peça do original.

## Como fazer uma miniatura nova

1. No PixelLab, gerar o personagem em 8 direções (`create_character`), de frente (sul) e em postura de combate. O modo
   `pro` com `concept_image_url` apontando para a arte do bestiário foi o mais fiel.
2. Salvar as 8 direções em `pixellab/miniaturas/<id>/<rumo>.png` (south, south-east, east, north-east, north,
   north-west, west, south-west).
3. Pôr a miniatura em `pixellab/miniaturas/catalogo.json`, com o estágio do bestiário (`slug#estágio`), o nome e a direção
   de arte (`base: true` se ela já vem com a base esculpida).
4. Rodar `npx tsx scripts/mesa/miniaturas.ts`, que monta as tiras em `static/mesa/miniaturas/` e o catálogo
   `src/lib/mesa/miniaturas.json`.

## Direções de arte do teste (Uchiha Chunin)

| Direção | Como foi feita | Custo |
| - | - | - |
| Fiel à arte | `pro`, com a arte do bestiário como conceito | 10 gerações |
| Miniatura pintada | Pro Flash, com um recorte da arte como estilo; vem com base | 7 |
| Anime heroico | `v3` só com texto (saiu um Uchiha genérico) | 2 |
| Chibi tático | `v3` só com texto (leu o leque do clã como um leque de verdade) | 2 |
| Tinta sumi | `pro` com a arte como conceito e a paleta do site | 10 |
| Retrô 16 bits | `standard`, 32 px (ignora a pose) | 1 |

**Escolha (2026-11-03): Fiel à arte.** As próximas miniaturas seguem a mesma receita: `create_character` no modo `pro`,
`size` 80, `concept_image_url` com a arte do estágio no site (`/bestiario/<verbete>--<estágio>.png`) e a descrição do
personagem em postura de combate, de frente. As outras cinco ficam no catálogo enquanto o teste durar.
