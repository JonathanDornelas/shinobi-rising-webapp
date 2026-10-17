<script lang="ts">
	// Drawer lateral (sumário no tablet e no mobile).
	import type { Snippet } from 'svelte';
	import { prenderFoco } from './foco';

	interface Props {
		rotulo: string;
		aoFechar: () => void;
		children: Snippet;
	}
	let { rotulo, aoFechar, children }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 bg-[rgba(14,11,10,.6)]"
	role="presentation"
	onclick={(e) => e.target === e.currentTarget && aoFechar()}
>
	<div
		role="dialog"
		aria-modal="true"
		aria-label={rotulo}
		tabindex="-1"
		class="absolute top-0 bottom-0 left-0 flex w-[min(340px,88vw)] flex-col border-r-2 border-[#8B2E20] bg-b2 shadow-[8px_0_0_#000] outline-none"
		{@attach prenderFoco(aoFechar)}
	>
		<div class="flex items-center py-2 pr-2 pl-4">
			<span class="t-rotulo flex-1">{rotulo}</span>
			<button class="flex h-11 w-11 items-center justify-center" aria-label="Fechar" onclick={aoFechar}>
				<svg width="20" height="20" viewBox="0 0 24 24" class="fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d="M18 6 6 18M6 6l12 12" /></svg>
			</button>
		</div>
		<div class="min-h-0 flex-1 overflow-y-auto pb-4">
			{@render children()}
		</div>
	</div>
</div>
