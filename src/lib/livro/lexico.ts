// Léxico do livro no navegador: os verbetes dos termos destacados no texto (gerado/termos.json), carregados só no
// primeiro hover (num pedaço separado do bundle), e o visual de cada tipo de termo.
import type { TermoLexico, TipoTermo } from './tipos.ts';

let carga: Promise<Map<string, TermoLexico>> | null = null;

export function carregarLexico(): Promise<Map<string, TermoLexico>> {
	carga ??= import('./gerado/termos.json').then((m) => new Map((m.default as TermoLexico[]).map((t) => [t.id, t])));
	return carga;
}

export const tipoDe = (id: string) => id.slice(0, id.indexOf(':')) as TipoTermo;
export const slugDe = (id: string) => id.slice(id.indexOf(':') + 1);

export const ROTULO_TIPO: Record<TipoTermo, string> = {
	recurso: 'Recurso',
	atributo: 'Atributo',
	condicao: 'Condição',
	regra: 'Regra',
	pericia: 'Perícia',
	jutsu: 'Jutsu',
	habilidade: 'Habilidade',
	cla: 'Clã',
	arma: 'Arma',
	elemento: 'Elemento',
	rank: 'Rank de jutsu'
};

export const ROTULO_LINK: Partial<Record<TipoTermo, string>> = {
	jutsu: 'Ver o jutsu',
	habilidade: 'Ver a habilidade',
	cla: 'Ver o clã',
	arma: 'Ver a arma',
	rank: 'Ver os ranks'
};

const RECURSOS_COM_COR = new Set(['pv', 'pc', 'pe', 'pt', 'pd', 'xp', 'pic']);

/** Cor do termo no texto (variáveis --termo-* do layout.css; elementos usam a cor do domínio). */
export function corDoTermo(id: string, corElemento?: string): string | undefined {
	const tipo = tipoDe(id);
	const s = slugDe(id);
	if (tipo === 'recurso') return `var(--termo-${RECURSOS_COM_COR.has(s) ? s : 'recurso'})`;
	if (tipo === 'condicao') return 'var(--termo-condicao)';
	if (tipo === 'pericia') return 'var(--termo-pericia)';
	if (tipo === 'arma') return 'var(--termo-arma)';
	if (tipo === 'jutsu' || tipo === 'habilidade') return 'var(--termo-jutsu)';
	if (tipo === 'cla') return 'var(--termo-cla)';
	if (tipo === 'elemento') return corElemento;
	return undefined;
}

/** Faixa de uma expressão "NdS±M": mínimo, máximo e média. */
export function faixaDado(expr: string): { min: number; max: number; media: number } | null {
	const m = /^(\d+)d(\d+)(?:([+-])(\d+))?$/.exec(expr);
	if (!m) return null;
	const n = +m[1];
	const lados = +m[2];
	const mod = m[4] ? (m[3] === '-' ? -m[4] : +m[4]) : 0;
	return { min: n + mod, max: n * lados + mod, media: (n * (lados + 1)) / 2 + mod };
}
