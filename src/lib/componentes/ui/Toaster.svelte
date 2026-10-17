<script lang="ts">
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import Icone from './Icone.svelte';

	import type { TipoToast } from '#lib/estado/toasts.svelte.ts';
	const BORDA: Record<TipoToast, string> = { info: 'var(--frame)', sucesso: 'var(--ok)', aviso: 'var(--warn)', erro: 'var(--err)' };
</script>

<div
	class="pointer-events-none fixed right-4 bottom-[80px] left-4 z-[60] flex flex-col items-end gap-2 md:bottom-6 md:left-auto md:w-[420px]"
	aria-live="polite"
	role="status"
>
	{#each toasts.lista as t (t.id)}
		<div
			class="sombra-painel pointer-events-auto flex w-full items-center gap-2.5 border-2 bg-b2 py-2 pr-2 pl-2.5"
			style:border-color={BORDA[t.tipo]}
			style:animation="surgir 200ms ease-out"
		>
			<Icone id={t.icone} />
			<span class="flex-1 text-sm leading-5 font-medium">{t.texto}</span>
			<button class="flex h-9 w-9 items-center justify-center text-mut hover:text-fg" aria-label="Fechar aviso" onclick={() => toasts.fechar(t.id)}>
				<svg width="16" height="16" viewBox="0 0 24 24" class="fill-none stroke-current stroke-[2.5] [stroke-linecap:square]"><path d="M18 6 6 18M6 6l12 12" /></svg>
			</button>
		</div>
	{/each}
</div>
