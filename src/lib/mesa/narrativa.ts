// Quem está em cena na narrativa: os personagens e NPCs que o Mestre traz para cima da imagem, um a um (mesa_cenas.em_cena).
// O nome de um NPC escondido do grupo não vai para o banco (o grupo lê a cena): fica null e aparece "???".
import type { Foco } from '#lib/bestiario/foco.ts';

export interface EmCena {
	/** 'pc:<id>', 'npc:<id>' ou 'ficha:<id>' */
	chave: string;
	nome: string | null;
	/** caminho do retrato (bucket) ou da arte (/bestiario/…) */
	retrato: string | null;
	/** o enquadramento da arte do bestiário (ponto em frações e zoom) */
	foco?: Foco | null;
}

/** O máximo de retratos sobre a imagem (o banco aceita até 12). */
export const MAX_EM_CENA = 12;

/** Lê o que veio do banco: o que não tiver o formato certo fica de fora. */
export function lerEmCena(v: unknown): EmCena[] {
	if (!Array.isArray(v)) return [];
	return v
		.filter((e): e is EmCena => !!e && typeof e === 'object' && typeof (e as EmCena).chave === 'string')
		.map((e) => ({ chave: e.chave, nome: typeof e.nome === 'string' ? e.nome : null, retrato: typeof e.retrato === 'string' ? e.retrato : null, foco: e.foco ?? null }))
		.slice(0, MAX_EM_CENA);
}

/** Traz para a cena (no fim da fila) ou tira, se já estava. Cheia, não entra ninguém (devolve null). */
export function alternarEmCena(lista: EmCena[], item: EmCena): EmCena[] | null {
	if (lista.some((e) => e.chave === item.chave)) return lista.filter((e) => e.chave !== item.chave);
	if (lista.length >= MAX_EM_CENA) return null;
	return [...lista, item];
}
