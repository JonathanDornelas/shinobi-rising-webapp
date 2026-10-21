// "Usar na campanha": um estágio de um verbete do bestiário vira NPC com ficha resumida (cap. 23.2) na lista do Mestre.
import type { Npc } from '#lib/supabase/banco.ts';
import type { Criatura, PapelCriatura, Trecho } from '#lib/livro/tipos.ts';

export const PAPEIS: Record<PapelCriatura, string> = {
	lutador: 'Lutador',
	atirador: 'Atirador',
	controlador: 'Controlador',
	suporte: 'Suporte',
	assassino: 'Assassino',
	bando: 'Bando',
	chefe: 'Chefe'
};

const texto = (c: Trecho[]) => c.map((t) => t.t).join('');
/** Corta no último espaço antes do limite (as colunas da tabela npcs têm tamanho máximo). */
const caber = (s: string, max: number) => (s.length <= max ? s : s.slice(0, s.lastIndexOf(' ', max - 1)) + '…');
/** "2d6+3" → "2d6 + 3", o formato que a ficha resumida lê (ataqueNpc). */
const espacar = (dano: string) => dano.replace(/\s*([+-])\s*/g, ' $1 ');

export type NpcDoVerbete = Pick<Npc, 'nome' | 'funcao' | 'origem' | 'aparencia' | 'rank' | 'pv' | 'pc' | 'defesa' | 'iniciativa' | 'ataque' | 'especial' | 'tags' | 'quer' | 'segredo' | 'notas' | 'membros'>;

export function npcDoVerbete(c: Criatura, estagio = 0): NpcDoVerbete {
	const e = c.estagios[Math.min(Math.max(0, estagio), c.estagios.length - 1)];
	const k = e.combate;
	const a = k.ataques[0];
	const especial = [...k.tracos.map((t) => `${t.nome}: ${texto(t.efeito)}`), ...k.jutsus.map((j) => j.nome)].join(' · ');
	const primeira = texto(c.descricao[0] ?? []).match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? '';
	return {
		nome: caber(c.estagios.length > 1 ? `${e.nome} (${c.nome})` : c.nome, 60),
		funcao: caber(`${PAPEIS[e.papel]} · ${c.tipo} · ameaça ${e.ameacaRotulo}`, 120),
		origem: caber(c.vila?.nome ?? c.origem, 60),
		aparencia: caber(primeira, 300),
		rank: e.rank,
		pv: k.pv,
		pc: k.pc ?? 0,
		defesa: k.defesa,
		iniciativa: k.iniciativa,
		ataque: a ? caber(`${a.nome}: 1d20 + ${a.acerto} → ${espacar(a.dano)}`, 120) : '',
		especial: caber(especial, 300),
		tags: c.tags.slice(0, 3),
		quer: caber(texto(c.ganchos[0] ?? []), 300),
		segredo: caber(texto(c.ganchos[1] ?? []), 300),
		notas: caber([`Do bestiário: /regras/bestiario/${c.slug}`, ...c.taticas.map(texto)].join('\n\n'), 2000),
		membros: Math.min(20, Math.max(1, e.membros))
	};
}
