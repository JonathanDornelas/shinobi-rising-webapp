// Ficha resumida de NPC (cap. 23.2): ranks de poder com os valores sugeridos pelo livro e as tags comportamentais.
import type { Npc } from '#lib/supabase/banco.ts';

export const RANKS_NPC = [
	{ id: 'genin', nome: 'Genin', pv: 25, pc: 25, defesa: 12 },
	{ id: 'chunin', nome: 'Chunin', pv: 45, pc: 40, defesa: 14 },
	{ id: 'jounin', nome: 'Jounin', pv: 75, pc: 70, defesa: 16 },
	{ id: 'anbu', nome: 'Anbu', pv: 100, pc: 90, defesa: 17 },
	{ id: 'lendario', nome: 'Lendário', pv: 150, pc: 130, defesa: 19 }
] as const satisfies readonly { id: Npc['rank']; nome: string; pv: number; pc: number; defesa: number }[];

export const TAGS_NPC = [
	{ id: 'Agressivo', nota: 'Entra na briga primeiro' },
	{ id: 'Cauteloso', nota: 'Espera abertura' },
	{ id: 'Tático', nota: 'Foca o jogador mais frágil' },
	{ id: 'Brutal', nota: 'Não recua' },
	{ id: 'Diplomata', nota: 'Tenta conversar antes' },
	{ id: 'Covarde', nota: 'Foge se machucado' },
	{ id: 'Leal', nota: 'Morre pelo mestre' },
	{ id: 'Fanático', nota: 'Luta até o fim' }
] as const;
export const MAX_TAGS = 3;

export const nomeRank = (r: string) => RANKS_NPC.find((x) => x.id === r)?.nome ?? r;
/** PV atual de cada membro (o que não foi registrado está cheio). */
export const pvDosMembros = (n: Pick<Npc, 'pv' | 'membros' | 'pv_atual'>) => Array.from({ length: n.membros }, (_, i) => n.pv_atual[i] ?? n.pv);
/** PV, PC ou PE de cada membro (o máximo quando não foi mexido). */
export const recursoDosMembros = (n: Pick<Npc, 'pv' | 'pc' | 'pe' | 'membros' | 'pv_atual' | 'pc_atual' | 'pe_atual'>, k: 'pv' | 'pc' | 'pe') =>
	Array.from({ length: n.membros }, (_, i) => (n[`${k}_atual`] ?? [])[i] ?? n[k] ?? 0);
