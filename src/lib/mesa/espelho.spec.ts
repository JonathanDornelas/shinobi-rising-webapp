import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MesaToken } from '#lib/supabase/banco.ts';
import { camposDe, chaveDe, Frescos, parteDaCena, parteDoToken, TETO_DO_ESPELHO, tokenPublico } from './espelho.ts';

describe('o que passa pelo canal', () => {
	it('do token, só o que o grupo pode ver: PV, nome e visibilidade ficam para o banco', () => {
		expect(parteDoToken({ x: 3, y: 4, pv: 12, pv_max: 40, nome: 'Zabuza', sigla: 'ZA', visivel: true, dono_id: 'u' })).toEqual({ x: 3, y: 4 });
		expect(parteDoToken({ pv: 12 })).toBeNull();
	});

	it('o que chega com a forma errada não entra', () => {
		expect(parteDoToken({ x: '3', y: Infinity, rumo: 9, tamanho: 2, condicoes: [1], luz: { plena: 'x' } })).toBeNull();
		expect(parteDoToken({ rumo: 7, tamanho: 3, tamanho_base: null, luz: null, condicoes: ['caido'] })).toEqual({ rumo: 7, tamanho: 3, tamanho_base: null, luz: null, condicoes: ['caido'] });
		expect(parteDoToken(null)).toBeNull();
	});

	it('da cena, o nome do Mestre e a troca de cena ficam de fora', () => {
		expect(parteDaCena({ nome: 'Emboscada no fim', nome_publico: 'Estrada', ativa: true, luz_dinamica: false })).toEqual({ luz_dinamica: false });
		expect(parteDaCena({ nome: 'x' })).toBeNull();
	});

	it('uma mudança grande demais espera o banco', () => {
		expect(parteDaCena({ paredes: Array.from({ length: TETO_DO_ESPELHO }, () => [0, 0, 1, 1, 0]) })).toBeNull();
	});

	it('um token inteiro vai sem os números de PV', () => {
		const t = tokenPublico({ id: 'a', pv: 12, pv_max: 40, x: 1 } as MesaToken);
		expect(t).toMatchObject({ id: 'a', pv: null, pv_max: null, x: 1 });
	});

	it('o caminho de volta traz só as colunas do patch', () => {
		expect(camposDe({ x: 1, y: 2, nome: 'a' }, { x: 9 })).toEqual({ x: 1 });
	});
});

describe('o valor como texto', () => {
	it('o jsonb devolve as chaves em outra ordem, e continua o mesmo valor', () => {
		expect(chaveDe({ vez: 1, ordem: [{ b: 1, a: 2 }] })).toBe(chaveDe({ ordem: [{ a: 2, b: 1 }], vez: 1 }));
		expect(chaveDe([1, 2])).not.toBe(chaveDe([2, 1]));
	});
});

describe('um aviso atrasado do banco', () => {
	beforeEach(() => void vi.useFakeTimers());
	afterEach(() => void vi.useRealTimers());

	it('não desfaz o que acabou de chegar, e o resto dele vale', () => {
		const f = new Frescos();
		f.marcar('t', { x: 5 });
		const { linha } = f.filtrar('t', { x: 1, ferimento: 2 }, { x: 5, ferimento: 0 });
		expect(linha).toEqual({ x: 5, ferimento: 2 });
	});

	it('o aviso que confirma limpa a espera, e o seguinte vale inteiro', () => {
		const f = new Frescos();
		f.marcar('t', { x: 5 });
		expect([...f.filtrar('t', { x: 5 }, { x: 5 }).confirmados]).toEqual(['x']);
		expect(f.filtrar('t', { x: 8 }, { x: 5 }).linha).toEqual({ x: 8 });
	});

	it('duas mudanças seguidas: o eco da primeira não aparece', () => {
		const f = new Frescos();
		f.marcar('t', { luz_ambiente: 'penumbra' });
		f.marcar('t', { luz_ambiente: 'escuro' });
		expect(f.filtrar('t', { luz_ambiente: 'penumbra' }, { luz_ambiente: 'escuro' }).linha).toEqual({ luz_ambiente: 'escuro' });
		expect([...f.filtrar('t', { luz_ambiente: 'escuro' }, { luz_ambiente: 'escuro' }).confirmados]).toEqual(['luz_ambiente']);
	});

	it('se o banco não confirmar, vale o que ele disser depois da janela', () => {
		const f = new Frescos();
		f.marcar('t', { x: 5 });
		vi.advanceTimersByTime(4100);
		expect(f.filtrar('t', { x: 1 }, { x: 5 }).linha).toEqual({ x: 1 });
	});

	it('o aviso não é modificado, e uma linha nova passa', () => {
		const f = new Frescos();
		f.marcar('t', { x: 5 });
		const aviso = { x: 1 };
		expect(f.filtrar('t', aviso, undefined).linha).toEqual({ x: 1 });
		expect(aviso).toEqual({ x: 1 });
		expect(f.filtrar('outro', aviso, undefined).linha).toBe(aviso);
	});

	it('conta quanto o banco levou para confirmar', () => {
		const tempos: number[] = [];
		const f = new Frescos((ms) => tempos.push(ms));
		f.marcar('t', { x: 5 });
		vi.advanceTimersByTime(640);
		f.filtrar('t', { x: 5 }, { x: 5 });
		expect(tempos).toEqual([640]);
	});
});
