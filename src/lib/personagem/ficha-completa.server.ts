// A ficha completa (P3) com tudo o que a página monta: a linha do personagem, registros, pedidos de PT, catálogo da
// ficha (com os itens criados da campanha) e encomendas a entregar. Serve à página da ficha e à janela da Mesa.
import { claDaFicha } from '#lib/clas/servidor.ts';
import { jutsusDaFicha } from '#lib/jutsus/servidor.ts';
import { itensDaCampanha } from '#lib/equipamentos/catalogo.server.ts';
import { catalogoFicha } from '#lib/personagem/catalogo.server.ts';

const cla = (resumo: unknown) => {
	const c = (resumo as { cla?: string | null })?.cla ?? null;
	return c && !['sem', 'novo-sem-kkg', 'novo-com-kkg'].includes(c) ? c : null;
};

/** null quando a linha não aparece (RLS: só o dono e o Mestre leem a ficha inteira). */
export async function carregarFichaCompleta(locals: App.Locals, campanhaId: string, pid: string, usuarioId: string, mestre: boolean) {
	const { data: p } = await locals.supabase.from('personagens').select('*').eq('id', pid).eq('campanha_id', campanhaId).maybeSingle();
	if (!p) return null;
	const [{ data: registros }, { data: pedidos }, criado, jutsusCriados, { data: itens }, { data: entregas }] = await Promise.all([
		locals.supabase.from('ficha_registros').select('id, tipo, texto, icone, criado_em, ator:perfis!ficha_registros_ator_id_fkey(nome)').eq('personagem_id', p.id).order('criado_em', { ascending: false }).limit(60),
		locals.supabase.from('pedidos_pt').select('id, sessao, semanas, pt, descricao, status, criado_em, comentario').eq('personagem_id', p.id).order('criado_em', { ascending: false }).limit(20),
		claDaFicha(locals.supabase, p.cla_id),
		jutsusDaFicha(locals.supabase, p.id, p.cla_id, p.dados),
		locals.supabase.from('equipamentos_criados').select('id, nome, resumo, anterior_id').eq('campanha_id', campanhaId).eq('tipo', 'item').eq('status', 'aprovado'),
		locals.supabase.from('equipamentos_criados').select('id, tipo, nome, resumo').eq('personagem_id', p.id).eq('status', 'aprovado').eq('entregue', false)
	]);
	const catalogo = catalogoFicha(cla(p.resumo), criado, jutsusCriados);
	// itens criados e aprovados na campanha entram na loja (a versão mais nova de cada um)
	const substituidos = new Set((itens ?? []).map((i) => i.anterior_id).filter(Boolean));
	catalogo.loja.push(...itensDaCampanha((itens ?? []).filter((i) => !substituidos.has(i.id))));
	return {
		completa: { ...p, dono: p.jogador_id === usuarioId, mestre },
		registros: registros ?? [],
		pedidos: pedidos ?? [],
		catalogo,
		entregas: entregas ?? [],
		claCriado: criado ? { id: criado.id, status: criado.status } : null
	};
}

export type FichaCompletaCarregada = NonNullable<Awaited<ReturnType<typeof carregarFichaCompleta>>>;
