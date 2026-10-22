<script lang="ts">
	// Bestiário: um livro à parte, como um livro de monstros. Capa com o sumário (introdução, monstros de A a Z,
	// apêndice), a barra de letras e uma seção por letra, com os cards em mosaico no tamanho do formato da arte.
	import { onMount } from 'svelte';
	import { PAPEIS } from '#lib/bestiario/npc.ts';
	import ArteCriatura from '#lib/componentes/bestiario/ArteCriatura.svelte';
	import CardCriatura from '#lib/componentes/bestiario/CardCriatura.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import type { FormatoArte, TipoCriatura } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const TIPOS: [TipoCriatura, string][] = [
		['shinobi', 'Shinobi'],
		['fora da lei', 'Fora da lei'],
		['guerreiro', 'Guerreiros'],
		['organização', 'Organizações'],
		['fauna', 'Feras'],
		['invocação', 'Invocações'],
		['criatura', 'Criaturas']
	];
	const FAIXAS = [
		['todas', 'Todas', 0, 99],
		['baixa', '1/4 a 3', 0, 3],
		['media', '4 a 6', 4, 6],
		['alta', '7 a 10', 7, 10],
		['topo', '11+', 11, 99]
	] as const;
	/** Espaço do card na grade: a faixa ocupa duas colunas; retrato, quadro e página ficam mais altos. */
	const ESPACO: Record<FormatoArte, string> = {
		faixa: 'col-span-2 row-span-2',
		retrato: 'row-span-3',
		quadro: 'row-span-3',
		pagina: 'row-span-4'
	};

	let tipo = $state<TipoCriatura | null>(null);
	let faixa = $state<(typeof FAIXAS)[number][0]>('todas');
	/** Sumário: a lista alfabética compacta, como o índice de um livro de monstros. Galeria: o mosaico das artes. */
	let visao = $state<'sumario' | 'galeria'>('sumario');
	onMount(() => {
		try {
			if (localStorage.getItem('snm:bestiario-visao') === 'galeria') visao = 'galeria';
		} catch {
			/* sem armazenamento: fica o sumário */
		}
	});
	function trocarVisao(v: typeof visao) {
		visao = v;
		try {
			localStorage.setItem('snm:bestiario-visao', v);
		} catch {
			/* sem armazenamento */
		}
	}
	const lista = $derived(
		data.criaturas.filter((c) => {
			const [, , min, max] = FAIXAS.find((f) => f[0] === faixa)!;
			// um verbete com estágios entra se algum estágio cair na faixa
			return (!tipo || c.tipo === tipo) && c.ameacaMax >= min && c.ameacaMin <= max;
		})
	);
	const letras = $derived([...new Set(data.criaturas.map((c) => c.letra))]);
	const porLetra = $derived(letras.map((l) => [l, lista.filter((c) => c.letra === l)] as const).filter(([, cs]) => cs.length));
</script>

<header class="border-b-2 border-ink bg-b0 px-4 py-6 md:px-6 md:py-10">
	<div class="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] items-end gap-5 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-12">
		<div class="flex flex-col gap-2.5">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[.14em] text-[#D9A82B]">SHINOBI NO MICHI · LIVRO DE MONSTROS</span>
			<h1 class="m-0 font-mincho text-[38px] leading-[44px] font-extrabold text-papel md:text-[56px] md:leading-[62px]">Bestiário</h1>
			<p class="m-0 max-w-[62ch] text-[15px] leading-[23px] text-areia md:text-[17px] md:leading-[27px]">
				O que se levanta contra os ninjas: os shinobi de cada vila, do Genin ao Kage, clãs, o Sennin, organizações, fora da lei, feras, invocações e coisas que não deveriam andar. {data.criaturas.length} verbetes e {data.fichas} fichas de combate, em ordem alfabética.
			</p>
		</div>
		<nav aria-label="Sumário do bestiário" class="flex flex-col border-2 border-[var(--vermelhao-lo)] bg-[#16110F] text-papel">
			<span class="border-b-2 border-[var(--vermelhao-lo)] px-3.5 py-2 font-pixel text-[11px] leading-none font-bold tracking-[.16em] text-[#D9A82B]">SUMÁRIO</span>
			<a href="/regras/bestiario/como-usar" class="flex flex-col gap-0.5 px-3.5 py-2.5 hover:bg-grena">
				<span class="t-rotulo-sm text-ouro">Introdução</span>
				<span class="font-mincho text-[17px] leading-6 font-bold">{data.comoUsar.titulo}</span>
				<span class="text-[13px] leading-[18px] text-papel-2">{data.comoUsar.secoes.map((s) => s.titulo).join(' · ')}</span>
			</a>
			<a href="#monstros" class="flex flex-col gap-0.5 border-t border-[#2E2420] px-3.5 py-2.5 hover:bg-grena">
				<span class="t-rotulo-sm text-ouro">Monstros</span>
				<span class="font-mincho text-[17px] leading-6 font-bold">De {letras[0]} a {letras.at(-1)}</span>
			</a>
			<a href="/regras/bestiario/por-ameaca" class="flex flex-col gap-0.5 border-t border-[#2E2420] px-3.5 py-2.5 hover:bg-grena">
				<span class="t-rotulo-sm text-ouro">Apêndice</span>
				<span class="font-mincho text-[17px] leading-6 font-bold">Adversários por ameaça</span>
			</a>
		</nav>
	</div>
</header>

<main id="monstros" class="mx-auto box-border flex w-full max-w-[1280px] scroll-mt-16 flex-col gap-5 px-4 pt-5 pb-12 md:px-6 md:pt-8 md:pb-14">
	<nav aria-label="Letras" class="flex flex-wrap gap-1.5">
		{#each letras as l (l)}
			{@const tem = porLetra.some(([x]) => x === l)}
			<a href="#letra-{l}" class="flex h-9 w-9 items-center justify-center border-2 font-mincho text-lg font-bold {tem ? 'border-frame bg-b2 hover:border-[var(--vermelhao)]' : 'pointer-events-none border-b3 text-mut opacity-50'}" aria-disabled={!tem}>{l}</a>
		{/each}
	</nav>

	<div class="painel flex flex-col gap-3 px-3 py-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2.5" role="group" aria-label="Filtros">
		<div class="flex flex-wrap items-center gap-2">
			<span class="t-rotulo-sm w-full text-mut sm:w-auto">Tipo</span>
			<button type="button" class="chip sem-icone {tipo === null ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={tipo === null} onclick={() => (tipo = null)}>Todos</button>
			{#each TIPOS as [t, nome] (t)}
				<button type="button" class="chip sem-icone {tipo === t ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={tipo === t} onclick={() => (tipo = tipo === t ? null : t)}>{nome}</button>
			{/each}
		</div>
		<span class="hidden h-7 w-0.5 bg-b3 lg:mx-1.5 lg:block"></span>
		<div class="flex flex-wrap items-center gap-2">
			<span class="t-rotulo-sm w-full text-mut sm:w-auto">Ameaça</span>
			<div class="alternancia">
				{#each FAIXAS as [k, nome] (k)}
					<button type="button" aria-pressed={faixa === k} onclick={() => (faixa = k)}>{nome}</button>
				{/each}
			</div>
		</div>
		<span class="hidden flex-1 lg:block"></span>
		<div class="alternancia" role="group" aria-label="Visão">
			<button type="button" aria-pressed={visao === 'sumario'} onclick={() => trocarVisao('sumario')}>Sumário</button>
			<button type="button" aria-pressed={visao === 'galeria'} onclick={() => trocarVisao('galeria')}>Galeria</button>
		</div>
		<span class="text-sm leading-5 font-semibold text-mut" aria-live="polite">{lista.length} {lista.length === 1 ? 'verbete' : 'verbetes'}</span>
	</div>

	{#if !lista.length}
		<div class="painel-sombra flex flex-col items-center gap-3 px-6 py-8 text-center">
			<Icone id="illustrations/il-sem-resultados" tamanho={96} />
			<span class="font-mincho text-[22px] leading-[30px] font-bold">Nenhum verbete com esses filtros</span>
			<button type="button" class="btn-jogo btn-contorno mt-1.5" onclick={() => ((tipo = null), (faixa = 'todas'))}>Limpar filtros</button>
		</div>
	{:else if visao === 'galeria'}
		<div class="grid grid-flow-row-dense auto-rows-[96px] grid-cols-2 gap-3 md:auto-rows-[120px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
			{#each lista as c (c.slug)}<CardCriatura criatura={c} class={ESPACO[c.arte.formato]} />{/each}
		</div>
	{:else}
		<!-- sumário: letras em colunas, cada verbete numa linha com a miniatura da arte -->
		<div class="columns-1 gap-8 md:columns-2 lg:columns-3">
			{#each porLetra as [l, cs] (l)}
				<section id="letra-{l}" class="mb-5 break-inside-avoid scroll-mt-16" aria-label="Letra {l}">
					<h2 class="m-0 mb-1.5 border-b-2 border-[var(--vermelhao)] pb-0.5 font-mincho text-[28px] leading-9 font-extrabold text-title">{l}</h2>
					<ul class="m-0 flex list-none flex-col p-0">
						{#each cs as c (c.slug)}
							<li>
								<a href="/regras/bestiario/{c.slug}" class="group flex items-center gap-3 border-b border-b3 py-1.5 hover:bg-b2">
									<span class="block h-12 w-12 flex-none overflow-hidden border-2 border-ink bg-b0"><ArteCriatura criatura={c} moldura="solta" cobrir /></span>
									<span class="flex min-w-0 flex-1 flex-col">
										<span class="font-mincho text-base leading-[22px] font-bold group-hover:text-link">{c.nome}</span>
										<span class="truncate text-[13px] leading-[18px] text-mut">{c.papel ? PAPEIS[c.papel] : `${c.nEstagios} estágios`} · {c.tipo}</span>
									</span>
									<span class="t-num flex-none text-right text-sm font-bold text-title" title="Ameaça">{c.ameacaFaixa}</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{/if}
</main>

<Rodape />
