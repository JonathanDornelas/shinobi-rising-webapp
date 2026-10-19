# Rising Shinobi

Documentação web e criador de campanhas do RPG de mesa **Shinobi no Michi — O Caminho do Ninja** (Livro de Regras v18.0).

Stack: SvelteKit 3 (Svelte 5) + Tailwind CSS 4 + DaisyUI 5 + Supabase, publicado no Vercel (`adapter-vercel`): a documentação é pré-renderizada; conta e campanhas rodam no servidor. As telas são desenhadas antes no Claude Design (direção visual 1a "Jogo", temas sumi e washi).

**Fase atual:** itens do `todo.md`: rolagens da campanha ao vivo, retrato do ninja, temas do usuário, paisagens das vilas, jutsus originais na criação de personagem e de clã, e exclusão de fichas. Feitos antes: aprovações, submissões, NPCs, pré-gerados e concessões do Mestre (R1–R3, N1, N2), equipamentos (E1–E4), jutsus (J1–J3), documentação do livro (G1–G5, D1–D10), conta (A1–A4), campanhas (C1–C7), criação de personagem (P2), ficha em jogo, nível, treino e recompensas (P1, P3–P6, C8) e clãs (K1, K2). Todas as telas do brief estão implementadas; o que vem depois está em `todo.md`.

## Criação de personagem

`src/lib/personagem/regras.ts` é o motor do cap. 6: a partir das escolhas (`FichaDados`) calcula atributos, perícias, PT, recursos, carga e ryo, e gera as verificações da revisão (ok, aviso, bloqueio). Os números do livro que ele usa ficam em `dados.ts` (vilas do cap. 7, bônus de criação e marco do nível 1 dos 13 clãs, backgrounds, efeitos das especializações, custos de proficiência); jutsus, clãs, especializações e itens da loja vêm dos dados gerados do livro, montados no servidor por `catalogo.server.ts`. O motor é testado com os exemplos do próprio livro (`regras.spec.ts`).

A ficha fica na tabela `personagens` (escolhas em `dados`, valores para listas em `resumo`). O status só muda pelas funções `enviar_ficha`, `retirar_ficha` e `decidir_ficha`; uma campanha que não exige aprovação de fichas aprova no envio. No passo 9, a ficha pode escolher jutsus originais de Rank E ou D feitos para ela no criador de jutsus; eles vão para a revisão junto com a ficha.

O retrato do ninja é uma foto enquadrada no navegador (256×256, webp) no bucket `retratos` do Storage, em `<id da ficha>/<arquivo>.webp`; só o dono envia, e a ficha guarda o caminho em `retrato` (`definir_retrato`). O dono exclui a própria ficha em qualquer status e o Mestre exclui qualquer ficha da campanha (`excluir_ficha`, o jogador é avisado).

## Ficha, nível e treino

Clãs criados (cap. 8.4) ficam na tabela `clas`, com as escolhas em `dados` e o mesmo fluxo de revisão (`enviar_cla`, `retirar_cla`, `decidir_cla`; clã aprovado só muda por `nova_versao_cla`). `src/lib/clas/regras.ts` calcula o orçamento de PB, a balança de PKG (5 + limitações = benefícios), as 20 linhas do Esqueleto Padrão e as verificações; `regrasParaFicha` copia para a ficha o que ela usa (bônus, jutsus do nível 1, elementos, PIC), e `regrasCla` em `personagem/regras.ts` trata igual os clãs do catálogo e os criados. A ficha aponta para o clã em `cla_id`: só envia com o clã enviado e só é aprovada com o clã aprovado. Uma carta de jutsu original do clã pode ser detalhada no criador de jutsus, que passa a dar os números dela na ficha.

Jutsus e habilidades criados (cap. 20) ficam em `jutsus_criados`, com o mesmo fluxo de revisão (`enviar_jutsu`, `retirar_jutsu`, `decidir_jutsu`, `nova_versao_jutsu`). `src/lib/jutsus/regras.ts` soma os PJ dos componentes pela tabela do livro, define rank, custo (PC, PE no Taijutsu e Bukijutsu, os dois no Kugutsu) e PT para aprender, preenche os seis atributos da linha de info e faz as verificações (rank acima do nível da ficha bloqueia o envio); é testado com os cinco exemplos do cap. 20.5. Um jutsu pode ser feito para uma ficha (aprovado, aparece no treino pelo custo em PT do rank) ou para a carta de um clã criado.

Armas forjadas, marionetes e itens criados ficam em `equipamentos_criados` (`enviar_equipamento`, `retirar_equipamento`, `decidir_equipamento`, `nova_versao_equipamento`); a campanha decide se cada tipo exige aprovação. `src/lib/equipamentos/regras.ts` soma os PFo de qualidade e propriedades contra o limite do forjador (cap. 21, com a qualidade do cap. 12), os slots e números da marionete (cap. 13) e valida o item (cap. 11). Arma ou marionete encomendada para uma ficha: na aprovação, o custo sai do ryo dela e o objeto fica pendente de entrega; a ficha o põe no inventário (`receber_equipamentos`) ao abrir. Itens aprovados entram na loja da ficha.

A fila de aprovações (`src/lib/aprovacoes/fila.server.ts`) junta fichas, clãs, jutsus, habilidades, equipamentos e pedidos de PT, com as verificações calculadas no servidor pelos mesmos motores das telas de criação. Aprovar algo com bloqueio exige uma justificativa (`registrar_excecao`), que aparece como “Exceção do Mestre”. NPCs (cap. 23.2) ficam em `npcs`, só para o Mestre (com gerador rápido em `src/lib/npcs/gerador.ts`); um NPC também pode ter ficha completa, uma ficha do Mestre com `npc`, fora do grupo; o grupo vê os revelados por `npcs_revelados`, sem segredo nem números. Pré-gerados são fichas do Mestre com `pre_gerado`, que um jogador sem ficha ativa assume (`assumir_pre_gerado`). O Mestre concede jutsus (`conceder_jutsu`, entra nos treinos da ficha) e itens (`conceder_item`, ficam em `personagens.entregas` até a ficha abrir), de graça ou cobrando PT/ryo.

Depois da aprovação, a progressão fica em `dados.progresso` (as escolhas de cada nível e os treinos) e o nível atual é `1 + progresso.niveis.length`. `src/lib/personagem/progressao.ts` cuida de XP e níveis (cap. 17), lê os marcos de clã (cap. 8.3), monta os passos dinâmicos do Subir de nível, calcula o custo real dos jutsus com as reduções do cap. 9, lista o que dá para treinar com PT (cap. 18) e guarda as regras de descanso, PV 0 e PIC.

No banco, o estado em jogo (PV/PC/PE atuais, fadiga, condições, saves de morte, PD e PIC), o inventário, o ryo e o saldo de PT só mudam pelas funções `atualizar_estado`, `atualizar_inventario`, `subir_nivel`, `treinar`, `solicitar_pt`/`decidir_pedido_pt`, `conceder_recompensa` e `definir_situacao`; cada uma deixa uma linha no registro da ficha. A ficha completa é só do dono e do Mestre; o grupo vê o resumo público por `personagens_do_grupo()`. Quando a campanha começa acima do nível 1, a ficha aprovada recebe o XP do nível inicial e sobe pelo próprio P4.

## Rolagens, temas e capas

As rolagens são sorteadas no servidor: `rolar(campanha, expressao, rotulo, personagem, modo, oculta)` aceita expressões como `1d20+5` ou `2d6+1d4-1`, aplica vantagem e desvantagem (cap. 2: o d20 duas vezes, fica o maior ou o menor) e o crítico (cap. 4: os dados de dano dobram), e grava em `rolagens`. As ocultas só o autor e o Mestre veem (RLS). A tabela está no Supabase Realtime: o registro (separado por dia, com o personagem e quem rolou) e o aviso no canto da tela recebem as rolagens da mesa na hora, em qualquer página do site; o painel flutuante do registro abre pelo dado da barra superior e acompanha a última campanha aberta. O Mestre rola pelos NPCs (`rolar(..., npc)`), e USAR um jutsu debita o custo e já rola ataque e dano. `src/lib/rolagens/expressoes.ts` monta as expressões da ficha (atributos, perícias, iniciativa, save de morte, ataque e dano dos jutsus lidos do texto do livro, ataque e dano das armas). Os dados (d4, d6, d8, d10, d12, d20, d100) e as animações deles são do PixelLab (`static/dados/`, spritesheets de 9 quadros). O sorteio fica no banco de propósito (avaliamos a `rpg-dice-roller`, mas ela sortearia no navegador).

A fonte de pixel do app é o Pixelify Sans, mas os dígitos e sinais das contas vêm do VT323 (`@font-face` "Digitos Shinobi" com `unicode-range`, arquivo em `static/fonts/`), porque os números do Pixelify se confundem em tamanho pequeno. O tema do usuário (perfil → Aparência) guarda acento, destaque, fundo, texto, escala e raio em `perfis.preferencias.visual` e vira variáveis CSS no `<html>` (`src/lib/estado/visual.ts`); o `app.html` aplica antes da primeira pintura. A ficha mostra no topo a paisagem da vila do personagem, e o dono pode trocar (`definir_capa_ficha`); a aba Anotações é o caderno do dono, que o Mestre lê (`salvar_anotacoes`). As capas das campanhas são as paisagens das vilas (`static/covers/capa-<vila>-256.png`, geradas no PixelLab), e a Floresta é a dos Renegados.

## Rodando

```sh
npm install
npm run dev          # desenvolvimento em http://localhost:5173
npm run build        # gera o site estático em build/ (valida links e âncoras internas)
npm run preview      # serve o build
npm run check        # svelte-check
npm test             # testes (vitest), incluindo RLS e funções do banco em PGlite
npm run livro:gerar  # reconverte o .docx (rode depois de editar o livro)
```

## Supabase

1. Copie `.env.example` para `.env` e preencha `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API). No Vercel, cadastre as mesmas duas variáveis.
2. Rode `supabase/migrations/*.sql` no SQL Editor do projeto (ou `npx supabase db push` com o CLI ligado ao projeto).
3. Em Authentication → URL Configuration, use a URL do site em **Site URL** e adicione `https://SEU-DOMINIO/auth/callback` e `http://localhost:5173/auth/callback` em **Redirect URLs**.

Login só por e-mail e senha. Confirmação de conta e recuperação de senha voltam por `/auth/callback`. O app não envia e-mails próprios: convites por e-mail aparecem no sino de quem já tem conta; para os outros, o Mestre manda o link ou o código. O SMTP padrão do Supabase tem limite baixo de envios por hora; para uso real, configure um SMTP próprio em Authentication → Emails.

Os testes em `supabase/testes/` rodam a migração num Postgres em memória (PGlite) com um esquema `auth` simulado e conferem as políticas de RLS e as funções (convites, Mestre, exclusão de conta).

## Como o livro vira site

`scripts/livro/converter.ts` lê `shinobi_no_michi_v18.docx` e gera os dados em `src/lib/livro/gerado/*.json` (versionados, para os diffs mostrarem o que mudou no conteúdo). O conversor reconhece a formatação do livro:

| No .docx | Vira |
|---|---|
| Heading 1 / 2 / 3 / 4 | capítulo, seções com âncora |
| Tabela de 1 célula com fundo `f0ebe0` | epígrafe |
| Tabela com fundo `fff4e6` | caixa de destaque (Destaque, Exemplo, Atenção, Dica do Mestre, Pré-requisito, pelo título) |
| Cabeçalho `c44536` | tabela de regras |
| Tabela com faixa `5c1e15` | card de jutsu ou de habilidade (cor do tipo na borda) |
| Parágrafo centralizado em vermelhão negrito | bloco de fórmula |
| "cap. 6", "Capítulo 18", "cap. 8.4" | referência cruzada com prévia |
| Siglas de Atributos e Recursos do glossário (PC, PV, AGI…) | termo com verbete (1ª ocorrência por seção) |

Ele também extrai os 13 clãs (cap. 8.3), as 16 especializações (cap. 19), armas e Sete Espadas (cap. 12), o glossário (cap. 22), os cards da referência rápida e o índice de busca. Os avisos no fim da execução apontam o que não foi reconhecido.

## Onde está cada coisa

| Caminho | Conteúdo |
|---|---|
| `src/routes/` | Telas: `/` (G5), `/regras` (D1), `/regras/[capitulo]` (D2), `clas` (D3), `jutsus` (D4/D5), `equipamentos` (D6), `especializacoes` (D7), `glossario` (D8), `referencia-rapida` (D10), `/busca` (D9) |
| `src/routes/(app)/` | Conta: `/entrar` (A1), `/criar-conta` (A2), `/recuperar-senha` e `/redefinir-senha` (A3), `/perfil` (A4), `/notificacoes` (G3). Campanhas: `/campanhas` (C1), `/campanhas/nova` (C2), `/campanhas/[id]` (C3/C4), `membros` (C5), `configuracoes` (C7), `/convite/[chave]` (C6). Personagens: `/campanhas/[id]/personagens` (P1), `[pid]` (P3 ficha), `[pid]/editar` (P2 criador e revisão do Mestre), `[pid]/nivel` (P4), `[pid]/imprimir` (P6) |
| `src/lib/personagem/` | Motor e tabelas da criação de personagem, catálogo do servidor e estado do criador |
| `src/lib/supabase/`, `src/hooks.server.ts` | Clientes do Supabase (navegador e servidor), tipos do banco e a guarda das áreas logadas |
| `src/lib/campanhas/`, `src/lib/conta/` | Regras de campanha (eras, vilas, clãs, aprovação, tabela de XP), convites e validações de conta |
| `supabase/` | Migrações SQL e testes do banco |
| `src/lib/rolagens/` | Expressões de dados da ficha e o rolador (rolar, aviso, tempo real) |
| `src/lib/componentes/` | `shell` (navbar, dock, rodapé, notificações), `leitura` (blocos, tabelas, destaques, sumário), `regras` (CMP-01 a 17), `busca` (G2), `conta`, `campanha` (menu, card, formulários, convites), `ui` |
| `src/lib/livro/` | tipos, cores de domínio, utilitários de texto e os dados gerados |
| `src/routes/layout.css` | tokens dos temas sumi/washi, tema DaisyUI e classes da direção 1a |
| `instrucoes-claude-design.md` | Especificação de todas as telas, identidade visual, componentes, fluxos e estados |
| `shinobi_no_michi_v18.docx` | Livro de regras (fonte de todo o conteúdo) |
| `static/icons/`, `static/illustrations/`, `static/covers/`, `static/dados/` | Ícones, paisagens das vilas e dados PixelLab servidos pelo site |
| `pixellab/` | Inventário, prompts e pipeline de geração dos ícones; pacote para o Claude Design |

## Para o Claude Design

1. Leia `instrucoes-claude-design.md` (seção 10 tem o contexto fixo e a ordem dos lotes de telas).
2. Use os ícones de `pixellab/export-claude-design/` pelo ID mostrado nas pranchas; regras de uso no `LEIA-ME.md` dessa pasta.
