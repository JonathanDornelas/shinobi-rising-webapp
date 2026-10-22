import { error } from '@sveltejs/kit';
import { capitulos, clas, habilidades, jutsus } from '#lib/livro/dados.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => clas.map((c) => ({ cla: c.slug }));

export const load: PageServerLoad = ({ params }) => {
	const i = clas.findIndex((c) => c.slug === params.cla);
	if (i < 0) error(404, 'Clã não encontrado');
	const cla = clas[i];
	const c8 = capitulos.find((c) => c.numero === 8)!;
	const ancora = (re: RegExp) => {
		const s = c8.secoes.find((x) => re.test(x.titulo));
		return s ? `${c8.href}#${s.id}` : c8.href;
	};
	// os citados no texto do clã e os do catálogo marcados com o clã (os importados da wiki)
	const js = jutsus.filter((j) => cla.jutsus.includes(j.slug) || j.cla === cla.slug);
	const hs = habilidades.filter((h) => cla.habilidades.includes(h.slug));
	return {
		cla,
		jutsus: Object.fromEntries(js.map((j) => [j.slug, j])),
		habilidades: Object.fromEntries(hs.map((h) => [h.slug, h])),
		links: {
			dojutsu: ancora(/^Sistema de Dōjutsu/),
			perdaOlho: ancora(/^Perda de Um Olho/),
			transferencia: ancora(/^Transferência de Olhos/),
			catalogo: ancora(/^8\.3 /),
			companheiros: capitulos.find((c) => c.numero === 14)!.href
		},
		anterior: clas[i - 1] ? { slug: clas[i - 1].slug, nome: clas[i - 1].nome } : null,
		proximo: clas[i + 1] ? { slug: clas[i + 1].slug, nome: clas[i + 1].nome } : null,
		titulo: `Clã ${cla.nome}`,
		navTitulo: 'CLÃS',
		descricao: `Clã ${cla.nome} — ${cla.epiteto}. Bônus hereditário, Kekkei Genkai, marcos por nível, jutsus e política (cap. ${cla.numero}).`
	};
};
