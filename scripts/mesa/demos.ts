// Gera as cenas de demonstração da luz dinâmica: três mapas, cada um na vista de cima e na isométrica. A planta de cada
// mapa (salas, portas, janelas, pilares, luzes) desenha a arte em pixel art e também dá as paredes e as luzes da cena,
// então tudo bate pixel a pixel. Saída: static/mesa/demos/*.png (arte e miniatura) e src/lib/mesa/demos.json.
//   npx tsx scripts/mesa/demos.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// ------------------------------------------------------------------ png
const CRC = (() => {
	const t = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[n] = c >>> 0;
	}
	return t;
})();
function crc32(b: Uint8Array) {
	let c = 0xffffffff;
	for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}
function bloco(tipo: string, dados: Uint8Array) {
	const b = new Uint8Array(12 + dados.length);
	const v = new DataView(b.buffer);
	v.setUint32(0, dados.length);
	b.set(Buffer.from(tipo, 'ascii'), 4);
	b.set(dados, 8);
	v.setUint32(8 + dados.length, crc32(b.subarray(4, 8 + dados.length)));
	return b;
}
function png(w: number, h: number, px: Uint8ClampedArray): Buffer {
	const ihdr = new Uint8Array(13);
	const v = new DataView(ihdr.buffer);
	v.setUint32(0, w);
	v.setUint32(4, h);
	ihdr.set([8, 6, 0, 0, 0], 8);
	const cru = new Uint8Array((w * 4 + 1) * h);
	for (let y = 0; y < h; y++) cru.set(px.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
	return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('IDAT', deflateSync(cru, { level: 9 })), bloco('IEND', new Uint8Array())]);
}

// ------------------------------------------------------------------ tela e cor
type Cor = [number, number, number];
const hex = (h: string): Cor => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const clar = (c: Cor, d: number): Cor => (d >= 0 ? (c.map((v) => v + (255 - v) * d) as Cor) : (c.map((v) => v * (1 + d)) as Cor));
const misturar = (a: Cor, b: Cor, t: number): Cor => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** ruído estável por posição */
function ru(x: number, y: number, s = 0) {
	let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s, 2147483647)) | 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** ruído suave (interpolado numa grade de `passo` pixels): manchas de musgo, nuvens na rocha */
function suave(x: number, y: number, passo: number, s: number) {
	const gx = x / passo;
	const gy = y / passo;
	const [x0, y0] = [Math.floor(gx), Math.floor(gy)];
	const [fx, fy] = [gx - x0, gy - y0].map((v) => v * v * (3 - 2 * v));
	const a = ru(x0, y0, s) + (ru(x0 + 1, y0, s) - ru(x0, y0, s)) * fx;
	const b = ru(x0, y0 + 1, s) + (ru(x0 + 1, y0 + 1, s) - ru(x0, y0 + 1, s)) * fx;
	return a + (b - a) * fy;
}

class Tela {
	px: Uint8ClampedArray;
	constructor(
		public w: number,
		public h: number
	) {
		this.px = new Uint8ClampedArray(w * h * 4);
	}
	pt(x: number, y: number, c: Cor, a = 1) {
		x |= 0;
		y |= 0;
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
		const i = (y * this.w + x) * 4;
		const b = this.px[i + 3] / 255;
		const oa = a + b * (1 - a);
		if (oa <= 0) return;
		for (let k = 0; k < 3; k++) this.px[i + k] = (c[k] * a + this.px[i + k] * b * (1 - a)) / oa;
		this.px[i + 3] = oa * 255;
	}
	ler(x: number, y: number): [number, number, number, number] {
		const i = ((y | 0) * this.w + (x | 0)) * 4;
		return [this.px[i], this.px[i + 1], this.px[i + 2], this.px[i + 3]];
	}
	somar(x: number, y: number, c: Cor, k: number) {
		x |= 0;
		y |= 0;
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
		const i = (y * this.w + x) * 4;
		if (!this.px[i + 3]) return;
		for (let j = 0; j < 3; j++) this.px[i + j] = this.px[i + j] + c[j] * k;
	}
	escurecer(x: number, y: number, f: number) {
		const i = ((y | 0) * this.w + (x | 0)) * 4;
		for (let j = 0; j < 3; j++) this.px[i + j] *= f;
	}
	ret(x: number, y: number, w: number, h: number, c: Cor | ((x: number, y: number) => Cor), a = 1) {
		for (let j = Math.max(0, Math.floor(y)); j < Math.min(this.h, Math.ceil(y + h)); j++)
			for (let i = Math.max(0, Math.floor(x)); i < Math.min(this.w, Math.ceil(x + w)); i++) this.pt(i, j, typeof c === 'function' ? c(i, j) : c, a);
	}
	disco(cx: number, cy: number, r: number, c: Cor | ((x: number, y: number, d: number) => Cor), a = 1, ry = r) {
		for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++)
			for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
				const d = Math.hypot((i + 0.5 - cx) / r, (j + 0.5 - cy) / ry);
				if (d <= 1) this.pt(i, j, typeof c === 'function' ? c(i, j, d) : c, a);
			}
	}
	/** polígono convexo ou não (regra par-ímpar), com a cor de cada pixel */
	poli(p: [number, number][], c: Cor | ((x: number, y: number) => Cor), a = 1) {
		const ys = p.map((q) => q[1]);
		for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(this.h - 1, Math.ceil(Math.max(...ys))); y++) {
			const cy = y + 0.5;
			const xs: number[] = [];
			for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
				const [xi, yi] = p[i];
				const [xj, yj] = p[j];
				if (yi > cy !== yj > cy) xs.push(xi + ((cy - yi) * (xj - xi)) / (yj - yi));
			}
			xs.sort((m, n) => m - n);
			for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.pt(x, y, typeof c === 'function' ? c(x, y) : c, a);
		}
	}
	brilho(cx: number, cy: number, r: number, c: Cor, k: number, ry = r) {
		for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++)
			for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
				const d = Math.hypot((i - cx) / r, (j - cy) / ry);
				if (d < 1) this.somar(i, j, c, k * (1 - d) * (1 - d));
			}
	}
	reduzir(lado: number): Tela {
		const f = Math.max(this.w, this.h) / lado;
		const t = new Tela(Math.round(this.w / f), Math.round(this.h / f));
		for (let y = 0; y < t.h; y++)
			for (let x = 0; x < t.w; x++) {
				const s = [0, 0, 0, 0];
				let n = 0;
				for (let j = Math.floor(y * f); j < Math.floor((y + 1) * f); j++)
					for (let i = Math.floor(x * f); i < Math.floor((x + 1) * f); i++) {
						const p = this.ler(i, j);
						for (let k = 0; k < 3; k++) s[k] += p[k] * p[3];
						s[3] += p[3];
						n++;
					}
				const i = (y * t.w + x) * 4;
				if (s[3]) for (let k = 0; k < 3; k++) t.px[i + k] = s[k] / s[3];
				t.px[i + 3] = s[3] / n;
			}
		return t;
	}
}

// ------------------------------------------------------------------ planta
// '#' parede, ' ' rocha (maciço), '.' piso, ',' segundo piso, 'k' tatame, '"' grama, '~' água, 'D' porta fechada,
// 'd' porta aberta, 'L' porta trancada, 'W' janela, 'O' pilar, 'Y' árvore, 'b' braseiro, 'T' tocha na parede,
// 'l' lanterna de pedra, 'r' entulho, 't' mesa ou caixotes
type Planta = string[][];
const MACICO = new Set(['#', ' ', 'O', 'Y', 'T']);
const PAREDE = new Set(['#', 'T', 'W']);
const PORTA = new Set(['D', 'd', 'L']);
function planta(L: number, A: number, fundo: string): Planta {
	return Array.from({ length: A }, () => Array.from({ length: L }, () => fundo));
}
function sala(p: Planta, x0: number, y0: number, x1: number, y1: number, piso = '.') {
	for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) p[y][x] = x === x0 || x === x1 || y === y0 || y === y1 ? '#' : piso;
}
function area(p: Planta, x0: number, y0: number, x1: number, y1: number, c: string) {
	for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) p[y][x] = c;
}
const por = (p: Planta, lista: [number, number][], c: string) => lista.forEach(([x, y]) => (p[y][x] = c));
const em = (p: Planta, x: number, y: number) => (y < 0 || y >= p.length || x < 0 || x >= p[0].length ? null : p[y][x]);
const macico = (c: string | null) => c !== null && MACICO.has(c);
/** porta, janela: deitada (paredes à esquerda e à direita) ou de pé */
const deitada = (p: Planta, x: number, y: number) => macico(em(p, x - 1, y)) || PAREDE.has(em(p, x - 1, y) ?? '') || PAREDE.has(em(p, x + 1, y) ?? '');

/** As paredes da cena: as bordas entre maciço e chão (emendadas em trechos longos), mais portas e janelas pelo meio. */
function paredesDa(p: Planta): number[][] {
	const A = p.length;
	const L = p[0].length;
	const ocupa = (x: number, y: number) => {
		const c = em(p, x, y);
		return c !== null && (MACICO.has(c) || PAREDE.has(c)) && c !== 'W';
	};
	const h = new Map<number, number[]>();
	const v = new Map<number, number[]>();
	const marcar = (m: Map<number, number[]>, linha: number, k: number) => (m.get(linha) ?? m.set(linha, []).get(linha)!).push(k);
	for (let y = 0; y < A; y++)
		for (let x = 0; x < L; x++) {
			if (!ocupa(x, y)) continue;
			if (y > 0 && !ocupa(x, y - 1)) marcar(h, y, x);
			if (y < A - 1 && !ocupa(x, y + 1)) marcar(h, y + 1, x);
			if (x > 0 && !ocupa(x - 1, y)) marcar(v, x, y);
			if (x < L - 1 && !ocupa(x + 1, y)) marcar(v, x + 1, y);
		}
	const saida: number[][] = [];
	const emendar = (m: Map<number, number[]>, deitado: boolean) => {
		for (const [linha, ks] of m) {
			const o = [...new Set(ks)].sort((a, b) => a - b);
			let ini = o[0];
			for (let i = 1; i <= o.length; i++) {
				if (i < o.length && o[i] === o[i - 1] + 1) continue;
				const fim = o[i - 1] + 1;
				saida.push(deitado ? [ini, linha, fim, linha, 0] : [linha, ini, linha, fim, 0]);
				ini = o[i];
			}
		}
	};
	emendar(h, true);
	emendar(v, false);
	for (let y = 0; y < A; y++)
		for (let x = 0; x < L; x++) {
			const c = p[y][x];
			if (!PORTA.has(c) && c !== 'W') continue;
			const t = c === 'D' ? 1 : c === 'd' ? 2 : c === 'L' ? 3 : 4;
			saida.push(deitada(p, x, y) ? [x, y + 0.5, x + 1, y + 0.5, t] : [x + 0.5, y, x + 0.5, y + 1, t]);
		}
	return saida;
}

/** Luz plena e penumbra de cada coisa que ilumina. */
const LUZES: Record<string, [number, number]> = { b: [3, 4], T: [2, 4], l: [2, 4] };
function luzesDa(p: Planta): { id: string; x: number; y: number; plena: number; penumbra: number; acesa: boolean }[] {
	const saida: { id: string; x: number; y: number; plena: number; penumbra: number; acesa: boolean }[] = [];
	p.forEach((linha, y) =>
		linha.forEach((c, x) => {
			const l = LUZES[c];
			if (!l) return;
			let [lx, ly] = [x + 0.5, y + 0.5];
			// a tocha fica na parede, virada para o chão: a luz sai do lado do chão
			if (c === 'T') {
				const lado = ([[0, 1], [0, -1], [1, 0], [-1, 0]] as const).find(([dx, dy]) => !macico(em(p, x + dx, y + dy)) && !PAREDE.has(em(p, x + dx, y + dy) ?? '#'));
				if (lado) [lx, ly] = [x + 0.5 + lado[0] * 0.85, y + 0.5 + lado[1] * 0.85];
			}
			saida.push({ id: `${c}${x}-${y}`, x: lx, y: ly, plena: l[0], penumbra: l[1], acesa: true });
		})
	);
	return saida;
}

// ------------------------------------------------------------------ temas
interface Tema {
	piso: Cor;
	piso2: Cor;
	tatame: Cor;
	grama: Cor;
	agua: Cor;
	rocha: Cor;
	topo: Cor;
	face: Cor;
	madeira: Cor;
	tipoPiso: 'pedra' | 'arenito' | 'tabua';
	tipoPiso2: 'tapete' | 'musgo' | 'cascalho';
	portaPapel?: boolean;
}
const TEMAS: Record<string, Tema> = {
	serpente: { piso: hex('#4a4652'), piso2: hex('#6d1f24'), tatame: hex('#b8a66c'), grama: hex('#3f5a32'), agua: hex('#24485a'), rocha: hex('#16131b'), topo: hex('#2b2533'), face: hex('#544a5c'), madeira: hex('#5e4029'), tipoPiso: 'pedra', tipoPiso2: 'tapete' },
	templo: { piso: hex('#a08c66'), piso2: hex('#8a8a5a'), tatame: hex('#b8a66c'), grama: hex('#557a37'), agua: hex('#3b6f88'), rocha: hex('#2a2620'), topo: hex('#6b5f4c'), face: hex('#8f7f63'), madeira: hex('#6e4a2c'), tipoPiso: 'arenito', tipoPiso2: 'musgo' },
	cha: { piso: hex('#8c5e3a'), piso2: hex('#b7ab92'), tatame: hex('#c9b87a'), grama: hex('#5b8a3a'), agua: hex('#3e7896'), rocha: hex('#2a2620'), topo: hex('#3b2a1f'), face: hex('#e8dfc6'), madeira: hex('#7a5232'), tipoPiso: 'tabua', tipoPiso2: 'cascalho', portaPapel: true }
};

// ------------------------------------------------------------------ vista de cima
const P = 32;
/** A cor do chão de um pixel (x, y em pixels do mapa), pelo tipo do chão. */
function chao(t: Tema, c: string, x: number, y: number): Cor {
	const cx = Math.floor(x / P);
	const cy = Math.floor(y / P);
	const lx = x - cx * P;
	const ly = y - cy * P;
	const n = (ru(x, y, 3) - 0.5) * 0.07;
	if (c === '"') {
		const fio = ru(x, y >> 1, 7) > 0.86 ? 0.12 : ru(x, y, 8) > 0.93 ? -0.12 : 0;
		return clar(t.grama, n * 1.6 + fio + (ru(cx, cy, 9) - 0.5) * 0.06);
	}
	if (c === '~') {
		const onda = Math.sin(x * 0.35 + Math.sin(y * 0.2) * 2) > 0.92 ? 0.25 : 0;
		return clar(t.agua, n + onda);
	}
	if (c === 'k') {
		// tatame: tramas finas e a faixa escura em volta de cada esteira (de 1 × 2 quadrados)
		const vertical = (cx + cy) % 2 === 0;
		const borda = lx < 2 || ly < 2 || (vertical ? ly > P - 3 && cy % 2 : lx > P - 3 && cx % 2);
		if (borda) return clar(hex('#2f3a24'), n);
		return clar(t.tatame, n * 0.6 + ((vertical ? lx : ly) % 2 ? -0.04 : 0.02));
	}
	if (c === ',') {
		if (t.tipoPiso2 === 'tapete') {
			const borda = lx < 3 || lx > P - 4;
			return borda ? clar(hex('#b08a2e'), n) : clar(t.piso2, n + ((lx + ly) % 6 === 0 ? 0.06 : 0));
		}
		if (t.tipoPiso2 === 'musgo') {
			const m = suave(x, y, 14, 11) * 0.7 + suave(x, y, 5, 12) * 0.3;
			return m > 0.56 ? clar(hex('#5f7a3e'), n + (m - 0.56) * 0.6) : m > 0.5 ? misturar(chao(t, '.', x, y), hex('#5f7a3e'), 0.45) : chao(t, '.', x, y);
		}
		const pedra = ru(x >> 1, y >> 1, 13);
		return clar(t.piso2, n * 1.4 + (pedra > 0.85 ? -0.16 : pedra < 0.1 ? 0.12 : 0));
	}
	if (c === ' ') return clar(t.rocha, n * 0.6 + (suave(x, y, 12, 14) - 0.5) * 0.08 + (ru(x >> 1, y >> 1, 14) > 0.97 ? 0.03 : 0));
	// piso principal
	if (t.tipoPiso === 'tabua') {
		const tab = Math.floor(y / 8);
		const fimTab = Math.floor((x + ru(tab, 0, 15) * 64) / 64);
		const junta = y % 8 === 0 || (x + Math.floor(ru(tab, 0, 15) * 64)) % 64 === 0;
		const veio = Math.sin(x * 0.18 + ru(tab, fimTab, 16) * 9) * 0.035;
		return clar(t.piso, junta ? -0.32 : n * 0.6 + veio + (ru(tab, fimTab, 17) - 0.5) * 0.1);
	}
	// pedra em lajes: uma laje por quadrado, com rejunte e bisel; o arenito tem lajes maiores e desencontradas
	const grande = t.tipoPiso === 'arenito';
	const lado = grande ? P * 2 : P;
	const ox = grande ? Math.floor(y / lado) % 2 ? P : 0 : 0;
	const qx = Math.floor((x + ox) / lado);
	const qy = Math.floor(y / lado);
	const ix = (x + ox) - qx * lado;
	const iy = y - qy * lado;
	if (ix === 0 || iy === 0) return clar(t.piso, -0.38);
	const bisel = ix === 1 || iy === 1 ? 0.07 : ix === lado - 1 || iy === lado - 1 ? -0.07 : 0;
	const trinca = ru(qx, qy, 18) > 0.7 && Math.abs(ix - iy * (0.6 + ru(qx, qy, 19))) < 0.8 && ix > 4 && ix < lado - 6 ? -0.2 : 0;
	return clar(t.piso, n + bisel + trinca + (ru(qx, qy, 20) - 0.5) * 0.12);
}
/** O chão debaixo de uma coisa (porta, pilar, braseiro, árvore...). */
function chaoDe(p: Planta, x: number, y: number): string {
	const c = p[y][x];
	if (c === 'Y' || c === 'l') {
		const viz = [em(p, x - 1, y), em(p, x + 1, y), em(p, x, y - 1), em(p, x, y + 1)];
		return viz.includes(',') && !viz.includes('"') ? ',' : '"';
	}
	if ('.,k"~ '.includes(c)) return c;
	// o piso que mais aparece em volta
	const viz = [em(p, x - 1, y), em(p, x + 1, y), em(p, x, y - 1), em(p, x, y + 1)].filter((v): v is string => !!v && '.,k"'.includes(v));
	return viz.sort((a, b) => viz.filter((v) => v === b).length - viz.filter((v) => v === a).length)[0] ?? '.';
}

function desenharTopo(p: Planta, t: Tema, comCoisas: boolean): Tela {
	const A = p.length;
	const L = p[0].length;
	const tela = new Tela(L * P, A * P);
	for (let y = 0; y < A; y++)
		for (let x = 0; x < L; x++) {
			const c = p[y][x];
			if (PAREDE.has(c) || c === ' ') {
				if (!comCoisas && c !== ' ') continue;
				if (c === ' ') {
					if (comCoisas) tela.ret(x * P, y * P, P, P, (i, j) => chao(t, ' ', i, j));
					continue;
				}
				continue;
			}
			const base = chaoDe(p, x, y);
			tela.ret(x * P, y * P, P, P, (i, j) => chao(t, base, i, j));
		}
	// sombra junto às paredes e aos maciços
	for (let y = 0; y < A; y++)
		for (let x = 0; x < L; x++) {
			const c = p[y][x];
			if (macico(c) || PAREDE.has(c)) continue;
			const ocupa = (dx: number, dy: number) => {
				const v = em(p, x + dx, y + dy);
				return v !== null && (MACICO.has(v) || PAREDE.has(v)) && v !== 'Y' && v !== 'O';
			};
			for (let j = 0; j < P; j++)
				for (let i = 0; i < P; i++) {
					let f = 1;
					if (ocupa(0, -1)) f *= 1 - 0.45 * Math.max(0, 1 - j / 10);
					if (ocupa(-1, 0)) f *= 1 - 0.3 * Math.max(0, 1 - i / 7);
					if (ocupa(1, 0)) f *= 1 - 0.3 * Math.max(0, 1 - (P - 1 - i) / 7);
					if (ocupa(0, 1)) f *= 1 - 0.2 * Math.max(0, 1 - (P - 1 - j) / 6);
					if (f < 1) tela.escurecer(x * P + i, y * P + j, f);
				}
		}
	if (!comCoisas) return tela;
	for (let y = 0; y < A; y++)
		for (let x = 0; x < L; x++) {
			const c = p[y][x];
			const X = x * P;
			const Y = y * P;
			if (PAREDE.has(c)) paredeTopo(tela, p, t, x, y);
			else if (c === 'O') {
				tela.disco(X + 19, Y + 19, 13, hex('#000000'), 0.35);
				tela.disco(X + 16, Y + 16, 13, (i, j, d) => clar(t.face, -0.25 + (1 - d) * 0.1));
				tela.disco(X + 16, Y + 16, 11, (i, j) => clar(t.face, 0.12 - ((i - X - 10) ** 2 + (j - Y - 10) ** 2) / 900 + (ru(i, j, 21) - 0.5) * 0.06));
			} else if (c === 'Y') {
				tela.disco(X + 19, Y + 20, 15, hex('#000000'), 0.3);
				tela.disco(X + 16, Y + 16, 4, hex('#5a3a22'));
				tela.disco(X + 16, Y + 14, 15, (i, j, d) => clar(hex('#2f5a2a'), (ru(i >> 1, j >> 1, 22) - 0.5) * 0.25 + (1 - d) * 0.12 - Math.max(0, j - Y - 14) / 60));
				for (let k = 0; k < 6; k++) tela.disco(X + 8 + ru(x, y, 30 + k) * 16, Y + 6 + ru(x, y, 40 + k) * 12, 3, hex('#5c8f3e'), 0.7);
			} else if (PORTA.has(c)) porta(tela, p, t, x, y, c);
			else if (c === 'b') {
				tela.disco(X + 18, Y + 18, 9, hex('#000000'), 0.3);
				tela.disco(X + 16, Y + 16, 9, hex('#2e2a2a'));
				tela.disco(X + 16, Y + 16, 7, hex('#4c4444'));
				tela.disco(X + 16, Y + 16, 5.5, hex('#e8692a'));
				tela.disco(X + 16, Y + 15, 3.5, hex('#ffb347'));
				tela.disco(X + 16, Y + 14, 1.8, hex('#fff1a8'));
			} else if (c === 'l') {
				tela.ret(X + 11, Y + 13, 12, 12, hex('#000000'), 0.3);
				tela.ret(X + 9, Y + 9, 14, 14, hex('#7d7a74'));
				tela.ret(X + 10, Y + 10, 12, 3, hex('#a19d96'));
				tela.ret(X + 13, Y + 14, 6, 5, hex('#ffd36b'));
			} else if (c === 'r') {
				for (let k = 0; k < 7; k++) {
					const [rx, ry, rr] = [X + 5 + ru(x, y, 50 + k) * 22, Y + 5 + ru(x, y, 60 + k) * 22, 1.8 + ru(x, y, 70 + k) * 2.8];
					tela.disco(rx + 1, ry + 1, rr, hex('#000000'), 0.35);
					tela.disco(rx, ry, rr, clar(t.face, -0.05 + ru(x, y, 80 + k) * 0.3));
				}
			} else if (c === 't') {
				tela.ret(X + 7, Y + 10, 20, 15, hex('#000000'), 0.3);
				tela.ret(X + 5, Y + 7, 22, 15, clar(t.madeira, 0));
				tela.ret(X + 5, Y + 7, 22, 2, clar(t.madeira, 0.18));
				tela.ret(X + 5, Y + 20, 22, 2, clar(t.madeira, -0.3));
				for (let i = X + 9; i < X + 27; i += 6) tela.ret(i, Y + 9, 1, 11, clar(t.madeira, -0.18));
			}
		}
	// o calor das luzes no chão
	for (const l of luzesDa(p)) tela.brilho(l.x * P, l.y * P, l.plena * P * 0.9, hex('#ff9a3c'), 0.22);
	return tela;
}

function paredeTopo(tela: Tela, p: Planta, t: Tema, x: number, y: number) {
	const X = x * P;
	const Y = y * P;
	const c = p[y][x];
	const chaoAbaixo = !macico(em(p, x, y + 1)) && !PAREDE.has(em(p, x, y + 1) ?? '#');
	const face = chaoAbaixo ? 14 : 0;
	tela.ret(X, Y, P, P - face, (i, j) => clar(t.topo, (ru(i, j, 23) - 0.5) * 0.08 + (ru(i >> 2, j >> 2, 24) - 0.5) * 0.06));
	if (!macico(em(p, x, y - 1)) && !PAREDE.has(em(p, x, y - 1) ?? '#')) tela.ret(X, Y, P, 2, clar(t.topo, 0.22));
	if (!macico(em(p, x - 1, y)) && !PAREDE.has(em(p, x - 1, y) ?? '#')) tela.ret(X, Y, 2, P - face, clar(t.topo, 0.12));
	if (!macico(em(p, x + 1, y)) && !PAREDE.has(em(p, x + 1, y) ?? '#')) tela.ret(X + P - 2, Y, 2, P - face, clar(t.topo, -0.25));
	if (face) {
		// a face da parede, de tijolos (ou de papel com ripas, na casa de chá)
		tela.ret(X, Y + P - face, P, face, (i, j) => {
			const fy = j - (Y + P - face);
			if (t.portaPapel) return (i - X) % 8 === 0 || fy === 0 || fy === face - 1 ? clar(t.madeira, -0.1) : clar(t.face, (ru(i, j, 25) - 0.5) * 0.04 - fy * 0.004);
			const fila = Math.floor(fy / 5);
			const junta = fy % 5 === 0 || (i - X + (fila % 2) * 6) % 12 === 0;
			return clar(t.face, junta ? -0.35 : (ru(i, j, 26) - 0.5) * 0.08 - fy * 0.01 + (ru(Math.floor((i + (fila % 2) * 6) / 12), fila + y * 9, 27) - 0.5) * 0.1);
		});
		tela.ret(X, Y + P - 1, P, 1, clar(t.face, -0.5));
	}
	if (c === 'W') {
		// janela: a fresta de vidro no meio da parede
		if (deitada(p, x, y)) tela.ret(X + 3, Y + 11, P - 6, 6, (i) => clar(hex('#8fc7dc'), (i - X) % 9 === 0 ? -0.3 : (i - X) % 9 < 3 ? 0.2 : 0));
		else tela.ret(X + 13, Y + 3, 6, P - 6, (_i, j) => clar(hex('#8fc7dc'), (j - Y) % 9 === 0 ? -0.3 : 0));
	}
	if (c === 'T') {
		// tocha: suporte de ferro e a chama no lado do chão
		const lado = ([[0, 1], [0, -1], [1, 0], [-1, 0]] as const).find(([dx, dy]) => !macico(em(p, x + dx, y + dy)) && !PAREDE.has(em(p, x + dx, y + dy) ?? '#')) ?? [0, 1];
		const fx = X + 16 + lado[0] * 11;
		const fy = Y + 16 + lado[1] * 11;
		tela.ret(fx - 1, fy - 2, 3, 7, hex('#3a3330'));
		tela.disco(fx, fy - 4, 3.5, hex('#e8692a'));
		tela.disco(fx, fy - 5, 2, hex('#ffd36b'));
	}
}

function porta(tela: Tela, p: Planta, t: Tema, x: number, y: number, c: string) {
	const X = x * P;
	const Y = y * P;
	const deit = deitada(p, x, y);
	const madeira = (i: number, j: number) => (t.portaPapel ? ((deit ? i - X : j - Y) % 8 === 0 ? clar(t.madeira, -0.2) : clar(t.face, -0.04)) : clar(t.madeira, ((deit ? i - X : j - Y) % 6 === 0 ? -0.3 : 0) + (ru(i, j, 28) - 0.5) * 0.08));
	if (c === 'd') {
		// aberta: a folha encostada no batente
		if (deit) tela.ret(X + 1, Y + 16, 6, P - 2, madeira);
		else tela.ret(X + 16, Y + 1, P - 2, 6, madeira);
		return;
	}
	if (deit) {
		tela.ret(X, Y + 11, P, 10, madeira);
		tela.ret(X, Y + 11, P, 1, clar(t.madeira, -0.45));
		tela.ret(X, Y + 20, P, 1, clar(t.madeira, -0.45));
	} else {
		tela.ret(X + 11, Y, 10, P, madeira);
		tela.ret(X + 11, Y, 1, P, clar(t.madeira, -0.45));
		tela.ret(X + 20, Y, 1, P, clar(t.madeira, -0.45));
	}
	if (c === 'L') {
		tela.ret(X + 13, Y + 13, 6, 6, hex('#d9a82b'));
		tela.ret(X + 15, Y + 15, 2, 2, hex('#3a2a10'));
	}
}

// ------------------------------------------------------------------ vista isométrica (losango de 64 × 32)
const TW = 64;
const ALT = 26;
const MARGEM = 16;
function desenharIso(p: Planta, t: Tema) {
	const A = p.length;
	const L = p[0].length;
	const W = (L + A) * (TW / 2) + 2 * MARGEM;
	const OY = ALT + MARGEM + 34;
	const H = (L + A) * (TW / 4) + OY + MARGEM;
	const OX = A * (TW / 2) + MARGEM;
	const tela = new Tela(W, H);
	const pr = (gx: number, gy: number, z = 0): [number, number] => [(gx - gy) * (TW / 2) + OX, (gx + gy) * (TW / 4) + OY - z];
	// o chão: cada pixel volta à grade e copia o chão da vista de cima (com as sombras)
	const chaoTopo = desenharTopo(p, t, false);
	for (let y = 0; y < H; y++)
		for (let x = 0; x < W; x++) {
			const u = (x + 0.5 - OX) / (TW / 2);
			const v = (y + 0.5 - OY) / (TW / 4);
			const gx = (u + v) / 2;
			const gy = (v - u) / 2;
			if (gx < 0 || gy < 0 || gx >= L || gy >= A) continue;
			const c = p[Math.floor(gy)][Math.floor(gx)];
			if (c === ' ' || PAREDE.has(c)) continue;
			const q = chaoTopo.ler(Math.floor(gx * P), Math.floor(gy * P));
			if (q[3]) tela.pt(x, y, [q[0], q[1], q[2]]);
		}
	const prisma = (x0: number, y0: number, x1: number, y1: number, z: number, topo: Cor, esq: Cor | ((x: number, y: number) => Cor), dir: Cor | ((x: number, y: number) => Cor), faces = [true, true]) => {
		const N = pr(x0, y0);
		const E = pr(x1, y0);
		const S = pr(x1, y1);
		const O = pr(x0, y1);
		const s = (q: [number, number]): [number, number] => [q[0], q[1] - z];
		if (faces[0]) tela.poli([O, S, s(S), s(O)], esq);
		if (faces[1]) tela.poli([S, E, s(E), s(S)], dir);
		tela.poli([s(N), s(E), s(S), s(O)], topo);
	};
	const tijolo = (base: Cor, ax: number, ay: number, bx: number, by: number) => (x: number, y: number): Cor => {
		const k = Math.max(0, Math.min(1, (x - ax) / (bx - ax || 1)));
		const h = ay + (by - ay) * k - y;
		if (t.portaPapel) return Math.floor(k * 4 * 2) % 2 === 0 && (k * 8) % 1 < 0.12 ? clar(t.madeira, -0.1) : clar(base, (ru(x, y, 31) - 0.5) * 0.04);
		const fila = Math.floor(h / 6);
		const junta = h % 6 < 1 || ((k * 4 + (fila % 2) * 0.5) % 1) < 0.06;
		return clar(base, junta ? -0.35 : (ru(x, y, 32) - 0.5) * 0.08);
	};
	const ordem: [number, number][] = [];
	for (let y = 0; y < A; y++) for (let x = 0; x < L; x++) ordem.push([x, y]);
	ordem.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0]);
	const parede = (c: string | null) => c !== null && (PAREDE.has(c) || c === '#');
	for (const [x, y] of ordem) {
		const c = p[y][x];
		const [cx, cy] = pr(x + 0.5, y + 0.5);
		if (PAREDE.has(c)) {
			const O = pr(x, y + 1);
			const S = pr(x + 1, y + 1);
			const E = pr(x + 1, y);
			prisma(x, y, x + 1, y + 1, ALT, clar(t.topo, (ru(x, y, 33) - 0.5) * 0.05), tijolo(clar(t.face, -0.18), O[0], O[1], S[0], S[1]), tijolo(clar(t.face, 0.02), S[0], S[1], E[0], E[1]), [!parede(em(p, x, y + 1)), !parede(em(p, x + 1, y))]);
			if (c === 'W') {
				// a fresta de vidro no topo e nas faces
				const d = deitada(p, x, y);
				const [a, b] = d ? [pr(x + 0.1, y + 0.5, ALT), pr(x + 0.9, y + 0.5, ALT)] : [pr(x + 0.5, y + 0.1, ALT), pr(x + 0.5, y + 0.9, ALT)];
				for (let k = 0; k <= 1; k += 0.02) tela.disco(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 2.2, hex('#9fd3e8'), 1, 1.4);
			}
			if (c === 'T') {
				const [fx, fy] = pr(x + 0.5, y + 0.5, ALT + 6);
				tela.ret(fx - 1, fy, 3, 7, hex('#3a3330'));
				tela.disco(fx, fy - 2, 4, hex('#e8692a'));
				tela.disco(fx, fy - 3, 2.3, hex('#ffd36b'));
			}
		} else if (c === 'O') {
			prisma(x + 0.2, y + 0.2, x + 0.8, y + 0.8, ALT + 10, clar(t.face, 0.15), clar(t.face, -0.22), clar(t.face, 0.02));
		} else if (c === 'Y') {
			tela.disco(cx + 6, cy + 2, 18, hex('#000000'), 0.28, 9);
			tela.ret(cx - 3, cy - 18, 6, 18, hex('#5a3a22'));
			tela.disco(cx, cy - 32, 22, (i, j, d) => clar(hex('#2f5a2a'), (ru(i >> 1, j >> 1, 34) - 0.5) * 0.25 + (1 - d) * 0.15 - Math.max(0, j - (cy - 32)) / 70));
			for (let k = 0; k < 7; k++) tela.disco(cx - 14 + ru(x, y, 90 + k) * 28, cy - 46 + ru(x, y, 100 + k) * 22, 3.5, hex('#5c8f3e'), 0.7);
		} else if (PORTA.has(c)) {
			const d = deitada(p, x, y);
			const cor = t.portaPapel ? clar(t.face, -0.05) : t.madeira;
			if (c === 'd') {
				if (d) prisma(x, y + 0.5, x + 0.12, y + 1, ALT - 4, clar(cor, 0.1), clar(cor, -0.25), clar(cor, -0.05));
				else prisma(x + 0.5, y, x + 1, y + 0.12, ALT - 4, clar(cor, 0.1), clar(cor, -0.25), clar(cor, -0.05));
			} else {
				if (d) prisma(x, y + 0.43, x + 1, y + 0.57, ALT - 4, clar(cor, 0.1), clar(cor, -0.25), clar(cor, -0.05));
				else prisma(x + 0.43, y, x + 0.57, y + 1, ALT - 4, clar(cor, 0.1), clar(cor, -0.25), clar(cor, -0.05));
				if (c === 'L') tela.ret(cx - 2, cy - ALT / 2 - 2, 5, 5, hex('#d9a82b'));
			}
		} else if (c === 'b') {
			prisma(x + 0.3, y + 0.3, x + 0.7, y + 0.7, 9, hex('#4c4444'), hex('#2a2626'), hex('#3a3434'));
			tela.disco(cx, cy - 13, 6, hex('#e8692a'), 1, 7);
			tela.disco(cx, cy - 15, 3.5, hex('#ffb347'), 1, 5);
			tela.disco(cx, cy - 16, 1.8, hex('#fff1a8'));
		} else if (c === 'l') {
			prisma(x + 0.32, y + 0.32, x + 0.68, y + 0.68, 22, hex('#a19d96'), hex('#6a6761'), hex('#827f78'));
			tela.ret(cx - 3, cy - 17, 7, 5, hex('#ffd36b'));
		} else if (c === 't') {
			prisma(x + 0.12, y + 0.25, x + 0.88, y + 0.75, 10, clar(t.madeira, 0.15), clar(t.madeira, -0.3), clar(t.madeira, -0.1));
		} else if (c === 'r') {
			for (let k = 0; k < 5; k++) {
				const [rx, ry] = pr(x + 0.15 + ru(x, y, 110 + k) * 0.7, y + 0.15 + ru(x, y, 120 + k) * 0.7);
				tela.disco(rx, ry - 2, 3 + ru(x, y, 130 + k) * 2, clar(t.face, -0.15 + ru(x, y, 140 + k) * 0.2), 1, 2.2);
			}
		}
	}
	for (const l of luzesDa(p)) {
		const [lx, ly] = pr(l.x, l.y);
		tela.brilho(lx, ly, l.plena * (TW / 2) * 1.1, hex('#ff9a3c'), 0.2, l.plena * (TW / 4) * 1.1);
	}
	return { tela, W, H, OX, OY };
}

// ------------------------------------------------------------------ as três plantas
function serpente(): Planta {
	const p = planta(32, 24, ' ');
	sala(p, 10, 0, 21, 8, '.');
	sala(p, 8, 8, 23, 17);
	sala(p, 0, 4, 8, 22);
	sala(p, 23, 4, 31, 17);
	sala(p, 23, 17, 31, 23);
	sala(p, 12, 17, 19, 23);
	// salão do trono: o tapete até o trono, braseiros e tochas
	area(p, 15, 1, 16, 7, ',');
	por(p, [[15, 2], [16, 2]], 't');
	por(p, [[12, 2], [19, 2], [12, 6], [19, 6]], 'b');
	por(p, [[10, 4], [21, 4]], 'T');
	// a ala das celas: corredor, quatro celas (duas trancadas)
	for (let y = 5; y <= 21; y++) p[y][5] = '#';
	for (const y of [9, 14, 19]) for (let x = 1; x <= 4; x++) p[y][x] = '#';
	por(p, [[5, 7]], 'L');
	por(p, [[5, 11]], 'D');
	por(p, [[5, 16]], 'L');
	por(p, [[5, 20]], 'd');
	por(p, [[2, 6], [3, 12], [1, 17], [2, 21]], 'r');
	por(p, [[8, 6], [8, 19]], 'T');
	// o salão: pilares, a estátua e os braseiros
	por(p, [[11, 11], [11, 14], [20, 11], [20, 14], [15, 12], [16, 12], [15, 13], [16, 13]], 'O');
	por(p, [[13, 10], [18, 10], [13, 15], [18, 15]], 'b');
	// o laboratório: mesas e tanques; o depósito: caixotes
	por(p, [[26, 7], [27, 7], [26, 10], [27, 10], [25, 13]], 't');
	area(p, 29, 13, 30, 15, '~');
	por(p, [[31, 9], [31, 14]], 'T');
	por(p, [[25, 19], [26, 19], [29, 21], [30, 21], [24, 22]], 't');
	por(p, [[28, 19]], 'r');
	// a entrada
	por(p, [[14, 21], [17, 21]], 'b');
	// as portas
	por(p, [[15, 8], [8, 12], [23, 12], [15, 17]], 'D');
	por(p, [[27, 17]], 'L');
	return p;
}

function templo(): Planta {
	const p = planta(34, 26, '"');
	sala(p, 8, 4, 25, 19);
	sala(p, 0, 6, 8, 17, ',');
	sala(p, 25, 6, 33, 17);
	// o salão: duas fileiras de pilares, o altar e os braseiros
	for (const x of [12, 21]) for (const y of [7, 10, 13, 16]) p[y][x] = 'O';
	por(p, [[16, 5], [17, 5]], 't');
	por(p, [[14, 6], [19, 6], [16, 16], [17, 16]], 'b');
	// a ruína: rombos nas paredes e entulho
	por(p, [[8, 12], [25, 9], [13, 19]], 'r');
	por(p, [[10, 8], [23, 15], [19, 12], [11, 17]], 'r');
	// janelas para o jardim do norte
	por(p, [[11, 4], [14, 4], [19, 4], [22, 4], [0, 9], [0, 14], [33, 9], [33, 14]], 'W');
	// alojamento dos monges (musgo) e biblioteca (mesas)
	por(p, [[2, 8], [2, 11], [2, 15], [5, 15]], 't');
	por(p, [[27, 8], [28, 8], [27, 11], [28, 11], [30, 14], [31, 14]], 't');
	por(p, [[8, 9], [25, 14]], 'D');
	por(p, [[16, 19], [17, 19]], 'd');
	// jardins: lago, lanternas, árvores e o caminho
	area(p, 26, 0, 31, 2, '~');
	area(p, 15, 20, 18, 25, ',');
	por(p, [[13, 21], [20, 21], [13, 24], [20, 24], [24, 2], [6, 2]], 'l');
	por(p, [[2, 1], [9, 1], [30, 21], [3, 21], [27, 24], [6, 24], [1, 4], [32, 4]], 'Y');
	return p;
}

function cha(): Planta {
	const p = planta(32, 24, '"');
	sala(p, 4, 3, 22, 18, 'k');
	// o corredor de tábuas, a entrada (genkan), a cozinha e o depósito
	area(p, 5, 11, 21, 12, '.');
	for (let x = 5; x <= 21; x++) p[10][x] = '#';
	for (let x = 5; x <= 21; x++) p[13][x] = '#';
	for (let y = 4; y <= 9; y++) [p[y][11], p[y][17]] = ['#', '#'];
	for (let y = 14; y <= 17; y++) [p[y][11], p[y][17]] = ['#', '#'];
	area(p, 12, 13, 16, 17, '.');
	area(p, 5, 14, 10, 17, '.');
	area(p, 18, 14, 21, 17, '.');
	por(p, [[8, 10], [14, 10], [19, 10], [8, 13], [19, 13]], 'D');
	por(p, [[14, 18]], 'D');
	por(p, [[6, 3], [9, 3], [14, 3], [19, 3], [4, 6], [4, 15], [22, 6], [22, 15], [7, 18], [20, 18]], 'W');
	// a sala do chá, o fogareiro (irori), a cozinha e o depósito
	por(p, [[14, 6]], 't');
	por(p, [[7, 6]], 'b');
	por(p, [[6, 15], [7, 15], [9, 16]], 't');
	por(p, [[19, 15], [20, 15], [20, 16]], 't');
	// o jardim: o caminho de cascalho, o lago, as lanternas e as árvores
	area(p, 13, 19, 15, 23, ',');
	area(p, 25, 2, 29, 5, '~');
	por(p, [[12, 20], [16, 20], [24, 7], [27, 12], [2, 11]], 'l');
	por(p, [[2, 2], [29, 20], [26, 16], [1, 20], [30, 9], [8, 21]], 'Y');
	return p;
}

// ------------------------------------------------------------------ saída
const conferir = (nome: string, p: Planta) => {
	p.forEach((linha, y) =>
		linha.forEach((c, x) => {
			if (!PORTA.has(c) && c !== 'W') return;
			const fecha = (v: string | null) => v !== null && (macico(v) || PAREDE.has(v) || PORTA.has(v));
			const lados = [em(p, x - 1, y), em(p, x + 1, y)].every(fecha);
			const cimaBaixo = [em(p, x, y - 1), em(p, x, y + 1)].every(fecha);
			if (!lados && !cimaBaixo && !(c === 'W' && (x === 0 || y === 0 || x === p[0].length - 1 || y === p.length - 1))) console.warn(`${nome}: ${c} em ${x},${y} sem parede dos dois lados`);
		})
	);
};

const MAPAS = [
	{ id: 'serpente', nome: 'Esconderijo da Serpente', ambiente: 'escuro', dica: 'Escuro: celas trancadas, um laboratório e o salão do trono, só com braseiros e tochas.', planta: serpente() },
	{ id: 'templo', nome: 'Templo em Ruínas', ambiente: 'penumbra', dica: 'Penumbra: o salão de pilares com rombos nas paredes, janelas para o jardim e duas alas.', planta: templo() },
	{ id: 'cha', nome: 'Casa de Chá', ambiente: 'claro', dica: 'Claro: de dia, só as paredes e as portas de papel escondem os cômodos.', planta: cha() }
] as const;

const dir = 'static/mesa/demos';
mkdirSync(dir, { recursive: true });
const demos: unknown[] = [];
for (const m of MAPAS) {
	conferir(m.id, m.planta);
	const t = TEMAS[m.id];
	const L = m.planta[0].length;
	const A = m.planta.length;
	const paredes = paredesDa(m.planta);
	const luzes = luzesDa(m.planta);
	const topo = desenharTopo(m.planta, t, true);
	writeFileSync(`${dir}/${m.id}-topo.png`, png(topo.w, topo.h, topo.px));
	const mt = topo.reduzir(320);
	writeFileSync(`${dir}/${m.id}-topo-m.png`, png(mt.w, mt.h, mt.px));
	demos.push({ id: `${m.id}-topo`, nome: m.nome, dica: m.dica, visao: 'topo', largura: L, altura: A, fundo: `/mesa/demos/${m.id}-topo.png`, miniatura: `/mesa/demos/${m.id}-topo-m.png`, fundo_escala: L, fundo_x: 0, fundo_y: 0, luz_ambiente: m.ambiente, paredes, luzes });
	const iso = desenharIso(m.planta, t);
	writeFileSync(`${dir}/${m.id}-iso.png`, png(iso.W, iso.H, iso.tela.px));
	const mi = iso.tela.reduzir(320);
	writeFileSync(`${dir}/${m.id}-iso-m.png`, png(mi.w, mi.h, mi.px));
	// a imagem na tela da Mesa (losango de 1 de largura): o canto (0, 0) da grade cai no pixel (OX, OY)
	demos.push({
		id: `${m.id}-iso`,
		nome: m.nome,
		dica: m.dica,
		visao: 'isometrica',
		largura: L,
		altura: A,
		fundo: `/mesa/demos/${m.id}-iso.png`,
		miniatura: `/mesa/demos/${m.id}-iso-m.png`,
		fundo_escala: iso.W / TW,
		fundo_x: A / 2 - iso.OX / TW,
		fundo_y: -iso.OY / TW,
		luz_ambiente: m.ambiente,
		paredes,
		luzes
	});
	console.log(`${m.id}: ${L} × ${A}, ${paredes.length} paredes, ${luzes.length} luzes; topo ${topo.w}×${topo.h}, iso ${iso.W}×${iso.H}`);
}
writeFileSync('src/lib/mesa/demos.json', JSON.stringify(demos));
