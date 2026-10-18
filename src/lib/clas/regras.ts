// Motor do criador de clã (cap. 8.4): orçamento de PB, balança de PKG, marcos do Esqueleto Padrão, verificações
// da revisão e as regras que a ficha do personagem usa. Puro, como src/lib/personagem/regras.ts.
import { ATRIBUTOS, ELEMENTOS, VILAS, nomePericia, type Atributo, type Ganho, type Pericia } from '../personagem/dados.ts';
import {
	BENEFICIOS_KKG,
	COMPRAS_PB,
	ESQUELETO,
	LIMITACOES_KKG,
	PASSOS_CLA,
	PB,
	PKG_INICIAIS,
	STATUS_CLA,
	TIPOS_KKG,
	rankAte,
	type BeneficioKkg,
	type CompraPb,
	type LimitacaoKkg,
	type OpcaoMarco,
	type RankJutsu,
	type StatusCla,
	type TipoKkg
} from './dados.ts';

/** Jutsu ou habilidade do clã (Componente 6). Jutsus do catálogo guardam o slug; os originais, nome e descrição. */
export interface CartaCla {
	id: string;
	tipo: 'jutsu' | 'habilidade';
	/** Jutsu do catálogo geral (cap. 10). */
	slug: string | null;
	nome: string;
	rank: RankJutsu | null;
	descricao: string;
}

export interface CompraFeita {
	tipo: CompraPb;
	alvo: string | null;
}

export interface MarcoEscolhido {
	opcao: OpcaoMarco | null;
	carta: string | null;
}

export interface ClaDados {
	versao: 1;
	kkg: boolean;
	conceito: {
		nome: string;
		significado: string;
		/** Id de VILAS ou 'nomade'. */
		vila: string | null;
		historia: string;
		filosofia: string;
		reputacao: string;
		especialidade: string;
		visual: string;
		cor: string;
		kamon: string;
	};
	bonus: { compras: CompraFeita[]; atributo: Atributo | null; pericia: Pericia | null; extraSemKkg: 'pb' | 'jutsu' };
	kekkei: {
		nome: string;
		tipo: TipoKkg | null;
		elementos: [string | null, string | null];
		elementoNovo: string;
		descricao: string;
		beneficios: { id: BeneficioKkg; detalhe: string }[];
		limitacoes: { id: LimitacaoKkg; detalhe: string }[];
	};
	cartas: CartaCla[];
	assinatura: string | null;
	/** Sem KKG, com a opção 'jutsu': o jutsu hereditário extra (também aprendido no nível 1). */
	jutsuExtra: string | null;
	marcos: Record<string, MarcoEscolhido>;
	companheiro: { ativo: boolean; criatura: string; nivel: number; descricao: string };
	patrimonio: string[];
	politica: { status: StatusCla | null; aliado: string; rival: string; posicao: string };
	obrigacoes: string[];
	obrigacaoPropria: string;
	mensagem: string;
}

export function claVazio(kkg: boolean): ClaDados {
	return {
		versao: 1,
		kkg,
		conceito: { nome: '', significado: '', vila: null, historia: '', filosofia: '', reputacao: '', especialidade: '', visual: '', cor: '#C44536', kamon: '01' },
		bonus: { compras: [], atributo: null, pericia: null, extraSemKkg: 'pb' },
		kekkei: { nome: '', tipo: null, elementos: [null, null], elementoNovo: '', descricao: '', beneficios: [], limitacoes: [] },
		cartas: [],
		assinatura: null,
		jutsuExtra: null,
		marcos: {},
		companheiro: { ativo: false, criatura: '', nivel: 1, descricao: '' },
		patrimonio: [],
		politica: { status: null, aliado: '', rival: '', posicao: '' },
		obrigacoes: [],
		obrigacaoPropria: '',
		mensagem: ''
	};
}

export function normalizarCla(d: Partial<ClaDados> | null | undefined, kkg = false): ClaDados {
	const v = claVazio(d?.kkg ?? kkg);
	if (!d) return v;
	return {
		...v,
		...d,
		conceito: { ...v.conceito, ...d.conceito },
		bonus: { ...v.bonus, ...d.bonus },
		kekkei: { ...v.kekkei, ...d.kekkei },
		companheiro: { ...v.companheiro, ...d.companheiro },
		politica: { ...v.politica, ...d.politica },
		marcos: { ...d.marcos }
	};
}

export const novoId = () => Math.random().toString(36).slice(2, 10);
export const carta = (d: ClaDados, id: string | null) => (id ? (d.cartas.find((c) => c.id === id) ?? null) : null);
export const nomeAtributo = (a: string) => ATRIBUTOS.find((x) => x.id === a)?.id ?? a;
const nomeElemento = (e: string) => ELEMENTOS.find((x) => x.id === e)?.nome ?? e;

// ------------------------------------------------------------------ Componente 1 · PB

export function orcamentoPb(d: ClaDados) {
	const limite = PB.base + (!d.kkg && d.bonus.extraSemKkg === 'pb' ? PB.semKkg : 0);
	const usados = d.bonus.compras.reduce((t, c) => t + (COMPRAS_PB.find((x) => x.id === c.tipo)?.pb ?? 0), 0);
	return { limite, usados, restantes: limite - usados };
}

export const qtdCompra = (d: ClaDados, tipo: CompraPb) => d.bonus.compras.filter((c) => c.tipo === tipo).length;

/** Por que não dá para comprar mais uma unidade agora (para o title do botão), ou ''. */
export function limiteCompra(d: ClaDados, tipo: CompraPb): string {
	const def = COMPRAS_PB.find((x) => x.id === tipo)!;
	if (qtdCompra(d, tipo) >= def.max) return def.max === 1 ? 'Só uma vez' : `No máximo ${def.max}`;
	if (def.pb > orcamentoPb(d).restantes) return 'PB insuficiente';
	return '';
}

/** O ganho de criação que a ficha aplica (formato de src/lib/personagem/dados.ts). */
export function ganhoDoCla(d: ClaDados): Ganho {
	const g: Ganho = {};
	for (const c of d.bonus.compras) {
		if (c.tipo === 'atributo' && c.alvo) g.atributo = c.alvo as Atributo;
		else if (c.tipo === 'pericia' && c.alvo) g.pericias = [...(g.pericias ?? []), c.alvo as Pericia];
		else if (c.tipo === 'pv') g.pv = (g.pv ?? 0) + 5;
		else if (c.tipo === 'pc') g.pc = (g.pc ?? 0) + 5;
		else if (c.tipo === 'pt') g.pt = (g.pt ?? 0) + 2;
	}
	return g;
}

export const afinidades = (d: ClaDados) => d.bonus.compras.filter((c) => c.tipo === 'afinidade' && c.alvo).map((c) => c.alvo!);

/** Atributo do clã: o comprado com PB ou, sem compra, o escolhido para os marcos. */
export const atributoDoCla = (d: ClaDados): Atributo | null => (d.bonus.compras.find((c) => c.tipo === 'atributo' && c.alvo)?.alvo as Atributo | undefined) ?? d.bonus.atributo;

/** Texto curto de cada compra, para chips e para a página do livro. */
export function textosBonus(d: ClaDados): string[] {
	const out: string[] = [];
	const g = ganhoDoCla(d);
	if (g.atributo) out.push(`+1 ${g.atributo} (limite de criação +5)`);
	for (const p of g.pericias ?? []) out.push(`+1 em ${nomePericia(p)}`);
	if (g.pv) out.push(`+${g.pv} PV iniciais`);
	if (g.pc) out.push(`+${g.pc} PC iniciais`);
	if (g.pt) out.push(`+${g.pt} PT iniciais`);
	for (const e of afinidades(d)) out.push(`Afinidade com ${nomeElemento(e)}`);
	for (const c of d.bonus.compras) if (c.tipo === 'resistencia') out.push(`Resistência leve: ${c.alvo?.trim() || 'a definir'}`);
	if (qtdCompra(d, 'companheiro')) out.push('Companheiro animal hereditário');
	return out;
}

// ------------------------------------------------------------------ Componente 2 · PKG

export function balancaPkg(d: ClaDados) {
	const beneficios = d.kekkei.beneficios.reduce((t, b) => t + (BENEFICIOS_KKG.find((x) => x.id === b.id)?.pkg ?? 0), 0);
	const limitacoes = d.kekkei.limitacoes.reduce((t, b) => t + (LIMITACOES_KKG.find((x) => x.id === b.id)?.pkg ?? 0), 0);
	const disponiveis = PKG_INICIAIS + limitacoes;
	return { beneficios, limitacoes, disponiveis, saldo: disponiveis - beneficios };
}

export function textoKkg(d: ClaDados): string {
	if (!d.kkg) return '';
	const k = d.kekkei;
	const bens = k.beneficios.map((b) => {
		const def = BENEFICIOS_KKG.find((x) => x.id === b.id);
		return def ? (b.detalhe.trim() ? `${def.nome}: ${b.detalhe.trim()}` : def.nome) : b.id;
	});
	const lims = k.limitacoes.map((b) => {
		const def = LIMITACOES_KKG.find((x) => x.id === b.id);
		return def ? (b.detalhe.trim() ? `${def.nome.toLowerCase()} (${b.detalhe.trim()})` : def.nome.toLowerCase()) : b.id;
	});
	return `${bens.join(' · ') || 'Sem benefícios'}. Limitações: ${lims.join(', ') || 'nenhuma'}.`;
}

export function rotuloKkg(d: ClaDados): string | null {
	if (!d.kkg) return null;
	const nome = d.kekkei.nome.trim() || 'KKG sem nome';
	const [a, b] = d.kekkei.elementos;
	if (d.kekkei.tipo === 'combinacao' && a && b) return `${nome} · ${nomeElemento(a)} + ${nomeElemento(b)}`;
	const tipo = TIPOS_KKG.find((t) => t.id === d.kekkei.tipo)?.nome;
	return tipo ? `${nome} · ${tipo}` : nome;
}

// ------------------------------------------------------------------ Componentes 3, 4 e 6 · jutsus e marcos

/** Cartas que cabem numa opção de marco ("até Rank X"). */
export function cartasPara(d: ClaDados, opcao: OpcaoMarco, rank?: string): CartaCla[] {
	if (opcao === 'habilidade') return d.cartas.filter((c) => c.tipo === 'habilidade');
	if (opcao === 'jutsu') return d.cartas.filter((c) => c.tipo === 'jutsu' && c.rank && (!rank || rankAte(c.rank, rank)) && c.id !== d.assinatura);
	return [];
}

export interface LinhaMarco {
	nivel: number;
	regra: string;
	/** Texto final do marco, no formato que a ficha lê (src/lib/personagem/progressao.ts, lerMarco). */
	texto: string;
	tipo: 'fixo' | 'escolha';
	completo: boolean;
	problema: string;
}

/** As 20 linhas do Esqueleto Padrão com o que o clã escolheu. */
export function linhasMarcos(d: ClaDados): LinhaMarco[] {
	const at = atributoDoCla(d);
	const per = d.bonus.pericia;
	return ESQUELETO.map((e) => {
		const pic = e.pic ? `+${e.pic} PIC` : '';
		if (e.nivel === 1) {
			const a = carta(d, d.assinatura);
			const extra = carta(d, d.jutsuExtra);
			const nomes = [a?.nome, !d.kkg && d.bonus.extraSemKkg === 'jutsu' ? extra?.nome : null].filter(Boolean).join('; ');
			const ok = !!a && (!a.rank || a.rank === 'D' || a.rank === 'C');
			return { nivel: 1, regra: e.texto, texto: [nomes || 'Jutsu assinatura', pic].join('; '), tipo: 'escolha', completo: ok, problema: !a ? 'Escolha o jutsu assinatura' : ok ? '' : 'A assinatura é Rank D ou C' };
		}
		if (e.fixo) {
			let texto = e.fixo;
			let problema = '';
			if (e.fixo.startsWith('atributo')) {
				const lim = e.fixo.split('-')[1];
				texto = at ? `+1 ${at}${lim ? `; limite de ${at} +${lim}` : ''}` : `+1 no atributo do clã${lim ? `; limite +${lim}` : ''}`;
				if (!at) problema = 'Defina o atributo do clã';
			} else if (e.fixo === 'pericia') {
				texto = per ? `+1 em ${nomePericia(per)}` : '+1 na perícia do clã';
				if (!per) problema = 'Defina a perícia do clã';
			}
			return { nivel: e.nivel, regra: e.texto, texto, tipo: 'fixo', completo: !problema, problema };
		}
		const m = d.marcos[e.nivel] ?? { opcao: null, carta: null };
		const opcao = m.opcao ?? (e.opcoes!.length === 1 ? e.opcoes![0] : null);
		let texto = '';
		let problema = '';
		if (!opcao) problema = 'Escolha o ganho do nível';
		else if (opcao === 'pt') texto = '+3 PT';
		else if (opcao === 'criar') texto = `Criar Jutsu do Clã (até Rank ${e.rank})`;
		else {
			const c = carta(d, m.carta);
			const valida = c && cartasPara(d, opcao, e.rank).some((x) => x.id === c.id);
			if (!c) problema = opcao === 'habilidade' ? 'Escolha a habilidade' : 'Escolha o jutsu';
			else if (!valida) problema = `${c.nome} passa do Rank ${e.rank}`;
			texto = c ? (opcao === 'habilidade' ? `Habilidade: ${c.nome}` : c.nome) : '';
		}
		return { nivel: e.nivel, regra: e.texto, texto: [pic, texto].filter(Boolean).join('; ') || e.texto, tipo: 'escolha', completo: !problema, problema };
	});
}

// ------------------------------------------------------------------ Componente 7 e 8

export const nomade = (d: ClaDados) => d.conceito.vila === 'nomade' || d.politica.status === 'extinto';
export const limitePatrimonio = (d: ClaDados) => (nomade(d) ? 1 : 2);
export const picDoStatus = (d: ClaDados) => STATUS_CLA.find((s) => s.id === d.politica.status)?.pic ?? 0;

export function nomeVila(id: string | null) {
	if (id === 'nomade') return 'Nômade';
	return VILAS.find((v) => v.id === id)?.nome ?? '';
}

// ------------------------------------------------------------------ revisão (passo 10)

export type NivelCla = 'ok' | 'aviso' | 'bloqueio';
export interface VerificacaoCla {
	nivel: NivelCla;
	texto: string;
	passo: number;
}

export function analisarCla(d: ClaDados) {
	const v: VerificacaoCla[] = [];
	const add = (nivel: NivelCla, texto: string, passo: number) => v.push({ nivel, texto, passo });
	const c = d.conceito;

	// 0 · Conceito
	if (c.nome.trim().length < 2) add('bloqueio', 'Dê um nome ao clã', 0);
	if (!c.vila) add('aviso', 'Escolha a vila de origem (ou nômade)', 0);
	const frases = contarFrases(c.historia);
	if (!c.historia.trim()) add('aviso', 'Escreva a história do clã em 2 ou 3 frases', 0);
	else if (frases > 3) add('aviso', `História com ${frases} frases (o livro pede 2 ou 3)`, 0);

	// 1 · PB
	const pb = orcamentoPb(d);
	if (pb.restantes < 0) add('bloqueio', `${-pb.restantes} PB acima do orçamento`, 1);
	else if (pb.restantes > 0) add('aviso', `${pb.restantes} PB não ${pb.restantes === 1 ? 'gasto' : 'gastos'}`, 1);
	else add('ok', `PB gastos (${pb.usados}/${pb.limite})`, 1);
	const semAlvo = d.bonus.compras.filter((x) => COMPRAS_PB.find((y) => y.id === x.tipo && 'alvo' in y) && !x.alvo?.trim());
	if (semAlvo.length) add('bloqueio', 'Complete as escolhas das compras de PB', 1);
	const pers = d.bonus.compras.filter((x) => x.tipo === 'pericia' && x.alvo).map((x) => x.alvo);
	const els = afinidades(d);
	if (new Set(pers).size < pers.length || new Set(els).size < els.length) add('bloqueio', 'Cada perícia e cada afinidade só pode ser comprada uma vez', 1);
	if (!atributoDoCla(d)) add('bloqueio', 'Defina o atributo do clã (usado nos marcos 5, 9, 15 e 18)', 1);
	if (!d.bonus.pericia) add('bloqueio', 'Defina a perícia do clã (usada no marco 12)', 1);

	// 2 · KKG
	if (d.kkg) {
		const k = d.kekkei;
		const bal = balancaPkg(d);
		if (!k.nome.trim()) add('bloqueio', 'Dê um nome ao Kekkei Genkai', 2);
		if (!k.tipo) add('bloqueio', 'Escolha o tipo de Kekkei Genkai', 2);
		if (!k.beneficios.length) add('bloqueio', 'Escolha pelo menos um benefício do KKG', 2);
		const combina = k.beneficios.some((b) => b.id === 'combinacao');
		if (combina && (!k.elementos[0] || !k.elementos[1] || k.elementos[0] === k.elementos[1])) add('bloqueio', 'Escolha os 2 elementos (diferentes) da combinação', 2);
		const faltaDetalhe = [...k.beneficios.map((b) => [BENEFICIOS_KKG.find((x) => x.id === b.id), b.detalhe] as const), ...k.limitacoes.map((b) => [LIMITACOES_KKG.find((x) => x.id === b.id), b.detalhe] as const)].some(
			([def, det]) => def && 'detalhe' in def && !det.trim()
		);
		if (faltaDetalhe) add('bloqueio', 'Responda o detalhe dos benefícios e limitações marcados', 2);
		if (bal.saldo < 0) add('bloqueio', `KKG desequilibrado: faltam ${-bal.saldo} PKG`, 2);
		else if (bal.saldo > 0) add('aviso', `Sobram ${bal.saldo} PKG`, 2);
		else add('ok', 'KKG equilibrado', 2);
	} else if (d.bonus.extraSemKkg === 'jutsu') {
		const ex = carta(d, d.jutsuExtra);
		if (!ex) add('bloqueio', 'Escolha o jutsu hereditário extra (bônus de clã sem KKG)', 6);
		else if (ex.rank && !rankAte(ex.rank, 'C')) add('bloqueio', 'O jutsu extra do nível 1 vai até o Rank C', 6);
	}

	// 3 e 4 · assinatura e marcos
	const linhas = linhasMarcos(d);
	for (const l of linhas) if (l.problema && l.tipo === 'escolha') add(l.nivel === 1 ? 'bloqueio' : 'aviso', `Nível ${l.nivel}: ${l.problema}`, l.nivel === 1 ? 3 : 4);
	const completos = linhas.filter((l) => l.completo).length;
	if (completos === 20) add('ok', 'Os 20 marcos estão completos', 4);
	else add('aviso', `${20 - completos} ${20 - completos === 1 ? 'marco sem conteúdo' : 'marcos sem conteúdo'} (${completos}/20)`, 4);

	// 5 · companheiro
	if (d.companheiro.ativo && !d.companheiro.criatura.trim()) add('bloqueio', 'Descreva a criatura do companheiro', 5);

	// 6 · cartas
	const semNome = d.cartas.filter((x) => !x.nome.trim() || (!x.slug && !x.descricao.trim()));
	if (semNome.length) add('bloqueio', 'Todo jutsu e habilidade original precisa de nome e descrição', 6);
	const usadas = new Set([d.assinatura, d.jutsuExtra, ...Object.values(d.marcos).map((m) => m.carta)].filter(Boolean));
	const naoUsadas = d.cartas.filter((x) => !usadas.has(x.id));
	if (naoUsadas.length) add('aviso', `${naoUsadas.length} ${naoUsadas.length === 1 ? 'carta não usada' : 'cartas não usadas'} nos marcos`, 6);
	const nJutsus = d.cartas.filter((x) => x.tipo === 'jutsu').length;
	const nHab = d.cartas.filter((x) => x.tipo === 'habilidade').length;
	if (nJutsus < 7 || nHab < 2) add('aviso', `${nJutsus} ${nJutsus === 1 ? 'jutsu' : 'jutsus'} e ${nHab} ${nHab === 1 ? 'habilidade' : 'habilidades'} (o livro recomenda 7 a 9 jutsus e 2 habilidades)`, 6);

	// 7 · patrimônio
	const lim = limitePatrimonio(d);
	if (d.patrimonio.length !== lim) add(d.patrimonio.length > lim ? 'bloqueio' : 'aviso', `Escolha ${lim} ${lim === 1 ? 'recurso' : 'recursos'} de patrimônio (${d.patrimonio.length} escolhidos)`, 7);

	// 8 · política
	if (!d.politica.status) add('bloqueio', 'Escolha o status do clã (define o PIC)', 8);
	if (!d.politica.aliado.trim() || !d.politica.rival.trim()) add('aviso', 'Defina 1 clã aliado e 1 clã rival', 8);

	// 9 · obrigação
	if (!d.obrigacoes.length && !d.obrigacaoPropria.trim()) add('bloqueio', 'Escolha pelo menos 1 obrigação', 9);

	const bloqueio = (p: number) => v.some((x) => x.passo === p && x.nivel === 'bloqueio');
	const aviso = (p: number) => v.some((x) => x.passo === p && x.nivel === 'aviso');
	const passos = PASSOS_CLA.map((_, i) => {
		if (i === 10) return 'pendente' as const;
		if (i === 2 && !d.kkg) return 'feito' as const;
		if (bloqueio(i)) return 'erro' as const;
		if (aviso(i)) return 'pendente' as const;
		return 'feito' as const;
	});
	return { verificacoes: v, passos, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length, marcosCompletos: completos };
}
export type AnaliseCla = ReturnType<typeof analisarCla>;

export function contarFrases(t: string) {
	return t
		.split(/[.!?…]+/)
		.map((s) => s.trim())
		.filter(Boolean).length;
}

// ------------------------------------------------------------------ o clã visto pela ficha do personagem

/** Regras de criação que a ficha copia do clã (o mesmo formato de CLAS em src/lib/personagem/dados.ts). */
export interface RegrasClaCriado {
	id: string;
	nome: string;
	kkg: boolean;
	ganho: Ganho;
	jutsus: string[];
	/** Nome e rank dos jutsus do nível 1 (os originais não estão no catálogo do livro). */
	jutsusInfo?: { slug: string; nome: string; rank: string | null }[];
	marco: string;
	elemento?: string;
	/** Segundo elemento já definido pelo clã (2ª afinidade comprada com PB). */
	elementoExtra?: string;
	extras: string[];
	pic: number;
	brasao: { kamon: string; cor: string };
}

/** Slug estável de um jutsu original do clã (o do catálogo usa o próprio slug). */
export const slugCarta = (claId: string, c: CartaCla) => c.slug ?? `cla-${claId.slice(0, 8)}-${c.id}`;

export function regrasParaFicha(id: string, d: ClaDados): RegrasClaCriado {
	const els = afinidades(d);
	const nivel1 = [carta(d, d.assinatura), !d.kkg && d.bonus.extraSemKkg === 'jutsu' ? carta(d, d.jutsuExtra) : null].filter((c): c is CartaCla => !!c);
	const extras: string[] = [];
	const rk = rotuloKkg(d);
	if (rk) extras.push(`KKG ${rk}`);
	for (const c of d.bonus.compras) if (c.tipo === 'resistencia' && c.alvo?.trim()) extras.push(`Resistência leve: ${c.alvo.trim()}`);
	if (qtdCompra(d, 'companheiro') || (d.companheiro.ativo && d.companheiro.nivel <= 1)) extras.push(d.companheiro.criatura.trim() ? `Companheiro: ${d.companheiro.criatura.trim()}` : 'Companheiro animal hereditário');
	return {
		id,
		nome: d.conceito.nome.trim() || 'Clã sem nome',
		kkg: d.kkg,
		ganho: ganhoDoCla(d),
		jutsus: nivel1.map((c) => slugCarta(id, c)),
		jutsusInfo: nivel1.map((c) => ({ slug: slugCarta(id, c), nome: c.nome, rank: c.rank })),
		marco: linhasMarcos(d)[0].texto,
		elemento: els[0],
		elementoExtra: els[1],
		extras,
		pic: picDoStatus(d),
		brasao: { kamon: d.conceito.kamon, cor: d.conceito.cor }
	};
}

/** Marcos e dados do clã no formato do catálogo da ficha (src/lib/personagem/catalogo.server.ts). */
export function claParaFicha(id: string, d: ClaDados) {
	return {
		slug: null as string | null,
		id,
		nome: d.conceito.nome.trim() || 'Clã sem nome',
		epiteto: d.conceito.significado.trim(),
		kkg: rotuloKkg(d),
		status: STATUS_CLA.find((s) => s.id === d.politica.status)?.nome ?? null,
		bonus: textosBonus(d),
		relacoes: [
			...(d.politica.aliado.trim() ? [{ nome: d.politica.aliado.trim(), relacao: 'Aliado' }] : []),
			...(d.politica.rival.trim() ? [{ nome: d.politica.rival.trim(), relacao: 'Rival' }] : [])
		],
		obrigacao: [...d.obrigacoes, d.obrigacaoPropria.trim()].filter(Boolean).join(' · '),
		marcos: linhasMarcos(d).map((l) => ({ nivel: l.nivel, texto: l.texto })),
		brasao: { kamon: d.conceito.kamon, cor: d.conceito.cor }
	};
}

/** Resumo gravado junto do clã para as listas (K1, passo 4 da criação). */
export function resumoCla(d: ClaDados) {
	return {
		nome: d.conceito.nome.trim(),
		significado: d.conceito.significado.trim(),
		vila: d.conceito.vila,
		kkg: d.kkg ? d.kekkei.nome.trim() || 'KKG' : null,
		kkgTipo: d.kekkei.tipo,
		cor: d.conceito.cor,
		kamon: d.conceito.kamon,
		bonus: textosBonus(d)
	};
}
export type ResumoCla = ReturnType<typeof resumoCla>;
