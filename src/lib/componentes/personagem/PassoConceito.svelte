<script lang="ts">
	// Passo 1 · Conceito: nome, idade, origem, conceito curto e aparência.
	import { rankSugerido } from '#lib/campanhas/dominio.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import Campo from '../ui/Campo.svelte';
	import Retrato from '../ui/Retrato.svelte';

	let { c }: { c: Criador } = $props();
	const f = $derived(c.ficha.conceito);
	const EXEMPLOS = ['a herdeira do clã que quer ser reconhecida', 'o órfão que sonha ser Hokage', 'o renegado que perdeu sua vila'];
</script>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
	<div class="flex flex-col gap-3.5">
		<Campo id="pc-nome" rotulo="Nome" obrigatorio>
			<input id="pc-nome" class="campo" maxlength="60" autocomplete="off" placeholder="Hana Nara" disabled={!c.editavel} bind:value={c.ficha.conceito.nome} />
		</Campo>
		<div class="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
			<Campo id="pc-idade" rotulo="Idade">
				<input id="pc-idade" type="number" min="6" max="120" inputmode="numeric" class="campo t-num" disabled={!c.editavel} bind:value={c.ficha.conceito.idade} />
			</Campo>
			<Campo id="pc-origem" rotulo="Origem">
				<input id="pc-origem" class="campo" maxlength="80" placeholder="Distrito Nara, Konohagakure" disabled={!c.editavel} bind:value={c.ficha.conceito.origem} />
			</Campo>
		</div>
		<div class="flex flex-col gap-1.5">
			<Campo id="pc-conceito" rotulo="Conceito curto">
				<input id="pc-conceito" class="campo" maxlength="120" placeholder="Estrategista preguiçosa que lê tudo antes de agir" disabled={!c.editavel} bind:value={c.ficha.conceito.conceito} />
			</Campo>
			<div class="flex flex-wrap items-center gap-1.5">
				<span class="text-xs leading-4 font-semibold text-mut">Exemplos do livro:</span>
				{#each EXEMPLOS as e (e)}
					<button type="button" class="border-2 border-b3 px-[7px] py-[5px] text-xs leading-none font-semibold hover:border-mut" disabled={!c.editavel} onclick={() => (c.ficha.conceito.conceito = e)}>{e}</button>
				{/each}
			</div>
		</div>
		<Campo id="pc-aparencia" rotulo="Aparência">
			<textarea id="pc-aparencia" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" placeholder="Cabelo preso no alto, colete herdado do tio…" disabled={!c.editavel} bind:value={c.ficha.conceito.aparencia}></textarea>
		</Campo>
	</div>
	<div class="flex flex-col gap-2">
		<span class="text-sm leading-5 font-semibold">Retrato</span>
		<Retrato nome={f.nome || '?'} tamanho={128} />
		<span class="text-xs leading-4 text-mut">Os retratos (avatar-01…24) chegam em breve; por enquanto aparecem as iniciais.</span>
		<div class="mt-2 border-2 border-dashed border-b3 bg-b2 p-2 text-[13px] leading-[18px] font-semibold">
			Nível 1 · {rankSugerido(1)}<br /><span class="font-normal text-mut">
				{#if c.ctx.nivelInicial > 1}A campanha começa no nível {c.ctx.nivelInicial}: depois da aprovação, a ficha sobe de nível pelo fluxo de Subir de nível.{:else}definido pela campanha{/if}
			</span>
		</div>
	</div>
</div>
