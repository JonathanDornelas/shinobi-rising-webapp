import { error, redirect } from '@sveltejs/kit';
import { claDaFicha } from '#lib/clas/servidor.ts';
import { catalogoFicha } from '#lib/personagem/catalogo.server.ts';
import { hrefEditar } from '#lib/personagem/status.ts';
import type { PageServerLoad } from './$types';

// P3 · Ficha. Dono e Mestre veem tudo; os outros membros, só o resumo público de fichas aprovadas.
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	if (!/^[0-9a-f-]{36}$/i.test(params.pid)) error(404, 'Ficha não encontrada.');
	const { campanha, grupo, papel } = await parent();
	const usuario = (await locals.usuarioAtual())!;
	const { data: p } = await locals.supabase.from('personagens').select('*').eq('id', params.pid).eq('campanha_id', params.id).maybeSingle();

	if (!p) {
		const publico = grupo.find((g) => g.id === params.pid);
		if (!publico) error(404, 'Ficha não encontrada.');
		return { titulo: publico.nome, navTitulo: publico.nome.toUpperCase(), publico, completa: null, registros: [], pedidos: [], catalogo: null };
	}
	const dono = p.jogador_id === usuario.id;
	if (dono && p.status === 'rascunho') redirect(303, hrefEditar(params.id, p.id));

	const [{ data: registros }, { data: pedidos }, criado] = await Promise.all([
		locals.supabase.from('ficha_registros').select('id, tipo, texto, icone, criado_em, ator:perfis!ficha_registros_ator_id_fkey(nome)').eq('personagem_id', p.id).order('criado_em', { ascending: false }).limit(60),
		locals.supabase.from('pedidos_pt').select('id, sessao, semanas, pt, descricao, status, criado_em, comentario').eq('personagem_id', p.id).order('criado_em', { ascending: false }).limit(20),
		claDaFicha(locals.supabase, p.cla_id)
	]);
	const cla = (p.resumo as { cla?: string | null })?.cla ?? null;
	return {
		titulo: p.nome || 'Ficha',
		navTitulo: (p.nome || 'FICHA').toUpperCase(),
		publico: null,
		completa: { ...p, dono, mestre: papel === 'mestre' },
		registros: registros ?? [],
		pedidos: pedidos ?? [],
		catalogo: catalogoFicha(cla && !['sem', 'novo-sem-kkg', 'novo-com-kkg'].includes(cla) ? cla : null, criado),
		claCriado: criado ? { id: criado.id, status: criado.status } : null,
		arquivada: !!campanha.arquivada_em
	};
};
