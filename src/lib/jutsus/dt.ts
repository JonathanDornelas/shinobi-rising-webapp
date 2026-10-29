// DT do Jutsu (cap. 2, "Na mesa: DT do Jutsu"): 10 + bônus de rank + atributo-chave do lançador, mais a proficiência no
// jutsu, se houver. Atributo-chave: CTR em Ninjutsu, Genjutsu e Fuuinjutsu; FOR em Taijutsu; FOR ou AGI em Bukijutsu,
// conforme a arma (aqui, o maior dos dois); AGI em Kugutsu. NPC de ficha rápida e criatura do bestiário têm a DT fixa
// no bloco. A conta vai junto, em partes, para o selo mostrar de onde vem o número.
import { RANK } from '#lib/livro/dominio.ts';
import type { Rank } from '#lib/livro/tipos.ts';

export interface ParteDt {
	rotulo: string;
	valor: number;
}
export interface DtJutsu {
	total: number;
	partes: ParteDt[];
	/** Explicação quando a DT não é a conta do lançador (NPC de ficha rápida, criatura). */
	nota?: string;
}

const CHAVE: Record<string, string[]> = {
	Ninjutsu: ['CTR'],
	Genjutsu: ['CTR'],
	Fuuinjutsu: ['CTR'],
	Taijutsu: ['FOR'],
	Bukijutsu: ['FOR', 'AGI'],
	Kugutsu: ['AGI']
};

/** A DT de um jutsu na ficha de quem lança. Tipo fora da lista (carta de clã sem tipo) usa CTR. */
export function dtDoLancador(rank: string, tipo: string | null | undefined, atributos: Record<string, number>, proficiencia = 0): DtJutsu {
	const opcoes = CHAVE[tipo ?? ''] ?? ['CTR'];
	const atributo = opcoes.reduce((m, a) => ((atributos[a] ?? 0) > (atributos[m] ?? 0) ? a : m), opcoes[0]);
	const partes: ParteDt[] = [
		{ rotulo: 'Base', valor: 10 },
		{ rotulo: `Rank ${rank}`, valor: RANK[rank as Rank]?.dt ?? 0 },
		{ rotulo: opcoes.length > 1 ? `${atributo} (o maior entre FOR e AGI)` : atributo, valor: atributos[atributo] ?? 0 }
	];
	if (proficiencia) partes.push({ rotulo: 'Proficiência no jutsu', valor: proficiencia });
	return { total: partes.reduce((s, p) => s + p.valor, 0), partes };
}

/**
 * DT de um jutsu do bestiário, pela ficha da criatura (atributos em minúsculas, proficiências com o jutsu marcante).
 * Mesma conta das fichas dos jogadores; a DT do bloco fica para os traços.
 */
export function dtNaFichaDaCriatura(
	ficha: { atributos: Record<string, number>; proficiencias: { bonus: number; jutsu: string | null }[] },
	j: { slug: string | null; rank: string | null; tipo?: string | null }
): DtJutsu | null {
	if (!j.rank) return null;
	const atributos = Object.fromEntries(Object.entries(ficha.atributos).map(([k, v]) => [k.toUpperCase(), v]));
	const prof = ficha.proficiencias.find((p) => p.jutsu && p.jutsu === j.slug)?.bonus ?? 0;
	return dtDoLancador(j.rank, j.tipo, atributos, prof);
}

/** DT fixa do bloco (NPC de ficha rápida, criatura do bestiário). */
export const dtFixa = (dt: number, nota: string): DtJutsu => ({ total: dt, partes: [], nota });

/** Troca "DT do Jutsu" no texto da Resistência pelo número ("Acrobacia (DT do Jutsu)" → "Acrobacia (DT 16)"). */
export const comDt = (texto: string, dt: DtJutsu | null | undefined) => (dt ? texto.replace(/DT do Jutsu/i, `DT ${dt.total}`) : texto);
