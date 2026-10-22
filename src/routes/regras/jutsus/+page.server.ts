import { clas, jutsus } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	jutsus,
	nomesCla: Object.fromEntries(clas.map((c) => [c.slug, c.nome])),
	titulo: 'Jutsus',
	navTitulo: 'JUTSUS',
	descricao: `Catálogo com os ${jutsus.length} jutsus de Shinobi no Michi, os do livro de regras e os do mangá de Naruto, com filtros por tipo, rank, origem, elemento e custo.`
});
