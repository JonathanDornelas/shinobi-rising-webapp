# Mapa isométrico de teste (PixelLab)

`corredor-iso.png` (1344 × 694) é um corredor escuro de 12 × 30 quadrados, no clima da referência top-down do usuário
(piso de pedra escura, faixa de madeira, cercas, postes com estandarte e lanterna, portão ao fundo). As peças em `pecas/`
foram geradas no PixelLab (piso, rocha e madeira são peças isométricas de 64 × 64; cerca, portão, poste, árvore, casa,
lanterna e pedra são objetos). `compor-corredor.cjs` monta o mapa: `node compor-corredor.cjs pecas saida.png [previa.png]`
(a prévia leva a grade do app por cima).

Como usar no app:
1. Cena de **12 × 30** metros, "Vista isométrica" ligada nas configurações da cena.
2. Biblioteca de artes → enviar `corredor-iso.png` como **Mapa** → "Usar como fundo".
3. Configurações da cena → desmarcar "Esticar o fundo na cena": a largura vira **42 quadr.** (12 + 30), que encaixa a
   imagem exatamente na grade (o canto de cima da imagem fica no canto de cima do mapa).
4. As peças soltas (`pecas/arvore.png`, `casa.png`, `lanterna.png`, `pedra.png`, `poste.png`, `cerca.png`, `portao.png`)
   servem para testar imagens de objeto de pé: envie como **Objeto**.
