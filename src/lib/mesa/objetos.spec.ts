import { describe, expect, it } from 'vitest';
import { alcas, camadaRank, caixa, caixaDePe, contraste, dentro, limitar, medidaTexto, objetoEm, objetoEmTela, tamanhoInicial } from './objetos.ts';
import { cfgIso, projetar } from './projecao.ts';

const img = { tipo: 'imagem' as const, x: 10, y: 10, largura: 6, altura: 2, texto: null, tamanho: null, rotacao: 0 };

describe('objetos da cena', () => {
	it('a caixa da imagem é a do tamanho, e girar leva o clique junto', () => {
		expect(caixa(img)).toEqual({ cx: 10, cy: 10, hw: 3, hh: 1 });
		expect(dentro(img, 12.5, 10.5)).toBe(true);
		expect(dentro(img, 10, 11.5)).toBe(false);
		// girada 90°, a imagem comprida fica em pé
		const girada = { ...img, rotacao: 90 };
		expect(dentro(girada, 10, 12.5)).toBe(true);
		expect(dentro(girada, 12.5, 10)).toBe(false);
	});

	it('o alfinete se pega pela cabeça, acima da ponta', () => {
		const a = { tipo: 'alfinete' as const, x: 5, y: 5, largura: null, altura: null, texto: null, tamanho: null };
		expect(dentro(a, 5, 4.5)).toBe(true);
		expect(dentro(a, 5, 5.4)).toBe(false);
		expect(dentro(a, 5, 3.8)).toBe(true);
		expect(dentro(a, 5, 3.6)).toBe(false);
	});

	it('o texto cresce com o tamanho e com as linhas', () => {
		const um = medidaTexto({ texto: 'Ponte', tamanho: 1 });
		const dois = medidaTexto({ texto: 'Ponte\nquebrada', tamanho: 1 });
		expect(dois.w).toBeGreaterThan(um.w);
		expect(dois.h).toBeGreaterThan(um.h);
		expect(medidaTexto({ texto: 'Ponte', tamanho: 2 }).w).toBeCloseTo(um.w * 2);
	});

	it('o objeto mais acima ganha o clique, e o mais novo desempata', () => {
		const a = { ...img, id: 'a', ordem: 0, criado_em: '2026-11-06T10:00:00Z' };
		const b = { ...img, id: 'b', ordem: 0, criado_em: '2026-11-06T11:00:00Z' };
		const c = { ...img, id: 'c', ordem: 5, criado_em: '2026-11-06T09:00:00Z' };
		expect(objetoEm([a, b], 10, 10)?.id).toBe('b');
		expect(objetoEm([a, b, c], 10, 10)?.id).toBe('c');
		expect(objetoEm([a], 40, 40)).toBeNull();
	});

	it('limites, tamanho inicial e alças', () => {
		expect(limitar(-10, 40)).toBe(-2);
		expect(limitar(100, 40)).toBe(42);
		expect(tamanhoInicial(2048, 1024, 8)).toEqual({ largura: 8, altura: 4 });
		expect(tamanhoInicial(1, 1000, 8)).toEqual({ largura: 0.25, altura: 8 });
		const al = alcas(img);
		expect(al.canto).toEqual({ x: 13, y: 11 });
		expect(al.girar.y).toBeCloseTo(8.1);
		const g = alcas({ ...img, rotacao: 90 });
		expect(g.canto.x).toBeCloseTo(9);
		expect(g.canto.y).toBeCloseTo(13);
	});

	it('o contorno do texto contrasta com a cor', () => {
		expect(contraste('#ffffff')).toBe('#1b1210');
		expect(contraste('#1b1210')).toBe('#f4e4d6');
		expect(contraste('#c44536')).toBe('#f4e4d6');
		expect(contraste(null)).toBe('#1b1210');
	});
});

describe('objetos de pé na vista isométrica', () => {
	const cfg = cfgIso(20, 20, { tw: 1, eh: 0.25 });
	const ancora = (x: number, y: number) => projetar(x, y, 0, cfg);
	const arvore = { ...img, x: 8, y: 9, largura: 2, altura: 3, ordem: 0, criado_em: '2026-01-01' };
	const pin = { tipo: 'alfinete' as const, x: 3, y: 3, largura: null, altura: null, texto: null, tamanho: null, rotacao: 0, ordem: 0, criado_em: '2026-01-02' };

	it('a imagem fica de pé sobre o apoio: a caixa sobe a meia altura; o alfinete e o texto seguem a caixa da vista de cima', () => {
		expect(caixaDePe(arvore)).toEqual({ dx: 0, dy: -1.5, hw: 1, hh: 1.5 });
		expect(caixaDePe(pin).dy).toBeCloseTo(-0.55, 9);
	});

	it('o clique acerta o sprite (acima do apoio) e não o chão atrás dele', () => {
		const [bx, by] = ancora(arvore.x, arvore.y);
		expect(objetoEmTela([arvore], bx, by - 1.5, ancora)).toBe(arvore);
		expect(objetoEmTela([arvore], bx + 0.9, by - 0.1, ancora)).toBe(arvore);
		expect(objetoEmTela([arvore], bx + 1.2, by - 1.5, ancora)).toBeNull();
		expect(objetoEmTela([arvore], bx, by - 3.2, ancora)).toBeNull();
		// o quadrado de grade onde a árvore está, visto de cima, já não é onde se clica
		const [gx, gy] = ancora(arvore.x - 3, arvore.y);
		expect(objetoEmTela([arvore], gx, gy, ancora)).toBeNull();
	});

	it('entre dois objetos no mesmo ponto vale o de maior ordem, depois o mais novo', () => {
		const velho = { ...pin, ordem: 1, criado_em: '2026-01-01' };
		const novo = { ...pin, ordem: 1, criado_em: '2026-02-01' };
		const [bx, by] = ancora(3, 3);
		expect(objetoEmTela([velho, novo], bx, by - 0.5, ancora)).toBe(novo);
		expect(objetoEmTela([velho, { ...novo, ordem: 0 }], bx, by - 0.5, ancora)).toBe(velho);
	});
});

describe('camadas das imagens', () => {
	const base = { ...img, ordem: 0, criado_em: '2026-01-01' };
	const chao = { ...base, camada: 'chao' as const, criado_em: '2026-03-01' };
	const meio = { ...base, camada: 'meio' as const };
	const acima = { ...base, camada: 'acima' as const, criado_em: '2026-01-01' };
	const pin = { tipo: 'alfinete' as const, x: 10, y: 10.5, largura: null, altura: null, texto: null, tamanho: null, rotacao: 0, ordem: -5, criado_em: '2025-01-01' };

	it('a ordem de cima para baixo é alfinete e texto, acima, meio e chão (sem camada vale meio)', () => {
		expect(camadaRank(pin)).toBe(3);
		expect([acima, meio, chao].map(camadaRank)).toEqual([2, 1, 0]);
		expect(camadaRank({ ...base })).toBe(1);
	});

	it('o clique pega a camada de cima primeiro, mesmo com ordem menor ou mais velha', () => {
		expect(objetoEm([chao, meio, acima], 10, 10)).toBe(acima);
		expect(objetoEm([chao, meio], 10, 10)).toBe(meio);
		expect(objetoEm([chao], 10, 10)).toBe(chao);
		// dentro da mesma camada vale a ordem do Mestre
		expect(objetoEm([{ ...meio, ordem: 2 }, { ...meio, ordem: 7, criado_em: '2025-01-01' }], 10, 10)?.ordem).toBe(7);
	});

	it('o alfinete fica por cima das imagens de qualquer camada', () => {
		expect(objetoEm([acima, pin], 10, 10)).toBe(pin);
	});
});
