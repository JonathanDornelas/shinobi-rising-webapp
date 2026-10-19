<script lang="ts">
	// Trechos formatados do livro: negrito, itálico, referências cruzadas, termos do léxico e dados.
	import type { Trecho } from '#lib/livro/tipos.ts';
	import DadoInline from './DadoInline.svelte';
	import RefCruzada from './RefCruzada.svelte';
	import Termo from './Termo.svelte';

	interface Props {
		trechos: Trecho[];
	}
	let { trechos }: Props = $props();
</script>

{#each trechos as t, i (i)}{#if t.dado}<DadoInline expr={t.dado} texto={t.t} />{:else if t.termo}<Termo id={t.termo} texto={t.t} href={t.href} def={!!t.def} negrito={!!t.b} italico={!!t.i} />{:else if t.href}<RefCruzada href={t.href} texto={t.t} negrito={!!t.b} />{:else if t.b && t.i}<b><i>{t.t}</i></b>{:else if t.b}<b class="font-semibold">{t.t}</b>{:else if t.i}<i>{t.t}</i>{:else}{t.t}{/if}{/each}
