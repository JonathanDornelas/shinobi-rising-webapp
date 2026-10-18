import { describe, expect, it } from 'vitest';
import { conta, curaDoEfeito, danoDoEfeito, destaque, expressaoValida, periciaDoAtaque, somar, teste, totalPericia } from './expressoes.ts';

describe('expressões', () => {
	it('monta testes e somas', () => {
		expect(teste(5)).toBe('1d20+5');
		expect(teste(-1)).toBe('1d20-1');
		expect(teste(0)).toBe('1d20');
		expect(somar('2d6', 3)).toBe('2d6+3');
		expect(somar('2d6', 0)).toBe('2d6');
	});

	it('lê a perícia do ataque e os dados do efeito do livro', () => {
		expect(periciaDoAtaque([{ k: 'Ataque', v: '1d20 + Ninjutsu (um por alvo)' }])).toBe('Ninjutsu');
		expect(periciaDoAtaque([{ k: 'Ataque', v: '1d20 + Genjutsu vs Defesa Mental' }])).toBe('Genjutsu');
		expect(periciaDoAtaque([{ k: 'Ataque', v: '— (área)' }])).toBeNull();
		expect(periciaDoAtaque([{ k: 'Ataque', v: 'Automático' }])).toBeNull();
		expect(danoDoEfeito('4d8 de dano perfurante. As lanças contornam obstáculos.')).toEqual({ dados: '4d8', atributo: null });
		expect(danoDoEfeito('O alvo fica Imobilizado e sofre 2d8 de dano no início de cada turno.')).toEqual({ dados: '2d8', atributo: null });
		expect(danoDoEfeito('Causa 3d6 + 2 de dano de fogo.')).toEqual({ dados: '3d6+2', atributo: null });
		expect(danoDoEfeito('Rola em linha reta até 30 m: 3d6 + FOR de dano em todos no caminho.')).toEqual({ dados: '3d6', atributo: 'FOR' });
		expect(danoDoEfeito('Cada um ataca o mesmo alvo: cada acerto causa 2d8 + FOR. Se os dois acertarem')).toEqual({ dados: '2d8', atributo: 'FOR' });
		expect(danoDoEfeito('2d8 + CTR de dano; o alvo é empurrado 5 m.')).toEqual({ dados: '2d8', atributo: 'CTR' });
		expect(danoDoEfeito('Os alvos atingidos ficam Controlados.')).toBeNull();
		expect(curaDoEfeito('O aliado recupera 2d6 PV.')).toBe('2d6');
	});

	it('acha a perícia pelo nome, sem acento', () => {
		expect(totalPericia([{ nome: 'Percepção', total: 4 }], 'percepcao')).toBe(4);
		expect(totalPericia([], 'Ninjutsu')).toBeNull();
	});

	it('descreve a conta e os destaques', () => {
		expect(conta([{ sinal: 1, lados: 20, valores: [13], usados: [13] }, { sinal: 1, valor: 5 }])).toBe('13 + 5');
		expect(conta([{ sinal: 1, lados: 20, valores: [17, 4], usados: [17] }, { sinal: -1, valor: 1 }])).toBe('[17, 4] → 17 − 1');
		expect(conta([{ sinal: 1, lados: 6, valores: [3, 5], usados: [3, 5] }])).toBe('(3 + 5)');
		expect(destaque({ d20: 20 })).toBe('critico');
		expect(destaque({ d20: 1 })).toBe('falha');
		expect(destaque({ d20: null })).toBeNull();
	});

	it('valida antes de enviar', () => {
		expect(expressaoValida('1d20 + 5')).toBe(true);
		expect(expressaoValida('2d6+1d4-2')).toBe(true);
		expect(expressaoValida('5')).toBe(false);
		expect(expressaoValida('d20')).toBe(false);
		expect(expressaoValida('1d20; drop')).toBe(false);
		expect(expressaoValida('1d7')).toBe(false);
		expect(expressaoValida('40d6+40d6')).toBe(false);
		expect(expressaoValida('1d100')).toBe(true);
	});
});
