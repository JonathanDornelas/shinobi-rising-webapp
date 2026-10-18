import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel } = await parent();
	const convites =
		papel === 'mestre'
			? (
					await locals.supabase
						.from('convites')
						.select('id, tipo, email, token, codigo, expira_em, max_usos, usos, status, criado_em')
						.eq('campanha_id', params.id)
						.order('criado_em', { ascending: false })
						.limit(100)
				).data
			: [];
	return { titulo: `Membros · ${campanha.nome}`, navTitulo: 'MEMBROS', convites: convites ?? [] };
};
