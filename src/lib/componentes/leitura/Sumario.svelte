<script lang="ts">
	// Sumário da documentação (D2): árvore Partes › Capítulos › Seções, com filtro e capítulo atual expandido.
	import indiceJson from '#lib/livro/gerado/indice.json';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { IndiceLivro, SecaoIndice } from '#lib/livro/tipos.ts';
	import Icone from '../ui/Icone.svelte';
	import Traco from '../ui/Traco.svelte';

	interface Props {
		atual: number;
		secaoAtiva?: string | null;
		/** Seções mostradas sob o capítulo atual (as de nível principal). */
		secoes: SecaoIndice[];
		aoNavegar?: () => void;
		/** Itens maiores (44px) para toque. */
		toque?: boolean;
	}
	let { atual, secaoAtiva = null, secoes, aoNavegar, toque = false }: Props = $props();

	const indice = indiceJson as IndiceLivro;
	const cap = (n: number) => indice.capitulos.find((c) => c.numero === n)!;
	const parteAtual = $derived(cap(atual)?.parte ?? 1);

	let filtro = $state('');
	let abertas = $state<Record<number, boolean>>({});
	const aberta = (p: number) => abertas[p] ?? p === parteAtual;

	/** Com filtro: capítulos cujo título ou alguma seção casa com o texto, com as seções que casaram. */
	const resultado = $derived.by(() => {
		const q = normalizar(filtro);
		if (!q) return null;
		return indice.capitulos
			.map((c) => ({
				c,
				secoes: c.secoes.filter((s) => normalizar(s.titulo).includes(q)),
				titulo: normalizar(c.titulo).includes(q)
			}))
			.filter((x) => x.titulo || x.secoes.length);
	});

	const altura = $derived(toque ? 'min-h-11' : 'min-h-10');
</script>

<nav aria-label="Sumário" class="flex flex-col gap-1 py-4">
	<label class="campo mx-3.5 mb-2.5 flex h-10 items-center gap-2 px-2.5 text-sm">
		<span class="text-mut"><Traco nome="buscar" tamanho={16} espessura={2.5} /></span>
		<input bind:value={filtro} type="search" placeholder="Filtrar sumário" aria-label="Filtrar sumário" class="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none" />
	</label>

	{#if resultado}
		{#if !resultado.length}
			<p class="m-0 px-3.5 py-2 text-sm text-mut">Nada no sumário com “{filtro}”.</p>
		{/if}
		{#each resultado as r (r.c.numero)}
			<a href={r.c.href} onclick={aoNavegar} class="flex {altura} items-center gap-2.5 px-3.5 text-sm leading-5 font-semibold hover:bg-b3">
				<span class="t-num w-5 flex-none text-[13px] text-mut">{r.c.numero}</span>{r.c.titulo}
			</a>
			{#each r.secoes as s (s.id)}
				<a href="{r.c.href}#{s.id}" onclick={aoNavegar} class="flex min-h-8 items-center py-1 pr-3.5 pl-[46px] text-[13px] leading-[18px] text-mut hover:text-fg">{s.titulo}</a>
			{/each}
		{/each}
	{:else}
		{#each indice.partes as p (p.numero)}
			<button
				type="button"
				class="flex {altura} w-full items-center gap-2 px-3.5 text-left"
				style:color={p.numero === parteAtual ? 'var(--title)' : 'var(--mut)'}
				aria-expanded={aberta(p.numero)}
				onclick={() => (abertas[p.numero] = !aberta(p.numero))}
			>
				<Icone id={p.icone} />
				<span class="t-rotulo-sm flex-1 tracking-[.08em]">{p.rotulo}</span>
				<span class="font-pixel text-xs">{aberta(p.numero) ? '▾' : '▸'}</span>
			</button>
			{#if aberta(p.numero)}
				{#each p.capitulos as n (n)}
					{@const c = cap(n)}
					{@const on = n === atual}
					<a
						href={c.href}
						onclick={aoNavegar}
						aria-current={on ? 'page' : undefined}
						class="flex {altura} items-center gap-2.5 py-1 pr-3.5 pl-[22px] text-sm leading-5 {on ? 'bg-grena font-semibold text-papel shadow-[inset_4px_0_0_#C44536]' : 'font-medium hover:bg-b3'}"
					>
						<span class="t-num w-5 flex-none text-[13px]" style:color={on ? '#F2C14E' : 'var(--mut)'}>{n}</span>{c.titulo}
					</a>
					{#if on && secoes.length}
						<div class="flex flex-col pt-1 pb-2">
							{#each secoes as s (s.id)}
								{@const ativa = s.id === secaoAtiva}
								<a
									href="#{s.id}"
									onclick={aoNavegar}
									class="flex min-h-8 items-center py-1 pr-3.5 pl-[54px] text-[13px] leading-[18px] {ativa ? 'font-semibold text-fg shadow-[inset_2px_0_0_#C44536]' : 'text-mut hover:text-fg'}"
									aria-current={ativa ? 'location' : undefined}>{s.titulo}</a
								>
							{/each}
						</div>
					{/if}
				{/each}
			{/if}
		{/each}
	{/if}
</nav>
