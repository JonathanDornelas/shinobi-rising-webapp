<script lang="ts">
	// Termo do glossário no texto (CMP-22): sublinhado pontilhado; hover/foco/toque abre o verbete.
	import glossario from '#lib/livro/gerado/glossario.json';
	import type { SecaoGlossario } from '#lib/livro/tipos.ts';
	import { posicionar } from '../ui/posicao';

	interface Props {
		id: string;
		texto: string;
	}
	let { id, texto }: Props = $props();

	const termo = $derived((glossario as SecaoGlossario[]).flatMap((s) => s.termos).find((t) => t.id === id));
	// Atributos têm [nome, significado]; recursos têm só [significado].
	const nome = $derived(termo ? (termo.campos.length > 1 ? termo.campos[0] : termo.campos[0].split(' (')[0]) : '');
	const descricao = $derived(termo ? (termo.campos.length > 1 ? termo.campos.slice(1).join(' · ') : (termo.campos[0].match(/\((.+)\)$/)?.[1] ?? '')) : '');

	let el: HTMLButtonElement | undefined = $state();
	let pos = $state<{ left: number; top: number } | null>(null);
	let fixo = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	function abrir() {
		clearTimeout(timer);
		if (el) pos = posicionar(el, 300, 140);
	}
	function fecharDepois() {
		if (fixo) return;
		timer = setTimeout(() => (pos = null), 150);
	}
	function alternar() {
		fixo = !fixo || !pos;
		if (fixo) abrir();
		else pos = null;
	}
</script>

<svelte:window onscroll={() => !fixo && (pos = null)} />

{#if termo}
	<button
		bind:this={el}
		type="button"
		class="cursor-help border-0 bg-transparent p-0 align-baseline font-semibold text-inherit underline decoration-dotted underline-offset-4 [font:inherit]"
		style="font-weight: 600"
		aria-expanded={!!pos}
		onmouseenter={abrir}
		onmouseleave={fecharDepois}
		onfocus={abrir}
		onblur={() => ((fixo = false), (pos = null))}
		onclick={alternar}>{texto}</button
	>{#if pos}<span
			role="tooltip"
			class="camada fixed z-[70] block w-[300px] text-left font-normal not-italic"
			style:left="{pos.left}px"
			style:top="{pos.top}px"
			onmouseenter={() => clearTimeout(timer)}
			onmouseleave={fecharDepois}
		>
			<span class="flex items-baseline gap-2 border-b-2 border-b3 px-3 py-2.5">
				<span class="t-num text-xl leading-none text-fg">{termo.termo}</span>
				<span class="text-sm leading-5 font-semibold text-fg">{nome}</span>
			</span>
			{#if descricao}<span class="block px-3 py-2.5 text-sm leading-[21px] text-fg">{descricao}</span>{/if}
			<span class="block px-3 pb-2.5"><a class="link text-[13px] leading-[18px] font-semibold" href="/regras/glossario#{termo.id}">Ver no glossário</a></span>
		</span>{/if}
{:else}
	{texto}
{/if}
