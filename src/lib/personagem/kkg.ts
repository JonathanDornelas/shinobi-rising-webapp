// Kekkei Genkai em jogo (cap. 8 e os verbetes dos clãs): ativar paga o custo em PC por cena e liga os bônus até
// desativar; numa cena nova, a KKG ainda ativa cobra de novo (na Mesa, ao trocar a cena do grupo). Os marcos reduzem o
// custo (Byakugan Kanzen, Sharingan Desenvolvido, Olhos que Leem o Combate, Maestria da Hidratação). O Sharingan tem os
// três estágios de tomoe, escolhidos na ficha (o despertar é narrativo). Clã criado com KKG: o custo vem da limitação
// comprada (5 ou 10 PC por cena); sem ela, a KKG fica sempre ativa e não tem botão.
import { BENEFICIOS_KKG, TIPOS_KKG } from '#lib/clas/dados.ts';
import type { ClaDados } from '#lib/clas/regras.ts';
import type { LinhaPericia } from './regras.ts';

export interface EstagioKkg {
	rotulo: string;
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
	/** PC por cena; 0 com `sempre`, a KKG não se ativa (fica ligada). */
	custo: number;
	sempre?: boolean;
	reducoes: { nivel: number; custo: number; nome: string }[];
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
	/** Cena da Mesa em que o custo foi pago. */
	cena?: string | null;
}

const OFICIAIS: Record<string, DefKkg> = {
	hyuuga: {
		nome: 'Byakugan',
		tipo: 'Dōjutsu',
		icone: 'kkg/ic-kkg-dojutsu',
		cor: '#B9B2E0',
		custo: 3,
		reducoes: [{ nivel: 13, custo: 0, nome: 'Byakugan Kanzen' }],
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
			{ nivel: 8, custo: 2, nome: 'Sharingan Desenvolvido' },
			{ nivel: 13, custo: 1, nome: 'Olhos que Leem o Combate' }
		],
		efeitos: [],
		extras: [
			{ nivel: 8, texto: '+2 nos testes de cópia' },
			{ nivel: 13, texto: 'Copia jutsus de Rank B' }
		],
		pericias: {},
		defesa: 0,
		estagios: [
			{ rotulo: '1 tomoe', efeitos: ['+1 em Percepção', '+1 na Defesa'], pericias: { percepcao: 1 }, defesa: 1 },
			{ rotulo: '2 tomoe', efeitos: ['+2 em Percepção', '+1 na Defesa', '+1 de dano em jutsus'], pericias: { percepcao: 2 }, defesa: 1 },
			{ rotulo: '3 tomoe', efeitos: ['+3 em Percepção', '+2 na Defesa', 'Copia jutsus de Rank C ou menor'], pericias: { percepcao: 3 }, defesa: 2 }
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
		reducoes: [{ nivel: 13, custo: 5, nome: 'Maestria da Hidratação' }],
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

/** O custo por cena no nível da ficha, com o marco que o reduziu. */
export function custoKkg(def: DefKkg, nivel: number): { custo: number; reducao: string | null } {
	const r = def.reducoes.filter((x) => nivel >= x.nivel).at(-1);
	return r ? { custo: r.custo, reducao: r.nome } : { custo: def.custo, reducao: null };
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
