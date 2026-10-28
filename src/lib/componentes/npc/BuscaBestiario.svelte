<script lang="ts">
	// Importar NPC do bestiário (página de NPCs e Mesa): cada estágio de cada verbete é uma opção, com a arte, a ameaça,
	// o rank, o papel e o tamanho. Busca por texto e filtros por tipo, rank, papel e tamanho; ordena por nome ou ameaça.
	// O bestiário só carrega quando a busca abre.
	import { onMount } from 'svelte';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { Criatura } from '#lib/livro/tipos.ts';
	import { PAPEIS } from '#lib/bestiario/npc.ts';
	import { estiloFoco, focoPadrao } from '#lib/bestiario/foco.ts';

	let { onEscolher, onFechar, ocupado = false }: { onEscolher: (c: Criatura, estagio: number) => void; onFechar?: () => void; ocupado?: boolean } = $props();

	let criaturas = $state<Criatura[]>([]);
	let busca = $state('');
	let campo = $state<HTMLInputElement>();
	onMount(async () => {
		const { default: b } = await import('#lib/livro/gerado/bestiario.json');
		criaturas = (b as unknown as { criaturas: Criatura[] }).criaturas;
		campo?.focus();
	});

	const RANKS: [string, string][] = [['genin', 'Genin'], ['chunin', 'Chūnin'], ['jounin', 'Jōnin'], ['anbu', 'Anbu'], ['lendario', 'Lendário']];
	const TAMANHOS: [string, string][] = [['pequeno', 'Pequeno'], ['medio', 'Médio'], ['grande', 'Grande'], ['enorme', 'Enorme'], ['colossal', 'Colossal']];
	let tipo = $state('');
	let rank = $state('');
	let papel = $state('');
	let tamanho = $state('');
	let ordem = $state<'nome' | 'ameaca'>('nome');
	const tipos = $derived([...new Set(criaturas.map((c) => c.tipo))].sort());
	const filtros = $derived([tipo, rank, papel, tamanho].filter(Boolean).length);

	const opcoes = $derived(
		criaturas.flatMap((c) =>
			c.estagios.map((e, i) => ({
				c,
				i,
				e,
				nome: c.estagios.length > 1 ? `${e.nome} (${c.nome})` : c.nome,
				arte: (e.arte ?? c.arte)?.arquivo ?? null,
				chave: normalizar(`${e.nome} ${c.nome} ${c.tipo} ${c.origem ?? ''} ${c.vila?.nome ?? ''} ${(c.tags ?? []).join(' ')}`)
			}))
		)
	);
	const filtrados = $derived.by(() => {
		const palavras = normalizar(busca.trim()).split(/\s+/).filter(Boolean);
		const lista = opcoes.filter(
			(o) =>
				(!palavras.length || palavras.every((p) => o.chave.includes(p))) &&
				(!tipo || o.c.tipo === tipo) &&
				(!rank || o.e.rank === rank) &&
				(!papel || o.e.papel === papel) &&
				(!tamanho || (o.e.tamanho ?? 'medio') === tamanho)
		);
		return ordem === 'ameaca' ? [...lista].sort((a, b) => a.e.ameaca - b.e.ameaca) : lista;
	});
	const achados = $derived(filtrados.slice(0, 60));
	const limpar = () => ((tipo = ''), (rank = ''), (papel = ''), (tamanho = ''));
	const chip = (on: boolean) => `min-h-8 border-2 px-2 text-xs font-semibold whitespace-nowrap ${on ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3 text-mut hover:text-fg'}`;
</script>

{#snippet grupo(rotulo: string, itens: [string, string][], atual: string, mudar: (v: string) => void)}
	<div class="flex flex-wrap items-center gap-1" role="group" aria-label={rotulo}>
		<span class="w-16 flex-none font-pixel text-[11px] font-bold tracking-[0.06em] text-mut">{rotulo.toUpperCase()}</span>
		{#each itens as [v, n] (v)}
			<button type="button" aria-pressed={atual === v} class={chip(atual === v)} onclick={() => mudar(atual === v ? '' : v)}>{n}</button>
		{/each}
	</div>
{/snippet}

<div class="flex min-h-0 flex-col gap-2">
	<div class="flex gap-1.5">
		<input
			bind:this={campo}
			bind:value={busca}
			placeholder="Buscar no bestiário: aburame, sapo, ronin, Kiri…"
			aria-label="Buscar no bestiário"
			class="h-10 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2.5 text-sm font-medium text-fg"
			onkeydown={(e) => {
				if (e.key === 'Enter' && achados[0] && !ocupado) onEscolher(achados[0].c, achados[0].i);
				if (e.key === 'Escape') onFechar?.();
			}}
		/>
		{#if onFechar}<button type="button" class="h-10 w-10 border-2 border-b3 font-pixel text-sm" aria-label="Fechar busca" onclick={onFechar}>✕</button>{/if}
	</div>
	<div class="flex flex-col gap-1.5 border-2 border-b3 bg-b1 p-2">
		{@render grupo('Tipo', tipos.map((t) => [t, t[0].toUpperCase() + t.slice(1)]), tipo, (v) => (tipo = v))}
		{@render grupo('Rank', RANKS, rank, (v) => (rank = v))}
		{@render grupo('Papel', Object.entries(PAPEIS), papel, (v) => (papel = v))}
		{@render grupo('Tamanho', TAMANHOS, tamanho, (v) => (tamanho = v))}
		<div class="flex flex-wrap items-center gap-2 pt-0.5">
			<span class="text-xs font-semibold text-mut">{filtrados.length} {filtrados.length === 1 ? 'opção' : 'opções'}{filtrados.length > achados.length ? ` · mostrando ${achados.length}` : ''}</span>
			<span class="flex-1"></span>
			{#if filtros}<button type="button" class="link text-xs font-semibold" onclick={limpar}>Limpar filtros</button>{/if}
			<div role="radiogroup" aria-label="Ordem" class="flex border-2 border-b3">
				{#each [['nome', 'NOME'], ['ameaca', 'AMEAÇA']] as const as [v, n] (v)}
					<button type="button" role="radio" aria-checked={ordem === v} class="min-h-7 px-2 font-pixel text-[11px] font-bold {ordem === v ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => (ordem = v)}>{n}</button>
				{/each}
			</div>
		</div>
	</div>
	<div class="flex max-h-[380px] min-h-0 flex-col overflow-auto border-2 border-b3 bg-b1" role="listbox" aria-label="Resultados do bestiário">
		{#if !criaturas.length}
			<span class="px-3 py-3 text-[13px] text-mut">Abrindo o bestiário…</span>
		{:else if !achados.length}
			<span class="px-3 py-3 text-[13px] text-mut">Nada com essa busca{filtros ? ' e esses filtros' : ''}.</span>
		{/if}
		{#each achados as o (`${o.c.slug}-${o.i}`)}
			<button type="button" role="option" aria-selected="false" disabled={ocupado} class="flex min-h-14 items-center gap-2.5 border-b-2 border-b2 px-2 py-1 text-left hover:bg-b2 disabled:opacity-60" onclick={() => onEscolher(o.c, o.i)}>
				{#if o.arte}{@const f = focoPadrao(o.arte)}<span class="relative h-12 w-12 flex-none overflow-hidden border-2 border-b3">{#if f}<img src={o.arte} alt="" class="[image-rendering:pixelated]" style={estiloFoco(f)} loading="lazy" />{:else}<img src={o.arte} alt="" class="h-full w-full object-cover object-top [image-rendering:pixelated]" loading="lazy" />{/if}</span>{:else}<span class="h-12 w-12 flex-none bg-b3"></span>{/if}
				<span class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="truncate text-sm leading-[18px] font-semibold" title={o.nome}>{o.nome}</span>
					<span class="truncate text-xs leading-4 text-mut">{[o.c.tipo, RANKS.find((r) => r[0] === o.e.rank)?.[1], PAPEIS[o.e.papel], o.e.membros > 1 ? `bando de ${o.e.membros}` : null, o.e.tamanho && o.e.tamanho !== 'medio' ? TAMANHOS.find((t) => t[0] === o.e.tamanho)?.[1] : null].filter(Boolean).join(' · ')}</span>
				</span>
				<span class="flex flex-none flex-col items-end"><span class="font-pixel text-[10px] font-bold text-mut">AMEAÇA</span><b class="font-pixel text-base leading-none">{o.e.ameacaRotulo}</b></span>
			</button>
		{/each}
	</div>
</div>
