// L11 · Mesa: medidas no quadro (cap. 4, Movimento e Distância). 1 quadrado = 1 m; na diagonal os quadrados alternam
// 1 m e 2 m, o que dá "maior lado + metade do menor, arredondada para baixo". Os moldes de área seguem a mesma regra:
// a esfera pega os quadrados dentro da contagem; cone, linha e parede pegam os quadrados cujo centro cai na forma.

export type Quadrado = [number, number];
export interface Espaco {
	x: number;
	y: number;
	tamanho: number;
}

/** Distância em metros entre dois quadrados. */
export function distancia(x1: number, y1: number, x2: number, y2: number) {
	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	return Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2);
}

/** Distância entre dois espaços (tokens grandes ocupam vários quadrados): vale o par de quadrados mais próximo. */
export function distanciaEntre(a: Espaco, b: Espaco) {
	const dx = Math.max(0, b.x - (a.x + a.tamanho - 1), a.x - (b.x + b.tamanho - 1));
	const dy = Math.max(0, b.y - (a.y + a.tamanho - 1), a.y - (b.y + b.tamanho - 1));
	return Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2);
}

/** Total de um caminho com pontos intermediários (régua livre): soma dos trechos. */
export function trechos(pontos: Quadrado[]) {
	return pontos.slice(1).map((q, i) => distancia(pontos[i][0], pontos[i][1], q[0], q[1]));
}

export const dentro = (x: number, y: number, largura: number, altura: number) => x >= 0 && y >= 0 && x < largura && y < altura;

/** Esfera de N m: os quadrados a até N m do centro. */
export function quadradosEsfera(cx: number, cy: number, n: number, largura: number, altura: number): Quadrado[] {
	const q: Quadrado[] = [];
	for (let x = cx - n; x <= cx + n; x++) for (let y = cy - n; y <= cy + n; y++) if (dentro(x, y, largura, altura) && distancia(x, y, cx, cy) <= n) q.push([x, y]);
	return q;
}

/** Corpo a corpo (ou haste): os quadrados a até `alcance` m do espaço, sem o próprio espaço. */
export function quadradosEmVolta(e: Espaco, alcance: number, largura: number, altura: number): Quadrado[] {
	const q: Quadrado[] = [];
	for (let x = e.x - alcance; x < e.x + e.tamanho + alcance; x++)
		for (let y = e.y - alcance; y < e.y + e.tamanho + alcance; y++) {
			if (!dentro(x, y, largura, altura)) continue;
			const d = distanciaEntre(e, { x, y, tamanho: 1 });
			if (d > 0 && d <= alcance) q.push([x, y]);
		}
	return q;
}

/** Ângulo do lançador até o ponteiro, com a opção de travar em múltiplos de 45°. */
export function angulo(ox: number, oy: number, px: number, py: number, travar = false) {
	const a = Math.atan2(py - oy, px - ox);
	return travar ? Math.round(a / (Math.PI / 4)) * (Math.PI / 4) : a;
}

/**
 * Cone (comprimento N, ponta com largura N) ou linha (comprimento N, 1 m de largura) saindo do centro do lançador.
 * Devolve os quadrados e o contorno, em metros.
 */
export function moldeDirecional(forma: 'cone' | 'linha', origem: Espaco, n: number, a: number, largura: number, altura: number) {
	const cx = origem.x + origem.tamanho / 2;
	const cy = origem.y + origem.tamanho / 2;
	const ux = Math.cos(a);
	const uy = Math.sin(a);
	const vx = -uy;
	const vy = ux;
	const meio = forma === 'cone' ? n / 2 : 0.5;
	// a forma começa na borda do espaço do lançador (importa para tokens grandes)
	const inicio = (origem.tamanho - 1) / 2;
	const contorno: Quadrado[] =
		forma === 'cone'
			? [
					[cx + ux * inicio, cy + uy * inicio],
					[cx + ux * (inicio + n) + vx * meio, cy + uy * (inicio + n) + vy * meio],
					[cx + ux * (inicio + n) - vx * meio, cy + uy * (inicio + n) - vy * meio]
				]
			: [
					[cx + ux * inicio + vx * meio, cy + uy * inicio + vy * meio],
					[cx + ux * (inicio + n) + vx * meio, cy + uy * (inicio + n) + vy * meio],
					[cx + ux * (inicio + n) - vx * meio, cy + uy * (inicio + n) - vy * meio],
					[cx + ux * inicio - vx * meio, cy + uy * inicio - vy * meio]
				];
	const q: Quadrado[] = [];
	const r = Math.ceil(n + origem.tamanho);
	for (let x = origem.x - r; x <= origem.x + origem.tamanho + r; x++)
		for (let y = origem.y - r; y <= origem.y + origem.tamanho + r; y++) {
			if (!dentro(x, y, largura, altura)) continue;
			if (x >= origem.x && x < origem.x + origem.tamanho && y >= origem.y && y < origem.y + origem.tamanho) continue;
			const qx = x + 0.5 - cx;
			const qy = y + 0.5 - cy;
			const ao = qx * ux + qy * uy - inicio;
			const pe = Math.abs(qx * vx + qy * vy);
			if (ao > 0 && ao <= n && pe <= (forma === 'cone' ? ao / 2 : 0.5)) q.push([x, y]);
		}
	return { quadrados: q, contorno };
}

/** Parede: faixa de N m por 1 m centrada no quadrado (tx, ty), girada em passos de 45°. */
export function moldeParede(tx: number, ty: number, n: number, giro: number, largura: number, altura: number) {
	const a = (giro * Math.PI) / 4;
	const ux = Math.cos(a);
	const uy = Math.sin(a);
	const vx = -uy;
	const vy = ux;
	const ox = tx + 0.5;
	const oy = ty + 0.5;
	const contorno: Quadrado[] = [
		[ox - (ux * n) / 2 - vx * 0.5, oy - (uy * n) / 2 - vy * 0.5],
		[ox + (ux * n) / 2 - vx * 0.5, oy + (uy * n) / 2 - vy * 0.5],
		[ox + (ux * n) / 2 + vx * 0.5, oy + (uy * n) / 2 + vy * 0.5],
		[ox - (ux * n) / 2 + vx * 0.5, oy - (uy * n) / 2 + vy * 0.5]
	];
	const q: Quadrado[] = [];
	for (let x = tx - n; x <= tx + n; x++)
		for (let y = ty - n; y <= ty + n; y++) {
			if (!dentro(x, y, largura, altura)) continue;
			const qx = x + 0.5 - ox;
			const qy = y + 0.5 - oy;
			if (Math.abs(qx * ux + qy * uy) <= n / 2 + 0.01 && Math.abs(qx * vx + qy * vy) <= 0.51) q.push([x, y]);
		}
	return { quadrados: q, contorno };
}

/** Um espaço está na área se qualquer quadrado dele estiver nela. */
export function naArea(e: Espaco, quadrados: Quadrado[]) {
	const chave = new Set(quadrados.map(([x, y]) => `${x},${y}`));
	for (let x = e.x; x < e.x + e.tamanho; x++) for (let y = e.y; y < e.y + e.tamanho; y++) if (chave.has(`${x},${y}`)) return true;
	return false;
}

export type FaixaMovimento = 'normal' | 'sprint' | 'alem';

/**
 * O caminho de um arrasto: metros deste arrasto, total no turno (os metros já andados contam quando é a vez dele) e
 * a faixa: dentro do Deslocamento, no sprint (mais o dobro) ou além do limite. É aviso, nunca bloqueio.
 */
export function infoMovimento(metros: number, jaAndados: number, deslocamento: number) {
	const total = jaAndados + metros;
	if (total <= deslocamento) return { total, faixa: 'normal' as FaixaMovimento, texto: `${total} m · sobram ${deslocamento - total} m` };
	if (total <= 3 * deslocamento) return { total, faixa: 'sprint' as FaixaMovimento, texto: `${total} m · Sprint: +${2 * deslocamento} m` };
	return { total, faixa: 'alem' as FaixaMovimento, texto: `${total - 3 * deslocamento} m além do limite` };
}

/** Alcance corpo a corpo pelo tamanho (cap. 4): adjacente até Grande; Enorme (6 × 6) 2 m; Colossal (10 × 10) 3 m. */
export const alcanceCorpo = (tamanho: number) => (tamanho >= 10 ? 3 : tamanho >= 6 ? 2 : 1);

/** Golpe de oportunidade: inimigos que alcançavam o espaço antes do arrasto e deixam de alcançar no fim dele. */
export function provocaReacao<T extends Espaco>(antes: Espaco, depois: Espaco, inimigos: T[]) {
	return inimigos.filter((e) => distanciaEntre(antes, e) <= alcanceCorpo(e.tamanho) && distanciaEntre(depois, e) > alcanceCorpo(e.tamanho));
}
