import { describe, expect, it } from 'vitest';
import { ataqueNpc, gerarNpc } from './gerador.ts';

describe('NPC', () => {
	it('lê o ataque no formato do livro', () => {
		expect(ataqueNpc('1d20 + 4 → 1d6 + 2')).toEqual({ acerto: '1d20+4', dano: '1d6+2' });
		expect(ataqueNpc('Ataque 1d20 + 3 → 1d6 + 1 (faca/clava)')).toEqual({ acerto: '1d20+3', dano: '1d6+1' });
		expect(ataqueNpc('Espada: 2d8')).toEqual({ acerto: null, dano: '2d8' });
		expect(ataqueNpc('')).toEqual({ acerto: null, dano: null });
	});

	it('gera um NPC completo e válido para o rank pedido', () => {
		for (let i = 0; i < 50; i++) {
			const n = gerarNpc('jounin');
			expect(n).toMatchObject({ rank: 'jounin', pv: 75, pc: 70, defesa: 16 });
			expect(n.nome).toMatch(/^\S+ \S+$/);
			expect(n.tags.length).toBeGreaterThanOrEqual(1);
			expect(n.tags.length).toBeLessThanOrEqual(3);
			expect(new Set(n.tags).size).toBe(n.tags.length);
			expect(ataqueNpc(n.ataque).acerto).toBe('1d20+7');
		}
		expect(gerarNpc(undefined, () => 0).rank).toBe('genin');
	});
});
