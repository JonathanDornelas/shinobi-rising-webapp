// Modelo de dados do livro, gerado por scripts/livro/converter.js a partir do .docx.

/** Trecho de texto com formatação. `href` = referência cruzada; `termo` = id no glossário. */
export interface Trecho {
	t: string;
	b?: 1;
	i?: 1;
	href?: string;
	termo?: string;
}

/** Célula de tabela: um ou mais parágrafos. */
export type Celula = Trecho[][];

export interface ItemLista {
	c: Trecho[];
	sub?: ItemLista[];
}

export type VarianteDestaque = 'destaque' | 'exemplo' | 'atencao' | 'dica' | 'requisito';

export type Bloco =
	| { tipo: 'p'; c: Trecho[] }
	| { tipo: 'h'; nivel: 2 | 3 | 4; id: string; texto: string }
	| { tipo: 'lista'; ordenada: boolean; itens: ItemLista[] }
	| { tipo: 'formula'; texto: string }
	| { tipo: 'epigrafe'; texto: string; autor: string }
	| { tipo: 'destaque'; variante: VarianteDestaque; titulo: string; blocos: Bloco[] }
	| { tipo: 'tabela'; cab: string[] | null; linhas: Celula[][] }
	| { tipo: 'jutsu'; slug: string }
	| { tipo: 'habilidade'; slug: string }
	| { tipo: 'clas' };

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type TipoJutsu = 'Ninjutsu' | 'Genjutsu' | 'Taijutsu' | 'Bukijutsu' | 'Fuuinjutsu' | 'Kugutsu';

export interface InfoJutsu {
	k: string;
	v: string;
}

export interface Jutsu {
	slug: string;
	nome: string;
	traducao: string;
	origem: string;
	tipo: TipoJutsu;
	rank: Rank;
	/** Custo como está no livro: "8 PC", "10 PE", "8 PC + 8 PE". */
	custo: string;
	/** Primeiro número do custo, para ordenar e filtrar. */
	custoNum: number;
	descricao: Trecho[][];
	info: InfoJutsu[];
	efeito: Trecho[] | null;
	notas: Trecho[][];
	pj: string | null;
	capitulo: number;
	/** Seção do capítulo onde o card aparece. */
	ancora: string;
	cla: string | null;
	elemento: string | null;
}

export interface Habilidade {
	slug: string;
	nome: string;
	traducao: string;
	origem: string;
	descricao: Trecho[][];
	efeito: Trecho[] | null;
	notas: Trecho[][];
	capitulo: number;
	ancora: string;
	cla: string | null;
}

export interface SecaoIndice {
	id: string;
	titulo: string;
	nivel: 2 | 3 | 4;
}

export interface Capitulo {
	numero: number;
	slug: string;
	href: string;
	titulo: string;
	parte: number;
	kanji: string;
	epigrafe: { texto: string; autor: string } | null;
	blocos: Bloco[];
	secoes: SecaoIndice[];
	resumo: string;
}

export interface CapituloIndice {
	numero: number;
	slug: string;
	href: string;
	titulo: string;
	parte: number;
	resumo: string;
	secoes: SecaoIndice[];
}

export interface Parte {
	numero: number;
	rotulo: string;
	titulo: string;
	icone: string;
	capitulos: number[];
}

export interface IndiceLivro {
	partes: Parte[];
	capitulos: CapituloIndice[];
}

export type Relacao = 'Aliado' | 'Neutro' | 'Rival' | 'Inimigo Declarado';

export interface Cla {
	slug: string;
	numero: string;
	nome: string;
	epiteto: string;
	vila: { nome: string; icone: string | null; nota: string | null };
	epigrafe: { texto: string; autor: string } | null;
	descricao: Bloco[];
	secoes: { id: string; titulo: string; blocos: Bloco[] }[];
	bonus: { texto: string; nota: string | null }[];
	kkg: { nome: string; tipo: string; icone: string } | null;
	marcos: { nivel: number; texto: string }[];
	status: { rotulo: string; pic: number | null } | null;
	relacoes: { cla: string; nome: string; relacao: Relacao }[];
	obrigacao: Trecho[] | null;
	jutsus: string[];
	habilidades: string[];
}

export interface Arma {
	slug: string;
	nome: string;
	dano: string;
	alcance: string;
	peso: string;
	preco: string;
	propriedades: string[];
	icone: string;
}

export interface CategoriaArmas {
	id: string;
	titulo: string;
	icone: string;
	ancora: string;
	armas: Arma[];
}

export interface Espada {
	slug: string;
	nome: string;
	traducao: string;
	dano: string;
	peso: string;
	habilidade: string;
	icone: string;
}

export interface AbaEquipamento {
	id: string;
	titulo: string;
	/** Trechos do livro exibidos na aba, cada um com o link para o capítulo de origem. */
	secoes: { titulo: string; href: string; blocos: Bloco[] }[];
}

export interface Equipamentos {
	categorias: CategoriaArmas[];
	espadas: Espada[];
	propriedades: { nome: string; efeito: string }[];
	abas: AbaEquipamento[];
}

export interface Especializacao {
	slug: string;
	nome: string;
	icone: string;
	niveis: { nivel: number; beneficio: Trecho[][] }[];
	extras: Bloco[];
	requisito: string | null;
}

export interface Especializacoes {
	intro: Bloco[];
	quando: { titulo: string; blocos: Bloco[]; niveis: number[] } | null;
	lista: Especializacao[];
	extras: Bloco[];
}

export interface TermoGlossario {
	id: string;
	termo: string;
	campos: string[];
	icone: string | null;
}

export interface SecaoGlossario {
	id: string;
	titulo: string;
	intro: Bloco[];
	colunas: string[];
	termos: TermoGlossario[];
}

export interface CardReferencia {
	id: string;
	titulo: string;
	icone: string;
	capitulo: { numero: number; href: string };
	linhas: [string, string][];
}

export type TipoDocBusca = 'secao' | 'jutsu' | 'cla' | 'item' | 'termo';

export interface DocBusca {
	id: string;
	tipo: TipoDocBusca;
	titulo: string;
	caminho: string;
	texto: string;
	href: string;
	icone: string;
	rank?: Rank;
}

/** Dados do clã usados nos cards (CMP-16) e nos índices. */
export type ClaResumo = Pick<Cla, 'slug' | 'nome' | 'epiteto' | 'vila' | 'kkg' | 'bonus' | 'status'>;
