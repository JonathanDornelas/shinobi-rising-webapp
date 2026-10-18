// Tema do usuário (perfil): cores de acento, fundo, texto e destaque, escala da interface e raio dos cantos.
// Vira variáveis CSS no <html>; o que não foi escolhido segue o tema washi/sumi.

export interface Visual {
	/** Cor principal (botões, abas ativas): o vermelhão. */
	acento?: string;
	fundo?: string;
	texto?: string;
	/** Títulos e destaques: o ouro. */
	destaque?: string;
	/** Escala da interface em %, aplicada com zoom. */
	escala?: number;
	/** Raio dos cantos, em px (0 = cantos retos do jogo). */
	raio?: number;
}

export const ESCALAS = [90, 100, 110, 125] as const;
export const RAIOS = [0, 2, 4, 8] as const;

/** Paletas prontas, inspiradas nas vilas (só acento e destaque; fundo e texto seguem o tema). */
export const PALETAS: { id: string; nome: string; acento: string; destaque: string }[] = [
	{ id: 'padrao', nome: 'Padrão', acento: '#c44536', destaque: '#d9a82b' },
	{ id: 'folha', nome: 'Folha', acento: '#3f8f4f', destaque: '#d9a82b' },
	{ id: 'areia', nome: 'Areia', acento: '#b8732e', destaque: '#e0c27a' },
	{ id: 'nevoa', nome: 'Névoa', acento: '#3a7ca5', destaque: '#9fd3e6' },
	{ id: 'nuvem', nome: 'Nuvem', acento: '#c9a227', destaque: '#f2e2a0' },
	{ id: 'akatsuki', nome: 'Akatsuki', acento: '#b3202a', destaque: '#e8e8e8' }
];

const HEX = /^#[0-9a-f]{6}$/i;
export const corValida = (c: unknown): c is string => typeof c === 'string' && HEX.test(c);

/** Descarta valores fora do esperado (o objeto vem do banco ou do localStorage). */
export function normalizarVisual(v: unknown): Visual {
	const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
	const r: Visual = {};
	for (const k of ['acento', 'fundo', 'texto', 'destaque'] as const) if (corValida(o[k])) r[k] = (o[k] as string).toLowerCase();
	if ((ESCALAS as readonly unknown[]).includes(o.escala)) r.escala = o.escala as number;
	if ((RAIOS as readonly unknown[]).includes(o.raio)) r.raio = o.raio as number;
	return r;
}

/** Variáveis CSS do tema (só as escolhidas). */
export function variaveis(v: Visual): Record<string, string> {
	const r: Record<string, string> = {};
	if (v.acento) {
		r['--vermelhao'] = v.acento;
		r['--vermelhao-lo'] = `color-mix(in srgb, ${v.acento} 70%, #000)`;
		r['--grena'] = `color-mix(in srgb, ${v.acento} 46%, #000)`;
	}
	if (v.fundo) {
		const tinta = v.texto ?? (luminancia(v.fundo) > 0.4 ? '#1a1a1a' : '#efe3d3');
		r['--b1'] = v.fundo;
		r['--b2'] = `color-mix(in srgb, ${v.fundo} 94%, ${tinta})`;
		r['--b3'] = `color-mix(in srgb, ${v.fundo} 84%, ${tinta})`;
		r['--frame'] = `color-mix(in srgb, ${v.fundo} 80%, ${tinta})`;
		r['--fundo'] = `color-mix(in srgb, ${v.fundo} 85%, #000)`;
	}
	if (v.texto) {
		r['--fg'] = v.texto;
		r['--mut'] = v.fundo ? `color-mix(in srgb, ${v.texto} 70%, ${v.fundo})` : `color-mix(in srgb, ${v.texto} 72%, transparent)`;
	}
	if (v.destaque) {
		r['--acc'] = v.destaque;
		r['--title'] = v.destaque;
	}
	if (v.raio) r['--raio'] = `${v.raio}px`;
	if (v.escala && v.escala !== 100) r['--escala'] = String(v.escala / 100);
	return r;
}

/** Luminância relativa (WCAG) de uma cor #rrggbb. */
export function luminancia(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste WCAG entre duas cores (1 a 21). Texto comum pede pelo menos 4,5. */
export function contraste(a: string, b: string): number {
	const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
}
