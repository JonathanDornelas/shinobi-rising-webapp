<script lang="ts">
	// CMP-09 · Orçamento segmentado (pontos de atributo, perícia, PT): vermelhão enquanto falta, verde quando completo.
	interface Props {
		rotulo: string;
		usados: number;
		limite: number;
		extra?: string;
		fixo?: boolean;
	}
	let { rotulo, usados, limite, extra, fixo = true }: Props = $props();
	const restantes = $derived(limite - usados);
	const cor = $derived(restantes === 0 ? 'var(--ok)' : restantes < 0 ? 'var(--err)' : 'var(--vermelhao)');
	const texto = $derived(
		restantes > 0 ? `${usados} de ${limite} usados · faltam ${restantes}` : restantes === 0 ? `${limite} de ${limite} usados · completo` : `${usados} de ${limite} · ${-restantes} acima do limite`
	);
</script>

<div class="z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-frame bg-b2 px-3 py-2.5 {fixo ? 'sticky top-0' : ''}">
	<span class="t-rotulo">{rotulo}</span>
	<div class="flex h-[18px] min-w-[120px] flex-1 gap-[3px]" aria-hidden="true">
		{#each { length: Math.max(limite, usados) } as _, i (i)}
			<div class="flex-1 border-2 border-ink" style:background={i < usados ? cor : 'var(--b3)'}></div>
		{/each}
	</div>
	<span class="text-sm leading-5 font-semibold" style:color={restantes === 0 ? 'var(--ok)' : restantes < 0 ? 'var(--err)' : undefined} aria-live="polite">{texto}</span>
	{#if extra}<span class="text-[13px] leading-[18px] font-semibold text-mut">{extra}</span>{/if}
</div>
