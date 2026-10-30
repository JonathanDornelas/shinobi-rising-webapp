import type { DtJutsu } from '#lib/jutsus/dt.ts';
import type { InfoItem } from '#lib/equipamentos/info.server.ts';
import type { DefKkg } from '#lib/personagem/kkg.ts';
// L11 · Mesa: a ficha rápida já calculada (fichas.server.ts monta; a tela só lê).
import type { EstadoJogo } from '#lib/personagem/progressao.ts';
import type { Parte } from '#lib/rolagens/partes.ts';
import type { Regua } from './regua.ts';

export interface RolagemPronta {
	expr: string;
	rotulo: string;
	partes: Parte[];
}

export interface JutsuMesa {
	slug: string;
	nome: string;
	rank: string;
	custo: number;
	unidade: 'PC' | 'PE';
	alcance: string;
	area: string;
	regua: Regua;
	/** turnos que o efeito fica na cena (null = a cena toda; ausente = instantâneo) */
	turnos?: number | null;
	/** o usuário cresce até este lado no quadro enquanto o jutsu dura ("você fica Grande", cap. 4) */
	tamanho?: 3 | 6 | 10;
	/** clones que o jutsu cria ao lado de quem lança (Kage Bunshin: 3; Bunshin: 1d4) e os PV de cada um */
	clones?: { n: number | string; pv: 'um' | 'metade' };
	resistencia: string | null;
	/** DT do jutsu com a conta (a do lançador, ou a fixa do NPC e da criatura). */
	dt?: DtJutsu | null;
	ataque: RolagemPronta | null;
	dano: RolagemPronta | null;
	cura: string | null;
	/** Para o tooltip de ação (HUD): tipo, elemento, ação, duração, tradução e o texto do efeito. */
	tipo?: string;
	elemento?: string | null;
	acao?: string;
	duracao?: string;
	traducao?: string;
	efeito?: string;
	/** Traço do bestiário: o texto inteiro e se é uma vez por cena. */
	texto?: string;
	porCena?: boolean;
}

/** Um atributo (FOR, AGI, VIG, INT, CTR, ESP) com o valor da ficha. */
export interface AtributoMesa {
	sigla: string;
	nome: string;
	valor: number;
}

/** Uma perícia com o teste pronto. `treinada`: tem treino (o resto vale só o atributo). */
export interface PericiaMesa {
	nome: string;
	/** sigla do atributo da perícia */
	atributo: string;
	expr: string;
	partes: Parte[];
	treinada: boolean;
	/** Para mostrar como a aba Perícias da ficha completa: ícone, atributo, treino, bônus e total. */
	id: string;
	valorAtributo: number;
	treino: number;
	bonus: { fonte: string; valor: number }[];
	total: number;
	combate: boolean;
	/** Bukijutsu à distância (AGI). */
	distancia: { atributo: string; total: number; expr: string; partes: Parte[] } | null;
}

/** O que a ficha do bestiário dá a um NPC importado: tamanho, todos os ataques e os traços usáveis. */
export interface ExtrasNpc {
	tamanho: 1 | 3 | 6 | 10;
	/** 8 m + AGI da ficha do bestiário (+5 m com Velocidade); 10 m quando ela não tem atributos */
	deslocamento: number;
	ataques: ArmaMesa[];
	habilidades: JutsuMesa[];
	/** Os seis atributos da ficha da criatura (null nas invocações, que não têm ficha). */
	atributos: AtributoMesa[] | null;
	/** As 15 perícias: as treinadas da ficha e as outras só com o atributo (vazio sem ficha). */
	pericias: PericiaMesa[];
}

export interface ArmaMesa {
	nome: string;
	/** alcance em metros: 1 corpo a corpo, 2 haste, 10/30 arremesso */
	alcance: number;
	rotuloAlcance: string;
	/** propriedades da arma no catálogo (Versátil, Rajada...) */
	propriedades?: string[];
	ataque: RolagemPronta;
	dano: RolagemPronta | null;
}

export interface FichaMesa {
	id: string;
	jogadorId: string;
	nome: string;
	sub: string;
	cla: string | null;
	retrato: string | null;
	max: { pv: number; pc: number; pe: number };
	estado: EstadoJogo;
	pd: number;
	defesa: number;
	defesaMental: number;
	iniciativa: number;
	deslocamento: number;
	jutsus: JutsuMesa[];
	armas: ArmaMesa[];
	atributos: AtributoMesa[];
	/** Todas as perícias, com as treinadas marcadas. */
	pericias: PericiaMesa[];
	/** Kawarimi (5 m), fios da marionete (30 m), sensor (50 m): atalhos de medida */
	distancias: [string, number][];
	notas: string;
	/** A mochila (aba EQUIP. da ficha rápida): itens, carga e ryo; selado = guardado num pergaminho */
	inventario: { nome: string; qtd: number; grupo: string; icone: string; nota: string | null; selado: boolean; info: InfoItem | null }[];
	carga: { atual: number; max: number };
	ryo: number;
	/** Kekkei Genkai do clã, com o custo por cena no nível da ficha (o estado dela fica em estado.kkg). */
	kkg: { def: DefKkg; custo: number; reducao: string | null } | null;
	nivel: number;
}
