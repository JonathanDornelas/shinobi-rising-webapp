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
 * Alinhar à grade (vista de cima): o Mestre ajusta uma moldura de n × n quadrados sobre n × n quadrados desenhados no
 * mapa. A imagem é escalada para essa moldura virar n metros de lado, e deslocada para o canto dela cair num cruzamento
 * da grade. `fundo` é onde a imagem está agora (canto e largura, em metros); a moldura também está em metros.
 */
export function alinharFundo(fundo: { x: number; y: number; w: number }, caixa: { x: number; y: number; lado: number; n: number }) {
	const k = caixa.n / caixa.lado;
	const w = Math.min(1000, Math.max(1, fundo.w * k));
	const kk = w / fundo.w;
	const gx = Math.round(caixa.x);
	const gy = Math.round(caixa.y);
	const lim = (v: number) => Math.min(1000, Math.max(-1000, v));
	return { fundo_escala: r2(w), fundo_x: r2(lim(gx - (caixa.x - fundo.x) * kk)), fundo_y: r2(lim(gy - (caixa.y - fundo.y) * kk)) };
}
