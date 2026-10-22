// Busca no livro (G2 e D9). O índice é baixado de /busca.json na primeira busca e montado no navegador.
import MiniSearch from 'minisearch';
import type { DocBusca, TipoDocBusca } from '#lib/livro/tipos.ts';
import { normalizar, semAcentos } from '#lib/livro/texto.ts';

export const GRUPOS: { tipo: TipoDocBusca; rotulo: string; curto: string }[] = [
	{ tipo: 'secao', rotulo: 'Seções do livro', curto: 'Livro' },
	{ tipo: 'jutsu', rotulo: 'Jutsus', curto: 'Jutsus' },
	{ tipo: 'cla', rotulo: 'Clãs', curto: 'Clãs' },
	{ tipo: 'item', rotulo: 'Armas e itens', curto: 'Itens' },
	{ tipo: 'criatura', rotulo: 'Bestiário', curto: 'Bestiário' },
	{ tipo: 'termo', rotulo: 'Glossário', curto: 'Glossário' }
];

export interface Resultado extends DocBusca {
	pontos: number;
}

let indice: Promise<MiniSearch<DocBusca>> | null = null;

function montar(docs: DocBusca[]) {
	const ms = new MiniSearch<DocBusca>({
		fields: ['titulo', 'traducao', 'caminho', 'texto'],
		storeFields: ['id', 'tipo', 'titulo', 'traducao', 'caminho', 'texto', 'href', 'icone', 'rank'],
		processTerm: (t) => normalizar(t) || null,
		searchOptions: { boost: { titulo: 5, traducao: 4, caminho: 1.5 }, prefix: true, combineWith: 'AND' }
	});
	ms.addAll(docs);
	return ms;
}

export function carregarIndice(): Promise<MiniSearch<DocBusca>> {
	indice ??= fetch('/busca.json')
		.then((r) => {
			if (!r.ok) throw new Error(`Índice de busca indisponível (${r.status})`);
			return r.json() as Promise<DocBusca[]>;
		})
		.then(montar)
		.catch((e) => {
			indice = null;
			throw e;
		});
	return indice;
}

/** Busca e devolve os resultados ordenados por relevância, com um bônus para correspondência exata no título. */
export async function buscar(consulta: string): Promise<{ resultados: Resultado[]; sugestao: string | null }> {
	const q = consulta.trim();
	if (!q) return { resultados: [], sugestao: null };
	const ms = await carregarIndice();
	const nq = normalizar(q);
	const ajustar = (r: ReturnType<typeof ms.search>) =>
		r
			.map((x) => {
				// o nome japonês ou a tradução dele contam como título
				const nomes = [x.titulo as string, (x.traducao as string | undefined) ?? ''].map(normalizar);
				const bonus = nomes.includes(nq) ? 3 : nomes.some((n) => n && n.startsWith(nq)) ? 1.5 : 1;
				return { ...(x as unknown as DocBusca), pontos: x.score * bonus };
			})
			.sort((a, b) => b.pontos - a.pontos);
	const resultados = ajustar(ms.search(q));
	if (resultados.length) return { resultados, sugestao: null };
	// sem resultados: tenta com tolerância a erro de digitação para sugerir a grafia certa
	const aproximados = ajustar(ms.search(q, { fuzzy: 0.3, prefix: true, combineWith: 'OR' }));
	return { resultados: [], sugestao: aproximados[0]?.titulo ?? null };
}

/** Agrupa na ordem canônica dos grupos (seções, jutsus, clãs, itens, glossário). */
export function agrupar(resultados: Resultado[], porGrupo = Infinity) {
	return GRUPOS.map((g) => ({ ...g, itens: resultados.filter((r) => r.tipo === g.tipo).slice(0, porGrupo) })).filter(
		(g) => g.itens.length
	);
}

/** Trecho do texto em volta da primeira ocorrência de algum termo da consulta, para destacar com <mark>. */
export function trecho(texto: string, consulta: string, raio = 70): { pre: string; hit: string; pos: string } | null {
	const termos = normalizar(consulta).split(' ').filter((t) => t.length > 1);
	if (!termos.length || !texto) return null;
	// texto normalizado caractere a caractere, mantendo o mapa para o original
	let norm = '';
	const mapa: number[] = [];
	for (let i = 0; i < texto.length; i++) {
		const c = semAcentos(texto[i]).toLowerCase();
		for (const ch of c) {
			norm += ch;
			mapa.push(i);
		}
	}
	let melhor = -1;
	let tam = 0;
	for (const t of termos) {
		const i = norm.indexOf(t);
		if (i >= 0 && (melhor < 0 || i < melhor)) {
			melhor = i;
			tam = t.length;
		}
	}
	if (melhor < 0) return null;
	const ini = mapa[melhor];
	const fim = mapa[melhor + tam - 1] + 1;
	const a = Math.max(0, ini - raio);
	const b = Math.min(texto.length, fim + raio);
	return {
		pre: (a > 0 ? '…' : '') + texto.slice(a, ini).replace(/^\S*\s/, a > 0 ? '' : '$&'),
		hit: texto.slice(ini, fim),
		pos: texto.slice(fim, b) + (b < texto.length ? '…' : '')
	};
}
