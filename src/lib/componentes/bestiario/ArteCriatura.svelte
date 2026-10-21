<script lang="ts">
	// Arte do verbete (PixelLab, static/bestiario): pixels nítidos em qualquer escala. A moldura varia de página para
	// página, como num livro de monstros: borda reta, vinheta que se dissolve no papel ou arte solta, sem borda.
	import type { Criatura } from '#lib/livro/tipos.ts';

	interface Props {
		criatura: Pick<Criatura, 'nome' | 'arte'>;
		moldura?: 'reta' | 'vinheta' | 'solta';
		/** Na lista: a arte preenche a caixa e é cortada nas bordas. */
		cobrir?: boolean;
		carregar?: 'lazy' | 'eager';
		class?: string;
	}
	let { criatura, moldura = 'reta', cobrir = false, carregar = 'lazy', class: classe = '' }: Props = $props();
	const a = $derived(criatura.arte);
</script>

{#if a.arquivo}
	<img
		src={a.arquivo}
		width={a.largura}
		height={a.altura}
		alt="{criatura.nome}, arte do bestiário"
		loading={carregar}
		class="block max-w-full [image-rendering:pixelated] {cobrir ? 'h-full w-full object-cover' : 'h-auto'} {moldura === 'reta' ? 'border-2 border-ink sombra-painel' : ''} {moldura === 'vinheta' ? 'vinheta' : ''} {classe}"
	/>
{:else}
	<div
		class="flex items-center justify-center border-2 border-dashed border-b3 bg-b2 text-center {cobrir ? 'h-full w-full' : ''} {classe}"
		style:aspect-ratio={cobrir ? undefined : `${a.largura} / ${a.altura}`}
		role="img"
		aria-label="{criatura.nome}: arte ainda não feita"
	>
		{#if cobrir}
			<span class="block h-full w-full bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--color-b3)_6px_8px)] opacity-60" aria-hidden="true"></span>
		{:else}
			<span class="px-3 font-pixel text-xs leading-4 font-bold tracking-[.12em] text-mut">ARTE EM BREVE</span>
		{/if}
	</div>
{/if}

<style>
	/* a vinheta some para as bordas, como uma ilustração impressa direto no papel */
	.vinheta {
		mask-image: radial-gradient(ellipse 72% 70% at 50% 50%, #000 58%, transparent 100%);
	}
</style>
