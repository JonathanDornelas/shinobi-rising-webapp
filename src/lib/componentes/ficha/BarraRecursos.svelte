<script lang="ts">
	// P3 · Barra de recursos fixa: PV, PC e PE com ajuste rápido, Fadiga, PD, PIC e RD.
	import { FADIGA } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	let { f }: { f: FichaJogo } = $props();
	type K = 'pv' | 'pc' | 'pe';
	const BARRAS: { k: K; rotulo: string; cor: string; brilho: string }[] = [
		{ k: 'pv', rotulo: 'PV', cor: 'var(--vermelhao)', brilho: '#E07A5F' },
		{ k: 'pc', rotulo: 'PC', cor: '#2D7FB8', brilho: '#7FD3E6' },
		{ k: 'pe', rotulo: 'PE', cor: '#D29A1E', brilho: '#F2C14E' }
	];
	let aberto = $state<K | null>(null);
	let valor = $state('');
	const cores = ['#5C524A', '#6C453F', '#7C3733', '#8B2A28', '#9B1C1C'];

	function abrir(k: K) {
		aberto = aberto === k ? null : k;
		valor = '';
	}
	function aplicar(e: SubmitEvent) {
		e.preventDefault();
		if (!aberto || !valor.trim()) return;
		const t = valor.trim();
		const n = Number(t.replace(',', '.'));
		if (Number.isNaN(n)) return;
		// "-7" ou "+5" ajustam; "18" define o valor
		if (/^[+-]/.test(t)) f.ajustar(aberto, n);
		else f.definir(aberto, n);
		valor = '';
	}
	const largura = (v: number, m: number) => `${Math.max(0, Math.min(100, (v / m) * 100))}%`;
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (aberto = null)} onclick={(e) => aberto && !(e.target as HTMLElement).closest('[data-recursos]') && (aberto = null)} />

<div data-recursos class="sticky top-0 z-20 grid grid-cols-3 items-center gap-x-4 gap-y-3 border-b-2 border-ink bg-b2 px-4 py-2.5 md:px-6 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto_auto_auto_auto]">
	{#each BARRAS as b (b.k)}
		{@const v = f.atual[b.k]}
		{@const m = f.max[b.k]}
		<div class="relative">
			<button
				type="button"
				class="flex w-full flex-col gap-[5px] text-left text-fg disabled:cursor-default"
				aria-haspopup="dialog"
				aria-expanded={aberto === b.k}
				aria-label="{b.rotulo} {v} de {m}{f.editavel ? ', ajustar' : ''}"
				disabled={!f.editavel}
				onclick={() => abrir(b.k)}
			>
				<span class="flex items-center gap-1.5">
					<Icone id="recurso/ic-recurso-{b.k}" class="max-md:hidden" />
					<span class="font-pixel text-sm font-bold">{b.rotulo}</span>
					<span class="flex-1"></span>
					<span class="t-num text-[22px] leading-none max-md:text-base" style:color={v <= 0 ? 'var(--err)' : undefined} aria-live="polite">{v}<span class="text-sm text-mut">/{m}</span></span>
				</span>
				<span class="relative h-3.5 border-2 border-ink bg-b3" aria-hidden="true">
					<span class="absolute inset-y-0 left-0 transition-[width] duration-150 ease-out" style:width={largura(v, m)} style:background={b.cor} style:box-shadow="inset 0 3px 0 {b.brilho}"></span>
					{#if b.k === 'pv' && v > 0 && v < m / 2}<span class="absolute inset-y-0 left-0" style:width={largura(v, m)} style="background: repeating-linear-gradient(135deg, transparent 0 4px, var(--vermelhao-lo) 4px 8px)"></span>{/if}
					<span class="absolute inset-0" style="background: repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), var(--ink) calc(10% - 2px) 10%)"></span>
				</span>
			</button>
			{#if aberto === b.k}
				<div role="dialog" aria-label="Ajustar {b.rotulo}" class="camada absolute top-full left-0 z-30 mt-2 w-[300px] max-w-[calc(100vw-32px)]">
					<div class="flex items-center border-b-2 border-b3 px-3 py-2.5">
						<span class="t-rotulo flex-1">Ajustar {b.rotulo}</span>
						<button type="button" class="h-9 w-9 font-pixel text-base" aria-label="Fechar" onclick={() => (aberto = null)}>✕</button>
					</div>
					<div class="flex gap-1.5 p-3">
						{#each [-1, -5, -10, 5] as d (d)}
							<button type="button" class="t-num min-h-11 flex-1 border-2 border-b3 bg-b1 text-base hover:border-mut" onclick={() => f.ajustar(b.k, d)}>{d > 0 ? `+${d}` : `−${-d}`}</button>
						{/each}
					</div>
					<form class="flex gap-1.5 px-3 pb-3" onsubmit={aplicar}>
						<input class="campo t-num h-11 min-w-0 flex-1" inputmode="numeric" placeholder="−7, +3 ou 18" aria-label="Valor de {b.rotulo}" bind:value={valor} />
						<button type="submit" class="btn-jogo btn-contorno min-h-11 px-3 text-xs">APLICAR</button>
					</form>
					<div class="flex gap-1.5 px-3 pb-3">
						<button type="button" class="btn-jogo btn-contorno min-h-10 flex-1 px-2 text-xs" onclick={() => f.descanso('curto')}>DESCANSO CURTO</button>
						<button type="button" class="btn-jogo btn-contorno min-h-10 flex-1 px-2 text-xs" onclick={() => f.descanso('longo')}>DESCANSO LONGO</button>
					</div>
				</div>
			{/if}
		</div>
	{/each}

	<!-- no mobile e tablet, Fadiga, PD, PIC e RD ficam numa linha; no desktop entram na grade -->
	<div class="col-span-3 flex flex-wrap gap-x-6 gap-y-2 lg:contents">
	<div class="flex flex-col gap-[5px]" title={f.atual.fadiga ? `${FADIGA[f.atual.fadiga - 1].nome}: ${FADIGA[f.atual.fadiga - 1].efeito}` : 'Sem fadiga'}>
		<span class="font-pixel text-xs font-bold tracking-[0.06em] text-mut">FADIGA{f.atual.fadiga ? ` · ${FADIGA[f.atual.fadiga - 1].nome.toUpperCase()}` : ''}</span>
		<div class="flex gap-[3px]" role="group" aria-label="Fadiga {f.atual.fadiga} de 5">
			{#each cores as cor, i (i)}
				<button
					type="button"
					class="h-4 w-4 border-2"
					style:background={i < f.atual.fadiga ? cor : 'transparent'}
					style:border-color={i < f.atual.fadiga ? 'var(--ink)' : 'var(--b3)'}
					aria-label="Fadiga nível {i + 1}: {FADIGA[i].nome}"
					aria-pressed={i < f.atual.fadiga}
					disabled={!f.editavel}
					onclick={() => f.definirFadiga(i + 1)}
				></button>
			{/each}
		</div>
	</div>
	<div class="flex flex-col gap-[5px]">
		<span class="font-pixel text-xs font-bold tracking-[0.06em] text-mut">PD</span>
		<button type="button" class="flex h-8 items-center gap-1 disabled:cursor-default" disabled={!f.editavel || f.atual.pd <= 0} title={f.atual.pd ? 'Usar o Ponto de Destino da sessão' : 'PD da sessão já usado'} onclick={() => f.usarPd()}>
			<Icone id="recurso/ic-recurso-pd" alt="Ponto de Destino" class={f.atual.pd ? '' : 'opacity-30'} /><span class="t-num text-sm">{f.atual.pd}</span>
		</button>
	</div>
	{#if f.max.pic}
		<div class="flex flex-col gap-[5px]">
			<span class="font-pixel text-xs font-bold tracking-[0.06em] text-mut">PIC</span>
			<button type="button" class="flex h-8 items-center gap-1 disabled:cursor-default" disabled={!f.editavel || f.atual.pic <= 0} title="Usar 1 PIC (favor do clã)" onclick={() => f.usarPic()}>
				<Icone id="recurso/ic-recurso-pic" alt="Pontos de Influência do Clã" /><span class="t-num text-sm">{f.atual.pic}/{f.max.pic}</span>
			</button>
		</div>
	{/if}
	<div class="flex flex-col gap-[5px]">
		<span class="font-pixel text-xs font-bold tracking-[0.06em] text-mut">RD</span>
		<span class="t-num text-[22px] leading-8">{f.calc.recursos.rd}</span>
	</div>
	</div>
</div>
