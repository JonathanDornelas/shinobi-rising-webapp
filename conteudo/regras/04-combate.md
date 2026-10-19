---
numero: 4
slug: combate
href: /regras/combate
titulo: Combate
parte: 1
---

:::epigrafe{autor="Minato Namikaze, O Relâmpago Amarelo da Folha"}
No calor da batalha, a coisa mais difícil e mais importante é controlar o seu tempo e o uso dos seus recursos. Um único segundo de hesitação dita a diferença entre a vida e a morte.
:::

## Estrutura do Turno {#estrutura-do-turno}

O combate é dividido em rodadas de aproximadamente 6 segundos. No início, todos rolam Iniciativa (1d20 + AGI).

### Ações por Turno {#acoes-por-turno}

- 1 Ação Primária: atacar, lançar jutsu, sprintar, comandar marionete em manobra completa.
- 1 Ação Secundária: mover, sacar item, comando simples a aliado ou marionete.
- 1 Reação (fora do seu turno): esquivar, defender, jutsus que utilizam reação como o Kawarimi (Substituição).
- Ações Livres: falar uma frase curta, soltar um item ou ativar efeitos descritos como livres (no máximo um efeito livre de jutsu ou habilidade por turno).
- Ação Completa: usa a ação primária e a secundária do mesmo turno.
- Deslocamento: cada ação secundária de movimento permite deslocar-se até 10 m; Sprintar (ação primária) concede +20 m.
- Cena: trecho contínuo de ação com o mesmo objetivo e local (um combate, uma infiltração, uma perseguição). Efeitos "por cena" se renovam quando a cena termina.

## Ataque e Defesa {#ataque-e-defesa}

Um ataque consiste em um teste de perícia contra a Defesa do alvo. Para que o ataque seja bem-sucedido, o resultado final da rolagem deve ser igual ou superior à Defesa do oponente.

::formula[1d20 + Perícia (+ Proficiência) ≥ Defesa do Alvo]

Para realizar um ataque, utilize a tabela abaixo para identificar qual perícia deve ser usada em cada tipo de ação ofensiva.

| Tipo | Rolagem | Defesa do alvo |
| - | - | - |
| Taijutsu | 1d20 + Taijutsu (+ Prof.) | Defesa (10 + Acrobacia) |
| Armas | 1d20 + Bukijutsu (+ Prof.) | Defesa (10 + Acrobacia) |
| Ninjutsu | 1d20 + Ninjutsu (+ Prof.) | Defesa (10 + Acrobacia) |
| Genjutsu | 1d20 + Genjutsu (+ Prof.) | Defesa Mental (10 + Percepção) |
| Kugutsu | 1d20 + Kugutsu (+ Prof.) | Defesa (10 + Acrobacia) |

Jutsus de área não rolam ataque: cada alvo faz uma Resistência (normalmente Acrobacia) contra a DT do Jutsu e, em sucesso, sofre metade do dano e ignora as condições. Dano de ataques com armas e desarmados soma FOR (corpo a corpo) ou AGI (à distância); o dano desarmado base é 1d6.

Redução de Dano (RD): algumas técnicas e especializações concedem RD, que é subtraída de cada dano sofrido. Fontes diferentes de RD não se somam — use a maior. Efeitos que "ignoram RD" não sofrem essa redução.

## Manobras de Combate {#manobras-de-combate}

### Esquiva Ativa (Reação) {#esquiva-ativa-reacao}

Usa a sua Reação. Ao ser alvo de um ataque, role 1d20 + Acrobacia: o resultado substitui a sua Defesa contra aquele ataque (mesmo que seja menor). Não pode ser combinada com o Kawarimi na mesma rodada.

### Defesa Total {#defesa-total}

Usa a sua ação primária: +5 em Defesa e em Defesa Mental até o início do seu próximo turno.

### Combo Taijutsu {#combo-taijutsu}

Em rolagens de ataque do tipo Taijutsu. Após acertar, gaste 5 PE e sacrifique sua ação secundária para encadear o segundo ataque com -5 na rolagem.

### Selo de Substituição (Kawarimi) {#selo-de-substituicao-kawarimi}

Reação especial: declare a Substituição IMEDIATAMENTE quando um ataque te atinge (antes do dano ser aplicado). O custo cresce a cada uso na mesma cena: 3 PC no 1º uso, 5 PC no 2º e 8 PC no 3º (máximo de 3 usos por cena). O Kawarimi depende de você "ler" o atacante e enganá-lo no último instante.

Mecânica:

1. O atacante já realizou a rolagem de ataque e acertou.
2. O alvo rola 1d20 + Percepção (+ proficiência em Kawarimi no Jutsu, se tiver).
3. Se o resultado for igual ou maior que o resultado total da rolagem de ataque, o Kawarimi funciona: o usuário troca de lugar com um objeto a até 5 metros e evita o ataque.
4. Caso contrário, o ataque acerta normalmente e os PC são gastos sem efeito.

Restrições adicionais que evitam abuso:

- Sem objeto disponível em raio de 5m, o jutsu falha automaticamente (cenário aberto, ar, água profunda).
- Contra ataques surpresa onde você foi pego desprevenido (sem ação na rodada anterior, dormindo, em Genjutsu), o Kawarimi falha automaticamente — você não percebeu a tempo.
- Acertos críticos do atacante (20 natural) anulam Kawarimi automaticamente — o golpe foi rápido demais para reagir.
- Atacantes que estejam em estado de furtividade contra você anulam o Kawarimi automaticamente.
- Não acumula com Esquiva Ativa: você usa uma reação por rodada — escolhe esquivar ou substituir.

## Dano, Inconsciência e Morte {#dano-inconsciencia-e-morte}

:::epigrafe{autor="Itachi Uchiha, O Prodígio do Clã Uchiha"}
A vida das pessoas não termina quando elas morrem. Termina quando elas perdem a fé.
:::

A morte rodeia o mundo shinobi, essa seção explica as escolhas e acontecimentos que a trazem e como escapar do que às vezes é inevitável.

### Estados de Vida {#estados-de-vida}

| PV atual | Estado | Efeito |
| - | - | - |
| Maior que 0 | Saudável (ou ferido) | Atua normalmente |
| Exatamente 0 | Inconsciente (Caído) | Cai no chão; não age, não fala. Inicia Saves de Morte no próximo turno (ver abaixo) |
| Abaixo de 0, mas acima de −metade dos PV máximos | Sangrando ou Morrendo | Inconsciente. Continua fazendo Saves de Morte. Cada novo dano força 1 falha automática (2 se for crítico) |
| Igual ou abaixo de −metade dos PV máximos | Morte Imediata | Sem Saves. Morte instantânea por trauma massivo (ex: PV máx 40 → morre em −20 PV) |

Exemplo: um personagem com 40 PV máximos cai a 0 PV → fica Inconsciente. Se sofrer mais dano e chegar a -15 PV → continua Sangrando, mas vivo. Se chegar a -20 PV → morre instantaneamente (atingiu a metade negativa).

### Saves de Morte (Testes de Salvaguarda) {#saves-de-morte-testes-de-salvaguarda}

Ao começar seu turno enquanto Inconsciente com 0 PV ou menos, role um teste especial chamado Save de Morte:

::formula[Save de Morte: 1d20 + ESP (somente se ESP for positivo)]

Interpretação do resultado:

| Resultado | Efeito |
| - | - |
| 20 natural | Recupera 1 PV imediatamente — volta consciente, prono no chão |
| 10 ou superior | 1 Sucesso. Acumula até 3 sucessos para estabilizar |
| 9 ou inferior | 1 Falha. Acumula até 3 falhas para morrer |
| 1 natural | 2 Falhas (crítico ruim — quase deu) |

Acumular **3 Sucessos** = Estabilizado: o personagem fica inconsciente mas estável. Não rola mais Saves; recupera 1 PV após 1 hora de descanso ou imediatamente se receber qualquer cura. Acumular **3 Falhas** = Morte. O personagem morre. Os contadores zeram quando o personagem volta a ter PV positivos.

Atributo ESP positivo soma ao Save de Morte (representa força de espírito e vontade de viver). ESP zero ou negativo não soma nem subtrai.

### Estabilizar Aliado Caído {#estabilizar-aliado-caido}

Um personagem adjacente pode usar uma ação principal para tentar estabilizar um aliado Inconsciente:

- Teste: 1d20 + Medicina vs DT 12 (sem ferramentas) ou DT 10 (com kit médico).
- Em sucesso: o aliado fica imediatamente Estabilizado (não rola mais Saves), mas ainda inconsciente em 0 PV.
- Em falha: nada acontece, mas pode tentar de novo no próximo turno.
- Cura mágica (Shōsen Jutsu, Pílula de Cura, etc.) que devolva qualquer PV automaticamente desperta o aliado e zera os contadores de Save.

### Dano em Personagem Inconsciente {#dano-em-personagem-inconsciente}

Atacar um personagem inconsciente é fácil — o atacante acerta automaticamente caso não role uma falha crítica. Cada ataque que conecta gera **1 Falha automática** no Save de Morte do alvo. Se o ataque for um acerto crítico (20 natural) ou ataque de execução (assassinato), gera **2 Falhas**. Atenção: 3 ataques em sequência contra um aliado caído podem matá-lo — proteja seu time.

### Acertos e Erros Críticos {#acertos-e-erros-criticos}

Ao obter um 20 natural no teste de ataque — ou um acerto crítico concedido por alguma outra fonte — o ataque acerta automaticamente e os dados de dano são duplicados.

Ao obter um 1 natural — ou sofrer uma falha crítica causada por alguma outra fonte — o ataque erra automaticamente.

### Dano Massivo (Morte Imediata) {#dano-massivo-morte-imediata}

Se um personagem em PV positivos sofrer um único golpe que reduza seus PV a −metade dos PV máximos ou menos (passando direto pelo limiar de Inconsciente), ele MORRE INSTANTANEAMENTE. Sem Saves, sem chance.

Exemplo: PV máx 50, atual 8, leva 35 de dano de um Karyuu Endan crítico → vai a -27, e como -25 é a metade negativa, morre. Esse caso é raro mas representa a brutalidade absoluta de jutsus de Rank A+ contra alvos despreparados — incentiva os jogadores a manterem PV altos contra inimigos mortais.

### Recuperação Após Inconsciência {#recuperacao-apos-inconsciencia}

Personagens que sobrevivem a uma cena com 0 PV (estabilizados ou curados):

- Não sofrem fadiga automática — apenas se a cena tiver sido especialmente intensa (Mestre decide).
- Recuperam PV normalmente conforme regras do cap. 9 (descanso curto/longo).
- Mestre pode aplicar 1 "Marca de Quase-Morte" como gancho narrativo (cicatriz, pesadelo recorrente, gatilho emocional). Não tem efeito mecânico, mas dá peso à experiência.

## Visão e Encobrimento {#visao-e-encobrimento}

Em campos de batalha shinobi, raramente todos se enxergam claramente. Bombas de fumaça, neblina noturna, jutsus elementais, sombras profundas — todos afetam o ataque e a defesa. Use as três categorias abaixo para resolver rapidamente.

### Categorias de Visibilidade {#categorias-de-visibilidade}

| Categoria | Efeito mecânico |
| - | - |
| Visão Clara | Sem modificadores. Padrão de combate aberto, dia ensolarado, sala iluminada. |
| Encoberto Levemente | Atacante: -2 nas rolagens de ataque contra alvos no encobrimento. Causas: penumbra, neblina rala, fumaça dispersando, distância média em vento, chuva moderada, folhagem. |
| Encoberto Pesadamente | Atacante: -5 nas rolagens de ataque. O Defensor pode tentar furtividade para se reposicionar como ação. Causas: bomba de fumaça (área), escuridão completa sem fonte de luz, jutsus, tempestade densa, sob água turva. |
| Cegueira Total | Ataques contra alvo invisível: -10 OU rolar Percepção DT 15 para localizar pelo som/chakra antes de atacar normalmente. Causas: olhos vendados, jutsus. |

### Alguns Exemplos de Itens e Jutsus que Geram Encobrimento {#alguns-exemplos-de-itens-e-jutsus-que-geram-encobrimento}

- Bomba de Fumaça (item, 300 ryo): cobre área 5m × 5m com fumaça densa por 3 turnos. Cria Encoberto Pesadamente para todos dentro e contra alvos lá dentro. Ação para lançar.
- Kirigakure no Jutsu Ilusório (Rank D, 4 PC): cobre área 10m com névoa ilusória por 3 turnos. Encoberto Levemente; gasto baixo, efeito modesto.
- Kirigakure no Jutsu Real (Rank B, 12 PC): cobre área 30m com névoa real por 1 cena. Encoberto Pesadamente. Marca registrada de Kirigakure.
- Doton: Doryūheki (Muralha de Terra, Rank C): bloqueia totalmente a linha de visão (cobertura física). Atacar através exige destruir a parede primeiro.
- Sensores de Chakra (Especialização Sensor, KKG sensoriais como Byakugan): IGNORAM encobrimento visual — "veem" pelo chakra. Mas podem ser enganados por Mascarar Chakra (cap. 5).

### Combinando Encobrimento com Furtividade {#combinando-encobrimento-com-furtividade}

Encobrimento Pesado ou Cegueira Total dão +3 DT em testes de Furtividade (em vez do modificador padrão da tabela do cap. 5). Personagens em Encobrimento podem entrar em estado de Furtividade como ação principal sem precisar quebrar contato visual primeiro — a fumaça/escuridão já fez isso.

Sensores anulam isso: contra um Sensor de Chakra ativo, encobrimento visual não ajuda em Furtividade — você precisa Mascarar Chakra também.

## Estados Especiais {#estados-especiais}

Esta tabela apresenta os principais Estados Especiais que podem afetar personagens durante o jogo. Cada condição possui efeitos próprios, capazes de limitar ações, causar dano contínuo ou alterar a percepção do alvo. Saber como cada estado funciona — e como lidar com ele — é essencial para sobreviver aos combates e utilizar estratégias de forma eficiente.

| Estado | Efeito |
| - | - |
| Atordoado | Perde a ação primária do próximo turno e não pode usar Reações até lá |
| Paralisado | Não pode agir nem usar Reações; ataques corpo a corpo contra ele têm vantagem |
| Imobilizado (Preso) | Não pode se deslocar; -2 em ataques e na Defesa. Pode usar a ação primária para tentar escapar (Resistência indicada pelo efeito) |
| Controlado | Age conforme o controlador determina (ex.: Kage Mane, Shintenshin); tenta se libertar com a Resistência indicada ao fim de cada turno |
| Caído | -2 em ataques; ataques corpo a corpo contra ele têm vantagem e à distância, desvantagem. Levantar custa a ação secundária |
| Cego | Segue as regras de Cegueira Total (Visão e Encobrimento) e falha em testes que dependam da visão |
| Amedrontado | Desvantagem em ataques enquanto puder ver a fonte do medo; não pode se aproximar voluntariamente dela |
| Em chamas | 1d6 de dano por turno até apagar (ação secundária, água ou rolar no chão) |
| Envenenado | Sofre o dano do veneno a cada turno (Tabela de Venenos, cap. 11) e -1 em testes até ser curado |
| Sangrando | 1d4 PV/turno; Medicina DT 15 (ação primária) estanca |
| Em Genjutsu | Percebe o que o lançador determina. Repete a Resistência de ESP ao fim de cada turno; um aliado adjacente pode gastar a ação primária e 2 PC (Kai) para dar vantagem nesse teste |
| Desprevenido | Na primeira rodada, antes de agir, não pode usar Reações e tem -2 na Defesa |

## Fadiga {#fadiga}

Fadiga representa o desgaste físico e mental acumulado ao longo das batalhas e esforços extremos. Conforme os níveis de fadiga aumentam, o personagem sofre penalidades progressivamente mais severas, reduzindo sua eficiência em combate e limitando o uso de técnicas até alcançar condições críticas que podem levar ao colapso ou até mesmo à morte.

| Nível | Efeito |
| - | - |
| 1 — Cansado | -1 em todos os testes físicos |
| 2 — Exausto | -2 em todos os testes; jutsus custam +1 PC/PE |
| 3 — Esgotado | -3 em todos os testes; não pode usar jutsus de Rank B ou superior |
| 4 — Colapso | Fica inconsciente após 1d4 turnos |
| 5 — Risco de morte | Teste de VIG DT 20 a cada hora (e ao ganhar outro nível de Fadiga); falha = morte |

Recuperação: cada descanso longo remove 1 nível de Fadiga (2 níveis numa Câmara de Cura do clã). Pílulas e técnicas específicas podem remover níveis adicionais.
