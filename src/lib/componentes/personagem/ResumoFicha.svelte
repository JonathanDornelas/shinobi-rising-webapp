<script lang="ts">
	// Resumo da ficha (coluna direita do P2): atributos, recursos e pontos restantes, sempre recalculados.
	import { ATRIBUTOS } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { atributosTotais, sinal } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';
	import Retrato from '../ui/Retrato.svelte';

	let { c }: { c: Criador } = $props();
	const at = $derived(atributosTotais(c.ficha));
	const r = $derived(c.recursos);
	const RECURSOS = $derived([
		['recurso/ic-recurso-pv', 'PV', r.pv],
		['recurso/ic-recurso-pc', 'PC', r.pc],
		['recurso/ic-recurso-pe', 'PE', r.pe],
		['recurso/ic-recurso-defesa', 'Defesa', r.defesa],
		['recurso/ic-recurso-defesa-mental', 'Defesa Mental', r.defesaMental],
		['recurso/ic-recurso-iniciativa', 'Iniciativa', `1d20 ${sinal(r.iniciativa)}`]
	] as const);
	const orcamentos = $derived([
		['Atributos', c.atributos.restantes, c.atributos.limite],
		['Perícias', c.pontosPericia.restantes, c.pontosPericia.limite],
		['Proficiências (PT)', c.pt.restantes, c.pt.total]
	] as const);
	const cor = (n: number) => (n === 0 ? 'var(--ok)' : n < 0 ? 'var(--err)' : undefined);
</script>

<div class="flex flex-col gap-3.5">
	<h2 class="t-rotulo m-0">Resumo da ficha</h2>
	<div class="flex items-center gap-2.5">
		<Retrato nome={c.ficha.conceito.nome || '?'} tamanho={64} />
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="truncate font-mincho text-lg leading-6 font-bold">{c.ficha.conceito.nome || 'Sem nome'}</span>
			<span class="flex items-center gap-1 text-xs leading-4 text-mut">
				{#if c.ficha.cla.tipo === 'catalogo' && c.ficha.cla.slug}<Icone id="cla/ic-cla-{c.ficha.cla.slug}" alt="Clã {c.ficha.cla.slug}" />{/if}
				{#if c.ficha.vila.id}<Icone id="vila/ic-vila-{c.ficha.vila.id}" alt="Vila" />{/if}Nível 1
			</span>
		</div>
	</div>
	<div class="grid grid-cols-3 gap-1">
		{#each ATRIBUTOS as a (a.id)}
			<div class="flex flex-col items-center gap-1 border-2 border-b3 bg-b1 p-1.5" title={a.nome}>
				<span class="font-pixel text-xs leading-none font-bold text-mut">{a.id}</span>
				<span class="t-num text-xl leading-none">{sinal(at[a.id])}</span>
			</div>
		{/each}
	</div>
	<dl class="m-0 flex flex-col gap-1.5">
		{#each RECURSOS as [icone, rotulo, valor] (rotulo)}
			<div class="flex items-center gap-1.5 text-[13px] leading-[18px] font-semibold">
				<Icone id={icone} /><dt class="flex-1">{rotulo}</dt><dd class="t-num m-0 text-lg leading-none" aria-live="polite">{valor}</dd>
			</div>
		{/each}
	</dl>
	<div class="flex flex-col gap-2 border-t-2 border-b3 pt-2.5">
		<span class="t-rotulo text-xs">Pontos restantes</span>
		{#each orcamentos as [rotulo, resta, total] (rotulo)}
			<div class="flex items-center text-[13px] leading-[18px] font-semibold">
				<span class="flex-1">{rotulo}</span><span class="t-num text-base leading-none" style:color={cor(resta)}>{resta} / {total}</span>
			</div>
		{/each}
	</div>
</div>
