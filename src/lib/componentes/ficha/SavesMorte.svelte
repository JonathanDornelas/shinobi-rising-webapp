<script lang="ts">
	// Saves de Morte (cap. 4): SAVE rola 1d20 + ESP (só positivo; a Fadiga não conta) e já marca o resultado (10 ou mais, sucesso; 9 ou
	// menos, falha; 1 natural, duas falhas; 20 natural, volta com 1 PV). As bolinhas corrigem à mão.
	import { teste } from '#lib/rolagens/expressoes.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';

	interface Props {
		saves: { sucessos: number; falhas: number };
		esp: number;
		campanha: string;
		personagem: string;
		editavel: boolean;
		/** A rolagem saiu: marcar pelo d20 natural e pelo total. */
		aoRolado: (d20: number, total: number) => void;
		aoMarcar: (tipo: 'sucessos' | 'falhas', delta: 1 | -1) => void;
		origem?: string;
		compacto?: boolean;
	}
	let { saves, esp, campanha, personagem, editavel, aoRolado, aoMarcar, origem = 'Ficha · PV 0', compacto = false }: Props = $props();
	let rolando = $state(false);
	const bonus = $derived(Math.max(0, esp));

	async function rolar() {
		rolando = true;
		const r = await rolador.rolar({ campanha, expressao: teste(bonus), rotulo: 'Save de Morte (DT 10)', personagem, d20: true, tipo: 'save', origem, partes: bonus ? [['ESP (só positivo)', `+${bonus}`]] : [] });
		rolando = false;
		if (r?.d20 != null) aoRolado(r.d20, r.total);
	}
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
	{#if editavel}
		<button type="button" class="btn-jogo btn-primario min-h-9 px-3 text-xs" disabled={rolando || saves.sucessos >= 3 || saves.falhas >= 3} aria-busy={rolando} title="1d20{bonus ? ` + ${bonus} (ESP)` : ''} contra 10; o resultado já é marcado" onclick={rolar}>SAVE{bonus ? ` · 1d20+${bonus}` : ''}</button>
	{/if}
	{#each [['sucessos', 'SUCESSOS', 'var(--ok)'], ['falhas', 'FALHAS', 'var(--err)']] as const as [t, rotulo, cor] (t)}
		<div class="flex items-center gap-1 font-pixel text-xs font-bold" role="group" aria-label="{rotulo}: {saves[t]} de 3">
			<span class="mr-1 {compacto ? 'text-[11px]' : ''}">{rotulo}</span>
			{#each [1, 2, 3] as n (n)}
				<button
					type="button"
					class="{compacto ? 'h-4 w-4' : 'h-5 w-5'} border-2 disabled:cursor-default"
					style:background={n <= saves[t] ? cor : 'transparent'}
					style:border-color={n <= saves[t] ? 'var(--ink)' : 'var(--b3)'}
					aria-label="{rotulo} {n}"
					disabled={!editavel}
					onclick={() => aoMarcar(t, n <= saves[t] ? -1 : 1)}
				></button>
			{/each}
		</div>
	{/each}
	{#if saves.sucessos >= 3}<span class="text-xs font-semibold text-ok">Estabilizado</span>{:else if saves.falhas >= 3}<span class="text-xs font-semibold text-err">Três falhas: morte</span>{/if}
</div>
