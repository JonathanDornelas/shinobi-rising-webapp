import { clas, jutsus } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	jutsus,
	nomesCla: Object.fromEntries(clas.map((c) => [c.slug, c.nome])),
	titulo: 'Jutsus',
	navTitulo: 'JUTSUS',
	descricao: `Catálogo com os ${jutsus.length} jutsus do livro de regras de Shinobi no Michi, com filtros por tipo, rank, origem, elemento e custo.`
});
