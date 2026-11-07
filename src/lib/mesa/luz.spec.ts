import { describe, expect, it } from 'vitest';
import { ALCANCE_DO_OLHAR, bloqueiaPasso, calcularVisao, encaixar, explorar, limparParedes, paredeEm, paredesEfetivas, type Parede } from './luz.ts';
import { ambienteDaCor, lerUvtt } from './uvtt.ts';
import { dentro, poligonoVisao, rasterizar } from './visao.ts';

// uma sala 10 × 10 dividida ao meio por uma parede em x = 5, com uma porta de y = 4 a y = 6
const sala = (porta: 0 | 1 | 2 | 4): Parede[] => [
	[5, 0, 5, 4, 0],
	[5, 4, 5, 6, porta],
	[5, 6, 5, 10, 0]
];

describe('visão', () => {
	it('sem paredes, vê a cena inteira; a parede esconde o que está atrás dela', () => {
		const livre = poligonoVisao(2.5, 2.5, [], { x0: 0, y0: 0, x1: 10, y1: 10 });
		expect(dentro(livre, 9, 9)).toBe(true);
		const v = calcularVisao({ L: 10, A: 10, paredes: sala(1), ambiente: 'claro', luzes: [], observadores: [{ x: 2.5, y: 5, corpo: 1 }] });
		expect(v.visivel(4, 2)).toBe(true);
		expect(v.visivel(8, 5)).toBe(false);
	});

	it('a porta aberta e a janela deixam ver; a fechada, não', () => {
		const ver = (t: 0 | 1 | 2 | 4) => calcularVisao({ L: 10, A: 10, paredes: sala(t), ambiente: 'claro', luzes: [], observadores: [{ x: 2.5, y: 5, corpo: 1 }] }).visivel(8, 5);
		expect([ver(1), ver(2), ver(4)]).toEqual([false, true, true]);
	});

	it('no escuro, só o que uma luz ilumina (e o próprio corpo de perto)', () => {
		const e = { L: 10, A: 10, paredes: [] as Parede[], ambiente: 'escuro' as const, observadores: [{ x: 1.5, y: 1.5, corpo: 1 }] };
		expect(calcularVisao({ ...e, luzes: [] }).visivel(1.6, 1.6)).toBe(true);
		expect(calcularVisao({ ...e, luzes: [] }).visivel(8, 8)).toBe(false);
		expect(calcularVisao({ ...e, luzes: [{ x: 8, y: 8, plena: 1, penumbra: 1 }] }).visivel(8.5, 8.5)).toBe(true);
	});

	it('a luz não atravessa a parede', () => {
		const v = calcularVisao({ L: 10, A: 10, paredes: [[5, 0, 5, 10, 4]], ambiente: 'escuro', luzes: [{ x: 7, y: 5, plena: 6, penumbra: 0 }], observadores: [{ x: 2.5, y: 5, corpo: 1 }] });
		// a janela deixa ver, mas a luz do outro lado também passa por ela (janela não corta a luz)
		expect(v.visivel(4, 5)).toBe(true);
		const fechada = calcularVisao({ L: 10, A: 10, paredes: [[5, 0, 5, 10, 0]], ambiente: 'escuro', luzes: [{ x: 7, y: 5, plena: 6, penumbra: 0 }], observadores: [{ x: 7.5, y: 6.5, corpo: 1 }] });
		expect(fechada.visivel(4, 5)).toBe(false);
	});
});

describe('exploração', () => {
	it('revela os quadrados que o grupo vê e para na parede', () => {
		const g = new Uint8Array(100);
		expect(explorar({ L: 10, A: 10, paredes: sala(1), ambiente: 'claro', luzes: [], observadores: [{ x: 2.5, y: 5.5, corpo: 1 }] }, g)).toBe(true);
		expect(g[5 * 10 + 1]).toBe(1);
		expect(g[5 * 10 + 8]).toBe(0);
		// de novo, nada novo
		expect(explorar({ L: 10, A: 10, paredes: sala(1), ambiente: 'claro', luzes: [], observadores: [{ x: 2.5, y: 5.5, corpo: 1 }] }, g)).toBe(false);
	});

	it('rasterizar marca o centro dos quadrados dentro do polígono', () => {
		const g = new Uint8Array(16);
		rasterizar([[0, 0], [2, 0], [2, 2], [0, 2]], 4, 4, g);
		expect([...g].filter(Boolean).length).toBe(4);
	});
});

describe('paredes', () => {
	it('o passo não atravessa parede nem porta fechada; a porta aberta e a janela deixam passar', () => {
		expect(bloqueiaPasso(sala(1), 2.5, 5, 7.5, 5)).toBe(true);
		expect(bloqueiaPasso(sala(0), 2.5, 5, 7.5, 5)).toBe(true);
		expect(bloqueiaPasso(sala(4), 2.5, 5, 7.5, 5)).toBe(false);
		expect(bloqueiaPasso(sala(2), 2.5, 5, 7.5, 5)).toBe(false);
		expect(bloqueiaPasso(sala(1), 2.5, 2.5, 3.5, 8.5)).toBe(false);
	});

	it('a porta ou a janela traçada por cima de uma parede toma o lugar daquele trecho', () => {
		// a parede inteira em x = 5 e, por cima, uma porta de y = 4 a y = 6
		const sobre = (t: 1 | 2 | 4): Parede[] => [[5, 0, 5, 10, 0], [5, 6, 5, 4, t]];
		expect(paredesEfetivas(sobre(2))).toEqual([[5, 0, 5, 4, 0], [5, 6, 5, 10, 0], [5, 6, 5, 4, 2]]);
		const ver = (t: 1 | 2 | 4) => calcularVisao({ L: 10, A: 10, paredes: sobre(t), ambiente: 'claro', luzes: [], observadores: [{ x: 2.5, y: 5, corpo: 1 }] }).visivel(8, 5);
		expect([ver(1), ver(2), ver(4)]).toEqual([false, true, true]);
		expect(bloqueiaPasso(sobre(2), 2.5, 5, 7.5, 5)).toBe(false);
		expect(bloqueiaPasso(sobre(1), 2.5, 5, 7.5, 5)).toBe(true);
		// fora da porta, a parede continua
		expect(bloqueiaPasso(sobre(2), 2.5, 2, 7.5, 2)).toBe(true);
		// a porta numa abertura (sem parede por baixo) não corta nada
		expect(paredesEfetivas(sala(2))).toEqual(sala(2));
	});

	it('encaixa na ponta mais perto ou no canto da grade; limpa o que não presta', () => {
		expect(encaixar(5.2, 3.9, sala(1), 0.3, false)).toEqual([5, 4]);
		expect(encaixar(7.4, 7.6, sala(1), 0.3, false)).toEqual([7, 8]);
		expect(encaixar(7.4, 7.6, sala(1), 0.3, true)).toEqual([7.4, 7.6]);
		expect(limparParedes([[0, 0, 0, 0, 0], [1, 1, 3, 1, 9], [1, 1, 3, 1, 1], 'x'], 10, 10)).toEqual([[1, 1, 3, 1, 1]]);
		expect(paredeEm(sala(1), 5.1, 5, 0.3)).toBe(1);
	});
});

describe('Universal VTT', () => {
	it('lê tamanho, paredes, portas, luzes e o nível de luz', () => {
		const m = lerUvtt(
			JSON.stringify({
				format: 0.3,
				resolution: { map_origin: { x: 0, y: 0 }, map_size: { x: 20, y: 12 }, pixels_per_grid: 140 },
				line_of_sight: [[{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 }]],
				portals: [{ bounds: [{ x: 5, y: 4 }, { x: 5, y: 5 }], closed: true }],
				lights: [{ position: { x: 3, y: 3 }, range: 8 }],
				environment: { ambient_light: 'ff202020' },
				image: 'iVBORw0KGgo='
			})
		);
		expect([m.largura, m.altura, m.pixelsPorQuadrado]).toEqual([20, 12, 140]);
		expect(m.paredes).toEqual([[1, 1, 5, 1, 0], [5, 1, 5, 4, 0], [5, 4, 5, 5, 1]]);
		expect(m.luzes).toEqual([{ x: 3, y: 3, plena: 4, penumbra: 4 }]);
		expect([m.ambiente, m.tipoImagem]).toEqual(['escuro', 'image/png']);
		expect(ambienteDaCor('ffffffff')).toBe('claro');
		expect(() => lerUvtt('{"resolution":{"map_size":{"x":1300,"y":10}},"image":"x"}')).toThrow(/1000 × 1000/);
	});
});

describe('cenas muito grandes', () => {
	const olho = { x: 500, y: 500, corpo: 1 };
	const claro = { paredes: [], ambiente: 'claro' as const, luzes: [], observadores: [olho] };

	it('uma cena até 320 m é vista de ponta a ponta', () => {
		const v = calcularVisao({ ...claro, L: 320, A: 320, observadores: [{ x: 1, y: 1, corpo: 1 }] });
		expect(v.visivel(319, 319)).toBe(true);
	});

	it('numa maior, o olhar para no horizonte', () => {
		const v = calcularVisao({ ...claro, L: 1000, A: 1000 });
		expect(v.visivel(500 + ALCANCE_DO_OLHAR - 5, 500)).toBe(true);
		expect(v.visivel(500 + ALCANCE_DO_OLHAR + 5, 500)).toBe(false);
	});

	it('a luz que ninguém alcança ver fica fora da conta, e a que ilumina o horizonte não', () => {
		const luz = (x: number) => ({ x, y: 500, plena: 4, penumbra: 2 });
		const v = calcularVisao({ ...claro, ambiente: 'penumbra', L: 1000, A: 1000, luzes: [luz(500 + ALCANCE_DO_OLHAR + 4), luz(900)] });
		expect(v.fontes.map((f) => Math.round(f.x))).toEqual([500 + ALCANCE_DO_OLHAR + 4]);
	});

	it('saber se um lugar está à vista, pela ordem dos ângulos, dá o mesmo que contar as bordas', () => {
		let semente = 11;
		const sorte = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
		const paredes = Array.from({ length: 200 }, (): [number, number, number, number] => {
			const [x, y] = [sorte() * 100, sorte() * 100];
			return [x, y, x + (sorte() - 0.5) * 14, y + (sorte() - 0.5) * 14];
		});
		const p = poligonoVisao(47.1, 52.6, paredes, { x0: 0, y0: 0, x1: 100, y1: 100 });
		// a mesma pergunta, por uma cópia sem o que o polígono guarda
		const copia = p.map(([x, y]): [number, number] => [x, y]);
		for (let i = 0; i < 4000; i++) {
			const [x, y] = [sorte() * 100, sorte() * 100];
			expect(dentro(p, x, y)).toBe(dentro(copia, x, y));
		}
	});

	it('procurar pela parede mais perto dá o mesmo polígono de procurar em todas', () => {
		// um gerador simples, para o teste dar sempre o mesmo
		let semente = 7;
		const sorte = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
		const caixa = { x0: 0, y0: 0, x1: 100, y1: 100 };
		const paredes = Array.from({ length: 300 }, (): [number, number, number, number] => {
			const [x, y] = [sorte() * 100, sorte() * 100];
			return [x, y, x + (sorte() - 0.5) * 12, y + (sorte() - 0.5) * 12];
		});
		const todas: [number, number, number, number][] = [...paredes, [0, 0, 100, 0], [100, 0, 100, 100], [100, 100, 0, 100], [0, 100, 0, 0]];
		const [ox, oy] = [50.3, 49.7];
		const p = poligonoVisao(ox, oy, paredes, caixa);
		expect(p.length).toBeGreaterThan(100);
		for (const [x, y] of p) {
			const distancia = Math.hypot(x - ox, y - oy);
			const [dx, dy] = [(x - ox) / distancia, (y - oy) / distancia];
			let primeira = Infinity;
			for (const [x1, y1, x2, y2] of todas) {
				const [sx, sy] = [x2 - x1, y2 - y1];
				const den = dx * sy - dy * sx;
				if (Math.abs(den) < 1e-12) continue;
				const [qx, qy] = [x1 - ox, y1 - oy];
				const t = (qx * sy - qy * sx) / den;
				const u = (qx * dy - qy * dx) / den;
				if (t >= 0 && u >= -1e-9 && u <= 1 + 1e-9 && t < primeira) primeira = t;
			}
			expect(distancia).toBeCloseTo(primeira, 6);
		}
	});
});
