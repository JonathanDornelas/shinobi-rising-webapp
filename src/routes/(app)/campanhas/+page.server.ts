import { listarCampanhas } from '#lib/campanhas/servidor.ts';
import type { ConvitePendente } from '#lib/supabase/banco.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const usuario = (await locals.usuarioAtual())!;
	const [campanhas, convites] = await Promise.all([listarCampanhas(locals, usuario.id), locals.supabase.rpc('meus_convites')]);
	return {
		titulo: 'Minhas campanhas',
		navTitulo: 'CAMPANHAS',
		campanhas,
		convites: (convites.data ?? []) as unknown as ConvitePendente[]
	};
};
