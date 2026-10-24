// "Usar na campanha": um estágio de um verbete do bestiário vira NPC com ficha resumida (cap. 23.2) na lista do Mestre.
import type { Npc } from '#lib/supabase/banco.ts';
import type { Criatura, PapelCriatura, TamanhoCriatura, Trecho } from '#lib/livro/tipos.ts';

export const PAPEIS: Record<PapelCriatura, string> = {
	lutador: 'Lutador',
	atirador: 'Atirador',
	controlador: 'Controlador',
	suporte: 'Suporte',
	assassino: 'Assassino',
	bando: 'Bando',
	chefe: 'Chefe'
};

/** Tamanho (cap. 4): rótulo e lado do espaço no quadro, em quadrados. */
export const TAMANHOS: Record<TamanhoCriatura, { nome: string; espaco: 1 | 3 | 6 | 10; rotulo: string }> = {
	pequeno: { nome: 'Pequeno', espaco: 1, rotulo: 'Pequeno (1 × 1 m)' },
	medio: { nome: 'Médio', espaco: 1, rotulo: 'Médio (1 × 1 m)' },
	grande: { nome: 'Grande', espaco: 3, rotulo: 'Grande (3 × 3 m)' },
	enorme: { nome: 'Enorme', espaco: 6, rotulo: 'Enorme (6 × 6 m)' },
	colossal: { nome: 'Colossal', espaco: 10, rotulo: 'Colossal (10 × 10 m)' }
};

const texto = (c: Trecho[]) => c.map((t) => t.t).join('');
/** Corta no último espaço antes do limite (as colunas da tabela npcs têm tamanho máximo). */
const caber = (s: string, max: number) => (s.length <= max ? s : s.slice(0, s.lastIndexOf(' ', max - 1)) + '…');
/** "2d6+3" → "2d6 + 3", o formato que a ficha resumida lê (ataqueNpc). */
const espacar = (dano: string) => dano.replace(/\s*([+-])\s*/g, ' $1 ');

export type NpcDoVerbete = Pick<
	Npc,
	'nome' | 'funcao' | 'origem' | 'aparencia' | 'rank' | 'pv' | 'pc' | 'pe' | 'defesa' | 'iniciativa' | 'ataque' | 'especial' | 'tags' | 'quer' | 'segredo' | 'notas' | 'membros' | 'jutsus' | 'acerto' | 'dt' | 'arte' | 'bestiario'
>;

export function npcDoVerbete(c: Criatura, estagio = 0): NpcDoVerbete {
	const e = c.estagios[Math.min(Math.max(0, estagio), c.estagios.length - 1)];
	const k = e.combate;
	const a = k.ataques[0];
	// o Especial lista os nomes (cabe sempre); o texto inteiro de cada traço vai nas notas, e a Mesa usa a ficha do bestiário
	const especial = [...k.tracos.map((t) => t.nome), ...k.jutsus.map((j) => j.nome)].join(' · ');
	const primeira = texto(c.descricao[0] ?? []).match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? '';
	return {
		nome: caber(c.estagios.length > 1 ? `${e.nome} (${c.nome})` : c.nome, 60),
		funcao: caber(`${PAPEIS[e.papel]} · ${c.tipo} · ameaça ${e.ameacaRotulo}`, 120),
		origem: caber(c.vila?.nome ?? c.origem, 60),
		aparencia: caber(primeira, 300),
		rank: e.rank,
		pv: k.pv,
		pc: k.pc ?? 0,
		pe: k.pe ?? 0,
		defesa: k.defesa,
		iniciativa: k.iniciativa,
		ataque: a ? caber(`${a.nome}: 1d20 + ${a.acerto} → ${espacar(a.dano)}`, 120) : '',
		especial: caber(especial, 300),
		tags: c.tags.slice(0, 3),
		quer: caber(texto(c.ganchos[0] ?? []), 300),
		segredo: caber(texto(c.ganchos[1] ?? []), 300),
		// a ficha resumida não tem campo de PE: ele vai nas notas, para o taijutsu e o bukijutsu
		notas: caber([`Do bestiário: /regras/bestiario/${c.slug}`, ...k.tracos.map((t) => `${t.nome}: ${texto(t.efeito)}`), ...c.taticas.map(texto)].join('\n\n'), 2000),
		membros: Math.min(20, Math.max(1, e.membros)),
		// a Mesa mostra os jutsus (com régua e rolagem), o acerto e a DT da ficha, e usa a arte no token
		jutsus: k.jutsus.flatMap((j) => (j.slug ? [j.slug] : [])).slice(0, 24),
		acerto: a?.acerto ?? null,
		dt: k.dt,
		arte: (e.arte ?? c.arte)?.arquivo ?? null,
		bestiario: caber(`${c.slug}#${e.slug}`, 120)
	};
}
