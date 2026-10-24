import { error, json } from '@sveltejs/kit';
import { carregarFichaCompleta } from '#lib/personagem/ficha-completa.server.ts';
import type { RequestHandler } from './$types';

// A ficha completa para a janela da Mesa: o jogador abre só a dele; o Mestre, qualquer uma da campanha.
export const GET: RequestHandler = async ({ locals, params }) => {
	const usuario = await locals.usuarioAtual();
	if (!usuario) error(401, 'Entre para ver a ficha.');
	if (!/^[0-9a-f-]{36}$/i.test(params.id) || !/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { data: campanha } = await locals.supabase.from('campanhas').select('mestre_id, arquivada_em').eq('id', params.id).maybeSingle();
	if (!campanha) error(404, 'Campanha não encontrada.');
	const mestre = campanha.mestre_id === usuario.id;
	const ficha = await carregarFichaCompleta(locals, params.id, params.pid, usuario.id, mestre);
	if (!ficha || (!mestre && !ficha.completa.dono)) error(403, 'Só o dono e o Mestre abrem a ficha completa.');
	return json({ ...ficha, arquivada: !!campanha.arquivada_em });
};
