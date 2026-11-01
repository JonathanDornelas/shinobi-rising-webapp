// Kekkei Genkai em jogo (cap. 8, Ativar e Manter uma Kekkei Genkai, e os verbetes dos clãs): a KKG custa PC só por turno.
// Em combate, cada turno do personagem com ela ligada custa o valor dela (a Mesa cobra na vez dele); fora de combate,
// ativar cobra o custo de um turno, uma vez. O Sharingan custa mais a cada estágio de tomoe (3, 5 e 6 PC por turno),
// escolhido na ficha (o despertar é narrativo). Cada marco alcançado tira 1 PC por turno, com mínimo de 1 (Tenketsu no
// Kiwami, Byakugan Kanzen, Sharingan Desenvolvido, Olhos que Leem o Combate, Maestria da Hidratação). Clã criado com KKG: o custo vem da
// limitação comprada (5 ou 10 PC por turno); sem ela, a KKG fica sempre ativa e não tem botão.
import { BENEFICIOS_KKG, TIPOS_KKG } from '#lib/clas/dados.ts';
import type { ClaDados } from '#lib/clas/regras.ts';
import type { LinhaPericia } from './regras.ts';

export interface EstagioKkg {
	rotulo: string;
	/** PC por turno neste estágio. */
	custo: number;
	efeitos: string[];
	pericias: Record<string, number>;
	defesa: number;
}
export interface DefKkg {
	nome: string;
	tipo: string;
	icone: string;
	/** Cor da linhagem, para o cartão ativo. */
	cor: string;
	/** PC por turno (e uma vez, ao ativar fora de combate); 0 com `sempre`: a KKG não se ativa (fica ligada). Com estágios, vale o custo do estágio. */
	custo: number;
	sempre?: boolean;
	/** Marcos que tiram 1 PC por turno cada um. */
	reducoes: { nivel: number; nome: string }[];
	efeitos: string[];
	/** Ganhos que chegam com um marco (Hone no Yoroi, Suna no Yoroi). */
	extras: { nivel: number; texto: string }[];
	pericias: Record<string, number>;
	defesa: number;
	estagios?: EstagioKkg[];
}
/** O que a ficha guarda (estado.kkg). Estágio 0 = Sharingan ainda não despertou. */
export interface EstadoKkg {
	ativa?: boolean;
	estagio?: number;
	/** (antigo) cena da Mesa em que o custo foi pago; não cobra mais por cena. */
	cena?: string | null;
}

const OFICIAIS: Record<string, DefKkg> = {
	hyuuga: {
		nome: 'Byakugan',
		tipo: 'Dōjutsu',
		icone: 'kkg/ic-kkg-dojutsu',
		cor: '#B9B2E0',
		custo: 3,
		reducoes: [
			{ nivel: 8, nome: 'Tenketsu no Kiwami' },
			{ nivel: 13, nome: 'Byakugan Kanzen' }
		],
		efeitos: [
			'+5 em Percepção',
			'Visão de quase 360° até 50 m, através de objetos finos (até 30 cm)',
			'Vê o chakra: sabe o tipo e o elemento de um jutsu antes do efeito (vantagem em Esquiva Ativa e Kawarimi contra ele)',
			'Vantagem em Resistências contra Genjutsu'
		],
		extras: [{ nivel: 13, texto: 'Alcance de 2 km (5 km concentrando-se) e vê através de paredes de até 1 m' }],
		pericias: { percepcao: 5 },
		defesa: 0
	},
	uchiha: {
		nome: 'Sharingan',
		tipo: 'Dōjutsu',
		icone: 'kkg/ic-kkg-dojutsu',
		cor: '#D8342C',
		custo: 3,
		reducoes: [
			{ nivel: 8, nome: 'Sharingan Desenvolvido' },
			{ nivel: 13, nome: 'Olhos que Leem o Combate' }
		],
		efeitos: [],
		extras: [
			{ nivel: 8, texto: '+2 nos testes de cópia' },
			{ nivel: 13, texto: 'Copia jutsus de Rank B' }
		],
		pericias: {},
		defesa: 0,
		estagios: [
			{ rotulo: '1 tomoe', custo: 3, efeitos: ['+1 em Percepção', '+1 na Defesa'], pericias: { percepcao: 1 }, defesa: 1 },
			{ rotulo: '2 tomoe', custo: 5, efeitos: ['+2 em Percepção', '+1 na Defesa', '+1 de dano em jutsus'], pericias: { percepcao: 2 }, defesa: 1 },
			{ rotulo: '3 tomoe', custo: 6, efeitos: ['+3 em Percepção', '+2 na Defesa', 'Copia jutsus de Rank C ou menor'], pericias: { percepcao: 3 }, defesa: 2 }
		]
	},
	kaguya: {
		nome: 'Shikotsumyaku',
		tipo: 'Corporal',
		icone: 'kkg/ic-kkg-corporal',
		cor: '#E6D2BF',
		custo: 5,
		reducoes: [],
		efeitos: ['Dano desarmado 1d8 (lâminas e pontas de osso), ignorando 2 de RD', 'Armas naturais de osso, sem precisar carregá-las', 'Libera as Danças do clã'],
		extras: [{ nivel: 8, texto: 'RD 3 contra dano físico (Hone no Yoroi)' }],
		pericias: {},
		defesa: 0
	},
	hozuki: {
		nome: 'Suika · forma líquida',
		tipo: 'Corporal',
		icone: 'kkg/ic-kkg-corporal',
		cor: '#4F8FE0',
		custo: 10,
		reducoes: [{ nivel: 13, nome: 'Maestria da Hidratação' }],
		efeitos: ['RD 5 contra dano físico', 'Escapa automaticamente de prisões físicas', 'Raiton causa dano dobrado no estado líquido'],
		extras: [{ nivel: 13, texto: 'Uma vez por cena, entra na forma líquida como Reação, sem custo' }],
		pericias: {},
		defesa: 0
	},
	sabaku: {
		nome: 'Areia Magnética',
		tipo: 'Combinação',
		icone: 'kkg/ic-kkg-combinacao',
		cor: '#C9A35E',
		custo: 3,
		reducoes: [],
		efeitos: ['A areia é uma arma natural: 1d8 de dano, alcance 10 m, rolagem de Ninjutsu', 'Libera as técnicas do clã'],
		extras: [{ nivel: 8, texto: 'RD 3 (Suna no Yoroi)' }],
		pericias: {},
		defesa: 0
	},
	yuki: {
		nome: 'Hyōton',
		tipo: 'Combinação',
		icone: 'kkg/ic-kkg-combinacao',
		cor: '#8FD8EA',
		custo: 6,
		reducoes: [],
		efeitos: ['Libera os jutsus de gelo; depois de ativo, eles têm o custo normal'],
		extras: [],
		pericias: {},
		defesa: 0
	}
};

/** A KKG do clã da ficha: a oficial pelo slug, ou a de um clã criado pelos dados dele. */
export function defKkg(claSlug: string | null | undefined, criado?: ClaDados | null): DefKkg | null {
	if (criado) {
		if (!criado.kkg) return null;
		const k = criado.kekkei;
		const lim = k.limitacoes.map((l) => l.id);
		const custo = lim.includes('custo-10') ? 10 : lim.includes('custo-5') ? 5 : 0;
		const tipo = TIPOS_KKG.find((t) => t.id === k.tipo);
		return {
			nome: k.nome.trim() || 'Kekkei Genkai',
			tipo: tipo?.nome ?? 'Kekkei Genkai',
			icone: `kkg/ic-kkg-${k.tipo ?? 'hibrido'}`,
			cor: '#D29A1E',
			custo,
			sempre: custo === 0,
			reducoes: [],
			efeitos: k.beneficios.map((b) => {
				const def = BENEFICIOS_KKG.find((x) => x.id === b.id);
				return def ? (b.detalhe.trim() ? `${def.nome}: ${b.detalhe.trim()}` : def.nome) : b.id;
			}),
			extras: [],
			pericias: {},
			defesa: 0
		};
	}
	return claSlug ? (OFICIAIS[claSlug] ?? null) : null;
}

/** O custo por turno no nível e no estágio da ficha, com os marcos que o reduziram (−1 cada, mínimo 1). */
export function custoKkg(def: DefKkg, nivel: number, estagio = 1): { custo: number; reducao: string | null } {
	if (def.sempre) return { custo: 0, reducao: null };
	const base = def.estagios ? def.estagios[Math.max(1, Math.min(def.estagios.length, estagio)) - 1].custo : def.custo;
	const marcos = def.reducoes.filter((x) => nivel >= x.nivel);
	return { custo: Math.max(1, base - marcos.length), reducao: marcos.length ? marcos.map((m) => m.nome).join(' e ') : null };
}

/** O que a KKG dá agora: textos, bônus em perícias e na Defesa (Sharingan pelo estágio). */
export function efeitoKkg(def: DefKkg, nivel: number, estagio = 1) {
	const e = def.estagios ? def.estagios[Math.max(1, Math.min(def.estagios.length, estagio)) - 1] : null;
	return {
		textos: [...(e?.efeitos ?? def.efeitos), ...def.extras.filter((x) => nivel >= x.nivel).map((x) => x.texto)],
		pericias: e?.pericias ?? def.pericias,
		defesa: e?.defesa ?? def.defesa
	};
}

/**
 * Quem cai (PV 0 ou menos) solta o chakra: a KKG ativa se apaga, e para voltar paga de novo (cap. 4, Estados de Vida).
 * Devolve a KKG desligada, ou null quando nada muda (de pé, ou já desligada).
 */
export function apagarAoCair(estado: { pv?: number; kkg?: EstadoKkg }): EstadoKkg | null {
	if ((estado.pv ?? 1) > 0 || !estado.kkg?.ativa) return null;
	return { ...estado.kkg, ativa: false, cena: null };
}

/** A KKG está valendo? (ativa, ou sempre ligada; o Sharingan precisa ter despertado). */
export function kkgLigada(def: DefKkg | null, estado: EstadoKkg | undefined): boolean {
	if (!def) return false;
	if (def.estagios && (estado?.estagio ?? 1) < 1) return false;
	return !!def.sempre || !!estado?.ativa;
}

/** As perícias com o bônus da KKG ligada (Percepção do Byakugan e do Sharingan), como um bônus a mais na linha. */
export function periciasComKkg(linhas: LinhaPericia[], def: DefKkg | null, estado: EstadoKkg | undefined, nivel: number): LinhaPericia[] {
	if (!def || !kkgLigada(def, estado)) return linhas;
	const { pericias } = efeitoKkg(def, nivel, estado?.estagio ?? 1);
	return linhas.map((l) => {
		const b = pericias[l.id];
		if (!b) return l;
		return { ...l, bonus: [...l.bonus, { fonte: def.nome, valor: b }], valor: l.valor + b, total: l.total + b, distancia: l.distancia ? { ...l.distancia, total: l.distancia.total + b } : undefined };
	});
}

/** Bônus na Defesa com a KKG ligada (Sharingan). */
export const defesaKkg = (def: DefKkg | null, estado: EstadoKkg | undefined, nivel: number) => (def && kkgLigada(def, estado) ? efeitoKkg(def, nivel, estado?.estagio ?? 1).defesa : 0);

