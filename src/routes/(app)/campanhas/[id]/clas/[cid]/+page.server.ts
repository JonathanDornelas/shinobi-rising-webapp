import { error } from '@sveltejs/kit';
import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import { normalizarCla, type ClaDados } from '#lib/clas/regras.ts';
import { clas as clasDoLivro } from '#lib/livro/dados.server.ts';
import { jutsusParaCla } from '#lib/personagem/catalogo.server.ts';
import type { PageServerLoad } from './$types';

// K2 · Criador de clã em tela cheia (fora do layout de [id]). Também é a leitura do clã enviado/aprovado e a tela em que
// o Mestre decide. `?ficha=` liga a volta para o passo 4 da criação de personagem.
export const load: PageServerLoad = async ({ locals, params, url }) => {
	const usuario = (await locals.usuarioAtual())!;
	if (!/^[0-9a-f-]{36}$/i.test(params.cid)) error(404, 'Clã não encontrado.');
	const { campanha, membros, papel } = await carregarCampanha(locals, params.id, usuario.id);
	const { data: cla } = await locals.supabase.from('clas').select('*').eq('id', params.cid).eq('campanha_id', params.id).maybeSingle();
	if (!cla) error(404, 'Clã não encontrado.');
	const dono = cla.autor_id === usuario.id;

	const fichaId = url.searchParams.get('ficha');
	const [{ data: ficha }, { data: outros }, { data: versaoNova }, { data: jutsusCartas }] = await Promise.all([
		fichaId && /^[0-9a-f-]{36}$/i.test(fichaId)
			? locals.supabase.from('personagens').select('id, nome').eq('id', fichaId).eq('jogador_id', usuario.id).maybeSingle()
			: Promise.resolve({ data: null }),
		locals.supabase.from('clas').select('nome').eq('campanha_id', params.id).eq('status', 'aprovado').neq('id', cla.id),
		dono && cla.status === 'aprovado'
			? locals.supabase.from('clas').select('id').eq('anterior_id', cla.id).in('status', ['rascunho', 'em_revisao', 'ajustes']).maybeSingle()
			: Promise.resolve({ data: null }),
		locals.supabase.from('jutsus_criados').select('id, carta_id, status, rank, resumo, versao').eq('cla_id', cla.id).eq('tipo', 'jutsu').order('versao', { ascending: false })
	]);
	// a versão mais nova de cada carta
	const porCarta: Record<string, { id: string; status: string; rank: string | null; custo: string | null }> = {};
	for (const j of jutsusCartas ?? []) if (j.carta_id && !porCarta[j.carta_id]) porCarta[j.carta_id] = { id: j.id, status: j.status, rank: j.rank, custo: (j.resumo as { custo?: string })?.custo ?? null };

	return {
		titulo: cla.nome ? `Clã ${cla.nome}` : 'Criar clã',
		navTitulo: 'CRIAR CLÃ',
		campanha,
		papel,
		cla,
		dados: normalizarCla(cla.dados as Partial<ClaDados>, cla.kkg),
		dono,
		editavel: dono && (cla.status === 'rascunho' || cla.status === 'ajustes') && !campanha.arquivada_em,
		autor: membros.find((m) => m.id === cla.autor_id)?.nome ?? 'Ex-membro',
		mestre: membros.find((m) => m.papel === 'mestre')?.nome ?? 'O Mestre',
		ficha: ficha ?? null,
		versaoNova: versaoNova?.id ?? null,
		jutsus: jutsusParaCla(),
		jutsusCartas: porCarta,
		outrosClas: [...new Set([...clasDoLivro.map((c) => c.nome), ...(outros ?? []).map((c) => c.nome).filter(Boolean)])].sort()
	};
};
