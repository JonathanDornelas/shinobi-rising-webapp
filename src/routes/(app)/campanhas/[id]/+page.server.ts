import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel } = await parent();
	const mestre = papel === 'mestre';
	const sb = locals.supabase;
	const conta = (tabela: 'mesa_cenas' | 'clas' | 'jutsus_criados' | 'equipamentos_criados') => sb.from(tabela).select('id', { count: 'exact', head: true }).eq('campanha_id', params.id);
	const [atividades, convites, cenaAtiva, npcs, cenas, clas, jutsus, equipamentos] = await Promise.all([
		sb.from('atividades').select('id, texto, icone, criada_em').eq('campanha_id', params.id).order('criada_em', { ascending: false }).limit(8),
		mestre
			? sb
					.from('convites')
					.select('id, tipo, email, token, codigo, expira_em, max_usos, usos, status, criado_em')
					.eq('campanha_id', params.id)
					.eq('status', 'pendente')
					.order('criado_em', { ascending: false })
			: Promise.resolve({ data: [], error: null }),
		// a cena que o grupo vê agora (o atalho da Mesa no painel)
		sb.from('mesa_cenas').select('id, nome, modo').eq('campanha_id', params.id).eq('ativa', true).maybeSingle(),
		mestre ? sb.from('npcs').select('id, nome, funcao, rank, arte').eq('campanha_id', params.id).order('criado_em', { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
		// primeiros passos: o que já existe na campanha
		mestre ? conta('mesa_cenas') : Promise.resolve({ count: 0 }),
		mestre ? conta('clas') : Promise.resolve({ count: 0 }),
		mestre ? conta('jutsus_criados') : Promise.resolve({ count: 0 }),
		mestre ? conta('equipamentos_criados') : Promise.resolve({ count: 0 })
	]);
	const agora = Date.now();
	return {
		titulo: campanha.nome,
		navTitulo: 'CAMPANHA',
		atividades: atividades.error ? null : atividades.data,
		// só os que ainda valem (não expirados, com usos sobrando)
		convites: (convites.data ?? []).filter((c) => (!c.expira_em || new Date(c.expira_em).getTime() > agora) && (c.max_usos === null || c.usos < c.max_usos)),
		cenaAtiva: cenaAtiva.data ?? null,
		npcsRecentes: npcs.data ?? [],
		feito: { cenas: (cenas.count ?? 0) > 0, conteudo: (clas.count ?? 0) + (jutsus.count ?? 0) + (equipamentos.count ?? 0) > 0 }
	};
};
