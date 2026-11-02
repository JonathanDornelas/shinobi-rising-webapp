// As cenas de demonstração da luz dinâmica: três mapas, cada um na vista de cima e na isométrica, com paredes, portas e
// luzes prontas (scripts/mesa/demos.ts desenha a arte em static/mesa/demos e escreve o demos.json). A Mesa só carrega a
// lista quando o Mestre abre "Nova cena".
import type { MesaCena } from '#lib/supabase/banco.ts';

export interface DemoCena {
	id: string;
	nome: string;
	dica: string;
	visao: 'topo' | 'isometrica';
	largura: number;
	altura: number;
	fundo: string;
	miniatura: string;
	fundo_escala: number;
	fundo_x: number;
	fundo_y: number;
	luz_ambiente: 'claro' | 'penumbra' | 'escuro';
	paredes: [number, number, number, number, number][];
	luzes: { id: string; x: number; y: number; plena: number; penumbra: number; acesa: boolean }[];
}

export const carregarDemos = async (): Promise<DemoCena[]> => (await import('./demos.json')).default as DemoCena[];

/** O que a cena nova grava para ficar igual à demonstração: o mapa casado com a grade, a luz ligada e nada explorado. */
export const camposDaDemo = (d: DemoCena): Partial<MesaCena> => ({
	largura: d.largura,
	altura: d.altura,
	visao: d.visao,
	iso_razao: 2,
	iso_rotacao: 0,
	fundo: d.fundo,
	fundo_escala: d.fundo_escala,
	fundo_x: d.fundo_x,
	fundo_y: d.fundo_y,
	fundo_opacidade: 1,
	luz_dinamica: true,
	luz_ambiente: d.luz_ambiente,
	paredes: d.paredes,
	luzes: d.luzes,
	nevoa: true,
	reveladas: []
});
