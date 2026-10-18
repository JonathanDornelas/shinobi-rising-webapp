import type { Rolagem } from '#lib/supabase/banco.ts';
import type { PageServerLoad } from './$types';

// Registro de rolagens: as 100 mais recentes (as ocultas só para o autor e o Mestre, pelo RLS); as novas chegam ao vivo.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel, personagens } = await parent();
	const eu = (await locals.usuarioAtual())!.id;
	const { data } = await locals.supabase.from('rolagens').select('*').eq('campanha_id', params.id).order('criada_em', { ascending: false }).limit(100);
	// fichas em jogo pelas quais posso rolar: as minhas (o Mestre, todas as aprovadas)
	const fichas = personagens
		.filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && (papel === 'mestre' || p.jogador_id === eu))
		.map((p) => ({ id: p.id, nome: p.nome }));
	return { titulo: `Rolagens · ${campanha.nome}`, navTitulo: 'ROLAGENS', rolagens: (data ?? []) as Rolagem[], fichas, eu };
};
