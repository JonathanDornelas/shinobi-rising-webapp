// Rolagens e gerador rápido de NPC (ficha resumida do cap. 23.2).
import type { Npc } from '#lib/supabase/banco.ts';
import { MAX_TAGS, RANKS_NPC, TAGS_NPC } from './dados.ts';

const DADO = /(\d{1,2})\s*d\s*(\d{1,3})(?:\s*([+-])\s*(\d{1,3})(?![\dd]))?/gi;

/** Lê "1d20 + 4 → 1d6 + 2" (formato do livro): o primeiro 1d20 é o acerto; o primeiro outro dado, o dano. */
export function ataqueNpc(texto: string): { acerto: string | null; dano: string | null } {
	let acerto: string | null = null;
	let dano: string | null = null;
	for (const m of texto.matchAll(DADO)) {
		const expr = `${m[1]}d${m[2]}${m[3] ? `${m[3]}${m[4]}` : ''}`;
		if (m[1] === '1' && m[2] === '20') acerto ??= expr;
		else dano ??= expr;
	}
	return { acerto, dano };
}

/**
 * Combate sugerido por rank para o gerador: PV, PC e Defesa são os do livro (cap. 23.2); iniciativa e ataque
 * escalam a partir dos exemplos do capítulo (bandido 1d20 + 3 → 1d6 + 1; Jounin 1d20 + 4 → 1d6 + 2 no corpo a corpo fraco).
 */
export const COMBATE_GERADO: Record<Npc['rank'], { iniciativa: number; ataque: string }> = {
	genin: { iniciativa: 2, ataque: '1d20 + 3 → 1d6 + 1' },
	chunin: { iniciativa: 3, ataque: '1d20 + 5 → 1d8 + 2' },
	jounin: { iniciativa: 4, ataque: '1d20 + 7 → 2d6 + 3' },
	anbu: { iniciativa: 5, ataque: '1d20 + 8 → 2d8 + 3' },
	lendario: { iniciativa: 6, ataque: '1d20 + 10 → 3d8 + 4' }
};

const NOMES = ['Akira', 'Daisuke', 'Emi', 'Fumiko', 'Goro', 'Haruka', 'Hayato', 'Isamu', 'Jiro', 'Kaede', 'Kenta', 'Kiyoshi', 'Kohaku', 'Madoka', 'Masaru', 'Michiru', 'Natsume', 'Nobu', 'Raiden', 'Reiko', 'Ryota', 'Sachiko', 'Satsuki', 'Shinji', 'Sora', 'Takumi', 'Tetsuo', 'Tomoe', 'Yasuo', 'Yuki'];
const SOBRENOMES = ['Akechi', 'Fujiwara', 'Hoshino', 'Ishida', 'Kanzaki', 'Kurogane', 'Matsuda', 'Mori', 'Nakajima', 'Ogata', 'Saeki', 'Shirogane', 'Takeda', 'Tsukishima', 'Yamabuki'];
const FUNCOES = ['Guarda do portão', 'Mercenário', 'Espião infiltrado', 'Mercador de armas', 'Ninja médico', 'Caçador de recompensas', 'Monge errante', 'Ronin', 'Informante da taverna', 'Contrabandista', 'Capitão da guarda', 'Desertor', 'Professor da Academia', 'Ferreiro', 'Mensageiro'];
const ORIGENS = ['Konohagakure', 'Sunagakure', 'Kirigakure', 'Kumogakure', 'Iwagakure', 'Amegakure', 'Takigakure', 'Otogakure', 'País do Ferro', 'Vila sem nome'];
const TRACOS = ['cicatriz atravessando o rosto', 'bandana gasta pendurada no pescoço', 'olhos cansados e voz baixa', 'cabelo preso num coque alto', 'manto de viagem remendado', 'luvas sem dedos', 'tatuagem de selo no braço', 'sorriso fácil demais', 'máscara de gato rachada', 'mãos sempre ocupadas com uma kunai'];
const QUER = ['Pagar uma dívida antiga', 'Vingar o irmão morto em missão', 'Sair da vila sem ser seguido', 'Provar seu valor ao Kage', 'Ficar rico antes da próxima guerra', 'Proteger a família escondida', 'Descobrir quem o traiu', 'Recuperar um pergaminho roubado'];
const SEGREDOS = ['Trabalha para outra vila', 'Já foi renegado', 'Deve a vida a um dos jogadores', 'Sabe onde está o esconderijo do vilão', 'Esconde um selo amaldiçoado', 'Matou o próprio mestre', 'É um clone de outra pessoa', 'Está morrendo de uma doença de chakra'];

type Sorteio = () => number;
const um = <T>(lista: readonly T[], r: Sorteio) => lista[Math.floor(r() * lista.length)];

/** NPC pronto para editar: nome, função, origem, aparência, rank, combate, tags e ganchos. */
export function gerarNpc(rank?: Npc['rank'], r: Sorteio = Math.random): Pick<Npc, 'nome' | 'funcao' | 'origem' | 'aparencia' | 'rank' | 'pv' | 'pc' | 'defesa' | 'iniciativa' | 'ataque' | 'tags' | 'quer' | 'segredo'> {
	const rk = RANKS_NPC.find((x) => x.id === rank) ?? um(RANKS_NPC, r);
	const tags: string[] = [];
	const qtd = 1 + Math.floor(r() * MAX_TAGS);
	while (tags.length < qtd) {
		const t = um(TAGS_NPC, r).id;
		if (!tags.includes(t)) tags.push(t);
	}
	const tracos = [um(TRACOS, r), um(TRACOS, r)].filter((x, i, a) => a.indexOf(x) === i);
	return {
		nome: `${um(SOBRENOMES, r)} ${um(NOMES, r)}`,
		funcao: um(FUNCOES, r),
		origem: um(ORIGENS, r),
		aparencia: tracos.map((t, i) => (i ? t : t[0].toUpperCase() + t.slice(1))).join(', ') + '.',
		rank: rk.id,
		pv: rk.pv,
		pc: rk.pc,
		defesa: rk.defesa,
		...COMBATE_GERADO[rk.id],
		tags,
		quer: um(QUER, r),
		segredo: um(SEGREDOS, r)
	};
}
