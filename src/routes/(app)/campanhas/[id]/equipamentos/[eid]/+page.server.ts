import { error } from '@sveltejs/kit';
import { carregarCampanha } from '#lib/campanhas/servidor.ts';
import { armasBase } from '#lib/equipamentos/catalogo.server.ts';
import { normalizar, type DadosEquipamento, type TipoEquipamento } from '#lib/equipamentos/regras.ts';
import type { PageServerLoad } from './$types';

// E3 forja · E4 oficina · item (E2) em edição ou leitura, e a tela em que o Mestre decide.
export const load: PageServerLoad = async ({ locals, params }) => {
	const usuario = (await locals.usuarioAtual())!;
	if (!/^[0-9a-f-]{36}$/i.test(params.eid)) error(404, 'Equipamento não encontrado.');
	const { campanha, membros, papel, personagens } = await carregarCampanha(locals, params.id, usuario.id);
	const { data: e } = await locals.supabase.from('equipamentos_criados').select('*').eq('id', params.eid).eq('campanha_id', params.id).maybeSingle();
	if (!e) error(404, 'Equipamento não encontrado.');
	const dono = e.autor_id === usuario.id;
	const [{ data: ficha }, { data: versaoNova }] = await Promise.all([
		e.personagem_id ? locals.supabase.from('personagens').select('id, nome, ryo, status, dados').eq('id', e.personagem_id).maybeSingle() : Promise.resolve({ data: null }),
		dono && e.status === 'aprovado' && e.tipo === 'item'
			? locals.supabase.from('equipamentos_criados').select('id').eq('anterior_id', e.id).in('status', ['rascunho', 'em_revisao', 'ajustes']).maybeSingle()
			: Promise.resolve({ data: null })
	]);
	const tipo = e.tipo as TipoEquipamento;
	const titulo = { arma: 'Forjar arma', marionete: 'Construir marionete', item: 'Item' }[tipo];
	return {
		titulo: e.nome ? `${titulo} · ${e.nome}` : titulo,
		navTitulo: titulo.toUpperCase(),
		campanha,
		papel,
		equipamento: e,
		dados: normalizar<DadosEquipamento>(tipo, e.dados as Partial<DadosEquipamento>),
		dono,
		editavel: dono && (e.status === 'rascunho' || e.status === 'ajustes') && !campanha.arquivada_em,
		autor: membros.find((m) => m.id === e.autor_id)?.nome ?? 'Ex-membro',
		mestre: membros.find((m) => m.papel === 'mestre')?.nome ?? 'O Mestre',
		ficha: ficha ?? null,
		fichas: personagens.filter((p) => (papel === 'mestre' || p.jogador_id === usuario.id) && p.situacao === 'ativo').map((p) => ({ id: p.id, nome: p.nome })),
		armas: tipo === 'arma' ? armasBase() : [],
		versaoNova: versaoNova?.id ?? null
	};
};
