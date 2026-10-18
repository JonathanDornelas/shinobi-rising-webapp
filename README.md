# Rising Shinobi

Documentação web e criador de campanhas do RPG de mesa **Shinobi no Michi — O Caminho do Ninja** (Livro de Regras v18.0).

Stack: SvelteKit 3 (Svelte 5) + Tailwind CSS 4 + DaisyUI 5 + Supabase, publicado no Vercel (`adapter-vercel`): a documentação é pré-renderizada; conta e campanhas rodam no servidor. As telas são desenhadas antes no Claude Design (direção visual 1a "Jogo", temas sumi e washi).

**Fase atual:** Lote 4, criação de personagem (P2) com envio e decisão do Mestre. Feitos antes: documentação do livro (G1–G5, D1–D10), conta (A1–A4) e campanhas (C1–C7). Próximo: ficha, nível e treino.

## Criação de personagem

`src/lib/personagem/regras.ts` é o motor do cap. 6: a partir das escolhas (`FichaDados`) calcula atributos, perícias, PT, recursos, carga e ryo, e gera as verificações da revisão (ok, aviso, bloqueio). Os números do livro que ele usa ficam em `dados.ts` (vilas do cap. 7, bônus de criação e marco do nível 1 dos 13 clãs, backgrounds, efeitos das especializações, custos de proficiência); jutsus, clãs, especializações e itens da loja vêm dos dados gerados do livro, montados no servidor por `catalogo.server.ts`. O motor é testado com os exemplos do próprio livro (`regras.spec.ts`).

A ficha fica na tabela `personagens` (escolhas em `dados`, valores para listas em `resumo`). O status só muda pelas funções `enviar_ficha`, `retirar_ficha` e `decidir_ficha`; uma campanha que não exige aprovação de fichas aprova no envio. O criador de clãs e de jutsus, os retratos e o "Subir de nível" para campanhas que começam acima do nível 1 chegam nos próximos lotes.

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
| `src/routes/(app)/` | Conta: `/entrar` (A1), `/criar-conta` (A2), `/recuperar-senha` e `/redefinir-senha` (A3), `/perfil` (A4), `/notificacoes` (G3). Campanhas: `/campanhas` (C1), `/campanhas/nova` (C2), `/campanhas/[id]` (C3/C4), `membros` (C5), `configuracoes` (C7), `/convite/[chave]` (C6). Personagens: `/campanhas/[id]/personagens/[pid]` (P2, criador e ficha em revisão) |
| `src/lib/personagem/` | Motor e tabelas da criação de personagem, catálogo do servidor e estado do criador |
| `src/lib/supabase/`, `src/hooks.server.ts` | Clientes do Supabase (navegador e servidor), tipos do banco e a guarda das áreas logadas |
| `src/lib/campanhas/`, `src/lib/conta/` | Regras de campanha (eras, vilas, clãs, aprovação, tabela de XP), convites e validações de conta |
| `supabase/` | Migrações SQL e testes do banco |
| `src/lib/componentes/` | `shell` (navbar, dock, rodapé, notificações), `leitura` (blocos, tabelas, destaques, sumário), `regras` (CMP-01 a 17), `busca` (G2), `conta`, `campanha` (menu, card, formulários, convites), `ui` |
| `src/lib/livro/` | tipos, cores de domínio, utilitários de texto e os dados gerados |
| `src/routes/layout.css` | tokens dos temas sumi/washi, tema DaisyUI e classes da direção 1a |
| `instrucoes-claude-design.md` | Especificação de todas as telas, identidade visual, componentes, fluxos e estados |
| `shinobi_no_michi_v18.docx` | Livro de regras (fonte de todo o conteúdo) |
| `static/icons/`, `static/illustrations/`, `static/covers/` | Ícones PixelLab servidos pelo site |
| `pixellab/` | Inventário, prompts e pipeline de geração dos ícones; pacote para o Claude Design |

## Para o Claude Design

1. Leia `instrucoes-claude-design.md` (seção 10 tem o contexto fixo e a ordem dos lotes de telas).
2. Use os ícones de `pixellab/export-claude-design/` pelo ID mostrado nas pranchas; regras de uso no `LEIA-ME.md` dessa pasta.
