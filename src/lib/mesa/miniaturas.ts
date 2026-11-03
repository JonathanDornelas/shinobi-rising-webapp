// Miniaturas: o token pode aparecer de pé no quadro, como uma peça em pixel art (feita no PixelLab, em 8 direções), em vez
// do retrato no círculo. O catálogo (miniaturas.json) sai de scripts/mesa/miniaturas.ts: cada miniatura é uma tira com as
// 8 direções, o ponto dos pés e a altura da figura, medidos no quadro de frente.
import catalogo from './miniaturas.json';

export interface Miniatura {
	id: string;
	/** o estágio do bestiário ("slug#estágio") que usa esta miniatura */
	verbete: string;
	nome: string;
	/** a direção de arte */
	estilo: string;
	/** já vem com a base esculpida (o quadro não desenha a dele) */
	base?: boolean;
	/** um quadro da tira, em pixels */
	w: number;
	h: number;
	/** os pés, em pixels do quadro */
	pe: [number, number];
	/** a altura da figura, em pixels */
	altura: number;
}

export const MINIATURAS = catalogo as Miniatura[];
const PORID = new Map(MINIATURAS.map((m) => [m.id, m]));
export const miniaturaPorId = (id: string | null | undefined) => (id ? (PORID.get(id) ?? null) : null);
/** As miniaturas de um NPC do bestiário ("slug#estágio"). */
export const miniaturasDoVerbete = (verbete: string | null | undefined) => (verbete ? MINIATURAS.filter((m) => m.verbete === verbete) : []);
export const urlMiniatura = (m: Miniatura) => `/mesa/miniaturas/${m.id}.png`;

/** As 8 direções, na ordem da tira (sul de frente para quem olha, e girando pelo leste). */
export const RUMOS = ['Sul', 'Sudeste', 'Leste', 'Nordeste', 'Norte', 'Noroeste', 'Oeste', 'Sudoeste'] as const;

/** Para onde olha quem anda (dx, dy), com y para baixo: 0 sul, 2 leste, 4 norte, 6 oeste. Parado, null. */
export function rumoDoPasso(dx: number, dy: number): number | null {
	if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;
	const graus = (Math.atan2(dy, dx) * 180) / Math.PI;
	return (((Math.round((90 - graus) / 45) % 8) + 8) % 8) as number;
}

/** O vetor (na grade) de um rumo. */
export function vetorDoRumo(rumo: number): [number, number] {
	const a = ((90 - 45 * rumo) * Math.PI) / 180;
	return [Math.cos(a), Math.sin(a)];
}

/**
 * O quadro da tira para quem olha a tela: o rumo é da grade, e a vista (a isométrica, girada) muda para onde ele aponta
 * na tela. `tela` leva um ponto da grade à tela.
 */
export function quadroNaTela(rumo: number, cx: number, cy: number, tela: (x: number, y: number) => [number, number]): number {
	const [ux, uy] = vetorDoRumo(rumo);
	const [ax, ay] = tela(cx, cy);
	const [bx, by] = tela(cx + ux, cy + uy);
	return rumoDoPasso(bx - ax, by - ay) ?? 0;
}

/** A figura de pé mede isto (em metros) por quadrado do token: a de 1 × 1 passa um pouco do quadrado de cima. */
export const ALTURA_DA_FIGURA = 1.7;
