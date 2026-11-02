// Visão da Mesa (luz dinâmica): o que se enxerga de um ponto, com as paredes no caminho. Tudo em metros da grade, então
// o mesmo desenho serve à vista de cima e à isométrica (que só projeta a grade).
//  - poligonoVisao: o polígono do que se vê de um ponto: um raio para cada ponta de parede (e um de cada lado dela),
//    até a primeira parede que ele toca, dentro de uma caixa (a cena, ou o quadrado do alcance de uma luz);
//  - dentro: o ponto está no polígono? (esconde o token que ninguém vê);
//  - rasterizar: os quadrados cujo centro cai no polígono (o que o grupo já explorou).

export type Ponto = [number, number];
/** Segmento [x1, y1, x2, y2], em metros. */
export type Segmento = [number, number, number, number];
export interface Caixa {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

/** O desvio dos raios de cada lado de uma ponta: passa rente à quina e acha o que está atrás dela. */
const DESVIO = 1e-4;

const tocaCaixa = ([x1, y1, x2, y2]: Segmento, c: Caixa) =>
	!((x1 < c.x0 && x2 < c.x0) || (x1 > c.x1 && x2 > c.x1) || (y1 < c.y0 && y2 < c.y0) || (y1 > c.y1 && y2 > c.y1));

/** O polígono do que se vê de (ox, oy), com os pontos em volta pela ordem do ângulo. O ponto precisa estar na caixa. */
export function poligonoVisao(ox: number, oy: number, paredes: readonly Segmento[], caixa: Caixa): Ponto[] {
	const segs: Segmento[] = [
		[caixa.x0, caixa.y0, caixa.x1, caixa.y0],
		[caixa.x1, caixa.y0, caixa.x1, caixa.y1],
		[caixa.x1, caixa.y1, caixa.x0, caixa.y1],
		[caixa.x0, caixa.y1, caixa.x0, caixa.y0]
	];
	for (const s of paredes) if (tocaCaixa(s, caixa)) segs.push(s);
	// as pontas, sem repetir a que duas paredes dividem; cada uma com um raio dela e um de cada lado
	const vistas = new Set<string>();
	const angulos: number[] = [];
	for (const s of segs)
		for (let k = 0; k < 4; k += 2) {
			const chave = `${s[k]},${s[k + 1]}`;
			if (vistas.has(chave)) continue;
			vistas.add(chave);
			const a = Math.atan2(s[k + 1] - oy, s[k] - ox);
			angulos.push(a - DESVIO, a, a + DESVIO);
		}
	angulos.sort((a, b) => a - b);
	const pts: Ponto[] = [];
	for (const a of angulos) {
		const dx = Math.cos(a);
		const dy = Math.sin(a);
		let tmin = Infinity;
		for (const s of segs) {
			// raio O + tD contra o segmento P + uS: t = (Q × S) / (D × S), u = (Q × D) / (D × S), com Q = P − O
			const sx = s[2] - s[0];
			const sy = s[3] - s[1];
			const den = dx * sy - dy * sx;
			if (den > -1e-12 && den < 1e-12) continue;
			const qx = s[0] - ox;
			const qy = s[1] - oy;
			const t = (qx * sy - qy * sx) / den;
			if (t < 0 || t >= tmin) continue;
			const u = (qx * dy - qy * dx) / den;
			if (u < -1e-9 || u > 1 + 1e-9) continue;
			tmin = t;
		}
		if (tmin < Infinity) pts.push([ox + dx * tmin, oy + dy * tmin]);
	}
	return pts;
}

/** O ponto (x, y) está dentro do polígono? (regra par-ímpar) */
export function dentro(p: readonly Ponto[], x: number, y: number): boolean {
	let d = false;
	for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
		const [xi, yi] = p[i];
		const [xj, yj] = p[j];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
	}
	return d;
}

/**
 * Marca na grade L × A (1 = marcado) os quadrados cujo centro cai no polígono, linha a linha. `teste` filtra cada quadrado
 * (o centro e o índice na grade). Devolve se marcou algum que não estava marcado.
 */
export function rasterizar(p: readonly Ponto[], L: number, A: number, g: Uint8Array, teste?: (cx: number, cy: number, i: number) => boolean): boolean {
	if (p.length < 3) return false;
	let ymin = Infinity;
	let ymax = -Infinity;
	for (const [, y] of p) {
		if (y < ymin) ymin = y;
		if (y > ymax) ymax = y;
	}
	let mudou = false;
	const xs: number[] = [];
	for (let j = Math.max(0, Math.floor(ymin)); j <= Math.min(A - 1, Math.ceil(ymax)); j++) {
		const cy = j + 0.5;
		xs.length = 0;
		for (let i = 0, k = p.length - 1; i < p.length; k = i++) {
			const [xi, yi] = p[i];
			const [xk, yk] = p[k];
			if (yi > cy !== yk > cy) xs.push(xi + ((cy - yi) * (xk - xi)) / (yk - yi));
		}
		xs.sort((a, b) => a - b);
		for (let n = 0; n + 1 < xs.length; n += 2) {
			for (let x = Math.max(0, Math.ceil(xs[n] - 0.5)); x <= Math.min(L - 1, Math.floor(xs[n + 1] - 0.5)); x++) {
				const i = j * L + x;
				if (g[i] || (teste && !teste(x + 0.5, cy, i))) continue;
				g[i] = 1;
				mudou = true;
			}
		}
	}
	return mudou;
}

/** O polígono como caminho SVG (em metros, duas casas). */
export const caminhoPoligono = (p: readonly Ponto[]) => (p.length < 3 ? '' : `M${p.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`);
