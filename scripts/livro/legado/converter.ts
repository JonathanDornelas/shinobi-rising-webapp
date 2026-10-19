// LEGADO: convertia legado/shinobi_no_michi_v18.docx nos dados da documentação. A fonte agora é conteudo/
// (Markdown + YAML), compilada por scripts/livro/compilar.ts; este arquivo fica só como referência.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerBlocos, lerDocx, lerNumeracao, paragrafosDaTabela } from './docx.ts';
import type { No, Paragrafo, Run, Tabela } from './docx.ts';
import { kanji, normalizar, slug } from '../../../src/lib/livro/texto.ts';
import type {
	Bloco,
	CardReferencia,
	Capitulo,
	CategoriaArmas,
	Celula,
	Cla,
	DocBusca,
	Equipamentos,
	Espada,
	Especializacao,
	Especializacoes,
	Habilidade,
	IndiceLivro,
	ItemLista,
	Jutsu,
	Parte,
	Rank,
	Relacao,
	SecaoGlossario,
	TipoJutsu,
	Trecho,
	VarianteDestaque
} from '../../../src/lib/livro/tipos.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SAIDA = join(RAIZ, 'src', 'lib', 'livro', 'gerado');
const avisos: string[] = [];
const avisar = (m: string) => avisos.push(m);

// ---------------------------------------------------------------- cores do livro
const COR_CABECALHO = 'c44536';
const COR_FAIXA_JUTSU = '5c1e15';
const COR_EPIGRAFE = 'f0ebe0';
const COR_DESTAQUE = 'fff4e6';
const COR_TIPO: Record<string, TipoJutsu> = {
	'069bbd': 'Ninjutsu',
	'674ea7': 'Genjutsu',
	'38761d': 'Taijutsu',
	bf9000: 'Bukijutsu',
	'7f6000': 'Fuuinjutsu',
	a23b72: 'Kugutsu'
};

// ---------------------------------------------------------------- metadados editoriais
// Slugs curtos para as URLs dos capítulos. 19 e 22 viram as páginas de catálogo D7 e D8.
const SLUG_CAPITULO: Record<number, string> = {
	1: 'introducao',
	2: 'mecanica-basica',
	3: 'atributos-pericias-e-proficiencias',
	4: 'combate',
	5: 'furtividade-e-assassinato',
	6: 'criacao-de-personagem',
	7: 'vilas-ocultas',
	8: 'clas-e-kekkei-genkai',
	9: 'sistema-de-chakra',
	10: 'jutsus-e-elementos',
	11: 'equipamento-e-itens',
	12: 'armas',
	13: 'marionetes',
	14: 'invocacao-e-companheiros',
	15: 'modo-sennin',
	16: 'portoes-internos',
	17: 'progressao-e-ranks',
	18: 'treino',
	19: 'especializacoes',
	20: 'criacao-de-jutsus',
	21: 'forja-ninja',
	22: 'glossario',
	23: 'apendice-fichas'
};
const HREF_ESPECIAL: Record<number, string> = { 19: '/regras/especializacoes', 22: '/regras/glossario' };
const hrefCapitulo = (n: number) => HREF_ESPECIAL[n] ?? `/regras/${SLUG_CAPITULO[n]}`;

const PARTES_CAPITULOS = [
	[1, 2, 3, 4, 5],
	[6, 7, 8],
	[9, 10, 11, 12, 13, 14, 15],
	[16],
	[17, 18, 19],
	[20, 21],
	[22, 23]
];
const ICONE_PARTE = ['parte/ic-parte-1', 'parte/ic-parte-2', 'parte/ic-parte-3', 'parte/ic-parte-4', 'parte/ic-parte-5', 'parte/ic-parte-6', 'parte/ic-parte-referencia'];
const ROTULO_PARTE = ['PARTE I', 'PARTE II', 'PARTE III', 'PARTE IV', 'PARTE V', 'PARTE VI', 'REFERÊNCIA'];

const ELEMENTOS: Record<string, string> = {
	katon: 'katon',
	suiton: 'suiton',
	doton: 'doton',
	raiton: 'raiton',
	fuuton: 'fuuton',
	futon: 'fuuton',
	mokuton: 'mokuton',
	hyoton: 'hyoton',
	yoton: 'yoton',
	ranton: 'ranton',
	jiton: 'jiton'
};
const CLAS = ['nara', 'akimichi', 'yamanaka', 'inuzuka', 'aburame', 'hyuuga', 'uchiha', 'senju', 'uzumaki', 'kaguya', 'hozuki', 'sabaku', 'yuki'];
const VILAS: [RegExp, string, string][] = [
	[/konohagakure/i, 'Konoha', 'vila/ic-vila-konoha'],
	[/kirigakure/i, 'Kiri', 'vila/ic-vila-kiri'],
	[/sunagakure/i, 'Suna', 'vila/ic-vila-suna'],
	[/iwagakure/i, 'Iwa', 'vila/ic-vila-iwa'],
	[/kumogakure/i, 'Kumo', 'vila/ic-vila-kumo'],
	[/uzushiogakure/i, 'Uzushiogakure', ''],
	[/yukigakure/i, 'Yukigakure', '']
];

/** Tipo (ícone kkg-*) da Kekkei Genkai dos clãs que têm uma, conferido no cap. 8.3. O nome vem do título da seção. */
const KKG_CLA: Record<string, string> = {
	hyuuga: 'dojutsu',
	uchiha: 'dojutsu',
	kaguya: 'corporal',
	hozuki: 'corporal',
	sabaku: 'combinacao',
	yuki: 'combinacao'
};
const NOME_TIPO_KKG: Record<string, string> = {
	dojutsu: 'Dōjutsu',
	combinacao: 'Combinação',
	corporal: 'Corporal',
	mental: 'Mental',
	hibrido: 'Híbrido'
};

const ICONE_ESPECIALIZACAO: [RegExp, string][] = [
	[/controle de chakra/i, 'controle-chakra'],
	[/reservat/i, 'reservatorio'],
	[/elemento/i, 'elemento'],
	[/velocidade/i, 'velocidade'],
	[/resist/i, 'resistencia'],
	[/genjutsu/i, 'genjutsu'],
	[/m[ée]dic/i, 'medico'],
	[/ninjutsu/i, 'ninjutsu'],
	[/bukijutsu/i, 'bukijutsu'],
	[/selamento|fuuinjutsu/i, 'selamento'],
	[/furtividade/i, 'furtividade'],
	[/taijutsu/i, 'taijutsu'],
	[/m[ée]dic/i, 'medico'],
	[/sensor/i, 'sensor'],
	[/invoca/i, 'invocacao'],
	[/marionete|kugutsu/i, 'marionete'],
	[/sennin|senjutsu/i, 'sennin']
];

// ---------------------------------------------------------------- ícones disponíveis
const existeIcone = (id: string) => existsSync(join(RAIZ, 'static', 'icons', `${id}-32.png`));
const iconeSe = (id: string) => (existeIcone(id) ? id : null);

// ---------------------------------------------------------------- trechos
function trechos(runs: Run[]): Trecho[] {
	const out: Trecho[] = [];
	for (const r of runs) {
		const ultimo = out[out.length - 1];
		const b = r.b && r.t.trim() ? 1 : undefined;
		const i = r.i && r.t.trim() ? 1 : undefined;
		if (ultimo && !!ultimo.b === !!b && !!ultimo.i === !!i) ultimo.t += r.t;
		else out.push({ t: r.t, ...(b ? { b } : {}), ...(i ? { i } : {}) });
	}
	// apara espaços nas pontas e normaliza espaços repetidos
	for (const t of out) t.t = t.t.replace(/[ \u00a0]{2,}/g, ' ');
	if (out.length) {
		out[0].t = out[0].t.replace(/^\s+/, '');
		out[out.length - 1].t = out[out.length - 1].t.replace(/\s+$/, '');
	}
	return out.filter((t) => t.t);
}
const textoDe = (c: Trecho[]) => c.map((t) => t.t).join('');
/** Remove um rótulo inicial ("Efeito:", "PJ:") de um parágrafo formatado. */
function semRotulo(c: Trecho[], rotulo: RegExp): Trecho[] {
	const copia = c.map((t) => ({ ...t }));
	while (copia.length) {
		const antes = copia[0].t;
		copia[0].t = antes.replace(rotulo, '');
		if (copia[0].t !== antes || !rotulo.test(textoDe(copia))) break;
	}
	if (copia[0]) copia[0].t = copia[0].t.replace(/^\s+/, '');
	return copia.filter((t) => t.t);
}

// ---------------------------------------------------------------- classificação de nós
const ehTitulo = (p: Paragrafo) => /^Heading[234]$/.test(p.estilo ?? '');
const nivelTitulo = (p: Paragrafo) => +(p.estilo ?? 'Heading2').slice(-1) as 2 | 3 | 4;
function ehFormula(p: Paragrafo) {
	if (p.alinhamento !== 'center') return false;
	const visiveis = p.runs.filter((r) => r.t.trim());
	return visiveis.length > 0 && visiveis.every((r) => r.b && r.cor === COR_CABECALHO);
}
const fillPrimeira = (t: Tabela) => t.linhas[0]?.[0]?.fill ?? null;

function variante(titulo: string): VarianteDestaque {
	const t = normalizar(titulo);
	if (/^exemplo|^npc:|^tropa/.test(t)) return 'exemplo';
	if (/^pre-?requisito/.test(t)) return 'requisito';
	if (/^use o background|^dica/.test(t)) return 'dica';
	if (/regra central|e recurso de criacao|implicacoes|diz nao|diferenca chave|resumo do sistema/.test(t)) return 'atencao';
	return 'destaque';
}

// ---------------------------------------------------------------- estado da conversão
const jutsus: Jutsu[] = [];
const habilidades: Habilidade[] = [];
const slugsUsados = new Set<string>();
function slugUnico(base: string) {
	let s = base;
	for (let n = 2; slugsUsados.has(s); n++) s = `${base}-${n}`;
	slugsUsados.add(s);
	return s;
}

interface Contexto {
	capitulo: number;
	ancora: string;
	cla: string | null;
}

function lerCard(t: Tabela, ctx: Contexto): Bloco | null {
	const ps = paragrafosDaTabela(t).filter(({ p }) => p.texto.trim());
	if (!ps.length) return null;
	const iNome = ps.findIndex(({ p }) => p.runs.some((r) => r.b && r.cor === COR_FAIXA_JUTSU && r.t.trim()));
	if (iNome < 0) {
		avisar(`Card sem nome no cap. ${ctx.capitulo}: ${ps[0].p.texto.slice(0, 60)}`);
		return null;
	}
	const nome = ps[iNome].p.texto.trim();
	const sub = ps[iNome + 1]?.p.texto.trim() ?? '';
	const corte = sub.lastIndexOf(' · ');
	const traducao = corte >= 0 ? sub.slice(0, corte).trim() : sub;
	const origem = corte >= 0 ? sub.slice(corte + 3).trim() : '';

	let rank = '';
	let tipo: TipoJutsu | null = null;
	let custo = '';
	let i = iNome + 2;
	for (; i < ps.length; i++) {
		const { p, fill } = ps[i];
		const tx = p.texto.trim();
		if (fill === COR_CABECALHO && !rank) rank = tx;
		else if (fill && COR_TIPO[fill]) tipo = (tx as TipoJutsu) || COR_TIPO[fill];
		else if (!custo && rank && tx.length < 60 && p.runs.filter((r) => r.t.trim()).every((r) => r.b && !r.i && r.cor === COR_FAIXA_JUTSU)) custo = tx;
		else break;
		if (rank === 'Habilidade' || (rank && tipo && custo)) {
			i++;
			break;
		}
	}
	const corpo = ps.slice(i).map(({ p }) => p);
	const descricao: Trecho[][] = [];
	const notas: Trecho[][] = [];
	let info: { k: string; v: string }[] = [];
	let efeito: Trecho[] | null = null;
	let pj: string | null = null;
	for (const p of corpo) {
		const tx = p.texto.trim();
		const c = trechos(p.runs);
		if (/^(Alcance|Duração|Área|Ação)\s*:/.test(tx) && tx.includes('·')) info = lerInfo(tx);
		else if (/^Efeito\s*:/.test(tx)) efeito = semRotulo(c, /^\s*Efeito\s*:\s*/);
		else if (/^PJ\s*:/.test(tx)) pj = tx.replace(/^PJ\s*:\s*/, '');
		else if (!info.length && !efeito && p.runs.filter((r) => r.t.trim()).every((r) => r.i)) descricao.push(c.map(({ t, b }) => ({ t, ...(b ? { b } : {}) })));
		else notas.push(c);
	}

	const base = {
		nome,
		traducao,
		origem,
		descricao,
		efeito,
		notas,
		capitulo: ctx.capitulo,
		ancora: ctx.ancora,
		cla: ctx.cla ?? claDaOrigem(origem)
	};
	if (rank === 'Habilidade') {
		const h: Habilidade = { slug: slugUnico(slug(nome)), ...base };
		habilidades.push(h);
		return { tipo: 'habilidade', slug: h.slug };
	}
	const letra = (rank.match(/Rank\s+([EDCBAS])/) || [])[1] as Rank | undefined;
	if (!letra) avisar(`Rank não reconhecido em "${nome}": "${rank}"`);
	if (!tipo) avisar(`Tipo não reconhecido em "${nome}"`);
	const j: Jutsu = {
		slug: slugUnico(slug(nome)),
		...base,
		tipo: tipo ?? 'Ninjutsu',
		rank: letra ?? 'E',
		custo: custo || '—',
		custoNum: +(custo.match(/\d+/)?.[0] ?? 0),
		info,
		pj,
		elemento: elementoDe(origem) ?? elementoDe(nome)
	};
	jutsus.push(j);
	return { tipo: 'jutsu', slug: j.slug };
}

function lerInfo(tx: string) {
	const partes = tx.includes('  ·  ') ? tx.split(/\s{2}·\s{2}/) : tx.split(/\s·\s(?=[A-ZÁÉÍÓÚ][\wçãõéíóúâêô ]{2,20}:)/);
	return partes
		.map((s) => {
			const k = s.indexOf(':');
			return { k: s.slice(0, k).trim(), v: s.slice(k + 1).trim() };
		})
		.filter((x) => x.k && x.v);
}
function elementoDe(texto: string) {
	const n = normalizar(texto);
	for (const [k, v] of Object.entries(ELEMENTOS)) if (new RegExp(`(^|[^a-z])${k}([^a-z]|$)`).test(n)) return v;
	return null;
}
function claDaOrigem(origem: string) {
	const m = normalizar(origem).match(/^cla ([a-z]+)/);
	return m && CLAS.includes(m[1]) ? m[1] : null;
}

function celula(c: { blocos: No[] }): Celula {
	return c.blocos
		.filter((b): b is Paragrafo => b.kind === 'p')
		.map((p) => {
			const t = trechos(p.runs);
			return p.lista ? [{ t: '• ' }, ...t] : t;
		})
		.filter((t) => t.length);
}

/** Converte a sequência de nós do docx em blocos da documentação. */
function converter(nos: No[], ctx: Contexto, ids: Set<string>): Bloco[] {
	const out: Bloco[] = [];
	let lista: { tipo: 'lista'; ordenada: boolean; itens: ItemLista[] } | null = null;
	for (const no of nos) {
		if (no.kind === 'p' && no.lista && no.texto.trim()) {
			const item: ItemLista = { c: trechos(no.runs) };
			if (!lista) {
				lista = { tipo: 'lista', ordenada: no.lista.ordenada, itens: [] };
				out.push(lista);
			}
			const pai = lista.itens[lista.itens.length - 1];
			if (no.lista.nivel > 0 && pai) (pai.sub ??= []).push(item);
			else lista.itens.push(item);
			continue;
		}
		if (no.kind === 'p' && !no.texto.trim()) continue;
		lista = null;
		if (no.kind === 'p') {
			if (ehTitulo(no)) {
				const texto = no.texto.trim().replace(/\s+/g, ' ');
				let id = slug(texto.replace(/^\d+(\.\d+)*\s*/, '')) || 'secao';
				for (let n = 2; ids.has(id); n++) id = `${slug(texto)}-${n}`;
				ids.add(id);
				ctx.ancora = id;
				out.push({ tipo: 'h', nivel: nivelTitulo(no), id, texto });
			} else if (ehFormula(no)) {
				// o 「忍道」 decorativo do fim do livro não é fórmula
				if (/[A-Za-z0-9]/.test(no.texto)) out.push({ tipo: 'formula', texto: no.texto.trim() });
			}
			else out.push({ tipo: 'p', c: trechos(no.runs) });
			continue;
		}
		// tabelas
		if (no.fills.has(COR_FAIXA_JUTSU)) {
			const card = lerCard(no, ctx);
			if (card) out.push(card);
		} else if (fillPrimeira(no) === COR_EPIGRAFE) {
			const textos = paragrafosDaTabela(no).map(({ p }) => p.texto.trim()).filter(Boolean);
			const autor = textos.find((t) => /^[—–-]/.test(t)) ?? '';
			out.push({
				tipo: 'epigrafe',
				texto: textos.filter((t) => t !== autor).join(' ').replace(/^["“]|["”]$/g, ''),
				autor: autor.replace(/^[—–-]\s*/, '')
			});
		} else if (fillPrimeira(no) === COR_DESTAQUE) {
			const nosCelulas = no.linhas.flatMap((l) => l.flatMap((c) => c.blocos));
			const iTitulo = nosCelulas.findIndex((b) => b.kind === 'p' && b.texto.trim());
			const titulo = iTitulo >= 0 ? (nosCelulas[iTitulo] as Paragrafo).texto.trim() : '';
			out.push({ tipo: 'destaque', variante: variante(titulo), titulo, blocos: converter(nosCelulas.slice(iTitulo + 1), { ...ctx }, ids) });
		} else {
			const cabecalho = no.linhas[0]?.every((c) => c.fill === COR_CABECALHO);
			const linhas = (cabecalho ? no.linhas.slice(1) : no.linhas).map((l) => l.map(celula)).filter((l) => l.some((c) => c.length));
			out.push({ tipo: 'tabela', cab: cabecalho ? no.linhas[0].map((c) => textoDe(celula(c).flat())) : null, linhas });
		}
	}
	return out;
}

// ---------------------------------------------------------------- leitura do livro
const { documento, numeracao } = lerDocx(join(RAIZ, 'legado', 'shinobi_no_michi_v18.docx'));
const nos = lerBlocos(documento.slice(documento.indexOf('<w:body>')), lerNumeracao(numeracao));

// separa por capítulo (Heading1)
const brutos: { titulo: string; nos: No[] }[] = [];
for (const no of nos) {
	if (no.kind === 'p' && no.estilo === 'Heading1') brutos.push({ titulo: no.texto.trim(), nos: [] });
	else brutos[brutos.length - 1]?.nos.push(no);
}

// partes, a partir do Sumário
const sumario = brutos.find((b) => /^sum[aá]rio/i.test(b.titulo));
const titulosParte = (sumario?.nos ?? [])
	.filter((n): n is Paragrafo => n.kind === 'p' && /^(Parte [IVX]+ —|Referência e Apêndice)/.test(n.texto.trim()))
	.map((p) => p.texto.trim().replace(/^Parte [IVX]+ — /, ''));
if (titulosParte.length !== 7) avisar(`Esperava 7 partes no sumário, encontrei ${titulosParte.length}`);
const partes: Parte[] = PARTES_CAPITULOS.map((caps, i) => ({
	numero: i + 1,
	rotulo: ROTULO_PARTE[i],
	titulo: titulosParte[i] ?? '',
	icone: ICONE_PARTE[i],
	capitulos: caps
}));
const parteDe = (n: number) => PARTES_CAPITULOS.findIndex((c) => c.includes(n)) + 1;

const capitulos: Capitulo[] = [];
for (const bruto of brutos) {
	const m = bruto.titulo.match(/^(\d+)\.\s*(.+)$/);
	if (!m) continue;
	const numero = +m[1];
	const ctx: Contexto = { capitulo: numero, ancora: '', cla: null };
	const ids = new Set<string>();
	let blocos = converter(bruto.nos, ctx, ids);
	let epigrafe = null;
	if (blocos[0]?.tipo === 'epigrafe') {
		const { texto, autor } = blocos[0];
		epigrafe = { texto, autor };
		blocos = blocos.slice(1);
	}
	capitulos.push({
		numero,
		slug: SLUG_CAPITULO[numero],
		href: hrefCapitulo(numero),
		titulo: m[2].trim(),
		parte: parteDe(numero),
		kanji: kanji(numero),
		epigrafe,
		blocos,
		secoes: [],
		resumo: ''
	});
}
const cap = (n: number) => {
	const c = capitulos.find((x) => x.numero === n);
	if (!c) throw new Error(`Capítulo ${n} não encontrado`);
	return c;
};

/** Blocos de uma seção: do título (exclusive) até o próximo título de nível igual ou maior. */
function secao(blocos: Bloco[], teste: (texto: string) => boolean, nivelMax = 4) {
	const i = blocos.findIndex((b) => b.tipo === 'h' && b.nivel <= nivelMax && teste(b.texto));
	if (i < 0) return { inicio: -1, fim: -1, titulo: null as null | (Bloco & { tipo: 'h' }), blocos: [] as Bloco[] };
	const titulo = blocos[i] as Bloco & { tipo: 'h' };
	let fim = blocos.findIndex((b, k) => k > i && b.tipo === 'h' && b.nivel <= titulo.nivel);
	if (fim < 0) fim = blocos.length;
	return { inicio: i, fim, titulo, blocos: blocos.slice(i + 1, fim) };
}
const tabelaEm = (bs: Bloco[]) => bs.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela');
const celTexto = (c: Celula) => c.map(textoDe).join(' ').trim();

// ---------------------------------------------------------------- clãs (cap. 8.3)
const clas: Cla[] = [];
{
	const c8 = cap(8);
	const reCla = /^8\.3\.\d+\s+Clã\s+/;
	const inicios = c8.blocos.flatMap((b, i) => (b.tipo === 'h' && reCla.test(b.texto) ? [i] : []));
	const fimCatalogo = c8.blocos.findIndex((b, i) => i > inicios[inicios.length - 1] && b.tipo === 'h' && b.nivel <= 3 && !reCla.test(b.texto));
	inicios.forEach((ini, k) => {
		const fim = inicios[k + 1] ?? fimCatalogo;
		const h = c8.blocos[ini] as Bloco & { tipo: 'h' };
		const m = h.texto.match(/^(8\.3\.\d+)\s+Clã\s+(.+?)\s+—\s+(.+?)\s+\((.+)\)\s*$/);
		if (!m) return avisar(`Título de clã não reconhecido: ${h.texto}`);
		const nomeCompleto = m[2].trim();
		const nome = nomeCompleto.split('/')[0].trim();
		const s = slug(nome);
		const corpo = c8.blocos.slice(ini + 1, fim);
		const iSec = corpo.findIndex((b) => b.tipo === 'h');
		const intro = iSec < 0 ? corpo : corpo.slice(0, iSec);
		const epi = intro.find((b) => b.tipo === 'epigrafe');
		const secoes: Cla['secoes'] = [];
		for (const b of iSec < 0 ? [] : corpo.slice(iSec)) {
			if (b.tipo === 'h' && b.nivel === 4) secoes.push({ id: slug(b.texto), titulo: b.texto, blocos: [] });
			else secoes[secoes.length - 1]?.blocos.push(b);
		}
		const sec = (re: RegExp) => secoes.find((x) => re.test(normalizar(x.titulo)))?.blocos ?? [];

		// referências de jutsus/habilidades do clã
		const slugsJ = secoes.flatMap((x) => x.blocos).filter((b) => b.tipo === 'jutsu').map((b) => (b as { slug: string }).slug);
		const slugsH = secoes.flatMap((x) => x.blocos).filter((b) => b.tipo === 'habilidade').map((b) => (b as { slug: string }).slug);
		for (const j of jutsus) if (slugsJ.includes(j.slug)) j.cla = s;
		for (const hb of habilidades) if (slugsH.includes(hb.slug)) hb.cla = s;

		const bonus = sec(/^bonus/)
			.flatMap((b) => (b.tipo === 'lista' ? b.itens.map((it) => textoDe(it.c)) : []))
			.map((t) => {
				const p = t.match(/^(.*?)\s*\((.+)\)\.?$/);
				return p ? { texto: p[1].replace(/\.$/, ''), nota: p[2] } : { texto: t.replace(/\.$/, ''), nota: null };
			});
		const textoKkg = sec(/^kekkei genkai/).find((b) => b.tipo === 'p');
		const semKkg = !textoKkg || /^nenhum/i.test(textoDe((textoKkg as { c: Trecho[] }).c));
		if (semKkg === !!KKG_CLA[s]) avisar(`Kekkei Genkai do clã ${nome} não confere com o mapa`);
		const tabMarcos = tabelaEm(sec(/^marcos/));
		const politica = sec(/^politica/);
		const textoPolitica = politica.filter((b) => b.tipo === 'p').map((b) => textoDe((b as { c: Trecho[] }).c));
		const st = textoPolitica.join(' ').match(/Status:\s*cl[ãa]\s+([^(.—]+?)\s*\((\d+)\s*PIC\)/i);
		const stLivre = textoPolitica.join(' ').match(/Status:\s*([^.]+)\./);
		const tituloKkg = secoes.find((x) => /^kekkei genkai —/.test(normalizar(x.titulo)))?.titulo ?? '';
		const nomeKkg = tituloKkg.replace(/^Kekkei Genkai\s*—\s*/, '').replace(/\s*\(.*\)\s*$/, '');
		const obrig = politica.find((b) => b.tipo === 'p' && /^Obriga/.test(textoDe(b.c))) as { c: Trecho[] } | undefined;
		const vila = VILAS.find(([re]) => re.test(m[4]));
		const notaVila = m[4]
			.replace(vila ? vila[0] : /$^/, '')
			.replace(/^\s*(originário de|originalmente)\s*/i, '')
			.replace(/^[,\s/]+|[,\s/]+$/g, '')
			.trim();
		clas.push({
			slug: s,
			numero: m[1],
			nome,
			epiteto: m[3].trim(),
			vila: vila ? { nome: vila[1], icone: vila[2] || null, nota: notaVila || null } : { nome: m[4], icone: null, nota: null },
			epigrafe: epi && epi.tipo === 'epigrafe' ? { texto: epi.texto, autor: epi.autor } : null,
			descricao: intro.filter((b) => b.tipo !== 'epigrafe'),
			secoes,
			bonus,
			kkg: KKG_CLA[s] ? { nome: nomeKkg || 'Kekkei Genkai', tipo: NOME_TIPO_KKG[KKG_CLA[s]], icone: `kkg/ic-kkg-${KKG_CLA[s]}` } : null,
			marcos: (tabMarcos?.linhas ?? []).map((l) => ({ nivel: +celTexto(l[0]), texto: celTexto(l[1] ?? []) })).filter((x) => x.nivel),
			status: st
				? { rotulo: `Clã ${st[1].trim()}`, pic: +st[2] }
				: stLivre
					? { rotulo: stLivre[1].trim().replace(/^./, (l) => l.toUpperCase()), pic: null }
					: null,
			relacoes: [],
			obrigacao: obrig ? semRotulo(obrig.c, /^\s*Obrigaç(ão|ões)\s*:\s*/) : null,
			jutsus: slugsJ,
			habilidades: slugsH
		});
	});
	// relações entre clãs, extraídas das frases de "Política e Obrigação"
	for (const cl of clas) {
		const textos = (cl.secoes.find((x) => /^politica/.test(normalizar(x.titulo)))?.blocos ?? [])
			.filter((b) => b.tipo === 'p')
			.map((b) => textoDe((b as { c: Trecho[] }).c))
			.filter((t) => !/^Obriga/.test(t));
		const frases = textos.join(' ').split(/(?<=[.;])\s+/);
		const vistas = new Set<string>();
		for (const f of frases) {
			const n = normalizar(f);
			const relacao: Relacao | null = /inimig/.test(n) ? 'Inimigo Declarado' : /rival/.test(n) ? 'Rival' : /aliad|alianca/.test(n) ? 'Aliado' : /neutr/.test(n) ? 'Neutro' : null;
			if (!relacao) continue;
			for (const outro of clas) {
				if (outro.slug === cl.slug || vistas.has(outro.slug)) continue;
				if (new RegExp(`\\b${outro.slug}\\b`).test(n)) {
					cl.relacoes.push({ cla: outro.slug, nome: outro.nome, relacao });
					vistas.add(outro.slug);
				}
			}
		}
	}
	// no capítulo 8, o catálogo vira a grade de clãs (cada clã tem página própria)
	c8.blocos.splice(inicios[0], fimCatalogo - inicios[0], { tipo: 'clas' });
}

// ---------------------------------------------------------------- especializações (cap. 19)
const especializacoes: Especializacoes = { intro: [], quando: null, lista: [], extras: [] };
{
	const c19 = cap(19);
	const iCatalogo = c19.blocos.findIndex((b) => b.tipo === 'h' && b.nivel === 2);
	for (const b of c19.blocos.slice(0, iCatalogo < 0 ? undefined : iCatalogo)) {
		if (b.tipo === 'destaque' && /quando se ganha/i.test(b.titulo)) {
			const texto = b.blocos.map((x) => (x.tipo === 'p' ? textoDe(x.c) : '')).join(' ');
			const niveis = [...new Set([...texto.matchAll(/\b(4|7|10|13|16|19)\b/g)].map((x) => +x[1]))];
			especializacoes.quando = { titulo: b.titulo, blocos: b.blocos, niveis };
		} else especializacoes.intro.push(b);
	}
	let atual: Especializacao | null = null;
	for (const b of c19.blocos.slice(iCatalogo + 1)) {
		if (b.tipo === 'h' && b.nivel === 3 && /^Especialização:/.test(b.texto)) {
			let nome = b.texto.replace(/^Especialização:\s*/, '').trim();
			// "Sennin (pré-requisitos no cap. 15)": o requisito sai do nome
			const req = nome.match(/\s*\((pr[ée]-?requisitos?[^)]*)\)\s*$/i);
			if (req) nome = nome.slice(0, req.index).trim();
			const icone = ICONE_ESPECIALIZACAO.find(([re]) => re.test(nome))?.[1];
			if (!icone) avisar(`Especialização sem ícone: ${nome}`);
			atual = { slug: b.id, nome, icone: `esp/ic-esp-${icone ?? 'elemento'}`, niveis: [], extras: [], requisito: req ? req[1].replace(/^./, (l) => l.toUpperCase()) : null };
			especializacoes.lista.push(atual);
		} else if (b.tipo === 'h' && b.nivel <= 3) {
			atual = null;
			especializacoes.extras.push(b);
		} else if (atual && !atual.niveis.length && b.tipo === 'tabela' && b.cab?.[0] === 'Nível') {
			atual.niveis = b.linhas.map((l) => ({ nivel: +celTexto(l[0]), beneficio: l[1] ?? [] }));
		} else if (atual) {
			atual.extras.push(b);
			const tx = b.tipo === 'p' ? textoDe(b.c) : b.tipo === 'destaque' ? b.titulo + ' ' + b.blocos.map((x) => (x.tipo === 'p' ? textoDe(x.c) : '')).join(' ') : '';
			const req = tx.match(/Pr[ée]-?requisitos?\s*:?\s*([^.]+)/i);
			if (req && !atual.requisito) atual.requisito = req[1].trim();
		} else especializacoes.extras.push(b);
	}
}

// ---------------------------------------------------------------- glossário (cap. 22)
const glossario: SecaoGlossario[] = [];
{
	const c22 = cap(22);
	let atual: SecaoGlossario | null = null;
	for (const b of c22.blocos) {
		if (b.tipo === 'h' && b.nivel === 2) {
			atual = { id: b.id, titulo: b.texto, intro: [], colunas: [], termos: [] };
			glossario.push(atual);
		} else if (atual && b.tipo === 'tabela' && b.cab) {
			atual.colunas = b.cab;
			for (const l of b.linhas) {
				const termo = celTexto(l[0]);
				const n = normalizar(termo);
				let icone: string | null = null;
				if (/^atributos/.test(normalizar(atual.titulo))) icone = iconeSe(`atributo/ic-atributo-${n}`);
				else if (/^recursos/.test(normalizar(atual.titulo))) icone = iconeSe(`recurso/ic-recurso-${n}`);
				else if (/^elementos/.test(normalizar(atual.titulo))) icone = ELEMENTOS[n] ? `elemento/ic-elemento-${ELEMENTOS[n]}` : null;
				else if (/^ranks de jutsu/.test(normalizar(atual.titulo))) icone = iconeSe(`rank/ic-rank-${n}`);
				atual.termos.push({ id: `termo-${slug(termo)}`, termo, campos: l.slice(1).map(celTexto), icone });
			}
		} else if (atual) atual.intro.push(b);
	}
}
// siglas que viram tooltip de glossário no texto corrido (CMP-22)
const termosTooltip = new Map<string, string>();
for (const s of glossario.filter((g) => /^(atributos|recursos)/.test(normalizar(g.titulo))))
	for (const t of s.termos) if (/^[A-Z][A-Za-z]{1,3}$/.test(t.termo) && t.termo === t.termo.toUpperCase()) termosTooltip.set(t.termo, t.id);

// ---------------------------------------------------------------- equipamentos (caps. 11, 12, 13)
const equipamentos: Equipamentos = { categorias: [], espadas: [], propriedades: [], abas: [] };
{
	const c11 = cap(11);
	const c12 = cap(12);
	const c13 = cap(13);
	const ICONE_CATEGORIA: [RegExp, string, string][] = [
		[/dist[âa]ncia/i, 'distancia', 'equip/ic-equip-arma-distancia'],
		[/curtas/i, 'curtas', 'equip/ic-equip-arma-curta'],
		[/longas/i, 'longas', 'equip/ic-equip-arma-longa'],
		[/ex[óo]ticas/i, 'exoticas', 'equip/ic-equip-arma-exotica']
	];
	for (const b of c12.blocos) {
		if (b.tipo !== 'h' || b.nivel !== 3) continue;
		const cat = ICONE_CATEGORIA.find(([re]) => re.test(b.texto));
		const tab = tabelaEm(secao(c12.blocos, (t) => t === b.texto).blocos);
		if (cat && tab) {
			const col = (nome: string) => tab.cab?.findIndex((c) => normalizar(c).startsWith(nome)) ?? -1;
			const [iA, iD, iR, iP, iV, iPr] = ['arma', 'dano', 'alcance', 'peso', 'preco', 'propriedade'].map(col);
			const categoria: CategoriaArmas = {
				id: cat[1],
				titulo: b.texto.replace(/^Armas Brancas — /, '').replace(/^Armas de /, ''),
				icone: cat[2],
				ancora: `${c12.href}#${b.id}`,
				armas: tab.linhas.map((l) => {
					const nome = celTexto(l[iA]);
					const iconeArma = iconeSe(`arma/ic-arma-${slug(nome)}`) ?? iconeSe(`arma/ic-arma-${slug(nome.split(/[\s(/]/)[0])}`);
					return {
						slug: `arma-${slug(nome)}`,
						nome,
						dano: iD >= 0 ? celTexto(l[iD]) : '',
						alcance: iR >= 0 ? celTexto(l[iR]) : '',
						peso: iP >= 0 ? celTexto(l[iP]) : '',
						preco: iV >= 0 ? celTexto(l[iV]) : '',
						propriedades: iPr >= 0 ? celTexto(l[iPr]).split(/\s*[,;]\s*/).filter((x) => x && x !== '—' && x !== '-') : [],
						icone: iconeArma ?? cat[2]
					};
				})
			};
			equipamentos.categorias.push(categoria);
		} else if (/sete espadas/i.test(b.texto) && tab) {
			equipamentos.espadas = tab.linhas.map((l) => {
				const nome = celTexto(l[0]);
				return {
					slug: `espada-${slug(nome)}`,
					nome,
					traducao: celTexto(l[1] ?? []),
					dano: celTexto(l[2] ?? []),
					peso: celTexto(l[3] ?? []),
					habilidade: celTexto(l[4] ?? []),
					icone: iconeSe(`espada/ic-espada-${slug(nome)}`) ?? 'equip/ic-equip-sete-espadas'
				} satisfies Espada;
			});
		}
	}
	const props = tabelaEm(secao(c12.blocos, (t) => /^Propriedades Especiais/.test(t)).blocos);
	equipamentos.propriedades = (props?.linhas ?? []).map((l) => ({ nome: celTexto(l[0]), efeito: celTexto(l[1] ?? []) }));

	const trecho = (c: Capitulo, re: RegExp, titulo?: string) => {
		const s = secao(c.blocos, (t) => re.test(t), 2);
		if (!s.titulo) avisar(`Seção não encontrada no cap. ${c.numero}: ${re}`);
		return { titulo: titulo ?? s.titulo?.texto ?? '', href: `${c.href}#${s.titulo?.id ?? ''}`, blocos: s.blocos };
	};
	const iVenenos = c11.blocos.findIndex((b) => b.tipo === 'h');
	equipamentos.abas = [
		{
			id: 'itens',
			titulo: 'Itens utilitários',
			secoes: [{ titulo: 'Itens utilitários', href: c11.href, blocos: c11.blocos.slice(0, iVenenos) }, trecho(c11, /^Sistema de Carga/)]
		},
		{ id: 'venenos', titulo: 'Venenos', secoes: [trecho(c11, /^Tabela de Venenos/)] },
		{ id: 'pergaminhos', titulo: 'Pergaminhos', secoes: [trecho(c11, /^Sistema de Pergaminhos/)] },
		{ id: 'marionetes', titulo: 'Marionetes', secoes: [trecho(c13, /^Construindo uma Marionete/)] },
		{ id: 'qualidade', titulo: 'Qualidade e propriedades', secoes: [trecho(c12, /^Qualidade das Armas/), trecho(c12, /^Propriedades Especiais/)] }
	];
}

// ---------------------------------------------------------------- referências cruzadas e glossário no texto
function ligar(c: Trecho[], comGlossario: Set<string> | null): Trecho[] {
	const out: Trecho[] = [];
	const reRef = /\b(?:cap(?:ítulo|\.)\s*|Capítulo\s+)(\d{1,2})((?:\.\d+)*)/g;
	for (const t of c) {
		if (t.href || t.termo) {
			out.push(t);
			continue;
		}
		const pedacos: Trecho[] = [];
		let pos = 0;
		const marcas: { ini: number; fim: number; extra: Partial<Trecho> }[] = [];
		for (const m of t.t.matchAll(reRef)) {
			const n = +m[1];
			const c = capitulos.find((x) => x.numero === n);
			if (!c) continue;
			let ancora = '';
			if (m[2]) {
				const h = c.blocos.find((b) => b.tipo === 'h' && b.texto.startsWith(`${n}${m[2]} `)) as { id: string } | undefined;
				const cl = clas.find((x) => x.numero === `${n}${m[2]}`);
				if (cl) {
					marcas.push({ ini: m.index!, fim: m.index! + m[0].length, extra: { href: `/regras/clas/${cl.slug}` } });
					continue;
				}
				if (h) ancora = `#${h.id}`;
			}
			marcas.push({ ini: m.index!, fim: m.index! + m[0].length, extra: { href: c.href + ancora } });
		}
		if (comGlossario) {
			for (const [sigla, id] of termosTooltip) {
				if (comGlossario.has(sigla)) continue;
				const m = new RegExp(`(?<![\\wÀ-ÿ])${sigla}(?![\\wÀ-ÿ])`).exec(t.t);
				if (m && !marcas.some((x) => m.index < x.fim && m.index + sigla.length > x.ini)) {
					marcas.push({ ini: m.index, fim: m.index + sigla.length, extra: { termo: id } });
					comGlossario.add(sigla);
				}
			}
		}
		marcas.sort((a, b) => a.ini - b.ini);
		for (const mk of marcas) {
			if (mk.ini < pos) continue;
			if (mk.ini > pos) pedacos.push({ ...t, t: t.t.slice(pos, mk.ini) });
			pedacos.push({ ...t, t: t.t.slice(mk.ini, mk.fim), ...mk.extra });
			pos = mk.fim;
		}
		if (pos < t.t.length) pedacos.push({ ...t, t: t.t.slice(pos) });
		out.push(...pedacos);
	}
	return out;
}
function ligarBlocos(bs: Bloco[], estado: { vistos: Set<string> }) {
	for (const b of bs) {
		if (b.tipo === 'h' && b.nivel === 2) estado.vistos = new Set();
		if (b.tipo === 'p') b.c = ligar(b.c, estado.vistos);
		else if (b.tipo === 'lista') {
			const andar = (its: ItemLista[]) => its.forEach((it) => ((it.c = ligar(it.c, estado.vistos)), it.sub && andar(it.sub)));
			andar(b.itens);
		} else if (b.tipo === 'destaque') ligarBlocos(b.blocos, estado);
		else if (b.tipo === 'tabela') b.linhas = b.linhas.map((l) => l.map((cel) => cel.map((p) => ligar(p, null))));
	}
}
for (const c of capitulos) if (c.numero !== 22) ligarBlocos(c.blocos, { vistos: new Set() });
for (const cl of clas) {
	ligarBlocos(cl.descricao, { vistos: new Set() });
	for (const s of cl.secoes) ligarBlocos(s.blocos, { vistos: new Set() });
}
for (const e of especializacoes.lista) ligarBlocos(e.extras, { vistos: new Set() });
for (const j of [...jutsus, ...habilidades]) {
	j.efeito = j.efeito && ligar(j.efeito, null);
	j.notas = j.notas.map((n) => ligar(n, null));
}

// ---------------------------------------------------------------- índices de seção e resumos
for (const c of capitulos) {
	c.secoes = c.blocos.filter((b): b is Bloco & { tipo: 'h' } => b.tipo === 'h').map(({ id, texto, nivel }) => ({ id, titulo: texto, nivel }));
	const p = c.blocos.find((b) => b.tipo === 'p') as { c: Trecho[] } | undefined;
	const r = p ? textoDe(p.c) : '';
	c.resumo = r.length > 200 ? r.slice(0, r.lastIndexOf(' ', 197)) + '…' : r;
}

// ---------------------------------------------------------------- referência rápida (D10)
const referencia: CardReferencia[] = [];
{
	const linhasDe = (t: (Bloco & { tipo: 'tabela' }) | undefined, f: (l: string[]) => [string, string]) => (t ? t.linhas.map((l) => f(l.map(celTexto))) : []);
	const tabelaComCab = (c: Capitulo, inicioCab: string) => c.blocos.find((b): b is Bloco & { tipo: 'tabela' } => b.tipo === 'tabela' && normalizar(b.cab?.[0] ?? '').startsWith(normalizar(inicioCab)));
	const add = (id: string, titulo: string, icone: string, c: Capitulo, ancora: string, linhas: [string, string][]) => {
		if (!linhas.length) avisar(`Referência rápida vazia: ${titulo}`);
		referencia.push({ id, titulo, icone, capitulo: { numero: c.numero, href: `${c.href}${ancora ? '#' + ancora : ''}` }, linhas });
	};
	const id = (c: Capitulo, re: RegExp) => (c.blocos.find((b) => b.tipo === 'h' && re.test(b.texto)) as { id: string } | undefined)?.id ?? '';
	const c2 = cap(2), c4 = cap(4), c9 = cap(9), c10 = cap(10), c20 = cap(20);
	add('dt', 'DIFICULDADES (DT)', 'dado/ic-dado-d20', c2, '', linhasDe(tabelaComCab(c2, 'Dificuldade'), (l) => [l[0], l[1]]));
	add('testes', 'TIPOS DE TESTE', 'callout/ic-callout-destaque', c2, id(c2, /^Tipos de Teste/), linhasDe(tabelaComCab(c2, 'Tipo de teste'), (l) => [l[0], l[1]]));
	const acoes = secao(c4.blocos, (t) => /^Ações por Turno/.test(t)).blocos.find((b) => b.tipo === 'lista') as { itens: ItemLista[] } | undefined;
	add('acoes', 'AÇÕES POR TURNO', 'recurso/ic-recurso-iniciativa', c4, id(c4, /^Ações por Turno/), (acoes?.itens ?? []).map((it) => {
		const t = textoDe(it.c);
		const k = t.indexOf(':');
		return [t.slice(0, k).trim(), t.slice(k + 1).trim()] as [string, string];
	}).filter(([k]) => k.length < 40));
	add('ataque', 'ATAQUE E DEFESA', 'recurso/ic-recurso-defesa', c4, id(c4, /^Ataque e Defesa/), linhasDe(tabelaComCab(c4, 'Tipo'), (l) => [l[0], `${l[1]} vs ${l[2]}`]));
	add('vida', 'ESTADOS DE VIDA', 'estado/ic-estado-caido', c4, id(c4, /^Estados de Vida/), linhasDe(tabelaComCab(c4, 'PV atual'), (l) => [l[0], l[1]]));
	add('saves', 'SAVES DE MORTE', 'illustrations/il-memorial', c4, id(c4, /^Saves de Morte/), linhasDe(tabelaComCab(c4, 'Resultado'), (l) => [l[0], l[1]]));
	add('fadiga', 'FADIGA', 'recurso/ic-recurso-fadiga', c4, id(c4, /^Fadiga/), linhasDe(secao(c4.blocos, (t) => t === 'Fadiga').blocos.find((b) => b.tipo === 'tabela') as Bloco & { tipo: 'tabela' }, (l) => [l[0], l[1]]));
	add('estados', 'ESTADOS ESPECIAIS', 'estado/ic-estado-atordoado', c4, id(c4, /^Estados Especiais/), linhasDe(tabelaComCab(c4, 'Estado'), (l) => [l[0], l[1]]));
	add('visibilidade', 'VISIBILIDADE', 'estado/ic-estado-cego', c4, id(c4, /^Categorias de Visibilidade/), linhasDe(tabelaComCab(c4, 'Categoria'), (l) => [l[0], l[1]]));
	const rec = secao(c9.blocos, (t) => /^Recuperação/.test(t), 2);
	add('recuperacao', 'RECUPERAÇÃO', 'item/ic-item-kit-medico', c9, rec.titulo?.id ?? '', linhasDe(tabelaEm(rec.blocos), (l) => [l[0], l.slice(1).join(' · ')]));
	// a DT do jutsu é definida em texto corrido no cap. 2
	const iDt = c2.blocos.findIndex((b) => b.tipo === 'p' && /^DT do Jutsu\./.test(textoDe(b.c)));
	const txDt = iDt >= 0 ? textoDe((c2.blocos[iDt] as { c: Trecho[] }).c) : '';
	const mDt = txDt.match(/a DT é (\d+) \+ bônus de Rank \(([^)]+)\) \+ atributo-chave do lançador: ([^.]+)\./);
	const ancoraDt = [...c2.blocos.slice(0, iDt)].reverse().find((b) => b.tipo === 'h') as { id: string } | undefined;
	add('dt-jutsu', 'DT DO JUTSU', 'rank/ic-rank-c', c2, ancoraDt?.id ?? '', mDt ? [
		['Base', mDt[1]],
		['Bônus de rank', mDt[2]],
		...mDt[3].split(/;\s*/).map((s) => {
			const [attr, ...resto] = s.split(/\s+para\s+/);
			return [resto.join(' para ').replace(/^\s*/, ''), attr.trim()] as [string, string];
		})
	] : []);
	add('pj-rank', 'PJ → RANK', 'rank/ic-rank-b', c20, id(c20, /^Passo 3 — Verificar o Rank/), linhasDe(tabelaComCab(c20, 'Soma de PJ'), (l) => [`${l[0]} PJ`, `Rank ${l[1]} · ${l[2]}`]));
	const c18 = cap(18);
	add('custos-pt', 'CUSTOS DE PT', 'recurso/ic-recurso-pt', c18, id(c18, /^Gastando Pontos de Treino/), linhasDe(tabelaComCab(c18, 'Aplicação'), (l) => [l[0], l[1]]));
	add('elementos', 'VANTAGEM ELEMENTAL', 'elemento/ic-elemento-katon', c10, id(c10, /^Os Cinco Elementos/), linhasDe(tabelaComCab(c10, 'Elemento'), (l) => [l[0], `forte contra ${l[1]} · fraco contra ${l[2]}`]));
}

// ---------------------------------------------------------------- busca
const busca: DocBusca[] = [];
{
	const textoBlocos = (bs: Bloco[]): string =>
		bs
			.map((b) => {
				if (b.tipo === 'p') return textoDe(b.c);
				if (b.tipo === 'lista') return b.itens.map((it) => textoDe(it.c)).join(' ');
				if (b.tipo === 'formula') return b.texto;
				if (b.tipo === 'destaque') return b.titulo + ' ' + textoBlocos(b.blocos);
				if (b.tipo === 'tabela') return [...(b.cab ?? []), ...b.linhas.flat().map(celTexto)].join(' ');
				return '';
			})
			.join(' ')
			.replace(/\s+/g, ' ');
	for (const c of capitulos) {
		if (c.numero === 22) continue;
		const pilha: string[] = [];
		const iconeParte = ICONE_PARTE[c.parte - 1];
		c.blocos.forEach((b, i) => {
			if (b.tipo !== 'h') return;
			pilha.length = b.nivel - 2;
			pilha.push(b.texto);
			let fim = c.blocos.findIndex((x, k) => k > i && x.tipo === 'h');
			if (fim < 0) fim = c.blocos.length;
			busca.push({
				id: `s:${c.numero}:${b.id}`,
				tipo: 'secao',
				titulo: b.texto,
				caminho: `Cap. ${c.numero} · ${c.titulo} › ${pilha.join(' › ')}`,
				texto: textoBlocos(c.blocos.slice(i + 1, fim)).slice(0, 4000),
				href: `${c.href}#${b.id}`,
				icone: iconeParte
			});
		});
		busca.push({ id: `c:${c.numero}`, tipo: 'secao', titulo: c.titulo, caminho: `Cap. ${c.numero} · ${ROTULO_PARTE[c.parte - 1]}`, texto: c.resumo, href: c.href, icone: iconeParte });
	}
	for (const j of jutsus) {
		const icone = j.cla ? `cla/ic-cla-${j.cla}` : j.elemento ? `elemento/ic-elemento-${j.elemento}` : `pericia/ic-pericia-${j.tipo === 'Fuuinjutsu' ? 'selamento' : slug(j.tipo)}`;
		busca.push({ id: `j:${j.slug}`, tipo: 'jutsu', titulo: j.nome, caminho: `${j.tipo} · ${j.origem} · Rank ${j.rank}`, texto: [j.traducao, ...j.descricao.map(textoDe), j.efeito ? textoDe(j.efeito) : ''].filter(Boolean).join(' — '), href: `/regras/jutsus/${j.slug}`, icone, rank: j.rank });
	}
	for (const h of habilidades) {
		const cl = clas.find((c) => c.slug === h.cla);
		busca.push({ id: `h:${h.slug}`, tipo: 'jutsu', titulo: h.nome, caminho: `Habilidade · ${h.origem}`, texto: [h.traducao, ...h.descricao.map(textoDe), h.efeito ? textoDe(h.efeito) : ''].filter(Boolean).join(' — '), href: cl ? `/regras/clas/${cl.slug}#${slug('Jutsus e Habilidades do Clã')}` : `${hrefCapitulo(h.capitulo)}#${h.ancora}`, icone: h.cla ? `cla/ic-cla-${h.cla}` : 'acao/ic-acao-criar-personagem' });
	}
	for (const cl of clas) busca.push({ id: `k:${cl.slug}`, tipo: 'cla', titulo: `Clã ${cl.nome}`, caminho: `Clã · ${cl.epiteto} · ${cl.vila.nome}`, texto: [cl.epigrafe?.texto ?? '', textoBlocos(cl.descricao)].join(' '), href: `/regras/clas/${cl.slug}`, icone: `cla/ic-cla-${cl.slug}` });
	for (const cat of equipamentos.categorias)
		for (const a of cat.armas) busca.push({ id: `a:${a.slug}`, tipo: 'item', titulo: a.nome, caminho: `Arma · ${cat.titulo} · ${a.dano} · ${a.preco}`, texto: a.propriedades.join(' '), href: `/regras/equipamentos?aba=armas&categoria=${cat.id}#${a.slug}`, icone: a.icone });
	for (const e of equipamentos.espadas) busca.push({ id: `e:${e.slug}`, tipo: 'item', titulo: e.nome, caminho: `Sete Espadas da Névoa · ${e.traducao}`, texto: e.habilidade, href: `/regras/equipamentos?aba=armas&categoria=espadas#${e.slug}`, icone: e.icone });
	for (const aba of equipamentos.abas)
		for (const s of aba.secoes)
			for (const b of s.blocos)
				if (b.tipo === 'tabela')
					for (const l of b.linhas) {
						const nome = celTexto(l[0]);
						if (nome) busca.push({ id: `i:${aba.id}:${slug(nome)}`, tipo: 'item', titulo: nome, caminho: `${aba.titulo} · ${l.slice(1, 3).map(celTexto).join(' · ')}`, texto: l.slice(1).map(celTexto).join(' '), href: `/regras/equipamentos?aba=${aba.id}`, icone: 'equip/ic-equip-kit' });
					}
	for (const s of glossario) for (const t of s.termos) busca.push({ id: `g:${t.id}`, tipo: 'termo', titulo: t.termo, caminho: `Glossário · ${s.titulo}`, texto: t.campos.join(' · '), href: `/regras/glossario#${t.id}`, icone: t.icone ?? 'nav/ic-nav-referencia' });
	const ids = new Set<string>();
	for (const d of busca) {
		while (ids.has(d.id)) d.id += "'";
		ids.add(d.id);
	}
}

// ---------------------------------------------------------------- saída
const indice: IndiceLivro = {
	partes,
	capitulos: capitulos.map(({ numero, slug: s, href, titulo, parte, resumo, secoes }) => ({ numero, slug: s, href, titulo, parte, resumo, secoes }))
};
mkdirSync(SAIDA, { recursive: true });
const gravar = (nome: string, dados: unknown) => writeFileSync(join(SAIDA, `${nome}.json`), JSON.stringify(dados));
gravar('indice', indice);
gravar('capitulos', capitulos);
gravar('jutsus', jutsus);
gravar('habilidades', habilidades);
gravar('clas', clas);
gravar('equipamentos', equipamentos);
gravar('especializacoes', especializacoes);
gravar('glossario', glossario);
gravar('referencia', referencia);
gravar('busca', busca);

console.log(`Capítulos: ${capitulos.length} · Jutsus: ${jutsus.length} · Habilidades: ${habilidades.length} · Clãs: ${clas.length}`);
console.log(`Armas: ${equipamentos.categorias.reduce((n, c) => n + c.armas.length, 0)} em ${equipamentos.categorias.length} categorias · Espadas: ${equipamentos.espadas.length} · Propriedades: ${equipamentos.propriedades.length}`);
console.log(`Especializações: ${especializacoes.lista.length} · Glossário: ${glossario.reduce((n, s) => n + s.termos.length, 0)} termos · Referência: ${referencia.length} cards · Busca: ${busca.length} documentos`);
if (avisos.length) {
	console.log(`\n${avisos.length} aviso(s):`);
	for (const a of avisos) console.log(' - ' + a);
}
