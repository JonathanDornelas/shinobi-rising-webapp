// Gerado por pixellab/scripts/vfx-montar.cjs --clima a partir da vfx_workbench do PixelLab (pixellab/vfx-clima.json).
// O clima da cena: cada um é uma tira horizontal em /mesa/clima/<clima>.png (`quadros` quadros de `w` × `h` px em
// `ms` milissegundos, em loop), repetida em ladrilhos sobre o mapa; `pico` fica parado para quem pede menos movimento.
import type { SpriteFx } from './fx-sprites.ts';

export const SPRITES_CLIMA: Record<string, SpriteFx> = {
	chuva: { w: 103, h: 116, quadros: 12, ms: 996, px: 0.485, py: 0.845, pico: 10 },
	cinzas: { w: 95, h: 103, quadros: 16, ms: 1328, px: 0.537, py: 0.495, pico: 14 },
	folhas: { w: 95, h: 102, quadros: 16, ms: 1600, px: 0.537, py: 0.461, pico: 11 },
	neve: { w: 95, h: 103, quadros: 16, ms: 1328, px: 0.537, py: 0.495, pico: 14 },
	nevoa: { w: 135, h: 42, quadros: 16, ms: 1600, px: 0.489, py: 0.548, pico: 1 },
	petalas: { w: 95, h: 102, quadros: 16, ms: 1600, px: 0.537, py: 0.461, pico: 11 }
};
