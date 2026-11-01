import { describe, expect, it } from 'vitest';
import { APARENCIA_PADRAO, ESTILOS_DADO, corDoDado, corDosNumeros, estiloDado, normalizarAparencia } from './aparencia-dados.ts';

describe('aparência dos dados 3D', () => {
	it('perfil sem escolha ou com lixo volta ao padrão', () => {
		expect(normalizarAparencia(undefined)).toEqual(APARENCIA_PADRAO);
		expect(normalizarAparencia({ cor: 'red', estilo: 'ouro-puro', elemento: 'x' })).toEqual(APARENCIA_PADRAO);
	});

	it('guarda a cor em minúsculas, o estilo conhecido e o elemento desligado', () => {
		expect(normalizarAparencia({ cor: '#2A4F8A', estilo: 'gelo', elemento: false })).toEqual({ cor: '#2a4f8a', estilo: 'gelo', elemento: false });
	});

	it('números claros em dado escuro e escuros em dado claro', () => {
		expect(corDosNumeros('#5c1e15').letra).toBe('#f4e4d6');
		expect(corDosNumeros('#1b1210').letra).toBe('#f4e4d6');
		expect(corDosNumeros('#e8dcc4').letra).toBe('#1b1210');
		expect(corDosNumeros('#b8902a').letra).toBe('#1b1210');
	});

	it('dano e cura usam a cor da rolagem só se a pessoa quiser', () => {
		const a = { cor: '#2a4f8a', estilo: 'aco', elemento: true };
		expect(corDoDado(a, '#e05a2b')).toBe('#e05a2b');
		expect(corDoDado(a, null)).toBe('#2a4f8a');
		expect(corDoDado({ ...a, elemento: false }, '#e05a2b')).toBe('#2a4f8a');
	});

	it('cada estilo tem id único, e estilo desconhecido vira o primeiro', () => {
		expect(new Set(ESTILOS_DADO.map((e) => e.id)).size).toBe(ESTILOS_DADO.length);
		expect(estiloDado('nada').id).toBe('laca');
	});
});
