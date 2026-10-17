# Rising Shinobi

Documentação web e criador de campanhas do RPG de mesa **Shinobi no Michi — O Caminho do Ninja** (Livro de Regras v18.0).

Stack: SvelteKit 3 (Svelte 5) + Tailwind CSS 4 + DaisyUI 5, pré-renderizado com `adapter-static`. As telas são desenhadas antes no Claude Design (direção visual 1a "Jogo", temas sumi e washi).

**Fase atual:** documentação do livro (telas G1–G5 e D1–D10). Conta e campanhas (Supabase) vêm na próxima fase.

## Rodando

```sh
npm install
npm run dev          # desenvolvimento em http://localhost:5173
npm run build        # gera o site estático em build/ (valida links e âncoras internas)
npm run preview      # serve o build
npm run check        # svelte-check
npm test             # testes (vitest)
npm run livro:gerar  # reconverte o .docx (rode depois de editar o livro)
```

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
| `src/lib/componentes/` | `shell` (navbar, dock, rodapé), `leitura` (blocos, tabelas, destaques, sumário), `regras` (CMP-01 a 17), `busca` (G2), `ui` |
| `src/lib/livro/` | tipos, cores de domínio, utilitários de texto e os dados gerados |
| `src/routes/layout.css` | tokens dos temas sumi/washi, tema DaisyUI e classes da direção 1a |
| `instrucoes-claude-design.md` | Especificação de todas as telas, identidade visual, componentes, fluxos e estados |
| `shinobi_no_michi_v18.docx` | Livro de regras (fonte de todo o conteúdo) |
| `static/icons/`, `static/illustrations/`, `static/covers/` | Ícones PixelLab servidos pelo site |
| `pixellab/` | Inventário, prompts e pipeline de geração dos ícones; pacote para o Claude Design |

## Para o Claude Design

1. Leia `instrucoes-claude-design.md` (seção 10 tem o contexto fixo e a ordem dos lotes de telas).
2. Use os ícones de `pixellab/export-claude-design/` pelo ID mostrado nas pranchas; regras de uso no `LEIA-ME.md` dessa pasta.
