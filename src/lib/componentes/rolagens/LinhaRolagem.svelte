<script lang="ts">
	// Uma rolagem no registro: quem, o quê, a conta e o total (com crítico e falha crítica em destaque).
	import { conta, destaque } from '#lib/rolagens/expressoes.ts';
	import { tempoRelativo } from '#lib/formatar.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';

	let { r, aoApagar }: { r: Rolagem; aoApagar?: () => void } = $props();
	const d = $derived(destaque(r));
	const MODO = { normal: '', vantagem: 'Vantagem', desvantagem: 'Desvantagem', critico: 'Crítico (dados dobrados)' } as const;
</script>

<li class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b-2 border-b3 px-3.5 py-2.5 last:border-b-0">
	<div class="flex min-w-0 flex-col gap-0.5">
		<span class="flex flex-wrap items-baseline gap-x-2 text-[15px] leading-5">
			<b class="font-semibold">{r.quem}</b><span class="min-w-0 truncate">{r.rotulo}</span>
		</span>
		<span class="flex flex-wrap items-center gap-1.5 text-xs leading-4 text-mut">
			<span class="font-pixel">{r.expressao}</span>
			<span>·</span><span>{conta(r.detalhe)}</span>
			{#if MODO[r.modo]}<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold uppercase">{MODO[r.modo]}</span>{/if}
			{#if r.oculta}<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold uppercase" title="Só você e o Mestre veem">Oculta</span>{/if}
			<span>·</span><span>{tempoRelativo(r.criada_em)}</span>
		</span>
	</div>
	<div class="flex items-center gap-2">
		{#if d === 'critico'}<span class="bg-acc px-1.5 py-1 font-pixel text-xs leading-none font-bold text-ink">CRÍTICO</span>{:else if d === 'falha'}<span class="bg-err px-1.5 py-1 font-pixel text-xs leading-none font-bold text-errfg">FALHA</span>{/if}
		<span class="t-num min-w-12 text-right text-[28px] leading-none" style:color={d === 'critico' ? 'var(--acc)' : d === 'falha' ? 'var(--err)' : undefined}>{r.total}</span>
		{#if aoApagar}
			<button type="button" class="btn-icone h-8 w-8 text-mut" aria-label="Apagar a rolagem" title="Apagar a rolagem" onclick={aoApagar}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
			</button>
		{/if}
	</div>
</li>
