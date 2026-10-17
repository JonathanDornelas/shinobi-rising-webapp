import { error } from '@sveltejs/kit';
import { capitulos, cardsDosBlocos, clas, resumoCla } from '#lib/livro/dados.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

/** Capítulos com página de leitura própria (19 e 22 são as páginas de catálogo D7 e D8). */
const legiveis = () => capitulos.filter((c) => c.href === `/regras/${c.slug}`);

export const entries: EntryGenerator = () => legiveis().map((c) => ({ capitulo: c.slug }));

export const load: PageServerLoad = ({ params }) => {
	const lista = legiveis();
	const i = lista.findIndex((c) => c.slug === params.capitulo);
	if (i < 0) error(404, 'Capítulo não encontrado');
	const capitulo = lista[i];
	const vizinho = (c: (typeof lista)[number] | undefined) => (c ? { numero: c.numero, titulo: c.titulo, href: c.href } : null);
	// a navegação anterior/próximo segue a ordem do livro, inclusive pelos capítulos-catálogo
	const todos = capitulos;
	const j = todos.findIndex((c) => c.numero === capitulo.numero);
	return {
		capitulo,
		...cardsDosBlocos(capitulo.blocos),
		clas: capitulo.blocos.some((b) => b.tipo === 'clas') ? clas.map(resumoCla) : [],
		anterior: vizinho(todos[j - 1]),
		proximo: vizinho(todos[j + 1]),
		titulo: `Cap. ${capitulo.numero} · ${capitulo.titulo}`,
		navTitulo: 'REGRAS',
		descricao: capitulo.resumo
	};
};
