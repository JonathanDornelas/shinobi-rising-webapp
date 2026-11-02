// Kekkei Genkai do NPC do bestiário na Mesa (cap. 8): a do clã do verbete (Uchiha, Hyuuga, Hozuki, Kaguya, Sabaku, Yuki) e
// a dos especialistas que usam a mesma linhagem (Hyōton, Jiton). A ameaça faz o papel do nível (as reduções dos marcos) e
// escolhe o estágio do Sharingan. Ligada, ela fica nos estados do token ("kkg"), que a Mesa não mostra como condição; a
// vez do NPC na iniciativa cobra o PC do turno, e cair apaga.
import { defKkg, type DefKkg } from '#lib/personagem/kkg.ts';

const LINHAGEM: Record<string, string> = { 'especialista-hyoton': 'yuki', 'especialista-jiton': 'sabaku' };

export interface KkgNpc {
	def: DefKkg;
	nivel: number;
	estagio: number;
}

/** A KKG do verbete ("slug#estágio") na ameaça do estágio, ou null. */
export function kkgDoVerbete(slug: string, ameaca: number): KkgNpc | null {
	const def = defKkg(LINHAGEM[slug] ?? (slug.startsWith('cla-') ? slug.slice(4) : null));
	if (!def) return null;
	// Sharingan: 1 tomoe até a ameaça 3, 2 tomoe até a 8, 3 tomoe da 9 em diante
	const estagio = def.estagios ? (ameaca < 4 ? 1 : ameaca < 9 ? 2 : 3) : 1;
	return { def, nivel: Math.max(1, Math.floor(ameaca)), estagio };
}

export const ehKkg = (c: string) => c === 'kkg';
/** Os estados do token sem a marca da KKG (para os ícones e a lista de condições). */
export const semKkg = (condicoes: string[]) => condicoes.filter((c) => !ehKkg(c));
export const kkgLigadaNoToken = (condicoes: string[]) => condicoes.some(ehKkg);
