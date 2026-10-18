// Consultas de campanha feitas no servidor (RLS com a sessão dos cookies).
import { error } from '@sveltejs/kit';
import type { ResumoFicha } from '#lib/personagem/regras.ts';
import type { Papel } from '#lib/supabase/banco.ts';

/** Registra a causa no log do servidor (Vercel) e mostra a mensagem genérica ao usuário. */
function falhou(onde: string, e: { code?: string; message: string }, mensagem: string): never {
	console.error(`[supabase] ${onde}: ${e.code ?? ''} ${e.message}`);
	error(503, mensagem);
}

export type ResumoCampanha = Awaited<ReturnType<typeof listarCampanhas>>[number];

/** C1: campanhas da conta, com papel, membros e a última atividade. */
export async function listarCampanhas(locals: App.Locals, usuarioId: string) {
	const { data, error: e } = await locals.supabase
		.from('campanhas')
		.select(
			'id, nome, capa, era, era_alternativa, nivel_inicial, mestre_id, arquivada_em, criada_em, atualizada_em, mestre:perfis!campanhas_mestre_id_fkey(nome), membros(usuario_id, papel, perfil:perfis!membros_usuario_id_fkey(nome))'
		)
		.order('atualizada_em', { ascending: false });
	if (e) falhou('listar campanhas', e, 'Não foi possível carregar as campanhas.');
	const lista = data ?? [];
	const ids = lista.map((c) => c.id);
	const { data: atividades } = ids.length
		? await locals.supabase.from('atividades').select('campanha_id, texto, criada_em').in('campanha_id', ids).order('criada_em', { ascending: false }).limit(200)
		: { data: [] };
	const ultima = new Map<string, { texto: string; criada_em: string }>();
	for (const a of atividades ?? []) if (!ultima.has(a.campanha_id)) ultima.set(a.campanha_id, a);

	return lista.map((c) => {
		const membros = c.membros ?? [];
		const meu = membros.find((m) => m.usuario_id === usuarioId);
		const jogadores = membros.filter((m) => m.papel === 'jogador');
		return {
			id: c.id,
			nome: c.nome,
			capa: c.capa,
			era: c.era,
			era_alternativa: c.era_alternativa,
			nivel_inicial: c.nivel_inicial,
			arquivada_em: c.arquivada_em,
			papel: (meu?.papel ?? (c.mestre_id === usuarioId ? 'mestre' : 'jogador')) as Papel,
			mestre: c.mestre?.nome ?? null,
			jogadores: jogadores.length,
			nomesJogadores: jogadores.map((m) => m.perfil?.nome ?? '?'),
			ultima: ultima.get(c.id) ?? null
		};
	});
}

/** Campanha aberta (layout de /campanhas/[id]): 404 se não existe ou a conta não é membro. */
export async function carregarCampanha(locals: App.Locals, id: string, usuarioId: string) {
	if (!/^[0-9a-f-]{36}$/i.test(id)) error(404, 'Campanha não encontrada.');
	const { data: campanha, error: e } = await locals.supabase.from('campanhas').select('*').eq('id', id).maybeSingle();
	if (e) falhou('carregar campanha', e, 'Não foi possível carregar a campanha.');
	if (!campanha) error(404, 'Campanha não encontrada.');
	const { data: membros } = await locals.supabase
		.from('membros')
		.select('usuario_id, papel, entrou_em, perfil:perfis!membros_usuario_id_fkey(nome, avatar)')
		.eq('campanha_id', id)
		.order('entrou_em');
	const lista = (membros ?? []).map((m) => ({ id: m.usuario_id, papel: m.papel, entrou_em: m.entrou_em, nome: m.perfil?.nome ?? '?' }));
	const papel: Papel = campanha.mestre_id === usuarioId ? 'mestre' : 'jogador';
	// RLS: o Mestre vê todas as fichas; o jogador, só as próprias. O grupo aparece pelo resumo público.
	const conta = (tabela: 'clas' | 'jutsus_criados' | 'equipamentos_criados') =>
		papel === 'mestre' ? locals.supabase.from(tabela).select('id', { count: 'exact', head: true }).eq('campanha_id', id).eq('status', 'em_revisao') : Promise.resolve({ count: 0 });
	const [{ data: fichas }, { data: grupo }, { data: pedidos }, clasPend, jutsusPend, equipPend] = await Promise.all([
		locals.supabase
			.from('personagens')
			.select('id, jogador_id, nome, status, situacao, nivel, xp, pt, resumo, estado, enviada_em, decidida_em, comentario_mestre, atualizada_em, epitafio, pre_gerado, excecao, ryo, retrato')
			.eq('campanha_id', id)
			.neq('status', 'rejeitada')
			.order('criada_em'),
		locals.supabase.rpc('personagens_do_grupo', { campanha: id }),
		papel === 'mestre'
			? locals.supabase.from('pedidos_pt').select('id, personagem_id, sessao, semanas, pt, descricao, criado_em').eq('campanha_id', id).eq('status', 'pendente').order('criado_em')
			: Promise.resolve({ data: [] }),
		conta('clas'),
		conta('jutsus_criados'),
		conta('equipamentos_criados')
	]);
	const personagens = (fichas ?? []).map((f) => ({ ...f, resumo: f.resumo as Partial<ResumoFicha> }));
	const publicos = (grupo ?? []).map((g) => ({ ...g, resumo: g.resumo as Partial<ResumoFicha> }));
	// fila do Mestre: fichas, clãs, jutsus, equipamentos e pedidos de PT esperando decisão
	const pendentes =
		papel === 'mestre'
			? personagens.filter((p) => p.status === 'em_revisao').length + (pedidos ?? []).length + (clasPend.count ?? 0) + (jutsusPend.count ?? 0) + (equipPend.count ?? 0)
			: 0;
	return { campanha, membros: lista, papel, personagens, grupo: publicos, pedidosPt: pedidos ?? [], pendentes };
}
