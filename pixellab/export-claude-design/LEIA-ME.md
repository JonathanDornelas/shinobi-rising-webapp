# Ícones Shinobi no Michi — pacote para o Claude Design

Pixel art gerada no PixelLab (e alguns ícones desenhados em código) para as telas do projeto.
Total: **219 ícones**, **12 ilustrações** e **6 capas de campanha**. Especificação completa: seção 3 de `instrucoes-claude-design.md`.

## Como usar no Claude Design

1. Envie primeiro as **pranchas** (`pranchas/*.png`): cada ícone aparece com o ID embaixo. Peça para usar exatamente esses IDs.
2. Envie os PNGs do tamanho que a tela usa (`icons/32`, `icons/64` ou `icons/96`; ilustrações em `ilustracoes/96` ou `ilustracoes/192`; capas em `capas/256` ou `capas/512`). Os ampliados já estão sem suavização.
3. Cole esta regra no contexto: *"Ícones são pixel art: exibir só em 32, 64 ou 96px, com image-rendering: pixelated, sem redimensionar para outros tamanhos, sem sombra nem filtro. Use o ícone pelo ID; não substitua por emoji nem por ícone de biblioteca."*
4. `icons.json` lista ID, categoria, texto alternativo (pt-BR) e arquivo de cada ícone.

## Regras rápidas

- Nome: `ic-{categoria}-{nome}-{tamanho}.png` (ex.: `ic-recurso-pc-64.png`).
- Vilas, clãs e elementos são recriações dos símbolos oficiais do mangá/anime.
- Brasões genéricos (`ic-kamon-base-*`) são máscaras brancas: tingir com a cor do clã via CSS `mask-image`.
- Utilitários de interface (fechar, setas, editar) não estão aqui: usar uma biblioteca de traço (seção 3.7).
