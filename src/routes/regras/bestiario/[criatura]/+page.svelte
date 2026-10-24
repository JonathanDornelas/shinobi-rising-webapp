<script lang="ts">
	// Página do verbete, como uma página de livro de monstros: a diagramação segue o formato da arte, que vem pintada
	// no papel (borda de pincelada, ArteCriatura) e grande. Faixa: a arte atravessa o topo. Quadro e página: a arte abre
	// o verbete ao lado do título. Retrato: a arte flutua no texto, alternando o lado. Verbete de uma ficha só: o quadro
	// de combate fica na coluna da direita. Verbete com variações (invocações, clãs, Bestas com Cauda): o texto ocupa a
	// largura toda, em duas colunas, e cada variação vem abaixo numa ficha separada, em zigue-zague: a arte, com o resumo
	// e o "Usar na campanha" embaixo, de um lado; o quadro de combate, que acompanha a rolagem, do outro.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import ArteCriatura from '#lib/componentes/bestiario/ArteCriatura.svelte';
	import BlocoCriatura from '#lib/componentes/bestiario/BlocoCriatura.svelte';
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
	/** Escala da arte na abertura: 3× (pixels inteiros, nítidos); a página fica em 2,5× para caber ao lado do título. */
	const ESCALA = { retrato: 3, quadro: 3, pagina: 2.5, faixa: 3 } as const;
	/** Escala da arte nas fichas de estágio: a arte divide a largura só com o quadro de combate (o resumo vai embaixo dela). */
	const ESCALA_FICHA = { retrato: 3.5, quadro: 3.5, pagina: 3, faixa: 3 } as const;
	type Arte = { formato: keyof typeof ESCALA; largura: number };
	const largura = (arte: Arte) => arte.largura * ESCALA[arte.formato];
	const larguraFicha = (arte: Arte | null) => (arte ? arte.largura * ESCALA_FICHA[arte.formato] : 448);
	/** Verbete com variações: sem índice de fichas, a capa (menos a faixa) abre a página ao lado do título, e o texto
	 *  ocupa a largura toda em duas colunas. */
	const abertura = $derived(varios && f !== 'faixa');
	/** Verbete de uma ficha só: quadro e página vão no alto da coluna de leitura, grandes (o quadro de combate, alto,
	 *  acompanha a rolagem ao lado, sem deixar buraco no texto). */
	const naColuna = $derived(!varios && (f === 'quadro' || f === 'pagina'));
	const ESCALA_COLUNA = { quadro: 4, pagina: 3 } as const;

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

{#snippet descricao()}
	{#each c.descricao as p, i (i)}<p class="m-0 text-pretty"><Texto trechos={p} /></p>{/each}
{/snippet}

{#snippet personalidade()}
	{#if c.personalidade.length}
		<h2 class="t-h2 m-0">Personalidade</h2>
		{#each c.personalidade as p, i (i)}<p class="m-0 text-pretty"><Texto trechos={p} /></p>{/each}
	{/if}
{/snippet}

{#snippet comoLuta()}
	<h2 class="t-h2 m-0">Como luta</h2>
	{#each c.taticas as p, i (i)}<p class="m-0 text-pretty"><Texto trechos={p} /></p>{/each}
{/snippet}

{#snippet ganchos()}
	<h2 class="t-h2 m-0">Ganchos</h2>
	<ul class="m-0 flex list-disc flex-col gap-2 pl-6 marker:text-[var(--vermelhao)]">
		{#each c.ganchos as p, i (i)}<li class="text-pretty"><Texto trechos={p} /></li>{/each}
	</ul>
{/snippet}

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-5 pb-12 md:px-6 md:pt-8 md:pb-14">
	<nav aria-label="Trilha" class="flex flex-wrap items-center gap-2 text-sm leading-5 font-medium">
		<a href="/regras/bestiario" class="link">Bestiário</a><span class="font-pixel text-xs text-mut">▸</span>
		<a href="/regras/bestiario#letra-{c.letra}" class="link">{c.letra}</a><span class="font-pixel text-xs text-mut">▸</span>
		<span aria-current="page" class="flex-1">{c.nome}</span>
		<span class="t-num text-[13px] text-mut">página {data.pagina} de {data.total}</span>
	</nav>

	{#if f === 'faixa'}
		<figure class="m-0 -mx-4 md:mx-0"><ArteCriatura criatura={c} variante={data.pagina} carregar="eager" class="w-full" /></figure>
	{:else if abertura}
		<!-- a arte grande abre o verbete; título, cena e descrição ao lado, centrados na altura dela -->
		<div class="flex flex-col items-center gap-6 lg:flex-row lg:gap-10 {direita ? 'lg:flex-row-reverse' : ''}">
			<figure class="m-0 w-full flex-none" style:max-width="{largura(c.arte)}px"><ArteCriatura criatura={c} variante={data.pagina} carregar="eager" class="w-full" /></figure>
			<div class="flex min-w-0 flex-1 flex-col gap-5 text-[length:var(--leitura)] leading-[var(--leitura-linha)]">
				{@render cabecalho()}
				<Cena c={c.cena} />
				{@render descricao()}
			</div>
		</div>
	{/if}

	{#if varios}
		<!-- sem o índice de fichas, o texto ocupa a largura toda, em duas colunas de leitura -->
		<div class="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 text-[length:var(--leitura)] leading-[var(--leitura-linha)] md:grid-cols-2">
			{#if f === 'faixa'}
				<div class="flex flex-col gap-4">{@render cabecalho()}<Cena c={c.cena} />{@render descricao()}</div>
				<div class="flex flex-col gap-4">{@render personalidade()}{@render comoLuta()}{@render ganchos()}</div>
			{:else}
				<div class="flex flex-col gap-4">{@render personalidade()}{@render comoLuta()}</div>
				<div class="flex flex-col gap-4">{@render ganchos()}</div>
			{/if}
		</div>

		<!-- uma ficha separada por variação, cada uma com a sua arte, como os estágios de um dragão num livro de monstros:
		     a arte com o resumo e o "Usar na campanha" embaixo de um lado, o quadro de combate do outro, em zigue-zague -->
		{#each c.estagios as e, i (e.slug)}
			{@const w = larguraFicha(e.arte)}
			<section id={e.slug} class="flex scroll-mt-20 flex-col gap-4 border-t-2 border-b3 pt-6" aria-labelledby="titulo-{e.slug}">
				<header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<h2 id="titulo-{e.slug}" class="t-h2 m-0">{e.nome}</h2>
					<span class="font-pixel text-xs font-bold tracking-[.12em] text-title">AMEAÇA {e.ameacaRotulo} · {PAPEIS[e.papel].toUpperCase()}{e.membros > 1 ? ` · ${e.membros} MEMBROS` : ''}</span>
				</header>
				<div
					class="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:[grid-template-columns:var(--colunas)] lg:gap-10"
					style:--colunas={i % 2 ? '490px minmax(0,1fr)' : 'minmax(0,1fr) 490px'}
				>
					<!-- a arte centrada na coluna; o resumo e o "Usar na campanha" embaixo, na largura dela -->
					<div class="mx-auto flex w-full min-w-0 flex-col gap-4 {i % 2 ? 'lg:order-2' : ''}" style:max-width="{w}px">
						{#if e.arte}
							<figure class="m-0 w-full">
								<ArteCriatura criatura={{ nome: `${c.nome}: ${e.nome}`, arte: e.arte }} variante={data.pagina + i} class="w-full" />
							</figure>
						{/if}
						{#if e.resumo}<p class="m-0 font-mincho text-[length:var(--leitura)] leading-[var(--leitura-linha)] text-pretty italic"><Texto trechos={e.resumo} /></p>{/if}
						<UsarNaCampanha slug={c.slug} estagio={i} nomeEstagio={e.nome} />
					</div>
					<div class="min-w-0 self-start lg:sticky lg:top-20"><BlocoCriatura criatura={c} estagio={e} /></div>
				</div>
			</section>
		{/each}
	{:else}
		<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-10">
			<article class="flex min-w-0 flex-col gap-4 text-[length:var(--leitura)] leading-[var(--leitura-linha)]">
				{@render cabecalho()}
				{#if naColuna}
					<figure class="m-0 mx-auto w-full" style:max-width="{c.arte.largura * ESCALA_COLUNA[f as 'quadro' | 'pagina']}px">
						<ArteCriatura criatura={c} variante={data.pagina} carregar="eager" class="w-full" />
					</figure>
				{/if}
				<div class="flow-root">
					{#if f === 'retrato'}
						<figure class="m-0 mx-auto mb-4 w-full md:mb-3 md:w-[384px] {direita ? 'md:float-right md:ml-7' : 'md:float-left md:mr-7'}" style:max-width="{largura(c.arte)}px">
							<ArteCriatura criatura={c} variante={data.pagina} carregar="eager" class="w-full" />
						</figure>
					{/if}
					<div class="flex flex-col gap-4">
						<Cena c={c.cena} />
						{@render descricao()}
						{#if c.personalidade.length}<div class="mt-2 flex flex-col gap-4">{@render personalidade()}</div>{/if}
						<div class="mt-2 flex flex-col gap-4">{@render comoLuta()}</div>
						<div class="mt-2 flex flex-col gap-4">{@render ganchos()}</div>
					</div>
				</div>
			</article>
			<div class="flex flex-col gap-4 self-start lg:sticky lg:top-20">
				<BlocoCriatura criatura={c} estagio={c.estagios[0]} />
				<UsarNaCampanha slug={c.slug} />
			</div>
		</div>
	{/if}

	<nav aria-label="Folhear o bestiário" class="mt-4 grid grid-cols-2 gap-3 border-t-2 border-b3 pt-4">
		{#if data.anterior}<a href="/regras/bestiario/{data.anterior.slug}" class="flex flex-col gap-0.5 text-sm"><span class="t-rotulo-sm text-mut">◂ Página anterior</span><span class="link font-semibold">{data.anterior.nome}</span></a>{:else}<a href="/regras/bestiario/como-usar" class="flex flex-col gap-0.5 text-sm"><span class="t-rotulo-sm text-mut">◂ Introdução</span><span class="link font-semibold">Como usar o bestiário</span></a>{/if}
		{#if data.proximo}<a href="/regras/bestiario/{data.proximo.slug}" class="flex flex-col items-end gap-0.5 text-right text-sm"><span class="t-rotulo-sm text-mut">Próxima página ▸</span><span class="link font-semibold">{data.proximo.nome}</span></a>{:else}<a href="/regras/bestiario/por-ameaca" class="flex flex-col items-end gap-0.5 text-right text-sm"><span class="t-rotulo-sm text-mut">Apêndice ▸</span><span class="link font-semibold">Adversários por ameaça</span></a>{/if}
	</nav>
</main>

<Rodape />
