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
	resistencia: string | null;
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

/** O que a ficha do bestiário dá a um NPC importado: tamanho, todos os ataques e os traços usáveis. */
export interface ExtrasNpc {
	tamanho: 1 | 3 | 6 | 10;
	/** 8 m + AGI da ficha do bestiário (+5 m com Velocidade); 10 m quando ela não tem atributos */
	deslocamento: number;
	ataques: ArmaMesa[];
	habilidades: JutsuMesa[];
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
	pericias: { nome: string; expr: string; partes: Parte[] }[];
	/** Kawarimi (5 m), fios da marionete (30 m), sensor (50 m): atalhos de medida */
	distancias: [string, number][];
	notas: string;
	/** A mochila (aba EQUIP. da ficha rápida): itens, carga e ryo; selado = guardado num pergaminho */
	inventario: { nome: string; qtd: number; grupo: string; icone: string; nota: string | null; selado: boolean }[];
	carga: { atual: number; max: number };
	ryo: number;
}
