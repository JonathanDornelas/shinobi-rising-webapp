<script lang="ts">
	// Caixa de destaque (CMP-20, direção 1a): janela de diálogo com barra de título colorida.
	import type { Snippet } from 'svelte';
	import type { VarianteDestaque } from '#lib/livro/tipos.ts';
	import { DESTAQUE } from '#lib/livro/dominio.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		variante: VarianteDestaque;
		titulo?: string;
		/** Substitui o rótulo da variante na barra (ex.: "OBRIGAÇÃO"). */
		rotulo?: string;
		children: Snippet;
	}
	let { variante, titulo, rotulo, children }: Props = $props();
	const v = $derived(DESTAQUE[variante]);
</script>

<aside class="sombra-painel border-2" style:border-color={v.cor} style:background="color-mix(in srgb, {v.cor} 9%, var(--b2))">
	<div class="flex items-center gap-1.5 py-0.5 pr-3 pl-1" style:background={v.cor} style:color={v.texto}>
		<Icone id={v.icone} />
		<span class="t-rotulo-sm">{rotulo ?? v.rotulo}</span>
	</div>
	<div class="flex flex-col gap-2 px-3.5 py-3">
		{#if titulo}<span class="font-mincho text-[17px] leading-6 font-bold">{titulo}</span>{/if}
		{@render children()}
	</div>
</aside>
