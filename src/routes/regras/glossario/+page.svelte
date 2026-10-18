<script lang="ts">
	// D8 · Glossário (cap. 22): seções do livro, índice A–Z, filtro e uma âncora por termo (destino do CMP-22).
	import { afterNavigate } from '$app/navigation';
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import { EspiaoSecoes, realcar } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let filtro = $state('');
	let letra = $state<string | null>(null);
	const inicial = (t: string) => normalizar(t).charAt(0).toUpperCase();
	const letrasComTermos = $derived(new Set(data.glossario.flatMap((s) => s.termos.map((t) => inicial(t.termo)))));

	const secoes = $derived(
		data.glossario
			.map((s) => ({
				...s,
				termos: s.termos.filter(
					(t) =>
						(!letra || inicial(t.termo) === letra) &&
						(!filtro.trim() || normalizar(`${t.termo} ${t.campos.join(' ')}`).includes(normalizar(filtro)))
				)
			}))
			.filter((s) => s.termos.length)
	);
	const total = $derived(secoes.reduce((n, s) => n + s.termos.length, 0));

	const espiao = new EspiaoSecoes();
	let conteudo: HTMLElement | undefined = $state();
	$effect(() => {
		if (conteudo) return espiao.observar(conteudo, secoes.map((s) => s.id));
	});
	afterNavigate(() => {
		const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
		if (el) realcar(el);
	});

	const sigla = (t: string) => t.length <= 5 && !t.includes(' ') && /^[A-Z]{2}/.test(t) || /^[A-Z]{2,4}$/.test(t);
</script>

<div class="mx-auto box-border grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-14 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-10">
	<aside class="hidden lg:block">
		<div class="sticky top-4 flex flex-col gap-3">
			<span class="t-rotulo-sm text-title">Seções</span>
			<nav aria-label="Seções do glossário" class="flex flex-col">
				{#each data.glossario as s (s.id)}
					{@const on = espiao.ativa === s.id}
					<a href="#{s.id}" class="flex min-h-9 items-center px-2.5 text-sm leading-5 {on ? 'bg-grena font-semibold text-papel shadow-[inset_4px_0_0_var(--vermelhao)]' : 'font-medium hover:bg-b3'}">{s.titulo}</a>
				{/each}
			</nav>
			<span class="t-rotulo-sm mt-3 text-title">A–Z</span>
			<div class="grid grid-cols-6 gap-1" role="group" aria-label="Filtrar por letra inicial">
				{#each 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as l (l)}
					{@const tem = letrasComTermos.has(l)}
					<button
						type="button"
						disabled={!tem}
						aria-pressed={letra === l}
						class="t-num flex h-8 items-center justify-center border-2 text-[13px]"
						style:border-color={letra === l ? 'var(--vermelhao)' : tem ? 'var(--b3)' : 'transparent'}
						style:background={letra === l ? 'var(--vermelhao)' : 'transparent'}
						style:color={letra === l ? '#FFFFFF' : tem ? 'var(--fg)' : 'var(--b3)'}
						onclick={() => (letra = letra === l ? null : l)}>{l}</button
					>
				{/each}
			</div>
		</div>
	</aside>

	<main bind:this={conteudo} class="flex min-w-0 flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title">CAP. 22</span>
			<h1 class="t-h1 m-0">Glossário</h1>
		</div>
		<Blocos blocos={data.intro} compacto />

		<div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:hidden">
			{#each data.glossario as s (s.id)}
				<a href="#{s.id}" class="chip sem-icone flex-none font-pixel text-xs font-bold tracking-[.04em] whitespace-nowrap uppercase">{s.titulo.split(' — ')[0]}</a>
			{/each}
		</div>

		<label class="campo flex items-center gap-2.5">
			<span class="text-mut"><Traco nome="buscar" /></span>
			<input bind:value={filtro} type="search" placeholder="Filtrar termos" aria-label="Filtrar termos do glossário" class="min-w-0 flex-1 bg-transparent text-base text-fg outline-none" />
		</label>
		{#if letra || filtro.trim()}
			<div class="flex items-center gap-2 text-sm font-semibold text-mut" aria-live="polite">
				{total} {total === 1 ? 'termo' : 'termos'}{letra ? ` com ${letra}` : ''}
				<button type="button" class="link" onclick={() => ((letra = null), (filtro = ''))}>Limpar</button>
			</div>
		{/if}

		{#each secoes as s (s.id)}
			<section class="flex flex-col gap-3" aria-labelledby={s.id}>
				<h2 id={s.id} class="t-h2 m-0 mt-2 scroll-mt-4 md:text-2xl md:leading-8">{s.titulo}</h2>
				<Blocos blocos={s.intro} compacto />
				<dl class="m-0 flex flex-col border-2 border-frame">
					{#each s.termos as t (t.id)}
						<div id={t.id} class="grid scroll-mt-4 grid-cols-[minmax(0,1fr)] gap-1 border-b-2 border-b3 px-3.5 py-3 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
							<dt class="flex items-center gap-1.5">
								{#if t.icone}<Icone id={t.icone} />{/if}
								<span class={sigla(t.termo) ? 't-num text-xl leading-none' : 'font-mincho text-base leading-[22px] font-bold'}>{t.termo}</span>
							</dt>
							<dd class="m-0 flex flex-col gap-0.5">
								<span class="text-[15px] leading-[22px] font-semibold">{t.campos[0]}</span>
								{#each t.campos.slice(1) as c, i (i)}
									{#if c && c !== '—'}<span class="text-sm leading-[21px] text-mut">{c}</span>{/if}
								{/each}
							</dd>
						</div>
					{/each}
				</dl>
			</section>
		{:else}
			<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
				<Icone id="illustrations/il-sem-resultados" tamanho={96} />
				<span class="font-mincho text-xl font-bold">Nenhum termo com “{filtro || letra}”</span>
				<button type="button" class="btn-jogo btn-contorno" onclick={() => ((letra = null), (filtro = ''))}>Limpar filtro</button>
			</div>
		{/each}
	</main>
</div>

<Rodape />
