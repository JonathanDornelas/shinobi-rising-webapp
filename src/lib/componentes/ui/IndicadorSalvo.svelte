<script lang="ts" module>
	export type EstadoSalvo = { tipo: 'ocioso' } | { tipo: 'salvando' } | { tipo: 'salvo'; em: number } | { tipo: 'erro'; texto?: string };
</script>

<script lang="ts">
	// Indicador de salvamento por seção (A4/C7): "Salvando…", "Salvo há 5 s", "Não foi possível salvar".
	import { onDestroy } from 'svelte';
	import Icone from './Icone.svelte';

	let { estado }: { estado: EstadoSalvo } = $props();
	let agora = $state(Date.now());
	const relogio = setInterval(() => (agora = Date.now()), 1000);
	onDestroy(() => clearInterval(relogio));

	function ha(ms: number) {
		const s = Math.max(0, Math.round(ms / 1000));
		if (s < 60) return `${s} s`;
		return `${Math.round(s / 60)} min`;
	}
</script>

<span class="flex items-center gap-1 text-[13px] leading-[18px] font-medium" aria-live="polite">
	{#if estado.tipo === 'salvando'}
		<span class="text-mut">Salvando…</span>
	{:else if estado.tipo === 'salvo'}
		<Icone id="status/ic-status-aprovado" />Salvo há {ha(agora - estado.em)}
	{:else if estado.tipo === 'erro'}
		<Icone id="status/ic-status-rejeitado" /><span class="text-err">{estado.texto ?? 'Não foi possível salvar.'}</span>
	{/if}
</span>
