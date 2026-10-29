import { describe, expect, it } from 'vitest';
import bestiario from '#lib/livro/gerado/bestiario.json';
import type { Criatura } from '#lib/livro/tipos.ts';
import { estiloFoco, focoDaArte, focoPadrao, retanguloFoco, enquadramentoDoFoco } from './foco.ts';

describe('foco das artes do bestiário', () => {
	it('toda arte do bestiário tem foco no mapa', () => {
		const artes = new Set<string>();
		for (const c of (bestiario as unknown as { criaturas: Criatura[] }).criaturas) {
			if (c.arte?.arquivo) artes.add(c.arte.arquivo);
			for (const e of c.estagios) if (e.arte?.arquivo) artes.add(e.arte.arquivo);
		}
		const sem = [...artes].filter((a) => !focoPadrao(a));
		expect(sem).toEqual([]);
	});

	it('ignora ?v= e o que não é do bestiário', () => {
		expect(focoPadrao('/bestiario/ursos.png?v=3')).toEqual(focoPadrao('/bestiario/ursos.png'));
		expect(focoPadrao('retratos/abc/x.webp')).toBeNull();
		expect(focoPadrao(null)).toBeNull();
	});

	it('o ajuste do Mestre troca o ponto e o zoom, não as dimensões', () => {
		const p = focoPadrao('/bestiario/ursos.png')!;
		const f = focoDaArte('/bestiario/ursos.png', { x: 0.1, y: 0.9, zoom: 3 })!;
		expect(f).toEqual({ ...p, x: 0.1, y: 0.9, zoom: 3 });
		expect(focoDaArte('/bestiario/ursos.png', { x: Number.NaN } as never)).toEqual(p);
	});

	it('a imagem sempre cobre o quadrado do token', () => {
		for (const f of [
			{ x: 0, y: 0, zoom: 1, w: 128, h: 192 },
			{ x: 1, y: 1, zoom: 2.5, w: 256, h: 96 },
			{ x: 0.5, y: 0.3, zoom: 0.5, w: 176, h: 176 }
		]) {
			const r = retanguloFoco(f, 5, 5, 2);
			expect(r.x).toBeLessThanOrEqual(4);
			expect(r.y).toBeLessThanOrEqual(4);
			expect(r.x + r.w).toBeGreaterThanOrEqual(6 - 1e-9);
			expect(r.y + r.h).toBeGreaterThanOrEqual(6 - 1e-9);
		}
	});

	it('o ponto de foco fica no centro quando há espaço', () => {
		const f = { x: 0.5, y: 0.3, zoom: 2, w: 128, h: 192 };
		const r = retanguloFoco(f, 0, 0, 1);
		expect(r.w).toBeCloseTo(2);
		expect(r.x + f.x * r.w).toBeCloseTo(0);
		expect(r.y + f.y * r.h).toBeCloseTo(0);
		expect(estiloFoco(f)).toContain('width:200%');
	});
});

describe('retrato a partir de uma arte do bestiário', () => {
	it('o foco vai para o meio do quadrado, no zoom da arte', () => {
		// arte 128×192 (retrato), foco no rosto (meio, a 25% do alto), zoom 1,5
		const e = enquadramentoDoFoco({ x: 0.5, y: 0.25, zoom: 1.5 }, { naturalWidth: 128, naturalHeight: 192 });
		expect(e.zoom).toBe(1.5);
		expect(e.x).toBeCloseTo(0);
		// a imagem tem 2,25 lados de altura; subir o foco de 25% para o meio desloca 0,5625 lado para baixo
		expect(e.y).toBeCloseTo(2.25 * 0.25);
	});
	it('zoom abaixo de 1 vira 1 (a imagem sempre cobre o quadrado)', () => {
		expect(enquadramentoDoFoco({ x: 0.5, y: 0.5, zoom: 0.6 }, { naturalWidth: 100, naturalHeight: 100 })).toEqual({ zoom: 1, x: 0, y: 0 });
	});
});
