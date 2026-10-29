<script lang="ts" module>
	export interface Minimizada {
		chave: string;
		nome: string;
		/** Cor da borda (a do dono do token; a ficha completa usa o vermelhão escuro). */
		cor: string;
		abrir: () => void;
		fechar: () => void;
	}
</script>

<script lang="ts">
	// Janelas minimizadas da Mesa, numa linha só embaixo do quadro, sem limite: as que cabem aparecem como chips e as
	// outras vão para o "…", que abre a lista delas. Mede os chips numa cópia invisível para saber quantos cabem.
	import type { Snippet } from 'svelte';

	let { itens, depois }: { itens: Minimizada[]; depois?: Snippet } = $props();

	let largura = $state(0);
	let larguras = $state<number[]>([]);
	let larguraDepois = $state(0);
	let menu = $state(false);
	const GAP = 6;
	const BOTAO_MAIS = 44;
	const cabem = $derived.by(() => {
		const medidas = itens.map((_, i) => larguras[i] ?? 0);
		if (!largura || medidas.some((w) => !w)) return itens.length;
		const livre = largura - (larguraDepois ? larguraDepois + GAP : 0);
		const total = medidas.reduce((s, w) => s + w + GAP, 0);
		if (total <= livre) return itens.length;
		let usado = BOTAO_MAIS + GAP;
		let n = 0;
		for (const w of medidas) {
			if (usado + w + GAP > livre) break;
			usado += w + GAP;
			n++;
		}
		return n;
	});
	const escondidas = $derived(itens.slice(cabem));
	$effect(() => {
		if (!escondidas.length) menu = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (menu = false)} onpointerdown={(e) => menu && !(e.target as HTMLElement).closest('[data-minimizadas-menu]') && (menu = false)} />

{#snippet chip(m: Minimizada)}
	<div class="flex flex-none items-center border-2 bg-b2 shadow-[4px_4px_0_var(--b0)]" style:border-color={m.cor}>
		<button type="button" class="min-h-9 max-w-[220px] truncate px-2.5 text-[13px] font-semibold" title={m.nome} onclick={m.abrir}>▴ {m.nome}</button>
		<button type="button" class="h-9 w-8 flex-none border-l-2 border-b3 font-pixel text-xs" aria-label="Fechar {m.nome}" onclick={m.fechar}>✕</button>
	</div>
{/snippet}

<div class="relative flex min-w-0 items-end gap-1.5" bind:clientWidth={largura}>
	<!-- cópia invisível só para medir cada chip -->
	<div class="pointer-events-none invisible absolute top-0 left-0 flex gap-1.5" aria-hidden="true" inert>
		{#each itens as m, i (m.chave)}<div class="flex-none" bind:offsetWidth={larguras[i]}>{@render chip(m)}</div>{/each}
	</div>
	{#each itens.slice(0, cabem) as m (m.chave)}{@render chip(m)}{/each}
	{#if escondidas.length}
		<div class="relative flex-none" data-minimizadas-menu>
			<button type="button" class="flex h-10 w-11 items-center justify-center border-2 border-b3 bg-b2 font-pixel text-base font-bold shadow-[4px_4px_0_var(--b0)]" aria-haspopup="menu" aria-expanded={menu} title="Mais {escondidas.length} janela{escondidas.length > 1 ? 's' : ''} minimizada{escondidas.length > 1 ? 's' : ''}" aria-label="Mais {escondidas.length} janelas minimizadas" onclick={() => (menu = !menu)}>…<span class="sr-only">{escondidas.length}</span></button>
			{#if menu}
				<div role="menu" class="camada absolute bottom-12 left-0 z-30 flex max-h-[50vh] w-64 flex-col overflow-y-auto py-1">
					{#each escondidas as m (m.chave)}
						<div class="flex items-center border-l-4 hover:bg-b3" style:border-color={m.cor}>
							<button type="button" role="menuitem" class="min-h-10 min-w-0 flex-1 truncate px-3 text-left text-[13px] font-semibold" onclick={() => ((menu = false), m.abrir())}>{m.nome}</button>
							<button type="button" class="h-10 w-9 flex-none font-pixel text-xs text-mut hover:text-fg" aria-label="Fechar {m.nome}" onclick={m.fechar}>✕</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	{#if depois}<div class="flex-none" bind:offsetWidth={larguraDepois}>{@render depois()}</div>{/if}
</div>
