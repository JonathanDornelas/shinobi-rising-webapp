// Fila de aprovações do Mestre (R1/R2): junta fichas, clãs, jutsus, habilidades, equipamentos e pedidos de PT num
// formato só, com as verificações calculadas pelos mesmos motores das telas de criação.
import type { SupabaseClient } from '@supabase/supabase-js';
import { APROVACAO_PADRAO } from '#lib/campanhas/dominio.ts';
import { analisarCla, normalizarCla, rotuloKkg, textoKkg, textosBonus, type ClaDados } from '#lib/clas/regras.ts';
import { armasBase } from '#lib/equipamentos/catalogo.server.ts';
import { analisarArma, analisarItem, analisarMarionete, calcularArma, calcularMarionete, normalizar, type ArmaDados, type ItemDados, type MarioneteDados } from '#lib/equipamentos/regras.ts';
import { analisarHabilidade, analisarJutsu, calcularJutsu, normalizarHabilidade, normalizarJutsu, type HabilidadeDados, type JutsuDados } from '#lib/jutsus/regras.ts';
import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
import { catalogoCriacao } from '#lib/personagem/catalogo.server.ts';
import { ptDaSessao, SESSOES_TREINO } from '#lib/personagem/dados.ts';
import { analisar, especializacoes, normalizarFicha, recursos, type FichaDados, type ResumoFicha } from '#lib/personagem/regras.ts';
import type { Campanha, Database } from '#lib/supabase/banco.ts';

import type { EstadoFila, ItemFila, TipoFila } from './tipos.ts';
export type { EstadoFila, ItemFila, TipoFila };

const ryo = (n: number) => `${n.toLocaleString('pt-BR')} ryo`;
const estadoDe = (status: string): EstadoFila => (status === 'em_revisao' || status === 'pendente' ? 'pendente' : status === 'ajustes' ? 'aguardando' : 'decidido');
const so = <T>(v: T[] | null) => v ?? [];

export async function montarFila(supabase: SupabaseClient<Database>, campanha: Campanha, membros: { id: string; nome: string }[]) {
	const k = campanha.id;
	const STATUS = ['em_revisao', 'ajustes', 'aprovado', 'rejeitado'] as const;
	const [fichas, clas, jutsus, equipamentos, pedidos] = await Promise.all([
		supabase.from('personagens').select('*').eq('campanha_id', k).in('status', ['em_revisao', 'ajustes', 'aprovada', 'rejeitada']).eq('pre_gerado', false).order('enviada_em', { ascending: true }),
		supabase.from('clas').select('*').eq('campanha_id', k).in('status', STATUS),
		supabase.from('jutsus_criados').select('*').eq('campanha_id', k).in('status', STATUS),
		supabase.from('equipamentos_criados').select('*').eq('campanha_id', k).in('status', STATUS),
		supabase.from('pedidos_pt').select('*').eq('campanha_id', k)
	]);
	const nome = (id: string | null) => membros.find((m) => m.id === id)?.nome ?? 'Ex-membro';
	const todasFichas = so(fichas.data);
	const fichaPorId = new Map(todasFichas.map((p) => [p.id, p]));
	// fichas que não estão na lista acima (jutsus e encomendas de fichas já aprovadas) entram pelo id
	const faltando = [...so(jutsus.data).map((j) => j.personagem_id), ...so(equipamentos.data).map((e) => e.personagem_id), ...so(pedidos.data).map((p) => p.personagem_id)].filter(
		(id): id is string => !!id && !fichaPorId.has(id)
	);
	if (faltando.length) {
		const { data } = await supabase.from('personagens').select('*').in('id', [...new Set(faltando)]);
		for (const p of so(data)) fichaPorId.set(p.id, p);
	}
	const statusCla = new Map(so(clas.data).map((c) => [c.id, c.status]));
	const aprovacao = { ...APROVACAO_PADRAO, ...campanha.aprovacao };
	const ctxCampanha = {
		vilas: campanha.vilas.map((v) => v.id),
		clas: campanha.clas_permitidos,
		clasSemKkg: campanha.clas_sem_kkg,
		clasComKkg: campanha.clas_com_kkg,
		pacotes: campanha.pacotes,
		aprovacao: { fichas: aprovacao.fichas, backgrounds: aprovacao.backgrounds },
		nivelInicial: campanha.nivel_inicial
	};
	const catalogo = catalogoCriacao(campanha.clas_permitidos);
	const armas = armasBase();
	const itens: ItemFila[] = [];
	const base = (x: { id: string; status: string; versao?: number; comentario_mestre: string | null; mensagem: string | null; excecao: string | null }) => ({
		estado: estadoDe(x.status),
		status: x.status,
		versao: x.versao ?? 1,
		excecao: x.excecao,
		comentarios: [...(x.mensagem?.trim() ? [{ autor: 'Autor', texto: x.mensagem.trim() }] : []), ...(x.comentario_mestre?.trim() ? [{ autor: 'Mestre', texto: x.comentario_mestre.trim() }] : [])]
	});
	const fichaCtx = (pid: string | null) => {
		const p = pid ? fichaPorId.get(pid) : null;
		if (!p) return null;
		const f = normalizarFicha(p.dados as Partial<FichaDados>);
		return { p, f, r: recursos(f) };
	};

	// ---------------------------------------------------------------- fichas
	for (const p of todasFichas) {
		const f = normalizarFicha(p.dados as Partial<FichaDados>);
		const r = p.resumo as Partial<ResumoFicha>;
		const sc = p.cla_id ? (statusCla.get(p.cla_id) ?? null) : null;
		const a = analisar(f, ctxCampanha, { jutsusD: catalogo.jutsusD, loja: catalogo.loja, statusCla: sc });
		const at = r.atributos ?? f.atributos;
		itens.push({
			...base({ ...p, versao: 1, mensagem: p.mensagem }),
			chave: `ficha:${p.id}`,
			tipo: 'ficha',
			id: p.id,
			titulo: `Ficha de ${p.nome || 'personagem sem nome'}`,
			subtitulo: [`Nível ${p.nivel}`, r.claNome ? `Clã ${r.claNome}` : null, r.vila].filter(Boolean).join(' · '),
			rotuloTipo: 'Ficha',
			autor: nome(p.jogador_id),
			autorId: p.jogador_id,
			enviado: p.enviada_em,
			decidido: p.decidida_em,
			icone: 'acao/ic-acao-criar-personagem',
			cor: '#C44536',
			custo: '',
			rank: null,
			corpo: [
				`Atributos ${Object.entries(at).map(([k2, v]) => `${k2} ${v > 0 ? '+' : ''}${v}`).join(' · ')}.`,
				r.pv ? `PV ${r.pv} · PC ${r.pc} · PE ${r.pe} · Defesa ${r.defesa}.` : '',
				f.conceito.conceito.trim()
			].filter(Boolean),
			verificacoes: a.verificacoes.map((v) => ({ nivel: v.nivel, texto: v.texto, ref: v.ref })),
			efeitos: [`A ficha entra na mesa com o XP do nível ${campanha.nivel_inicial}, os PT e o ryo da criação`, `${nome(p.jogador_id)} é avisado`],
			dependeDe: p.cla_id && sc === 'em_revisao' ? `cla:${p.cla_id}` : null,
			href: `/campanhas/${k}/personagens/${p.id}/editar`
		});
	}

	// ---------------------------------------------------------------- clãs
	for (const c of so(clas.data)) {
		const d = normalizarCla(c.dados as Partial<ClaDados>, c.kkg);
		const a = analisarCla(d);
		const dependentes = todasFichas.filter((p) => p.cla_id === c.id && p.status === 'em_revisao');
		itens.push({
			...base(c),
			chave: `cla:${c.id}`,
			tipo: 'cla',
			id: c.id,
			titulo: `Clã ${c.nome || 'sem nome'}`,
			subtitulo: [d.conceito.significado, rotuloKkg(d) ? `KKG ${rotuloKkg(d)}` : 'sem KKG'].filter(Boolean).join(' · '),
			rotuloTipo: 'Clã',
			autor: nome(c.autor_id),
			autorId: c.autor_id,
			enviado: c.enviado_em,
			decidido: c.decidido_em,
			icone: 'acao/ic-acao-criar-cla',
			cor: d.conceito.cor,
			custo: '',
			rank: null,
			corpo: [`Bônus: ${textosBonus(d).join(' · ') || 'nenhum'}.`, d.kkg ? `KKG: ${textoKkg(d)}` : '', `${a.marcosCompletos}/20 marcos preenchidos.`].filter(Boolean),
			verificacoes: a.verificacoes.map((v) => ({ nivel: v.nivel, texto: v.texto, ref: 'cap. 8.4' })),
			efeitos: ['O clã fica disponível na biblioteca da campanha', ...dependentes.map((p) => `A ficha de ${p.nome} deixa de depender dele`)],
			dependeDe: null,
			href: `/campanhas/${k}/clas/${c.id}`
		});
	}

	// ---------------------------------------------------------------- jutsus e habilidades
	for (const j of so(jutsus.data)) {
		const ctx = fichaCtx(j.personagem_id);
		if (j.tipo === 'habilidade') {
			const d = normalizarHabilidade(j.dados as Partial<HabilidadeDados>);
			itens.push({
				...base(j),
				chave: `jutsu:${j.id}`,
				tipo: 'habilidade',
				id: j.id,
				titulo: j.nome || 'Habilidade sem nome',
				subtitulo: ['Habilidade', d.traducao].filter(Boolean).join(' · '),
				rotuloTipo: 'Habilidade',
				autor: [nome(j.autor_id), ctx?.p.nome].filter(Boolean).join(' · '),
				autorId: j.autor_id,
				enviado: j.enviado_em,
				decidido: j.decidido_em,
				icone: 'acao/ic-acao-criar-jutsu',
				cor: '#5E6B73',
				custo: '',
				rank: null,
				corpo: [d.efeito, d.descricao].filter((x) => x.trim()),
				verificacoes: analisarHabilidade(d).verificacoes.map((v) => ({ ...v, ref: 'cap. 8.4' })),
				efeitos: ['A habilidade entra na biblioteca da campanha'],
				dependeDe: null,
				href: `/campanhas/${k}/jutsus/${j.id}`
			});
			continue;
		}
		const d = normalizarJutsu(j.dados as Partial<JutsuDados>);
		const calc = calcularJutsu(d);
		const a = analisarJutsu(d, ctx ? { nome: ctx.p.nome, nivel: ctx.p.nivel, pcMax: ctx.r.pc, peMax: ctx.r.pe } : {}, calc);
		itens.push({
			...base(j),
			chave: `jutsu:${j.id}`,
			tipo: 'jutsu',
			id: j.id,
			titulo: j.nome || 'Jutsu sem nome',
			subtitulo: [d.traducao, d.tipo].filter(Boolean).join(' · '),
			rotuloTipo: 'Jutsu',
			autor: [nome(j.autor_id), ctx?.p.nome].filter(Boolean).join(' · '),
			autorId: j.autor_id,
			enviado: j.enviado_em,
			decidido: j.decidido_em,
			icone: 'acao/ic-acao-criar-jutsu',
			cor: d.tipo ? TIPO_JUTSU[d.tipo].cor : '#5E6B73',
			custo: calc.custo.texto,
			rank: calc.rank,
			corpo: [d.efeito, `${calc.pj} PJ: ${calc.linhas.filter((l) => l.pj).map((l) => l.rotulo).join(' · ')}.`].filter((x) => x.trim()),
			verificacoes: a.verificacoes.map((v) => ({ nivel: v.nivel, texto: v.texto, ref: v.secao === 2 ? 'cap. 18' : 'cap. 20' })),
			efeitos: ctx ? [`${ctx.p.nome} pode aprender no treino por ${calc.ptAprender} PT`] : j.cla_id ? ['Dá os números à carta do clã'] : ['O jutsu entra na biblioteca da campanha'],
			dependeDe: null,
			href: `/campanhas/${k}/jutsus/${j.id}`
		});
	}

	// ---------------------------------------------------------------- equipamentos
	for (const e of so(equipamentos.data)) {
		const ctx = fichaCtx(e.personagem_id);
		const cx = ctx ? { nome: ctx.p.nome, ryo: ctx.p.status === 'aprovada' ? ctx.p.ryo : null, especializacaoMarionete: especializacoes(ctx.f).find((x) => x.id === 'marionete')?.nivel ?? 0 } : {};
		let corpo: string[] = [];
		let verificacoes: ItemFila['verificacoes'] = [];
		let efeitos: string[] = [];
		let rotulo = '';
		let icone = 'nav/ic-nav-equipamentos';
		if (e.tipo === 'arma') {
			const d = normalizar<ArmaDados>('arma', e.dados as Partial<ArmaDados>);
			const b = armas.find((a) => a.slug === d.base) ?? null;
			const c = calcularArma(d, b);
			rotulo = 'Arma forjada';
			icone = 'acao/ic-acao-forjar';
			corpo = [`${b?.nome ?? 'Sem base'} ${c.qualidade.nome} · ${c.dano}${c.acerto ? ` · +${c.acerto} acerto` : ''}`, c.chips.join(' · '), `${c.pfo} de ${c.limite} PFo · ${c.tempo}`].filter(Boolean);
			verificacoes = analisarArma(d, b, cx).verificacoes.map((v) => ({ ...v, ref: 'cap. 21' }));
		} else if (e.tipo === 'marionete') {
			const d = normalizar<MarioneteDados>('marionete', e.dados as Partial<MarioneteDados>);
			const c = calcularMarionete(d);
			rotulo = 'Marionete';
			icone = 'acao/ic-acao-construir-marionete';
			corpo = [`${c.tamanho.nome} · PV ${c.pv} · Defesa ${c.defesa} · dano ${c.ataque}`, c.mecanismos.map((m) => m.nome).join(' · ') || 'Sem mecanismos', `${c.slots} de ${c.limite} slots · ${c.tempo}`];
			verificacoes = analisarMarionete(d, cx).verificacoes.map((v) => ({ ...v, ref: 'cap. 13' }));
		} else {
			const d = normalizar<ItemDados>('item', e.dados as Partial<ItemDados>);
			rotulo = 'Item';
			icone = d.icone;
			corpo = [d.efeito, `${d.categoria} · ${ryo(Math.max(0, d.preco))}`].filter(Boolean);
			verificacoes = analisarItem(d).verificacoes.map((v) => ({ ...v, ref: 'cap. 11' }));
		}
		efeitos =
			e.tipo === 'item' ? ['O item entra na loja da campanha'] : ctx ? [`−${ryo(e.custo)} de ${ctx.p.nome}`, 'O objeto vai para o inventário da ficha'] : ['Entra na biblioteca da campanha'];
		itens.push({
			...base(e),
			chave: `equip:${e.id}`,
			tipo: e.tipo as TipoFila,
			id: e.id,
			titulo: e.nome || 'Sem nome',
			subtitulo: rotulo,
			rotuloTipo: rotulo,
			autor: [nome(e.autor_id), ctx?.p.nome].filter(Boolean).join(' · '),
			autorId: e.autor_id,
			enviado: e.enviado_em,
			decidido: e.decidido_em,
			icone,
			cor: '#BF9000',
			custo: ryo(e.custo),
			rank: null,
			corpo,
			verificacoes,
			efeitos,
			dependeDe: null,
			href: `/campanhas/${k}/equipamentos/${e.id}`
		});
	}

	// ---------------------------------------------------------------- pedidos de PT
	for (const d of so(pedidos.data)) {
		const p = fichaPorId.get(d.personagem_id);
		const esperado = ptDaSessao(d.sessao, d.semanas);
		const sessao = SESSOES_TREINO.find((s) => s.id === d.sessao);
		itens.push({
			chave: `pt:${d.id}`,
			tipo: 'pt',
			id: d.id,
			titulo: `Treino: ${d.descricao}`,
			subtitulo: `${sessao?.nome ?? d.sessao} · ${d.semanas} ${d.semanas === 1 ? 'semana' : 'semanas'}`,
			rotuloTipo: 'PT de treino',
			autor: [nome(d.autor_id), p?.nome].filter(Boolean).join(' · '),
			autorId: d.autor_id,
			enviado: d.criado_em,
			versao: 1,
			estado: d.status === 'pendente' ? 'pendente' : 'decidido',
			status: d.status === 'pendente' ? 'em_revisao' : d.status === 'aprovado' ? 'aprovado' : 'rejeitado',
			decidido: d.decidido_em,
			excecao: null,
			icone: 'recurso/ic-recurso-pt',
			cor: '#4FA373',
			custo: `${d.pt} PT`,
			rank: null,
			corpo: [d.descricao, sessao?.nota ?? ''].filter(Boolean),
			verificacoes:
				esperado === d.pt
					? [{ nivel: 'ok', texto: `${d.pt} PT para ${d.semanas} ${d.semanas === 1 ? 'semana' : 'semanas'} de sessão ${sessao?.nome.toLowerCase() ?? ''}`.trim(), ref: 'cap. 18' }]
					: [{ nivel: 'aviso', texto: `A sessão rende ${esperado} PT; o pedido é de ${d.pt}`, ref: 'cap. 18' }],
			efeitos: [`+${d.pt} PT para ${p?.nome ?? 'a ficha'}`],
			comentarios: d.comentario ? [{ autor: 'Mestre', texto: d.comentario }] : [],
			dependeDe: null,
			href: p ? `/campanhas/${k}/personagens/${p.id}` : null
		});
	}

	return itens.sort((a, b) => (a.enviado ?? '').localeCompare(b.enviado ?? ''));
}
