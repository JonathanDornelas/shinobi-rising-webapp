// Mapa vivo: a cena roda o motor do fingersMap em vez de mostrar uma imagem. O mapa, a luz, o clima e as animações são
// desenhados a cada quadro, e os tokens ficam dentro dele, com a profundidade de cada pixel: passam atrás de uma parede de
// verdade. O que fica em `mesa_cenas.mapa_vivo` é o que todos veem igual: onde estão os arquivos e o que o Mestre controla.
import { PUBLIC_SUPABASE_URL } from '$app/env/public';
import type { Weather } from './motor/player.js';
import type { Ambiente, Visao } from './luz.ts';
import type { Run } from './nevoa.ts';
import type { Ponto } from './visao.ts';

export const CLIMAS_VIVOS: { id: Weather; nome: string }[] = [
	{ id: 'clear', nome: 'Limpo' },
	{ id: 'cloudy', nome: 'Nublado' },
	{ id: 'rain', nome: 'Chuva' },
	{ id: 'snow', nome: 'Neve' },
	{ id: 'fog', nome: 'Neblina' },
	{ id: 'underground', nome: 'Subterrâneo' }
];

export interface MapaVivo {
	/** O arquivo do mapa e o nome da arte (com .json e .pack depois), no bucket mapas. */
	mapa: string;
	pacote: string;
	andar: number;
	/** Os andares de cima aparecem também, como num mapa ao ar livre com paredões. */
	acima: boolean;
	hora: number;
	clima: Weather;
	/** De 0 a 1. */
	forca: number;
	vento: number;
	telhados: boolean;
	/** As paredes cortadas na altura de uma pessoa, para ver dentro dos cômodos. */
	corte: boolean;
}

const CAMINHO = /^[0-9a-f-]{36}\/[a-z0-9-]{1,60}\/[a-z0-9.-]{1,40}$/;
const entre = (v: unknown, min: number, max: number, padrao: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : padrao);

/** O mapa vivo da cena, se estiver em ordem. Vem do banco, mas passa aqui antes de virar pedido de rede. */
export function lerMapaVivo(v: unknown): MapaVivo | null {
	if (!v || typeof v !== 'object') return null;
	const m = v as Record<string, unknown>;
	if (typeof m.mapa !== 'string' || typeof m.pacote !== 'string' || !CAMINHO.test(m.mapa) || !CAMINHO.test(m.pacote)) return null;
	return {
		mapa: m.mapa,
		pacote: m.pacote,
		andar: Math.round(entre(m.andar, 0, 15, 0)),
		acima: m.acima === true,
		hora: entre(m.hora, 0, 24, 10),
		clima: CLIMAS_VIVOS.some((c) => c.id === m.clima) ? (m.clima as Weather) : 'clear',
		forca: entre(m.forca, 0, 1, 0.7),
		vento: entre(m.vento, 0, 1, 0.3),
		telhados: m.telhados !== false,
		corte: m.corte === true
	};
}

export const urlMapas = (caminho: string) => `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/mapas/${caminho}`;

/** Um degrau: o que cabe subir ou descer andando, sem pedir. */
const DEGRAU = 0.6;
/** Pixels de arte por metro de altura: a escala do mapa, mais alta que a de um token sobre uma imagem. */
export const PX_POR_METRO = 40;

/**
 * A altura de quem anda até um lugar: segue na superfície em que está, sobe ou desce um degrau, e, se ela acabou (a beira do telhado), cai
 * na de baixo. `niveis` vem do mais baixo para o mais alto, e tem sempre o chão.
 */
export function alturaAoAndar(niveis: readonly number[], altura: number) {
	const aoAlcance = niveis.filter((n) => Math.abs(n - altura) <= DEGRAU);
	if (aoAlcance.length) return Math.max(...aoAlcance);
	return [...niveis].reverse().find((n) => n < altura) ?? niveis[0];
}

/** A próxima superfície para cima ou para baixo, ou null se não há. */
export function proximoNivel(niveis: readonly number[], altura: number, rumo: 1 | -1) {
	const lista = rumo > 0 ? niveis.filter((n) => n > altura + 0.05) : niveis.filter((n) => n < altura - 0.05).reverse();
	return lista[0] ?? null;
}

/** Quantos pixels da máscara de visão vão em cada quadrado. */
export const PIXELS_DA_VISAO = 8;

const cinza = (v: number) => {
	const c = Math.round(v * 255);
	return `rgb(${c} ${c} ${c})`;
};

/** O que fica à vista sem luz nenhuma, em cada ambiente. */
const VISTA_SEM_LUZ: Record<Ambiente, number> = { claro: 1, penumbra: 0.5, escuro: 0 };
/** O que já foi visto e saiu da vista. */
const LEMBRADO = 0.24;
const FOLGA_DO_CORPO = 0.6;

interface Corpo {
	box: [number, number, number, number];
	round?: boolean;
}

const contorno = (c: CanvasRenderingContext2D, p: readonly Ponto[]) => {
	c.moveTo(p[0][0], p[0][1]);
	for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
	c.closePath();
};

/** Em volta de um corpo, onde olhar para saber se alguém o vê. */
function pontosEmVolta([x0, y0, x1, y1]: Corpo['box']): Ponto[] {
	const f = FOLGA_DO_CORPO;
	const [mx, my] = [(x0 + x1) / 2, (y0 + y1) / 2];
	return [[x0 - f, my], [x1 + f, my], [mx, y0 - f], [mx, y1 + f], [x0 - f, y0 - f], [x1 + f, y0 - f], [x0 - f, y1 + f], [x1 + f, y1 + f]];
}

/** A névoa sem luz dinâmica, também vista de cima: o que o Mestre revelou aparece, e o que fica em pé num quadrado coberto some com ele. */
export function pintarMascaraDaNevoa(c: CanvasRenderingContext2D, L: number, A: number, runs: readonly Run[]) {
	c.setTransform(PIXELS_DA_VISAO, 0, 0, PIXELS_DA_VISAO, 0, 0);
	c.globalCompositeOperation = 'source-over';
	c.fillStyle = '#000';
	c.fillRect(0, 0, L, A);
	c.fillStyle = '#fff';
	for (const [y, x0, x1] of runs) c.fillRect(x0, y, x1 - x0 + 1, 1);
}

/**
 * A máscara de visão, vista de cima: 1 píxel é 1/8 de quadrado, e mais claro é mais à vista. O motor a lê para cada pixel na
 * posição dele no mundo, então o alto de uma parede usa o chão ao lado dela. Um corpo (um prédio) não tem chão visível por
 * dentro: quem vê o chão em volta vê o corpo inteiro, com o telhado. Por isso `corpos` traz só o que está de pé: um telhado
 * escondido, cortado ou aberto para quem entrou mostra o que há embaixo, e os cômodos seguem as paredes como qualquer lugar.
 */
export function pintarVisao(c: CanvasRenderingContext2D, L: number, A: number, visao: Visao, ambiente: Ambiente, runs: readonly Run[] | null, corpos: readonly Corpo[], revelado: (x: number, y: number) => boolean) {
	c.setTransform(PIXELS_DA_VISAO, 0, 0, PIXELS_DA_VISAO, 0, 0);
	c.globalCompositeOperation = 'source-over';
	c.fillStyle = '#000';
	c.fillRect(0, 0, L, A);
	if (runs) {
		c.fillStyle = cinza(LEMBRADO);
		for (const [y, x0, x1] of runs) c.fillRect(x0, y, x1 - x0 + 1, 1);
	}
	c.save();
	c.beginPath();
	for (const v of visao.vistas) if (v.length > 2) contorno(c, v);
	c.clip();
	c.globalCompositeOperation = 'lighten';
	const base = VISTA_SEM_LUZ[ambiente];
	if (base > 0) {
		c.fillStyle = cinza(base);
		c.fillRect(0, 0, L, A);
	}
	for (const f of visao.fontes) {
		const r = f.plena + f.penumbra;
		if (r <= 0 || f.poligono.length < 3) continue;
		const g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
		g.addColorStop(0, '#fff');
		g.addColorStop(f.plena / r, '#fff');
		g.addColorStop((f.plena + f.penumbra * 0.6) / r, cinza(0.53));
		g.addColorStop(1, '#000');
		c.save();
		c.beginPath();
		contorno(c, f.poligono);
		c.clip();
		c.fillStyle = g;
		c.fillRect(f.x - r, f.y - r, r * 2, r * 2);
		c.restore();
	}
	c.restore();
	c.globalCompositeOperation = 'lighten';
	for (const corpo of corpos) {
		const pontos = pontosEmVolta(corpo.box);
		const nivel = pontos.some(([x, y]) => visao.visivel(x, y)) ? 1 : runs && pontos.some(([x, y]) => revelado(x, y)) ? LEMBRADO : 0;
		if (!nivel) continue;
		const [x0, y0, x1, y1] = corpo.box;
		c.fillStyle = cinza(nivel);
		c.fillRect(x0, y0, x1 - x0, y1 - y0);
	}
	c.globalCompositeOperation = 'source-over';
}
