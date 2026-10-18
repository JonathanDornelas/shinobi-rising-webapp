import type { ConvitePublico } from '#lib/supabase/banco.ts';
import type { PageServerLoad } from './$types';

// Funciona para visitantes também: ver_convite é liberado para anon e devolve só dados públicos.
export const load: PageServerLoad = async ({ locals, params }) => {
	const { data, error } = await locals.supabase.rpc('ver_convite', { chave: params.chave });
	const convite = (error ? null : data) as ConvitePublico | null;
	return {
		titulo: convite?.campanha ? `Convite · ${convite.campanha.nome}` : 'Convite',
		navTitulo: 'CONVITE',
		convite,
		chave: params.chave
	};
};
