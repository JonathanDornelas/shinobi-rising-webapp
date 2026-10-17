<script lang="ts">
	// Trechos formatados do livro: negrito, itálico, referências cruzadas e termos do glossário.
	import type { Trecho } from '#lib/livro/tipos.ts';
	import RefCruzada from './RefCruzada.svelte';
	import TermoGlossario from './TermoGlossario.svelte';

	interface Props {
		trechos: Trecho[];
	}
	let { trechos }: Props = $props();
</script>

{#each trechos as t, i (i)}{#if t.href}<RefCruzada href={t.href} texto={t.t} negrito={!!t.b} />{:else if t.termo}<TermoGlossario id={t.termo} texto={t.t} />{:else if t.b && t.i}<b><i>{t.t}</i></b>{:else if t.b}<b class="font-semibold">{t.t}</b>{:else if t.i}<i>{t.t}</i>{:else}{t.t}{/if}{/each}
