// Classificação dos jutsus para os filtros do catálogo (D4).
import type { Jutsu } from './tipos.ts';
import { normalizar } from './texto.ts';

export const info = (j: Jutsu, chave: string) => j.info.find((i) => i.k === chave)?.v ?? '';

/** Ação principal: "Primária (comando ao cão)" → "Primária"; "Reação ou Primária" → "Reação". */
export function acaoDe(j: Jutsu): string {
	const v = info(j, 'Ação').split(/[\s(]/)[0];
	return v || '—';
}

/** Alvo único/pessoal × área, a partir do campo "Área" da linha de info. */
export function alcanceAlvo(j: Jutsu): 'Alvo único ou pessoal' | 'Área' {
	const v = normalizar(info(j, 'Área'));
	return /^(alvo|pessoal|voce|usuario|o proprio|1 )/.test(v) ? 'Alvo único ou pessoal' : 'Área';
}

export const FAIXAS_CUSTO = [
	{ id: '1-5', rotulo: '1 a 5', min: 1, max: 5 },
	{ id: '6-10', rotulo: '6 a 10', min: 6, max: 10 },
	{ id: '11-20', rotulo: '11 a 20', min: 11, max: 20 },
	{ id: '21+', rotulo: '21 ou mais', min: 21, max: Infinity }
] as const;

export function faixaCusto(j: Jutsu): string | null {
	if (!j.custoNum) return null;
	return FAIXAS_CUSTO.find((f) => j.custoNum >= f.min && j.custoNum <= f.max)?.id ?? null;
}
