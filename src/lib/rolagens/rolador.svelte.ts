// Rolador da campanha: manda a expressão para rolar() (o sorteio é no servidor), anima o dado e guarda as rolagens
// recentes que chegam ao vivo (Realtime) para o registro e para o aviso na tela.
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { ModoRolagem, Rolagem } from '#lib/supabase/banco.ts';

export interface PedidoRolagem {
	campanha: string;
	expressao: string;
	rotulo: string;
	personagem?: string | null;
	/** Teste com d20: usa o modo escolhido na barra (vantagem/desvantagem) e volta para Normal depois. */
	d20?: boolean;
	/** Dano de acerto crítico: os dados dobram (cap. 4). */
	critico?: boolean;
}

/** Duração mínima da animação do dado, para o resultado não "piscar". */
const GIRO = 900;
const AVISO = 7000;

class Rolador {
	modo = $state<Exclude<ModoRolagem, 'critico'>>('normal');
	oculta = $state(false);
	/** Rótulo da rolagem em andamento (o dado gira). */
	rolando = $state<string | null>(null);
	/** Rolagem mostrada no aviso da tela (a minha ou a de outra pessoa da mesa). */
	aviso = $state<Rolagem | null>(null);
	/** Rolagens desta sessão, mais novas primeiro (as minhas e as que chegaram ao vivo). */
	recentes = $state<Rolagem[]>([]);

	private temporizador: ReturnType<typeof setTimeout> | undefined;

	async rolar(p: PedidoRolagem): Promise<Rolagem | null> {
		if (this.rolando) return null;
		this.rolando = p.rotulo;
		this.aviso = null;
		const modo: ModoRolagem = p.critico ? 'critico' : p.d20 ? this.modo : 'normal';
		const [{ data, error }] = await Promise.all([
			supabase().rpc('rolar', { campanha: p.campanha, expressao: p.expressao, rotulo: p.rotulo, personagem: p.personagem ?? null, modo, oculta: this.oculta }),
			new Promise((ok) => setTimeout(ok, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : GIRO))
		]);
		this.rolando = null;
		if (error || !data) {
			toasts.mostrar(error?.message && !/^[A-Z_]+$/.test(error.message) ? error.message : 'Não foi possível rolar. Confira a conexão.', 'erro');
			return null;
		}
		if (p.d20) this.modo = 'normal';
		this.receber(data, true);
		return data;
	}

	/** Uma rolagem nova (minha, ou de outra pessoa pelo Realtime). */
	receber(r: Rolagem, mostrar: boolean) {
		if (!this.recentes.some((x) => x.id === r.id)) this.recentes = [r, ...this.recentes].slice(0, 100);
		if (!mostrar || this.rolando) return;
		this.aviso = r;
		clearTimeout(this.temporizador);
		this.temporizador = setTimeout(() => (this.aviso = null), AVISO);
	}

	esquecer(id: string) {
		this.recentes = this.recentes.filter((r) => r.id !== id);
		if (this.aviso?.id === id) this.aviso = null;
	}

	dispensar() {
		clearTimeout(this.temporizador);
		this.aviso = null;
	}
}

export const rolador = new Rolador();
