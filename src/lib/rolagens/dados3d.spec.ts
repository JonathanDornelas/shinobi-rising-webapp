import { describe, expect, it } from 'vitest';
import { MAX_DADOS, notacao3d } from './dados3d.ts';

describe('notação dos dados 3D', () => {
	it('leva os valores sorteados, com o modificador de fora', () => {
		expect(notacao3d([{ sinal: 1, lados: 20, valores: [17], usados: [17] }, { sinal: 1, valor: 5 }])).toBe('1d20@17');
	});

	it('agrupa dados iguais na ordem em que aparecem (a biblioteca junta os grupos)', () => {
		const n = notacao3d([
			{ sinal: 1, lados: 20, valores: [3], usados: [3] },
			{ sinal: 1, lados: 6, valores: [2, 6], usados: [2, 6] },
			{ sinal: 1, lados: 20, valores: [18], usados: [18] }
		]);
		expect(n).toBe('2d20+2d6@3,18,2,6');
	});

	it('mostra os dois d20 da vantagem, inclusive o descartado', () => {
		expect(notacao3d([{ sinal: 1, lados: 20, valores: [4, 15], usados: [15], manter: 'h', k: 1 }])).toBe('2d20@4,15');
	});

	it('ignora dados que a mesa não desenha e para no limite', () => {
		expect(notacao3d([{ sinal: 1, lados: 3, valores: [2], usados: [2] }])).toBeNull();
		expect(notacao3d([{ sinal: 1, valor: 4 }])).toBeNull();
		const muitos = notacao3d([{ sinal: 1, lados: 6, valores: Array(40).fill(3), usados: Array(40).fill(3) }])!;
		expect(muitos.startsWith(`${MAX_DADOS}d6@`)).toBe(true);
	});
});
