import { capitulos, especializacoes } from '#lib/livro/dados.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	// custo para subir de nível na especialização (cap. 18, Gastando Pontos de Treino)
	const c18 = capitulos.find((c) => c.numero === 18)!;
	const texto = (cel: { t: string }[][]) => cel.flat().map((t) => t.t).join('');
	const subir = c18.blocos
		.flatMap((b) => (b.tipo === 'tabela' && b.cab?.[0] === 'Aplicação' ? b.linhas : []))
		.filter((l) => /^Especialização/.test(texto(l[0])))
		.map((l) => ({ passo: texto(l[0]).replace(/^Especialização\s*\(|\)$/g, ''), custo: texto(l[1]), nota: texto(l[2] ?? []) }));
	const secao = c18.secoes.find((s) => /^Gastando Pontos de Treino/.test(s.titulo));
	return {
		especializacoes,
		subir,
		hrefTreino: `${c18.href}#${secao?.id ?? ''}`,
		titulo: 'Especializações',
		navTitulo: 'ESPECIALIZAÇÕES',
		descricao: 'As 16 especializações de Shinobi no Michi, com os benefícios de cada um dos 3 níveis (cap. 19).'
	};
};
