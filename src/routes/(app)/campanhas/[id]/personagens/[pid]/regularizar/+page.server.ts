import { error, redirect } from '@sveltejs/kit';
import { carregarFichaCompleta } from '#lib/personagem/ficha-completa.server.ts';
import { hrefFicha } from '#lib/personagem/status.ts';
import type { PageServerLoad } from './$types';

// Regularizar (temporário): a ficha da escala antiga refaz atributos, aprimoramentos e perícias pela regra nova. Só o
// dono (o Mestre, nos NPCs de ficha completa), com a ficha aprovada e ativa e ainda não regularizada.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	if (!/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { campanha, papel } = await parent();
	const usuario = (await locals.usuarioAtual())!;
	const ficha = await carregarFichaCompleta(locals, params.id, params.pid, usuario.id, papel === 'mestre');
	if (!ficha || !ficha.completa.dono) error(404, 'Ficha não encontrada.');
	const p = ficha.completa;
	if (p.status !== 'aprovada' || p.situacao !== 'ativo' || campanha.arquivada_em || (p.dados as { escala?: number })?.escala === 2) redirect(303, hrefFicha(params.id, p.id));
	return { titulo: `Regularizar · ${p.nome}`, navTitulo: 'REGULARIZAR', completa: p, catalogo: ficha.catalogo };
};
