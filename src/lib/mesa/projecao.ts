// Vista isométrica da Mesa (planos/mapas-isometricos.md). Os dados continuam na grade quadrada (x, y em metros, 1 m por
// quadrado); este módulo só leva a grade para a tela e a tela de volta para a grade. Régua, moldes, névoa e terreno
// seguem em grade e não mudam; o quadro pede `projetar` para desenhar e `inverter` para o ponteiro.
//
// A tela é medida em pixels do tile (com Tw = 64, o losango de um quadrado tem 64 de largura e 32 de altura, a razão
// 2:1 da pixel art). O ponto (0, 0) da grade, já girada, fica em sx = 0; o mapa se abre para os dois lados.

export type Rotacao = 0 | 90 | 180 | 270;
export type Ponto = [number, number];

export interface CfgIso {
	/** quadrados da cena na largura (x) e na altura (y) da grade original */
	L: number;
	A: number;
	/** largura do losango de um quadrado, em px */
	tw: number;
	/** largura dividida pela altura do losango: 2 é o 2:1 da pixel art */
	razao: number;
	rotacao: Rotacao;
	/** px de tela que 1 m de elevação sobe */
	eh: number;
}

export const CFG_PADRAO = { tw: 64, razao: 2, rotacao: 0, eh: 16 } as const;

export const cfgIso = (L: number, A: number, o: Partial<Omit<CfgIso, 'L' | 'A'>> = {}): CfgIso => ({ L, A, ...CFG_PADRAO, ...o });

/** O próximo canto de onde olhar (sentido horário, de 90 em 90°). */
export const girarVista = (cfg: CfgIso, passo: 1 | -1 = 1): CfgIso => ({ ...cfg, rotacao: ((((cfg.rotacao / 90 + passo) % 4) + 4) % 4) * 90 as Rotacao });

const th = (cfg: CfgIso) => cfg.tw / cfg.razao;

/** Um ponto da grade original na grade girada (a de onde se olha). */
function girar(gx: number, gy: number, cfg: CfgIso): Ponto {
	switch (cfg.rotacao) {
		case 90:
			return [cfg.A - gy, gx];
		case 180:
			return [cfg.L - gx, cfg.A - gy];
		case 270:
			return [gy, cfg.L - gx];
		default:
			return [gx, gy];
	}
}
function desgirar(rx: number, ry: number, cfg: CfgIso): Ponto {
	switch (cfg.rotacao) {
		case 90:
			return [ry, cfg.A - rx];
		case 180:
			return [cfg.L - rx, cfg.A - ry];
		case 270:
			return [cfg.L - ry, rx];
		default:
			return [rx, ry];
	}
}
/** Um vetor (sem posição) da grade original na grade girada. */
function girarVetor(dx: number, dy: number, cfg: CfgIso): Ponto {
	switch (cfg.rotacao) {
		case 90:
			return [-dy, dx];
		case 180:
			return [-dx, -dy];
		case 270:
			return [dy, -dx];
		default:
			return [dx, dy];
	}
}
function desgirarVetor(rx: number, ry: number, cfg: CfgIso): Ponto {
	switch (cfg.rotacao) {
		case 90:
			return [ry, -rx];
		case 180:
			return [-rx, -ry];
		case 270:
			return [-ry, rx];
		default:
			return [rx, ry];
	}
}

/** O ponto (gx, gy) da grade, com elevação `z` em metros, na tela. */
export function projetar(gx: number, gy: number, z: number, cfg: CfgIso): Ponto {
	const [rx, ry] = girar(gx, gy, cfg);
	return [((rx - ry) * cfg.tw) / 2, ((rx + ry) * th(cfg)) / 2 - z * cfg.eh];
}

/** O ponto da tela de volta na grade, supondo que ele está na elevação `z` (0 é o chão). */
export function inverter(sx: number, sy: number, z: number, cfg: CfgIso): Ponto {
	const u = sx / (cfg.tw / 2);
	const v = (sy + z * cfg.eh) / (th(cfg) / 2);
	return desgirar((u + v) / 2, (v - u) / 2, cfg);
}

export type Matriz = [number, number, number, number, number, number];

/**
 * A projeção do chão como matriz SVG `matrix(a b c d e f)`: tudo o que o quadro já desenha em metros da grade (grade,
 * terreno, névoa, efeitos, moldes, traços, régua, círculos que viram elipses) entra num `<g transform>` com ela e fica
 * isométrico sem mais conta. O que precisa ficar de pé (token, rótulo, imagem de objeto) usa `emPe`.
 */
export function matrizIso(cfg: CfgIso): Matriz {
	const [e, f] = projetar(0, 0, 0, cfg);
	const [x1, y1] = projetar(1, 0, 0, cfg);
	const [x2, y2] = projetar(0, 1, 0, cfg);
	return [x1 - e, y1 - f, x2 - e, y2 - f, e, f];
}

/** A matriz inversa: desfaz a projeção do chão para desenhar direto em coordenadas da tela dentro do grupo projetado. */
export function inversa(m: Matriz): Matriz {
	const [a, b, c, d, e, f] = m;
	const det = a * d - b * c;
	return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

const txt = (m: Matriz) => `matrix(${m.map((v) => Math.round(v * 1e6) / 1e6).join(' ')})`;
/** `transform` que devolve ao desenho as coordenadas da tela (rótulos, fundo isométrico) dentro do grupo projetado. */
export const desfazerProjecao = (cfg: CfgIso) => txt(inversa(matrizIso(cfg)));

/**
 * `transform` que põe de pé o que foi desenhado em (ax, ay) dentro do grupo projetado: o desenho continua com os
 * mesmos metros e a mesma posição, mas sem a inclinação do chão. `sobe` o levanta na tela (metros), para a base do
 * sprite tocar o ponto de apoio.
 */
export function emPe(ax: number, ay: number, sobe: number, cfg: CfgIso): string {
	const [a, b, c, d] = inversa(matrizIso(cfg));
	const r = (v: number) => Math.round(v * 1e6) / 1e6;
	return `translate(${r(ax)} ${r(ay)}) matrix(${r(a)} ${r(b)} ${r(c)} ${r(d)} 0 0) translate(0 ${r(-sobe)}) translate(${r(-ax)} ${r(-ay)})`;
}

/** Os 4 vértices, na tela, do quadrado (x, y) ou do espaço n × n que começa nele (em ordem de desenho). */
export function losango(x: number, y: number, n: number, z: number, cfg: CfgIso): Ponto[] {
	return [projetar(x, y, z, cfg), projetar(x + n, y, z, cfg), projetar(x + n, y + n, z, cfg), projetar(x, y + n, z, cfg)];
}

/** O centro de um quadrado (ou de um espaço n × n) na tela. */
export const centro = (x: number, y: number, n: number, z: number, cfg: CfgIso): Ponto => projetar(x + n / 2, y + n / 2, z, cfg);

const f = (v: number) => Math.round(v * 100) / 100;
const poligono = (p: Ponto[]) => `M${p.map(([a, b]) => `${f(a)} ${f(b)}`).join('L')}Z`;

/**
 * Quadrados vizinhos numa linha da grade viram uma run [y, x0, x1] (x0 e x1 incluídos, como na névoa). Uma run é um
 * paralelogramo em qualquer das 4 vistas, então um terreno ou molde grande vira poucos polígonos.
 */
export function runsDeQuadrados(quadrados: ReadonlyArray<Ponto>): [number, number, number][] {
	const porLinha = new Map<number, Set<number>>();
	for (const [x, y] of quadrados) (porLinha.get(y) ?? porLinha.set(y, new Set()).get(y)!).add(x);
	const runs: [number, number, number][] = [];
	for (const [y, conjunto] of [...porLinha].sort((a, b) => a[0] - b[0])) {
		const xs = [...conjunto].sort((a, b) => a - b);
		let ini = xs[0];
		for (let i = 1; i <= xs.length; i++) {
			if (i === xs.length || xs[i] > xs[i - 1] + 1) {
				runs.push([y, ini, xs[i - 1]]);
				ini = xs[i];
			}
		}
	}
	return runs;
}

/** Os 4 vértices, na tela, de uma run de névoa, terreno ou molde. */
export function paralelogramoRun(run: readonly [number, number, number], z: number, cfg: CfgIso): Ponto[] {
	const [y, x0, x1] = run;
	return [projetar(x0, y, z, cfg), projetar(x1 + 1, y, z, cfg), projetar(x1 + 1, y + 1, z, cfg), projetar(x0, y + 1, z, cfg)];
}

/** Um único caminho SVG para todas as runs (a névoa, o terreno e o molde desenham assim). */
export const caminhoRuns = (runs: ReadonlyArray<readonly [number, number, number]>, z: number, cfg: CfgIso) => runs.map((r) => poligono(paralelogramoRun(r, z, cfg))).join('');

/** Um único caminho SVG para uma lista de quadrados (terreno difícil, molde de jutsu, efeito em cena). */
export const caminhoQuadrados = (quadrados: ReadonlyArray<Ponto>, z: number, cfg: CfgIso) => caminhoRuns(runsDeQuadrados(quadrados), z, cfg);

/** O contorno do espaço n × n (token, objeto) como caminho SVG fechado. */
export const caminhoLosango = (x: number, y: number, n: number, z: number, cfg: CfgIso) => poligono(losango(x, y, n, z, cfg));

/**
 * O círculo de raio `r` (em metros) em volta de (cx, cy) vira uma elipse na tela, com semi-eixos r·Tw/√2 e r·Th/√2:
 * é o anel de alcance, a esfera do jutsu e a base redonda do token.
 */
export function elipse(cx: number, cy: number, r: number, z: number, cfg: CfgIso) {
	const [ex, ey] = projetar(cx, cy, z, cfg);
	return { cx: ex, cy: ey, rx: (r * cfg.tw) / Math.SQRT2, ry: (r * th(cfg)) / Math.SQRT2 };
}

/** O ângulo da grade (o de `angulo()` em geometria.ts) como ângulo da tela. A mira de cone e de linha desenha com ele. */
export function anguloNaTela(a: number, cfg: CfgIso): number {
	const [rx, ry] = girarVetor(Math.cos(a), Math.sin(a), cfg);
	return Math.atan2(((rx + ry) * th(cfg)) / 2, ((rx - ry) * cfg.tw) / 2);
}

/** O ângulo da tela (do ponteiro, a partir do lançador) como ângulo da grade, para o molde. */
export function anguloNaGrade(t: number, cfg: CfgIso): number {
	const sx = Math.cos(t);
	const sy = Math.sin(t);
	const u = sx / (cfg.tw / 2);
	const v = sy / (th(cfg) / 2);
	const [gx, gy] = desgirarVetor((u + v) / 2, (v - u) / 2, cfg);
	return Math.atan2(gy, gx);
}

export interface ItemDeCena {
	id: string;
	x: number;
	y: number;
	/** quadrados de lado (token 1, 3, 6 ou 10; objeto, o espaço que ocupa) */
	tamanho?: number;
	/** elevação em metros */
	z?: number;
}

/**
 * Do que está mais atrás para o que está mais à frente, para pintar nessa ordem. A chave é a do quadrado do espaço mais
 * próximo da câmera (a soma das coordenadas da grade girada); empate resolve por elevação e depois pelo id, para a
 * ordem nunca tremer entre um desenho e outro.
 */
export function ordemDePintura<T extends ItemDeCena>(itens: ReadonlyArray<T>, cfg: CfgIso): T[] {
	const chave = (t: T) => {
		const n = t.tamanho ?? 1;
		const [ax, ay] = girar(t.x, t.y, cfg);
		const [bx, by] = girar(t.x + n, t.y + n, cfg);
		return Math.max(ax, bx) + Math.max(ay, by);
	};
	return itens
		.map((t) => ({ t, k: chave(t) }))
		.sort((a, b) => a.k - b.k || (a.t.z ?? 0) - (b.t.z ?? 0) || (a.t.id < b.t.id ? -1 : a.t.id > b.t.id ? 1 : 0))
		.map((e) => e.t);
}

/**
 * A caixa da tela que cobre a cena inteira (os 4 cantos do losango do mapa), com folga em volta e espaço em cima para
 * quem fica em pé (sprite de token e de objeto) ou sobe de elevação.
 */
export function caixaDaCena(cfg: CfgIso, folga = cfg.tw / 2, alturaExtra = cfg.tw): { x: number; y: number; w: number; h: number } {
	const cantos = [projetar(0, 0, 0, cfg), projetar(cfg.L, 0, 0, cfg), projetar(cfg.L, cfg.A, 0, cfg), projetar(0, cfg.A, 0, cfg)];
	const xs = cantos.map((c) => c[0]);
	const ys = cantos.map((c) => c[1]);
	const x = Math.min(...xs) - folga;
	const y = Math.min(...ys) - folga - alturaExtra;
	return { x, y, w: Math.max(...xs) + folga - x, h: Math.max(...ys) + folga - y };
}
