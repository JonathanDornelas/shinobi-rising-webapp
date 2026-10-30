// O cartão de um item do inventário (hover na ficha): o que ele faz, tirado das tabelas dos cap. 11, 12 e 13 (efeito,
// preço, peso, dano, alcance e as propriedades com o efeito de cada uma) ou do resumo do item criado na campanha.
import { equipamentos } from '#lib/livro/dados.server.ts';
import type { Bloco, Trecho } from '#lib/livro/tipos.ts';
import type { ResumoEquipamento } from './regras.ts';

export interface InfoItem {
	/** Subtítulo: "Arma · Distância", "Item utilitário", "Pergaminho de armazenamento"… */
	tipo: string;
	efeito: string | null;
	dano: string | null;
	alcance: string | null;
	propriedades: { nome: string; efeito: string }[];
	preco: string | null;
	peso: string | null;
	/** A seção das regras com a tabela do item. */
	regra: string | null;
}

/** Item criado na campanha (equipamentos_criados), para os ids eq-… e eqi-… do inventário. */
export type CriadoInfo = { id: string; tipo: string; nome: string; resumo: unknown };

const texto = (t: Trecho[] | Trecho[][] | null | undefined): string =>
	!t ? '' : (t as (Trecho | Trecho[])[]).map((x) => (Array.isArray(x) ? texto(x) : x.t)).join(Array.isArray(t[0]) ? ' ' : '');
const chave = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const carga = (n: number) => `${String(n).replace('.', ',')} de carga`;

/** As linhas de uma tabela das abas do catálogo, em texto, com a seção (âncora das regras) onde ela está. */
function tabela(aba: string, cabecalho: string) {
	for (const s of equipamentos.abas.find((a) => a.id === aba)?.secoes ?? [])
		for (const b of s.blocos as Bloco[])
			if (b.tipo === 'tabela' && b.cab?.[0] === cabecalho) return { href: s.href, linhas: b.linhas.map((l) => l.map((c) => texto(c as Trecho[][]).trim())) };
	return { href: null, linhas: [] as string[][] };
}

const PROPRIEDADES = new Map(equipamentos.propriedades.map((p) => [p.nome, p.efeito]));
const propriedades = (nomes: string[] | undefined) => (nomes ?? []).map((nome) => ({ nome, efeito: PROPRIEDADES.get(nome) ?? '' }));
const ARMAS = equipamentos.categorias.flatMap((c) => c.armas.map((a) => ({ ...a, categoria: c.titulo, ancora: c.ancora })));
const nomesArma = (a: { nome: string }) => a.nome.replace(/\s*\(.*\)$/, '').split('/').map(chave);
/** A arma do catálogo pelo slug ou pelo nome ("Kunai", "Kunai de selo", "Espada" para "Katana/Espada"). */
const armaDe = (id: string, nome: string) => {
	const n = chave(nome);
	return ARMAS.find((a) => a.slug === id) ?? ARMAS.find((a) => chave(a.nome) === n) ?? ARMAS.find((a) => nomesArma(a).some((x) => n.startsWith(x)));
};
const ITENS = tabela('itens', 'Item');
const VENENOS = tabela('venenos', 'Veneno');
const PERGAMINHOS = tabela('pergaminhos', 'Tipo');
const QUALIDADES = tabela('qualidade', 'Qualidade');
const TAMANHOS_MARIONETE = tabela('marionetes', 'Tamanho');
const MECANISMOS = tabela('marionetes', 'Mecanismo');

function daArma(a: (typeof ARMAS)[number]): InfoItem {
	return { tipo: `Arma · ${a.categoria}`, efeito: null, dano: a.dano, alcance: a.alcance, propriedades: propriedades(a.propriedades), preco: a.preco, peso: a.peso, regra: a.ancora };
}

/** O cartão de um item, ou null quando ele não está no livro nem na campanha (fica só o nome e a nota). */
export function infoItem(i: { id: string; nome: string; qualidade?: string; dano?: string }, criados: CriadoInfo[] = []): InfoItem | null {
	const criado = /^eqi?-/.test(i.id) ? criados.find((c) => i.id === `eq-${c.id}` || i.id === `eqi-${c.id}`) : undefined;
	if (criado) return doCriado(criado, i);
	if (i.id === 'hitaiate') return { tipo: 'Equipamento ninja', efeito: 'A bandana com o símbolo da vila: mostra a que vila o ninja pertence.', dano: null, alcance: null, propriedades: [], preco: null, peso: 'Insignificante', regra: null };
	if (i.id === 'marionete-pequena') return marionete('Pequena', 'Marionete do pacote de marionetista');

	const arma = armaDe(i.id, i.nome);
	if (arma) return daArma(arma);
	const espada = equipamentos.espadas.find((e) => e.slug === i.id || chave(e.nome) === chave(i.nome));
	if (espada)
		return { tipo: `Espada dos Sete Espadachins${espada.traducao ? ` · ${espada.traducao}` : ''}`, efeito: espada.habilidade, dano: espada.dano, alcance: 'Corpo a corpo', propriedades: [], preco: null, peso: espada.peso, regra: '/regras/armas' };

	const perg = /pergaminho\s+(b[áa]sico|avan[çc]ado|mestre)/i.exec(i.nome);
	if (perg) {
		const l = PERGAMINHOS.linhas.find((x) => chave(x[0]) === chave(perg[1]));
		if (l) return { tipo: 'Pergaminho de armazenamento', efeito: `Guarda até ${l[2]}; o que está selado não pesa na mochila. Selar / invocar: ${l[3]} (1 PC cada).`, dano: null, alcance: null, propriedades: [], preco: l[1], peso: 'Leve', regra: PERGAMINHOS.href };
	}
	const veneno = VENENOS.linhas.find((x) => chave(x[0]) === chave(i.nome));
	if (veneno) return { tipo: 'Veneno (dose)', efeito: veneno[2], dano: null, alcance: null, propriedades: [], preco: `${veneno[1]}`.replace(/(\d)\s/, '$1 ryo '), peso: 'Insignificante', regra: VENENOS.href };
	const item = ITENS.linhas.find((x) => chave(x[0]) === chave(i.nome));
	if (item) return { tipo: 'Item utilitário', efeito: item[3], dano: null, alcance: null, propriedades: [], preco: item[1], peso: item[2] === 'Insig.' ? 'Insignificante' : item[2], regra: ITENS.href };
	return null;
}

function marionete(tamanho: string, tipo: string, mecanismos: string[] = [], extra: Partial<InfoItem> = {}): InfoItem | null {
	const t = TAMANHOS_MARIONETE.linhas.find((x) => chave(x[0]).startsWith(chave(tamanho)));
	if (!t) return null;
	const [, pv, defesa, ataque, custo] = t;
	return {
		tipo,
		efeito: `PV ${pv}, Defesa ${defesa}, ataque base ${ataque}.`,
		dano: null,
		alcance: null,
		propriedades: mecanismos.map((m) => ({ nome: m, efeito: MECANISMOS.linhas.find((x) => chave(x[0]) === chave(m))?.[3] ?? '' })),
		preco: `${custo} ryo`,
		peso: null,
		regra: TAMANHOS_MARIONETE.href,
		...extra
	};
}

function doCriado(c: CriadoInfo, i: { nome: string; qualidade?: string; dano?: string }): InfoItem | null {
	const r = (c.resumo ?? {}) as Partial<ResumoEquipamento>;
	const preco = r.custo ? `${r.custo.toLocaleString('pt-BR')} ryo` : null;
	if (c.tipo === 'marionete') {
		const tamanho = (r.categoria ?? '').replace(/^Marionete\s+/i, '');
		const mecanismos = (r.efeito ?? '').split(' · ').filter(Boolean);
		return marionete(tamanho, `Marionete ${tamanho} · criada na campanha`, mecanismos, { preco, dano: r.dano || null });
	}
	if (c.tipo === 'arma') {
		const base = armaDe('', r.categoria ?? '');
		const qualidade = i.qualidade ?? r.qualidade;
		const q = qualidade && qualidade !== 'Comum' ? QUALIDADES.linhas.find((x) => x[0] === qualidade) : null;
		// os chips do resumo trazem a qualidade e as propriedades da forja ("Boa · Afiada · Elemental (Katon)")
		const forja = (r.efeito ?? '').split(' · ').map((x) => x.replace(/\s*\(.*\)$/, '').trim()).filter((x) => PROPRIEDADES.has(x));
		return {
			tipo: `Arma forjada${r.categoria ? ` · ${r.categoria}` : ''}`,
			efeito: q ? `Qualidade ${q[0]}: ${q[1]}.` : null,
			dano: i.dano ?? r.dano ?? base?.dano ?? null,
			alcance: base?.alcance ?? null,
			propriedades: propriedades([...new Set([...(base?.propriedades ?? []), ...forja])]),
			preco,
			peso: r.carga != null ? carga(r.carga) : (base?.peso ?? null),
			regra: '/regras/armas'
		};
	}
	return { tipo: `Item da campanha${r.categoria ? ` · ${r.categoria}` : ''}`, efeito: r.efeito || null, dano: null, alcance: null, propriedades: [], preco, peso: r.carga != null ? carga(r.carga) : null, regra: null };
}

/** Os cartões por id do item, para os itens da loja e do inventário de uma ficha. */
export function infoItens(itens: { id: string; nome: string; qualidade?: string; dano?: string }[], criados: CriadoInfo[] = []) {
	const mapa: Record<string, InfoItem> = {};
	for (const i of itens) {
		const info = infoItem(i, criados);
		if (info) mapa[i.id] = info;
	}
	return mapa;
}

/** Os ids de itens criados na campanha (eq-…, eqi-…) num inventário, para buscar o resumo deles. */
export const idsCriados = (itens: { id: string }[]) => [...new Set(itens.map((i) => /^eqi?-(.+)$/.exec(i.id)?.[1]).filter((x): x is string => !!x))];
