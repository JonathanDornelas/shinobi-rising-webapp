// A sombra de cada direção da miniatura como imagem própria (data URL), tirada uma vez da segunda fileira da tira (as
// silhuetas). Recortar o quadro na hora de desenhar (<svg> aninhado, padrão, clip-path) some na vista isométrica: o
// navegador erra o recorte sob a projeção do chão somada à inclinação da sombra.
import { urlMiniatura, type Miniatura } from './miniaturas.ts';

const prontas = $state<Record<string, string>>({});
const pedidas = new Set<string>();

/** A silhueta da direção `q` (null enquanto a tira carrega, e no servidor). */
export function silhueta(m: Miniatura, q: number): string | null {
	const pronta = prontas[`${m.id}:${q}`];
	if (pronta) return pronta;
	if (typeof document === 'undefined' || pedidas.has(m.id)) return null;
	pedidas.add(m.id);
	const img = new Image();
	img.onload = () => {
		for (let k = 0; k < 8; k++) {
			const c = document.createElement('canvas');
			c.width = m.w;
			c.height = m.h;
			c.getContext('2d')?.drawImage(img, k * m.w, m.h, m.w, m.h, 0, 0, m.w, m.h);
			prontas[`${m.id}:${k}`] = c.toDataURL();
		}
	};
	img.onerror = () => pedidas.delete(m.id);
	img.src = urlMiniatura(m);
	return null;
}
