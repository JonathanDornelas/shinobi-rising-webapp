<script lang="ts">
	// O dado do HUD: a arte do dado (d6, d8...) e a expressão na cor do elemento, com o tipo do dano ao lado.
	import { lerDados, temArte } from '#lib/mesa/hud.ts';

	let { expr, cor = null, tipo = null, tamanho = 22 }: { expr: string; cor?: string | null; tipo?: string | null; tamanho?: number } = $props();
	const d = $derived(lerDados(expr));
	const lados = $derived(d?.dados[0]?.lados ?? 20);
</script>

<span class="inline-flex items-center gap-1 whitespace-nowrap">
	{#if temArte(lados)}<img src="/dados/d{lados}.png" width={tamanho} height={tamanho} alt="d{lados}" class="flex-none [image-rendering:pixelated]" />{/if}
	<b class="font-pixel text-[13px] leading-none" style:color={cor ?? undefined}>{expr.replace(/^1d20/, '')}</b>
	{#if tipo}<span class="text-xs leading-none font-semibold" style:color={cor ?? undefined}>{tipo}</span>{/if}
</span>
