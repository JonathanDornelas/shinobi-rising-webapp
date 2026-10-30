import { describe, expect, it } from 'vitest';
import { alinharFundo, caixaDaCenaEmQuadrados, fatorDosQuadrados, fundoPorFator, larguraPadraoDoFundo } from './fundo.ts';
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

describe('alinhar o fundo à grade', () => {
	it('a moldura de 3 quadrados do mapa vira 3 m de grade, com o canto num cruzamento', () => {
		// a imagem tem 40 m de largura no canto (0, 0); os quadrados desenhados medem 1,5 m: a moldura de 3 tem 4,5 m em (10,2; 6,7)
		const r = alinharFundo({ x: 0, y: 0, w: 40 }, { x: 10.2, y: 6.7, lado: 4.5, n: 3 });
		const k = 3 / 4.5;
		expect(r.fundo_escala).toBeCloseTo(40 * k, 1);
		// o canto da moldura, depois de escalado, cai em (10, 7)
		expect(r.fundo_x + 10.2 * k).toBeCloseTo(10, 1);
		expect(r.fundo_y + 6.7 * k).toBeCloseTo(7, 1);
	});
	it('moldura que já casa com a grade não mexe na imagem', () => {
		expect(alinharFundo({ x: 2, y: 3, w: 30 }, { x: 5, y: 6, lado: 3, n: 3 })).toEqual({ fundo_escala: 30, fundo_x: 2, fundo_y: 3 });
	});
});
