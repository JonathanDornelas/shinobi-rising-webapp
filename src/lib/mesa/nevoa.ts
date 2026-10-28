// Névoa da Mesa: o Mestre cobre o mapa e revela só o que quer. A cena guarda os quadrados revelados em runs
// [y, x0, x1] (x0 e x1 incluídos), que são curtas mesmo num mapa de 200 × 200 m. Aqui ficam a conversão entre runs e
// a grade de quadrados, o pincel, o desenho (um caminho só) e a consulta de um quadrado.

export type Run = [number, number, number];

/** A grade L × A de quadrados revelados (1 = revelado), linha por linha. */
export function grade(runs: Run[], L: number, A: number): Uint8Array {
	const g = new Uint8Array(L * A);
	for (const [y, x0, x1] of runs ?? []) {
		if (!Number.isInteger(y) || y < 0 || y >= A) continue;
		for (let x = Math.max(0, x0); x <= Math.min(L - 1, x1); x++) g[y * L + x] = 1;
	}
	return g;
}

/** A grade de volta em runs, uma por trecho contínuo de cada linha. */
export function emRuns(g: Uint8Array, L: number, A: number): Run[] {
	const runs: Run[] = [];
	for (let y = 0; y < A; y++) {
		let x = 0;
		while (x < L) {
			if (!g[y * L + x]) {
				x++;
				continue;
			}
			const x0 = x;
			while (x < L && g[y * L + x]) x++;
			runs.push([y, x0, x - 1]);
		}
	}
	return runs;
}

/** Pinta um pincel quadrado de `lado` quadrados, centrado em (cx, cy): revela ou cobre. Devolve se algo mudou. */
export function pintar(g: Uint8Array, L: number, A: number, cx: number, cy: number, lado: number, revelar: boolean): boolean {
	const meio = Math.floor(lado / 2);
	let mudou = false;
	for (let y = Math.max(0, cy - meio); y <= Math.min(A - 1, cy - meio + lado - 1); y++)
		for (let x = Math.max(0, cx - meio); x <= Math.min(L - 1, cx - meio + lado - 1); x++) {
			const i = y * L + x;
			if (g[i] !== (revelar ? 1 : 0)) {
				g[i] = revelar ? 1 : 0;
				mudou = true;
			}
		}
	return mudou;
}

/** Toda a cena revelada (ou coberta). */
export const tudo = (L: number, A: number, revelado: boolean) => (revelado ? Array.from({ length: A }, (_, y): Run => [y, 0, L - 1]) : []);

/** Funde linhas vizinhas com o mesmo trecho em retângulos [x, y, largura, altura] (menos formas no desenho). */
export function retangulos(runs: Run[]): [number, number, number, number][] {
	const ordenadas = [...(runs ?? [])].sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0]);
	const saida: [number, number, number, number][] = [];
	const abertos = new Map<string, number>();
	for (const [y, x0, x1] of ordenadas) {
		const chave = `${x0},${x1}`;
		const i = abertos.get(chave);
		if (i !== undefined && saida[i][1] + saida[i][3] === y) saida[i][3]++;
		else {
			abertos.set(chave, saida.length);
			saida.push([x0, y, x1 - x0 + 1, 1]);
		}
	}
	return saida;
}

/**
 * O caminho da névoa: a cena inteira com os trechos revelados vazados (regra par-ímpar). Os retângulos revelados nunca
 * se sobrepõem, então o furo é limpo.
 */
export function caminhoNevoa(runs: Run[], L: number, A: number): string {
	let d = `M0 0H${L}V${A}H0Z`;
	for (const [x, y, w, h] of retangulos(runs)) d += `M${x} ${y}h${w}v${h}h${-w}Z`;
	return d;
}

/** O quadrado (x, y) está revelado? Para esconder do grupo o que fica sob a névoa (tokens, objetos). */
export function indice(runs: Run[]) {
	const porLinha = new Map<number, [number, number][]>();
	for (const [y, x0, x1] of runs ?? []) {
		const l = porLinha.get(y);
		if (l) l.push([x0, x1]);
		else porLinha.set(y, [[x0, x1]]);
	}
	return (x: number, y: number) => !!porLinha.get(Math.floor(y))?.some(([a, b]) => x >= a && x <= b);
}

/** Aceita só o que o banco aceita: runs de inteiros dentro da cena, sem passar do limite de tamanho. */
export function limpar(runs: unknown, L: number, A: number): Run[] {
	if (!Array.isArray(runs)) return [];
	const saida: Run[] = [];
	for (const r of runs) {
		if (!Array.isArray(r) || r.length !== 3 || !r.every(Number.isInteger)) continue;
		const [y, x0, x1] = r as Run;
		if (y < 0 || y >= A || x1 < x0) continue;
		saida.push([y, Math.max(0, x0), Math.min(L - 1, x1)]);
	}
	return saida.slice(0, 4000);
}

/** Os quadrados de uma reta de (x0, y0) a (x1, y1), incluindo as pontas (Bresenham): o pincel não deixa buracos ao arrastar rápido. */
export function celulasEntre(x0: number, y0: number, x1: number, y1: number): [number, number][] {
	const celulas: [number, number][] = [];
	const dx = Math.abs(x1 - x0);
	const dy = -Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let erro = dx + dy;
	let x = x0;
	let y = y0;
	for (let i = 0; i < 1000; i++) {
		celulas.push([x, y]);
		if (x === x1 && y === y1) break;
		const e2 = 2 * erro;
		if (e2 >= dy) {
			erro += dy;
			x += sx;
		}
		if (e2 <= dx) {
			erro += dx;
			y += sy;
		}
	}
	return celulas;
}
