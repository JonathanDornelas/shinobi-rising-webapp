import { capitulos, equipamentos } from '#lib/livro/dados.server.ts';
import { normalizar } from '#lib/livro/texto.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	// carga de cada categoria de peso (cap. 11, Tabela de Pesos por Categoria), para o chip "Pesado · 2"
	const carga: Record<string, string> = {};
	for (const aba of equipamentos.abas)
		for (const s of aba.secoes)
			for (const b of s.blocos)
				if (b.tipo === 'tabela' && b.cab?.[0] === 'Categoria' && b.cab?.[1] === 'Carga')
					for (const l of b.linhas) carga[normalizar(l[0].flat().map((t) => t.t).join(''))] = l[1].flat().map((t) => t.t).join('');
	const c12 = capitulos.find((c) => c.numero === 12)!;
	return {
		equipamentos,
		carga,
		hrefArmas: c12.href,
		hrefEspadas: `${c12.href}#${c12.secoes.find((s) => /^As Sete Espadas/.test(s.titulo))?.id ?? ''}`,
		titulo: 'Armas e equipamentos',
		navTitulo: 'EQUIPAMENTOS',
		descricao: 'Armas, Sete Espadas da Névoa, itens utilitários, venenos, pergaminhos, marionetes, qualidade e propriedades (caps. 11 a 13).'
	};
};
