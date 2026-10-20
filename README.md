# Rising Shinobi

Documentação web e criador de campanhas do RPG de mesa **Shinobi no Michi — O Caminho do Ninja** (Livro de Regras v18.0).

Stack: SvelteKit 3 (Svelte 5) + Tailwind CSS 4 + DaisyUI 5 + Supabase, publicado no Vercel (`adapter-vercel`): a documentação é pré-renderizada; conta e campanhas rodam no servidor. As telas são desenhadas antes no Claude Design (direção visual 1a "Jogo", temas sumi e washi).

**Fase atual:** regras com cara de compêndio (estilo D&D Beyond): o livro saiu do .docx para `conteudo/` (Markdown e YAML), com termos destacados e cartão no hover, dados clicáveis, tabelas e aberturas de capítulo novas; aplicado ao livro todo, com o compêndio de termos no glossário e as artes de abertura dos 23 capítulos. Feitos antes: fotos dos NPCs e avatar do perfil, vantagem na rolagem livre, registro de rolagens L10, filtros, visualizações e favoritos de jutsus, fonte dos números, a ficha no celular, rolagens ao vivo, retrato do ninja, temas do usuário, paisagens das vilas, jutsus originais na criação de personagem e de clã, exclusão de fichas, aprovações, submissões, NPCs, pré-gerados e concessões do Mestre (R1–R3, N1, N2), equipamentos (E1–E4), jutsus (J1–J3), documentação do livro (G1–G5, D1–D10), conta (A1–A4), campanhas (C1–C7), criação de personagem (P2), ficha em jogo, nível, treino e recompensas (P1, P3–P6, C8) e clãs (K1, K2). Todas as telas do brief estão implementadas; o que vem depois está em `todo.md`.

## Criação de personagem

`src/lib/personagem/regras.ts` é o motor do cap. 6: a partir das escolhas (`FichaDados`) calcula atributos, perícias, PT, recursos, carga e ryo, e gera as verificações da revisão (ok, aviso, bloqueio). Os números do livro que ele usa ficam em `dados.ts` (vilas do cap. 7, bônus de criação e marco do nível 1 dos 13 clãs, backgrounds, efeitos das especializações, custos de proficiência); jutsus, clãs, especializações e itens da loja vêm dos dados gerados do livro, montados no servidor por `catalogo.server.ts`. O motor é testado com os exemplos do próprio livro (`regras.spec.ts`).

A ficha fica na tabela `personagens` (escolhas em `dados`, valores para listas em `resumo`). O status só muda pelas funções `enviar_ficha`, `retirar_ficha` e `decidir_ficha`; uma campanha que não exige aprovação de fichas aprova no envio. No passo 9, a ficha pode escolher jutsus originais de Rank E ou D feitos para ela no criador de jutsus; eles vão para a revisão junto com a ficha.

O retrato do ninja é uma foto enquadrada no navegador (256×256, webp) no bucket `retratos` do Storage, em `<id da ficha>/<arquivo>.webp`; só o dono envia, e a ficha guarda o caminho em `retrato` (`definir_retrato`). O mesmo componente (`EnviarRetrato.svelte`) envia a foto do NPC rápido, que só o Mestre da campanha envia (`<id do NPC>/…`, em `npcs.retrato`), e o avatar da conta (`<id da conta>/…`, em `perfis.avatar`); as políticas do bucket passam por `dono_da_pasta_retrato` e `pode_apagar_retrato`, e quem exclui o NPC, a campanha ou a conta apaga as fotos pelo Storage antes. O dono exclui a própria ficha em qualquer status e o Mestre exclui qualquer ficha da campanha (`excluir_ficha`, o jogador é avisado).

## Ficha, nível e treino

Clãs criados (cap. 8.4) ficam na tabela `clas`, com as escolhas em `dados` e o mesmo fluxo de revisão (`enviar_cla`, `retirar_cla`, `decidir_cla`; clã aprovado só muda por `nova_versao_cla`). `src/lib/clas/regras.ts` calcula o orçamento de PB, a balança de PKG (5 + limitações = benefícios), as 20 linhas do Esqueleto Padrão e as verificações; `regrasParaFicha` copia para a ficha o que ela usa (bônus, jutsus do nível 1, elementos, PIC), e `regrasCla` em `personagem/regras.ts` trata igual os clãs do catálogo e os criados. A ficha aponta para o clã em `cla_id`: só envia com o clã enviado e só é aprovada com o clã aprovado. Uma carta de jutsu original do clã pode ser detalhada no criador de jutsus, que passa a dar os números dela na ficha.

Jutsus e habilidades criados (cap. 20) ficam em `jutsus_criados`, com o mesmo fluxo de revisão (`enviar_jutsu`, `retirar_jutsu`, `decidir_jutsu`, `nova_versao_jutsu`). `src/lib/jutsus/regras.ts` soma os PJ dos componentes pela tabela do livro, define rank, custo (PC, PE no Taijutsu e Bukijutsu, os dois no Kugutsu) e PT para aprender, preenche os seis atributos da linha de info e faz as verificações (rank acima do nível da ficha bloqueia o envio); é testado com os cinco exemplos do cap. 20.5. Um jutsu pode ser feito para uma ficha (aprovado, aparece no treino pelo custo em PT do rank) ou para a carta de um clã criado.

Armas forjadas, marionetes e itens criados ficam em `equipamentos_criados` (`enviar_equipamento`, `retirar_equipamento`, `decidir_equipamento`, `nova_versao_equipamento`); a campanha decide se cada tipo exige aprovação. `src/lib/equipamentos/regras.ts` soma os PFo de qualidade e propriedades contra o limite do forjador (cap. 21, com a qualidade do cap. 12), os slots e números da marionete (cap. 13) e valida o item (cap. 11). Arma ou marionete encomendada para uma ficha: na aprovação, o custo sai do ryo dela e o objeto fica pendente de entrega; a ficha o põe no inventário (`receber_equipamentos`) ao abrir. Itens aprovados entram na loja da ficha.

A fila de aprovações (`src/lib/aprovacoes/fila.server.ts`) junta fichas, clãs, jutsus, habilidades, equipamentos e pedidos de PT, com as verificações calculadas no servidor pelos mesmos motores das telas de criação. Aprovar algo com bloqueio exige uma justificativa (`registrar_excecao`), que aparece como “Exceção do Mestre”. NPCs (cap. 23.2) ficam em `npcs`, só para o Mestre (com gerador rápido em `src/lib/npcs/gerador.ts`); um NPC também pode ter ficha completa, uma ficha do Mestre com `npc`, fora do grupo; o grupo vê os revelados por `npcs_revelados` (com a foto), sem segredo nem números. Pré-gerados são fichas do Mestre com `pre_gerado`, que um jogador sem ficha ativa assume (`assumir_pre_gerado`). O Mestre concede jutsus (`conceder_jutsu`, entra nos treinos da ficha) e itens (`conceder_item`, ficam em `personagens.entregas` até a ficha abrir), de graça ou cobrando PT/ryo.

Depois da aprovação, a progressão fica em `dados.progresso` (as escolhas de cada nível e os treinos) e o nível atual é `1 + progresso.niveis.length`. `src/lib/personagem/progressao.ts` cuida de XP e níveis (cap. 17), lê os marcos de clã (cap. 8.3), monta os passos dinâmicos do Subir de nível, calcula o custo real dos jutsus com as reduções do cap. 9, lista o que dá para treinar com PT (cap. 18) e guarda as regras de descanso, PV 0 e PIC.

No banco, o estado em jogo (PV/PC/PE atuais, fadiga, condições, saves de morte, PD e PIC), o inventário, o ryo e o saldo de PT só mudam pelas funções `atualizar_estado`, `atualizar_inventario`, `subir_nivel`, `treinar`, `solicitar_pt`/`decidir_pedido_pt`, `conceder_recompensa` e `definir_situacao`; cada uma deixa uma linha no registro da ficha. A ficha completa é só do dono e do Mestre; o grupo vê o resumo público por `personagens_do_grupo()`. Quando a campanha começa acima do nível 1, a ficha aprovada recebe o XP do nível inicial e sobe pelo próprio P4.

## Rolagens, temas e capas

As rolagens são sorteadas no servidor: `rolar(campanha, expressao, rotulo, personagem, modo, oculta, npc, tipo, origem, partes)` aceita expressões como `1d20+5`, `2d6+1d4-1` ou `4d6kh3` (manter os maiores/menores), aplica vantagem e desvantagem (cap. 2: o d20 duas vezes, fica o maior ou o menor; na rolagem livre, escolhida no próprio rolador quando a expressão tem 1d20) e o crítico (cap. 4: os dados de dano dobram), e grava em `rolagens` com o tipo (teste, ataque, dano, cura, iniciativa, save, livre), a origem e as parcelas do modificador, para o registro mostrar a conta. As ocultas só o autor e o Mestre veem (RLS); quem não é Mestre vê só um aviso de que o Mestre rolou em segredo (`rolagens_ocultas_do_mestre`). O Ponto de Destino (cap. 2) é gasto no registro: re-rolar ou +5 (`usar_pd`, até 30 min depois, só em rolagens da ficha). A tabela está no Supabase Realtime: o registro e o aviso no canto da tela recebem as rolagens de todas as campanhas da pessoa na hora, em qualquer página. O registro (L10, Claude Design) fica em `/campanhas/[id]/rolagens`, com o menu lateral da campanha (a mesma tela em `/rolagens` serve quem está fora de uma campanha): R1, com filtros de período, campanha, tipo e quem, separador por dia, rolador de dados e a ordem de iniciativa, que dá para limpar no fim do combate (vale para o navegador) e a janela flutuante (R2), que abre pelo botão do canto ou pela tecla R, arrasta e redimensiona no desktop e vira painel inferior no celular (`src/lib/componentes/rolagens/`). O Mestre rola pelos NPCs (`rolar(..., npc)`), e USAR um jutsu debita o custo e já rola ataque e dano. `src/lib/rolagens/expressoes.ts` monta as expressões da ficha (atributos, perícias, iniciativa, save de morte, ataque e dano dos jutsus lidos do texto do livro, ataque e dano das armas). Os dados (d4, d6, d8, d10, d12, d20, d100) e as animações deles são do PixelLab (`static/dados/`, spritesheets de 9 quadros). O sorteio fica no banco de propósito (avaliamos a `rpg-dice-roller`, mas ela sortearia no navegador).

As fontes (Noto Sans, Pixelify Sans e Shippori Mincho B1) são servidas pelo próprio site, em `static/fonts/google`, só com o alfabeto latino, um recorte das letras com mácron e os caracteres japoneses usados; `node scripts/fontes/baixar.ts` as regenera e escreve `src/routes/fontes.css`. Antes vinham do Google Fonts, cujo CSS da fonte japonesa pesava ~150 KB e bloqueava a página. O `vercel.json` dá cache de 7 a 30 dias às fontes, ícones e artes de `static/`, e as funções rodam em Cleveland (cle1), perto do banco (us-east-2). A fonte de pixel do app é o Pixelify Sans, mas os dígitos e sinais das contas vêm do Stairs n Slabs, de Jason Suydam (`@font-face` "Digitos Shinobi" com `unicode-range`, arquivo em `static/fonts/`), porque os números do Pixelify se confundem em tamanho pequeno. O tema do usuário (perfil → Aparência) guarda acento, destaque, fundo, texto, escala e raio em `perfis.preferencias.visual` e vira variáveis CSS no `<html>` (`src/lib/estado/visual.ts`); o `app.html` aplica antes da primeira pintura. A ficha mostra no topo a paisagem da vila do personagem, e o dono pode trocar (`definir_capa_ficha`); a aba Anotações é o caderno do dono, que o Mestre lê (`salvar_anotacoes`). As capas das campanhas são as paisagens das vilas (`static/covers/capa-<vila>-256.png`, geradas no PixelLab), e a Floresta é a dos Renegados.

## Rodando

```sh
npm install
npm run dev          # desenvolvimento em http://localhost:5173
npm run build        # gera o site estático em build/ (valida links e âncoras internas)
npm run preview      # serve o build
npm run check        # svelte-check
npm test             # testes (vitest), incluindo RLS e funções do banco em PGlite
npm run livro:gerar  # compila conteudo/ (rode depois de editar as regras)
```

## Supabase

1. Copie `.env.example` para `.env` e preencha `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API). No Vercel, cadastre as mesmas duas variáveis.
2. Rode `supabase/migrations/*.sql` no SQL Editor do projeto (ou `npx supabase db push` com o CLI ligado ao projeto).
3. Em Authentication → URL Configuration, use a URL do site em **Site URL** e adicione `https://SEU-DOMINIO/auth/callback` e `http://localhost:5173/auth/callback` em **Redirect URLs**.

Login só por e-mail e senha. Confirmação de conta e recuperação de senha voltam por `/auth/callback`. O app não envia e-mails próprios: convites por e-mail aparecem no sino de quem já tem conta; para os outros, o Mestre manda o link ou o código. O SMTP padrão do Supabase tem limite baixo de envios por hora; para uso real, configure um SMTP próprio em Authentication → Emails.

Os testes em `supabase/testes/` rodam a migração num Postgres em memória (PGlite) com um esquema `auth` simulado e conferem as políticas de RLS e as funções (convites, Mestre, exclusão de conta).

## Como o livro vira site

As regras moram em `conteudo/`, em Markdown e YAML, e são editadas ali (o `.docx` v18 foi exportado uma vez e ficou em `legado/`, só como histórico):

| Arquivo | Conteúdo |
|---|---|
| `conteudo/regras/NN-slug.md` | um capítulo por arquivo (frontmatter com número, slug, título e parte) |
| `conteudo/clas/NN-slug.md` | os 13 clãs do cap. 8.3 (frontmatter com número, nome, epíteto e origem; seções em `####`) |
| `conteudo/jutsus.yaml`, `conteudo/habilidades.yaml` | os cards (descrição, efeito e notas em Markdown de uma linha) |
| `conteudo/termos.yaml` | o léxico curado: recursos, atributos e termos de regra que viram destaque no texto |
| `conteudo/livro.yaml` | as partes do livro |

`npm run livro:gerar` roda `scripts/livro/compilar.ts`, que gera `src/lib/livro/gerado/*.json` (versionados, para os diffs mostrarem o que mudou). Um teste confere que os JSON estão em dia com `conteudo/`. A sintaxe (em `scripts/livro/md.ts`) é Markdown com tabelas GFM e diretivas:

| No Markdown | Vira |
|---|---|
| `## Título {#id}` | seção com âncora fixa |
| `:::dica{titulo="…"}` … `:::` (também `destaque`, `exemplo`, `atencao`, `requisito`) | caixa de destaque |
| `:::epigrafe{autor="…"}` | epígrafe |
| `:::cena` … `:::` | cena narrada em itálico, que abre um capítulo ou uma regra |
| `:::na-mesa{titulo="…" ref="…"}` com itens `- **Rótulo:** valor` | quadro "Na mesa" com os números da regra (parágrafos soltos viram notas; `ref` alimenta a referência rápida) |
| `::formula[1d20 + Perícia ≥ DT]` | bloco de fórmula |
| `:::tabela{titulo="…"}` em volta de uma tabela | tabela com título (sem ele, o título vem da seção) |
| `::jutsu{slug="…"}`, `::habilidade{slug="…"}`, `::clas` | cards do catálogo |
| `**Termo.** texto` | verbete de regra |
| "cap. 6", "Capítulo 18", "cap. 8.4" | referência cruzada com prévia |
| termos do léxico (PC, Atordoado, Esquiva Ativa, Rasengan, Kunai…) | destaque colorido com cartão no hover e link para a regra (recursos e atributos sempre; os demais na 1ª vez de cada seção) |
| `1d20`, `2d6+3` | dado: hover mostra a faixa; clique abre a janela de rolagens com a expressão (um "d20" solto só vira dado em tabelas e quadros; na prosa é o nome do dado) |
| `:t[texto]{#jutsu:slug}` / `:sem[texto]` | força / impede um termo |

O léxico (`gerado/termos.json`) junta `conteudo/termos.yaml` com o que vem do próprio livro: condições (tabela Estados Especiais, com âncora `#cond-…` por linha), perícias (`#pericia-…`), jutsus, habilidades, clãs, armas, elementos e ranks. O compilador também extrai as 16 especializações (cap. 19), armas e Sete Espadas (cap. 12), o glossário (cap. 22), os cards da referência rápida e o índice de busca. As artes de abertura dos capítulos ficam em `static/capitulos/cap-NN.png` (PixelLab, ninjas originais no visual do anime; cenas em `pixellab/capitulos.json`) e aparecem no cabeçalho de cada capítulo e na galeria do índice `/regras`. O glossário (D8) termina com o compêndio de todos os termos do léxico, filtrável por tipo. Os avisos no fim da execução apontam o que não foi reconhecido.

O texto das regras foi reescrito para ler como livro, sem mudar regra nenhuma: prosa em 2ª pessoa, uma cena curta abrindo cada capítulo e as regras marcantes, e os números no quadro "Na mesa" (os de Ações por Turno, Saves de Morte e DT do Jutsu alimentam a referência rápida, pela `ref`). O compilador acha as seções pela âncora, não pelo texto do título, então dá para mudar um título sem quebrar a referência, os equipamentos ou o léxico. A voz e os achados ficam em `voz-do-livro.md`. Depois de reescrever um capítulo, `node scripts/livro/conferir.ts 03 04` compara números, dados e siglas com a versão do git e lista o que sumiu ou apareceu, para conferir se a regra ficou a mesma. As cartas de `conteudo/jutsus.yaml` e `conteudo/habilidades.yaml` têm o próprio conferidor, `node scripts/livro/conferir-catalogo.ts`: o app lê o efeito para montar as rolagens da ficha e os filtros do catálogo, e o script garante que o dano, a cura, a classificação "O que faz" e os números de cada carta continuam iguais. Os planos do livro de jutsus completo e do bestiário estão em `planos/`.

## Onde está cada coisa

| Caminho | Conteúdo |
|---|---|
| `src/routes/` | Telas: `/` (G5), `/regras` (D1), `/regras/[capitulo]` (D2), `clas` (D3), `jutsus` (D4/D5), `equipamentos` (D6), `especializacoes` (D7), `glossario` (D8), `referencia-rapida` (D10), `/busca` (D9) |
| `src/routes/(app)/` | Conta: `/entrar` (A1), `/criar-conta` (A2), `/recuperar-senha` e `/redefinir-senha` (A3), `/perfil` (A4), `/notificacoes` (G3), `/rolagens` (L10 R1, também em `/campanhas/[id]/rolagens`). Campanhas: `/campanhas` (C1), `/campanhas/nova` (C2), `/campanhas/[id]` (C3/C4), `membros` (C5), `configuracoes` (C7), `/convite/[chave]` (C6). Personagens: `/campanhas/[id]/personagens` (P1), `[pid]` (P3 ficha), `[pid]/editar` (P2 criador e revisão do Mestre), `[pid]/nivel` (P4), `[pid]/imprimir` (P6) |
| `src/lib/personagem/` | Motor e tabelas da criação de personagem, catálogo do servidor e estado do criador |
| `src/lib/supabase/`, `src/hooks.server.ts` | Clientes do Supabase (navegador e servidor), tipos do banco e a guarda das áreas logadas |
| `src/lib/campanhas/`, `src/lib/conta/` | Regras de campanha (eras, vilas, clãs, aprovação, tabela de XP), convites e validações de conta |
| `supabase/` | Migrações SQL e testes do banco |
| `src/lib/rolagens/` | Expressões de dados da ficha e o rolador (rolar, aviso, tempo real) |
| `src/lib/componentes/` | `shell` (navbar, dock, rodapé, notificações), `leitura` (blocos, tabelas, destaques, sumário), `regras` (CMP-01 a 17), `busca` (G2), `conta`, `campanha` (menu, card, formulários, convites), `ui` |
| `src/lib/livro/` | tipos, cores de domínio, utilitários de texto, os dados gerados e a classificação dos jutsus para os filtros (`filtros-jutsu.ts`) |
| `src/lib/estado/` | sessão, tema e preferências, paleta de busca, toasts e jutsus favoritos (no perfil em `preferencias.favoritos.jutsus`, ou no navegador sem conta) |
| `src/routes/layout.css` | tokens dos temas sumi/washi, tema DaisyUI e classes da direção 1a |
| `instrucoes-claude-design.md` | Especificação de todas as telas, identidade visual, componentes, fluxos e estados |
| `conteudo/` | Livro de regras em Markdown e YAML (fonte de todo o conteúdo) |
| `legado/shinobi_no_michi_v18.docx`, `scripts/livro/legado/` | O livro v18 em Word e o conversor antigo (histórico) |
| `static/icons/`, `static/illustrations/`, `static/covers/`, `static/dados/` | Ícones, paisagens das vilas e dados PixelLab servidos pelo site |
| `pixellab/` | Inventário, prompts e pipeline de geração dos ícones; pacote para o Claude Design |

## Para o Claude Design

1. Leia `instrucoes-claude-design.md` (seção 10 tem o contexto fixo e a ordem dos lotes de telas).
2. Use os ícones de `pixellab/export-claude-design/` pelo ID mostrado nas pranchas; regras de uso no `LEIA-ME.md` dessa pasta.
