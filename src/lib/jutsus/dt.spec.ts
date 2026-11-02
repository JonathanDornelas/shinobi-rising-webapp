import { describe, expect, it } from 'vitest';
import bestiario from '#lib/livro/gerado/bestiario.json';
import type { Criatura } from '#lib/livro/tipos.ts';
import { comDt, dtDoLancador, dtNaFichaDaCriatura, pedeDt } from './dt.ts';

describe('DT do Jutsu (cap. 2)', () => {
	it('Sasuke do cap. 3: CTR +3, Treinado (+2) no Goukakyu, rank C → 11 + 2 + 3 + 2 = 18', () => {
		const dt = dtDoLancador('C', 'Ninjutsu', { CTR: 3 }, 2);
		expect(dt.total).toBe(18);
		expect(dt.partes.map((p) => p.valor)).toEqual([11, 2, 3, 2]);
	});
	it('Fuuinjutsu usa CTR; Bukijutsu, o maior entre FOR e AGI; tipo desconhecido, CTR', () => {
		expect(dtDoLancador('B', 'Fuuinjutsu', { CTR: 3, INT: 2 }).total).toBe(17);
		expect(dtDoLancador('D', 'Bukijutsu', { FOR: 1, AGI: 3 }).total).toBe(15);
		expect(dtDoLancador('E', 'Clã', { CTR: 2 }).total).toBe(13);
	});
	it('a criatura do bestiário usa a ficha dela: Uchiha Chunin, Goukakyu (C, CTR +1, sem proficiência) → 14', () => {
		const uchiha = (bestiario as unknown as { criaturas: Criatura[] }).criaturas.find((c) => c.slug === 'cla-uchiha')!;
		const k = uchiha.estagios.find((e) => e.slug === 'chunin')!.combate;
		const goukakyu = k.jutsus.find((j) => j.slug === 'katon-goukakyu-no-jutsu')!;
		expect(dtNaFichaDaCriatura(k.ficha!, goukakyu)?.total).toBe(14);
	});
	it('troca "DT do Jutsu" pelo número na Resistência', () => {
		expect(comDt('Acrobacia (DT do Jutsu)', dtDoLancador('C', 'Ninjutsu', { CTR: 3 }, 2))).toBe('Acrobacia (DT 18)');
	});
	it('só pede a DT quem tem Resistência ou fala de DT no efeito (o Konoha Reppuu não)', () => {
		expect(pedeDt('—', '1d6 + FOR de dano, e o alvo cai (Caído).')).toBe(false);
		expect(pedeDt('', '')).toBe(false);
		expect(pedeDt('Acrobacia (DT do Jutsu)', '')).toBe(true);
		expect(pedeDt('—', 'é preciso um teste de Percepção contra a DT do Jutsu para perceber')).toBe(true);
	});
});
