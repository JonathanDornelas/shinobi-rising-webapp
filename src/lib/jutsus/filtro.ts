// Filtros das listas de escolher jutsus (criação da ficha e treino): busca, tipo, rank, elemento, o que faz, ação e "só
// os disponíveis". As mesmas classificações do catálogo e da aba Jutsus (livro/filtros-jutsu.ts).
import { EFEITOS, efeitosDe } from '#lib/livro/filtros-jutsu.ts';
import { normalizar } from '#lib/livro/texto.ts';

export interface FiltroJutsu {
	busca: string;
	tipo: string;
	rank: string;
	elemento: string;
	faz: string;
	acao: string;
	soDisponiveis: boolean;
}
export const filtroVazio = (): FiltroJutsu => ({ busca: '', tipo: '', rank: '', elemento: '', faz: '', acao: '', soDisponiveis: false });

/** O que o filtro precisa saber de cada jutsu da lista. */
export interface CamposJutsu {
	nome: string;
	traducao?: string;
	tipo: string;
	rank: string;
	elemento: string | null;
	/** texto do efeito (para "o que faz" e para a busca) */
	efeito: string;
	acao?: string;
	/** não dá para escolher agora (nível, afinidade, PT) */
	bloqueado?: boolean;
}

/** Elemento "sem" (jutsu sem elemento) tem a chave '-' no filtro. */
export function passa(f: FiltroJutsu, c: CamposJutsu): boolean {
	if (f.tipo && c.tipo !== f.tipo) return false;
	if (f.rank && c.rank !== f.rank) return false;
	if (f.elemento && (c.elemento ?? '-') !== f.elemento) return false;
	if (f.acao && c.acao !== f.acao) return false;
	if (f.soDisponiveis && c.bloqueado) return false;
	if (f.faz && !efeitosDe(c.efeito).includes(f.faz)) return false;
	const q = normalizar(f.busca.trim());
	return !q || normalizar(`${c.nome} ${c.traducao ?? ''} ${c.efeito}`).includes(q);
}

const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
/** As escolhas de cada filtro, só com o que aparece na lista (um filtro com uma opção só não aparece). */
export function opcoesFiltro(lista: CamposJutsu[]) {
	const unicos = (v: (string | undefined)[]) => [...new Set(v.filter((x): x is string => !!x && x !== '—'))];
	const efeitos = new Set(lista.flatMap((c) => efeitosDe(c.efeito)));
	return {
		tipos: unicos(lista.map((c) => c.tipo)).sort(),
		ranks: RANKS.filter((r) => lista.some((c) => c.rank === r)),
		elementos: unicos(lista.map((c) => c.elemento ?? '-')),
		efeitos: [...EFEITOS.map((e) => e.id), 'outros'].filter((e) => efeitos.has(e)),
		acoes: ['Primária', 'Secundária', 'Reação', 'Completa'].filter((a) => lista.some((c) => c.acao === a)),
		temBloqueados: lista.some((c) => c.bloqueado)
	};
}

export const filtroAtivo = (f: FiltroJutsu) => !!(f.busca.trim() || f.tipo || f.rank || f.elemento || f.faz || f.acao || f.soDisponiveis);
