import { describe, expect, it } from 'vitest';
import { ATRASO_DO_FANTASMA, LONGE_DEMAIS, Trilha, noDeslize, tempoDoDeslize } from './interpolacao.ts';

const D = ATRASO_DO_FANTASMA;

describe('o fantasma do arrasto', () => {
	it('desliza entre duas posições que existiram, um pouco atrás', () => {
		const t = new Trilha();
		t.somar(0, 0, 1000);
		t.somar(4, 8, 1125);
		expect(t.em(1000 + D).x).toBe(0);
		expect(t.em(1062.5 + D)).toMatchObject({ x: 2, y: 4, parado: false });
		expect(t.em(1125 + D)).toMatchObject({ x: 4, y: 8, parado: true });
	});

	it('anda em passos pequenos, e não aos saltos de quem chega', () => {
		const t = new Trilha();
		for (let i = 0; i < 9; i++) t.somar(i * 2, 0, 1000 + i * 125);
		const saltos: number[] = [];
		let antes = t.em(1000 + D).x;
		for (let agora = 1000 + D; agora < 2000 + D; agora += 1000 / 60) {
			const { x } = t.em(agora);
			saltos.push(x - antes);
			antes = x;
		}
		expect(Math.max(...saltos)).toBeLessThan(0.3);
		expect(antes).toBeCloseTo(16, 0);
	});

	it('nunca passa do que chegou: não adivinha', () => {
		const t = new Trilha();
		t.somar(0, 0, 1000);
		t.somar(5, 0, 1125);
		expect(t.em(5000)).toMatchObject({ x: 5, parado: true });
	});

	it('sobrevive a uma mensagem perdida, sem pular', () => {
		const t = new Trilha();
		t.somar(0, 0, 1000);
		t.somar(2, 0, 1125);
		// a de 1250 não veio
		t.somar(6, 0, 1375);
		expect(t.em(1250 + D).x).toBeCloseTo(4, 5);
	});

	it('quem parou e voltou a arrastar sai de onde estava', () => {
		const t = new Trilha();
		t.somar(3, 3, 1000);
		t.em(1000 + D + 10);
		t.somar(7, 3, 5000);
		expect(t.em(4999).x).toBe(3);
		expect(t.em(5000 + D)).toMatchObject({ x: 7, parado: true });
	});

	it('sem atraso, fica na última posição', () => {
		const t = new Trilha(0);
		t.somar(1, 1, 1000);
		t.somar(9, 9, 1125);
		expect(t.em(1125)).toMatchObject({ x: 9, y: 9, parado: true });
	});

	it('não guarda o caminho inteiro', () => {
		const t = new Trilha();
		for (let i = 0; i < 500; i++) {
			t.somar(i, 0, i * 125);
			t.em(i * 125);
		}
		expect((t as unknown as { pontos: unknown[] }).pontos.length).toBeLessThan(6);
	});
});

describe('o token que chega', () => {
	it('sai de onde estava e para no destino', () => {
		const d = { de: { x: 0, y: 0 }, para: { x: 4, y: 2 }, t0: 100, duracao: 200 };
		expect(noDeslize(d, 100)).toEqual({ x: 0, y: 0 });
		const meio = noDeslize(d, 200)!;
		expect(meio.x).toBeGreaterThan(2);
		expect(meio.x).toBeLessThan(4);
		expect(noDeslize(d, 300)).toBeNull();
	});

	it('um passo é rápido, e uma corrida tem um teto', () => {
		expect(tempoDoDeslize(1)).toBe(150);
		expect(tempoDoDeslize(LONGE_DEMAIS)).toBe(320);
	});
});
