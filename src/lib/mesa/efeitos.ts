// Efeitos de área da Mesa: cada jutsu deixado na cena ganha o visual do seu elemento (fogo, água, vento, raio, terra…) ou,
// sem elemento, do seu tipo (taijutsu, genjutsu, bukijutsu e ninjutsu genérico). O estilo vai junto do efeito
// (mesa_efeitos.estilo) e o quadro desenha o elemento em movimento, com as tiras de quadros de fx-sprites.ts.
import { ELEMENTO, TIPO_JUTSU } from '#lib/livro/dominio.ts';
import { chaveElemento } from './hud.ts';

export type EstiloEfeito = keyof typeof ESTILOS;

/** Os 18 estilos: cor principal e nome. Os elementos usam a cor do elemento no resto do app. */
export const ESTILOS = {
	...Object.fromEntries(Object.entries(ELEMENTO).map(([k, e]) => [k, { cor: e.cor, nome: e.traducao }])),
	taijutsu: { cor: TIPO_JUTSU.Taijutsu.cor, nome: 'Taijutsu' },
	genjutsu: { cor: TIPO_JUTSU.Genjutsu.cor, nome: 'Genjutsu' },
	bukijutsu: { cor: TIPO_JUTSU.Bukijutsu.cor, nome: 'Bukijutsu' },
	ninjutsu: { cor: TIPO_JUTSU.Ninjutsu.cor, nome: 'Ninjutsu' }
} as Record<string, { cor: string; nome: string }>;

/** O estilo do efeito de um jutsu: o elemento (do jutsu ou citado no nome) ou o tipo; null sem nada reconhecível. */
export function estiloDoJutsu(j: { tipo?: string; elemento?: string | null; nome?: string }): EstiloEfeito | null {
	const el = chaveElemento(j.elemento, j.nome ?? '');
	if (el) return el;
	switch ((j.tipo ?? '').toLowerCase()) {
		case 'taijutsu':
			return 'taijutsu';
		case 'genjutsu':
			return 'genjutsu';
		case 'bukijutsu':
			return 'bukijutsu';
		case 'ninjutsu':
		case 'fuuinjutsu':
		case 'kugutsu':
			return 'ninjutsu';
		default:
			return null;
	}
}

/** Estilo guardado no banco ou desconhecido: volta para o ninjutsu genérico (efeitos antigos ficam como eram). */
export const estiloValido = (s: string | null | undefined): EstiloEfeito | null => (s && ESTILOS[s] ? s : null);

/** Os efeitos em pixel art da vfx_workbench: 32 px por metro, sem passar de 1,4 m de largura num quadrado. */
const PX_POR_METRO = 32;
const LARGURA_MAX = 1.4;
/** Tamanho na cena (metros) de um quadro de `w` × `h` px. */
export const tamanhoDoSprite = (w: number, h: number) => {
	const k = Math.min(1 / PX_POR_METRO, LARGURA_MAX / w);
	return { w: w * k, h: h * k };
};

/** Número estável de um quadrado (o mesmo em todas as telas), para a amostra e a fase da animação. */
const misturar = (semente: string, x: number, y: number) => {
	let h = 2166136261;
	for (const c of `${semente}:${x}:${y}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
	// embaralha os bits no fim (o FNV sozinho deixa os bits altos quase iguais quando só o último número muda: a amostra
	// saía em colunas)
	h ^= h >>> 16;
	h = Math.imul(h, 0x85ebca6b);
	h ^= h >>> 13;
	h = Math.imul(h, 0xc2b2ae35);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
};

/**
 * Como cada estilo se espalha pela área: `densidade` é a fração dos quadrados que ganham desenho (os que parecem um
 * objeto, como a poça, o selo e o portal, ficam espaçados, para não virar carimbo) e `escala` aumenta ou diminui o desenho.
 */
const ESPALHAR: Record<string, { densidade: number; escala: number }> = {
	suiton: { densidade: 0.55, escala: 1 },
	yoton: { densidade: 0.6, escala: 1.1 },
	ninjutsu: { densidade: 0.45, escala: 1.1 },
	genjutsu: { densidade: 0.35, escala: 0.7 },
	hyoton: { densidade: 0.7, escala: 1 },
	jinton: { densidade: 0.7, escala: 1 },
	bakuton: { densidade: 0.6, escala: 1.5 },
	taijutsu: { densidade: 0.6, escala: 1.3 },
	bukijutsu: { densidade: 0.7, escala: 1.2 }
};

export interface SpriteNoQuadrado {
	x: number;
	y: number;
	/** deslocamento (m) do meio do quadrado, para os desenhos não ficarem em fila */
	dx: number;
	dy: number;
	/** tamanho relativo e espelhado na horizontal */
	k: number;
	espelho: boolean;
}

/**
 * Onde vão os desenhos animados do efeito: cada quadrado escolhido ganha um, um pouco fora do meio, de tamanho e lado
 * próprios (estáveis: os mesmos em todas as telas). Numa área enorme (uma esfera de 20 m passa de mil quadrados), no máximo
 * cerca de `limite`, espalhados; a base colorida continua cobrindo a área toda. Sempre pelo menos um.
 */
export function spritesDoEfeito(lista: readonly [number, number][], estilo: string, semente = '', limite = 120): SpriteNoQuadrado[] {
	if (!lista.length) return [];
	const { densidade, escala } = ESPALHAR[estilo] ?? { densidade: 1, escala: 1 };
	const p = Math.min(densidade, limite / lista.length);
	const escolhidos = lista.filter(([x, y]) => misturar(semente, x, y) < p);
	return (escolhidos.length ? escolhidos : [lista[0]]).map(([x, y]) => ({
		x,
		y,
		dx: (misturar(`${semente}#dx`, x, y) - 0.5) * 0.44,
		dy: (misturar(`${semente}#dy`, x, y) - 0.5) * 0.44,
		k: escala * (0.85 + misturar(`${semente}#k`, x, y) * 0.3),
		espelho: misturar(`${semente}#e`, x, y) < 0.5
	}));
}

/** Quanto a animação de cada quadrado já andou (ms), para os quadrados não pulsarem juntos como um carimbo. */
export const faseDoQuadrado = (semente: string, x: number, y: number, ms: number) => Math.round(misturar(`${semente}#fase`, x, y) * ms);
