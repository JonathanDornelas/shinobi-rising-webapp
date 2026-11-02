import { describe, expect, it } from 'vitest';
import { danoContra, rotuloDano, tipoDanoDaArma, tipoDanoDoJutsu, vantagemElemental } from './tipos-dano.ts';

describe('tipos de dano (cap. 4)', () => {
	it('o jutsu de elemento causa o dano do elemento, mesmo que o texto diga que corta', () => {
		expect(tipoDanoDoJutsu({ elemento: 'fuuton', tipo: 'Ninjutsu', efeito: 'Lâminas de vento causam 3d6 de dano cortante.' })).toBe('vento');
		expect(tipoDanoDoJutsu({ elemento: 'yoton', tipo: 'Ninjutsu', efeito: 'Lava: 4d8 de dano.' })).toBe('fogo');
		expect(tipoDanoDoJutsu({ elemento: 'mokuton', tipo: 'Ninjutsu', efeito: '3d8 de dano.' })).toBe('madeira');
	});
	it('sem elemento: Taijutsu bate, Genjutsu fere a mente, lâmina corta, ponta perfura', () => {
		expect(tipoDanoDoJutsu({ elemento: null, tipo: 'Taijutsu', efeito: 'Um chute que causa 2d6 de dano.' })).toBe('concussao');
		expect(tipoDanoDoJutsu({ elemento: null, tipo: 'Genjutsu', efeito: '2d6 de dano.' })).toBe('mental');
		expect(tipoDanoDoJutsu({ elemento: null, tipo: 'Bukijutsu', efeito: 'Um corte de espada: 3d8 de dano.' })).toBe('cortante');
		expect(tipoDanoDoJutsu({ elemento: null, tipo: 'Bukijutsu', efeito: 'Chuva de senbon: 2d4 de dano.' })).toBe('perfurante');
		expect(tipoDanoDoJutsu({ elemento: null, tipo: 'Ninjutsu', efeito: 'Uma esfera de chakra: 4d6 de dano.' })).toBe('chakra');
	});
	it('as armas: lâmina, ponta ou impacto', () => {
		expect(tipoDanoDaArma('Katana')).toBe('cortante');
		expect(tipoDanoDaArma('Kunai')).toBe('perfurante');
		expect(tipoDanoDaArma('Bō (bastão)')).toBe('concussao');
		expect(tipoDanoDaArma('Mordida')).toBe('perfurante');
	});
	it('o ciclo: o forte vence o fraco; madeira e gelo pelos elementos que os formam', () => {
		expect(vantagemElemental('agua', 'fogo')).toBe(true);
		expect(vantagemElemental('fogo', 'agua')).toBe(false);
		expect(vantagemElemental('raio', 'terra')).toBe(true);
		expect(vantagemElemental('fogo', 'madeira')).toBe(true);
		expect(vantagemElemental('gelo', 'raio')).toBe(true); // o vento do gelo vence o raio
	});
	it('o dano contra o alvo: ciclo, vulnerabilidade, resistência e imunidade', () => {
		expect(danoContra(10, 'agua', { elemento: 'fogo' })).toBe(15);
		expect(danoContra(10, 'raio', { vulnerabilidades: ['raio'] })).toBe(20);
		expect(danoContra(11, 'cortante', { resistencias: ['cortante'] })).toBe(5);
		expect(danoContra(10, 'veneno', { imunidades: ['veneno'] })).toBe(0);
	});
	it('o rótulo da rolagem diz o tipo', () => {
		expect(rotuloDano('Katon: Gōkakyū', 'fogo')).toBe('Dano · Katon: Gōkakyū (fogo)');
		expect(rotuloDano('Kunai', null)).toBe('Dano · Kunai');
	});
});
