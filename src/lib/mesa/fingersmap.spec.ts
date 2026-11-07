import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { camposDaCena, lerFingersMap, pontosDaPeca } from './fingersmap.ts';
import { alturaAoAndar, lerMapaVivo, proximoNivel } from './mapa-vivo.ts';
import { cenaDoAviso } from './cenas.ts';
import { caixaDaCena, cfgIso, ordemDePintura, projetar } from './projecao.ts';
import { caixaDePe } from './objetos.ts';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0]);
const FMAP = new Uint8Array([0x50, 0x4b, 3, 4, 0, 0]);
const GZIP = new Uint8Array([0x1f, 0x8b, 8, 0, 0]);
const LISTA = strToU8('{"version":1,"sprites":[]}');

const cena = (extra: Record<string, unknown> = {}) => ({
	versao: 2,
	nome: 'Rua de Konoha',
	largura: 72,
	altura: 72,
	andar: 1,
	acima: true,
	fundo: { arquivo: 'fundo.png', x: -36, y: -8, w: 72, h: 39.4 },
	mapa: 'mapa.fmap',
	pacote: 'pacote',
	ar: { hora: 21, clima: 'rain', forca: 0.5, vento: 0.2 },
	paredes: [[0, 0, 4, 0, 0]],
	luzes: [{ id: 'l1', x: 2, y: 3, plena: 4, penumbra: 4, acesa: true }],
	ambiente: 'penumbra',
	...extra
});
const ARQUIVOS = { 'fundo.png': PNG, 'mapa.fmap': FMAP, 'pacote.json': LISTA, 'pacote.pack': GZIP };
const pacote = (c: unknown = cena(), arquivos: Record<string, Uint8Array> = ARQUIVOS) => zipSync({ 'cena.json': strToU8(JSON.stringify(c)), ...arquivos });

describe('lerFingersMap', () => {
	it('lê a cena e os arquivos', () => {
		const m = lerFingersMap(pacote());
		expect(m.nome).toBe('Rua de Konoha');
		expect([m.largura, m.altura, m.andar, m.acima, m.ambiente]).toEqual([72, 72, 1, true, 'penumbra']);
		expect(m.fundo).toMatchObject({ x: -36, y: -8, w: 72, h: 39.4 });
		expect(m.ar).toEqual({ hora: 21, clima: 'rain', forca: 0.5, vento: 0.2 });
		expect([...m.fundo.imagem]).toEqual([...PNG]);
		expect([...m.mapa]).toEqual([...FMAP]);
		expect([...m.pacotePixels]).toEqual([...GZIP]);
		expect(m.paredes).toEqual([[0, 0, 4, 0, 0]]);
		expect(m.luzes).toHaveLength(1);
	});

	it('recusa o que não é uma cena', () => {
		expect(() => lerFingersMap(new Uint8Array([1, 2, 3]))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(zipSync({ 'a.txt': strToU8('oi') }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote({ nome: 'sem versão' }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(zipSync({ 'cena.json': strToU8('{oi') }))).toThrow(/fingersMap/);
	});

	it('avisa quando a versão é outra ou o mapa é grande demais', () => {
		expect(() => lerFingersMap(pacote(cena({ versao: 3 })))).toThrow(/mais nova/);
		expect(() => lerFingersMap(pacote(cena({ versao: 1 })))).toThrow(/Exporte de novo/);
		expect(() => lerFingersMap(pacote(cena({ largura: 201 })))).toThrow(/200 × 200/);
	});

	it('recusa arquivo que não é o que diz ser, ou que falta', () => {
		expect(() => lerFingersMap(pacote(cena(), { ...ARQUIVOS, 'fundo.png': GZIP }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote(cena(), { ...ARQUIVOS, 'mapa.fmap': GZIP }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote(cena(), { ...ARQUIVOS, 'pacote.pack': FMAP }))).toThrow(/fingersMap/);
		expect(() => lerFingersMap(pacote(cena(), { ...ARQUIVOS, 'pacote.json': strToU8('{oi') }))).toThrow(/fingersMap/);
		const { 'mapa.fmap': _, ...semMapa } = ARQUIVOS;
		expect(() => lerFingersMap(pacote(cena(), semMapa))).toThrow(/fingersMap/);
	});

	it('não abre o que está fora da lista, como um caminho que sobe de pasta', () => {
		const m = lerFingersMap(pacote(cena(), { ...ARQUIVOS, '../../segredo.webp': PNG }));
		expect(Object.keys(m)).not.toContain('../../segredo.webp');
	});

	it('limpa paredes, luzes, ambiente e ar que não servem', () => {
		const m = lerFingersMap(pacote(cena({ paredes: [[0, 0, 4, 0, 9], [1, 1, 900, 1, 0]], luzes: [{ id: 3 }], ambiente: 'sol', ar: { hora: 40, clima: 'fogo', forca: 3 } })));
		expect(m.paredes).toEqual([]);
		expect(m.luzes).toEqual([]);
		expect(m.ambiente).toBe('claro');
		expect(m.ar).toEqual({ hora: 10, clima: 'clear', forca: 0.7, vento: 0.3 });
	});
});

describe('camposDaCena', () => {
	it('mede a imagem a partir do canto da caixa da cena, que é onde a Mesa a desenha', () => {
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

describe('lerMapaVivo', () => {
	const certo = { mapa: '11111111-2222-3333-4444-555555555555/lote-1/mapa.fmap', pacote: '11111111-2222-3333-4444-555555555555/lote-1/pacote', andar: 1, acima: true, hora: 21.5, clima: 'rain', forca: 0.4, vento: 0.1, telhados: false, corte: true };

	it('lê o que a cena guarda', () => {
		expect(lerMapaVivo(certo)).toEqual(certo);
	});

	it('uma cena comum não tem mapa vivo', () => {
		expect(lerMapaVivo(null)).toBeNull();
		expect(lerMapaVivo(undefined)).toBeNull();
		expect(lerMapaVivo({})).toBeNull();
	});

	it('não aceita caminho estranho, que viraria um pedido de rede', () => {
		expect(lerMapaVivo({ ...certo, mapa: 'https://exemplo.com/mapa.fmap' })).toBeNull();
		expect(lerMapaVivo({ ...certo, pacote: '../../outra/coisa' })).toBeNull();
	});

	it('segura os números e o clima no que o motor entende', () => {
		const v = lerMapaVivo({ ...certo, hora: 99, forca: -2, vento: 'muito', clima: 'fogo', andar: 3.4 })!;
		expect([v.hora, v.forca, v.vento, v.clima, v.andar]).toEqual([24, 0, 0.3, 'clear', 3]);
	});
});

describe('a ordem no quadro', () => {
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

	it('a imagem fica na frente do token de 1 quadrado atrás dela', () => {
		expect(ordem(parede, { x: 4, y: 6, n: 1 })).toEqual(['Tt', 'Ip']);
	});

	it('a imagem fica atrás do token de 1 quadrado na frente dela', () => {
		expect(ordem(parede, { x: 4, y: 7, n: 1 })).toEqual(['Ip', 'Tt']);
	});

	it('vale também para token grande, em cada quadrado da parede que ele cobre', () => {
		for (const x of [2, 3, 4]) {
			expect(ordem({ x: x + 0.5, y: 7 }, { x: 2, y: 4, n: 3 })).toEqual(['Tt', 'Ip']);
			expect(ordem({ x: x + 0.5, y: 7 }, { x: 2, y: 7, n: 3 })).toEqual(['Ip', 'Tt']);
		}
	});
});

describe('as peças antigas, de antes do mapa vivo', () => {
	it('descem abaixo do apoio na caixa de pé', () => {
		const o = { tipo: 'imagem' as const, x: 3, y: 4, largura: 2, altura: 4, desce: 0.5, texto: null, tamanho: null };
		expect(caixaDePe(o)).toEqual({ dx: 0, dy: -1.5, hw: 1, hh: 2 });
	});

	it('sem desce, a base fica no apoio', () => {
		const o = { tipo: 'imagem' as const, x: 3, y: 4, largura: 2, altura: 4, texto: null, tamanho: null };
		expect(caixaDePe(o).dy).toBe(-2);
	});

	it('olham os dois lados de um trecho de parede', () => {
		const pontos = pontosDaPeca({ x: 4.5, y: 7, largura: 0.5, desce: 0.1 });
		expect(pontos.some(([, y]) => y < 7)).toBe(true);
		expect(pontos.some(([, y]) => y > 7)).toBe(true);
	});

	it('saem do corpo de um prédio', () => {
		// 6 × 6, com o apoio no meio: a figura tem 6 de largura e desce 1,5
		const fora = pontosDaPeca({ x: 10, y: 10, largura: 6, desce: 1.5 }).slice(1);
		for (const [x, y] of fora) expect(Math.abs(x - 10) >= 3 || Math.abs(y - 10) >= 3).toBe(true);
	});
});

describe('andar pelas alturas', () => {
	it('segue na superfície em que está, e sobe um degrau', () => {
		expect(alturaAoAndar([0, 3.2], 3.2)).toBe(3.2);
		expect(alturaAoAndar([0, 3.4], 3.2)).toBe(3.4);
		expect(alturaAoAndar([0, 0.4], 0)).toBe(0.4);
	});

	it('não sobe sozinho no que é alto', () => {
		expect(alturaAoAndar([0, 3.2], 0)).toBe(0);
	});

	it('cai na superfície de baixo quando a sua acaba', () => {
		expect(alturaAoAndar([0], 3.2)).toBe(0);
		expect(alturaAoAndar([0, 0.8], 3.2)).toBe(0.8);
	});

	it('acha a próxima para cima e para baixo', () => {
		const niveis = [0, 0.7, 3.2];
		expect(proximoNivel(niveis, 0, 1)).toBe(0.7);
		expect(proximoNivel(niveis, 0.7, 1)).toBe(3.2);
		expect(proximoNivel(niveis, 3.2, 1)).toBeNull();
		expect(proximoNivel(niveis, 3.2, -1)).toBe(0.7);
		expect(proximoNivel(niveis, 0, -1)).toBeNull();
	});
});

describe('o aviso de uma cena', () => {
	const paredes = [[0, 0, 4, 0, 0]];

	it('o que o aviso não traz fica como estava: o bug da luz dinâmica', () => {
		const antiga = { id: 'c', luz_dinamica: true, paredes, reveladas: [[1, 2, 3]] };
		const c = cenaDoAviso({ id: 'c', luz_dinamica: false } as typeof antiga, antiga);
		expect(c).toEqual({ id: 'c', luz_dinamica: false, paredes, reveladas: [[1, 2, 3]] });
	});

	it('o que mudou vale, mesmo que vire vazio ou nulo', () => {
		const antiga = { id: 'c', paredes, fundo: 'a' as string | null, mapa_vivo: { hora: 3 } as object | null };
		const c = cenaDoAviso({ id: 'c', paredes: [], fundo: null, mapa_vivo: null } as typeof antiga, antiga);
		expect(c).toEqual({ id: 'c', paredes: [], fundo: null, mapa_vivo: null });
	});

	it('uma coluna com a forma errada não entra no lugar da certa', () => {
		const antiga = { id: 'c', paredes, iniciativa: { rodada: 2 } };
		const c = cenaDoAviso({ id: 'c', paredes: 'unchanged_toast', iniciativa: [] } as unknown as typeof antiga, antiga);
		expect(c).toEqual(antiga);
	});

	it('uma cena nova entra como veio', () => {
		const nova = { id: 'c', paredes };
		expect(cenaDoAviso(nova, undefined)).toBe(nova);
	});
});
