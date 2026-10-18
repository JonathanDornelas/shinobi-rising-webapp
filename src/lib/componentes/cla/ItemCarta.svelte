<script lang="ts">
	// Uma carta do clã na lista: rank, nome, origem e onde é usada; as originais abrem para editar nome e descrição.
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import type { CartaCla } from '#lib/clas/regras.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		c: CriadorCla;
		carta: CartaCla;
		/** Botão de escolha (assinatura, jutsu extra). */
		escolhida?: boolean;
		aoEscolher?: () => void;
	}
	let { c, carta, escolhida = false, aoEscolher }: Props = $props();
	let aberta = $state(false);
	const usos = $derived(c.usoDaCarta(carta.id));
	const icone = $derived(carta.tipo === 'habilidade' ? 'acao/ic-acao-criar-jutsu' : `rank/ic-rank-${(carta.rank ?? 'c').toLowerCase()}`);
	const ro = $derived(!c.editavel);
	const idx = $derived(c.dados.cartas.findIndex((x) => x.id === carta.id));
</script>

<div class="border-b-2 border-b3 {escolhida ? 'bg-[rgba(196,69,54,.10)]' : ''}">
	<div class="flex min-h-12 items-center gap-3 py-1 pr-2">
		<Icone id={icone} />
		<span class="flex min-w-0 flex-1 flex-col">
			<span class="truncate text-[15px] leading-[22px] font-medium">{carta.nome || 'Sem nome'}</span>
			<span class="text-xs leading-4 text-mut">{carta.tipo === 'habilidade' ? 'Habilidade' : `Rank ${carta.rank ?? '?'}`} · {carta.slug ? 'do livro' : 'original'}</span>
		</span>
		<span class="text-right text-[13px] leading-[18px] font-semibold" style:color={usos.length ? 'var(--fg)' : 'var(--warn)'}>{usos.join(' · ') || 'não usado'}</span>
		{#if aoEscolher}
			<button type="button" class="btn-jogo min-h-9 text-xs {escolhida ? 'btn-primario' : 'btn-contorno'}" disabled={ro} aria-pressed={escolhida} onclick={aoEscolher}>{escolhida ? '✓ ESCOLHIDO' : 'ESCOLHER'}</button>
		{/if}
		{#if !carta.slug && !ro}
			<button type="button" class="btn-icone h-9 w-9 font-pixel text-sm" aria-expanded={aberta} aria-label="Editar {carta.nome}" onclick={() => (aberta = !aberta)}>✎</button>
		{/if}
		{#if !ro}
			<button type="button" class="btn-icone h-9 w-9 font-pixel text-sm text-err" aria-label="Remover {carta.nome}" onclick={() => c.removerCarta(carta.id)}>✕</button>
		{/if}
	</div>
	{#if aberta && idx >= 0}
		<div class="flex flex-col gap-2 pb-3 pl-11">
			<div class="flex gap-2">
				<input class="campo h-10 flex-1 text-sm" aria-label="Nome" maxlength="60" bind:value={c.dados.cartas[idx].nome} />
				{#if carta.tipo === 'jutsu'}
					<select class="campo h-10 pr-8 text-sm" aria-label="Rank" bind:value={c.dados.cartas[idx].rank}>
						{#each ['D', 'C', 'B', 'A', 'S'] as r (r)}<option value={r}>Rank {r}</option>{/each}
					</select>
				{/if}
			</div>
			<textarea class="campo h-auto min-h-[64px] resize-y py-2 text-sm leading-5" aria-label="Descrição" maxlength="800" bind:value={c.dados.cartas[idx].descricao}></textarea>
		</div>
	{:else if carta.descricao && !carta.slug}
		<p class="m-0 pb-2.5 pl-11 text-[13px] leading-[19px] text-mut">{carta.descricao}</p>
	{/if}
</div>
