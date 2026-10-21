# Bestiário: é viável?

> **Situação em 20/10 (noite):** feito, ainda não commitado. O bestiário virou um livro à parte, em `/regras/bestiario`:
> - capa com sumário (introdução, monstros de A a Z, apêndice);
> - visões Sumário e Galeria;
> - uma página por verbete, folheada em ordem alfabética.
>
> São 61 verbetes e 151 fichas. Onde há variações, cada uma é uma ficha separada na página da categoria, com arte, resumo, jutsus e números próprios, como os estágios de um dragão no D&D:
> - as 13 espécies de invocação, cada uma com os 4 tamanhos do cap. 14. São as 7 famosas mais lobos, ursos, tigres, javalis, aranhas e centopeias: todos os animais do bestiário são invocações;
> - os 13 clãs do livro, cada um com Genin, Chunin, Jounin e Líder do clã;
> - a marca amaldiçoada e o jinchuuriki;
> - as nove Bestas com Cauda, de Shukaku a Kurama.
>
> Entraram também as figuras de poder: Kage, Kage da Sombra e Conselheiro da vila.
>
> A regra de ameaça está em `conteudo/bestiario/como-usar.md`, e os verbetes estão em `conteudo/bestiario/*.yaml`, com os números calculados pelo compilador. Há ainda:
> - "usar na campanha", por estágio;
> - o apêndice "Adversários por ameaça".
>
> Artes:
> - 11 das 119 fichas de variação já têm arte: 10 vêm das artes de categoria que já existiam, e 1 é nova, o líder Aburame;
> - 108 fichas de variação e 19 verbetes de ficha única estão na fila do PixelLab, primeiro os clãs. Todas seguem a direção nova, com referências do anime e do mangá e ângulos ousados;
> - o close nos olhos fica só para Hyuuga e Uchiha. Na primeira leva, ele e a silhueta apagaram a técnica dos outros clãs;
> - a arte nova da página inicial é a primeira da fila (`pixellab/inicio.json`).
>
> Regra mudada em 21/10: a Esquiva Ativa e a Defesa Total custam 10 PE cada (cap. 4), para não virarem rotina de todo turno.
>
> Desempenho: as imagens já saem do CDN da Vercel. `npm run imagens:otimizar` regrava os PNG com paleta, sem perda (de 1.324 KB para 579 KB), e `/bestiario/` ganhou regra de cache no `vercel.json`.
>
> O texto abaixo é o plano original e fica como histórico.

Pergunta: dá para ter um livro de adversários, com inimigos "clássicos" como referência, mas em sua maioria arquétipos (genin, chunin e jounin de vários clãs e vilas), além de criaturas (invocações, monstros, animais comuns), tudo no mundo de Naruto?

**Resposta curta: sim.** Metade da base já existe no livro e no app. A parte nova e trabalhosa é a matemática de ameaça: saber quanto um adversário pesa contra um grupo de certo nível. Sem isso, o bestiário vira uma lista bonita que o Mestre não consegue usar com segurança.

## O que já existe

- **Ficha resumida de NPC (cap. 23.2):** PV, PC, Defesa, iniciativa, ataque, jutsu marcante, tags de comportamento e ganchos.
- **Gerador rápido de NPC (`src/lib/npcs/gerador.ts`):** cinco faixas (genin, chunin, jounin, anbu, lendário) com PV, PC, Defesa e ataque de cada uma, nomes, funções, origens e segredos.
- **NPCs na campanha:** o Mestre guarda NPCs, revela para o grupo e rola por eles; um NPC pode ter ficha completa.
- **Invocações (cap. 14):** fichas por tamanho (pequena, média, grande, chefe da espécie) e espécies de contrato.
- **Marionetes (cap. 13):** estrutura, mecanismos e as marionetes famosas.
- **Clãs (cap. 8):** cada clã já tem bônus, KKG e jutsus. Dá para transformar isso em "moldes" de inimigo (um Hyuuga, um Uchiha, um Akimichi).

## O que falta construir

1. **Escala de ameaça.** Uma regra nova, por exemplo "Ameaça 1 a 20", alinhada ao nível dos personagens. Para cada ameaça, uma faixa de PV, Defesa, bônus de ataque, dano por turno, DT dos jutsus e PC. Os números saem da própria progressão dos personagens (cap. 6 e 17), para um adversário de ameaça 5 aguentar uma luta contra um grupo de nível 5. É a peça central, e precisa de teste na mesa.
2. **Orçamento de encontro.** Quantos adversários, e de que ameaça, fazem uma luta fácil, média ou difícil para um grupo de N personagens de nível X.
3. **Papéis de combate.** Lutador, atirador, controlador, suporte, assassino e chefe. O papel muda como a ameaça se distribui entre ataque, defesa e PV.
4. **Moldes.** De vila (o que um shinobi de Kiri tem de diferente) e de clã (Sharingan, Juuken, insetos). Cada molde soma traços e técnicas a um arquétipo.

## Como o livro ficaria

| Parte | Conteúdo | Exemplos |
| - | - | - |
| Como usar | Escala de ameaça, orçamento de encontro, papéis, moldes | Montar uma emboscada de Kiri para um grupo de nível 4 |
| Shinobi | Arquétipos por rank e papel | Genin batedor, chunin sensor, jounin de elite, anbu caçador, médico de campo |
| Moldes de vila e clã | O que muda num inimigo de cada origem | Iwa (defesa e Doton), Kumo (velocidade), Hyuuga, Uchiha, Aburame |
| Fora da lei | Quem não serve a vila nenhuma | Bandido, mercenário, ronin, renegado, caçador de recompensas, organização criminosa |
| Animais | Fauna comum e gigante | Lobo, urso, javali, tigre, serpente gigante, centopeia da Floresta da Morte |
| Invocações | As espécies do cap. 14 como adversários | Cobra de Ryūchi, sapo guerreiro, lesma |
| Criaturas e monstros | O sobrenatural | Marionete abandonada, cadáver de Edo Tensei, besta de chakra |
| Lendas | Poucos inimigos canônicos como referência de topo | Um espadachim da Névoa, um sannin renegado, uma Besta com Cauda como chefe de campanha |

Cada verbete teria:
- uma arte própria do PixelLab, fiel ao visual do anime, numa cena com fundo e num formato que muda de verbete para verbete (veja abaixo);
- uma cena curta de abertura, na voz do livro;
- um quadro "Na mesa" com os números (ameaça, PV, Defesa, ataque, jutsus);
- táticas ("como ele luta") e ganchos ("por que ele está aqui").

## A arte de cada verbete

Todo monstro, criatura e arquétipo ganha uma arte do PixelLab, fiel ao anime. A regra é a mesma dos ícones e das artes de capítulo: símbolos, roupas e criaturas recriados como são no anime, nunca inventados.

- **Criaturas canônicas** (sapos do Monte Myōboku, cobras de Ryūchi, lesmas, a centopeia gigante da Floresta da Morte, as Bestas com Cauda) seguem o desenho do anime: cores, marcas, proporções e acessórios. Exemplo: um sapo guerreiro com o colete e a lâmina presa à cintura, como os de Myōboku.
- **Arquétipos shinobi** usam o uniforme real de cada vila e rank: o colete verde de Konoha com os pergaminhos no peito, o colete de Suna, a máscara de animal da Anbu, a bandana com o símbolo certo da vila.
- **Animais comuns e monstros sem desenho canônico** seguem o estilo de cor e traço do anime: contorno firme, sombras em blocos, paleta da série.
- **Rostos:** os arquétipos não copiam personagens famosos. As Lendas, se entrarem, são as únicas com rosto canônico.

**Formato: cena com fundo, cada verbete com a sua composição.** A referência é o Monster Manual de D&D, onde cada página parece única: uma criatura ocupa uma faixa no topo, outra aparece de pé ao lado do texto, outra toma a página inteira. Toda arte é uma cena no habitat da criatura, com o acabamento e a paleta dos covers das vilas, mas o formato muda conforme o que ela é:

| Formato | Tamanho no PixelLab | Para quê |
| - | - | - |
| Faixa | 256×96 (o dos covers) | Criaturas compridas, emboscadas, chefes. Fica no topo da página, de ponta a ponta. |
| Retrato | 128×192 | Shinobi e humanoides de pé, de corpo inteiro. Fica ao lado do texto. |
| Quadro | 176×176 | Criaturas grandes e pesadas, invocações e feras. O texto contorna a arte. |
| Página | 192×256 | Lendas e Bestas com Cauda: arte de página inteira, abrindo o verbete. |

Além do formato, cada verbete tem um **plano de câmera**, para as artes não repetirem o mesmo ângulo. As opções:
- **Close:** o rosto ou a máscara enchendo o quadro.
- **Plano médio:** da cintura para cima.
- **Corpo inteiro.**
- **Plano aberto:** a criatura pequena numa paisagem enorme.
- **De baixo:** a criatura se impondo sobre quem olha.
- **De cima:** olhando lá do alto.
- **De costas.**
- **Por trás de alguém:** um ninja em primeiro plano encarando a criatura, para mostrar o tamanho dela.

Um verbete pode juntar dois planos (close de baixo, por exemplo). A primeira leva já distribui formatos e planos entre ninjas e monstros, para duas páginas seguidas nunca terem o mesmo enquadramento.

No site, a mesma arte ainda pode ganhar variações de moldura: borda reta, vinheta que se dissolve no papel, ou a arte "sangrando" para fora da coluna. Assim duas páginas seguidas nunca ficam iguais. A arte recortada também serve de retrato do NPC na campanha.

**Como gerar:**
1. Cada verbete tem o seu pedido em `pixellab/bestiario.json`: o formato, a descrição visual detalhada (cores, marcas, roupa, pose, habitat) e a lista "fiel", com o que a arte precisa ter para passar.
2. A paleta é a dos covers (25 cores). Quando falta uma cor essencial, o verbete soma `cores_extras`. Exemplo: o azul-marinho e o verde-oliva do uniforme de Konoha, que sem isso saía cinza.
3. Quando o desenho for difícil de descrever, você pode mandar uma imagem de referência para o PixelLab converter em pixel art.
4. O script é `pixellab/scripts/bestiario.cjs` (`node bestiario.cjs --seed <n> <slug> …` ou `--todos`). Ele aceita várias contas do PixelLab ao mesmo tempo: cada conta roda um job por vez, em paralelo com as outras, e a que esgota sai da fila sem parar o resto. O job fica guardado, então um download que falha não gasta outra geração.
5. Cada arte passa por você antes de entrar. As recusadas voltam para a fila com o pedido ajustado.
6. Os originais ficam em `pixellab/gerados/bestiario/` e a versão do site em `static/bestiario/`.

**Piloto (feito em 20/10):** a folha `pixellab/gerados/bestiario/piloto.png` mostra um verbete de cada formato.
- Centopeia da Floresta da Morte, em faixa, entre as árvores gigantes.
- Sapo guerreiro de Myōboku, em quadro, sobre uma rocha com musgo, com os vales e as cachoeiras de Myōboku atrás.
- Chunin de Konoha, em retrato, sobre um telhado, com a vila e o monumento dos Hokage atrás.

O sapo de corpo inteiro saiu com rabo, e os sapos de Myōboku não têm. A versão em close de baixo (`sapo-guerreiro-7701.png`) resolveu isso e virou a escolhida. As tentativas anteriores (sem fundo e só em faixa) ficaram em `sem-fundo/` e nos arquivos `-75xx`.

**Primeira leva de artes (feita em 20/10, com 3 contas em paralelo):** 17 dos 18 verbetes têm arte escolhida, marcada em `escolhida` no `bestiario.json`.
- Ninjas: chunin de Konoha, genin batedor, caçador Anbu, ninja médico, kunoichi de Kiri, patrulha de Suna, shinobi de Iwa e de Kumo, renegado e rōnin.
- Monstros: sapo guerreiro, centopeia, alcateia de lobos, urso gigante, serpente de Ryūchi (roxa, na segunda tentativa), lesma de Shikkotsu e marionete abandonada.
- Folhas de revisão em `pixellab/gerados/bestiario/`: `leva-1-faixas.png`, `leva-1-retratos.png` e `leva-1-quadros.png`.
- Mais fracas, mas passáveis: o genin (o ângulo de cima ficou tímido) e o shinobi de Iwa (figura pequena).
- **Pendente:** o cadáver de Edo Tensei. Foram 6 tentativas e nenhuma trouxe o visual (rachaduras, pele cinza, esclera preta). Pior: o nome da técnica no pedido puxa os revividos famosos, e saiu um Hashirama. A próxima tentativa é editar a `-7806`, que tem um bom rosto original, pedindo a pele rachada e o olho preto.

**Cota:** a conta do PixelLab está no plano de teste, sem créditos. Ela dá uma cota diária que recarrega 5 gerações por noite, até 20. O piloto gastou 16 das 17 do dia. Contando de uma a três tentativas por arte, a primeira leva de 50 verbetes leva de duas a quatro semanas na cota grátis. Com créditos pagos, sai em um ou dois dias. Outras contas do PixelLab ajudam a acelerar, mas o token de cada uma precisa ser passado de novo (veja o fim da conversa de 20/10).

## Como a worldbuilding ajuda

A skill worldbuilding pensa num conjunto de verbetes ligados entre si: personagens, lugares, facções e lore. O bestiário encaixa nesse molde:
- **Lugares:** os habitats (Floresta da Morte, País da Neve, o deserto de Suna).
- **Facções:** organizações e grupos inimigos (vilas, organizações criminosas, seitas).
- **Lore:** Bestas com Cauda, Edo Tensei.

Cada verbete aponta para os outros. Quando um nome aparece num verbete e ainda não tem página, entra como rascunho. E as contradições (um inimigo de Kiri com técnicas que o livro diz serem só de Iwa) vão para uma lista, em vez de serem corrigidas sem aviso.

## No site e no app

- **Seção nova:** `/regras/bestiario`, com filtros por ameaça, tipo, papel, vila e clã, e o mesmo visual de cartas do catálogo de jutsus.
- **"Usar na campanha":** um botão que cria o NPC na campanha com os números do verbete. A tabela de NPCs já guarda PV, PC, Defesa, iniciativa, ataque e tags, então é quase só ligação.
- **Montador de encontro (segunda fase):** escolhe o nível do grupo, monta a luta pelo orçamento e coloca os inimigos na ordem de iniciativa.
- **Arte:** a arte de cada verbete aparece na carta, na página do verbete e como retrato do NPC criado na campanha.

## Esforço estimado

| Etapa | Tamanho |
| - | - |
| Escala de ameaça, orçamento, papéis e moldes | 1 sessão para propor, e depois sua revisão e teste na mesa |
| Piloto de arte (3 artes) e sua aprovação do estilo | 1 sessão curta |
| Primeira leva: 25 arquétipos e 25 criaturas | 2 sessões de texto; as artes, de 2 a 4 semanas na cota grátis (ou 1 a 2 dias com créditos) |
| Seção no site e "usar na campanha" | 1 sessão |
| Montador de encontro | 1 sessão |
| Lendas, monstros e moldes restantes | sob demanda |

## Riscos

- **Balanceamento:** a escala de ameaça é uma regra nova. Sem teste na mesa, um inimigo de "ameaça 5" pode ser fácil ou mortal demais. Proposta: começar com poucos verbetes e ajustar depois de duas ou três sessões jogadas.
- **Personagens canônicos:** fichas de figuras famosas convidam ao "e se o grupo enfrentar Itachi?". Sugiro que as lendas sejam poucas, sirvam de referência de topo e tragam o aviso de que são chefes de arco.
- **Tamanho:** é fácil o livro crescer sem fim. Proposta: cada leva fecha com um tema (shinobi, fauna, sobrenatural).

## Decisões que são suas

1. **Escala de ameaça:** aceita uma regra nova de ameaça e orçamento de encontro, ou prefere que o bestiário só sugira o rank (genin a lendário), como o gerador faz hoje?
2. **Canônicos:** entram como "Lendas" (poucos e de topo), ou o livro fica 100% com arquétipos?
3. **Sobrenatural:** entram criaturas do anime e dos filmes (bestas de chakra, monstros únicos), ou só o que existe no mangá?
4. **Primeiro passo:** começar pela regra de ameaça (recomendado) ou por uma leva de verbetes para sentir o formato?
5. **Cota do PixelLab:** gerar as artes aos poucos, na cota grátis, ou comprar créditos para fazer a primeira leva de uma vez?
6. **Referências:** você prefere mandar imagens de referência das criaturas mais difíceis, ou que eu trabalhe só com a descrição escrita?
