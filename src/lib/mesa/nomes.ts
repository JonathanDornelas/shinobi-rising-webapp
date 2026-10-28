// Nome escondido de NPC (ver supabase/migrations/20261107120000_nome_oculto.sql): o banco entrega "???" ao grupo e o
// Mestre lê o nome verdadeiro do próprio NPC. Aqui ficam a sigla (as iniciais, como o banco calcula ao desligar) e o
// nome que o Mestre vê no lugar do "???".

export const NOME_OCULTO = '???';

/** As iniciais do nome (palavras com mais de 2 letras, no máximo 2); numa tropa, a 1ª inicial e o número do membro. */
export function siglaDoNome(nome: string, membro: number | null = null): string {
	const s = nome.split(/\s+/).filter((w) => w.length > 2).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || nome.trim().slice(0, 2).toUpperCase();
	return membro ? `${s[0] ?? ''}${membro}` : s;
}

interface Ligado {
	id: string;
	npc_id: string | null;
	personagem_id: string | null;
	ligado_a: string | null;
}

/**
 * O nome verdadeiro de um token de nome escondido, a partir dos nomes que o Mestre conhece (NPC ou ficha de NPC por id).
 * Clone, invocação ou companheiro leva o primeiro nome de quem o criou. Null quando não dá para saber.
 */
export function nomeReal(t: Ligado, reais: Record<string, string>, todos: Ligado[], fundo = 0): string | null {
	const id = t.npc_id ?? t.personagem_id;
	if (id && reais[id]) return reais[id];
	const pai = t.ligado_a && fundo < 5 ? todos.find((x) => x.id === t.ligado_a) : undefined;
	const nome = pai ? nomeReal(pai, reais, todos, fundo + 1) : null;
	return nome ? `Clone de ${nome.split(' ')[0]}`.slice(0, 60) : null;
}
