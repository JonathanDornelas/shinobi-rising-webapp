import { error, json } from '@sveltejs/kit';
import { jutsus } from '#lib/livro/dados.server.ts';
import { normalizarJutsu, paraJutsuLivro, type JutsuDados } from '#lib/jutsus/regras.ts';
import type { RequestHandler } from './$types';

// O card inteiro de um jutsu, para o modal da ficha rápida da Mesa: o do catálogo, ou o criado na campanha (jc-<id>,
// lido pela RLS). Assim a página não carrega o catálogo todo para mostrar um card.
export const GET: RequestHandler = async ({ locals, params, setHeaders }) => {
	if (!(await locals.usuarioAtual())) error(401, 'Entre para ver o jutsu.');
	const doLivro = jutsus.find((j) => j.slug === params.slug);
	if (doLivro) {
		setHeaders({ 'cache-control': 'private, max-age=3600' });
		return json(doLivro);
	}
	const id = /^jc-([0-9a-f-]{36})$/.exec(params.slug)?.[1];
	if (id) {
		const { data } = await locals.supabase.from('jutsus_criados').select('dados').eq('id', id).maybeSingle();
		if (data) return json(paraJutsuLivro(params.slug, normalizarJutsu(data.dados as Partial<JutsuDados>), 'Criação própria'));
	}
	error(404, 'Jutsu não encontrado.');
};
