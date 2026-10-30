// O fundo da cena em relação à grade. "Tamanho dos quadrados" é o quanto da arte cada quadrado da grade cobre: com a
// arte já desenhada em quadrados (a casa tem 3 deles de largura), o Mestre aumenta ou diminui os quadrados da grade até
// casarem com os do mapa. Na prática isso muda a largura da imagem (`fundo_escala`) e a recentra na cena.
//
// `fundo_escala` é a largura da imagem em quadrados: na vista de cima, em metros da grade; na isométrica, em larguras de
// losango (a do mapa inteiro é (largura + altura) / 2, porque cada quadrado avança meia largura de losango por lado).
import { caixaDaCena, cfgIso } from './projecao.ts';

export interface CenaParaFundo {
	largura: number;
	altura: number;
	iso: boolean;
	/** proporção do losango (só na isométrica) */
	razao: number;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** A caixa que a cena ocupa na tela, em quadrados: onde o fundo "padrão" cabe. */
export function caixaDaCenaEmQuadrados(c: CenaParaFundo): { w: number; h: number } {
	if (!c.iso) return { w: c.largura, h: c.altura };
	const b = caixaDaCena(cfgIso(c.largura, c.altura, { tw: 1, razao: c.razao }), 0, 0);
	return { w: b.w, h: b.h };
}

/** A largura padrão do fundo (a imagem cobre a cena inteira): 100% de tamanho dos quadrados. */
export const larguraPadraoDoFundo = (c: CenaParaFundo) => caixaDaCenaEmQuadrados(c).w;

/** O fator de tamanho dos quadrados: 1 é o padrão, 2 deixa cada quadrado com o dobro do tamanho em relação ao mapa. */
export const fatorDosQuadrados = (escala: number | null, c: CenaParaFundo) => (escala ? larguraPadraoDoFundo(c) / escala : 1);

/**
 * O que gravar na cena para o fator pedido: a largura da imagem, que mantém a proporção dela (`proporcao` é altura ÷ largura
 * da imagem), e o deslocamento que a deixa centrada na cena.
 */
export function fundoPorFator(fator: number, proporcao: number, c: CenaParaFundo) {
	const f = Math.min(4, Math.max(0.25, fator));
	const caixa = caixaDaCenaEmQuadrados(c);
	const w = caixa.w / f;
	const h = w * proporcao;
	return { fundo_escala: r2(w), fundo_x: r2((caixa.w - w) / 2), fundo_y: r2((caixa.h - h) / 2) };
}

/**
 * Redimensionar a grade sobre o mapa (vista de cima): a imagem fica parada e o Mestre puxa uma grade de pré-visualização
 * até os quadrados dela casarem com os desenhados. `grade` é um cruzamento dessa grade (x, y) e o lado de um quadrado,
 * em metros da cena de agora; `fundo` é onde a imagem está (canto e tamanho, em metros). O resultado faz cada quadrado
 * da pré-visualização virar 1 quadrado da cena: a imagem ganha a nova largura e posição, e a cena passa a ter os
 * quadrados inteiros que cabem na imagem.
 */
export function gradeNoMapa(fundo: { x: number; y: number; w: number; h: number }, grade: { x: number; y: number; lado: number }) {
	const k = 1 / grade.lado;
	const antes = { x: Math.floor((grade.x - fundo.x) / grade.lado + 1e-9), y: Math.floor((grade.y - fundo.y) / grade.lado + 1e-9) };
	const depois = { x: Math.floor((fundo.x + fundo.w - grade.x) / grade.lado + 1e-9), y: Math.floor((fundo.y + fundo.h - grade.y) / grade.lado + 1e-9) };
	return {
		largura: Math.min(200, Math.max(5, antes.x + depois.x)),
		altura: Math.min(200, Math.max(5, antes.y + depois.y)),
		fundo_escala: r2(Math.min(1000, Math.max(1, fundo.w * k))),
		fundo_x: r2(antes.x - (grade.x - fundo.x) * k),
		fundo_y: r2(antes.y - (grade.y - fundo.y) * k)
	};
}
