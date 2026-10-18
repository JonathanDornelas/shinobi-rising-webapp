<script lang="ts">
	// Campo de formulário (DS 2 · B2): rótulo sempre visível, ajuda abaixo e erro com ícone e texto.
	import type { Snippet } from 'svelte';
	import Icone from './Icone.svelte';

	interface Props {
		id: string;
		rotulo: string;
		obrigatorio?: boolean;
		ajuda?: string;
		erro?: string | null;
		children: Snippet;
		/** Conteúdo extra no erro (ex.: link "Entrar em vez disso?"). */
		acaoErro?: Snippet;
		class?: string;
	}
	let { id, rotulo, obrigatorio = false, ajuda, erro, children, acaoErro, class: classe = '' }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {classe}">
	<label for={id} class="text-sm leading-5 font-semibold">{rotulo}{#if obrigatorio}<span class="text-err"> *</span>{/if}</label>
	{@render children()}
	{#if erro}
		<span id="{id}-erro" class="flex items-center gap-1 text-[13px] leading-[18px] font-semibold text-err" role="alert">
			<Icone id="status/ic-status-rejeitado" />{erro}{#if acaoErro}&nbsp;{@render acaoErro()}{/if}
		</span>
	{:else if ajuda}
		<span id="{id}-ajuda" class="text-[13px] leading-[18px] text-mut">{ajuda}</span>
	{/if}
</div>
