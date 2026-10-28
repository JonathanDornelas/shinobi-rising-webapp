// Efeitos de área da Mesa: cada jutsu deixado na cena ganha o visual do seu elemento (fogo, água, vento, raio, terra…) ou,
// sem elemento, do seu tipo (taijutsu, genjutsu, bukijutsu e ninjutsu genérico). O estilo vai junto do efeito
// (mesa_efeitos.estilo) e o quadro desenha o desenho animado de cada um (EfeitosFx.svelte).
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
