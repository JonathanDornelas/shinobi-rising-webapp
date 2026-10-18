<script lang="ts">
	// K2 · Passo 10 · Obrigação de clã (Componente 9): o preço social de pertencer. Pelo menos 1, do livro ou própria.
	import { OBRIGACOES } from '#lib/clas/dados.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import Campo from '../ui/Campo.svelte';

	let { c }: { c: CriadorCla } = $props();
	const ro = $derived(!c.editavel);
	function alternar(o: string) {
		const l = c.dados.obrigacoes;
		c.dados.obrigacoes = l.includes(o) ? l.filter((x) => x !== o) : [...l, o];
	}
</script>

<p class="m-0 text-[15px] leading-[23px]">Obrigatório escolher pelo menos 1 das 8 do livro ou escrever a sua.</p>
<div class="border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]">
	{#each OBRIGACOES as o (o)}
		<label class="flex min-h-11 cursor-pointer items-center gap-3 border-b-2 border-b3 px-3.5 text-[15px] leading-[22px] font-medium">
			<input type="checkbox" class="caixa h-5 w-5" checked={c.dados.obrigacoes.includes(o)} disabled={ro} onchange={() => alternar(o)} />{o}
		</label>
	{/each}
</div>
<Campo id="obr-propria" rotulo="Obrigação própria">
	<input id="obr-propria" class="campo" maxlength="160" placeholder="Forjar armas para a vila sem cobrar em tempos de guerra" readonly={ro} bind:value={c.dados.obrigacaoPropria} />
</Campo>
