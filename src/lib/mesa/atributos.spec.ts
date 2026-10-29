import { describe, expect, it } from 'vitest';
import bestiario from '#lib/livro/gerado/bestiario.json';
import type { Criatura } from '#lib/livro/tipos.ts';
import { PERICIAS } from '#lib/personagem/dados.ts';
import { atributosDaCriatura, periciasDaCriatura } from './atributos.ts';

const atributos = { for: 3, agi: 4, vig: 2, int: 1, ctr: 5, esp: 0 };
const ficha = {
	atributos,
	pericias: [
		{ id: 'ninjutsu', nome: 'Ninjutsu', total: 8 },
		{ id: 'acrobacia', nome: 'Acrobacia', total: 6 }
	]
} as never;

describe('atributos e perícias da criatura na ficha rápida', () => {
	it('lista os seis atributos, na ordem do livro, com sigla e nome', () => {
		const a = atributosDaCriatura(ficha);
		expect(a.map((x) => x.sigla)).toEqual(['FOR', 'AGI', 'VIG', 'INT', 'CTR', 'ESP']);
		expect(a.map((x) => x.valor)).toEqual([3, 4, 2, 1, 5, 0]);
		expect(a[0].nome).toBe('Força');
	});

	it('lista as 15 perícias: as treinadas com o total da ficha, as outras só com o atributo', () => {
		const p = periciasDaCriatura(ficha);
		expect(p).toHaveLength(PERICIAS.length);
		expect(p).toHaveLength(15);
		const ninjutsu = p.find((x) => x.nome === 'Ninjutsu')!;
		expect(ninjutsu).toMatchObject({ treinada: true, atributo: 'CTR', expr: '1d20+8' });
		expect(ninjutsu.partes).toEqual([['CTR (atributo)', '+5'], ['Treino e bônus', '+3']]);
		// sem treino vale o atributo (taijutsu usa FOR 3; percepção usa ESP 0)
		const taijutsu = p.find((x) => x.nome === 'Taijutsu')!;
		expect(taijutsu).toMatchObject({ treinada: false, atributo: 'FOR', expr: '1d20+3' });
		expect(taijutsu.partes).toEqual([['FOR (atributo)', '+3']]);
		expect(p.find((x) => x.nome === 'Percepção')).toMatchObject({ treinada: false, expr: '1d20' });
	});

	it('uma perícia treinada que vale menos que o atributo mostra o desconto', () => {
		const f = { atributos, pericias: [{ id: 'atletismo', nome: 'Atletismo', total: 1 }] } as never;
		const a = periciasDaCriatura(f).find((x) => x.nome === 'Atletismo')!;
		expect(a.expr).toBe('1d20+1');
		expect(a.partes[1]).toEqual(['Treino e bônus', '-2']);
	});

	it('funciona com as criaturas reais do bestiário: sempre 15 perícias e as treinadas são as da ficha', () => {
		const criaturas = (bestiario as unknown as { criaturas: Criatura[] }).criaturas;
		let vistas = 0;
		for (const c of criaturas)
			for (const e of c.estagios) {
				const fc = e.combate.ficha;
				if (!fc) continue;
				vistas++;
				const p = periciasDaCriatura(fc);
				expect(p).toHaveLength(15);
				expect(p.filter((x) => x.treinada).map((x) => x.nome).sort()).toEqual(fc.pericias.map((x) => x.nome).sort());
				expect(atributosDaCriatura(fc)).toHaveLength(6);
			}
		expect(vistas).toBeGreaterThan(10);
	});
});
