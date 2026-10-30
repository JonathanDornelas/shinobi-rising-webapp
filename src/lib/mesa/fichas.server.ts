// L11 · Mesa: a ficha rápida de cada personagem, já calculada no servidor (a Mesa não carrega o catálogo inteiro de
// cada ficha). Usa as mesmas contas da ficha (P3): custo real do jutsu, ataque com a perícia do tipo e a proficiência,
// dano lido do efeito, armas do inventário e perícias.
import { claDaFicha } from '#lib/clas/servidor.ts';
import { comDt, dtDoLancador, dtFixa, dtNaFichaDaCriatura, pedeDt } from '#lib/jutsus/dt.ts';
import { jutsusDaFicha } from '#lib/jutsus/servidor.ts';
import { equipamentos, jutsus as catalogoJutsus } from '#lib/livro/dados.server.ts';
import { catalogoFicha } from '#lib/personagem/catalogo.server.ts';
import { custoKkg } from '#lib/personagem/kkg.ts';
import { ATRIBUTOS, NIVEIS_PROFICIENCIA } from '#lib/personagem/dados.ts';
import { cargaInventario, custoJutsu, estadoAtual, ficha, inventarioInicial, type EstadoJogo, type ItemInventario } from '#lib/personagem/progressao.ts';
import { linhasPericia, type FichaDados, type ItemLoja } from '#lib/personagem/regras.ts';
import { idsCriados, infoItem } from '#lib/equipamentos/info.server.ts';
import { ataqueDoJutsu, curaDoEfeito, danoDoEfeito, danoNormal, somar, teste } from '#lib/rolagens/expressoes.ts';
import { partesAtaqueJutsu, partesDanoAtributo, partesPericia, type Parte } from '#lib/rolagens/partes.ts';
import { atributosDaCriatura, periciasDaCriatura } from './atributos.ts';
import { ehVersatil, modosDaArma, nomeDoModo, type ModoArma } from './armas.ts';
import { deslocamentoPorAgi } from './geometria.ts';
import { clonesDoJutsu, duracaoEmTurnos, reguaDoCard, tamanhoDoEfeito } from './regua.ts';
import type { ArmaMesa, ExtrasNpc, FichaMesa, JutsuMesa } from './tipos.ts';
import bestiario from '#lib/livro/gerado/bestiario.json';
import { TAMANHOS } from '#lib/bestiario/npc.ts';
import type { Criatura } from '#lib/livro/tipos.ts';
import { habilidadeDoTraco } from './habilidades.ts';

export type { ArmaMesa, ExtrasNpc, FichaMesa, JutsuMesa, RolagemPronta } from './tipos.ts';

/**
 * Jutsus do NPC: ataque com o acerto da ficha, dano e cura do card e a DT na Resistência. O NPC que veio do bestiário
 * tem a DT de cada jutsu pela ficha da criatura (10 + rank + atributo-chave + proficiência); o outro, a DT anotada.
 */
export function jutsusDoNpc(n: { jutsus: string[] | null; acerto: number | null; dt: number | null; bestiario?: string | null }): JutsuMesa[] {
	const daCriatura = n.bestiario ? estagioDoBestiario(n.bestiario)?.combate.ficha : null;
	return (n.jutsus ?? [])
		.map((slug) => catalogoJutsus.find((j) => j.slug === slug))
		.filter((j) => !!j)
		.map((j) => {
			const v = (k: string) => j.info.find((i) => i.k === k)?.v ?? '';
			const custo = /(\d+)\s*(PC|PE)/.exec(j.custo);
			const efeito = (j.efeito ?? []).map((x) => x.t).join('');
			const dano = danoDoEfeito(efeito);
			const res = v('Resistência');
			const dt = !pedeDt(res, efeito) ? null : daCriatura ? dtNaFichaDaCriatura(daCriatura, j) : n.dt != null ? dtFixa(n.dt, 'DT da ficha do NPC: a mesma em todos os jutsus dele.') : null;
			return {
				slug: j.slug,
				nome: j.nome,
				rank: j.rank,
				custo: custo ? +custo[1] : 0,
				unidade: custo?.[2] === 'PE' ? 'PE' : 'PC',
				alcance: v('Alcance'),
				area: v('Área'),
				regua: reguaDoCard(j.info),
				turnos: duracaoEmTurnos(v('Duração')),
				tamanho: tamanhoDoEfeito(efeito),
				clones: clonesDoJutsu(v('Área'), efeito),
				tipo: j.tipo,
				elemento: j.elemento ?? null,
				acao: v('Ação'),
				duracao: v('Duração'),
				traducao: j.traducao,
				efeito,
				resistencia: res && res !== '—' ? comDt(res, dt) : null,
				dt,
				ataque: /^1d20/.test(v('Ataque')) && n.acerto != null ? { expr: teste(n.acerto), rotulo: `Ataque · ${j.nome}`, partes: [] } : null,
				dano: dano ? { expr: dano.dados, rotulo: `Dano · ${j.nome}`, partes: [] } : null,
				cura: curaDoEfeito(efeito)
			} satisfies JutsuMesa;
		});
}

const CRIATURAS = (bestiario as unknown as { criaturas: Criatura[] }).criaturas;
const textoTrechos = (c: { t: string }[] | null | undefined) => (c ?? []).map((x) => x.t).join('');
const metrosDoAlcance = (a: string) => (/longo/i.test(a) ? 60 : /m[ée]dio/i.test(a) ? 30 : /curto/i.test(a) ? 10 : /(\d+)\s?m/.exec(a) ? +/(\d+)\s?m/.exec(a)![1] : 1);

/** O estágio do bestiário de um NPC ("slug#estágio"; sem estágio, o primeiro). */
function estagioDoBestiario(ref: string) {
	const [slug, est] = ref.split('#');
	const c = CRIATURAS.find((x) => x.slug === slug);
	return c?.estagios.find((s) => s.slug === est) ?? c?.estagios[0] ?? null;
}

/** NPC que veio do bestiário ("slug#estágio"): o tamanho no quadro, os ataques da ficha e os traços usáveis. */
export function extrasDoNpc(n: { bestiario: string | null }): ExtrasNpc | null {
	if (!n.bestiario) return null;
	const e = estagioDoBestiario(n.bestiario);
	if (!e) return null;
	const k = e.combate;
	return {
		tamanho: TAMANHOS[e.tamanho ?? 'medio'].espaco,
		deslocamento: k.ficha ? deslocamentoPorAgi(k.ficha.atributos.agi, k.ficha.especializacoes.some((s) => /velocidade/i.test(s.nome))) : 10,
		ataques: k.ataques.flatMap((a) => {
			// o alcance da ficha, mais o outro modo da arma do catálogo (a Kunai "corpo a corpo" também é arremessada)
			const m = metrosDoAlcance(a.alcance);
			const daFicha: ModoArma = { m, rotulo: m > 2 ? `${a.alcance} · ${m} m` : a.alcance, distancia: m > 2 };
			const arma = armaDoCatalogo(a.nome);
			const outro = arma ? modosDaArma(arma.alcance, arma.propriedades).find((x) => x.distancia !== daFicha.distancia) : undefined;
			const modos = outro ? [daFicha, outro].sort((x, y) => x.m - y.m) : [daFicha];
			return modos.map((md) => {
				const nome = nomeDoModo(a.nome, md, modos, ehVersatil(arma?.propriedades));
				return {
					nome,
					alcance: md.m,
					rotuloAlcance: md.rotulo,
					propriedades: arma?.propriedades,
					ataque: { expr: teste(a.acerto), rotulo: `Ataque · ${nome}`, partes: [] },
					dano: { expr: a.dano.replace(/\s+/g, ''), rotulo: `Dano · ${nome}`, partes: [] }
				};
			});
		}),
		habilidades: k.tracos.map((t) => habilidadeDoTraco(t.nome, textoTrechos(t.efeito), k.dt, k.ataques[0]?.dano ?? null)),
		atributos: k.ficha ? atributosDaCriatura(k.ficha) : null,
		pericias: k.ficha ? periciasDaCriatura(k.ficha) : []
	};
}

const claDe = (resumo: unknown) => {
	const c = (resumo as { cla?: string | null })?.cla ?? null;
	return c && !['sem', 'novo-sem-kkg', 'novo-com-kkg'].includes(c) ? c : null;
};

const ARMAS = equipamentos.categorias.flatMap((c) => c.armas);
/** A arma do catálogo pelo nome ("Kunai", "Kunai de selo", "Espada" para "Katana/Espada"). */
function armaDoCatalogo(nome: string) {
	const n = nome.toLowerCase();
	const nomes = (a: { nome: string }) => a.nome.replace(/\s*\(.*\)$/, '').toLowerCase().split('/');
	return ARMAS.find((a) => a.nome.toLowerCase() === n) ?? ARMAS.find((a) => nomes(a).some((x) => n === x || n.startsWith(`${x} `)));
}

type LinhaPersonagem = {
	id: string;
	jogador_id: string;
	nome: string;
	nivel: number;
	dados: unknown;
	resumo: unknown;
	estado: unknown;
	inventario: unknown;
	ryo: number;
	retrato: string | null;
	cla_id: string | null;
	anotacoes?: string;
};

export async function fichaMesa(sb: App.Locals['supabase'], p: LinhaPersonagem): Promise<FichaMesa | null> {
	const dados = p.dados as FichaDados;
	if (!dados?.conceito) return null;
	const [criado, jutsusCriados] = await Promise.all([claDaFicha(sb, p.cla_id), jutsusDaFicha(sb, p.id, p.cla_id, p.dados)]);
	const catalogo = catalogoFicha(claDe(p.resumo), criado, jutsusCriados);
	const loja = catalogo.loja as ItemLoja[];
	const calc = ficha(dados, loja);
	const r = calc.recursos;
	const max = { pv: r.pv, pc: r.pc, pe: r.pe };
	const estado = (p.estado ?? {}) as EstadoJogo;
	const atual = estadoAtual(estado, { ...max, pic: calc.pic });
	const linhas = linhasPericia(dados);
	const prof = (tipo: string, alvo: string) => {
		const x = calc.proficiencias.find((q) => q.tipo === tipo && q.alvo === alvo);
		return x ? NIVEIS_PROFICIENCIA[x.nivel - 1].bonus : 0;
	};

	const jutsus: JutsuMesa[] = calc.jutsus
		.map((s) => catalogo.jutsus.find((j) => j.slug === s))
		.filter((j) => !!j)
		.map((j) => {
			const c = custoJutsu(dados, j, atual.fadiga);
			// a perícia do card, com o atributo trocado quando ele pede ("Taijutsu (com CTR)" no Juuken)
			const atq = ataqueDoJutsu(j.info, linhas, calc.atributos);
			const bonus = prof('jutsu', j.slug);
			const dano = j.rolagem ? (j.rolagem.modo === 'dano' ? j.rolagem : null) : (danoDoEfeito(j.efeito) ?? danoNormal(j.efeito, j.tipo, j.info));
			const atributo = dano?.atributo as keyof typeof calc.atributos | null | undefined;
			const valorAtr = atributo ? calc.atributos[atributo] : 0;
			const v = (k: string) => j.info.find((i) => i.k === k)?.v ?? '';
			const dt = pedeDt(v('Resistência'), j.efeito) ? dtDoLancador(j.rank, j.tipo, calc.atributos, bonus) : null;
			return {
				slug: j.slug,
				nome: j.nome,
				rank: j.rank,
				custo: c.final,
				unidade: c.unidade,
				alcance: v('Alcance'),
				area: v('Área'),
				regua: reguaDoCard(j.info),
				turnos: duracaoEmTurnos(v('Duração')),
				tamanho: tamanhoDoEfeito(j.efeito),
				clones: clonesDoJutsu(v('Área'), j.efeito),
				tipo: j.tipo,
				elemento: j.elemento ?? null,
				acao: v('Ação'),
				duracao: v('Duração'),
				traducao: j.traducao,
				efeito: j.efeito,
				resistencia: v('Resistência') && v('Resistência') !== '—' ? comDt(v('Resistência'), dt) : null,
				dt,
				ataque: atq === null ? null : { expr: teste(atq.base + bonus), rotulo: `Ataque · ${j.nome}`, partes: partesAtaqueJutsu(atq.rotulo, atq.base, bonus) },
				dano: dano ? { expr: somar(dano.dados, valorAtr), rotulo: `Dano · ${j.nome}`, partes: partesDanoAtributo(atributo, valorAtr) } : null,
				cura: j.rolagem ? (j.rolagem.modo === 'cura' ? j.rolagem.dados : null) : curaDoEfeito(j.efeito)
			};
		});

	const buki = linhas.find((l) => l.id === 'bukijutsu');
	const mochila = (p.inventario as ItemInventario[] | null) ?? inventarioInicial(dados, loja);
	const inventario = mochila.filter((i) => i.grupo === 'Armas' && !i.selado);
	const ids = idsCriados(mochila);
	const { data: criados } = ids.length ? await sb.from('equipamentos_criados').select('id, tipo, nome, resumo').in('id', ids) : { data: [] };
	// uma linha por modo de uso: a Kunai (Versátil) tem o golpe e o arremesso (cap. 12)
	const armas: ArmaMesa[] = [...new Map(inventario.map((i) => [i.nome, i])).values()].flatMap((i) => {
		const arma = armaDoCatalogo(i.nome);
		const modos = modosDaArma(arma?.alcance ?? 'Corpo a corpo', arma?.propriedades);
		const bonus = prof('arma', i.nome);
		const danoBase = i.dano ?? (loja.find((l) => l.nome === i.nome) as ItemLoja & { dano?: string })?.dano ?? null;
		return modos.map((md) => {
			const nome = nomeDoModo(i.nome, md, modos, ehVersatil(arma?.propriedades));
			const distancia = md.distancia && buki?.distancia;
			const base = distancia ? buki!.distancia!.total : (buki?.total ?? 0);
			const atr = md.distancia ? 'AGI' : 'FOR';
			return {
				nome,
				alcance: md.m,
				rotuloAlcance: md.rotulo,
				propriedades: arma?.propriedades,
				ataque: { expr: teste(base + bonus), rotulo: `Ataque · ${nome}`, partes: buki ? [...partesPericia(buki, !!distancia), ...(bonus ? ([['Proficiência', `+${bonus}`]] as Parte[]) : [])] : [] },
				dano: danoBase ? { expr: somar(danoBase, calc.atributos[atr] + (bonus ? 1 : 0)), rotulo: `Dano · ${nome}`, partes: [...partesDanoAtributo(atr, calc.atributos[atr]), ...(bonus ? ([['Proficiência', '+1']] as Parte[]) : [])] } : null
			};
		});
	});
	if (!armas.length) {
		const fr = calc.atributos.FOR;
		const tai = linhas.find((l) => l.id === 'taijutsu');
		armas.push({ nome: 'Desarmado', alcance: 1, rotuloAlcance: 'Corpo a corpo', ataque: { expr: teste(tai?.total ?? 0), rotulo: 'Ataque desarmado', partes: tai ? partesPericia(tai) : [] }, dano: { expr: somar('1d6', fr), rotulo: 'Dano desarmado', partes: partesDanoAtributo('FOR', fr) } });
	}

	const esp = (id: string) => calc.especializacoes.find((e) => e.id === id)?.nivel ?? 0;
	const velocidade = esp('velocidade');
	const distancias: [string, number][] = [];
	if (calc.jutsus.includes('kawarimi-no-jutsu')) distancias.push(['Kawarimi', 5]);
	if (esp('marionete')) distancias.push(['Fios da marionete', 30]);
	const sensor = esp('sensor');
	if (sensor) distancias.push(['Sensor', sensor === 1 ? 50 : sensor === 2 ? 500 : 5000]);

	const resumo = p.resumo as { claNome?: string | null; vila?: string };
	return {
		id: p.id,
		jogadorId: p.jogador_id,
		nome: p.nome,
		sub: [resumo.claNome ? `Clã ${resumo.claNome}` : null, resumo.vila ? resumo.vila[0].toUpperCase() + resumo.vila.slice(1) : null, `nível ${calc.nivel}`].filter(Boolean).join(' · '),
		cla: claDe(p.resumo),
		retrato: p.retrato,
		max,
		estado,
		pd: atual.pd,
		defesa: r.defesa,
		defesaMental: r.defesaMental,
		iniciativa: r.iniciativa,
		deslocamento: deslocamentoPorAgi(calc.atributos.AGI, velocidade > 0),
		jutsus,
		armas,
		atributos: ATRIBUTOS.map((a) => ({ sigla: a.id, nome: a.nome, valor: calc.atributos[a.id] })),
		pericias: linhas.map((l) => ({
			nome: l.nome,
			atributo: l.atributo,
			expr: teste(l.total),
			partes: partesPericia(l),
			treinada: l.total - l.valorAtributo > 0,
			id: l.id,
			valorAtributo: l.valorAtributo,
			treino: l.treino,
			bonus: l.bonus.map((b) => ({ fonte: b.fonte, valor: b.valor })),
			total: l.total,
			combate: l.combate,
			distancia: l.distancia ? { atributo: l.distancia.atributo, total: l.distancia.total, expr: teste(l.distancia.total), partes: partesPericia(l, true) } : null
		})),
		distancias,
		notas: p.anotacoes ?? '',
		inventario: mochila.map((i) => ({ nome: i.qualidade ? `${i.nome} (${i.qualidade})` : i.nome, qtd: i.qtd, grupo: i.grupo, icone: i.icone, nota: i.nota ?? null, selado: !!i.selado, info: infoItem(i, criados ?? []) })),
		carga: { atual: Math.round(cargaInventario(mochila) * 10) / 10, max: r.cargaMax },
		ryo: p.ryo,
		kkg: catalogo.kkg ? { def: catalogo.kkg, ...custoKkg(catalogo.kkg, calc.nivel) } : null,
		nivel: calc.nivel
	};
}
