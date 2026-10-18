import { error } from '@sveltejs/kit';
import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import { claDaFicha } from '#lib/clas/servidor.ts';
import { normalizarHabilidade, normalizarJutsu, type HabilidadeDados, type JutsuDados } from '#lib/jutsus/regras.ts';
import type { PageServerLoad } from './$types';

// J2 · Criador de jutsu em tela cheia (e a habilidade, J3, em leitura/edição). Também é a tela de revisão do Mestre.
// Com ficha, o criador confere nível, chakra e elementos dela; com a carta de um clã, o rank previsto.
export const load: PageServerLoad = async ({ locals, params, url }) => {
	const usuario = (await locals.usuarioAtual())!;
	if (!/^[0-9a-f-]{36}$/i.test(params.jid)) error(404, 'Jutsu não encontrado.');
	const { campanha, membros, papel, personagens } = await carregarCampanha(locals, params.id, usuario.id);
	const { data: j } = await locals.supabase.from('jutsus_criados').select('*').eq('id', params.jid).eq('campanha_id', params.id).maybeSingle();
	if (!j) error(404, 'Jutsu não encontrado.');
	const dono = j.autor_id === usuario.id;

	const [{ data: ficha }, cla, { data: versaoNova }] = await Promise.all([
		j.personagem_id ? locals.supabase.from('personagens').select('id, nome, nivel, dados').eq('id', j.personagem_id).maybeSingle() : Promise.resolve({ data: null }),
		claDaFicha(locals.supabase, j.cla_id),
		dono && j.status === 'aprovado'
			? locals.supabase.from('jutsus_criados').select('id').eq('anterior_id', j.id).in('status', ['rascunho', 'em_revisao', 'ajustes']).maybeSingle()
			: Promise.resolve({ data: null })
	]);
	const carta = cla && j.carta_id ? (cla.dados.cartas.find((c) => c.id === j.carta_id) ?? null) : null;
	const volta = url.searchParams.get('volta');

	return {
		titulo: j.nome ? `${j.tipo === 'habilidade' ? 'Habilidade' : 'Jutsu'} ${j.nome}` : j.tipo === 'habilidade' ? 'Criar habilidade' : 'Criar jutsu',
		navTitulo: j.tipo === 'habilidade' ? 'HABILIDADE' : 'CRIAR JUTSU',
		campanha,
		papel,
		jutsu: j,
		jutsuDados: j.tipo === 'jutsu' ? normalizarJutsu(j.dados as Partial<JutsuDados>) : null,
		habilidadeDados: j.tipo === 'habilidade' ? normalizarHabilidade(j.dados as Partial<HabilidadeDados>) : null,
		dono,
		editavel: dono && (j.status === 'rascunho' || j.status === 'ajustes') && !campanha.arquivada_em,
		autor: membros.find((m) => m.id === j.autor_id)?.nome ?? 'Ex-membro',
		mestre: membros.find((m) => m.papel === 'mestre')?.nome ?? 'O Mestre',
		ficha: ficha ?? null,
		cla: cla ? { id: cla.id, nome: cla.nome, carta } : null,
		minhasFichas: personagens.filter((p) => p.jogador_id === usuario.id && p.situacao === 'ativo').map((p) => ({ id: p.id, nome: p.nome })),
		versaoNova: versaoNova?.id ?? null,
		volta: volta && volta.startsWith(`/campanhas/${params.id}/`) ? volta : null
	};
};
