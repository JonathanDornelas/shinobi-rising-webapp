import { describe, expect, it } from 'vitest';
import { MAX_EM_CENA, alternarEmCena, lerEmCena } from './narrativa.ts';

describe('em cena na narrativa', () => {
	it('lê só o que tem o formato certo', () => {
		expect(lerEmCena(null)).toEqual([]);
		expect(lerEmCena([{ chave: 'pc:1', nome: 'Kaito', retrato: null }, { nome: 'sem chave' }, 3])).toEqual([{ chave: 'pc:1', nome: 'Kaito', retrato: null, foco: null }]);
	});

	it('o nome escondido chega como null', () => {
		expect(lerEmCena([{ chave: 'npc:9', nome: 42, retrato: '/bestiario/x.webp' }])[0].nome).toBeNull();
	});

	it('clicar traz para o fim da fila, clicar de novo tira', () => {
		const a = { chave: 'pc:1', nome: 'A', retrato: null };
		const b = { chave: 'npc:2', nome: null, retrato: null };
		const um = alternarEmCena([], a)!;
		const dois = alternarEmCena(um, b)!;
		expect(dois.map((e) => e.chave)).toEqual(['pc:1', 'npc:2']);
		expect(alternarEmCena(dois, a)!.map((e) => e.chave)).toEqual(['npc:2']);
	});

	it('cheia, ninguém novo entra', () => {
		const cheia = Array.from({ length: MAX_EM_CENA }, (_, i) => ({ chave: `pc:${i}`, nome: null, retrato: null }));
		expect(alternarEmCena(cheia, { chave: 'pc:x', nome: null, retrato: null })).toBeNull();
		expect(alternarEmCena(cheia, cheia[0])!.length).toBe(MAX_EM_CENA - 1);
	});
});
