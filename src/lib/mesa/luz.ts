// Luz dinâmica da Mesa: paredes, portas e janelas (desenhadas pelo Mestre ou vindas de um mapa .uvtt), fontes de luz no
// mapa e a luz que cada token carrega. Daqui saem o que corta a visão e o passo, o que cada um enxerga agora e os
// quadrados que isso revela: a memória do grupo fica nos quadrados revelados da névoa, que o Mestre ainda pode pintar.
//
// O nível de luz da cena muda o que se vê: no claro, tudo o que a visão alcança (as paredes cortam); na penumbra,
// também, mas esmaecido fora das luzes; no escuro, só o que uma luz ilumina (e o próprio corpo, de perto).
import { dentro, poligonoVisao, rasterizar, type Caixa, type Ponto, type Segmento } from './visao.ts';

/** 0 parede, 1 porta fechada, 2 porta aberta, 3 porta trancada (só o Mestre abre), 4 janela (vê e passa). */
export type TipoParede = 0 | 1 | 2 | 3 | 4;
export type Parede = [number, number, number, number, TipoParede];
export interface Luz {
	id: string;
	x: number;
	y: number;
	/** metros de luz plena e, depois dela, de penumbra */
	plena: number;
	penumbra: number;
	acesa: boolean;
}
export interface LuzToken {
	plena: number;
	penumbra: number;
}
export type Ambiente = 'claro' | 'penumbra' | 'escuro';

export const AMBIENTES: { id: Ambiente; nome: string; dica: string }[] = [
	{ id: 'claro', nome: 'Claro', dica: 'Dia ou sala iluminada: vê-se tudo o que as paredes deixam.' },
	{ id: 'penumbra', nome: 'Penumbra', dica: 'Luar, crepúsculo: vê-se tudo, esmaecido fora das luzes.' },
	{ id: 'escuro', nome: 'Escuro', dica: 'Caverna, noite sem lua: só se vê o que uma luz ilumina.' }
];

/** As fontes prontas (luz plena + penumbra, em metros). */
export const FONTES_DE_LUZ: { id: string; nome: string; plena: number; penumbra: number }[] = [
	{ id: 'vela', nome: 'Vela', plena: 1, penumbra: 2 },
	{ id: 'tocha', nome: 'Tocha', plena: 6, penumbra: 6 },
	{ id: 'lampiao', nome: 'Lampião', plena: 9, penumbra: 9 },
	{ id: 'fogueira', nome: 'Fogueira', plena: 6, penumbra: 12 }
];

export const ehPorta = (t: number) => t === 1 || t === 2 || t === 3;
export const cortaVisao = (t: number) => t === 0 || t === 1 || t === 3;
/** O que barra o passo: parede e porta fechada ou trancada (a aberta e a janela deixam passar). */
export const cortaPasso = (t: number) => t === 0 || t === 1 || t === 3;

const r2 = (v: number) => Math.round(v * 100) / 100;
const numero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** O banco tem as mesmas contas (mesa_cenas_paredes_check e mesa_cenas_luzes_check). */
const MAX_PAREDES = 20000;
const MAX_LUZES = 2000;

/** Só o que o banco aceita: paredes com pontas dentro da cena (com folga de 1 m), tamanho > 0 e tipo de 0 a 4. */
export function limparParedes(v: unknown, L: number, A: number): Parede[] {
	if (!Array.isArray(v)) return [];
	const saida: Parede[] = [];
	for (const p of v) {
		if (!Array.isArray(p) || p.length !== 5 || !p.every(numero)) continue;
		const [x1, y1, x2, y2, t] = p as number[];
		if (!Number.isInteger(t) || t < 0 || t > 4) continue;
		if ([x1, x2].some((x) => x < -1 || x > L + 1) || [y1, y2].some((y) => y < -1 || y > A + 1)) continue;
		if (Math.hypot(x2 - x1, y2 - y1) < 0.05) continue;
		saida.push([r2(x1), r2(y1), r2(x2), r2(y2), t as TipoParede]);
	}
	return saida.slice(0, MAX_PAREDES);
}

export function limparLuzes(v: unknown): Luz[] {
	if (!Array.isArray(v)) return [];
	return v
		.filter((l): l is Luz => !!l && typeof l === 'object' && typeof l.id === 'string' && [l.x, l.y, l.plena, l.penumbra].every(numero))
		.map((l) => ({ id: l.id, x: r2(l.x), y: r2(l.y), plena: Math.min(60, Math.max(0, r2(l.plena))), penumbra: Math.min(60, Math.max(0, r2(l.penumbra))), acesa: l.acesa !== false }))
		.slice(0, MAX_LUZES);
}

/** A luz do token, se houver uma de verdade. */
export const luzDoToken = (v: unknown): LuzToken | null =>
	v && typeof v === 'object' && numero((v as LuzToken).plena) && numero((v as LuzToken).penumbra) && (v as LuzToken).plena + (v as LuzToken).penumbra > 0 ? (v as LuzToken) : null;

// folga para "na mesma reta" (as pontas gravadas são arredondadas a 1 cm)
const NA_RETA = 0.06;
const efetivas = new WeakMap<readonly Parede[], readonly Parede[]>();
/**
 * A porta e a janela traçadas por cima de uma parede tomam o lugar daquele trecho: na conta, a parede fica cortada ali. O
 * que está gravado não muda (apagar a porta devolve a parede inteira).
 */
export function paredesEfetivas(paredes: readonly Parede[]): readonly Parede[] {
	const pronta = efetivas.get(paredes);
	if (pronta) return pronta;
	const vaos = paredes.filter((p) => p[4] !== 0);
	let saida: readonly Parede[] = paredes;
	if (vaos.length) {
		const lista: Parede[] = [];
		for (const p of paredes) {
			const [x1, y1, x2, y2] = p;
			const [dx, dy] = [x2 - x1, y2 - y1];
			const l2 = dx * dx + dy * dy;
			const naReta = (x: number, y: number) => Math.abs((x - x1) * dy - (y - y1) * dx) / Math.sqrt(l2) <= NA_RETA;
			// os trechos da parede (de 0 a 1) cobertos por portas e janelas na mesma reta
			const cortes: [number, number][] = [];
			if (p[4] === 0 && l2 > 0)
				for (const v of vaos) {
					if (!naReta(v[0], v[1]) || !naReta(v[2], v[3])) continue;
					const a = ((v[0] - x1) * dx + (v[1] - y1) * dy) / l2;
					const b = ((v[2] - x1) * dx + (v[3] - y1) * dy) / l2;
					const [i0, i1] = [Math.max(0, Math.min(a, b)), Math.min(1, Math.max(a, b))];
					if (i1 - i0 > 1e-6) cortes.push([i0, i1]);
				}
			if (!cortes.length) {
				lista.push(p);
				continue;
			}
			cortes.sort((a, b) => a[0] - b[0]);
			let k = 0;
			for (const [i0, i1] of cortes) {
				if (i0 > k + 1e-6) lista.push([x1 + dx * k, y1 + dy * k, x1 + dx * i0, y1 + dy * i0, 0]);
				k = Math.max(k, i1);
			}
			if (k < 1 - 1e-6) lista.push([x1 + dx * k, y1 + dy * k, x2, y2, 0]);
		}
		saida = lista;
	}
	efetivas.set(paredes, saida);
	return saida;
}

export const segmentosDeVisao = (paredes: readonly Parede[]): Segmento[] => paredesEfetivas(paredes).filter((p) => cortaVisao(p[4])).map((p) => [p[0], p[1], p[2], p[3]]);

/** De que lado de p→q fica r: 1, −1 ou 0 (na mesma reta). */
const orientacao = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) => {
	const v = (qx - px) * (ry - py) - (qy - py) * (rx - px);
	return Math.abs(v) < 1e-9 ? 0 : Math.sign(v);
};
/** r, na mesma reta de p→q, cai dentro do trecho? */
const noTrecho = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) =>
	Math.min(px, qx) - 1e-9 <= rx && rx <= Math.max(px, qx) + 1e-9 && Math.min(py, qy) - 1e-9 <= ry && ry <= Math.max(py, qy) + 1e-9;
/** Os segmentos (a, b) e (c, d) se cruzam (encostar conta)? */
function cruzam(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): boolean {
	const o1 = orientacao(ax, ay, bx, by, cx, cy);
	const o2 = orientacao(ax, ay, bx, by, dx, dy);
	const o3 = orientacao(cx, cy, dx, dy, ax, ay);
	const o4 = orientacao(cx, cy, dx, dy, bx, by);
	if (o1 !== o2 && o3 !== o4) return true;
	return (o1 === 0 && noTrecho(ax, ay, bx, by, cx, cy)) || (o2 === 0 && noTrecho(ax, ay, bx, by, dx, dy)) || (o3 === 0 && noTrecho(cx, cy, dx, dy, ax, ay)) || (o4 === 0 && noTrecho(cx, cy, dx, dy, bx, by));
}

/** O passo de (x0, y0) a (x1, y1) atravessa uma parede ou uma porta fechada? */
export const bloqueiaPasso = (paredes: readonly Parede[], x0: number, y0: number, x1: number, y1: number) =>
	paredesEfetivas(paredes).some((p) => cortaPasso(p[4]) && cruzam(x0, y0, x1, y1, p[0], p[1], p[2], p[3]));

export const deslocarParedes = (paredes: readonly Parede[], dx: number, dy: number): Parede[] => paredes.map(([x1, y1, x2, y2, t]) => [r2(x1 + dx), r2(y1 + dy), r2(x2 + dx), r2(y2 + dy), t]);
export const deslocarLuzes = (luzes: readonly Luz[], dx: number, dy: number): Luz[] => luzes.map((l) => ({ ...l, x: r2(l.x + dx), y: r2(l.y + dy) }));

/**
 * A ponta de parede sob o ponteiro: uma ponta que já existe a até `raio` (as paredes se emendam), senão o canto de quadrado
 * mais perto; `livre` (Shift) larga onde está.
 */
export function encaixar(x: number, y: number, paredes: readonly Parede[], raio: number, livre: boolean): Ponto {
	let melhor: Ponto | null = null;
	let d = raio;
	for (const p of paredes)
		for (let k = 0; k < 4; k += 2) {
			const dd = Math.hypot(p[k] - x, p[k + 1] - y);
			if (dd <= d) [d, melhor] = [dd, [p[k], p[k + 1]]];
		}
	if (melhor) return melhor;
	return livre ? [r2(x), r2(y)] : [Math.round(x), Math.round(y)];
}

/** Distância do ponto ao segmento. */
export function distanciaAoSegmento(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const l = dx * dx + dy * dy || 1;
	const k = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l));
	return Math.hypot(px - (x1 + k * dx), py - (y1 + k * dy));
}

/** O índice da parede mais perto de (x, y), a até `raio` (ou −1). */
export function paredeEm(paredes: readonly Parede[], x: number, y: number, raio: number, filtro?: (p: Parede) => boolean): number {
	let melhor = -1;
	let d = raio;
	paredes.forEach((p, i) => {
		if (filtro && !filtro(p)) return;
		const dd = distanciaAoSegmento(x, y, p[0], p[1], p[2], p[3]);
		if (dd <= d) [d, melhor] = [dd, i];
	});
	return melhor;
}

/** O meio da parede (onde fica o marcador da porta). */
export const meioDaParede = (p: Parede): Ponto => [(p[0] + p[2]) / 2, (p[1] + p[3]) / 2];

// ------------------------------------------------------------------ o que cada um enxerga
export interface Observador {
	x: number;
	y: number;
	/** o próprio corpo: mesmo no escuro, quem olha se vê até esse raio */
	corpo: number;
	/** as paredes que param este olhar, quando não são as da cena: quem está num telhado vê por cima do que é mais baixo */
	paredes?: readonly Parede[];
}
export interface FonteAcesa {
	x: number;
	y: number;
	plena: number;
	penumbra: number;
	poligono: Ponto[];
}
export interface Visao {
	/** o que cada observador alcança com os olhos (as paredes cortam) */
	vistas: Ponto[][];
	/** as luzes acesas, cada uma até onde as paredes deixam ela chegar */
	fontes: FonteAcesa[];
	/** um ponto da grade está à vista agora (alcançado e, no escuro, iluminado)? */
	visivel: (x: number, y: number) => boolean;
}
export interface EntradaVisao {
	L: number;
	A: number;
	paredes: readonly Parede[];
	ambiente: Ambiente;
	luzes: readonly { x: number; y: number; plena: number; penumbra: number }[];
	observadores: readonly Observador[];
	/** Os quadrados de escuridão (y × L + x): neles só se vê com luz, como no ambiente escuro. */
	escuro?: ReadonlySet<number>;
}

/** Guarda os polígonos já calculados (por posição), enquanto as paredes não mudam: arrastar um token não refaz os outros. */
export class CacheVisao {
	private paredes: readonly Parede[] | null = null;
	private segs: Segmento[] = [];
	private mapa = new Map<string, Ponto[]>();
	private outros = new Map<readonly Parede[], CacheVisao>();
	/** O guardado de quem olha por outras paredes (poucas listas: uma por altura). */
	de(paredes: readonly Parede[]) {
		let c = this.outros.get(paredes);
		if (!c) {
			if (this.outros.size > 16) this.outros.clear();
			c = new CacheVisao();
			this.outros.set(paredes, c);
		}
		return c;
	}
	segmentos(paredes: readonly Parede[]) {
		if (paredes !== this.paredes) {
			this.paredes = paredes;
			this.segs = segmentosDeVisao(paredes);
			this.mapa.clear();
		}
		return this.segs;
	}
	poligono(x: number, y: number, caixa: Caixa, segs: Segmento[]) {
		const chave = `${x},${y},${caixa.x0},${caixa.y0},${caixa.x1},${caixa.y1}`;
		let p = this.mapa.get(chave);
		if (!p) {
			p = poligonoVisao(x, y, segs, caixa);
			if (this.mapa.size > 400) this.mapa.clear();
			this.mapa.set(chave, p);
		}
		return p;
	}
}

// um nada fora do centro: o olho nunca cai exatamente numa linha da grade (onde as paredes costumam estar)
const DESLOCAMENTO = 0.0013;
/** Uma cena até este tamanho é vista de ponta a ponta. */
const CENA_SEM_HORIZONTE = 320;
/** Numa maior, até onde vai o olhar, em metros: a conta da visão fica do tamanho do que está em volta, e não do mapa. */
export const ALCANCE_DO_OLHAR = 160;

export function calcularVisao(e: EntradaVisao, cache = new CacheVisao()): Visao {
	const segs = cache.segmentos(e.paredes);
	const cena: Caixa = { x0: 0, y0: 0, x1: e.L, y1: e.A };
	const noLimite = (v: number, max: number) => Math.min(max - DESLOCAMENTO, Math.max(DESLOCAMENTO, v + DESLOCAMENTO));
	const horizonte = Math.max(e.L, e.A) > CENA_SEM_HORIZONTE ? ALCANCE_DO_OLHAR : Infinity;
	const emVolta = (x: number, y: number): Caixa =>
		horizonte === Infinity ? cena : { x0: Math.max(0, x - horizonte), y0: Math.max(0, y - horizonte), x1: Math.min(e.L, x + horizonte), y1: Math.min(e.A, y + horizonte) };
	const vistas = e.observadores.map((o) => {
		const proprio = o.paredes ? cache.de(o.paredes) : null;
		const [x, y] = [noLimite(o.x, e.L), noLimite(o.y, e.A)];
		return (proprio ?? cache).poligono(x, y, emVolta(x, y), proprio ? proprio.segmentos(o.paredes!) : segs);
	});
	const fontes: FonteAcesa[] = [];
	const comEscuro = !!e.escuro?.size;
	if (e.ambiente !== 'claro' || comEscuro) {
		const acender = (x: number, y: number, plena: number, penumbra: number) => {
			const r = plena + penumbra;
			if (r <= 0) return;
			// a luz que ninguém alcança ver fica fora da conta
			if (horizonte !== Infinity && !e.observadores.some((o) => Math.max(Math.abs(o.x - x), Math.abs(o.y - y)) <= horizonte + r)) return;
			const [lx, ly] = [noLimite(x, e.L), noLimite(y, e.A)];
			const caixa = { x0: Math.max(0, lx - r), y0: Math.max(0, ly - r), x1: Math.min(e.L, lx + r), y1: Math.min(e.A, ly + r) };
			fontes.push({ x: lx, y: ly, plena, penumbra, poligono: cache.poligono(lx, ly, caixa, segs) });
		};
		for (const l of e.luzes) acender(l.x, l.y, l.plena, l.penumbra);
		// no escuro, cada um ainda se vê (e ao chão em volta), de perto
		if (e.ambiente === 'escuro' || comEscuro) for (const o of e.observadores) acender(o.x, o.y, o.corpo, 0.5);
	}
	const alcancado = (x: number, y: number) => vistas.some((v) => dentro(v, x, y));
	const iluminado = (x: number, y: number) => fontes.some((f) => Math.hypot(x - f.x, y - f.y) <= f.plena + f.penumbra && dentro(f.poligono, x, y));
	const precisaLuz = (x: number, y: number) => e.ambiente === 'escuro' || (comEscuro && e.escuro!.has(Math.floor(y) * e.L + Math.floor(x)));
	return { vistas, fontes, visivel: (x, y) => alcancado(x, y) && (!precisaLuz(x, y) || iluminado(x, y)) };
}

/**
 * Marca na grade da névoa (L × A, 1 = revelado) o que os observadores veem agora: no escuro, só o que está iluminado.
 * Devolve se revelou algo novo.
 */
export function explorar(e: EntradaVisao, grade: Uint8Array, cache = new CacheVisao()): boolean {
	const v = calcularVisao(e, cache);
	let teste: ((cx: number, cy: number, i: number) => boolean) | undefined;
	if (e.ambiente === 'escuro' || e.escuro?.size) {
		const luz = new Uint8Array(e.L * e.A);
		for (const f of v.fontes) {
			const r = f.plena + f.penumbra;
			rasterizar(f.poligono, e.L, e.A, luz, (cx, cy) => Math.hypot(cx - f.x, cy - f.y) <= r);
		}
		const tudo = e.ambiente === 'escuro';
		teste = (_cx, _cy, i) => luz[i] === 1 || (!tudo && !e.escuro!.has(i));
	}
	let mudou = false;
	for (const p of v.vistas) mudou = rasterizar(p, e.L, e.A, grade, teste) || mudou;
	return mudou;
}
