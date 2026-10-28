import { describe, expect, it } from 'vitest';
import { caminhoNevoa, celulasEntre, emRuns, grade, indice, limpar, pintar, retangulos, tudo, type Run } from './nevoa.ts';

describe('névoa', () => {
	const runs: Run[] = [[1, 2, 5], [2, 2, 5], [3, 2, 5], [3, 8, 9]];

	it('as runs viram grade e voltam iguais', () => {
		const g = grade(runs, 12, 6);
		expect(g.reduce((a, b) => a + b, 0)).toBe(4 + 4 + 4 + 2);
		expect(emRuns(g, 12, 6)).toEqual(runs);
	});

	it('o pincel revela e cobre, e conta se algo mudou', () => {
		const g = new Uint8Array(10 * 10);
		expect(pintar(g, 10, 10, 5, 5, 3, true)).toBe(true);
		expect(emRuns(g, 10, 10)).toEqual([[4, 4, 6], [5, 4, 6], [6, 4, 6]]);
		expect(pintar(g, 10, 10, 5, 5, 3, true)).toBe(false);
		expect(pintar(g, 10, 10, 5, 5, 1, false)).toBe(true);
		expect(g[5 * 10 + 5]).toBe(0);
		// na borda o pincel não passa da cena
		expect(pintar(g, 10, 10, 0, 0, 5, true)).toBe(true);
		expect(emRuns(g, 10, 10)[0]).toEqual([0, 0, 2]);
	});

	it('linhas vizinhas iguais viram um retângulo só', () => {
		expect(retangulos(runs)).toEqual([[2, 1, 4, 3], [8, 3, 2, 1]]);
		expect(retangulos([[0, 0, 3], [2, 0, 3]])).toEqual([[0, 0, 4, 1], [0, 2, 4, 1]]);
	});

	it('o caminho cobre a cena inteira e fura o revelado', () => {
		expect(caminhoNevoa(runs, 12, 6)).toBe('M0 0H12V6H0ZM2 1h4v3h-4ZM8 3h2v1h-2Z');
		expect(caminhoNevoa([], 12, 6)).toBe('M0 0H12V6H0Z');
		expect(tudo(3, 2, true)).toEqual([[0, 0, 2], [1, 0, 2]]);
		expect(tudo(3, 2, false)).toEqual([]);
	});

	it('consulta um quadrado e limpa runs fora do formato', () => {
		const revelado = indice(runs);
		expect(revelado(3, 1)).toBe(true);
		expect(revelado(3.9, 1.2)).toBe(true);
		expect(revelado(6, 1)).toBe(false);
		expect(revelado(8, 3)).toBe(true);
		expect(limpar([[1, 2, 5], 'x', [1, 2], [99, 0, 1], [2, 5, 1], [2, -3, 40.5], [3, -3, 99]], 12, 6)).toEqual([[1, 2, 5], [3, 0, 11]]);
		expect(limpar({ a: 1 }, 12, 6)).toEqual([]);
	});

	it('a reta entre dois quadrados não deixa buracos', () => {
		expect(celulasEntre(0, 0, 3, 0)).toEqual([[0, 0], [1, 0], [2, 0], [3, 0]]);
		expect(celulasEntre(2, 2, 2, 2)).toEqual([[2, 2]]);
		const d = celulasEntre(0, 0, 4, 2);
		expect(d[0]).toEqual([0, 0]);
		expect(d.at(-1)).toEqual([4, 2]);
		for (let i = 1; i < d.length; i++) expect(Math.max(Math.abs(d[i][0] - d[i - 1][0]), Math.abs(d[i][1] - d[i - 1][1]))).toBe(1);
		expect(celulasEntre(3, 0, 0, 0)).toHaveLength(4);
	});
});
