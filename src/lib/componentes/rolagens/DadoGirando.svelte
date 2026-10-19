<script lang="ts">
	// Dado PixelLab do tipo rolado (d4 a d100): parado (d{n}.png) ou rolando (spritesheet de 9 quadros de 64 px).
	let { girando = false, tamanho = 64, lados = 20 }: { girando?: boolean; tamanho?: 32 | 40 | 64 | 96; lados?: number } = $props();
	const TIPOS = [4, 6, 8, 10, 12, 20, 100];
	// d2 e d3 não têm arte: usam o d6
	const tipo = $derived(TIPOS.includes(lados) ? lados : lados < 6 ? 6 : 20);
</script>

{#if girando}
	<span class="dado-girando block flex-none" style:width="{tamanho}px" style:height="{tamanho}px" style:--t="{tamanho}px" style:--sprite="url('/dados/d{tipo}-rolando.png')" role="img" aria-label="Dado rolando"></span>
{:else}
	<img src="/dados/d{tipo}.png" width={tamanho} height={tamanho} alt="" class="block flex-none [image-rendering:pixelated]" />
{/if}

<style>
	.dado-girando {
		background: var(--sprite) 0 0 / calc(var(--t) * 9) var(--t) no-repeat;
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
