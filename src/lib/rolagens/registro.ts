// Registro de rolagens (L10 · R1/R2): separadores de dia, filtros, marcas e ordem de iniciativa. Funções puras.
import type { AvatarRolagem } from '#lib/componentes/rolagens/EntradaRegistro.svelte';
import { corElemento } from '#lib/mesa/hud.ts';
import type { Rolagem, TipoRolagem } from '#lib/supabase/banco.ts';

/** O que o servidor manda para o registro (registro.server.ts). */
export interface DadosRegistro {
	eu: string;
	campanhas: { id: string; nome: string; mestreId: string | null; arquivada: boolean }[];
	rolagens: Rolagem[];
	ocultas: { id: string; campanha_id: string; criada_em: string; mestre: string }[];
	avatares: Record<string, AvatarRolagem>;
	campanhaInicial: string | null;
}

const MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const MES_MIN = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const SEMANA = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

/** Data local "aaaa-mm-dd" (para agrupar por dia no fuso de quem vê). */
export const diaLocal = (iso: string | Date) => {
	const d = new Date(iso);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
/** Dias entre a data e hoje (0 = hoje). */
export function diasAtras(iso: string | Date, agora = new Date()): number {
	const a = new Date(diaLocal(agora) + 'T12:00:00');
	const b = new Date(diaLocal(iso) + 'T12:00:00');
	return Math.round((a.getTime() - b.getTime()) / 864e5);
}

/** "HOJE · 19 OUT.", "ONTEM · 18 OUT.", "SEXTA · 16 OUT. 2026". */
export function separadorDia(iso: string | Date, agora = new Date()): string {
	const d = new Date(iso);
	const n = diasAtras(iso, agora);
	const base = `${d.getDate()} ${MES[d.getMonth()]}.`;
	return n === 0 ? `HOJE · ${base}` : n === 1 ? `ONTEM · ${base}` : `${SEMANA[d.getDay()]} · ${base} ${d.getFullYear()}`;
}
/** "19 out. 2026 · 21:14". */
export function dataLonga(iso: string): string {
	const d = new Date(iso);
	return `${d.getDate()} ${MES_MIN[d.getMonth()]}. ${d.getFullYear()} · ${hora(iso)}`;
}
export const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
/** "24/10 · 16:14": o canto de baixo de cada rolagem. */
export const dataHora = (iso: string) => `${new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · ${hora(iso)}`;
/** A cor dos dados: o elemento no dano ("Dano · Katon: ..."), verde na cura. */
export const corDaRolagem = (r: { tipo: string; rotulo: string }) => (r.tipo === 'cura' ? '#7FB069' : r.tipo === 'dano' ? (corElemento(null, r.rotulo)?.cor ?? null) : null);
/** "agora", "há 5 min", "há 2 h"; vazio fora de hoje. */
export function relativo(iso: string, agora = new Date()): string {
	if (diasAtras(iso, agora) !== 0) return '';
	const min = Math.round((agora.getTime() - new Date(iso).getTime()) / 60000);
	return min < 1 ? 'agora' : min < 60 ? `há ${min} min` : `há ${Math.floor(min / 60)} h`;
}

// ---------------------------------------------------------------- filtros
export const PERIODOS = [
	{ id: 'hoje', nome: 'HOJE', dias: 0 },
	{ id: 'ontem', nome: 'ONTEM', dias: 1 },
	{ id: 'd7', nome: '7 DIAS', dias: 6 },
	{ id: 'd30', nome: '30 DIAS', dias: 29 },
	{ id: 'tudo', nome: 'TUDO', dias: Infinity }
] as const;
export type Periodo = (typeof PERIODOS)[number]['id'] | 'intervalo';

export function noPeriodo(r: Pick<Rolagem, 'criada_em'>, p: Periodo, de = '', ate = '', agora = new Date()): boolean {
	const n = diasAtras(r.criada_em, agora);
	if (p === 'hoje') return n === 0;
	if (p === 'ontem') return n === 1;
	if (p === 'intervalo') {
		const d = diaLocal(r.criada_em);
		return (!de || d >= de) && (!ate || d <= ate);
	}
	return n <= (PERIODOS.find((x) => x.id === p)?.dias ?? Infinity);
}

export const TIPOS = [
	{ id: 'todas', nome: 'TODAS', tipos: null },
	{ id: 'testes', nome: 'TESTES', tipos: ['teste', 'save'] },
	{ id: 'ataques', nome: 'ATAQUES', tipos: ['ataque'] },
	{ id: 'dano', nome: 'DANO', tipos: ['dano', 'cura'] },
	{ id: 'iniciativa', nome: 'INICIATIVA', tipos: ['iniciativa'] },
	{ id: 'livres', nome: 'LIVRES', tipos: ['livre'] }
] as const satisfies readonly { id: string; nome: string; tipos: readonly TipoRolagem[] | null }[];
export type FiltroTipo = (typeof TIPOS)[number]['id'];
export const doTipo = (r: Pick<Rolagem, 'tipo'>, f: FiltroTipo) => {
	const t = TIPOS.find((x) => x.id === f)?.tipos;
	return !t || (t as readonly string[]).includes(r.tipo);
};

export const NOME_TIPO: Record<TipoRolagem, string> = { teste: 'Teste', ataque: 'Ataque', dano: 'Dano', cura: 'Cura', iniciativa: 'Iniciativa', save: 'Save', livre: 'Rolagem livre' };

// ---------------------------------------------------------------- marcas
export type Marca = 'critico' | 'falha' | 'pd';
export function marcas(r: Pick<Rolagem, 'd20' | 'pd'>): Marca[] {
	return [r.d20 === 20 ? 'critico' : null, r.d20 === 1 ? 'falha' : null, r.pd ? 'pd' : null].filter((x): x is Marca => !!x);
}
export const ROTULO_MARCA: Record<Marca, string> = { critico: '★ SUCESSO CRÍTICO', falha: '✖ FALHA CRÍTICA', pd: 'PD GASTO' };

/** "Ren Uchiha" → "RU"; "Kaito" → "K". */
export const iniciaisQuem = (nome: string) => {
	const p = nome.trim().split(/\s+/).filter(Boolean);
	return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};

// ---------------------------------------------------------------- ordem de iniciativa
/**
 * Ordem montada pela última rolagem de iniciativa de cada um (personagem, NPC ou pessoa) na campanha, dentro da janela
 * de horas (o combate atual); maior primeiro.
 */
export function ordemIniciativa(rs: Rolagem[], campanha: string, horas = 6, agora = new Date(), limpaEm: string | null = null): { chave: string; quem: string; total: number }[] {
	// só as rolagens das últimas horas e, se a ordem foi limpa, as feitas depois disso
	const desde = Math.max(agora.getTime() - horas * 3600_000, limpaEm ? new Date(limpaEm).getTime() : 0);
	const ultima = new Map<string, Rolagem>();
	for (const r of rs) {
		if (r.campanha_id !== campanha || r.tipo !== 'iniciativa' || r.substituida || new Date(r.criada_em).getTime() < desde) continue;
		const chave = r.personagem_id ?? r.npc_id ?? `${r.autor_id}:${r.quem}`;
		const atual = ultima.get(chave);
		if (!atual || atual.criada_em < r.criada_em) ultima.set(chave, r);
	}
	return [...ultima.entries()].map(([chave, r]) => ({ chave, quem: r.quem, total: r.total })).sort((a, b) => b.total - a.total || a.quem.localeCompare(b.quem, 'pt-BR'));
}
