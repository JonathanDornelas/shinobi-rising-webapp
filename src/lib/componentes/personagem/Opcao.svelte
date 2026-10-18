<script lang="ts">
	// Cartão de escolha única (vila, clã, especialização, pacote, background): borda vermelhão e selo ✓ quando escolhido.
	import type { Snippet } from 'svelte';

	interface Props {
		selecionado: boolean;
		/** Motivo de não poder escolher (aparece no title e esmaece o cartão). */
		desabilitado?: string;
		/** Ficha só para leitura: não reage ao clique, mas mantém a aparência. */
		somenteLeitura?: boolean;
		rotulo: string;
		aoEscolher: () => void;
		children: Snippet;
		class?: string;
		sombra?: boolean;
	}
	let { selecionado, desabilitado = '', somenteLeitura = false, rotulo, aoEscolher, children, class: classe = '', sombra = true }: Props = $props();
	const inerte = $derived(!!desabilitado || somenteLeitura);
</script>

<button
	type="button"
	role="radio"
	aria-checked={selecionado}
	aria-label={rotulo}
	aria-disabled={inerte || undefined}
	title={desabilitado || undefined}
	class="relative flex flex-col gap-1.5 border-2 bg-b2 p-3 text-left {selecionado ? 'border-vermelhao' : inerte ? 'border-frame' : 'border-frame hover:border-mut'} {desabilitado
		? 'cursor-not-allowed opacity-50'
		: somenteLeitura
			? 'cursor-default'
			: ''} {classe}"
	style:box-shadow={selecionado ? '4px 4px 0 var(--vermelhao-lo)' : sombra ? '4px 4px 0 var(--ink)' : undefined}
	onclick={() => !inerte && aoEscolher()}
>
	{@render children()}
	{#if selecionado}
		<span class="t-num absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center border-2 border-ink bg-vermelhao text-sm text-white" aria-hidden="true">✓</span>
	{/if}
</button>
