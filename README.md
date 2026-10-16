# Rising Shinobi

Documentação web e criador de campanhas do RPG de mesa **Shinobi no Michi — O Caminho do Ninja** (Livro de Regras v18.0).

Stack prevista: SvelteKit + Tailwind CSS + DaisyUI. As telas são desenhadas antes no Claude Design.

## Onde está cada coisa

| Caminho | Conteúdo |
|---|---|
| `instrucoes-claude-design.md` | Especificação de todas as telas, identidade visual, componentes, fluxos e estados |
| `shinobi_no_michi_v18.docx` | Livro de regras (fonte de todo o conteúdo) |
| `pixellab/export-claude-design/` | **Pacote de ícones para o Claude Design**: pranchas com IDs, PNGs em 32/64/96px, ilustrações, capas, `icons.json` e `LEIA-ME.md` |
| `static/icons/`, `static/illustrations/`, `static/covers/` | Os mesmos assets, no lugar onde o SvelteKit vai servi-los |
| `pixellab/icones-p1.json` | Inventário e prompts de todos os ícones (fonte única) |
| `pixellab/prompts-p1.md` | Versão legível dos prompts |
| `pixellab/scripts/` | Pipeline de geração e exportação dos ícones |

## Para o Claude Design

1. Leia `instrucoes-claude-design.md` (seção 10 tem o contexto fixo e a ordem dos lotes de telas).
2. Use os ícones de `pixellab/export-claude-design/` pelo ID mostrado nas pranchas; regras de uso no `LEIA-ME.md` dessa pasta.
