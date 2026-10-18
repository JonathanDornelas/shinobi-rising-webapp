<script lang="ts">
	// Passo 9 · Jutsus iniciais: Academia + clã já conhecidos; elemento; 2 de Rank E e 1 de Rank D (cap. 6).
	import { ELEMENTOS, JUTSUS_ACADEMIA, JUTSUS_INICIAIS } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { elementos, regrasCla } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';

	let { c }: { c: Criador } = $props();
	const cla = $derived(regrasCla(c.ficha));
	const info = $derived(c.ficha.cla.criado?.jutsusInfo ?? []);
	const conhecidos = $derived([
		...JUTSUS_ACADEMIA.map((s) => ({ j: c.catalogo.conhecidos[s], origem: 'Academia' })),
		...(cla?.jutsus ?? []).map((s) => ({ j: c.catalogo.conhecidos[s] ?? info.find((x) => x.slug === s), origem: `Clã ${cla?.nome}` }))
	].filter((x) => x.j));
	const meus = $derived(elementos(c.ficha));
	const fixo = $derived(cla?.elemento ?? null);

	function alternar(rank: 'E' | 'D', slug: string) {
		const lista = c.ficha.jutsus[rank];
		if (lista.includes(slug)) c.ficha.jutsus[rank] = lista.filter((s) => s !== slug);
		else if (rank === 'D') c.ficha.jutsus.D = [slug];
		else if (lista.length < JUTSUS_INICIAIS.E) c.ficha.jutsus.E = [...lista, slug];
	}
	const semAfinidade = (el: string | null) => (el && !meus.includes(el) ? `Exige afinidade com ${ELEMENTOS.find((e) => e.id === el)?.nome ?? el}` : '');
</script>

<span class="t-rotulo">Já conhecidos</span>
<div class="flex flex-wrap gap-2">
	{#each conhecidos as { j, origem } (j.slug)}
		<span class="inline-flex h-10 items-center gap-1.5 border-2 border-frame bg-b2 pr-2.5 pl-1 text-[13px] leading-none font-semibold">
			<Icone id="rank/ic-rank-{(j.rank ?? 'c').toLowerCase()}" alt="Rank {j.rank ?? '?'}" />{j.nome}<span class="text-xs font-semibold text-mut">{origem}</span>
		</span>
	{/each}
</div>

<span class="t-rotulo mt-1.5">Elemento principal</span>
<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Elemento principal">
	{#each ELEMENTOS as e (e.id)}
		{@const on = (fixo ?? c.ficha.elemento) === e.id}
		<button
			type="button"
			role="radio"
			aria-checked={on}
			disabled={!c.editavel || (!!fixo && fixo !== e.id)}
			title={fixo && fixo !== e.id ? `O clã ${cla?.nome} começa com ${ELEMENTOS.find((x) => x.id === fixo)?.nome}` : undefined}
			class="inline-flex h-11 items-center gap-1 border-2 pr-3 pl-1 text-sm font-semibold text-fg disabled:opacity-50"
			style:background="color-mix(in srgb, {e.cor} 12%, transparent)"
			style:border-color={on ? '#C44536' : `color-mix(in srgb, ${e.cor} 55%, transparent)`}
			onclick={() => {
				c.ficha.elemento = e.id;
				if (c.ficha.segundoElemento === e.id) c.ficha.segundoElemento = null;
			}}
		>
			<Icone id="elemento/ic-elemento-{e.id}" />{e.nome}{on ? ' ✓' : ''}
		</button>
	{/each}
</div>
{#if fixo}<p class="m-0 text-[13px] text-mut">O clã {cla?.nome} fixa {ELEMENTOS.find((x) => x.id === fixo)?.nome} como elemento inicial (cap. 8.3).</p>{/if}
{#if cla?.segundoElemento}
	<span class="t-rotulo mt-1.5">Segundo elemento · Clã {cla?.nome}</span>
	<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Segundo elemento">
		{#each ELEMENTOS.filter((e) => e.id !== c.ficha.elemento) as e (e.id)}
			{@const on = c.ficha.segundoElemento === e.id}
			<button type="button" role="radio" aria-checked={on} disabled={!c.editavel} class="inline-flex h-11 items-center gap-1 border-2 pr-3 pl-1 text-sm font-semibold text-fg" style:border-color={on ? '#C44536' : 'var(--b3)'} onclick={() => (c.ficha.segundoElemento = e.id)}>
				<Icone id="elemento/ic-elemento-{e.id}" />{e.nome}{on ? ' ✓' : ''}
			</button>
		{/each}
	</div>
{/if}

<div class="mt-1.5 grid gap-3 md:grid-cols-2">
	{#each [['E', c.catalogo.jutsusE], ['D', c.catalogo.jutsusD]] as const as [rank, lista] (rank)}
		{@const qtd = c.ficha.jutsus[rank].length}
		{@const falta = rank === 'E' && qtd < JUTSUS_INICIAIS.E}
		<fieldset class="m-0 flex flex-col gap-1.5 border-2 bg-b2 px-3 py-2.5" style:border-color={falta ? 'var(--err)' : 'var(--frame)'}>
			<legend class="sr-only">Jutsus Rank {rank}</legend>
			<div class="flex items-center gap-1.5">
				<Icone id="rank/ic-rank-{rank.toLowerCase()}" alt="Rank {rank}" />
				<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.08em]">RANK {rank}</span>
				<span class="t-num text-base" style:color={falta ? 'var(--err)' : undefined}>{qtd}/{JUTSUS_INICIAIS[rank]}</span>
			</div>
			{#each lista as j (j.slug)}
				{@const on = c.ficha.jutsus[rank].includes(j.slug)}
				{@const motivo = semAfinidade(j.elemento)}
				<label class="flex min-h-10 cursor-pointer items-center gap-2 border-2 px-2 py-1 text-sm {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 bg-b1'} {motivo && !on ? 'opacity-50' : ''}" title={motivo || undefined}>
					<input
						type="checkbox"
						class="caixa h-[18px] w-[18px]"
						checked={on}
						disabled={!c.editavel || (!on && (!!motivo || (rank === 'E' && qtd >= JUTSUS_INICIAIS.E)))}
						onchange={() => alternar(rank, j.slug)}
					/>
					<span class="flex min-w-0 flex-1 flex-col">
						<span class="font-medium">{j.nome}</span>
						<span class="text-xs leading-4 {on ? 'text-papel/80' : 'text-mut'}">{j.tipo} · {j.custo}{j.elemento ? ` · ${ELEMENTOS.find((e) => e.id === j.elemento)?.nome}` : ''}{motivo ? ` · ${motivo}` : ''}</span>
					</span>
				</label>
			{/each}
			{#if rank === 'D'}
				<span class="flex min-h-10 cursor-not-allowed items-center justify-center gap-1.5 border-2 border-dashed border-mut font-pixel text-xs font-bold tracking-[0.06em] text-mut" title="O criador de jutsus chega no lote de Jutsus">
					<Icone id="acao/ic-acao-criar-jutsu" class="opacity-60" />CRIAR JUTSU RANK D · EM BREVE
				</span>
			{/if}
		</fieldset>
	{/each}
</div>
