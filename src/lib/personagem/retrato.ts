// Retrato do ninja: arquivo quadrado (256×256, webp) no Storage, em retratos/<id da ficha>/<nome>.webp.
import { PUBLIC_SUPABASE_URL } from '$app/env/public';
import { codificarWebp } from '#lib/imagens/comprimir.ts';

export const LADO_RETRATO = 256;
/** O bucket aceita até 256 KB; o recorte em webp fica bem abaixo disso. */
export const LIMITE_ORIGINAL = 15 * 1024 * 1024;

/** URL pública do retrato (null se a ficha não tem foto). */
export const urlRetrato = (caminho: string | null | undefined) => (caminho ? `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/retratos/${caminho}` : null);

/** Caminho novo a cada troca (o nome muda, então o cache do navegador não segura a foto antiga). */
export const caminhoRetrato = (ficha: string) => `${ficha}/r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.webp`;

export interface Enquadramento {
	/** 1 = o lado menor da imagem cabe exato no quadrado. */
	zoom: number;
	/** Deslocamento do centro, em frações do lado do quadrado (−0,5 a 0,5 aproximadamente). */
	x: number;
	y: number;
}

/** Recorta a imagem no quadrado do enquadramento e devolve um webp de LADO_RETRATO px (pixel art sem suavizar). */
export async function recortar(img: HTMLImageElement, e: Enquadramento, pixelado = false): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = LADO_RETRATO;
	const ctx = canvas.getContext('2d')!;
	const escala = (LADO_RETRATO / Math.min(img.naturalWidth, img.naturalHeight)) * e.zoom;
	const w = img.naturalWidth * escala;
	const h = img.naturalHeight * escala;
	ctx.imageSmoothingEnabled = !pixelado;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, (LADO_RETRATO - w) / 2 + e.x * LADO_RETRATO, (LADO_RETRATO - h) / 2 + e.y * LADO_RETRATO, w, h);
	return codificarWebp(canvas);
}

/** Limita o deslocamento para a imagem sempre cobrir o quadrado inteiro. */
export function limitar(img: { naturalWidth: number; naturalHeight: number }, e: Enquadramento): Enquadramento {
	const menor = Math.min(img.naturalWidth, img.naturalHeight);
	const fx = (img.naturalWidth / menor) * e.zoom;
	const fy = (img.naturalHeight / menor) * e.zoom;
	const mx = Math.max(0, (fx - 1) / 2);
	const my = Math.max(0, (fy - 1) / 2);
	return { zoom: e.zoom, x: Math.min(mx, Math.max(-mx, e.x)), y: Math.min(my, Math.max(-my, e.y)) };
}
