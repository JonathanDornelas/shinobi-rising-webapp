import { fail, redirect } from '@sveltejs/kit';
import { jutsus as jutsusDoLivro } from '#lib/livro/dados.server.ts';
import { jutsuVazio, resumoJutsu } from '#lib/jutsus/regras.ts';
import { hrefJutsu } from '#lib/jutsus/status.ts';
import type { Json } from '#lib/supabase/banco.ts';
import type { Actions, PageServerLoad } from './$types';

// J1 · Biblioteca de jutsus: oficiais do livro, criados aprovados na campanha e as criações de cada um.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha } = await parent();
	const usuario = (await locals.usuarioAtual())!;
	const [{ data: criados }, { data: clas }, { data: nomesClas }] = await Promise.all([
		locals.supabase
			.from('jutsus_criados')
			.select('id, tipo, nome, rank, status, versao, anterior_id, resumo, autor_id, personagem_id, cla_id, enviado_em, atualizado_em')
			.eq('campanha_id', params.id)
			.order('atualizado_em', { ascending: false }),
		locals.supabase.from('clas').select('id, nome, status').eq('campanha_id', params.id).eq('autor_id', usuario.id).neq('status', 'rejeitado'),
		locals.supabase.from('clas').select('id, nome').eq('campanha_id', params.id)
	]);
	const oficiais = jutsusDoLivro.map((j) => ({ slug: j.slug, nome: j.nome, rank: j.rank, tipo: j.tipo, custo: j.custo, origem: j.origem, elemento: j.elemento }));
	return { titulo: `Jutsus · ${campanha.nome}`, navTitulo: 'JUTSUS', oficiais, criados: criados ?? [], meusClas: clas ?? [], nomesClas: Object.fromEntries((nomesClas ?? []).map((c) => [c.id, c.nome])) as Record<string, string> };
};

export const actions: Actions = {
	// cria o rascunho do jutsu e abre o criador (J2); `personagem` liga o jutsu à ficha, `cla` + `carta` a um clã criado
	criar: async ({ locals, params, request }) => {
		const usuario = (await locals.usuarioAtual())!;
		const form = await request.formData();
		const uuid = (v: FormDataEntryValue | null) => (typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v) ? v : null);
		const personagem = uuid(form.get('personagem'));
		const cla = uuid(form.get('cla'));
		const carta = typeof form.get('carta') === 'string' ? String(form.get('carta')).slice(0, 20) || null : null;
		const volta = String(form.get('volta') ?? '');
		const dados = jutsuVazio();
		const nome = String(form.get('nome') ?? '').slice(0, 60);
		dados.nome = nome;
		const { data, error } = await locals.supabase
			.from('jutsus_criados')
			.insert({ campanha_id: params.id, autor_id: usuario.id, tipo: 'jutsu', personagem_id: personagem, cla_id: cla, carta_id: cla ? carta : null, nome, dados: dados as unknown as Json, resumo: resumoJutsu(dados) as unknown as Json })
			.select('id')
			.single();
		if (error || !data) return fail(400, { erro: 'Não foi possível criar o jutsu. Confira se a ficha ou o clã são seus e a campanha está ativa.' });
		redirect(303, hrefJutsu(params.id, data.id, volta.startsWith(`/campanhas/${params.id}/`) ? volta : null));
	}
};
