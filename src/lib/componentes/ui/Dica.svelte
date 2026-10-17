<script lang="ts">
	// Tooltip (DS 2 · B4): abre no hover e no foco; no toque vira popover.
	import type { Snippet } from 'svelte';
	import { posicionar } from './posicao';

	interface Props {
		texto: string;
		class?: string;
		children: Snippet;
	}
	let { texto, class: classe = '', children }: Props = $props();

	let el: HTMLButtonElement | undefined = $state();
	let pos = $state<{ left: number; top: number } | null>(null);
	const id = `dica-${Math.random().toString(36).slice(2, 8)}`;
	const abrir = () => el && (pos = posicionar(el, 260, 80));
	const fechar = () => (pos = null);
</script>

<svelte:window onscroll={fechar} />

<button
	bind:this={el}
	type="button"
	class="cursor-help {classe}"
	aria-describedby={pos ? id : undefined}
	onmouseenter={abrir}
	onmouseleave={fechar}
	onfocus={abrir}
	onblur={fechar}
	onclick={() => (pos ? fechar() : abrir())}>{@render children()}</button
>{#if pos}<span
		{id}
		role="tooltip"
		class="pointer-events-none fixed z-[70] max-w-[260px] border-2 border-[#8B2E20] bg-b0 px-3 py-2 text-[13px] leading-[18px] font-medium text-b0fg"
		style:left="{pos.left}px"
		style:top="{pos.top}px">{texto}</span
	>{/if}
