import { error, redirect } from '@sveltejs/kit';
import { carregarFichaCompleta } from '#lib/personagem/ficha-completa.server.ts';
import { hrefEditar } from '#lib/personagem/status.ts';
import type { PageServerLoad } from './$types';

// P3 · Ficha. Dono e Mestre veem tudo; os outros membros, só o resumo público de fichas aprovadas.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	if (!/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { campanha, grupo, papel } = await parent();
	const usuario = (await locals.usuarioAtual())!;
	const ficha = await carregarFichaCompleta(locals, params.id, params.pid, usuario.id, papel === 'mestre');

	if (!ficha) {
		const publico = grupo.find((g) => g.id === params.pid);
		if (!publico) error(404, 'Ficha não encontrada.');
		return { titulo: publico.nome, navTitulo: publico.nome.toUpperCase(), publico, completa: null, registros: [], pedidos: [], catalogo: null };
	}
	const p = ficha.completa;
	if (p.dono && p.status === 'rascunho') redirect(303, hrefEditar(params.id, p.id));
	return {
		titulo: p.nome || 'Ficha',
		navTitulo: (p.nome || 'FICHA').toUpperCase(),
		publico: null,
		...ficha,
		arquivada: !!campanha.arquivada_em
	};
};
