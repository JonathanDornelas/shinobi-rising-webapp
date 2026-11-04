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
  - o tamanho vai de 50% a 200%: o de todas fica em cada cena (`mesa_cenas.miniaturas`, `{ escala, sombra }`, porque cada
    mapa tem a sua escala); o de cada miniatura fica na campanha (`campanhas.miniaturas.ajustes`).
- **No quadro:**
  - todas as miniaturas têm a mesma altura: a figura cabe inteira no quadrado do token (0,9 do lado, do pé ou da base
    esculpida ao alto da cabeça, do porte do token redondo), vezes o tamanho de todas e o de cada uma;
  - a criatura cabe no quadrado também na largura (deitada, comprida ou de asas abertas): a medida dela é a maior entre a
    altura e a largura em todas as direções, e a Pequena ocupa 70% disso (um filhote não fica do tamanho do adulto). O
    quadrado é o do token, que cresce com o porte: Grande 3 × 3, Enorme 6 × 6, Colossal 10 × 10;
  - a figura fica de pé sobre uma base oval na cor do dono, com a vida e o nome debaixo dos pés e os estados numa fileira
    em cima da cabeça;
  - a direção mostrada segue a vista (na isométrica, o sul da grade aponta para baixo à esquerda); de cima, quem está mais
    embaixo na tela fica na frente;
  - a figura fica dentro do quadrado e no meio dele: de cima, os pés perto da borda de baixo; na isométrica, no centro do
    losango (o eixo do corpo é o centro do quadro do PixelLab);
  - a sombra (ligada por cena) é uma mancha suave no chão, sob os pés, um pouco puxada e alongada para o lado contrário da
    luz acesa mais perto (com a luz dinâmica); sem luz, puxa para trás e à direita (de cima) ou para a frente e à direita
    (na isométrica, onde para trás a figura a cobriria). Uma silhueta da figura deitada no chão foi tentada e saiu mal
    posicionada (e recortar um quadro da tira some na isométrica: o navegador erra o recorte sob a projeção);
  - Ctrl + seta vira a peça selecionada para aquele lado, sem andar; duas setas juntas viram na diagonal.
- **Na Mesa:**
  - no painel do token, "Peça no quadro" troca entre Token e Miniatura (o Mestre em qualquer token; o jogador no do
    próprio personagem);
  - a "Caixa de miniaturas" mostra todas em prateleiras (uma por clã ou criatura, com busca e filtro), a escolhida
    girando num pedestal na escala do quadro, e escolhe a do personagem ou NPC do token;
  - o Mestre ajusta ali o tamanho de todas nesta cena, o de cada miniatura e a sombra, e quem está na mesa vê na hora.

## Como fazer as miniaturas

O lote usa `pixellab/scripts/miniaturas.mjs` (`--clas` só os clãs; `--grupo a,b` só os verbetes que começam assim;
`--ver` mostra a fila e as descrições sem gerar; `--so slug#estagio --refazer` refaz uma):

1. Cada miniatura precisa de uma pose escrita à mão em `pixellab/miniaturas/poses.json`. A pose junta a técnica do clã e
   o jeito do personagem na arte dele: braço cruzado, mão no bolso, espada engatilhada, selo de jutsu na mão. Ela nunca
   se repete dentro do clã e nunca é genérica. Estágio sem pose fica fora do lote. `quem` descreve o personagem quando o
   pedido da arte não segue o padrão (Nível Anbu, alguns Jounin e Líderes) e em todo grupo de artes que são cenas (as
   vilas, os inimigos humanos). O Kage de uma vila tem o rosto escondido na sombra do chapéu ou do capuz.
2. O PixelLab desenha o personagem em 8 direções: `create_character`, modo `pro`, `size` 80, a arte do estágio no site
   como `concept_image_url` e o Chunin Uchiha escolhido como `style_character_id` (`--estilo`), que dá as proporções:
   perto das reais, nada de chibi. Só o texto pedindo "7 cabeças" não bastava; o que pede "a cabeça com um sétimo da
   altura, pernas longas" junto da referência acertou o Atarashi, que tinha saído cabeçudo. Custa 10 gerações.
   - `conceito` em poses.json troca a arte do estágio: o desenho de referência de uma homenagem da campanha (Atarashi
     Uchiha, Tatsumi Inuzuka), quando a arte é uma cena com várias pessoas, ou `null`, quando a figura da arte é pequena
     demais ou não aparece (cenas largas, close nos olhos): aí vale só a referência de estilo e o texto.
   - Na revisão, refazer a que lembra personagem famoso (saíram um Jiraiya e um Orochimaru) ou que vem com disco pintado
     no chão (a Mesa já desenha a sombra).
   - Pose compacta gira bem; estocada baixa com um arco largo de chakra não (o Ninja Médico Nível Anbu saiu de um jeito
     em cada direção e foi refeito de pé, com o bisturi de chakra na mão).
   - **Criaturas:** `corpo` em poses.json tira o texto de proporções humanas. Com o molde de quadrúpede do PixelLab
     (`dog`, `cat`, `bear`, `horse`, `lion`) para bichos de pé nas quatro patas, ou `animal` para o resto (aves,
     cobras, aranhas, lesmas, os bichos sentados ou deitados, os monstros de forma humana). A referência de estilo
     continua (não empurra o bicho para forma de gente). O quadro cresce com o porte: 80 px até Médio (10 gerações), 112
     px no Grande (15) e 128 px no Enorme e no Colossal (25, o máximo do modo pro). As artes das invocações são cenas com
     o invocador, então todo estágio tem `quem` à mão, e o texto manda ignorar as pessoas da arte. Alguns filhotes e
     bichos deitados vieram com uma sombra pintada no chão, em pixels opacos (não dá para tirar depois): o texto da
     criatura agora pede "no ground shadow and no base under it".
   - **Bestas com Cauda, em alta:** 128 px num token de 10 × 10 ficava com pouco pixel, e a primeira Kurama saiu
     cabeçuda. Elas são feitas fora do lote, em dois passos: `create_image_pro` desenha a besta de frente em 256 px a
     partir do quadro do anime (`pixellab/referencias/bestiario/paginas/<besta>.png`, como referência) e no estilo das
     miniaturas (o Chunin Uchiha como imagem de estilo), 10 gerações; depois `create_object_pro_flash` gira a
     escolhida nas 8 direções (só cobra o giro, 8 gerações). O resultado de `get_image` vem inline, um bloco de imagem
     por candidata; o do objeto vem com um link por direção. No catálogo, a besta guarda o `objeto` em vez do
     `personagem`.
   - **Arquétipos para jogadores:** figuras sem verbete no bestiário, na prateleira Arquétipos (a primeira da caixa),
     cada uma um tipo de combate da regra (as especializações do cap. 19, os Portões Internos e as armas do cap. 12),
     metade homens, metade mulheres, das várias vilas. Também em dois passos: `create_image_pro` em 128 px dá 4
     candidatas de frente, com o quadro do anime ou do mangá daquele tipo de combate como referência (equipamento,
     uniforme, traço) e a instrução de desenhar uma pessoa nova, nunca o personagem da referência; a escolhida vai para
     `pixellab/miniaturas/conceitos/<slug>.png` e vira o `conceito` de "arquetipos--<slug>" em poses.json (com
     `nome`), e o lote (`--grupo arquetipos`) desenha as 8 direções na receita de sempre dos humanos: mesma referência
     de estilo, mesmas proporções, mesma altura no quadro.
   - **A frente dos arquétipos:** com um conceito de frente, a direção sul sai copiada dele, com outro traço (mais ruidoso e
     mais escuro) e às vezes maior; as outras sete saem no estilo das miniaturas. Depois do lote, a frente é redesenhada
     pelo modo `v3` de `create_character`, com as direções giradas um passo: o sudeste entra como referência (o "sul" para a
     ferramenta), as outras em `direction_images` e falta só o sudoeste dela, que é a frente verdadeira, entre as duas vistas
     com rosto. Custa 1 geração. Girar 180° e usar as costas como referência não serve: em dois terços das vezes ela devolve
     as costas de novo.
   - **Consertar uma direção só:** quando uma direção destoa (a arma some, o arco abaixa, a mancha no chão), o mesmo modo
     `v3` recebe o sul como referência e as direções boas em `direction_images` e desenha só as que faltam, por 1 geração,
     sem tocar nas boas. Pedaços soltos do corpo (pedra, risco de vento) saem de graça, por componente conexo. Antes de
     chamar uma pose de errada, comparar com a vista de costas e com a direção do efeito: a chama no meio do corpo, de
     frente, estava certa. Refazer a frente com `create_image_pro` não compensa: 15 gerações e sai virada três quartos.
3. As 8 direções vão para `pixellab/miniaturas/<id>/`, e a miniatura entra em `pixellab/miniaturas/catalogo.json`.
4. `npx tsx scripts/mesa/miniaturas.ts` monta as tiras em `static/mesa/miniaturas/` e o catálogo do app (`src/lib/mesa/miniaturas.json`), na ordem do bestiário. Os pés ficam no centro do
   quadro do PixelLab; a altura da figura e o chão são medidos na faixa do meio do corpo (espada, areia ou água no chão
   não puxam para o lado).

## Direções de arte do teste (Uchiha Chunin)

| Direção | Como foi feita | Custo |
| - | - | - |
| Fiel à arte | `pro`, com a arte do bestiário como conceito | 10 gerações |
| Miniatura pintada | Pro Flash, com um recorte da arte como estilo; vem com base | 7 |
| Anime heroico | `v3` só com texto (saiu um Uchiha genérico) | 2 |
| Chibi tático | `v3` só com texto (leu o leque do clã como um leque de verdade) | 2 |
| Tinta sumi | `pro` com a arte como conceito e a paleta do site | 10 |
| Retrô 16 bits | `standard`, 32 px (ignora a pose) | 1 |

**Escolha (2026-11-03): Fiel à arte.** O Chunin Uchiha escolhido (`uchiha-chunin-fiel`) fica para sempre: é a referência de
estilo de todas. As outras cinco direções saíram do catálogo.

## Lotes feitos

| Grupo | Miniaturas |
| - | - |
| Clãs | 65 |
| Especialistas em elementos | 70 |
| Shinobis das vilas | 40 |
| Outros inimigos humanos (shinobi, fora da lei, organizações, sennin) | 67 |
| Criaturas, companheiros e invocações (as 9 Bestas com Cauda em 256 px) | 100 |
| Arquétipos para jogadores | 60 |
