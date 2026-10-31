<script lang="ts">
	// O quadro de atalhos da Mesa (tecla ?): as ferramentas e os outros atalhos, da mesma lista que o tratador de teclas usa.
	import { ATALHOS, TECLAS_FERRAMENTA } from '#lib/mesa/atalhos.ts';
	import { prenderFoco } from '../ui/foco';

	let { mestre, aoFechar }: { mestre: boolean; aoFechar: () => void } = $props();
	const ferramentas = $derived(TECLAS_FERRAMENTA.filter((t) => mestre || !t.mestre));
	const grupos = $derived(ATALHOS.map((g) => ({ ...g, itens: g.itens.filter((a) => mestre || !a.mestre) })).filter((g) => g.itens.length));
</script>

{#snippet tecla(t: string)}<kbd class="inline-flex min-h-6 min-w-6 items-center justify-center border-2 border-b3 border-b-[3px] bg-b1 px-1.5 font-pixel text-[11px] leading-none font-bold text-fg">{t}</kbd>{/snippet}

<div class="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(10,6,4,.6)] p-4" role="presentation" onclick={(e) => e.target === e.currentTarget && aoFechar()}>
	<div role="dialog" aria-modal="true" aria-label="Atalhos da Mesa" tabindex="-1" {@attach prenderFoco(aoFechar)} class="flex max-h-full w-[min(640px,100%)] flex-col border-2 border-[var(--vermelhao-lo)] bg-b2 shadow-[8px_8px_0_var(--sombra)]">
		<header class="flex flex-none items-center gap-2 border-b-2 border-b3 bg-b0 py-2 pr-1.5 pl-4">
			<h2 class="m-0 flex-1 font-mincho text-lg leading-6 font-bold">Atalhos da Mesa</h2>
			<button type="button" class="h-9 w-9 font-pixel text-sm" aria-label="Fechar" onclick={aoFechar}>✕</button>
		</header>
		<div class="grid min-h-0 gap-x-6 gap-y-4 overflow-y-auto p-4 sm:grid-cols-2">
			<section class="flex flex-col gap-1.5">
				<h3 class="m-0 font-mincho text-[15px] leading-5 font-bold text-title">Ferramentas</h3>
				{#each ferramentas as f (f.tecla)}
					<div class="flex items-center gap-2.5 text-[13px] leading-5">{@render tecla(f.tecla.toUpperCase())}<span>{f.nome}</span></div>
				{/each}
			</section>
			{#each grupos as g (g.grupo)}
				<section class="flex flex-col gap-1.5">
					<h3 class="m-0 font-mincho text-[15px] leading-5 font-bold text-title">{g.grupo}</h3>
					{#each g.itens as a, i (i)}
						<div class="flex items-start gap-2.5 text-[13px] leading-5">
							<span class="flex flex-none flex-wrap items-center gap-1">{#each a.teclas as t, j (j)}{#if j}<span class="text-mut">+</span>{/if}{@render tecla(t)}{/each}</span>
							<span class="pt-0.5">{a.acao}</span>
						</div>
					{/each}
				</section>
			{/each}
		</div>
	</div>
</div>
