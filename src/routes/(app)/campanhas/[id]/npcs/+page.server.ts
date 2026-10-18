import type { Npc, NpcRevelado } from '#lib/supabase/banco.ts';
import type { PageServerLoad } from './$types';

// N1 · NPCs: o Mestre vê e edita todos; o grupo vê os revelados (sem segredo, notas nem números).
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel } = await parent();
	if (papel === 'mestre') {
		const { data } = await locals.supabase.from('npcs').select('*').eq('campanha_id', params.id).order('criado_em');
		return { titulo: `NPCs · ${campanha.nome}`, navTitulo: 'NPCS', npcs: (data ?? []) as Npc[], revelados: [] as NpcRevelado[] };
	}
	const { data } = await locals.supabase.rpc('npcs_revelados', { campanha: params.id });
	return { titulo: `NPCs conhecidos · ${campanha.nome}`, navTitulo: 'NPCS', npcs: [] as Npc[], revelados: (data ?? []) as NpcRevelado[] };
};
