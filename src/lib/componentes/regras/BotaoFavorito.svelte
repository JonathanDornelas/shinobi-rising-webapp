<script lang="ts">
	// Estrela de favorito de um jutsu (catálogo e ficha). Fica fora de links: é um botão próprio.
	import { favoritos } from '#lib/estado/favoritos.svelte.ts';
	import Traco from '../ui/Traco.svelte';

	interface Props {
		slug: string;
		nome: string;
		tamanho?: number;
		/** Sobre a faixa grená: estrela vazia em papel. */
		sobreFaixa?: boolean;
		class?: string;
	}
	let { slug, nome, tamanho = 20, sobreFaixa = false, class: classe = '' }: Props = $props();
	const on = $derived(favoritos.tem(slug));
</script>

<button
	type="button"
	class="flex h-10 w-10 flex-none items-center justify-center transition-colors {on ? '' : sobreFaixa ? 'text-papel-2 hover:text-papel' : 'text-mut hover:text-fg'} {classe}"
	aria-pressed={on}
	aria-label={on ? `Tirar ${nome} dos favoritos` : `Favoritar ${nome}`}
	title={on ? 'Tirar dos favoritos' : 'Favoritar'}
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		favoritos.alternar(slug);
	}}
>
	<Traco nome="estrela" {tamanho} class={on ? 'estrela-on' : ''} />
</button>
