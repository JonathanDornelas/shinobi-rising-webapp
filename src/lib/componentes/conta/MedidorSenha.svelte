<script lang="ts">
	// Medidor de força da senha (A2): 4 segmentos, cor por nível, texto sempre junto da cor.
	import { forcaSenha } from '#lib/conta/regras.ts';

	let { senha, id }: { senha: string; id?: string } = $props();
	const forca = $derived(forcaSenha(senha));
	const cor = $derived(forca.nivel <= 2 ? 'var(--err)' : forca.nivel === 3 ? 'var(--warn)' : 'var(--ok)');
</script>

<div class="mt-1 flex gap-1" aria-hidden="true">
	{#each [1, 2, 3, 4] as n (n)}
		<div class="h-2.5 flex-1 border-2 border-ink" style:background={forca.nivel >= n ? cor : 'var(--b3)'}></div>
	{/each}
</div>
<span {id} class="text-[13px] leading-[18px] {forca.nivel ? 'font-semibold' : 'text-mut'}" aria-live="polite">
	{#if forca.nivel}Força: {forca.rotulo} · {forca.dica}{:else}{forca.dica}{/if}
</span>
