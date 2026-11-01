<script lang="ts">
	// O clima da cena (chuva, neve, névoa, folhas, pétalas, cinzas): ladrilhos animados da vfx_workbench do PixelLab sobre o
	// quadro inteiro, presos à tela (o tempo cai no ar, não no chão). Cada ladrilho começa num quadro diferente e alguns
	// viram de lado, para não aparecer a repetição; quem pede menos movimento vê o quadro parado.
	import { SPRITES_CLIMA } from '#lib/mesa/clima-sprites.ts';

	let { clima, opacidade = 1 }: { clima: string | null | undefined; opacidade?: number } = $props();
	const ESCALA = 2;
	let W = $state(0);
	let H = $state(0);
	const sp = $derived(clima ? SPRITES_CLIMA[clima] : null);
	const ladrilhos = $derived.by(() => {
		if (!sp || !W || !H) return [];
		const [tw, th] = [sp.w * ESCALA, sp.h * ESCALA];
		// os ladrilhos se sobrepõem (passo menor que o ladrilho) e saem do alinhamento: o desenho não cobre o ladrilho até a
		// borda (a chuva para antes do chão), e sem sobrepor apareciam faixas vazias entre as fileiras
		const [px, py] = [tw * 0.7, th * 0.55];
		const lista: { x: number; y: number; atraso: number; espelho: boolean }[] = [];
		for (let j = -1; j * py < H; j++)
			for (let i = -1; i * px < W + tw; i++) {
				// uma ordem de quadros e um deslocamento embaralhados, estáveis
				const h = Math.abs(Math.imul((i * 73856093) ^ (j * 19349663), 0x5bd1e995)) >>> 0;
				const dx = ((h >>> 3) % 1000) / 1000 - 0.5;
				const dy = ((h >>> 13) % 1000) / 1000 - 0.5;
				lista.push({ x: i * px + (j % 2 ? px / 2 : 0) + dx * px * 0.5, y: j * py + dy * py * 0.4, atraso: h % sp.ms, espelho: !!(h & 1) });
			}
		return lista;
	});
</script>

<div class="pointer-events-none absolute inset-0 overflow-hidden" style:opacity={opacidade < 1 ? opacidade : undefined} bind:clientWidth={W} bind:clientHeight={H} aria-hidden="true">
	<!-- na opacidade zero, os ladrilhos nem são montados (nada animando à toa) -->
	{#if sp && opacidade > 0}
		{#each ladrilhos as l, i (i)}
			<div
				class="clima-ladrilho"
				style:left="{l.x}px"
				style:top="{l.y}px"
				style:width="{sp.w * ESCALA}px"
				style:height="{sp.h * ESCALA}px"
				style:background-image="url(/mesa/clima/{clima}.png)"
				style:background-size="{sp.w * sp.quadros * ESCALA}px {sp.h * ESCALA}px"
				style:transform={l.espelho ? 'scaleX(-1)' : undefined}
				style="--fim: {-sp.w * sp.quadros * ESCALA}px; --pico: {-sp.w * sp.pico * ESCALA}px; animation-duration: {sp.ms}ms; animation-timing-function: steps({sp.quadros}); animation-delay: -{l.atraso}ms"
			></div>
		{/each}
	{/if}
</div>

<style>
	.clima-ladrilho {
		position: absolute;
		background-repeat: no-repeat;
		image-rendering: pixelated;
		animation-name: clima-quadros;
		animation-iteration-count: infinite;
	}
	@keyframes clima-quadros {
		to {
			background-position: var(--fim) 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.clima-ladrilho {
			animation: none;
			background-position: var(--pico) 0;
		}
	}
</style>
