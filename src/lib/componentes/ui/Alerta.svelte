<script lang="ts">
	// Alerta (DS 2 · B5): fundo a 12% da cor, borda na cor, ícone + título + texto + ação opcional.
	import type { Snippet } from 'svelte';
	import Icone from './Icone.svelte';

	type Tipo = 'erro' | 'aviso' | 'info' | 'sucesso';
	interface Props {
		tipo: Tipo;
		titulo?: string;
		children?: Snippet;
		acao?: Snippet;
	}
	let { tipo, titulo, children, acao }: Props = $props();

	const COR: Record<Tipo, string> = { erro: 'var(--err)', aviso: 'var(--warn)', info: 'var(--info)', sucesso: 'var(--ok)' };
	const FUNDO: Record<Tipo, string> = {
		erro: 'color-mix(in srgb, var(--err) 12%, transparent)',
		aviso: 'color-mix(in srgb, var(--warn) 12%, transparent)',
		info: 'color-mix(in srgb, var(--info) 12%, transparent)',
		sucesso: 'color-mix(in srgb, var(--ok) 12%, transparent)'
	};
	const ICONE: Record<Tipo, string> = {
		erro: 'status/ic-status-rejeitado',
		aviso: 'callout/ic-callout-atencao',
		info: 'status/ic-status-ajustes',
		sucesso: 'status/ic-status-aprovado'
	};
</script>

<div role={tipo === 'erro' ? 'alert' : 'status'} class="flex items-start gap-2.5 border-2 py-1.5 pr-3 pl-1.5" style:border-color={COR[tipo]} style:background={FUNDO[tipo]}>
	<Icone id={ICONE[tipo]} />
	<div class="flex min-w-0 flex-1 flex-col gap-1 py-1.5 text-sm leading-5">
		{#if titulo}<b class="font-semibold">{titulo}</b>{/if}
		{#if children}{@render children()}{/if}
	</div>
	{#if acao}<div class="self-center">{@render acao()}</div>{/if}
</div>
