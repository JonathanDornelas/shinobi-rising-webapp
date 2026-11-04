// A iniciativa digitada à mão: o Mestre escreve o número de alguém e ele vale no lugar do dado (a rolagem se perdeu, a
// ordem foi limpa sem querer, ou o grupo rolou fora da Mesa). As regras ficam aqui, sem tocar no banco.
import type { IniciativaCena } from '#lib/supabase/banco.ts';

export type EntradaIniciativa = NonNullable<IniciativaCena['ordem']>[number];
export type IniciativaManual = NonNullable<IniciativaCena['manuais']>[number];

/** Quem é a entrada da ordem: o personagem ou o NPC (a tropa joga junta); quem rolou sem token na cena, pelo nome. */
export const chaveDaEntrada = (e: EntradaIniciativa) => e.personagem_id ?? e.npc_id ?? e.nome;

export const LIMITE_INICIATIVA = { min: -99, max: 999 } as const;

/** Lê o que foi digitado: um inteiro dentro do limite, ou null (campo vazio ou sem número). */
export function lerIniciativa(texto: string): number | null {
	const n = Number(texto.trim() || NaN);
	return Number.isFinite(n) ? Math.max(LIMITE_INICIATIVA.min, Math.min(LIMITE_INICIATIVA.max, Math.trunc(n))) : null;
}

/** Guarda o número digitado de alguém, no lugar do que havia; `null` tira. */
export function trocarManual(manuais: IniciativaManual[], chave: string, nome: string, valor: number | null): IniciativaManual[] {
	const resto = manuais.filter((m) => m.chave !== chave);
	return valor === null ? resto : [...resto, { chave, nome, valor }];
}

/** A prévia: o que foi rolado, com os números digitados por cima (o digitado vence o dado); maior primeiro. */
export function juntarManuais(roladas: { chave: string; quem: string; total: number }[], manuais: IniciativaManual[]) {
	const digitados = new Set(manuais.map((m) => m.chave));
	return [...roladas.filter((r) => !digitados.has(r.chave)).map((r) => ({ ...r, manual: false })), ...manuais.map((m) => ({ chave: m.chave, quem: m.nome, total: m.valor, manual: true }))].sort(
		(a, b) => b.total - a.total || a.quem.localeCompare(b.quem, 'pt-BR')
	);
}

/** Durante o combate, tira alguém da ordem: a vez fica com quem estava nela; se saiu quem estava, passa a quem vinha depois. */
export function tirarDaOrdem(ordem: EntradaIniciativa[], vez: number, chave: string): { ordem: EntradaIniciativa[]; vez: number } {
	const daVez = ordem[vez] ? chaveDaEntrada(ordem[vez]) : null;
	const nova = ordem.filter((e) => chaveDaEntrada(e) !== chave);
	if (daVez === chave) return { ordem: nova, vez: vez >= nova.length ? 0 : vez };
	return { ordem: nova, vez: Math.max(0, nova.findIndex((e) => chaveDaEntrada(e) === daVez)) };
}

/**
 * Durante o combate: a entrada vai para o lugar do número novo (ou entra na ordem, se estava fora), depois de quem tem o
 * mesmo número. Os outros ficam como estão, mesmo que o Mestre os tenha trocado de lugar, e a vez fica com quem estava nela.
 */
export function colocarNaOrdem(ordem: EntradaIniciativa[], vez: number, entrada: EntradaIniciativa): { ordem: EntradaIniciativa[]; vez: number } {
	const chave = chaveDaEntrada(entrada);
	const daVez = ordem[vez] ? chaveDaEntrada(ordem[vez]) : null;
	const resto = ordem.filter((e) => chaveDaEntrada(e) !== chave);
	const i = resto.findIndex((e) => e.valor < entrada.valor);
	const nova = i < 0 ? [...resto, entrada] : [...resto.slice(0, i), entrada, ...resto.slice(i)];
	return { ordem: nova, vez: Math.max(0, nova.findIndex((e) => chaveDaEntrada(e) === daVez)) };
}
