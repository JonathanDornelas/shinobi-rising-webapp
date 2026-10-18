import { error, redirect } from '@sveltejs/kit';
import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import { claDaFicha } from '#lib/clas/servidor.ts';
import { catalogoFicha } from '#lib/personagem/catalogo.server.ts';
import { xpDoNivel } from '#lib/personagem/progressao.ts';
import { hrefFicha } from '#lib/personagem/status.ts';
import type { PageServerLoad } from './$types';

// P4 · Subir de nível: só o dono, com a ficha aprovada e ativa e XP suficiente.
export const load: PageServerLoad = async ({ locals, params }) => {
	const usuario = (await locals.usuarioAtual())!;
	if (!/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { campanha } = await carregarCampanha(locals, params.id, usuario.id);
	const { data: p } = await locals.supabase.from('personagens').select('*').eq('id', params.pid).eq('campanha_id', params.id).maybeSingle();
	if (!p || p.jogador_id !== usuario.id) error(404, 'Ficha não encontrada.');
	if (p.status !== 'aprovada' || p.situacao !== 'ativo' || campanha.arquivada_em || p.nivel >= 20 || p.xp < xpDoNivel(p.nivel + 1)) redirect(303, hrefFicha(params.id, p.id));
	const cla = (p.resumo as { cla?: string | null })?.cla ?? null;
	return {
		titulo: `${p.nome} · Nível ${p.nivel + 1}`,
		navTitulo: `NÍVEL ${p.nivel} → ${p.nivel + 1}`,
		campanha,
		personagem: p,
		catalogo: catalogoFicha(cla && !['sem', 'novo-sem-kkg', 'novo-com-kkg'].includes(cla) ? cla : null, await claDaFicha(locals.supabase, p.cla_id))
	};
};
