<script lang="ts">
	// Tabela de regras (CMP-21). Mobile: até 3 colunas viram lista "rótulo: valor";
	// 4 ou mais rolam na horizontal com a 1ª coluna fixa e uma aba ▸ indicando a rolagem.
	import type { Celula } from '#lib/livro/tipos.ts';
	import Texto from './Texto.svelte';

	interface Props {
		cab: string[] | null;
		linhas: Celula[][];
		legenda?: string;
	}
	let { cab, linhas, legenda }: Props = $props();

	const colunas = $derived(Math.max(cab?.length ?? 0, ...linhas.map((l) => l.length)));
	const lista = $derived(colunas <= 3);
	/** Colunas numéricas curtas ficam em Pixelify. */
	const numerica = $derived(
		Array.from({ length: colunas }, (_, c) =>
			linhas.every((l) => {
				const t = (l[c] ?? []).map((p) => p.map((x) => x.t).join('')).join(' ').trim();
				return t.length <= 14 && /^[\d+\-−–—≤≥/.,%×d ]*(PC|PE|PT|PV|PIC|ryo|m|kg)?[\d+\-−–—/.,% ]*$/i.test(t);
			})
		)
	);

	let rolagem: HTMLDivElement | undefined = $state();
	let temMais = $state(false);
	function medir() {
		if (rolagem) temMais = rolagem.scrollWidth - rolagem.clientWidth - rolagem.scrollLeft > 4;
	}
	$effect(() => {
		medir();
		addEventListener('resize', medir);
		return () => removeEventListener('resize', medir);
	});
</script>

{#snippet celula(c: Celula)}
	{#each c as p, i (i)}<span class="block"><Texto trechos={p} /></span>{/each}
{/snippet}

<figure class="m-0 flex flex-col gap-2">
	<div class="relative {lista ? 'hidden md:block' : ''}">
		<div bind:this={rolagem} class="overflow-x-auto" onscroll={medir}>
			<table class="sombra-painel w-full border-collapse border-2 border-frame text-[15px] leading-[22px]">
				{#if cab}
					<thead>
						<tr class="bg-vermelhao text-left font-pixel text-[13px] leading-[18px] font-bold tracking-[.06em] text-white uppercase">
							{#each cab as h, c (c)}
								<th scope="col" class="px-3 py-2.5 align-bottom {c === 0 ? 'sticky left-0 z-[1] bg-vermelhao shadow-[2px_0_0_var(--vermelhao-lo)] md:static md:shadow-none' : ''}">{h}</th>
							{/each}
						</tr>
					</thead>
				{/if}
				<tbody>
					{#each linhas as l, r (r)}
						<tr class={r % 2 ? 'bg-b2' : 'bg-b1'}>
							{#each l as c, ci (ci)}
								<td
									class="min-w-[90px] px-3 py-2 align-top {numerica[ci] ? 't-num whitespace-nowrap' : ''} {ci === 0
										? `sticky left-0 z-[1] font-semibold shadow-[2px_0_0_var(--b3)] md:static md:shadow-none ${r % 2 ? 'bg-b2' : 'bg-b1'}`
										: ''}">{@render celula(c)}</td
								>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if temMais}
			<span class="pointer-events-none absolute top-0 right-0 bottom-0 flex w-7 items-center justify-center border-l-2 border-ink bg-b0 font-pixel text-sm font-bold text-b0fg md:hidden" aria-hidden="true">▸</span>
		{/if}
	</div>

	{#if lista}
		<div class="flex flex-col border-2 border-frame md:hidden">
			{#each linhas as l, r (r)}
				<div class="flex flex-col gap-1 border-b-2 border-b3 px-3 py-2 last:border-b-0 {r % 2 ? 'bg-b2' : 'bg-b1'}">
					{#each l as c, ci (ci)}
						{#if ci === 0}
							<span class="text-[15px] leading-[22px] font-semibold">{#if cab}<span class="t-rotulo-sm mr-1 text-mut">{cab[0]}:</span>{/if}{@render celula(c)}</span>
						{:else}
							<span class="text-[15px] leading-[22px]">{#if cab?.[ci]}<span class="t-rotulo-sm mb-0.5 block text-mut">{cab[ci]}</span>{/if}{@render celula(c)}</span>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	{/if}
	{#if legenda}<figcaption class="text-[13px] leading-[18px] text-mut">{legenda}</figcaption>{/if}
</figure>
