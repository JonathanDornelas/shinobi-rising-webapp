// Importa jutsus da wiki de Naruto para o catálogo (conteudo/jutsus.yaml). Cada jutsu vem de uma especificação com os
// componentes do cap. 20 (dano, alcance, área, efeitos, modificadores, ação), e o rank, o custo, a conta de PJ e a linha
// de info saem da mesma calculadora do criador de jutsus (#lib/jutsus/regras.ts): o balanceamento é o das regras.
// O texto (tradução, descrição, efeito e notas) vem escrito na especificação.
//   node scripts/livro/importar-jutsus.ts <especificacao.mjs> [--gravar]
// Sem --gravar, só confere e mostra a conta de cada jutsu. Com --gravar, troca o bloco da onda no fim do YAML.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, stringify } from 'yaml';
import { calcularJutsu, infoFinal, jutsuVazio, type JutsuDados } from '#lib/jutsus/regras.ts';
import { ALCANCES, APOIO, AREAS, EFEITOS, MODIFICADORES, type Alcance, type Area, type Dado } from '#lib/jutsus/dados.ts';
import { curaDoEfeito, danoDoEfeito } from '#lib/rolagens/expressoes.ts';
import { slug as slugDe } from '#lib/livro/texto.ts';
import type { Rank, TipoJutsu } from '#lib/livro/tipos.ts';

const ARQ = join(import.meta.dirname, '..', '..', 'conteudo', 'jutsus.yaml');
const [arqEspec, ...resto] = process.argv.slice(2);
const gravar = resto.includes('--gravar');

type CampoInfo = 'alcance' | 'duracao' | 'area' | 'ataque' | 'resistencia' | 'acao';
/** Um jutsu da onda: o que a wiki diz, os componentes (cap. 20) e o texto do livro. */
interface Espec {
	/** Título da página na wiki (referência) e o rank que ela dá, para conferir. */
	wiki: string;
	rankWiki?: Rank | null;
	nome: string;
	slug?: string;
	traducao: string;
	origem: string;
	tipo: TipoJutsu;
	elemento?: string | null;
	cla?: string | null;
	capitulo: number;
	ancora: string;
	/** [qtd, dado, bônus] */
	dano?: [number, Dado, number?];
	cura?: [number, Dado, number?];
	alcance?: Alcance;
	area?: Area;
	alvosExtras?: number;
	/** id do componente do cap. 20 → quantidade ou valor em PJ */
	comp?: Record<string, number>;
	acao?: JutsuDados['acao'];
	/** campos da linha de info escritos à mão (o resto sai das compras) */
	info?: Partial<Record<CampoInfo, string>>;
	descricao: string;
	efeito: string;
	notas?: string[];
}

const { onda, jutsus: lista } = (await import(pathToFileURL(arqEspec).href)) as { onda: string; jutsus: Espec[] };

// rótulos curtos da conta de PJ, no estilo das cartas do livro
const CURTO: Record<string, string> = {
	atordoa: 'atordoa',
	empurra: 'empurra',
	paralisa: 'paralisa',
	imobiliza: 'imobiliza',
	controla: 'controla',
	cega: 'cega',
	turnos: 'turnos extras',
	continuo: 'dano contínuo',
	sela: 'sela chakra',
	drena: 'drena chakra',
	transfere: 'transfere o chakra',
	ignora: 'ignora RD',
	persegue: 'persegue',
	atravessa: 'atravessa',
	barreira: 'barreira',
	invocacao: 'clone ou invocação',
	sustentado: 'sustentado',
	buff1: 'buff +1',
	buff2: 'buff +2',
	'buff-cena': 'dura 1 cena',
	rd2: 'RD 2',
	remove: 'remove condição',
	'buff-aliado': 'buff em aliado',
	'chakra-aliado': 'chakra para aliado',
	'acao-extra': 'ação extra',
	rara: 'condição rara',
	'dano-proprio': 'dano a si',
	'custa-pv': 'custa PV',
	fadiga: 'Fadiga',
	exige: 'exige outra técnica',
	preparo: 'preparação',
	'uma-vez': 'uma vez por cena',
	consumivel: 'material consumível',
	duravel: 'foco em mãos',
	'sem-selos': 'sem selos',
	arma: 'em arma',
	'dois-elementos': 'dois elementos',
	'nao-copia': 'não copiável'
};
const COMPONENTES = [...EFEITOS, ...APOIO, ...MODIFICADORES];
const ACAO_CURTA: Record<string, string> = { secundaria: 'ação secundária', reacao: 'reação', completa: 'ação completa' };
const dadosTexto = (x: [number, number, number?]) => `${x[0]}d${x[1]}${x[2] ? (x[2] > 0 ? `+${x[2]}` : x[2]) : ''}`;

function montar(e: Espec) {
	const d: JutsuDados = {
		...jutsuVazio(),
		nome: e.nome,
		traducao: e.traducao,
		tipo: e.tipo,
		elemento: e.elemento ?? null,
		dano: e.dano
			? { modo: 'dano', qtd: e.dano[0], dado: e.dano[1], bonus: e.dano[2] ?? 0 }
			: e.cura
				? { modo: 'cura', qtd: e.cura[0], dado: e.cura[1], bonus: e.cura[2] ?? 0 }
				: { modo: 'nenhum', qtd: 1, dado: 6, bonus: 0 },
		alcance: e.alcance ?? 'toque',
		area: e.area ?? 'unico',
		alvosExtras: e.alvosExtras ?? 0,
		componentes: { ...e.comp },
		acao: e.acao ?? 'primaria',
		info: { ...e.info }
	};
	const calc = calcularJutsu(d);
	const info = infoFinal(d, calc);
	// a conta de PJ, só com o que custa ou desconta, como nas cartas do livro
	const itens: [string, number][] = [];
	const dados = e.dano ?? e.cura;
	if (dados) itens.push([`${e.cura ? 'cura' : 'dano'} ${dadosTexto(dados)}${e.dano && (e.tipo === 'Taijutsu' || e.tipo === 'Bukijutsu') ? ' + FOR' : ''}`, calc.linhas[0].pj]);
	const alc = ALCANCES.find((a) => a.id === d.alcance)!;
	if (alc.pj) itens.push([alc.nome, alc.pj]);
	const area = AREAS.find((a) => a.id === d.area)!;
	if (area.pj) itens.push([area.nome.toLowerCase(), area.pj]);
	if (d.area === 'unico' && d.alvosExtras) itens.push([d.alvosExtras === 1 ? '1 alvo extra' : `${d.alvosExtras} alvos extras`, 2 * Math.min(3, d.alvosExtras)]);
	for (const c of COMPONENTES) {
		const v = d.componentes[c.id] ?? 0;
		if (!v) continue;
		const linha = calc.linhas.find((l) => l.rotulo.startsWith(c.nome));
		if (!linha) continue;
		itens.push([`${CURTO[c.id] ?? c.id}${c.tipo === 'qtd' && v > 1 ? ` ×${v}` : ''}`, linha.pj]);
	}
	if (ACAO_CURTA[d.acao]) itens.push([ACAO_CURTA[d.acao], calc.linhas.find((l) => l.rotulo.startsWith('Ação'))!.pj]);
	const conta = itens.map(([r, n], i) => (n < 0 ? `${i ? ' − ' : '−'}${r} (−${-n})` : `${i ? ' + ' : ''}${r} (${n})`)).join('');
	return { calc, info, pj: `${conta || 'sem componentes'}: ${calc.pj} PJ, rank ${calc.rank}.` };
}

const MARCA = `# ---- Jutsus da wiki de Naruto: ${onda}`;
const textoAtual = readFileSync(ARQ, 'utf8');
const semOnda = textoAtual.includes(MARCA) ? `${textoAtual.slice(0, textoAtual.indexOf(MARCA)).trimEnd()}\n` : textoAtual;
const slugsFora = new Set((parse(semOnda) as { slug: string }[]).map((j) => j.slug));

const cartas: object[] = [];
const avisos: string[] = [];
const vistos = new Set<string>();
for (const e of lista) {
	const { calc, info, pj } = montar(e);
	const s = e.slug ?? slugDe(e.nome);
	if (slugsFora.has(s) || vistos.has(s)) avisos.push(`slug repetido: ${s}`);
	vistos.add(s);
	if (e.rankWiki && e.rankWiki !== calc.rank) avisos.push(`${e.nome}: rank ${calc.rank} (${calc.pj} PJ), a wiki diz ${e.rankWiki}`);
	// o app tira o dano e a cura do texto do efeito: os dados do texto têm que ser os da conta
	const esperado = e.dano ? dadosTexto(e.dano) : null;
	const lido = danoDoEfeito(e.efeito)?.dados ?? null;
	if (esperado !== lido && !(e.cura && !lido)) avisos.push(`${e.nome}: o efeito mostra dano ${lido ?? 'nenhum'}, a conta usa ${esperado ?? 'nenhum'}`);
	if (e.cura && curaDoEfeito(e.efeito) !== dadosTexto(e.cura)) avisos.push(`${e.nome}: o efeito mostra cura ${curaDoEfeito(e.efeito) ?? 'nenhuma'}, a conta usa ${dadosTexto(e.cura)}`);
	if (/—/.test([e.descricao, e.efeito, ...(e.notas ?? [])].join(' '))) avisos.push(`${e.nome}: travessão no texto`);
	cartas.push({
		slug: s,
		nome: e.nome,
		traducao: e.traducao,
		origem: e.origem,
		tipo: e.tipo,
		rank: calc.rank,
		custo: calc.custo.texto,
		info: [
			{ k: 'Alcance', v: info.alcance },
			{ k: 'Duração', v: info.duracao },
			{ k: 'Área', v: info.area },
			{ k: 'Ataque', v: info.ataque },
			{ k: 'Resistência', v: info.resistencia },
			{ k: 'Ação', v: info.acao }
		],
		descricao: [e.descricao],
		efeito: e.efeito,
		notas: e.notas ?? [],
		pj,
		capitulo: e.capitulo,
		ancora: e.ancora,
		cla: e.cla ?? null,
		elemento: e.elemento ?? null
	});
	if (!gravar) console.log(`${calc.rank} ${calc.custo.texto.padEnd(8)} ${e.nome} · ${pj}`);
}
const porRank: Record<string, number> = {};
for (const c of cartas as { rank: string }[]) porRank[c.rank] = (porRank[c.rank] ?? 0) + 1;
console.log(`${cartas.length} jutsus (${Object.entries(porRank).map(([r, n]) => `${r} ${n}`).join(', ')})`);
if (avisos.length) console.log(`\n${avisos.length} aviso(s):\n  ${avisos.join('\n  ')}`);
if (gravar) {
	if (avisos.length) {
		console.log('\nNada gravado: resolva os avisos primeiro.');
		process.exit(1);
	}
	writeFileSync(ARQ, `${semOnda}${MARCA} (gerado por scripts/livro/importar-jutsus.ts a partir da especificação da onda)\n${stringify(cartas, { lineWidth: 0 })}`);
	console.log(`Gravado em conteudo/jutsus.yaml (${onda}).`);
}
