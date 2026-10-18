<script lang="ts">
	// Aviso de rolagem no canto inferior esquerdo: o dado gira enquanto o servidor sorteia, depois mostra o total.
	// Também assina as rolagens da campanha ao vivo, para a mesa ver as rolagens umas das outras.
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { conta, destaque } from '#lib/rolagens/expressoes.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import DadoGirando from './DadoGirando.svelte';

	let { campanha }: { campanha: string } = $props();
	const r = $derived(rolador.aviso);
	const d = $derived(r ? destaque(r) : null);
	const MODO = { normal: '', vantagem: 'VANTAGEM', desvantagem: 'DESVANTAGEM', critico: 'CRÍTICO · DADOS DOBRADOS' } as const;

	$effect(() => {
		const eu = sessao.usuario?.id;
		if (!eu) return;
		const canal = supabase()
			.channel(`rolagens:${campanha}`)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rolagens', filter: `campanha_id=eq.${campanha}` }, (p) => {
				const nova = p.new as Rolagem;
				rolador.receber(nova, nova.autor_id !== eu);
			})
			.subscribe();
		return () => {
			supabase().removeChannel(canal);
		};
	});
</script>

{#if rolador.rolando || r}
	<div
		role="status"
		aria-live="polite"
		class="fixed right-4 bottom-20 left-4 z-[55] flex items-center gap-3 border-2 border-frame bg-b2 py-2 pr-2 pl-2 sombra-painel md:right-auto md:bottom-6 md:left-6 md:w-[400px]"
		style:border-color={d === 'critico' ? 'var(--acc)' : d === 'falha' ? 'var(--err)' : undefined}
	>
		<DadoGirando girando={!!rolador.rolando} />
		{#if rolador.rolando}
			<span class="flex-1 text-[15px] leading-5 font-semibold">Rolando {rolador.rolando}…</span>
		{:else if r}
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<span class="truncate text-[15px] leading-5"><b class="font-semibold">{r.quem}</b> · {r.rotulo}</span>
				<span class="truncate text-xs leading-4 text-mut">{r.expressao} · {conta(r.detalhe)}</span>
				{#if MODO[r.modo] || r.oculta || d}
					<span class="flex flex-wrap gap-1.5 font-pixel text-[11px] leading-none font-bold">
						{#if d === 'critico'}<span class="bg-acc px-1 py-0.5 text-accfg">20 NATURAL · CRÍTICO</span>{:else if d === 'falha'}<span class="bg-err px-1 py-0.5 text-errfg">1 NATURAL · FALHA</span>{/if}
						{#if MODO[r.modo]}<span class="border-2 border-b3 px-1 py-px">{MODO[r.modo]}</span>{/if}
						{#if r.oculta}<span class="border-2 border-b3 px-1 py-px">OCULTA</span>{/if}
					</span>
				{/if}
			</div>
			<span class="t-num text-[40px] leading-none" style:color={d === 'critico' ? 'var(--acc)' : d === 'falha' ? 'var(--err)' : undefined}>{r.total}</span>
			<button type="button" class="btn-icone h-9 w-9 self-start text-mut" aria-label="Fechar" onclick={() => rolador.dispensar()}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
			</button>
		{/if}
	</div>
{/if}
