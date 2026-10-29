import { describe, expect, it } from 'vitest';
import { anguloNaGrade, desfazerProjecao, emPe, inversa, matrizIso, anguloNaTela, caixaDaCena, caminhoLosango, caminhoQuadrados, centro, cfgIso, elipse, girarVista, inverter, losango, ordemDePintura, paralelogramoRun, projetar, runsDeQuadrados, type CfgIso, type Ponto, type Rotacao } from './projecao.ts';

const ROTACOES: Rotacao[] = [0, 90, 180, 270];
const cena = (rotacao: Rotacao, L = 12, A = 8, o: Partial<Omit<CfgIso, 'L' | 'A'>> = {}) => cfgIso(L, A, { rotacao, ...o });
const area = (p: Ponto[]) => Math.abs(p.reduce((s, [x, y], i) => s + x * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y, 0)) / 2;

describe('projeção isométrica: grade para tela e de volta', () => {
	it('o quadrado (0, 0) é o topo do losango e um quadrado tem 64 × 32 (2:1)', () => {
		const c = cena(0);
		expect(projetar(0, 0, 0, c)).toEqual([0, 0]);
		expect(projetar(1, 0, 0, c)).toEqual([32, 16]);
		expect(projetar(0, 1, 0, c)).toEqual([-32, 16]);
		expect(projetar(1, 1, 0, c)).toEqual([0, 32]);
		const l = losango(3, 2, 1, 0, c);
		expect(Math.max(...l.map((p) => p[0])) - Math.min(...l.map((p) => p[0]))).toBe(64);
		expect(Math.max(...l.map((p) => p[1])) - Math.min(...l.map((p) => p[1]))).toBe(32);
		expect(area(l)).toBe(64 * 16);
	});

	it('inverter desfaz projetar em todo ponto, nas 4 vistas, com e sem elevação e em outra razão', () => {
		for (const r of ROTACOES)
			for (const razao of [1.5, 2])
				for (const z of [0, 3, -2]) {
					const c = cena(r, 12, 8, { razao });
					for (let gx = 0; gx <= 12; gx += 0.75)
						for (let gy = 0; gy <= 8; gy += 0.75) {
							const [sx, sy] = projetar(gx, gy, z, c);
							const [bx, by] = inverter(sx, sy, z, c);
							expect(bx).toBeCloseTo(gx, 9);
							expect(by).toBeCloseTo(gy, 9);
						}
				}
	});

	it('o centro de cada quadrado cai em si mesmo ao inverter, e cada quadrado tem um centro só na tela', () => {
		for (const r of ROTACOES) {
			const c = cena(r, 7, 5);
			const vistos = new Set<string>();
			for (let x = 0; x < 7; x++)
				for (let y = 0; y < 5; y++) {
					const [sx, sy] = centro(x, y, 1, 0, c);
					const [gx, gy] = inverter(sx, sy, 0, c);
					expect([Math.floor(gx), Math.floor(gy)]).toEqual([x, y]);
					vistos.add(`${sx},${sy}`);
				}
			expect(vistos.size).toBe(35);
		}
	});

	it('girar a vista mantém os vizinhos a um tile de distância e leva quatro giros de volta ao começo', () => {
		const aresta = Math.hypot(32, 16);
		for (const r of ROTACOES) {
			const c = cena(r, 9, 6);
			const a = projetar(4.5, 3.5, 0, c);
			for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
				const b = projetar(4.5 + dx, 3.5 + dy, 0, c);
				expect(Math.hypot(b[0] - a[0], b[1] - a[1])).toBeCloseTo(aresta, 9);
			}
		}
		let c = cena(0);
		for (let i = 0; i < 4; i++) c = girarVista(c);
		expect(c.rotacao).toBe(0);
		expect(girarVista(cena(0), -1).rotacao).toBe(270);
		expect(girarVista(cena(270)).rotacao).toBe(0);
	});

	it('em 180° a vista é o espelho da de 0°: o que estava na frente passa para trás', () => {
		const a = cena(0);
		const b = cena(180);
		expect(projetar(0, 0, 0, a)[1]).toBeLessThan(projetar(12, 8, 0, a)[1]);
		expect(projetar(0, 0, 0, b)[1]).toBeGreaterThan(projetar(12, 8, 0, b)[1]);
	});

	it('elevação sobe o ponto na tela (eh px por metro)', () => {
		const c = cena(0);
		expect(projetar(3, 3, 2, c)[1]).toBe(projetar(3, 3, 0, c)[1] - 32);
		expect(projetar(3, 3, 2, c)[0]).toBe(projetar(3, 3, 0, c)[0]);
	});
});

describe('projeção isométrica: formas', () => {
	it('uma run vira um único paralelogramo e quadrados vizinhos viram uma run só', () => {
		const q: Ponto[] = [[2, 1], [3, 1], [4, 1], [4, 1], [7, 1], [0, 3]];
		expect(runsDeQuadrados(q)).toEqual([[1, 2, 4], [1, 7, 7], [3, 0, 0]]);
		for (const r of ROTACOES) {
			const c = cena(r);
			expect(area(paralelogramoRun([1, 2, 4], 0, c))).toBe(3 * 64 * 16);
		}
	});

	it('o caminho de uma lista de quadrados cobre a área da soma dos losangos', () => {
		const c = cena(90, 20, 20);
		const q: Ponto[] = [];
		for (let x = 3; x < 9; x++) for (let y = 4; y < 7; y++) q.push([x, y]);
		const poligonos = [...caminhoQuadrados(q, 0, c).matchAll(/M([^Z]+)Z/g)].map((m) => m[1].split('L').map((p) => p.split(' ').map(Number) as Ponto));
		expect(poligonos).toHaveLength(3);
		expect(poligonos.reduce((s, p) => s + area(p), 0)).toBeCloseTo(q.length * 64 * 16, 1);
		expect(caminhoLosango(1, 1, 3, 0, c).startsWith('M')).toBe(true);
	});

	it('o círculo de raio r na grade é a elipse r·Tw/√2 por r·Th/√2 na tela, em qualquer vista', () => {
		for (const r of ROTACOES) {
			const c = cena(r, 30, 30);
			const e = elipse(15, 12, 5, 0, c);
			for (let a = 0; a < Math.PI * 2; a += 0.3) {
				const [sx, sy] = projetar(15 + 5 * Math.cos(a), 12 + 5 * Math.sin(a), 0, c);
				expect(((sx - e.cx) / e.rx) ** 2 + ((sy - e.cy) / e.ry) ** 2).toBeCloseTo(1, 9);
			}
		}
	});

	it('o ângulo da grade e o da tela se desfazem; 45° na grade vira reta na tela', () => {
		for (const r of ROTACOES) {
			const c = cena(r);
			for (let a = -3; a <= 3; a += 0.25) {
				const volta = anguloNaGrade(anguloNaTela(a, c), c);
				expect(Math.cos(volta)).toBeCloseTo(Math.cos(a), 9);
				expect(Math.sin(volta)).toBeCloseTo(Math.sin(a), 9);
			}
		}
		// na vista de 0°, andar na diagonal (1, 1) da grade é descer reto na tela
		expect(anguloNaTela(Math.PI / 4, cena(0))).toBeCloseTo(Math.PI / 2, 9);
		// e o eixo x da grade desce a 26,57° (a diagonal do 2:1)
		expect(anguloNaTela(0, cena(0))).toBeCloseTo(Math.atan(0.5), 9);
	});

	it('a caixa da cena cobre os 4 cantos do mapa com folga, em todas as vistas', () => {
		for (const r of ROTACOES) {
			const c = cena(r, 12, 8);
			const caixa = caixaDaCena(c);
			for (const [gx, gy] of [[0, 0], [12, 0], [12, 8], [0, 8]]) {
				const [sx, sy] = projetar(gx, gy, 0, c);
				expect(sx).toBeGreaterThan(caixa.x);
				expect(sx).toBeLessThan(caixa.x + caixa.w);
				expect(sy).toBeGreaterThan(caixa.y);
				expect(sy).toBeLessThan(caixa.y + caixa.h);
			}
		}
		// 12 + 8 quadrados de aresta somados dão a largura do losango do mapa (sem a folga)
		const sem = caixaDaCena(cena(0), 0, 0);
		expect(sem.w).toBe((12 + 8) * 32);
		expect(sem.h).toBe((12 + 8) * 16);
	});
});

describe('projeção isométrica: ordem de pintura', () => {
	it('quem está mais perto da câmera é pintado depois, e a ordem se inverte ao girar 180°', () => {
		const itens = [
			{ id: 'longe', x: 1, y: 1 },
			{ id: 'perto', x: 6, y: 5 },
			{ id: 'meio', x: 3, y: 3 }
		];
		expect(ordemDePintura(itens, cena(0)).map((i) => i.id)).toEqual(['longe', 'meio', 'perto']);
		expect(ordemDePintura(itens, cena(180)).map((i) => i.id)).toEqual(['perto', 'meio', 'longe']);
	});

	it('um token grande usa o quadrado da frente do espaço dele', () => {
		const itens = [
			{ id: 'colosso', x: 2, y: 2, tamanho: 10 },
			{ id: 'pequeno', x: 8, y: 8 }
		];
		// o espaço do colosso vai até (11, 11): a frente dele passa a do pequeno em (8, 8)
		expect(ordemDePintura(itens, cena(0, 30, 30)).map((i) => i.id)).toEqual(['pequeno', 'colosso']);
	});

	it('empate resolve por elevação e depois pelo id, sempre igual', () => {
		const itens = [
			{ id: 'b', x: 4, y: 4, z: 0 },
			{ id: 'a', x: 4, y: 4, z: 0 },
			{ id: 'alto', x: 4, y: 4, z: 3 }
		];
		const o = ordemDePintura(itens, cena(0)).map((i) => i.id);
		expect(o).toEqual(['a', 'b', 'alto']);
		expect(ordemDePintura([...itens].reverse(), cena(0)).map((i) => i.id)).toEqual(o);
	});

	it('em qualquer vista, o token de y maior na tela é pintado depois do de y menor', () => {
		for (const r of ROTACOES) {
			const c = cena(r, 10, 10);
			const um = { id: 'um', x: 2, y: 3 };
			const outro = { id: 'outro', x: 6, y: 5 };
			const yUm = centro(um.x, um.y, 1, 0, c)[1];
			const yOutro = centro(outro.x, outro.y, 1, 0, c)[1];
			const ordem = ordemDePintura([um, outro], c).map((i) => i.id);
			expect(ordem[1]).toBe(yOutro > yUm ? 'outro' : 'um');
		}
	});
});

describe('projeção isométrica: matriz do chão e itens de pé', () => {
	const aplica = (m: number[], x: number, y: number): Ponto => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
	/** Aplica um `transform` SVG (lista de translate e matrix) a um ponto: da direita para a esquerda, como o SVG faz. */
	const svg = (t: string, px: number, py: number): Ponto => {
		const partes = [...t.matchAll(/(translate|matrix)\(([^)]*)\)/g)].map((q) => ({ tipo: q[1], v: q[2].split(' ').map(Number) }));
		let p: Ponto = [px, py];
		for (const o of partes.reverse()) p = o.tipo === 'translate' ? [p[0] + o.v[0], p[1] + o.v[1]] : aplica(o.v, p[0], p[1]);
		return p;
	};

	it('a matriz leva cada ponto da grade ao mesmo lugar que projetar, nas 4 vistas', () => {
		for (const r of ROTACOES) {
			const c = cena(r, 12, 8);
			const m = matrizIso(c);
			for (const [gx, gy] of [[0, 0], [3.5, 2], [12, 8], [7.25, 0.5]]) {
				const [ax, ay] = aplica(m, gx, gy);
				const [bx, by] = projetar(gx, gy, 0, c);
				expect(ax).toBeCloseTo(bx, 9);
				expect(ay).toBeCloseTo(by, 9);
			}
		}
	});

	it('a inversa da matriz desfaz a matriz, e o transform de desfazer é uma matriz', () => {
		for (const r of ROTACOES) {
			const m = matrizIso(cena(r));
			const [x, y] = aplica(inversa(m), ...aplica(m, 5.5, 3.25));
			expect(x).toBeCloseTo(5.5, 9);
			expect(y).toBeCloseTo(3.25, 9);
		}
		expect(desfazerProjecao(cena(0)).startsWith('matrix(')).toBe(true);
	});

	it('de pé: o apoio fica onde estava e o resto sai sem inclinação, na mesma escala (nas 4 vistas)', () => {
		for (const r of ROTACOES) {
			const c = cena(r, 12, 8, { tw: 1, eh: 0.25 });
			const m = matrizIso(c);
			const t = emPe(4.5, 3.5, 0, c);
			const base = aplica(m, 4.5, 3.5);
			const apoio = aplica(m, ...svg(t, 4.5, 3.5));
			expect(apoio[0]).toBeCloseTo(base[0], 9);
			expect(apoio[1]).toBeCloseTo(base[1], 9);
			// 0,4 m à direita e 0,3 m acima do apoio, no desenho, ficam assim na tela
			const dir = aplica(m, ...svg(t, 4.9, 3.5));
			expect(dir[0] - base[0]).toBeCloseTo(0.4, 9);
			expect(dir[1] - base[1]).toBeCloseTo(0, 9);
			const cima = aplica(m, ...svg(t, 4.5, 3.2));
			expect(cima[0] - base[0]).toBeCloseTo(0, 9);
			expect(cima[1] - base[1]).toBeCloseTo(-0.3, 9);
		}
	});

	it('de pé com "sobe": o desenho todo sobe na tela', () => {
		const c = cena(90, 12, 8, { tw: 1, eh: 0.25 });
		const m = matrizIso(c);
		const base = aplica(m, 4.5, 3.5);
		const fim = aplica(m, ...svg(emPe(4.5, 3.5, 0.6, c), 4.5, 3.5));
		expect(fim[0]).toBeCloseTo(base[0], 9);
		expect(fim[1]).toBeCloseTo(base[1] - 0.6, 9);
	});
});
