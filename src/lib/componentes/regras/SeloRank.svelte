<script lang="ts">
	// Selo de rank (CMP-03): ícone rank-x com dica "Rank C · 6–10 PJ · aprender custa 4 PT".
	import type { Rank } from '#lib/livro/tipos.ts';
	import { RANK } from '#lib/livro/dominio.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		rank: Rank;
		tamanho?: 32 | 64;
	}
	let { rank, tamanho = 32 }: Props = $props();
	const dica = $derived(`Rank ${rank} · ${RANK[rank].pj} PJ · aprender custa ${RANK[rank].pt} PT`);
</script>

<span title={dica} class="inline-flex flex-none">
	<Icone id="rank/ic-rank-{rank.toLowerCase()}" {tamanho} alt="Rank {rank}" />
</span>
