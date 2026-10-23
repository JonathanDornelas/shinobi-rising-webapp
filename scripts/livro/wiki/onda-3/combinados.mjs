// Onda 3 · Elementos combinados (Kekkei Genkai): Futton (Vapor), Shakuton (Calor), Bakuton (Explosão), Ranton
// (Tempestade), Jinton (Poeira, Kekkei Tōta), mais Yōton (Lava) e Jiton (Magnetismo). Como os jutsus de Madeira e Gelo
// dos clãs, as cartas não somam o modificador de dois elementos do cap. 20: o elemento já foi pago em PKG (cap. 8).
import { CAP10 } from '../base.mjs';

const base = (origem, elemento) => ({ origem, tipo: 'Ninjutsu', elemento, ...CAP10.combinados });
const futton = base('Futton', 'futton');
const shakuton = base('Shakuton', 'shakuton');
const bakuton = base('Bakuton', 'bakuton');
const ranton = base('Ranton', 'ranton');
const jinton = base('Jinton', 'jinton');
const yoton = base('Yōton', 'yoton');
const jiton = base('Jiton', 'jiton');
const kkg = (nome, junta) => `Exige a Kekkei Genkai do ${nome} (${junta}), criada com as regras do cap. 8.4.`;
const VAPOR = kkg('Futton', 'Fogo e Água');
const CALOR = kkg('Shakuton', 'Fogo e Vento');
const EXPLOSAO = kkg('Bakuton', 'Terra e Raio');
const TEMPESTADE = kkg('Ranton', 'Água e Raio');
const POEIRA = 'Exige a Kekkei Tōta do Jinton (Terra, Vento e Fogo), criada com as regras do cap. 8.4 e a aprovação do Mestre.';
const LAVA = kkg('Yōton', 'Fogo e Terra');
const MAGNETISMO = kkg('Jiton', 'Vento e Terra');

export default [
	// ---------------------------------------------------------------- Futton (Vapor)
	{
		...futton,
		wiki: 'Boil Release: Skilled Mist Technique',
		nome: 'Futton: Kōmu no Jutsu',
		traducao: 'Técnica da Névoa Habilidosa',
		dano: [3, 6],
		alcance: 'curto',
		area: 'esfera6',
		comp: { continuo: 1, ignora: 1 },
		descricao: 'Uma névoa quente sai da boca do ninja e se espalha devagar. Ela é ácida: derrete pele, metal e até barreiras de chakra, e o usuário escolhe o quanto ela corrói.',
		efeito: '3d6 de dano de ácido em todos na área (metade com sucesso na Resistência), que ignora RD e barreiras. Quem falha continua sendo corroído, com o dano contínuo.',
		notas: [VAPOR]
	},
	{
		...futton,
		wiki: 'Boil Release: Unrivalled Strength',
		nome: 'Futton: Kairiki Musō',
		traducao: 'Força sem Igual',
		alcance: 'pessoal',
		comp: { buff2: 1, 'buff-cena': 1, rd2: 1, sustentado: 1 },
		descricao: 'O ninja leva o próprio chakra ao ponto de fervura. O vapor sai pela pele em jatos, e cada golpe vem empurrado por ele.',
		efeito: 'Enquanto mantém a técnica, o usuário ganha +2 de FOR e RD 2, e quem o agarra ou o toca se queima no vapor.',
		notas: [VAPOR]
	},
	{
		...futton,
		tipo: 'Taijutsu',
		wiki: 'Erupting Propulsion Fist',
		nome: 'Funsuiken',
		traducao: 'Punho da Propulsão em Erupção',
		dano: [3, 8],
		alcance: 'toque',
		comp: { empurra: 1, exige: 1 },
		descricao: 'Um jato de vapor sai do cotovelo no instante do soco e o empurra como um canhão. O alvo voa longe.',
		efeito: '3d8 de dano no alvo, que é empurrado para longe e cai se falhar na Resistência de FOR.',
		notas: ['Exige o Futton: Kairiki Musō ativo.']
	},
	{
		...futton,
		tipo: 'Taijutsu',
		wiki: 'Erupting Strong Foot',
		nome: 'Fungōkyaku',
		traducao: 'Pé Forte em Erupção',
		dano: [4, 6],
		alcance: 'toque',
		comp: { atordoa: 1, exige: 1 },
		descricao: 'O vapor explode do calcanhar, e o chute desce com o peso de uma marreta.',
		efeito: '4d6 de dano no alvo, que fica Atordoado por 1 turno se falhar na Resistência de VIG.',
		notas: ['Exige o Futton: Kairiki Musō ativo.']
	},
	// ---------------------------------------------------------------- Shakuton (Calor)
	{
		...shakuton,
		wiki: 'Scorch Release: Extremely Steaming Murder',
		nome: 'Shakuton: Kajōsatsu',
		traducao: 'Morte por Vapor Extremo',
		dano: [3, 8],
		alcance: 'medio',
		comp: { persegue: 1 },
		descricao: 'Pequenas esferas de fogo, como sóis em miniatura, giram em volta do ninja e voam atrás do alvo. Quando tocam alguém, evaporam a água de dentro do corpo dele.',
		efeito: '3d8 de dano de fogo no alvo, que as esferas perseguem até acertar (acerto automático).',
		notas: [CALOR]
	},
	{
		...shakuton,
		wiki: 'Scorch Release: Great Steaming Explosive Blast',
		nome: 'Shakuton: Daijōhappa',
		traducao: 'Grande Explosão de Vapor',
		dano: [6, 8],
		alcance: 'medio',
		area: 'esfera6',
		descricao: 'As esferas de calor se juntam numa só, enorme, que explode e seca tudo em volta. Do chão, sobe vapor por muito tempo depois.',
		efeito: '6d8 de dano de fogo em todos na área (metade com sucesso na Resistência).',
		notas: [CALOR]
	},
	// ---------------------------------------------------------------- Bakuton (Explosão)
	{
		...bakuton,
		wiki: 'Explosion Release: Landmine Fist',
		nome: 'Bakuton: Jiraiken',
		traducao: 'Punho Mina Terrestre',
		dano: [4, 8],
		alcance: 'toque',
		comp: { ignora: 1 },
		descricao: 'Um soco comum, até a explosão. O chakra entra pelo ponto do golpe e detona dentro do corpo do alvo.',
		efeito: '4d8 de dano de explosão no alvo tocado, que ignora RD: a explosão nasce por dentro.',
		notas: [EXPLOSAO]
	},
	{
		...bakuton,
		wiki: 'Explosion Release: Impact',
		nome: 'Bakuton: Shōgeki',
		traducao: 'Impacto Explosivo',
		dano: [2, 6],
		alcance: 'pessoal',
		area: 'esfera3',
		comp: { empurra: 1 },
		descricao: 'O ninja soca o chão, e a explosão revira a terra em volta, derrubando quem estiver perto.',
		efeito: '2d6 de dano em todos na área (metade com sucesso na Resistência), e quem falha na Resistência de FOR cai.',
		notas: [EXPLOSAO]
	},
	{
		...bakuton,
		wiki: 'Explosion Release: Defence Technique',
		nome: 'Bakuton: Bōgyojutsu',
		traducao: 'Técnica de Defesa Explosiva',
		alcance: 'pessoal',
		acao: 'reacao',
		comp: { barreira: 2 },
		descricao: 'Uma explosão pequena na palma, no momento exato, devolve a kunai a quem a jogou ou corta a amarra que prendia um aliado.',
		efeito: 'Como reação a um ataque, o usuário ganha uma barreira de 20 PV contra ele. Se o ataque era uma arma arremessada, ela volta para quem a lançou.',
		notas: [EXPLOSAO]
	},
	{
		...bakuton,
		wiki: 'Explosive Clay',
		nome: 'Kibaku Nendo',
		traducao: 'Argila Explosiva',
		dano: [3, 6],
		alcance: 'longo',
		area: 'esfera3',
		comp: { persegue: 1, consumivel: -1 },
		descricao: 'O ninja mistura chakra de explosão à argila e a molda em pássaros, aranhas ou cobras, que vão sozinhos até o alvo e detonam ao chegar.',
		efeito: '3d6 de dano de explosão em todos na área em volta do alvo (metade com sucesso na Resistência). As figuras perseguem o alvo até chegar (acerto automático no centro).',
		notas: [EXPLOSAO, 'Gasta um punhado de argila moldada com chakra.']
	},
	{
		...bakuton,
		wiki: 'Explosive Landmines',
		nome: 'Kibaku Jirai',
		traducao: 'Minas Explosivas',
		dano: [5, 6],
		alcance: 'curto',
		area: 'esfera3',
		comp: { preparo: -2, consumivel: -1 },
		descricao: 'Minas de argila ficam enterradas no caminho, sem sinal nenhum na terra. Explodem sozinhas quando alguém pisa nelas.',
		efeito: '5d6 de dano de explosão em todos na área (metade com sucesso na Resistência) quando alguém pisa numa mina.',
		notas: [EXPLOSAO, 'Enterrar as minas leva alguns minutos antes da luta. Gasta um punhado de argila moldada com chakra.']
	},
	// ---------------------------------------------------------------- Ranton (Tempestade)
	{
		...ranton,
		wiki: 'Storm Release: Black Hunting',
		nome: 'Ranton: Burakku Hantingu',
		traducao: 'Caçada Negra',
		dano: [4, 8],
		alcance: 'medio',
		alvosExtras: 2,
		comp: { persegue: 1 },
		descricao: 'Panteras de raio negro saem em matilha, guiadas como os feixes da tempestade, cortam quem encontram e se juntam numa só no último golpe.',
		efeito: '4d8 de dano elétrico em até 3 alvos, com uma rolagem por alvo. As panteras perseguem os alvos (acerto automático).',
		notas: [TEMPESTADE]
	},
	{
		...ranton,
		wiki: 'Storm Release: Azure Eagle Blade',
		nome: 'Ranton: Seishūjin',
		traducao: 'Lâmina da Águia Azul',
		dano: [3, 10],
		alcance: 'curto',
		comp: { arma: 1, duravel: 1 },
		descricao: 'Feixes de tempestade acertam o alvo primeiro; depois o ninja salta e desce a espada carregada de eletricidade.',
		efeito: '3d10 de dano elétrico no alvo, somado ao dano da espada.',
		notas: [TEMPESTADE, 'Exige uma espada em mãos.']
	},
	{
		...ranton,
		wiki: 'Storm Release: Thunder Cloud Inner Wave',
		nome: 'Ranton: Raiunkūha',
		traducao: 'Onda Interior da Nuvem de Trovão',
		dano: [3, 6],
		alcance: 'pessoal',
		area: 'esfera3',
		comp: { barreira: 2, sustentado: 1 },
		descricao: 'Um anel grosso de nuvens de trovão gira em volta do ninja. Ele protege, dispara raios e não deixa ninguém chegar perto.',
		efeito: 'Enquanto mantém a técnica, o usuário tem uma barreira de 20 PV, e quem entra na área ou começa o turno nela sofre 3d6 de dano elétrico (metade com sucesso na Resistência).',
		notas: [TEMPESTADE]
	},
	// ---------------------------------------------------------------- Jinton (Poeira, Kekkei Tōta)
	{
		...jinton,
		wiki: 'Dust Release: Detachment of the Primitive World Technique',
		nome: 'Jinton: Genkai Hakuri no Jutsu',
		traducao: 'Técnica do Descolamento do Mundo Primitivo',
		dano: [8, 10],
		alcance: 'longo',
		area: 'esfera6',
		comp: { ignora: 1 },
		descricao: 'Entre as palmas do ninja surge um cubo de luz branca com uma esfera no centro. Lançado, ele cresce de repente, e tudo o que fica dentro dele vira pó.',
		efeito: '8d10 de dano em todos na área (metade com sucesso na Resistência), que ignora RD e barreiras.',
		notas: [POEIRA]
	},
	{
		...jinton,
		wiki: 'Dust Release: Split Detachment of the Primitive World Technique',
		nome: 'Jinton: Bunretsu Genkai Hakuri no Jutsu',
		traducao: 'Técnica do Descolamento Dividido do Mundo Primitivo',
		dano: [5, 10],
		alcance: 'medio',
		area: 'esfera3',
		comp: { ignora: 1, exige: 1 },
		descricao: 'O ninja se divide em dois, joga o alvo para o alto e as duas metades disparam a Poeira ao mesmo tempo, uma de cada lado.',
		efeito: '5d10 de dano em todos na área (metade com sucesso na Resistência), que ignora RD e barreiras.',
		notas: [POEIRA, 'Exige o Bunretsu no Jutsu ativo.']
	},
	// ---------------------------------------------------------------- Yōton (Lava), além da onda 2
	{
		...yoton,
		wiki: 'Lava Release: Scorching Stream Rock Technique',
		nome: 'Yōton: Shakugaryūgan no Jutsu',
		traducao: 'Técnica da Rocha da Corrente Escaldante',
		dano: [3, 8],
		alcance: 'medio',
		alvosExtras: 2,
		descricao: 'Uma golfada de lava sai da boca do ninja e endurece no ar em várias rochas ainda em brasa, que voam em leque e derretem o que acertam.',
		efeito: '3d8 de dano de fogo em até 3 alvos, com uma rolagem por alvo.',
		notas: [LAVA]
	},
	{
		...yoton,
		wiki: 'Lava Release Chakra Mode',
		nome: 'Yōton Chakura Mōdo',
		traducao: 'Modo de Chakra da Lava',
		alcance: 'pessoal',
		comp: { buff2: 1, 'buff-cena': 1, rd2: 1, sustentado: 1 },
		descricao: 'Uma camada de lava cobre o corpo inteiro do ninja. Cada golpe queima, e quem chega perto demais sente a pele arder sem nem ser tocado.',
		efeito: 'Enquanto mantém a técnica, o usuário ganha +2 de FOR e RD 2, e os golpes corpo a corpo dele queimam.',
		notas: [LAVA]
	},
	{
		...yoton,
		tipo: 'Taijutsu',
		wiki: 'Lava Release: Scorching Armoured Fist',
		nome: 'Yōton: Shakugaikōken',
		traducao: 'Punho Blindado Escaldante',
		dano: [4, 8],
		alcance: 'toque',
		comp: { continuo: 1, exige: 1 },
		descricao: 'O punho coberto de lava acerta, e mesmo quando erra, o calor queima quem estava perto.',
		efeito: '4d8 de dano de fogo no alvo, que continua queimando, com o dano contínuo, se falhar na Resistência de VIG.',
		notas: ['Exige o Yōton Chakura Mōdo ativo.']
	},
	{
		...yoton,
		wiki: 'Lava Release: Fiery Rock Bullet',
		nome: 'Yōton: Kagandan',
		traducao: 'Projétil de Rocha de Fogo',
		dano: [3, 8],
		alcance: 'longo',
		descricao: 'Uma única rocha de lava, cuspida de longe, que atravessa a fumaça e cai em cheio no alvo.',
		efeito: '3d8 de dano de fogo no alvo.',
		notas: [LAVA]
	},
	// ---------------------------------------------------------------- Jiton (Magnetismo), além da onda 1
	{
		...jiton,
		wiki: 'Iron Sand: Black Iron Wings',
		nome: 'Satetsu: Kurogane no Tsubasa',
		traducao: 'Areia de Ferro: Asas de Ferro Negro',
		dano: [3, 8],
		alcance: 'medio',
		alvosExtras: 1,
		comp: { persegue: 1 },
		descricao: 'A areia de ferro forma asas enormes nas costas do ninja. Ele voa com elas, e as penas de ferro se soltam e perseguem o alvo.',
		efeito: '3d8 de dano em até 2 alvos, com uma rolagem por alvo. As penas perseguem os alvos (acerto automático). Enquanto as asas existem, o usuário pode voar.',
		notas: [MAGNETISMO]
	},
	{
		...jiton,
		wiki: 'Magnet Release: Gold Dust Imperial Funeral',
		nome: 'Jiton: Sakin Taisō',
		traducao: 'Grande Funeral do Pó de Ouro',
		dano: [4, 8],
		alcance: 'longo',
		area: 'esfera6',
		comp: { imobiliza: 1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O ninja apoia as palmas no chão, e uma onda de pó de ouro do tamanho de uma maré sobe da terra e desaba sobre os inimigos.',
		efeito: '4d8 de dano em todos na área (metade com sucesso na Resistência). Quem falha fica Imobilizado sob o ouro até vencer a Resistência de FOR ao fim do turno.',
		notas: [MAGNETISMO]
	},
	{
		...jiton,
		wiki: 'Gold Dust Drizzle',
		nome: 'Sakin Shigure',
		traducao: 'Garoa de Pó de Ouro',
		dano: [3, 6],
		alcance: 'medio',
		area: 'esfera3',
		descricao: 'O pó de ouro sobe no ar, se junta em gotas pesadas e cai sobre o alvo como chuva.',
		efeito: '3d6 de dano em todos na área (metade com sucesso na Resistência).',
		notas: [MAGNETISMO]
	}
];
