<script lang="ts">
	// Como usar o bestiário: a regra de ameaça e de encontros, no mesmo texto de leitura dos capítulos.
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const secoes = $derived(data.comoUsar.secoes.filter((s) => s.nivel === 2));
</script>

<main class="mx-auto box-border grid w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-5 pb-12 md:px-6 md:pt-8 md:pb-14 lg:grid-cols-[minmax(0,760px)_220px] lg:gap-10">
	<article class="flex min-w-0 flex-col gap-4">
		<nav aria-label="Trilha" class="flex flex-wrap items-center gap-2 text-sm leading-5 font-medium">
			<a href="/regras" class="link">Regras</a><span class="font-pixel text-xs text-mut">▸</span>
			<a href="/regras/bestiario" class="link">Bestiário</a><span class="font-pixel text-xs text-mut">▸</span>
			<span aria-current="page">Como usar</span>
		</nav>
		<header class="flex flex-col gap-2 border-b-2 border-b3 pb-4">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[.14em] text-title">BESTIÁRIO · PARA O MESTRE</span>
			<h1 class="t-h1 m-0">{data.comoUsar.titulo}</h1>
			<p class="m-0 text-[15px] leading-[23px] text-mut">{data.comoUsar.resumo}</p>
		</header>
		<Blocos blocos={data.comoUsar.blocos} />
		<a href="/regras/bestiario" class="btn-jogo btn-contorno mt-4 self-start">Ver os verbetes</a>
	</article>
	<aside class="hidden lg:block">
		<nav aria-label="Nesta página" class="sticky top-20 flex flex-col gap-2">
			<span class="t-rotulo-sm text-mut">Nesta página</span>
			{#each secoes as s (s.id)}<a href="#{s.id}" class="text-sm leading-5 font-medium hover:text-link">{s.titulo}</a>{/each}
		</nav>
	</aside>
</main>

<Rodape />
