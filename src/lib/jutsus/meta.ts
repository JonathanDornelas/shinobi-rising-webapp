// Os dados de um jutsu em pedaços curtos para as listas (ficha rápida e ficha completa), cada um ao lado do seu ícone:
// "30 m" no lugar de "Médio (30m)", "cone 10 m" no lugar de "Cone médio (10m)", "Acrobacia" no lugar de
// "Acrobacia (DT do Jutsu); metade do dano" (a DT fica no selo). O texto inteiro continua no card do jutsu.
import type { Regua } from '#lib/mesa/regua.ts';

export const alcanceCurto = (r: Regua, texto: string) => (r.alcance === 0 ? 'pessoal' : r.alcance === 1 ? 'toque' : r.alcance ? `${r.alcance} m` : texto || undefined);

export function areaCurta(r: Regua, clones?: { n: number | string } | null): string | undefined {
	if (clones) return `${clones.n} ${clones.n === 1 ? 'clone' : 'clones'}`;
	if (r.forma === 'alvos') return r.alvos && r.alvos > 1 ? `${r.alvos} alvos` : undefined;
	if (r.forma === 'cone-linha') return `cone ${r.cone} m ou linha ${r.linha} m`;
	if (r.forma === 'cena') return 'a cena toda';
	if (r.forma === 'nenhuma') return undefined;
	return `${r.forma === 'esfera' && r.emSi ? 'em volta' : r.forma} ${r.n} m`;
}

/** "Acrobacia (DT 12); metade do dano" → "Acrobacia"; "—" → nada. */
export const resistenciaCurta = (t: string | null | undefined) => (t && t !== '—' ? t.split(/[(;,]/)[0].replace(/^Resist[êe]ncia de\s*/i, '').trim() || undefined : undefined);
