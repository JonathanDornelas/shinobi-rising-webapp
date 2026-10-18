import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const usuario = await locals.usuarioAtual();
	// A exclusão da conta fica bloqueada enquanto houver campanhas ativas como Mestre.
	const { data } = await locals.supabase
		.from('campanhas')
		.select('id, nome')
		.eq('mestre_id', usuario!.id)
		.is('arquivada_em', null)
		.order('nome');
	return { titulo: 'Perfil e preferências', navTitulo: 'PERFIL', comoMestre: data ?? [] };
};
