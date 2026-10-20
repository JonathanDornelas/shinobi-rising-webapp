<script lang="ts">
	// Cena: um instante narrado que abre uma regra ou um capítulo, antes da explicação.
	// Itálico em Mincho, com um traço de pincel vermelhão que some para baixo.
	import type { Trecho } from '#lib/livro/tipos.ts';
	import Texto from './Texto.svelte';

	let { c }: { c: Trecho[][] } = $props();
</script>

<div class="relative flex flex-col gap-2.5 py-0.5 pl-5">
	<span class="absolute top-0 bottom-0 left-0 w-[3px] bg-[linear-gradient(var(--vermelhao),transparent)]" aria-hidden="true"></span>
	{#each c as p, i (i)}
		<p class="m-0 font-mincho text-[length:var(--leitura)] leading-[var(--leitura-linha)] font-medium text-pretty italic">
			<Texto trechos={p} />
		</p>
	{/each}
</div>
