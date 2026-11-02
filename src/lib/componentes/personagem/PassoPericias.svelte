<script lang="ts">
	// Passo 5 · Perícias: o personagem treina 4 perícias (5 sem clã), cada uma com +2 (cap. 3); vila, clã e background
	// treinam outras. Uma perícia já treinada por eles não se escolhe de novo.
	import { BONUS_TREINADA, type Pericia } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { periciasDaCriacao, sinal } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';
	import Orcamento from './Orcamento.svelte';

	let { c }: { c: Criador } = $props();
	const semCombate = $derived(c.analise.verificacoes.some((v) => v.passo === 5 && /combate/.test(v.texto) && v.nivel === 'aviso'));
	const minhas = $derived(new Set(periciasDaCriacao(c.ficha)));

	function alternar(p: Pericia) {
		if (minhas.has(p)) {
			const { [p]: _, ...resto } = c.ficha.pericias;
			c.ficha.pericias = resto;
		} else if (c.pontosPericia.restantes > 0) c.ficha.pericias = { ...c.ficha.pericias, [p]: 1 };
	}
	/** Por que não dá para marcar (title do botão), ou ''. */
	const porQueNao = (p: (typeof c.pericias)[number]) =>
		minhas.has(p.id) ? '' : p.fontes.length ? `Já treinada por ${p.fontes.join(', ')}` : c.pontosPericia.restantes <= 0 ? `Já são ${c.pontosPericia.limite} perícias treinadas` : '';
</script>

<Orcamento rotulo="Perícias treinadas" usados={c.pontosPericia.usados} limite={c.pontosPericia.limite} />
{#if semCombate}
	<div class="flex items-center gap-2.5 border-2 border-warn bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] py-1.5 pr-3 pl-1.5 text-sm leading-5 font-medium" role="status">
		<Icone id="callout/ic-callout-atencao" />Aviso: nenhuma perícia de combate (Taijutsu, Bukijutsu ou Ninjutsu) está treinada. Você pode seguir. · cap. 6, Passo 5
	</div>
{/if}

<div class="painel" role="table" aria-label="Perícias">
	<div role="row" class="grid grid-cols-[minmax(0,1fr)_auto_64px] gap-2.5 bg-vermelhao px-3 py-2 font-pixel text-xs leading-4 font-bold tracking-[0.06em] text-white md:grid-cols-[minmax(0,1fr)_96px_150px_minmax(0,1fr)_72px]">
		<span role="columnheader">PERÍCIA</span>
		<span role="columnheader" class="max-md:hidden">ATRIB.</span>
		<span role="columnheader">TREINO</span>
		<span role="columnheader" class="max-md:hidden">TREINADA POR</span>
		<span role="columnheader" class="text-right">TOTAL</span>
	</div>
	{#each c.pericias as p, i (p.id)}
		{@const motivo = porQueNao(p)}
		{@const minha = minhas.has(p.id)}
		<div role="row" class="grid grid-cols-[minmax(0,1fr)_auto_64px] items-center gap-2.5 px-3 py-0.5 md:grid-cols-[minmax(0,1fr)_96px_150px_minmax(0,1fr)_72px]" style:background={i % 2 ? 'var(--b1)' : 'var(--b2)'}>
			<span role="cell" class="flex min-w-0 items-center gap-1.5 text-sm leading-5 font-medium">
				<Icone id="pericia/ic-pericia-{p.id}" />
				<span class="flex min-w-0 flex-col">
					<span>{p.nome}{#if p.combate}<span class="ml-1 font-pixel text-xs text-mut" title="Perícia de combate">⚔</span>{/if}</span>
					<span class="text-xs leading-4 text-mut md:hidden">{p.atributo} {sinal(p.valorAtributo)}{p.distancia ? ` · ${p.distancia.atributo} ${sinal(p.distancia.valor)}` : ''}{p.fontes.filter((x) => x !== 'Criação').length ? ` · ${p.fontes.filter((x) => x !== 'Criação').join(', ')}` : ''}</span>
				</span>
			</span>
			<span role="cell" class="justify-self-start border-2 border-b3 px-1.5 py-1 font-pixel text-xs leading-none font-semibold max-md:hidden">
				{p.atributo} {sinal(p.valorAtributo)}{#if p.distancia}<br /><span class="text-mut">{p.distancia.atributo} {sinal(p.distancia.valor)}</span>{/if}
			</span>
			<div role="cell" class="flex items-center">
				<button type="button" role="checkbox" aria-checked={p.treino > 0} aria-label="Treinar {p.nome}" title={motivo || undefined} disabled={!c.editavel || !!motivo} class="flex min-h-9 items-center gap-1.5 border-2 px-2 font-pixel text-xs font-bold max-md:min-h-11 {minha ? 'border-vermelhao bg-grena text-papel' : p.treino ? 'border-[rgba(217,168,43,.6)] bg-[rgba(217,168,43,.14)]' : 'border-b3 hover:border-mut'} disabled:cursor-default" onclick={() => alternar(p.id)}>{p.treino ? `TREINADA +${BONUS_TREINADA}` : 'TREINAR'}</button>
			</div>
			<div role="cell" class="flex flex-wrap gap-1 max-md:hidden">
				{#each p.fontes.filter((x) => x !== 'Criação') as fonte (fonte)}<span class="border-2 border-[rgba(217,168,43,.5)] bg-[rgba(217,168,43,.14)] px-1.5 py-1 text-xs leading-none font-semibold">{fonte}</span>{/each}
				{#each p.bonus as b, j (j)}<span class="border-2 border-b3 px-1.5 py-1 text-xs leading-none font-semibold">{b.fonte} +{b.valor}</span>{/each}
			</div>
			<span role="cell" class="t-num text-right text-[22px] leading-none" title={p.distancia ? `${p.atributo} corpo a corpo / ${p.distancia.atributo} à distância` : undefined}>
				{sinal(p.total)}{#if p.distancia}<span class="block text-sm text-mut">{sinal(p.distancia.total)}</span>{/if}
			</span>
		</div>
	{/each}
</div>
<p class="m-0 text-[13px] leading-[18px] text-mut">Total = atributo + 2 se treinada (+ a especialização, quando ela soma). Vila, clã e background treinam as perícias deles, que não contam nas {c.pontosPericia.limite} escolhas. Bukijutsu usa FOR corpo a corpo e AGI à distância (cap. 3).</p>
