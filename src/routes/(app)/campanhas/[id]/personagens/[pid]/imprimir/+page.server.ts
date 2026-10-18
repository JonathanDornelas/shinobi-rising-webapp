import { error } from '@sveltejs/kit';
import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import { catalogoFicha } from '#lib/personagem/catalogo.server.ts';
import type { PageServerLoad } from './$types';

// P6 · Ficha para impressão: só quem vê a ficha completa (dono e Mestre).
export const load: PageServerLoad = async ({ locals, params }) => {
	const usuario = (await locals.usuarioAtual())!;
	if (!/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { campanha, membros } = await carregarCampanha(locals, params.id, usuario.id);
	const { data: p } = await locals.supabase.from('personagens').select('*').eq('id', params.pid).eq('campanha_id', params.id).maybeSingle();
	if (!p) error(404, 'Ficha não encontrada.');
	const cla = (p.resumo as { cla?: string | null })?.cla ?? null;
	return {
		titulo: `${p.nome} · ficha para impressão`,
		navTitulo: 'IMPRIMIR',
		campanha,
		personagem: p,
		jogador: membros.find((m) => m.id === p.jogador_id)?.nome ?? '',
		catalogo: catalogoFicha(cla && !['sem', 'novo-sem-kkg', 'novo-com-kkg'].includes(cla) ? cla : null)
	};
};
