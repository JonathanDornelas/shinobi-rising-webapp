<script lang="ts">
	// Quadro "Na mesa": os números de uma regra juntos, para consultar durante o jogo (a prosa em volta explica o porquê).
	// Barra escura com o d20 e o rótulo em ouro, como a das tabelas; linhas rótulo → valor em zebra e notas no rodapé.
	import type { LinhaMesa, Trecho } from '#lib/livro/tipos.ts';
	import Icone from '../ui/Icone.svelte';
	import Texto from './Texto.svelte';

	interface Props {
		titulo?: string;
		linhas: LinhaMesa[];
		notas?: Trecho[][];
	}
	let { titulo, linhas, notas = [] }: Props = $props();
</script>

<aside class="sombra-painel border-2 border-frame bg-b1" aria-label={titulo ? `Na mesa: ${titulo}` : 'Na mesa'}>
	<div class="flex items-center gap-2 border-b-[3px] border-[var(--vermelhao)] bg-b0 py-1 pr-3 pl-1.5">
		<Icone id="dado/ic-dado-d20" />
		<span class="font-pixel text-[11px] leading-none font-bold tracking-[.16em] text-[#D9A82B]">NA MESA</span>
		{#if titulo}
			<span class="h-3.5 w-0.5 flex-none bg-[#D9A82B] opacity-50" aria-hidden="true"></span>
			<span class="min-w-0 font-mincho text-[15px] leading-5 font-bold text-b0fg">{titulo}</span>
		{/if}
	</div>
	<dl class="m-0 grid grid-cols-[auto_minmax(0,1fr)] text-[15px] leading-[22px]">
		{#each linhas as l, i (i)}
			<dt class="max-w-[42vw] py-1.5 pr-3 pl-3 font-semibold text-pretty text-title sm:max-w-[15rem] {i % 2 ? 'bg-b2' : ''}"><Texto trechos={l.rotulo} /></dt>
			<dd class="m-0 py-1.5 pr-3 text-pretty {i % 2 ? 'bg-b2' : ''}"><Texto trechos={l.valor} /></dd>
		{/each}
	</dl>
	{#if notas.length}
		<div class="flex flex-col gap-1 border-t border-b3 px-3 py-2 text-sm leading-5 text-mut">
			{#each notas as n, i (i)}<p class="m-0 text-pretty"><Texto trechos={n} /></p>{/each}
		</div>
	{/if}
</aside>
