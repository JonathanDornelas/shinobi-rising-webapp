// Progressão e ficha em jogo: XP e nível (cap. 17), marcos de clã (cap. 8.3), treino com PT (cap. 18),
// custo real dos jutsus (cap. 9), PIC, estado em jogo (cap. 4) e inventário (cap. 11). Puro, como regras.ts.
import type { EstadoKkg } from './kkg.ts';
import {
	ATRIBUTOS,
	CUSTO_ELEMENTO,
	CUSTO_ESPECIALIZACAO,
	CUSTO_JUTSU,
	custoProficiencia,
	ELEMENTOS,
	ESPECIALIZACOES,
	NIVEIS_PROFICIENCIA,
	PACOTES,
	PERICIAS,
	PROFICIENCIA_NIVEL_MIN,
	PROGRESSAO,
	nomePericia,
	type Atributo,
	type Pericia
} from './dados.ts';
import {
	atributoDoCla,
	atributosTotais,
	elementos,
	especializacoes,
	jutsusConhecidos,
	limitesAtributo,
	nivelDe,
	proficiencias,
	recursos,
	regrasCla,
	treinoPericia,
	type EscolhaNivel,
	type FichaDados,
	type GanhoMarco,
	type ItemLoja,
	type Treino
} from './regras.ts';

// ------------------------------------------------------------------ XP e nível

export const xpDoNivel = (n: number) => PROGRESSAO.xp[Math.min(Math.max(n, 1), 20) - 1];

/** Barra de XP do nível atual até o próximo, e se já dá para subir. */
export function progressoXp(nivel: number, xp: number) {
	if (nivel >= 20) return { atual: xp, alvo: xp, inicio: xpDoNivel(20), fracao: 1, podeSubir: false };
	const inicio = xpDoNivel(nivel);
	const alvo = xpDoNivel(nivel + 1);
	return { atual: xp, alvo, inicio, fracao: Math.min(1, Math.max(0, (xp - inicio) / (alvo - inicio))), podeSubir: xp >= alvo };
}

// ------------------------------------------------------------------ marcos de clã

export interface MarcoLivro {
	nivel: number;
	texto: string;
}
export interface JutsuNome {
	slug: string;
	nome: string;
}

/** Lê um marco ("+1 INT; limite de INT +9", "Kage Yose no Jutsu (…)", "+1 em Rastreamento ou Percepção"). */
export function lerMarco(texto: string, jutsusDoCla: JutsuNome[]): GanhoMarco & { escolhaPericia?: Pericia[] } {
	const g: GanhoMarco & { escolhaPericia?: Pericia[] } = { texto };
	const porNome = (n: string) => PERICIAS.find((p) => p.nome.toLowerCase() === n.trim().toLowerCase())?.id;
	for (const parte of texto.split(';').map((p) => p.trim())) {
		let m: RegExpExecArray | null;
		if ((m = /^\+(\d+) (FOR|AGI|VIG|INT|CTR|ESP)$/.exec(parte))) g.atributos = { ...g.atributos, [m[2]]: (g.atributos?.[m[2] as Atributo] ?? 0) + Number(m[1]) };
		else if ((m = /limite de (FOR|AGI|VIG|INT|CTR|ESP) \+(\d+)/.exec(parte))) g.limites = { ...g.limites, [m[1]]: Number(m[2]) };
		else if ((m = /^\+(\d+) PT$/.exec(parte))) g.pt = (g.pt ?? 0) + Number(m[1]);
		else if ((m = /^\+(\d+) PIC$/.exec(parte))) g.pic = (g.pic ?? 0) + Number(m[1]);
		else if ((m = /^\+1 em ([^;]+?) ou ([^;]+)$/.exec(parte))) {
			const a = porNome(m[1]);
			const b = porNome(m[2]);
			if (a && b) g.escolhaPericia = [a, b];
		} else if ((m = /^\+1 em ([^;]+)$/.exec(parte))) {
			const p = porNome(m[1]);
			if (p) g.pericias = [...(g.pericias ?? []), p];
		}
	}
	const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
	const jutsus = jutsusDoCla.filter((j) => normal(texto).includes(normal(j.nome))).map((j) => j.slug);
	if (jutsus.length) g.jutsus = jutsus;
	return g;
}

// ------------------------------------------------------------------ subir de nível

export type PassoNivel = 'recursos' | 'atributo' | 'pericia' | 'especializacao' | 'elemento' | 'marco' | 'rank' | 'resumo';
export const NOME_PASSO_NIVEL: Record<PassoNivel, string> = {
	recursos: 'Recursos e treino',
	atributo: 'Atributo',
	pericia: 'Perícia',
	especializacao: 'Nova especialização',
	elemento: 'Elemento',
	marco: 'Marcos do clã',
	rank: 'Rank',
	resumo: 'Resumo final'
};

/** Passos dinâmicos do P4 para chegar ao nível `novo` (cap. 17). */
export function planoNivel(f: FichaDados, novo: number, marcosCla: MarcoLivro[], jutsusDoCla: JutsuNome[]) {
	const passos: PassoNivel[] = ['recursos'];
	if ((PROGRESSAO.niveisAtributo as readonly number[]).includes(novo)) passos.push('atributo');
	if ((PROGRESSAO.niveisPericia as readonly number[]).includes(novo)) passos.push('pericia');
	if ((PROGRESSAO.niveisEspecializacao as readonly number[]).includes(novo)) passos.push('especializacao');
	const elementoLiberado = Object.entries(CUSTO_ELEMENTO).find(([n, c]) => c.nivelMin === novo && elementos(f).length < Number(n));
	if (elementoLiberado) passos.push('elemento');
	const marco = marcosCla.find((m) => m.nivel === novo);
	if (marco) passos.push('marco');
	const rank = Object.entries(PROGRESSAO.rankPorNivel).find(([, n]) => n === novo)?.[0] ?? null;
	if (rank) passos.push('rank');
	passos.push('resumo');
	return {
		passos,
		marco: marco ? lerMarco(marco.texto, jutsusDoCla) : null,
		rank,
		elemento: elementoLiberado ? { ordem: Number(elementoLiberado[0]), pt: elementoLiberado[1].pt } : null
	};
}

/** Atributos que podem receber o ponto do nível (limite +8; o do clã sobe com os marcos). */
export function atributosLivres(f: FichaDados): Atributo[] {
	const t = atributosTotais(f);
	const lim = limitesAtributo(f);
	return ATRIBUTOS.map((a) => a.id).filter((a) => t[a] < lim[a]);
}

/** Perícias com treino abaixo de +5. */
export const periciasLivres = (f: FichaDados): Pericia[] => PERICIAS.map((p) => p.id).filter((p) => treinoPericia(f, p) < PROGRESSAO.periciaTreinoMax);

export function aplicarNivel(f: FichaDados, escolha: EscolhaNivel, treinoElemento?: string | null): FichaDados {
	const nova: FichaDados = structuredClone(f);
	nova.progresso.niveis.push(escolha);
	if (treinoElemento) nova.progresso.treinos.push({ tipo: 'elemento', id: treinoElemento, pt: CUSTO_ELEMENTO[elementos(f).length + 1]?.pt ?? 10 });
	return nova;
}

// ------------------------------------------------------------------ custo dos jutsus (cap. 9)

export interface JutsuFicha {
	slug: string;
	nome: string;
	/** Tradução do nome (os jutsus do livro sempre têm; os criados, quando o jogador escreveu). */
	traducao?: string;
	rank: string;
	tipo: string;
	custo: string;
	custoNum: number;
	elemento: string | null;
	cla: string | null;
	origem: string;
	efeito: string;
	info: { k: string; v: string }[];
	/** Jutsu criado: dano ou cura em dados vindos do criador (os do livro são lidos do texto do efeito). */
	rolagem?: { modo: 'dano' | 'cura'; dados: string; atributo: string | null } | null;
}

export interface CustoJutsu {
	base: number;
	final: number;
	unidade: 'PC' | 'PE';
	notas: string[];
}

/** Reduções de especializações diferentes não se somam (vale a maior), mais −1 da proficiência; mínimo 1 e nunca abaixo da metade. Fadiga 2+ soma +1. */
export function custoJutsu(f: FichaDados, j: Pick<JutsuFicha, 'slug' | 'custo' | 'custoNum' | 'tipo' | 'elemento'>, fadiga = 0): CustoJutsu {
	const unidade: 'PC' | 'PE' = /PE/.test(j.custo) && !/PC/.test(j.custo) ? 'PE' : 'PC';
	const base = j.custoNum;
	const notas: string[] = [];
	let final = base;
	if (unidade === 'PC') {
		let melhor = 0;
		for (const e of especializacoes(f)) {
			const r = ESPECIALIZACOES[e.id]?.reducao;
			if (!r) continue;
			const vale = r.alvo === 'todos' || r.alvo === j.tipo || (r.alvo === 'elemento' && !!j.elemento && j.elemento === e.elemento);
			if (vale) melhor = Math.max(melhor, r.valores[e.nivel - 1]);
		}
		const prof = proficiencias(f).some((p) => p.tipo === 'jutsu' && p.alvo === j.slug) ? 1 : 0;
		if (melhor) notas.push(`Especialização −${melhor}`);
		if (prof) notas.push('Proficiência −1');
		final = Math.max(1, Math.ceil(base / 2), base - melhor - prof);
	}
	if (fadiga >= 2) {
		final += 1;
		notas.push('Exausto +1');
	}
	return { base, final, unidade, notas };
}

// ------------------------------------------------------------------ treino com PT (cap. 18)

export interface OpcaoTreino {
	chave: string;
	grupo: 'jutsu' | 'especializacao' | 'proficiencia' | 'elemento';
	nome: string;
	/** Tradução do nome do jutsu. */
	traducao?: string;
	descricao: string;
	pt: number;
	icone: string;
	bloqueio: string;
	treino: Treino;
}

export function opcoesTreino(f: FichaDados, jutsus: JutsuFicha[], nomeEsp: (id: string) => string): OpcaoTreino[] {
	const nivel = nivelDe(f);
	const ops: OpcaoTreino[] = [];
	const conhecidos = new Set(jutsusConhecidos(f));
	const els = elementos(f);

	// jutsus gerais (os de clã chegam pelos marcos)
	for (const j of jutsus) {
		if (j.cla || conhecidos.has(j.slug)) continue;
		const pt = CUSTO_JUTSU[j.rank];
		if (!pt) continue;
		const min = PROGRESSAO.rankPorNivel[j.rank];
		const bloqueio = min && nivel < min ? `Rank ${j.rank} exige nível ${min}` : j.elemento && !els.includes(j.elemento) ? `Exige afinidade com ${nomeElemento(j.elemento)}` : j.rank === 'S' ? 'Rank S exige aprovação do Mestre' : '';
		ops.push({
			chave: `jutsu:${j.slug}`,
			grupo: 'jutsu',
			nome: j.nome,
			traducao: j.traducao,
			descricao: [j.origem !== j.tipo ? j.origem : '', `Rank ${j.rank}`, j.tipo, j.custo].filter(Boolean).join(' · '),
			pt,
			icone: `rank/ic-rank-${j.rank.toLowerCase()}`,
			bloqueio,
			treino: { tipo: 'jutsu', slug: j.slug, pt }
		});
	}

	// especializações 1→2→3
	for (const e of especializacoes(f)) {
		if (e.nivel >= 3) continue;
		const c = CUSTO_ESPECIALIZACAO[e.nivel + 1];
		ops.push({
			chave: `esp:${e.id}`,
			grupo: 'especializacao',
			nome: `${nomeEsp(e.id)} · NV ${e.nivel} → ${e.nivel + 1}`,
			descricao: `Nível ${c.nivelMin}+`,
			pt: c.pt,
			icone: `esp/ic-esp-${e.id}`,
			bloqueio: nivel < c.nivelMin ? `Exige nível ${c.nivelMin}` : '',
			treino: { tipo: 'especializacao', id: e.id, pt: c.pt }
		});
	}

	// proficiências: subir as existentes (custo incremental) ou começar uma nova como Familiar
	const profs = proficiencias(f);
	const mestres = profs.filter((p) => p.nivel >= 4).length;
	const lendarias = profs.filter((p) => p.nivel >= 5).length;
	for (const p of profs) {
		if (p.nivel >= 5) continue;
		const novo = p.nivel + 1;
		const pt = custoProficiencia(p.tipo, novo) - custoProficiencia(p.tipo, p.nivel);
		const min = PROFICIENCIA_NIVEL_MIN[novo];
		const bloqueio = min && nivel < min ? `Exige nível ${min}` : novo === 4 && mestres >= 3 ? 'Já há 3 proficiências em Mestre' : novo === 5 && lendarias >= 1 ? 'Já há 1 proficiência Lendária' : '';
		const nomes = NIVEIS_PROFICIENCIA;
		ops.push({
			chave: `prof:${p.tipo}:${p.alvo}`,
			grupo: 'proficiencia',
			nome: `${rotuloAlvo(p.tipo, p.alvo, jutsus)} · ${nomes[p.nivel - 1].nome} → ${nomes[novo - 1].nome}`,
			descricao: p.tipo === 'categoria' ? 'Categoria de arma: +1 PT por nível' : 'Custo incremental',
			pt,
			icone: p.tipo === 'jutsu' ? 'rank/ic-rank-c' : 'arma/ic-arma-kunai',
			bloqueio,
			treino: { tipo: 'proficiencia', prof: { tipo: p.tipo, alvo: p.alvo }, nivel: novo, pt }
		});
	}

	// novos elementos
	const proximo = els.length + 1;
	const ce = CUSTO_ELEMENTO[proximo];
	if (ce) {
		for (const e of ELEMENTOS) {
			if (els.includes(e.id)) continue;
			ops.push({
				chave: `elem:${e.id}`,
				grupo: 'elemento',
				nome: `${proximo}º elemento · ${e.nome}`,
				descricao: `Nível ${ce.nivelMin}+`,
				pt: ce.pt,
				icone: `elemento/ic-elemento-${e.id}`,
				bloqueio: nivel < ce.nivelMin ? `Exige nível ${ce.nivelMin}` : '',
				treino: { tipo: 'elemento', id: e.id, pt: ce.pt }
			});
		}
	}
	return ops;
}

/** Aplica os treinos do carrinho; dois do mesmo alvo no carrinho não fazem sentido e são ignorados. */
export function aplicarTreinos(f: FichaDados, treinos: Treino[]): FichaDados {
	const nova: FichaDados = structuredClone(f);
	nova.progresso.treinos.push(...treinos);
	return nova;
}

export const nomeElemento = (id: string) => ELEMENTOS.find((e) => e.id === id)?.nome ?? id;

export function rotuloAlvo(tipo: string, alvo: string, jutsus: { slug: string; nome: string }[]): string {
	return tipo === 'jutsu' ? (jutsus.find((j) => j.slug === alvo)?.nome ?? alvo) : alvo;
}

// ------------------------------------------------------------------ PIC (cap. 8.3)

/** PIC por arco: status do clã + marcos + background (Herdeiro +1, Renegado −1). */
export function picMaximo(f: FichaDados): number {
	const cla = regrasCla(f);
	if (!cla) return 0;
	const marco1 = /\+(\d+) PIC/.exec(cla.marco);
	const marcos = f.progresso.niveis.reduce((t, n) => t + (n.marco?.pic ?? 0), 0);
	const bg = f.background.id === 'herdeiro' ? 1 : f.background.id === 'renegado' ? -1 : 0;
	return Math.max(0, cla.pic + Number(marco1?.[1] ?? 0) + marcos + bg);
}

// ------------------------------------------------------------------ estado em jogo (cap. 4 e 9)

export interface EstadoJogo {
	pv?: number;
	pc?: number;
	pe?: number;
	fadiga?: number;
	condicoes?: string[];
	saves?: { sucessos: number; falhas: number };
	pd?: number;
	pic?: number | null;
	/** Kekkei Genkai ativa (e o estágio do Sharingan); ver kkg.ts. */
	kkg?: EstadoKkg;
	/** PC selado (Juuken dos Hyuuga): sai do atual e do máximo até a ficha descansar. */
	pcSelado?: number;
}

export interface EstadoAtual {
	pv: number;
	pc: number;
	pe: number;
	fadiga: number;
	condicoes: string[];
	saves: { sucessos: number; falhas: number };
	pd: number;
	pic: number;
	/** PV ≤ 0: Inconsciente; ≤ −metade do máximo: morte. */
	situacao: 'bem' | 'caido' | 'morte';
}

/** Soma um ajuste ao recurso; a cura de quem está com PV negativo conta a partir de 0 (cap. 4, Estabilizar Aliado Caído). */
export const curar = (k: 'pv' | 'pc' | 'pe', atual: number, delta: number) => (k === 'pv' && delta > 0 && atual < 0 ? delta : atual + delta);

export function estadoAtual(e: EstadoJogo | null | undefined, max: { pv: number; pc: number; pe: number; pic: number }): EstadoAtual {
	const pv = e?.pv ?? max.pv;
	return {
		pv,
		pc: e?.pc ?? max.pc,
		pe: e?.pe ?? max.pe,
		fadiga: e?.fadiga ?? 0,
		condicoes: e?.condicoes ?? [],
		saves: e?.saves ?? { sucessos: 0, falhas: 0 },
		pd: e?.pd ?? 1,
		pic: e?.pic ?? max.pic,
		situacao: pv <= -Math.floor(max.pv / 2) ? 'morte' : pv <= 0 ? 'caido' : 'bem'
	};
}

/** Descanso curto: ¼ dos máximos (cap. 9). Descanso longo: tudo e −1 Fadiga. */
export function descansar(e: EstadoAtual, max: { pv: number; pc: number; pe: number }, tipo: 'curto' | 'longo'): EstadoJogo {
	if (tipo === 'longo') return { ...e, pv: max.pv, pc: max.pc, pe: max.pe, fadiga: Math.max(0, e.fadiga - 1), saves: { sucessos: 0, falhas: 0 } };
	const q = (m: number) => Math.floor(m / 4);
	const pv = Math.min(max.pv, Math.max(0, e.pv) + q(max.pv));
	return { ...e, pv, pc: Math.min(max.pc, e.pc + q(max.pc)), pe: Math.min(max.pe, e.pe + q(max.pe)), saves: pv > 0 ? { sucessos: 0, falhas: 0 } : e.saves };
}

// ------------------------------------------------------------------ inventário (cap. 11)

export interface ItemInventario {
	id: string;
	nome: string;
	qtd: number;
	peso: number;
	conjunto?: number;
	grupo: 'Armas' | 'Itens' | 'Pergaminhos' | 'Outros';
	icone: string;
	nota?: string;
	/** Arma forjada: nome da qualidade (moldura) e o dano já com a qualidade. */
	qualidade?: string;
	dano?: string;
	/** Selado num pergaminho de armazenamento (id do pergaminho): não pesa na mochila (cap. 11). */
	selado?: string;
}

const grupoDe = (i: Pick<ItemLoja, 'grupo' | 'nome'>): ItemInventario['grupo'] =>
	i.grupo.startsWith('Armas') ? 'Armas' : /pergaminho/i.test(i.nome) ? 'Pergaminhos' : 'Itens';

/** Inventário de partida: o pacote do cap. 6 ou as compras da mini loja. */
export function inventarioInicial(f: FichaDados, loja: ItemLoja[]): ItemInventario[] {
	const da = (id: string, qtd: number, nota?: string): ItemInventario | null => {
		const i = loja.find((x) => x.id === id);
		return i ? { id: i.id, nome: i.nome, qtd, peso: i.peso, conjunto: i.conjunto, grupo: grupoDe(i), icone: i.icone, nota } : null;
	};
	const base: ItemInventario[] = [{ id: 'hitaiate', nome: 'Hitaiate', qtd: 1, peso: 0, grupo: 'Outros', icone: 'equip/ic-equip-ferramenta', nota: 'Bandana da vila' }];
	const pacote = f.equipamento.pacote;
	if (pacote === 'A') {
		return [
			...base,
			da('arma-shuriken', 10),
			da('arma-kunai', 10),
			da('item-papel-explosivo', 3),
			da('item-kit-medico-5-usos', 1, '5 usos')
		].filter((x): x is ItemInventario => !!x);
	}
	if (pacote === 'marionetista') {
		return [
			...base,
			da('item-kit-de-marionetista', 1),
			{ id: 'marionete-pequena', nome: 'Marionete Pequena', qtd: 1, peso: 0, grupo: 'Outros', icone: 'item/ic-item-kit-marionetista', nota: '1 mecanismo de até 5.000 ryo' }
		].filter((x): x is ItemInventario => !!x);
	}
	return [...base, ...f.equipamento.compras.map((c) => da(c.id, c.qtd)).filter((x): x is ItemInventario => !!x)];
}

export const pesoItem = (i: Pick<ItemInventario, 'qtd' | 'peso' | 'conjunto'>) => (i.conjunto ? Math.ceil(i.qtd / i.conjunto) * 0.5 : i.peso * i.qtd);
/** O que está selado num pergaminho não pesa: o pergaminho pesa só o próprio peso (cap. 11). */
export const cargaInventario = (itens: ItemInventario[]) => itens.reduce((t, i) => t + (i.selado ? 0 : pesoItem(i)), 0);

/**
 * Pergaminho de armazenamento (cap. 11, Tabela de Pergaminhos): capacidade em unidades de carga, lida do nome da loja
 * ("Pergaminho básico (5 de carga)") ou do tipo. null para o que não guarda itens (pergaminho de jutsu, explosivo).
 */
export function capacidadePergaminho(i: Pick<ItemInventario, 'nome' | 'grupo'>): number | null {
	if (i.grupo !== 'Pergaminhos' || /jutsu|explosivo/i.test(i.nome)) return null;
	const m = /\((\d+) de carga\)/i.exec(i.nome);
	if (m) return +m[1];
	if (/b[áa]sico/i.test(i.nome)) return 5;
	if (/avan[çc]ado/i.test(i.nome)) return 15;
	if (/mestre/i.test(i.nome)) return 30;
	return null;
}
export const conteudoPergaminho = (itens: ItemInventario[], pergaminho: string) => itens.filter((i) => i.selado === pergaminho);
export const livrePergaminho = (itens: ItemInventario[], p: ItemInventario) =>
	(capacidadePergaminho(p) ?? 0) - conteudoPergaminho(itens, p.id).reduce((t, i) => t + pesoItem(i), 0);
/** A pilha do mesmo item que já está selada neste pergaminho (selar mais junta com ela). */
export const pilhaSelada = (itens: ItemInventario[], item: ItemInventario, pergaminho: string) =>
	itens.find((x) => x !== item && x.selado === pergaminho && x.id.split('~')[0] === item.id.split('~')[0] && x.nome === item.nome);
/** Quantas unidades do item cabem no espaço livre do pergaminho (0 se nem uma), contando a pilha com que ele junta. */
export function quantoCabe(itens: ItemInventario[], item: ItemInventario, p: ItemInventario): number {
	const livre = livrePergaminho(itens, p);
	const junto = pilhaSelada(itens, item, p.id);
	for (let n = item.qtd; n >= 1; n--) {
		const extra = junto ? pesoItem({ ...junto, qtd: junto.qtd + n }) - pesoItem(junto) : pesoItem({ ...item, qtd: n });
		if (extra <= livre + 1e-9) return n;
	}
	return 0;
}
/** O Pergaminho Mestre é mais lento: selar é uma ação completa e invocar, a ação primária. */
export const ehPergaminhoMestre = (p: Pick<ItemInventario, 'nome'>) => /mestre/i.test(p.nome);

// ------------------------------------------------------------------ resumo para a ficha

/** O que a ficha mostra no topo e na visão geral, a partir dos dados e da loja. */
export function ficha(f: FichaDados, loja: ItemLoja[]) {
	const r = recursos(f, loja);
	return {
		nivel: nivelDe(f),
		atributos: atributosTotais(f),
		atributoDoCla: atributoDoCla(f),
		recursos: r,
		pic: picMaximo(f),
		especializacoes: especializacoes(f),
		elementos: elementos(f),
		proficiencias: proficiencias(f),
		jutsus: jutsusConhecidos(f)
	};
}

export { nomePericia, PACOTES };
