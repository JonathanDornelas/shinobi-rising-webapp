import { describe, expect, it } from 'vitest';
import { ESTILOS, estiloDoJutsu, estiloValido, faseDoQuadrado, spritesDoEfeito, tamanhoDoSprite } from './efeitos.ts';
import { SPRITES_FX } from './fx-sprites.ts';

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

describe('efeitos animados (vfx_workbench)', () => {
	it('todo estilo tem a sua tira de quadros', () => {
		for (const k of Object.keys(ESTILOS)) expect(SPRITES_FX[k], k).toBeDefined();
	});
	it('área pequena: todo quadrado (ou a densidade do estilo); área grande: uma amostra estável perto do limite', () => {
		const poucos: [number, number][] = [[0, 0], [1, 0], [2, 3]];
		expect(spritesDoEfeito(poucos, 'katon').map((q) => [q.x, q.y])).toEqual(poucos);
		const muitos: [number, number][] = Array.from({ length: 1200 }, (_, i) => [i % 40, Math.floor(i / 40)]);
		const a = spritesDoEfeito(muitos, 'katon', 'ef1');
		expect(a.length).toBeGreaterThan(80);
		expect(a.length).toBeLessThan(170);
		expect(spritesDoEfeito(muitos, 'katon', 'ef1')).toEqual(a);
		// espalhado, não em colunas: quase toda coluna e toda linha da área recebem algum desenho
		expect(new Set(a.map((q) => q.x)).size).toBeGreaterThan(30);
		expect(new Set(a.map((q) => q.y)).size).toBeGreaterThan(25);
		// genjutsu (portais) fica espaçado; um quadrado só sempre ganha um desenho
		expect(spritesDoEfeito(muitos.slice(0, 100), 'genjutsu', 'g').length).toBeLessThan(55);
		expect(spritesDoEfeito([[5, 5]], 'genjutsu', 'g')).toHaveLength(1);
		// fora do meio, mas dentro do quadrado vizinho
		for (const q of a) expect(Math.abs(q.dx)).toBeLessThanOrEqual(0.22);
	});
	it('a fase fica dentro da duração e muda de quadrado para quadrado; o tamanho respeita 32 px/m e 1,4 m', () => {
		const fases = [0, 1, 2, 3, 4, 5].map((x) => faseDoQuadrado('e', x, 0, 1000));
		expect(fases.every((f) => f >= 0 && f <= 1000)).toBe(true);
		expect(new Set(fases).size).toBeGreaterThan(3);
		expect(tamanhoDoSprite(32, 64)).toEqual({ w: 1, h: 2 });
		expect(tamanhoDoSprite(66, 42).w).toBeCloseTo(1.4);
	});
});
