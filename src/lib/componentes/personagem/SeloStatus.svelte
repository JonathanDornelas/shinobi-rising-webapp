<script lang="ts">
	// CMP-06 · Badge de status da ficha.
	import { STATUS_FICHA } from '#lib/personagem/status.ts';
	import type { StatusFicha } from '#lib/supabase/banco.ts';
	import Icone from '../ui/Icone.svelte';

	let { status, so_icone = false }: { status: StatusFicha; so_icone?: boolean } = $props();
	const s = $derived(STATUS_FICHA[status]);
</script>

{#if so_icone}
	<Icone id={s.icone} alt={s.rotulo} />
{:else}
	<span class="inline-flex h-9 flex-none items-center gap-0.5 justify-self-start border-2 border-ink pr-2 text-xs leading-none font-semibold whitespace-nowrap {s.classe}">
		<Icone id={s.icone} />{s.rotulo}
	</span>
{/if}
