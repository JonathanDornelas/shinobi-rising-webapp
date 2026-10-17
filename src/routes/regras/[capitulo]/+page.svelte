<script lang="ts">
	// D2 · Página de capítulo (template de leitura).
	// Desktop: sumário 280 · conteúdo até 760 · "Nesta página" 220. Tablet: sumário em drawer e
	// "Nesta página" em dropdown. Mobile: barra fixa com o capítulo e "Nesta página" em bottom sheet.
	import { afterNavigate } from '$app/navigation';
	import AjustesLeitura from '#lib/componentes/leitura/AjustesLeitura.svelte';
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import Epigrafe from '#lib/componentes/leitura/Epigrafe.svelte';
	import { EspiaoSecoes, realcar } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Sumario from '#lib/componentes/leitura/Sumario.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Folha from '#lib/componentes/ui/Folha.svelte';
	import Gaveta from '#lib/componentes/ui/Gaveta.svelte';
	import { salvarProgresso } from '#lib/estado/progresso.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import indiceJson from '#lib/livro/gerado/indice.json';
	import type { IndiceLivro } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const indice = indiceJson as IndiceLivro;

	const cap = $derived(data.capitulo);
	const parte = $derived(indice.partes.find((p) => p.numero === cap.parte)!);
	/** "Nesta página" lista o nível de título mais alto do capítulo (H2; H3 se não houver H2). */
	const nivelPrincipal = $derived(Math.min(...cap.secoes.map((s) => s.nivel), 4));
	const secoes = $derived(cap.secoes.filter((s) => s.nivel === nivelPrincipal));

	const espiao = new EspiaoSecoes();
	let artigo: HTMLElement | undefined = $state();
	let sumarioAberto = $state(false);
	let nestaPaginaAberta = $state(false);
	let dropdownAberto = $state(false);

	const secaoAtiva = $derived(secoes.find((s) => s.id === espiao.ativa) ?? null);

	$effect(() => {
		if (!artigo) return;
		return espiao.observar(
			artigo,
			secoes.map((s) => s.id)
		);
	});

	// "Continuar leitura": salva o ponto atual neste dispositivo
	$effect(() => {
		const registro = { capitulo: cap.numero, titulo: cap.titulo, href: cap.href, secao: secaoAtiva?.id ?? null, secaoTitulo: secaoAtiva?.titulo ?? null, pct: espiao.pct };
		const t = setTimeout(() => salvarProgresso(registro), 400);
		return () => clearTimeout(t);
	});

	afterNavigate(() => {
		const hash = decodeURIComponent(location.hash.slice(1));
		if (!hash) return;
		const el = document.getElementById(hash);
		if (el) realcar(el);
		else {
			scrollTo({ top: 0 });
			toasts.mostrar('Seção não encontrada.', 'aviso');
		}
	});

	async function copiarLinkSecao() {
		const id = secaoAtiva?.id;
		const url = `${location.origin}${location.pathname}${id ? '#' + id : ''}`;
		try {
			await navigator.clipboard.writeText(url);
			toasts.mostrar('Link da seção copiado.', 'sucesso');
		} catch {
			toasts.mostrar('Não foi possível copiar o link.', 'erro');
		}
	}
</script>

<!-- Tablet: barra com Sumário, Nesta página e Aa -->
<div class="sticky top-0 z-20 hidden items-center gap-2.5 border-b-2 border-b3 bg-b2 px-5 py-2 md:flex lg:hidden">
	<button type="button" class="btn-jogo btn-contorno min-h-11 px-3 text-[13px] tracking-[.06em]" onclick={() => (sumarioAberto = true)}>
		<svg width="18" height="18" viewBox="0 0 24 24" class="fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d="M4 6h16M4 12h16M4 18h16" /></svg>Sumário
	</button>
	<span class="flex-1"></span>
	{#if secoes.length}
		<div class="relative">
			<button type="button" class="flex min-h-11 items-center gap-2 border-2 border-b3 px-3 text-sm font-semibold" aria-expanded={dropdownAberto} onclick={() => (dropdownAberto = !dropdownAberto)}>
				Nesta página: {secaoAtiva?.titulo ?? secoes[0].titulo} <span class="font-pixel text-xs">▾</span>
			</button>
			{#if dropdownAberto}
				<div class="camada absolute top-[52px] right-0 z-30 flex max-h-[60vh] w-[300px] flex-col overflow-y-auto py-1.5">
					{#each secoes as s (s.id)}
						<a href="#{s.id}" onclick={() => (dropdownAberto = false)} class="flex min-h-11 items-center px-3.5 text-sm hover:bg-b3 {s.id === secaoAtiva?.id ? 'font-semibold shadow-[inset_3px_0_0_#C44536]' : ''}">{s.titulo}</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	<AjustesLeitura />
</div>

<!-- Mobile: barra fixa com o capítulo e o sumário -->
<div class="sticky top-0 z-20 flex min-h-[52px] items-center gap-2 border-b-2 border-ink bg-b2 pr-1.5 pl-4 md:hidden">
	<span class="min-w-0 flex-1 truncate font-mincho text-base leading-[22px] font-bold">Cap. {cap.numero} · {cap.titulo}</span>
	<AjustesLeitura />
	<button type="button" class="flex min-h-11 items-center border-2 border-b3 px-2.5 font-pixel text-xs font-bold tracking-[.06em]" onclick={() => (sumarioAberto = true)}>SUMÁRIO</button>
</div>

<div class="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_220px]">
	<aside class="hidden border-r-2 border-b3 bg-b2 lg:block">
		<div class="sticky top-0 max-h-screen overflow-y-auto">
			<Sumario atual={cap.numero} secaoAtiva={espiao.ativa} {secoes} />
		</div>
	</aside>

	<main class="flex flex-col items-center px-4 pt-5 pb-16 md:px-10 md:pt-8 lg:px-12 lg:pt-6">
		<article bind:this={artigo} class="flex w-full max-w-[760px] flex-col gap-4 md:gap-5" aria-labelledby="titulo-capitulo">
			<div class="hidden items-center gap-2 text-sm leading-5 font-medium lg:flex">
				<nav aria-label="Trilha" class="flex flex-wrap items-center gap-2">
					<a href="/regras" class="link">Regras</a><span class="font-pixel text-xs text-mut">▸</span>
					<a href={indice.capitulos.find((c) => c.numero === parte.capitulos[0])?.href} class="link">{parte.rotulo === 'REFERÊNCIA' ? 'Referência' : `Parte ${parte.rotulo.split(' ')[1]}`}</a><span
						class="font-pixel text-xs text-mut">▸</span
					>
					<span aria-current="page">{cap.titulo}</span>
				</nav>
				<span class="flex-1"></span>
				<AjustesLeitura />
			</div>

			<header class="relative pt-1 pb-2 md:pt-7">
				<span aria-hidden="true" class="pointer-events-none absolute top-[-4px] right-0 font-jp text-[112px] leading-none font-extrabold text-b3 select-none md:top-[-8px] md:text-[168px]">{cap.kanji}</span>
				<div class="relative flex flex-col gap-1.5">
					<span class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title md:text-sm">CAPÍTULO {cap.numero}</span>
					<h1 id="titulo-capitulo" class="m-0 font-mincho text-[32px] leading-10 font-bold md:text-[44px] md:leading-[52px]">{cap.titulo}</h1>
				</div>
			</header>

			{#if cap.epigrafe}
				<Epigrafe texto={cap.epigrafe.texto} autor={cap.epigrafe.autor} grande />
				<div class="flex flex-col gap-0.5" aria-hidden="true">
					<div class="h-0.5 bg-[rgba(139,46,32,.55)]"></div>
					<div class="h-0.5 bg-[rgba(139,46,32,.55)]"></div>
				</div>
			{/if}

			<Blocos blocos={cap.blocos} jutsus={data.jutsus} habilidades={data.habilidades} clas={data.clas} />

			<nav aria-label="Capítulos vizinhos" class="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 border-t-2 border-b3 pt-5 sm:grid-cols-2">
				{#if data.anterior}
					<a href={data.anterior.href} class="painel cartao-link flex flex-col gap-1 px-3.5 py-3">
						<span class="t-rotulo-sm text-mut">◂ Anterior</span>
						<span class="font-mincho text-[17px] leading-6 font-bold">Cap. {data.anterior.numero} · {data.anterior.titulo}</span>
					</a>
				{:else}<span></span>{/if}
				{#if data.proximo}
					<a href={data.proximo.href} class="painel cartao-link flex flex-col gap-1 px-3.5 py-3 text-right">
						<span class="t-rotulo-sm text-mut">Próximo ▸</span>
						<span class="font-mincho text-[17px] leading-6 font-bold">Cap. {data.proximo.numero} · {data.proximo.titulo}</span>
					</a>
				{/if}
			</nav>
		</article>
	</main>

	<aside aria-label="Nesta página" class="hidden pt-7 pr-4 lg:block">
		{#if secoes.length}
			<div class="sticky top-4 flex max-h-[calc(100vh-32px)] flex-col overflow-y-auto border-l-2 border-b3">
				<span class="t-rotulo-sm pb-2.5 pl-3.5 text-title">Nesta página</span>
				{#each secoes as s (s.id)}
					{@const on = s.id === secaoAtiva?.id}
					<a href="#{s.id}" class="-ml-0.5 flex min-h-8 items-center py-1 pl-3 text-[13px] leading-[18px] {on ? 'font-semibold text-fg shadow-[inset_2px_0_0_#C44536]' : 'text-mut hover:text-fg'}" aria-current={on ? 'location' : undefined}
						>{s.titulo}</a
					>
				{/each}
				<span class="my-2.5 ml-3 h-0.5 bg-b3"></span>
				<button type="button" class="link self-start pl-3.5 text-left text-[13px] leading-[18px] font-semibold" onclick={copiarLinkSecao}>Copiar link da seção</button>
			</div>
		{/if}
	</aside>
</div>

<!-- Mobile: "Nesta página" fixo acima do dock -->
{#if secoes.length}
	<button
		type="button"
		class="fixed right-0 bottom-16 left-0 z-30 flex min-h-[52px] items-center gap-2 border-t-2 border-ink bg-b2 pr-1.5 pl-4 text-left md:hidden"
		onclick={() => (nestaPaginaAberta = true)}
	>
		<span class="min-w-0 flex-1 truncate text-sm leading-5 font-semibold">Nesta página · {secaoAtiva?.titulo ?? secoes[0].titulo}</span>
		<span class="px-3 font-pixel text-sm font-bold">▴</span>
	</button>
	<div class="h-[52px] md:hidden"></div>
{/if}

<Rodape leitura />

{#if sumarioAberto}
	<Gaveta rotulo="Sumário" aoFechar={() => (sumarioAberto = false)}>
		<Sumario atual={cap.numero} secaoAtiva={espiao.ativa} {secoes} toque aoNavegar={() => (sumarioAberto = false)} />
	</Gaveta>
{/if}
{#if nestaPaginaAberta}
	<Folha rotulo="Nesta página" aoFechar={() => (nestaPaginaAberta = false)}>
		<span class="t-rotulo block px-4 py-2.5">Nesta página</span>
		{#each secoes as s (s.id)}
			{@const on = s.id === secaoAtiva?.id}
			<a
				href="#{s.id}"
				onclick={() => (nestaPaginaAberta = false)}
				class="flex min-h-12 items-center border-t-2 border-b3 px-4 text-[15px] leading-5 {on ? 'font-semibold shadow-[inset_3px_0_0_#C44536]' : 'text-mut'}">{s.titulo}</a
			>
		{/each}
	</Folha>
{/if}
