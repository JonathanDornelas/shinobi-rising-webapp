<script lang="ts">
	// K2 · Passo 1 · Conceito do clã (cap. 8.4, Passo 1): nome, origem, história, filosofia e tema visual com o brasão.
	import { CORES_CLA, KAMONS } from '#lib/clas/dados.ts';
	import { contarFrases } from '#lib/clas/regras.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import { VILAS } from '#lib/personagem/dados.ts';
	import Campo from '../ui/Campo.svelte';
	import Brasao from './Brasao.svelte';

	let { c }: { c: CriadorCla } = $props();
	const k = $derived(c.dados.conceito);
	const frases = $derived(contarFrases(k.historia));
	const ro = $derived(!c.editavel);
</script>

<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
	<div class="flex flex-col gap-3">
		<Campo id="cla-nome" rotulo="Nome" obrigatorio>
			<input id="cla-nome" class="campo" maxlength="40" placeholder="Kasai Joushou" readonly={ro} bind:value={c.dados.conceito.nome} />
		</Campo>
		<div class="grid gap-3 sm:grid-cols-2">
			<Campo id="cla-significado" rotulo="Significado">
				<input id="cla-significado" class="campo" maxlength="60" placeholder="Chama que Sobe" readonly={ro} bind:value={c.dados.conceito.significado} />
			</Campo>
			<Campo id="cla-vila" rotulo="Vila ou território">
				<select id="cla-vila" class="campo pr-8" disabled={ro} bind:value={c.dados.conceito.vila}>
					<option value={null}>Escolha…</option>
					{#each VILAS.filter((v) => v.id !== 'sem') as v (v.id)}<option value={v.id}>{v.nome}</option>{/each}
					<option value="nomade">Nômade (sem território fixo)</option>
				</select>
			</Campo>
		</div>
		<div class="flex flex-col gap-1.5">
			<Campo id="cla-historia" rotulo="História" ajuda="Em 2 ou 3 frases.">
				<textarea id="cla-historia" class="campo h-auto min-h-[88px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" readonly={ro} bind:value={c.dados.conceito.historia}></textarea>
			</Campo>
			<span class="self-end font-pixel text-xs font-semibold tracking-[0.06em]" style:color={frases > 3 ? 'var(--warn)' : 'var(--mut)'}>{frases} / 3 FRASES</span>
		</div>
		<Campo id="cla-filosofia" rotulo="Frase de filosofia" ajuda="Cite um membro icônico; ajuda a fixar o tom.">
			<input id="cla-filosofia" class="campo" maxlength="160" placeholder="“A chama que sobe não pede licença ao vento.”" readonly={ro} bind:value={c.dados.conceito.filosofia} />
		</Campo>
		<div class="grid gap-3 sm:grid-cols-2">
			<Campo id="cla-reputacao" rotulo="Reputação na região">
				<input id="cla-reputacao" class="campo" maxlength="80" placeholder="Temidos? Respeitados? Esquecidos?" readonly={ro} bind:value={c.dados.conceito.reputacao} />
			</Campo>
			<Campo id="cla-especialidade" rotulo="Especialização principal">
				<input id="cla-especialidade" class="campo" maxlength="80" placeholder="Combate, espionagem, medicina…" readonly={ro} bind:value={c.dados.conceito.especialidade} />
			</Campo>
		</div>
		<Campo id="cla-visual" rotulo="Tema visual" ajuda="Marca corporal, vestimenta, cores.">
			<input id="cla-visual" class="campo" maxlength="120" readonly={ro} bind:value={c.dados.conceito.visual} />
		</Campo>
		<div class="flex flex-col gap-1.5">
			<span class="text-sm leading-5 font-semibold" id="cla-cores">Cores do clã</span>
			<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="cla-cores">
				{#each CORES_CLA as cor (cor)}
					<button
						type="button"
						role="radio"
						aria-checked={k.cor === cor}
						aria-label="Cor {cor}"
						disabled={ro}
						class="h-10 w-10 border-2 border-ink outline-offset-2"
						style:background={cor}
						style:outline={k.cor === cor ? '2px solid var(--focus)' : 'none'}
						onclick={() => (c.dados.conceito.cor = cor)}
					></button>
				{/each}
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2">
		<span class="text-sm leading-5 font-semibold" id="cla-brasao">Brasão</span>
		<div class="flex h-32 w-32 items-center justify-center border-2 border-vermelhao bg-b2"><Brasao kamon={k.kamon} cor={k.cor} tamanho={96} alt="Brasão do clã" /></div>
		<div class="grid grid-cols-[repeat(4,44px)] gap-1" role="radiogroup" aria-labelledby="cla-brasao">
			{#each KAMONS as n (n)}
				<button
					type="button"
					role="radio"
					aria-checked={k.kamon === n}
					aria-label="Base {n}"
					disabled={ro}
					class="flex h-11 w-11 items-center justify-center border-2 bg-b1 p-0 {k.kamon === n ? 'border-vermelhao' : 'border-b3 hover:border-mut'}"
					onclick={() => (c.dados.conceito.kamon = n)}
				>
					<Brasao kamon={n} cor="var(--fg)" />
				</button>
			{/each}
		</div>
	</div>
</div>
