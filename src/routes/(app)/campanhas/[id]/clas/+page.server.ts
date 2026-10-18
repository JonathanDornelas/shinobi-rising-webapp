import { fail, redirect } from '@sveltejs/kit';
import { clas as clasDoLivro } from '#lib/livro/dados.server.ts';
import { claVazio, resumoCla } from '#lib/clas/regras.ts';
import { hrefCla } from '#lib/clas/status.ts';
import type { Json } from '#lib/supabase/banco.ts';
import type { Actions, PageServerLoad } from './$types';

// K1 · Biblioteca de clãs: oficiais permitidos na campanha, clãs aprovados da campanha e as criações de cada um.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha } = await parent();
	const { data: criados } = await locals.supabase
		.from('clas')
		.select('id, nome, kkg, status, versao, anterior_id, resumo, autor_id, enviado_em, atualizado_em')
		.eq('campanha_id', params.id)
		.order('atualizado_em', { ascending: false });
	const oficiais = clasDoLivro
		.filter((c) => campanha.clas_permitidos.includes(c.slug))
		.map((c) => ({ slug: c.slug, nome: c.nome, epiteto: c.epiteto, vila: c.vila?.nome ?? null, kkg: c.kkg?.nome ?? null }));
	return { titulo: `Clãs · ${campanha.nome}`, navTitulo: 'CLÃS', oficiais, criados: criados ?? [] };
};

export const actions: Actions = {
	// cria o rascunho e abre o criador (K2); `ficha` volta para o passo 4 da criação de personagem
	criar: async ({ locals, params, request }) => {
		const usuario = (await locals.usuarioAtual())!;
		const form = await request.formData();
		const kkg = form.get('kkg') === 'sim';
		const ficha = String(form.get('ficha') ?? '');
		const dados = claVazio(kkg);
		const { data, error } = await locals.supabase
			.from('clas')
			.insert({ campanha_id: params.id, autor_id: usuario.id, nome: '', kkg, dados: dados as unknown as Json, resumo: resumoCla(dados) as unknown as Json })
			.select('id')
			.single();
		if (error || !data) return fail(400, { erro: `A campanha não permite clãs personalizados ${kkg ? 'com' : 'sem'} KKG, ou você não faz parte dela.` });
		redirect(303, hrefCla(params.id, data.id, /^[0-9a-f-]{36}$/i.test(ficha) ? ficha : null));
	}
};
