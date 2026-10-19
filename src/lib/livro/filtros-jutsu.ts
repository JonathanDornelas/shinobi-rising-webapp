// Classificação dos jutsus para os filtros do catálogo (D4) e da aba Jutsus da ficha.
// Tudo é lido da linha de info do livro (Alcance, Duração, Área, Ataque, Resistência, Ação) e do texto do efeito.
import type { Jutsu } from './tipos.ts';
import { normalizar } from './texto.ts';

type ComInfo = { info: { k: string; v: string }[] };

export const info = (j: ComInfo, chave: string) => j.info.find((i) => i.k === chave)?.v ?? '';

/** Ação principal: "Primária (comando ao cão)" → "Primária"; "Reação ou Primária" → "Reação". */
export function acaoDe(j: ComInfo): string {
	const v = info(j, 'Ação').split(/[\s(]/)[0];
	return v || '—';
}

/** Alvo único/pessoal × área, a partir do campo "Área" da linha de info. */
export function alcanceAlvo(j: ComInfo): 'Alvo único ou pessoal' | 'Área' {
	const v = normalizar(info(j, 'Área'));
	return /^(alvo|pessoal|voce|usuario|o proprio|1 )/.test(v) ? 'Alvo único ou pessoal' : 'Área';
}

export const FAIXAS_CUSTO = [
	{ id: '1-5', rotulo: '1 a 5', min: 1, max: 5 },
	{ id: '6-10', rotulo: '6 a 10', min: 6, max: 10 },
	{ id: '11-20', rotulo: '11 a 20', min: 11, max: 20 },
	{ id: '21+', rotulo: '21 ou mais', min: 21, max: Infinity }
] as const;

export function faixaCusto(j: { custoNum: number }): string | null {
	if (!j.custoNum) return null;
	return FAIXAS_CUSTO.find((f) => j.custoNum >= f.min && j.custoNum <= f.max)?.id ?? null;
}

/** Texto corrido do efeito (ou da descrição, quando o card não tem efeito). */
export const textoEfeito = (j: Pick<Jutsu, 'efeito' | 'descricao'>) => (j.efeito ?? j.descricao.flat()).map((t) => t.t).join('');

/** Efeitos de um jutsu do livro: lidos do efeito; se ele não diz nada classificável, da descrição também. */
export function efeitosJutsu(j: Pick<Jutsu, 'efeito' | 'descricao'>): string[] {
	const r = efeitosDe(textoEfeito(j));
	return r[0] === 'outros' && j.efeito ? efeitosDe(textoEfeito(j) + ' ' + j.descricao.flat().map((t) => t.t).join('')) : r;
}

/**
 * O que o jutsu faz, lido do texto do efeito (um jutsu pode ter vários). Os testes rodam no texto normalizado
 * (minúsculas, sem acentos). A ordem é a dos filtros.
 */
export const EFEITOS: { id: string; rotulo: string; teste: (t: string) => boolean }[] = [
	{ id: 'dano', rotulo: 'Dano', teste: (t) => /\d+d\d+/.test(t) && /\bdano\b|\bcausa(m)? \d+d\d+|\bataques?\b[^.]*\([a-z ]*\d+d\d+/.test(t) },
	{ id: 'controle', rotulo: 'Controle e condições', teste: (t) => /controlad|imobilizad|paralisad|atordoad|\bcegos?\b|amedrontad|sangrando|\bcai\b|caido|empurrad|arremessad|arrastad|\bpuxar\b|\brecua\b|confus|nao pode(m)? (lancar jutsus|fazer selos)/.test(t) },
	{ id: 'penalidade', rotulo: 'Penalidades', teste: (t) => /[−-]\d+ (em|nas|na|no)\b/.test(t) },
	{ id: 'dreno', rotulo: 'Dreno de chakra', teste: (t) => /\bdrena|perde(m)? \d+d\d+ pc|perde \d+d\d+ pc/.test(t) },
	{ id: 'cura', rotulo: 'Cura e recuperação', teste: (t) => /\bcura\b|recupera|recupere/.test(t) },
	{ id: 'suporte', rotulo: 'Bônus e suporte', teste: (t) => /\+\d+ (na|nas|no|nos|em|for|agi|ctr|vig|esp)\b|vantagem|pv temporarios/.test(t) },
	{ id: 'defesa', rotulo: 'Defesa e barreiras', teste: (t) => /(barreira|parede) (de|com|tem) \d+|bloqueia|absorve|reduz a metade o dano|\brd \d+ contra|cobertura total/.test(t) },
	{ id: 'movimento', rotulo: 'Movimento', teste: (t) => /desloca-se|teleporte|troca de lugar|em linha reta/.test(t) },
	{ id: 'clones', rotulo: 'Clones', teste: (t) => /\bclones?\b/.test(t) },
	{ id: 'sensorial', rotulo: 'Sensorial e utilidade', teste: (t) => /detecta|mentalmente|trocam mensagens|aparencia|disfarce|informacao|localizar|sensores de chakra/.test(t) },
	{ id: 'selamento', rotulo: 'Selamento', teste: (t) => /\bsela\b|selad|\banula\b/.test(t) }
];

export function efeitosDe(texto: string): string[] {
	const t = normalizar(texto);
	const r = EFEITOS.filter((e) => e.teste(t)).map((e) => e.id);
	return r.length ? r : ['outros'];
}

export const nomeEfeito = (id: string) => EFEITOS.find((e) => e.id === id)?.rotulo ?? 'Outros';

/** Atributo ou perícia da Resistência: "FOR (DT do Jutsu) ou cai" → "FOR"; "—" → "Sem resistência". */
export function resistenciaDe(j: ComInfo): string {
	const v = info(j, 'Resistência').trim();
	if (!v || v.startsWith('—')) return 'Sem resistência';
	return v.split(/[\s(]/)[0];
}

/** Rolagem de ataque: "1d20 + Taijutsu (com CTR)" → "Taijutsu"; "— (área)" → "Sem rolagem (área)". */
export function ataqueDe(j: ComInfo): string {
	const v = info(j, 'Ataque').trim();
	const m = /^1d20 \+ (\p{L}+)/u.exec(v);
	if (m) return m[1];
	if (/^autom/i.test(v)) return 'Automático';
	if (/área/.test(v)) return 'Sem rolagem (área)';
	return 'Sem rolagem';
}

export const DURACOES = ['Instantânea', 'Em turnos', 'Sustentada', 'Cena ou mais'];

/** Duração agrupada: instantânea, em turnos, sustentada (gasta por turno) ou uma cena, horas, dias, permanente. */
export function duracaoDe(j: ComInfo): string {
	const v = normalizar(info(j, 'Duração'));
	if (v.startsWith('instant')) return 'Instantânea';
	if (v.startsWith('sustentad')) return 'Sustentada';
	if (/turno/.test(v)) return 'Em turnos';
	return 'Cena ou mais';
}
