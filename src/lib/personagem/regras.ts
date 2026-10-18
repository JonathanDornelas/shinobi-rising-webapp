// Motor da criação de personagem (cap. 6): a partir das escolhas, calcula atributos, perícias, recursos,
// orçamentos e as verificações da revisão. É puro (sem Svelte nem Supabase) e roda igual no navegador e nos testes.
import {
	ATRIBUTOS,
	BACKGROUNDS,
	CLAS,
	CRIACAO,
	custoProficiencia,
	ESPECIALIZACOES,
	JUTSUS_ACADEMIA,
	JUTSUS_INICIAIS,
	PACOTES,
	PERICIAS,
	PERICIAS_COMBATE,
	RECURSOS,
	VILAS,
	nomePericia,
	type Atributo,
	type Ganho,
	type Pacote,
	type Pericia,
	type TipoProficiencia
} from './dados.ts';

export type TipoCla = 'catalogo' | 'sem' | 'novo-sem-kkg' | 'novo-com-kkg';

export interface Proficiencia {
	tipo: TipoProficiencia;
	alvo: string;
	nivel: number;
}

export interface FichaDados {
	versao: 1;
	conceito: { nome: string; idade: number | null; origem: string; conceito: string; aparencia: string };
	atributos: Record<Atributo, number>;
	vila: { id: string | null; escolha: Pericia | null };
	cla: { tipo: TipoCla | null; slug: string | null; escolha: Pericia | null };
	pericias: Partial<Record<Pericia, number>>;
	proficiencias: Proficiencia[];
	especializacao: string | null;
	elemento: string | null;
	segundoElemento: string | null;
	jutsus: { E: string[]; D: string[] };
	equipamento: { pacote: Pacote | null; compras: { id: string; qtd: number }[] };
	background: { id: string | null; escolha: Pericia | null; proprio: { nome: string; pericia: Pericia | null; traco: string } };
	time: string;
	sensei: string;
}

export function fichaVazia(): FichaDados {
	return {
		versao: 1,
		conceito: { nome: '', idade: null, origem: '', conceito: '', aparencia: '' },
		atributos: { FOR: 0, AGI: 0, VIG: 0, INT: 0, CTR: 0, ESP: 0 },
		vila: { id: null, escolha: null },
		cla: { tipo: null, slug: null, escolha: null },
		pericias: {},
		proficiencias: [],
		especializacao: null,
		elemento: null,
		segundoElemento: null,
		jutsus: { E: [], D: [] },
		equipamento: { pacote: null, compras: [] },
		background: { id: null, escolha: null, proprio: { nome: '', pericia: null, traco: '' } },
		time: '',
		sensei: ''
	};
}

/** Completa uma ficha salva com os campos que faltarem (fichas antigas ou parciais). */
export function normalizarFicha(d: Partial<FichaDados> | null | undefined): FichaDados {
	const v = fichaVazia();
	if (!d) return v;
	return {
		...v,
		...d,
		conceito: { ...v.conceito, ...d.conceito },
		atributos: { ...v.atributos, ...d.atributos },
		vila: { ...v.vila, ...d.vila },
		cla: { ...v.cla, ...d.cla },
		jutsus: { ...v.jutsus, ...d.jutsus },
		equipamento: { ...v.equipamento, ...d.equipamento },
		background: { ...v.background, ...d.background, proprio: { ...v.background.proprio, ...d.background?.proprio } }
	};
}

/** Regras da campanha que afetam a criação. */
export interface ContextoCampanha {
	vilas: string[];
	clas: string[];
	clasSemKkg: boolean;
	clasComKkg: boolean;
	pacotes: string[];
	aprovacao: { fichas: boolean; backgrounds: boolean };
	nivelInicial: number;
}

/** Item da mini loja (Pacote B), montado a partir das tabelas dos cap. 11 e 12. */
export interface ItemLoja {
	id: string;
	nome: string;
	preco: number;
	peso: number;
	/** Conjuntos: kunai/shuriken/senbon contam 0,5 a cada 10; consumíveis pequenos 0,5 a cada 5. */
	conjunto?: number;
	grupo: string;
	icone: string;
}

/** Jutsu disponível para escolha no passo 9. */
export interface JutsuOpcao {
	slug: string;
	nome: string;
	rank: 'E' | 'D';
	elemento: string | null;
}

export type Nivel = 'ok' | 'aviso' | 'bloqueio';
export interface Verificacao {
	nivel: Nivel;
	texto: string;
	passo: number;
	ref: string;
}

export const PASSOS = ['Conceito', 'Atributos', 'Vila', 'Clã', 'Perícias', 'Proficiências', 'Especialização', 'Recursos', 'Jutsus iniciais', 'Equipamento', 'Background', 'Revisão'] as const;

const sinal = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
export { sinal };

export interface BonusPericia {
	fonte: string;
	valor: number;
}

export interface LinhaPericia {
	id: Pericia;
	nome: string;
	atributo: Atributo;
	valorAtributo: number;
	distancia?: { atributo: Atributo; valor: number; total: number };
	treino: number;
	bonus: BonusPericia[];
	/** treino + bônus (o "valor da perícia"), limitado a +5 na criação. */
	valor: number;
	total: number;
	combate: boolean;
}

/** Ganhos que vêm da vila, do clã e do background (com as escolhas do jogador). */
function ganhos(f: FichaDados) {
	const lista: { fonte: string; ganho: Ganho; escolha: Pericia | null }[] = [];
	const vila = VILAS.find((v) => v.id === f.vila.id);
	if (vila) lista.push({ fonte: vila.nome.replace(/gakure$/, ''), ganho: vila.ganho, escolha: f.vila.escolha });
	if (f.cla.tipo === 'catalogo' && f.cla.slug && CLAS[f.cla.slug]) {
		const nome = f.cla.slug.charAt(0).toUpperCase() + f.cla.slug.slice(1);
		lista.push({ fonte: nome, ganho: CLAS[f.cla.slug].ganho, escolha: f.cla.escolha });
	}
	if (f.background.id === 'proprio') {
		const p = f.background.proprio;
		if (p.pericia) lista.push({ fonte: p.nome.trim() || 'Background', ganho: { pericias: [p.pericia] }, escolha: null });
	} else {
		const bg = BACKGROUNDS.find((b) => b.id === f.background.id);
		if (bg) lista.push({ fonte: bg.nome.replace(/ \(.*\)$/, ''), ganho: bg.ganho, escolha: f.background.escolha });
	}
	return lista;
}

/** Valor do atributo com o bônus do clã (o limite de criação sobe para +5 nesse atributo). */
export function atributosTotais(f: FichaDados): Record<Atributo, number> {
	const t = { ...f.atributos };
	const cla = f.cla.tipo === 'catalogo' && f.cla.slug ? CLAS[f.cla.slug] : null;
	if (cla?.ganho.atributo) t[cla.ganho.atributo] += 1;
	return t;
}

export function atributoDoCla(f: FichaDados): Atributo | null {
	return f.cla.tipo === 'catalogo' && f.cla.slug ? (CLAS[f.cla.slug]?.ganho.atributo ?? null) : null;
}

export function orcamentoAtributos(f: FichaDados) {
	const valores = ATRIBUTOS.map((a) => f.atributos[a.id]);
	const usados = valores.reduce((s, v) => s + v, 0);
	return { usados, limite: CRIACAO.pontosAtributo, restantes: CRIACAO.pontosAtributo - usados, reducoes: valores.filter((v) => v < 0).length };
}

/** Por que um atributo não pode subir/descer agora (texto para o title do botão), ou ''. */
export function limiteAtributo(f: FichaDados, a: Atributo, delta: 1 | -1): string {
	const v = f.atributos[a];
	const o = orcamentoAtributos(f);
	if (delta > 0) {
		if (v >= CRIACAO.atributoMax) return atributoDoCla(f) === a ? 'Limite +5 com o bônus de clã · cap. 6, Passo 2' : 'Atributos não passam de +4 na criação · cap. 6, Passo 2';
		if (o.restantes <= 0) return 'Sem pontos de atributo restantes';
		return '';
	}
	if (v <= CRIACAO.atributoMin) return 'O mínimo na criação é −2 · cap. 6, Passo 2';
	if (v === 0 && o.reducoes >= CRIACAO.reducoesMax) return 'Só 2 atributos podem ser reduzidos · cap. 6, Passo 2';
	return '';
}

export function pontosPericia(f: FichaDados) {
	const limite = CRIACAO.pontosPericia + (f.cla.tipo === 'sem' ? CRIACAO.semCla.pericia : 0);
	const usados = Object.values(f.pericias).reduce((s, v) => s + (v ?? 0), 0);
	return { limite, usados, restantes: limite - usados };
}

export function linhasPericia(f: FichaDados): LinhaPericia[] {
	const at = atributosTotais(f);
	const fontes = ganhos(f);
	return PERICIAS.map((p) => {
		const bonus: BonusPericia[] = [];
		for (const g of fontes) {
			const fixas = g.ganho.pericias ?? [];
			if (fixas.includes(p.id)) bonus.push({ fonte: g.fonte, valor: 1 });
			if (g.ganho.escolhaPericia && g.escolha === p.id) bonus.push({ fonte: g.fonte, valor: 1 });
		}
		const treino = f.pericias[p.id] ?? 0;
		const valor = Math.min(treino + bonus.reduce((s, b) => s + b.valor, 0), CRIACAO.periciaBonusMax);
		const linha: LinhaPericia = {
			id: p.id,
			nome: p.nome,
			atributo: p.atributo,
			valorAtributo: at[p.atributo],
			treino,
			bonus,
			valor,
			total: valor + at[p.atributo],
			combate: 'combate' in p && !!p.combate
		};
		if ('distancia' in p) linha.distancia = { atributo: p.distancia, valor: at[p.distancia], total: valor + at[p.distancia] };
		return linha;
	});
}

export function ptDisponiveis(f: FichaDados) {
	const total = CRIACAO.ptIniciais + (f.cla.tipo === 'sem' ? CRIACAO.semCla.pt : 0) + (f.background.id === 'perdedor' ? 2 : 0);
	const gastos = f.proficiencias.reduce((s, p) => s + custoProficiencia(p.tipo, p.nivel), 0);
	return { total, gastos, restantes: total - gastos };
}

export function jutsusConhecidos(f: FichaDados): string[] {
	const cla = f.cla.tipo === 'catalogo' && f.cla.slug ? (CLAS[f.cla.slug]?.jutsus ?? []) : [];
	return [...JUTSUS_ACADEMIA, ...cla, ...f.jutsus.E, ...f.jutsus.D];
}

/** Elementos do personagem (o clã Uchiha fixa Katon; o Senju ganha um segundo). */
export function elementos(f: FichaDados): string[] {
	const cla = f.cla.tipo === 'catalogo' && f.cla.slug ? CLAS[f.cla.slug] : null;
	const principal = cla?.elemento ?? f.elemento;
	return [principal, cla?.segundoElemento ? f.segundoElemento : null].filter((e): e is string => !!e);
}

export function cargaDasCompras(compras: FichaDados['equipamento']['compras'], loja: ItemLoja[]) {
	let carga = 0;
	let ryo = 0;
	for (const c of compras) {
		const item = loja.find((i) => i.id === c.id);
		if (!item || c.qtd <= 0) continue;
		ryo += item.preco * c.qtd;
		carga += item.conjunto ? Math.ceil(c.qtd / item.conjunto) * 0.5 : item.peso * c.qtd;
	}
	return { carga, ryo };
}

export interface Recursos {
	pv: number;
	pe: number;
	pc: number;
	iniciativa: number;
	defesa: number;
	defesaMental: number;
	pd: number;
	cargaMax: number;
	carga: number;
	ryo: number;
	formulas: Record<'pv' | 'pe' | 'pc' | 'iniciativa' | 'defesa' | 'defesaMental' | 'pd' | 'carga', string>;
}

export function recursos(f: FichaDados, loja: ItemLoja[] = []): Recursos {
	const at = atributosTotais(f);
	const pos = (n: number) => Math.max(0, n);
	const vila = VILAS.find((v) => v.id === f.vila.id);
	const cla = f.cla.tipo === 'catalogo' && f.cla.slug ? CLAS[f.cla.slug] : null;
	const claNome = f.cla.slug ? f.cla.slug.charAt(0).toUpperCase() + f.cla.slug.slice(1) : '';
	const esp = f.especializacao ? ESPECIALIZACOES[f.especializacao]?.recursos : undefined;
	const pericias = linhasPericia(f);
	const acro = pericias.find((p) => p.id === 'acrobacia')!.total;
	const perc = pericias.find((p) => p.id === 'percepcao')!.total;

	const extra = (rotulo: string, n?: number) => (n ? ` + ${n} (${rotulo})` : '');
	const pvVig = RECURSOS.porVig * pos(at.VIG);
	const pv = RECURSOS.pvBase + pvVig + (vila?.ganho.pv ?? 0) + (cla?.ganho.pv ?? 0) + (esp?.pv ?? 0);
	const pe = RECURSOS.peBase + pvVig + (esp?.pe ?? 0);
	const pcEsp = RECURSOS.porChakra * pos(at.ESP);
	const pcCtr = RECURSOS.porChakra * pos(at.CTR);
	const pc = RECURSOS.pcBase + pcEsp + pcCtr + (cla?.ganho.pc ?? 0) + (esp?.pc ?? 0);
	const iniciativa = at.AGI + (esp?.iniciativa ?? 0);
	const pacote = f.equipamento.pacote ? PACOTES[f.equipamento.pacote] : null;
	const compras = f.equipamento.pacote === 'B' ? cargaDasCompras(f.equipamento.compras, loja) : { carga: 0, ryo: 0 };
	const cargaMax = RECURSOS.cargaBase + RECURSOS.cargaPorFor * pos(at.FOR);

	return {
		pv,
		pe,
		pc,
		iniciativa,
		defesa: 10 + acro,
		defesaMental: 10 + perc,
		pd: 1,
		cargaMax,
		carga: (pacote?.carga ?? 0) + compras.carga,
		ryo: (pacote?.ryo ?? 0) - compras.ryo,
		formulas: {
			pv: `20 base + ${pvVig} (VIG ${sinal(at.VIG)})${extra(vila?.nome ?? 'vila', vila?.ganho.pv)}${extra(`Clã ${claNome}`, cla?.ganho.pv)}${extra('especialização', esp?.pv)}`,
			pe: `20 base + ${pvVig} (VIG ${sinal(at.VIG)})${extra('especialização', esp?.pe)}`,
			pc: `30 base + ${pcEsp} (ESP ${sinal(at.ESP)}) + ${pcCtr} (CTR ${sinal(at.CTR)})${extra(`Clã ${claNome}`, cla?.ganho.pc)}${extra('especialização', esp?.pc)}`,
			iniciativa: `1d20 + AGI ${sinal(at.AGI)}${extra('Velocidade', esp?.iniciativa)}`,
			defesa: `10 + Acrobacia ${sinal(acro)}`,
			defesaMental: `10 + Percepção ${sinal(perc)}`,
			pd: '1 por sessão',
			carga: `10 + 2 × FOR ${sinal(at.FOR)} (negativos não reduzem)`
		}
	};
}

export interface Analise {
	verificacoes: Verificacao[];
	passos: ('feito' | 'pendente' | 'erro')[];
	bloqueios: number;
	/** O que vai junto para o Mestre aprovar, além da ficha. */
	dependencias: string[];
}

/** Verificações da revisão (passo 12) e o estado de cada passo na navegação. */
export function analisar(f: FichaDados, ctx: ContextoCampanha, opcoes: { jutsusD: JutsuOpcao[]; loja: ItemLoja[] }): Analise {
	const v: Verificacao[] = [];
	const add = (nivel: Nivel, texto: string, passo: number) => v.push({ nivel, texto, passo, ref: `cap. 6, Passo ${passo}` });

	// 1 · Conceito
	if (!f.conceito.nome.trim()) add('bloqueio', 'Dê um nome ao personagem', 1);

	// 2 · Atributos
	const oa = orcamentoAtributos(f);
	const foraDoLimite = ATRIBUTOS.some((a) => f.atributos[a.id] > CRIACAO.atributoMax || f.atributos[a.id] < CRIACAO.atributoMin);
	if (foraDoLimite || oa.reducoes > CRIACAO.reducoesMax) add('bloqueio', 'Atributos fora dos limites da criação', 2);
	else if (oa.restantes < 0) add('bloqueio', `${-oa.restantes} pontos de atributo acima do limite`, 2);
	else if (oa.restantes > 0) add('aviso', `${oa.restantes} ${oa.restantes === 1 ? 'ponto' : 'pontos'} de atributo não ${oa.restantes === 1 ? 'gasto' : 'gastos'}`, 2);
	else add('ok', 'Todos os pontos de atributo gastos', 2);

	// 3 · Vila
	const vila = VILAS.find((x) => x.id === f.vila.id);
	if (!vila) add('bloqueio', 'Escolha a vila', 3);
	else if (!ctx.vilas.includes(vila.id)) add('bloqueio', `${vila.nome} não está disponível nesta campanha`, 3);
	else if (vila.ganho.escolhaPericia && !f.vila.escolha) add('bloqueio', `Escolha a perícia do bônus de ${vila.nome}`, 3);

	// 4 · Clã
	const dependencias: string[] = [];
	if (!f.cla.tipo) add('bloqueio', 'Escolha o clã (ou siga sem clã)', 4);
	else if (f.cla.tipo === 'catalogo') {
		if (!f.cla.slug || !CLAS[f.cla.slug]) add('bloqueio', 'Escolha um clã do catálogo', 4);
		else if (!ctx.clas.includes(f.cla.slug)) add('bloqueio', 'Este clã não é permitido nesta campanha', 4);
		else if (CLAS[f.cla.slug].ganho.escolhaPericia && !f.cla.escolha) add('bloqueio', 'Escolha a perícia do bônus do clã', 4);
	} else if (f.cla.tipo === 'novo-sem-kkg' || f.cla.tipo === 'novo-com-kkg') {
		add('bloqueio', 'O criador de clãs chega em um próximo lote; por enquanto, escolha um clã do catálogo ou siga sem clã', 4);
	}

	// 5 · Perícias
	const op = pontosPericia(f);
	const linhas = linhasPericia(f);
	if (Object.values(f.pericias).some((t) => (t ?? 0) > CRIACAO.periciaTreinoMax)) add('bloqueio', 'Nenhuma perícia passa de +3 de treino na criação', 5);
	if (op.restantes < 0) add('bloqueio', `${-op.restantes} pontos de perícia acima do limite`, 5);
	else if (op.restantes > 0) add('aviso', `${op.restantes} ${op.restantes === 1 ? 'ponto' : 'pontos'} de perícia não ${op.restantes === 1 ? 'gasto' : 'gastos'}`, 5);
	else add('ok', 'Todos os pontos de perícia gastos', 5);
	if (linhas.some((l) => PERICIAS_COMBATE.includes(l.id) && l.valor >= 2)) add('ok', 'Perícia de combate em +2 ou mais', 5);
	else add('aviso', 'Nenhuma perícia de combate em +2 (recomendado pelo livro)', 5);

	// 6 · Proficiências
	const pt = ptDisponiveis(f);
	const conhecidos = jutsusConhecidos(f);
	if (f.proficiencias.length > CRIACAO.proficienciasMax) add('bloqueio', 'No máximo 5 proficiências', 6);
	if (pt.restantes < 0) add('bloqueio', `${-pt.restantes} PT acima do disponível`, 6);
	else if (pt.restantes > 0) add('aviso', `${pt.restantes} PT de proficiência não ${pt.restantes === 1 ? 'gasto' : 'gastos'}`, 6);
	if (f.proficiencias.some((p) => !p.alvo.trim())) add('bloqueio', 'Escolha o alvo de cada proficiência', 6);
	if (f.proficiencias.some((p) => p.tipo === 'jutsu' && p.alvo && !conhecidos.includes(p.alvo))) add('bloqueio', 'Proficiência em jutsu que o personagem não conhece', 6);

	// 7 · Especialização
	const esp = f.especializacao ? ESPECIALIZACOES[f.especializacao] : null;
	if (!esp) add('bloqueio', 'Escolha a especialização inicial', 7);
	else if (esp.bloqueio) add('bloqueio', esp.bloqueio, 7);

	// 9 · Jutsus
	const els = elementos(f);
	const cla = f.cla.tipo === 'catalogo' && f.cla.slug ? CLAS[f.cla.slug] : null;
	if (!els[0]) add('bloqueio', 'Escolha o elemento principal', 9);
	if (cla?.segundoElemento && (!f.segundoElemento || f.segundoElemento === els[0])) add('bloqueio', 'Escolha o segundo elemento do clã Senju (diferente do principal)', 9);
	if (f.jutsus.E.length < JUTSUS_INICIAIS.E) add('bloqueio', `Falta escolher ${JUTSUS_INICIAIS.E - f.jutsus.E.length} jutsu Rank E`, 9);
	else if (f.jutsus.E.length > JUTSUS_INICIAIS.E) add('bloqueio', 'Escolha só 2 jutsus Rank E', 9);
	else add('ok', '2 jutsus Rank E escolhidos', 9);
	if (f.jutsus.D.length > JUTSUS_INICIAIS.D) add('bloqueio', 'Escolha só 1 jutsu Rank D', 9);
	else if (!f.jutsus.D.length) add('aviso', 'Nenhum jutsu Rank D escolhido', 9);
	else {
		const d = opcoes.jutsusD.find((j) => j.slug === f.jutsus.D[0]);
		if (d?.elemento && !els.includes(d.elemento)) add('bloqueio', `${d.nome} exige afinidade com ${d.elemento}`, 9);
		else add('ok', 'Jutsu Rank D escolhido', 9);
	}

	// 10 · Equipamento
	const pac = f.equipamento.pacote;
	const r = recursos(f, opcoes.loja);
	if (!pac) add('bloqueio', 'Escolha o pacote de equipamento', 10);
	else if (!ctx.pacotes.includes(pac)) add('bloqueio', 'Este pacote não está liberado nesta campanha', 10);
	else if (pac === 'marionetista' && !esp?.pacoteMarionete) add('bloqueio', 'O pacote de marionetista exige a especialização Marionete', 10);
	else if (r.ryo < 0) add('bloqueio', `Compras passam ${(-r.ryo).toLocaleString('pt-BR')} ryo do orçamento`, 10);
	if (pac && r.carga > r.cargaMax) add('aviso', `Carga ${r.carga} acima do limite ${r.cargaMax}: personagem sobrecarregado`, 10);

	// 11 · Background
	const bgId = f.background.id;
	if (!bgId) add('bloqueio', 'Escolha um background', 11);
	else if (bgId === 'proprio') {
		const p = f.background.proprio;
		if (!p.nome.trim() || !p.traco.trim()) add('bloqueio', 'Dê nome e traço ao background próprio', 11);
		if (ctx.aprovacao.backgrounds) dependencias.push(`Background próprio "${p.nome.trim() || 'sem nome'}"`);
	} else {
		const bg = BACKGROUNDS.find((b) => b.id === bgId);
		if (bg?.ganho.escolhaPericia && !f.background.escolha) add('bloqueio', `Escolha a perícia do background ${bg.nome}`, 11);
	}

	const erro = (p: number) => v.some((x) => x.passo === p && x.nivel === 'bloqueio');
	const pendente = (p: number) => v.some((x) => x.passo === p && x.nivel === 'aviso');
	const preenchido: Record<number, boolean> = {
		1: !!f.conceito.nome.trim(),
		2: oa.restantes === 0,
		3: !!vila,
		4: !!f.cla.tipo,
		5: op.restantes === 0,
		6: f.proficiencias.length > 0 || pt.restantes === 0,
		7: !!esp,
		8: true,
		9: f.jutsus.E.length === JUTSUS_INICIAIS.E,
		10: !!pac,
		11: !!bgId,
		12: false
	};
	const passos = PASSOS.map((_, i) => {
		const p = i + 1;
		if (erro(p) && preenchido[p]) return 'erro' as const;
		if (preenchido[p] && !erro(p) && !pendente(p)) return 'feito' as const;
		return 'pendente' as const;
	});
	return { verificacoes: v, passos, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length, dependencias };
}

/** Resumo gravado junto da ficha, para listas e painéis sem recalcular tudo. */
export function resumoFicha(f: FichaDados, loja: ItemLoja[] = []) {
	const r = recursos(f, loja);
	return {
		nome: f.conceito.nome.trim(),
		cla: f.cla.tipo === 'catalogo' ? f.cla.slug : f.cla.tipo,
		vila: f.vila.id,
		especializacao: f.especializacao,
		elementos: elementos(f),
		atributos: atributosTotais(f),
		pv: r.pv,
		pe: r.pe,
		pc: r.pc,
		defesa: r.defesa,
		defesaMental: r.defesaMental
	};
}
export type ResumoFicha = ReturnType<typeof resumoFicha>;

export { nomePericia };
