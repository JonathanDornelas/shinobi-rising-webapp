# Mapas isométricos na Mesa

Plano para a Mesa mostrar cenas em vista isométrica, com tudo o que já existe no quadro de cima: régua, moldes de jutsu, névoa, terreno difícil, efeitos, objetos, lápis, ping e fichas rápidas.

**Escopo, em uma frase: a Mesa ganha a grade e as ferramentas em formato isométrico. A arte dos mapas e dos objetos já vem isométrica, subida à parte pelo Mestre; o app não converte, não gera e não distorce arte.** Por isso este plano não tem conversão de mapa de cima nem geração de tiles; a arte entra como entra hoje (biblioteca de artes) e o Mestre a encaixa na grade com uma ferramenta de calibração.

## 1. A decisão central

**Os dados continuam sendo a grade quadrada. Só a apresentação e o clique mudam.**

Hoje uma cena é uma grade de L × A quadrados de 1 m, e tudo (tokens, terreno, névoa, moldes, distância) fala em coordenadas de grade. Na vista isométrica o quadrado vira um losango, mas o quadrado (3, 7) continua sendo o quadrado (3, 7). Por isso:

- `geometria.ts`, `regua.ts`, `nevoa.ts` e o cálculo de molde em `ui.svelte.ts` **não mudam**. A distância (maior lado mais metade do menor), a esfera, o cone, a linha, a parede e o "quem está na área" continuam valendo, porque operam em grade.
- O banco ganha poucas colunas (seção 8). Cenas existentes continuam como estão (vista de cima).
- O que muda é uma camada fina entre a tela e a grade: **projetar** (grade para tela) e **inverter** (tela para grade). Todo o resto do quadro passa a pedir essas duas funções em vez de multiplicar por `s`.

A vista de cima não sai do app. A cena tem uma opção `visao` (`topo` ou `isometrica`) e o Mestre alterna; o jogador pode forçar a vista de cima só para si (acessibilidade e celular pequeno).

## 2. Projeção

Padrão **2:1 de pixel art**: o losango de um quadrado tem largura `Tw = 64` e altura `Th = 32` (razão configurável, de 1,5 a 2, para mapas com outro ângulo). Com `gx`, `gy` em metros e `z` a elevação em metros:

```
sx = (gx - gy) * Tw / 2
sy = (gx + gy) * Th / 2 - z * Eh        // Eh = altura de 1 m de elevação em px (padrão 16)
```

Inversa (para o ponteiro, sem elevação; com elevação soma-se `z * Eh` a `sy` antes):

```
u = sx / (Tw / 2)      v = sy / (Th / 2)
gx = (u + v) / 2       gy = (v - u) / 2
```

Rotação de câmera em 0, 90, 180 e 270 graus: antes de projetar, gira-se a grade em torno do centro da cena (`(gx, gy)` vira `(gy, L - 1 - gx)` e assim por diante). A rotação é **por usuário e local** (não vai ao banco): cada pessoa escolhe o canto de onde olha. O Mestre define só a rotação inicial da cena.

Dois fatos geométricos que o plano usa em vários lugares:

- Um círculo de raio `r` na grade vira uma **elipse** na tela, com semi-eixo horizontal `r * Tw / √2` e vertical `r * Th / √2`. É o anel de alcance, o contorno de esfera e o círculo do token.
- Uma linha reta na grade continua reta na tela, mas o ângulo muda: 45° na grade vira horizontal ou vertical na tela, e 0° vira a diagonal de 26,57°. Cone e linha precisam disso para a mira acompanhar o mouse.

## 3. Módulo novo: `src/lib/mesa/projecao.ts`

Puro, sem Svelte, com testes. Tudo o que o quadro precisa:

| função | para quê |
| --- | --- |
| `projetar(gx, gy, z, cfg)` e `inverter(sx, sy, z, cfg)` | a base; `cfg` leva razão, rotação, largura e altura da cena |
| `losango(x, y, n, cfg)` | os 4 vértices de um quadrado (ou de um token n × n) na tela |
| `caminhoCelulas(quadrados, cfg)` | um único `path` para uma lista de quadrados (terreno, molde, efeito), unindo vizinhos para não desenhar milhares de elementos |
| `paralelogramoRun(run, cfg)` | uma run de névoa `[y, x0, x1]` vira um paralelogramo (4 pontos) |
| `elipse(cx, cy, r, cfg)` | o círculo de raio r em grade como elipse na tela |
| `ordemDePintura(itens, cfg)` | a profundidade (seção 5) |
| `caixaDaCena(cfg)` | a caixa (`viewBox`) que cobre o mapa inteiro com folga |
| `anguloNaTela(angulo, cfg)` e o inverso | mira de cone e linha |

Os testes principais: `inverter(projetar(p)) = p` para todo quadrado, nas 4 rotações; 4 rotações de 90° voltam ao ponto de partida; `caminhoCelulas` cobre exatamente a mesma área que a soma dos losangos; a ordem de pintura nunca põe um token da frente sob um de trás.

## 4. O que cada camada do quadro vira

Hoje o `QuadroMesa.svelte` (cerca de 1.080 linhas) desenha numa só `<svg>` com `viewBox` em metros. A estrutura continua; muda o que está dentro de cada camada.

| camada | hoje | na vista isométrica |
| --- | --- | --- |
| Fundo | imagem esticada ou enquadrada em metros (`fundo_escala`, `fundo_x`, `fundo_y`) | a imagem isométrica que o Mestre subiu, posicionada na tela e calibrada pela grade (seção 7), sem nenhuma transformação na arte |
| Grade | linhas a cada metro e a cada 5 m | os mesmos traços, projetados (cada linha é uma diagonal); o realce de 5 m vira um losango maior |
| Terreno difícil | quadrados `[x, y]` hachurados | `caminhoCelulas`, com a mesma hachura |
| Névoa | runs `[y, x0, x1]` | `paralelogramoRun`; o caminho único da névoa continua um caminho só |
| Imagens (objetos) | retângulo com giro e redimensionamento | a arte isométrica do objeto, posicionada pela **base** (o ponto de apoio no chão), sem distorcer; o Mestre ajusta escala e ponto de apoio |
| Tokens | círculo, retrato e anel na grade | **billboard**: a base é a elipse do token sobre o losango; o retrato fica de pé acima dela; token 3 × 3, 6 × 6 e 10 × 10 usa a base do tamanho dele |
| Rótulos, alfinete, texto | ancorados em x, y | billboard: ancorados no ponto projetado, sempre de frente e com tamanho constante na tela, para o texto continuar legível |
| Efeitos (jutsus em cena) | quadrados com padrão por elemento | `caminhoCelulas` com o mesmo padrão (`EfeitosFx`), recortado pelo caminho; o rótulo do efeito é um billboard |
| Régua e lápis | polilinha em metros | a polilinha em grade é projetada; a distância mostrada continua a de `distancia()` |
| Ping, apontar, fantasma de arrasto | círculos e ondas | elipses (a onda de ping vira elipse achatada) |
| Fichas rápidas | janelas HTML sobre o quadro | **não mudam** |

### 4.1 Interação

Três funções do quadro mudam de implementação e mantêm a assinatura, e é por elas que o resto do código (arrastar token, régua, lápis, mira, objetos) funciona sem reescrita:

- `ponto(e)` devolve `{ sx, sy, mx, my }`. Em isométrica, `mx` e `my` passam a ser a grade contínua obtida com `inverter` (com `z = 0`, o chão).
- `grade(mx, my)` continua sendo o `floor` limitado à cena.
- `tokenEm(mx, my)` hoje compara com o retângulo do token. Em isométrica o acerto é: a elipse da base **ou** o retângulo do sprite de pé, o que for atingido primeiro na ordem de pintura de trás para frente (o da frente ganha).

O arrasto do token calcula o quadrado de destino com `inverter` na posição da **base** (não do meio do sprite), para o token não "pular" um quadrado quando o jogador segura pelo rosto.

## 5. Profundidade

Em isométrica, quem está mais à frente cobre quem está atrás. A chave de ordenação de um item que ocupa `n × n` quadrados a partir de `(x, y)` é a da sua célula mais próxima da câmera, `x + y + n - 1` (após a rotação), com `z` e o id como desempate. Ordenação feita uma vez por mudança de tokens ou objetos (um `$derived`), nunca por quadro.

Ordem de camadas, de trás para frente: fundo, terreno e névoa do chão, imagens "no chão", **itens em pé ordenados pela chave** (tokens, imagens em pé), efeitos (um efeito de área desenha no chão, sob os tokens, mas o rótulo vai por cima), alfinetes e textos, ping e régua.

Fica de fora da v1 um token "atrás de uma parede alta" ficar escondido. Isso precisa de altura de terreno (seção 6, fase 2 de elevação).

## 6. Elevação

- **v1, visual**: o token tem `elevacao` em metros e sobe na tela (`sy -= z * Eh`), com a sombra no chão. As regras ignoram a altura: a distância continua sendo a da grade, como o livro já trata altura hoje ("a altura é narrativa", seção 10 de `mesa-tatica.md`).
- **v2, regras** (só se o Mestre pedir): a distância passa a considerar `dz`, com a mesma regra da diagonal (o maior eixo mais metade do segundo). Precisa de decisão do livro antes; fica como pergunta aberta.
- **v3, terreno em camadas**: um mapa de alturas por quadrado, que também dá oclusão (parede alta cobre quem está atrás) e subida e descida na régua.

## 7. Fundo e arte

**A arte não é responsabilidade do app.** Mapas e objetos isométricos são feitos fora e subidos pela biblioteca de artes que já existe (`mesa_artes`). O app só precisa de uma forma de **encaixar a imagem na grade isométrica**:

- **Calibração do fundo.** O Mestre vê o losango do mapa (os 4 cantos da cena) por cima da imagem e arrasta ou digita deslocamento e escala até a grade casar com a arte. O resultado fica em `fundo_x`, `fundo_y` e `fundo_escala`, que em `visao = isometrica` passam a ser lidos em unidades de tile (a escala é a largura da imagem em quadrados). A mesma ferramenta de arrastar e redimensionar que o fundo já tem hoje, com a grade isométrica como guia, mais encaixe e ampliação.
- **Objetos.** A imagem de um objeto tem um **ponto de apoio**: o pixel da base, que fica sobre o centro do quadrado. O Mestre ajusta o ponto de apoio e a escala (em tiles) ao posicionar. A ordem de pintura usa o quadrado do apoio (seção 5).
- **Sem conversão.** Nada de rotacionar 45° nem achatar uma imagem de cima. Se o Mestre subir uma imagem de cima numa cena isométrica, ela aparece como o que é, e o app só avisa que a arte não parece isométrica (o aviso é opcional e fica para o polimento).

Pixel art pede zoom em **inteiros** (1×, 2×, 3×) com `image-rendering: pixelated` e a projeção arredondada para pixel inteiro nesses zooms. Com o zoom contínuo atual, o fundo fica suave e o resto continua vetorial.

## 8. Banco de dados

Uma migração só, aditiva:

```sql
alter table public.mesa_cenas
  add column visao text not null default 'topo' check (visao in ('topo', 'isometrica')),
  add column iso_razao real not null default 2 check (iso_razao between 1.5 and 2),
  add column iso_rotacao smallint not null default 0 check (iso_rotacao in (0, 90, 180, 270));

alter table public.mesa_tokens
  add column elevacao smallint not null default 0 check (elevacao between -20 and 60);

alter table public.mesa_objetos
  add column plano text not null default 'chao' check (plano in ('chao', 'em-pe')),
  add column elevacao smallint not null default 0 check (elevacao between -20 and 60);
```

- O jogador só altera a própria elevação se o Mestre permitir; por padrão a trava de colunas do token (`mesa_token_antes`) trata `elevacao` como campo do Mestre.
- `iso_rotacao` é a rotação inicial; a rotação de cada usuário fica no `localStorage`, junto das preferências do quadro.
- Realtime: as colunas novas entram nas mesmas assinaturas que já existem; nada de canal novo.

## 9. Régua e jutsus em detalhe

Esta é a parte que mais preocupa, então fica separada.

- **Medir**: o traço é projetado; o número vem de `distancia()` e `custoCaminho()` sem alteração, inclusive o terreno difícil e o limite de deslocamento por turno.
- **Molde de jutsu**: `calcularMolde` roda em grade, devolve `quadrados`, `contorno`, `anel`, `dist`, `ok` e `quem`. Na tela, `quadrados` vira `caminhoCelulas`, `contorno` vira o contorno projetado, `anel` vira a elipse do alcance (seção 2). O "quem está na área" não muda uma linha.
- **Mira**: o ponteiro passa por `inverter` antes de virar alvo ou ângulo. Cone e linha usam `angulo()` em grade; "travar em passos de 45°" continua em grade (então na tela os passos ficam em horizontal, vertical e as duas diagonais de 26,57°). A tecla de travar mostra o ângulo em grade.
- **Esfera de 20 m (Bijūdama)**: mais de mil quadrados; o `caminhoCelulas` une vizinhos e o desenho é um caminho só, como a névoa já faz hoje.
- **Parede**: o giro da parede acontece em grade; o traço desenhado é o paralelogramo projetado.
- **Volume (opcional, depois)**: esfera e cilindro podem ganhar uma "altura" desenhada (a esfera como elipse mais a silhueta, o pilar de fogo como coluna). É só visual.
- **Efeitos que ficam em cena** (turnos): vêm de `mesa_efeitos` com os quadrados em grade; a contagem de turnos e a remoção manual não mudam.
- **Broadcast do molde** (o que os outros veem enquanto o Mestre mira): o payload continua em grade (`quadrados`, `contorno`, `anel`); cada cliente projeta do seu jeito, então quem está na vista de cima e quem está em isométrica enxergam o mesmo molde.

## 10. Fases

| fase | entrega | o que valida |
| --- | --- | --- |
| 0 | `projecao.ts` + testes; nenhuma tela muda | ida e volta, rotações, losango, profundidade, caminho de células |
| 1 | migração; o Mestre alterna `topo` e `isometrica`; desenho só leitura: grade, fundo (mapa de cima transformado), tokens como billboard, rótulos | a cena aparece certa nas 4 rotações |
| 2 | clique e arrasto: `ponto`, `grade`, `tokenEm`, mover, selecionar, ficha rápida, régua de medir | o quadrado clicado é o desenhado; medir dá o mesmo número nas duas vistas |
| 3 | jutsus e áreas: mira, moldes, anéis, efeitos em cena, terreno difícil, névoa e pincel de névoa | o molde acerta o que a vista de cima acertava |
| 4 | objetos (imagem no chão e em pé, alfinete, texto), lápis, ping, apontar | camadas e hit-test dos billboards |
| 5 | elevação visual, rotação de câmera por usuário, calibração do fundo e ponto de apoio dos objetos | a arte isométrica subida pelo Mestre casando com a grade |
| 6 | polimento: zoom em inteiros, celular (pinça e arrasto), desempenho, atalhos, tela de ajuda | 60 fps em cena de 100 × 100 com 40 tokens |

Cada fase fecha com `svelte-check` limpo, a suíte inteira passando e o roteiro de tela (abaixo). A fase 0 e a 1 podem ir ao ar sem risco porque cenas existentes ficam em `topo`.

## 11. Testes

- **Unitários** (`projecao.spec.ts`): os da seção 3, mais casos de borda (cena de 1 × 1, cena 200 × 200, tokens de 10 × 10 no canto, razão 1,5 e 2).
- **Regressão**: `geometria.spec.ts`, `mesa.spec.ts` e `nevoa.spec.ts` passam sem alteração. Se algum precisar mudar, a decisão da seção 1 foi quebrada.
- **Banco** (`supabase/testes/mesa.spec.ts`): defaults, checks de `visao`, `iso_razao`, `iso_rotacao`, `elevacao`; o jogador não altera a elevação do próprio token quando travada.
- **Navegador** (puppeteer + Edge, com Mestre e jogador): clicar no centro de um losango seleciona o quadrado certo nas 4 rotações; arrastar um token 3 × 3 pela cabeça cai onde a base indica; medir 10 m na diagonal dá o mesmo valor nas duas vistas; molde de cone aponta para onde o mouse está; a névoa revelada no Mestre aparece igual no jogador; capturas de tela lado a lado, topo e isométrica.

## 12. Riscos

- **Clique em coisa alta**: um sprite de pé cobre quadrados atrás dele. Regra: a base ganha quando o ponteiro está nela; o resto do sprite só vale se não houver outra base ali.
- **Texto e legibilidade**: nada de texto girado. Rótulos e textos do Mestre são billboards sem rotação.
- **Desempenho**: a grade e o terreno viram caminhos únicos; nada de um elemento por quadrado. Ordenação por `$derived`, nunca no laço de arrasto.
- **Token grande e névoa**: a névoa decide visibilidade pelo centro do token em grade (como hoje); isso não muda, mas pode parecer estranho numa vista em que o sprite é alto. Vale testar com o Mestre.
- **Celular**: a vista isométrica ocupa mais altura; no celular pequeno a vista de cima continua a padrão e o jogador alterna.
- **Arte de fora**: encaixar uma imagem na grade é a parte mais manhosa de usar; a calibração precisa ser boa, com ampliação e encaixe. A rotação de câmera exige que a arte exista nas 4 vistas, ou o app mostra a rotação só da grade e dos tokens e mantém o fundo fixo (decisão aberta, abaixo).
## 13. Perguntas abertas

1. A elevação deve entrar nas regras (distância com altura) ou fica só visual? O livro hoje diz que a altura é narrativa.
2. Qual o tamanho do tile da arte que o Mestre usa? O plano assume 64 × 32 (2:1); se a arte for de outro tamanho, a razão e o tile são configuráveis por cena.
3. Rotação de câmera: a arte isométrica de fundo só existe de um canto. Na rotação, o fundo fica fixo e só a grade e os tokens giram (parece estranho), ou a rotação fica desligada em cenas com fundo? Proposta: rotação só em cenas sem fundo, ou com o fundo travado em 0°.
4. O token fica em pé como retrato redondo (como hoje) ou aceita um sprite de corpo inteiro subido pelo Mestre? O primeiro funciona já.
5. Os jogadores podem trocar a vista da cena só para si? A proposta é sim, para a vista de cima como recurso de acessibilidade.
