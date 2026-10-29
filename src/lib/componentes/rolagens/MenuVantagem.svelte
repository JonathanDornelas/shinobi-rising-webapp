<script lang="ts">
	// A setinha do botão de ataque: "Com vantagem" ou "Com desvantagem" e já ataca, numa rolagem só (2d20, fica o maior
	// ou o menor). O custo do jutsu sai uma vez. Usa o modo do rolador, que volta a Normal depois do d20.
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { posicionar } from '../ui/posicao.ts';

	interface Props {
		/** O ataque de sempre (o mesmo do botão ao lado). */
		aoAtacar: () => unknown;
		rotulo: string;
		desab?: boolean;
		class?: string;
	}
	let { aoAtacar, rotulo, desab = false, class: classe = '' }: Props = $props();
	let el = $state<HTMLButtonElement>();
	let pos = $state<{ left: number; top: number } | null>(null);
	const LARGURA = 190;

	function escolher(modo: 'vantagem' | 'desvantagem') {
		pos = null;
		rolador.modo = modo;
		aoAtacar();
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (pos = null)} onpointerdown={(e) => pos && !(e.target as HTMLElement).closest('[data-menu-vantagem]') && (pos = null)} />

<button
	bind:this={el}
	type="button"
	data-menu-vantagem
	class="flex flex-none items-center justify-center font-pixel text-[11px] leading-none font-bold disabled:cursor-not-allowed disabled:opacity-50 {classe}"
	aria-haspopup="menu"
	aria-expanded={!!pos}
	aria-label="{rotulo} com vantagem ou desvantagem"
	title="Com vantagem ou desvantagem (uma rolagem só)"
	disabled={desab}
	onclick={() => (pos = pos ? null : el ? posicionar(el, LARGURA, 96) : null)}>▾</button
>

{#if pos}
	<div role="menu" data-menu-vantagem class="camada fixed z-[90] flex flex-col py-1" style:left="{pos.left}px" style:top="{pos.top}px" style:width="{LARGURA}px">
		<button type="button" role="menuitem" class="flex min-h-10 items-center gap-2 px-3 text-left text-[13px] font-semibold hover:bg-b3" onclick={() => escolher('vantagem')}>
			<span class="font-pixel text-xs text-ok" aria-hidden="true">▲▲</span>Com vantagem
		</button>
		<button type="button" role="menuitem" class="flex min-h-10 items-center gap-2 px-3 text-left text-[13px] font-semibold hover:bg-b3" onclick={() => escolher('desvantagem')}>
			<span class="font-pixel text-xs text-err" aria-hidden="true">▼▼</span>Com desvantagem
		</button>
	</div>
{/if}
