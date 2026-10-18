// Opções de campanha (C2/C7). Os valores batem com os checks da migração de campanhas.
import type { Aprovacao, Campanha, VilaCampanha } from '#lib/supabase/banco.ts';

export const ERAS = [
	{ id: 'primeira-guerra', nome: 'Primeira Guerra Ninja', curto: 'ERA DA PRIMEIRA GUERRA' },
	{ id: 'sannin', nome: 'Era Sannin', curto: 'ERA SANNIN' },
	{ id: 'classica', nome: 'Era clássica', curto: 'ERA CLÁSSICA' },
	{ id: 'pos-guerra', nome: 'Pós-guerra (Shippuden)', curto: 'PÓS-GUERRA' },
	{ id: 'boruto', nome: 'Era Boruto', curto: 'ERA BORUTO' },
	{ id: 'alternativa', nome: 'Linha do tempo alternativa', curto: 'LINHA ALTERNATIVA' }
] as const;
export type Era = (typeof ERAS)[number]['id'];

/** "Era clássica", ou o nome da linha alternativa. */
export function nomeEra(c: Pick<Campanha, 'era' | 'era_alternativa'>): string {
	if (c.era === 'alternativa' && c.era_alternativa?.trim()) return c.era_alternativa.trim();
	return ERAS.find((e) => e.id === c.era)?.nome ?? c.era;
}
export function rotuloEra(c: Pick<Campanha, 'era' | 'era_alternativa'>): string {
	if (c.era === 'alternativa' && c.era_alternativa?.trim()) return c.era_alternativa.trim().toUpperCase();
	return ERAS.find((e) => e.id === c.era)?.curto ?? c.era.toUpperCase();
}

// Paisagens das vilas (PixelLab, pixellab/gerados/capas-vilas); a Floresta é o interior genérico dos Renegados.
export const CAPAS = [
	{ id: 'capa-konoha', nome: 'Konoha' },
	{ id: 'capa-suna', nome: 'Suna' },
	{ id: 'capa-kiri', nome: 'Kiri' },
	{ id: 'capa-kumo', nome: 'Kumo' },
	{ id: 'capa-iwa', nome: 'Iwa' },
	{ id: 'capa-ame', nome: 'Ame' },
	{ id: 'capa-taki', nome: 'Taki' },
	{ id: 'capa-oto', nome: 'Oto' },
	{ id: 'capa-floresta', nome: 'Renegados' }
] as const;

// capas genéricas de antes das vilas (a migração converte o banco; aqui só por segurança)
const CAPA_ANTIGA: Record<string, string> = { 'capa-nevoa': 'capa-kiri', 'capa-deserto': 'capa-suna', 'capa-montanha': 'capa-kumo', 'capa-chuva': 'capa-ame', 'capa-rochas': 'capa-iwa' };

/** URL da paisagem (256×96) de uma capa de campanha. */
export const urlCapa = (id: string | null | undefined) => `/covers/${CAPA_ANTIGA[id ?? ''] ?? id ?? 'capa-konoha'}-256.png`;

/** Paisagem da vila do personagem (Renegado/sem vila: floresta). */
export const capaDaVila = (vila: string | null | undefined) => urlCapa(CAPAS.some((c) => c.id === `capa-${vila}`) ? `capa-${vila}` : 'capa-floresta');

export const VILAS = [
	{ id: 'konoha', nome: 'Konoha' },
	{ id: 'kiri', nome: 'Kiri' },
	{ id: 'suna', nome: 'Suna' },
	{ id: 'kumo', nome: 'Kumo' },
	{ id: 'iwa', nome: 'Iwa' },
	{ id: 'ame', nome: 'Ame' },
	{ id: 'oto', nome: 'Oto' },
	{ id: 'taki', nome: 'Taki' },
	{ id: 'sem', nome: 'Sem vila' }
] as const;

export const STATUS_VILA: { id: VilaCampanha['status']; nome: string }[] = [
	{ id: null, nome: 'Sem relação' },
	{ id: 'aliada', nome: 'Aliada' },
	{ id: 'em-guerra', nome: 'Em guerra' },
	{ id: 'neutra', nome: 'Neutra' }
];

export const CLAS = [
	'nara',
	'akimichi',
	'yamanaka',
	'inuzuka',
	'aburame',
	'hyuuga',
	'uchiha',
	'senju',
	'uzumaki',
	'kaguya',
	'hozuki',
	'sabaku',
	'yuki'
] as const;
export const nomeCla = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1);

/** Pacotes iniciais do cap. 11: A (equipamento pronto), B (14.000 ryo) e a troca do Marionetista. */
export const PACOTES = [
	{ id: 'A', nome: 'Pacote A', ajuda: 'Equipamento pronto da vila' },
	{ id: 'B', nome: 'Pacote B', ajuda: '14.000 ryo para gastar' },
	{ id: 'marionetista', nome: 'Marionetista', ajuda: 'Troca o Pacote A por kit e marionete' }
] as const;

export const APROVACOES: { id: keyof Aprovacao | 'clas' | 'jutsus'; nome: string; travado?: boolean; nota?: string }[] = [
	{ id: 'fichas', nome: 'Fichas de personagem' },
	{ id: 'clas', nome: 'Clãs personalizados', travado: true, nota: 'Todo clã criado passa pelo Mestre · cap. 8.4' },
	{ id: 'jutsus', nome: 'Jutsus e habilidades criados', travado: true, nota: 'Todo jutsu deve ser aprovado pelo Mestre · cap. 20.6' },
	{ id: 'armas', nome: 'Armas forjadas' },
	{ id: 'itens', nome: 'Itens personalizados' },
	{ id: 'marionetes', nome: 'Marionetes' },
	{ id: 'backgrounds', nome: 'Backgrounds personalizados' },
	{ id: 'treino', nome: 'Pedidos de PT de treino' },
	{ id: 'mestre_edita_aprovadas', nome: 'Mestre pode editar fichas aprovadas diretamente' }
];

export const APROVACAO_PADRAO: Aprovacao = {
	fichas: true,
	armas: true,
	itens: true,
	marionetes: true,
	backgrounds: true,
	treino: true,
	mestre_edita_aprovadas: false
};

/** Tabela de progressão do livro (cap. 3): XP acumulado e rank sugerido por nível. */
export const NIVEIS: { xp: number; rank: string }[] = [
	{ xp: 0, rank: 'Genin recém-formado' },
	{ xp: 200, rank: 'Genin experiente' },
	{ xp: 500, rank: 'Genin veterano' },
	{ xp: 1000, rank: 'Chunin recém-formado' },
	{ xp: 1800, rank: 'Chunin experiente' },
	{ xp: 3000, rank: 'Chunin veterano' },
	{ xp: 5000, rank: 'Jounin Especial / Anbu jovem' },
	{ xp: 8000, rank: 'Anbu veterano' },
	{ xp: 12000, rank: 'Chefe Anbu' },
	{ xp: 18000, rank: 'Jounin experiente' },
	{ xp: 26000, rank: 'Jounin veterano' },
	{ xp: 36000, rank: 'Jounin de Elite' },
	{ xp: 48000, rank: 'Sannin / Mestre Lendário' },
	{ xp: 62000, rank: 'Kage' },
	{ xp: 78000, rank: 'Kage de elite' },
	{ xp: 96000, rank: 'Lenda viva' },
	{ xp: 116000, rank: 'Lenda eterna' },
	{ xp: 138000, rank: 'Deus Shinobi' },
	{ xp: 162000, rank: 'Mito' },
	{ xp: 188000, rank: 'Sem precedentes' }
];
export const rankSugerido = (nivel: number) => NIVEIS[Math.min(Math.max(nivel, 1), 20) - 1].rank;

/** O livro sugere grupos de 3 a 6 pessoas, contando o Mestre. */
export const GRUPO_SUGERIDO = { min: 3, max: 6 } as const;

export function avisoGrupo(pessoas: number): string {
	if (pessoas > GRUPO_SUGERIDO.max) return `O livro sugere de ${GRUPO_SUGERIDO.min} a ${GRUPO_SUGERIDO.max} pessoas, incluindo o Mestre.`;
	if (pessoas < GRUPO_SUGERIDO.min) return `Grupos com menos de ${GRUPO_SUGERIDO.min} pessoas pedem ajustes nos encontros.`;
	return '';
}

export const PAPEL = {
	mestre: { nome: 'Mestre', icone: 'papel/ic-papel-mestre' },
	jogador: { nome: 'Jogador', icone: 'papel/ic-papel-jogador' }
} as const;

/** Rascunho do assistente C2 (também o formato de edição em C7). */
export interface DadosCampanha {
	nome: string;
	premissa: string;
	capa: string;
	era: Era;
	era_alternativa: string;
	nivel_inicial: number;
	tamanho_grupo: number;
	vilas: VilaCampanha[];
	clas_permitidos: string[];
	clas_sem_kkg: boolean;
	clas_com_kkg: boolean;
	pacotes: string[];
	aprovacao: Aprovacao;
}

export function dadosPadrao(): DadosCampanha {
	return {
		nome: '',
		premissa: '',
		capa: 'capa-konoha',
		era: 'classica',
		era_alternativa: '',
		nivel_inicial: 1,
		tamanho_grupo: 5,
		vilas: ['konoha', 'kiri', 'suna', 'kumo', 'iwa', 'sem'].map((id) => ({ id, status: null })),
		clas_permitidos: [...CLAS],
		clas_sem_kkg: true,
		clas_com_kkg: true,
		pacotes: ['A', 'B'],
		aprovacao: { ...APROVACAO_PADRAO }
	};
}

export type ErrosCampanha = Partial<Record<'nome' | 'premissa' | 'era_alternativa' | 'vilas' | 'pacotes', string>>;

export function validarIdentidade(d: Pick<DadosCampanha, 'nome' | 'premissa'>): ErrosCampanha {
	const e: ErrosCampanha = {};
	const n = d.nome.trim().length;
	if (n < 3) e.nome = 'Dê um nome com pelo menos 3 letras.';
	else if (n > 60) e.nome = 'Use no máximo 60 caracteres.';
	if (d.premissa.length > 2000) e.premissa = 'Use no máximo 2.000 caracteres.';
	return e;
}

export function validarAmbientacao(d: Pick<DadosCampanha, 'era' | 'era_alternativa' | 'vilas' | 'pacotes'>): ErrosCampanha {
	const e: ErrosCampanha = {};
	if (d.era === 'alternativa' && !d.era_alternativa.trim()) e.era_alternativa = 'Dê um nome para a linha do tempo.';
	if (!d.vilas.length) e.vilas = 'Escolha pelo menos uma vila.';
	if (!d.pacotes.length) e.pacotes = 'Escolha pelo menos um pacote.';
	return e;
}

/** Converte o rascunho no registro da tabela campanhas. */
export function paraRegistro(d: DadosCampanha) {
	return {
		nome: d.nome.trim(),
		premissa: d.premissa.trim(),
		capa: d.capa,
		era: d.era,
		era_alternativa: d.era === 'alternativa' ? d.era_alternativa.trim() : null,
		nivel_inicial: d.nivel_inicial,
		tamanho_grupo: d.tamanho_grupo,
		vilas: d.vilas,
		clas_permitidos: d.clas_permitidos,
		clas_sem_kkg: d.clas_sem_kkg,
		clas_com_kkg: d.clas_com_kkg,
		pacotes: d.pacotes,
		aprovacao: d.aprovacao
	};
}

export function deRegistro(c: Campanha): DadosCampanha {
	return {
		nome: c.nome,
		premissa: c.premissa,
		capa: c.capa,
		era: c.era as Era,
		era_alternativa: c.era_alternativa ?? '',
		nivel_inicial: c.nivel_inicial,
		tamanho_grupo: c.tamanho_grupo,
		vilas: c.vilas,
		clas_permitidos: c.clas_permitidos,
		clas_sem_kkg: c.clas_sem_kkg,
		clas_com_kkg: c.clas_com_kkg,
		pacotes: c.pacotes,
		aprovacao: { ...APROVACAO_PADRAO, ...c.aprovacao }
	};
}

/** Resumo de uma linha para as seções recolhidas de C7. */
export function resumoAmbientacao(d: DadosCampanha): string {
	return `${nomeEra(d)} · nível ${d.nivel_inicial} · ${d.vilas.length} ${d.vilas.length === 1 ? 'vila' : 'vilas'} · ${d.clas_permitidos.length} clãs`;
}
export function resumoAprovacao(a: Aprovacao): string {
	const n = (['fichas', 'armas', 'itens', 'marionetes', 'backgrounds', 'treino'] as const).filter((k) => a[k]).length + 2;
	return `${n} tipos exigem aprovação`;
}
