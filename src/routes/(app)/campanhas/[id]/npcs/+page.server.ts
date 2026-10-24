import type { Npc, NpcPasta, NpcRevelado } from '#lib/supabase/banco.ts';
import type { PageServerLoad } from './$types';

// N1 · NPCs: o Mestre vê e edita todos; o grupo vê os revelados (sem segredo, notas nem números).
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha, papel } = await parent();
	if (papel === 'mestre') {
		const [{ data }, { data: pastas }] = await Promise.all([
			locals.supabase.from('npcs').select('*').eq('campanha_id', params.id).order('criado_em'),
			locals.supabase.from('npc_pastas').select('*').eq('campanha_id', params.id).order('ordem').order('nome')
		]);
		return { titulo: `NPCs · ${campanha.nome}`, navTitulo: 'NPCS', npcs: (data ?? []) as Npc[], pastas: (pastas ?? []) as NpcPasta[], revelados: [] as NpcRevelado[] };
	}
	const { data } = await locals.supabase.rpc('npcs_revelados', { campanha: params.id });
	return { titulo: `NPCs conhecidos · ${campanha.nome}`, navTitulo: 'NPCS', npcs: [] as Npc[], pastas: [] as NpcPasta[], revelados: (data ?? []) as NpcRevelado[] };
};
