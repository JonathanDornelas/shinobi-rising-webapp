<script lang="ts">
	// As cenas da campanha em pastas (até 3 níveis): abrir e fechar pastas, criar, renomear e apagar pastas, e mover cada
	// cena para uma pasta. O grupo nunca vê esta lista: só a cena ativa, com o nome público.
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';

	let {
		mesa,
		atual,
		aoNovaPasta,
		aoRenomearPasta,
		aoExcluirPasta,
		aoMoverCena,
		aoEscolher
	}: {
		mesa: Mesa;
		atual: string | null;
		aoNovaPasta: (pai: string | null) => void;
		aoRenomearPasta: (id: string) => void;
		aoExcluirPasta: (id: string) => void;
		aoMoverCena: (cena: string) => void;
		aoEscolher: () => void;
	} = $props();

	let fechadas = $state<string[]>([]);
	// apagar pede um segundo clique
	let confirmando = $state<string | null>(null);
	const pastasDe = (pai: string | null) => mesa.pastasCenas.filter((p) => p.pai_id === pai).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
	const cenasDe = (pasta: string | null) => mesa.cenas.filter((c) => (c.pasta_id ?? null) === pasta);
	const alternar = (id: string) => (fechadas = fechadas.includes(id) ? fechadas.filter((f) => f !== id) : [...fechadas, id]);
	/** Quantas cenas há dentro de uma pasta, contando as subpastas. */
	function dentro(id: string): number {
		return cenasDe(id).length + pastasDe(id).reduce((s, p) => s + dentro(p.id), 0);
	}
	const btn = 'flex h-8 w-8 flex-none items-center justify-center font-pixel text-xs text-mut hover:text-fg';
</script>

{#snippet nivel(pai: string | null, fundo: number)}
	{#each pastasDe(pai) as p (p.id)}
		{@const aberta = !fechadas.includes(p.id)}
		<div class="flex items-center border-t-2 border-b2 bg-b1" style="padding-left: {8 + fundo * 14}px">
			<button type="button" class="flex min-h-10 min-w-0 flex-1 items-center gap-1.5 text-left" aria-expanded={aberta} onclick={() => alternar(p.id)}>
				<span aria-hidden="true" class="w-3 font-pixel text-[11px] font-bold text-mut">{aberta ? '▾' : '▸'}</span>
				<span aria-hidden="true" class="font-pixel text-sm text-[var(--vermelhao)]">▣</span>
				<span class="min-w-0 flex-1 truncate text-sm leading-5 font-semibold">{p.nome}</span>
				<span class="font-pixel text-[11px] font-bold text-mut">{dentro(p.id)}</span>
			</button>
			{#if fundo < 2}<button type="button" class={btn} aria-label="Nova pasta dentro de {p.nome}" title="Nova pasta aqui dentro" onclick={() => aoNovaPasta(p.id)}>+</button>{/if}
			<button type="button" class={btn} aria-label="Renomear {p.nome}" title="Renomear" onclick={() => aoRenomearPasta(p.id)}>✎</button>
			{#if confirmando === p.id}
				<button type="button" class="mr-1 min-h-8 border-2 border-err px-1.5 font-pixel text-[10px] font-bold text-err" onclick={() => ((confirmando = null), aoExcluirPasta(p.id))}>APAGAR</button>
			{:else}
				<button type="button" class={btn} aria-label="Apagar a pasta {p.nome}" title="Apagar a pasta (as cenas sobem)" onclick={() => (confirmando = p.id)}>✕</button>
			{/if}
		</div>
		{#if aberta}{@render nivel(p.id, fundo + 1)}{/if}
	{/each}
	{#each cenasDe(pai) as c (c.id)}
		<div class="flex items-center border-t-2 border-b2 pr-1 {c.id === atual ? 'bg-b2' : ''}" style="padding-left: {8 + fundo * 14}px">
			<a role="menuitem" href="?cena={c.id}" class="flex min-h-11 min-w-0 flex-1 items-center gap-2" onclick={aoEscolher}>
				<span class="w-2.5 font-pixel text-xs font-bold text-[var(--vermelhao)]">{c.id === atual ? '●' : ''}</span>
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="truncate font-mincho text-[15px] leading-5 font-bold">{c.nome}</span>
					{#if c.nome_publico}<span class="truncate text-[11px] leading-4 text-mut">Grupo vê: {c.nome_publico}</span>{/if}
				</span>
				<span class="font-pixel text-xs font-semibold whitespace-nowrap text-mut">{c.largura} × {c.altura} m</span>
				{#if c.ativa}<span class="bg-ok px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-[var(--okfg)]">GRUPO</span>{/if}
			</a>
			<button type="button" class={btn} aria-label="Mover {c.nome} para uma pasta" title="Mover para uma pasta" onclick={() => aoMoverCena(c.id)}>↪</button>
		</div>
	{/each}
{/snippet}

<div class="max-h-[46vh] overflow-y-auto">
	{@render nivel(null, 0)}
</div>
<div class="border-t-2 border-b2 p-1.5">
	<button type="button" class="min-h-9 w-full border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => aoNovaPasta(null)}>+ NOVA PASTA</button>
</div>
