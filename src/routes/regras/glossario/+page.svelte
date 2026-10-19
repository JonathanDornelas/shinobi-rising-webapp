<script lang="ts">
	// D8 · Glossário (cap. 22): seções do livro, índice A–Z, filtro e uma âncora por termo. No fim, o compêndio com todos os
	// termos destacados no texto das regras (léxico), por tipo, cada um com o resumo e o link para a regra.
	import { afterNavigate } from '$app/navigation';
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import { EspiaoSecoes, irPara } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { ROTULO_LINK, ROTULO_TIPO } from '#lib/livro/lexico.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { TipoTermo } from '#lib/livro/tipos.ts';
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
	// compêndio: os termos do léxico, por tipo
	const ORDEM: TipoTermo[] = ['recurso', 'atributo', 'condicao', 'regra', 'pericia', 'elemento', 'rank', 'cla', 'jutsu', 'habilidade', 'arma'];
	let tipo = $state<TipoTermo | null>(null);
	const compendio = $derived(
		ORDEM.map((t) => ({
			tipo: t,
			termos: data.termos
				.filter((x) => x.tipo === t && (!tipo || tipo === t) && (!letra || inicial(x.rotulo) === letra) && (!filtro.trim() || normalizar(`${x.rotulo} ${x.nome} ${x.resumo}`).includes(normalizar(filtro))))
				.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
		})).filter((g) => g.termos.length)
	);
	const contagem = (t: TipoTermo) => data.termos.filter((x) => x.tipo === t).length;
	const ancora = (id: string) => `lex-${id.replace(':', '-')}`;
	const total = $derived(secoes.reduce((n, s) => n + s.termos.length, 0) + compendio.reduce((n, g) => n + g.termos.length, 0));

	const espiao = new EspiaoSecoes();
	let conteudo: HTMLElement | undefined = $state();
	$effect(() => {
		if (conteudo) return espiao.observar(conteudo, [...secoes.map((s) => s.id), 'compendio']);
	});
	afterNavigate(() => {
		if (location.hash) irPara(decodeURIComponent(location.hash.slice(1)), false);
	});

	const sigla = (t: string) => t.length <= 5 && !t.includes(' ') && /^[A-Z]{2}/.test(t) || /^[A-Z]{2,4}$/.test(t);
</script>

<div class="mx-auto box-border grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-14 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-10">
	<aside class="hidden lg:block">
		<div class="sticky top-4 flex flex-col gap-3">
			<span class="t-rotulo-sm text-title">Seções</span>
			<nav aria-label="Seções do glossário" class="flex flex-col">
				{#each [...data.glossario, { id: 'compendio', titulo: 'Compêndio de termos' }] as s (s.id)}
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
			{#each [...data.glossario, { id: 'compendio', titulo: 'Compêndio' }] as s (s.id)}
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
		{/each}

		<section class="flex flex-col gap-3" aria-labelledby="compendio">
			<h2 id="compendio" class="t-h2 m-0 mt-4 scroll-mt-4 md:text-2xl md:leading-8">Compêndio de termos</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">Todos os termos destacados no texto das regras: passe o mouse num deles em qualquer capítulo para ver o resumo, ou clique para ir à regra.</p>
			<div class="flex flex-wrap gap-1.5" role="group" aria-label="Tipo de termo">
				<button type="button" aria-pressed={!tipo} class="chip sem-icone min-h-9 {!tipo ? 'border-vermelhao bg-grena text-papel' : ''}" onclick={() => (tipo = null)}>Todos <span class="t-num text-xs opacity-75">{data.termos.length}</span></button>
				{#each ORDEM as t (t)}
					<button type="button" aria-pressed={tipo === t} class="chip sem-icone min-h-9 {tipo === t ? 'border-vermelhao bg-grena text-papel' : ''}" onclick={() => (tipo = tipo === t ? null : t)}>{ROTULO_TIPO[t]} <span class="t-num text-xs opacity-75">{contagem(t)}</span></button>
				{/each}
			</div>
			{#each compendio as g (g.tipo)}
				<h3 class="t-rotulo m-0 mt-2 text-title">{ROTULO_TIPO[g.tipo]}</h3>
				<ul class="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-2 p-0 md:grid-cols-2">
					{#each g.termos as x (x.id)}
						<li id={ancora(x.id)} class="flex scroll-mt-4 flex-col gap-1.5 border-2 border-frame bg-b2 px-3 py-2.5">
							<span class="flex items-center gap-2">
								{#if x.icone}<Icone id={x.icone} />{/if}
								<span class="flex min-w-0 flex-col">
									<span class="font-mincho text-base leading-[22px] font-bold">{x.rotulo}</span>
									{#if x.nome !== x.rotulo}<span class="truncate text-xs leading-4 text-mut italic">{x.nome}</span>{/if}
								</span>
							</span>
							<span class="text-sm leading-[21px]">{x.resumo}</span>
							<a href={x.href} class="link self-start text-[13px] leading-[18px] font-semibold">{ROTULO_LINK[x.tipo] ?? 'Ver a regra'} →</a>
						</li>
					{/each}
				</ul>
			{/each}
		</section>

		{#if !secoes.length && !compendio.length}
			<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
				<Icone id="illustrations/il-sem-resultados" tamanho={96} />
				<span class="font-mincho text-xl font-bold">Nenhum termo com “{filtro || letra}”</span>
				<button type="button" class="btn-jogo btn-contorno" onclick={() => ((letra = null), (filtro = ''), (tipo = null))}>Limpar filtro</button>
			</div>
		{/if}
	</main>
</div>

<Rodape />
