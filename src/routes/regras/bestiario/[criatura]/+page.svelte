<script lang="ts">
	// Página do verbete, como uma página de livro de monstros: a diagramação segue o formato da arte.
	// Faixa: a arte atravessa o topo. Retrato e quadro: a arte flutua no texto, alternando o lado. Página: a arte
	// abre o verbete ao lado do título. Verbete de uma ficha só: o quadro de combate fica na coluna da direita.
	// Verbete com variações (invocações, clãs, Bestas com Cauda): a coluna da direita traz o índice das fichas, e cada
	// variação vem abaixo numa ficha separada, com a sua arte, o seu resumo e o seu quadro de combate.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import ArteCriatura from '#lib/componentes/bestiario/ArteCriatura.svelte';
	import BlocoCriatura from '#lib/componentes/bestiario/BlocoCriatura.svelte';
	import EscadaEstagios from '#lib/componentes/bestiario/EscadaEstagios.svelte';
	import UsarNaCampanha from '#lib/componentes/bestiario/UsarNaCampanha.svelte';
	import Cena from '#lib/componentes/leitura/Cena.svelte';
	import Texto from '#lib/componentes/leitura/Texto.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { PAPEIS } from '#lib/bestiario/npc.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.criatura);
	const f = $derived(c.arte.formato);
	const varios = $derived(c.estagios.length > 1);
	const direita = $derived(data.pagina % 2 === 0);
	const moldura = $derived(f === 'retrato' ? (data.pagina % 2 ? 'reta' : 'vinheta') : f === 'quadro' ? (data.pagina % 2 ? 'solta' : 'reta') : 'reta');
	/** Largura da arte de cada ficha, pelo formato (pixels inteiros: 2× o tamanho da arte, menos a faixa, que estica). */
	const LARGURA = { retrato: 'max-w-[256px]', quadro: 'max-w-[352px]', pagina: 'max-w-[384px]', faixa: 'max-w-full' } as const;

	// links antigos (?estagio=2) e do apêndice levam direto à ficha
	onMount(() => {
		const e = +(page.url.searchParams.get('estagio') ?? 0);
		if (e > 0 && c.estagios[e]) document.getElementById(c.estagios[e].slug)?.scrollIntoView();
	});
</script>

{#snippet cabecalho()}
	<header class="flex flex-col gap-2">
		<span class="font-pixel text-[13px] leading-none font-bold tracking-[.14em] text-title uppercase">Bestiário · {c.tipo}</span>
		<h1 class="t-h1 m-0">{c.nome}</h1>
		<p class="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] leading-[22px] text-mut">
			{#if c.vila}<Icone id={c.vila.icone} />{/if}
			<span>{c.origem}</span><span aria-hidden="true">·</span>
			<span class="font-semibold text-fg">Ameaça {c.ameacaFaixa}</span><span aria-hidden="true">·</span>
			<span>{varios ? `${c.estagios.length} fichas` : PAPEIS[c.estagios[0].papel]}{!varios && c.estagios[0].membros > 1 ? `, ${c.estagios[0].membros} membros` : ''}</span>
		</p>
	</header>
{/snippet}

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-5 pb-12 md:px-6 md:pt-8 md:pb-14">
	<nav aria-label="Trilha" class="flex flex-wrap items-center gap-2 text-sm leading-5 font-medium">
		<a href="/regras/bestiario" class="link">Bestiário</a><span class="font-pixel text-xs text-mut">▸</span>
		<a href="/regras/bestiario#letra-{c.letra}" class="link">{c.letra}</a><span class="font-pixel text-xs text-mut">▸</span>
		<span aria-current="page" class="flex-1">{c.nome}</span>
		<span class="t-num text-[13px] text-mut">página {data.pagina} de {data.total}</span>
	</nav>

	{#if f === 'faixa'}
		<figure class="m-0 -mx-4 md:mx-0"><ArteCriatura criatura={c} moldura="reta" carregar="eager" class="w-full" /></figure>
	{:else if f === 'pagina'}
		<div class="grid grid-cols-[minmax(0,1fr)] items-end gap-6 md:grid-cols-[minmax(0,384px)_minmax(0,1fr)] md:gap-10">
			<figure class="m-0 {direita ? 'md:order-2' : ''}"><ArteCriatura criatura={c} carregar="eager" class="mx-auto w-full max-w-[384px]" /></figure>
			<div class="flex flex-col gap-5 pb-2">
				{@render cabecalho()}
				<Cena c={c.cena} />
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
		<article class="flex min-w-0 flex-col gap-4 text-[length:var(--leitura)] leading-[var(--leitura-linha)]">
			{#if f !== 'pagina'}{@render cabecalho()}{/if}
			<div class="flow-root">
				{#if f === 'retrato' || f === 'quadro'}
					<figure class="m-0 mx-auto mb-4 w-full {f === 'retrato' ? 'max-w-[256px]' : 'max-w-[352px]'} md:mb-3 md:w-auto {direita ? 'md:float-right md:ml-7' : 'md:float-left md:mr-7'}">
						<ArteCriatura criatura={c} {moldura} carregar="eager" class={f === 'retrato' ? 'w-full md:w-[256px]' : 'w-full md:w-[352px]'} />
					</figure>
				{/if}
				<div class="flex flex-col gap-4">
					{#if f !== 'pagina'}<Cena c={c.cena} />{/if}
					{#each c.descricao as p, i (i)}<p class="m-0 text-pretty"><Texto trechos={p} /></p>{/each}
					<h2 class="t-h2 m-0 mt-2">Como luta</h2>
					{#each c.taticas as p, i (i)}<p class="m-0 text-pretty"><Texto trechos={p} /></p>{/each}
					<h2 class="t-h2 m-0 mt-2">Ganchos</h2>
					<ul class="m-0 flex list-disc flex-col gap-2 pl-6 marker:text-[var(--vermelhao)]">
						{#each c.ganchos as p, i (i)}<li class="text-pretty"><Texto trechos={p} /></li>{/each}
					</ul>
				</div>
			</div>
		</article>
		<div class="flex flex-col gap-4 self-start lg:sticky lg:top-20">
			{#if varios}
				<EscadaEstagios estagios={c.estagios} />
			{:else}
				<BlocoCriatura criatura={c} estagio={c.estagios[0]} />
				<UsarNaCampanha slug={c.slug} />
			{/if}
		</div>
	</div>

	{#if varios}
		<!-- uma ficha separada por variação, cada uma com a sua arte, como os estágios de um dragão num livro de monstros -->
		{#each c.estagios as e, i (e.slug)}
			<section id={e.slug} class="flex scroll-mt-20 flex-col gap-4 border-t-2 border-b3 pt-6" aria-labelledby="titulo-{e.slug}">
				<header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<h2 id="titulo-{e.slug}" class="t-h2 m-0">{e.nome}</h2>
					<span class="font-pixel text-xs font-bold tracking-[.12em] text-title">AMEAÇA {e.ameacaRotulo} · {PAPEIS[e.papel].toUpperCase()}{e.membros > 1 ? ` · ${e.membros} MEMBROS` : ''}</span>
				</header>
				<div class="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
					<div class="flex flex-col gap-4 {i % 2 ? 'lg:order-2' : ''}">
						{#if e.arte}
							<figure class="m-0 mx-auto w-full {LARGURA[e.arte.formato]}">
								<ArteCriatura criatura={{ nome: `${c.nome}: ${e.nome}`, arte: e.arte }} moldura={i % 3 === 1 ? 'vinheta' : 'reta'} class="w-full" />
							</figure>
						{/if}
						{#if e.resumo}<p class="m-0 font-mincho text-[length:var(--leitura)] leading-[var(--leitura-linha)] text-pretty italic"><Texto trechos={e.resumo} /></p>{/if}
						<UsarNaCampanha slug={c.slug} estagio={i} nomeEstagio={e.nome} />
					</div>
					<BlocoCriatura criatura={c} estagio={e} />
				</div>
			</section>
		{/each}
	{/if}

	<nav aria-label="Folhear o bestiário" class="mt-4 grid grid-cols-2 gap-3 border-t-2 border-b3 pt-4">
		{#if data.anterior}<a href="/regras/bestiario/{data.anterior.slug}" class="flex flex-col gap-0.5 text-sm"><span class="t-rotulo-sm text-mut">◂ Página anterior</span><span class="link font-semibold">{data.anterior.nome}</span></a>{:else}<a href="/regras/bestiario/como-usar" class="flex flex-col gap-0.5 text-sm"><span class="t-rotulo-sm text-mut">◂ Introdução</span><span class="link font-semibold">Como usar o bestiário</span></a>{/if}
		{#if data.proximo}<a href="/regras/bestiario/{data.proximo.slug}" class="flex flex-col items-end gap-0.5 text-right text-sm"><span class="t-rotulo-sm text-mut">Próxima página ▸</span><span class="link font-semibold">{data.proximo.nome}</span></a>{:else}<a href="/regras/bestiario/por-ameaca" class="flex flex-col items-end gap-0.5 text-right text-sm"><span class="t-rotulo-sm text-mut">Apêndice ▸</span><span class="link font-semibold">Adversários por ameaça</span></a>{/if}
	</nav>
</main>

<Rodape />
