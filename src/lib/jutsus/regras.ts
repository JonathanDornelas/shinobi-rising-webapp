// Motor do criador de jutsu (cap. 20): soma os PJ dos componentes, define rank, custo e PT para aprender, preenche
// os seis atributos da linha de info e faz as verificações do envio. Também cobre a habilidade (J3), que não tem PJ.
// Puro, como src/lib/personagem/regras.ts.
import type { InfoJutsu, Jutsu, Rank, TipoJutsu } from '#lib/livro/tipos.ts';
import { PROGRESSAO } from '../personagem/dados.ts';
import {
	ACOES,
	ALCANCES,
	ALVO_EXTRA,
	APOIO,
	AREAS,
	ATRIBUTO_DO_TIPO,
	EFEITOS,
	MODIFICADORES,
	ROTULO_ALCANCE,
	SENSEI_PJ,
	TIPOS_FISICOS,
	mediaDoDado,
	pjDoDano,
	rankDoPj,
	type Acao,
	type Alcance,
	type Area,
	type Componente,
	type Dado
} from './dados.ts';

export type CampoInfo = 'alcance' | 'duracao' | 'area' | 'ataque' | 'resistencia' | 'acao';
export const CAMPOS_INFO: { id: CampoInfo; rotulo: string }[] = [
	{ id: 'alcance', rotulo: 'Alcance' },
	{ id: 'duracao', rotulo: 'Duração' },
	{ id: 'area', rotulo: 'Área' },
	{ id: 'ataque', rotulo: 'Ataque' },
	{ id: 'resistencia', rotulo: 'Resistência' },
	{ id: 'acao', rotulo: 'Ação' }
];

export interface JutsuDados {
	versao: 1;
	nome: string;
	traducao: string;
	tipo: TipoJutsu | null;
	elemento: string | null;
	selos: string[];
	descricao: string;
	efeito: string;
	dano: { modo: 'nenhum' | 'dano' | 'cura'; qtd: number; dado: Dado; bonus: number };
	alcance: Alcance;
	area: Area;
	alvosExtras: number;
	/** Componentes comprados: id → quantidade (liga/qtd) ou valor em PJ (valor). */
	componentes: Record<string, number>;
	acao: Acao;
	sensei: boolean;
	/** Campos da linha de info editados à mão (o resto é automático). */
	info: Partial<Record<CampoInfo, string>>;
	mensagem: string;
}

/** Habilidade passiva (J3): só nome, origem e efeito. */
export interface HabilidadeDados {
	versao: 1;
	nome: string;
	traducao: string;
	efeito: string;
	descricao: string;
	mensagem: string;
}

export function jutsuVazio(): JutsuDados {
	return {
		versao: 1,
		nome: '',
		traducao: '',
		tipo: null,
		elemento: null,
		selos: [],
		descricao: '',
		efeito: '',
		dano: { modo: 'nenhum', qtd: 1, dado: 6, bonus: 0 },
		alcance: 'toque',
		area: 'unico',
		alvosExtras: 0,
		componentes: {},
		acao: 'primaria',
		sensei: false,
		info: {},
		mensagem: ''
	};
}
export const habilidadeVazia = (): HabilidadeDados => ({ versao: 1, nome: '', traducao: '', efeito: '', descricao: '', mensagem: '' });

export function normalizarJutsu(d: Partial<JutsuDados> | null | undefined): JutsuDados {
	const v = jutsuVazio();
	if (!d) return v;
	return { ...v, ...d, dano: { ...v.dano, ...d.dano }, componentes: { ...d.componentes }, info: { ...d.info }, selos: [...(d.selos ?? [])] };
}
export const normalizarHabilidade = (d: Partial<HabilidadeDados> | null | undefined): HabilidadeDados => ({ ...habilidadeVazia(), ...d });

const TODOS: Componente[] = [...EFEITOS, ...APOIO, ...MODIFICADORES];
export const componente = (id: string) => TODOS.find((c) => c.id === id);

/** PJ de um componente com o valor guardado (quantidade ou valor escolhido). */
export function pjDoComponente(c: Componente, valor: number): number {
	if (!valor) return 0;
	if (c.tipo === 'valor') return valor;
	if (c.tipo === 'qtd') return c.pj * Math.min(valor, c.max ?? valor);
	return c.pj;
}

export const mediaDano = (d: JutsuDados) => (d.dano.modo === 'nenhum' ? 0 : d.dano.qtd * mediaDoDado(d.dano.dado) + d.dano.bonus);
const sinalPj = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
export const textoDado = (d: JutsuDados) => `${d.dano.qtd}d${d.dano.dado}${d.dano.bonus ? (d.dano.bonus > 0 ? `+${d.dano.bonus}` : `${d.dano.bonus}`) : ''}`;

/** Dados de dano ou cura do jutsu criado para a rolagem na ficha (Taijutsu e Bukijutsu somam o atributo, cap. 20). */
export function rolagemDoJutsu(d: JutsuDados): { modo: 'dano' | 'cura'; dados: string; atributo: string | null } | null {
	if (d.dano.modo === 'nenhum') return null;
	const fisico = d.dano.modo === 'dano' && !!d.tipo && TIPOS_FISICOS.includes(d.tipo);
	return { modo: d.dano.modo, dados: textoDado(d), atributo: fisico ? ATRIBUTO_DO_TIPO[d.tipo!] : null };
}

export interface LinhaPj {
	rotulo: string;
	pj: number;
}

/** A conta de PJ, o rank e o custo (cap. 20, Passos 2 a 4). */
export function calcularJutsu(d: JutsuDados) {
	const linhas: LinhaPj[] = [];
	const media = mediaDano(d);
	const fisico = !!d.tipo && TIPOS_FISICOS.includes(d.tipo);
	if (d.dano.modo !== 'nenhum') {
		linhas.push({ rotulo: `${d.dano.modo === 'cura' ? 'Cura' : 'Dano'} ${textoDado(d)}${fisico && d.dano.modo === 'dano' ? ` + ${ATRIBUTO_DO_TIPO[d.tipo!]}` : ''} (média ${media.toLocaleString('pt-BR')})`, pj: pjDoDano(media) });
	}
	const alc = ALCANCES.find((a) => a.id === d.alcance)!;
	linhas.push({ rotulo: `Alcance ${alc.nome}`, pj: alc.pj });
	const area = AREAS.find((a) => a.id === d.area)!;
	linhas.push({ rotulo: `Área ${area.nome}`, pj: area.pj });
	if (d.area === 'unico' && d.alvosExtras > 0) linhas.push({ rotulo: `${d.alvosExtras} ${d.alvosExtras === 1 ? 'alvo adicional' : 'alvos adicionais'}`, pj: ALVO_EXTRA.pj * Math.min(d.alvosExtras, ALVO_EXTRA.max) });
	for (const c of TODOS) {
		const v = d.componentes[c.id] ?? 0;
		if (!v) continue;
		const pj = pjDoComponente(c, v);
		linhas.push({ rotulo: c.tipo === 'qtd' ? `${c.nome} ×${v}` : c.nome, pj });
	}
	const acao = ACOES.find((a) => a.id === d.acao)!;
	if (acao.pj) linhas.push({ rotulo: `Ação ${acao.nome}`, pj: acao.pj });
	if (d.sensei) linhas.push({ rotulo: 'Criado com um Sensei', pj: SENSEI_PJ });

	const bruto = linhas.reduce((t, l) => t + l.pj, 0);
	const pj = Math.max(1, bruto);
	const r = rankDoPj(pj);
	const nivelMin = PROGRESSAO.rankPorNivel[r.rank] ?? 1;
	const custo = custoDoJutsu(d.tipo, pj);
	const sustentado = (d.componentes.sustentado ?? 0) > 0 ? Math.max(1, Math.ceil(pj / 4)) : 0;
	return { linhas, bruto, pj, rank: r.rank, ptAprender: r.pt, bonusDt: r.dt, nivelMin, custo, sustentado, media };
}
export type CalculoJutsu = ReturnType<typeof calcularJutsu>;

/** Custo final = PJ, em PC (PE no Taijutsu e Bukijutsu); Kugutsu divide entre PC e PE. */
export function custoDoJutsu(tipo: TipoJutsu | null, pj: number) {
	if (tipo && TIPOS_FISICOS.includes(tipo)) return { pc: 0, pe: pj, texto: `${pj} PE` };
	if (tipo === 'Kugutsu') {
		const pc = Math.ceil(pj / 2);
		return { pc, pe: pj - pc, texto: pj - pc ? `${pc} PC + ${pj - pc} PE` : `${pc} PC` };
	}
	return { pc: pj, pe: 0, texto: `${pj} PC` };
}

const PERICIA_DO_TIPO: Record<TipoJutsu, string> = { Ninjutsu: 'Ninjutsu', Genjutsu: 'Genjutsu', Taijutsu: 'Taijutsu', Bukijutsu: 'Bukijutsu', Fuuinjutsu: 'Selamento', Kugutsu: 'Kugutsu' };

/** Os seis atributos padronizados, deduzidos das compras (cap. 20, Passo 5). */
export function infoAutomatica(d: JutsuDados, calc = calcularJutsu(d)): Record<CampoInfo, string> {
	const c = (id: string) => (d.componentes[id] ?? 0) > 0;
	const emArea = d.area !== 'unico';
	const custoTurno = calc.sustentado ? `${calc.sustentado} ${calc.custo.pe && !calc.custo.pc ? 'PE' : 'PC'}/turno` : '';
	const turnosExtra = d.componentes.turnos ?? 0;
	const duracao = calc.sustentado
		? `Sustentado (${custoTurno})`
		: c('buff-cena')
			? '1 cena'
			: c('buff1') || c('buff2') || c('rd2') || c('buff-aliado')
				? '3 turnos'
				: c('barreira') || c('invocacao')
					? '1 cena'
					: turnosExtra
						? `${1 + turnosExtra} turnos`
						: 'Instantâneo';
	const area = d.area === 'unico' ? (d.alvosExtras ? `Alvo único +${d.alvosExtras}` : 'Alvo único') : AREAS.find((a) => a.id === d.area)!.nome;
	const soApoio = d.alcance === 'pessoal' && d.dano.modo === 'nenhum';
	const ataque = c('persegue')
		? 'Automático'
		: emArea
			? '— (área)'
			: soApoio || d.dano.modo === 'cura'
				? 'Automático'
				: d.tipo
					? `1d20 + ${PERICIA_DO_TIPO[d.tipo]}`
					: '—';
	// atributo da Resistência: Acrobacia contra área, FOR contra prisão e empurrão, VIG contra veneno e atordoamento, ESP contra Genjutsu
	let resistencia = '—';
	if (d.tipo === 'Genjutsu' && !soApoio) resistencia = 'ESP (DT do Jutsu)';
	else if (emArea) resistencia = 'Acrobacia (DT do Jutsu)';
	else {
		const r = EFEITOS.find((e) => c(e.id) && e.resistencia)?.resistencia;
		if (r) resistencia = `${r} (DT do Jutsu)`;
	}
	return {
		alcance: ROTULO_ALCANCE[d.alcance],
		duracao,
		area,
		ataque,
		resistencia,
		acao: ACOES.find((a) => a.id === d.acao)!.nome
	};
}

export const infoFinal = (d: JutsuDados, calc?: CalculoJutsu): Record<CampoInfo, string> => {
	const auto = infoAutomatica(d, calc);
	return Object.fromEntries(CAMPOS_INFO.map(({ id }) => [id, d.info[id]?.trim() || auto[id]])) as Record<CampoInfo, string>;
};

/** Efeito sugerido a partir das compras, para o jogador partir dele. */
export function efeitoSugerido(d: JutsuDados): string {
	const partes: string[] = [];
	if (d.dano.modo === 'dano') partes.push(`Causa ${textoDado(d)}${d.tipo && TIPOS_FISICOS.includes(d.tipo) ? ` + ${ATRIBUTO_DO_TIPO[d.tipo]}` : ''} de dano${d.area !== 'unico' ? ' em área (metade em sucesso na Resistência)' : ''}`);
	if (d.dano.modo === 'cura') partes.push(`Cura ${textoDado(d)} PV de um aliado`);
	const nomes = [...EFEITOS, ...APOIO].filter((c) => (d.componentes[c.id] ?? 0) > 0).map((c) => c.nome.charAt(0).toLowerCase() + c.nome.slice(1));
	if (nomes.length) partes.push(nomes.join('; '));
	return partes.length ? `${partes.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join('. ')}.` : '';
}

export type NivelVerificacao = 'ok' | 'aviso' | 'bloqueio';
export interface VerificacaoJutsu {
	nivel: NivelVerificacao;
	texto: string;
	secao: number;
}

/** Contexto de quem vai usar: personagem (nível, PC/PE máximos, elementos) ou a carta de um clã (rank previsto). */
export interface ContextoJutsu {
	nome?: string;
	nivel?: number | null;
	pcMax?: number | null;
	peMax?: number | null;
	elementos?: string[] | null;
	/** Rank que a carta do clã prevê. */
	rankCarta?: Rank | null;
}

export function analisarJutsu(d: JutsuDados, ctx: ContextoJutsu = {}, calc = calcularJutsu(d)) {
	const v: VerificacaoJutsu[] = [];
	const add = (nivel: NivelVerificacao, texto: string, secao: number) => v.push({ nivel, texto, secao });
	if (!d.nome.trim()) add('bloqueio', 'Dê um nome ao jutsu', 0);
	if (!d.tipo) add('bloqueio', 'Escolha o tipo do jutsu', 0);
	if (calc.bruto <= 0 && d.dano.modo === 'nenhum' && !Object.values(d.componentes).some(Boolean)) add('aviso', 'Nenhum componente comprado ainda', 1);
	if ((d.componentes.transfere ?? 0) && !(d.componentes.drena ?? 0)) add('bloqueio', 'Transferir chakra exige o componente Drena chakra', 1);
	if ((d.componentes['buff-cena'] ?? 0) && !['buff1', 'buff2', 'buff-aliado'].some((b) => d.componentes[b])) add('bloqueio', '“Buff dura 1 cena” exige um buff', 1);
	if ((d.componentes.turnos ?? 0) && !EFEITOS.some((e) => e.resistencia && d.componentes[e.id])) add('aviso', 'Turnos extras valem para uma condição; nenhuma foi comprada', 1);
	if (d.area === 'massiva' && calc.rank !== 'S') add('bloqueio', 'Área massiva é só para Rank S', 1);
	if (d.dano.modo !== 'nenhum' && (d.dano.qtd < 1 || d.dano.qtd > 20)) add('bloqueio', 'Use de 1 a 20 dados', 1);
	if (d.alcance === 'pessoal' && d.dano.modo === 'dano' && d.area === 'unico') add('aviso', 'Dano com alcance Pessoal só atinge o próprio usuário; use Toque ou uma área', 1);

	if (ctx.nivel != null) {
		if (calc.nivelMin > ctx.nivel) add('bloqueio', `Rank ${calc.rank} exige nível ${calc.nivelMin}${ctx.nome ? ` (${ctx.nome} está no ${ctx.nivel})` : ''}`, 2);
		else add('ok', `Rank ${calc.rank} liberado para o nível ${ctx.nivel}`, 2);
	}
	if (calc.rank === 'S') add('aviso', 'Rank S costuma exigir um arco da campanha (cap. 20.6)', 2);
	if (ctx.rankCarta && ctx.rankCarta !== calc.rank) add('aviso', `A carta do clã prevê Rank ${ctx.rankCarta}; o jutsu calculou Rank ${calc.rank}`, 2);
	if (ctx.pcMax != null && calc.custo.pc > ctx.pcMax) add('aviso', `Custo acima do PC máximo (${ctx.pcMax}): existe, mas não dá para usar ainda`, 3);
	if (ctx.peMax != null && calc.custo.pe > ctx.peMax) add('aviso', `Custo acima do PE máximo (${ctx.peMax}): existe, mas não dá para usar ainda`, 3);
	if (ctx.elementos && d.elemento && !ctx.elementos.includes(d.elemento)) add('aviso', 'O personagem ainda não tem afinidade com o elemento do jutsu', 0);

	if (!d.efeito.trim()) add('bloqueio', 'Descreva o efeito do jutsu', 5);
	if (!d.descricao.trim()) add('aviso', 'Uma descrição narrativa ajuda o Mestre a aprovar', 5);
	return { verificacoes: v, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length };
}

export function analisarHabilidade(d: HabilidadeDados) {
	const v: VerificacaoJutsu[] = [];
	if (!d.nome.trim()) v.push({ nivel: 'bloqueio', texto: 'Dê um nome à habilidade', secao: 0 });
	if (!d.efeito.trim()) v.push({ nivel: 'bloqueio', texto: 'Descreva o efeito', secao: 0 });
	return { verificacoes: v, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length };
}

/** DT do jutsu = 10 + bônus do rank + atributo-chave do lançador. */
export const dtDoJutsu = (calc: CalculoJutsu, atributo: number) => 10 + calc.bonusDt + atributo;

/** O jutsu criado no formato dos cards do livro (para o CardJutsu e o catálogo da ficha). */
export function paraJutsuLivro(slug: string, d: JutsuDados, origem: string, calc = calcularJutsu(d)): Jutsu {
	const info = infoFinal(d, calc);
	return {
		slug,
		nome: d.nome.trim() || 'Nome do jutsu',
		traducao: d.traducao.trim(),
		origem,
		tipo: d.tipo ?? 'Ninjutsu',
		rank: calc.rank,
		custo: calc.custo.texto,
		custoNum: calc.custo.pc || calc.custo.pe,
		descricao: d.descricao.trim() ? [[{ t: d.descricao.trim() }]] : [],
		info: CAMPOS_INFO.map(({ id, rotulo }) => ({ k: rotulo, v: info[id] }) as InfoJutsu),
		efeito: d.efeito.trim() ? [{ t: d.efeito.trim() }] : null,
		notas: d.selos.length && !(d.componentes['sem-selos'] ?? 0) ? [[{ t: `Selos: ${d.selos.join(' · ')}.` }]] : [],
		pj: calc.linhas.some((l) => l.pj) ? `${calc.linhas.filter((l) => l.pj).map((l) => `${l.rotulo} (${sinalPj(l.pj)})`).join(' · ')} = ${calc.pj} PJ` : `${calc.pj} PJ (mínimo)`,
		capitulo: 20,
		ancora: '',
		cla: null,
		elemento: d.elemento
	};
}

/** Resumo gravado junto do jutsu para as listas (J1, treino, clã). */
export function resumoJutsu(d: JutsuDados) {
	const calc = calcularJutsu(d);
	return { nome: d.nome.trim(), tipo: d.tipo, rank: calc.rank, custo: calc.custo.texto, pj: calc.pj, elemento: d.elemento };
}
export type ResumoJutsu = ReturnType<typeof resumoJutsu>;
