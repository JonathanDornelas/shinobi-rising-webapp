import { error } from '@sveltejs/kit';
import { clas, jutsus } from '#lib/livro/dados.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => jutsus.map((j) => ({ jutsu: j.slug }));

export const load: PageServerLoad = ({ params }) => {
	const jutsu = jutsus.find((j) => j.slug === params.jutsu);
	if (!jutsu) error(404, 'Jutsu não encontrado');
	return {
		jutsu,
		nomeCla: jutsu.cla ? (clas.find((c) => c.slug === jutsu.cla)?.nome ?? null) : null,
		titulo: jutsu.nome,
		navTitulo: 'JUTSUS',
		descricao: `${jutsu.nome} (${jutsu.traducao}) · ${jutsu.tipo} · Rank ${jutsu.rank} · ${jutsu.custo} · ${jutsu.origem}`
	};
};
