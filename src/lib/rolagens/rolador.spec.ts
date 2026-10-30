import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Rolagem } from '#lib/supabase/banco.ts';

let resposta: (args: Record<string, unknown>) => { data: unknown; error: unknown } = () => ({ data: null, error: { message: 'X' } });
const rpc = vi.fn(async (_nome: string, args: Record<string, unknown>) => resposta(args));
vi.mock('#lib/supabase/cliente.ts', () => ({ supabase: () => ({ rpc }) }));
vi.mock('#lib/estado/toasts.svelte.ts', () => ({ toasts: { mostrar: () => {} } }));
// "menos movimento" ligado = aviso em pixel; desligado = dados 3D
let poucoMovimento = true;
vi.stubGlobal('matchMedia', () => ({ matches: poucoMovimento }));

const { rolador } = await import('./rolador.svelte.ts');
const enviado = () => rpc.mock.calls.at(-1)![1] as { modo: string; rotulo: string };
let n = 0;
const rolagem = (autor: string, rotulo = 'Ataque'): Rolagem => ({ id: `r${++n}`, autor_id: autor, rotulo, campanha_id: 'c' }) as unknown as Rolagem;
const noRegistro = (r: Rolagem) => rolador.recentes.some((x) => x.id === r.id);

describe('crítico escolhido na setinha do DANO', () => {
	beforeEach(() => {
		rpc.mockClear();
		rolador.critico = null;
	});
	it('crítico: a próxima rolagem de dano sai com os dados dobrados e o rótulo diz "(crítico)"', async () => {
		rolador.critico = true;
		await rolador.rolar({ campanha: 'c', expressao: '2d6+3', rotulo: 'Dano · Kunai', tipo: 'dano' });
		expect(enviado()).toMatchObject({ modo: 'critico', rotulo: 'Dano · Kunai (crítico)' });
		// vale uma vez só
		await rolador.rolar({ campanha: 'c', expressao: '2d6+3', rotulo: 'Dano · Kunai', tipo: 'dano' });
		expect(enviado()).toMatchObject({ modo: 'normal', rotulo: 'Dano · Kunai' });
	});
	it('sem crítico: vence o 20 natural do último ataque', async () => {
		rolador.critico = false;
		await rolador.rolar({ campanha: 'c', expressao: '2d6', rotulo: 'Dano · Kunai (crítico)', tipo: 'dano', critico: true });
		expect(enviado()).toMatchObject({ modo: 'normal', rotulo: 'Dano · Kunai' });
	});
	it('não mexe no ataque nem na cura, e some depois de 5 s', async () => {
		rolador.critico = true;
		await rolador.rolar({ campanha: 'c', expressao: '1d20+4', rotulo: 'Ataque', tipo: 'ataque', d20: true });
		expect(enviado().modo).toBe('normal');
		expect(rolador.critico).toBe(true);
		vi.useFakeTimers();
		vi.setSystemTime(Date.now() + 6000);
		expect(rolador.critico).toBeNull();
		vi.useRealTimers();
	});
});

describe('duas rolagens ao mesmo tempo', () => {
	beforeEach(() => {
		rpc.mockClear();
		poucoMovimento = false;
		rolador.estilo = '3d';
		rolador.critico = null;
	});
	afterEach(() => {
		rolador.escolherEstilo('pixel');
		poucoMovimento = true;
		vi.useRealTimers();
	});

	it('os dados 3D jogam uma de cada vez, na ordem, e nenhuma some', () => {
		const a = rolagem('ana');
		const b = rolagem('bia');
		rolador.receber(a, true);
		rolador.receber(b, true);
		expect(rolador.lance?.r.id).toBe(a.id);
		expect(rolador.temFila).toBe(true);
		// o resultado só entra no registro quando os dados param
		expect(noRegistro(a) || noRegistro(b)).toBe(false);
		rolador.liberar(a.id);
		rolador.proximo();
		expect(rolador.lance?.r.id).toBe(b.id);
		expect(noRegistro(a)).toBe(true);
		rolador.liberar(b.id);
		rolador.proximo();
		expect(rolador.lance).toBeNull();
		expect(noRegistro(b)).toBe(true);
	});

	it('dados que não avisam que pararam não travam a fila: em 10 s a rolagem sai e a próxima joga', () => {
		vi.useFakeTimers();
		const a = rolagem('ana');
		const b = rolagem('bia');
		rolador.receber(a, true);
		rolador.receber(b, true);
		vi.advanceTimersByTime(10_000);
		expect(noRegistro(a)).toBe(true);
		expect(rolador.lance?.r.id).toBe(b.id);
	});

	it('muita gente rolando junto: a fila guarda 4; a mais antiga que esperava vai direto para o registro', () => {
		const rs = Array.from({ length: 6 }, (_, i) => rolagem(`p${i}`));
		for (const r of rs) rolador.receber(r, true);
		expect(rolador.lance?.r.id).toBe(rs[0].id);
		expect(noRegistro(rs[1])).toBe(true);
		expect(rs.slice(2).some(noRegistro)).toBe(false);
	});

	it('minha segunda rolagem não se perde enquanto a primeira está a caminho; o clique duplo vale uma vez', async () => {
		poucoMovimento = true;
		resposta = (args) => ({ data: { ...rolagem('eu', args.rotulo as string), detalhe: [] }, error: null });
		const ataque = rolador.rolar({ campanha: 'c', expressao: '1d20+3', rotulo: 'Ataque', tipo: 'ataque', d20: true });
		const dano = rolador.rolar({ campanha: 'c', expressao: '1d6+2', rotulo: 'Dano', tipo: 'dano' });
		const duplo = rolador.rolar({ campanha: 'c', expressao: '1d6+2', rotulo: 'Dano', tipo: 'dano' });
		const [x, y, z] = await Promise.all([ataque, dano, duplo]);
		expect(x?.rotulo).toBe('Ataque');
		expect(y?.rotulo).toBe('Dano');
		expect(z).toBeNull();
		expect(rpc).toHaveBeenCalledTimes(2);
		expect(rolador.rolando).toBeNull();
	});
});
