import { bestiario } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	// cada estágio é uma linha: é a tabela para montar encontros pelo orçamento (Como usar)
	linhas: bestiario.criaturas
		.flatMap((c) =>
			c.estagios.map((e, i) => ({
				slug: c.slug,
				verbete: c.nome,
				estagio: c.estagios.length > 1 ? e.nome : null,
				estagioSlug: c.estagios.length > 1 ? e.slug : null,
				indice: i,
				ameaca: e.ameaca,
				ameacaRotulo: e.ameacaRotulo,
				papel: e.papel,
				tipo: c.tipo,
				membros: e.membros,
				pv: e.combate.pv,
				defesa: e.combate.defesa
			}))
		)
		.sort((a, b) => a.ameaca - b.ameaca || a.verbete.localeCompare(b.verbete, 'pt')),
	titulo: 'Adversários por ameaça · Bestiário',
	navTitulo: 'BESTIÁRIO',
	descricao: 'Apêndice do bestiário: todas as fichas de combate em ordem de ameaça, para montar encontros pelo orçamento.'
});
