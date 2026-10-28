import { describe, expect, it } from 'vitest';
import { nomeReal, siglaDoNome } from './nomes.ts';

describe('nome escondido', () => {
	it('a sigla é a do banco: iniciais de palavras com mais de 2 letras; tropa leva a inicial e o membro', () => {
		expect(siglaDoNome('Zabuza Momochi')).toBe('ZM');
		expect(siglaDoNome('Hideo')).toBe('H');
		expect(siglaDoNome('Ao')).toBe('AO');
		expect(siglaDoNome('Bandido de Estrada', 3)).toBe('B3');
	});

	it('o Mestre lê o nome do NPC; o clone herda o primeiro nome de quem o criou', () => {
		const t = (id: string, o: Partial<{ npc_id: string; personagem_id: string; ligado_a: string }> = {}) => ({ id, npc_id: null, personagem_id: null, ligado_a: null, ...o });
		const todos = [t('a', { npc_id: 'n1' }), t('b', { ligado_a: 'a' }), t('c', { ligado_a: 'b' }), t('d', { personagem_id: 'f1' }), t('x')];
		const reais = { n1: 'Zabuza Momochi', f1: 'Haku' };
		expect(nomeReal(todos[0], reais, todos)).toBe('Zabuza Momochi');
		expect(nomeReal(todos[1], reais, todos)).toBe('Clone de Zabuza');
		expect(nomeReal(todos[2], reais, todos)).toBe('Clone de Clone');
		expect(nomeReal(todos[3], reais, todos)).toBe('Haku');
		expect(nomeReal(todos[4], reais, todos)).toBeNull();
	});
});
