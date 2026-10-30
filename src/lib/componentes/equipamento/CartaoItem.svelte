<script lang="ts">
	// O cartão de um item do inventário, no hover (como o tooltip de ação dos jutsus): o que ele faz, o dano e o alcance
	// das armas, as propriedades com o efeito de cada uma e, embaixo, preço e peso.
	import type { InfoItem } from '#lib/equipamentos/info.server.ts';
	import { lerDados } from '#lib/mesa/hud.ts';
	import DadoHud from '../mesa/DadoHud.svelte';
	import Icone from '../ui/Icone.svelte';

	let { nome, icone, qtd, nota = null, info, ancora }: { nome: string; icone: string; qtd: number; nota?: string | null; info: InfoItem | null; ancora: DOMRect } = $props();

	const faixa = $derived(info?.dano ? lerDados(info.dano) : null);

	// ao lado da linha: à esquerda quando cabe, senão à direita; sem lugar dos lados, embaixo (ou em cima) da linha
	const L = 320;
	let altura = $state(220);
	const lado = $derived(ancora.left - L - 12 > 8 ? ancora.left - L - 12 : ancora.right + 12 + L < innerWidth - 8 ? ancora.right + 12 : null);
	const x = $derived(lado ?? Math.max(8, Math.min(innerWidth - L - 8, ancora.left + 24)));
	const y = $derived(
		lado != null
			? Math.max(8, Math.min(innerHeight - altura - 8, ancora.top - 8))
			: ancora.bottom + 6 + altura < innerHeight - 8
				? ancora.bottom + 6
				: Math.max(8, ancora.top - altura - 6)
	);
</script>

<div role="tooltip" bind:clientHeight={altura} class="pointer-events-none fixed z-[85] flex w-[320px] max-w-[calc(100vw-16px)] flex-col border-2 border-b3 bg-b2 text-fg shadow-[6px_6px_0_var(--sombra)]" style:left="{x}px" style:top="{y}px">
	<div class="flex items-center gap-2.5 border-b-2 border-b3 px-3.5 pt-3 pb-2.5">
		<Icone id={icone} class="h-8 w-8 flex-none" />
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="font-mincho text-[18px] leading-6 font-bold">{nome}</span>
			<span class="text-xs leading-4 text-mut">{info?.tipo ?? 'Item'}</span>
		</span>
		{#if qtd > 1}<b class="self-start font-pixel text-sm">×{qtd}</b>{/if}
	</div>
	<div class="flex flex-col gap-2 px-3.5 py-2.5">
		{#if faixa && info?.dano}
			<span class="flex flex-wrap items-center gap-x-3 gap-y-1">
				<span class="font-mincho text-lg leading-6 font-bold">{faixa.min}~{faixa.max} de dano</span>
				<DadoHud expr={info.dano} tamanho={24} />
			</span>
		{/if}
		{#if info?.alcance}<span class="flex items-center gap-1 text-xs text-mut"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" class="fill-none stroke-current stroke-[1.6]"><path d="M2 14L14 2 M10 2h4v4" stroke-dasharray="2 2" /></svg>{info.alcance}</span>{/if}
		{#if info?.efeito}<p class="m-0 text-[13px] leading-[19px]">{info.efeito}</p>{/if}
		{#if info?.propriedades.length}
			<dl class="m-0 flex flex-col gap-1.5">
				{#each info.propriedades as p (p.nome)}
					<div class="flex flex-col gap-0.5">
						<dt class="self-start border border-b3 px-1.5 py-0.5 text-[11px] leading-none font-semibold">{p.nome}</dt>
						{#if p.efeito}<dd class="m-0 text-xs leading-4 text-mut">{p.efeito}</dd>{/if}
					</div>
				{/each}
			</dl>
		{/if}
		{#if nota}<span class="text-xs leading-4 text-mut italic">{nota}</span>{/if}
		{#if !info && !nota}<span class="text-xs leading-4 text-mut">Item sem descrição no livro. O Mestre diz o que ele faz.</span>{/if}
	</div>
	{#if info?.preco || info?.peso}
		<div class="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t-2 border-b3 bg-b1 px-3.5 py-2 text-xs font-semibold">
			{#if info.preco}<span class="flex items-center gap-1"><Icone id="recurso/ic-recurso-ryo" class="h-4 w-4" />{info.preco}</span>{/if}
			{#if info.peso}<span class="flex items-center gap-1"><Icone id="recurso/ic-recurso-carga" class="h-4 w-4" />{info.peso}</span>{/if}
		</div>
	{/if}
</div>
