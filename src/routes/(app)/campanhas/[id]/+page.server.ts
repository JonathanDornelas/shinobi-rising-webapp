import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel } = await parent();
	const [atividades, convites] = await Promise.all([
		locals.supabase.from('atividades').select('id, texto, icone, criada_em').eq('campanha_id', params.id).order('criada_em', { ascending: false }).limit(8),
		papel === 'mestre'
			? locals.supabase
					.from('convites')
					.select('id, tipo, email, token, codigo, expira_em, max_usos, usos, status, criado_em')
					.eq('campanha_id', params.id)
					.eq('status', 'pendente')
					.order('criado_em', { ascending: false })
			: Promise.resolve({ data: [], error: null })
	]);
	const agora = Date.now();
	return {
		titulo: campanha.nome,
		navTitulo: 'CAMPANHA',
		atividades: atividades.error ? null : atividades.data,
		// só os que ainda valem (não expirados, com usos sobrando)
		convites: (convites.data ?? []).filter((c) => (!c.expira_em || new Date(c.expira_em).getTime() > agora) && (c.max_usos === null || c.usos < c.max_usos))
	};
};
