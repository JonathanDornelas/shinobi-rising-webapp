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
		const usados = t.usados.join(' + ') || '0';
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

// ---------------------------------------------------------------- expressões livres (rolador do registro)

/** Um termo da expressão: dados (com kh/kl opcional) ou um número. */
export type Termo = { sinal: 1 | -1; n: number; lados: number; manter?: 'h' | 'l'; k?: number } | { sinal: 1 | -1; valor: number };

/** Forma que vai para o servidor: sem espaços, sinal de menos comum (− vira -). */
export const normalizar = (e: string) => e.replace(/−/g, '-').replace(/\s+/g, '').toLowerCase();

/** Termos de uma expressão ("2d6 + 1d4 − 1", "4d6kh3"); null se não for válida; [] se vazia. "d20" vale como 1d20. */
export function termos(e: string): Termo[] | null {
	const s = normalizar(e);
	if (!s) return [];
	if (!/^[+-]?(\d*d\d+(k[hl]\d+)?|\d+)([+-](\d*d\d+(k[hl]\d+)?|\d+))*$/.test(s)) return null;
	const saida: Termo[] = [];
	for (const m of s.matchAll(/([+-]?)(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))/g)) {
		if (!m[0]) continue;
		const sinal = m[1] === '-' ? -1 : 1;
		if (m[6]) saida.push({ sinal, valor: Number(m[6]) });
		else saida.push({ sinal, n: m[2] ? Number(m[2]) : 1, lados: Number(m[3]), ...(m[4] ? { manter: m[4] as 'h' | 'l', k: Number(m[5]) } : {}) });
	}
	return saida;
}

/** Texto legível de volta ("2d6 + 1d4 − 1"). */
export function serializar(t: Termo[]): string {
	return t
		.map((x, i) => (i ? (x.sinal < 0 ? ' − ' : ' + ') : x.sinal < 0 ? '−' : '') + ('valor' in x ? x.valor : `${x.n}d${x.lados}${x.manter ? `k${x.manter}${x.k}` : ''}`))
		.join('');
}

/** Problema da expressão em palavras (o servidor confere de novo); null se pode rolar. */
export function erroExpressao(e: string): string | null {
	const t = termos(e);
	if (t && !t.length) return 'Digite uma expressão, por exemplo 1d20 + 5.';
	if (!t || normalizar(e).length > 60) return 'Expressão inválida. Use dados e números somados, como 2d6 + 3 ou 1d20 − 1.';
	let dados = 0;
	for (const x of t) {
		if ('valor' in x) {
			if (x.valor > 9999) return 'Número grande demais.';
			continue;
		}
		if (x.n < 1 || x.n > 50) return 'Use de 1 a 50 dados por termo.';
		if (x.lados < 2 || x.lados > 1000) return 'O dado precisa ter de 2 a 1000 lados.';
		if (x.manter && (x.k! < 1 || x.k! > x.n)) return `kh/kl precisa manter entre 1 e ${x.n} dados.`;
		dados += x.n;
	}
	if (!dados) return 'Inclua pelo menos um dado, como 1d20.';
	if (dados > 100) return 'Dados demais numa rolagem só (máximo 100).';
	return null;
}

/** Validação local antes de mandar (o servidor confere de novo). */
export const expressaoValida = (e: string) => erroExpressao(e) === null;

/** Para o servidor: "d20" vira "1d20" e o resto fica normalizado. */
export function paraServidor(e: string): string {
	const t = termos(e);
	return t ? serializar(t).replace(/\s+/g, '').replace(/−/g, '-') : normalizar(e);
}

/** Quantos dados de `lados` (somando os positivos, sem kh/kl) a expressão tem; usado nos contadores dos botões. */
export function contarDados(e: string, lados: number): number {
	return (termos(e) ?? []).reduce((s, x) => s + ('lados' in x && x.lados === lados && !x.manter ? x.n * x.sinal : 0), 0);
}

/** Clique no dado: +1 dado de `lados` (botão direito: −1). Os números ficam no fim da expressão. */
export function ajustarDado(e: string, lados: number, delta: 1 | -1): string {
	let t = termos(e);
	if (!t) return delta > 0 ? `${e.trim() ? `${e.trim()} + ` : ''}1d${lados}` : e;
	const i = t.findIndex((x) => 'lados' in x && x.lados === lados && x.sinal > 0 && !x.manter);
	if (i >= 0) {
		const atual = t[i] as Extract<Termo, { n: number }>;
		const n = atual.n + delta;
		t = n > 0 ? t.map((x, j) => (j === i ? { ...atual, n: Math.min(50, n) } : x)) : t.filter((_, j) => j !== i);
	} else if (delta > 0) {
		const novo: Termo = { sinal: 1, n: 1, lados };
		const num = t.findIndex((x) => 'valor' in x);
		t = num >= 0 ? [...t.slice(0, num), novo, ...t.slice(num)] : [...t, novo];
	}
	// um número sozinho na frente vai para depois dos dados
	if (t.length && 'valor' in t[0] && t[0].sinal > 0 && t.some((x) => 'lados' in x)) {
		const d = t.findIndex((x) => 'lados' in x);
		t = [t[d], ...t.filter((_, j) => j !== d)];
	}
	return serializar(t);
}

/** Botões de modificador (−1, +1, +2, +5): somam um número no fim. */
export function somarModificador(e: string, mod: number): string {
	const base = e.trim();
	if (!base) return String(mod);
	return `${base} ${mod < 0 ? '−' : '+'} ${Math.abs(mod)}`;
}

/** Os 7 dados com arte e botão no rolador. */
export const DADOS = [4, 6, 8, 10, 12, 20, 100] as const;
