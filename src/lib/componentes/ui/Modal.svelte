<script lang="ts">
	// Modal (DS 2 · B4): moldura grená, sombra dura de 8px, Esc fecha. No mobile ocupa a tela.
	import type { Snippet } from 'svelte';
	import { prenderFoco } from './foco';

	interface Props {
		rotulo: string;
		aoFechar: () => void;
		largura?: number;
		topo?: number;
		children: Snippet;
	}
	let { rotulo, aoFechar, largura = 640, topo = 72, children }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[rgba(14,11,10,.78)] md:px-4 md:pb-10"
	style="padding-top: var(--topo)"
	style:--topo="{topo}px"
	role="presentation"
	onclick={(e) => e.target === e.currentTarget && aoFechar()}
	style:animation="surgir 200ms ease-out"
>
	<div
		role="dialog"
		aria-modal="true"
		aria-label={rotulo}
		tabindex="-1"
		class="camada modal-caixa self-start outline-none"
		style:--largura="{largura}px"
		{@attach prenderFoco(aoFechar)}
	>
		{@render children()}
	</div>
</div>

<style>
	.modal-caixa {
		width: min(var(--largura), 100%);
	}
	@media (max-width: 767px) {
		div[role='presentation'] {
			padding-top: 0 !important;
		}
		.modal-caixa {
			width: 100%;
			min-height: 100%;
			border: 0;
			box-shadow: none;
		}
	}
</style>
