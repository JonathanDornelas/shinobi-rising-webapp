// Cores e rótulos de domínio (DS 1 · Cores de domínio). Iguais nos dois temas.
import type { Rank, TipoJutsu, VarianteDestaque } from './tipos';

/** URL de um ícone PixelLab (32px nativo) ou de uma ilustração (96px). */
export function iconeUrl(id: string): string {
	if (id.startsWith('illustrations/')) return `/${id}-96.png`;
	return `/icons/${id}-32.png`;
}

export const TIPO_JUTSU: Record<TipoJutsu, { cor: string; texto: string; icone: string; recurso: string; pericia: string }> = {
	Ninjutsu: { cor: '#069BBD', texto: '#1A1A1A', icone: 'pericia/ic-pericia-ninjutsu', recurso: 'PC', pericia: 'Ninjutsu' },
	Genjutsu: { cor: '#674EA7', texto: '#FFFFFF', icone: 'pericia/ic-pericia-genjutsu', recurso: 'PC', pericia: 'Genjutsu' },
	Taijutsu: { cor: '#38761D', texto: '#FFFFFF', icone: 'pericia/ic-pericia-taijutsu', recurso: 'PE', pericia: 'Taijutsu' },
	Bukijutsu: { cor: '#BF9000', texto: '#1A1A1A', icone: 'pericia/ic-pericia-bukijutsu', recurso: 'PE', pericia: 'Bukijutsu' },
	Fuuinjutsu: { cor: '#7F6000', texto: '#FFFFFF', icone: 'pericia/ic-pericia-selamento', recurso: 'PC', pericia: 'Selamento' },
	Kugutsu: { cor: '#A23B72', texto: '#FFFFFF', icone: 'pericia/ic-pericia-kugutsu', recurso: 'PC + PE', pericia: 'Kugutsu' }
};

/** Selos de rank (CMP-03). PJ, quem usa, PT para aprender e bônus de DT conforme o Apêndice A. */
export const RANK: Record<Rank, { bg: string; fg: string; borda: string; pj: string; quem: string; pt: number; dt: number }> = {
	E: { bg: '#E6D2BF', fg: '#5C524A', borda: '#0E0B0A', pj: '1–2', quem: 'Acadêmicos', pt: 1, dt: 0 },
	D: { bg: '#A88B6A', fg: '#1A1A1A', borda: '#0E0B0A', pj: '3–5', quem: 'Genin', pt: 2, dt: 1 },
	C: { bg: '#5E6B73', fg: '#FFFFFF', borda: '#0E0B0A', pj: '6–10', quem: 'Chunin', pt: 4, dt: 2 },
	B: { bg: '#5C1E15', fg: '#F4E4D6', borda: '#8B2E20', pj: '11–18', quem: 'Jounin', pt: 8, dt: 3 },
	A: { bg: '#C44536', fg: '#FFFFFF', borda: '#0E0B0A', pj: '19–30', quem: 'Jounin de elite, Anbu', pt: 15, dt: 4 },
	S: { bg: '#1A1A1A', fg: '#F2C14E', borda: '#BF9000', pj: '31+', quem: 'Kage, Sannin, lendas', pt: 30, dt: 5 }
};
export const RANKS: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

export const ELEMENTO: Record<string, { nome: string; cor: string; traducao: string }> = {
	katon: { nome: 'Katon', cor: '#E8692E', traducao: 'Fogo' },
	suiton: { nome: 'Suiton', cor: '#2E6FD1', traducao: 'Água' },
	doton: { nome: 'Doton', cor: '#8D6E3F', traducao: 'Terra' },
	raiton: { nome: 'Raiton', cor: '#F2C14E', traducao: 'Raio' },
	fuuton: { nome: 'Fuuton', cor: '#7FB069', traducao: 'Vento' },
	mokuton: { nome: 'Mokuton', cor: '#4E7A2E', traducao: 'Madeira' },
	hyoton: { nome: 'Hyōton', cor: '#7FD3E6', traducao: 'Gelo' },
	yoton: { nome: 'Yōton', cor: '#B23A12', traducao: 'Lava' },
	ranton: { nome: 'Ranton', cor: '#3A5BA0', traducao: 'Tempestade' },
	jiton: { nome: 'Jiton', cor: '#5E6B73', traducao: 'Magnético' },
	futton: { nome: 'Futton', cor: '#8FA9BC', traducao: 'Vapor' },
	shakuton: { nome: 'Shakuton', cor: '#E3922F', traducao: 'Calor' },
	bakuton: { nome: 'Bakuton', cor: '#A4472A', traducao: 'Explosão' },
	jinton: { nome: 'Jinton', cor: '#9C9283', traducao: 'Poeira' }
};

/** Cor em hex com transparência, para fundos (12%) e bordas (55%) de elemento. */
export function rgba(hex: string, alfa: number): string {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alfa})`;
}

/** Caixas de destaque (CMP-20): na direção 1a viram janela com barra de título colorida. */
export const DESTAQUE: Record<VarianteDestaque, { cor: string; texto: string; rotulo: string; icone: string }> = {
	destaque: { cor: '#5C1E15', texto: '#F4E4D6', rotulo: 'Destaque', icone: 'callout/ic-callout-destaque' },
	exemplo: { cor: '#BF9000', texto: '#1A1A1A', rotulo: 'Exemplo', icone: 'callout/ic-callout-citacao' },
	atencao: { cor: '#C44536', texto: '#FFFFFF', rotulo: 'Atenção · Regra', icone: 'callout/ic-callout-atencao' },
	dica: { cor: '#38761D', texto: '#FFFFFF', rotulo: 'Dica do Mestre', icone: 'callout/ic-callout-destaque' },
	requisito: { cor: '#5E6B73', texto: '#FFFFFF', rotulo: 'Pré-requisito', icone: 'callout/ic-callout-pre-requisito' }
};

export const RELACAO: Record<string, { bg: string; fg: string }> = {
	Aliado: { bg: 'var(--ok)', fg: 'var(--okfg)' },
	Neutro: { bg: 'var(--b3)', fg: 'var(--fg)' },
	Rival: { bg: 'var(--warn)', fg: 'var(--warnfg)' },
	'Inimigo Declarado': { bg: 'var(--err)', fg: 'var(--errfg)' }
};

/** Ícone que representa um jutsu em listas: kamon do clã, elemento ou perícia do tipo. */
export function iconeJutsu(j: { cla: string | null; elemento: string | null; tipo: TipoJutsu }): string {
	if (j.cla) return `cla/ic-cla-${j.cla}`;
	if (j.elemento) return `elemento/ic-elemento-${j.elemento}`;
	return TIPO_JUTSU[j.tipo].icone;
}
