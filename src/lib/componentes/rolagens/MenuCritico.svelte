<script lang="ts">
	// A setinha do botão de dano: "Crítico" (os dados dobram, cap. 4) ou "Sem crítico" e já rola. Sem escolher, o DANO
	// segue o último ataque (20 natural = crítico). Usa o crítico do rolador, que vale só para a próxima rolagem de dano.
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { posicionar } from '../ui/posicao.ts';

	interface Props {
		/** O dano de sempre (o mesmo do botão ao lado). */
		aoRolar: () => unknown;
		rotulo: string;
		desab?: boolean;
		class?: string;
	}
	let { aoRolar, rotulo, desab = false, class: classe = '' }: Props = $props();
	let el = $state<HTMLButtonElement>();
	let pos = $state<{ left: number; top: number } | null>(null);
	const LARGURA = 210;

	function escolher(critico: boolean) {
		pos = null;
		rolador.critico = critico;
		aoRolar();
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (pos = null)} onpointerdown={(e) => pos && !(e.target as HTMLElement).closest('[data-menu-critico]') && (pos = null)} />

<button
	bind:this={el}
	type="button"
	data-menu-critico
	class="flex flex-none items-center justify-center font-pixel text-[11px] leading-none font-bold disabled:cursor-not-allowed disabled:opacity-50 {classe}"
	aria-haspopup="menu"
	aria-expanded={!!pos}
	aria-label="{rotulo} crítico ou normal"
	title="Crítico ou normal (sem escolher, vale o último ataque: 20 natural é crítico)"
	disabled={desab}
	onclick={() => (pos = pos ? null : el ? posicionar(el, LARGURA, 96) : null)}>▾</button
>

{#if pos}
	<div role="menu" data-menu-critico class="camada fixed z-[90] flex flex-col py-1" style:left="{pos.left}px" style:top="{pos.top}px" style:width="{LARGURA}px">
		<button type="button" role="menuitem" class="flex min-h-10 items-center gap-2 px-3 text-left text-[13px] font-semibold hover:bg-b3" onclick={() => escolher(true)}>
			<span class="font-pixel text-xs text-[#f2c14e]" aria-hidden="true">★</span>Crítico <span class="text-xs font-normal text-mut">dados dobrados</span>
		</button>
		<button type="button" role="menuitem" class="flex min-h-10 items-center gap-2 px-3 text-left text-[13px] font-semibold hover:bg-b3" onclick={() => escolher(false)}>
			<span class="font-pixel text-xs text-mut" aria-hidden="true">●</span>Sem crítico
		</button>
	</div>
{/if}
