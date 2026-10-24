// Tabelas do cap. 20 (Criação de Jutsus): componentes comprados com Pontos de Jutsu (PJ), ranks e ação.
// Os nomes e os valores são os do livro; o texto longo de cada regra fica no capítulo, que o criador linka.
import type { Rank, TipoJutsu } from '#lib/livro/tipos.ts';

export const TIPOS: TipoJutsu[] = ['Ninjutsu', 'Genjutsu', 'Taijutsu', 'Bukijutsu', 'Fuuinjutsu', 'Kugutsu'];
/** Taijutsu e Bukijutsu somam o atributo ao dano sem custo de PJ (cap. 20, Dano e Cura). */
export const TIPOS_FISICOS: TipoJutsu[] = ['Taijutsu', 'Bukijutsu'];
/** Atributo-chave de cada tipo para a DT do jutsu. */
export const ATRIBUTO_DO_TIPO: Record<TipoJutsu, 'CTR' | 'FOR' | 'INT' | 'AGI'> = {
	Ninjutsu: 'CTR',
	Genjutsu: 'CTR',
	Taijutsu: 'FOR',
	Bukijutsu: 'FOR',
	Fuuinjutsu: 'INT',
	Kugutsu: 'AGI'
};

export const DADOS = [4, 6, 8, 10, 12] as const;
export type Dado = (typeof DADOS)[number];

/** Dano e cura: PJ pelo dano médio (até 3,5 → 1 … 50,5 a 60 → 30; acima de 60, +5 PJ a cada +10). */
const FAIXAS_DANO: [number, number][] = [
	[3.5, 1],
	[5.5, 2],
	[8, 3],
	[11, 5],
	[15, 7],
	[20, 9],
	[25, 12],
	[30, 15],
	[40, 20],
	[50, 25],
	[60, 30]
];
export function pjDoDano(media: number): number {
	if (media <= 0) return 0;
	for (const [ate, pj] of FAIXAS_DANO) if (media <= ate) return pj;
	return 30 + 5 * Math.ceil((media - 60) / 10);
}
export const mediaDoDado = (d: number) => (d + 1) / 2;

export const ALCANCES = [
	{ id: 'pessoal', nome: 'Pessoal', nota: 'Só você', pj: 0 },
	{ id: 'toque', nome: 'Toque', nota: 'Adjacente (até 1m)', pj: 0 },
	{ id: 'curto', nome: 'Curto', nota: 'Até 10m', pj: 1 },
	{ id: 'medio', nome: 'Médio', nota: 'Até 30m', pj: 2 },
	{ id: 'longo', nome: 'Longo', nota: 'Até 60m', pj: 4 },
	{ id: 'distante', nome: 'Muito distante', nota: '100m ou mais', pj: 8 }
] as const;
export type Alcance = (typeof ALCANCES)[number]['id'];
export const ROTULO_ALCANCE: Record<Alcance, string> = {
	pessoal: 'Pessoal',
	toque: 'Toque',
	curto: 'Curto (10m)',
	medio: 'Médio (30m)',
	longo: 'Longo (60m)',
	distante: 'Muito distante (100m+)'
};

export const AREAS = [
	{ id: 'unico', nome: 'Alvo único', nota: '1 criatura ou objeto', pj: 0 },
	{ id: 'linha10', nome: 'Linha 10m', nota: 'Linha reta de 10m', pj: 1 },
	{ id: 'cone', nome: 'Cone pequeno', nota: 'Triângulo de 3m à sua frente', pj: 1 },
	{ id: 'esfera3', nome: 'Esfera 3m', nota: 'Círculo de 3m de raio', pj: 2 },
	{ id: 'cone-medio', nome: 'Cone médio / Linha 30m', nota: 'Cone de 10m ou linha de 30m', pj: 2 },
	{ id: 'esfera6', nome: 'Esfera 6m', nota: 'Círculo de 6m de raio', pj: 4 },
	{ id: 'esfera15', nome: 'Esfera 15m', nota: 'Devastação localizada', pj: 8 },
	{ id: 'massiva', nome: 'Massiva (100m+)', nota: 'Apenas Rank S: apaga terreno', pj: 15 }
] as const;
export type Area = (typeof AREAS)[number]['id'];
/** Cada alvo extra (máx. +3), só com alvo único: 2 PJ. */
export const ALVO_EXTRA = { pj: 2, max: 3 } as const;

/**
 * Componentes com PJ. `tipo`: liga/desliga, quantidade (pj por unidade, até `max`) ou valor escolhido entre `opcoes`.
 * `requer`: só vale junto de outro componente.
 */
export interface Componente {
	id: string;
	nome: string;
	pj: number;
	tipo: 'liga' | 'qtd' | 'valor';
	max?: number;
	opcoes?: number[];
	unidade?: string;
	requer?: string;
	resistencia?: 'FOR' | 'VIG' | 'ESP' | 'Acrobacia';
}

export const EFEITOS: Componente[] = [
	{ id: 'atordoa', nome: 'Atordoa por 1 turno', pj: 1, tipo: 'liga', resistencia: 'VIG' },
	{ id: 'empurra', nome: 'Empurra (3 m, se o jutsu não disser) ou derruba', pj: 1, tipo: 'liga', resistencia: 'FOR' },
	{ id: 'paralisa', nome: 'Paralisa por 1 turno', pj: 2, tipo: 'liga', resistencia: 'VIG' },
	{ id: 'imobiliza', nome: 'Imobiliza (preso até vencer a Resistência)', pj: 3, tipo: 'liga', resistencia: 'FOR' },
	{ id: 'controla', nome: 'Controla as ações do alvo', pj: 6, tipo: 'liga', resistencia: 'ESP' },
	{ id: 'cega', nome: 'Cega, ensurdece ou amedronta por 1 turno', pj: 2, tipo: 'liga', resistencia: 'ESP' },
	{ id: 'turnos', nome: 'Condição dura mais turnos', pj: 1, tipo: 'qtd', max: 3, unidade: 'turno extra' },
	{ id: 'continuo', nome: 'Veneno, queimadura ou sangramento contínuo', pj: 2, tipo: 'liga', resistencia: 'VIG' },
	{ id: 'sela', nome: 'Sela chakra (sem jutsus no próximo turno)', pj: 2, tipo: 'liga' },
	{ id: 'drena', nome: 'Drena chakra do alvo (1d6 PC)', pj: 2, tipo: 'liga' },
	{ id: 'transfere', nome: 'Transfere o chakra drenado ao usuário', pj: 1, tipo: 'liga', requer: 'drena' },
	{ id: 'ignora', nome: 'Ignora cobertura ou RD', pj: 2, tipo: 'liga' },
	{ id: 'persegue', nome: 'Persegue o alvo (acerto automático)', pj: 3, tipo: 'liga' },
	{ id: 'atravessa', nome: 'Atravessa múltiplos alvos em linha', pj: 3, tipo: 'liga' },
	{ id: 'barreira', nome: 'Barreira ou parede defensiva', pj: 2, tipo: 'qtd', max: 10, unidade: '10 PV' },
	{ id: 'invocacao', nome: 'Invocação ou clone autônomo', pj: 0, tipo: 'valor', opcoes: [4, 5, 6, 7, 8] },
	{ id: 'sustentado', nome: 'Sustentado (paga ¼ do custo por turno)', pj: 2, tipo: 'liga' }
];

export const APOIO: Componente[] = [
	{ id: 'buff1', nome: 'Buff em si mesmo: +1 em atributo, ataque ou Defesa (3 turnos)', pj: 2, tipo: 'liga' },
	{ id: 'buff2', nome: 'Buff em si mesmo: +2 em atributo, ataque ou Defesa (3 turnos)', pj: 4, tipo: 'liga' },
	{ id: 'buff-cena', nome: 'Buff dura 1 cena em vez de 3 turnos', pj: 2, tipo: 'liga' },
	{ id: 'rd2', nome: 'RD 2 em si mesmo (3 turnos)', pj: 3, tipo: 'liga' },
	{ id: 'remove', nome: 'Remove 1 condição negativa do aliado', pj: 3, tipo: 'liga' },
	{ id: 'buff-aliado', nome: 'Buff em aliado: +1 em atributo, ataque ou Defesa (3 turnos)', pj: 3, tipo: 'liga' },
	{ id: 'chakra-aliado', nome: 'Transferência de chakra (até 10 PC para aliado)', pj: 4, tipo: 'liga' },
	{ id: 'acao-extra', nome: 'Concede uma ação secundária extra (uma vez)', pj: 4, tipo: 'liga' }
];

export const MODIFICADORES: Componente[] = [
	{ id: 'rara', nome: 'Requer condição rara (chuva, lua cheia, alvo enfraquecido)', pj: -2, tipo: 'liga' },
	{ id: 'dano-proprio', nome: 'Causa dano ao próprio usuário (por 1d6)', pj: -1, tipo: 'qtd', max: 3, unidade: '1d6' },
	{ id: 'custa-pv', nome: 'Custa PV adicional no uso', pj: -1, tipo: 'qtd', max: 6, unidade: '5 PV' },
	{ id: 'fadiga', nome: 'Causa Fadiga ao usuário', pj: -1, tipo: 'qtd', max: 3, unidade: 'nível' },
	{ id: 'exige', nome: 'Exige outra técnica ativa ou portão aberto', pj: -1, tipo: 'liga' },
	{ id: 'preparo', nome: 'Preparação: 1 turno completo (−1) ou 3+ turnos (−2)', pj: 0, tipo: 'valor', opcoes: [-1, -2] },
	{ id: 'uma-vez', nome: 'Não pode ser reusado na mesma cena', pj: -2, tipo: 'liga' },
	{ id: 'consumivel', nome: 'Componente material consumível (pergaminho, sangue)', pj: 0, tipo: 'valor', opcoes: [-1, -2, -3] },
	{ id: 'duravel', nome: 'Componente material durável (foco em mãos)', pj: -1, tipo: 'liga' },
	{ id: 'sem-selos', nome: 'Sem selos (mãos ocupadas)', pj: 2, tipo: 'liga' },
	{ id: 'arma', nome: 'Pode ser canalizado em arma (soma o dano da arma)', pj: 3, tipo: 'liga' },
	{ id: 'dois-elementos', nome: 'Combina 2 elementos (KKG)', pj: 5, tipo: 'liga' },
	{ id: 'nao-copia', nome: 'Não pode ser copiado nem por Sharingan', pj: 3, tipo: 'liga' }
];

export const ACOES = [
	{ id: 'primaria', nome: 'Primária', pj: 0 },
	{ id: 'secundaria', nome: 'Secundária', pj: 2 },
	{ id: 'reacao', nome: 'Reação', pj: 3 },
	{ id: 'completa', nome: 'Completa', pj: -1 }
] as const;
export type Acao = (typeof ACOES)[number]['id'];

/** Criar com um Sensei: −2 PJ (cap. 20.6). */
export const SENSEI_PJ = -2;

/** Rank pelo total de PJ e PT para aprender (cap. 18). */
export const RANKS: { rank: Rank; de: number; ate: number; pt: number; dt: number }[] = [
	{ rank: 'E', de: 1, ate: 2, pt: 1, dt: 0 },
	{ rank: 'D', de: 3, ate: 5, pt: 2, dt: 1 },
	{ rank: 'C', de: 6, ate: 10, pt: 4, dt: 2 },
	{ rank: 'B', de: 11, ate: 18, pt: 8, dt: 3 },
	{ rank: 'A', de: 19, ate: 30, pt: 15, dt: 4 },
	{ rank: 'S', de: 31, ate: Infinity, pt: 30, dt: 5 }
];
export const rankDoPj = (pj: number) => RANKS.find((r) => pj >= r.de && pj <= r.ate) ?? RANKS[0];

/** Os 12 selos de mão. */
export const SELOS = ['Rato', 'Boi', 'Tigre', 'Coelho', 'Dragão', 'Serpente', 'Cavalo', 'Carneiro', 'Macaco', 'Galo', 'Cão', 'Javali'] as const;

export const SECOES_JUTSU = ['Conceito e tipo', 'Componentes (PJ)', 'Rank', 'Custo final', 'Seis atributos', 'Efeito'] as const;
