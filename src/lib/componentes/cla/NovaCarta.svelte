<script lang="ts">
	// Adiciona uma carta ao clã: jutsu do catálogo geral (cap. 10), jutsu original (nome, rank e descrição; números no
	// criador de jutsus, cap. 20) ou habilidade passiva.
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import type { RankJutsu } from '#lib/clas/dados.ts';
	import { ORDEM_RANK } from '#lib/clas/dados.ts';
	import { nomeElemento } from '#lib/personagem/progressao.ts';

	interface Props {
		c: CriadorCla;
		tipo: 'jutsu' | 'habilidade';
		/** Ranks aceitos (jutsus). */
		ranks?: RankJutsu[];
		rotulo?: string;
		aoCriar?: (id: string) => void;
	}
	let { c, tipo, ranks = ['D', 'C', 'B', 'A', 'S'], rotulo = tipo === 'jutsu' ? 'Adicionar jutsu' : 'Adicionar habilidade', aoCriar }: Props = $props();
	let modo = $state<'livro' | 'original'>('livro');
	let slug = $state('');
	let nome = $state('');
	// svelte-ignore state_referenced_locally
	let rank = $state<RankJutsu>(ranks.includes('C') ? 'C' : ranks[0]);
	let descricao = $state('');
	let busca = $state('');
	const doLivro = $derived(
		c.jutsus
			.filter((j) => ranks.includes(j.rank as RankJutsu) && !c.dados.cartas.some((x) => x.slug === j.slug))
			.filter((j) => !busca.trim() || j.nome.toLowerCase().includes(busca.trim().toLowerCase()))
			.sort((a, b) => ORDEM_RANK.indexOf(a.rank as RankJutsu) - ORDEM_RANK.indexOf(b.rank as RankJutsu) || a.nome.localeCompare(b.nome))
	);

	function criar() {
		let id: string;
		if (tipo === 'jutsu' && modo === 'livro') {
			if (!slug) return;
			id = c.cartaDoCatalogo(slug);
		} else {
			if (!nome.trim()) return;
			id = c.novaCarta({ tipo, nome: nome.trim(), rank: tipo === 'jutsu' ? rank : null, descricao: descricao.trim() });
		}
		slug = '';
		nome = '';
		descricao = '';
		aoCriar?.(id);
	}
</script>

<div class="flex flex-col gap-2.5 border-2 border-dashed border-b3 p-3">
	<div class="flex flex-wrap items-center gap-2">
		<span class="t-rotulo flex-1 text-xs">{rotulo}</span>
		{#if tipo === 'jutsu'}
			<div class="flex border-2 border-b3" role="group" aria-label="Origem do jutsu">
				<button type="button" aria-pressed={modo === 'livro'} class="px-2.5 py-1.5 font-pixel text-xs font-bold {modo === 'livro' ? 'bg-vermelhao text-white' : 'text-mut'}" onclick={() => (modo = 'livro')}>DO LIVRO</button>
				<button type="button" aria-pressed={modo === 'original'} class="px-2.5 py-1.5 font-pixel text-xs font-bold {modo === 'original' ? 'bg-vermelhao text-white' : 'text-mut'}" onclick={() => (modo = 'original')}>ORIGINAL</button>
			</div>
		{/if}
	</div>
	{#if tipo === 'jutsu' && modo === 'livro'}
		<div class="flex flex-wrap gap-2">
			<input class="campo h-10 w-44 text-sm" type="search" placeholder="Buscar…" aria-label="Buscar jutsu" bind:value={busca} />
			<select class="campo h-10 min-w-0 flex-1 pr-8 text-sm" aria-label="Jutsu do livro" bind:value={slug}>
				<option value="">{doLivro.length ? `Escolha (${doLivro.length})…` : 'Nenhum jutsu com esses ranks'}</option>
				{#each doLivro as j (j.slug)}<option value={j.slug}>Rank {j.rank} · {j.nome}{j.elemento ? ` · ${nomeElemento(j.elemento)}` : ''}</option>{/each}
			</select>
			<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" disabled={!slug} onclick={criar}>ADICIONAR</button>
		</div>
	{:else}
		<div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
			<input class="campo h-10 text-sm" placeholder={tipo === 'jutsu' ? 'Nome do jutsu' : 'Nome da habilidade'} aria-label="Nome" maxlength="60" bind:value={nome} />
			{#if tipo === 'jutsu'}
				<select class="campo h-10 pr-8 text-sm" aria-label="Rank" bind:value={rank}>
					{#each ranks as r (r)}<option value={r}>Rank {r}</option>{/each}
				</select>
			{/if}
		</div>
		<textarea class="campo h-auto min-h-[64px] resize-y py-2 text-sm leading-5" placeholder="Descrição narrativa: o que acontece na cena" aria-label="Descrição" maxlength="800" bind:value={descricao}></textarea>
		<div class="flex items-center gap-2">
			<span class="flex-1 text-xs leading-4 text-mut">{tipo === 'jutsu' ? 'PJ, custo e efeitos em números chegam com o criador de jutsus (cap. 20).' : 'Ideias: +1 numa perícia, sentido aprimorado, redução de dano contra um tipo.'}</span>
			<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" disabled={!nome.trim() || !descricao.trim()} onclick={criar}>ADICIONAR</button>
		</div>
	{/if}
</div>
