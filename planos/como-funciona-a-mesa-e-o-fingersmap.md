# Como funcionam a Mesa e o fingersMap

Escrito em 2026-11-07, para quem quer entender os pormenores: as stacks, o caminho de um mapa do editor até a mesa de jogo, onde cada arte é carregada e como a Mesa replica o que cada um faz para todos com o menor atraso possível. Os nomes de arquivo levam ao código.

## Visão geral

```
fingersMap (editor, Windows ou navegador)
   └─ Exportar para a Mesa ──► cena.fmesa  (ZIP: cena.json, mapa.fmap, pacote.json, pacote.pack, fundo.png)
                                    │
Rising Shinobi, a Mesa              ▼
   Mestre importa ──► Supabase Storage   mapas/<campanha>/<lote>/mapa.fmap, pacote.json, pacote.pack
                  └─► Supabase Postgres  mesa_cenas (paredes, luzes, terreno, mapa_vivo), mesa_objetos (marcadores)
                                    │
   cada navegador na mesa ◄─────────┘ baixa o mapa e a arte, e roda o motor do fingersMap num canvas sob o quadro SVG
        ▲         │
        └─────────┴── Supabase Realtime: broadcast (o caminho rápido) e postgres_changes (a confirmação do banco)
```

O motor é o mesmo nos dois lados: o editor desenha com ele, e a Mesa recebe uma cópia num arquivo só (`src/lib/mesa/motor/player.js`, gerado em `../fingersMap` por `npm run levar-para-mesa`). Por isso um mapa aparece na Mesa exatamente como no editor, com a luz, a profundidade e o clima de verdade.

## As stacks

| | fingersMap | Rising Shinobi |
| --- | --- | --- |
| Interface | SvelteKit 3, Svelte 5, Tailwind 4, paneforge | SvelteKit, Svelte 5, Tailwind |
| Desenho | Three.js só como camada de GPU (`WebGLRenderer`, `RawShaderMaterial`, GLSL3), com shaders próprios | O motor do fingersMap num canvas, e um SVG por cima com vida, nomes, réguas e moldes |
| Dados | Mapa em arrays tipados por pedaço de 32 × 32, fora da reatividade; undo por comandos; `.fmap` é um ZIP (`fflate`) | Supabase: Postgres com RLS, Storage, Realtime |
| Hospedagem | Nenhuma: programa Electron (`apps/desktop`) ou `npm run dev` | Vercel (região gru1) e Supabase em São Paulo |
| Organização | npm workspaces: `format`, `engine`, `tools`, `export`, `player`, `apps/editor`, `apps/desktop` | `src/lib/mesa/*` (estado e regras), `src/lib/componentes/mesa/*` (quadro) |

No fingersMap, cada pacote tem uma tarefa:
- `packages/format` define o mapa e o arquivo, sem DOM;
- `packages/engine` desenha;
- `packages/tools` reúne pincéis, paredes, telhados, fileiras e geradores;
- `packages/export` monta a cena da Mesa e faz o Verificar;
- `packages/player` é o motor sem o editor, a parte que vai para a Mesa.

## O motor, em uma página

Cada quadro passa por quatro etapas (`packages/engine/src/renderer.ts`):

1. **G-buffer.** Cada sprite escreve, por pixel, a cor, a normal e o id de seleção, em três alvos ao mesmo tempo (MRT), e o z-buffer decide quem fica na frente. A profundidade sai da altura de cada pixel, guardada na arte. Com alfa binário, nada precisa ser ordenado: parede comprida, prédio redondo e token caem na ordem certa sozinhos. Telhados e fios são triângulos construídos pelo motor e entram nos mesmos buffers.
2. **Luz.** Começa com ambiente e sol, com sombra por ray-march num mapa de alturas visto de cima. É um por andar, guardado numa janela de 320 tiles em volta da câmera. Depois vem um quad somado por lâmpada.
3. **Composição.** A cor encontra a luz em faixas, com dither Bayer preso à grade. Entram aqui a neblina, a neve, as poças e a sombra das miniaturas. A máscara de visão da Mesa também é lida aqui, pela posição de cada pixel no mundo.
4. **Apresentação.** A imagem vai ao canvas em pixels inteiros.

## Do editor à Mesa: o `.fmesa`

A exportação fica em `apps/editor/src/lib/editor/mesa-export.ts`.

| Arquivo | O que é |
| --- | --- |
| `cena.json` | A cena para o banco. Leva tamanho, andar, ar (hora, clima, força, vento) e paredes em segmentos `[x1, y1, x2, y2, tipo]`. As portas dos andares de cima vêm no fim, com o andar como sexto número. Também leva luzes, ambiente, terreno difícil, escuridão e marcadores (`packages/export/src/mesa.ts`, `sceneOf`) |
| `mapa.fmap` | O mapa inteiro, sem a imagem de referência |
| `pacote.json` e `pacote.pack` | Só a arte que o mapa usa (`trimPack`). O `.json` é a lista de sprites; o `.pack` é um blob em gzip com dois planos por sprite: a cor, e o "aux", com normal, altura e brilho |
| `fundo.png` | Uma imagem do andar inteiro, para quem não roda o motor. Desenhada em janelas de 1536 × 1024, uma por quadro de tela, para não sobrecarregar a placa |

## A importação na Mesa

O Mestre abre o `.fmesa` em Configurar cena (`src/lib/componentes/mesa/ConfigCena.svelte`, `importarFingersMap`):

1. **Conferir.** `lerFingersMap` (`src/lib/mesa/fingersmap.ts`) confere o arquivo inteiro antes de qualquer pedido de rede:
   - tamanhos máximos por parte;
   - assinatura de PNG, ZIP e gzip;
   - números dentro da cena;
   - tipos conhecidos.
   Nada que veio de fora passa sem formato.
2. **Imagem de reserva.** `enviarArte` manda o `fundo.png` para o bucket `mesa`, cortado em ladrilhos webp quando é grande.
3. **Mapa e arte.** `enviarMapaVivo` (`src/lib/mesa/artes.ts`) manda `mapa.fmap`, `pacote.json` e `pacote.pack` para `mapas/<campanha>/<lote>/`.
   - Cada importação ganha uma pasta nova, com `cache-control` de um ano.
   - Um arquivo nunca muda de conteúdo no mesmo endereço, então o navegador e a CDN podem guardar tudo para sempre.
4. **A cena.** `mesa.patchCena` grava as paredes (as do andar e, depois delas, as portas de cima), as luzes, o terreno e `mapa_vivo`. O `mapa_vivo` guarda os caminhos dos arquivos, o andar, a hora, o clima, os telhados, o corte e a escuridão.
5. **Marcadores.** `mesa.marcadoresDoMapa` troca os alfinetes do mapa anterior pelos novos, com a camada `fm-<tipo>`. Os escondidos (`visivel = false`) só chegam ao Mestre, pela regra do banco.
6. **Limpeza.** Os arquivos da importação anterior saem do bucket (`apagarMapaVivo`).

## Onde a arte é carregada quando a cena abre

1. **O quadro pede o motor.** O quadro (`QuadroMesa.svelte`) vê que a cena tem `mapa_vivo` e chama `MotorDaMesa.abrir` (`src/lib/mesa/motor.svelte.ts`).
2. **Código e mapa juntos.** Dois pedidos saem ao mesmo tempo: o `import()` dinâmico de `player.js` e o `fetch` do `mapa.fmap`.
   - O código do motor (cerca de 750 KB, 180 KB comprimido) só vem para quem abre uma cena com mapa vivo. Uma cena comum não paga por ele.
3. **O player abre.** `MapPlayer.open` lê o `.fmap` e chama `loadPack` (`packages/engine/src/pack.ts`).
   - `loadPack` busca `pacote.json` e `pacote.pack` na URL pública do bucket.
   - O gzip é aberto no próprio navegador, com `DecompressionStream`.
   - Os sprites vão para um `SpriteAtlas`: um array de texturas na GPU, um para a cor e outro para o aux.
4. **O mapa vira pedaços.** `MapView.show` monta os pedaços de 32 × 32 tiles como instâncias: cada sprite é uma linha de 8 floats (posição, sprite, flags, viés, id, escala). Os telhados viram triângulos, e a janela de oclusão em volta da câmera recebe o mapa de alturas.
5. **Miniaturas.** Cada token vira um sprite vivo (`addFigure`), montado em `src/lib/mesa/figuras.ts`:
   - de um quadro da tira da miniatura, que é estática em `static/mesa/miniaturas`;
   - ou do disco com a foto.
   Entra no mesmo z-buffer do mapa, então uma parede esconde o token pixel por pixel. A janela em volta dele e a sombra saem de `setFigureMarks`.
6. **Reserva.** Até o motor ficar pronto, ou se o navegador não roda WebGL 2, vale a imagem de reserva em ladrilhos no SVG. Se a placa perde o contexto no meio da sessão, o quadro volta para ela.

Na segunda vez, tudo vem do cache: os arquivos não mudam de endereço e valem por um ano.

## Como a Mesa replica o que cada um faz

O estado mora em `src/lib/mesa/mesa.svelte.ts`. Há dois caminhos para cada mudança, e o banco é a verdade.

### O estado inicial

A página é montada no servidor (`src/routes/(app)/campanhas/[id]/mesa/+page.server.ts`), já com cena, tokens e objetos. Em seguida o navegador abre um canal Realtime por campanha, `mesa:<campanha>`, com três coisas:
- **`postgres_changes`:** avisos do banco por tabela, filtrados por cena ou campanha, que o Supabase só entrega a quem o RLS deixa ler;
- **`broadcast`:** o caminho rápido;
- **`presence`:** quem está na mesa.

Ao entrar, `conferir()` relê o que mudou entre o servidor montar a página e o canal abrir.

### Uma ação, passo a passo

Exemplo: alguém solta um token.

1. **Na hora, na própria tela.** É a previsão no cliente, como nos jogos online.
2. **Pelo broadcast.** `avisar()` manda a mudança, que chega às outras telas em cerca de 16 ms. Ela vai com três salvaguardas:
   - **Carimbo:** `{ de, ep, n }`, que diz quem mandou, a conexão dele e a ordem nela (`src/lib/mesa/rede.ts`).
   - **Limite:** um balde de fichas segura o ritmo em 8 mensagens por segundo, com folga de 12. Acima do limite do projeto, o servidor fecharia o canal.
   - **Lista do que pode ir:** o broadcast não passa pelo RLS, então só vão campos de `src/lib/mesa/espelho.ts` (posição, altura, rumo, ferimento, condições…) e só de token visível. PV, nome e o que está escondido nunca vão por ali. Mudança maior que 30 KB espera o banco.
3. **No banco.** A tela grava por um `PATCH` no PostgREST ou por uma RPC.
   - A RPC confere a regra no servidor: `mesa_porta` exige o token perto da porta, e `rolar` sorteia o dado no banco.
   - Se o banco recusa, a tela desfaz.
4. **A confirmação.** O aviso do banco chega a todos pelo `postgres_changes`, em cerca de 65 ms com o banco em São Paulo; eram 465 ms quando ele ficava em Ohio.
   - Ele pode trazer um valor mais velho: outro campo do mesmo token, gravado um instante antes, vem com a posição antiga.
   - Por isso a classe `Frescos` guarda, campo a campo e por até 4 s, o que a tela acabou de mudar ou receber. Um aviso diferente não desfaz esse valor até o banco confirmá-lo.
   - Essa espera é também a medida de confirmação no painel de rede.

### Ao receber

- **Mensagem velha:** veio depois de uma mais nova do mesmo remetente e é ignorada.
- **Mensagem pulada:** a falta é contada como perda, e a tela relê a cena em 1,5 s, se o aviso do banco não resolver antes. Várias faltas viram uma leitura só.
- **Arrasto dos outros:** é só broadcast (`fantasma`, a cada 125 ms), como a régua, o molde de jutsu, o Apontar e o ping.
  - A tela desenha esse movimento 160 ms no passado e desliza entre duas posições que existiram de verdade, sem prever nada (`src/lib/mesa/interpolacao.ts`).
  - Quando o token pousa, ele desliza até o lugar em até 320 ms.
  - A visão e a colisão usam as posições reais; só o desenho se atrasa.

### Recuperação

- **Medida da conexão:** o batimento da conexão, a cada 25 s, mede a ida até o servidor.
- **Queda:** a tela religa com espera que dobra a cada tentativa, até 30 s. Ao voltar, relê tudo (`ressincronizar`) e zera os carimbos.
- **Aba em segundo plano:** ao voltar para ela, depois de 5 s escondida, a cena é relida.
- **Conferências periódicas:** uma conferência a cada 30 s e uma releitura completa a cada 2 min. Elas eram de 12 s e 45 s antes dos carimbos.
- **Painel de rede do Mestre:** `RedeMesa.svelte`, o botão de barras, mostra a ida e volta até cada pessoa, a confirmação do banco, as mensagens por segundo, as perdas e as quedas.

O raciocínio por trás dessas escolhas, com as fontes dos jogos online, está em [replicacao-ao-vivo.md](replicacao-ao-vivo.md), e a mudança do banco para São Paulo em [mudanca-para-sao-paulo.md](mudanca-para-sao-paulo.md).

## O mapa vivo dentro desse tempo real

O motor não guarda estado próprio da partida: ele segue o que a Mesa já replica.

- **Hora, clima, telhados e corte:** vêm de `mapa_vivo`, um campo da cena que passa pelo broadcast. Cada tela chama `setAir` e `setLook`.
- **Portas:** vêm das paredes da cena. Quando o tipo muda, `motor.portas` chama `setDoors`, que edita a grade de paredes do mapa no andar da porta e redesenha só os pedaços tocados.
- **Tokens:** cada mudança de posição refaz a lista de figuras (`figurasDoMapa`, `setFigures`).
- **Casas:** quem entra numa casa a abre (`setInside`).
- **Visão de quem joga:** é calculada na CPU (`src/lib/mesa/luz.ts`) com os polígonos de visão e as luzes, incluindo a escuridão do mapa. Depois vira uma imagem vista de cima (`pintarVisao`, em `src/lib/mesa/mapa-vivo.ts`), que sobe como textura. O shader de composição a lê pela posição de cada pixel no mundo, então o alto de uma parede usa o chão ao lado dela.
- **Altura do token:** os níveis vêm do motor (`levelsAt`). Arrastar segue o caminho de quarto em quarto de quadrado, por isso subir uma escada arrastando leva ao andar de cima.

## Limites que valem hoje

| O quê | Limite | Onde |
| --- | --- | --- |
| Lado da cena | 1000 quadrados | migração `cenas_de_um_quilometro` |
| Paredes por cena | 20.000 | idem |
| Objetos por cena (alfinetes, textos, imagens) | 300 | gatilho `mesa_objeto_antes` |
| Terreno difícil e escuridão | 10.000 quadrados cada | `fingersmap.ts`, `mapa-vivo.ts` |
| Miniaturas com janela e sombra | 32 | `MAX_FIGURES` no motor |
| Arquivo `.fmesa` | 300 MB, e 50 MB por arquivo no bucket | `fingersmap.ts`, bucket `mapas` |
| Broadcast | 8 por segundo por pessoa, folga de 12 | `mesa.svelte.ts`, `avisar` |

## Onde mexer

| Para… | Arquivos |
| --- | --- |
| Mudar o desenho, a luz ou o motor | `../fingersMap/packages/engine/src`, depois `npm run levar-para-mesa` e commit aqui |
| Mudar o que vai na cena | `../fingersMap/packages/export/src/mesa.ts` (sai) e `src/lib/mesa/fingersmap.ts` (entra) |
| Mudar o que replica | `src/lib/mesa/espelho.ts` (o que pode ir), `src/lib/mesa/mesa.svelte.ts` (`avisar`, `chegou`, os `receber…`) |
| Mudar a visão | `src/lib/mesa/luz.ts` e `src/lib/mesa/visao.ts` |
| Testar sem login | `node scripts/vigia.mjs scripts/mesa-vivo.mjs <cena> <roteiro>` em `../fingersMap`, que abre o quadro real em `/dev/mapa-vivo` |
