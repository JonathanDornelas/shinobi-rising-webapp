<script lang="ts">
	// P3 · Registro: quem mexeu na ficha e quando (ajustes de estado, treinos, níveis).
	import { tempoRelativo } from '#lib/formatar.ts';
	import Icone from '../ui/Icone.svelte';

	let { registros }: { registros: { id: number | string; icone: string; texto: string; criado_em: string; ator: { nome: string } | null }[] } = $props();
</script>

<ul class="painel-sombra m-0 list-none p-0">
	{#each registros as r (r.id)}
		<li class="grid grid-cols-[32px_minmax(0,140px)_minmax(0,1fr)_auto] items-center gap-3 border-b-2 border-b3 px-3.5 py-1.5 last:border-b-0 max-md:grid-cols-[32px_minmax(0,1fr)_auto]">
			<Icone id={r.icone} />
			<span class="truncate text-sm font-semibold max-md:hidden">{r.ator?.nome ?? '—'}</span>
			<span class="text-sm leading-5"><span class="font-semibold md:hidden">{r.ator?.nome ?? '—'}: </span>{r.texto}</span>
			<span class="text-xs whitespace-nowrap text-mut">{tempoRelativo(r.criado_em)}</span>
		</li>
	{:else}
		<li class="p-3.5 text-sm text-mut">Nada registrado ainda.</li>
	{/each}
</ul>
