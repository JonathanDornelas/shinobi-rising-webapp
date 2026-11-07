// A interface do motor do fingersMap, gerado em ../fingersMap (npm run levar-para-mesa) e copiado para player.js.
export type Weather = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'underground';
export interface Air {
	hour: number;
	weather: Weather;
	strength: number;
	wind: number;
}
export interface Look {
	roofs: boolean;
	cut: boolean;
	grid: number;
	above: boolean;
}
export interface Camera {
	left: number;
	top: number;
	zoom: number;
	width: number;
	height: number;
}
export interface FigureArt {
	w: number;
	h: number;
	ax: number;
	ay: number;
	pixels: Uint8Array | Uint8ClampedArray;
}
export interface Figure {
	sprite: number;
	x: number;
	y: number;
	z?: number;
	flip?: boolean;
	flat?: boolean;
	/** Uma sombra no chão feita pela luz, sob a parte mais baixa do corpo e da largura dela. */
	shadow?: boolean;
	/** O que está na frente abre uma janela pequena em volta da figura, para casa ou árvore nunca a esconder. Ligado, a não ser com false. */
	seeThrough?: boolean;
}
export interface Body {
	box: [number, number, number, number];
	round?: boolean;
}
export type Wall = [number, number, number, number, 0 | 1 | 2 | 3 | 4];
export interface Door {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	open: boolean;
}
export type Quality = 'high' | 'low';
export class MapPlayer {
	static open(canvas: HTMLCanvasElement, map: Uint8Array, packUrl: string, options?: { floor?: number; quality?: Quality }): Promise<MapPlayer>;
	onQuality: ((quality: Quality) => void) | null;
	readonly size: { x: number; y: number };
	bodies(): Body[];
	standingBodies(): Body[];
	levelsAt(x: number, y: number): number[];
	wallsFor(meters: number): Wall[];
	setInside(people: readonly { x: number; y: number; z: number }[]): void;
	setDoors(doors: readonly Door[]): void;
	setAir(air: Partial<Air>): void;
	setLook(look: Partial<Look>): void;
	setQuality(quality: Quality): void;
	setCamera(camera: Camera, ratio?: number): void;
	addFigure(art: FigureArt, name?: string): number | null;
	clearFigures(): void;
	setFigures(list: readonly Figure[]): void;
	setVision(mask: HTMLCanvasElement | OffscreenCanvas | null): void;
	start(): void;
	stop(): void;
	dispose(): void;
}
