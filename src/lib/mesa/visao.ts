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

/**
 * O que um polígono de visão guarda além dos pontos. Os pontos vêm pela ordem do ângulo em volta do olho, então saber se um lugar
 * está dentro é achar entre quais dois deles a direção cai: numa cidade são milhares de pontos, e cada árvore pergunta 8 vezes.
 */
interface Estrela {
	ox: number;
	oy: number;
	angulos: Float64Array;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}
const estrelas = new WeakMap<readonly Ponto[], Estrela>();

/** Quanto falta de (x, y) até o segmento. */
function ateSegmento(x: number, y: number, [x1, y1, x2, y2]: Segmento) {
	const [dx, dy] = [x2 - x1, y2 - y1];
	const k = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
	return Math.hypot(x - (x1 + k * dx), y - (y1 + k * dy));
}

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
	// as paredes mais perto primeiro: o raio para de procurar ao passar da que já o barrou, e numa cidade quase todos param cedo
	const perto = segs.map((s) => ({ s, d: ateSegmento(ox, oy, s) })).sort((a, b) => a.d - b.d);
	const pts: Ponto[] = [];
	const certos: number[] = [];
	let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
	for (const a of angulos) {
		const dx = Math.cos(a);
		const dy = Math.sin(a);
		let tmin = Infinity;
		for (const { s, d } of perto) {
			if (d > tmin) break;
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
		if (tmin === Infinity) continue;
		const [x, y] = [ox + dx * tmin, oy + dy * tmin];
		pts.push([x, y]);
		certos.push(a);
		[x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
	}
	estrelas.set(pts, { ox, oy, angulos: Float64Array.from(certos), x0, y0, x1, y1 });
	return pts;
}

/** O ponto (x, y) está dentro do polígono? (regra par-ímpar) */
export function dentro(p: readonly Ponto[], x: number, y: number): boolean {
	const e = estrelas.get(p);
	if (e) {
		if (p.length < 3 || x < e.x0 || x > e.x1 || y < e.y0 || y > e.y1) return false;
		const a = Math.atan2(y - e.oy, x - e.ox);
		// o último ponto que não passa da direção; antes do primeiro, a volta fecha no último
		let [baixo, alto] = [0, p.length];
		while (baixo < alto) {
			const meio = (baixo + alto) >> 1;
			if (e.angulos[meio] <= a) baixo = meio + 1;
			else alto = meio;
		}
		const [qx, qy] = p[(baixo + p.length - 1) % p.length];
		const [rx, ry] = p[baixo % p.length];
		const lado = (ax: number, ay: number) => (rx - qx) * (ay - qy) - (ry - qy) * (ax - qx);
		return lado(x, y) * lado(e.ox, e.oy) >= 0;
	}
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
