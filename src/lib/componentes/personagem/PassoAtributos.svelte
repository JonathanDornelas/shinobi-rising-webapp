<script lang="ts">
	// Passo 2 · Atributos: 8 pontos, de −2 a +4 (+5 no atributo do clã), até 2 reduções.
	import { ATRIBUTOS } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { atributoDoCla, regrasCla, sinal } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';
	import Orcamento from './Orcamento.svelte';

	let { c }: { c: Criador } = $props();
	const doCla = $derived(atributoDoCla(c.ficha));
	const nomeCla = $derived(regrasCla(c.ficha)?.nome.toUpperCase() ?? '');

	function teclar(e: KeyboardEvent, a: (typeof ATRIBUTOS)[number]['id']) {
		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			e.preventDefault();
			c.alterarAtributo(a, 1);
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			e.preventDefault();
			c.alterarAtributo(a, -1);
		}
	}
</script>

<Orcamento rotulo="Pontos de atributo" usados={c.atributos.usados} limite={c.atributos.limite} extra="Reduzidos {c.atributos.reducoes}/2" />
<p class="m-0 text-sm leading-5 text-mut">Todos começam em 0. Reduzir um atributo a −1 ou −2 devolve 1 ou 2 pontos (no máximo dois atributos).</p>
<div class="grid gap-3 md:grid-cols-2">
	{#each ATRIBUTOS as a (a.id)}
		{@const valor = c.ficha.atributos[a.id] + (doCla === a.id ? 1 : 0)}
		{@const naoDesce = c.limite(a.id, -1)}
		{@const naoSobe = c.limite(a.id, 1)}
		<div class="painel-sombra flex flex-col gap-2 px-3 py-2.5">
			<div class="flex items-center gap-2.5">
				<Icone id="atributo/ic-atributo-{a.id.toLowerCase()}" />
				<div class="flex min-w-0 flex-1 flex-col gap-[3px]">
					<span class="font-pixel text-sm leading-none font-bold tracking-[0.08em]">{a.id} <span class="font-sans text-xs font-normal tracking-normal text-mut">{a.nome}</span></span>
					<span class="text-xs leading-4 text-mut">Usado para: {a.uso}</span>
				</div>
				<button type="button" class="btn-icone font-pixel text-[22px] font-bold" aria-label="Diminuir {a.nome}" title={naoDesce || undefined} disabled={!c.editavel || !!naoDesce} onclick={() => c.alterarAtributo(a.id, -1)}>−</button>
				<span
					role="spinbutton"
					tabindex={c.editavel ? 0 : -1}
					aria-label={a.nome}
					aria-valuenow={valor}
					aria-valuemin={-2}
					aria-valuemax={doCla === a.id ? 5 : 4}
					class="t-num w-[52px] text-center text-[30px] leading-none"
					onkeydown={(e) => teclar(e, a.id)}>{sinal(valor)}</span
				>
				<button type="button" class="btn-icone font-pixel text-[22px] font-bold" aria-label="Aumentar {a.nome}" title={naoSobe || undefined} disabled={!c.editavel || !!naoSobe} onclick={() => c.alterarAtributo(a.id, 1)}>+</button>
			</div>
			{#if doCla === a.id}<span class="font-pixel text-xs leading-4 font-bold tracking-[0.06em] text-title">+1 {nomeCla} · LIMITE +5</span>{/if}
			{#if naoSobe && c.ficha.atributos[a.id] >= 4}
				<span class="flex items-center gap-1.5 text-xs leading-4 font-semibold">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><rect x="5" y="11" width="14" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>{naoSobe}
				</span>
			{/if}
		</div>
	{/each}
</div>
