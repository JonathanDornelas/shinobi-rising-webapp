# Luz dinâmica e mapas grandes na Mesa

## Pedido

O usuário pediu duas coisas:

- luz dinâmica que se abre conforme os jogadores avançam;
- mapas bem grandes, para explorar como dungeon;
- tudo funcionando na vista de cima e na isométrica.

Depois pediu também 3 demos de cada vista, já configuradas.

## Decisões do usuário

1. **Visão:** individual, com o mapa explorado do grupo.
   - Cada jogador vê só o que os próprios tokens enxergam agora.
   - O que qualquer um já viu fica esmaecido para todos, sem mostrar inimigos.
   - O Mestre vê tudo e pode ligar "ver como o grupo vê".
2. **Iluminação completa:**
   - níveis de luz da cena: claro, penumbra e escuro;
   - luzes no mapa e luz que o token carrega (vela, tocha, lampião), com luz plena e penumbra.
3. **Paredes:**
   - desenhadas no quadro, com o arrasto;
   - também importadas de mapas Universal VTT (.dd2vtt, .uvtt), que trazem imagem, paredes, portas e luzes.
4. **Mapa grande:**
   - ladrilhos de 1024 px, com até 8192 px no lado maior;
   - a Mesa mostra a prévia de 2048 px de longe e, de perto, só os ladrilhos que aparecem.

## Como funciona

**Dados:** migração `20261122120000_mesa_luz_dinamica`.

- `mesa_cenas`:
  - `luz_dinamica` e `luz_ambiente`;
  - `paredes`: `[x1, y1, x2, y2, tipo]`, com o tipo assim: 0 parede, 1 porta fechada, 2 aberta, 3 trancada, 4 janela;
  - `luzes`;
  - `fundo_ladrilhos`.
- `mesa_tokens.luz` e `mesa_artes.ladrilhos`.
- A função `mesa_porta` deixa o jogador abrir e fechar uma porta com o token a até 2,5 m dela. A porta trancada, só o
  Mestre abre.

**Conta:** tudo em metros da grade. A isométrica só projeta, então o mesmo cálculo serve às duas vistas.

- `src/lib/mesa/visao.ts`: o polígono de visão a partir de um ponto, com raios até as pontas das paredes.
- `src/lib/mesa/luz.ts`:
  - o que cada um vê: o alcance e, no escuro, só o iluminado;
  - a exploração, gravada nos quadrados revelados da névoa;
  - o bloqueio de passo e o encaixe das pontas.
- Uma cache por posição evita recalcular os outros tokens quando um anda. Mover um token cabe em dois quadros de tela.

**Desenho:** `LuzMesa.svelte`, dentro do grupo da grade.

- A escuridão é uma máscara: o que se vê vaza, e as luzes somam multiplicando.
  - A máscara sai desfocada (0,22 m) para a borda da visão e as sombras ficarem suaves. O que o grupo nunca viu desfoca
    mais (0,45 m), para não aparecer a escada dos quadrados.
- A escuridão fica sob os tokens: quem joga só recebe os tokens que estão à vista.
- Uma moldura de breu cobre o alto das paredes da borda na isométrica.

**Exploração:** o navegador do Mestre grava o que o grupo viu, 0,7 s depois de os tokens pararem. Os jogadores não
podem gravar a cena. Até a gravação chegar, cada jogador já vê a própria área revelada na hora.

**Ferramentas do Mestre:**

- Paredes (R): parede, porta, janela, mover pontas, apagar.
  - Porta ou janela traçada por cima de uma parede toma o lugar daquele trecho: a conta (`paredesEfetivas`) corta a
    parede ali, sem mexer no que está gravado; apagar a porta devolve a parede inteira.
  - No Apagar, a porta e a janela vêm antes da parede de baixo; o gesto que começa numa delas só apaga portas e janelas.
- Luz (U): ambiente, fonte que o clique põe, alças dos raios, acender e apagar, "ver como o grupo", esquecer a exploração.
- Portas: um clique no marcador, com a ferramenta Mover.

**Passo:** com "Paredes barram os jogadores" ligado (o padrão, `paredes_bloqueiam`), o jogador não atravessa
parede nem porta fechada ou trancada: passa só por porta aberta e por janela. O Mestre arrasta por onde quiser. Vale
para o arrasto e para as setas do teclado; o arrasto é medido em linha reta, de onde o token estava até onde caiu.

## Demos

`scripts/mesa/demos.ts` desenha três mapas em pixel art, cada um nas duas vistas:

- Esconderijo da Serpente, no escuro;
- Templo em Ruínas, na penumbra;
- Casa de Chá, no claro.

A mesma planta dá a arte e as paredes, as portas e as luzes, então tudo bate pixel a pixel. A saída fica em
`static/mesa/demos` e em `src/lib/mesa/demos.json`.

Na Mesa, a janela "Nova cena" oferece as seis como modelo. A lista só é carregada ao abrir a janela.

## Fica para depois

- Visão no escuro por clã ou jutsu (Byakugan, cães Inuzuka).
- Paredes que bloqueiam só um lado.
- Luz colorida.
