// Onda 2 · Katon, Fuuton, Suiton, Doton, Raiton, Yōton (Lava) e Ranton (Tempestade)
import { CAP10 } from '../base.mjs';

const katon = { origem: 'Katon', tipo: 'Ninjutsu', elemento: 'katon', ...CAP10.katon };
const fuuton = { origem: 'Fuuton', tipo: 'Ninjutsu', elemento: 'fuuton', ...CAP10.fuuton };
const suiton = { origem: 'Suiton', tipo: 'Ninjutsu', elemento: 'suiton', ...CAP10.suiton };
const doton = { origem: 'Doton', tipo: 'Ninjutsu', elemento: 'doton', ...CAP10.doton };
const raiton = { origem: 'Raiton', tipo: 'Ninjutsu', elemento: 'raiton', ...CAP10.raiton };
const yoton = { origem: 'Yōton', tipo: 'Ninjutsu', elemento: 'yoton', ...CAP10.geral };
const LAVA = 'Exige a Kekkei Genkai do Yōton (Liberação de Lava), criada com as regras do cap. 8.4.';
const LEQUE = 'Exige um leque de guerra em mãos.';

export default [
	{
		...katon,
		wiki: 'Fire Release: Great Fire Destruction',
		nome: 'Katon: Gōka Messhitsu',
		traducao: 'Estilo Fogo: Grande Devastação por Fogo',
		dano: [4, 8],
		alcance: 'medio',
		area: 'esfera15',
		descricao: 'Um mar de fogo sai da boca do ninja e cobre uma área enorme. Não há para onde correr dentro dele.',
		efeito: '4d8 de dano de fogo em todos na área (metade com sucesso na Resistência).'
	},
	{
		...katon,
		wiki: 'Fire Release: Dragon Flame Release Song Technique',
		nome: 'Katon: Ryūen Hōka no Jutsu',
		traducao: 'Estilo Fogo: Técnica da Canção do Dragão de Chamas',
		dano: [3, 8, 3],
		alcance: 'medio',
		alvosExtras: 3,
		descricao: 'Várias cabeças de dragão de fogo saem em leque e fecham o alvo pela frente e pelos lados, sem deixar saída.',
		efeito: '3d8+3 de dano de fogo em até 4 alvos, com uma rolagem por alvo.'
	},
	{
		...katon,
		wiki: 'Fire Release: Hiding in Ash and Dust Technique',
		nome: 'Katon: Haijingakure no Jutsu',
		traducao: 'Estilo Fogo: Técnica de Ocultação nas Cinzas',
		dano: [3, 6],
		alcance: 'medio',
		area: 'esfera6',
		comp: { cega: 1 },
		descricao: 'Uma nuvem de cinza em brasa cobre o campo. Ela queima quem toca e esconde o ninja como uma cortina de fumaça.',
		efeito: '3d6 de dano de fogo em todos na área (metade com sucesso na Resistência). Quem falha também fica Cego por 1 turno.'
	},
	{
		...katon,
		wiki: 'Fire Release: Great Flame Technique',
		nome: 'Katon: Gōen no Jutsu',
		traducao: 'Estilo Fogo: Técnica da Grande Chama',
		dano: [4, 8],
		alcance: 'medio',
		area: 'cone-medio',
		descricao: 'Uma torrente de fogo que sai fina da boca e vai se abrindo, cada vez mais larga, até engolir tudo à frente. É uma técnica antiga da família Sarutobi.',
		efeito: '4d8 de dano de fogo em todos no cone (metade com sucesso na Resistência).'
	},
	{
		...katon,
		wiki: 'Fire Release: Exploding Flame Formation',
		nome: 'Katon: Kibaku Enjin',
		traducao: 'Estilo Fogo: Formação de Chama Explosiva',
		dano: [4, 8],
		alcance: 'curto',
		area: 'esfera6',
		comp: { preparo: -2, consumivel: -1 },
		descricao: 'Etiquetas explosivas carregadas de fogo ficam escondidas sob a terra, em volta do lugar onde o inimigo vai pisar. Quando ele chega, o chão inteiro explode em chamas.',
		efeito: '4d8 de dano de fogo em todos na área (metade com sucesso na Resistência).',
		notas: ['Preparar as etiquetas leva alguns minutos antes da luta. Gasta um maço de etiquetas explosivas.']
	},
	{
		...fuuton,
		wiki: 'Wind Waves',
		nome: 'Kazanami',
		traducao: 'Ondas de Vento',
		dano: [4, 8],
		alcance: 'medio',
		area: 'cone-medio',
		descricao: 'Com um aceno de mão, o ninja solta uma lâmina de vento larga, forte o bastante para fazer recuar até um gigante.',
		efeito: '4d8 de dano cortante em todos na linha (metade com sucesso na Resistência).'
	},
	{
		...fuuton,
		wiki: 'Wind Release: Vacuum Wave',
		rankWiki: 'B',
		nome: 'Fūton: Shinkūha',
		traducao: 'Estilo Vento: Onda de Vácuo',
		dano: [3, 8, 3],
		alcance: 'pessoal',
		area: 'esfera6',
		descricao: 'O ninja respira fundo e gira enquanto solta o ar, que vira uma lâmina de vento em volta dele, cortando tudo num círculo.',
		efeito: '3d8+3 de dano cortante em todos num raio de 6 m (metade com sucesso na Resistência).'
	},
	{
		...fuuton,
		wiki: 'Wind Release: Vacuum Blade',
		nome: 'Fūton: Shinkūjin',
		traducao: 'Estilo Vento: Lâmina de Vácuo',
		dano: [2, 8],
		alcance: 'curto',
		comp: { arma: 1, duravel: 1 },
		descricao: 'O ninja sopra chakra de vento sobre a arma, que fica mais longa, mais afiada e voa mais longe. Uma kunai vira quase uma cimitarra.',
		efeito: '2d8 de dano cortante, somado ao dano normal da arma, contra alvos a até 10 m.',
		notas: ['Exige uma arma em mãos ou arremessada no mesmo turno.']
	},
	{
		...fuuton,
		wiki: 'Wind Release: Dust Cloud Technique',
		nome: 'Fūton: Fūjin no Jutsu',
		traducao: 'Estilo Vento: Técnica da Nuvem de Poeira',
		dano: [3, 8],
		alcance: 'longo',
		area: 'cone-medio',
		comp: { ignora: 1 },
		descricao: 'Uma corrente de vento cheia de poeira sai pelas mãos sobrepostas do ninja e desfaz o que encontra pela frente.',
		efeito: '3d8 de dano em todos na linha (metade com sucesso na Resistência), que ignora cobertura e RD.'
	},
	{
		...fuuton,
		wiki: 'Wind Release: Cast Net',
		nome: 'Fūton: Kakeami',
		traducao: 'Estilo Vento: Lançamento da Rede',
		dano: [3, 6],
		alcance: 'medio',
		area: 'esfera3',
		comp: { duravel: 1 },
		descricao: 'Com o leque de guerra, o ninja lança correntes de vento que se cruzam como uma rede de pescar, cortando quem fica preso nela.',
		efeito: '3d6 de dano cortante em todos na área (metade com sucesso na Resistência).',
		notas: [LEQUE]
	},
	{
		...fuuton,
		wiki: 'Wind Release: Great Cast Net',
		nome: 'Fūton: Ōkakeami',
		traducao: 'Estilo Vento: Rede de Arremesso Grande',
		dano: [4, 8],
		alcance: 'longo',
		area: 'esfera6',
		comp: { duravel: 1 },
		descricao: 'A versão maior da Rede de Lançar: dezenas de lâminas de vento caem juntas sobre uma área inteira.',
		efeito: '4d8 de dano cortante em todos na área (metade com sucesso na Resistência).',
		notas: [LEQUE]
	},
	{
		...suiton,
		wiki: 'Heavenly Weeping',
		nome: 'Tenkyū',
		traducao: 'Choro Celestial',
		dano: [2, 8],
		alcance: 'curto',
		comp: { 'sem-selos': 1 },
		acao: 'secundaria',
		descricao: 'O ninja junta água na boca, molda em agulhas e cospe numa velocidade que o olho não acompanha.',
		efeito: '2d8 de dano perfurante.'
	},
	{
		...suiton,
		wiki: 'Rain Tiger at Will Technique',
		nome: 'Ukojizai no Jutsu',
		traducao: 'Técnica do Tigre à Vontade na Chuva',
		alcance: 'distante',
		comp: { sustentado: 1, preparo: -2 },
		info: { area: 'Toda a área onde a chuva cai', ataque: 'Automático' },
		descricao: 'O ninja enche o céu de nuvens com o próprio chakra, e cada gota de chuva vira um sensor. Quem anda na chuva é sentido por ele.',
		efeito: 'Enquanto a chuva cair, o usuário sente a posição, o tamanho e o chakra de toda criatura molhada por ela, a qualquer distância dentro da área.',
		notas: ['Formar as nuvens leva alguns minutos de concentração.']
	},
	{
		...suiton,
		wiki: 'Dustless Bewildering Cover',
		rankWiki: 'B',
		nome: 'Mujin Meisai',
		traducao: 'Capa da Desconcertante Superfície sem Pó',
		alcance: 'pessoal',
		comp: { buff2: 1, 'buff-cena': 1, sustentado: 1, 'nao-copia': 1 },
		descricao: 'O vapor de água em volta do ninja desvia a luz, e ele some de verdade: sem cheiro, sem som, sem presença.',
		efeito: 'Enquanto mantém a técnica, o usuário fica invisível e tem +2 de Defesa. Nem sensores o percebem; só um dōjutsu ou um ataque em área o encontram.'
	},
	{
		...suiton,
		wiki: 'Water Release: Tearing Torrent',
		nome: 'Suiton: Hahonryū',
		traducao: 'Estilo Água: Torrente Dilacerante',
		dano: [3, 8],
		alcance: 'medio',
		comp: { ignora: 1 },
		descricao: 'A água gira na palma da mão do ninja como uma broca e sai disparada, furando o que encontra.',
		efeito: '3d8 de dano perfurante, que ignora RD.'
	},
	{
		...suiton,
		wiki: 'Water Release: Water Colliding Wave',
		nome: 'Suiton: Suishōha',
		traducao: 'Estilo Água: Colisão da Onda de Água',
		dano: [3, 8],
		area: 'esfera15',
		comp: { barreira: 2 },
		descricao: 'Um redemoinho de água sobe em volta do ninja, que fica protegido no meio dele. Do alto, a água explode numa onda que varre o campo inteiro.',
		efeito: '3d8 de dano em todos na área (metade com sucesso na Resistência). O redemoinho protege o usuário com 20 PV até o começo do próximo turno dele.'
	},
	{
		...suiton,
		wiki: 'Water Release: Water Formation Pillar',
		nome: 'Suiton: Suijinchū',
		traducao: 'Estilo Água: Formação do Pilar de Água',
		comp: { barreira: 3 },
		acao: 'reacao',
		descricao: 'O ninja cospe uma torrente grossa e curva de água que vira, num instante, uma barreira redonda em volta dele.',
		efeito: 'Absorve até 30 do dano de um ataque ou jutsu contra o usuário ou quem estiver a até 3 m dele.'
	},
	{
		...suiton,
		wiki: 'Water Release: Water Severing Wave',
		nome: 'Suiton: Suidanha',
		traducao: 'Estilo Água: Ondas de Águas Cortantes',
		dano: [5, 8],
		alcance: 'longo',
		comp: { atravessa: 1 },
		descricao: 'Um jato fino de água, com tanta pressão que corta raízes gigantes e o que estiver atrás delas.',
		efeito: '5d8 de dano cortante em todos os alvos em linha até o alcance.'
	},
	{
		...suiton,
		wiki: 'Water Release: Bubbles Technique',
		nome: 'Suiton: Hōmatsu no Jutsu',
		traducao: 'Estilo Água: Técnica de Bolhas',
		dano: [2, 6],
		alcance: 'medio',
		area: 'esfera3',
		descricao: 'Dezenas de bolhas cercam o inimigo por todos os lados e estouram ao menor toque, em pequenas explosões.',
		efeito: '2d6 de dano em todos na área (metade com sucesso na Resistência).'
	},
	{
		...doton,
		wiki: 'Earth Release: Great Moving Earth Core',
		nome: 'Doton: Daichidōkaku',
		traducao: 'Estilo Terra: Grande Movimentação do Núcleo da Terra',
		dano: [2, 6],
		alcance: 'medio',
		area: 'esfera15',
		comp: { empurra: 1 },
		descricao: 'O ninja ergue e afunda o chão em volta à vontade, numa escala enorme: abre buracos, levanta paredões e derruba exércitos.',
		efeito: '2d6 de dano em todos na área (metade com sucesso na Resistência). Quem falha cai num buraco ou é jogado de um paredão.'
	},
	{
		...doton,
		wiki: 'Earth Release: Practice Brick Technique',
		nome: 'Doton: Renga no Jutsu',
		traducao: 'Estilo Terra: Técnica da Prática do Tijolo',
		alcance: 'curto',
		comp: { barreira: 2 },
		descricao: 'Uma técnica simples de Iwagakure: o ninja põe as mãos no chão e levanta um muro de tijolos de terra para se proteger.',
		efeito: 'Cria um muro com 20 PV que bloqueia a passagem e a linha de visão.'
	},
	{
		...doton,
		wiki: 'Earth Release: Gravel',
		nome: 'Doton: Sazareishi',
		traducao: 'Estilo Terra: Cascalho',
		alcance: 'medio',
		comp: { imobiliza: 1, sustentado: 1 },
		descricao: 'A terra em volta do alvo se levanta e se fecha sobre ele, apertada como pedra, até ele não conseguir se mexer.',
		efeito: 'O alvo fica Imobilizado na terra enquanto o usuário mantiver a técnica e o alvo não vencer a Resistência.'
	},
	{
		...doton,
		wiki: 'Earth Release: Dropping Lid',
		nome: 'Doton: Otoshibuta',
		traducao: 'Estilo Terra: Tampa Caída',
		dano: [3, 6],
		alcance: 'longo',
		area: 'esfera3',
		comp: { imobiliza: 1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'Uma tampa enorme de terra, com a forma de um javali, aparece no alto e cai sobre o alvo, prendendo-o embaixo.',
		efeito: '3d6 de dano em todos na área, que ficam Imobilizados sob a tampa até vencer a Resistência de FOR ao fim do turno.'
	},
	{
		...doton,
		wiki: 'Earth Release: Rending Drill Fang',
		nome: 'Doton: Ressenga',
		traducao: 'Presa da Broca que Rasga',
		dano: [3, 8],
		alcance: 'curto',
		comp: { ignora: 1, exige: 1 },
		descricao: 'Escondido debaixo da terra, o ninja sai de uma vez, girando como uma broca, bem embaixo do inimigo.',
		efeito: '3d8 de dano perfurante, que ignora RD.',
		notas: ['Exige que o usuário esteja debaixo da terra, com o Doton: Moguragakure no Jutsu.']
	},
	{
		...doton,
		wiki: 'Earth Release: Ultra-Added-Weight Rock Technique',
		nome: 'Doton: Chōkajūgan no Jutsu',
		traducao: 'Estilo Terra: Técnica da Rocha Super Pesada',
		dano: [3, 6],
		alcance: 'curto',
		comp: { imobiliza: 1, turnos: 3, sustentado: 1 },
		acao: 'secundaria',
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'A versão extrema da Rocha de Peso Aumentado: o alvo fica tão pesado que o chão afunda e os ossos estalam.',
		efeito: '3d6 de dano, esmagado pelo próprio peso, e o alvo fica Imobilizado até vencer a Resistência de FOR ao fim de um turno, por até 4 turnos.'
	},
	{
		...doton,
		wiki: 'Earth Release: Ultralight-Weight Rock Technique',
		nome: 'Doton: Chōkeijūgan no Jutsu',
		traducao: 'Estilo Terra: Técnica da Rocha Super Leve',
		alcance: 'medio',
		comp: { buff2: 1, 'buff-cena': 1, 'buff-aliado': 1 },
		acao: 'secundaria',
		descricao: 'O ninja deixa algo tão leve que consegue erguer até uma montanha. Também serve para deixar um aliado leve como uma folha.',
		efeito: 'O usuário ganha +2 de AGI por 1 cena e consegue erguer objetos enormes. No mesmo lançamento, um aliado a até 30 m ganha +1 de AGI por 3 turnos.'
	},
	{
		...doton,
		wiki: 'Rock Clone Technique',
		nome: 'Iwa Bunshin no Jutsu',
		traducao: 'Técnica do Clone de Rocha',
		comp: { invocacao: 6, barreira: 1 },
		descricao: 'O ninja cospe terra e a molda em um clone de pedra. Em vez de sumir com um golpe, ele racha e se quebra.',
		efeito: 'Cria um clone de pedra com 10 PV, a Defesa e os valores do usuário. Na sua vez, ele faz uma ação secundária e um ataque básico.'
	},
	{
		...doton,
		wiki: 'Earth Release: Earth-Style Wall of Ten Thousand Ri',
		nome: 'Doton: Banri Doryūheki',
		traducao: 'Estilo Terra: Parede de Lama de Dez Mil Ri',
		alcance: 'medio',
		comp: { barreira: 10, exige: 1 },
		info: { area: 'Muralha de várias centenas de metros' },
		descricao: 'Vários ninjas da terra cospem lama ao mesmo tempo, e a lama vira uma muralha imensa, de colunas encostadas umas nas outras, que segura um exército.',
		efeito: 'Cria uma muralha com 100 PV que bloqueia a passagem e a linha de visão.',
		notas: ['Exige vários usuários de Doton que saibam a técnica, gastando a ação no mesmo turno e dividindo o custo.']
	},
	{
		...raiton,
		wiki: 'Lightning Release: Wave of Inspiration',
		nome: 'Raiton: Kangekiha',
		traducao: 'Estilo Relâmpago: Onda de Inspiração',
		dano: [4, 8],
		alcance: 'medio',
		area: 'cone-medio',
		comp: { paralisa: 1, 'dois-elementos': 1 },
		descricao: 'O ninja cospe uma onda de água e, no mesmo instante, passa raio por ela. Quem está molhado leva o choque inteiro.',
		efeito: '4d8 de dano elétrico em todos no cone (metade com sucesso na Resistência). Quem falha fica Paralisado por 1 turno.',
		notas: ['Exige afinidade com Raiton e com Suiton.']
	},
	{
		...raiton,
		wiki: 'Lightning Release: Purple Electricity',
		nome: 'Raiton: Shiden',
		traducao: 'Estilo Relâmpago: Eletricidade Roxa',
		dano: [4, 8],
		alcance: 'medio',
		comp: { paralisa: 1 },
		descricao: 'Um raio roxo sai da mão do ninja em linha reta. Foi criado para substituir um golpe que exigia um olho que o criador já não tinha.',
		efeito: '4d8 de dano elétrico; se falhar na Resistência, o alvo fica Paralisado por 1 turno.'
	},
	{
		...yoton,
		wiki: 'Lava Release: Melting Apparition Technique',
		nome: 'Yōton: Yōkai no Jutsu',
		traducao: 'Estilo Dissolução: Técnica da Solução Misteriosa',
		dano: [3, 8],
		alcance: 'medio',
		area: 'cone-medio',
		comp: { continuo: 1, ignora: 1 },
		descricao: 'Uma lama ácida e fervente sai da boca do ninja e corrói até carne e metal.',
		efeito: '3d8 de dano de ácido em todos no cone (metade com sucesso na Resistência), que ignora RD. Quem falha continua sendo corroído, com o dano contínuo.',
		notas: [LAVA]
	},
	{
		...yoton,
		wiki: 'Lava Release: Quicklime Congealing Technique',
		nome: 'Yōton: Sekkaigyō no Jutsu',
		traducao: 'Estilo Fusão: Técnica da Calcificação',
		dano: [2, 6],
		alcance: 'medio',
		area: 'esfera3',
		comp: { imobiliza: 1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O ninja cospe uma massa de cal viva que machuca e endurece em segundos, prendendo quem ela cobre.',
		efeito: '2d6 de dano em todos na área, que ficam Imobilizados na cal até vencer a Resistência de FOR ao fim do turno.',
		notas: [LAVA]
	},
	{
		...yoton,
		wiki: 'Lava Release: Ash Stone Seal Technique',
		nome: 'Yōton: Kaisekifū no Jutsu',
		traducao: 'Estilo Fusão: Técnica do Selo da Pedra de Cinzas',
		alcance: 'medio',
		comp: { imobiliza: 1, sustentado: 1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'Uma nuvem grossa de cinza envolve o alvo e endurece em volta dele como pedra.',
		efeito: 'O alvo fica Imobilizado na cinza enquanto o usuário mantiver a técnica e o alvo não vencer a Resistência de FOR.',
		notas: [LAVA]
	},
	{
		origem: 'Ranton',
		tipo: 'Ninjutsu',
		elemento: 'ranton',
		...CAP10.geral,
		wiki: 'Storm Release: Laser Circus',
		nome: 'Ranton: Reizā Sākasu',
		traducao: 'Estilo Tempestade: Laser Circus',
		dano: [4, 8],
		alcance: 'longo',
		alvosExtras: 3,
		comp: { persegue: 1 },
		descricao: 'Um halo de luz cerca as mãos do ninja, e dele saem vários feixes que mudam de rumo no ar para acertar os alvos.',
		efeito: '4d8 de dano em até 4 alvos. Os feixes perseguem os alvos e acertam automaticamente, a não ser que eles usem a Esquiva Ativa ou o Kawarimi.',
		notas: ['Exige a Kekkei Genkai do Ranton (Liberação de Tempestade), criada com as regras do cap. 8.4.']
	}
];
