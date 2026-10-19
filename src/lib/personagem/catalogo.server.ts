// Catálogo do criador de personagem montado a partir dos dados do livro (só no servidor, para não mandar o livro inteiro).
import { clas, equipamentos, especializacoes, jutsus } from '#lib/livro/dados.server.ts';
import type { Bloco, Trecho } from '#lib/livro/tipos.ts';
import type { JutsuCatalogo } from '#lib/clas/criador.svelte.ts';
import { claParaFicha, slugCarta, type ClaDados } from '#lib/clas/regras.ts';
import { normalizarJutsu, paraJutsuLivro, rolagemDoJutsu, type JutsuDados } from '#lib/jutsus/regras.ts';
import type { JutsuCriadoFicha } from '#lib/jutsus/servidor.ts';
import { slugJutsuCriado } from '#lib/jutsus/status.ts';
import { CLAS, ESPECIALIZACOES, JUTSUS_ACADEMIA, PESOS } from './dados.ts';
import type { JutsuFicha } from './progressao.ts';
import type { ItemLoja, JutsuOpcao } from './regras.ts';

const texto = (t: Trecho[] | Trecho[][] | null | undefined): string =>
	!t ? '' : (t as (Trecho | Trecho[])[]).map((x) => (Array.isArray(x) ? texto(x) : x.t)).join(Array.isArray(t[0]) ? ' ' : '');

const numero = (s: string) => Number((/[\d.]+/.exec(s)?.[0] ?? '0').replace(/\./g, ''));
const peso = (s: string) => PESOS[s.trim().toLowerCase()] ?? 0.5;

export interface JutsuResumo extends JutsuOpcao {
	tipo: string;
	custo: string;
	efeito: string;
}

/** Jutsus originais da ficha (rascunho, em revisão ou aprovados) que servem como escolha inicial de Rank E ou D. */
export function jutsusCriadosDaCriacao(linhas: { id: string; status: string; dados: unknown; anterior_id: string | null }[]): JutsuResumo[] {
	const substituidos = new Set(linhas.map((j) => j.anterior_id).filter(Boolean));
	return linhas
		.filter((j) => !substituidos.has(j.id) && j.status !== 'rejeitado')
		.flatMap((j) => {
			const l = paraJutsuLivro(slugJutsuCriado(j.id), normalizarJutsu(j.dados as Partial<JutsuDados>), 'Criação própria');
			if (l.rank !== 'E' && l.rank !== 'D') return [];
			return [{ slug: l.slug, nome: l.nome, rank: l.rank, elemento: l.elemento, tipo: l.tipo, custo: l.custo, efeito: texto(l.efeito).slice(0, 180), criado: { id: j.id, status: j.status } }];
		});
}

function jutsuResumo(slug: string): JutsuResumo | null {
	const j = jutsus.find((x) => x.slug === slug);
	if (!j) return null;
	return { slug: j.slug, nome: j.nome, rank: j.rank as 'E' | 'D', elemento: j.elemento, tipo: j.tipo, custo: j.custo, efeito: texto(j.efeito).slice(0, 180) };
}

/** Kunai, shuriken e senbon contam em conjuntos de 10; consumíveis pequenos em conjuntos de 5 (cap. 11). */
const CONJUNTO_10 = ['arma-kunai', 'arma-shuriken', 'arma-senbon'];
const CONSUMIVEIS = /p[íi]lula|hyourougan|antídoto|bomba|papel explosivo/i;
const ICONES_ITEM: Record<string, string> = {
	'Hyourougan (pílula soldado)': 'item/ic-item-hyourougan',
	'Pílula de cura': 'item/ic-item-pilula-cura',
	'Pílula militar': 'item/ic-item-pilula-militar',
	'Antídoto comum': 'item/ic-item-antidoto',
	'Antídoto raro': 'item/ic-item-antidoto-raro',
	'Bomba de fumaça': 'item/ic-item-bomba-fumaca',
	'Fio ninja (50m)': 'item/ic-item-fio-ninja',
	'Kan no Kami (Papel Sensível)': 'item/ic-item-kan-no-kami',
	'Papel Explosivo': 'item/ic-item-papel-explosivo',
	'Lente de visão noturna': 'item/ic-item-lente-noturna',
	'Kit de marionetista': 'item/ic-item-kit-marionetista',
	'Kit médico (5 usos)': 'item/ic-item-kit-medico'
};

function itensUtilitarios(): ItemLoja[] {
	const aba = equipamentos.abas.find((a) => a.id === 'itens');
	const tabela = aba?.secoes.flatMap((s) => s.blocos).find((b): b is Extract<Bloco, { tipo: 'tabela' }> => b.tipo === 'tabela');
	if (!tabela) return [];
	const itens: ItemLoja[] = [];
	for (const linha of tabela.linhas) {
		const [nome, preco, p] = linha.map((c) => texto(c as Trecho[][]).trim());
		// Itens com preço variável (venenos, pergaminhos) ficam para a loja completa.
		if (!/^\d/.test(preco) || /\ba\b/.test(preco)) continue;
		itens.push({
			id: `item-${nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
			nome,
			preco: numero(preco),
			peso: peso(p),
			conjunto: CONSUMIVEIS.test(nome) ? 5 : undefined,
			grupo: 'Itens utilitários',
			icone: ICONES_ITEM[nome] ?? 'equip/ic-equip-ferramenta'
		});
	}
	itens.push(
		{ id: 'item-pergaminho-basico', nome: 'Pergaminho básico (5 de carga)', preco: 1000, peso: 0.5, grupo: 'Itens utilitários', icone: 'item/ic-item-pergaminho-basico' },
		{ id: 'item-pergaminho-avancado', nome: 'Pergaminho avançado (15 de carga)', preco: 8000, peso: 0.5, grupo: 'Itens utilitários', icone: 'item/ic-item-pergaminho-avancado' }
	);
	return itens;
}

export function catalogoCriacao(clasPermitidos: string[]) {
	const armas: ItemLoja[] = equipamentos.categorias.flatMap((c) =>
		c.armas.map((a) => ({
			id: a.slug,
			nome: a.nome,
			preco: numero(a.preco),
			peso: peso(a.peso),
			conjunto: CONJUNTO_10.includes(a.slug) ? 10 : undefined,
			grupo: `Armas · ${c.titulo}`,
			icone: a.icone ?? c.icone,
			dano: a.dano
		}))
	);

	const gerais = jutsus.filter((j) => !j.cla && !JUTSUS_ACADEMIA.includes(j.slug));
	const jutsusE = gerais.filter((j) => j.rank === 'E').map((j) => jutsuResumo(j.slug)!);
	const jutsusD = gerais.filter((j) => j.rank === 'D').map((j) => jutsuResumo(j.slug)!);
	const conhecidos = Object.fromEntries(
		[...JUTSUS_ACADEMIA, ...Object.values(CLAS).flatMap((c) => c.jutsus)].map((s) => [s, jutsuResumo(s)]).filter(([, j]) => j)
	) as Record<string, JutsuResumo>;

	const listaClas = clas
		.filter((c) => clasPermitidos.includes(c.slug))
		.map((c) => ({ slug: c.slug, nome: c.nome, epiteto: c.epiteto, kkg: c.kkg?.nome ?? null, bonus: c.bonus.map((b) => b.texto), marco: CLAS[c.slug]?.marco ?? '' }));

	const esps = Object.entries(ESPECIALIZACOES).map(([id, e]) => {
		const livro = especializacoes.lista.find((x) => x.slug === e.slug);
		return {
			id,
			nome: livro?.nome.replace(/ \(.*\)$/, '') ?? id,
			icone: livro?.icone ?? `esp/ic-esp-${id}`,
			niveis: (livro?.niveis ?? []).map((n) => ({ nivel: n.nivel, texto: texto(n.beneficio) })),
			bloqueio: e.bloqueio ?? null
		};
	});

	return { loja: [...armas, ...itensUtilitarios()], jutsusE, jutsusD, conhecidos, clas: listaClas, especializacoes: esps, armas: armas.map((a) => a.nome) };
}
export type CatalogoCriacao = ReturnType<typeof catalogoCriacao>;

function jutsuFicha(j: Pick<(typeof jutsus)[number], 'slug' | 'nome' | 'rank' | 'tipo' | 'custo' | 'custoNum' | 'elemento' | 'cla' | 'origem' | 'efeito' | 'info'>): JutsuFicha {
	return {
		slug: j.slug,
		nome: j.nome,
		rank: j.rank,
		tipo: j.tipo,
		custo: j.custo,
		custoNum: j.custoNum,
		elemento: j.elemento,
		cla: j.cla,
		origem: j.origem,
		efeito: texto(j.efeito),
		info: j.info
	};
}

/** Jutsus gerais do livro que um clã criado pode adotar como carta (cap. 8.4, Componente 6). */
export function jutsusParaCla(): JutsuCatalogo[] {
	return jutsus
		.filter((j) => !j.cla && !JUTSUS_ACADEMIA.includes(j.slug) && j.rank !== 'E')
		.map((j) => ({ slug: j.slug, nome: j.nome, rank: j.rank, tipo: j.tipo, elemento: j.elemento }));
}

/** Jutsus originais de um clã criado: com os números do criador de jutsus (cap. 20) quando a carta já tem um jutsu aprovado. */
function jutsusOriginais(id: string, d: ClaDados, criados: JutsuCriadoFicha[]): JutsuFicha[] {
	return d.cartas
		.filter((c) => c.tipo === 'jutsu' && !c.slug)
		.map((c) => {
			const feito = criados.find((j) => j.cla_id === id && j.carta_id === c.id);
			if (feito) return { ...jutsuFicha(paraJutsuLivro(slugCarta(id, c), feito.dados, `Clã ${d.conceito.nome.trim()}`)), cla: id, rolagem: rolagemDoJutsu(feito.dados) };
			return {
			slug: slugCarta(id, c),
			nome: c.nome,
			rank: c.rank ?? 'C',
			tipo: 'Clã',
			custo: 'A definir',
			custoNum: 0,
			elemento: null,
			cla: id,
			origem: `Clã ${d.conceito.nome.trim()}`,
			efeito: c.descricao,
			info: []
			};
		});
}

/** Catálogo da ficha em jogo (P3, P4, P5): jutsus gerais e do clã, marcos e dados do clã, loja e especializações. */
export function catalogoFicha(claSlug: string | null, criado?: { id: string; dados: ClaDados } | null, jutsusCriados: JutsuCriadoFicha[] = []) {
	// jutsus criados para o personagem: entram como jutsus gerais, aprendidos com PT no treino
	const proprios = jutsusCriados.filter((j) => j.personagem_id).map((j) => ({ ...jutsuFicha(paraJutsuLivro(slugJutsuCriado(j.id), j.dados, 'Criação própria')), rolagem: rolagemDoJutsu(j.dados) }));
	const base = catalogoCriacao(claSlug ? [claSlug] : []);
	const doCla = claSlug ? jutsus.filter((j) => j.cla === claSlug) : [];
	const cla = claSlug ? clas.find((c) => c.slug === claSlug) : undefined;
	if (criado) {
		const originais = jutsusOriginais(criado.id, criado.dados, jutsusCriados);
		const cartas = criado.dados.cartas.filter((c) => c.tipo === 'jutsu');
		return {
			loja: base.loja,
			especializacoes: base.especializacoes,
			armas: base.armas,
			jutsus: [...jutsus.filter((j) => !j.cla).map(jutsuFicha), ...proprios, ...originais],
			jutsusDoCla: cartas.map((c) => ({ slug: slugCarta(criado.id, c), nome: c.nome })),
			cla: claParaFicha(criado.id, criado.dados)
		};
	}
	return {
		loja: base.loja,
		especializacoes: base.especializacoes,
		armas: base.armas,
		jutsus: [...[...jutsus.filter((j) => !j.cla), ...doCla].map(jutsuFicha), ...proprios],
		jutsusDoCla: doCla.map((j) => ({ slug: j.slug, nome: j.nome })),
		cla: cla
			? {
					slug: cla.slug as string | null,
					id: null as string | null,
					nome: cla.nome,
					epiteto: cla.epiteto,
					kkg: cla.kkg?.nome ?? null,
					status: cla.status?.rotulo ?? null,
					bonus: cla.bonus.map((b) => b.texto),
					relacoes: cla.relacoes.map((r) => ({ nome: r.nome, relacao: r.relacao })),
					obrigacao: texto(cla.obrigacao),
					marcos: cla.marcos as { nivel: number; texto: string }[],
					brasao: null as { kamon: string; cor: string } | null
				}
			: null
	};
}
export type CatalogoFicha = ReturnType<typeof catalogoFicha>;
