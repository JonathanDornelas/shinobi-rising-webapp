// HUD de ação da Mesa (inspirado no Baldur's Gate 3): os dados de uma expressão ("2d6+3"), a faixa de dano (5~15) e a
// cor do elemento do jutsu, que pinta o dano na ficha rápida, no tooltip, na régua e no chat.
import { ELEMENTO } from '#lib/livro/dominio.ts';

export interface DadosExpr {
	dados: { n: number; lados: number }[];
	mod: number;
	min: number;
	max: number;
}

/** Lê "2d6+3", "1d20+4", "3d8+1d6−2"; null quando não é uma expressão de dados. */
export function lerDados(expr: string): DadosExpr | null {
	const termos = expr.replace(/\s+/g, '').replace(/−/g, '-').match(/[+-]?[^+-]+/g);
	if (!termos) return null;
	const dados: DadosExpr['dados'] = [];
	let mod = 0;
	for (const termo of termos) {
		const d = /^([+-]?)(\d*)d(\d+)$/i.exec(termo);
		if (d) {
			dados.push({ n: +(d[2] || 1) * (d[1] === '-' ? -1 : 1), lados: +d[3] });
			continue;
		}
		if (!/^[+-]?\d+$/.test(termo)) return null;
		mod += +termo;
	}
	if (!dados.length) return null;
	const min = dados.reduce((s, d) => s + (d.n > 0 ? d.n : d.n * d.lados), 0) + mod;
	const max = dados.reduce((s, d) => s + (d.n > 0 ? d.n * d.lados : d.n), 0) + mod;
	return { dados, mod, min, max };
}

/** Os dados com arte em /dados/d<lados>.png. */
export const temArte = (lados: number) => [4, 6, 8, 10, 12, 20, 100].includes(lados);

/** A chave do elemento (katon, suiton…): o do jutsu, ou um elemento citado no nome ("Katon: Goukakyu"). */
export function chaveElemento(elemento?: string | null, nome = ''): string | null {
	return elemento && ELEMENTO[elemento] ? elemento : (Object.keys(ELEMENTO).find((e) => new RegExp(`(^|[^\\p{L}])(${e}|${ELEMENTO[e].nome})(?![\\p{L}])`, 'iu').test(nome)) ?? null);
}

/** A cor e o nome do dano: o elemento do jutsu, ou um elemento citado no nome ("Katon: Goukakyu"). */
export function corElemento(elemento?: string | null, nome = ''): { cor: string; nome: string } | null {
	const k = chaveElemento(elemento, nome);
	return k ? { cor: ELEMENTO[k].cor, nome: ELEMENTO[k].traducao } : null;
}
