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
		nEstagios: estagios.length,
		// as variações aparecem no sumário embaixo da categoria, cada uma com a sua ficha e a sua arte
		variacoes: estagios.length > 1 ? estagios.map((e) => ({ slug: e.slug, nome: e.nome, ameacaRotulo: e.ameacaRotulo, arte: e.arte! })) : []
	})),
	fichas: bestiario.criaturas.reduce((n, c) => n + c.estagios.length, 0),
	comoUsar: { titulo: bestiario.comoUsar.titulo, secoes: bestiario.comoUsar.secoes.filter((s) => s.nivel === 2) },
	titulo: 'Bestiário',
	navTitulo: 'BESTIÁRIO',
	descricao: 'O livro de monstros de Shinobi no Michi: arquétipos de ninja, fora da lei, feras, invocações e criaturas, em ordem alfabética, com ameaça, estágios, números de combate, táticas e ganchos.'
});
