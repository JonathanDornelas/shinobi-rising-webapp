import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { camposDaCena, lerFingersMap, pontosDaPeca } from './fingersmap.ts';
import { camadasDaCena } from './camadas.ts';
import { caixaDaCena, cfgIso, ordemDePintura, projetar } from './projecao.ts';
import { caixaDePe } from './objetos.ts';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0]);
const WEBP = new Uint8Array([...strToU8('RIFF'), 1, 0, 0, 0, ...strToU8('WEBP'), 0]);

const cena = (extra: Record<string, unknown> = {}) => ({
	versao: 1,
	nome: 'Rua de Konoha',
	largura: 72,
	altura: 72,
	fundo: { arquivo: 'fundo.png', x: -36, y: -8, w: 72, h: 39.4 },
	pecas: [{ arquivo: 'pecas/000.webp', x: 10.5, y: 7, largura: 0.5, altura: 1.75, desce: 0.125, camada: 'meio' }],
	paredes: [[0, 0, 4, 0, 0]],
	luzes: [{ id: 'l1', x: 2, y: 3, plena: 4, penumbra: 4, acesa: true }],
	ambiente: 'penumbra',
	clima: 'chuva',
	...extra
});
const pacote = (c: unknown = cena(), arquivos: Record<string, Uint8Array> = { 'fundo.png': PNG, 'pecas/000.webp': WEBP }) => zipSync({ 'cena.json': strToU8(JSON.stringify(c)), ...arquivos });

describe('lerFingersMap', () => {
	it('lê a cena e as imagens', () => {
		const m = lerFingersMap(pacote());
		expect(m.nome).toBe('Rua de Konoha');
		expect([m.largura, m.altura, m.ambiente, m.clima]).toEqual([72, 72, 'penumbra', 'chuva']);
		expect(m.fundo).toMatchObject({ x: -36, y: -8, w: 72, h: 39.4 });
		expect([...m.fundo.imagem]).toEqual([...PNG]);
		expect(m.pecas[0]).toMatchObject({ x: 10.5, y: 7, desce: 0.125, camada: 'meio' });
		expect([...m.pecas[0].imagem]).toEqual([...WEBP]);
		expect(m.paredes).toEqual([[0, 0, 4, 0, 0]]);
		expect(m.luzes).toHaveLength(1);
	});

	it('recusa o que não é uma cena', () => {
		expect(() => lerFingersMap(new Uint8Array([1, 2, 3]))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(zipSync({ 'a.txt': strToU8('oi') }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote({ nome: 'sem versão' }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(zipSync({ 'cena.json': strToU8('{oi') }))).toThrow(/fingersMap/);
	});

	it('avisa quando a versão é mais nova ou o mapa é grande demais', () => {
		expect(() => lerFingersMap(pacote(cena({ versao: 2 })))).toThrow(/mais nova/);
		expect(() => lerFingersMap(pacote(cena({ largura: 201 })))).toThrow(/200 × 200/);
		expect(() => lerFingersMap(pacote(cena({ pecas: Array.from({ length: 301 }, () => cena().pecas[0]) })))).toThrow(/300/);
	});

	it('recusa imagem que não é a que diz ser, ou que falta', () => {
		expect(() => lerFingersMap(pacote(cena(), { 'fundo.png': WEBP, 'pecas/000.webp': WEBP }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote(cena(), { 'fundo.png': PNG, 'pecas/000.webp': PNG }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote(cena(), { 'fundo.png': PNG }))).toThrow(/fingersMap/);
	});

	it('não abre o que está fora do formato, como um caminho que sobe de pasta', () => {
		const m = cena({ pecas: [{ ...cena().pecas[0], arquivo: '../../segredo.webp' }] });
		expect(() => lerFingersMap(pacote(m, { 'fundo.png': PNG, '../../segredo.webp': WEBP }))).toThrow(/fingersMap/);
	});

	it('recusa peça fora dos limites do banco', () => {
		for (const ruim of [{ largura: 0.1 }, { altura: 500 }, { x: 900 }, { desce: -1 }, { desce: Number.NaN }, { camada: 'chao' }]) {
			expect(() => lerFingersMap(pacote(cena({ pecas: [{ ...cena().pecas[0], ...ruim }] })))).toThrow(/fingersMap/);
		}
	});

	it('limpa paredes, luzes, ambiente e clima que não servem', () => {
		const m = lerFingersMap(pacote(cena({ paredes: [[0, 0, 4, 0, 9], [1, 1, 900, 1, 0]], luzes: [{ id: 3 }], ambiente: 'sol', clima: 'fogo' })));
		expect(m.paredes).toEqual([]);
		expect(m.luzes).toEqual([]);
		expect([m.ambiente, m.clima]).toEqual(['claro', null]);
	});
});

describe('camposDaCena', () => {
	it('mede o fundo a partir do canto da caixa da cena, que é onde a Mesa o desenha', () => {
		const m = lerFingersMap(pacote());
		const cfg = cfgIso(m.largura, m.altura, { tw: 1, eh: 0.25, razao: 2, rotacao: 0 });
		const b = caixaDaCena(cfg, 0, 0);
		const c = camposDaCena(m, b);
		expect(b.x + c.fundo_x).toBe(m.fundo.x);
		expect(b.y + c.fundo_y).toBe(m.fundo.y);
		expect(c.fundo_escala).toBe(m.fundo.w);
		expect(c).toMatchObject({ visao: 'isometrica', iso_razao: 2, iso_rotacao: 0, luz_dinamica: true, luz_ambiente: 'penumbra' });
	});

	it('usa a mesma tela do fingersMap: 64 px por metro de tela e a mesma origem', () => {
		const cfg = cfgIso(72, 72, { tw: 1, eh: 0.25, razao: 2, rotacao: 0 });
		const [sx, sy] = projetar(10, 4, 0, cfg);
		expect([sx * 64, sy * 64]).toEqual([(10 - 4) * 32, (10 + 4) * 16]);
	});
});

describe('a peça entre os tokens', () => {
	const cfg = cfgIso(30, 30, { tw: 1, eh: 0.25, razao: 2, rotacao: 0 });
	/** A mesma conta do quadro: tokens e imagens em espaço 1 × 1 em volta do centro ou do apoio. */
	const ordem = (peca: { x: number; y: number }, token: { x: number; y: number; n: number }) =>
		ordemDePintura(
			[
				{ id: 'Tt', x: token.x + token.n / 2 - 0.5, y: token.y + token.n / 2 - 0.5, tamanho: 1, z: 0 },
				{ id: 'Ip', x: peca.x - 0.5, y: peca.y - 0.5, tamanho: 1, z: 0 }
			],
			cfg
		).map((i) => i.id);
	// um trecho de parede ao longo de x, com o pé sobre ela, entre (4, 7) e (5, 7)
	const parede = { x: 4.5, y: 7 };

	it('fica na frente do token de 1 quadrado atrás da parede', () => {
		expect(ordem(parede, { x: 4, y: 6, n: 1 })).toEqual(['Tt', 'Ip']);
	});

	it('fica atrás do token de 1 quadrado na frente da parede', () => {
		expect(ordem(parede, { x: 4, y: 7, n: 1 })).toEqual(['Ip', 'Tt']);
	});

	it('vale também para token grande, em cada quadrado da parede que ele cobre', () => {
		for (const x of [2, 3, 4]) {
			expect(ordem({ x: x + 0.5, y: 7 }, { x: 2, y: 4, n: 3 })).toEqual(['Tt', 'Ip']);
			expect(ordem({ x: x + 0.5, y: 7 }, { x: 2, y: 7, n: 3 })).toEqual(['Ip', 'Tt']);
		}
	});
});

describe('a peça na tela', () => {
	it('desce abaixo do apoio na caixa de pé', () => {
		const o = { tipo: 'imagem' as const, x: 3, y: 4, largura: 2, altura: 4, desce: 0.5, texto: null, tamanho: null };
		expect(caixaDePe(o)).toEqual({ dx: 0, dy: -1.5, hw: 1, hh: 2 });
	});

	it('sem desce, a base fica no apoio, como antes', () => {
		const o = { tipo: 'imagem' as const, x: 3, y: 4, largura: 2, altura: 4, texto: null, tamanho: null };
		expect(caixaDePe(o).dy).toBe(-2);
	});

	it('as camadas das peças existem na pilha padrão: o meio em pé e o acima sobre os tokens', () => {
		const pilha = camadasDaCena(null);
		expect(pilha.find((c) => c.id === 'meio')?.em_pe).toBe(true);
		expect(pilha.findIndex((c) => c.id === 'acima')).toBeGreaterThan(pilha.findIndex((c) => c.tipo === 'tokens'));
	});
});

describe('pontosDaPeca', () => {
	it('olha os dois lados de um trecho de parede', () => {
		const pontos = pontosDaPeca({ x: 4.5, y: 7, largura: 0.5, desce: 0.1 });
		expect(pontos.some(([, y]) => y < 7)).toBe(true);
		expect(pontos.some(([, y]) => y > 7)).toBe(true);
	});

	it('sai do corpo de um prédio', () => {
		// 6 × 6, com o apoio no meio: a figura tem 6 de largura e desce 1,5
		const fora = pontosDaPeca({ x: 10, y: 10, largura: 6, desce: 1.5 }).slice(1);
		for (const [x, y] of fora) expect(Math.abs(x - 10) >= 3 || Math.abs(y - 10) >= 3).toBe(true);
	});

	it('segue a projeção: cada ponto cai onde foi pedido na tela', () => {
		const cfg = cfgIso(30, 30, { tw: 1, eh: 0.25, razao: 2, rotacao: 0 });
		const [apoio, esquerda] = pontosDaPeca({ x: 10, y: 10, largura: 3, desce: 0.75 });
		const [ax, ay] = projetar(apoio[0], apoio[1], 0, cfg);
		const [ex, ey] = projetar(esquerda[0], esquerda[1], 0, cfg);
		expect(ex).toBeCloseTo(ax - 1.7);
		expect(ey).toBeCloseTo(ay);
	});
});
