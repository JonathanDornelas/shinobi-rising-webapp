<script lang="ts">
	// D10 · Referência rápida ("escudo do Mestre"): as tabelas mais consultadas na sessão.
	import { onMount } from 'svelte';
	import { realcar } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const curto = (v: string) => v.length <= 16;

	onMount(() => {
		const el = location.hash && document.getElementById(location.hash.slice(1));
		if (el) realcar(el);
	});
</script>

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-6 pb-12 md:gap-6 md:px-6 md:pt-8 md:pb-14 print:max-w-none print:p-0">
	<div class="flex items-end gap-4">
		<div class="flex flex-1 flex-col gap-1.5">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title">REFERÊNCIA</span>
			<h1 class="t-h1 m-0">Referência rápida</h1>
		</div>
		<button type="button" class="btn-jogo btn-contorno hidden md:inline-flex print:hidden" onclick={() => print()}><Traco nome="imprimir" />Imprimir</button>
	</div>

	<nav aria-label="Tabelas" class="-mx-4 flex gap-1.5 overflow-x-auto border-y-2 border-b3 bg-b2 px-4 py-2.5 md:hidden print:hidden">
		{#each data.referencia as r (r.id)}
			<a href="#{r.id}" class="flex-none border-2 border-b3 p-2 font-pixel text-xs leading-none font-bold tracking-[.04em] whitespace-nowrap">{r.titulo}</a>
		{/each}
	</nav>

	<div class="columns-1 gap-4 md:columns-2 lg:columns-3 print:columns-3">
		{#each data.referencia as r (r.id)}
			<section id={r.id} class="sombra-painel mb-4 scroll-mt-4 break-inside-avoid border-2 border-frame bg-b2" aria-labelledby="t-{r.id}">
				<div class="flex items-center gap-2 border-b-2 border-b3 py-1 pr-3 pl-1">
					<Icone id={r.icone} />
					<h2 id="t-{r.id}" class="t-rotulo m-0 flex-1 tracking-[.08em]">{r.titulo}</h2>
					<a href={r.capitulo.href} class="link text-xs leading-4 font-semibold print:no-underline">cap. {r.capitulo.numero}</a>
				</div>
				<dl class="m-0">
					{#each r.linhas as [k, v], i (i)}
						<div class="flex gap-3 border-b-2 border-b3 px-3 py-[7px] text-sm leading-5 last:border-b-0 {curto(v) ? 'items-baseline' : 'flex-col gap-0.5'}">
							<dt class={curto(v) ? 'flex-1' : 'font-semibold'}>{k}</dt>
							<dd class="m-0 {curto(v) ? 't-num text-right' : 'text-mut'}">{v}</dd>
						</div>
					{/each}
				</dl>
			</section>
		{/each}
	</div>
</main>

<div class="print:hidden"><Rodape /></div>
