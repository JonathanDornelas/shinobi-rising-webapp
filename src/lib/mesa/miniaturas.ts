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
	/** um bicho ou monstro: cabe no quadrado também na largura (veja `altura`) */
	criatura?: boolean;
	/** um quadro da tira, em pixels */
	w: number;
	h: number;
	/** os pés, em pixels do quadro */
	pe: [number, number];
	/**
	 * a medida que ocupa a altura da figura no quadro (ALTURA_DA_FIGURA), em pixels: a altura de uma pessoa; numa criatura,
	 * a maior entre a altura e a largura dela em todas as direções (deitada, comprida ou de asas abertas, cabe no quadrado),
	 * e a Pequena fica menor que a Média
	 */
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

/** O rumo das setas apertadas juntas: uma vira para o lado dela, duas para a diagonal; opostas se anulam (null). */
export function rumoDasSetas(setas: Iterable<string>): number | null {
	const vetores: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
	let [dx, dy] = [0, 0];
	for (const s of setas) [dx, dy] = [dx + (vetores[s]?.[0] ?? 0), dy + (vetores[s]?.[1] ?? 0)];
	return rumoDoPasso(dx, dy);
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

/**
 * A figura de pé mede isto por quadrado do token, do pé (ou da base esculpida) ao alto da cabeça: cabe inteira no quadrado,
 * do porte do token redondo. Todas as miniaturas têm a mesma altura; a cena e a campanha ajustam o tamanho de todas e de
 * cada uma.
 */
export const ALTURA_DA_FIGURA = 0.9;

/** O tamanho das miniaturas na campanha: `escala` vale para todas; `ajustes`, para cada uma (multiplica). */
export interface AjusteMiniaturas {
	escala: number;
	ajustes: Record<string, number>;
}
export const LIMITE_ESCALA = { min: 0.5, max: 2, passo: 0.05 } as const;
const limitar = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(Math.min(LIMITE_ESCALA.max, Math.max(LIMITE_ESCALA.min, v)) * 100) / 100 : 1);
/** Lê o que veio do banco (ou de quem mandou pela mesa), sem confiar: números fora do limite voltam para dentro. */
export function lerAjustes(v: unknown): AjusteMiniaturas {
	const o = v && typeof v === 'object' ? (v as { escala?: unknown; ajustes?: unknown }) : {};
	const ajustes: Record<string, number> = {};
	if (o.ajustes && typeof o.ajustes === 'object')
		for (const [id, k] of Object.entries(o.ajustes as Record<string, unknown>)) if (/^[a-z0-9-]{1,60}$/.test(id) && limitar(k) !== 1) ajustes[id] = limitar(k);
	return { escala: o.escala === undefined ? 1 : limitar(o.escala), ajustes };
}
/** Quanto a miniatura cresce (ou encolhe) no quadro: o ajuste de todas vezes o dela. */
export const escalaDe = (a: AjusteMiniaturas, id: string) => Math.round(a.escala * (a.ajustes[id] ?? 1) * 1000) / 1000;

/** As miniaturas numa cena: o tamanho de todas (cada mapa tem a sua escala) e a sombra. */
export interface CenaMiniaturas {
	escala: number;
	sombra: boolean;
}
export function lerCenaMiniaturas(v: unknown): CenaMiniaturas {
	const o = v && typeof v === 'object' ? (v as { escala?: unknown; sombra?: unknown }) : {};
	return { escala: o.escala === undefined ? 1 : limitar(o.escala), sombra: o.sombra !== false };
}

/**
 * A sombra da miniatura no chão: para onde ela puxa (unitária, na grade) e o quanto se alonga (k). Perto de uma luz
 * acesa, foge dela e se alonga com a distância; sem luz (`luz` falso), quem desenha escolhe o lado.
 */
export function sombraDaMiniatura(pe: [number, number], luzes: readonly { x: number; y: number; alcance: number }[]): { dx: number; dy: number; k: number; luz: boolean } {
	let melhor: { d: number; x: number; y: number; alcance: number } | null = null;
	for (const l of luzes) {
		const d = Math.hypot(pe[0] - l.x, pe[1] - l.y);
		if (d > 0.05 && d <= l.alcance && (!melhor || d < melhor.d)) melhor = { d, ...l };
	}
	if (!melhor) return { dx: 0.6, dy: -0.8, k: 0.5, luz: false };
	return { dx: (pe[0] - melhor.x) / melhor.d, dy: (pe[1] - melhor.y) / melhor.d, k: Math.min(0.95, 0.35 + 0.6 * (melhor.d / melhor.alcance)), luz: true };
}

/** As prateleiras da caixa: uma por verbete do bestiário (o clã, a criatura), na ordem do catálogo. */
export interface Prateleira {
	chave: string;
	nome: string;
	minis: Miniatura[];
}
export const PRATELEIRAS: Prateleira[] = Object.values(
	MINIATURAS.reduce<Record<string, Prateleira>>((acc, m) => {
		const chave = m.verbete.split('#')[0];
		(acc[chave] ??= { chave, nome: m.nome.split(',')[0], minis: [] }).minis.push(m);
		return acc;
	}, {})
);
/** O nome curto do estágio (o que vem depois da vírgula), para a etiqueta na prateleira. */
export const estagioDe = (m: Miniatura) => m.nome.split(',').slice(1).join(',').trim() || m.nome;
