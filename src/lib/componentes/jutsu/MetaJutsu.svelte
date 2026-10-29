<script lang="ts" module>
	export interface Meta {
		/** Tipo de ação ("Reação", "Primária"). */
		acao?: string;
		custo?: [number, 'PC' | 'PE'];
		alcance?: string;
		area?: string;
		resist?: string;
	}
</script>

<script lang="ts">
	// Os dados curtos de um jutsu ou de uma ação, cada um com o seu ícone (custo, alcance, área, resistência do alvo).
	import Icone from '../ui/Icone.svelte';

	let { meta, class: classe = '' }: { meta: Meta; class?: string } = $props();
</script>

{#snippet icone(tipo: 'alcance' | 'area' | 'resist')}
	<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" class="flex-none fill-none stroke-current stroke-[1.6]">
		{#if tipo === 'alcance'}<path d="M2 14L14 2 M10 2h4v4" stroke-dasharray="2 2" />{:else if tipo === 'area'}<circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="1.5" />{:else}<path d="M8 1l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V3z" />{/if}
	</svg>
{/snippet}

{#if meta.acao || meta.custo || meta.alcance || meta.area || meta.resist}
	<span class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs leading-4 text-mut {classe}">
		{#if meta.acao}<span class="border border-b3 px-1 py-px text-[11px] leading-none font-semibold text-fg">{meta.acao}</span>{/if}
		{#if meta.custo}<span class="flex items-center gap-0.5 font-semibold text-fg" title="Custo"><Icone id="recurso/ic-recurso-{meta.custo[1].toLowerCase()}" class="h-4 w-4" />{meta.custo[0]} {meta.custo[1]}</span>{/if}
		{#if meta.alcance}<span class="flex items-center gap-1" title="Alcance">{@render icone('alcance')}{meta.alcance}</span>{/if}
		{#if meta.area}<span class="flex items-center gap-1" title="Área">{@render icone('area')}{meta.area}</span>{/if}
		{#if meta.resist}<span class="flex items-center gap-1" title="Resistência do alvo">{@render icone('resist')}{meta.resist}</span>{/if}
	</span>
{/if}
