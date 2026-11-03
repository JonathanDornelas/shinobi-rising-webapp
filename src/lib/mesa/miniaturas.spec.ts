import { describe, expect, it } from 'vitest';
import { MINIATURAS, miniaturaPorId, miniaturasDoVerbete, quadroNaTela, rumoDoPasso, vetorDoRumo } from './miniaturas.ts';

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
