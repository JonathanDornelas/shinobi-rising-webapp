// Catálogo do Lote 8 montado a partir dos dados do livro (só no servidor): armas base da forja (cap. 12) e os itens
// utilitários oficiais (cap. 11), e a conversão dos itens aprovados da campanha para a loja da ficha.
import { equipamentos } from '#lib/livro/dados.server.ts';
import type { Bloco, Trecho } from '#lib/livro/tipos.ts';
import { PESOS } from '#lib/personagem/dados.ts';
import type { ItemLoja } from '#lib/personagem/regras.ts';
import type { ArmaBase, ResumoEquipamento } from './regras.ts';

const texto = (t: Trecho[] | Trecho[][] | null | undefined): string =>
	!t ? '' : (t as (Trecho | Trecho[])[]).map((x) => (Array.isArray(x) ? texto(x) : x.t)).join(Array.isArray(t[0]) ? ' ' : '');
const numero = (s: string) => Number((/[\d.]+/.exec(s)?.[0] ?? '0').replace(/\./g, ''));
const carga = (s: string) => PESOS[s.trim().toLowerCase()] ?? 0.5;

export function armasBase(): ArmaBase[] {
	return equipamentos.categorias.flatMap((c) =>
		c.armas.map((a) => ({
			slug: a.slug,
			nome: a.nome,
			dano: a.dano,
			alcance: a.alcance,
			peso: a.peso,
			preco: numero(a.preco),
			carga: carga(a.peso),
			propriedades: a.propriedades,
			icone: a.icone ?? c.icone,
			categoria: c.titulo
		}))
	);
}

/** Itens utilitários do cap. 11, com o efeito, para a aba Oficiais da E1. */
export function itensOficiais() {
	const aba = equipamentos.abas.find((a) => a.id === 'itens');
	const tabela = aba?.secoes.flatMap((s) => s.blocos).find((b): b is Extract<Bloco, { tipo: 'tabela' }> => b.tipo === 'tabela');
	return (tabela?.linhas ?? []).map((linha) => {
		const [nome, preco, peso, efeito] = linha.map((c) => texto(c as Trecho[][]).trim());
		return { nome, preco, peso, efeito };
	});
}

/** Itens aprovados da campanha como itens da loja da ficha. */
export function itensDaCampanha(criados: { id: string; nome: string; resumo: unknown }[]): ItemLoja[] {
	return criados.map((c) => {
		const r = c.resumo as Partial<ResumoEquipamento> & { consumivel?: boolean };
		return {
			id: `eqi-${c.id}`,
			nome: c.nome,
			preco: r.custo ?? 0,
			peso: r.carga ?? 0.5,
			conjunto: r.consumivel ? 5 : undefined,
			grupo: 'Itens da campanha',
			icone: r.icone ?? 'equip/ic-equip-ferramenta'
		};
	});
}

/** Armas e marionetes criadas e aprovadas na campanha, para o Mestre pôr no inventário de um NPC (ADICIONAR). */
export function armasDaCampanha(criados: { id: string; tipo: string; nome: string; resumo: unknown }[]): ItemLoja[] {
	return criados.map((c) => {
		const r = c.resumo as Partial<ResumoEquipamento>;
		return {
			id: `eq-${c.id}`,
			nome: c.nome,
			preco: r.custo ?? 0,
			peso: c.tipo === 'marionete' ? 0 : (r.carga ?? 0.5),
			grupo: c.tipo === 'marionete' ? 'Marionetes da campanha' : 'Armas da campanha',
			icone: r.icone ?? 'equip/ic-equip-ferramenta',
			dano: r.dano || undefined
		};
	});
}
