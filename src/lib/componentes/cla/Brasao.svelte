<script lang="ts">
	// Brasão de clã: ícone oficial (cla/ic-cla-*) ou, num clã criado, a base de kamon tingida com a cor do clã.
	import { srcKamon } from '#lib/clas/dados.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		slug?: string | null;
		kamon?: string | null;
		cor?: string | null;
		tamanho?: 32 | 64 | 96;
		alt?: string;
		class?: string;
	}
	let { slug = null, kamon = null, cor = null, tamanho = 32, alt = '', class: classe = '' }: Props = $props();
	// a máscara usa a arte de 32 px escalada em múltiplos inteiros, para continuar pixelada
	const src = $derived(srcKamon(kamon ?? '01'));
</script>

{#if slug}
	<Icone id="cla/ic-cla-{slug}" {tamanho} {alt} class={classe} />
{:else}
	<span
		role={alt ? 'img' : undefined}
		aria-label={alt || undefined}
		aria-hidden={alt ? undefined : 'true'}
		class="block flex-none {classe}"
		style:width="{tamanho}px"
		style:height="{tamanho}px"
		style:background={cor ?? '#C44536'}
		style:mask-image="url({src})"
		style:-webkit-mask-image="url({src})"
		style:mask-size="{tamanho}px {tamanho}px"
		style:-webkit-mask-size="{tamanho}px {tamanho}px"
		style:image-rendering="pixelated"
	></span>
{/if}
