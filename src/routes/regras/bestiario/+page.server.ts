import { bestiario } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	criaturas: bestiario.criaturas.map(({ slug, nome, letra, tipo, ameacaMin, ameacaMax, ameacaFaixa, vila, arte, estagios }) => ({
		slug,
		nome,
		letra,
		tipo,
		ameacaMin,
		ameacaMax,
		ameacaFaixa,
		vila,
		arte,
		papel: estagios.length === 1 ? estagios[0].papel : null,
		nEstagios: estagios.length
	})),
	fichas: bestiario.criaturas.reduce((n, c) => n + c.estagios.length, 0),
	comoUsar: { titulo: bestiario.comoUsar.titulo, secoes: bestiario.comoUsar.secoes.filter((s) => s.nivel === 2) },
	titulo: 'Bestiário',
	navTitulo: 'BESTIÁRIO',
	descricao: 'O livro de monstros de Shinobi no Michi: os shinobi de cada vila do Genin ao Kage, clãs, o Sennin, organizações, fora da lei, feras, invocações e criaturas, em ordem alfabética, com ameaça, níveis, números de combate, táticas e ganchos.'
});
