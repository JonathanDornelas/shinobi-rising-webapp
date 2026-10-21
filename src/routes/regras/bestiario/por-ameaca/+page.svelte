<script lang="ts">
	// Apêndice do bestiário: todas as fichas (cada estágio é uma linha) agrupadas por ameaça, para montar encontros.
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import { PAPEIS } from '#lib/bestiario/npc.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const grupos = $derived([...new Set(data.linhas.map((l) => l.ameacaRotulo))].map((r) => [r, data.linhas.filter((l) => l.ameacaRotulo === r)] as const));
</script>

<main class="mx-auto box-border flex w-full max-w-[900px] flex-col gap-5 px-4 pt-5 pb-12 md:px-6 md:pt-8 md:pb-14">
	<nav aria-label="Trilha" class="flex flex-wrap items-center gap-2 text-sm leading-5 font-medium">
		<a href="/regras/bestiario" class="link">Bestiário</a><span class="font-pixel text-xs text-mut">▸</span>
		<span aria-current="page">Apêndice</span>
	</nav>
	<header class="flex flex-col gap-2 border-b-2 border-b3 pb-4">
		<span class="font-pixel text-[13px] leading-none font-bold tracking-[.14em] text-title">BESTIÁRIO · APÊNDICE</span>
		<h1 class="t-h1 m-0">Adversários por ameaça</h1>
		<p class="m-0 text-[15px] leading-[23px] text-mut">
			Todas as fichas do livro, da menor ameaça para a maior. Para montar um encontro, some a ameaça dos adversários e compare com a soma dos níveis do grupo (<a class="link" href="/regras/bestiario/como-usar#orcamento">orçamento de encontro</a>). O chefe conta em dobro; num bando, cada membro conta.
		</p>
	</header>

	{#each grupos as [rotulo, linhas] (rotulo)}
		<section class="flex flex-col gap-2" aria-label="Ameaça {rotulo}">
			<h2 class="m-0 flex items-baseline gap-2 font-mincho text-2xl leading-8 font-bold text-title">Ameaça {rotulo}<span class="text-sm font-semibold text-mut">{linhas.length} {linhas.length === 1 ? 'ficha' : 'fichas'}</span></h2>
			<div class="overflow-x-auto border-2 border-frame">
				<table class="w-full min-w-[520px] border-collapse text-sm leading-5">
					<thead class="bg-b0 text-left">
						<tr>
							<th class="t-rotulo-sm px-3 py-1.5 text-[#D9A82B]">Adversário</th>
							<th class="t-rotulo-sm px-2 py-1.5 text-[#D9A82B]">Papel</th>
							<th class="t-rotulo-sm px-2 py-1.5 text-[#D9A82B]">Tipo</th>
							<th class="t-rotulo-sm px-2 py-1.5 text-center text-[#D9A82B]">PV</th>
							<th class="t-rotulo-sm px-3 py-1.5 text-center text-[#D9A82B]">Defesa</th>
						</tr>
					</thead>
					<tbody>
						{#each linhas as l, i (`${l.slug}-${l.indice}`)}
							<tr class="border-t border-b3 {i % 2 ? 'bg-b2' : 'bg-b1'}">
								<td class="px-3 py-1.5">
									<a class="link font-semibold" href="/regras/bestiario/{l.slug}{l.indice ? `?estagio=${l.indice}` : ''}">{l.estagio ?? l.verbete}</a>
									{#if l.estagio}<span class="block text-[13px] text-mut">{l.verbete}</span>{/if}
								</td>
								<td class="px-2 py-1.5">{PAPEIS[l.papel]}{l.membros > 1 ? ` (${l.membros})` : ''}</td>
								<td class="px-2 py-1.5 text-mut">{l.tipo}</td>
								<td class="t-num px-2 py-1.5 text-center">{l.pv}</td>
								<td class="t-num px-3 py-1.5 text-center">{l.defesa}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/each}
	<a href="/regras/bestiario" class="btn-jogo btn-contorno mt-2 self-start">Voltar ao sumário</a>
</main>

<Rodape />
