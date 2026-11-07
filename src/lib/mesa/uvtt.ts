// Mapas no formato Universal VTT (.dd2vtt do Dungeondraft, .uvtt do Dungeon Alchemist, DungeonFog e outros): um JSON
// com a imagem (em base64), o tamanho em quadrados, as paredes (linhas de visão), as portas e as luzes, tudo em
// quadrados a partir do canto do mapa. Na Mesa, 1 quadrado = 1 m, então os números entram como estão.
import { LADO_MAXIMO_CENA } from './cenas.ts';
import { limparParedes, type Ambiente, type Parede, type TipoParede } from './luz.ts';

type Xy = { x: number; y: number };
interface Uvtt {
	resolution?: { map_origin?: Xy; map_size?: Xy; pixels_per_grid?: number };
	line_of_sight?: Xy[][];
	objects_line_of_sight?: Xy[][];
	portals?: { bounds?: Xy[]; closed?: boolean }[];
	lights?: { position?: Xy; range?: number }[];
	environment?: { ambient_light?: string };
	image?: string;
}

export interface MapaUvtt {
	largura: number;
	altura: number;
	pixelsPorQuadrado: number;
	paredes: Parede[];
	luzes: { x: number; y: number; plena: number; penumbra: number }[];
	ambiente: Ambiente;
	/** a imagem em base64 (sem o prefixo data:) e o tipo dela */
	imagem: string;
	tipoImagem: 'image/png' | 'image/webp' | 'image/jpeg';
}

const ok = (p: unknown): p is Xy => !!p && typeof p === 'object' && Number.isFinite((p as Xy).x) && Number.isFinite((p as Xy).y);
const r2 = (v: number) => Math.round(v * 100) / 100;

/** O nível de luz pela luz ambiente do mapa ("AARRGGBB"): clara, meia-luz ou escura. */
export function ambienteDaCor(cor: string | undefined): Ambiente {
	const m = /^(?:[0-9a-f]{2})?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(cor ?? '');
	if (!m) return 'claro';
	const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16) / 255);
	const brilho = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return brilho >= 0.7 ? 'claro' : brilho >= 0.3 ? 'penumbra' : 'escuro';
}

const tipoDaImagem = (b64: string): MapaUvtt['tipoImagem'] => (b64.startsWith('UklGR') ? 'image/webp' : b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png');

export function lerUvtt(texto: string): MapaUvtt {
	let d: Uvtt;
	try {
		d = JSON.parse(texto);
	} catch {
		throw new Error('O arquivo não é um mapa Universal VTT (.dd2vtt ou .uvtt).');
	}
	const tam = d.resolution?.map_size;
	if (!ok(tam) || !d.image) throw new Error('O arquivo não é um mapa Universal VTT (.dd2vtt ou .uvtt).');
	const largura = Math.round(tam.x);
	const altura = Math.round(tam.y);
	if (largura > LADO_MAXIMO_CENA || altura > LADO_MAXIMO_CENA) throw new Error(`O mapa tem ${largura} × ${altura} quadrados; a Mesa vai até ${LADO_MAXIMO_CENA} × ${LADO_MAXIMO_CENA}.`);
	if (largura < 1 || altura < 1) throw new Error('O mapa não tem tamanho.');
	const o = ok(d.resolution?.map_origin) ? d.resolution!.map_origin! : { x: 0, y: 0 };
	const paredes: number[][] = [];
	const linha = (pts: unknown, tipo: TipoParede) => {
		if (!Array.isArray(pts)) return;
		const v = pts.filter(ok);
		for (let i = 1; i < v.length; i++) paredes.push([v[i - 1].x - o.x, v[i - 1].y - o.y, v[i].x - o.x, v[i].y - o.y, tipo]);
	};
	for (const l of d.line_of_sight ?? []) linha(l, 0);
	for (const l of d.objects_line_of_sight ?? []) linha(l, 0);
	for (const p of d.portals ?? []) if (Array.isArray(p.bounds) && p.bounds.length >= 2) linha(p.bounds.slice(0, 2), p.closed === false ? 2 : 1);
	const luzes = (d.lights ?? [])
		.filter((l) => ok(l.position) && Number.isFinite(l.range) && l.range! > 0)
		.map((l) => ({ x: r2(l.position!.x - o.x), y: r2(l.position!.y - o.y), plena: r2(Math.min(60, l.range!) / 2), penumbra: r2(Math.min(60, l.range!) / 2) }))
		.filter((l) => l.x >= 0 && l.y >= 0 && l.x <= largura && l.y <= altura)
		.slice(0, 300);
	const imagem = d.image.replace(/^data:[^,]*,/, '');
	return {
		largura,
		altura,
		pixelsPorQuadrado: Number(d.resolution?.pixels_per_grid) || 0,
		paredes: limparParedes(paredes, largura, altura),
		luzes,
		ambiente: ambienteDaCor(d.environment?.ambient_light),
		imagem,
		tipoImagem: tipoDaImagem(imagem)
	};
}

/** A imagem do mapa como arquivo (para o envio de sempre, que reduz e corta em ladrilhos). */
export function arquivoDaImagem(m: MapaUvtt, nome: string): File {
	const bin = atob(m.imagem);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return new File([bytes], `${nome}.${m.tipoImagem.split('/')[1]}`, { type: m.tipoImagem });
}
