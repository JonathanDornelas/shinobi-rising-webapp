<script lang="ts">
	// D7 · Especializações (cap. 19): quando se ganha, custo para subir e os 16 cards com 3 níveis.
	import { onMount } from 'svelte';
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import { realcar } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Texto from '#lib/componentes/leitura/Texto.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const esp = $derived(data.especializacoes);
	let nivel = $state<Record<string, number>>({});

	onMount(() => {
		const el = location.hash && document.getElementById(location.hash.slice(1));
		if (el) realcar(el);
	});
</script>

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-14">
	<div class="flex flex-col gap-1.5">
		<span class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title">CAP. 19</span>
		<h1 class="t-h1 m-0">Especializações</h1>
	</div>
	<div class="flex max-w-[760px] flex-col gap-3"><Blocos blocos={esp.intro} compacto /></div>

	<div class="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
		{#if esp.quando}
			<aside class="sombra-painel border-2 border-[#BF9000] bg-b2">
				<div class="flex items-center gap-1.5 bg-[#BF9000] py-0.5 pr-3 pl-1 text-[#1A1A1A]"><Icone id="callout/ic-callout-destaque" /><span class="t-rotulo-sm">Quando se ganha</span></div>
				<div class="flex flex-col gap-2.5 px-3.5 py-3">
					<div class="flex flex-wrap items-center gap-1.5 text-[15px] leading-[23px]">
						Na criação e nos níveis
						{#each esp.quando.niveis as n (n)}
							<span class="t-num flex h-8 w-8 items-center justify-center border-2 border-ink bg-vermelhao text-sm text-white">{n}</span>
						{/each}
					</div>
					<Blocos blocos={esp.quando.blocos} compacto />
				</div>
			</aside>
		{/if}
		{#if data.subir.length}
			<aside class="painel-sombra flex flex-col gap-2 px-3.5 py-3">
				<span class="t-rotulo-sm text-title">Subir de nível na especialização</span>
				<div class="flex flex-col gap-1.5 text-[15px] leading-[22px] font-semibold sm:flex-row sm:flex-wrap sm:gap-x-5">
					{#each data.subir as s (s.passo)}
						<span>{s.passo}: <b class="t-num">{s.custo}</b> · {s.nota.replace(/^Requer /, '').replace(/^./, (l) => l.toLowerCase())}</span>
					{/each}
				</div>
				<a href={data.hrefTreino} class="link self-start text-[13px] font-semibold">Gastando Pontos de Treino (cap. 18)</a>
			</aside>
		{/if}
	</div>

	<h2 class="t-rotulo m-0 mt-2 text-sm">Catálogo · {esp.lista.length} especializações</h2>
	<div class="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
		{#each esp.lista as e (e.slug)}
			{@const atual = nivel[e.slug] ?? 1}
			{@const beneficio = e.niveis.find((n) => n.nivel === atual)}
			<article id={e.slug} class="sombra-painel flex scroll-mt-4 flex-col gap-2 border-2 bg-b2 p-3" style:border-color={e.requisito ? '#8B2E20' : 'var(--frame)'}>
				<div class="flex items-center gap-2.5"><Icone id={e.icone} /><h3 class="m-0 font-mincho text-base leading-[22px] font-bold">{e.nome}</h3></div>
				<div class="flex gap-[3px]" role="tablist" aria-label="Níveis de {e.nome}">
					{#each e.niveis as n (n.nivel)}
						<button
							type="button"
							role="tab"
							aria-selected={n.nivel === atual}
							class="t-num flex-1 py-[5px] text-xs"
							style:background={n.nivel === atual ? '#C44536' : 'var(--b3)'}
							style:color={n.nivel === atual ? '#FFFFFF' : 'var(--fg)'}
							onclick={() => (nivel[e.slug] = n.nivel)}>NV {n.nivel}</button
						>
					{/each}
				</div>
				{#if beneficio}
					<div class="min-h-[63px] text-sm leading-[21px]" role="tabpanel">
						{#each beneficio.beneficio as p, i (i)}<p class="m-0"><Texto trechos={p} /></p>{/each}
					</div>
				{/if}
				{#if e.requisito}<span class="text-xs leading-4 font-semibold">{e.requisito}</span>{/if}
				{#if e.extras.length}<div class="flex flex-col gap-2 border-t-2 border-b3 pt-2"><Blocos blocos={e.extras} compacto semAncoras /></div>{/if}
			</article>
		{/each}
	</div>

	{#if esp.extras.length}
		<div class="flex max-w-[760px] flex-col gap-4"><Blocos blocos={esp.extras} /></div>
	{/if}
</main>

<Rodape />
