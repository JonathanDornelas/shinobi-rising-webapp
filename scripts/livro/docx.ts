// Leitura de baixo nível do .docx: parágrafos, trechos formatados, listas e tabelas aninhadas.
// O livro não tem imagens; tudo o que importa está em word/document.xml e word/numbering.xml.
import { readFileSync } from 'node:fs';
import { unzipSync, strFromU8 } from 'fflate';

export interface Run {
	t: string;
	b: boolean;
	i: boolean;
	cor: string | null;
}

export interface Paragrafo {
	kind: 'p';
	estilo: string | null;
	alinhamento: string | null;
	lista: { numId: string; nivel: number; ordenada: boolean } | null;
	runs: Run[];
	texto: string;
}

export interface Celula {
	fill: string | null;
	span: number;
	blocos: No[];
}

export interface Tabela {
	kind: 'tbl';
	linhas: Celula[][];
	/** Todas as cores de fundo usadas na tabela, inclusive nas aninhadas. */
	fills: Set<string>;
}

export type No = Paragrafo | Tabela;

export function lerDocx(caminho: string) {
	const zip = unzipSync(readFileSync(caminho));
	const arquivo = (nome: string) => (zip[nome] ? strFromU8(zip[nome]) : '');
	return { documento: arquivo('word/document.xml'), numeracao: arquivo('word/numbering.xml') };
}

const ENTIDADES: Record<string, string> = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'" };
function decodificar(s: string) {
	return s
		.replace(/&(quot|amp|lt|gt|apos);/g, (_, e) => ENTIDADES[e])
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
		.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

/** Mapa numId → (nível → ordenada?) a partir de numbering.xml. */
export function lerNumeracao(xml: string) {
	const abstratos = new Map<string, Map<number, boolean>>();
	for (const m of xml.matchAll(/<w:abstractNum [^>]*w:abstractNumId="(\d+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g)) {
		const niveis = new Map<number, boolean>();
		for (const l of m[2].matchAll(/<w:lvl [^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g)) {
			const fmt = (l[2].match(/<w:numFmt w:val="([^"]+)"/) || [])[1] || 'bullet';
			niveis.set(+l[1], fmt !== 'bullet' && fmt !== 'none');
		}
		abstratos.set(m[1], niveis);
	}
	const nums = new Map<string, Map<number, boolean>>();
	for (const m of xml.matchAll(/<w:num w:numId="(\d+)"[^>]*>[\s\S]*?<w:abstractNumId w:val="(\d+)"/g)) {
		nums.set(m[1], abstratos.get(m[2]) || new Map());
	}
	return nums;
}

/** Divide um trecho de XML nos elementos de topo `tag` (ignorando os que estão dentro de tabelas aninhadas). */
function filhosDeTopo(xml: string, tag: 'w:tr' | 'w:tc'): string[] {
	const out: string[] = [];
	const re = new RegExp(`<${tag}[ >]|</${tag}>|<w:tbl>|</w:tbl>`, 'g');
	let m: RegExpExecArray | null;
	let tabelas = 0;
	let inicio = -1;
	while ((m = re.exec(xml))) {
		if (m[0] === '<w:tbl>') tabelas++;
		else if (m[0] === '</w:tbl>') tabelas--;
		else if (tabelas === 0) {
			if (m[0].startsWith('</')) {
				out.push(xml.slice(inicio, m.index + m[0].length));
				inicio = -1;
			} else inicio = m.index;
		}
	}
	return out;
}

function lerRuns(xml: string): Run[] {
	const runs: Run[] = [];
	for (const m of xml.matchAll(/<w:r(?: [^>]*)?>([\s\S]*?)<\/w:r>/g)) {
		const r = m[1];
		const pr = (r.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/) || [])[1] || '';
		const ligado = (tag: string) => new RegExp(`<w:${tag}(?: w:val="(?:1|true|on)")?/>`).test(pr);
		let t = '';
		for (const p of r.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>|<w:tab\/>|<w:br\/>/g)) {
			if (p[0] === '<w:tab/>') t += ' ';
			else if (p[0] === '<w:br/>') t += '\n';
			else t += decodificar(p[1]);
		}
		if (!t) continue;
		runs.push({ t, b: ligado('b'), i: ligado('i'), cor: (pr.match(/<w:color w:val="([^"]+)"/) || [])[1]?.toLowerCase() ?? null });
	}
	return runs;
}

function lerParagrafo(xml: string, numeracao: Map<string, Map<number, boolean>>): Paragrafo {
	const pr = (xml.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [])[1] || '';
	const numId = (pr.match(/<w:numId w:val="(\d+)"/) || [])[1];
	const nivel = +((pr.match(/<w:ilvl w:val="(\d+)"/) || [])[1] || 0);
	const runs = lerRuns(xml.replace(/<w:pPr>[\s\S]*?<\/w:pPr>/, ''));
	return {
		kind: 'p',
		estilo: (pr.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] ?? null,
		alinhamento: (pr.match(/<w:jc w:val="([^"]+)"/) || [])[1] ?? null,
		lista: numId && numId !== '0' ? { numId, nivel, ordenada: numeracao.get(numId)?.get(nivel) ?? false } : null,
		runs,
		texto: runs.map((r) => r.t).join('')
	};
}

function lerTabela(xml: string, numeracao: Map<string, Map<number, boolean>>): Tabela {
	const interno = xml.slice('<w:tbl>'.length, -'</w:tbl>'.length);
	const linhas = filhosDeTopo(interno, 'w:tr').map((tr) =>
		filhosDeTopo(tr, 'w:tc').map((tc) => {
			const pr = (tc.match(/^<w:tc>\s*<w:tcPr>([\s\S]*?)<\/w:tcPr>/) || [])[1] || '';
			const conteudo = tc.replace(/^<w:tc>\s*(<w:tcPr>[\s\S]*?<\/w:tcPr>)?/, '').replace(/<\/w:tc>$/, '');
			return {
				fill: (pr.match(/w:fill="([^"]+)"/) || [])[1]?.toLowerCase() ?? null,
				span: +((pr.match(/<w:gridSpan w:val="(\d+)"/) || [])[1] || 1),
				blocos: lerBlocos(conteudo, numeracao)
			};
		})
	);
	const fills = new Set([...xml.matchAll(/w:fill="([^"]+)"/g)].map((m) => m[1].toLowerCase()));
	return { kind: 'tbl', linhas, fills };
}

/** Lê os parágrafos e tabelas de topo de um trecho do documento, na ordem. */
export function lerBlocos(xml: string, numeracao: Map<string, Map<number, boolean>>): No[] {
	const out: No[] = [];
	let pos = 0;
	const reP = /<w:p[ >]/g;
	while (true) {
		reP.lastIndex = pos;
		const mp = reP.exec(xml);
		const t = xml.indexOf('<w:tbl>', pos);
		const p = mp ? mp.index : -1;
		if (p < 0 && t < 0) break;
		if (t >= 0 && (p < 0 || t < p)) {
			const re = /<w:tbl>|<\/w:tbl>/g;
			re.lastIndex = t;
			let profundidade = 0;
			let fim = xml.length;
			let m: RegExpExecArray | null;
			while ((m = re.exec(xml))) {
				if (m[0] === '<w:tbl>') profundidade++;
				else if (--profundidade === 0) {
					fim = m.index + '</w:tbl>'.length;
					break;
				}
			}
			out.push(lerTabela(xml.slice(t, fim), numeracao));
			pos = fim;
		} else {
			const autoFechado = xml.slice(p, xml.indexOf('>', p) + 1).endsWith('/>');
			const fim = autoFechado ? xml.indexOf('>', p) + 1 : xml.indexOf('</w:p>', p) + '</w:p>'.length;
			if (!autoFechado) out.push(lerParagrafo(xml.slice(p, fim), numeracao));
			pos = fim;
		}
	}
	return out;
}

/** Todos os parágrafos de uma tabela (inclusive aninhadas), com a cor de fundo da célula mais próxima. */
export function paragrafosDaTabela(tabela: Tabela, fillHerdado: string | null = null): { p: Paragrafo; fill: string | null }[] {
	const out: { p: Paragrafo; fill: string | null }[] = [];
	for (const linha of tabela.linhas)
		for (const celula of linha) {
			const fill = celula.fill ?? fillHerdado;
			for (const b of celula.blocos) {
				if (b.kind === 'p') out.push({ p: b, fill });
				else out.push(...paragrafosDaTabela(b, fill));
			}
		}
	return out;
}
