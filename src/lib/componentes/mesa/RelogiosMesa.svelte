<script lang="ts">
	// Relógios da cena (planos/mesa-ferramentas-qol.md): contagens que todos veem, no canto do quadro. O Mestre cria, marca
	// os segmentos com um clique e tira; os que contam rodadas andam sozinhos na rodada nova (Mesa.proximoTurno).
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { MAX_RELOGIOS, marcarAte, novoRelogio, type Relogio } from '#lib/mesa/relogios.ts';

	let { mesa }: { mesa: Mesa } = $props();
	const pode = $derived(mesa.mestre && !mesa.somenteLeitura);
	let criando = $state(false);
	let nome = $state('');
	let total = $state(4);
	let rodada = $state(true);

	function trocar(r: Relogio) {
		void mesa.definirRelogios(mesa.relogios.map((x) => (x.id === r.id ? r : x)));
	}
	function criar() {
		if (!nome.trim()) return;
		void mesa.definirRelogios([...mesa.relogios, novoRelogio(nome, total, rodada)]);
		criando = false;
		nome = '';
	}
</script>

{#if mesa.temRelogios && (mesa.relogios.length || pode)}
	<div class="pointer-events-none flex flex-col items-start gap-1.5" aria-label="Relógios da cena">
		{#each mesa.relogios as r (r.id)}
			{@const cheio = r.marcados >= r.total}
			<div class="pointer-events-auto flex max-w-[min(420px,calc(100vw-24px))] items-center gap-2 border-2 bg-sup py-1 pr-1 pl-2 shadow-[3px_3px_0_var(--sombra)] {cheio ? 'border-[var(--vermelhao)]' : 'border-b3'}">
				<span class="min-w-0 truncate text-[13px] leading-4 font-semibold whitespace-nowrap" title={r.rodada ? 'Anda sozinho a cada rodada nova' : undefined}>{r.nome}</span>
				<span class="flex flex-none gap-0.5" role="group" aria-label="{r.nome}: {r.marcados} de {r.total}">
					{#each { length: r.total } as _, i (i)}
						{#if pode}
							<button type="button" class="h-4 w-3 border-2 {i < r.marcados ? (cheio ? 'border-[var(--vermelhao)] bg-[var(--vermelhao)]' : 'border-[var(--acc)] bg-[var(--acc)]') : 'border-b3 bg-b1 hover:border-mut'}" aria-label="Marcar até {i + 1}" onclick={() => trocar(marcarAte(r, i))}></button>
						{:else}
							<span class="h-4 w-3 border-2 {i < r.marcados ? (cheio ? 'border-[var(--vermelhao)] bg-[var(--vermelhao)]' : 'border-[var(--acc)] bg-[var(--acc)]') : 'border-b3 bg-b1'}"></span>
						{/if}
					{/each}
				</span>
				<span class="font-pixel text-[11px] leading-none font-bold text-mut">{r.marcados}/{r.total}{r.rodada ? ' ↻' : ''}</span>
				{#if pode}<button type="button" class="h-6 w-6 flex-none font-pixel text-xs text-mut hover:text-fg" aria-label="Tirar o relógio {r.nome}" title="Tirar" onclick={() => mesa.definirRelogios(mesa.relogios.filter((x) => x.id !== r.id))}>✕</button>{/if}
			</div>
		{/each}
		{#if pode && mesa.relogios.length < MAX_RELOGIOS}
			{#if criando}
				<form class="pointer-events-auto flex flex-col gap-2 border-2 border-[var(--acc)] bg-sup p-2 shadow-[3px_3px_0_var(--sombra)]" onsubmit={(e) => (e.preventDefault(), criar())}>
					<!-- svelte-ignore a11y_autofocus -->
					<input bind:value={nome} maxlength="40" placeholder="A ponte cai, reforços chegam…" aria-label="Nome do relógio" autofocus class="h-8 w-64 border-2 border-b3 bg-b1 px-2 text-[13px] text-fg" onkeydown={(e) => e.key === 'Escape' && (criando = false)} />
					<span class="flex items-center gap-2 text-xs font-semibold">
						<label class="flex items-center gap-1.5">Segmentos <input type="number" min="2" max="12" bind:value={total} class="h-7 w-12 border-2 border-b3 bg-b1 px-1 text-center text-fg" /></label>
						<label class="flex items-center gap-1.5"><input type="checkbox" bind:checked={rodada} />Anda a cada rodada</label>
					</span>
					<span class="flex gap-1.5">
						<button type="submit" class="btn-jogo btn-primario min-h-8 px-2.5 text-xs" disabled={!nome.trim()}>CRIAR</button>
						<button type="button" class="btn-jogo min-h-8 border-2 border-b3 px-2.5 text-xs" onclick={() => (criando = false)}>CANCELAR</button>
					</span>
				</form>
			{:else}
				<button type="button" class="pointer-events-auto border-2 border-dashed border-b3 bg-sup/80 px-2 py-1 font-pixel text-[11px] font-bold text-mut hover:border-mut hover:text-fg" title="Uma contagem que todos veem: a ponte cai em 3 rodadas, reforços chegam em 4…" onclick={() => (criando = true)}>+ RELÓGIO</button>
			{/if}
		{/if}
	</div>
{/if}
