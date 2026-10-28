# Mesa tática

> **Situação em 23/10/2026:** a Mesa ainda não foi implementada. As regras de movimento e distância já foram decididas e estão no livro (não commitado).
> - **Seção 2:** revisão das regras de movimento e distância. As 11 decisões da 2.5 foram respondidas (todas pela recomendação) e aplicadas.
> - **Seções 3 a 7:** a funcionalidade e as telas, escritas para o Claude Design gerar o lote **L11 · Mesa** (telas M1 a M8).
> - **Seção 9:** o pedido pronto para colar no Claude Design.

A Mesa é uma tela da campanha onde o grupo joga o combate num quadro quadriculado. O Mestre posiciona personagens e NPCs, cada jogador move o próprio token, e todos rolam, medem e consultam fichas sem sair dali.

## Sumário

0. Como usar este documento
1. Visão
2. Regras de movimento e distância (revisão)
3. Funcionalidades
4. Telas
5. Componentes novos
6. Cores e aparência do quadro
7. Dados de exemplo
8. Notas de implementação
9. Pedido para o Claude Design
10. Fora desta versão

---

## 0. Como usar este documento

- **Para as regras:** a seção 2 mostra o que o livro dizia, os buracos que encontrei e as regras que entraram. O texto oficial agora está no cap. 4 (Movimento e Distância, Golpe de Oportunidade e Cobertura).
- **Para o Claude Design:** cole o *Contexto fixo* (`instrucoes-claude-design.md`, seção 10.1) e, depois, o pedido da seção 9 deste arquivo. As telas seguem as convenções do brief:
  - ID por tela (M1, M2…);
  - frames com o nome `ID · Nome · Dispositivo · Estado`;
  - desktop 1440, tablet 834 e mobile 390.
- **O que muda no brief:** a seção 1.4 dele deixava "mapa tático, rolador de dados, rastreador de iniciativa, chat" fora do escopo. O rolador e a iniciativa já existem desde o L10 (Rolagens e Registro); a Mesa traz o resto. A restrição da seção 1.5 ("evitar arrastar-e-soltar complexo ou canvas") tem uma exceção, que é este quadro (ver seção 8).

---

## 1. Visão

### 1.1 Princípios

1. **Papel quadriculado, não videogame.** O sistema mede, avisa e registra; quem decide é a mesa. Só as permissões bloqueiam. Passar do deslocamento ou mirar fora do alcance gera um aviso, nunca um bloqueio, e o Mestre sempre pode corrigir.
2. **Tudo em metros, como no livro.** Um quadrado é 1 m. A régua, os alcances e as áreas falam a mesma língua dos cards de jutsu.
3. **A regra está a um clique.** Todo aviso ("fora do alcance", "provoca reação") leva à seção do cap. 4.
4. **Uma tela só.** Rolar, medir, desenhar e ver a ficha acontecem sem trocar de página.
5. **Ao vivo para todos.** O que um move, desenha ou rola aparece para os outros na hora.

### 1.2 Papéis e permissões

O papel vale por campanha, como no resto do app. A Mesa exige ser membro da campanha.

| Ação | Jogador | Mestre |
|---|:-:|:-:|
| Ver a cena ativa | ✓ | ✓ |
| Ver e preparar outras cenas | não | ✓ |
| Mover o próprio personagem e os tokens ligados a ele (clones, invocações, companheiro) | ✓ | ✓ |
| Mover tokens de outros jogadores e NPCs | não | ✓ |
| Colocar o próprio personagem na cena; criar e remover os próprios clones e invocações | ✓ | ✓ |
| Colocar e remover NPCs; esconder e revelar tokens | não | ✓ |
| Ver tokens escondidos | não | ✓ (meio transparentes) |
| Desenhar com o lápis na própria cor | ✓ | ✓ |
| Apagar traços | Só os seus | Todos |
| Usar a régua e a régua de jutsu | ✓ | ✓ |
| Rolar dados | ✓ | ✓, também em segredo |
| Abrir ficha rápida | A sua completa; as outras só com o resumo público | Todas |
| Organizar NPCs em pastas | não | ✓ |
| Travar a mesa (só o Mestre move) | não | ✓ |

---

## 2. Regras de movimento e distância (revisão)

### 2.1 O que o livro dizia antes da revisão

- **Deslocamento (cap. 4):** a ação secundária move até 10 m, e sprintar (ação primária) soma mais 20 m. Uma rodada dura cerca de 6 segundos.
- **Alcances (cap. 20):**
  - Pessoal;
  - Toque: adjacente, até 1 m;
  - Curto: 10 m;
  - Médio: 30 m;
  - Longo: 60 m;
  - Muito Distante: 100 m ou mais.
- **Áreas (cap. 20):**
  - Linha de 10 m;
  - Cone pequeno: triângulo de 3 m à frente;
  - Esfera de 3 m: círculo de 3 m de raio;
  - Cone médio de 10 m, ou linha de 30 m;
  - Esfera de 6 m;
  - Esfera de 15 m;
  - Massiva: 100 m ou mais.
- **Quem muda o deslocamento:**
  - Velocidade nível 1: +5 m (cap. 19);
  - Velocidade nível 2: duas ações secundárias por turno;
  - 5º Portão: deslocamento triplicado (cap. 16);
  - Shunshin: até 30 m como ação secundária, "sem provocar reações".
- **Estados:** Caído levanta com a ação secundária; Imobilizado não se desloca.
- **Outras distâncias:**
  - Kawarimi: objeto a até 5 m;
  - fios da marionete: até 30 m (50 m com núcleo);
  - sensor: 50 m, 500 m e 5 km;
  - lente de visão noturna: 30 m.

### 2.2 Problemas encontrados

1. **Não há escala de grade nem regra para diagonais.** No papel cada mesa improvisa; na Mesa, o app precisa de uma regra para medir.
2. **"Deslocamento" não é um valor da ficha.** Por isso "+5 m de deslocamento" e "deslocamento triplicado" ficam ambíguos: valem só para a ação secundária ou também para o sprint de +20 m?
3. **Não diz se dá para dividir o movimento**, por exemplo andar 5 m, atacar e andar mais 5 m.
4. **"Sem provocar reações" (Shunshin) não tem regra por trás.** O livro não diz que sair de perto de um inimigo provoca alguma coisa.
5. **"Terreno difícil" aparece no bestiário sem definição:** Doton, Mokuton e as criaturas que erguem colunas ou árvores. Andar em paredes e sobre a água, marca do mundo ninja, não aparece em lugar nenhum.
6. **"Cobertura" aparece sem definição:** o componente "Ignora cobertura" (cap. 20) e a Doryūheki, "como cobertura física".
7. **Áreas ambíguas fora do catálogo.** O bestiário e o cap. 4 usam "área de 10 m" sem dizer se é raio ou lado. O catálogo de jutsus diz "Esfera 6m", que é raio. Cone e linha não têm largura definida.
8. **Kirigakure contraditório:**
   - o cap. 4 dá a versão ilusória como rank D, 4 PC, "área de 10 m", Encoberto Levemente;
   - o catálogo dá rank D, 5 PC, esfera de 6 m, Resistência de ESP, −3 em Percepção e −2 em ataques;
   - a versão real (rank B, 12 PC, "área de 30 m") não está no catálogo, e a tabela de PJ não vende área maior que esfera de 15 m abaixo do rank S;
   - Hideo (cap. 23) usa "área de 20 m por 6 PC".
9. **Bomba de fumaça:** "5 m × 5 m" no cap. 4 e "Encobre 5 m" no cap. 11.
10. **Armas de haste com alcance de arremesso:** Naginata e Manriki (chicote) dizem "Médio", que no resto do livro é 30 m.
11. **"Empurra ou derruba" (cap. 20) não diz a distância**, e os jutsus variam entre 1 m e 5 m.
12. **Tamanho não ocupa espaço.** Invocação Pequena, Grande e Chefe da Espécie mudam a ficha, mas não dizem quantos quadrados o token ocupa.

### 2.3 Regras decididas

Em tópicos, para consulta rápida. No livro, elas viraram a seção **Movimento e Distância** do cap. 4, em prosa com cena e caixa *Na mesa*, mais o Golpe de Oportunidade (em Manobras de Combate) e a Cobertura (em Visão e Encobrimento).

**Medidas e grade**
- Toda distância é em metros. No quadro, 1 quadrado = 1 m.
- **Contagem:** em linha reta, cada quadrado vale 1 m. Na diagonal, os quadrados alternam 1 m e 2 m: o primeiro diagonal vale 1, o segundo 2, o terceiro 1, e assim por diante. Quatro diagonais somam 6 m. A conta é `maior lado + metade do menor lado, arredondada para baixo`, e o app faz isso sozinho.
- **Adjacente:** os oito quadrados em volta, diagonais incluídas. Toque e ataque corpo a corpo alcançam os adjacentes.
- **Alcance:** conte do seu quadrado até o do alvo; se o alvo ocupa vários, vale o mais próximo. O alvo está no alcance se a distância for igual ou menor que ele. Os nomes Curto, Médio, Longo e Muito Distante valem igual para jutsus e armas.

**Deslocamento**
- A ficha ganha o valor **Deslocamento**: 10 m para todo personagem, mais os bônus. A Velocidade nível 1 dá +5 m, e o 5º Portão triplica o valor enquanto estiver aberto.
- **Mover (ação secundária):** até o seu Deslocamento.
- **Sprintar (ação primária):** mais o dobro do Deslocamento. Com 10 m, dá +20 m, igual ao livro hoje. Com 15 m (Velocidade), +30 m.
- **Dividir:** você pode mover parte antes e parte depois da ação primária. O total não passa do que as suas ações dão.
- **Duas ações secundárias** (Velocidade nível 2): dá para mover duas vezes, o dobro do Deslocamento, antes do sprint.
- **Passar por criaturas:** dá para atravessar o espaço de aliados, nunca o de inimigos. Ninguém termina o movimento no espaço de outra criatura.
- **Caído:** levantar custa a ação secundária (como hoje); rastejar conta como terreno difícil.

**Terreno**
- **Terreno difícil** (escombros, mata fechada, lama, gelo, colunas de Doton): cada metro custa 2 m de deslocamento.
- **Paredes, troncos e superfície da água:** todo ninja anda neles como em terreno normal, com o controle de chakra que se aprende cedo. Quem fica Atordoado, Paralisado, Inconsciente ou sem PC cai da parede ou afunda.
- **Nadar e escalar sem chakra:** terreno difícil.

**Golpe de oportunidade**
- Quando um inimigo que você vê sai do seu alcance corpo a corpo usando o próprio deslocamento, você pode gastar a sua **Reação** para um ataque corpo a corpo básico, com arma ou desarmado, sem jutsu e sem gastar PE.
- Não provocam o golpe: Shunshin, Kawarimi, teletransporte (Hiraishin) e movimento forçado (ser empurrado ou puxado).
- Como a Reação é uma só, o golpe de oportunidade compete com a Esquiva Ativa e o Kawarimi. É isso que dá valor ao "sem provocar reações" do Shunshin.

**Movimento forçado**
- Quando o efeito diz "empurra" ou "puxa" sem distância, são **3 m** em linha reta, para longe de quem empurrou (ou na direção de quem puxou).
- O movimento para no primeiro obstáculo ou criatura. Não gasta o deslocamento do alvo e não provoca golpe de oportunidade.

**Tamanho e espaço**

| Tamanho | Espaço no quadro | Exemplos |
|---|---|---|
| Pequena | 1 × 1 | cão de bolso, sapo bebê |
| Média | 1 × 1 | ninjas, cão ninja adulto |
| Grande | 3 × 3 | lobo gigante, sapo guerreiro |
| Chefe da Espécie | 6 × 6 | Gamabunta, Manda, Katsuyu |
| Besta com Cauda | 10 × 10 | Shukaku a Kurama |

- O alcance corpo a corpo de uma criatura grande são os quadrados adjacentes ao espaço dela.
- O Mestre pode encolher uma criatura enorme para caber na cena: o tamanho no quadro não muda a ficha.

**Áreas**
- **Esfera de N m:** todos os quadrados a até N m de um quadrado central, contados como no deslocamento. O centro precisa estar no alcance do jutsu. Uma esfera de 3 m cobre 7 quadrados de lado a lado.
- **"Em torno de si":** o centro é o próprio usuário, que não é atingido, a não ser que o jutsu diga.
- **Cone de N m:** sai do usuário, com N m de comprimento e N m de largura na ponta. O cone pequeno tem 3 m, e o médio, 10 m.
- **Linha de N m:** sai do usuário, com N m de comprimento e 1 m de largura.
- **Parede e muralha:** uma faixa de 1 m de espessura, com o comprimento do jutsu, posicionada dentro do alcance. A altura é narrativa.
- **Que quadrados entram:** na esfera, os que estão dentro da contagem. No cone, na linha e na parede, os quadrados cujo centro fica dentro da forma. Uma criatura grande é atingida se qualquer quadrado dela estiver na área.
- **Textos antigos:** "área de N m" passa a ser escrito "esfera de N m" (ver 2.4).

**Cobertura**
- **Meia cobertura** (mureta, tronco, outra criatura entre você e o alvo): −2 no ataque, como Encoberto Levemente. As duas não somam: vale a pior.
- **Cobertura total** (muralha de terra, parede inteira): não dá para mirar o alvo. Uma área só o atinge se ele estiver dentro dela, sem a parede no meio.
- "Ignora cobertura" (cap. 20) passa pelas duas.

**Alcance das armas**
- Corpo a corpo: adjacente (1 m).
- **Haste: 2 m**, para Naginata e Manriki (hoje "Médio").
- Arremesso (Versátil, Rajada, Kunai, Shuriken, Senbon): Curto (10 m). Fuuma Shuriken e Arco Longo: Médio (30 m).

### 2.4 Ajustes pontuais em outros textos (aplicados)

| Onde | Antes | Agora |
|---|---|---|
| Cap. 4, Ações por Turno | "até 10 m por ação secundária"; "sprintar dá +20 m" | "até o seu Deslocamento (10 m)"; "sprintar dá mais o dobro (20 m)" |
| Cap. 4, Kirigakure ilusório | rank D, 4 PC, área de 10 m, Encoberto Levemente | igual ao catálogo: 5 PC, esfera de 6 m, Resistência de ESP; quem falha tem −2 nos ataques (como Encoberto Levemente) e −3 em Percepção |
| Cap. 4, Kirigakure real | rank B, 12 PC, área de 30 m | esfera de 15 m em torno do usuário, e o Kirigakure no Jutsu (Técnica de Ocultação na Névoa, Suiton, rank B, 12 PC) entra no catálogo e na seção Suiton do cap. 10 |
| Cap. 11, Bomba de fumaça | "Encobre 5 m por 3 turnos" | "Encobre um quadrado de 5 m × 5 m por 3 turnos", igual ao cap. 4 |
| Cap. 12, Naginata e Manriki | Alcance "Médio" | "Haste (2 m)", e a introdução do catálogo explica corpo a corpo, haste e os alcances em metros |
| Cap. 20, Efeitos especiais | "Empurra ou derruba" | "Empurra (3 m, se o jutsu não disser) ou derruba", também no criador de jutsus (J2) |
| Cap. 20, Área | sem largura de cone e linha | cone com largura igual ao comprimento na ponta; linha de 1 m de largura |
| Cap. 22, Glossário | "Ação Secundária: Mover (até 10 m)" | "Mover (até o Deslocamento)", e os verbetes novos: Deslocamento, Adjacente, Terreno difícil, Golpe de oportunidade, Cobertura, Movimento forçado |
| Cap. 23, Hideo | "área de 20 m em névoa por 6 PC" | o Kirigakure real do catálogo, com o custo de lá |
| Cap. 16 e cap. 19 | "deslocamento triplicado"; "+5 m de deslocamento" | "Deslocamento triplicado"; "+5 m no Deslocamento"; a onda de choque do 6º Portão tem "3 m de raio" |
| Bestiário (41 traços) | "numa área de 10 m" | "numa área de 10 m de raio" |
| `conteudo/termos.yaml` | sem esses verbetes | Deslocamento, Terreno difícil, Golpe de Oportunidade, Cobertura e Movimento Forçado, com cartão de hover; Ação Secundária e Reação atualizadas |

### 2.5 Decisões (respondidas em 23/10)

Todas ficaram com a recomendação. A alternativa fica registrada para o caso de revisão futura.

| # | Decisão | Escolhida | Alternativa descartada |
|---|---|---|---|
| D1 | Escala da grade | 1 quadrado = 1 m: o Toque (1 m) e todas as áreas do livro (3, 6, 10, 15 m) fecham em quadrados inteiros | 1,5 m como no D&D; aí o Toque e as esferas de 3 m e 10 m não fecham |
| D2 | Diagonais | Alternar 1 m e 2 m: dá para contar à mão e fica perto da distância real | Linha reta exata (só no app), ou toda diagonal valendo 1 m (mais simples, mas um círculo vira quadrado) |
| D3 | Deslocamento e sprint | Deslocamento vira valor da ficha, e o sprint dá o dobro dele | Sprint fixo de +20 m, e os bônus só valem na ação secundária |
| D4 | Golpe de oportunidade | Criar, gastando a Reação, com as exceções acima | Não criar, e tirar "sem provocar reações" do Shunshin |
| D5 | Paredes e água | Terreno normal para todo ninja; cai ou afunda quem fica sem PC ou incapacitado | Custar 1 PC por turno, ou só para quem tem Controle de Chakra |
| D6 | Tamanho no quadro | 1, 1, 3, 6 e 10 quadrados | Grande 2 × 2 e Chefe 4 × 4, para mapas menores |
| D7 | Cobertura | Meia: −2, igual a Encoberto Levemente; total: não pode ser alvo | Deixar a critério do Mestre e tirar "Ignora cobertura" do cap. 20 |
| D8 | Naginata e Manriki | Haste de 2 m | Manter "Médio" e ler como arremesso |
| D9 | Áreas | "área de N m" = raio de N m, como as esferas do catálogo | "área de N m" = diâmetro, com o raio pela metade |
| D9b | Kirigakure | vale o catálogo; o real vira esfera de 15 m e entra no catálogo | valer o cap. 4 (área de 30 m, que a tabela de PJ não vende abaixo do rank S) |
| D10 | Empurrão sem distância | 3 m | 1 m, como no exemplo do chute giratório do cap. 20 |

---

## 3. Funcionalidades

### 3.1 Pad quadriculado

- **Grade sutil:** linhas de 1 m quase apagadas, com uma linha um pouco mais forte a cada 5 m, que ajuda a contar sem régua (cores na seção 6).
- **Coordenadas opcionais** nas bordas (A, B, C… na horizontal; 1, 2, 3… na vertical), para frases como "vou para F12". Ficam desligadas por padrão.
- **Tamanho da cena:** 40 × 30 m por padrão, configurável pelo Mestre até 200 × 200 m.
- **Navegação:** zoom de 25% a 400% com a roda, a pinça ou os botões; "Ajustar à tela". Para mover a vista, arraste o fundo com a ferramenta Mover, use Espaço + arrastar, ou dois dedos no toque. Em zoom de 100%, 1 m tem 48 px.
- **Cenas:** a campanha guarda várias (a ponte, o esconderijo, a floresta). Só uma fica ativa para o grupo; o Mestre prepara as outras sem que ninguém veja (ver M6).

### 3.2 Tokens

- **Quem vira token:**
  - personagens dos jogadores;
  - NPCs de ficha completa;
  - NPCs rápidos (ficha resumida N2);
  - criaturas do bestiário, que entram como NPC, igual ao "usar na campanha";
  - membros de uma tropa genérica, um token por membro, numerados de 1 a N.
- **Tokens ligados:** clones (Kage Bunshin e afins), invocações e o companheiro (cão Inuzuka) pertencem ao personagem que os criou. O dono move e remove esses tokens.
- **Aparência:**
  - círculo com o retrato (a foto da ficha ou do NPC; sem foto, as iniciais sobre a cor do dono);
  - anel na cor do dono (a mesma do lápis, seção 6);
  - nome embaixo;
  - tamanho conforme a tabela da seção 2.3.
- **Sinais sobre o token:**
  - barra de PV fina embaixo: números para o dono e o Mestre, faixa de ferimento para os outros (3.8);
  - até 3 ícones de estado (`estado/ic-estado-*`) na borda, e "+N" se houver mais;
  - halo ouro no token da vez, quando a iniciativa está ativa;
  - anel tracejado no token selecionado;
  - Caído ou Inconsciente: retrato em cinza com o ícone de Caído; Morrendo ganha um pip vermelhão;
  - escondido: só o Mestre vê, meio transparente e com o ícone de olho cortado.
- **Hover ou foco:** um cartão pequeno com nome, PV (ou faixa), Defesa e estados. O clique duplo abre a ficha rápida.

### 3.3 Mover tokens

- **Arrastar:** o token gruda no centro do quadrado. Enquanto você arrasta:
  - um fantasma fica na origem;
  - uma linha mostra o caminho com a distância ("7 m · sobram 3 m");
  - a linha usa a cor do dono enquanto cabe no Deslocamento, ouro quando entra no sprint ("Sprint: +20 m") e vermelhão quando passa do total ("4 m além do limite"). É aviso, não bloqueio.
- **Golpe de oportunidade:** se o caminho sai do alcance corpo a corpo de um inimigo, aparece "provoca reação de Hideo" junto à linha. NPCs são inimigos por padrão; o Mestre pode marcar um NPC como aliado.
- **Contador do turno:** com a iniciativa ativa, o token da vez soma os metros andados no turno, mesmo em vários arrastos, e zera no próximo turno dele. Sem iniciativa, cada arrasto mede só a si mesmo.
- **Desfazer:** Ctrl+Z desfaz o seu último movimento no turno.
- **Teclado:** com um token selecionado, as setas movem 1 m e Enter confirma.
- **Permissões (1.2):**
  - quem não pode mover um token também não consegue arrastá-lo, e o cursor mostra o cadeado;
  - com a mesa travada, só o Mestre move, e os jogadores veem o aviso "Mesa travada pelo Mestre".
- **Ao vivo:** os outros veem o fantasma se mexendo enquanto você arrasta, e o token no lugar novo quando você solta.

### 3.4 Lápis

- **Cada usuário tem uma cor** (seção 6), escolhida no menu do próprio avatar na barra da Mesa. A cor é única na campanha: as já tomadas aparecem indisponíveis, com o nome de quem usa. O Mestre começa com vermelhão.
- **Modos:**
  - **Lápis:** o traço fica na cena até alguém apagar. Shift desenha linha reta.
  - **Apontar:** o traço some sozinho em 3 segundos, para mostrar um caminho ou um alvo sem sujar a cena.
- **Espessuras:** fina, média e grossa, medidas no mapa (10, 20 e 40 cm). O traço acompanha o zoom.
- **Borracha:** apaga o traço inteiro que tocar, só os seus (o Mestre apaga qualquer um).
- **Limpar:** "Limpar meus traços" para todos; "Limpar todos os traços" só para o Mestre, com confirmação.
- **Autor:** passar o mouse sobre um traço mostra de quem é. A cor nunca é o único sinal.
- **Ao vivo:** os outros veem o traço sendo desenhado.

### 3.5 Régua em metros

- **Régua livre (M):** arraste de um quadrado a outro. A régua gruda nos centros dos quadrados e mostra a distância com a regra de contagem da seção 2.3.
  - Clique para criar pontos no caminho; o rótulo mostra os trechos e o total ("5 + 7 = 12 m").
  - Esc cancela. Ao soltar, a régua some em 3 segundos, a não ser que você clique no alfinete para fixá-la.
  - Todos veem a régua de quem está medindo, na cor dele e com o nome ("Aiko medindo").
- **Atalhos a partir de um token selecionado** (menu da ferramenta Medir):
  - **Deslocamento:** dois anéis suaves, até onde ele chega movendo e até onde chega com sprint;
  - **Corpo a corpo:** realça os quadrados adjacentes, ou a 2 m com arma de haste;
  - **Armas:** o alcance de cada arma do inventário;
  - **Distâncias da ficha:** Kawarimi (5 m), fios da marionete (30 m ou 50 m), sensor (50 m), quando a ficha tiver a técnica ou a especialização.

### 3.6 Régua de jutsu

Medir um jutsu é escolher o jutsu e mirar. A régua lê o alcance e a área do próprio card.

**Fluxo**
1. **Escolher o jutsu:** na ficha rápida do token (aba Jutsus), cada jutsu tem os botões **Medir** e **Usar**. Pela ferramenta Medir, a opção "Jutsu…" abre uma busca nos jutsus do token selecionado.
2. **Alcance:** um anel em volta do lançador marca o alcance ("Médio · 30 m"); fora dele, o quadro escurece um pouco.
3. **Mirar:** o molde da área segue o ponteiro:
   - **alvo único:** uma mira que gruda nos tokens;
   - **"+N alvos" e "Até N alvos":** clique para escolher até N alvos, com contador;
   - **esfera:** os quadrados da área se acendem;
   - **cone e linha:** giram em volta do lançador, com Shift para travar em 45°;
   - **parede:** arraste para posicionar e gire com [ e ];
   - **"Cone médio / Linha 30m":** um seletor alterna entre as duas formas.
4. **Barra da régua**, no topo do quadro:
   - nome, rank e custo do jutsu;
   - alcance e área;
   - distância até o alvo;
   - quem está na área ("3 na área: Bandido 1, Bandido 2, Hideo"). O jogador só vê os tokens visíveis.
   - Estados: certo, **fora do alcance** (vermelhão, "34 m · alcance 30 m") e sem alvo.
5. **Fixar e usar:**
   - o clique fixa o molde, que todos veem por 10 segundos ou até usar ou cancelar;
   - **Usar jutsu** segue o fluxo que já existe na ficha: gasta PC ou PE e rola ataque e dano, ou mostra a DT da Resistência no jutsu de área. A rolagem vai ao chat com os alvos;
   - jutsus com duração (Kirigakure por 3 turnos, Doryūheki por 1 cena) têm a opção **Deixar na cena**. A área vira um efeito em cena, com o nome e os turnos restantes, até acabar ou o Mestre remover.

**Como o card vira régua**

Mais de 95% dos 429 jutsus do catálogo usam os valores-padrão abaixo. Os jutsus criados na campanha (J2) também, porque o criador usa as mesmas tabelas.

| Alcance no card | Régua |
|---|---|
| Toque | adjacente (1 m) |
| Curto (10m) · Médio (30m) · Longo (60m) | 10 · 30 · 60 m |
| Muito Distante (100m+) | anel de 100 m |
| Pessoal | sem anel; a área sai do usuário |
| Número escrito ("Até 5m", "arremesso até 15m") | o número |
| Alcance da arma | o alcance da arma empunhada |
| "Qualquer marca", "Visão", "Qualquer distância" | sem régua: "Alcance especial" |

| Área no card | Molde |
|---|---|
| Alvo único · Alvo único +N · Até N alvos · 1 aliado | escolha de 1 a N+1 alvos |
| Esfera 3m · 6m · 15m | esfera |
| Esfera em torno de si | esfera centrada no usuário |
| Cone pequeno · Cone médio (10m) | cone de 3 m · cone de 10 m |
| Cone médio / Linha 30m | escolher cone de 10 m ou linha de 30 m |
| Linha 10m · Linha reta (30m) | linha |
| Parede de 3m × 3m · Muralha de até 30 m | parede |
| Massiva (100m) · vários km · "toda a área onde a chuva cai" | a cena inteira acende, com o aviso "Área maior que a cena" |
| Pessoal | sem molde |

### 3.7 Chat de rolagem

É o mesmo registro da tela de Rolagens (L10, R1), num painel lateral e só com a campanha atual.

- **Entradas iguais às do registro:**
  - retrato, quem, rótulo, expressão e o total em dígitos grandes;
  - marcas ★ crítico, ✖ falha crítica e PD gasto;
  - a conta detalhada ao abrir;
  - as ações de PD nas suas rolagens.
- **Rolagem oculta:** o Mestre vê o resultado; o jogador vê "O Mestre rolou em segredo".
- **Filtros curtos:** TODAS, ATAQUES, DANO, TESTES e INICIATIVA.
- **Rolador no rodapé:**
  - o mesmo `RoladorDados`: expressão, botões de d4 a d20, VANTAGEM e DESVANT.;
  - "Rolar em segredo", só para o Mestre.
- **De onde chegam as rolagens:** da ficha rápida, da régua de jutsu e do botão de dados global. As rolagens de jutsu listam os alvos.
- **Ligação com o quadro:** clicar numa entrada realça por 1 segundo o token de quem rolou.
- **Painel recolhido:** o ícone mostra quantas rolagens novas chegaram, e a última aparece numa faixa curta.
- **Carga:** abre com as últimas 50 e segue ao vivo.

### 3.8 Ficha rápida

Uma janela flutuante sobre o quadro. Ela se arrasta como a janela de rolagens (R2) e fica com o token na tela.

- **Como abrir:** clique duplo no token, "Ficha" no cartão de hover, ou clique no nome na lista do Elenco.
- **Várias janelas:** até 3 ao mesmo tempo, em cascata, para comparar. Cada uma minimiza num chip no rodapé do quadro.
- **Cabeçalho:** retrato, nome, clã e vila, nível ou rank de poder e o selo de dono na cor dele.
- **Recursos:**
  - barras de PV, PC e PE;
  - um campo rápido aceita "−7" ou "+5" e aplica (dono e Mestre);
  - estrelas de PD.
- **Combate:** Defesa, Defesa Mental, Iniciativa (com botão de rolar) e Deslocamento.
- **Estados:** chips para ligar e desligar os estados especiais do cap. 4, mais os pips de Fadiga. Os estados ligados aparecem no token.
- **Abas:**
  - **Ações:** ataques com armas; jutsus favoritos; Esquiva Ativa (10 PE), Defesa Total (10 PE) e Combo Taijutsu (5 PE). Cada ação tem Medir e Usar.
  - **Jutsus:** todos, com Medir e Usar.
  - **Perícias:** os botões de rolar da ficha.
  - **Notas:** do jogador no próprio personagem; do Mestre nos NPCs.
- **Rodapé:** "Abrir ficha completa" (nova aba), "Centralizar no mapa", "Remover da cena" (Mestre) e, para o dono, "Criar clone" e "Invocar".
- **Variantes:**
  - **Personagem seu:** completa e editável.
  - **Personagem de outro jogador:** resumo público (retrato, nome, clã, vila, rank) e a faixa de ferimento.
  - **NPC rápido (Mestre):** os campos da N2 (PV, PC, Defesa, Iniciativa, ataque, especial, tags, ganchos). O ataque "1d20 + 7 → 1d8 + 4" vira botões de rolar.
  - **NPC do bestiário (Mestre):** os números da ficha do bestiário e os usos de jutsu.
  - **Tropa (Mestre):** um seletor de membro (1 a N) com os PV de cada um em pips.
  - **NPC revelado (jogador):** o card público (nome, função, aparência) e a faixa de ferimento.

**Faixa de ferimento**, para quem não vê os números:

| Faixa | PV |
|---|---|
| Ileso | cheio |
| Ferido | acima da metade |
| Muito ferido | metade ou menos |
| Caído | 0 ou menos |

Nas configurações da cena, o Mestre pode ligar "Mostrar PV ao grupo".

### 3.9 NPCs em pastas

- **Onde:** no painel **Elenco**, à esquerda da Mesa, e também na página de NPCs da campanha (N1), que ganha a mesma árvore.
- **Pastas:**
  - até 3 níveis (pasta, subpasta, sub-subpasta). Exemplo: "Arco 1 · A ponte" › "Capangas do daimyō";
  - criar, renomear (clique duplo ou F2), reordenar e aninhar arrastando;
  - cada pasta mostra quantos NPCs tem e lembra, neste navegador, se está aberta.
- **NPCs:**
  - cada NPC fica em uma pasta só, ou em "Sem pasta";
  - arraste para mover entre pastas;
  - vale para os três tipos: NPC rápido, NPC de ficha completa e criatura do bestiário.
- **Excluir pasta** não apaga NPCs. O conteúdo sobe para a pasta de cima, com o aviso: "Os 5 NPCs voltam para 'Arco 1'. Nenhum NPC é apagado."
- **Criar:**
  - "Novo NPC" abre o modal que já existe (resumida, gerar, completa), dentro da pasta aberta;
  - "Do bestiário" abre a busca de criaturas e cria o NPC ali.
- **Para o quadro:**
  - arrastar um NPC coloca o token;
  - arrastar uma pasta coloca todos os NPCs dela juntos, em formação, e a tropa se abre em membros;
  - NPCs entram escondidos, para emboscadas. O Mestre revela com o olho, um a um, ou com "Revelar seleção".
- **Busca e filtros:** por nome, rank e "na cena".
- **Jogadores:** não veem a árvore. O Elenco deles mostra só "Em cena", com os tokens visíveis.

### 3.10 Iniciativa na Mesa

O contador de movimento depende de saber de quem é a vez, então a ordem de iniciativa (que já existe no L10) entra na Mesa:

- uma aba **Iniciativa** no painel direito, ao lado de Rolagens, com a ordem que sai das rolagens de iniciativa;
- o Mestre controla **Começar combate**, **Próximo turno** (atalho N) e **Encerrar combate**; a rodada aparece no topo ("Rodada 3");
- o token da vez ganha o halo ouro, e o contador de movimento dele zera;
- o jogador recebe o aviso "Sua vez, Hana!".

Hoje a ordem é guardada em cada navegador. Na Mesa ela passa a ser da cena e igual para todos (ver seção 8).

### 3.11 Atalhos

| Tecla | Ação |
|---|---|
| V | Mover (selecionar e arrastar) |
| M | Medir (régua livre) |
| L | Lápis |
| P | Apontar |
| E | Borracha |
| Espaço + arrastar | Mover a vista |
| Setas | Mover o token selecionado 1 m |
| [ / ] | Girar a parede, o cone ou a linha na régua de jutsu |
| N | Próximo turno (Mestre) |
| H | Esconder ou revelar o token selecionado (Mestre) |
| Ctrl+Z | Desfazer o último movimento ou traço |
| Esc | Cancelar a régua ou soltar a seleção |
| R | Janela de rolagens (já existe no app) |

---

## 4. Telas

### M1 · Mesa (tela principal)

Rota: `/campanhas/[id]/mesa`. Entra no menu da campanha logo abaixo do painel, com o ícone de mesa.

**Desktop 1440**

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Sombras sobre a Névoa  ›  Mesa  ›  A ponte ▾        (K)(A)(B)(C)·(D)      Rodada 3   [⚙] │
├────────────────┬────┬──────────────────────────────────────────────────┬─────────────────┤
│ ELENCO         │ ▣V │  ┌ Goukakyu no Jutsu · C · 9 PC · Médio 30 m ─┐   │ Rolagens│Inicia.│
│ Em cena (8)    │ ⟷M │  │ Esfera 3 m · 14 m · 3 na área   [Usar] [×] │   │ Ren Uchiha      │
│  Hana Nara     │ ✎L │  └────────────────────────────────────────────┘   │ Goukakyu  DT 14 │
│  Ren Uchiha    │ ◌P │                                                  │ Hideo  (segredo)│
│  ...           │ ⌫E │      quadro quadriculado (1 m), tokens,          │ Hana  Percep. 23│
│ NPCs           │    │      traços, régua e moldes                      │                 │
│  ▾ Arco 1      │    │                                                  │                 │
│    ▸ Capangas  │    │                                                  │                 │
│  ▸ Reservas    │    │                                  [−] 100% [+] ⤢  │ [d4 … d20] 1d20 │
│ [+ Pasta] [+NPC]│   │  [chip: Hideo] [chip: Bandido 2]  (fichas min.)  │ [Rolar]         │
└────────────────┴────┴──────────────────────────────────────────────────┴─────────────────┘
   280 px          48     restante                                          360 px
```

- **Barra superior:**
  - caminho até a cena; para o Mestre, o nome da cena abre M6;
  - avatares de quem está online, com o anel da cor de cada um. Quem saiu fica apagado;
  - a rodada, quando a iniciativa está ativa;
  - engrenagem (Mestre): travar a mesa, coordenadas, mostrar PV ao grupo.
- **Elenco** (esquerda, recolhível): ver M2.
- **Trilho de ferramentas:** Mover, Medir, Lápis, Apontar, Borracha. Medir e Lápis abrem um popover com opções (M4, M5).
- **Quadro:** a grade, os tokens, os traços, as réguas e os efeitos em cena.
  - barra da régua de jutsu no topo, quando ativa;
  - zoom no canto inferior direito;
  - chips das fichas minimizadas no rodapé;
  - janelas de ficha rápida flutuando por cima (M3).
- **Painel direito** (recolhível): abas Rolagens (M7) e Iniciativa.

**Estados**
- **Cena vazia (Mestre):** "Cena vazia. Arraste personagens e NPCs do Elenco para o quadro." e o botão [Colocar o grupo], que posiciona todos os personagens dos jogadores juntos.
- **Cena vazia (jogador):** "O Mestre ainda está montando a cena." Se o personagem dele não está na cena, aparece [Entrar na cena].
- **Sem cena ativa (jogador):** "Nenhuma cena aberta agora."
- **Carregando:** skeleton da grade e do painel.
- **Mesa travada (jogador):** faixa no topo do quadro, "Mesa travada pelo Mestre", e o cadeado no cursor sobre os tokens.
- **Mestre vendo outra cena:** faixa "Você está vendo 'Esconderijo'. O grupo vê 'A ponte'." com [Ativar esta cena].
- **Sem conexão:** "Sem conexão. Seus movimentos aparecem para o grupo quando a conexão voltar." O quadro continua utilizável.
- **Sua vez:** toast "Sua vez, Hana!" e o halo no seu token.

### M2 · Elenco e pastas (painel)

- **Seções:**
  - **Em cena:** os tokens da cena, agrupados em Personagens e NPCs, com o olho para esconder e revelar (Mestre);
  - **Personagens:** os personagens dos jogadores, para arrastar ao quadro;
  - **NPCs:** a árvore de pastas (3.9), só para o Mestre.
- **Topo da seção NPCs:**
  - busca;
  - filtros de rank e "na cena";
  - [+ Pasta], [+ NPC] e [Do bestiário].
- **Linha de NPC:**
  - retrato pequeno, nome, badge de rank e a contagem da tropa ("×4");
  - o ícone de olho, se está revelado aos jogadores;
  - o ponto verde, se está na cena.
- **Menu da pasta:** renomear, nova subpasta, colocar todos na cena, excluir.
- **Estados:**
  - nenhuma pasta: "Organize seus NPCs em pastas, por arco, lugar ou facção." [Criar pasta];
  - pasta vazia: "Arraste NPCs para cá.";
  - visão do jogador: só "Em cena";
  - arrastando: a pasta de destino se realça e mostra a linha de inserção.

### M3 · Ficha rápida (janela)

- Desktop: janela de 380 × até 600 px, arrastável, com abas.
- Conteúdo: ver 3.8.
- **Frames:**
  - personagem do jogador (Hana Nara, aba Jutsus);
  - NPC rápido do Mestre (Hideo);
  - tropa (Bandido 2 de 4);
  - personagem de outro jogador visto por um jogador;
  - NPC revelado visto por um jogador;
  - minimizada (chip);
  - campo de dano aplicado: o PV desce com a contagem rápida do brief, seção 2.7.
- **Ficha completa** (botão FICHA COMPLETA na ficha rápida; MINHA FICHA na barra, para o jogador):
  - Abre numa janela grande, arrastável, redimensionável e minimizável, com as abas da página da ficha.
  - O jogador abre só a dele e o Mestre, qualquer uma (`/campanhas/[id]/mesa/ficha/[pid]`; 403 para os outros).
  - O estado é o mesmo da ficha rápida.
  - Na aba Jutsus, MEDIR liga a régua e minimiza a janela, e USAR vai pelo caminho da Mesa.
- Aba EQUIP. na ficha rápida do personagem: a mochila por grupo, com carga e ryo.
- O nome do jutsu (e da habilidade do bestiário) é clicável e abre o card inteiro num modal. O card vem de
  `/campanhas/[id]/mesa/jutsu/[slug]`, que responde com o catálogo ou com o jutsu criado na campanha (`jc-<id>`).
- Armas com mais de um modo de uso (cap. 12) viram uma linha por modo, por exemplo "Kunai" (corpo a corpo, FOR) e
  "Kunai (arremesso)" (Curto 10 m, Bukijutsu à distância e AGI). São elas:
  - as de alcance duplo no catálogo;
  - as Versáteis, incluindo as do bestiário cuja ficha só diz "corpo a corpo".

### M4 · Régua de jutsu e régua livre (estados do quadro)

Os frames mostram o quadro com cada estado:

1. **Régua livre** com dois pontos no caminho: "5 + 7 = 12 m".
2. **Deslocamento:** anéis de 10 m e 30 m em volta de Sora Inuzuka.
3. **Goukakyu no Jutsu (Ren):** Médio 30 m, esfera de 3 m sobre Hideo e dois bandidos; barra "3 na área".
4. **Fora do alcance:** a mesma esfera a 34 m, com o anel e a barra em vermelhão.
5. **Kage Mane no Jutsu (Hana):** Médio 30 m, alvo único +2; dois alvos escolhidos, contador "2 de 3".
6. **Raiton: Kangekiha:** o seletor [Cone 10 m] [Linha 30 m] e o cone girado.
7. **Doryūheki:** a parede de 3 m posicionada e girada.
8. **Efeito em cena:** Kirigakure ilusório deixado na cena, com o rótulo "Kirigakure · 2 turnos".
9. **Jutsu sem régua:** Hiraishin com Medir desabilitado e a dica "Alcance especial: sem régua".

O popover da ferramenta Medir traz: Régua livre · Deslocamento · Corpo a corpo · Jutsu… · Arma… · Distâncias da ficha.

### M5 · Lápis e cor

- **Popover do lápis:** modo (Lápis ou Apontar), espessura (fina, média, grossa), a cor atual, [Limpar meus traços] e, para o Mestre, [Limpar todos os traços].
- **Escolha de cor**, no menu do avatar: grade com as 9 cores (seção 6). As tomadas mostram o retrato de quem usa e ficam desabilitadas.
- **Moldura do token**, no mesmo menu: "Nenhuma" e 10 molduras em pixel art feitas no PixelLab (`pixellab/molduras.json`
  → `static/molduras/`).
  - A do jogador fica no perfil (`preferencias.moldura`), vale em todas as campanhas e chega ao vivo por broadcast.
  - A do Mestre é a moldura da mesa, guardada na campanha (`campanhas.moldura`). Por padrão, vale nos NPCs e em quem não
    escolheu; quem escolheu fica com a dele. Com "Todos os tokens" (`moldura_universal`), vale em todo token, por cima da
    escolha dos jogadores. A opção "Padrão" do jogador segue a moldura da mesa.
  - Com moldura, o anel vai a 0,56 do lado e o retrato encolhe para caber no furo (`interno` em `src/lib/mesa/molduras.ts`).
- **Terreno difícil** (ferramenta T, só o Mestre): arrastar pinta, e começar num quadrado marcado apaga.
  - Fica na cena (`mesa_cenas.terreno`); LIMPAR TERRENO DIFÍCIL fica no menu da cena.
  - O arrasto e a régua mostram, abaixo da metragem, o deslocamento gasto ("terreno difícil: 4 m custam 7 m"); o turno
    conta o custo.
- **Deslocamento** = 8 m + AGI (mínimo 5 m; NPC do bestiário pela AGI da ficha, NPC rápido 10 m). O Sprint dobra.
- **Quadrado:** forma de área nova (centro num ponto no alcance, lado no card), para barreiras de quatro cantos.
- **Cena narrativa** (menu da cena, MODO TÁTICA / NARRATIVA): a imagem da cena aparece para todos no lugar do quadro,
  com o fundo desfocado e o nome da cena, e só o chat de rolagens fica ao lado.
  - A imagem é uma arte do livro (capas das vilas e aberturas de capítulo) ou uma enviada pelo Mestre.
  - O envio vai em webp, com até 2048 px, para o bucket público `mesa/<campanha>/`; só o Mestre envia e apaga.
- **Fundo do quadro:** uma imagem esticada na cena inteira, sob a grade, com opacidade e a grade opcional.
- **Criar cena:** VAZIA, COM O GRUPO ou ESCOLHER (só os personagens marcados entram e jogam).
- **Foto ampliada:** clicar no retrato (ficha rápida, ficha completa, página da ficha) abre a imagem com zoom e arrasto.
- **HUD de ação** (inspirado no Baldur's Gate 3):
  - os dados aparecem com a arte do dado e o dano na cor do elemento, nas linhas da ficha rápida, na régua e no chat;
  - passar o mouse num jutsu ou arma mostra o tooltip: faixa de dano, efeito, alcance/área/duração/resistência, ação
    e custo.
- **Crescer** (cap. 4: Baika e Lobo de Duas Cabeças ficam Grandes; Chou Baika e Lobo de Três Cabeças, Enormes): USAR na
  ficha rápida cresce o token pela duração do jutsu.
  - O espaço novo cobre o antigo, no encaixe livre mais perto do centro, e o token guarda o tamanho normal
    (`mesa_tokens.tamanho_base`, `crescido_turnos`).
  - Os turnos contam a cada rodada nova. Ele volta sozinho no zero, no fim do combate ou em VOLTAR AO NORMAL.
  - O jogador pode crescer e voltar o próprio token. A linha TAMANHO do Mestre define o novo normal.
- **Frames:**
  - traços de três pessoas no quadro: uma seta de Aiko e um círculo de Kaito em volta da ponte;
  - hover num traço mostrando o autor;
  - o modo Apontar sumindo.

### M6 · Cenas (Mestre)

- **Menu** (o nome da cena na barra):
  - a lista de cenas, com a ativa marcada;
  - [Nova cena] · [Duplicar] · [Renomear] · [Excluir].
- **Nova cena (modal):** nome, largura e altura em metros (padrão 40 × 30) e o início vazio ou com o grupo.
- **Excluir** uma cena com tokens pede o nome da cena para confirmar, pela regra de confirmação proporcional do brief (5.4).
- **Configurações da cena:** travar a mesa, coordenadas, mostrar PV ao grupo e limpar traços.
- **Estados:** lista com 4 cenas; cena preparada sem estar ativa; a confirmação de exclusão.

### M7 · Chat de rolagem (painel)

- Conteúdo: ver 3.7. Reaproveita a entrada do registro (R1) e o rolador.
- **Frames:**
  - lista com crítico, falha, PD e uma rolagem de jutsu com alvos;
  - a rolagem oculta, vista pelo Mestre e pelo jogador;
  - vazio: "Nenhuma rolagem nesta sessão. Os dados estão no rodapé.";
  - painel recolhido, com o contador de novas e a faixa da última rolagem.

### M8 · Mesa no celular e no tablet

- **Celular (390):**
  - o quadro ocupa a tela; a barra superior fica compacta (cena e número de pessoas online);
  - dock inferior: [Mover] [Medir] [Lápis] [Rolagens] [Mais];
  - Elenco: drawer pela esquerda (Mestre) ou a lista "Em cena" (jogador);
  - ficha rápida: bottom sheet em duas alturas (metade e tela cheia);
  - chat: bottom sheet. Uma faixa acima do dock mostra a última rolagem;
  - barra da régua de jutsu: acima do dock, com [Usar] e [×];
  - gestos: um dedo no seu token arrasta; um dedo no fundo move a vista; pinça faz zoom; toque longo no token abre o cartão.
- **Tablet (834, de pé e deitado):** Elenco vira trilho de ícones que abre por cima, e o painel direito recolhe numa aba.
- **Frames:**
  - jogador movendo o próprio token, com a linha "7 m · sobram 3 m";
  - régua de jutsu com a barra no rodapé;
  - ficha rápida em meia altura;
  - chat aberto;
  - Mestre com o drawer do Elenco.

### N1 · NPCs da campanha (ajuste)

- **Desktop:** a árvore de pastas do M2 entra como coluna à esquerda da grade de cards, com o caminho no topo ("NPCs › Arco 1 › Capangas").
- **Celular:** a árvore vira um seletor de pasta.
- **Card:** o CMP-34 ganha a ação "Mover para pasta".

---

## 5. Componentes novos

Seguem a numeração do brief (o último era o CMP-35).

- **CMP-36 · Token.**
  - Tamanhos 1, 3, 6 e 10 quadrados.
  - Anel na cor do dono; retrato ou iniciais; rótulo; barra de PV ou faixa de ferimento; até 3 ícones de estado.
  - Estados: padrão, hover, selecionado, da vez (halo ouro), escondido, caído, arrastando (fantasma na origem), bloqueado (cadeado).
- **CMP-37 · Quadro.** A grade (de 1 m e de 5 m), as coordenadas opcionais, o zoom e a vista, e as camadas, de baixo para cima: grade, efeitos em cena, traços, moldes, tokens, réguas, ponteiros.
- **CMP-38 · Régua.** Linha com pontos de caminho, rótulo de trechos e total, alfinete para fixar e o nome de quem mede. Variantes: livre, movimento (cor do dono, ouro, vermelhão) e anéis de alcance.
- **CMP-39 · Molde de área.** Esfera, cone, linha, parede e mira de alvo. Os quadrados atingidos ganham preenchimento leve e hachura, para não depender só da cor. Estados: certo, fora do alcance, fixado, efeito em cena (com rótulo de turnos).
- **CMP-40 · Barra da régua de jutsu.** Selo de rank, nome, custo, alcance, área, distância, quem está na área, o seletor de forma (quando há) e [Usar jutsu] [×].
- **CMP-41 · Trilho de ferramentas.** Botões quadrados de 40 px com ícone, tecla de atalho no tooltip, popover de opções e estado ativo.
- **CMP-42 · Janela de ficha rápida.** Arrastável, com abas, minimizável em chip; vira bottom sheet no celular.
- **CMP-43 · Árvore de pastas.** Pastas aninhadas até 3 níveis, contagem, arrastar e soltar com linha de inserção, renomear na linha e menu de contexto.
- **CMP-44 · Seletor de cor do usuário.** Grade de 9 amostras, a sua marcada, as tomadas com o retrato de quem usa.

---

## 6. Cores e aparência do quadro

**Cores dos usuários.** A cor marca o anel do token, o traço do lápis, a régua e o avatar online, sempre com o nome junto. O tema escuro usa a versão clara de cada uma.

| Cor | Tema claro | Tema escuro | Observação |
|---|---|---|---|
| Vermelhão | `#C44536` | `#E8806F` | Do Mestre |
| Anil | `#3B5BA5` | `#7F9BE0` | |
| Ameixa | `#7B3F8C` | `#B784C6` | |
| Sakura | `#C2577A` | `#E48BA8` | |
| Siena | `#A0522D` | `#D08A62` | |
| Mostarda | `#B08A12` | `#E0BC4A` | |
| Musgo | `#4E7A2E` | `#8DBA6A` | |
| Petróleo | `#1F7A7A` | `#5FBFBF` | |
| Ardósia | `#5E6B73` | `#A3B0B8` | |

Ficaram de fora o azul do PC (`#2D7FB8`) e o ouro do PE e do PD (`#D29A1E`, `#BF9000`), para um traço não parecer barra de recurso. O ouro fica reservado ao sprint e à vez na iniciativa.

**Quadro**

| Elemento | Tema claro (pergaminho) | Tema escuro (sumi) |
|---|---|---|
| Fundo | `base-100` (`#FBF7F0`) | `base-100` (`#16110F`) |
| Linha de 1 m | `base-content` a 7% | `base-content` a 9% |
| Linha de 5 m | `base-content` a 14% | `base-content` a 18% |
| Área atingida | cor do lançador a 18%, hachura a 35% | a mesma, com a cor escura |
| Fora do alcance | vermelhão a 20%, borda vermelhão | `#E8806F` |
| Anel de alcance | linha tracejada de 2 px na cor do lançador | idem |

- O fundo fica liso, sem o ruído de textura: a grade já é a textura.
- **Movimento:** o fantasma e a linha aparecem sem animação. O token desliza 120 ms até o quadrado quando outro usuário o move. O realce de "quem rolou" pulsa uma vez. Com `prefers-reduced-motion`, nada desliza nem pulsa.
- **Acessibilidade:**
  - os tokens entram na ordem do Tab pela lista "Em cena";
  - setas movem, e um aviso para leitores de tela anuncia o resultado ("Hana Nara: 6 m andados, sobram 4 m");
  - os moldes têm hachura além da cor, e o contraste das linhas de 5 m passa de 3:1 contra o fundo.

---

## 7. Dados de exemplo

Mesma campanha do brief (seção 9): **Sombras sobre a Névoa**, Mestre Kaito.

**Cena ativa: "A ponte"** (40 × 30 m). Uma ponte de madeira de 4 m de largura atravessa um rio de leste a oeste. A névoa vem do sul.

| Token | Dono | Tamanho | Posição | Notas |
|---|---|---|---|---|
| Hana Nara | Aiko (anil) | 1 × 1 | F14 | PV 25/25, PC 41/47; Deslocamento 10 m |
| Ren Uchiha | Bruno (ameixa) | 1 × 1 | H15 | PV 38/45; da vez, com 6 m andados no turno |
| Sora Inuzuka | Carla (musgo) | 1 × 1 | E16 | Estado: nenhum |
| Tetsu, cão de Sora | Carla (musgo) | 1 × 1 | E17 | Token ligado a Sora; cão Adulto Jovem, PV 40 |
| Daichi Kasai | Diego (siena) | 1 × 1 | G17 | Sangrando |
| Hideo, ronin | Mestre | 1 × 1 | V14 | NPC rápido, Chunin, PV 45, Defesa 14 |
| Bandidos 1 a 4 | Mestre | 1 × 1 cada | U11, U18, W13, Y16 | Tropa, PV 15 cada; o 2 com 6/15 |
| Ayame Sasaki | Mestre | 1 × 1 | X10 | Escondida (só o Mestre vê) |

**Pastas do Mestre**
- Arco 1 · A ponte
  - Capangas do daimyō: Hideo, Tropa de bandidos (×4)
  - Moradores: Velho barqueiro, Filha do barqueiro
- Reservas: Ayame Sasaki
- Sem pasta: Mercador de Tanzaku

**Régua de jutsu em uso:** Ren mira o **Goukakyu no Jutsu** (Grande Bola de Fogo; rank C, 9 PC; Médio 30 m; esfera de 3 m) no ponto V14, onde está Hideo. A barra mostra "14 m · 3 na área: Hideo, Bandido 1, Bandido 3".

**Chat** (do mais novo para o mais antigo)
1. Ren Uchiha · Goukakyu no Jutsu · Resistência de Acrobacia, DT 14 · alvos: Hideo, Bandido 1, Bandido 3.
2. Hideo · Ataque com katana (oculta) · 1d20 + 7 = 19. O jogador vê "O Mestre rolou em segredo".
3. Hana Nara · Percepção · 1d20 + 3 = 23 ★ (20 natural).
4. Sora Inuzuka · Iniciativa · 1d20 + 4 = 21.
5. Daichi Kasai · Dano de sangramento · 1d4 = 3.

**Traços:** uma seta anil de Aiko, de F14 até a ponta oeste da ponte; um círculo vermelhão de Kaito em volta do ponto onde a ponte está rachada.

**Iniciativa:** Sora 21, Ren 18, Hideo 15, Hana 12, Bandidos 9, Daichi 7. Rodada 3, vez de Ren.

---

## 8. Notas de implementação

Para depois do design. Toda migração precisa do seu OK antes de ir para a produção.

**Dados (Supabase)**

| Tabela ou coluna | Para quê |
|---|---|
| `mesa_cenas` | Cenas da campanha: nome, largura e altura em metros, ativa, travada, mostrar PV, coordenadas, ordem e turno da iniciativa (lista, índice da vez, rodada) |
| `mesa_tokens` | Token na cena: personagem ou NPC (com o número do membro, numa tropa), token de quem está ligado, dono que pode mover, tamanho, x e y em quadrados, visível, estados, metros andados no turno |
| `mesa_tracos` | Traço: autor, cor, espessura, pontos (lista simplificada, em décimos de metro) |
| `mesa_efeitos` | Efeito em cena: jutsu, forma, posição, ângulo, turnos restantes |
| `npc_pastas` | Pastas: campanha, pasta de cima, nome, ordem |
| `npcs.pasta_id`, `personagens.pasta_id` | Pasta do NPC rápido e do NPC de ficha completa |
| `membros.cor` | A cor do usuário na campanha (única por campanha) |
| `rolagens.alvos` | Nomes dos alvos de uma rolagem de jutsu (opcional) |

**Regras de acesso**
- O movimento passa por uma função `mover_token`, que confere se quem chama é o Mestre ou o dono do token e se a mesa não está travada, e que só muda a posição.
- Os jogadores só leem os tokens visíveis.
- Cada um insere os próprios traços; apaga os seus, ou todos, se for o Mestre.
- Como nas outras migrações, revogar o EXECUTE de `anon` nas funções novas.

**Tempo real**
- Mudanças salvas (tokens, traços, efeitos, cena): `postgres_changes`, filtrado pela cena.
- O que não se salva (o fantasma do arrasto, a régua sendo medida, o modo Apontar, o traço sendo desenhado): `broadcast` no canal `mesa:<cena>`, a no máximo 20 mensagens por segundo.
- Quem está online: `presence` no mesmo canal.

**Desenho na tela**
- SVG com `viewBox` para zoom e vista: grade, tokens, moldes, réguas e traços como `path`. Uma cena típica tem bem menos de 500 elementos.
- Pointer Events cobrem mouse, toque e caneta. Nenhuma biblioteca nova.

**Reaproveitamento**
- Do L10: `EntradaRegistro`, `RoladorDados` e `OrdemIniciativa`, que passa a ler o turno da cena.
- Da ficha: o fluxo de USAR jutsu e os botões de rolar.
- Dos NPCs: o modal de NPC e o "usar na campanha" do bestiário.
- O parser de alcance e área (tabelas da 3.6) fica em `src/lib/mesa/`, com teste sobre os 429 jutsus do catálogo.

**Ficha:** o Deslocamento aparece na ficha (P3) e no cartão do bestiário: 10 m, +5 m da Velocidade, ×3 com o 5º Portão aberto.

**Depois da L11 (fundo, ping, enquadramento, cone)**
- Fundo do quadro: `mesa_cenas.fundo_escala` (largura em metros; null = esticado na cena), `fundo_x` e `fundo_y` (posição em metros). A ferramenta MOVER O FUNDO arrasta a imagem sob a grade e grava ao soltar.
- Ping: Alt+clique com qualquer ferramenta, ou clique simples com o Apontar. Vai por `broadcast` (evento `ping`) e some em 2,5 s.
- Enquadramento das artes do bestiário no token: `src/lib/bestiario/foco.json` guarda, por arte, o ponto (x, y em frações), o zoom e as dimensões. `npcs.enquadramento` (`{x, y, zoom}`) é o ajuste do Mestre no editor de NPC. A imagem sempre cobre o círculo do token.
- Jutsus em duas partes: ATAQUE (ou USAR) paga o custo e rola o ataque; DANO (ou CURA) rola o efeito nos alvos da régua. Um 20 natural no ataque deixa o DANO seguinte em crítico.
- Cone: começa na borda do espaço de quem lança, e um quadrado entra quando a maior parte dele (3 de 5 pontos) fica dentro do cone.

**Ferramentas novas (migração 20261106120000)**
- **Objetos da cena** (`mesa_objetos`): alfinete, imagem e texto, com centro em metros, rotação, cor, fonte (Normal, Pixel, Mincho, Máquina), tamanho, ordem, visível e travado. O Mestre põe qualquer um; o grupo põe alfinetes e textos seus e mexe só neles. No quadro: arrastar move, o canto redimensiona, a bolinha gira (Shift: 15° ou 1 m), Delete tira, as setas empurram (Shift: 1 m), Ctrl+Z desfaz o último objeto colocado. Atalhos: A (alfinete), X (texto), O (imagens), F (névoa).
- **Biblioteca de artes** (`mesa_artes`, bucket mesa): PNG, JPG, WebP, GIF e SVG viram webp no navegador (mapa até 2048 px, objeto até 1024 px, no máximo 5 MB) com miniatura de 256 px; até 300 por campanha. O SVG nunca fica no bucket público: é rasterizado no envio. Apagar uma arte tira ela do fundo, da narrativa e dos objetos.
- **Névoa**: `mesa_cenas.nevoa` e `reveladas` (runs [y, x0, x1] de quadrados revelados). O Mestre pinta com pincel de 1 a 15 quadrados; o grupo não vê tokens, objetos nem mapa cobertos. É visual: o arquivo do fundo continua público; segredo de verdade fica em "visível".
- **Efeitos de área por estilo** (`mesa_efeitos.estilo`): os 14 elementos, mais taijutsu, genjutsu, bukijutsu e ninjutsu genérico, cada um com ladrilho próprio e animação (parada com movimento reduzido).
- **Cenas em pastas** (`mesa_cena_pastas`, até 3 níveis) e **nome público** (`nome_publico`): o grupo vê só a cena ativa, com o nome público (ou "Cena").
- **Jukebox** (`mesa_jukebox`): o Mestre cola um link do YouTube (vídeo ou lista) ou do Spotify; cada navegador toca o player oficial e segue o estado gravado (tocar, pausar, posição, item da lista), com a hora do servidor (`agora_servidor()`). Cada pessoa liga e desliga o próprio som.

---

## 9. Pedido para o Claude Design

Cole primeiro o *Contexto fixo* (`instrucoes-claude-design.md`, 10.1) e depois isto:

```text
Lote 11 · Mesa tática (telas M1 a M8 e ajuste em N1).

A Mesa é uma tela da campanha para jogar o combate num quadro quadriculado: 1 quadrado = 1 m,
grade quase apagada com linha mais forte a cada 5 m. O Mestre posiciona personagens e NPCs,
cada jogador move só o próprio token (e clones/invocações dele), todos desenham com um lápis
na própria cor, medem distâncias em metros, medem o alcance e a área de um jutsu, rolam dados
num chat de rolagem e abrem fichas rápidas sem sair da tela. O Mestre organiza NPCs em pastas.

Layout desktop: barra superior (cena, quem está online, rodada); à esquerda o Elenco (280px,
Em cena / Personagens / NPCs em pastas); trilho de ferramentas (48px: Mover, Medir, Lápis,
Apontar, Borracha); o quadro no centro; à direita o painel de Rolagens e Iniciativa (360px).
Fichas rápidas são janelas flutuantes arrastáveis sobre o quadro. No celular: quadro em tela
cheia, dock inferior, fichas e chat em bottom sheets.

Reaproveite os componentes do L10 (entrada do registro de rolagens, rolador, ordem de
iniciativa), o CMP-34 (card de NPC) e os ícones de estado. O quadro é pergaminho liso no tema
claro e sumi no escuro. Cores de usuário: Vermelhão (Mestre), Anil, Ameixa, Sakura, Siena,
Mostarda, Musgo, Petróleo, Ardósia; ouro só para sprint e para o token da vez. Cor nunca é o
único sinal: nome junto do token, hachura nas áreas.

Telas, estados, componentes (CMP-36 a CMP-44), cores e dados de exemplo estão nas seções 3 a 7
do documento planos/mesa-tatica.md, colado abaixo. Use a cena "A ponte" da seção 7 em todos os
frames. Entregue desktop 1440, tablet 834 e mobile 390, com os estados pedidos em cada tela.
```

Depois do bloco, cole as seções 3 a 7 deste arquivo.

---

## 10. Fora desta versão

- Imagem de fundo da cena (mapa desenhado ou foto). O lápis cobre o básico até lá.
- Paredes e terreno difícil desenhados que a régua respeita sozinha. Por enquanto o Mestre aplica o terreno difícil de olho.
- Névoa de guerra e linha de visão calculada.
- Voo e altura. Por enquanto a altura é narrativa.
- Mensagens de texto no chat. Nesta versão, o chat é só o registro de rolagens.
- Animações de jutsu e sons.
- Grade hexagonal.
