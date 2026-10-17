import { describe, expect, it } from 'vitest';
import { trecho } from './motor';

describe('trecho', () => {
	it('destaca a ocorrência ignorando acentos e caixa', () => {
		const r = trecho('Os estados duram até o fim da cena.', 'ESTADOS');
		expect(r).toEqual({ pre: 'Os ', hit: 'estados', pos: ' duram até o fim da cena.' });
	});

	it('acha termos com acento a partir de consulta sem acento', () => {
		const r = trecho('Técnica de Imitação da Sombra', 'imitacao');
		expect(r?.hit).toBe('Imitação');
	});

	it('devolve null quando o termo não aparece', () => {
		expect(trecho('Kawarimi no Jutsu', 'chidori')).toBeNull();
	});
});
