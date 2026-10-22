// Onda 2 · Fuuinjutsu e barreiras, Ninjutsu Médico e Genjutsu
import { CAP10, TIPOS } from '../base.mjs';

const selo = { origem: 'Fuuinjutsu', tipo: 'Fuuinjutsu', ...TIPOS };
const medico = { origem: 'Ninjutsu Médico', tipo: 'Ninjutsu', ...CAP10.medico };
const genjutsu = { origem: 'Genjutsu', tipo: 'Genjutsu', ...CAP10.genjutsu };

export default [
	{
		...selo,
		wiki: 'Chakra Control: Bind',
		nome: 'Chakura Kontorōru: Baku',
		traducao: 'Controle de Chakra: Amarra',
		alcance: 'curto',
		comp: { imobiliza: 1, preparo: -1 },
		info: { resistencia: 'FOR (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O ninja marca uma pessoa com um selo. Quando ela chega perto de uma etiqueta preparada, fios vermelhos de chakra saem do papel e a amarram no lugar, por horas se for preciso.',
		efeito: 'O alvo marcado fica Imobilizado pelos fios quando chega a até 10 m da etiqueta, até vencer a Resistência de FOR ao fim de um turno.',
		notas: ['Marcar o alvo e preparar a etiqueta leva um turno completo.']
	},
	{
		...selo,
		wiki: 'Evil Releasing Method',
		nome: 'Kaija Hōin',
		traducao: 'Método de Liberação do Mal',
		comp: { remove: 1, preparo: -1 },
		descricao: 'O contrário do Método de Selamento do Mal: em vez de selar, o ninja desfaz um selo posto por outro jutsu no corpo de alguém.',
		efeito: 'Remove de um aliado tocado uma condição causada por um selo (como um chakra selado ou uma marca imposta por outro jutsu).',
		notas: ['O ritual leva um turno completo.']
	},
	{
		...selo,
		wiki: 'String Light Formation',
		nome: 'Isshi Tōjin',
		traducao: 'Formação da Luz do Fio',
		alcance: 'curto',
		area: 'esfera3',
		comp: { barreira: 3, preparo: -1 },
		descricao: 'Uma barreira que nasce do chão, sob os pés do alvo, e não deixa ninguém sair de dentro dela. É simples, mas muito difícil de romper.',
		efeito: 'Quem estiver na área fica preso dentro da barreira, que tem 30 PV. Enquanto ela estiver de pé, ninguém sai.'
	},
	{
		...selo,
		wiki: 'Self-Repairing Barrier',
		nome: 'Saisei Kekkai',
		traducao: 'Barreira que se Regenera',
		alcance: 'curto',
		area: 'esfera15',
		comp: { barreira: 5, sustentado: 1, exige: 1 },
		descricao: 'Um grupo de ninjas liga o chakra numa barreira só. Quando ela racha, o chakra deles a fecha de novo.',
		efeito: 'Cria uma barreira com 50 PV em volta da área. Enquanto os usuários a mantiverem, ela recupera 10 PV no começo de cada turno deles.',
		notas: ['Exige três ou mais usuários que saibam a técnica, dividindo o custo e a manutenção.']
	},
	{
		...selo,
		origem: 'Kirigakure',
		wiki: 'Barrier Talisman: Armoured Eye',
		nome: 'Kekkaifu: Gansōkō',
		traducao: 'Talismã de Barreira: Olho Blindado',
		comp: { barreira: 3, 'nao-copia': 1 },
		acao: 'reacao',
		descricao: 'Um selo criado pelos caçadores de Kirigakure para proteger uma parte do corpo, em geral um olho. Quando alguém mira ali, a barreira se ativa sozinha.',
		efeito: 'Absorve até 30 do dano de um ataque ou jutsu que mire a parte protegida do corpo. Só os caçadores de Kiri sabem desfazer o selo.'
	},
	{
		...selo,
		wiki: 'Cursed Tongue Eradication Seal',
		nome: 'Zekka Konzetsu no In',
		traducao: 'Selo de Erradicação da Língua Amaldiçoada',
		comp: { paralisa: 1, turnos: 3, 'nao-copia': 1, preparo: -2, rara: 1 },
		descricao: 'Um selo gravado na língua de cada membro de uma unidade secreta. Quem tenta contar os segredos dela trava por inteiro, incapaz de falar ou de se mexer.',
		efeito: 'Quando o marcado tenta revelar o segredo protegido, fica Paralisado por até 4 turnos, sem Resistência.',
		notas: ['Gravar o selo leva tempo e o consentimento (ou a rendição) do marcado.']
	},
	{
		...selo,
		wiki: 'Self-Cursing Seal',
		nome: 'Jigō Jubaku no In',
		traducao: 'Selo da Prisão da Própria Maldição',
		comp: { paralisa: 1, turnos: 3 },
		acao: 'secundaria',
		info: { resistencia: 'VIG (DT do Jutsu) contra a paralisia' },
		descricao: 'O ninja deixa um selo escondido no corpo do inimigo durante a luta. Quando o ativa, as marcas se espalham pela pele e travam o corpo inteiro.',
		efeito: 'Se falhar na Resistência, o alvo tocado fica Paralisado por até 4 turnos, com as marcas do selo espalhadas pelo corpo.'
	},
	{
		...medico,
		wiki: 'Yin Healing Wound Destruction',
		rankWiki: 'A',
		nome: "In'yu Shōmetsu",
		traducao: 'Destruição das Feridas pela Cura Yin',
		cura: [5, 10],
		alcance: 'pessoal',
		comp: { 'sem-selos': 1 },
		acao: 'reacao',
		descricao: 'O médico lê o movimento do inimigo, adivinha onde vai ser atingido e junta chakra ali antes do golpe. A ferida se fecha quase ao mesmo tempo em que abre.',
		efeito: 'Como reação a um ataque que o acerta, o usuário recupera 5d10 PV.'
	},
	{
		...medico,
		elemento: 'doton',
		wiki: 'Concealment',
		nome: 'Senpuku',
		traducao: 'Emboscada Subterrânea',
		dano: [2, 6],
		alcance: 'curto',
		comp: { ignora: 1, empurra: 1, exige: 1 },
		descricao: 'O médico some debaixo da terra e sai aos pés do alvo, cortando os tendões dele com o bisturi de chakra.',
		efeito: '2d6 de dano interno, que ignora RD, e o alvo cai com as pernas cortadas.',
		notas: ['Exige saber o Chakra no Mesu.']
	},
	{
		...genjutsu,
		elemento: 'raiton',
		wiki: 'Lightning Release: Lightning Illusion Flash of Lightning Pillar',
		nome: 'Raiton: Raigen Raikōchū',
		traducao: 'Ilusão de Raio: Pilar do Clarão',
		alcance: 'pessoal',
		area: 'esfera6',
		comp: { cega: 1, turnos: 1 },
		descricao: 'O ninja descarrega raio pelo corpo inteiro num clarão tão forte que cega quem olha. O clarão é real; a cegueira que fica depois, não.',
		efeito: 'Quem estiver na área e falhar na Resistência fica Cego por 2 turnos.'
	},
	{
		...genjutsu,
		wiki: 'Ephemeral',
		nome: 'Utakata',
		traducao: 'Efêmero',
		comp: { paralisa: 1, turnos: 2 },
		descricao: 'Com um toque do dedo, o ninja prende o alvo numa ilusão em que corvos voam em volta dele e viram shuriken.',
		efeito: 'Se falhar na Resistência, o alvo tocado fica Paralisado por até 3 turnos, preso na ilusão.'
	},
	{
		...genjutsu,
		wiki: 'Demonic Illusion: Toad Confrontation Chant',
		nome: 'Magen: Gama Rinshō',
		traducao: 'Ilusão Demoníaca: Canto do Confronto dos Sapos',
		alcance: 'longo',
		area: 'esfera6',
		comp: { controla: 1, turnos: 3, exige: 1, preparo: -1 },
		info: { resistencia: 'ESP (DT do Jutsu) ao fim de cada turno' },
		descricao: 'O genjutsu mais forte dos sapos do Monte Myōboku: uma canção cantada por dois sábios, que prende quem a escuta num mundo de ilusão.',
		efeito: 'Quem estiver na área e falhar na Resistência fica Controlado por até 4 turnos, preso na ilusão. Ao fim de cada turno, pode tentar se libertar com uma Resistência de ESP.',
		notas: ['Exige dois cantores em Modo Sennin, sapos sábios ou Sennin dos sapos, e um turno de preparo.']
	}
];
