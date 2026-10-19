// Rolador da campanha: manda a expressão para rolar() (o sorteio é no servidor), anima o dado e guarda as rolagens
// recentes que chegam ao vivo (Realtime) para o registro e para o aviso na tela.
import { gravar, ler } from '#lib/estado/armazenamento.ts';
import { toasts } from '#lib/estado/toasts.svelte.ts';
import { supabase } from '#lib/supabase/cliente.ts';
import type { ModoRolagem, Rolagem } from '#lib/supabase/banco.ts';

export interface PedidoRolagem {
	campanha: string;
	expressao: string;
	rotulo: string;
	personagem?: string | null;
	/** NPC da campanha (só o Mestre): a rolagem sai no nome dele. */
	npc?: string | null;
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
	/** Lados do primeiro dado da rolagem em andamento (a arte que gira). */
	ladosRolando = $state(20);
	/** Rolagem mostrada no aviso da tela (a minha ou a de outra pessoa da mesa). */
	aviso = $state<Rolagem | null>(null);
	/** Rolagens desta sessão, mais novas primeiro (as minhas e as que chegaram ao vivo). */
	recentes = $state<Rolagem[]>([]);
	/** Campanha acompanhada no painel de rolagens (a última aberta), em qualquer tela do site. */
	mesa = $state<{ id: string; nome: string } | null>(null);
	/** Painel flutuante do registro aberto. */
	painel = $state(false);
	/** Rolagens da mesa que chegaram com o painel fechado. */
	naoVistas = $state(0);

	private temporizador: ReturnType<typeof setTimeout> | undefined;

	async rolar(p: PedidoRolagem): Promise<Rolagem | null> {
		if (this.rolando) return null;
		this.rolando = p.rotulo;
		this.ladosRolando = Number(/\d+d(\d+)/i.exec(p.expressao)?.[1] ?? 20);
		this.aviso = null;
		const modo: ModoRolagem = p.critico ? 'critico' : p.d20 ? this.modo : 'normal';
		const [{ data, error }] = await Promise.all([
			supabase().rpc('rolar', { campanha: p.campanha, expressao: p.expressao, rotulo: p.rotulo, personagem: p.personagem ?? null, modo, oculta: this.oculta, npc: p.npc ?? null }),
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

	/** Lê a última campanha acompanhada (no navegador). */
	iniciarMesa() {
		const m = ler<{ id: string; nome: string } | null>('mesa', null);
		if (m && /^[0-9a-f-]{36}$/i.test(m.id)) this.mesa = m;
		this.painel = ler('painel-rolagens', false);
	}

	definirMesa(m: { id: string; nome: string }) {
		if (this.mesa?.id !== m.id) this.naoVistas = 0;
		this.mesa = m;
		gravar('mesa', m);
	}

	alternarPainel(aberto = !this.painel) {
		this.painel = aberto;
		if (aberto) this.naoVistas = 0;
		gravar('painel-rolagens', aberto);
	}

	/** Uma rolagem nova (minha, ou de outra pessoa pelo Realtime). */
	receber(r: Rolagem, mostrar: boolean) {
		if (!this.recentes.some((x) => x.id === r.id)) {
			this.recentes = [r, ...this.recentes].slice(0, 100);
			if (mostrar && !this.painel) this.naoVistas++;
		}
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
