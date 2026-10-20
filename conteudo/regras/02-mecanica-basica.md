---
numero: 2
slug: mecanica-basica
href: /regras/mecanica-basica
titulo: Mecânica Básica
parte: 1
---

:::cena
Bem acima do chão, um galho fino liga duas árvores. O genin respira fundo, mede a distância com os olhos e salta.

Ninguém sabe se ele vai chegar do outro lado. É para isso que existem os dados.
:::

Este capítulo explica o coração do jogo: como um d20 decide se um ninja consegue o que tenta, o que acontece nos extremos do dado e como a determinação de um shinobi pode mudar uma rolagem.

## Rolagem Padrão {#rolagem-padrao}

Andar, conversar e subir uma escada não pedem dados. Eles entram em cena quando uma ação envolve risco ou incerteza, e então você faz um teste: rola o d20, soma a perícia que a ação pede (ou um atributo, quando nenhuma perícia serve) e, se tiver proficiência naquilo que está fazendo, soma também o bônus dela. Se o total igualar ou passar a Dificuldade do Teste, a DT, a ação dá certo.

O valor de uma perícia já traz embutido o atributo ligado a ela (cap. 3). Por isso o livro nunca soma os dois separadamente: quando ler “teste de Percepção” ou “1d20 + Percepção”, role o d20 e some o seu valor total de Percepção.

:::na-mesa{titulo="Rolagem padrão"}
- **Teste:** 1d20 + perícia (ou atributo) + proficiência, se houver
- **Sucesso:** total igual ou maior que a DT
:::

Quem define a DT é o Mestre, de acordo com a complexidade da ação. Saltar entre galhos é fácil; rastrear um Anbu é muito difícil; e existem feitos quase impossíveis para um ninja comum.

:::tabela{titulo="Dificuldades"}
| Dificuldade | DT | Exemplos |
| - | - | - |
| Fácil | 10 | Saltar entre galhos, identificar uma planta comum |
| Média | 15 | Escalar uma parede, decifrar um pergaminho básico |
| Difícil | 20 | Esquivar de um shuriken inesperado, criar um jutsu novo |
| Muito Difícil | 25 | Quebrar um genjutsu poderoso, rastrear um Anbu |
| Heroica | 30 | Feitos quase impossíveis para um ninja comum |
:::

## Críticos e Falhas {#criticos-e-falhas}

Às vezes o dado decide sozinho. Quando o d20 mostra 20 antes de qualquer soma, o chamado 20 natural, é um acerto crítico: um sucesso espetacular. Em combate, os dados de dano do golpe dobram, mas os bônus fixos não.

O 1 natural é o oposto, uma falha crítica: algo dá muito errado. Em combate, o ataque erra, seja qual for o total. Fora do combate, o Mestre narra uma complicação.

## Vantagem e Desvantagem {#vantagem-e-desvantagem}

Nem toda rolagem acontece em condições iguais. Em combate ou fora dele, o Mestre ou alguma regra pode dar vantagem ou desvantagem a uma rolagem. Atacar corpo a corpo um inimigo Paralisado dá vantagem; atacar estando Amedrontado, com a fonte do medo à vista, dá desvantagem.

Com vantagem, role o d20 do ataque ou do teste duas vezes e fique com o maior resultado. Com desvantagem, role duas vezes e fique com o menor.

## Pontos de Destino (PD) {#pontos-de-destino-pd}

Há momentos em que um ninja simplesmente se recusa a falhar. Os Pontos de Destino medem essa determinação. Cada personagem começa cada sessão com 1 PD, e cada uso custa 1 PD. Com ele, você pode rolar de novo um teste que falhou, somar +5 ao resultado de uma rolagem ou, diante de um golpe que o mataria, sobreviver com 1 PV. Esta última saída só vale uma vez por sessão.

## Tipos de Teste {#tipos-de-teste-como-o-mestre-escolhe-o-que-rolar}

Quando o livro pede um teste, ele diz três coisas: que perícia ou atributo rolar, qual é a DT e o que acontece no sucesso e na falha. Às vezes um efeito cita só a dificuldade, como “DT 18”, sem dizer a perícia. Nesses casos, a tabela abaixo mostra o teste de costume.

:::tabela{titulo="Que teste rolar"}
| Tipo de teste | Role o d20 e some |
| - | - |
| Resistir a genjutsu e efeitos mentais | ESP |
| Resistir a veneno, paralisia e dano contínuo | VIG |
| Esquivar fisicamente de um efeito (jutsu de área, armadilha) | Acrobacia |
| Escapar de uma prisão (corda, areia, sombra) | FOR |
| Notar ou identificar algo | Percepção ou Investigação |
| Aplicar uma técnica (jutsu, manobra) | A perícia da técnica |
| Quebrar a concentração de outro lançador | ESP de quem se concentra, contra a DT do jutsu que tenta quebrá-la |
:::

Os testes deste livro foram revisados para sempre dizer o que rolar. Se ainda assim restar dúvida, vale o bom senso narrativo do Mestre: qual perícia faz mais sentido na cena?

**DT do Jutsu.** Quando um efeito pede uma Resistência contra um jutsu, a dificuldade cresce com o rank da técnica, com o talento de quem a lança e com o domínio que ele tem daquele jutsu: se o lançador tiver proficiência no jutsu, o bônus dela também soma. Quem passa no teste evita a condição; contra dano em área, sofre só metade do dano.

:::na-mesa{titulo="DT do Jutsu" ref="dt-jutsu"}
- **DT:** 10 + bônus de rank + atributo-chave do lançador
- **Proficiência no jutsu:** se o lançador tiver, o bônus dela também soma
- **Bônus de rank:** E +0, D +1, C +2, B +3, A +4, S +5
- **Atributo-chave:** CTR em Ninjutsu, Genjutsu e Fuuinjutsu; FOR em Taijutsu; FOR ou AGI em Bukijutsu, conforme a arma; AGI em Kugutsu
- **Se o alvo passar:** evita a condição; contra dano em área, sofre metade
:::

**Uma checagem por efeito.** Cada efeito pede uma única checagem. Um jutsu de alvo único rola ataque contra a Defesa. Um jutsu de área não rola ataque: cada alvo faz uma Resistência contra a DT do Jutsu. E quando um ataque que acertou tenta atordoar, paralisar ou prender a vítima, ela também resiste contra a DT do Jutsu, assim como faz quem tenta se libertar.
