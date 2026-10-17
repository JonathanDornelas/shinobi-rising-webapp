import { capitulos, clas, resumoCla } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const c8 = capitulos.find((c) => c.numero === 8)!;
	const secao = (re: RegExp) => c8.secoes.find((s) => re.test(s.titulo));
	return {
		clas: clas.map(resumoCla),
		hrefCapitulo: c8.href,
		hrefCatalogo: `${c8.href}#${secao(/^8\.3 /)?.id ?? ''}`,
		hrefCriacao: `${c8.href}#${secao(/^8\.4 /)?.id ?? ''}`,
		titulo: 'Clãs',
		navTitulo: 'CLÃS',
		descricao: 'Os 13 clãs do livro de regras de Shinobi no Michi, com vila, Kekkei Genkai, bônus hereditário e marcos por nível.'
	};
};
