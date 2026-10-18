<script lang="ts">
	// Passo 8 · Recursos: somente leitura, com a conta de cada valor (cap. 6, Passo 8).
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { sinal } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';

	let { c }: { c: Criador } = $props();
	const r = $derived(c.recursos);
	const linhas = $derived([
		{ icone: 'recurso/ic-recurso-pv', rotulo: 'PV', conta: r.formulas.pv, valor: String(r.pv) },
		{ icone: 'recurso/ic-recurso-pe', rotulo: 'PE', conta: r.formulas.pe, valor: String(r.pe) },
		{ icone: 'recurso/ic-recurso-pc', rotulo: 'PC', conta: r.formulas.pc, valor: String(r.pc) },
		{ icone: 'recurso/ic-recurso-iniciativa', rotulo: 'INICIATIVA', conta: r.formulas.iniciativa, valor: `1d20 ${sinal(r.iniciativa)}` },
		{ icone: 'recurso/ic-recurso-defesa', rotulo: 'DEFESA', conta: r.formulas.defesa, valor: String(r.defesa) },
		{ icone: 'recurso/ic-recurso-defesa-mental', rotulo: 'DEFESA MENTAL', conta: r.formulas.defesaMental, valor: String(r.defesaMental) },
		{ icone: 'recurso/ic-recurso-pd', rotulo: 'PD', conta: r.formulas.pd, valor: '1' },
		{ icone: 'recurso/ic-recurso-carga', rotulo: 'CARGA MÁXIMA', conta: r.formulas.carga, valor: String(r.cargaMax) }
	]);
</script>

<dl class="painel m-0">
	{#each linhas as l (l.rotulo)}
		<div class="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-3 border-b-2 border-b3 px-3.5 py-2 last:border-b-0 md:grid-cols-[32px_170px_minmax(0,1fr)_90px]">
			<Icone id={l.icone} />
			<dt class="font-pixel text-sm leading-none font-bold tracking-[0.04em]">{l.rotulo}</dt>
			<dd class="m-0 text-sm leading-5 text-mut max-md:col-span-2 max-md:col-start-2 max-md:row-start-2">{l.conta}</dd>
			<dd class="t-num m-0 text-right text-[22px] leading-none max-md:row-start-1">{l.valor}</dd>
		</div>
	{/each}
</dl>
<p class="m-0 text-[13px] leading-[18px] text-mut">Somente leitura. Mude atributos, perícias, vila, clã ou especialização nos passos anteriores; atributos negativos não reduzem os recursos.</p>
