<script lang="ts">
	// Epígrafe (CMP-20): aspas grandes em --b3, citação em Shippori itálico.
	interface Props {
		texto: string;
		autor: string;
		/** Versão sobre a faixa grená (cabeçalho de clã). */
		sobreFaixa?: boolean;
		grande?: boolean;
	}
	let { texto, autor, sobreFaixa = false, grande = false }: Props = $props();
</script>

<blockquote class="relative m-0 flex gap-3.5">
	<span class="font-mincho font-extrabold {grande ? 'text-[64px] leading-[48px]' : 'text-[56px] leading-[44px]'} {sobreFaixa ? 'text-vermelhao-lo' : 'text-b3'}" aria-hidden="true">“</span>
	<div class="flex flex-col gap-1.5">
		<span class="font-mincho font-semibold text-pretty italic {grande ? 'text-xl leading-[31px]' : 'text-lg leading-7'}">{texto}</span>
		{#if autor}<span class="text-sm leading-5 {sobreFaixa ? 'text-papel-2' : 'text-mut'}">— {autor}</span>{/if}
	</div>
</blockquote>
