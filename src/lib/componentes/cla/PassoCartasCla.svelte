<script lang="ts">
	// K2 · Passo 7 · Jutsus e habilidades do clã (Componente 6): um card para cada jutsu e habilidade dos marcos
	// (normalmente 7 a 9 jutsus e 2 habilidades). Sem KKG, também o jutsu hereditário extra.
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import ItemCarta from './ItemCarta.svelte';
	import NovaCarta from './NovaCarta.svelte';

	let { c }: { c: CriadorCla } = $props();
	const d = $derived(c.dados);
	const jutsus = $derived(d.cartas.filter((x) => x.tipo === 'jutsu'));
	const habilidades = $derived(d.cartas.filter((x) => x.tipo === 'habilidade'));
	const extra = $derived(!d.kkg && d.bonus.extraSemKkg === 'jutsu');
</script>

<div class="flex flex-col gap-2">
	<h3 class="t-rotulo m-0 text-xs">Jutsus · {jutsus.length}</h3>
	<div class="border-2 border-frame bg-b2 px-3 shadow-[4px_4px_0_var(--ink)]">
		{#each jutsus as carta (carta.id)}
			<ItemCarta {c} {carta} escolhida={extra && d.jutsuExtra === carta.id} aoEscolher={extra && (carta.rank === 'D' || carta.rank === 'C') && carta.id !== d.assinatura ? () => (c.dados.jutsuExtra = carta.id) : undefined} />
		{:else}
			<p class="m-0 py-4 text-sm text-mut">Nenhum jutsu ainda.</p>
		{/each}
	</div>
	{#if extra}<span class="text-[13px] leading-[18px] text-mut">Sem KKG: escolha (ESCOLHER) um jutsu Rank D ou C como hereditário extra, aprendido no nível 1 junto da assinatura.</span>{/if}
	{#if c.editavel}<NovaCarta {c} tipo="jutsu" />{/if}
</div>

<div class="flex flex-col gap-2">
	<h3 class="t-rotulo m-0 text-xs">Habilidades · {habilidades.length}</h3>
	<div class="border-2 border-frame bg-b2 px-3 shadow-[4px_4px_0_var(--ink)]">
		{#each habilidades as carta (carta.id)}
			<ItemCarta {c} {carta} />
		{:else}
			<p class="m-0 py-4 text-sm text-mut">Nenhuma habilidade ainda.</p>
		{/each}
	</div>
	{#if c.editavel}<NovaCarta {c} tipo="habilidade" />{/if}
</div>

<span class="text-[13px] leading-[18px] text-mut">{jutsus.length} {jutsus.length === 1 ? 'jutsu' : 'jutsus'} e {habilidades.length} {habilidades.length === 1 ? 'habilidade' : 'habilidades'} · recomendado 7 a 9 jutsus e 2 habilidades. O rank precisa respeitar o nível do marco.</span>
