import { error } from '@sveltejs/kit';
import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import { catalogoCriacao } from '#lib/personagem/catalogo.server.ts';
import type { PageServerLoad } from './$types';

// O criador ocupa a tela toda (sem o menu da campanha): por isso a página sai do layout de [id] e carrega a campanha aqui.
export const load: PageServerLoad = async ({ locals, params }) => {
	const usuario = (await locals.usuarioAtual())!;
	if (!/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { campanha, membros, papel } = await carregarCampanha(locals, params.id, usuario.id);
	const { data: personagem } = await locals.supabase.from('personagens').select('*').eq('id', params.pid).eq('campanha_id', params.id).maybeSingle();
	if (!personagem) error(404, 'Ficha não encontrada.');
	const dono = personagem.jogador_id === usuario.id;
	return {
		titulo: personagem.nome ? `Ficha de ${personagem.nome}` : 'Criar personagem',
		navTitulo: 'CRIAR PERSONAGEM',
		campanha,
		papel,
		personagem,
		dono,
		editavel: dono && (personagem.status === 'rascunho' || personagem.status === 'ajustes') && !campanha.arquivada_em,
		jogador: membros.find((m) => m.id === personagem.jogador_id)?.nome ?? 'Jogador',
		mestre: membros.find((m) => m.papel === 'mestre')?.nome ?? 'O Mestre',
		catalogo: catalogoCriacao(campanha.clas_permitidos)
	};
};
