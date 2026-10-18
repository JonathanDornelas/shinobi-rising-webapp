import { fail, redirect } from '@sveltejs/kit';
import { armasBase, itensOficiais } from '#lib/equipamentos/catalogo.server.ts';
import { resumoEquipamento, vazio, type TipoEquipamento } from '#lib/equipamentos/regras.ts';
import type { Json } from '#lib/supabase/banco.ts';
import type { Actions, PageServerLoad } from './$types';

// E1 · Biblioteca de equipamentos: armas do livro, itens utilitários, e as armas forjadas, marionetes e itens da campanha.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha } = await parent();
	const { data: criados } = await locals.supabase
		.from('equipamentos_criados')
		.select('id, tipo, nome, custo, status, versao, anterior_id, resumo, autor_id, personagem_id, enviado_em, atualizado_em')
		.eq('campanha_id', params.id)
		.order('atualizado_em', { ascending: false });
	return { titulo: `Equipamentos · ${campanha.nome}`, navTitulo: 'EQUIPAMENTOS', armas: armasBase(), itens: itensOficiais(), criados: criados ?? [] };
};

export const actions: Actions = {
	// cria o rascunho e abre a forja (E3) ou a oficina (E4); `personagem` é para quem é a encomenda
	criar: async ({ locals, params, request }) => {
		const usuario = (await locals.usuarioAtual())!;
		const form = await request.formData();
		const tipo = String(form.get('tipo')) as TipoEquipamento;
		if (tipo !== 'arma' && tipo !== 'marionete') return fail(400, { erro: 'Tipo inválido.' });
		const personagem = String(form.get('personagem') ?? '');
		const dados = vazio(tipo);
		const { data, error } = await locals.supabase
			.from('equipamentos_criados')
			.insert({
				campanha_id: params.id,
				autor_id: usuario.id,
				tipo,
				personagem_id: /^[0-9a-f-]{36}$/i.test(personagem) ? personagem : null,
				nome: '',
				dados: dados as unknown as Json,
				resumo: resumoEquipamento(tipo, dados) as unknown as Json
			})
			.select('id')
			.single();
		if (error || !data) return fail(400, { erro: 'Não foi possível começar. Confira se a ficha é sua e a campanha está ativa.' });
		redirect(303, `/campanhas/${params.id}/equipamentos/${data.id}`);
	}
};
