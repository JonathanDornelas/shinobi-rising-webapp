# Escala dos atributos: teto de +3

## Contexto

Os atributos estão altos. Hoje:

- **Na criação:** vão de −2 a +4 (+5 no atributo do clã), com 9 pontos para 7 atributos.
- **Ao subir de nível:** ganham +1 ponto nos níveis 3, 6, 9, 12, 15 e 18, até +8.
- **Atributo do clã:** os marcos sobem ele até +10 ("+1 INT; limite de INT +10").

Como quase tudo soma atributo, os números de jogo crescem junto: perícias, Defesa, DT dos jutsus, dano, PV, PC, PE, carga e iniciativa.

**O pedido:** o máximo do máximo é **+3**, em qualquer nível, e chegar a +3 deve custar caro. Em geral, só abrindo mão de algo; isso é uma intenção de desenho, não uma regra escrita.

## Proposta recomendada

### 1. Escala

- **Faixa:** os atributos vão de **−2 a +3**, em todos os níveis.
- **Teto absoluto:** +3, inclusive para o atributo do clã.
- **O que some:** os limites "+8", "+10" e "limite de X +9" dos marcos.

### 2. Criação: compra com custo crescente

| Valor | Custo total |
| - | - |
| −2 | devolve 2 |
| −1 | devolve 1 |
| 0 | 0 |
| +1 | 1 |
| +2 | 3 |
| +3 | 6 |

- **Pontos:** 5 para os 7 atributos (no máximo 2 atributos negativos).
- **Ficha típica:** +2, +1, +1 e o resto 0 (5 pontos), ou cinco atributos em +1.
- **Chegar a +3:** custa 6, então só dá baixando algo. Com +3 e −1, os outros ficam em 0; com +3, +1 e dois −1, sobra 0.
- **Bônus de clã:** +1 no atributo do clã, sem passar de +3. Comprar +2 (3 pontos) e somar o clã dá +3 sem negativo: é a vantagem do clã.

### 3. Progressão

- **Aprimoramento:** troca o "+1 a cada 3 níveis" por **+1 em um atributo abaixo de +3** nos níveis **4, 8, 12, 16 e 20**. São cinco ao longo da carreira, que mais completam os atributos fracos do que inflam os fortes.
- **Marcos de clã "+1 INT":** passam a valer até o teto. Se o atributo já está em +3, o marco treina uma perícia do clã no lugar.

### 4. Fórmulas que dependem do atributo

Com atributos menores, os recursos perderiam muito. Proposta de recalibragem (o nível continua sendo a maior fonte):

| Item | Hoje | Proposta |
| - | - | - |
| PV | 20 + 5 por VIG | 20 + 8 por VIG |
| PE | 20 + 5 por VIG | 20 + 8 por VIG |
| PC | 30 + 4 por ESP + 4 por CTR | 30 + 6 por ESP + 6 por CTR |
| Carga | 10 + 2 por FOR | 10 + 3 por FOR |
| DT do jutsu | 10 + rank + CTR + proficiência | 11 + rank + CTR + proficiência |
| Defesa | 10 + Acrobacia | sem mudança |
| Iniciativa | AGI | sem mudança |
| Dano | soma FOR, AGI ou CTR | sem mudança |

A DT sobe 1 de base para compensar em parte o CTR menor. Com ele e a proficiência, a DT de alto nível fica perto de 19 ou 20, contra Resistências também menores.

### 5. Bestiário e NPCs

- **Atributos das criaturas:** caem para a mesma escala. O principal fica em +1 até a ameaça 3, +2 da 4 à 10 e +3 da 11 em diante; os outros entre −1 e +1.
- **Tabela de ameaça (Defesa, Ataque e DT):** precisa de ajuste, senão o grupo erra muito mais em níveis altos.
  - **Exemplo:** no nível 20, um personagem ataca com +3 do atributo, +2 de treino, +3 da especialização e até +5 de proficiência, ou seja, +13, contra Defesa 19 da tabela.
  - **Ajuste proposto:** −1 na Defesa e no Ataque da ameaça 6 à 10, e −2 da 11 em diante. A DT acompanha a regra nova.
  - Essa decisão é sua: na mudança das perícias você preferiu manter a tabela.
- **NPCs rápidos (Genin a Lendário):** seguem a tabela.

### 6. Fichas que já existem

- **Conversão automática** pela proporção. Valor antigo → novo: −2 → −2, −1 → −1, 0 → 0, +1 e +2 → +1, +3 e +4 → +2, +5 ou mais → +3.
- **Redistribuir uma vez, se quiser:** um aviso na ficha permite refazer os atributos pela compra nova (pontos da criação e aprimoramentos já ganhos). Depois de confirmar, trava, como na correção das perícias.
- **NPCs de ficha completa:** passam pela mesma conversão.

### 7. Livro e telas

- **Livro:** cap. 3 (Atributos e limites), cap. 6 (Passo 2, com a tabela de custo), cap. 17 (progressão), cap. 9 (PC), cap. 4 (PV e PE), cap. 2 (DT), os marcos dos 13 clãs, o Como usar do bestiário e o glossário.
- **Telas:** passo de atributos da criação (custo crescente), subida de nível (aprimoramento), ficha, sorteio (distribuir pela compra nova) e o aviso de redistribuição.

## Verificação

- Testes das regras: custo crescente, teto +3, aprimoramentos, conversão das fichas e recursos recalibrados.
- Sortear 50 fichas e conferir que nenhuma passa de +3 e que o +3 quase sempre vem com um negativo.
- Comparar ataque × Defesa e DT × Resistência nos níveis 1, 5, 10 e 20, contra a tabela de ameaça antes e depois.
- Svelte-check, testes, build e livro gerado e conferido.

## Decisões (2026-11-02)

O usuário escolheu o caminho recomendado em todas:

1. **Criação:** 5 pontos, com custo crescente (+1 custa 1, +2 custa 3, +3 custa 6; −1 devolve 1, −2 devolve 2).
2. **Progressão:** +1 em um atributo abaixo de +3 nos níveis 4, 8, 12, 16 e 20; marcos de clã até o teto, ou uma perícia do clã quando já estiver em +3.
3. **Bestiário:** recalibrar (atributos na escala nova; Defesa e Ataque −1 nas ameaças 6 a 10 e −2 da 11 em diante; DT pela regra nova).
4. **Fichas existentes:** conversão automática pela proporção, mais a opção de redistribuir uma vez.

Falta: implementar (aguardando o ok para começar).
