<script lang="ts">
	// Campo de senha com botão de mostrar/ocultar (A1–A4).
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'value'> {
		id: string;
		valor: string;
		invalido?: boolean;
		altura?: 44 | 48;
	}
	let { id, valor = $bindable(''), invalido = false, altura = 48, ...resto }: Props = $props();
	let visivel = $state(false);
</script>

<div class="campo flex p-0" style:height="{altura}px" style:border-color={invalido ? 'var(--err)' : undefined}>
	<input
		{id}
		type={visivel ? 'text' : 'password'}
		bind:value={valor}
		aria-invalid={invalido || undefined}
		class="min-w-0 flex-1 bg-transparent px-3 text-base text-fg outline-none placeholder:text-mut"
		{...resto}
	/>
	<button
		type="button"
		class="flex w-12 flex-none items-center justify-center border-l-2 border-b3 text-fg"
		aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
		aria-pressed={visivel}
		onclick={() => (visivel = !visivel)}
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
			<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
			{#if visivel}<path d="M3 3l18 18" />{:else}<circle cx="12" cy="12" r="3" />{/if}
		</svg>
	</button>
</div>
