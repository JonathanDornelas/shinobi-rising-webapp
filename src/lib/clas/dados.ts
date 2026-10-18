// Tabelas do cap. 8.4 (Criação de Clã e Kekkei Genkai) usadas pelo criador de clã (K2).
// Os números vêm do livro; o texto longo de cada regra fica no capítulo, que o criador linka.

/** Componente 1 · compras com Pontos de Bônus. `max`: quantas vezes dá para comprar; `alvo`: o que o jogador escolhe. */
export const COMPRAS_PB = [
	{ id: 'atributo', nome: '+1 em um atributo', nota: 'Limite de criação +5 nesse atributo', pb: 2, max: 1, alvo: 'atributo' },
	{ id: 'pericia', nome: '+1 em uma perícia', pb: 1, max: 15, alvo: 'pericia' },
	{ id: 'pv', nome: '+5 PV iniciais', pb: 1, max: 4 },
	{ id: 'pc', nome: '+5 PC iniciais', pb: 1, max: 4 },
	{ id: 'pt', nome: '+2 PT iniciais', pb: 1, max: 4 },
	{ id: 'afinidade', nome: 'Afinidade elemental adicional ou automática', pb: 2, max: 2, alvo: 'elemento' },
	{ id: 'resistencia', nome: 'Resistência leve a uma condição', nota: 'Vantagem ou −2 de dano contra veneno, frio etc.', pb: 1, max: 4, alvo: 'texto' },
	{ id: 'companheiro', nome: 'Companheiro animal hereditário', pb: 1, max: 1 }
] as const;
export type CompraPb = (typeof COMPRAS_PB)[number]['id'];

/** Orçamento: 3 PB; sem KKG, +1 PB ou +1 jutsu hereditário (cap. 8.4, Componente 2). */
export const PB = { base: 3, semKkg: 1 } as const;

/** Pontos de KKG: começa com 5 e ganha mais aceitando limitações. */
export const PKG_INICIAIS = 5;

export const TIPOS_KKG = [
	{ id: 'dojutsu', nome: 'Dōjutsu', descricao: 'Habilidade nos olhos: percepção, ilusão, controle', exemplos: 'Sharingan, Byakugan, Rinnegan' },
	{ id: 'corporal', nome: 'Corporal', descricao: 'Modificação física hereditária', exemplos: 'Shikotsumyaku, Suika' },
	{ id: 'mental', nome: 'Mental', descricao: 'Aprimoramento mental ou psíquico', exemplos: 'Yamanaka (técnicas treinadas)' },
	{ id: 'combinacao', nome: 'Combinação', descricao: 'Combina 2 elementos em 1 novo', exemplos: 'Madeira, Gelo, Lava, Tempestade' },
	{ id: 'hibrido', nome: 'Híbrido', descricao: 'Outras manifestações únicas', exemplos: 'Insetos Aburame, Ossos Kaguya' }
] as const;
export type TipoKkg = (typeof TIPOS_KKG)[number]['id'];

/** Benefícios (custam PKG). `detalhe`: pergunta que o jogador responde ao marcar. */
export const BENEFICIOS_KKG = [
	{ id: 'atributo', nome: 'Bônus em atributo (+1)', pkg: 1, nota: 'Limite de criação +1 também', detalhe: 'Qual atributo?' },
	{ id: 'pericia', nome: 'Bônus em perícia (+2)', pkg: 1, nota: 'Bônus passivo enquanto o KKG está ativo', detalhe: 'Qual perícia?' },
	{ id: 'sentido', nome: 'Sentido aprimorado', pkg: 1, nota: '+5 em perícia específica', detalhe: 'Qual sentido e perícia?' },
	{ id: 'resistencia', nome: 'Resistência a um tipo de dano', pkg: 2, nota: 'Reduz o dano em 50%', detalhe: 'Qual tipo de dano?' },
	{ id: 'imunidade', nome: 'Imunidade a uma condição', pkg: 2, nota: 'Imune a veneno, paralisia etc.', detalhe: 'Qual condição?' },
	{ id: 'jutsu-c', nome: 'Jutsu único do KKG (Rank C)', pkg: 2, nota: 'Jutsu exclusivo', detalhe: 'Nome do jutsu' },
	{ id: 'jutsu-b', nome: 'Jutsu único do KKG (Rank B)', pkg: 4, nota: 'Jutsu exclusivo', detalhe: 'Nome do jutsu' },
	{ id: 'jutsu-a', nome: 'Jutsu único do KKG (Rank A)', pkg: 8, nota: 'Jutsu exclusivo', detalhe: 'Nome do jutsu' },
	{ id: 'combinacao', nome: 'Combinação de 2 elementos', pkg: 5, nota: 'Cria um elemento Kekkei (Madeira, Gelo etc.)' },
	{ id: 'visao-chakra', nome: 'Visão de Chakra', pkg: 3, nota: 'Vê fluxos; +5 contra ilusões' },
	{ id: 'copia', nome: 'Capacidade de Cópia', pkg: 6, nota: 'Copia jutsus de Rank C ou menor' },
	{ id: 'fisico', nome: 'Aprimoramento físico geral', pkg: 4, nota: '+1 em FOR, AGI e VIG' },
	{ id: 'regeneracao', nome: 'Regeneração rápida', pkg: 4, nota: 'Recupera 1d6 PV por turno em combate' },
	{ id: 'manipulacao', nome: 'Manipulação corporal (ossos, fluidos)', pkg: 5, nota: 'Armas naturais 1d8', detalhe: 'Que tipo?' },
	{ id: 'despertar', nome: 'Forma de Despertar', pkg: 8, nota: 'Forma evoluída em momento de crise (estilo Mangekyou)' }
] as const;
export type BeneficioKkg = (typeof BENEFICIOS_KKG)[number]['id'];

/** Custos e limitações (devolvem PKG). */
export const LIMITACOES_KKG = [
	{ id: 'custo-5', nome: 'Custo para ativar (5 PC por cena)', pkg: 1, nota: 'Não fica ativo o tempo todo', exclui: 'custo-10' },
	{ id: 'custo-10', nome: 'Custo alto (10 PC por cena)', pkg: 2, nota: 'Reservado para momentos críticos', exclui: 'custo-5' },
	{ id: 'cega-temporaria', nome: 'Cega temporariamente após o uso', pkg: 2, nota: 'Como o uso prolongado do Sharingan' },
	{ id: 'cega-permanente', nome: 'Cega permanentemente após N usos', pkg: 4, nota: 'Como o Mangekyou: drama narrativo', detalhe: 'Quantos usos?' },
	{ id: 'vida', nome: 'Reduz a expectativa de vida', pkg: 3, nota: 'Cada uso longo encurta a vida' },
	{ id: 'trauma', nome: 'Despertar exige trauma', pkg: 1, nota: 'Não disponível desde a criação' },
	{ id: 'selo', nome: 'Selo familiar restritivo', pkg: 2, nota: 'Como o Selo dos Hyuuga' },
	{ id: 'loucura', nome: 'Risco de loucura ou personalidade alterada', pkg: 3, nota: 'Trauma genético, surtos sob estresse' },
	{ id: 'sobreuso', nome: 'Perde o controle se sobreusar', pkg: 2, nota: '1d6 de fadiga após uso prolongado' },
	{ id: 'vulneravel', nome: 'Vulnerável a 1 elemento', pkg: 2, nota: 'Recebe dano dobrado daquele elemento', detalhe: 'Qual elemento?' },
	{ id: 'cacada', nome: 'Linhagem caçada', pkg: 2, nota: 'PNJs perseguem ativamente' },
	{ id: 'selos-especiais', nome: 'Selos especiais necessários', pkg: 1, nota: 'Não pode ser usado sem foco' }
] as const;
export type LimitacaoKkg = (typeof LIMITACOES_KKG)[number]['id'];

/**
 * Componente 4 · Esqueleto Padrão dos marcos (níveis 1 a 20).
 * `fixo`: ganho automático; `opcoes`: o que o jogador escolhe no nível; `rank`: rank máximo do jutsu.
 */
export type OpcaoMarco = 'jutsu' | 'pt' | 'criar' | 'habilidade';
export const ESQUELETO: { nivel: number; texto: string; fixo?: string; opcoes?: OpcaoMarco[]; rank?: 'C' | 'B' | 'A' | 'S'; pic?: number }[] = [
	{ nivel: 1, texto: 'Jutsu assinatura (Rank D ou C); +1 PIC', pic: 1 },
	{ nivel: 2, texto: 'Jutsu (até Rank C)', opcoes: ['jutsu'], rank: 'C' },
	{ nivel: 3, texto: '+3 PT', fixo: '+3 PT' },
	{ nivel: 4, texto: 'Jutsu (até Rank C) ou +3 PT', opcoes: ['jutsu', 'pt'], rank: 'C' },
	{ nivel: 5, texto: '+1 no atributo do clã', fixo: 'atributo' },
	{ nivel: 6, texto: 'Jutsu (até Rank B)', opcoes: ['jutsu'], rank: 'B' },
	{ nivel: 7, texto: '+3 PT, Jutsu ou Criar Jutsu do Clã (até Rank C)', opcoes: ['pt', 'jutsu', 'criar'], rank: 'C' },
	{ nivel: 8, texto: 'Habilidade', opcoes: ['habilidade'] },
	{ nivel: 9, texto: '+1 no atributo do clã', fixo: 'atributo' },
	{ nivel: 10, texto: '+3 PIC; Jutsu ou Criar Jutsu do Clã (até Rank B)', opcoes: ['jutsu', 'criar'], rank: 'B', pic: 3 },
	{ nivel: 11, texto: 'Jutsu (até Rank A)', opcoes: ['jutsu'], rank: 'A' },
	{ nivel: 12, texto: '+1 na perícia do clã', fixo: 'pericia' },
	{ nivel: 13, texto: 'Habilidade', opcoes: ['habilidade'] },
	{ nivel: 14, texto: 'Jutsu (até Rank A)', opcoes: ['jutsu'], rank: 'A' },
	{ nivel: 15, texto: '+1 no atributo do clã; limite desse atributo +9', fixo: 'atributo-9' },
	{ nivel: 16, texto: '+3 PT', fixo: '+3 PT' },
	{ nivel: 17, texto: 'Jutsu ou Criar Jutsu do Clã (até Rank A)', opcoes: ['jutsu', 'criar'], rank: 'A' },
	{ nivel: 18, texto: '+1 no atributo do clã; limite desse atributo +10', fixo: 'atributo-10' },
	{ nivel: 19, texto: '+5 PIC', fixo: '+5 PIC', pic: 5 },
	{ nivel: 20, texto: 'Criar Jutsu do Clã Rank S', fixo: 'Criar Jutsu do Clã (Rank S)' }
];

export const NOME_OPCAO_MARCO: Record<OpcaoMarco, string> = { jutsu: 'Jutsu', pt: '+3 PT', criar: 'Criar Jutsu do Clã', habilidade: 'Habilidade' };

/** Ordem dos ranks para comparar "até Rank X". */
export const ORDEM_RANK = ['E', 'D', 'C', 'B', 'A', 'S'] as const;
export type RankJutsu = (typeof ORDEM_RANK)[number];
export const rankAte = (rank: string, max: string) => ORDEM_RANK.indexOf(rank as RankJutsu) <= ORDEM_RANK.indexOf(max as RankJutsu);

/** Componente 7 · recursos de patrimônio (seção 8.2). Escolha 2; nômade ou extinto, 1. */
export const PATRIMONIO = [
	{ id: 'dojo', nome: 'Dōjō de Treinamento', efeito: '+1 PT em sessões de treino solo realizadas ali', icone: 'esp/ic-esp-taijutsu' },
	{ id: 'biblioteca', nome: 'Biblioteca do Clã', efeito: 'Informações valiosas; aprender jutsus do clã antes do marco', icone: 'nav/ic-nav-referencia' },
	{ id: 'mestres', nome: 'Mestres internos (PNJs)', efeito: 'Treinar com mentor por custo menor', icone: 'papel/ic-papel-mestre' },
	{ id: 'arsenal', nome: 'Arsenal / Forja interna', efeito: 'Encomendar arma com 25% de desconto', icone: 'equip/ic-equip-ferramenta' },
	{ id: 'cura', nome: 'Câmara de Cura', efeito: 'Recupera-se de fadiga em metade do tempo', icone: 'item/ic-item-kit-medico' },
	{ id: 'selos', nome: 'Câmara de Selos / Altares', efeito: 'Pode realizar rituais hereditários', icone: 'esp/ic-esp-selamento' }
] as const;

/** Componente 8 · status do clã e PIC por arco. */
export const STATUS_CLA = [
	{ id: 'pequeno', nome: 'Pequeno / decadente', pic: 2, nota: 'Sobrevive, mas com pouca voz política' },
	{ id: 'estabelecido', nome: 'Estabelecido', pic: 3, nota: 'Reconhecido na vila, recursos modestos' },
	{ id: 'influente', nome: 'Influente', pic: 4, nota: 'Voz no conselho da vila' },
	{ id: 'nobre', nome: 'Principal / nobre', pic: 5, nota: 'Política central, recursos amplos' },
	{ id: 'extinto', nome: 'Extinto / errante', pic: 1, nota: 'Acesso limitado a um único contato' }
] as const;
export type StatusCla = (typeof STATUS_CLA)[number]['id'];

/** Componente 9 · obrigações do livro (obrigatório escolher pelo menos 1, ou escrever a sua). */
export const OBRIGACOES = [
	'Selo restritivo (controle por superior)',
	'Casamento arranjado / política familiar invasiva',
	'Tabu específico (não pode dizer X, não pode comer Y)',
	'Maldição genética (chance pequena de algo sair errado)',
	'Caçados por inimigos antigos',
	'Servidão a uma instituição da vila',
	'Dependência de algo (água, sol, lua, ritual diário)',
	'Rivalidade hereditária com outro clã'
] as const;

/** Passo 1 · cores do clã e bases de brasão (static/icons/kamon). */
export const CORES_CLA = ['#E8692E', '#C44536', '#2E6FD1', '#7FB069', '#8D6E3F', '#674EA7', '#D9A82B', '#5E6B73'] as const;
export const KAMONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const;
export const srcKamon = (k: string, tamanho = 32) => `/icons/kamon/ic-kamon-base-${k}-${tamanho}.png`;

/** Passos do criador de clã (K2). */
export const PASSOS_CLA = [
	'Conceito',
	'Bônus Hereditário',
	'Kekkei Genkai',
	'Jutsu assinatura',
	'Marcos por nível',
	'Companheiros',
	'Jutsus e habilidades',
	'Dōjō e patrimônio',
	'Política e conexões',
	'Obrigação',
	'Revisão'
] as const;

/** Âncora da regra de cada passo no capítulo 8. */
export const REGRA_PASSO_CLA = [
	'passo-1-conceito-do-cla',
	'componente-1-bonus-hereditario',
	'pontos-de-kekkei-genkai-pkg-apenas-se-aplicavel',
	'componente-3-jutsu-assinatura',
	'componente-4-marcos-por-nivel',
	'componente-5-companheiros-opcional',
	'componente-6-jutsus-hereditarios',
	'componente-7-dojo-patrimonio',
	'componente-8-politica-e-conexoes',
	'componente-9-obrigacao-de-cla',
	'criacao-de-cla-e-kekkei-genkai'
] as const;
