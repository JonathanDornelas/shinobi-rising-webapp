import { capitulos, glossario } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const c22 = capitulos.find((c) => c.numero === 22)!;
	const iSecao = c22.blocos.findIndex((b) => b.tipo === 'h');
	return {
		glossario,
		intro: iSecao > 0 ? c22.blocos.slice(0, iSecao) : [],
		titulo: 'Glossário',
		navTitulo: 'GLOSSÁRIO',
		descricao: 'Glossário e dicionário de Shinobi no Michi: atributos, recursos, elementos, termos em japonês, ranks e termos mecânicos (cap. 22).'
	};
};
