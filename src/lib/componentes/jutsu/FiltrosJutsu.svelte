<script lang="ts">
	// A barra de filtros das listas de escolher jutsus (criação da ficha e treino): busca e, quando a lista tem mais de uma
	// opção, tipo, rank, elemento, o que faz e ação; "só os disponíveis" quando há jutsus bloqueados. No celular, os
	// filtros ficam atrás do botão Filtros.
	import { ELEMENTOS } from '#lib/personagem/dados.ts';
	import { nomeEfeito } from '#lib/livro/filtros-jutsu.ts';
	import { filtroAtivo, filtroVazio, opcoesFiltro, type CamposJutsu, type FiltroJutsu } from '#lib/jutsus/filtro.ts';

	let { lista, filtro = $bindable(), rank = true, total }: { lista: CamposJutsu[]; filtro: FiltroJutsu; rank?: boolean; total?: number } = $props();
	const o = $derived(opcoesFiltro(lista));
	let aberto = $state(false);
	const nomeElemento = (id: string) => (id === '-' ? 'Sem elemento' : (ELEMENTOS.find((e) => e.id === id)?.nome ?? id.charAt(0).toUpperCase() + id.slice(1)));
	const extras = $derived([filtro.tipo, rank && filtro.rank, filtro.elemento, filtro.faz, filtro.acao, filtro.soDisponiveis].filter(Boolean).length);
</script>

{#snippet seletor(rotulo: string, valor: string, opcoes: [string, string][], mudar: (v: string) => void)}
	{#if opcoes.length > 1}
		<label class="flex h-9 min-w-0 items-center gap-1 border-2 px-2 text-[13px] font-semibold {valor ? 'border-vermelhao' : 'border-b3'}">
			<span class="text-mut">{rotulo}:</span>
			<select class="min-w-0 flex-1 bg-transparent font-semibold text-fg outline-none" value={valor} onchange={(e) => mudar(e.currentTarget.value)} aria-label={rotulo}>
				<option value="" class="bg-b2">Todos</option>
				{#each opcoes as [v, n] (v)}<option value={v} class="bg-b2">{n}</option>{/each}
			</select>
		</label>
	{/if}
{/snippet}

<div class="flex flex-col gap-1.5">
	<div class="flex items-center gap-1.5">
		<input class="campo h-9 min-w-0 flex-1 text-[14px]" type="search" placeholder="Buscar jutsu ou efeito…" aria-label="Buscar jutsu" bind:value={filtro.busca} />
		<button type="button" class="h-9 border-2 px-2.5 text-[13px] font-semibold sm:hidden {aberto || extras ? 'border-vermelhao' : 'border-b3'}" aria-expanded={aberto} onclick={() => (aberto = !aberto)}>Filtros{extras ? ` (${extras})` : ''}</button>
		{#if filtroAtivo(filtro)}<button type="button" class="link h-9 px-1 text-[13px] font-semibold" onclick={() => (filtro = filtroVazio())}>Limpar</button>{/if}
	</div>
	<div class="flex-wrap items-center gap-1.5 {aberto ? 'flex' : 'hidden sm:flex'}">
		{@render seletor('Tipo', filtro.tipo, o.tipos.map((t) => [t, t]), (v) => (filtro.tipo = v))}
		{#if rank}{@render seletor('Rank', filtro.rank, o.ranks.map((r) => [r, r]), (v) => (filtro.rank = v))}{/if}
		{@render seletor('Elemento', filtro.elemento, o.elementos.map((e) => [e, nomeElemento(e)]), (v) => (filtro.elemento = v))}
		{@render seletor('Faz', filtro.faz, o.efeitos.map((e) => [e, nomeEfeito(e)]), (v) => (filtro.faz = v))}
		{@render seletor('Ação', filtro.acao, o.acoes.map((a) => [a, a]), (v) => (filtro.acao = v))}
		{#if o.temBloqueados}
			<label class="flex h-9 cursor-pointer items-center gap-1.5 px-1 text-[13px] font-semibold"><input type="checkbox" class="caixa h-[18px] w-[18px]" bind:checked={filtro.soDisponiveis} />Só os disponíveis</label>
		{/if}
		{#if total !== undefined && filtroAtivo(filtro)}<span class="text-xs text-mut">{total} de {lista.length}</span>{/if}
	</div>
</div>
