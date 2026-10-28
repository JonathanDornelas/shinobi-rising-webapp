import { describe, expect, it } from 'vitest';
import { alcas, caixa, contraste, dentro, limitar, medidaTexto, objetoEm, tamanhoInicial } from './objetos.ts';

const img = { tipo: 'imagem' as const, x: 10, y: 10, largura: 6, altura: 2, texto: null, tamanho: null, rotacao: 0 };

describe('objetos da cena', () => {
	it('a caixa da imagem é a do tamanho, e girar leva o clique junto', () => {
		expect(caixa(img)).toEqual({ cx: 10, cy: 10, hw: 3, hh: 1 });
		expect(dentro(img, 12.5, 10.5)).toBe(true);
		expect(dentro(img, 10, 11.5)).toBe(false);
		// girada 90°, a imagem comprida fica em pé
		const girada = { ...img, rotacao: 90 };
		expect(dentro(girada, 10, 12.5)).toBe(true);
		expect(dentro(girada, 12.5, 10)).toBe(false);
	});

	it('o alfinete se pega pela cabeça, acima da ponta', () => {
		const a = { tipo: 'alfinete' as const, x: 5, y: 5, largura: null, altura: null, texto: null, tamanho: null };
		expect(dentro(a, 5, 4.5)).toBe(true);
		expect(dentro(a, 5, 5.4)).toBe(false);
		expect(dentro(a, 5, 3.8)).toBe(true);
		expect(dentro(a, 5, 3.6)).toBe(false);
	});

	it('o texto cresce com o tamanho e com as linhas', () => {
		const um = medidaTexto({ texto: 'Ponte', tamanho: 1 });
		const dois = medidaTexto({ texto: 'Ponte\nquebrada', tamanho: 1 });
		expect(dois.w).toBeGreaterThan(um.w);
		expect(dois.h).toBeGreaterThan(um.h);
		expect(medidaTexto({ texto: 'Ponte', tamanho: 2 }).w).toBeCloseTo(um.w * 2);
	});

	it('o objeto mais acima ganha o clique, e o mais novo desempata', () => {
		const a = { ...img, id: 'a', ordem: 0, criado_em: '2026-11-06T10:00:00Z' };
		const b = { ...img, id: 'b', ordem: 0, criado_em: '2026-11-06T11:00:00Z' };
		const c = { ...img, id: 'c', ordem: 5, criado_em: '2026-11-06T09:00:00Z' };
		expect(objetoEm([a, b], 10, 10)?.id).toBe('b');
		expect(objetoEm([a, b, c], 10, 10)?.id).toBe('c');
		expect(objetoEm([a], 40, 40)).toBeNull();
	});

	it('limites, tamanho inicial e alças', () => {
		expect(limitar(-10, 40)).toBe(-2);
		expect(limitar(100, 40)).toBe(42);
		expect(tamanhoInicial(2048, 1024, 8)).toEqual({ largura: 8, altura: 4 });
		expect(tamanhoInicial(1, 1000, 8)).toEqual({ largura: 0.25, altura: 8 });
		const al = alcas(img);
		expect(al.canto).toEqual({ x: 13, y: 11 });
		expect(al.girar.y).toBeCloseTo(8.1);
		const g = alcas({ ...img, rotacao: 90 });
		expect(g.canto.x).toBeCloseTo(9);
		expect(g.canto.y).toBeCloseTo(13);
	});

	it('o contorno do texto contrasta com a cor', () => {
		expect(contraste('#ffffff')).toBe('#1b1210');
		expect(contraste('#1b1210')).toBe('#f4e4d6');
		expect(contraste('#c44536')).toBe('#f4e4d6');
		expect(contraste(null)).toBe('#1b1210');
	});
});
