<script lang="ts">
	// Passo 5 · Perícias: 12 pontos (+2 sem clã), treino até +3; bônus de vila, clã e background somam.
	import { CRIACAO, type Pericia } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { sinal } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';
	import Orcamento from './Orcamento.svelte';

	let { c }: { c: Criador } = $props();
	const semCombate = $derived(c.analise.verificacoes.some((v) => v.passo === 5 && /combate/.test(v.texto) && v.nivel === 'aviso'));

	function treinar(p: Pericia, delta: 1 | -1) {
		const atual = c.ficha.pericias[p] ?? 0;
		const novo = Math.min(CRIACAO.periciaTreinoMax, Math.max(0, atual + delta));
		if (delta > 0 && c.pontosPericia.restantes <= 0) return;
		c.ficha.pericias = { ...c.ficha.pericias, [p]: novo };
	}
	const porQueNao = (treino: number) => (treino >= CRIACAO.periciaTreinoMax ? 'Máximo +3 de treino na criação' : c.pontosPericia.restantes <= 0 ? 'Sem pontos de perícia' : '');
</script>

<Orcamento rotulo="Pontos de perícia" usados={c.pontosPericia.usados} limite={c.pontosPericia.limite} />
{#if semCombate}
	<div class="flex items-center gap-2.5 border-2 border-warn bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] py-1.5 pr-3 pl-1.5 text-sm leading-5 font-medium" role="status">
		<Icone id="callout/ic-callout-atencao" />Aviso: nenhuma perícia de combate (Taijutsu, Bukijutsu ou Ninjutsu) está em +2. Você pode seguir. · cap. 6, Passo 5
	</div>
{/if}

<div class="painel" role="table" aria-label="Perícias">
	<div role="row" class="grid grid-cols-[minmax(0,1fr)_auto_64px] gap-2.5 bg-vermelhao px-3 py-2 font-pixel text-xs leading-4 font-bold tracking-[0.06em] text-white md:grid-cols-[minmax(0,1fr)_96px_150px_minmax(0,1fr)_72px]">
		<span role="columnheader">PERÍCIA</span>
		<span role="columnheader" class="max-md:hidden">ATRIB.</span>
		<span role="columnheader">TREINO</span>
		<span role="columnheader" class="max-md:hidden">BÔNUS</span>
		<span role="columnheader" class="text-right">TOTAL</span>
	</div>
	{#each c.pericias as p, i (p.id)}
		{@const motivo = porQueNao(p.treino)}
		<div role="row" class="grid grid-cols-[minmax(0,1fr)_auto_64px] items-center gap-2.5 px-3 py-0.5 md:grid-cols-[minmax(0,1fr)_96px_150px_minmax(0,1fr)_72px]" style:background={i % 2 ? 'var(--b1)' : 'var(--b2)'}>
			<span role="cell" class="flex min-w-0 items-center gap-1.5 text-sm leading-5 font-medium">
				<Icone id="pericia/ic-pericia-{p.id}" />
				<span class="flex min-w-0 flex-col">
					<span>{p.nome}{#if p.combate}<span class="ml-1 font-pixel text-xs text-mut" title="Perícia de combate">⚔</span>{/if}</span>
					<span class="text-xs leading-4 text-mut md:hidden">{p.atributo} {sinal(p.valorAtributo)}{p.distancia ? ` · ${p.distancia.atributo} ${sinal(p.distancia.valor)}` : ''}{p.bonus.length ? ` · ${p.bonus.map((b) => `${b.fonte} +${b.valor}`).join(', ')}` : ''}</span>
				</span>
			</span>
			<span role="cell" class="justify-self-start border-2 border-b3 px-1.5 py-1 font-pixel text-xs leading-none font-semibold max-md:hidden">
				{p.atributo} {sinal(p.valorAtributo)}{#if p.distancia}<br /><span class="text-mut">{p.distancia.atributo} {sinal(p.distancia.valor)}</span>{/if}
			</span>
			<div role="cell" class="flex items-center gap-1">
				<button type="button" class="btn-icone h-9 w-9 font-pixel text-lg font-bold max-md:h-11 max-md:w-11" aria-label="Menos treino em {p.nome}" disabled={!c.editavel || p.treino <= 0} onclick={() => treinar(p.id, -1)}>−</button>
				<span class="t-num w-9 text-center text-lg">+{p.treino}</span>
				<button type="button" class="btn-icone h-9 w-9 font-pixel text-lg font-bold max-md:h-11 max-md:w-11" aria-label="Mais treino em {p.nome}" title={motivo || undefined} disabled={!c.editavel || !!motivo} onclick={() => treinar(p.id, 1)}>+</button>
			</div>
			<div role="cell" class="flex flex-wrap gap-1 max-md:hidden">
				{#each p.bonus as b, j (j)}<span class="border-2 border-[rgba(217,168,43,.5)] bg-[rgba(217,168,43,.14)] px-1.5 py-1 text-xs leading-none font-semibold">{b.fonte} +{b.valor}</span>{/each}
			</div>
			<span role="cell" class="t-num text-right text-[22px] leading-none" title={p.distancia ? `${p.atributo} corpo a corpo / ${p.distancia.atributo} à distância` : undefined}>
				{sinal(p.total)}{#if p.distancia}<span class="block text-sm text-mut">{sinal(p.distancia.total)}</span>{/if}
			</span>
		</div>
	{/each}
</div>
<p class="m-0 text-[13px] leading-[18px] text-mut">Total = treino + bônus (até +5) + atributo. Bukijutsu usa FOR corpo a corpo e AGI à distância (cap. 3).</p>
