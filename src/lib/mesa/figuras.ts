// O corpo do token dentro do mapa vivo: a miniatura ou o disco com a foto viram um sprite, na escala da arte (64 px por
// metro de tela), para o motor desenhar com a luz e a profundidade do mapa. A vida, o nome e os estados seguem no quadro.
import { retanguloFoco, type FocoArte } from '#lib/bestiario/foco.ts';
import type { Miniatura } from './miniaturas.ts';
import type { FigureArt } from './motor/player.js';

const PX = 64;

const imagens = new Map<string, Promise<HTMLImageElement>>();

/** Carrega com CORS: sem ele, o navegador não deixa ler os pixels, e a foto de um site alheio segue desenhada no quadro. */
function imagem(url: string) {
	let p = imagens.get(url);
	if (!p) {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = url;
		p = img.decode().then(() => img);
		p.catch(() => imagens.delete(url));
		imagens.set(url, p);
	}
	return p;
}

function tela(w: number, h: number) {
	const t = document.createElement('canvas');
	t.width = w;
	t.height = h;
	return t.getContext('2d', { willReadFrequently: true })!;
}

const EFEITO_CAIDO = 'grayscale(1) brightness(.6)';

/** Um quadro da tira da miniatura. `escala`: pixels de arte por pixel da miniatura. */
export async function figuraDaMiniatura(url: string, mini: Miniatura, quadro: number, escala: number, caido: boolean): Promise<FigureArt> {
	const tira = await imagem(url);
	const [w, h] = [Math.ceil(mini.w * escala), Math.ceil(mini.h * escala)];
	const c = tela(w, h);
	c.imageSmoothingEnabled = false;
	if (caido) c.filter = EFEITO_CAIDO;
	c.drawImage(tira, quadro * mini.w, 0, mini.w, mini.h, 0, 0, w, h);
	return { w, h, ax: Math.round(mini.pe[0] * escala), ay: Math.round(mini.pe[1] * escala), pixels: c.getImageData(0, 0, w, h).data };
}

/** Uma cor do tema, de `var(--nome)` para o valor. */
export function corDoTema(cor: string) {
	const nome = /^var\((--[a-z0-9-]+)/.exec(cor)?.[1];
	return nome ? getComputedStyle(document.documentElement).getPropertyValue(nome).trim() || '#888' : cor;
}

export interface Disco {
	foto: string | null;
	foco: FocoArte | null;
	sigla: string;
	/** A cor do anel, a do fundo e a da letra, já resolvidas. */
	anel: string;
	fundo: string;
	letra: string;
	/** Lado do token, em quadrados. */
	n: number;
	/** O raio do disco e o quanto ele sobe do chão, em metros de tela. */
	raio: number;
	sobe: number;
	/** A moldura, com o raio dela. */
	moldura: { url: string; raio: number } | null;
	caido: boolean;
}

/** O token redondo: o disco com a foto (ou a sigla), o anel e a moldura. */
export async function figuraRedonda(d: Disco): Promise<FigureArt> {
	const raio = Math.max(d.raio, d.moldura?.raio ?? 0);
	const lado = Math.ceil(raio * 2 * PX) + 2;
	const meio = lado / 2;
	const c = tela(lado, lado);
	const rf = d.raio * PX;
	if (d.caido) c.filter = EFEITO_CAIDO;
	c.beginPath();
	c.arc(meio, meio, rf, 0, Math.PI * 2);
	c.fillStyle = d.fundo;
	c.fill();
	if (d.foto) {
		const img = await imagem(d.foto);
		c.save();
		c.beginPath();
		c.arc(meio, meio, rf - 1, 0, Math.PI * 2);
		c.clip();
		if (d.foco) {
			const q = retanguloFoco(d.foco, meio, meio, 2 * rf);
			c.drawImage(img, q.x, q.y, q.w, q.h);
		} else {
			const k = Math.max((2 * rf) / img.naturalWidth, (2 * rf) / img.naturalHeight);
			const [w, h] = [img.naturalWidth * k, img.naturalHeight * k];
			c.drawImage(img, meio - w / 2, meio - h / 2, w, h);
		}
		c.restore();
	} else {
		c.fillStyle = d.letra;
		c.font = `700 ${Math.round(rf * 0.8)}px 'Pixelify Sans', sans-serif`;
		c.textAlign = 'center';
		c.textBaseline = 'middle';
		c.fillText(d.sigla, meio, meio + 1);
	}
	c.beginPath();
	c.arc(meio, meio, rf, 0, Math.PI * 2);
	c.strokeStyle = d.anel;
	c.lineWidth = (d.moldura ? 0.05 : 0.08) * Math.min(d.n, 3) * PX;
	c.stroke();
	if (d.moldura) {
		const r = d.moldura.raio * PX;
		c.imageSmoothingEnabled = false;
		c.drawImage(await imagem(d.moldura.url), meio - r, meio - r, r * 2, r * 2);
	}
	return { w: lado, h: lado, ax: Math.round(meio), ay: Math.round(meio + d.sobe * PX), pixels: c.getImageData(0, 0, lado, lado).data };
}
