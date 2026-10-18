<script lang="ts">
	// C2 passo 3 / C7 Aprovação: o que exige o aval do Mestre. Clãs e jutsus criados sempre exigem.
	import { APROVACOES, type DadosCampanha } from '#lib/campanhas/dominio.ts';
	import type { Aprovacao } from '#lib/supabase/banco.ts';

	let { dados = $bindable() }: { dados: DadosCampanha } = $props();
</script>

<div class="flex flex-col">
	<span class="t-rotulo mb-2.5">O que exige aprovação</span>
	{#each APROVACOES as a (a.id)}
		<label class="flex min-h-12 items-center gap-3 border-b-2 border-b3 py-1 {a.travado ? '' : 'cursor-pointer'}">
			<span class="flex flex-1 flex-col">
				<span class="text-[15px] leading-5 font-medium">{a.nome}</span>
				{#if a.nota}<span class="text-xs leading-4 text-mut">{a.nota}</span>{/if}
			</span>
			{#if a.travado}
				<span title="Sempre exige aprovação" class="flex text-mut">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
						<rect x="5" y="11" width="14" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
					</svg>
				</span>
				<input type="checkbox" role="switch" class="interruptor opacity-60" checked disabled aria-describedby="trava-{a.id}" />
				<span id="trava-{a.id}" class="sr-only">Sempre exige aprovação</span>
			{:else}
				{@const chave = a.id as keyof Aprovacao}
				<input type="checkbox" role="switch" class="interruptor" bind:checked={dados.aprovacao[chave]} />
			{/if}
		</label>
	{/each}
</div>
