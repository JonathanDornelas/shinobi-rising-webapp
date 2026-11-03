import { describe, expect, it } from 'vitest';
import { MINIATURAS, PRATELEIRAS, escalaDe, lerAjustes, miniaturaPorId, miniaturasDoVerbete, quadroNaTela, rumoDoPasso, vetorDoRumo } from './miniaturas.ts';

describe('miniaturas', () => {
	it('o passo dá o rumo: sul de frente, leste, norte, oeste e as diagonais', () => {
		expect(rumoDoPasso(0, 1)).toBe(0);
		expect(rumoDoPasso(1, 1)).toBe(1);
		expect(rumoDoPasso(3, 0)).toBe(2);
		expect(rumoDoPasso(1, -1)).toBe(3);
		expect(rumoDoPasso(0, -2)).toBe(4);
		expect(rumoDoPasso(-1, 0)).toBe(6);
		expect(rumoDoPasso(-1, 1)).toBe(7);
		expect(rumoDoPasso(0, 0)).toBeNull();
		for (let r = 0; r < 8; r++) expect(rumoDoPasso(...vetorDoRumo(r))).toBe(r);
	});

	it('na tela, o rumo segue a projeção (na isométrica, o leste da grade desce para a direita)', () => {
		const deCima = (x: number, y: number): [number, number] => [x, y];
		expect(quadroNaTela(2, 5, 5, deCima)).toBe(2);
		const iso = (x: number, y: number): [number, number] => [x - y, (x + y) / 2];
		expect(quadroNaTela(2, 5, 5, iso)).toBe(1);
		expect(quadroNaTela(1, 5, 5, iso)).toBe(0);
	});

	it('o tamanho: o de todas vezes o de cada uma, sempre dentro do limite', () => {
		expect(lerAjustes(null)).toEqual({ escala: 1, ajustes: {} });
		expect(lerAjustes({ escala: 9, ajustes: { 'cla-uchiha--genin': 0.1, 'x y': 2, igual: 1 } })).toEqual({ escala: 2, ajustes: { 'cla-uchiha--genin': 0.5 } });
		expect(escalaDe({ escala: 1.2, ajustes: { a: 1.5 } }, 'a')).toBe(1.8);
		expect(escalaDe({ escala: 1.2, ajustes: {} }, 'b')).toBe(1.2);
	});

	it('as prateleiras juntam as miniaturas por verbete, sem perder nenhuma', () => {
		expect(PRATELEIRAS.reduce((n, p) => n + p.minis.length, 0)).toBe(MINIATURAS.length);
		for (const p of PRATELEIRAS) expect(p.minis.every((m) => m.verbete.startsWith(p.chave + '#'))).toBe(true);
	});

	it('o catálogo liga cada miniatura a um estágio do bestiário, com tira e pés coerentes', () => {
		expect(MINIATURAS.length).toBeGreaterThan(0);
		for (const m of MINIATURAS) {
			expect(m.verbete).toMatch(/^[a-z0-9-]+#[a-z0-9-]+$/);
			expect(m.id).toMatch(/^[a-z0-9-]{1,60}$/);
			expect(m.pe[1]).toBeLessThanOrEqual(m.h);
			expect(m.altura).toBeLessThanOrEqual(m.h);
			expect(miniaturaPorId(m.id)).toBe(m);
		}
		expect(miniaturasDoVerbete('cla-uchiha#chunin').length).toBeGreaterThan(0);
		expect(miniaturaPorId('nao-existe')).toBeNull();
	});
});
