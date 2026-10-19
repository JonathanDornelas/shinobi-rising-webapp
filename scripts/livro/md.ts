// Markdown das regras ↔ blocos da documentação (src/lib/livro/tipos.ts).
// O texto do livro mora em conteudo/ como Markdown + GFM com diretivas:
//   :::dica{titulo="…"} … :::        caixas (destaque, exemplo, atencao, dica, requisito)
//   :::epigrafe{autor="…"} … :::     epígrafe
//   ::formula[1d20 + atributo]       fórmula em destaque
//   ::jutsu{slug="…"} / ::habilidade{slug="…"} / ::clas   cartas do catálogo
//   :::tabela{titulo="…" cabecalho="nao"} | … | :::  título da tabela; sem cabeçalho, a 1ª linha é de dados
//   :t[Kage Mane]{#jutsu:kage-mane-no-jutsu}   força um termo do léxico (conteudo/termos.yaml) no texto
//   :sem[PC]                         impede que o trecho vire termo
//   ## Título {#id}                  título com âncora fixa
// Células com mais de um parágrafo separam os parágrafos com <br>.
import type { Heading, List, ListItem, Paragraph, PhrasingContent, Root, RootContent, Table, TableCell, TableRow } from 'mdast';
import { unified } from 'unified';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { parse as lerYaml, stringify as escreverYaml } from 'yaml';
import type { Bloco, Celula, ItemLista, Trecho, VarianteDestaque } from '../../src/lib/livro/tipos.ts';

const VARIANTES: VarianteDestaque[] = ['destaque', 'exemplo', 'atencao', 'dica', 'requisito'];

export const processador = () =>
	unified()
		.use(remarkParse)
		.use(remarkGfm, { tablePipeAlign: false })
		.use(remarkDirective)
		.use(remarkFrontmatter, ['yaml'])
		.use(remarkStringify, { bullet: '-', bulletOther: '*', emphasis: '*', strong: '*', rule: '-', listItemIndent: 'one' });

// ---------------------------------------------------------------- trechos (inline)

/** Junta trechos vizinhos com a mesma formatação e tira os vazios. */
export function juntar(ts: Trecho[]): Trecho[] {
	const out: Trecho[] = [];
	for (const t of ts) {
		if (!t.t) continue;
		const u = out[out.length - 1];
		if (u && !!u.b === !!t.b && !!u.i === !!t.i && !u.href && !t.href && !u.termo && !t.termo) u.t += t.t;
		else out.push({ ...t });
	}
	return out;
}

/** Espaços nas pontas de um trecho em negrito/itálico vão para fora dele (Markdown não aceita "** x**"). */
export function normalizarTrechos(ts: Trecho[]): Trecho[] {
	const out: Trecho[] = [];
	for (const t of ts) {
		if (!t.b && !t.i) {
			out.push({ ...t });
			continue;
		}
		const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(t.t)!;
		if (m[1]) out.push({ t: m[1] });
		if (m[2]) out.push({ ...t, t: m[2] });
		if (m[3]) out.push({ t: m[3] });
	}
	return juntar(out);
}

export function trechosParaMdast(ts: Trecho[]): PhrasingContent[] {
	return normalizarTrechos(ts).map((t): PhrasingContent => {
		let n: PhrasingContent = { type: 'text', value: t.t };
		if (t.i) n = { type: 'emphasis', children: [n] };
		if (t.b) n = { type: 'strong', children: [n] };
		return n;
	});
}

export function trechosDeMdast(ns: PhrasingContent[], fmt: { b?: 1; i?: 1 } = {}): Trecho[] {
	const out: Trecho[] = [];
	for (const n of ns) {
		if (n.type === 'text') out.push({ t: n.value, ...fmt });
		else if (n.type === 'strong') out.push(...trechosDeMdast(n.children, { ...fmt, b: 1 }));
		else if (n.type === 'emphasis') out.push(...trechosDeMdast(n.children, { ...fmt, i: 1 }));
		else if (n.type === 'inlineCode') out.push({ t: n.value, ...fmt });
		else if (n.type === 'break') out.push({ t: ' ', ...fmt });
		else if (n.type === 'link') out.push(...trechosDeMdast(n.children, fmt).map((t) => ({ ...t, href: n.url })));
		// :t[…]{#id} marca o termo à mão; :sem[…] protege o trecho (termo "-", tirado depois da marcação automática)
		else if (n.type === 'textDirective' && (n.name === 't' || n.name === 'sem'))
			out.push(...trechosDeMdast(n.children, fmt).map((t) => ({ ...t, termo: n.name === 'sem' ? '-' : (n.attributes?.id ?? '-') })));
		else if (n.type === 'textDirective') throw new Error(`Diretiva desconhecida no texto: :${n.name}`);
		else if ('children' in n) out.push(...trechosDeMdast(n.children as PhrasingContent[], fmt));
		else if ('value' in n) out.push({ t: String(n.value), ...fmt });
	}
	return juntar(out);
}

const texto = (ns: PhrasingContent[]) => trechosDeMdast(ns).map((t) => t.t).join('');

// ---------------------------------------------------------------- blocos → mdast

function itensParaMdast(itens: ItemLista[], ordenada: boolean): List {
	return {
		type: 'list',
		ordered: ordenada,
		spread: false,
		children: itens.map(
			(it): ListItem => ({
				type: 'listItem',
				spread: false,
				children: [{ type: 'paragraph', children: trechosParaMdast(it.c) }, ...(it.sub?.length ? [itensParaMdast(it.sub, false)] : [])]
			})
		)
	};
}

function celulaParaMdast(c: Celula): TableCell {
	const filhos: PhrasingContent[] = [];
	c.forEach((p, i) => {
		if (i) filhos.push({ type: 'html', value: '<br>' });
		filhos.push(...trechosParaMdast(p));
	});
	return { type: 'tableCell', children: filhos };
}

export function blocosParaMdast(blocos: Bloco[]): RootContent[] {
	return blocos.map((b): RootContent => {
		switch (b.tipo) {
			case 'p':
				return { type: 'paragraph', children: trechosParaMdast(b.c) };
			case 'h':
				return { type: 'heading', depth: b.nivel, children: [{ type: 'text', value: `${b.texto} {#${b.id}}` }] };
			case 'lista':
				return itensParaMdast(b.itens, b.ordenada);
			case 'formula':
				return { type: 'leafDirective', name: 'formula', attributes: {}, children: [{ type: 'text', value: b.texto }] };
			case 'epigrafe':
				return { type: 'containerDirective', name: 'epigrafe', attributes: { autor: b.autor }, children: [{ type: 'paragraph', children: [{ type: 'text', value: b.texto }] }] };
			case 'destaque':
				return { type: 'containerDirective', name: b.variante, attributes: { titulo: b.titulo }, children: blocosParaMdast(b.blocos) as never };
			case 'tabela': {
				const linhas: TableRow[] = b.linhas.map((l) => ({ type: 'tableRow', children: l.map(celulaParaMdast) }));
				const cab: TableRow | null = b.cab ? { type: 'tableRow', children: b.cab.map((h) => ({ type: 'tableCell', children: h ? [{ type: 'text', value: h }] : [] })) } : null;
				const tabela: Table = { type: 'table', align: [], children: cab ? [cab, ...linhas] : linhas };
				if (cab && !b.titulo) return tabela;
				return { type: 'containerDirective', name: 'tabela', attributes: { ...(b.titulo ? { titulo: b.titulo } : {}), ...(cab ? {} : { cabecalho: 'nao' }) }, children: [tabela] };
			}
			case 'jutsu':
			case 'habilidade':
				return { type: 'leafDirective', name: b.tipo, attributes: { slug: b.slug }, children: [] };
			case 'clas':
				return { type: 'leafDirective', name: 'clas', attributes: {}, children: [] };
		}
	});
}

// ---------------------------------------------------------------- mdast → blocos

function itensDeMdast(l: List): ItemLista[] {
	return l.children.map((li) => {
		const p = li.children.find((x): x is Paragraph => x.type === 'paragraph');
		const sub = li.children.find((x): x is List => x.type === 'list');
		const it: ItemLista = { c: p ? trechosDeMdast(p.children) : [] };
		if (sub) it.sub = itensDeMdast(sub);
		return it;
	});
}

function celulaDeMdast(c: TableCell): Celula {
	const ps: PhrasingContent[][] = [[]];
	for (const n of c.children) {
		if (n.type === 'html' && /^<br\s*\/?>$/i.test(n.value)) ps.push([]);
		else ps[ps.length - 1].push(n);
	}
	return ps.map((p) => trechosDeMdast(p)).filter((p) => p.length);
}

function tabelaDeMdast(t: Table, comCabecalho: boolean, titulo?: string): Bloco {
	const [primeira, ...resto] = t.children;
	const linhas = (comCabecalho ? resto : t.children).map((l) => l.children.map(celulaDeMdast));
	const b: Bloco = { tipo: 'tabela', cab: comCabecalho ? primeira.children.map((c) => texto(c.children)) : null, linhas };
	if (titulo) b.titulo = titulo;
	return b;
}

export function blocosDeMdast(ns: RootContent[]): Bloco[] {
	const out: Bloco[] = [];
	for (const n of ns) {
		if (n.type === 'paragraph') out.push({ tipo: 'p', c: trechosDeMdast(n.children) });
		else if (n.type === 'heading') {
			const bruto = texto((n as Heading).children);
			const m = /^(.*?)\s*\{#([^}]+)\}\s*$/.exec(bruto);
			if (!m) throw new Error(`Título sem {#id}: "${bruto}"`);
			out.push({ tipo: 'h', nivel: n.depth as 2 | 3 | 4, id: m[2], texto: m[1] });
		} else if (n.type === 'list') out.push({ tipo: 'lista', ordenada: !!n.ordered, itens: itensDeMdast(n) });
		else if (n.type === 'table') out.push(tabelaDeMdast(n, true));
		else if (n.type === 'leafDirective') {
			if (n.name === 'formula') out.push({ tipo: 'formula', texto: texto(n.children) });
			else if (n.name === 'jutsu' || n.name === 'habilidade') out.push({ tipo: n.name, slug: n.attributes?.slug ?? '' });
			else if (n.name === 'clas') out.push({ tipo: 'clas' });
			else throw new Error(`Diretiva desconhecida: ::${n.name}`);
		} else if (n.type === 'containerDirective') {
			if (n.name === 'epigrafe') {
				const t = n.children.filter((x): x is Paragraph => x.type === 'paragraph').map((p) => texto(p.children)).join(' ');
				out.push({ tipo: 'epigrafe', texto: t, autor: n.attributes?.autor ?? '' });
			} else if (n.name === 'tabela') {
				const t = n.children.find((x): x is Table => x.type === 'table');
				if (!t) throw new Error(':::tabela sem tabela dentro');
				out.push(tabelaDeMdast(t, n.attributes?.cabecalho !== 'nao', n.attributes?.titulo ?? undefined));
			} else if ((VARIANTES as string[]).includes(n.name)) {
				out.push({ tipo: 'destaque', variante: n.name as VarianteDestaque, titulo: n.attributes?.titulo ?? '', blocos: blocosDeMdast(n.children as RootContent[]) });
			} else throw new Error(`Diretiva desconhecida: :::${n.name}`);
		} else if (n.type === 'yaml' || n.type === 'html' || n.type === 'thematicBreak') continue;
		else throw new Error(`Nó de Markdown não suportado: ${n.type}`);
	}
	return out;
}

// ---------------------------------------------------------------- arquivos

/** Documento Markdown com frontmatter YAML. */
export function escreverDoc(frente: Record<string, unknown>, blocos: Bloco[]): string {
	const raiz: Root = { type: 'root', children: [{ type: 'yaml', value: escreverYaml(frente).trimEnd() }, ...blocosParaMdast(blocos)] };
	return processador().stringify(raiz);
}

export function lerDoc<T = Record<string, unknown>>(md: string): { frente: T; blocos: Bloco[] } {
	const p = processador();
	const raiz = p.runSync(p.parse(md)) as Root;
	const y = raiz.children.find((n) => n.type === 'yaml');
	return { frente: (y ? lerYaml(y.value) : {}) as T, blocos: blocosDeMdast(raiz.children) };
}

/** Trechos ↔ Markdown de uma linha (campos de texto dos catálogos em YAML). */
export function mdDeTrechos(ts: Trecho[]): string {
	const raiz: Root = { type: 'root', children: [{ type: 'paragraph', children: trechosParaMdast(ts) }] };
	return processador().stringify(raiz).trim();
}

export function trechosDeMd(md: string): Trecho[] {
	const p = processador();
	const raiz = p.runSync(p.parse(md)) as Root;
	const par = raiz.children.find((n): n is Paragraph => n.type === 'paragraph');
	return par ? trechosDeMdast(par.children) : [];
}

export { escreverYaml, lerYaml };
