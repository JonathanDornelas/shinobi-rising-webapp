import { describe, expect, it } from 'vitest';
import { ataqueDe, duracaoDe, efeitosDe, resistenciaDe } from './filtros-jutsu.ts';

const comInfo = (info: Record<string, string>) => ({ info: Object.entries(info).map(([k, v]) => ({ k, v })) });

describe('filtros de jutsu', () => {
	it('lê os efeitos do texto', () => {
		expect(efeitosDe('6d8 de dano que ignora RD; o alvo é arremessado 5m e cai. Sem selos.')).toEqual(['dano', 'controle']);
		expect(efeitosDe('Cura 3d6 PV de um aliado tocado e remove 1 condição negativa.')).toEqual(['cura']);
		expect(efeitosDe('Cria uma barreira de 40 PV que protege você e quem estiver a até 3 m.')).toEqual(['defesa']);
		expect(efeitosDe('Cria até 3 clones sólidos. Cada clone tem 1 PV.')).toEqual(['clones']);
		expect(efeitosDe('Desloca-se até 30m para um ponto visível, sem provocar reações.')).toEqual(['movimento']);
		expect(efeitosDe('Cada um ataca o mesmo alvo: cada acerto causa 2d8 + FOR.')).toContain('dano');
		// penalidade com dado de dreno não é dano
		expect(efeitosDe('O enxame drena 1d6 PC do alvo por turno e impõe −1 em ataques (zumbido e mordidas).')).toEqual(['penalidade', 'dreno']);
		expect(efeitosDe('Componente: selo especial do clã.')).toEqual(['outros']);
	});

	it('agrupa resistência, ataque e duração', () => {
		expect(resistenciaDe(comInfo({ Resistência: 'FOR (DT do Jutsu) ou cai' }))).toBe('FOR');
		expect(resistenciaDe(comInfo({ Resistência: '—' }))).toBe('Sem resistência');
		expect(ataqueDe(comInfo({ Ataque: '1d20 + Taijutsu (com CTR)' }))).toBe('Taijutsu');
		expect(ataqueDe(comInfo({ Ataque: '— (área)' }))).toBe('Sem rolagem (área)');
		expect(ataqueDe(comInfo({ Ataque: 'Automático (o fio guia)' }))).toBe('Automático');
		expect(duracaoDe(comInfo({ Duração: 'Sustentado (4 PC/turno)' }))).toBe('Sustentada');
		expect(duracaoDe(comInfo({ Duração: 'Até o início do seu próximo turno' }))).toBe('Em turnos');
		expect(duracaoDe(comInfo({ Duração: '1 hora (ou até sofrer 5+ de dano)' }))).toBe('Cena ou mais');
	});
});
