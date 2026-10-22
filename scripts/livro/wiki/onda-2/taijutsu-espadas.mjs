// Onda 2 · Taijutsu, golpes do Raiton Chakura Mōdo, estilos de espada e armas
import { CAP10, TIPOS } from '../base.mjs';

const taijutsu = { origem: 'Taijutsu', tipo: 'Taijutsu', ...CAP10.taijutsu };
const armadura = { origem: 'Raiton', tipo: 'Taijutsu', elemento: 'raiton', ...CAP10.raiton };
const arma = { origem: 'Bukijutsu', tipo: 'Bukijutsu', ...TIPOS };
const selo = { origem: 'Fuuinjutsu', tipo: 'Fuuinjutsu', ...TIPOS };
const MODO = 'Exige o Raiton Chakura Mōdo ativo.';
const ESPADA = 'Exige uma espada em mãos.';

export default [
	{
		...arma,
		wiki: 'Sōshūga',
		nome: 'Sōshūga',
		traducao: 'Garra Dupla do Nunchaku',
		alcance: 'pessoal',
		comp: { buff2: 1, 'buff-cena': 1, duravel: 1 },
		descricao: 'Um estilo de luta com um par de nunchakus, usado com as mãos, os pés e o que mais estiver livre, quando tocar no inimigo é perigoso demais.',
		efeito: '+2 nos ataques de Bukijutsu com nunchaku por 1 cena.',
		notas: ['Exige um par de nunchakus.']
	},
	{
		...taijutsu,
		wiki: 'Early Sacrifice',
		nome: 'Hayanie',
		traducao: 'Sacrifício Antecipado',
		dano: [2, 8],
		comp: { empurra: 1 },
		acao: 'reacao',
		descricao: 'O ninja salta por cima do atacante apoiado no ombro dele, escapa do golpe e, ao aterrissar, o joga por cima de si no chão.',
		efeito: '2d8 + FOR de dano, como reação a um ataque corpo a corpo, e o atacante cai.'
	},
	{
		...taijutsu,
		wiki: 'Disturbance Taijutsu',
		nome: 'Kakuran Taijutsu',
		traducao: 'Taijutsu da Perturbação',
		alcance: 'pessoal',
		comp: { buff2: 1, 'buff-cena': 1 },
		descricao: 'Um estilo de luta que parece dança: golpes de todos os ângulos, num ritmo que o inimigo não consegue prever.',
		efeito: 'O usuário tem +2 de Defesa por 1 cena.'
	},
	{
		...taijutsu,
		wiki: 'Surging Fire Wild Dance',
		nome: 'Hōka Ranbu',
		traducao: 'Dança Selvagem do Fogo que Sobe',
		dano: [3, 8],
		descricao: 'Uma sequência sem pausa: um chute, um soco e outro chute com a perna contrária, antes de o alvo se recuperar do primeiro.',
		efeito: '3d8 + FOR de dano.'
	},
	{
		...taijutsu,
		wiki: 'Leaf Drop',
		nome: 'Konoha Otoshi',
		traducao: 'Queda da Folha',
		dano: [3, 8],
		area: 'esfera3',
		comp: { empurra: 1 },
		descricao: 'Um chute que desce do alto com tanta força que o chão em volta desmorona.',
		efeito: '3d8 + FOR de dano em todos num raio de 3 m do ponto do golpe (metade com sucesso na Resistência). Quem falha cai.'
	},
	{
		...taijutsu,
		wiki: 'Leaf Rock-Destroying Rise',
		nome: 'Konoha Kaiganshō',
		traducao: 'Ascensão da Folha que Destrói a Rocha',
		dano: [4, 8],
		comp: { ignora: 1 },
		descricao: 'Uma cotovelada apoiada no outro braço, forte o bastante para quebrar coral e rocha.',
		efeito: '4d8 + FOR de dano, que ignora RD.'
	},
	{
		...taijutsu,
		wiki: 'Heavenly Spear Foot',
		nome: 'Sōtenkyaku',
		traducao: 'Pé da Lança Celestial',
		dano: [5, 8],
		alcance: 'curto',
		comp: { atordoa: 1 },
		descricao: 'O ninja salta muito alto e cai sobre o alvo com o pé à frente, com força para rachar uma armadura de chakra.',
		efeito: '5d8 + FOR de dano; se falhar na Resistência, o alvo fica Atordoado.'
	},
	{
		...armadura,
		wiki: 'Elbow',
		nome: 'Erubō',
		traducao: 'Cotovelada',
		dano: [4, 8],
		comp: { empurra: 1, exige: 1 },
		descricao: 'Com a armadura de raio, o ninja enterra o cotovelo no alvo e o arremessa contra a parede.',
		efeito: '4d8 + FOR de dano, e o alvo é jogado 5 m.',
		notas: [MODO]
	},
	{
		...armadura,
		wiki: 'Guillotine Drop',
		nome: 'Girochin Doroppu',
		traducao: 'Queda da Guilhotina',
		dano: [5, 8],
		comp: { atordoa: 1, exige: 1 },
		descricao: 'O ninja salta acima do alvo e desce com um chute, de cima para baixo, como a lâmina de uma guilhotina.',
		efeito: '5d8 + FOR de dano; se falhar na Resistência, o alvo fica Atordoado.',
		notas: [MODO]
	},
	{
		...arma,
		wiki: 'Afterglow',
		nome: 'Zankō',
		traducao: 'Brilho Restante',
		dano: [3, 8],
		alcance: 'curto',
		descricao: 'Uma corrida curta e um corte rápido, que deixa só o brilho da lâmina no ar.',
		efeito: '3d8 + FOR de dano cortante.',
		notas: [ESPADA]
	},
	{
		...arma,
		wiki: 'Moonlight',
		nome: 'Tsukikage',
		traducao: 'Luz da Lua',
		dano: [2, 8],
		comp: { empurra: 1 },
		descricao: 'O espadachim crava a espada no chão, se apoia nela e chuta o alvo para longe.',
		efeito: '2d8 + FOR de dano, e o alvo é jogado 5 m.',
		notas: [ESPADA]
	},
	{
		...arma,
		wiki: 'Dancing Blade Risk',
		nome: 'Yōjinbō',
		traducao: 'Risco da Lâmina Dançante',
		dano: [3, 8],
		alcance: 'curto',
		acao: 'secundaria',
		descricao: 'Um avanço tão rápido que o corte acontece antes do passo terminar.',
		efeito: '3d8 + FOR de dano cortante.',
		notas: [ESPADA]
	},
	{
		...arma,
		wiki: 'Iai Beheading',
		nome: 'Iaigiri',
		traducao: 'Corte do Saque',
		dano: [5, 8],
		comp: { ignora: 1 },
		descricao: 'Seguindo o caminho do saque, o espadachim corta e embainha a espada num só movimento, rápido demais para ser visto.',
		efeito: '5d8 + FOR de dano cortante, que ignora RD.',
		notas: ['Exige uma espada embainhada.']
	},
	{
		...arma,
		wiki: 'Kumogakure Taijutsu: Wolf Ring',
		nome: 'Kumogakure Taijutsu: Ōkami Ringu',
		traducao: 'Taijutsu de Kumogakure: Anel do Lobo',
		dano: [3, 8],
		area: 'esfera3',
		descricao: 'O espadachim gira o corpo inteiro na horizontal, com as espadas abertas, e acerta tudo em volta numa sequência rápida.',
		efeito: '3d8 + FOR de dano cortante em todos num raio de 3 m (metade com sucesso na Resistência).',
		notas: ['Exige duas espadas.']
	},
	{
		...arma,
		wiki: 'Flying Revolving Sword',
		nome: 'Hisenken',
		traducao: 'Espada Giratória Voadora',
		dano: [4, 8],
		alcance: 'longo',
		comp: { duravel: 1 },
		descricao: 'O espadachim arremessa a espada enorme, que gira no ar como uma roda. Se ela se crava numa árvore, ele usa a lâmina de apoio para os pés.',
		efeito: '4d8 + FOR de dano cortante.',
		notas: ['Exige uma espada grande, que precisa ser recuperada depois.']
	},

	{
		...arma,
		origem: 'Kirigakure',
		wiki: 'Bloody Mist Sword Art: Bone Mutilation',
		nome: 'Chigiri Tōhō: Honenuki',
		traducao: 'Arte da Espada da Névoa Sangrenta: Mutilação dos Ossos',
		dano: [4, 8],
		alcance: 'medio',
		alvosExtras: 2,
		comp: { duravel: 1 },
		descricao: 'Uma técnica de espada que só Kirigakure conhece: a lâmina solta dezenas de agulhas de chakra azul que voam até o alvo e se cravam fundo.',
		efeito: '4d8 + FOR de dano perfurante em até 3 alvos, com uma rolagem por alvo.',
		notas: ['Exige uma espada que solte chakra (uma das espadas lendárias da Névoa ou parecida).']
	},
	{
		origem: 'Fuuton',
		tipo: 'Ninjutsu',
		elemento: 'fuuton',
		...CAP10.fuuton,
		wiki: 'Chakra Blade: Straight Line',
		nome: 'Chakura-tō: Maichimonji',
		traducao: 'Lâmina de Chakra: Linha Reta',
		dano: [3, 8],
		alcance: 'curto',
		comp: { arma: 1, duravel: 1 },
		descricao: 'O ninja segura a lâmina na horizontal e passa chakra por ela, que se estica muito além do metal.',
		efeito: '3d8 de dano cortante, somado ao dano normal da arma, contra alvos a até 10 m.',
		notas: ['Exige uma lâmina em mãos.']
	},
	{
		...arma,
		wiki: 'Dance of the Sickle Blade: Falling Descent Blade',
		nome: 'Hagama no Mai: Rakukō no Yaiba',
		traducao: 'Dança da Foice: Lâmina que Cai',
		dano: [3, 8],
		alcance: 'curto',
		descricao: 'De longe, o ninja gira a foice presa à corrente bem alto no ar e a faz descer sobre o alvo.',
		efeito: '3d8 + FOR de dano cortante, contra alvos a até 10 m.',
		notas: ['Exige uma kusarigama.']
	},
	{
		...arma,
		wiki: 'Cloud-Style Front Beheading',
		nome: 'Kumo-Ryū Omotegiri',
		traducao: 'Decapitação Frontal do Estilo da Nuvem',
		dano: [4, 8],
		descricao: 'O golpe mais direto do estilo de espada de Kumogakure: um só corte, rápido e pesado, de frente.',
		efeito: '4d8 + FOR de dano cortante.',
		notas: [ESPADA]
	},
	{
		...arma,
		wiki: 'Cloud-Style Crescent Moon Beheading',
		nome: 'Kumo-Ryū Mikazukigiri',
		traducao: 'Decapitação da Lua Crescente do Estilo da Nuvem',
		dano: [3, 8],
		area: 'cone',
		acao: 'reacao',
		descricao: 'Um arco largo, em forma de lua crescente, tão rápido que serve até quando quase não há tempo de reagir.',
		efeito: '3d8 + FOR de dano cortante, como reação, em todos no cone à frente (metade com sucesso na Resistência).',
		notas: [ESPADA]
	},
	{
		origem: 'Katon',
		tipo: 'Ninjutsu',
		elemento: 'katon',
		...CAP10.katon,
		wiki: 'Cloud-Style Flame Beheading',
		nome: 'Kumo-Ryū Kaengiri',
		traducao: 'Decapitação Flamejante do Estilo da Nuvem',
		dano: [3, 8],
		alcance: 'medio',
		area: 'cone-medio',
		descricao: 'O espadachim acende a lâmina e corta o ar, e o fogo segue o traço do golpe em arcos enormes.',
		efeito: '3d8 de dano de fogo em todos na linha do corte (metade com sucesso na Resistência).',
		notas: [ESPADA]
	},
	{
		origem: 'Raiton',
		tipo: 'Ninjutsu',
		elemento: 'raiton',
		...CAP10.raiton,
		wiki: 'Supervibrato Lightning Release Swords',
		nome: 'Chō Biburāto Raitontō',
		traducao: 'Espadas de Raio Supervibrantes',
		alcance: 'pessoal',
		comp: { buff2: 1, 'buff-cena': 1, ignora: 1 },
		descricao: 'O ninja passa raio pelas lâminas, que vibram tão rápido que cortam qualquer coisa. Até um lápis vira uma arma assim.',
		efeito: '+2 nos ataques com lâmina por 1 cena, e esses ataques ignoram RD.',
		notas: ['Exige lâminas em mãos.']
	},
	{
		...selo,
		wiki: 'Booby Trap',
		nome: 'Būbītorappu',
		traducao: 'Armadilha',
		dano: [3, 6],
		alcance: 'curto',
		area: 'esfera3',
		comp: { preparo: -1, consumivel: -1 },
		descricao: 'Um boneco ou um bicho de mentira, recheado de kunai e de uma etiqueta explosiva, deixado no caminho do inimigo.',
		efeito: '3d6 de dano em todos num raio de 3 m da armadilha (metade com sucesso na Resistência), quando alguém chega perto.',
		notas: ['Gasta kunai e uma etiqueta explosiva.']
	},
	{
		...selo,
		wiki: 'Heavenly Punishment',
		nome: 'Tenchū',
		traducao: 'Castigo Celestial',
		dano: [8, 10],
		alcance: 'pessoal',
		area: 'esfera6',
		comp: { 'custa-pv': 6, 'dano-proprio': 3, 'uma-vez': 1, consumivel: -3 },
		descricao: 'A última técnica de quem não tem mais saída: o ninja cobre o corpo de etiquetas explosivas e as detona quando o inimigo está perto.',
		efeito: '8d10 de dano em todos num raio de 6 m (metade com sucesso na Resistência). O usuário perde 3d6 PV e mais 30 PV junto, e quase nunca sobrevive.',
		notas: ['Gasta dezenas de etiquetas explosivas.']
	},
	{
		...arma,
		wiki: 'Shadow Senbon',
		nome: 'Kage Senbon',
		traducao: 'Senbon da Sombra',
		dano: [2, 6],
		alcance: 'medio',
		descricao: 'Senbon com guizos e senbon sem guizos voam juntas. O inimigo se defende do som e não vê as silenciosas.',
		efeito: '2d6 + FOR de dano perfurante.'
	}
];
