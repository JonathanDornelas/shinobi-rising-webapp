import { describe, expect, it } from 'vitest';
import { deslocarQuadrados, deslocarRuns, deslocarToken } from './reenquadrar.ts';

describe('reenquadrar a cena', () => {
	it('duas colunas à esquerda e uma linha em cima levam o terreno junto', () => {
		expect(deslocarQuadrados([[0, 0], [9, 4]], 2, 1, 12, 6)).toEqual([[2, 1], [11, 5]]);
	});
	it('tirar colunas da esquerda joga fora o que ficou de fora', () => {
		expect(deslocarQuadrados([[0, 3], [1, 3], [4, 3]], -2, 0, 8, 6)).toEqual([[2, 3]]);
	});
	it('a névoa revelada anda e é cortada na borda nova', () => {
		expect(deslocarRuns([[0, 0, 5], [3, 2, 9]], -3, 0, 5, 4)).toEqual([[0, 0, 2], [3, 0, 4]]);
		expect(deslocarRuns([[0, 0, 5]], 0, -1, 10, 4)).toEqual([]);
	});
	it('o token anda junto e, se cair fora, volta inteiro para dentro', () => {
		expect(deslocarToken({ x: 3, y: 3, tamanho: 1 }, 2, 2, 20, 20)).toEqual([5, 5]);
		expect(deslocarToken({ x: 0, y: 1, tamanho: 2 }, -3, 0, 10, 10)).toEqual([0, 1]);
		expect(deslocarToken({ x: 9, y: 9, tamanho: 2 }, 0, 0, 10, 10)).toEqual([8, 8]);
	});
});
