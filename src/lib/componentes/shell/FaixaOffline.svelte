<script lang="ts">
	// Faixa fixa abaixo da navbar quando a conexão cai (DS 5 · 5.3).
	import Icone from '../ui/Icone.svelte';

	let online = $state(true);
	$effect(() => {
		online = navigator.onLine;
		const on = () => (online = true);
		const off = () => (online = false);
		addEventListener('online', on);
		addEventListener('offline', off);
		return () => {
			removeEventListener('online', on);
			removeEventListener('offline', off);
		};
	});
</script>

{#if !online}
	<div role="status" class="flex items-center gap-2.5 border-b-2 border-ink bg-warn py-1 pr-6 pl-2 text-warnfg md:pl-4">
		<Icone id="illustrations/il-offline" />
		<span class="text-sm leading-5 font-semibold">Você está offline. A página aberta continua legível; para abrir outras, aguarde a conexão voltar.</span>
	</div>
{/if}
