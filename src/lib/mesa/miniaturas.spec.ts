import { describe, expect, it } from 'vitest';
import { MINIATURAS, PRATELEIRAS, escalaDe, lerAjustes, lerCenaMiniaturas, sombraDaMiniatura, miniaturaPorId, miniaturasDoVerbete, quadroNaTela, rumoDasSetas, rumoDoPasso, vetorDoRumo } from './miniaturas.ts';

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

	it('as setas juntas dão o rumo: uma vira para o lado dela, duas para a diagonal', () => {
		expect(rumoDasSetas(['ArrowDown'])).toBe(0);
		expect(rumoDasSetas(['ArrowRight'])).toBe(2);
		expect(rumoDasSetas(['ArrowUp'])).toBe(4);
		expect(rumoDasSetas(['ArrowLeft'])).toBe(6);
		expect(rumoDasSetas(['ArrowDown', 'ArrowRight'])).toBe(1);
		expect(rumoDasSetas(['ArrowRight', 'ArrowUp'])).toBe(3);
		expect(rumoDasSetas(['ArrowUp', 'ArrowLeft'])).toBe(5);
		expect(rumoDasSetas(['ArrowLeft', 'ArrowDown'])).toBe(7);
		// opostas se anulam: não há para onde virar; com uma terceira, vale a que sobra
		expect(rumoDasSetas(['ArrowLeft', 'ArrowRight'])).toBeNull();
		expect(rumoDasSetas(['ArrowLeft', 'ArrowRight', 'ArrowUp'])).toBe(4);
		expect(rumoDasSetas([])).toBeNull();
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

	it('na cena: o tamanho de todas e a sombra (ligada, se não disser); a sombra foge da luz mais perto', () => {
		expect(lerCenaMiniaturas(undefined)).toEqual({ escala: 1, sombra: true });
		expect(lerCenaMiniaturas({ escala: 0.2, sombra: false })).toEqual({ escala: 0.5, sombra: false });
		expect(sombraDaMiniatura([5, 5], [])).toEqual({ dx: 0.6, dy: -0.8, k: 0.5, luz: false });
		const s = sombraDaMiniatura([5, 5], [{ x: 2, y: 5, alcance: 6 }, { x: 5, y: 9, alcance: 6 }]);
		expect([s.dx, s.dy]).toEqual([1, 0]);
		expect(s.k).toBeCloseTo(0.65);
		// longe demais, ou a própria tocha (no mesmo lugar), não contam
		expect(sombraDaMiniatura([5, 5], [{ x: 20, y: 5, alcance: 6 }, { x: 5, y: 5, alcance: 6 }]).k).toBe(0.5);
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
			// a criatura se mede também pela largura (e a Pequena encolhe), então a medida dela pode passar do quadro
			if (!m.criatura) expect(m.altura).toBeLessThanOrEqual(m.h);
			expect(m.altura).toBeGreaterThan(0);
			expect(miniaturaPorId(m.id)).toBe(m);
		}
		expect(miniaturasDoVerbete('cla-uchiha#chunin').length).toBeGreaterThan(0);
		expect(miniaturaPorId('nao-existe')).toBeNull();
	});
});
