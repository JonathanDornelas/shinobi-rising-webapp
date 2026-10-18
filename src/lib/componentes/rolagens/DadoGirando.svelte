<script lang="ts">
	// d20 PixelLab: parado (d20.png) ou rolando (spritesheet de 9 quadros de 64 px, d20-rolando.png).
	let { girando = false, tamanho = 64 }: { girando?: boolean; tamanho?: 32 | 64 | 96 } = $props();
</script>

{#if girando}
	<span class="dado-girando block flex-none" style:width="{tamanho}px" style:height="{tamanho}px" style:--t="{tamanho}px" role="img" aria-label="Dado rolando"></span>
{:else}
	<img src="/dados/d20.png" width={tamanho} height={tamanho} alt="" class="block flex-none [image-rendering:pixelated]" />
{/if}

<style>
	.dado-girando {
		background: url('/dados/d20-rolando.png') 0 0 / calc(var(--t) * 9) var(--t) no-repeat;
		image-rendering: pixelated;
		animation: girar 0.6s steps(9) infinite;
	}
	@keyframes girar {
		to {
			background-position-x: calc(var(--t) * -9);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.dado-girando {
			animation: none;
		}
	}
</style>
