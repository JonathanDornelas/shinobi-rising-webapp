<script lang="ts">
	// K2 · Passo 2 · Bônus Hereditário (Componente 1): compras com PB, o alvo de cada compra e o atributo e a perícia do clã.
	import { COMPRAS_PB } from '#lib/clas/dados.ts';
	import { atributoDoCla, limiteCompra, qtdCompra } from '#lib/clas/regras.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import { ATRIBUTOS, ELEMENTOS, PERICIAS } from '#lib/personagem/dados.ts';
	import EscolhaPericia from '../personagem/EscolhaPericia.svelte';

	let { c }: { c: CriadorCla } = $props();
	const d = $derived(c.dados);
	const ro = $derived(!c.editavel);
	const atributoComprado = $derived(d.bonus.compras.some((x) => x.tipo === 'atributo'));
	/** Índices das compras de um tipo, para editar o alvo de cada unidade. */
	const unidades = (tipo: string) => d.bonus.compras.map((x, i) => [x, i] as const).filter(([x]) => x.tipo === tipo);
</script>

{#if !d.kkg}
	<fieldset class="m-0 flex flex-col gap-2 border-2 border-frame bg-b2 p-3.5">
		<legend class="px-1 text-sm font-semibold">Clã sem KKG: escolha a compensação (cap. 8.4, Componente 2)</legend>
		<label class="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px]"><input type="radio" class="caixa rounded-none" value="pb" disabled={ro} bind:group={c.dados.bonus.extraSemKkg} />+1 PB para o bônus hereditário (4 PB)</label>
		<label class="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px]"><input type="radio" class="caixa rounded-none" value="jutsu" disabled={ro} bind:group={c.dados.bonus.extraSemKkg} />+1 jutsu hereditário extra (escolha no passo 7)</label>
	</fieldset>
{/if}

<div class="border-2 border-frame bg-b2">
	<div class="grid grid-cols-[minmax(0,1fr)_48px_132px] items-center gap-2.5 bg-vermelhao px-3 py-2 font-pixel text-xs leading-4 font-bold tracking-[0.06em] text-white">
		<span>COMPRA</span><span>PB</span><span class="text-center">QTD</span>
	</div>
	{#each COMPRAS_PB as compra, i (compra.id)}
		{@const q = qtdCompra(d, compra.id)}
		{@const motivo = limiteCompra(d, compra.id)}
		<div class="border-b-2 border-b3" style:background={q ? 'rgba(196,69,54,.10)' : i % 2 ? 'var(--b1)' : 'var(--b2)'}>
			<div class="grid grid-cols-[minmax(0,1fr)_48px_132px] items-center gap-2.5 px-3 py-1">
				<span class="flex flex-col">
					<span class="text-sm leading-5 font-semibold">{compra.nome}</span>
					{#if 'nota' in compra}<span class="text-xs leading-4 text-mut">{compra.nota}</span>{/if}
				</span>
				<span class="t-num text-[15px]">{compra.pb}</span>
				<span class="flex items-center justify-center gap-1">
					<button type="button" class="h-9 w-9 border-2 border-b3 bg-b1 font-pixel text-lg font-bold disabled:text-b3" aria-label="Menos {compra.nome}" disabled={ro || q === 0} onclick={() => c.devolver(compra.id)}>−</button>
					<span class="t-num w-7 text-center text-lg" aria-live="polite">{q}</span>
					<button type="button" class="h-9 w-9 border-2 border-b3 bg-b1 font-pixel text-lg font-bold disabled:text-b3" aria-label="Mais {compra.nome}" title={motivo || undefined} disabled={ro || !!motivo} onclick={() => c.comprar(compra.id)}>+</button>
				</span>
			</div>
			{#if q && 'alvo' in compra}
				<div class="flex flex-wrap gap-2 px-3 pb-2.5">
					{#each unidades(compra.id) as [u, idx], n (idx)}
						{@const rotulo = `${compra.nome} ${q > 1 ? n + 1 : ''}`.trim()}
						{#if compra.alvo === 'texto'}
							<input class="campo h-10 w-56 text-sm" aria-label="{rotulo}: contra o quê" placeholder="Veneno, frio, fogo…" maxlength="40" readonly={ro} bind:value={c.dados.bonus.compras[idx].alvo} aria-invalid={!u.alvo?.trim() || undefined} />
						{:else}
							<select class="campo h-10 w-56 pr-8 text-sm" aria-label={rotulo} disabled={ro} bind:value={c.dados.bonus.compras[idx].alvo} aria-invalid={!u.alvo || undefined} style:border-color={!u.alvo ? 'var(--warn)' : undefined}>
								<option value={null}>{compra.alvo === 'atributo' ? 'Qual atributo?' : compra.alvo === 'pericia' ? 'Qual perícia?' : 'Qual elemento?'}</option>
								{#if compra.alvo === 'atributo'}
									{#each ATRIBUTOS as a (a.id)}<option value={a.id}>{a.id} · {a.nome}</option>{/each}
								{:else if compra.alvo === 'pericia'}
									{#each PERICIAS as p (p.id)}<option value={p.id}>{p.nome}</option>{/each}
								{:else}
									{#each ELEMENTOS as e (e.id)}<option value={e.id}>{e.nome}</option>{/each}
								{/if}
							</select>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<div class="painel flex flex-col gap-3 p-3.5">
	<span class="t-rotulo text-xs">Atributo e perícia do clã</span>
	<p class="m-0 text-sm leading-[21px] text-mut">Os marcos 5, 9, 15 e 18 dão +1 no atributo do clã; o 12, +1 na perícia do clã (Esqueleto Padrão).</p>
	{#if atributoComprado}
		<span class="text-[15px]">Atributo do clã: <b>{atributoDoCla(d) ?? 'escolha o atributo da compra acima'}</b></span>
	{:else}
		<div class="flex flex-wrap items-center gap-2.5">
			<label for="cla-atributo" class="text-sm leading-5 font-semibold">Atributo do clã:</label>
			<select id="cla-atributo" class="campo h-10 min-w-[200px] pr-8 text-[15px]" disabled={ro} bind:value={c.dados.bonus.atributo} style:border-color={!d.bonus.atributo ? 'var(--warn)' : undefined}>
				<option value={null}>Escolha o atributo…</option>
				{#each ATRIBUTOS as a (a.id)}<option value={a.id}>{a.id} · {a.nome}</option>{/each}
			</select>
		</div>
	{/if}
	<EscolhaPericia id="cla-pericia" rotulo="Perícia do clã:" valor={d.bonus.pericia} desabilitado={ro} aoMudar={(p) => (c.dados.bonus.pericia = p)} />
</div>
