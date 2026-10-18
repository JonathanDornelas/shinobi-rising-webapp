<script lang="ts">
	// P3 · Clã: PIC, política (relações e obrigação) e a linha do tempo de marcos com "você está aqui".
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { page } from '$app/state';
	import { hrefCla } from '#lib/clas/status.ts';
	import Brasao from '../cla/Brasao.svelte';
	import Icone from '../ui/Icone.svelte';

	let { f }: { f: FichaJogo } = $props();
	const cla = $derived(f.catalogo.cla);
	const nivel = $derived(f.calc.nivel);
	const proximo = $derived(cla?.marcos.find((m) => m.nivel > nivel)?.nivel ?? null);
	const RELACAO: Record<string, string> = { Aliado: 'Aliados', Rival: 'Rivais', Inimigo: 'Inimigos' };
	const relacoes = $derived(
		Object.entries(
			(cla?.relacoes ?? []).reduce<Record<string, string[]>>((acc, r) => ((acc[r.relacao] ??= []).push(r.nome), acc), {})
		)
	);
</script>

{#if !cla}
	<div class="painel flex flex-col items-center gap-2 p-8 text-center">
		<Icone id="vila/ic-vila-sem" tamanho={64} />
		<span class="text-[15px] font-semibold">{f.dados.cla.tipo === 'sem' ? 'Sem clã' : 'Clã personalizado'}</span>
		<span class="text-sm text-mut">{f.dados.cla.tipo === 'sem' ? 'Quem não tem clã ganhou +2 pontos de perícia e +5 PT na criação.' : 'O clã criado desta ficha não está disponível para você.'}</span>
	</div>
{:else}
	<div class="grid items-start gap-5 lg:grid-cols-2">
		<div class="flex flex-col gap-4">
			<div class="flex border-2 border-[#8B2E20] bg-b2 sombra-painel">
				<div class="flex w-28 flex-none items-center justify-center border-r-2 border-[#8B2E20] bg-grena"><Brasao slug={cla.slug} kamon={cla.brasao?.kamon} cor={cla.brasao?.cor} tamanho={64} /></div>
				<div class="flex flex-col gap-1.5 p-3.5">
					<span class="font-mincho text-[22px] leading-7 font-bold">Clã {cla.nome}</span>
					<span class="text-sm leading-5 text-mut italic">{cla.epiteto} · {cla.kkg ? `KKG: ${cla.kkg}` : 'sem KKG'}</span>
					<a href={cla.slug ? `/regras/clas/${cla.slug}` : hrefCla(page.params.id ?? '', cla.id ?? '')} class="link self-start text-[13px] font-semibold">Ver página do clã</a>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="painel flex flex-col gap-1.5 p-3">
					<span class="t-rotulo text-xs">PIC</span>
					<span class="t-num text-[28px] leading-none">{f.atual.pic}<span class="text-base text-mut"> / {f.max.pic} por arco</span></span>
					{#if f.editavel}<button type="button" class="link self-start text-[13px] font-semibold" disabled={f.atual.pic <= 0} onclick={() => f.usarPic()}>Usar 1 PIC</button>{/if}
				</div>
				<div class="painel flex flex-col gap-1.5 p-3">
					<span class="t-rotulo text-xs">Status</span>
					<span class="text-sm leading-5 font-semibold">{cla.status ?? '—'}</span>
				</div>
			</div>
			<div class="painel flex flex-col gap-2 px-3.5 py-3 text-sm leading-[21px]">
				<span class="t-rotulo text-xs">Política</span>
				<span><b>Bônus:</b> {cla.bonus.join(' · ')}</span>
				{#if relacoes.length}<span>{#each relacoes as [rel, nomes], i (rel)}{#if i} · {/if}<b>{RELACAO[rel] ?? rel}:</b> {nomes.join(', ')}{/each}</span>{/if}
				{#if cla.obrigacao}<span><b>Obrigação:</b> {cla.obrigacao}</span>{/if}
			</div>
		</div>
		<section class="painel-sombra" aria-label="Marcos do clã">
			<h3 class="t-rotulo m-0 border-b-2 border-b3 px-3.5 py-3">Marcos</h3>
			<ol class="m-0 list-none p-0">
				{#each cla.marcos as m (m.nivel)}
					{@const aqui = m.nivel === nivel || (m.nivel < nivel && !cla.marcos.some((x) => x.nivel > m.nivel && x.nivel <= nivel))}
					{@const passado = m.nivel <= nivel}
					<li class="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 pr-3 pl-1.5" style:background={aqui ? 'rgba(196,69,54,.12)' : undefined}>
						<div class="flex flex-col items-center self-stretch">
							<span
								class="t-num mt-2 flex h-9 w-9 flex-none items-center justify-center border-2 text-base {aqui ? 'border-ink bg-vermelhao text-white' : passado ? 'border-ink bg-b3 text-fg' : 'border-b3 text-mut'}">{m.nivel}</span
							>
							<span class="min-h-2.5 w-1 flex-1 bg-b3"></span>
						</div>
						<div class="flex flex-wrap items-center gap-2 pt-3.5 pb-3">
							<span class="text-[15px] leading-5 font-medium" class:text-mut={!passado}>{m.texto}</span>
							{#if aqui}<span class="bg-vermelhao px-1.5 py-1 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-white">▸ VOCÊ ESTÁ AQUI</span>{/if}
							{#if m.nivel === proximo}<span class="border-2 border-acc px-1 py-0.5 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-title">PRÓXIMO</span>{/if}
						</div>
					</li>
				{/each}
			</ol>
		</section>
	</div>
{/if}
