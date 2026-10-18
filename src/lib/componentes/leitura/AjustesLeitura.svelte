<script lang="ts">
	// Ajustes de leitura "Aa" (D2): tamanho do texto e tema.
	import { preferencias, TAMANHOS_LEITURA } from '#lib/estado/preferencias.svelte.ts';

	let aberto = $state(false);
	let raiz: HTMLDivElement | undefined = $state();

	function foraDoPopover(e: MouseEvent) {
		if (aberto && raiz && !raiz.contains(e.target as Node)) aberto = false;
	}
</script>

<svelte:window onclick={foraDoPopover} onkeydown={(e) => e.key === 'Escape' && (aberto = false)} />

<div class="relative" bind:this={raiz}>
	<button
		type="button"
		aria-label="Ajustes de leitura"
		aria-expanded={aberto}
		onclick={() => (aberto = !aberto)}
		class="h-11 min-w-11 border-2 border-b3 font-mincho text-base leading-none font-bold text-fg hover:border-mut"
		style:background={aberto ? 'var(--b3)' : 'transparent'}>Aa</button
	>
	{#if aberto}
		<div role="dialog" aria-label="Ajustes de leitura" class="camada absolute top-[52px] right-0 z-30 flex w-[280px] flex-col gap-3 p-3.5">
			<span class="t-rotulo-sm text-title">Ajustes de leitura</span>
			<span class="text-[13px] leading-[18px] font-semibold">Tamanho do texto</span>
			<div class="flex border-2 border-frame">
				{#each TAMANHOS_LEITURA as t, i (t)}
					<button
						type="button"
						class="t-num min-h-10 flex-1 text-[13px] {i < TAMANHOS_LEITURA.length - 1 ? 'border-r-2 border-frame' : ''}"
						style:background={preferencias.leitura === t ? 'var(--vermelhao)' : 'transparent'}
						style:color={preferencias.leitura === t ? '#FFFFFF' : 'var(--fg)'}
						aria-pressed={preferencias.leitura === t}
						onclick={() => preferencias.definirLeitura(t)}>{t}</button
					>
				{/each}
			</div>
			<span class="text-[13px] leading-[18px] font-semibold">Tema</span>
			<div class="flex gap-2">
				{#each [['sumi', 'SUMI'], ['washi', 'WASHI']] as const as [tema, rotulo] (tema)}
					{@const on = preferencias.aplicado === tema}
					<button
						type="button"
						class="t-num min-h-10 flex-1 text-[13px] {on ? 'bg-vermelhao text-white' : 'border-2 border-mut text-fg'}"
						aria-pressed={on}
						onclick={() => preferencias.definirTema(tema)}>{rotulo}</button
					>
				{/each}
			</div>
		</div>
	{/if}
</div>
