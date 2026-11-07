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
}
export interface Body {
	box: [number, number, number, number];
	round?: boolean;
}
export type Quality = 'high' | 'low';
export class MapPlayer {
	static open(canvas: HTMLCanvasElement, map: Uint8Array, packUrl: string, options?: { floor?: number; quality?: Quality }): Promise<MapPlayer>;
	onQuality: ((quality: Quality) => void) | null;
	readonly size: { x: number; y: number };
	bodies(): Body[];
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
