<script lang="ts">
	// Ordem de iniciativa (L10): a última rolagem de iniciativa de cada personagem ou NPC na campanha, nas últimas horas.
	import { ordemIniciativa } from '#lib/rolagens/registro.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import Icone from '../ui/Icone.svelte';

	let { rolagens, campanha, nome }: { rolagens: Rolagem[]; campanha: string; nome: string } = $props();
	const ordem = $derived(ordemIniciativa(rolagens, campanha));
</script>

<section class="border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]" aria-labelledby="ord-ini">
	<div class="flex items-center gap-1.5 border-b-2 border-b3 py-1.5 pr-3.5 pl-2">
		<Icone id="recurso/ic-recurso-iniciativa" />
		<span class="flex flex-1 flex-col gap-1">
			<span id="ord-ini" class="font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">ORDEM DE INICIATIVA</span>
			<span class="text-xs leading-none text-mut">{nome}</span>
		</span>
	</div>
	{#each ordem as o, i (o.chave)}
		<div class="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2.5 border-b-2 border-b1 px-3.5 py-2" class:bg-b1={i % 2 === 1}>
			<span class="t-num text-sm text-mut">{i + 1}</span>
			<span class="truncate text-sm leading-5 font-semibold">{o.quem}</span>
			<span class="t-num text-lg leading-none">{o.total}</span>
		</div>
	{:else}
		<p class="m-0 px-3.5 py-3 text-[13px] text-mut">Ninguém rolou iniciativa nas últimas horas.</p>
	{/each}
	<div class="px-3.5 py-2.5 text-xs leading-[17px] text-mut">Montada a partir da última rolagem de iniciativa de cada um.</div>
</section>
