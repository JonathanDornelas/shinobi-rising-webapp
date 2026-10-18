<script lang="ts">
	// Retrato: a foto enviada (Storage) ou, sem foto, as iniciais.
	import { iniciais } from '#lib/formatar.ts';
	import { urlRetrato } from '#lib/personagem/retrato.ts';

	interface Props {
		nome: string;
		tamanho?: 32 | 36 | 40 | 64 | 128;
		/** Caminho do arquivo no bucket de retratos. */
		foto?: string | null;
		class?: string;
	}
	let { nome, tamanho = 36, foto = null, class: classe = '' }: Props = $props();
	const fonte = $derived(tamanho >= 64 ? 'text-2xl' : tamanho >= 40 ? 'text-sm' : 'text-xs');
	const url = $derived(urlRetrato(foto));
	let falhou = $state(false);
	$effect(() => {
		void url;
		falhou = false;
	});
</script>

{#if url && !falhou}
	<img
		src={url}
		alt=""
		width={tamanho}
		height={tamanho}
		class="block flex-none border-2 border-[var(--vermelhao-lo)] bg-grena object-cover {classe}"
		style:width="{tamanho}px"
		style:height="{tamanho}px"
		loading="lazy"
		onerror={() => (falhou = true)}
	/>
{:else}
	<span
		class="t-num inline-flex flex-none items-center justify-center border-2 border-[var(--vermelhao-lo)] bg-grena text-papel {fonte} {classe}"
		style:width="{tamanho}px"
		style:height="{tamanho}px"
		aria-hidden="true">{iniciais(nome)}</span
	>
{/if}
