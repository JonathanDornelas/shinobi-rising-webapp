import { error } from '@sveltejs/kit';
import { bestiario } from '#lib/livro/dados.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => bestiario.criaturas.map((c) => ({ criatura: c.slug }));

export const load: PageServerLoad = ({ params }) => {
	// a lista já vem em ordem alfabética do compilador: folhear é andar nela
	const lista = bestiario.criaturas;
	const i = lista.findIndex((c) => c.slug === params.criatura);
	if (i < 0) error(404, 'Verbete não encontrado');
	const c = lista[i];
	const vizinho = (v: (typeof lista)[number] | undefined) => (v ? { slug: v.slug, nome: v.nome } : null);
	return {
		criatura: c,
		/** Número da página no livro; também alterna o lado da arte e a moldura, para páginas seguidas não ficarem iguais. */
		pagina: i + 1,
		total: lista.length,
		anterior: vizinho(lista[i - 1]),
		proximo: vizinho(lista[i + 1]),
		titulo: `${c.nome} · Bestiário`,
		navTitulo: 'BESTIÁRIO',
		descricao: `${c.nome}, ameaça ${c.ameacaFaixa}. ${c.descricao.map((p) => p.map((t) => t.t).join('')).join(' ')}`.slice(0, 300)
	};
};
