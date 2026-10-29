<script lang="ts">
	// Selo da DT do Jutsu: a barra escura com o número em ouro, como o quadro "Na mesa" da regra no livro (cap. 2).
	// Mouse parado em cima (ou foco) abre a conta: base, rank, atributo-chave e proficiência.
	import type { DtJutsu } from '#lib/jutsus/dt.ts';
	import { posicionar } from '../ui/posicao.ts';

	let { dt, class: classe = '' }: { dt: DtJutsu; class?: string } = $props();
	let el = $state<HTMLElement>();
	let pos = $state<{ left: number; top: number } | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;
	const LARGURA = 248;
	const sinal = (n: number) => (n < 0 ? `−${-n}` : `+${n}`);
	const conta = $derived(dt.partes.length ? `${dt.partes.map((p, i) => (i ? `${sinal(p.valor)} ${p.rotulo}` : `${p.valor} ${p.rotulo}`)).join(' ')} = ${dt.total}` : (dt.nota ?? ''));

	function abrir(atraso = 0) {
		clearTimeout(timer);
		timer = setTimeout(() => el && (pos = posicionar(el, LARGURA, 40 + Math.max(1, dt.partes.length) * 22)), atraso);
	}
	function fechar() {
		clearTimeout(timer);
		pos = null;
	}
</script>

<button
	type="button"
	bind:this={el}
	class="inline-flex h-6 flex-none cursor-help items-center gap-1 border-2 border-[var(--b0)] border-b-[var(--vermelhao)] bg-[var(--b0)] px-1.5 font-pixel text-[11px] leading-none font-bold tracking-[.08em] whitespace-nowrap text-[#D9A82B] outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus {classe}"
	aria-label="DT do jutsu {dt.total}. {conta}"
	onpointerenter={(e) => e.pointerType === 'mouse' && abrir(180)}
	onpointerleave={fechar}
	onfocus={() => abrir()}
	onblur={fechar}
	onclick={(e) => {
		e.stopPropagation();
		pos ? fechar() : abrir();
	}}
	onkeydown={(e) => e.key === 'Escape' && fechar()}
>
	DT<span class="t-num text-[13px] text-[#F2E3B3]">{dt.total}</span>
</button>

{#if pos}
	<div class="pointer-events-none fixed z-[80] flex flex-col border-2 border-ink bg-[var(--b0)] text-b0fg shadow-[4px_4px_0_var(--sombra)]" style:left="{pos.left}px" style:top="{pos.top}px" style:width="{LARGURA}px" role="tooltip">
		<span class="border-b-2 border-[var(--vermelhao)] px-2.5 py-1.5 font-pixel text-[11px] leading-none font-bold tracking-[.14em] text-[#D9A82B]">DT DO JUTSU</span>
		{#if dt.partes.length}
			<dl class="m-0 flex flex-col px-2.5 py-1.5 text-[13px] leading-[20px]">
				{#each dt.partes as p, i (p.rotulo)}
					<div class="flex gap-2"><dt class="flex-1">{p.rotulo}</dt><dd class="t-num m-0">{i ? sinal(p.valor) : p.valor}</dd></div>
				{/each}
				<div class="mt-1 flex gap-2 border-t border-[color-mix(in_srgb,#D9A82B_45%,transparent)] pt-1 font-bold"><dt class="flex-1">DT</dt><dd class="t-num m-0 text-[#D9A82B]">{dt.total}</dd></div>
			</dl>
		{:else}
			<p class="m-0 px-2.5 py-1.5 text-[13px] leading-[19px]">{dt.nota}</p>
		{/if}
	</div>
{/if}
