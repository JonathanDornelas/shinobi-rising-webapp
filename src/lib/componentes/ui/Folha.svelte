<script lang="ts">
	// Bottom sheet (DS 2 · B4) para o mobile.
	import type { Snippet } from 'svelte';
	import { prenderFoco } from './foco';

	interface Props {
		rotulo: string;
		aoFechar: () => void;
		/** Altura fixa a partir do topo (ex.: 120px); sem valor, a altura é automática. */
		topo?: string;
		children: Snippet;
		rodape?: Snippet;
	}
	let { rotulo, aoFechar, topo, children, rodape }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 bg-[rgba(14,11,10,.72)]"
	role="presentation"
	onclick={(e) => e.target === e.currentTarget && aoFechar()}
>
	<div
		role="dialog"
		aria-modal="true"
		aria-label={rotulo}
		tabindex="-1"
		class="absolute right-0 bottom-0 left-0 flex max-h-[88vh] flex-col border-t-2 border-[#8B2E20] bg-b2 shadow-[0_-6px_0_#000] outline-none"
		style:top={topo}
		style:animation="subir 200ms ease-out"
		{@attach prenderFoco(aoFechar)}
	>
		<button class="flex justify-center pt-2.5 pb-1" aria-label="Fechar" onclick={aoFechar}>
			<span class="block h-1.5 w-12 bg-b3"></span>
		</button>
		<div class="min-h-0 flex-1 overflow-y-auto pb-3">
			{@render children()}
		</div>
		{#if rodape}
			<div class="border-t-2 border-ink px-4 py-2.5">{@render rodape()}</div>
		{/if}
	</div>
</div>
