// A aparência dos dados 3D de cada pessoa: a cor e o estilo (material e textura). Fica no perfil (preferencias.dado),
// então quem assiste à mesa vê os dados de quem rolou do jeito que essa pessoa escolheu.
// As texturas vêm da biblioteca dos dados 3D (licença MIT) e ficam em static/dados-3d/textures.

/** Um estilo: a textura e o material da biblioteca (dice-box-threejs). */
export interface EstiloDado {
	id: string;
	nome: string;
	dica: string;
	/** Nome da textura na biblioteca ('none' = liso). */
	textura: string;
	/** Material da biblioteca: plastic, metal, wood, glass. */
	material: string;
	/** Arquivo da textura (a amostra no seletor). */
	amostra: string | null;
}

export const ESTILOS_DADO: EstiloDado[] = [
	{ id: 'laca', nome: 'Laca', dica: 'Liso e brilhante', textura: 'none', material: 'plastic', amostra: null },
	{ id: 'aco', nome: 'Aço', dica: 'Metal escovado, como uma kunai', textura: 'metal', material: 'plastic', amostra: 'metal.webp' },
	{ id: 'madeira', nome: 'Madeira', dica: 'Veios de madeira', textura: 'wood', material: 'wood', amostra: 'wood.webp' },
	{ id: 'pergaminho', nome: 'Pergaminho', dica: 'Papel antigo, fosco', textura: 'paper', material: 'wood', amostra: 'paper.webp' },
	{ id: 'pedra', nome: 'Pedra', dica: 'Mármore com veios', textura: 'marble', material: 'glass', amostra: 'marble.webp' },
	{ id: 'chakra', nome: 'Chakra', dica: 'Nuvens de chakra', textura: 'cloudy_2', material: 'plastic', amostra: 'cloudy.alt.webp' },
	{ id: 'chamas', nome: 'Chamas', dica: 'Labaredas', textura: 'fire', material: 'plastic', amostra: 'fire.webp' },
	{ id: 'gelo', nome: 'Gelo', dica: 'Translúcido, como gelo', textura: 'ice', material: 'glass', amostra: 'ice.webp' },
	{ id: 'noite', nome: 'Noite', dica: 'Céu estrelado', textura: 'stars', material: 'plastic', amostra: 'stars.webp' }
];

/** As cores prontas do seletor (o grená é o padrão); qualquer outra sai do seletor de cor. */
export const CORES_DADO: [string, string][] = [
	['#5c1e15', 'Grená'],
	['#b8321f', 'Vermelhão'],
	['#c8641e', 'Laranja'],
	['#b8902a', 'Ouro'],
	['#3f6b3a', 'Folha'],
	['#2e7d6b', 'Jade'],
	['#2a4f8a', 'Azul'],
	['#2b2a5c', 'Índigo'],
	['#5e3a7a', 'Roxo'],
	['#1b1210', 'Sumi'],
	['#6b6b6b', 'Cinza'],
	['#e8dcc4', 'Washi']
];

export interface AparenciaDado {
	cor: string;
	estilo: string;
	/** Dano na cor do elemento e cura em verde (no estilo escolhido); desligado, tudo sai na cor escolhida. */
	elemento: boolean;
}

export const APARENCIA_PADRAO: AparenciaDado = { cor: '#5c1e15', estilo: 'laca', elemento: true };

/** Lê o que veio do perfil (de qualquer pessoa): o que não for válido volta ao padrão. */
export function normalizarAparencia(a: unknown): AparenciaDado {
	const x = (a && typeof a === 'object' ? a : {}) as Partial<AparenciaDado>;
	return {
		cor: typeof x.cor === 'string' && /^#[0-9a-f]{6}$/i.test(x.cor) ? x.cor.toLowerCase() : APARENCIA_PADRAO.cor,
		estilo: ESTILOS_DADO.some((e) => e.id === x.estilo) ? x.estilo! : APARENCIA_PADRAO.estilo,
		elemento: x.elemento !== false
	};
}

export const estiloDado = (id: string) => ESTILOS_DADO.find((e) => e.id === id) ?? ESTILOS_DADO[0];

/** Números claros em dado escuro, escuros em dado claro (luminância relativa do WCAG). */
export function corDosNumeros(fundo: string): { letra: string; contorno: string } {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(fundo.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return l > 0.3 ? { letra: '#1b1210', contorno: '#f4e4d6' } : { letra: '#f4e4d6', contorno: '#1b1210' };
}

/** A cor do dado nesta rolagem: a do elemento (dano) ou o verde (cura), se a pessoa quiser; senão a dela. */
export const corDoDado = (a: AparenciaDado, daRolagem: string | null) => (a.elemento && daRolagem) || a.cor;
