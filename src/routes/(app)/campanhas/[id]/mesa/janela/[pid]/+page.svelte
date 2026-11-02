<script lang="ts">
	// A ficha completa numa janela à parte (o segundo monitor), ligada à Mesa pela ponte (ponte-ficha.ts): MEDIR, ATAQUE e
	// DANO vão para a Mesa que a abriu, com a régua, os alvos e o crítico dela; o estado vai e volta. Sem a Mesa aberta, a
	// ficha usa e rola sozinha, como na página da ficha.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import FichaCompleta, { type JutsusNaMesa } from '#lib/componentes/mesa/FichaCompleta.svelte';
	import { abrirPonte, temPonte, type AcaoPonte, type MsgPonte } from '#lib/mesa/ponte-ficha.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import type { EstadoJogo } from '#lib/personagem/progressao.ts';

	const campanha = page.params.id!;
	const pid = page.params.pid!;
	const aba = page.url.searchParams.get('aba');
	let ligada = $state(false);
	let estado = $state<EstadoJogo | null>(null);
	let nome = $state('Ficha');
	let ponte: BroadcastChannel | null = null;
	/** Pedidos à Mesa esperando o "feito". */
	const esperando = new Map<string, (ok: boolean) => void>();

	function pedir(acao: AcaoPonte, alvo: string, parte?: 'ataque' | 'dano'): Promise<boolean> {
		if (!ponte || !ligada) return Promise.resolve(false);
		const id = crypto.randomUUID();
		// a setinha (vantagem, crítico) mexeu no rolador desta janela: vale na Mesa, e aqui volta ao normal
		const { modo, critico } = rolador;
		rolador.modo = 'normal';
		rolador.critico = null;
		ponte.postMessage({ tipo: 'acao', id, pid, aba, acao, alvo, parte, modo, critico } satisfies MsgPonte);
		// sem resposta: a Mesa pode ter feito (ela responde antes de rolar); a ficha não rola sozinha, para não rolar duas vezes
		return new Promise((ok) => {
			esperando.set(id, ok);
			setTimeout(() => {
				if (!esperando.delete(id)) return;
				ligada = false;
				toasts.mostrar('A Mesa não respondeu. Confira lá se a ação aconteceu antes de repetir.', 'aviso');
				ok(true);
			}, 6000);
		});
	}
	const semMesa = (ok: boolean) => ok || toasts.mostrar('A Mesa não respondeu. Abra a Mesa desta campanha neste navegador.', 'aviso');
	const naMesa: JutsusNaMesa = {
		medir: (slug) => void pedir('medir', slug).then(semMesa),
		usar: (slug, parte) => pedir('usar', slug, parte),
		medirArma: (arma) => void pedir('medirArma', arma).then(semMesa),
		atacar: (arma, parte) => void pedir('atacar', arma, parte).then(semMesa)
	};

	function ouvir(m: MsgPonte) {
		if (m.tipo === 'aqui' && m.pid === pid && (!aba || m.aba === aba)) {
			ligada = true;
			if (m.estado) estado = m.estado;
		} else if (m.tipo === 'feito') {
			esperando.get(m.id)?.(m.ok);
			esperando.delete(m.id);
		} else if (m.tipo === 'estado' && m.pid === pid && m.de === 'mesa') estado = m.estado;
		else if (m.tipo === 'tchau' && (!aba || m.aba === aba)) ligada = false;
	}
	function mudouEstado(e: EstadoJogo) {
		estado = e;
		if (ligada) ponte?.postMessage({ tipo: 'estado', pid, estado: e, de: 'ficha' } satisfies MsgPonte);
	}

	onMount(() => {
		if (!temPonte()) return;
		ponte = abrirPonte(campanha);
		ponte.onmessage = (e) => ouvir(e.data as MsgPonte);
		const ola = () => ponte?.postMessage({ tipo: 'ola', pid, aba } satisfies MsgPonte);
		ola();
		// sem a Mesa (fechada ou recarregando), procura de novo de tempos em tempos
		const busca = setInterval(() => !ligada && ola(), 4000);
		return () => {
			clearInterval(busca);
			ponte?.close();
			ponte = null;
		};
	});
</script>

<svelte:head><title>{nome} · Ficha na Mesa</title></svelte:head>

<FichaCompleta {campanha} {pid} min={false} {estado} {naMesa} janela={{ ligada }} aoEstado={mudouEstado} aoMinimizar={() => {}} aoFechar={() => window.close()} aoCarregar={(n) => (nome = n)} />
