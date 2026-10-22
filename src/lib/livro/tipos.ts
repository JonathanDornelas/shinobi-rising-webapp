// Modelo de dados do livro, gerado por scripts/livro/compilar.ts a partir de conteudo/ (Markdown + YAML).
import type { FichaCompleta } from '../bestiario/ficha.ts';

/**
 * Trecho de texto com formatação. `href` = referência cruzada; `termo` = id no léxico ("tipo:slug", ver TermoLexico);
 * `def` = é a definição do termo (1ª coluna da tabela que o define: sem link); `dado` = expressão de dados ("2d6+3").
 */
export interface Trecho {
	t: string;
	b?: 1;
	i?: 1;
	href?: string;
	termo?: string;
	def?: 1;
	dado?: string;
}

export type TipoTermo = 'recurso' | 'atributo' | 'condicao' | 'regra' | 'pericia' | 'jutsu' | 'habilidade' | 'cla' | 'arma' | 'elemento' | 'rank';

/** Verbete do léxico (gerado/termos.json): o cartão que abre no hover de um termo no texto. */
export interface TermoLexico {
	id: string;
	tipo: TipoTermo;
	rotulo: string;
	nome: string;
	resumo: string;
	href: string;
	icone: string | null;
	/** Dados extras do cartão (jutsu: rank, tipo, custo, ação; arma: dano, alcance). */
	extra?: Record<string, string>;
}

/** Célula de tabela: um ou mais parágrafos. */
export type Celula = Trecho[][];

export interface ItemLista {
	c: Trecho[];
	sub?: ItemLista[];
}

export type VarianteDestaque = 'destaque' | 'exemplo' | 'atencao' | 'dica' | 'requisito';

/** Linha do quadro "Na mesa": um rótulo curto e o valor da regra. */
export interface LinhaMesa {
	rotulo: Trecho[];
	valor: Trecho[];
}

export type Bloco =
	| { tipo: 'p'; c: Trecho[] }
	| { tipo: 'h'; nivel: 2 | 3 | 4; id: string; texto: string }
	| { tipo: 'lista'; ordenada: boolean; itens: ItemLista[] }
	| { tipo: 'formula'; texto: string }
	| { tipo: 'epigrafe'; texto: string; autor: string }
	| { tipo: 'destaque'; variante: VarianteDestaque; titulo: string; blocos: Bloco[] }
	| { tipo: 'tabela'; cab: string[] | null; linhas: Celula[][]; titulo?: string; ids?: (string | null)[] }
	/** Cena narrada que abre uma regra ou um capítulo (parágrafos em itálico). */
	| { tipo: 'cena'; c: Trecho[][] }
	/** Quadro "Na mesa": os números da regra juntos para consulta; `ref` alimenta a referência rápida. */
	| { tipo: 'mesa'; titulo?: string; ref?: string; linhas: LinhaMesa[]; notas: Trecho[][] }
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
	/** Tempo de leitura estimado. */
	minutos?: number;
	/** Arte de abertura (static/capitulos/cap-NN.png), se houver. */
	arte?: string | null;
}

export interface CapituloIndice {
	numero: number;
	slug: string;
	href: string;
	titulo: string;
	parte: number;
	resumo: string;
	secoes: SecaoIndice[];
	arte?: string | null;
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

// ---------------------------------------------------------------- bestiário (conteudo/bestiario.yaml)
export type TipoCriatura = 'shinobi' | 'fora da lei' | 'guerreiro' | 'fauna' | 'invocação' | 'criatura';
export type PapelCriatura = 'lutador' | 'atirador' | 'controlador' | 'suporte' | 'assassino' | 'bando' | 'chefe';
/** Formato da arte do verbete: a página muda de diagramação conforme ele (faixa no topo, retrato ao lado etc.). */
export type FormatoArte = 'faixa' | 'retrato' | 'quadro' | 'pagina';
export type RankNpc = 'genin' | 'chunin' | 'jounin' | 'anbu' | 'lendario';

export interface AtaqueCriatura {
	nome: string;
	acerto: number;
	dano: string;
	alcance: string;
	efeito: Trecho[] | null;
}

/** Jutsu do verbete: do catálogo (slug, rank e custo vêm do card) ou descrito só pela nota. */
export interface JutsuCriatura {
	slug: string | null;
	nome: string;
	rank: Rank | null;
	custo: string | null;
	nota: string | null;
}

/** Arte de um verbete ou de um estágio (static/bestiario). */
export interface ArteVerbete {
	arquivo: string | null;
	formato: FormatoArte;
	plano: string;
	largura: number;
	altura: number;
}

/**
 * Um estágio do adversário (como as idades de um dragão, ou os níveis de um ninja de clã): uma ficha separada, com a
 * sua ameaça, os seus jutsus e a sua própria arte, na mesma página da categoria.
 */
export interface EstagioCriatura {
	/** Âncora na página do verbete (#genin, #sapo-guerreiro). */
	slug: string;
	nome: string;
	/** Arte própria do estágio (static/bestiario/<verbete>--<estágio>.png); null nos verbetes de uma ficha só. */
	arte: ArteVerbete | null;
	ameaca: number;
	/** "1/2", "1/4" ou o número. */
	ameacaRotulo: string;
	papel: PapelCriatura;
	/** Rank da ficha resumida (cap. 23.2) equivalente à ameaça, para criar o NPC na campanha. */
	rank: RankNpc;
	membros: number;
	/** O que muda neste estágio, em uma frase. */
	resumo: Trecho[] | null;
	combate: {
		pv: number;
		pc: number | null;
		defesa: number;
		iniciativa: number;
		dt: number;
		rd: number | null;
		nota: string | null;
		ataques: AtaqueCriatura[];
		jutsus: JutsuCriatura[];
		tracos: { nome: string; efeito: Trecho[] }[];
		/** Atributos, perícias, especializações e proficiências, derivados dos números acima (bestiario/ficha.ts). */
		ficha: FichaCompleta;
	};
}

/** Verbete do bestiário: uma página, com a arte, o texto e um ou mais estágios. */
export interface Criatura {
	slug: string;
	nome: string;
	/** Letra do índice alfabético (sem acento). */
	letra: string;
	tipo: TipoCriatura;
	origem: string;
	vila: { nome: string; icone: string } | null;
	/** Arte da categoria; sem arquivo próprio, usa a de um estágio (o marcado como capa, ou o primeiro com arte). */
	arte: ArteVerbete;
	cena: Trecho[][];
	descricao: Trecho[][];
	estagios: EstagioCriatura[];
	/** Faixa de ameaça dos estágios ("2 a 16" ou só "6"). */
	ameacaFaixa: string;
	ameacaMin: number;
	ameacaMax: number;
	taticas: Trecho[][];
	ganchos: Trecho[][];
	tags: string[];
}

export interface Bestiario {
	comoUsar: { titulo: string; resumo: string; blocos: Bloco[]; secoes: SecaoIndice[] };
	criaturas: Criatura[];
}

export type TipoDocBusca = 'secao' | 'jutsu' | 'cla' | 'item' | 'criatura' | 'termo';

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
