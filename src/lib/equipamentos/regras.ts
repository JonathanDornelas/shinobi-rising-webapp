// Motor da forja (cap. 21), da oficina de marionetes (cap. 13) e do novo item (cap. 11): custos, limites e as
// verificações do envio. Puro, como os outros motores.
import {
	FORJADORES,
	MECANISMOS,
	MODOS,
	PESOS_ITEM,
	PROPRIEDADES_FORJA,
	QUALIDADES,
	TAMANHOS,
	type CategoriaItem,
	type Forjador,
	type Modo,
	type PesoItem,
	type Qualidade,
	type Tamanho
} from './dados.ts';

export type TipoEquipamento = 'arma' | 'item' | 'marionete';

/** Arma do catálogo (cap. 12) usada como base da forja. */
export interface ArmaBase {
	slug: string;
	nome: string;
	dano: string;
	alcance: string;
	peso: string;
	preco: number;
	carga: number;
	propriedades: string[];
	icone: string;
	categoria: string;
}

export interface ArmaDados {
	versao: 1;
	nome: string;
	aparencia: string;
	base: string | null;
	qualidade: Qualidade;
	propriedades: { id: string; detalhe: string }[];
	forjador: Forjador;
	historico: string;
	mensagem: string;
}

export interface MarioneteDados {
	versao: 1;
	nome: string;
	aparencia: string;
	tamanho: Tamanho;
	mecanismos: string[];
	modo: Modo;
	historico: string;
	mensagem: string;
}

export interface ItemDados {
	versao: 1;
	nome: string;
	categoria: CategoriaItem;
	preco: number;
	peso: PesoItem;
	consumivel: boolean;
	efeito: string;
	descricao: string;
	icone: string;
	mensagem: string;
}

export type DadosEquipamento = ArmaDados | MarioneteDados | ItemDados;

export const armaVazia = (): ArmaDados => ({ versao: 1, nome: '', aparencia: '', base: null, qualidade: 'comum', propriedades: [], forjador: 'comum', historico: '', mensagem: '' });
export const marioneteVazia = (): MarioneteDados => ({ versao: 1, nome: '', aparencia: '', tamanho: 'humanoide', mecanismos: [], modo: 'maos', historico: '', mensagem: '' });
export const itemVazio = (): ItemDados => ({ versao: 1, nome: '', categoria: 'Ferramenta', preco: 0, peso: 'leve', consumivel: false, efeito: '', descricao: '', icone: 'equip/ic-equip-ferramenta', mensagem: '' });
export const vazio = (t: TipoEquipamento): DadosEquipamento => (t === 'arma' ? armaVazia() : t === 'marionete' ? marioneteVazia() : itemVazio());

export function normalizar<T extends DadosEquipamento>(t: TipoEquipamento, d: Partial<T> | null | undefined): T {
	const v = vazio(t) as T;
	return d ? ({ ...v, ...d } as T) : v;
}

export type NivelVerificacao = 'ok' | 'aviso' | 'bloqueio';
export interface VerificacaoEquip {
	nivel: NivelVerificacao;
	texto: string;
}

/** Para quem é a encomenda: ryo disponível e se tem a especialização Marionete. */
export interface ContextoEquip {
	nome?: string | null;
	ryo?: number | null;
	especializacaoMarionete?: number | null;
}

const ryo = (n: number) => `${n.toLocaleString('pt-BR')} ryo`;
const sinal = (n: number) => (n > 0 ? `+${n}` : `${n}`);

// ------------------------------------------------------------------ forja (cap. 21)

export function calcularArma(d: ArmaDados, base: ArmaBase | null) {
	const q = QUALIDADES.find((x) => x.id === d.qualidade)!;
	const props = d.propriedades.map((p) => PROPRIEDADES_FORJA.find((x) => x.id === p.id)).filter((p) => !!p);
	const pfo = q.pfo + props.reduce((t, p) => t + p!.pfo, 0);
	const limite = FORJADORES.find((f) => f.id === d.forjador)!.limite;
	const custo = (base?.preco ?? 0) + q.ryo;
	const dano = base ? `${base.dano}${q.dano ? sinal(q.dano) : ''}` : '—';
	const linhas = [
		...(base ? [{ rotulo: base.nome, valor: ryo(base.preco) }] : []),
		...(q.ryo ? [{ rotulo: `Qualidade ${q.nome}`, valor: ryo(q.ryo) }] : []),
		...(props.length ? [{ rotulo: 'Propriedades', valor: 'incluídas nos PFo' }] : [])
	];
	const chips = [...(base?.propriedades ?? []), ...d.propriedades.map((p) => (p.detalhe.trim() ? `${p.id} · ${p.detalhe.trim()}` : p.id))];
	return { pfo, limite, custo, tempo: q.tempo, dano, acerto: q.acerto, qualidade: q, linhas, chips, carga: base?.carga ?? 0 };
}

export function analisarArma(d: ArmaDados, base: ArmaBase | null, ctx: ContextoEquip = {}) {
	const v: VerificacaoEquip[] = [];
	const c = calcularArma(d, base);
	if (!d.nome.trim()) v.push({ nivel: 'bloqueio', texto: 'Dê um nome à arma' });
	if (!base) v.push({ nivel: 'bloqueio', texto: 'Escolha a categoria base no catálogo' });
	if (c.pfo > c.limite) v.push({ nivel: 'bloqueio', texto: `${c.pfo} PFo excedem o limite do ${FORJADORES.find((f) => f.id === d.forjador)!.nome} (${c.limite})` });
	else if (c.pfo) v.push({ nivel: 'ok', texto: `${c.pfo} de ${c.limite} PFo` });
	const repetidas = d.propriedades.filter((p) => base?.propriedades.includes(p.id));
	if (repetidas.length) v.push({ nivel: 'bloqueio', texto: `${repetidas.map((p) => p.id).join(', ')} já vem na arma base` });
	for (const p of d.propriedades) {
		const def = PROPRIEDADES_FORJA.find((x) => x.id === p.id);
		if (def && 'detalhe' in def && !p.detalhe.trim()) v.push({ nivel: 'bloqueio', texto: `Defina: ${def.detalhe.toLowerCase()} (${p.id})` });
	}
	if ((d.qualidade === 'mestre' || d.qualidade === 'lendaria') && !d.historico.trim()) v.push({ nivel: 'bloqueio', texto: 'Armas de Mestre ou superiores precisam de uma história (Passo 6)' });
	if (!d.aparencia.trim()) v.push({ nivel: 'aviso', texto: 'Descreva formato, material e estilo (Passo 1)' });
	pagamento(v, c.custo, ctx);
	return { verificacoes: v, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length, calculo: c };
}

function pagamento(v: VerificacaoEquip[], custo: number, ctx: ContextoEquip) {
	if (ctx.ryo == null) return;
	if (ctx.ryo < custo) v.push({ nivel: 'aviso', texto: `${ctx.nome ?? 'O personagem'} tem ${ryo(ctx.ryo)}; faltam ${ryo(custo - ctx.ryo)}. A aprovação exige o ryo todo.` });
	else v.push({ nivel: 'ok', texto: `${ctx.nome ?? 'O personagem'} paga ${ryo(custo)} na aprovação (tem ${ryo(ctx.ryo)})` });
}

// ------------------------------------------------------------------ oficina de marionetes (cap. 13)

/** "1d6+2" com +2 vira "1d6+4". */
function somarDano(base: string, bonus: number) {
	const m = /^(\d+d\d+)([+-]\d+)?$/.exec(base);
	if (!m) return bonus ? `${base}${sinal(bonus)}` : base;
	const total = Number(m[2] ?? 0) + bonus;
	return `${m[1]}${total ? sinal(total) : ''}`;
}

export function calcularMarionete(d: MarioneteDados) {
	const t = TAMANHOS.find((x) => x.id === d.tamanho)!;
	const mecs = d.mecanismos.map((id) => MECANISMOS.find((m) => m.id === id)).filter((m) => !!m);
	const slots = mecs.reduce((s, m) => s + m!.slots, 0);
	const pv = t.pv + mecs.reduce((s, m) => s + ('pv' in m! ? m!.pv : 0), 0);
	const defesa = t.defesa + mecs.reduce((s, m) => s + ('defesa' in m! ? m!.defesa : 0), 0);
	const modo = MODOS.find((m) => m.id === d.modo)!;
	const bonusDano = mecs.reduce((s, m) => s + ('dano' in m! ? m!.dano : 0), 0) + ('dano' in modo ? modo.dano : 0);
	const custo = t.ryo + mecs.reduce((s, m) => s + m!.ryo, 0);
	return {
		tamanho: t,
		slots,
		limite: t.slots,
		pv,
		defesa,
		ataque: somarDano(t.ataque, bonusDano),
		custo,
		tempo: t.tempo,
		mecanismos: mecs.map((m) => m!),
		linhas: [{ rotulo: `Estrutura ${t.nome}`, valor: ryo(t.ryo) }, ...mecs.map((m) => ({ rotulo: m!.nome, valor: ryo(m!.ryo) }))]
	};
}

export function analisarMarionete(d: MarioneteDados, ctx: ContextoEquip = {}) {
	const v: VerificacaoEquip[] = [];
	const c = calcularMarionete(d);
	if (!d.nome.trim()) v.push({ nivel: 'bloqueio', texto: 'Dê um nome à marionete' });
	if (c.slots > c.limite) v.push({ nivel: 'bloqueio', texto: `${c.slots} slots de mecanismo para ${c.limite} disponíveis` });
	else v.push({ nivel: c.slots === c.limite ? 'ok' : 'aviso', texto: `${c.slots} de ${c.limite} slots usados` });
	if (ctx.especializacaoMarionete === 0) v.push({ nivel: 'bloqueio', texto: `${ctx.nome ?? 'O personagem'} não tem a especialização Marionete: dá para montar o rascunho, mas só envia depois de aprendê-la` });
	if (!d.historico.trim()) v.push({ nivel: 'aviso', texto: 'Toda marionete deve ter nome, aparência e uma história (Passo 5)' });
	pagamento(v, c.custo, ctx);
	return { verificacoes: v, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length, calculo: c };
}

// ------------------------------------------------------------------ novo item (cap. 11)

export const cargaDoItem = (d: ItemDados) => PESOS_ITEM.find((p) => p.id === d.peso)?.carga ?? 0.5;

export function analisarItem(d: ItemDados) {
	const v: VerificacaoEquip[] = [];
	if (!d.nome.trim()) v.push({ nivel: 'bloqueio', texto: 'Dê um nome ao item' });
	if (!d.efeito.trim()) v.push({ nivel: 'bloqueio', texto: 'Informe o efeito' });
	if (!(d.preco >= 0)) v.push({ nivel: 'bloqueio', texto: 'O preço não pode ser negativo' });
	else if (d.preco === 0) v.push({ nivel: 'aviso', texto: 'Item sem preço' });
	if (d.consumivel && cargaDoItem(d) > 0.5) v.push({ nivel: 'aviso', texto: 'Consumíveis pequenos costumam ser Leves ou Insignificantes' });
	return { verificacoes: v, bloqueios: v.filter((x) => x.nivel === 'bloqueio').length };
}

// ------------------------------------------------------------------ o que vai para a lista e o inventário

/** Resumo gravado junto da criação (listas da E1) e o custo cobrado na aprovação. */
export function resumoEquipamento(t: TipoEquipamento, d: DadosEquipamento, base: ArmaBase | null = null) {
	if (t === 'arma') {
		const a = d as ArmaDados;
		const c = calcularArma(a, base);
		return { nome: a.nome.trim(), categoria: base?.nome ?? '', qualidade: c.qualidade.nome, dano: c.dano, custo: c.custo, carga: c.carga, icone: base?.icone ?? 'equip/ic-equip-arma-curta', efeito: c.chips.join(' · ') };
	}
	if (t === 'marionete') {
		const m = d as MarioneteDados;
		const c = calcularMarionete(m);
		return { nome: m.nome.trim(), categoria: `Marionete ${c.tamanho.nome}`, qualidade: '', dano: c.ataque, custo: c.custo, carga: 0, icone: 'esp/ic-esp-marionete', efeito: c.mecanismos.map((x) => x.nome).join(' · ') };
	}
	const i = d as ItemDados;
	return { nome: i.nome.trim(), categoria: i.categoria, qualidade: '', dano: '', custo: Math.max(0, Math.round(i.preco)), carga: cargaDoItem(i), icone: i.icone, efeito: i.efeito.trim(), consumivel: i.consumivel };
}
export type ResumoEquipamento = ReturnType<typeof resumoEquipamento>;
