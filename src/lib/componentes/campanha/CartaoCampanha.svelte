<script lang="ts">
	// CMP-19 · Card de campanha (C1): capa com badge de papel, nome, era, grupo e última atividade.
	import { nomeEra, PAPEL } from '#lib/campanhas/dominio.ts';
	import type { ResumoCampanha } from '#lib/campanhas/servidor.ts';
	import { dataCurta, tempoRelativo } from '#lib/formatar.ts';
	import Icone from '../ui/Icone.svelte';
	import Retrato from '../ui/Retrato.svelte';

	let { c }: { c: ResumoCampanha } = $props();
	const arquivada = $derived(!!c.arquivada_em);
	const linha = $derived(
		arquivada
			? `Arquivada em ${dataCurta(c.arquivada_em!)} · somente leitura`
			: c.papel === 'mestre'
				? `${nomeEra(c)} · nível ${c.nivel_inicial}`
				: `${nomeEra(c)} · Mestre: ${c.mestre ?? 'sem Mestre'}`
	);
</script>

<a
	href="/campanhas/{c.id}"
	class="painel-sombra cartao-link flex flex-col text-fg"
	class:opacity-60={arquivada}
	aria-label="{c.nome}, {PAPEL[c.papel].nome}{arquivada ? ', arquivada' : ''}"
>
	<div class="relative aspect-[256/96] overflow-hidden border-b-2 border-ink">
		<img src="/covers/{c.capa}-256.png" alt="" class="h-full w-full object-cover [image-rendering:pixelated]" loading="lazy" />
		<span
			class="absolute top-2.5 left-2.5 inline-flex h-9 items-center gap-1 border-2 pr-2.5 text-[13px] leading-none font-semibold {c.papel === 'mestre'
				? 'border-[#8B2E20] bg-grena text-papel'
				: 'border-mut bg-b2 text-fg'}"
		>
			<Icone id={PAPEL[c.papel].icone} />{PAPEL[c.papel].nome}
		</span>
	</div>
	<div class="flex flex-1 flex-col gap-2.5 p-3.5">
		<div class="flex flex-col gap-0.5">
			<span class="font-mincho text-xl leading-[26px] font-bold">{c.nome}</span>
			<span class="text-[13px] leading-[18px] text-mut">{linha}</span>
		</div>
		<div class="flex items-center gap-2.5">
			{#if c.nomesJogadores.length}
				<div class="flex pl-2.5" aria-hidden="true">
					{#each c.nomesJogadores.slice(0, 3) as nome, i (i)}
						<Retrato {nome} tamanho={32} class="-ml-2.5" />
					{/each}
				</div>
			{/if}
			<span class="text-[13px] leading-[18px] font-semibold text-mut">
				{c.jogadores === 0 ? 'Nenhum jogador ainda' : c.jogadores === 1 ? '1 jogador' : `${c.jogadores} jogadores`}
			</span>
		</div>
		<span class="mt-auto border-t-2 border-b3 pt-2 text-xs leading-4 text-mut">
			{#if c.ultima}{c.ultima.texto} · {tempoRelativo(c.ultima.criada_em)}{:else}Sem atividade ainda{/if}
		</span>
	</div>
</a>
