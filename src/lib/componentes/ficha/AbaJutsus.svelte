<script lang="ts">
	// P3 · Jutsus conhecidos com o custo real (reduções do cap. 9) e GASTAR, que debita PC/PE com Desfazer.
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import type { TipoJutsu } from '#lib/livro/tipos.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	let { f }: { f: FichaJogo } = $props();
	const lista = $derived(f.calc.jutsus.map((s) => f.catalogo.jutsus.find((j) => j.slug === s)).filter((j) => !!j));
	const tipos = $derived([...new Set(lista.map((j) => j!.tipo))]);
	let filtro = $state('Todos');
	let aberto = $state<string | null>(null);
	const visiveis = $derived(lista.filter((j) => filtro === 'Todos' || j!.tipo === filtro || filtro === `Rank ${j!.rank}`));
	const ctrFino = $derived(f.calc.atributos.CTR >= 3);
	const exausto = $derived(f.atual.fadiga >= 2);
	const esgotado = $derived(f.atual.fadiga >= 3);
</script>

<div class="flex flex-wrap items-center gap-2.5">
	{#each ['Todos', ...tipos, 'Rank E'] as n (n)}
		<button type="button" class="min-h-10 border-2 px-3 text-[13px] font-semibold {filtro === n ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" aria-pressed={filtro === n} onclick={() => (filtro = n)}>{n}</button>
	{/each}
	<span class="flex-1"></span>
	{#if f.calc.especializacoes.some((e) => e.id === 'controle-chakra')}
		<span class="flex items-center gap-1.5 text-[13px] leading-[18px] text-mut"><Icone id="esp/ic-esp-controle-chakra" />Reduções de especialização aplicadas</span>
	{/if}
</div>

<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
	{#each visiveis as j (j!.slug)}
		{@const t = TIPO_JUTSU[j!.tipo as TipoJutsu] ?? TIPO_JUTSU.Ninjutsu}
		{@const c = f.custo(j!)}
		{@const k = c.unidade === 'PE' ? 'pe' : 'pc'}
		{@const falta = c.final - f.atual[k]}
		{@const bloqueadoRank = esgotado && ['B', 'A', 'S'].includes(j!.rank)}
		{@const aberta = aberto === j!.slug}
		<li class="border-2 bg-b2 sombra-painel" style:border-color={aberta ? 'var(--mut)' : 'var(--frame)'}>
			<div class="grid grid-cols-[4px_32px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2 pr-3 md:grid-cols-[4px_32px_minmax(0,1fr)_auto_120px_130px]">
				<div class="-my-2 self-stretch max-md:row-span-2" style:background={t.cor}></div>
				<Icone id="rank/ic-rank-{j!.rank.toLowerCase()}" alt="Rank {j!.rank}" />
				<button type="button" class="flex min-w-0 flex-col gap-0.5 text-left text-fg" aria-expanded={aberta} onclick={() => (aberto = aberta ? null : j!.slug)}>
					<span class="font-mincho text-[17px] leading-[22px] font-bold">{j!.nome} <span class="font-pixel text-xs text-mut">{aberta ? '▾' : '▸'}</span></span>
					<span class="truncate text-[13px] leading-[18px] text-mut">{j!.origem} · {j!.efeito}</span>
				</button>
				<span class="inline-flex h-9 items-center gap-1 border-2 border-ink pr-2.5 text-[13px] font-semibold max-md:hidden" style:background={t.cor} style:color={t.texto}><Icone id={t.icone} />{j!.tipo}</span>
				<div class="flex items-baseline justify-end gap-1.5" title={c.notas.join(' · ') || undefined}>
					{#if c.final !== c.base}<span class="t-num text-sm text-mut line-through">{c.base}</span>{/if}
					<span class="t-num text-[22px] leading-none" style:color={c.final < c.base ? '#7FD3E6' : c.final > c.base ? 'var(--warn)' : undefined}>{c.final} {c.unidade}</span>
				</div>
				<button
					type="button"
					class="btn-jogo min-h-9 px-3 text-xs max-md:col-span-2 max-md:col-start-3 {!f.editavel || falta > 0 || bloqueadoRank ? 'bg-b3 text-mut' : 'btn-primario'}"
					disabled={!f.editavel || falta > 0 || bloqueadoRank}
					title={bloqueadoRank ? 'Esgotado: sem jutsus de Rank B ou superior' : falta > 0 ? `Faltam ${falta} ${c.unidade}` : !f.editavel ? 'Ficha somente leitura' : undefined}
					onclick={() => f.gastarJutsu(j!)}>GASTAR {c.final} {c.unidade}</button
				>
			</div>
			{#if aberta}
				<div class="flex flex-col gap-2.5 border-t-2 border-b3 py-3 pr-3.5 pl-[18px]">
					<dl class="m-0 grid grid-cols-2 border-t-2 border-l-2 border-b3 md:grid-cols-3 xl:grid-cols-6">
						{#each j!.info as i (i.k)}
							<div class="flex flex-col gap-1 border-r-2 border-b-2 border-b3 bg-b1 px-2 py-1.5">
								<dt class="font-pixel text-xs leading-none font-semibold tracking-[0.06em] text-mut uppercase">{i.k}</dt>
								<dd class="m-0 text-[13px] leading-[18px] font-semibold">{i.v}</dd>
							</div>
						{/each}
					</dl>
					<p class="m-0 text-sm leading-[21px]"><b>Efeito.</b> {j!.efeito}</p>
					{#if c.notas.length}<p class="m-0 text-[13px] text-mut">Custo: {c.base} {c.unidade} base · {c.notas.join(' · ')}</p>{/if}
				</div>
			{/if}
		</li>
	{/each}
</ul>
<p class="m-0 text-[13px] leading-[18px] text-mut">
	Reduções de especializações diferentes não se somam: vale a maior, mais −1 da proficiência; custo mínimo 1 e nunca abaixo da metade (cap. 9).
	{#if exausto}Exausto: jutsus custam +1.{/if}
	{#if ctrFino}Controle Fino (CTR +3): gaste um turno preparando para reduzir 1 PC.{/if}
</p>
