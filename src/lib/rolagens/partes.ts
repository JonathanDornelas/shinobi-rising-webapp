// Parcelas da conta que vão com cada rolagem da ficha (aparecem no registro, L10): "ESP (atributo) +1", "Treino +2"…
// O total vem sempre da expressão; quando o teto da perícia corta bônus, uma linha de ajuste fecha a soma.
import type { LinhaPericia } from '#lib/personagem/regras.ts';

export type Parte = [string, string];
const s = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

/** Fecha a soma das parcelas com o modificador real (ex.: teto de +5 na criação). */
function fechar(partes: Parte[], total: number, rotuloAjuste: string): Parte[] {
	const soma = partes.reduce((t, [, v]) => t + Number(v.replace('−', '-')), 0);
	return soma === total ? partes : [...partes, [rotuloAjuste, s(total - soma)]];
}

/** Perícia: atributo, treino, bônus (vila, clã, background, marcos, especialização) e o teto. */
export function partesPericia(p: LinhaPericia, distancia = false): Parte[] {
	const at = distancia && p.distancia ? p.distancia : { atributo: p.atributo, valor: p.valorAtributo };
	const total = distancia && p.distancia ? p.distancia.total : p.total;
	const partes: Parte[] = [[`${at.atributo} (atributo)`, s(at.valor)]];
	if (p.treino) partes.push(['Treino', s(p.treino)]);
	for (const b of p.bonus) partes.push([b.fonte, s(b.valor)]);
	return fechar(partes, total, 'Limite da perícia');
}

export const partesAtributo = (sigla: string, valor: number): Parte[] => [[`${sigla} (atributo)`, s(valor)]];

/** Iniciativa: AGI e o que a especialização soma (Velocidade). */
export const partesIniciativa = (agi: number, total: number): Parte[] => fechar([['AGI (atributo)', s(agi)]], total, 'Especialização');

/** Ataque de jutsu: a perícia do tipo e a proficiência no jutsu. */
export function partesAtaqueJutsu(pericia: string, base: number, proficiencia: number): Parte[] {
	const partes: Parte[] = [[pericia, s(base)]];
	if (proficiencia) partes.push(['Proficiência', s(proficiencia)]);
	return partes;
}

/** Dano que soma atributo (Taijutsu, Bukijutsu, "+ FOR" no efeito). */
export const partesDanoAtributo = (sigla: string | null | undefined, valor: number): Parte[] => (sigla && valor ? [[`${sigla} (atributo)`, s(valor)]] : []);
