// Atributos e perícias na ficha rápida da Mesa. Jogador e NPC de ficha completa vêm da ficha (fichas.server.ts); o NPC do
// bestiário vem da ficha da criatura, que só lista as perícias treinadas: aqui entram todas as 15, com as treinadas
// marcadas, para o Mestre rolar qualquer teste sem sair da Mesa (uma perícia sem treino vale só o atributo).
import type { FichaCompleta } from '#lib/bestiario/ficha.ts';
import { ATRIBUTOS, PERICIAS } from '#lib/personagem/dados.ts';
import { teste } from '#lib/rolagens/expressoes.ts';
import type { Parte } from '#lib/rolagens/partes.ts';
import type { AtributoMesa, PericiaMesa } from './tipos.ts';

const sinal = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/** Os seis atributos de uma criatura do bestiário. */
export function atributosDaCriatura(fc: Pick<FichaCompleta, 'atributos'>): AtributoMesa[] {
	const v = fc.atributos as Record<string, number>;
	return ATRIBUTOS.map((a) => ({ sigla: a.id, nome: a.nome, valor: v[a.id.toLowerCase()] ?? 0 }));
}

/** As 15 perícias de uma criatura: a treinada vale o total da ficha; as outras, o atributo dela. */
export function periciasDaCriatura(fc: Pick<FichaCompleta, 'atributos' | 'pericias'>): PericiaMesa[] {
	const v = fc.atributos as Record<string, number>;
	return PERICIAS.map((p) => {
		const atributo = v[p.atributo.toLowerCase()] ?? 0;
		const t = fc.pericias.find((x) => x.id === p.id);
		const total = t ? t.total : atributo;
		const partes: Parte[] = [[`${p.atributo} (atributo)`, sinal(atributo)]];
		if (t && total !== atributo) partes.push(['Treino e bônus', sinal(total - atributo)]);
		return { nome: p.nome, atributo: p.atributo, expr: teste(total), partes, treinada: !!t, id: p.id, valorAtributo: atributo, treino: total - atributo, bonus: [], total, combate: 'combate' in p && !!p.combate, distancia: null };
	});
}
