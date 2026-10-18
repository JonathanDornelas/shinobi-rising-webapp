<script lang="ts">
	// Card de habilidade (CMP-02): sem rank, custo nem linha de info.
	import type { Habilidade } from '#lib/livro/tipos.ts';
	import Texto from '../leitura/Texto.svelte';

	interface Props {
		habilidade: Habilidade;
	}
	let { habilidade: h }: Props = $props();
</script>

<article id="habilidade-{h.slug}" class="sombra-painel scroll-mt-4 border-2 border-[var(--vermelhao-lo)] bg-b2">
	<header class="flex items-start gap-3 bg-grena px-4 py-3.5">
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<h3 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">{h.nome}</h3>
			<span class="text-sm leading-5 text-papel-2 italic">{h.traducao}{#if h.origem}<span class="not-italic">{' · '}</span>{h.origem}{/if}</span>
		</div>
		<span class="flex-none border-2 border-[var(--vermelhao-lo)] px-2.5 py-2 font-pixel text-xs leading-none font-bold tracking-[.1em] text-papel">HABILIDADE</span>
	</header>
	<div class="flex flex-col gap-3 p-4">
		{#each h.descricao as p, i (i)}
			<p class="m-0 text-[15px] leading-[23px] text-pretty"><Texto trechos={p} /></p>
		{/each}
		{#if h.efeito}
			<p class="m-0 text-[15px] leading-[23px] text-pretty"><b>Efeito.</b> <Texto trechos={h.efeito} /></p>
		{/if}
		{#each h.notas as n, i (i)}
			<p class="m-0 text-sm leading-[21px] text-pretty text-mut"><Texto trechos={n} /></p>
		{/each}
	</div>
</article>
