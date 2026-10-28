import { describe, expect, it } from 'vitest';
import { ESTILOS, estiloDoJutsu, estiloValido } from './efeitos.ts';

describe('estilo dos efeitos de área', () => {
	it('o elemento vence o tipo, e o nome do jutsu também conta', () => {
		expect(estiloDoJutsu({ tipo: 'Ninjutsu', elemento: 'katon', nome: 'Goukakyu' })).toBe('katon');
		expect(estiloDoJutsu({ tipo: 'Ninjutsu', elemento: null, nome: 'Suiton: Suijinheki' })).toBe('suiton');
		expect(estiloDoJutsu({ tipo: 'Taijutsu', elemento: null, nome: 'Konoha Senpuu' })).toBe('taijutsu');
		expect(estiloDoJutsu({ tipo: 'Genjutsu', nome: 'Magen: Kasumi' })).toBe('genjutsu');
		expect(estiloDoJutsu({ tipo: 'Bukijutsu', nome: 'Rajada de kunais' })).toBe('bukijutsu');
	});

	it('selamento, kugutsu e ninjutsu sem elemento caem no ninjutsu genérico', () => {
		for (const tipo of ['Ninjutsu', 'Fuuinjutsu', 'Kugutsu']) expect(estiloDoJutsu({ tipo, nome: 'Selo' })).toBe('ninjutsu');
		expect(estiloDoJutsu({ nome: 'Traço do bestiário' })).toBeNull();
	});

	it('toda cor é um hex e o estilo guardado é conferido', () => {
		for (const [k, e] of Object.entries(ESTILOS)) expect(e.cor, k).toMatch(/^#[0-9A-Fa-f]{6}$/);
		expect(Object.keys(ESTILOS)).toHaveLength(18);
		expect(estiloValido('katon')).toBe('katon');
		expect(estiloValido('laser')).toBeNull();
		expect(estiloValido(null)).toBeNull();
	});
});
