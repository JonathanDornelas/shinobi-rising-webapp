import type { PageServerLoad } from './$types';

export interface Submissao {
	chave: string;
	tipo: 'ficha' | 'cla' | 'jutsu' | 'habilidade' | 'arma' | 'item' | 'marionete' | 'pt';
	id: string;
	titulo: string;
	rotuloTipo: string;
	status: string;
	versao: number;
	quando: string;
	comentario: string | null;
	excecao: string | null;
	href: string | null;
	icone: string;
	eventos: { nome: string; detalhe: string; cor: 'ok' | 'info' | 'err' | 'pendente' }[];
}

const ICONE: Record<Submissao['tipo'], string> = {
	ficha: 'acao/ic-acao-criar-personagem',
	cla: 'acao/ic-acao-criar-cla',
	jutsu: 'acao/ic-acao-criar-jutsu',
	habilidade: 'acao/ic-acao-criar-jutsu',
	arma: 'acao/ic-acao-forjar',
	item: 'equip/ic-equip-ferramenta',
	marionete: 'acao/ic-acao-construir-marionete',
	pt: 'recurso/ic-recurso-pt'
};
const ROTULO: Record<Submissao['tipo'], string> = { ficha: 'Ficha', cla: 'Clã', jutsu: 'Jutsu', habilidade: 'Habilidade', arma: 'Arma', item: 'Item', marionete: 'Marionete', pt: 'PT de treino' };

// R3 · Minhas submissões: tudo o que eu criei nesta campanha, com a linha do tempo (criação, envio e as respostas do Mestre).
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { campanha } = await parent();
	const eu = (await locals.usuarioAtual())!.id;
	const k = params.id;
	const [fichas, clas, jutsus, equipamentos, pedidos, notificacoes] = await Promise.all([
		locals.supabase.from('personagens').select('id, nome, status, criada_em, enviada_em, decidida_em, comentario_mestre, excecao').eq('campanha_id', k).eq('jogador_id', eu).eq('pre_gerado', false).eq('npc', false),
		locals.supabase.from('clas').select('id, nome, status, versao, criado_em, enviado_em, decidido_em, comentario_mestre, excecao').eq('campanha_id', k).eq('autor_id', eu),
		locals.supabase.from('jutsus_criados').select('id, tipo, nome, status, versao, criado_em, enviado_em, decidido_em, comentario_mestre, excecao').eq('campanha_id', k).eq('autor_id', eu),
		locals.supabase.from('equipamentos_criados').select('id, tipo, nome, status, versao, criado_em, enviado_em, decidido_em, comentario_mestre, excecao').eq('campanha_id', k).eq('autor_id', eu),
		locals.supabase.from('pedidos_pt').select('id, descricao, pt, status, criado_em, decidido_em, comentario').eq('campanha_id', k).eq('autor_id', eu),
		locals.supabase.from('notificacoes').select('tipo, texto, href, criada_em').eq('usuario_id', eu).like('href', `/campanhas/${k}/%`).order('criada_em')
	]);
	const avisos = notificacoes.data ?? [];
	const linha = (href: string | null, criado: string, enviado: string | null, versao: number, status: string): Submissao['eventos'] => {
		const ev: Submissao['eventos'] = [{ nome: versao > 1 ? `Nova versão (v${versao})` : 'Rascunho', detalhe: criado, cor: 'ok' }];
		if (enviado) ev.push({ nome: 'Enviado', detalhe: enviado, cor: 'ok' });
		for (const n of avisos.filter((n) => href && n.href === href)) {
			if (/_ajustes$/.test(n.tipo)) ev.push({ nome: 'Ajustes solicitados', detalhe: `${n.criada_em}|${n.texto}`, cor: 'info' });
			else if (/_aprovad[oa]$/.test(n.tipo)) ev.push({ nome: 'Aprovado', detalhe: n.criada_em, cor: 'ok' });
			else if (/_rejeitad[oa]$/.test(n.tipo)) ev.push({ nome: 'Rejeitado', detalhe: n.criada_em, cor: 'err' });
		}
		if (status === 'em_revisao') ev.push({ nome: 'Aprovação', detalhe: 'aguardando o Mestre', cor: 'pendente' });
		if (status === 'ajustes') ev.push({ nome: 'Reenvio', detalhe: 'aguardando seus ajustes', cor: 'pendente' });
		return ev;
	};
	const itens: Submissao[] = [];
	for (const p of fichas.data ?? []) {
		const href = `/campanhas/${k}/personagens/${p.id}`;
		itens.push({ chave: `ficha:${p.id}`, tipo: 'ficha', id: p.id, titulo: `Ficha de ${p.nome || 'personagem sem nome'}`, rotuloTipo: ROTULO.ficha, status: p.status, versao: 1, quando: p.decidida_em ?? p.enviada_em ?? p.criada_em, comentario: p.comentario_mestre, excecao: p.excecao, href, icone: ICONE.ficha, eventos: linha(href, p.criada_em, p.enviada_em, 1, p.status) });
	}
	for (const c of clas.data ?? []) {
		const href = `/campanhas/${k}/clas/${c.id}`;
		itens.push({ chave: `cla:${c.id}`, tipo: 'cla', id: c.id, titulo: `Clã ${c.nome || 'sem nome'}`, rotuloTipo: ROTULO.cla, status: c.status, versao: c.versao, quando: c.decidido_em ?? c.enviado_em ?? c.criado_em, comentario: c.comentario_mestre, excecao: c.excecao, href, icone: ICONE.cla, eventos: linha(href, c.criado_em, c.enviado_em, c.versao, c.status) });
	}
	for (const j of jutsus.data ?? []) {
		const href = `/campanhas/${k}/jutsus/${j.id}`;
		const t = j.tipo === 'habilidade' ? 'habilidade' : 'jutsu';
		itens.push({ chave: `jutsu:${j.id}`, tipo: t, id: j.id, titulo: j.nome || 'Sem nome', rotuloTipo: ROTULO[t], status: j.status, versao: j.versao, quando: j.decidido_em ?? j.enviado_em ?? j.criado_em, comentario: j.comentario_mestre, excecao: j.excecao, href, icone: ICONE[t], eventos: linha(href, j.criado_em, j.enviado_em, j.versao, j.status) });
	}
	for (const e of equipamentos.data ?? []) {
		const href = `/campanhas/${k}/equipamentos/${e.id}`;
		const t = e.tipo as 'arma' | 'item' | 'marionete';
		itens.push({ chave: `equip:${e.id}`, tipo: t, id: e.id, titulo: e.nome || 'Sem nome', rotuloTipo: ROTULO[t], status: e.status, versao: e.versao, quando: e.decidido_em ?? e.enviado_em ?? e.criado_em, comentario: e.comentario_mestre, excecao: e.excecao, href, icone: ICONE[t], eventos: linha(href, e.criado_em, e.enviado_em, e.versao, e.status) });
	}
	for (const d of pedidos.data ?? []) {
		const status = d.status === 'pendente' ? 'em_revisao' : d.status === 'aprovado' ? 'aprovado' : 'rejeitado';
		const ev: Submissao['eventos'] = [{ nome: 'Enviado', detalhe: d.criado_em, cor: 'ok' }];
		if (d.decidido_em) ev.push({ nome: d.status === 'aprovado' ? 'Aprovado' : 'Recusado', detalhe: d.decidido_em, cor: d.status === 'aprovado' ? 'ok' : 'err' });
		else ev.push({ nome: 'Aprovação', detalhe: 'aguardando o Mestre', cor: 'pendente' });
		itens.push({ chave: `pt:${d.id}`, tipo: 'pt', id: d.id, titulo: `Treino: ${d.descricao}`, rotuloTipo: `${ROTULO.pt} · ${d.pt} PT`, status, versao: 1, quando: d.decidido_em ?? d.criado_em, comentario: d.comentario, excecao: null, href: null, icone: ICONE.pt, eventos: ev });
	}
	itens.sort((a, b) => b.quando.localeCompare(a.quando));
	return { titulo: `Minhas submissões · ${campanha.nome}`, navTitulo: 'SUBMISSÕES', submissoes: itens };
};
