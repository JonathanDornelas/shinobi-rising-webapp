// USO ÚNICO: exportou o livro do docx v18 para conteudo/ (Markdown + YAML), a nova fonte das regras.
// É o conversor antigo até a extração dos clãs; o resto (especializações, glossário, ligações, busca) agora fica em
// scripts/livro/compilar.ts, que lê conteudo/. Uso: node scripts/livro/legado/exportar-md.ts
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { stringify as yaml } from 'yaml';
import { escreverDoc, mdDeTrechos } from '../md.ts';
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
const brutosCla = new Map<string, { numero: string; nome: string; epiteto: string; origem: string }>();
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
		brutosCla.set(s, { numero: m[1], nome: nomeCompleto, epiteto: m[3].trim(), origem: m[4] });
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

// ---------------------------------------------------------------- exportação para conteudo/
const CONTEUDO = join(RAIZ, 'conteudo');
for (const d of ['regras', 'clas']) mkdirSync(join(CONTEUDO, d), { recursive: true });
const opcoesYaml = { lineWidth: 0 };

writeFileSync(join(CONTEUDO, 'livro.yaml'), '# Partes do livro (o título vem do Sumário do v18) e os capítulos de cada uma.\n' + yaml({ partes }, opcoesYaml));

for (const c of capitulos) {
	const blocos: Bloco[] = c.epigrafe ? [{ tipo: 'epigrafe', ...c.epigrafe }, ...c.blocos] : c.blocos;
	const nome = `${String(c.numero).padStart(2, '0')}-${c.slug}.md`;
	writeFileSync(join(CONTEUDO, 'regras', nome), escreverDoc({ numero: c.numero, slug: c.slug, href: c.href, titulo: c.titulo, parte: c.parte }, blocos));
}

clas.forEach((cl, i) => {
	const b = brutosCla.get(cl.slug)!;
	const blocos: Bloco[] = [
		...(cl.epigrafe ? [{ tipo: 'epigrafe' as const, ...cl.epigrafe }] : []),
		...cl.descricao,
		...cl.secoes.flatMap((x): Bloco[] => [{ tipo: 'h', nivel: 4, id: x.id, texto: x.titulo }, ...x.blocos])
	];
	writeFileSync(join(CONTEUDO, 'clas', `${String(i + 1).padStart(2, '0')}-${cl.slug}.md`), escreverDoc(b, blocos));
});

const textoJ = (j: Jutsu | Habilidade) => ({
	descricao: j.descricao.map(mdDeTrechos),
	efeito: j.efeito ? mdDeTrechos(j.efeito) : null,
	notas: j.notas.map(mdDeTrechos)
});
writeFileSync(
	join(CONTEUDO, 'jutsus.yaml'),
	'# Jutsus do livro, na ordem em que aparecem. descricao/efeito/notas são Markdown de uma linha.\n' +
		yaml(
			jutsus.map((j) => ({ slug: j.slug, nome: j.nome, traducao: j.traducao, origem: j.origem, tipo: j.tipo, rank: j.rank, custo: j.custo, info: j.info, ...textoJ(j), pj: j.pj, capitulo: j.capitulo, ancora: j.ancora, cla: j.cla, elemento: j.elemento })),
			opcoesYaml
		)
);
writeFileSync(
	join(CONTEUDO, 'habilidades.yaml'),
	'# Habilidades do livro (cards sem rank nem custo). descricao/efeito/notas são Markdown de uma linha.\n' +
		yaml(
			habilidades.map((h) => ({ slug: h.slug, nome: h.nome, traducao: h.traducao, origem: h.origem, ...textoJ(h), capitulo: h.capitulo, ancora: h.ancora, cla: h.cla })),
			opcoesYaml
		)
);
console.log(`Exportados: ${capitulos.length} capítulos, ${clas.length} clãs, ${jutsus.length} jutsus, ${habilidades.length} habilidades`);
if (avisos.length) for (const a of avisos) console.log(' - ' + a);
