// Reenquadrar a cena: a grade ganha ou perde quadrados em qualquer lado. Entrar `dx` colunas à esquerda e `dy` linhas em
// cima (negativo: saem) muda a coordenada de tudo o que já estava na cena; estas contas levam cada coisa junto, para ela
// continuar no mesmo lugar do mapa, e jogam fora o que ficou do lado de fora.

type Q = [number, number];
/** Uma faixa revelada da névoa: linha y, colunas x0 a x1 (inclusive). */
type Run = [number, number, number];

/** Quadrados (terreno, área de efeito) deslocados; os que saem da cena nova somem. */
export function deslocarQuadrados(qs: Q[], dx: number, dy: number, largura: number, altura: number): Q[] {
	return qs.map(([x, y]): Q => [x + dx, y + dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < largura && y < altura);
}

/** As faixas reveladas da névoa deslocadas e cortadas na cena nova. */
export function deslocarRuns(runs: Run[], dx: number, dy: number, largura: number, altura: number): Run[] {
	return runs
		.map(([y, x0, x1]): Run => [y + dy, Math.max(0, x0 + dx), Math.min(largura - 1, x1 + dx)])
		.filter(([y, x0, x1]) => y >= 0 && y < altura && x0 <= x1);
}

/** Onde um token de `tamanho` quadrados fica: deslocado e, se sobrar para fora, puxado para dentro inteiro. */
export function deslocarToken(t: { x: number; y: number; tamanho: number }, dx: number, dy: number, largura: number, altura: number): Q {
	return [Math.max(0, Math.min(largura - t.tamanho, t.x + dx)), Math.max(0, Math.min(altura - t.tamanho, t.y + dy))];
}
