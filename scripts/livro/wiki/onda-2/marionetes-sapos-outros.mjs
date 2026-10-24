// Onda 2 · Marionetes, técnicas dos sapos e Senjutsu, Mokuton e outros ninjutsu
import { CAP10, MARIONETES, cla } from '../base.mjs';

const marionete = { origem: 'Kugutsu', tipo: 'Kugutsu', ...MARIONETES };
const ninjutsu = { origem: 'Ninjutsu', tipo: 'Ninjutsu', ...CAP10.geral };
const senjutsu = { origem: 'Senjutsu', tipo: 'Ninjutsu', ...CAP10.geral };
const mokuton = { origem: 'Clã Senju', tipo: 'Ninjutsu', elemento: 'mokuton', ...cla('senju') };
const SAPOS = 'Exige um contrato com os sapos do Monte Myōboku (cap. 14).';
const SANGUE = 'Gasta um pouco de sangue do usuário no selo de invocação.';
const SENNIN = 'Exige o Modo Sennin ativo (cap. 15).';

export default [
	{
		...marionete,
		wiki: 'Puppet: Father and Mother',
		nome: 'Kugutsu: Chichi to Haha',
		traducao: 'Marionete: Pai e Mãe',
		dano: [4, 8],
		alcance: 'curto',
		alvosExtras: 1,
		comp: { ignora: 1, exige: 1 },
		descricao: 'Duas marionetes, um pai e uma mãe, dão as mãos e esticam entre elas um fio de navalha que corta até outra marionete ao meio.',
		efeito: '4d8 de dano cortante em até 2 alvos, com uma rolagem por alvo, que ignora RD.',
		notas: ['Exige duas marionetes ligadas pela técnica.']
	},
	{
		...marionete,
		wiki: 'Prepared Puppet: Eight Waves of Needles',
		nome: 'Shikomi Kugutsu: Shinshin Happa',
		traducao: 'Marionete Preparada: Oito Ondas de Agulhas',
		dano: [3, 6],
		alcance: 'medio',
		area: 'cone-medio',
		comp: { continuo: 1, exige: 1 },
		descricao: 'A boca da marionete cospe uma torrente de senbon envenenados, sem parar, como uma metralhadora.',
		efeito: '3d6 de dano em todos no cone (metade com sucesso na Resistência). Quem falha fica envenenado, com o dano contínuo.',
		notas: ['Exige uma marionete com Senbon Disparados e Compartimento de Veneno (cap. 13).']
	},
	{
		...marionete,
		wiki: 'Puppet Technique: Prosthetic Arm Senbon',
		nome: 'Kugutsu no Jutsu: Gishu Senbon',
		traducao: 'Técnica de Marionetes: Agulhas do Braço Protético',
		dano: [3, 8],
		alcance: 'longo',
		area: 'esfera3',
		comp: { continuo: 1, exige: 1 },
		descricao: 'O braço da marionete é disparado como um torpedo e solta, no ar, cilindros que se abrem numa chuva de senbon.',
		efeito: '3d8 de dano em todos na área (metade com sucesso na Resistência). Quem falha fica envenenado, com o dano contínuo.',
		notas: ['Exige uma marionete com Membros Substituíveis e Compartimento de Veneno (cap. 13).']
	},
	{
		...marionete,
		wiki: 'Red Secret Technique: Machinery Triangles',
		nome: 'Akahigi: Kiki Sankaku',
		traducao: 'Técnica Vermelha Secreta: Maquinário Triangular',
		dano: [4, 8],
		alcance: 'longo',
		alvosExtras: 1,
		comp: { exige: 1 },
		descricao: 'Do pescoço e das palmas da marionete saem lâminas triangulares com bolas explosivas presas, que voam até os alvos.',
		efeito: '4d8 de dano em até 2 alvos, com uma rolagem por alvo.',
		notas: ['Exige uma marionete com Pergaminhos Explosivos (cap. 13).']
	},
	{
		...marionete,
		wiki: 'Puppet: Spring Punishing Strike',
		nome: 'Kugutsu: Haruchūgeki',
		traducao: 'Marionete: Ataque de Punição da Primavera',
		dano: [5, 8],
		comp: { ignora: 1, exige: 1 },
		descricao: 'Com um aliado preso nos fios, o marionetista o lança alto no ar e o guia num soco carregado de chakra.',
		efeito: '5d8 de dano, que ignora RD, no golpe do aliado guiado pelos fios.',
		notas: ['Exige um aliado sob o Sōen: Hitomi Gokū.']
	},
	{
		...ninjutsu,
		wiki: 'Toad Oil Bullet',
		rankWiki: 'C',
		nome: 'Gamayudan',
		traducao: 'Bomba do Óleo de Sapo',
		alcance: 'medio',
		area: 'cone-medio',
		comp: { imobiliza: 1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O ninja transforma o chakra num óleo grudento e cospe uma massa enorme dele. Quem é atingido mal consegue se mexer, e água comum não lava.',
		efeito: 'Quem estiver na área fica Imobilizado no óleo até vencer a Resistência de FOR ao fim do turno. O óleo pega fogo com qualquer chama.'
	},
	{
		...ninjutsu,
		wiki: 'Toad Flatness — Shadow Manipulation Technique',
		rankWiki: 'B',
		nome: 'Gamadaira: Kageayatsuri no Jutsu',
		traducao: 'Técnica de Manipulação da Sombra do Sapo Achatado',
		comp: { controla: 1, turnos: 3, sustentado: 1 },
		info: { resistencia: 'ESP (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O ninja fica fino como papel, entra na sombra do alvo e passa a controlar o corpo e a mente dele por dentro.',
		efeito: 'O alvo tocado fica Controlado pelo usuário por até 4 turnos, enquanto ele mantiver a técnica. Ao fim de cada turno, pode tentar se libertar com uma Resistência de ESP.'
	},
	{
		...ninjutsu,
		wiki: 'Hiding in a Toad Technique',
		rankWiki: 'C',
		nome: 'Gamagakure no Jutsu',
		traducao: 'Técnica de Ocultação Batráquia',
		comp: { invocacao: 4, sustentado: 1 },
		descricao: 'O ninja invoca um sapo especial de Myōboku e se esconde na barriga dele. O sapo mergulha cem metros em água doce, ótimo para entrar num acampamento cercado por rio.',
		efeito: 'O usuário fica dentro do sapo, fora do alcance de ataques, enquanto mantiver a técnica. O sapo nada e mergulha levando-o.',
		notas: [SAPOS]
	},
	{
		...ninjutsu,
		wiki: 'Barrier: Toad Gourd Prison',
		rankWiki: 'B',
		nome: 'Kekkai: Gama Hyōrō',
		traducao: 'Barreira: Cabaça-Prisão do Batráquio',
		alcance: 'medio',
		comp: { imobiliza: 1, sela: 1, invocacao: 4 },
		descricao: 'O ninja invoca um sapo pequeno em forma de cabaça, que puxa o alvo com a língua para dentro da barriga e o isola do mundo.',
		efeito: 'O alvo fica Imobilizado dentro do sapo, sem lançar jutsus, até vencer a Resistência.',
		notas: [SAPOS]
	},
	{
		...ninjutsu,
		wiki: 'Turning into a Frog Technique',
		rankWiki: 'C',
		nome: 'Kaeru Kaeru no Jutsu',
		traducao: 'Técnica da Transformação em Batráquio',
		comp: { paralisa: 1, turnos: 3, sela: 1 },
		info: { resistencia: 'VIG (DT do Jutsu)' },
		descricao: 'Com um toque na testa, o ninja transforma o alvo numa perereca. É mais usado em interrogatórios: os outros prisioneiros falam rápido quando veem os colegas virarem sapo.',
		efeito: 'Se falhar na Resistência, o alvo tocado vira uma perereca por até 4 turnos: fica Paralisado para fins de combate e não lança jutsus.'
	},
	{
		...ninjutsu,
		wiki: 'Summoning: Toad Mouth Bind',
		rankWiki: 'A',
		nome: 'Kuchiyose: Gamaguchi Shibari',
		traducao: 'Invocação: Prisão da Boca do Sapo',
		dano: [2, 6],
		alcance: 'longo',
		area: 'esfera15',
		comp: { imobiliza: 1, sustentado: 1, consumivel: -1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'Em vez de um sapo inteiro, o ninja invoca só o esôfago de um sapo gigante, que cobre as paredes em volta. Quem está lá dentro está dentro do sapo.',
		efeito: '2d6 de dano por turno em todos na área, que ficam Imobilizados nas paredes de carne até vencer a Resistência de FOR ao fim do turno.',
		notas: [SAPOS + ' ' + SANGUE]
	},
	{
		...ninjutsu,
		wiki: 'Summoning: Food Cart Destroyer Technique',
		rankWiki: 'B',
		nome: 'Kuchiyose: Yatai Kuzushi no Jutsu',
		traducao: 'Invocação: Técnica da Casa Caiu',
		dano: [4, 8],
		alcance: 'medio',
		area: 'esfera3',
		comp: { imobiliza: 1, consumivel: -1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O ninja invoca um sapo enorme no ar, bem em cima do alvo. O chão treme e quem estava embaixo fica preso sob o peso.',
		efeito: '4d8 de dano em todos na área, que ficam Imobilizados sob o sapo até vencer a Resistência de FOR ao fim do turno.',
		notas: [SAPOS + ' ' + SANGUE]
	},
	{
		...ninjutsu,
		wiki: 'Summoning: Quintuple Rashōmon',
		rankWiki: 'A',
		nome: 'Kuchiyose: Gojū Rashōmon',
		traducao: 'Invocação: Portão Rashōmon Quíntuplo',
		comp: { barreira: 10, 'sem-selos': 1, consumivel: -1 },
		acao: 'reacao',
		descricao: 'Cinco portões Rashōmon de uma vez, sem selos, onde o ninja quiser, mesmo em volta de outra pessoa.',
		efeito: 'Absorve até 100 de dano de um ataque ou jutsu contra o usuário ou um aliado. Os portões somem depois de absorver o golpe.',
		notas: [SANGUE]
	},
	{
		...ninjutsu,
		wiki: 'Formation of Ten Thousand Snakes',
		rankWiki: 'B',
		nome: 'Mandara no Jin',
		traducao: 'Formação das Dez Mil Serpentes',
		dano: [3, 8],
		alcance: 'longo',
		area: 'cone-grande',
		descricao: 'Serpentes sem fim saem da boca do ninja e formam uma muralha viva que caça o inimigo. Contra tantas, defender e desviar não adianta.',
		efeito: '3d8 de dano em todos na área (metade com sucesso na Resistência).',
		notas: ['Exige um contrato com as serpentes (cap. 14).']
	},
	{
		...ninjutsu,
		wiki: 'Hair Needle Senbon',
		nome: 'Kebari Senbon',
		traducao: 'Mil Agulhas de Cabelo',
		dano: [2, 6, 2],
		alcance: 'medio',
		area: 'cone',
		descricao: 'O cabelo do ninja endurece e sai disparado numa chuva de agulhas.',
		efeito: '2d6+2 de dano perfurante em todos no cone (metade com sucesso na Resistência).'
	},
	{
		...ninjutsu,
		wiki: "Wild Lion's Mane Technique",
		rankWiki: 'B',
		nome: 'Ranjishigami no Jutsu',
		traducao: 'Técnica da Juba do Leão Selvagem',
		alcance: 'medio',
		comp: { imobiliza: 1, barreira: 2, sustentado: 1 },
		descricao: 'O cabelo do ninja cresce, endurece como aço e serve ao mesmo tempo de corda para prender e de escudo.',
		efeito: 'O alvo fica Imobilizado pelo cabelo até vencer a Resistência, e enquanto o usuário mantiver a técnica o cabelo o protege como uma barreira de 20 PV.'
	},
	{
		...ninjutsu,
		wiki: 'Ultra-Big Ball Rasengan',
		nome: 'Chōōdama Rasengan',
		traducao: 'Rasengan de Bola Supergrande',
		dano: [8, 8],
		area: 'esfera3',
		comp: { empurra: 1, ignora: 1, exige: 1 },
		descricao: 'Um Rasengan gigantesco, criado num instante. O impacto solta uma onda de choque que arremessa tudo em volta.',
		efeito: '8d8 de dano em todos num raio de 3 m do impacto (metade com sucesso na Resistência), que ignora RD. Quem falha é arremessado 5 m e cai.',
		notas: ['Exige saber o Ōdama Rasengan.']
	},
	{
		...ninjutsu,
		wiki: 'Fission Technique',
		rankWiki: 'A',
		nome: 'Bunretsu no Jutsu',
		traducao: 'Técnica de Divisão',
		comp: { invocacao: 8, 'acao-extra': 1, sustentado: 1, 'sem-selos': 1, 'nao-copia': 1 },
		descricao: 'Não é um clone: o ninja divide o próprio corpo em dois, e cada metade é ele de verdade, com vontade e jutsus próprios.',
		efeito: 'O usuário se divide em dois corpos, cada um com metade dos PV e dos PC que ele tinha, e ganha uma ação secundária extra no próximo turno. Os dois se juntam de novo quando ele quiser.'
	},
	{
		...ninjutsu,
		wiki: 'Heavenly Transfer Technique',
		nome: 'Tensō no Jutsu',
		traducao: 'Técnica de Transferência Celestial',
		alcance: 'distante',
		alvosExtras: 2,
		info: { alcance: 'Qualquer lugar que o usuário conheça' },
		descricao: 'O ninja envolve um objeto ou uma pessoa em luz e o manda, na velocidade da luz, para onde quiser.',
		efeito: 'Transporta até 3 objetos ou criaturas voluntárias tocadas para um lugar que o usuário conheça, a qualquer distância.'
	},
	{
		...senjutsu,
		wiki: 'Sage Art: Frog Call',
		nome: 'Senpō: Kawazu Naki',
		traducao: 'Arte Eremita: Lamento do Sapo',
		alcance: 'medio',
		area: 'cone-grande',
		comp: { paralisa: 1, exige: 1 },
		info: { resistencia: 'VIG (DT do Jutsu) contra a paralisia' },
		descricao: 'Dois sábios concentram a energia natural na garganta e coaxam juntos. A onda de som é tão forte que trava quem a escuta.',
		efeito: 'Quem estiver na área e falhar na Resistência fica Paralisado por 1 turno.',
		notas: ['Exige dois usuários em Modo Sennin coaxando juntos.']
	},
	{
		...senjutsu,
		elemento: 'katon',
		wiki: 'Sage Art: Goemon',
		nome: 'Senpō: Goemon',
		traducao: 'Arte Sábia: Goemon',
		dano: [6, 8],
		alcance: 'longo',
		area: 'cone-grande',
		comp: { continuo: 1, 'dois-elementos': 1, exige: 1 },
		descricao: 'Três técnicas numa: um cospe óleo, outro cospe fogo e o terceiro sopra vento. O óleo fervente vira um mar de fogo que não se apaga.',
		efeito: '6d8 de dano de fogo em todos na área (metade com sucesso na Resistência). Quem falha continua queimando, com o dano contínuo.',
		notas: ['Exige três usuários (óleo, Katon e Fuuton), ao menos um em Modo Sennin, gastando a ação no mesmo turno e dividindo o custo.']
	},
	{
		...senjutsu,
		elemento: 'fuuton',
		wiki: 'Sage Art: Wind Release Dust Cloud',
		nome: 'Senpō: Fūton Sunabokori',
		traducao: 'Arte Sábia: Nuvem de Poeira da Liberação de Vento',
		alcance: 'medio',
		area: 'cone-enorme',
		comp: { cega: 1, exige: 1 },
		descricao: 'O sábio solta da boca uma nuvem de poeira tão densa que esconde até um sapo gigante e não deixa ninguém enxergar.',
		efeito: 'Quem estiver na área e falhar na Resistência fica Cego por 1 turno.',
		notas: [SENNIN]
	},
	{
		...senjutsu,
		tipo: 'Taijutsu',
		wiki: 'Frog Strike',
		rankWiki: 'C',
		nome: 'Kawazu Tataki',
		traducao: 'Golpe do Sapo',
		dano: [3, 8],
		comp: { ignora: 1, exige: 1 },
		descricao: 'No meio do Kata do Sapo, o ninja dá um tapa de mão aberta, e ondas de energia natural atravessam o alvo por dentro.',
		efeito: '3d8 + FOR de dano interno, que ignora RD.',
		notas: [SENNIN]
	},
	{
		...mokuton,
		wiki: 'Wood Release: Transformation',
		nome: 'Mokuton: Henge',
		traducao: 'Estilo Madeira: Transformação',
		alcance: 'pessoal',
		comp: { rd2: 1, sustentado: 1 },
		descricao: 'A madeira cobre o corpo do ninja e assume outra forma, uma árvore, um objeto ou outra pessoa. Ao contrário do Henge comum, o disfarce é sólido.',
		efeito: 'O usuário assume a forma escolhida enquanto mantiver a técnica e tem RD 2 por 3 turnos, coberto de madeira.'
	},
	{
		...mokuton,
		wiki: 'Wood Release: Smothering Binding Technique',
		nome: 'Mokuton: Mokusatsu Shibari no Jutsu',
		traducao: 'Estilo Madeira: Técnica do Laço Estrangulador',
		alcance: 'medio',
		comp: { imobiliza: 1, sustentado: 1 },
		descricao: 'O braço do ninja vira uma árvore, e os galhos crescem em volta do alvo até prendê-lo por inteiro. Seguram até uma lula gigante.',
		efeito: 'O alvo fica Imobilizado nos galhos enquanto o usuário mantiver a técnica e o alvo não vencer a Resistência.'
	},
	{
		...mokuton,
		wiki: 'Wood Release: Hōbi Technique',
		nome: 'Mokuton: Hōbi no Jutsu',
		traducao: 'Estilo Madeira: Técnica Hōbi',
		comp: { barreira: 5, drena: 1 },
		acao: 'reacao',
		descricao: 'Uma cúpula de madeira em forma de cabeça de dragão se fecha em volta do ninja e suga a força dos ataques que batem nela.',
		efeito: 'Absorve até 50 de dano de um jutsu contra o usuário, e o lançador perde 1d6 PC, sugados pela madeira.'
	},
	{
		...mokuton,
		wiki: 'Wood Release: Hotei Technique',
		nome: 'Mokuton: Hotei no Jutsu',
		traducao: 'Estilo Madeira: Técnica Hotei',
		alcance: 'longo',
		area: 'esfera6',
		comp: { imobiliza: 1, sela: 1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'Mãos de madeira do tamanho de uma Besta com Cauda saem do chão e se fecham em volta do inimigo.',
		efeito: 'Quem estiver na área fica Imobilizado nas mãos, sem lançar jutsus, até vencer a Resistência de FOR ao fim do turno.'
	},
	{
		...mokuton,
		wiki: 'Transmission Wood',
		nome: 'Sōshinki',
		traducao: 'Transmissão de Madeira',
		alcance: 'distante',
		comp: { sustentado: 1, preparo: -1 },
		info: { alcance: 'Qualquer distância', ataque: 'Automático' },
		descricao: 'Um clone de madeira vira uma semente, plantada no alvo ou engolida por ele. A partir daí, a semente avisa o ninja de onde ele está.',
		efeito: 'Enquanto a semente estiver com o alvo, o usuário sabe onde ele está, a qualquer distância. Só o usuário sente a semente.',
		notas: ['Preparar a semente leva um turno completo, a partir de um Moku Bunshin.']
	},
	{
		...mokuton,
		wiki: 'Sage Art Wood Release: True Several Thousand Hands',
		nome: 'Senpō Mokuton: Shin Sūsenju',
		traducao: 'As Verdadeiras Mil Mãos',
		dano: [8, 10],
		alcance: 'longo',
		area: 'esfera15',
		comp: { invocacao: 8, exige: 1 },
		descricao: 'Em Modo Sennin, o ninja ergue uma estátua de madeira titânica, com milhares de mãos, e luta de cima da cabeça dela.',
		efeito: '8d10 de dano em todos na área (metade com sucesso na Resistência), sob a chuva de mãos. A estátua continua em campo até o fim da cena e pode repetir o golpe a cada turno, pelo custo de manutenção.',
		notas: [SENNIN]
	}
];
