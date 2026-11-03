# Miniaturas na Mesa

O token pode aparecer no quadro como uma miniatura de pé, em pixel art e em 8 direções, no lugar do retrato no círculo.
Cada inimigo do bestiário ganha a sua miniatura, em lotes: primeiro os clãs. Personagens e NPCs criados escolhem a deles
entre todas as que já existem.

## Como funciona

- **No banco:**
  - `mesa_tokens.miniatura` guarda o id do catálogo (null = token redondo).
  - `mesa_tokens.rumo` guarda para onde a peça olha na grade (0 sul ... 7 sudoeste) e muda a cada passo, junto com a
    posição.
  - `personagens.miniatura` e `npcs.miniatura` guardam a escolha. `definir_miniatura()` grava (o Mestre para qualquer um;
    o jogador para o próprio personagem), um gatilho leva a escolha aos tokens dele em todas as cenas, e o token novo
    nasce com ela (o clone, com a do original).
  - `campanhas.miniaturas` guarda o tamanho: `{ escala, ajustes: { id: escala } }`, de 50% a 200%.
- **No quadro:**
  - todas as miniaturas têm a mesma altura (1,7 m num token 1 × 1, do pé ou da base esculpida ao alto da cabeça), vezes o
    tamanho de todas e o de cada uma;
  - a figura fica de pé sobre uma base oval na cor do dono, com a vida e o nome debaixo dos pés e os estados numa fileira
    em cima da cabeça;
  - a direção mostrada segue a vista (na isométrica, o sul da grade aponta para baixo à esquerda); de cima, quem está mais
    embaixo na tela fica na frente.
- **Na Mesa:**
  - no painel do token, "Peça no quadro" troca entre Token e Miniatura (o Mestre em qualquer token; o jogador no do
    próprio personagem);
  - a "Caixa de miniaturas" mostra todas em prateleiras (uma por clã ou criatura, com busca e filtro), a escolhida
    girando num pedestal na escala do quadro, e escolhe a do personagem ou NPC do token;
  - o Mestre ajusta ali o tamanho de todas as miniaturas da campanha e o de cada uma, e quem está na mesa vê na hora.

## Como fazer as miniaturas

O lote usa `pixellab/scripts/miniaturas.mjs` (`--clas` só os clãs; `--ver` mostra a fila e as descrições sem gerar):

1. Cada miniatura precisa de uma pose escrita à mão em `pixellab/miniaturas/poses.json`. A pose junta a técnica do clã e
   o jeito do personagem na arte dele: braço cruzado, mão no bolso, espada engatilhada, selo de jutsu na mão. Ela nunca
   se repete dentro do clã e nunca é genérica. Estágio sem pose fica fora do lote. `quem` descreve o personagem quando o
   pedido da arte não segue o padrão (Nível Anbu, alguns Jounin e Líderes).
2. O PixelLab desenha o personagem em 8 direções: `create_character`, modo `pro`, `size` 80, a arte do estágio no site
   como `concept_image_url`. Custa 10 gerações.
3. As 8 direções vão para `pixellab/miniaturas/<id>/`, e a miniatura entra em `pixellab/miniaturas/catalogo.json`.
4. `npx tsx scripts/mesa/miniaturas.ts` monta as tiras em `static/mesa/miniaturas/` e o catálogo do app
   (`src/lib/mesa/miniaturas.json`), na ordem do bestiário.

## Direções de arte do teste (Uchiha Chunin)

| Direção | Como foi feita | Custo |
| - | - | - |
| Fiel à arte | `pro`, com a arte do bestiário como conceito | 10 gerações |
| Miniatura pintada | Pro Flash, com um recorte da arte como estilo; vem com base | 7 |
| Anime heroico | `v3` só com texto (saiu um Uchiha genérico) | 2 |
| Chibi tático | `v3` só com texto (leu o leque do clã como um leque de verdade) | 2 |
| Tinta sumi | `pro` com a arte como conceito e a paleta do site | 10 |
| Retrô 16 bits | `standard`, 32 px (ignora a pose) | 1 |

**Escolha (2026-11-03): Fiel à arte.** As outras cinco ficam no catálogo enquanto o teste durar.
