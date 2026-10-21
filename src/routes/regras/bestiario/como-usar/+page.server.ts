import { bestiario } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	comoUsar: bestiario.comoUsar,
	titulo: `${bestiario.comoUsar.titulo} · Bestiário`,
	navTitulo: 'BESTIÁRIO',
	descricao: bestiario.comoUsar.resumo
});
