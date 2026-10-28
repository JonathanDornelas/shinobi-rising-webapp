// A fábrica de reprodutores: o jukebox pede por fonte e só carrega o código (e o script oficial) da fonte que toca.
// Hoje só o YouTube; outra fonte entra aqui, com o mesmo contrato (tipos.ts).
import type { FabricaReprodutor } from './tipos.ts';

export const criarReprodutor: FabricaReprodutor = async (o) => (await import('./youtube.ts')).criarYouTube(o);
