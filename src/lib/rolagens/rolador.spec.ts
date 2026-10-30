import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn(async (_nome: string, _args: Record<string, unknown>) => ({ data: null, error: { message: 'X' } }));
vi.mock('#lib/supabase/cliente.ts', () => ({ supabase: () => ({ rpc }) }));
vi.mock('#lib/estado/toasts.svelte.ts', () => ({ toasts: { mostrar: () => {} } }));
vi.stubGlobal('matchMedia', () => ({ matches: true }));

const { rolador } = await import('./rolador.svelte.ts');
const enviado = () => rpc.mock.calls.at(-1)![1] as { modo: string; rotulo: string };

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
