// Gerado por pixellab/scripts/vfx-montar.cjs a partir dos efeitos da vfx_workbench do PixelLab (pixellab/vfx-jutsus.json).
// Cada estilo de efeito é uma tira horizontal em /mesa/fx/<estilo>.png: `quadros` quadros de `w` × `h` px que passam
// em `ms` milissegundos, em loop; (px, py) é o ponto de apoio do desenho (fração do quadro), que vai no meio do quadrado;
// `pico` é o quadro mais cheio, o que fica parado para quem pede menos movimento.

export interface SpriteFx {
	w: number;
	h: number;
	quadros: number;
	ms: number;
	px: number;
	py: number;
	pico: number;
}

export const SPRITES_FX: Record<string, SpriteFx> = {
	bakuton: { w: 27, h: 29, quadros: 12, ms: 996, px: 0.519, py: 0.586, pico: 7 },
	bukijutsu: { w: 29, h: 33, quadros: 12, ms: 756, px: 0.483, py: 0.364, pico: 4 },
	doton: { w: 66, h: 42, quadros: 12, ms: 996, px: 0.5, py: 0.333, pico: 7 },
	futton: { w: 48, h: 50, quadros: 16, ms: 1600, px: 0.5, py: 0.82, pico: 14 },
	fuuton: { w: 46, h: 36, quadros: 16, ms: 1328, px: 0.696, py: 0.306, pico: 15 },
	genjutsu: { w: 37, h: 51, quadros: 12, ms: 996, px: 0.486, py: 0.49, pico: 4 },
	hyoton: { w: 55, h: 29, quadros: 16, ms: 1600, px: 0.491, py: 0.621, pico: 2 },
	jinton: { w: 33, h: 39, quadros: 12, ms: 996, px: 0.485, py: 0.487, pico: 1 },
	jiton: { w: 50, h: 20, quadros: 24, ms: 2400, px: 0.5, py: 0.5, pico: 0 },
	katon: { w: 36, h: 53, quadros: 12, ms: 996, px: 0.5, py: 0.849, pico: 11 },
	mokuton: { w: 31, h: 29, quadros: 14, ms: 1162, px: 0.452, py: 0.69, pico: 9 },
	ninjutsu: { w: 30, h: 17, quadros: 16, ms: 1600, px: 0.5, py: 0.529, pico: 3 },
	raiton: { w: 34, h: 39, quadros: 12, ms: 996, px: 0.5, py: 0.538, pico: 6 },
	ranton: { w: 31, h: 37, quadros: 16, ms: 1600, px: 0.484, py: 0.541, pico: 8 },
	shakuton: { w: 31, h: 42, quadros: 12, ms: 996, px: 0.452, py: 0.833, pico: 3 },
	suiton: { w: 34, h: 40, quadros: 16, ms: 1328, px: 0.5, py: 0.775, pico: 8 },
	taijutsu: { w: 26, h: 24, quadros: 6, ms: 378, px: 0.462, py: 0.5, pico: 1 },
	yoton: { w: 36, h: 21, quadros: 12, ms: 1200, px: 0.5, py: 0.571, pico: 2 }
};
