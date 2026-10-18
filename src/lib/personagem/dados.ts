// Tabelas do livro usadas na criação de personagem (cap. 3, 6, 7, 8, 10, 11, 17 e 19).
// Os textos dos clãs, jutsus e especializações vêm de src/lib/livro/gerado; aqui ficam só os números que o criador calcula.

export const ATRIBUTOS = [
	{ id: 'FOR', nome: 'Força', uso: 'Taijutsu, armas corpo a corpo, escalar, carga' },
	{ id: 'AGI', nome: 'Agilidade', uso: 'Defesa (Acrobacia), Iniciativa, armas à distância, Kugutsu, Furtividade' },
	{ id: 'VIG', nome: 'Vigor', uso: 'Pontos de Vida e de Estamina, resistir a venenos e fadiga' },
	{ id: 'INT', nome: 'Inteligência', uso: 'Investigação, Medicina, Rastreamento, Selamento' },
	{ id: 'CTR', nome: 'Controle', uso: 'Ninjutsu, Genjutsu, PC, DT dos jutsus' },
	{ id: 'ESP', nome: 'Espírito', uso: 'PC, Percepção e Defesa Mental, resistir a Genjutsu, Persuasão' }
] as const;
export type Atributo = (typeof ATRIBUTOS)[number]['id'];

/** Cap. 3 · Perícias. Bukijutsu usa FOR corpo a corpo e AGI à distância. */
export const PERICIAS = [
	{ id: 'acrobacia', nome: 'Acrobacia', atributo: 'AGI' },
	{ id: 'atletismo', nome: 'Atletismo', atributo: 'FOR' },
	{ id: 'bukijutsu', nome: 'Bukijutsu', atributo: 'FOR', distancia: 'AGI', combate: true },
	{ id: 'furtividade', nome: 'Furtividade', atributo: 'AGI' },
	{ id: 'genjutsu', nome: 'Genjutsu', atributo: 'CTR' },
	{ id: 'investigacao', nome: 'Investigação', atributo: 'INT' },
	{ id: 'kugutsu', nome: 'Kugutsu', atributo: 'AGI' },
	{ id: 'medicina', nome: 'Medicina', atributo: 'INT' },
	{ id: 'ninjutsu', nome: 'Ninjutsu', atributo: 'CTR', combate: true },
	{ id: 'percepcao', nome: 'Percepção', atributo: 'ESP' },
	{ id: 'persuasao', nome: 'Persuasão', atributo: 'ESP' },
	{ id: 'rastreamento', nome: 'Rastreamento', atributo: 'INT' },
	{ id: 'selamento', nome: 'Selamento', atributo: 'INT' },
	{ id: 'sobrevivencia', nome: 'Sobrevivência', atributo: 'VIG' },
	{ id: 'taijutsu', nome: 'Taijutsu', atributo: 'FOR', combate: true }
] as const satisfies readonly { id: string; nome: string; atributo: Atributo; distancia?: Atributo; combate?: boolean }[];
export type Pericia = (typeof PERICIAS)[number]['id'];
export const PERICIAS_COMBATE: Pericia[] = ['taijutsu', 'bukijutsu', 'ninjutsu'];
export const nomePericia = (id: string) => PERICIAS.find((p) => p.id === id)?.nome ?? id;

/** Cap. 6 · Passos 2, 5 e 6. */
export const CRIACAO = {
	pontosAtributo: 8,
	atributoMax: 4,
	atributoMin: -2,
	reducoesMax: 2,
	pontosPericia: 12,
	periciaTreinoMax: 3,
	/** Clã, vila e background podem passar o treino em até +2 (cap. 3). */
	periciaBonusMax: 5,
	ptIniciais: 4,
	proficienciasMax: 5,
	semCla: { pericia: 2, pt: 5 }
} as const;

/** Cap. 8.4: quem não tem clã ganha +2 perícia e +5 PT; cap. 6 Passo 8: recursos por soma. */
export const RECURSOS = { pvBase: 20, peBase: 20, pcBase: 30, porVig: 5, porChakra: 4, cargaBase: 10, cargaPorFor: 2 } as const;

export type Ganho = { atributo?: Atributo; pericias?: Pericia[]; escolhaPericia?: Pericia[] | 'qualquer'; pv?: number; pc?: number; pe?: number; pt?: number };

/** Cap. 7 · Vilas Ocultas. */
export const VILAS: { id: string; nome: string; elemento: string; foco: string; bonus: string; ganho: Ganho; traco?: string }[] = [
	{ id: 'konoha', nome: 'Konohagakure', elemento: 'País do Fogo', foco: 'Trabalho em equipe e versatilidade', bonus: '+1 Persuasão · +1 em uma perícia à escolha', ganho: { pericias: ['persuasao'], escolhaPericia: 'qualquer' } },
	{ id: 'suna', nome: 'Sunagakure', elemento: 'País do Vento', foco: 'Marionetes e venenos', bonus: '+1 Sobrevivência · vantagem contra veneno', ganho: { pericias: ['sobrevivencia'] }, traco: 'Vantagem em Resistências contra veneno' },
	{ id: 'kiri', nome: 'Kirigakure', elemento: 'País da Água', foco: 'Assassinato e Bukijutsu silencioso', bonus: '+1 Furtividade · +1 Bukijutsu', ganho: { pericias: ['furtividade', 'bukijutsu'] } },
	{ id: 'kumo', nome: 'Kumogakure', elemento: 'País do Raio', foco: 'Velocidade e Bukijutsu pesado', bonus: '+1 Atletismo · +5 PV', ganho: { pericias: ['atletismo'], pv: 5 } },
	{ id: 'iwa', nome: 'Iwagakure', elemento: 'País da Terra', foco: 'Defesa e jutsus de longo alcance', bonus: '+1 Ninjutsu · +5 PV', ganho: { pericias: ['ninjutsu'], pv: 5 } },
	{ id: 'ame', nome: 'Amegakure', elemento: '—', foco: 'Espionagem e jutsus de água', bonus: '+1 Investigação · +1 Furtividade', ganho: { pericias: ['investigacao', 'furtividade'] } },
	{ id: 'taki', nome: 'Takigakure', elemento: '—', foco: 'Emboscadas e infiltração', bonus: '+1 Percepção · +1 Rastreamento', ganho: { pericias: ['percepcao', 'rastreamento'] } },
	{ id: 'oto', nome: 'Otogakure', elemento: 'País do Arroz', foco: 'Pesquisa proibida e experimentação', bonus: '+1 Medicina · +1 Investigação', ganho: { pericias: ['medicina', 'investigacao'] } },
	{ id: 'sem', nome: 'Sem vila', elemento: 'Errante / Renegado', foco: 'Liberdade e adaptação', bonus: '+1 Sobrevivência · +1 em uma perícia à escolha', ganho: { pericias: ['sobrevivencia'], escolhaPericia: 'qualquer' } }
];

/** Cap. 8.3 · bônus de criação e marco do nível 1 de cada clã do catálogo. */
export const CLAS: Record<string, { ganho: Ganho; jutsus: string[]; marco: string; elemento?: string; segundoElemento?: boolean; extras?: string[] }> = {
	nara: { ganho: { atributo: 'INT', pericias: ['investigacao'], pc: 5 }, jutsus: ['kage-mane-no-jutsu'], marco: 'Kage Mane no Jutsu; +1 PIC' },
	akimichi: { ganho: { atributo: 'VIG', pv: 10 }, jutsus: ['baika-no-jutsu'], marco: 'Baika no Jutsu; +1 PIC' },
	yamanaka: { ganho: { atributo: 'ESP', pericias: ['percepcao'], pc: 5 }, jutsus: ['shintenshin-no-jutsu'], marco: 'Shintenshin no Jutsu; +1 PIC' },
	inuzuka: { ganho: { atributo: 'AGI', escolhaPericia: ['rastreamento', 'percepcao'] }, jutsus: ['shikyaku-no-jutsu'], marco: 'Shikyaku no Jutsu; cão ninja (Filhote); +1 PIC', extras: ['Cão ninja hereditário'] },
	aburame: { ganho: { atributo: 'INT', pericias: ['furtividade'] }, jutsus: ['kikaichu-no-jutsu'], marco: 'Kikaichū no Jutsu; +1 PIC', extras: ['Colônia de kikaichū hereditária'] },
	hyuuga: { ganho: { atributo: 'CTR', pericias: ['percepcao'] }, jutsus: ['juuken-tenketsushin'], marco: 'Juuken e Byakugan; +1 PIC', extras: ['Byakugan'] },
	uchiha: { ganho: { atributo: 'CTR', pericias: ['percepcao'] }, jutsus: ['katon-goukakyu-no-jutsu'], marco: 'Katon: Goukakyu no Jutsu; +1 PIC', elemento: 'katon' },
	senju: { ganho: { atributo: 'VIG', pc: 10 }, jutsus: [], marco: 'Segundo elemento de chakra, sem custo de PT; +1 PIC', segundoElemento: true },
	uzumaki: { ganho: { atributo: 'ESP', pericias: ['selamento'], pc: 5 }, jutsus: ['uzumaki-fuin-kaiso'], marco: 'Uzumaki Fūin: Kaisō; +1 PIC' },
	kaguya: { ganho: { atributo: 'FOR', pv: 5 }, jutsus: ['teshi-sendan'], marco: 'Teshi Sendan; +1 PIC', extras: ['Shikotsumyaku'] },
	hozuki: { ganho: { atributo: 'AGI', pericias: ['sobrevivencia'] }, jutsus: ['suika-no-jutsu'], marco: 'Suika no Jutsu; +1 PIC' },
	sabaku: { ganho: { atributo: 'CTR', pc: 5 }, jutsus: ['suna-no-tate'], marco: 'Suna no Tate; +1 PIC', extras: ['Areia Magnética'] },
	yuki: { ganho: { atributo: 'CTR' }, jutsus: ['sensatsu-suisho'], marco: 'Sensatsu Suishō; +1 PIC', extras: ['Resistência a frio: -2 dano de gelo/frio'] }
};

/** Cap. 6 · Passo 11. */
export const BACKGROUNDS: { id: string; nome: string; bonus: string; traco: string; ganho: Ganho }[] = [
	{ id: 'prodigio', nome: 'Prodígio', bonus: '+1 em uma perícia à escolha', traco: 'Recebeu elogios precoces; luta com expectativas pesadas.', ganho: { escolhaPericia: 'qualquer' } },
	{ id: 'perdedor', nome: 'Perdedor (Underdog)', bonus: '+2 PT extras na criação', traco: 'Foi o último da turma; surpreende sob pressão.', ganho: { pt: 2 } },
	{ id: 'determinado', nome: 'Determinado', bonus: '+1 em Resistências de VIG e em Saves de Morte', traco: 'Não desiste, mesmo quando deveria.', ganho: {} },
	{ id: 'misterioso', nome: 'Misterioso', bonus: '+1 em Furtividade', traco: 'Pouco se sabe sobre seu passado.', ganho: { pericias: ['furtividade'] } },
	{ id: 'herdeiro', nome: 'Herdeiro', bonus: '+1 PIC por arco', traco: 'Sobrenome importante; responsabilidades familiares.', ganho: {} },
	{ id: 'orfao', nome: 'Órfão da Guerra', bonus: '+1 em Taijutsu, Bukijutsu ou Ninjutsu', traco: 'Perdeu a família em conflito; maduro para a idade.', ganho: { escolhaPericia: ['taijutsu', 'bukijutsu', 'ninjutsu'] } },
	{ id: 'veterano', nome: 'Veterano de Missão Trágica', bonus: '+1 em Percepção', traco: 'Sobreviveu a uma missão em que aliados morreram.', ganho: { pericias: ['percepcao'] } },
	{ id: 'estudioso', nome: 'Estudioso', bonus: '+1 em Investigação', traco: 'Devorou pergaminhos antigos e técnicas raras.', ganho: { pericias: ['investigacao'] } },
	{ id: 'carismatico', nome: 'Carismático', bonus: '+1 em Persuasão', traco: 'Líder informal; facilidade com palavras.', ganho: { pericias: ['persuasao'] } },
	{ id: 'renegado', nome: 'Renegado em Reabilitação', bonus: '+1 em perícia de combate e +1 Furtividade; -1 PIC por arco', traco: 'Já foi renegado; carrega o estigma.', ganho: { pericias: ['furtividade'], escolhaPericia: ['taijutsu', 'bukijutsu', 'ninjutsu'] } },
	{ id: 'fronteira', nome: 'Filho da Fronteira', bonus: '+1 em Sobrevivência', traco: 'Cresceu em vilarejo distante; rede de favores.', ganho: { pericias: ['sobrevivencia'] } },
	{ id: 'atleta', nome: 'Atleta Marcial', bonus: '+1 em Atletismo', traco: 'Competidor nato; aceita desafios quase sempre.', ganho: { pericias: ['atletismo'] } },
	{ id: 'tardio', nome: 'Aprendiz Tardio', bonus: '+1 em Investigação ou Medicina', traco: 'Entrou mais velho na Academia; maduro, subestimado.', ganho: { escolhaPericia: ['investigacao', 'medicina'] } },
	{ id: 'medico', nome: 'Médico de Vilarejo', bonus: '+1 em Medicina', traco: 'Cura gente desde criança; evita matar.', ganho: { pericias: ['medicina'] } }
];

/** Cap. 19 · efeitos numéricos do nível 1 que entram nos recursos. */
export const ESPECIALIZACOES: Record<string, { slug: string; recursos?: { pv?: number; pc?: number; pe?: number; iniciativa?: number }; bloqueio?: string; pacoteMarionete?: boolean }> = {
	'controle-chakra': { slug: 'especializacao-controle-de-chakra' },
	reservatorio: { slug: 'especializacao-reservatorio-de-chakra', recursos: { pc: 10 } },
	elemento: { slug: 'especializacao-elemento-especifico-katon-suiton-etc' },
	velocidade: { slug: 'especializacao-velocidade', recursos: { iniciativa: 2 } },
	resistencia: { slug: 'especializacao-resistencia-fisica', recursos: { pv: 10 } },
	genjutsu: { slug: 'especializacao-genjutsu' },
	ninjutsu: { slug: 'especializacao-ninjutsu' },
	bukijutsu: { slug: 'especializacao-bukijutsu' },
	selamento: { slug: 'especializacao-selamento-fuuinjutsu' },
	furtividade: { slug: 'especializacao-furtividade-e-assassinato' },
	taijutsu: { slug: 'especializacao-taijutsu', recursos: { pe: 10 } },
	marionete: { slug: 'especializacao-marionete-kugutsu', pacoteMarionete: true },
	invocacao: { slug: 'especializacao-invocacao-kuchiyose' },
	sensor: { slug: 'especializacao-sensor-de-chakra' },
	medico: { slug: 'especializacao-ninjutsu-medico' },
	sennin: { slug: 'especializacao-sennin-pre-requisitos-no-cap-15', bloqueio: 'Pré-requisitos do Modo Sennin (cap. 15); não está disponível na criação' }
};

export const ELEMENTOS = [
	{ id: 'katon', nome: 'Katon', cor: '#E8692E' },
	{ id: 'suiton', nome: 'Suiton', cor: '#2E6FD1' },
	{ id: 'doton', nome: 'Doton', cor: '#8D6E3F' },
	{ id: 'raiton', nome: 'Raiton', cor: '#F2C14E' },
	{ id: 'fuuton', nome: 'Fuuton', cor: '#7FB069' }
] as const;

/** Cap. 6 · Passo 9. */
export const JUTSUS_ACADEMIA = ['henge-no-jutsu', 'bunshin-no-jutsu', 'kawarimi-no-jutsu'];
export const JUTSUS_INICIAIS = { E: 2, D: 1 } as const;

/** Cap. 3 · custo total em PT por nível; categorias de arma custam +1 PT por nível. */
export const NIVEIS_PROFICIENCIA = [
	{ id: 1, nome: 'Familiar', bonus: 1, pt: 1 },
	{ id: 2, nome: 'Treinado', bonus: 2, pt: 3 },
	{ id: 3, nome: 'Experiente', bonus: 3, pt: 6 },
	{ id: 4, nome: 'Mestre', bonus: 4, pt: 10 },
	{ id: 5, nome: 'Lendário', bonus: 5, pt: 15 }
] as const;
export const TIPOS_PROFICIENCIA = [
	{ id: 'arma', nome: 'Arma específica', beneficio: '+1 dano com aquela arma' },
	{ id: 'categoria', nome: 'Categoria de arma', beneficio: 'Troca entre armas da categoria sem ação secundária' },
	{ id: 'jutsu', nome: 'Jutsu específico', beneficio: 'Custo do jutsu reduz em 1 PC' },
	{ id: 'ambiente', nome: 'Ambiente', beneficio: 'Treinado ignora penalidades ambientais; Mestre +1 em testes ambientais' },
	{ id: 'equipamento', nome: 'Equipamento e itens utilitários', beneficio: 'Usar o item em combate custa ação secundária' }
] as const;
export type TipoProficiencia = (typeof TIPOS_PROFICIENCIA)[number]['id'];
export const CATEGORIAS_ARMA = ['Armas de distância', 'Armas brancas curtas', 'Armas brancas longas', 'Armas brancas exóticas', 'Marionetes Ninja'];
export const AMBIENTES = ['Combate Aquático', 'Combate Aéreo', 'Floresta densa', 'Subterrâneo'];
export const EQUIPAMENTOS_PROFICIENCIA = ['Kit de Selamento', 'Kit de marionetista', 'Pergaminhos', 'Kit médico'];

export function custoProficiencia(tipo: TipoProficiencia, nivel: number): number {
	const base = NIVEIS_PROFICIENCIA.find((n) => n.id === nivel)?.pt ?? 0;
	return tipo === 'categoria' ? base + nivel : base;
}

/** Cap. 6 · Passo 10. */
export const PACOTES = {
	A: { nome: 'Pacote A', ryo: 1000, itens: ['Hitaiate', '10 shuriken', '10 kunai', '3 papéis explosivos', 'Kit médico (5 usos)', 'Roupas ninja em cores da vila'], carga: 2 },
	B: { nome: 'Pacote B', ryo: 14000, itens: ['Hitaiate', 'Roupas ninja básicas'], carga: 0 },
	marionetista: { nome: 'Marionetista', ryo: 0, itens: ['Hitaiate', 'Roupas ninja', 'Kit de marionetista', '1 marionete Pequena com 1 mecanismo (até 5.000 ryo)'], carga: 2 }
} as const;
export type Pacote = keyof typeof PACOTES;

/** Cap. 11 · peso por categoria em unidades de carga. */
export const PESOS: Record<string, number> = { insignificante: 0, 'insig.': 0, insig: 0, leve: 0.5, 'leve.': 0.5, medio: 1, médio: 1, pesado: 2, 'muito pesado': 3, extremo: 4 };
