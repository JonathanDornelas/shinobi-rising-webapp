// Cenas do fingersMap, o editor de mapas isométricos (.fmesa): um ZIP com cena.json, o chão em fundo.png e, em pecas/, o
// que fica de pé (prédios, árvores, trechos de parede), já com a luz assada. A Mesa desenha em SVG, sem profundidade por
// pixel: para um token passar atrás de um prédio, o prédio precisa ser uma imagem à parte, pintada em ordem com os tokens.
// A grade é a mesma nos dois lados: 1 tile = 1 quadrado = 1 m, 64 px = 1 metro de tela, com a mesma origem.
import { strFromU8, unzipSync } from 'fflate';
import { limparLuzes, limparParedes, type Ambiente, type Luz, type Parede } from './luz.ts';
import { MAX_OBJETOS } from './objetos.ts';
import type { ClimaCena, MesaObjeto } from '#lib/supabase/banco.ts';

export const VERSAO_FINGERSMAP = 1;
const LADO_MAXIMO = 200;
/** O arquivo inteiro, a cena e cada imagem. O fundo vai a 8192 px de lado e passa de 30 MB com folga. */
export const LIMITE_FMESA = 400 * 1024 * 1024;
const LIMITE_CENA = 8 * 1024 * 1024;
const LIMITE_FUNDO = 100 * 1024 * 1024;
const LIMITE_PECA = 5 * 1024 * 1024;

export interface PecaFingersMap {
	x: number;
	y: number;
	largura: number;
	altura: number;
	desce: number;
	camada: 'meio' | 'acima';
	imagem: Uint8Array<ArrayBuffer>;
}

export interface CenaFingersMap {
	nome: string;
	largura: number;
	altura: number;
	/** O canto de cima à esquerda do fundo na tela e o tamanho dele, em metros de tela. */
	fundo: { x: number; y: number; w: number; h: number; imagem: Uint8Array<ArrayBuffer> };
	pecas: PecaFingersMap[];
	paredes: Parede[];
	luzes: Luz[];
	ambiente: Ambiente;
	clima: ClimaCena | null;
}

const NAO_E = 'O arquivo não é uma cena do fingersMap (.fmesa).';
const num = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const ehPng = (b: Uint8Array) => b.length > 8 && [0x89, 0x50, 0x4e, 0x47].every((v, i) => b[i] === v);
const ehWebp = (b: Uint8Array) => b.length > 12 && strFromU8(b.subarray(0, 4)) === 'RIFF' && strFromU8(b.subarray(8, 12)) === 'WEBP';
const copia = (b: Uint8Array) => new Uint8Array(b) as Uint8Array<ArrayBuffer>;

/** Lê e confere o arquivo, que veio de fora: nada passa daqui sem ter o formato certo. Erra com uma frase para o Mestre ler. */
export function lerFingersMap(dados: Uint8Array): CenaFingersMap {
	if (dados.length > LIMITE_FMESA) throw new Error('O arquivo é grande demais (até 400 MB).');
	let zip: Record<string, Uint8Array>;
	try {
		zip = unzipSync(dados, { filter: (f) => f.originalSize <= (f.name === 'cena.json' ? LIMITE_CENA : f.name === 'fundo.png' ? LIMITE_FUNDO : /^pecas\/\d{3,4}\.webp$/.test(f.name) ? LIMITE_PECA : 0) });
	} catch {
		throw new Error(NAO_E);
	}
	if (!zip['cena.json']) throw new Error(NAO_E);
	let c: Record<string, unknown>;
	try {
		c = JSON.parse(strFromU8(zip['cena.json']));
	} catch {
		throw new Error(NAO_E);
	}
	if (typeof c?.versao !== 'number') throw new Error(NAO_E);
	if (c.versao > VERSAO_FINGERSMAP) throw new Error('Esta cena veio de uma versão mais nova do fingersMap.');
	const { largura, altura } = c;
	if (!Number.isInteger(largura) || !Number.isInteger(altura)) throw new Error(NAO_E);
	const [L, A] = [largura as number, altura as number];
	if (L > LADO_MAXIMO || A > LADO_MAXIMO) throw new Error(`O mapa tem ${L} × ${A} quadrados; a Mesa vai até 200 × 200.`);
	if (L < 1 || A < 1) throw new Error(NAO_E);

	const f = c.fundo as Record<string, unknown> | undefined;
	const bytesDoFundo = zip['fundo.png'];
	if (!f || !bytesDoFundo || !ehPng(bytesDoFundo) || !num(f.x, -1000, 1000) || !num(f.y, -1000, 1000) || !num(f.w, 1, 1000) || !num(f.h, 0.01, 1000)) throw new Error(NAO_E);

	if (!Array.isArray(c.pecas)) throw new Error(NAO_E);
	if (c.pecas.length > MAX_OBJETOS) throw new Error(`A cena traz ${c.pecas.length} peças; a Mesa guarda até ${MAX_OBJETOS} objetos por cena.`);
	const pecas = c.pecas.map((p: Record<string, unknown>): PecaFingersMap => {
		const imagem = typeof p?.arquivo === 'string' ? zip[p.arquivo] : undefined;
		const certa = imagem && ehWebp(imagem) && num(p.x, -50, 250) && num(p.y, -50, 250) && num(p.largura, 0.25, 400) && num(p.altura, 0.25, 400) && num(p.desce, 0, 40) && (p.camada === 'meio' || p.camada === 'acima');
		if (!certa) throw new Error(NAO_E);
		return { x: p.x as number, y: p.y as number, largura: p.largura as number, altura: p.altura as number, desce: p.desce as number, camada: p.camada as PecaFingersMap['camada'], imagem: copia(imagem) };
	});
	const ambiente = c.ambiente === 'penumbra' || c.ambiente === 'escuro' ? c.ambiente : 'claro';
	const clima = c.clima === 'chuva' || c.clima === 'neve' || c.clima === 'nevoa' ? c.clima : null;
	return {
		nome: typeof c.nome === 'string' ? c.nome.trim().slice(0, 60) : '',
		largura: L,
		altura: A,
		fundo: { x: f.x as number, y: f.y as number, w: f.w as number, h: f.h as number, imagem: copia(bytesDoFundo) },
		pecas,
		paredes: limparParedes(c.paredes, L, A),
		luzes: limparLuzes(c.luzes),
		ambiente,
		clima
	};
}

/** O que a cena grava: `b` é o canto de cima à esquerda da caixa da cena, de onde o fundo é medido. */
export function camposDaCena(m: CenaFingersMap, b: { x: number; y: number }) {
	return {
		largura: m.largura,
		altura: m.altura,
		visao: 'isometrica' as const,
		iso_razao: 2,
		iso_rotacao: 0 as const,
		fundo_escala: m.fundo.w,
		fundo_x: m.fundo.x - b.x,
		fundo_y: m.fundo.y - b.y,
		terreno: [],
		paredes: m.paredes,
		luzes: m.luzes,
		luz_ambiente: m.ambiente,
		luz_dinamica: true,
		nevoa: true,
		reveladas: []
	};
}

const FOLGA = 0.2;

/**
 * Onde olhar para saber se alguém vê uma peça: o apoio e o chão à volta dela, nos quatro lados da tela. O apoio sozinho não
 * basta, porque o de um prédio fica no miolo, entre as paredes, e o de uma parede fica em cima dela.
 */
export function pontosDaPeca(o: Pick<MesaObjeto, 'x' | 'y' | 'largura' | 'desce'>): [number, number][] {
	const a = (o.largura ?? 1) / 2 + FOLGA;
	const b = (o.desce ?? 0) + FOLGA;
	// da tela para a grade: dx = (gx − gy) / 2 e dy = (gx + gy) / 4
	const chao = (dx: number, dy: number): [number, number] => [o.x + dx + 2 * dy, o.y + 2 * dy - dx];
	return [[o.x, o.y], chao(-a, 0), chao(a, 0), chao(0, b), chao(0, -b)];
}
