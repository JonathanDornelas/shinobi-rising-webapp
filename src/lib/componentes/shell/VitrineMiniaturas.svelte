<script lang="ts">
	// A vitrine da home: miniaturas da Mesa girando nas 8 direções, de pé na grade do tabuleiro, como no pedestal da Caixa de
	// miniaturas. Só CSS: a tira de cada uma anda em degraus, e com movimento reduzido elas ficam de frente, paradas.
	// O tipo é a única coisa que vem de miniaturas.ts: importar o módulo traria o catálogo inteiro para o JavaScript da home.
	import type { Miniatura } from '#lib/mesa/miniaturas.ts';

	let { figuras }: { figuras: Miniatura[] } = $props();
</script>

<div class="tabuleiro" role="img" aria-label="Miniaturas da Mesa girando, de um genin a um senhor oni">
	{#each figuras as m, i (m.id)}
		<span
			class="peca"
			class:larga={m.w > 60}
			class:muito-larga={m.w > 70}
			style:--w="{m.w}px"
			style:--h="{m.h}px"
			style:--pe="{m.pe[1]}px"
			style:--giro="{-i * 1.1}s"
			style:background-image="url(/mesa/miniaturas/{m.id}.png)"
		></span>
	{/each}
</div>

<style>
	.tabuleiro {
		--casa: 56px;
		container-type: inline-size;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		box-sizing: border-box;
		height: 236px;
		padding: 0 8px 40px;
		overflow: hidden;
		border: 2px solid var(--frame);
		box-shadow: 4px 4px 0 var(--ink);
		background:
			linear-gradient(to bottom, var(--b0) 0%, transparent 62%),
			repeating-linear-gradient(to right, color-mix(in srgb, var(--b0fg) 8%, transparent) 0 1px, transparent 1px var(--casa)),
			repeating-linear-gradient(to bottom, color-mix(in srgb, var(--b0fg) 8%, transparent) 0 1px, transparent 1px var(--casa)),
			var(--b0);
		background-position:
			0 0,
			calc(50% - var(--casa) / 2) 0,
			0 calc(100% - 40px);
		/* as tiras só são baixadas quando a vitrine chega perto da tela */
		content-visibility: auto;
		contain-intrinsic-size: auto 236px;
	}
	.peca {
		flex: none;
		width: calc(var(--w) * 2);
		height: calc(var(--h) * 2);
		margin-inline: -6px;
		margin-bottom: calc((var(--h) - var(--pe)) * -2);
		background-repeat: no-repeat;
		background-size: calc(var(--w) * 16) calc(var(--h) * 2);
		image-rendering: pixelated;
		animation: girar 6.4s steps(8) var(--giro) infinite;
	}
	@keyframes girar {
		to {
			background-position: calc(var(--w) * -16) 0;
		}
	}
	/* a vitrine estreita fica com as mais compactas: a tela nunca corta uma miniatura pela metade */
	@container (width < 714px) {
		.muito-larga {
			display: none;
		}
	}
	@container (width < 572px) {
		.larga {
			display: none;
		}
	}
</style>
