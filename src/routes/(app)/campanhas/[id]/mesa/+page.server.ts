import { error } from '@sveltejs/kit';
import { extrasDoNpc, fichaMesa, jutsusDoNpc, type ExtrasNpc, type FichaMesa } from '#lib/mesa/fichas.server.ts';
import { molduraPorId } from '#lib/mesa/molduras.ts';
import { mascararCena } from '#lib/mesa/cenas.ts';
import type { MesaArte, MesaCena, MesaCenaPasta, MesaEfeito, MesaJukebox, MesaObjeto, MesaToken, MesaTraco, Npc, NpcPasta, NpcRevelado, Rolagem } from '#lib/supabase/banco.ts';
import type { PageServerLoad } from './$types';

// L11 · M1 · Mesa. O Mestre vê todas as cenas (?cena= escolhe qual preparar); o grupo vê a ativa. As fichas rápidas
// vêm calculadas: o Mestre recebe todas; o jogador, a dele (as outras ficam no resumo público).
export const load: PageServerLoad = async ({ locals, params, parent, url }) => {
	const { campanha, papel, personagens, npcFichas, grupo, membros } = await parent();
	const usuario = (await locals.usuarioAtual())!;
	const mestre = papel === 'mestre';
	const sb = locals.supabase;

	const [{ data: cenas, error: e1 }, { data: cores }, { data: rolagens }, { data: molduras }] = await Promise.all([
		sb.from('mesa_cenas').select('*').eq('campanha_id', params.id).order('criada_em'),
		sb.from('membros').select('usuario_id, cor').eq('campanha_id', params.id),
		sb.from('rolagens').select('*').eq('campanha_id', params.id).order('criada_em', { ascending: false }).limit(50),
		// a moldura de token de cada um (preferência do perfil)
		sb.from('perfis').select('id, moldura:preferencias->>moldura').in('id', membros.map((m) => m.id))
	]);
	if (e1) error(500, 'Não foi possível carregar a Mesa.');
	const pedida = url.searchParams.get('cena');
	const lista = (cenas ?? []) as MesaCena[];
	const cena = (mestre && pedida ? lista.find((c) => c.id === pedida) : null) ?? lista.find((c) => c.ativa) ?? (mestre ? lista[0] : null) ?? null;

	const [{ data: tokens }, { data: tracos }, { data: efeitos }, { data: objetos }] = cena
		? await Promise.all([
				sb.from('mesa_tokens').select('*').eq('cena_id', cena.id).order('criado_em'),
				sb.from('mesa_tracos').select('*').eq('cena_id', cena.id).order('criado_em'),
				sb.from('mesa_efeitos').select('*').eq('cena_id', cena.id).order('criado_em'),
				sb.from('mesa_objetos').select('*').eq('cena_id', cena.id).order('criado_em')
			])
		: [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
	// a música da campanha (todos), as pastas das cenas e a biblioteca de artes (só o Mestre)
	const [{ data: jukebox }, { data: pastasCenas }, { data: artes }] = await Promise.all([
		sb.from('mesa_jukebox').select('*').eq('campanha_id', params.id).maybeSingle(),
		mestre ? sb.from('mesa_cena_pastas').select('*').eq('campanha_id', params.id).order('ordem').order('nome') : Promise.resolve({ data: [] as MesaCenaPasta[] }),
		mestre ? sb.from('mesa_artes').select('*').eq('campanha_id', params.id).order('criada_em', { ascending: false }) : Promise.resolve({ data: [] as MesaArte[] })
	]);

	// fichas completas que dá para ler: o Mestre, todas as ativas; o jogador, a própria
	const jogaveis = personagens.filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && !p.pre_gerado && (mestre || p.jogador_id === usuario.id));
	const ids = [...jogaveis.map((p) => p.id), ...(mestre ? npcFichas.filter((p) => p.status === 'aprovada').map((p) => p.id) : [])];
	const { data: linhas } = ids.length
		? await sb.from('personagens').select('id, jogador_id, nome, nivel, dados, resumo, estado, inventario, ryo, retrato, cla_id, anotacoes, npc, pasta_id').in('id', ids)
		: { data: [] };
	const fichas = (await Promise.all((linhas ?? []).map((l) => fichaMesa(sb, l)))).filter((f): f is FichaMesa => !!f);

	const [{ data: npcs }, { data: pastas }, { data: revelados }] = mestre
		? await Promise.all([
				sb.from('npcs').select('*').eq('campanha_id', params.id).order('nome'),
				sb.from('npc_pastas').select('*').eq('campanha_id', params.id).order('ordem').order('nome'),
				Promise.resolve({ data: [] as NpcRevelado[] })
			])
		: await Promise.all([Promise.resolve({ data: [] as Npc[] }), Promise.resolve({ data: [] as NpcPasta[] }), sb.rpc('npcs_revelados', { campanha: params.id })]);

	return {
		titulo: cena ? `Mesa · ${mascararCena(cena, mestre).nome}` : 'Mesa',
		navTitulo: 'MESA',
		eu: usuario.id,
		mestre,
		arquivada: !!campanha.arquivada_em,
		cenas: lista.map((c) => mascararCena(c, mestre)),
		cena: cena ? mascararCena(cena, mestre) : null,
		tokens: (tokens ?? []) as MesaToken[],
		tracos: (tracos ?? []) as MesaTraco[],
		efeitos: (efeitos ?? []) as MesaEfeito[],
		objetos: (objetos ?? []) as MesaObjeto[],
		jukebox: (jukebox ?? null) as MesaJukebox | null,
		pastasCenas: (pastasCenas ?? []) as MesaCenaPasta[],
		artes: (artes ?? []) as MesaArte[],
		membros: membros.map((m) => ({
			...m,
			cor: (cores ?? []).find((c) => c.usuario_id === m.id)?.cor ?? null,
			moldura: molduraPorId((molduras ?? []).find((p) => p.id === m.id)?.moldura)?.id ?? null
		})),
		personagens: personagens
			.filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && !p.pre_gerado)
			.map((p) => ({ id: p.id, jogadorId: p.jogador_id, nome: p.nome, retrato: p.retrato, sub: [p.resumo.claNome ? `Clã ${p.resumo.claNome}` : null, `nível ${p.nivel}`].filter(Boolean).join(' · ') })),
		npcFichas: mestre
			? (linhas ?? []).filter((l) => l.npc).map((l) => ({ id: l.id, nome: l.nome, pastaId: l.pasta_id as string | null, retrato: l.retrato, nome_oculto: !!npcFichas.find((p) => p.id === l.id)?.nome_oculto }))
			: [],
		grupo: grupo.map((g) => ({ id: g.id, jogadorId: g.jogador_id, nome: g.nome, nivel: g.nivel, cla: g.resumo.claNome ?? null, vila: g.resumo.vila ?? null })),
		fichas,
		npcs: (npcs ?? []) as Npc[],
		// jutsus dos NPCs do bestiário, já com régua e rolagem
		jutsusNpc: Object.fromEntries(((npcs ?? []) as Npc[]).filter((n) => n.jutsus?.length).map((n) => [n.id, jutsusDoNpc(n)])),
		// tamanho, ataques e traços dos NPCs do bestiário
		extrasNpc: Object.fromEntries(((npcs ?? []) as Npc[]).flatMap((n) => {
			const x = extrasDoNpc(n);
			return x ? [[n.id, x] as [string, ExtrasNpc]] : [];
		})),
		pastas: (pastas ?? []) as NpcPasta[],
		revelados: (revelados ?? []) as NpcRevelado[],
		rolagens: (rolagens ?? []) as Rolagem[]
	};
};
