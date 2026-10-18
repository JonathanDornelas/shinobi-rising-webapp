<script lang="ts">
	// E4 · Oficina (cap. 13): estrutura base, mecanismos nos slots, modo de manipulação e histórico.
	import { MECANISMOS, MODOS, TAMANHOS } from '#lib/equipamentos/dados.ts';
	import type { MarioneteDados } from '#lib/equipamentos/regras.ts';
	import Campo from '../ui/Campo.svelte';

	let { d = $bindable(), ro, slots }: { d: MarioneteDados; ro: boolean; slots: { usados: number; limite: number } } = $props();
	const ryo = (n: number) => `${n.toLocaleString('pt-BR')} ryo`;
	function alternar(id: string) {
		d.mecanismos = d.mecanismos.includes(id) ? d.mecanismos.filter((x) => x !== id) : [...d.mecanismos, id];
	}
</script>

<section class="flex flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">1 · ESTRUTURA BASE</span>
	<div class="grid grid-cols-2 gap-2 lg:grid-cols-4" role="radiogroup" aria-label="Estrutura">
		{#each TAMANHOS as t (t.id)}
			{@const on = d.tamanho === t.id}
			<button type="button" role="radio" aria-checked={on} disabled={ro} class="flex flex-col gap-1 border-2 p-2.5 text-left {on ? 'border-vermelhao bg-grena text-papel' : 'border-frame bg-b2'}" onclick={() => (d.tamanho = t.id)}>
				<span class="font-mincho text-base leading-[22px] font-bold">{t.nome}</span>
				<span class="text-xs leading-4 opacity-80">{t.nota}</span>
				<span class="text-xs leading-4 font-semibold">PV {t.pv} · DEF {t.defesa} · {t.ataque} · {t.slots} slots</span>
				<span class="t-num text-[13px]">{ryo(t.ryo).toUpperCase()}</span>
			</button>
		{/each}
	</div>
</section>

<section class="flex flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">2 · MECANISMOS · {slots.usados} / {slots.limite} SLOTS</span>
	<div class="grid gap-1.5 md:grid-cols-2">
		{#each MECANISMOS as m (m.id)}
			{@const on = d.mecanismos.includes(m.id)}
			{@const cabe = on || slots.usados + m.slots <= slots.limite}
			<label class="flex min-h-12 cursor-pointer items-center gap-2.5 border-2 bg-b2 px-2.5 py-1 {on ? 'border-vermelhao' : 'border-b3'}" class:opacity-50={!cabe} title={cabe ? undefined : 'Não cabe nos slots que sobram'}>
				<input type="checkbox" class="caixa h-5 w-5" checked={on} disabled={ro || !cabe} onchange={() => alternar(m.id)} />
				<span class="flex flex-1 flex-col gap-0.5"><span class="text-sm leading-[18px] font-semibold">{m.nome}</span><span class="text-xs leading-4 text-mut">{m.efeito} · +{ryo(m.ryo)}</span></span>
				<b class="t-num text-[13px]">{m.slots} SLOT{m.slots > 1 ? 'S' : ''}</b>
			</label>
		{/each}
	</div>
</section>

<section class="flex flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">3 · MODO DE MANIPULAÇÃO</span>
	<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Modo de manipulação">
		{#each MODOS as m (m.id)}
			{@const on = d.modo === m.id}
			<button type="button" role="radio" aria-checked={on} disabled={ro} title={m.efeito} class="flex min-h-11 flex-col justify-center border-2 px-3 text-left {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}" onclick={() => (d.modo = m.id)}>
				<span class="text-sm font-semibold">{m.nome}</span><span class="text-xs opacity-80">{m.efeito}</span>
			</button>
		{/each}
	</div>
	<div class="flex items-center gap-2.5 opacity-60">
		<input type="checkbox" role="switch" class="interruptor" disabled aria-label="Hitokugutsu" />
		<span class="text-sm leading-5">Hitokugutsu · exige especialização Marionete nível 3, Selamento e Ninjutsu Médico, e um arco narrativo com o Mestre (cap. 13)</span>
	</div>
</section>

<section class="flex flex-col gap-3">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">4 · NOME E HISTÓRIA</span>
	<Campo id="mar-nome" rotulo="Nome" obrigatorio><input id="mar-nome" class="campo" maxlength="60" placeholder="Karasu-Ni" readonly={ro} bind:value={d.nome} /></Campo>
	<Campo id="mar-aparencia" rotulo="Aparência"><textarea id="mar-aparencia" class="campo h-auto min-h-[56px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" readonly={ro} bind:value={d.aparencia}></textarea></Campo>
	<Campo id="mar-historico" rotulo="História" ajuda="Mestres tradicionais nomeiam marionetes como pessoas próximas."><textarea id="mar-historico" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="1200" readonly={ro} bind:value={d.historico}></textarea></Campo>
</section>
