<script lang="ts">
	// Como rolar os próximos testes: Normal, Vantagem ou Desvantagem (cap. 2) e se a rolagem fica oculta (só o Mestre vê).
	import { MODOS } from '#lib/rolagens/expressoes.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	let { registro }: { registro?: string } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="flex items-center gap-1.5 font-pixel text-xs font-bold tracking-[0.06em] text-mut"><Icone id="dado/ic-dado-d20" />PRÓXIMO TESTE</span>
	<div role="radiogroup" aria-label="Modo do próximo teste" class="flex border-2 border-b3">
		{#each MODOS as m (m.id)}
			{@const on = rolador.modo === m.id}
			<button type="button" role="radio" aria-checked={on} class="min-h-9 px-2.5 text-[13px] font-semibold {on ? 'bg-grena text-papel' : 'hover:bg-b3'}" onclick={() => (rolador.modo = m.id)}>{m.nome}</button>
		{/each}
	</div>
	<label class="flex min-h-9 cursor-pointer items-center gap-2 border-2 border-b3 px-2.5 text-[13px] font-semibold" title="Só você e o Mestre veem as rolagens ocultas">
		<input type="checkbox" class="checkbox checkbox-sm" bind:checked={rolador.oculta} />Oculta
	</label>
	{#if registro}<a href={registro} class="link ml-auto text-[13px] font-semibold">Registro de rolagens</a>{/if}
</div>
