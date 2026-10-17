<script lang="ts">
	// D3 · Índice de clãs, com filtros por vila, presença de Kekkei Genkai e tipo de KKG.
	import CardCla from '#lib/componentes/regras/CardCla.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let vila = $state<string | null>(null);
	let kkg = $state<'todos' | 'com' | 'sem'>('todos');
	let tipo = $state<string | null>(null);

	const vilas = $derived([...new Map(data.clas.map((c) => [c.vila.nome, c.vila.icone])).entries()]);
	const tipos = $derived([...new Set(data.clas.flatMap((c) => (c.kkg ? [c.kkg.tipo] : [])))]);
	const lista = $derived(
		data.clas.filter(
			(c) =>
				(!vila || c.vila.nome === vila) &&
				(kkg === 'todos' || (kkg === 'com') === !!c.kkg) &&
				(!tipo || c.kkg?.tipo === tipo)
		)
	);

	function limpar() {
		vila = null;
		kkg = 'todos';
		tipo = null;
	}
</script>

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-14">
	<div class="flex flex-col gap-1.5">
		<a href={data.hrefCapitulo} class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title hover:underline">CAP. 8</a>
		<h1 class="t-h1 m-0">Clãs</h1>
		<p class="m-0 max-w-[72ch] text-[15px] leading-[23px] text-mut">
			Os clãs canônicos do <a class="link" href={data.hrefCatalogo}>cap. 8.3</a>, cada um com os nove componentes do livro. Para criar o seu, veja o <a class="link" href={data.hrefCriacao}>cap. 8.4</a>.
		</p>
	</div>

	<div class="painel flex flex-col gap-3 px-3 py-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2.5" role="group" aria-label="Filtros">
		<div class="flex flex-wrap items-center gap-2">
			<span class="t-rotulo-sm w-full text-mut sm:w-auto">Vila</span>
			<button type="button" class="chip pr-2.5 {vila === null ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={vila === null} onclick={() => (vila = null)}><Icone id="vila/ic-vila-sem" />Todas</button>
			{#each vilas as [nome, icone] (nome)}
				<button type="button" class="chip {icone ? '' : 'sem-icone'} {vila === nome ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={vila === nome} onclick={() => (vila = vila === nome ? null : nome)}>
					{#if icone}<Icone id={icone} />{/if}{nome}
				</button>
			{/each}
		</div>
		<span class="hidden h-7 w-0.5 bg-b3 lg:mx-1.5 lg:block"></span>
		<div class="flex flex-wrap items-center gap-2">
			<span class="t-rotulo-sm w-full text-mut sm:w-auto">KKG</span>
			<div class="alternancia">
				{#each [['todos', 'Todos'], ['com', 'Com KKG'], ['sem', 'Sem KKG']] as const as [k, n] (k)}
					<button type="button" aria-pressed={kkg === k} onclick={() => ((kkg = k), k === 'sem' && (tipo = null))}>{n}</button>
				{/each}
			</div>
			{#each tipos as t (t)}
				<button type="button" class="chip sem-icone {tipo === t ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={tipo === t} disabled={kkg === 'sem'} onclick={() => ((tipo = tipo === t ? null : t), (kkg = kkg === 'sem' ? 'todos' : kkg))}>{t}</button>
			{/each}
		</div>
		<span class="hidden flex-1 lg:block"></span>
		<span class="text-sm leading-5 font-semibold text-mut" aria-live="polite">{lista.length} {lista.length === 1 ? 'clã' : 'clãs'}</span>
	</div>

	{#if lista.length}
		<div class="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each lista as c (c.slug)}<CardCla cla={c} completo={false} />{/each}
			<a href={data.hrefCriacao} class="flex min-h-[150px] flex-col items-center justify-center gap-2.5 border-2 border-dashed border-[#8B2E20] p-4 text-center hover:bg-b2">
				<Icone id="acao/ic-acao-criar-cla" tamanho={64} />
				<span class="font-mincho text-[17px] leading-6 font-bold">Crie seu próprio clã</span>
				<span class="link text-[13px] leading-[18px] font-semibold">cap. 8.4 · Criação de clãs</span>
			</a>
		</div>
	{:else}
		<div class="painel-sombra flex flex-col items-center gap-3 px-6 py-8 text-center">
			<Icone id="illustrations/il-sem-resultados" tamanho={96} />
			<span class="font-mincho text-[22px] leading-[30px] font-bold">Nenhum clã com esses filtros</span>
			<button type="button" class="btn-jogo btn-contorno mt-1.5" onclick={limpar}>Limpar filtros</button>
		</div>
	{/if}
</main>

<Rodape />
