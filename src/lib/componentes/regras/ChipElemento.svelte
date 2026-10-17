<script lang="ts">
	// Chip de elemento (CMP-05): fundo a 12%, borda a 55%, texto em --fg.
	import { ELEMENTO, rgba } from '#lib/livro/dominio.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		elemento: string;
	}
	let { elemento }: Props = $props();
	const e = $derived(ELEMENTO[elemento]);
</script>

{#if e}
	<span class="chip pr-3" style:background={rgba(e.cor, 0.12)} style:border-color={rgba(e.cor, 0.55)} title="{e.nome} · {e.traducao}">
		<Icone id="elemento/ic-elemento-{elemento}" />{e.nome}
	</span>
{/if}
