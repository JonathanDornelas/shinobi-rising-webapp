// Motor da ficha: a partir das escolhas da criação (cap. 6) e da progressão (cap. 17 e 18), calcula atributos,
// perícias, recursos, orçamentos e as verificações da revisão. É puro (sem Svelte nem Supabase) e roda igual no
// navegador e nos testes.
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
	PROGRESSAO,
	RECURSOS,
	VILAS,
	nomePericia,
	type Atributo,
	type Ganho,
	type Pacote,
	type Pericia,
	type TipoProficiencia
} from './dados.ts';
import type { RegrasClaCriado } from '../clas/regras.ts';

export type TipoCla = 'catalogo' | 'sem' | 'novo-sem-kkg' | 'novo-com-kkg';

export interface Proficiencia {
	tipo: TipoProficiencia;
	alvo: string;
	nivel: number;
}

/** Ganhos de um marco de clã, registrados no momento em que o nível é alcançado (cap. 8.3). */
export interface GanhoMarco {
	texto: string;
	atributos?: Partial<Record<Atributo, number>>;
	limites?: Partial<Record<Atributo, number>>;
	pericias?: Pericia[];
	pt?: number;
	pic?: number;
	jutsus?: string[];
}

/** Escolhas feitas ao subir para um nível (cap. 17). */
export interface EscolhaNivel {
	nivel: number;
	atributo?: Atributo;
	pericia?: Pericia;
	especializacao?: { id: string; elemento?: string | null };
	marco?: GanhoMarco;
}

/** Algo aprendido com PT (cap. 18). */
export type Treino =
	| { tipo: 'jutsu'; slug: string; pt: number }
	| { tipo: 'especializacao'; id: string; pt: number }
	| { tipo: 'proficiencia'; prof: { tipo: TipoProficiencia; alvo: string }; nivel: number; pt: number }
	| { tipo: 'elemento'; id: string; pt: number };

export interface FichaDados {
	versao: 1;
	conceito: { nome: string; idade: number | null; origem: string; conceito: string; aparencia: string };
	atributos: Record<Atributo, number>;
	vila: { id: string | null; escolha: Pericia | null };
	/** Clã criado: `id` aponta para a tabela clas e `criado` guarda a cópia das regras que a ficha usa. */
	cla: { tipo: TipoCla | null; slug: string | null; escolha: Pericia | null; id?: string | null; criado?: RegrasClaCriado | null };
	pericias: Partial<Record<Pericia, number>>;
	proficiencias: Proficiencia[];
	especializacao: string | null;
	/** Elemento da especialização Elemento Específico. */
	especializacaoElemento: string | null;
	elemento: string | null;
	segundoElemento: string | null;
	jutsus: { E: string[]; D: string[] };
	equipamento: { pacote: Pacote | null; compras: { id: string; qtd: number }[] };
	background: { id: string | null; escolha: Pericia | null; proprio: { nome: string; pericia: Pericia | null; traco: string } };
	time: string;
	sensei: string;
	/** Depois da aprovação: níveis alcançados e treinos. O nível atual é 1 + niveis.length. */
	progresso: { niveis: EscolhaNivel[]; treinos: Treino[] };
}

export function fichaVazia(): FichaDados {
	return {
		versao: 1,
		conceito: { nome: '', idade: null, origem: '', conceito: '', aparencia: '' },
		atributos: { FOR: 0, AGI: 0, VIG: 0, INT: 0, CTR: 0, ESP: 0 },
		vila: { id: null, escolha: null },
		cla: { tipo: null, slug: null, escolha: null, id: null, criado: null },
		pericias: {},
		proficiencias: [],
		especializacao: null,
		especializacaoElemento: null,
		elemento: null,
		segundoElemento: null,
		jutsus: { E: [], D: [] },
		equipamento: { pacote: null, compras: [] },
		background: { id: null, escolha: null, proprio: { nome: '', pericia: null, traco: '' } },
		time: '',
		sensei: '',
		progresso: { niveis: [], treinos: [] }
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
		background: { ...v.background, ...d.background, proprio: { ...v.background.proprio, ...d.background?.proprio } },
		progresso: { ...v.progresso, ...d.progresso }
	};
}

/** Nível atual: 1 + níveis alcançados depois da criação. */
export const nivelDe = (f: FichaDados) => 1 + f.progresso.niveis.length;

/** Especializações com o nível atual de cada uma (criação, novos níveis 4/7/10… e treinos 1→2→3). */
export function especializacoes(f: FichaDados): { id: string; nivel: number; elemento: string | null }[] {
	const lista: { id: string; nivel: number; elemento: string | null }[] = [];
	if (f.especializacao) lista.push({ id: f.especializacao, nivel: 1, elemento: f.especializacaoElemento });
	for (const n of f.progresso.niveis) if (n.especializacao) lista.push({ id: n.especializacao.id, nivel: 1, elemento: n.especializacao.elemento ?? null });
	for (const t of f.progresso.treinos) {
		if (t.tipo !== 'especializacao') continue;
		const e = lista.find((x) => x.id === t.id);
		if (e) e.nivel = Math.min(3, e.nivel + 1);
	}
	return lista;
}

/** Proficiências da criação com os treinos aplicados por cima. */
export function proficiencias(f: FichaDados): Proficiencia[] {
	const lista = f.proficiencias.map((p) => ({ ...p }));
	for (const t of f.progresso.treinos) {
		if (t.tipo !== 'proficiencia') continue;
		const p = lista.find((x) => x.tipo === t.prof.tipo && x.alvo === t.prof.alvo);
		if (p) p.nivel = Math.max(p.nivel, t.nivel);
		else lista.push({ ...t.prof, nivel: t.nivel });
	}
	return lista;
}

const valorNivel = (v: [number, number, number] | undefined, nivel: number) => (v ? v[Math.min(Math.max(nivel, 1), 3) - 1] : 0);

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
	/** Dano da arma (cap. 11), para a rolagem na ficha. */
	dano?: string;
}

/** Jutsu disponível para escolha no passo 9. */
export interface JutsuOpcao {
	slug: string;
	nome: string;
	rank: 'E' | 'D';
	elemento: string | null;
	/** Jutsu original criado para esta ficha (cap. 20): precisa ir para a revisão junto com ela. */
	criado?: { id: string; status: string };
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

/** Regras do clã da ficha: do catálogo (CLAS) ou a cópia guardada do clã criado. */
export type RegrasCla = Omit<RegrasClaCriado, 'id' | 'kkg' | 'brasao' | 'extras'> & { extras?: string[]; segundoElemento?: boolean };
export function regrasCla(f: FichaDados): RegrasCla | null {
	if (f.cla.tipo === 'catalogo') return f.cla.slug && CLAS[f.cla.slug] ? { nome: f.cla.slug.charAt(0).toUpperCase() + f.cla.slug.slice(1), ...CLAS[f.cla.slug] } : null;
	if (f.cla.tipo === 'novo-sem-kkg' || f.cla.tipo === 'novo-com-kkg') return f.cla.criado ?? null;
	return null;
}

/** Ganhos que vêm da vila, do clã e do background (com as escolhas do jogador). */
function ganhos(f: FichaDados) {
	const lista: { fonte: string; ganho: Ganho; escolha: Pericia | null }[] = [];
	const vila = VILAS.find((v) => v.id === f.vila.id);
	if (vila) lista.push({ fonte: vila.nome.replace(/gakure$/, ''), ganho: vila.ganho, escolha: f.vila.escolha });
	const cla = regrasCla(f);
	if (cla) lista.push({ fonte: cla.nome, ganho: cla.ganho, escolha: f.cla.escolha });
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
	const cla = regrasCla(f);
	if (cla?.ganho.atributo) t[cla.ganho.atributo] += 1;
	for (const n of f.progresso.niveis) {
		if (n.atributo) t[n.atributo] += 1;
		for (const [a, v] of Object.entries(n.marco?.atributos ?? {})) t[a as Atributo] += v ?? 0;
	}
	return t;
}

/** Limite atual de cada atributo depois da criação: +8, e o do clã sobe com os marcos (até +10). */
export function limitesAtributo(f: FichaDados): Record<Atributo, number> {
	const l = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, PROGRESSAO.atributoMax])) as Record<Atributo, number>;
	for (const n of f.progresso.niveis) for (const [a, v] of Object.entries(n.marco?.limites ?? {})) l[a as Atributo] = Math.max(l[a as Atributo], v ?? 0);
	return l;
}

export function atributoDoCla(f: FichaDados): Atributo | null {
	return regrasCla(f)?.ganho.atributo ?? null;
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

/** Pontos de treino numa perícia: criação + 1 por escolha de nível. */
export const treinoPericia = (f: FichaDados, p: Pericia) => (f.pericias[p] ?? 0) + f.progresso.niveis.filter((n) => n.pericia === p).length;

export function linhasPericia(f: FichaDados): LinhaPericia[] {
	const at = atributosTotais(f);
	const fontes = ganhos(f);
	const nivel = nivelDe(f);
	const esps = especializacoes(f);
	const nomeCla = regrasCla(f)?.nome ?? 'Clã';
	// Treino vai até +3 na criação e +5 depois; clã, vila, background e marcos passam do limite em até +2 (cap. 3).
	const teto = (nivel === 1 ? CRIACAO.periciaTreinoMax : PROGRESSAO.periciaTreinoMax) + 2;
	return PERICIAS.map((p) => {
		const bonus: BonusPericia[] = [];
		for (const g of fontes) {
			const fixas = g.ganho.pericias ?? [];
			if (fixas.includes(p.id)) bonus.push({ fonte: g.fonte, valor: 1 });
			if (g.ganho.escolhaPericia && g.escolha === p.id) bonus.push({ fonte: g.fonte, valor: 1 });
		}
		for (const n of f.progresso.niveis) for (const mp of n.marco?.pericias ?? []) if (mp === p.id) bonus.push({ fonte: `${nomeCla} NV ${n.nivel}`, valor: 1 });
		const treino = treinoPericia(f, p.id);
		const valorBase = Math.min(treino + bonus.reduce((s, b) => s + b.valor, 0), teto);
		// Especializações somam em testes, fora do teto (cap. 19).
		for (const e of esps) {
			const v = valorNivel(ESPECIALIZACOES[e.id]?.pericias?.[p.id], e.nivel);
			if (v) bonus.push({ fonte: `Esp. NV ${e.nivel}`, valor: v });
		}
		const valor = valorBase + bonus.filter((b) => b.fonte.startsWith('Esp.')).reduce((s, b) => s + b.valor, 0);
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
	const total = CRIACAO.ptIniciais + (f.cla.tipo === 'sem' ? CRIACAO.semCla.pt : 0) + (regrasCla(f)?.ganho.pt ?? 0) + (f.background.id === 'perdedor' ? 2 : 0);
	const gastos = f.proficiencias.reduce((s, p) => s + custoProficiencia(p.tipo, p.nivel), 0);
	return { total, gastos, restantes: total - gastos };
}

export function jutsusConhecidos(f: FichaDados): string[] {
	const cla = regrasCla(f)?.jutsus ?? [];
	const marcos = f.progresso.niveis.flatMap((n) => n.marco?.jutsus ?? []);
	const treinos = f.progresso.treinos.flatMap((t) => (t.tipo === 'jutsu' ? [t.slug] : []));
	return [...new Set([...JUTSUS_ACADEMIA, ...cla, ...f.jutsus.E, ...f.jutsus.D, ...marcos, ...treinos])];
}

/** Elementos do personagem (o Uchiha fixa Katon; o Senju ganha um segundo; clãs criados fixam até 2; os outros vêm de treino). */
export function elementos(f: FichaDados): string[] {
	const cla = regrasCla(f);
	const principal = cla?.elemento ?? f.elemento;
	const segundo = cla?.segundoElemento ? f.segundoElemento : (cla?.elementoExtra ?? null);
	const treinados = f.progresso.treinos.flatMap((t) => (t.tipo === 'elemento' ? [t.id] : []));
	return [...new Set([principal, segundo, ...treinados].filter((e): e is string => !!e))];
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
	rd: number;
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
	const cla = regrasCla(f);
	const claNome = cla?.nome ?? '';
	// Especializações: soma de PV/PC/PE/Iniciativa no nível atual de cada uma; RD não soma, vale a maior (cap. 4).
	const esps = especializacoes(f);
	const somaEsp = (k: 'pv' | 'pc' | 'pe' | 'iniciativa') => esps.reduce((t, e) => t + valorNivel(ESPECIALIZACOES[e.id]?.recursos?.[k], e.nivel), 0);
	const esp = { pv: somaEsp('pv'), pc: somaEsp('pc'), pe: somaEsp('pe'), iniciativa: somaEsp('iniciativa') };
	const rd = Math.max(0, ...esps.map((e) => valorNivel(ESPECIALIZACOES[e.id]?.recursos?.rd, e.nivel)));
	const niveis = nivelDe(f) - 1;
	const porNivel = PROGRESSAO.porNivel;
	const pericias = linhasPericia(f);
	const acro = pericias.find((p) => p.id === 'acrobacia')!.total;
	const perc = pericias.find((p) => p.id === 'percepcao')!.total;

	const extra = (rotulo: string, n?: number) => (n ? ` + ${n} (${rotulo})` : '');
	const pvVig = RECURSOS.porVig * pos(at.VIG);
	const pv = RECURSOS.pvBase + pvVig + (vila?.ganho.pv ?? 0) + (cla?.ganho.pv ?? 0) + esp.pv + porNivel.pv * niveis;
	const pe = RECURSOS.peBase + pvVig + esp.pe + porNivel.pe * niveis;
	const pcEsp = RECURSOS.porChakra * pos(at.ESP);
	const pcCtr = RECURSOS.porChakra * pos(at.CTR);
	const pc = RECURSOS.pcBase + pcEsp + pcCtr + (cla?.ganho.pc ?? 0) + esp.pc + porNivel.pc * niveis;
	const iniciativa = at.AGI + esp.iniciativa;
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
		rd,
		pd: 1,
		cargaMax,
		carga: (pacote?.carga ?? 0) + compras.carga,
		ryo: (pacote?.ryo ?? 0) - compras.ryo,
		formulas: {
			pv: `20 base + ${pvVig} (VIG ${sinal(at.VIG)})${extra(vila?.nome ?? 'vila', vila?.ganho.pv)}${extra(`Clã ${claNome}`, cla?.ganho.pv)}${extra('especialização', esp.pv)}${extra(`${niveis} ${niveis === 1 ? 'nível' : 'níveis'}`, porNivel.pv * niveis)}`,
			pe: `20 base + ${pvVig} (VIG ${sinal(at.VIG)})${extra('especialização', esp.pe)}${extra(`${niveis} ${niveis === 1 ? 'nível' : 'níveis'}`, porNivel.pe * niveis)}`,
			pc: `30 base + ${pcEsp} (ESP ${sinal(at.ESP)}) + ${pcCtr} (CTR ${sinal(at.CTR)})${extra(`Clã ${claNome}`, cla?.ganho.pc)}${extra('especialização', esp.pc)}${extra(`${niveis} ${niveis === 1 ? 'nível' : 'níveis'}`, porNivel.pc * niveis)}`,
			iniciativa: `1d20 + AGI ${sinal(at.AGI)}${extra('Velocidade', esp.iniciativa)}`,
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
export function analisar(f: FichaDados, ctx: ContextoCampanha, opcoes: { jutsusD: JutsuOpcao[]; loja: ItemLoja[]; statusCla?: string | null; jutsusCriados?: JutsuOpcao[] }): Analise {
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
		const kkg = f.cla.tipo === 'novo-com-kkg';
		const status = opcoes.statusCla ?? null;
		if (!(kkg ? ctx.clasComKkg : ctx.clasSemKkg)) add('bloqueio', `A campanha não permite clãs personalizados ${kkg ? 'com' : 'sem'} KKG`, 4);
		else if (!f.cla.id || !f.cla.criado) add('bloqueio', 'Escolha ou crie o clã', 4);
		else if (f.cla.criado.kkg !== kkg) add('bloqueio', `O clã ${f.cla.criado.nome} ${f.cla.criado.kkg ? 'tem' : 'não tem'} KKG; troque a opção ou o clã`, 4);
		else if (!status || status === 'rejeitado') add('bloqueio', `O clã ${f.cla.criado.nome} não está disponível; escolha outro`, 4);
		else if (status === 'rascunho' || status === 'ajustes') add('bloqueio', `Envie o clã ${f.cla.criado.nome} para a revisão do Mestre antes da ficha`, 4);
		else if (status === 'em_revisao') {
			add('aviso', `O clã ${f.cla.criado.nome} ainda está em revisão; a ficha só é aprovada depois dele`, 4);
			dependencias.push(`Clã ${f.cla.criado.nome}${kkg ? ' (com KKG)' : ''}`);
		}
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
	else if (esp.escolheElemento && !f.especializacaoElemento) add('bloqueio', 'Escolha o elemento da especialização Elemento Específico', 7);

	// 9 · Jutsus
	const els = elementos(f);
	const cla = regrasCla(f);
	if (!els[0]) add('bloqueio', 'Escolha o elemento principal', 9);
	if (cla?.segundoElemento && (!f.segundoElemento || f.segundoElemento === els[0])) add('bloqueio', 'Escolha o segundo elemento do clã Senju (diferente do principal)', 9);
	if (f.jutsus.E.length < JUTSUS_INICIAIS.E) add('bloqueio', `Falta escolher ${JUTSUS_INICIAIS.E - f.jutsus.E.length} jutsu Rank E`, 9);
	else if (f.jutsus.E.length > JUTSUS_INICIAIS.E) add('bloqueio', 'Escolha só 2 jutsus Rank E', 9);
	else add('ok', '2 jutsus Rank E escolhidos', 9);
	if (f.jutsus.D.length > JUTSUS_INICIAIS.D) add('bloqueio', 'Escolha só 1 jutsu Rank D', 9);
	else if (!f.jutsus.D.length) add('aviso', 'Nenhum jutsu Rank D escolhido', 9);
	else {
		const d = [...opcoes.jutsusD, ...(opcoes.jutsusCriados ?? [])].find((j) => j.slug === f.jutsus.D[0]);
		if (d?.elemento && !els.includes(d.elemento)) add('bloqueio', `${d.nome} exige afinidade com ${d.elemento}`, 9);
		else add('ok', 'Jutsu Rank D escolhido', 9);
	}

	// jutsus originais escolhidos na criação vão para a revisão do Mestre junto com a ficha
	for (const slug of [...f.jutsus.E, ...f.jutsus.D].filter((s) => s.startsWith('jc-'))) {
		const j = opcoes.jutsusCriados?.find((x) => x.slug === slug);
		if (!j?.criado) add('bloqueio', 'Um jutsu original escolhido não está mais disponível (rascunho, rejeitado ou apagado)', 9);
		else if (j.criado.status === 'em_revisao') dependencias.push(`Jutsu "${j.nome}"`);
		else if (j.criado.status !== 'aprovado') add('bloqueio', `Envie o jutsu "${j.nome}" para a revisão do Mestre antes da ficha`, 9);
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
		conceito: f.conceito.conceito.trim(),
		cla: f.cla.tipo === 'catalogo' ? f.cla.slug : f.cla.tipo,
		claId: f.cla.tipo === 'catalogo' ? null : (f.cla.id ?? null),
		claNome: regrasCla(f)?.nome ?? null,
		claBrasao: f.cla.criado?.brasao ?? null,
		vila: f.vila.id,
		especializacao: f.especializacao,
		elementos: elementos(f),
		atributos: atributosTotais(f),
		nivel: nivelDe(f),
		pv: r.pv,
		pe: r.pe,
		pc: r.pc,
		defesa: r.defesa,
		defesaMental: r.defesaMental,
		time: f.time.trim(),
		sensei: f.sensei.trim(),
		// lidos pela aprovação (inicializar_ficha_aprovada): PT não gastos e ryo da criação
		ptRestantes: Math.max(0, ptDisponiveis(f).restantes),
		ryo: Math.max(0, r.ryo)
	};
}
export type ResumoFicha = ReturnType<typeof resumoFicha>;

export { nomePericia };
