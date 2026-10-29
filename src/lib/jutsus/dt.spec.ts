import { describe, expect, it } from 'vitest';
import bestiario from '#lib/livro/gerado/bestiario.json';
import type { Criatura } from '#lib/livro/tipos.ts';
import { comDt, dtDoLancador, dtNaFichaDaCriatura } from './dt.ts';

describe('DT do Jutsu (cap. 2)', () => {
	it('Sasuke do cap. 3: CTR +4, Treinado (+2) no Goukakyu, rank C → 10 + 2 + 4 + 2 = 18', () => {
		const dt = dtDoLancador('C', 'Ninjutsu', { CTR: 4 }, 2);
		expect(dt.total).toBe(18);
		expect(dt.partes.map((p) => p.valor)).toEqual([10, 2, 4, 2]);
	});
	it('Fuuinjutsu usa CTR; Bukijutsu, o maior entre FOR e AGI; tipo desconhecido, CTR', () => {
		expect(dtDoLancador('B', 'Fuuinjutsu', { CTR: 3, INT: 5 }).total).toBe(16);
		expect(dtDoLancador('D', 'Bukijutsu', { FOR: 1, AGI: 4 }).total).toBe(15);
		expect(dtDoLancador('E', 'Clã', { CTR: 2 }).total).toBe(12);
	});
	it('a criatura do bestiário usa a ficha dela: Uchiha Chunin, Goukakyu (C, CTR 0, sem proficiência) → 12', () => {
		const uchiha = (bestiario as unknown as { criaturas: Criatura[] }).criaturas.find((c) => c.slug === 'cla-uchiha')!;
		const k = uchiha.estagios.find((e) => e.slug === 'chunin')!.combate;
		const goukakyu = k.jutsus.find((j) => j.slug === 'katon-goukakyu-no-jutsu')!;
		expect(dtNaFichaDaCriatura(k.ficha!, goukakyu)?.total).toBe(12);
	});
	it('troca "DT do Jutsu" pelo número na Resistência', () => {
		expect(comDt('Acrobacia (DT do Jutsu)', dtDoLancador('C', 'Ninjutsu', { CTR: 4 }, 2))).toBe('Acrobacia (DT 18)');
	});
});
