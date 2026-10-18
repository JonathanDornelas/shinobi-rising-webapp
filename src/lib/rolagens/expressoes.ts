// Expressões de dados a partir da ficha (cap. 2: teste = 1d20 + perícia ou atributo; cap. 4: ataque e dano).
// O sorteio é sempre no servidor (rolar); aqui só se monta a expressão e se descreve o resultado.
import type { Rolagem, TermoRolagem } from '#lib/supabase/banco.ts';

const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** 1d20 + bônus, no formato que o servidor aceita (1d20+5, 1d20-1, 1d20). */
export const teste = (bonus: number) => (bonus > 0 ? `1d20+${bonus}` : bonus < 0 ? `1d20${bonus}` : '1d20');

/** Junta um modificador a uma expressão de dano (2d6 + 1 → 2d6+1). */
export const somar = (expr: string, bonus: number) => (bonus > 0 ? `${expr}+${bonus}` : bonus < 0 ? `${expr}${bonus}` : expr);

/** Perícia do ataque de um jutsu ("1d20 + Ninjutsu (um por alvo)" → "Ninjutsu"); null se não rola ataque. */
export function periciaDoAtaque(info: { k: string; v: string }[]): string | null {
	const v = info.find((i) => i.k === 'Ataque')?.v ?? '';
	return /^1d20\s*\+\s*([A-Za-zÀ-ú]+)/.exec(v)?.[1] ?? null;
}

const DANO = String.raw`(\d{1,2}d\d{1,3})(?:\s*\+\s*(FOR|AGI|VIG|INT|CTR|ESP)\b)?(?:\s*([+-])\s*(\d{1,3})(?![\dd]))?`;
const DANO_DEPOIS = new RegExp(`${DANO}\\s+(?:de\\s+)?dano`, 'i');
const DANO_ANTES = new RegExp(`causam?\\s+${DANO}`, 'i');

/**
 * Dados de dano no efeito ("4d8 de dano perfurante", "3d6 + FOR de dano", "cada acerto causa 2d8 + FOR").
 * `atributo` é o atributo somado ao dano, quando houver; null se o jutsu não causa dano em dados.
 */
export function danoDoEfeito(efeito: string): { dados: string; atributo: string | null } | null {
	const m = DANO_DEPOIS.exec(efeito) ?? DANO_ANTES.exec(efeito);
	if (!m) return null;
	return { dados: m[3] ? `${m[1]}${m[3]}${m[4]}` : m[1], atributo: m[2]?.toUpperCase() ?? null };
}

/** Cura em dados no efeito ("recupera 2d6 PV"). */
export function curaDoEfeito(efeito: string): string | null {
	const m = /(?:recupera|cura|restaura)\s+(\d{1,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3}(?!d))?)/i.exec(efeito);
	return m ? m[1].replace(/\s+/g, '') : null;
}

/** Acha o total de uma perícia pelo nome (sem acento, sem caixa). */
export function totalPericia(linhas: { nome: string; total: number }[], nome: string): number | null {
	const alvo = sem(nome);
	return linhas.find((l) => sem(l.nome) === alvo)?.total ?? null;
}

/** "13 + 5 = 18", "[17, 4] → 17 + 3 = 20" (vantagem) ou "3 + 5 + 2 = 10". */
export function conta(detalhe: TermoRolagem[]): string {
	const partes = detalhe.map((t, i) => {
		const sinal = i === 0 ? (t.sinal < 0 ? '−' : '') : t.sinal < 0 ? ' − ' : ' + ';
		if ('valor' in t) return `${sinal}${t.valor}`;
		const usados = t.usados.join(' + ');
		const descartados = t.valores.length > t.usados.length ? `[${t.valores.join(', ')}] → ` : '';
		return `${sinal}${descartados}${t.usados.length > 1 ? `(${usados})` : usados}`;
	});
	return partes.join('');
}

export type Destaque = 'critico' | 'falha' | null;

/** 20 natural é crítico; 1 natural, falha crítica (glossário e cap. 4). */
export const destaque = (r: Pick<Rolagem, 'd20'>): Destaque => (r.d20 === 20 ? 'critico' : r.d20 === 1 ? 'falha' : null);

export const MODOS = [
	{ id: 'normal', nome: 'Normal' },
	{ id: 'vantagem', nome: 'Vantagem' },
	{ id: 'desvantagem', nome: 'Desvantagem' }
] as const;

/** Validação local antes de mandar (o servidor confere de novo). */
export function expressaoValida(e: string): boolean {
	const s = e.replace(/\s+/g, '').toLowerCase();
	if (!s.length || s.length > 60 || !/^[+-]?(\d{1,2}d\d{1,3}|\d{1,3})([+-](\d{1,2}d\d{1,3}|\d{1,3}))*$/.test(s)) return false;
	const dados = [...s.matchAll(/(\d+)d(\d+)/g)].map((m) => ({ n: Number(m[1]), lados: Number(m[2]) }));
	return dados.length > 0 && dados.every((d) => d.n >= 1 && LADOS.includes(d.lados)) && dados.reduce((t, d) => t + d.n, 0) <= 60;
}
/** Dados aceitos pelo servidor (rolar). */
const LADOS = [2, 3, 4, 6, 8, 10, 12, 20, 100];
