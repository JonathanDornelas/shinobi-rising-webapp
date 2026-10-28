// A fábrica de reprodutores: o jukebox pede por fonte e só carrega o código (e o script oficial) da fonte que toca.
import type { FabricaReprodutor } from './tipos.ts';

export const criarReprodutor: FabricaReprodutor = async (o) => {
	if (o.fonte.fonte === 'youtube') return (await import('./youtube.ts')).criarYouTube(o);
	return (await import('./spotify.ts')).criarSpotify(o);
};
