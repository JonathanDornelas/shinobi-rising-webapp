import { describe, expect, it } from 'vitest';
import { Amostras, MedidorDeRede, Sequencias, emMs, textoDaRede } from './rede.ts';

const carimbo = (n: number, ep = 'a', de = 'ana') => ({ de, ep, n });

describe('as mensagens numeradas', () => {
	it('não acusa nada enquanto elas chegam na ordem', () => {
		const s = new Sequencias();
		for (let n = 1; n < 6; n++) expect(s.conferir(carimbo(n))).toEqual({ velha: false, perdidas: 0 });
	});

	it('conta o que faltou', () => {
		const s = new Sequencias();
		s.conferir(carimbo(1));
		expect(s.conferir(carimbo(5))).toEqual({ velha: false, perdidas: 3 });
		expect(s.conferir(carimbo(6))).toEqual({ velha: false, perdidas: 0 });
	});

	it('recusa a que chega depois de uma mais nova, e a repetida', () => {
		const s = new Sequencias();
		s.conferir(carimbo(4));
		expect(s.conferir(carimbo(3)).velha).toBe(true);
		expect(s.conferir(carimbo(4)).velha).toBe(true);
		expect(s.conferir(carimbo(5))).toEqual({ velha: false, perdidas: 0 });
	});

	it('cada pessoa tem a sua conta', () => {
		const s = new Sequencias();
		s.conferir(carimbo(9, 'a', 'ana'));
		expect(s.conferir(carimbo(1, 'b', 'bruno'))).toEqual({ velha: false, perdidas: 0 });
		expect(s.conferir(carimbo(10, 'a', 'ana'))).toEqual({ velha: false, perdidas: 0 });
	});

	it('quem reconectou recomeça do zero, sem contar como perda', () => {
		const s = new Sequencias();
		s.conferir(carimbo(40, 'antes'));
		expect(s.conferir(carimbo(1, 'depois'))).toEqual({ velha: false, perdidas: 0 });
		expect(s.conferir(carimbo(2, 'depois'))).toEqual({ velha: false, perdidas: 0 });
	});

	it('quem caiu aqui não acusa o que perdeu enquanto estava fora', () => {
		const s = new Sequencias();
		s.conferir(carimbo(3));
		s.esquecer();
		expect(s.conferir(carimbo(30))).toEqual({ velha: false, perdidas: 0 });
	});

	it('um número absurdo não faz ninguém ignorar quem manda de verdade', () => {
		const s = new Sequencias();
		s.conferir(carimbo(5));
		expect(s.conferir(carimbo(9_000_000))).toEqual({ velha: false, perdidas: 0 });
		expect(s.conferir(carimbo(6))).toEqual({ velha: false, perdidas: 0 });
	});

	it('a mensagem sem número, de uma aba antiga, vale como sempre valeu', () => {
		const s = new Sequencias();
		for (const qualquer of [undefined, null, 'x', {}, { de: 'ana', ep: 'a', n: 1.5 }]) expect(s.conferir(qualquer)).toEqual({ velha: false, perdidas: 0 });
	});
});

describe('as medidas', () => {
	it('dá a mediana e o p95, e guarda só as últimas', () => {
		const a = new Amostras(4);
		expect(a.quantil(0.5)).toBeNull();
		for (const v of [900, 10, 20, 30, 40]) a.somar(v);
		expect(a.quantas).toBe(4);
		expect(a.quantil(0.5)).toBe(30);
		expect(a.quantil(0.95)).toBe(40);
	});

	it('resume a rede, sem quem parou de responder', () => {
		const m = new MedidorDeRede();
		m.ida('ana', 40, 1000);
		m.ida('ana', 60, 2000);
		m.ida('bruno', 90, 2000);
		m.ida('foi-embora', 10, 0);
		for (let t = 0; t < 30; t++) m.enviou(30_000 + t);
		m.enviou(1000);
		const r = m.resumo(31_000);
		expect(r.pessoas).toEqual([
			{ usuario: 'bruno', ms: 90 },
			{ usuario: 'ana', ms: 60 }
		]);
		expect(r.porSegundo).toBe(3);
	});

	it('escreve os números para colar numa conversa', () => {
		const m = new MedidorDeRede();
		m.ida('u1', 41.6, 0);
		m.confirmacao.somar(320);
		m.servidor = 18;
		m.perdidas = 2;
		const texto = textoDaRede(m.resumo(10), (u) => (u === 'u1' ? 'Ana' : u));
		expect(texto).toContain('servidor 18 ms');
		expect(texto).toContain('Ana 42 ms');
		expect(texto).toContain('banco 320 ms');
		expect(texto).toContain('2 perdidas');
		expect(emMs(null)).toBe('sem medida');
	});
});
