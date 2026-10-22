<script lang="ts">
	// A tradução em português que acompanha o nome japonês de um jutsu onde ele aparecer: uma legenda em itálico, mais
	// discreta que o nome. Empilhada embaixo do nome por padrão; `emLinha` a deixa logo depois dele, nas listas corridas.
	interface Props {
		texto?: string | null;
		emLinha?: boolean;
		/** Sobre a faixa grená dos cabeçalhos de carta. */
		sobreFaixa?: boolean;
		class?: string;
	}
	let { texto, emLinha = false, sobreFaixa = false, class: classe = '' }: Props = $props();
</script>

{#if texto}<span class="{emLinha ? '' : 'block'} font-normal italic {sobreFaixa ? 'text-papel-2' : 'text-mut'} {classe}">{texto}</span>{/if}
