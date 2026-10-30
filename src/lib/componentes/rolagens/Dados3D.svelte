<script lang="ts">
	// Dados 3D na tela inteira (escolha "3D" no rolador): os dados caem por cima de tudo sem bloquear cliques, param
	// no valor sorteado no servidor, do mesmo jeito em todas as telas, e a legenda mostra quem rolou e o total.
	// Depois de uns segundos, tudo some.
	// Sem WebGL (ou se a biblioteca falhar), a rolagem volta para o aviso em pixel.
	import { onMount, untrack } from 'svelte';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { conta, destaque } from '#lib/rolagens/expressoes.ts';
	import { corDaRolagem } from '#lib/rolagens/registro.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';

	/** Quanto tempo os dados ficam parados na mesa com a legenda. */
	const FICA = 2800;
	const SUMIR = 400;
	/** Com outras rolagens na fila, a legenda fica só este tanto antes dos próximos dados caírem. */
	const NA_FILA = 900;

	let camada = $state<HTMLDivElement>();
	let visivel = $state(false);
	let legenda = $state<Rolagem | null>(null);
	let vez = 0;
	let tempo: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const l = rolador.lance;
		if (l) untrack(() => jogar(l.r));
	});

	// a biblioteca, as texturas, os sons e os shaders ficam prontos com a tela parada, antes da primeira rolagem: sem
	// isso, o primeiro dado demora a cair (baixa tudo na hora) e engasga
	onMount(() => {
		if (!rolador.usar3d) return;
		const ocioso = (f: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(f, { timeout: 4000 }) : setTimeout(f, 1500));
		ocioso(() => {
			if (!rolador.usar3d || rolador.lance) return;
			void import('#lib/rolagens/dados3d.ts').then((m) => m.temWebgl() && m.preaquecer(camada!, rolador.som)).catch(() => null);
		});
	});

	async function jogar(r: Rolagem) {
		const minha = ++vez;
		clearTimeout(tempo);
		legenda = null;
		visivel = true;
		try {
			const { lancar, limpar, temWebgl } = await import('#lib/rolagens/dados3d.ts');
			if (!temWebgl()) throw new Error('sem WebGL');
			// a semente é o id da rolagem: a mesma queda em todas as telas da mesa
			const rolou = await lancar(camada!, r.detalhe, { cor: corDaRolagem(r), som: rolador.som, semente: r.id });
			// os dados pararam: agora o resultado vale (registro, ficha rápida, dano), não quando a legenda some
			rolador.liberar(r.id);
			if (minha !== vez) return;
			legenda = r;
			// a vez dos dados passa para a próxima rolagem da fila (depois de um instante com a legenda), ou a mesa fica livre
			if (rolador.temFila) return void (tempo = setTimeout(() => minha === vez && rolador.proximo(), NA_FILA));
			rolador.proximo();
			// rolagem sem dados que a mesa desenhe (só números, d2, d3): fica só a legenda
			tempo = setTimeout(() => {
				if (minha !== vez) return;
				visivel = false;
				tempo = setTimeout(() => minha === vez && (limpar(), (legenda = null)), SUMIR);
			}, rolou ? FICA : FICA - 800);
		} catch {
			rolador.liberar(r.id);
			if (minha !== vez) return;
			visivel = false;
			toasts.mostrar('Os dados 3D não funcionam neste navegador. As rolagens voltaram para o aviso em pixel.', 'aviso');
			rolador.voltarAoPixel(r);
		}
	}

	const d = $derived(legenda ? destaque(legenda) : null);
</script>

<!-- a camada cobre a tela, mas os cliques passam (pointer-events é herdado pelo canvas) -->
<div bind:this={camada} class="dados-3d pointer-events-none fixed inset-0 z-[70]" class:visivel aria-hidden="true"></div>

{#if legenda}
	{@const r = legenda}
	<div role="status" aria-live="polite" class="legenda pointer-events-none fixed inset-x-0 bottom-[136px] z-[71] flex justify-center px-4 md:bottom-10" class:visivel>
		<div class="flex max-w-[480px] min-w-0 items-center gap-3 border-2 bg-b2 py-2 pr-4 pl-3 sombra-painel" style:border-color={d === 'critico' ? 'var(--acc)' : d === 'falha' ? 'var(--err)' : 'var(--frame)'}>
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<span class="truncate text-[15px] leading-5"><b class="font-semibold">{r.quem}</b> · {r.rotulo}</span>
				<span class="truncate text-xs leading-4 text-mut">{r.expressao} · {conta(r.detalhe)}</span>
				{#if d === 'critico'}<span class="self-start bg-acc px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-accfg">20 NATURAL · CRÍTICO</span>{:else if d === 'falha'}<span class="self-start bg-err px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-errfg">1 NATURAL · FALHA</span>{/if}
			</div>
			<span class="t-num text-[44px] leading-none" style:color={d === 'critico' ? 'var(--acc)' : d === 'falha' ? 'var(--err)' : undefined}>{r.total}</span>
		</div>
	</div>
{/if}

<style>
	.dados-3d,
	.legenda {
		opacity: 0;
		transition: opacity 0.4s ease;
	}
	.dados-3d.visivel,
	.legenda.visivel {
		opacity: 1;
	}
	.legenda.visivel {
		animation: subir 0.25s ease-out;
	}
	@keyframes subir {
		from {
			transform: translateY(12px);
		}
	}
</style>
