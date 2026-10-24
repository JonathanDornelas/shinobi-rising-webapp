<script lang="ts">
	// Importar NPC do bestiário pela busca (página de NPCs e Mesa): cada estágio de cada verbete é uma opção, com a arte,
	// a ameaça e o papel. O bestiário só carrega quando a busca abre.
	import { onMount } from 'svelte';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { Criatura } from '#lib/livro/tipos.ts';
	import { PAPEIS } from '#lib/bestiario/npc.ts';

	let { onEscolher, onFechar, ocupado = false }: { onEscolher: (c: Criatura, estagio: number) => void; onFechar?: () => void; ocupado?: boolean } = $props();

	let criaturas = $state<Criatura[]>([]);
	let busca = $state('');
	let campo = $state<HTMLInputElement>();
	onMount(async () => {
		const { default: b } = await import('#lib/livro/gerado/bestiario.json');
		criaturas = (b as unknown as { criaturas: Criatura[] }).criaturas;
		campo?.focus();
	});

	const opcoes = $derived(
		criaturas.flatMap((c) =>
			c.estagios.map((e, i) => ({
				c,
				i,
				nome: c.estagios.length > 1 ? `${e.nome} (${c.nome})` : c.nome,
				meta: `ameaça ${e.ameacaRotulo} · ${PAPEIS[e.papel]}${e.membros > 1 ? ` · bando de ${e.membros}` : ''}`,
				arte: (e.arte ?? c.arte)?.arquivo ?? null,
				chave: normalizar(`${e.nome} ${c.nome} ${c.tipo} ${c.vila?.nome ?? ''}`)
			}))
		)
	);
	const achados = $derived.by(() => {
		const q = normalizar(busca.trim());
		const palavras = q.split(/\s+/).filter(Boolean);
		return (palavras.length ? opcoes.filter((o) => palavras.every((p) => o.chave.includes(p))) : opcoes).slice(0, 30);
	});
</script>

<div class="flex min-h-0 flex-col gap-2">
	<div class="flex gap-1.5">
		<input
			bind:this={campo}
			bind:value={busca}
			placeholder="Buscar no bestiário: aburame, sapo, ronin…"
			aria-label="Buscar no bestiário"
			class="h-10 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2.5 text-sm font-medium text-fg"
			onkeydown={(e) => {
				if (e.key === 'Enter' && achados[0] && !ocupado) onEscolher(achados[0].c, achados[0].i);
				if (e.key === 'Escape') onFechar?.();
			}}
		/>
		{#if onFechar}<button type="button" class="h-10 w-10 border-2 border-b3 font-pixel text-sm" aria-label="Fechar busca" onclick={onFechar}>✕</button>{/if}
	</div>
	<div class="flex max-h-[360px] min-h-0 flex-col overflow-auto border-2 border-b3 bg-b1" role="listbox" aria-label="Resultados do bestiário">
		{#if !criaturas.length}
			<span class="px-3 py-3 text-[13px] text-mut">Abrindo o bestiário…</span>
		{:else if !achados.length}
			<span class="px-3 py-3 text-[13px] text-mut">Nada com “{busca}”.</span>
		{/if}
		{#each achados as o (`${o.c.slug}-${o.i}`)}
			<button type="button" role="option" aria-selected="false" disabled={ocupado} class="flex min-h-12 items-center gap-2.5 border-b-2 border-b2 px-2 py-1 text-left hover:bg-b2 disabled:opacity-60" onclick={() => onEscolher(o.c, o.i)}>
				{#if o.arte}<img src={o.arte} alt="" width="40" height="40" class="h-10 w-10 flex-none object-cover [image-rendering:pixelated]" loading="lazy" />{:else}<span class="h-10 w-10 flex-none bg-b3"></span>{/if}
				<span class="flex min-w-0 flex-col gap-0.5">
					<span class="truncate text-sm leading-[18px] font-semibold">{o.nome}</span>
					<span class="text-xs leading-4 text-mut">{o.meta}</span>
				</span>
			</button>
		{/each}
	</div>
</div>
