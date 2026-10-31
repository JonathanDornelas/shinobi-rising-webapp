import { describe, expect, it } from 'vitest';
import { avancarRodada, marcarAte, novoRelogio, relogiosDaCena } from './relogios.ts';

describe('relógios da cena', () => {
	it('lê só o que está em ordem, com os números dentro dos limites', () => {
		expect(relogiosDaCena(null)).toEqual([]);
		expect(relogiosDaCena([{ id: 'a', nome: 'Ponte', total: 30, marcados: 40, rodada: 1 }, { id: '', nome: 'x' }, 'lixo'])).toEqual([{ id: 'a', nome: 'Ponte', total: 12, marcados: 12, rodada: true }]);
	});
	it('rodada nova marca os que contam rodadas; os cheios ficam; sem nada para andar, null', () => {
		const ponte = { ...novoRelogio('A ponte cai', 3, true), marcados: 2 };
		const cheio = { ...novoRelogio('Cheio', 2, true), marcados: 2 };
		const manual = novoRelogio('Alarme', 4, false);
		expect(avancarRodada([ponte, cheio, manual])).toEqual([{ ...ponte, marcados: 3 }, cheio, manual]);
		expect(avancarRodada([cheio, manual])).toBeNull();
	});
	it('clicar num segmento marca até ele; no último marcado, desmarca', () => {
		const r = { ...novoRelogio('Alarme', 4, false), marcados: 2 };
		expect(marcarAte(r, 3).marcados).toBe(4);
		expect(marcarAte(r, 1).marcados).toBe(1);
		expect(marcarAte(r, 0).marcados).toBe(1);
	});
});
