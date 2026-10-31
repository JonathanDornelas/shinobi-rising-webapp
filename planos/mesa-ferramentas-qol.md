# Mesa tática: ferramentas de qualidade de vida (pesquisa de campo)

## Contexto

O usuário pediu uma pesquisa de campo, para fechar o dia: o que vale acrescentar à Mesa tática para melhorar as sessões,
para o Mestre e para os jogadores, olhando o que concorrentes como Roll20, Foundry, Owlbear Rodeo e outros oferecem.

Este documento:
- mostra o que a Mesa já tem;
- lista o que os concorrentes oferecem e ainda falta aqui, adaptado ao Shinobi no Michi;
- propõe uma ordem de construção.

Nada é construído antes da escolha do usuário.

## O que a Mesa já tem (não entra nas propostas)

- **Tabuleiro:**
  - grade ajustável ao mapa, vista de cima e isométrica, cenas com pastas, camadas e biblioteca de artes;
  - névoa pintada pelo Mestre, terreno difícil;
  - lápis, borracha, texto, alfinetes e objetos.
- **Medidas:**
  - régua com vários pontos;
  - custo de movimento com terreno difícil;
  - aviso de "provoca reação" ao arrastar para fora do alcance de um inimigo;
  - moldes de jutsu com régua e alvos.
- **Combate:**
  - iniciativa com a vez marcada no token, "VEZ" no elenco e aviso "Sua vez";
  - efeitos em cena com turnos e o elemento animado (PixelLab);
  - ficha rápida, crítico e vantagem;
  - clones, crescer, nome oculto e PV visível ao grupo.
- **Comunicação:**
  - ping com Alt+clique;
  - fantasma do arrasto, régua e mira dos outros ao vivo;
  - presença de quem está online;
  - música do Mestre (jukebox);
  - rolagens em 3D em fila.

## O que os concorrentes têm que falta aqui

| # | Ferramenta | Para | De onde vem a ideia | Tamanho |
| - | - | - | - | - |
| 1 | **"Olhem aqui"**: o Mestre puxa a vista de todos para um ponto ou um token | Mestre | Shift+ping do Roll20; módulo Pointer do Foundry | Pequeno |
| 2 | **Relógios da cena**: contagem visível a todos ("a ponte cai em 3 rodadas"), que desce sozinha a cada rodada | Mestre | Relógios do Blades in the Dark, comuns no Foundry e no Roll20 | Pequeno |
| 3 | **Reação da rodada**: cada token mostra se já gastou a Reação (Esquiva Ativa, Kawarimi, golpe de oportunidade); zera na rodada nova e é marcada sozinha quando usada pela ficha | Ambos | Controle de reação do D&D 5e no Foundry; aqui pesa mais, porque a Reação é uma só e disputada | Pequeno |
| 4 | **Ferramentas de segurança**: carta X anônima (o grupo vê que alguém tocou, sem saber quem) e "Linhas e Véus" da campanha | Jogadores | Complemento oficial do Roll20; módulos Safety Tools e X-Card do Foundry | Pequeno |
| 5 | **Atalhos visíveis**: tecla "?" mostra os atalhos da Mesa; barra de ações rápidas do personagem selecionado | Ambos | Token Action HUD do Foundry | Pequeno |
| 6 | **Pedir teste**: o Mestre escolhe a perícia e a DT (visível ou oculta) e quem rola; aparece um botão na tela de cada jogador, e os resultados chegam juntos para o Mestre | Mestre e jogadores | Pedidos de rolagem em grupo do Foundry e do Roll20 | Médio |
| 7 | **Alvo, acerto e dano aplicado**: o jogador marca o alvo; o ataque mostra ACERTOU ou ERROU contra a Defesa (empate erra); o dano ganha "Aplicar no alvo" (metade com Resistência, crítico já contado) | Ambos | Midi QoL do Foundry, o módulo mais recomendado para automação de combate | Grande |
| 8 | **Estados com duração**: ao pôr Atordoado, Em chamas etc., escolher por quantas rodadas; o ícone mostra o número e o estado some sozinho | Ambos | Módulos de duração de efeitos do Foundry | Médio |
| 9 | **Clima e ambiente da cena**: chuva, neve, névoa, folhas, pétalas, cinzas sobre a cena inteira, ligados pelo Mestre | Mestre | FXMaster do Foundry; sobreposições animadas do Alchemy. As peças existem de graça na vfx_workbench (rain_streaks, snowfall, leaf_fall, frost_mist, ember_rise) | Médio |
| 10 | **Mostrar imagem a todos**: uma arte, carta ou pergaminho abre na tela de todos, com zoom; o Mestre fecha para todos | Mestre | "Show to Players" do Foundry; handouts do Roll20 | Pequeno a médio |
| 11 | **Efeitos sonoros pontuais**: trovão, explosão, sino, kunai, tocados para todos por cima da música | Mestre | Jukebox do Roll20; soundboards do Foundry (precisa de sons livres de direitos) | Pequeno a médio |
| 12 | **Diário do grupo**: missões, NPCs conhecidos e pistas, editável por todos, com notas privadas, dentro da Mesa | Jogadores | Diário do Quest Portal; Note+ do Fantasy Grounds | Médio |
| 13 | **Visão automática**: a névoa se abre sozinha num raio em volta dos tokens dos jogadores, com paredes e portas numa segunda etapa | Ambos | Dynamic Lighting do Roll20; Dynamic Fog e Smoke & Spectre do Owlbear Rodeo | Grande |

## Ordem sugerida

1. **Rápidas, de ganho imediato na sessão:** Olhem aqui (1), Reação da rodada (3), Relógios da cena (2) e Atalhos
   visíveis (5). Cada uma é um dia de trabalho ou menos e mexe no que já existe:
   - broadcast e ping em `src/lib/mesa/mesa.svelte.ts`;
   - iniciativa e `proximoTurno`;
   - os anéis de token em `src/lib/componentes/mesa/QuadroMesa.svelte`.
2. **O que mais acelera o combate:** Pedir teste (6), depois Alvo, acerto e dano aplicado (7) e Estados com duração (8).
   Reaproveitam:
   - a fila de rolagens e o crítico manual (`src/lib/rolagens/rolador.svelte.ts`);
   - `usarJutsu` e `rolarDano` na página da Mesa;
   - a regra nova do empate.
3. **Clima (9)**, com as peças grátis da vfx_workbench, pelo mesmo caminho dos efeitos de jutsu
   (`pixellab/scripts/vfx-lote.cjs`, `vfx-montar.cjs`). **Mostrar imagem a todos (10)** usa a biblioteca de artes.
4. **Depois:** sons (11), diário (12) e segurança (4), se o grupo quiser.
5. **Longo prazo:** visão automática (13). É o recurso mais pesado dos concorrentes, e a névoa manual já cobre o básico.

## Escolha do usuário e como fazer

O usuário escolheu as quatro rápidas, o clima e o pacote imagem, sons e diário. Ficaram fora, por ora: pedir teste e
acerto/dano no alvo. Ordem de execução:

1. **Olhem aqui** (sem banco):
   - Shift+Alt+clique, ou o botão na barra do quadro, para o Mestre manda um broadcast `olhar` `{x, y}`;
   - quem recebe anima a vista até o ponto, reaproveitando a conta de `centralizar` em `QuadroMesa.svelte`;
   - o ping aparece no lugar;
   - também vale a partir de um token do elenco ("Mostrar a todos").
2. **Reação da rodada** (sem banco):
   - a lista de tokens que já reagiram fica em `iniciativa.reacoes` (jsonb da cena);
   - uma marca no token e no elenco;
   - clicar alterna (Mestre ou o dono do token);
   - a Esquiva Ativa da ficha rápida marca sozinha;
   - `proximoTurno` limpa a lista na rodada nova.
3. **Relógios da cena**:
   - coluna nova `mesa_cenas.relogios jsonb` (migração): nome, segmentos, marcados, se desce sozinho na rodada;
   - fica no topo do quadro, para todos;
   - o Mestre cria, marca e apaga;
   - `proximoTurno` desce os que contam rodadas.
4. **Atalhos visíveis**:
   - tecla `?` e um botão abrem um quadro com os atalhos da Mesa, tirados do mesmo lugar do tratador de teclas em
     `+page.svelte`, para não ficarem desatualizados;
   - uma barra compacta com os botões da ficha rápida (ataque, jutsus, medir) do token selecionado que é seu.
5. **Clima da cena**:
   - efeitos de cena inteira na vfx_workbench (chuva, neve, névoa, folhas, pétalas de cerejeira, cinzas), montados como
     ladrilhos animados pelos scripts `vfx-lote` e `vfx-montar`;
   - coluna `mesa_cenas.clima text` (migração), escolhida pelo Mestre na aba CENA;
   - camada por cima do mapa e debaixo da interface, parada com movimento reduzido.
6. **Mostrar imagem a todos**:
   - o Mestre escolhe uma arte da biblioteca ou um objeto de imagem;
   - broadcast `mostrar` `{url, titulo}` abre uma janela com zoom para todos; o Mestre fecha para todos;
   - quem entra depois não recebe (sem banco).
7. **Efeitos sonoros pontuais**:
   - uma prancheta de 8 a 12 sons para o Mestre (trovão, explosão, kunai, sino, fumaça), tocados para todos por broadcast,
     no volume da música;
   - **pede escolher sons livres de direitos (CC0), confirmado com o usuário antes de baixar**.
8. **Diário do grupo**:
   - tabela nova `mesa_diario` (migração, com RLS: o grupo lê e escreve as públicas, cada um as suas privadas);
   - painel na Mesa com abas Missões, NPCs e Pistas, em tempo real.

**Banco:** os itens 3, 5 e 8 pedem migração, e o usuário precisa mandar um token novo do Supabase (o `sbp_fc02…` deve ser
revogado). Dá para fazer os itens 1, 2, 4, 6 e 7 antes, sem banco.

## Verificação (para cada item escolhido)

- Testes vitest das regras puras (relógio que desce na rodada, Reação que zera, acerto com empate que erra, metade do
  dano com Resistência).
- `npx svelte-check` sem erros e build.
- Navegador numa página de teste com a Mesa simulada (como a /dev-fx desta sessão), nas duas vistas e no celular.
- Commit e deploy pela rotina de sempre, com o pré-requisito de banco (migração) avisado antes, quando houver.

## Fontes

- Roll20: [Ping e puxar a vista](https://wiki.roll20.net/Ping), [Turn Tracker](https://wiki.roll20.net/Init),
  [Dynamic Lighting](https://pages.roll20.net/dynamic-lighting), [Safety Tools](https://marketplace.roll20.net/browse/gameaddon/10589/rpg-safety-tools),
  [Handouts](https://wiki.roll20.net/Handout)
- Foundry: [Notas da versão 13 (régua com pontos, marcador de turno)](https://foundryvtt.com/releases/13.335),
  [Pointer](https://foundryvtt.com/packages/pointer), [FXMaster](https://foundryvtt-hub.com/package/fxmaster),
  [Monk's Common Display](https://foundryvtt.com/packages/monks-common-display), [Quick Scenes](https://foundryvtt.com/packages/quick-scenes),
  [Safety Tools](https://foundryvtt.com/packages/safety-tools), [UI QoL Options](https://foundryvtt.com/packages/ui-qol-options)
- Owlbear Rodeo: [Dynamic Fog](https://blog.owlbear.rodeo/owlbear-rodeo-2-3-release-week-day-3/),
  [Extensões (dados e iniciativa)](https://blog.owlbear.rodeo/owlbear-rodeo-2-0-beta-patch-9/)
- Alchemy: [Guia do jogador](https://startplaying.games/blog/virtual-table-tops/the-new-players-guide-to-alchemy-rpg)
- Diários: [Shard Tabletop](https://shardtabletop.com/blog/campaign-journal), [Fantasy Grounds Note+](https://www.fantasygrounds.com/forums/archive/index.php/t-87714.html?pda=1)
