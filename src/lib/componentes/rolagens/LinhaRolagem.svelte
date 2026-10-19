<script lang="ts">
	// Uma rolagem no registro: personagem (ou NPC) e quem rolou, o quê, a conta, a hora e o total (crítico e falha em destaque).
	import { conta, destaque } from '#lib/rolagens/expressoes.ts';
	import { hora } from '#lib/formatar.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';

	let { r, aoApagar, compacto = false }: { r: Rolagem; aoApagar?: () => void; compacto?: boolean } = $props();
	const d = $derived(destaque(r));
	const MODO = { normal: '', vantagem: 'Vantagem', desvantagem: 'Desvantagem', critico: 'Crítico (dados dobrados)' } as const;
	// "Ren Uchiha · Bruno"; numa rolagem livre o personagem é o próprio jogador
	const jogador = $derived(r.jogador && r.jogador !== r.quem ? r.jogador : null);
</script>

<li class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b-2 border-b3 last:border-b-0 {compacto ? 'px-3 py-2' : 'px-3.5 py-2.5'}">
	<div class="flex min-w-0 flex-col gap-0.5">
		<span class="flex flex-wrap items-baseline gap-x-1.5 leading-5 {compacto ? 'text-sm' : 'text-[15px]'}">
			<b class="font-semibold">{r.quem}</b>
			{#if r.npc_id}<span class="border-2 border-b3 px-1 font-pixel text-[10px] leading-3 font-bold text-mut">NPC</span>{/if}
			{#if jogador}<span class="text-xs text-mut">· {jogador}</span>{/if}
			<span class="min-w-0 truncate">{r.rotulo}</span>
		</span>
		<span class="flex flex-wrap items-center gap-1.5 text-xs leading-4 text-mut">
			<span class="font-pixel">{r.expressao}</span>
			<span>·</span><span>{conta(r.detalhe)}</span>
			{#if MODO[r.modo]}<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold uppercase">{MODO[r.modo]}</span>{/if}
			{#if r.oculta}<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold uppercase" title="Só quem rolou e o Mestre veem">Oculta</span>{/if}
			<span>·</span><time datetime={r.criada_em}>{hora(r.criada_em)}</time>
		</span>
	</div>
	<div class="flex items-center gap-2">
		{#if d === 'critico'}<span class="bg-acc px-1.5 py-1 font-pixel text-xs leading-none font-bold text-accfg">CRÍTICO</span>{:else if d === 'falha'}<span class="bg-err px-1.5 py-1 font-pixel text-xs leading-none font-bold text-errfg">FALHA</span>{/if}
		<span class="t-num text-right leading-none {compacto ? 'min-w-9 text-[22px]' : 'min-w-12 text-[28px]'}" style:color={d === 'critico' ? 'var(--acc)' : d === 'falha' ? 'var(--err)' : undefined}>{r.total}</span>
		{#if aoApagar}
			<button type="button" class="btn-icone h-8 w-8 text-mut" aria-label="Apagar a rolagem" title="Apagar a rolagem" onclick={aoApagar}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
			</button>
		{/if}
	</div>
</li>
