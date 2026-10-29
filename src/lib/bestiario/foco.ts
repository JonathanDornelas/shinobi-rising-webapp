// Enquadramento das artes do bestiário no token redondo da Mesa (e nos retratos quadrados).
// foco.json guarda, por arte, o ponto que o token centraliza (x, y em frações da imagem), o zoom
// (1 = o lado menor da imagem inteiro no quadrado) e as dimensões (w, h) para calcular sem carregar a imagem.
// O Mestre pode trocar o ponto e o zoom de um NPC (npcs.enquadramento); as dimensões vêm sempre do mapa.
import mapa from '#lib/bestiario/foco.json';

export interface Foco {
	x: number;
	y: number;
	zoom: number;
}
export interface FocoArte extends Foco {
	w: number;
	h: number;
}

const MAPA = mapa as unknown as Record<string, [number, number, number, number, number]>;

/** O foco padrão da arte (/bestiario/…, com ou sem ?v=), ou null se não for uma arte conhecida. */
export function focoPadrao(arte: string | null | undefined): FocoArte | null {
	if (!arte?.startsWith('/bestiario/')) return null;
	const m = MAPA[arte.slice('/bestiario/'.length).split('?')[0]];
	return m ? { x: m[0], y: m[1], zoom: m[2], w: m[3], h: m[4] } : null;
}

/** O foco da arte com o ajuste do Mestre por cima (quando houver). */
export function focoDaArte(arte: string | null | undefined, ajuste?: Partial<Foco> | null): FocoArte | null {
	const p = focoPadrao(arte);
	if (!p) return null;
	if (!ajuste) return p;
	const n = (v: unknown, padrao: number) => (typeof v === 'number' && Number.isFinite(v) ? v : padrao);
	return { ...p, x: n(ajuste.x, p.x), y: n(ajuste.y, p.y), zoom: n(ajuste.zoom, p.zoom) };
}

/**
 * Onde desenhar a imagem para o quadrado de lado `lado` centrado em (cx, cy) mostrar o foco.
 * A imagem sempre cobre o quadrado inteiro (o zoom mínimo é 1 e o ponto é empurrado para dentro).
 */
export function retanguloFoco(f: FocoArte, cx: number, cy: number, lado: number) {
	const k = (lado * Math.max(1, f.zoom)) / Math.min(f.w, f.h);
	const w = f.w * k;
	const h = f.h * k;
	const meio = lado / 2;
	const x = Math.min(cx - meio, Math.max(cx + meio - w, cx - f.x * w));
	const y = Math.min(cy - meio, Math.max(cy + meio - h, cy - f.y * h));
	return { x, y, w, h };
}

/** Estilo de um <img> absoluto dentro de uma caixa quadrada (overflow hidden) que mostra o foco. */
export function estiloFoco(f: FocoArte) {
	const r = retanguloFoco(f, 0.5, 0.5, 1);
	const pc = (v: number) => `${Math.round(v * 10000) / 100}%`;
	return `position:absolute;max-width:none;left:${pc(r.x)};top:${pc(r.y)};width:${pc(r.w)};height:${pc(r.h)}`;
}

/**
 * O enquadramento do retrato (zoom e deslocamento em frações do lado do quadrado, como em retrato.ts) que põe o foco
 * da arte no meio. Quem chama passa por limitar(), que empurra a imagem para cobrir o quadrado inteiro.
 */
export function enquadramentoDoFoco(f: Foco, natural: { naturalWidth: number; naturalHeight: number }) {
	const zoom = Math.max(1, f.zoom);
	const menor = Math.min(natural.naturalWidth, natural.naturalHeight);
	const w = (natural.naturalWidth / menor) * zoom;
	const h = (natural.naturalHeight / menor) * zoom;
	return { zoom, x: w * (0.5 - f.x), y: h * (0.5 - f.y) };
}
