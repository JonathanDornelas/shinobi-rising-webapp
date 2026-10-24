// Onda 2 · Areia da Linhagem Sabaku e jutsus dos clãs (Nara, Hyuuga, Hōzuki, Uzumaki, Yamanaka, Akimichi)
import { cla } from '../base.mjs';

const areia = { origem: 'Linhagem Sabaku', tipo: 'Ninjutsu', ...cla('sabaku') };

export default [
	{
		...areia,
		wiki: 'Air Sand Protective Wall',
		nome: 'Kūsa Bōheki',
		traducao: 'Muro Defensivo de Areia Aérea',
		alcance: 'medio',
		comp: { barreira: 6 },
		acao: 'reacao',
		descricao: 'Um escudo gigante de areia sobe do chão e fica suspenso no ar, entre o ninja e o ataque que vem de cima.',
		efeito: 'Absorve até 60 de dano de um ataque ou jutsu contra o usuário ou um aliado a até 30 m.'
	},
	{
		...areia,
		wiki: 'Armour of Sand',
		nome: 'Suna no Yoroi',
		traducao: 'Armadura de Areia',
		alcance: 'pessoal',
		comp: { rd2: 1, buff2: 1, sustentado: 1 },
		descricao: 'Uma camada fina de areia cobre o corpo como uma segunda pele. É a última defesa, para o que passa pelo escudo.',
		efeito: 'Enquanto mantém a armadura, o usuário tem +2 de Defesa, e RD 2 por 3 turnos.'
	},
	{
		...areia,
		wiki: 'Desert Suspension',
		nome: 'Sabaku Fuyū',
		traducao: 'Flutuação de Areia',
		alcance: 'toque',
		comp: { buff1: 1, 'buff-aliado': 1, sustentado: 1 },
		descricao: 'O ninja junta areia sob os pés numa plataforma e voa sobre ela, longe do alcance de quem luta no chão.',
		efeito: 'Enquanto mantém a técnica, o usuário voa sobre a plataforma no deslocamento normal e tem +1 de Defesa. Um aliado tocado pode ir junto, com +1 de Defesa por 3 turnos.'
	},
	{
		...areia,
		wiki: 'Desert: Hand',
		nome: 'Sabaku: Hando',
		traducao: 'Deserto: Mão',
		dano: [3, 8],
		alcance: 'medio',
		comp: { imobiliza: 1 },
		descricao: 'A areia vira uma mão gigante, com garras, que agarra o alvo e aperta.',
		efeito: '3d8 de dano, e o alvo fica Imobilizado na mão de areia até vencer a Resistência.'
	},
	{
		...areia,
		wiki: 'Desert Wave',
		nome: 'Sabakuha',
		traducao: 'Onda do Deserto',
		comp: { barreira: 4 },
		acao: 'reacao',
		descricao: 'A areia sobe numa parede curva na frente do ninja e para o golpe ou fecha o caminho do inimigo.',
		efeito: 'Absorve até 40 de dano de um ataque ou jutsu. A parede fica de pé até o fim da rodada.'
	},
	{
		...areia,
		wiki: 'Monstrous Sand Arm',
		nome: 'Suna no Kaiwan',
		traducao: 'Braço Monstruoso de Areia',
		dano: [4, 8],
		alcance: 'longo',
		comp: { imobiliza: 1 },
		descricao: 'Uma quantidade enorme de areia toma a forma de um braço monstruoso, que se estica longe para agarrar e esmagar.',
		efeito: '4d8 de dano, e o alvo fica Imobilizado no braço até vencer a Resistência.'
	},
	{
		...areia,
		wiki: 'Prison Sand Burial',
		nome: 'Gokusa Maisō',
		traducao: 'Enterro da Prisão de Areia',
		dano: [3, 8],
		alcance: 'medio',
		comp: { imobiliza: 1, sela: 1 },
		descricao: 'O chão se abre e a areia puxa o alvo para baixo, tão fundo e tão rápido que ele não tem tempo de reagir.',
		efeito: '3d8 de dano, e o alvo fica Imobilizado debaixo da areia, sem lançar jutsus, até vencer a Resistência.'
	},
	{
		...areia,
		wiki: 'Sand Drizzle',
		nome: 'Suna Shigure',
		traducao: 'Garoa de Areia',
		dano: [2, 6],
		alcance: 'longo',
		comp: { persegue: 1 },
		descricao: 'Bolinhas de areia se formam no alto e caem como chuva, guiadas pelo chakra até as costas do alvo.',
		efeito: '2d6 de dano. A areia persegue o alvo e acerta automaticamente, a não ser que ele use a Esquiva Ativa ou o Kawarimi.'
	},
	{
		...areia,
		wiki: 'Sand Hail',
		nome: 'Suna Arare',
		traducao: 'Granizo de Areia',
		dano: [4, 8],
		alcance: 'longo',
		area: 'esfera6',
		descricao: 'A versão grande da Garoa: blocos de areia do tamanho de pedras caem do céu sobre uma área inteira.',
		efeito: '4d8 de dano em todos na área (metade com sucesso na Resistência).'
	},
	{
		...areia,
		wiki: 'Sand Clone',
		nome: 'Suna Bunshin',
		traducao: 'Clone de Areia',
		comp: { invocacao: 5 },
		descricao: 'Um clone feito de areia, que luta no lugar do ninja. Ninguém o confunde com o original, mas ele aguenta o golpe que seria do dono.',
		efeito: 'Cria um clone de areia que segue as regras do Kage Bunshin no Jutsu (1 PV, a sua Defesa e os seus valores).'
	},
	{
		...areia,
		wiki: 'Concealed Sand Picture Cat',
		nome: 'Sensa Kaibyō',
		traducao: 'Imagem do Gato Escondido na Areia',
		alcance: 'longo',
		comp: { sustentado: 1 },
		info: { area: 'Esfera de 60 m em volta do usuário', ataque: 'Automático' },
		descricao: 'O ninja espalha areia com chakra pelo lugar e sente cada passo dado sobre ela.',
		efeito: 'Enquanto mantém a técnica, o usuário sabe a posição de toda criatura que se move sobre a areia num raio de 60 m.'
	},
	{
		origem: 'Clã Nara',
		tipo: 'Ninjutsu',
		...cla('nara'),
		wiki: 'Shadow Imitation Shadow Bind Technique',
		nome: 'Kagemane Kage Shibari no Jutsu',
		traducao: 'Técnica de Contenção da Sombra pela Imitação da Sombra',
		alcance: 'medio',
		comp: { 'buff-aliado': 1, sustentado: 1 },
		descricao: 'O Nara prende a sombra à de um aliado sem limitar os movimentos dele. A partir daí, o aliado vira um ponto de partida para as sombras do Nara.',
		efeito: 'Enquanto mantém a técnica, o aliado ganha +1 de Defesa por 3 turnos, e o alcance dos jutsus de sombra do usuário passa a contar também a partir dele.'
	},
	{
		origem: 'Clã Hyuuga',
		tipo: 'Taijutsu',
		...cla('hyuuga'),
		wiki: 'Gentle Fist Art One Blow Body',
		nome: 'Jūkenhō Ichigekishin',
		traducao: 'Estilo do Punho Suave: Impacto Corporal',
		dano: [3, 8],
		alcance: 'curto',
		comp: { empurra: 1 },
		descricao: 'O Hyuuga solta chakra por todos os pontos de tenketsu de uma vez, num golpe que joga o alvo longe.',
		efeito: '3d8 + FOR de dano, e o alvo é jogado 5 m.'
	},
	{
		origem: 'Clã Hozuki',
		tipo: 'Ninjutsu',
		elemento: 'suiton',
		...cla('hozuki'),
		wiki: 'Water Gun: Two Guns',
		nome: 'Mizudeppō: Nichō',
		traducao: 'Pistola de Água: Duas Pistolas',
		dano: [3, 8],
		alcance: 'curto',
		alvosExtras: 1,
		comp: { exige: 1 },
		descricao: 'A versão com as duas mãos da Pistola de Água: dois tiros de água ao mesmo tempo, fortes o bastante para furar pedra.',
		efeito: '3d8 de dano perfurante em até 2 alvos, com uma rolagem por alvo.',
		notas: ['Exige saber o Mizudeppō no Jutsu.']
	},
	{
		origem: 'Clã Uzumaki',
		tipo: 'Ninjutsu',
		...cla('uzumaki'),
		wiki: "Mind's Eye of the Kagura",
		nome: 'Kagura Shingan',
		traducao: 'Olho da Mente de Kagura',
		alcance: 'distante',
		comp: { sustentado: 1, 'sem-selos': 1 },
		info: { area: 'Esfera de vários quilômetros', ataque: 'Automático' },
		descricao: 'Uma percepção de chakra tão fina que distingue pessoas a quilômetros, sente mentiras na respiração e acha quem se esconde atrás de qualquer disfarce.',
		efeito: 'Enquanto mantém a técnica, o usuário sente e reconhece o chakra de toda criatura a até alguns quilômetros, inclusive disfarçada pelo Henge ou invisível.'
	},
	{
		origem: 'Clã Uzumaki',
		tipo: 'Fuuinjutsu',
		...cla('uzumaki'),
		wiki: 'Tight Binding Golden Chain Technique',
		nome: 'Kinbaku Kingusari no Jutsu',
		traducao: 'Técnica das Correntes Douradas que Amarram',
		dano: [2, 6],
		alcance: 'medio',
		comp: { imobiliza: 1, sela: 1 },
		descricao: 'Correntes douradas de chakra saem do corpo do Uzumaki, acertam o alvo e se enrolam nele.',
		efeito: '2d6 de dano; o alvo fica Imobilizado nas correntes até vencer a Resistência e, enquanto preso, não lança jutsus.'
	},
	{
		origem: 'Clã Yamanaka',
		tipo: 'Ninjutsu',
		...cla('yamanaka'),
		wiki: 'Mind Puppet Switch Cursed Seal Technique',
		nome: 'Shinten Kugutsu Juin no Jutsu',
		traducao: 'Técnica de Transferência da Mente por um Boneco Amaldiçoado',
		alcance: 'medio',
		comp: { controla: 1, turnos: 2, preparo: -2, rara: 1 },
		info: { resistencia: 'ESP (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O Yamanaka deixa uma marionete no caminho do inimigo e passa a mente para ela. Quando o inimigo destrói a marionete, a mente do Yamanaka pula para dentro dele.',
		efeito: 'Quem destruir a marionete fica Controlado pelo usuário por até 3 turnos. Ao fim de cada turno, pode tentar se libertar com uma Resistência de ESP.',
		notas: ['A marionete precisa ser preparada antes, no caminho por onde o alvo vai passar.']
	},
	{
		origem: 'Clã Akimichi',
		tipo: 'Taijutsu',
		...cla('akimichi'),
		wiki: 'Double Human Bullet Tank',
		nome: 'Daburu Nikudan Sensha',
		traducao: 'Tanque de Bala Humana Duplo',
		dano: [6, 8],
		comp: { atordoa: 1, exige: 1 },
		descricao: 'Dois Akimichi viram bolas gigantes e rolam um contra o outro, com o inimigo no meio.',
		efeito: '6d8 + FOR de dano; se falhar na Resistência, o alvo fica Atordoado.',
		notas: ['Exige dois Akimichi que saibam o Nikudan Sensha, gastando a ação primária no mesmo turno.']
	}
];
