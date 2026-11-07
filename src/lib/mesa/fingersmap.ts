// Cenas do fingersMap, o editor de mapas isométricos (.fmesa): um ZIP com cena.json, o mapa, a arte que ele usa e uma imagem de
// tudo, para quem não consegue rodar o motor. A grade é a mesma nos dois lados: 1 tile = 1 quadrado = 1 m, 64 px = 1 metro de
// tela, com a mesma origem. A partir da versão 2 a Mesa roda o mapa de verdade (ver mapa-vivo.ts); as peças da versão 1 que já
// estão em alguma cena seguem sendo desenhadas, mas o arquivo antigo precisa ser exportado de novo.
import { strFromU8, unzipSync } from 'fflate';
import { LADO_MAXIMO_CENA } from './cenas.ts';
import { limparLuzes, limparParedes, type Ambiente, type Luz, type Parede } from './luz.ts';
import { CLIMAS_VIVOS } from './mapa-vivo.ts';
import type { Weather } from './motor/player.js';
import type { MesaObjeto } from '#lib/supabase/banco.ts';

export const VERSAO_FINGERSMAP = 2;
/** O arquivo inteiro e cada parte dele. */
export const LIMITE_FMESA = 300 * 1024 * 1024;
const LIMITE_CENA = 8 * 1024 * 1024;
const LIMITE_FUNDO = 100 * 1024 * 1024;
const LIMITE_MAPA = 50 * 1024 * 1024;
/** O bucket mapas vai até 50 MB por arquivo. */
const LIMITE_ARTE = 50 * 1024 * 1024;

type Bytes = Uint8Array<ArrayBuffer>;

export interface CenaFingersMap {
	nome: string;
	largura: number;
	altura: number;
	andar: number;
	acima: boolean;
	/** A imagem do andar: o canto de cima à esquerda na tela e o tamanho, em metros de tela. */
	fundo: { x: number; y: number; w: number; h: number; imagem: Bytes };
	mapa: Bytes;
	/** A arte: a lista e os pixels. */
	pacoteLista: Bytes;
	pacotePixels: Bytes;
	ar: { hora: number; clima: Weather; forca: number; vento: number };
	paredes: Parede[];
	luzes: Luz[];
	ambiente: Ambiente;
	/** Os quadrados de terreno difícil marcados no mapa. */
	terreno: [number, number][];
}

const NAO_E = 'O arquivo não é uma cena do fingersMap (.fmesa).';
const num = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const ehPng = (b: Uint8Array) => b.length > 8 && [0x89, 0x50, 0x4e, 0x47].every((v, i) => b[i] === v);
const ehZip = (b: Uint8Array) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b;
const ehGzip = (b: Uint8Array) => b.length > 2 && b[0] === 0x1f && b[1] === 0x8b;
const copia = (b: Uint8Array) => new Uint8Array(b) as Bytes;

/** O banco guarda até isto (mesa_cenas.terreno). */
const MAX_TERRENO = 10000;
/** Só quadrados de verdade, dentro da cena. Um arquivo de antes das regiões não traz nenhum. */
function terrenoDoArquivo(v: unknown, L: number, A: number): [number, number][] {
	if (!Array.isArray(v)) return [];
	const valido = (q: unknown): q is [number, number] => Array.isArray(q) && q.length === 2 && Number.isInteger(q[0]) && Number.isInteger(q[1]) && q[0] >= 0 && q[1] >= 0 && q[0] < L && q[1] < A;
	return v.filter(valido).slice(0, MAX_TERRENO);
}

const LIMITES: Record<string, number> = { 'cena.json': LIMITE_CENA, 'fundo.png': LIMITE_FUNDO, 'mapa.fmap': LIMITE_MAPA, 'pacote.json': LIMITE_ARTE, 'pacote.pack': LIMITE_ARTE };

/** Lê e confere o arquivo, que veio de fora: nada passa daqui sem ter o formato certo. Erra com uma frase para o Mestre ler. */
export function lerFingersMap(dados: Uint8Array): CenaFingersMap {
	if (dados.length > LIMITE_FMESA) throw new Error('O arquivo é grande demais (até 300 MB).');
	let zip: Record<string, Uint8Array>;
	try {
		zip = unzipSync(dados, { filter: (a) => a.originalSize <= (LIMITES[a.name] ?? 0) });
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
	if (c.versao < VERSAO_FINGERSMAP) throw new Error('Esta cena foi exportada antes do mapa vivo. Exporte de novo no fingersMap.');
	const { largura, altura } = c;
	if (!Number.isInteger(largura) || !Number.isInteger(altura)) throw new Error(NAO_E);
	const [L, A] = [largura as number, altura as number];
	if (L > LADO_MAXIMO_CENA || A > LADO_MAXIMO_CENA) throw new Error(`O mapa tem ${L} × ${A} quadrados; a Mesa vai até ${LADO_MAXIMO_CENA} × ${LADO_MAXIMO_CENA}.`);
	if (L < 1 || A < 1) throw new Error(NAO_E);

	const fundo = c.fundo as Record<string, unknown> | undefined;
	const imagem = zip['fundo.png'];
	if (!fundo || !imagem || !ehPng(imagem) || !num(fundo.x, -2500, 2500) || !num(fundo.y, -2500, 2500) || !num(fundo.w, 1, 2200) || !num(fundo.h, 0.01, 2200)) throw new Error(NAO_E);
	const [mapa, lista, pixels] = [zip['mapa.fmap'], zip['pacote.json'], zip['pacote.pack']];
	if (!mapa || !ehZip(mapa) || !lista || !pixels || !ehGzip(pixels)) throw new Error(NAO_E);
	try {
		JSON.parse(strFromU8(lista));
	} catch {
		throw new Error(NAO_E);
	}

	const ar = (c.ar ?? {}) as Record<string, unknown>;
	const ambiente = c.ambiente === 'penumbra' || c.ambiente === 'escuro' ? c.ambiente : 'claro';
	return {
		nome: typeof c.nome === 'string' ? c.nome.trim().slice(0, 60) : '',
		largura: L,
		altura: A,
		andar: num(c.andar, 0, 15) ? Math.round(c.andar) : 0,
		acima: c.acima === true,
		fundo: { x: fundo.x as number, y: fundo.y as number, w: fundo.w as number, h: fundo.h as number, imagem: copia(imagem) },
		mapa: copia(mapa),
		pacoteLista: copia(lista),
		pacotePixels: copia(pixels),
		ar: {
			hora: num(ar.hora, 0, 24) ? ar.hora : 10,
			clima: CLIMAS_VIVOS.some((v) => v.id === ar.clima) ? (ar.clima as Weather) : 'clear',
			forca: num(ar.forca, 0, 1) ? ar.forca : 0.7,
			vento: num(ar.vento, 0, 1) ? ar.vento : 0.3
		},
		paredes: limparParedes(c.paredes, L, A),
		luzes: limparLuzes(c.luzes),
		ambiente,
		terreno: terrenoDoArquivo(c.terreno, L, A)
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
		terreno: m.terreno,
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
