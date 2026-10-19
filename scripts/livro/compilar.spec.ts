import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Bloco, Trecho } from '../../src/lib/livro/tipos.ts';
import { compilar, RAIZ } from './compilar.ts';
import { escreverDoc, lerDoc, mdDeTrechos, normalizarTrechos, trechosDeMd } from './md.ts';

/** Trechos com os espaços das pontas fora do negrito/itálico (diferença invisível entre o docx e o Markdown). */
const normalizar = (v: unknown): unknown => {
	if (Array.isArray(v)) {
		if (v.length && v.every((x) => x && typeof x === 'object' && typeof (x as { t?: unknown }).t === 'string' && !('k' in (x as object)))) return normalizarTrechos(v as Trecho[]);
		return v.map(normalizar);
	}
	if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalizar(x)]));
	return v;
};

describe('Markdown das regras', () => {
	it('faz a ida e volta dos blocos', () => {
		const blocos: Bloco[] = [
			{ tipo: 'epigrafe', texto: 'Mantenha a cabeça fria.', autor: 'Shikaku Nara' },
			{ tipo: 'h', nivel: 2, id: 'estados-especiais', texto: 'Estados Especiais' },
			{ tipo: 'p', c: [{ t: 'Efeito:', b: 1 }, { t: ' 4d8 de dano * 2 | 1. item; ' }, { t: 'Kage Mane', i: 1 }, { t: '.' }] },
			{ tipo: 'lista', ordenada: false, itens: [{ c: [{ t: 'um' }], sub: [{ c: [{ t: 'um.a' }] }] }, { c: [{ t: 'dois' }] }] },
			{ tipo: 'lista', ordenada: false, itens: [{ c: [{ t: 'outra lista' }] }] },
			{ tipo: 'formula', texto: '1d20 + [Perícia] ≥ Defesa' },
			{ tipo: 'tabela', cab: ['Estado', 'Efeito'], linhas: [[[[{ t: 'Caído' }]], [[{ t: '-2 em ataques' }], [{ t: 'Levantar', b: 1 }, { t: ' custa a secundária' }]]]] },
			{ tipo: 'tabela', cab: null, linhas: [[[[{ t: 'a' }]], [[{ t: 'b' }]]]] },
			{ tipo: 'destaque', variante: 'dica', titulo: 'Use "isto"', blocos: [{ tipo: 'p', c: [{ t: 'Dentro' }] }] },
			{ tipo: 'jutsu', slug: 'rasengan' },
			{ tipo: 'clas' }
		];
		const md = escreverDoc({ numero: 4 }, blocos);
		const volta = lerDoc(md);
		expect(volta.frente).toEqual({ numero: 4 });
		expect(volta.blocos).toEqual(blocos);
	});

	it('tira os espaços de dentro do negrito', () => {
		const md = mdDeTrechos([{ t: 'Efeito: ', b: 1 }, { t: '4d8' }]);
		expect(md).toBe('**Efeito:** 4d8');
		expect(trechosDeMd(md)).toEqual([{ t: 'Efeito:', b: 1 }, { t: ' 4d8' }]);
	});
});

describe('léxico e marcação no texto', () => {
	const { saida } = compilar();
	const trechos = (v: unknown, out: Trecho[] = []): Trecho[] => {
		if (Array.isArray(v)) v.forEach((x) => trechos(x, out));
		else if (v && typeof v === 'object') {
			if (typeof (v as Trecho).t === 'string') out.push(v as Trecho);
			else Object.values(v).forEach((x) => trechos(x, out));
		}
		return out;
	};
	const cap = (n: number) => saida.capitulos.find((c) => c.numero === n)!;

	it('marca recursos em todas as ocorrências, inclusive no plural', () => {
		const ts = trechos(saida.capitulos);
		expect(ts.some((t) => t.t === 'PCs' && t.termo === 'recurso:pc')).toBe(true);
		expect(ts.filter((t) => t.termo === 'recurso:pc').length).toBeGreaterThan(20);
		expect(ts.every((t) => !t.termo || t.def || t.href)).toBe(true);
	});

	it('não marca "vantagem elemental" como a regra de vantagem', () => {
		const ts = trechos([saida.capitulos, saida.jutsus]);
		const ruins = ts.filter((t, i) => t.termo === 'regra:vantagem' && /^\s+[Ee]lemental/.test(ts[i + 1]?.t ?? ''));
		expect(ruins).toEqual([]);
	});

	it('termos que não são siglas aparecem marcados uma vez por seção', () => {
		let porSecao = new Map<string, number>();
		for (const b of cap(4).blocos) {
			if (b.tipo === 'h' && b.nivel <= 3) porSecao = new Map();
			if (b.tipo !== 'p' && b.tipo !== 'lista') continue;
			for (const t of trechos(b)) if (t.termo && !/^(recurso|atributo):/.test(t.termo)) porSecao.set(t.termo, (porSecao.get(t.termo) ?? 0) + 1);
			for (const n of porSecao.values()) expect(n).toBe(1);
		}
	});

	it('a tabela de condições define cada uma com âncora própria', () => {
		const t = cap(4).blocos.find((b) => b.tipo === 'tabela' && b.titulo === 'Estados Especiais');
		expect(t && t.tipo === 'tabela' && t.ids?.filter(Boolean)).toHaveLength(12);
		expect(saida.termos.find((x) => x.id === 'condicao:atordoado')?.href).toBe('/regras/combate#cond-atordoado');
	});

	it('reconhece dados no texto', () => {
		const dados = new Set(trechos(saida.capitulos).flatMap((t) => (t.dado ? [t.dado] : [])));
		expect(dados.has('1d20')).toBe(true);
		expect([...dados].every((d) => /^\d+d(4|6|8|10|12|20|100)([+-]\d+)?$/.test(d))).toBe(true);
	});
});

describe('compilação de conteudo/', () => {
	it('gera os mesmos dados versionados em src/lib/livro/gerado (rode npm run livro:gerar depois de editar)', () => {
		const { saida, avisos } = compilar();
		expect(avisos).toEqual([]);
		for (const [nome, dados] of Object.entries(saida)) {
			const versionado = JSON.parse(readFileSync(join(RAIZ, 'src', 'lib', 'livro', 'gerado', `${nome}.json`), 'utf8'));
			expect(normalizar(JSON.parse(JSON.stringify(dados))), nome).toEqual(normalizar(versionado));
		}
	}, 60_000);
});
