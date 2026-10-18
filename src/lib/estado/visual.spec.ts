import { describe, expect, it } from 'vitest';
import { contraste, normalizarVisual, variaveis } from './visual.ts';

describe('tema do usuário', () => {
	it('descarta valores inválidos', () => {
		expect(normalizarVisual({ acento: '#3F8F4F', fundo: 'red', escala: 300, raio: 4, x: 1 })).toEqual({ acento: '#3f8f4f', raio: 4 });
		expect(normalizarVisual(null)).toEqual({});
	});

	it('gera só as variáveis escolhidas', () => {
		expect(variaveis({})).toEqual({});
		const v = variaveis({ acento: '#3f8f4f', raio: 4, escala: 110 });
		expect(v['--vermelhao']).toBe('#3f8f4f');
		expect(v['--vermelhao-lo']).toContain('color-mix');
		expect(v['--raio']).toBe('4px');
		expect(v['--escala']).toBe('1.1');
		expect(v['--b1']).toBeUndefined();
	});

	it('mede o contraste como o WCAG', () => {
		expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 0);
		expect(contraste('#efe3d3', '#16110f')).toBeGreaterThan(12);
		expect(contraste('#777777', '#888888')).toBeLessThan(1.5);
	});
});
