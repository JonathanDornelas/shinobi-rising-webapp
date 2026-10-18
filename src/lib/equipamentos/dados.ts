// Tabelas da Forja Ninja (cap. 21), da qualidade das armas (cap. 12), das marionetes (cap. 13) e dos itens (cap. 11).

/** Qualidade: PFo e custo da forja (cap. 21, Passo 3) e modificadores (cap. 12). "Comum" é a arma de mercado. */
export const QUALIDADES = [
	{ id: 'comum', nome: 'Comum', pfo: 0, ryo: 0, tempo: '—', dano: 0, acerto: 0, efeito: 'Sem modificador' },
	{ id: 'boa', nome: 'Boa', pfo: 1, ryo: 10000, tempo: '1 semana', dano: 1, acerto: 0, efeito: '+1 dano' },
	{ id: 'excelente', nome: 'Excelente', pfo: 3, ryo: 25000, tempo: '1 mês', dano: 1, acerto: 1, efeito: '+1 dano, +1 acerto' },
	{ id: 'mestre', nome: 'Mestre', pfo: 6, ryo: 50000, tempo: '3 meses', dano: 2, acerto: 1, efeito: '+2 dano, +1 acerto' },
	{ id: 'lendaria', nome: 'Lendária', pfo: 10, ryo: 150000, tempo: '6 meses', dano: 2, acerto: 2, efeito: '+2 dano, +2 acerto, nome próprio' }
] as const;
export type Qualidade = (typeof QUALIDADES)[number]['id'];

/** Propriedades compradas com PFo (cap. 21, Passo 4). `detalhe`: o que o jogador define. */
export const PROPRIEDADES_FORJA = [
	{ id: 'Afiada', pfo: 1, efeito: 'Ignora 1 ponto de RD do alvo' },
	{ id: 'Perfurante', pfo: 2, efeito: 'Ignora 3 pontos de RD do alvo' },
	{ id: 'Rajada', pfo: 4, efeito: 'Arremessa mais de uma arma de uma vez; −1 no ataque por arma extra' },
	{ id: 'Atordoante', pfo: 2, efeito: '−2 no ataque; em acerto, Resistência de VIG (DT 10 + FOR) ou Atordoado' },
	{ id: 'Defensiva', pfo: 2, efeito: '+1 de Defesa enquanto empunhada' },
	{ id: 'Leve', pfo: 1, efeito: '+1 Iniciativa enquanto empunhada' },
	{ id: 'Marcial', pfo: 1, efeito: 'Pode usar Taijutsu na rolagem de ataque' },
	{ id: 'Discreta', pfo: 2, efeito: '+1 em ataques furtivos e para esconder a arma' },
	{ id: 'Varredura', pfo: 3, efeito: 'Ataca 2 inimigos adjacentes; −2 contra o segundo' },
	{ id: 'Desarmante', pfo: 3, efeito: 'Em acerto, Resistência de FOR (DT 13 + proficiência) ou desarmado' },
	{ id: 'Elemental', pfo: 5, efeito: 'Gastando 1 PC por ataque, +1d6 de dano do elemento escolhido', detalhe: 'Elemento' },
	{ id: 'Vampírica', pfo: 5, efeito: 'Uma vez por turno, ao causar dano, recupera 2 PV' },
	{ id: 'Indestrutível', pfo: 5, efeito: 'Imune a quebra, mesmo contra jutsus extremos' },
	{ id: 'Selada', pfo: 3, efeito: 'Armazena 1 jutsu do dono (Rank C ou inferior), 1× por descanso longo', detalhe: 'Jutsu armazenado' },
	{ id: 'Alma Vinculada', pfo: 3, efeito: 'Só funciona plenamente com o portador (outros sofrem −3)', detalhe: 'Portador' },
	{ id: 'Versátil', pfo: 2, efeito: 'Pode ser usada corpo a corpo ou arremessada' }
] as const;

export const FORJADORES = [
	{ id: 'comum', nome: 'Forjador Comum', limite: 3 },
	{ id: 'mestre', nome: 'Mestre Ferreiro', limite: 6 },
	{ id: 'lendario', nome: 'Forjador Lendário', limite: 10 }
] as const;
export type Forjador = (typeof FORJADORES)[number]['id'];

export const PASSOS_FORJA = ['Conceito', 'Categoria base', 'Qualidade', 'Propriedades', 'Forjador', 'Histórico'] as const;

/** Marionetes (cap. 13): estrutura base e slots. */
export const TAMANHOS = [
	{ id: 'pequena', nome: 'Pequena', nota: 'Boneca, animal', pv: 30, defesa: 16, ataque: '1d6+2', ryo: 10000, tempo: '2 semanas', slots: 3 },
	{ id: 'humanoide', nome: 'Humanoide', nota: 'Padrão', pv: 60, defesa: 15, ataque: '1d8+3', ryo: 30000, tempo: '1 mês', slots: 6 },
	{ id: 'grande', nome: 'Grande', nota: 'Tamanho de cavalo', pv: 100, defesa: 14, ataque: '2d8+4', ryo: 80000, tempo: '3 meses', slots: 10 },
	{ id: 'colossal', nome: 'Colossal', nota: 'Estilo Sandaime Kazekage', pv: 180, defesa: 13, ataque: '3d10+5', ryo: 200000, tempo: '6 meses ou mais', slots: 15 }
] as const;
export type Tamanho = (typeof TAMANHOS)[number]['id'];

export const MECANISMOS = [
	{ id: 'laminas', nome: 'Lâminas Ocultas (braços)', slots: 1, ryo: 5000, efeito: '+2 dano em ataques corpo a corpo', dano: 2 },
	{ id: 'senbon', nome: 'Senbon Disparados (peito)', slots: 1, ryo: 3000, efeito: 'Dispara 5 senbon (1d3 + veneno) em alvos diferentes' },
	{ id: 'chamas', nome: 'Lança-Chamas Embutido', slots: 2, ryo: 15000, efeito: 'Cone de fogo: 2d6 de dano (3 usos por cena)' },
	{ id: 'veneno', nome: 'Compartimento de Veneno', slots: 1, ryo: 2000, efeito: 'Aplica veneno em ataques (cena toda); 5 doses, custo do veneno à parte' },
	{ id: 'fumaca', nome: 'Bombas de Fumaça', slots: 1, ryo: 2000, efeito: '3 bombas internas, liberadas ao comando' },
	{ id: 'explosivos', nome: 'Pergaminhos Explosivos', slots: 1, ryo: 3000, efeito: '5 explosivos disparáveis (1d8 cada em área)' },
	{ id: 'membros', nome: 'Membros Substituíveis', slots: 2, ryo: 10000, efeito: 'Braços e pernas se desprendem e atacam à distância' },
	{ id: 'cauda', nome: 'Cauda de Ferrão', slots: 2, ryo: 12000, efeito: 'Ataque adicional 1d10 + veneno, alcance 4m' },
	{ id: 'voo', nome: 'Mecanismo Voador', slots: 3, ryo: 30000, efeito: 'A marionete pode voar' },
	{ id: 'nucleo', nome: 'Núcleo de Chakra', slots: 2, ryo: 20000, efeito: 'Usa 1 jutsu pré-armazenado (Rank C ou menor)' },
	{ id: 'dentro', nome: 'Marionete-Dentro-de-Marionete', slots: 3, ryo: 25000, efeito: 'Uma marionete menor sai como segundo aliado' },
	{ id: 'armadura', nome: 'Armadura Reforçada', slots: 2, ryo: 15000, efeito: '+30 PV e +2 Defesa', pv: 30, defesa: 2 },
	{ id: 'lancas', nome: 'Lança Múltipla (estilo Sasori)', slots: 2, ryo: 18000, efeito: '3 ataques por turno (1d6+2 cada)' },
	{ id: 'bracos', nome: 'Membros Articulados Extras', slots: 1, ryo: 8000, efeito: '+2 braços (mais ataques ou manipulações)' }
] as const;

export const MODOS = [
	{ id: 'maos', nome: 'Fios pelas mãos', efeito: 'Clássico: controle preciso, mas o mestre fica visível' },
	{ id: 'boca', nome: 'Fios pela boca', efeito: 'Libera as mãos para outros jutsus; −1 dano com a marionete', dano: -1 },
	{ id: 'nucleo', nome: 'Núcleo de chakra próprio', efeito: 'Controle por ressonância: a marionete age a até 50m' }
] as const;
export type Modo = (typeof MODOS)[number]['id'];

/** Itens utilitários (cap. 11): categorias e peso. */
export const CATEGORIAS_ITEM = ['Pílula', 'Veneno', 'Ferramenta', 'Kit', 'Pergaminho', 'Outro'] as const;
export type CategoriaItem = (typeof CATEGORIAS_ITEM)[number];
export const PESOS_ITEM = [
	{ id: 'insignificante', nome: 'Insignificante', carga: 0 },
	{ id: 'leve', nome: 'Leve', carga: 0.5 },
	{ id: 'medio', nome: 'Médio', carga: 1 },
	{ id: 'pesado', nome: 'Pesado', carga: 2 },
	{ id: 'muito-pesado', nome: 'Muito pesado', carga: 3 },
	{ id: 'extremo', nome: 'Extremo', carga: 4 }
] as const;
export type PesoItem = (typeof PESOS_ITEM)[number]['id'];
export const ICONES_ITEM = [
	'item/ic-item-bomba-fumaca',
	'item/ic-item-pilula-cura',
	'item/ic-item-pilula-militar',
	'item/ic-item-antidoto',
	'item/ic-item-fio-ninja',
	'item/ic-item-pergaminho-basico',
	'item/ic-item-pergaminho-jutsu',
	'item/ic-item-papel-explosivo',
	'item/ic-item-kit-medico',
	'equip/ic-equip-ferramenta',
	'equip/ic-equip-veneno',
	'equip/ic-equip-kit'
] as const;
/** Chave de aprovação da campanha (C2/C7) por tipo de criação. */
export const APROVACAO_DO_TIPO = { arma: 'armas', item: 'itens', marionete: 'marionetes' } as const;
