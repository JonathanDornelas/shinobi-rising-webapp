// L10 · R1 · Dados do registro de rolagens: as rolagens das campanhas de quem está logado (RLS: as ocultas só para quem
// rolou e o Mestre), o aviso das rolagens ocultas do Mestre e o rosto de cada ficha do grupo. Usado pela página global
// (/rolagens) e pela da campanha (/campanhas/[id]/rolagens, com o menu lateral). As novas chegam ao vivo pelo rolador.
import type { AvatarRolagem } from '#lib/componentes/rolagens/EntradaRegistro.svelte';
import type { ResumoClaFicha } from '#lib/componentes/cla/IconeCla.svelte';
import type { Rolagem } from '#lib/supabase/banco.ts';
import type { DadosRegistro } from './registro.ts';

export async function carregarRegistro(locals: App.Locals, campanhaInicial: string | null): Promise<DadosRegistro> {
	const eu = (await locals.usuarioAtual())!.id;
	const desde = new Date(Date.now() - 90 * 864e5).toISOString();
	const [{ data: campanhas }, { data: rolagens }, { data: ocultas }] = await Promise.all([
		locals.supabase.from('campanhas').select('id, nome, mestre_id, arquivada_em').order('atualizada_em', { ascending: false }),
		locals.supabase.from('rolagens').select('*').gte('criada_em', desde).order('criada_em', { ascending: false }).limit(800),
		locals.supabase.rpc('rolagens_ocultas_do_mestre', { desde })
	]);
	const ks = campanhas ?? [];
	// rostos: as fichas aprovadas do grupo de cada campanha
	const grupos = await Promise.all(ks.map((k) => locals.supabase.rpc('personagens_do_grupo', { campanha: k.id })));
	const avatares: Record<string, AvatarRolagem> = {};
	for (const g of grupos) for (const p of g.data ?? []) avatares[p.id] = { retrato: p.retrato, resumo: p.resumo as ResumoClaFicha };
	return {
		eu,
		campanhas: ks.map((k) => ({ id: k.id, nome: k.nome, mestreId: k.mestre_id, arquivada: !!k.arquivada_em })),
		rolagens: (rolagens ?? []) as Rolagem[],
		ocultas: ocultas ?? [],
		avatares,
		campanhaInicial: campanhaInicial && ks.some((k) => k.id === campanhaInicial) ? campanhaInicial : null
	};
}
