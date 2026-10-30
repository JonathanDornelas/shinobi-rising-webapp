import { describe, expect, it } from 'vitest';
import { caixaDaCenaEmQuadrados, gradeNoMapa, fatorDosQuadrados, fundoPorFator, larguraPadraoDoFundo } from './fundo.ts';
import { cfgIso, projetar } from './projecao.ts';

const topo = { largura: 40, altura: 30, iso: false, razao: 2 };
const iso = { largura: 12, altura: 30, iso: true, razao: 2 };

describe('fundo da cena: tamanho dos quadrados', () => {
	it('na vista de cima o padrão é a cena inteira; na isométrica, a largura do losango do mapa (metade de largura + altura)', () => {
		expect(larguraPadraoDoFundo(topo)).toBe(40);
		expect(larguraPadraoDoFundo(iso)).toBe(21);
		expect(caixaDaCenaEmQuadrados(iso).h).toBe(10.5);
		expect(larguraPadraoDoFundo({ ...iso, razao: 1.5 })).toBe(21);
		expect(caixaDaCenaEmQuadrados({ ...iso, razao: 1.5 }).h).toBeCloseTo(14, 9);
	});

	it('a largura do padrão isométrico é a que a projeção dá ao mapa (o encaixe automático antes usava o dobro)', () => {
		const c = cfgIso(12, 30, { tw: 1 });
		const xs = [projetar(0, 0, 0, c), projetar(12, 0, 0, c), projetar(12, 30, 0, c), projetar(0, 30, 0, c)].map((p) => p[0]);
		expect(Math.max(...xs) - Math.min(...xs)).toBe(larguraPadraoDoFundo(iso));
	});

	it('fator 1 é o padrão; maior que 1 deixa os quadrados maiores (a imagem cobre menos quadrados)', () => {
		expect(fatorDosQuadrados(null, topo)).toBe(1);
		expect(fatorDosQuadrados(40, topo)).toBe(1);
		expect(fatorDosQuadrados(20, topo)).toBe(2);
		expect(fatorDosQuadrados(80, topo)).toBe(0.5);
		expect(fatorDosQuadrados(10.5, iso)).toBe(2);
	});

	it('o fundo para um fator mantém a proporção e fica centrado na cena', () => {
		// imagem 2:1 (altura ÷ largura = 0,5), quadrados com o dobro do tamanho
		const f = fundoPorFator(2, 0.5, topo);
		expect(f).toEqual({ fundo_escala: 20, fundo_x: 10, fundo_y: 10 });
		// quadrados com metade do tamanho: a imagem passa da cena dos dois lados
		expect(fundoPorFator(0.5, 0.5, topo)).toEqual({ fundo_escala: 80, fundo_x: -20, fundo_y: -5 });
		// na isométrica o centro é o do losango
		const g = fundoPorFator(2, 0.5, iso);
		expect(g.fundo_escala).toBe(10.5);
		expect(g.fundo_x).toBe(5.25);
		expect(g.fundo_y).toBeCloseTo((10.5 - 5.25) / 2, 2);
	});

	it('o fator fica entre 25% e 400%', () => {
		expect(fundoPorFator(10, 1, topo).fundo_escala).toBe(10);
		expect(fundoPorFator(0.01, 1, topo).fundo_escala).toBe(160);
	});

	it('ida e volta: o fator gravado volta a ser o mesmo', () => {
		for (const c of [topo, iso, { ...iso, razao: 1.75 }])
			for (const f of [0.25, 0.5, 1, 1.5, 3, 4]) expect(fatorDosQuadrados(fundoPorFator(f, 0.6, c).fundo_escala, c)).toBeCloseTo(f, 1);
	});
});

describe('redimensionar a grade sobre o mapa', () => {
	it('quadrados desenhados de 1,5 m viram quadrados de 1 m, e a cena fica com os inteiros que cabem', () => {
		// imagem de 30 × 18 m no canto (0, 0); um cruzamento desenhado em (0,6; 0,3), quadrados de 1,5 m
		const r = gradeNoMapa({ x: 0, y: 0, w: 30, h: 18 }, { x: 0.6, y: 0.3, lado: 1.5 });
		// 0,6 m antes do cruzamento (não cabe um quadrado inteiro) e 29,4 m depois: 19 colunas; 17,7 m: 11 linhas
		expect(r).toMatchObject({ largura: 19, altura: 11, fundo_escala: 20 });
		// o cruzamento cai num cruzamento da cena nova (0, 0)
		expect(r.fundo_x + 0.6 / 1.5).toBeCloseTo(0, 5);
		expect(r.fundo_y + 0.3 / 1.5).toBeCloseTo(0, 5);
	});
	it('a grade que já casa não muda nada', () => {
		expect(gradeNoMapa({ x: 0, y: 0, w: 30, h: 20 }, { x: 4, y: 5, lado: 1 })).toEqual({ largura: 30, altura: 20, fundo_escala: 30, fundo_x: 0, fundo_y: 0 });
	});
});
