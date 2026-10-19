<script lang="ts">
	// E3 · Forja (cap. 21): conceito, categoria base (cap. 12), qualidade, propriedades com PFo, forjador e histórico.
	import { COR_QUALIDADE, FORJADORES, PROPRIEDADES_FORJA, QUALIDADES } from '#lib/equipamentos/dados.ts';
	import type { ArmaBase, ArmaDados } from '#lib/equipamentos/regras.ts';
	import { ELEMENTOS } from '#lib/personagem/dados.ts';
	import Campo from '../ui/Campo.svelte';
	import Icone from '../ui/Icone.svelte';

	let { d = $bindable(), armas, ro, pfo }: { d: ArmaDados; armas: ArmaBase[]; ro: boolean; pfo: { usados: number; limite: number } } = $props();
	const base = $derived(armas.find((a) => a.slug === d.base) ?? null);
	const categorias = $derived([...new Set(armas.map((a) => a.categoria))]);
	const ryo = (n: number) => `${n.toLocaleString('pt-BR')} ryo`;

	function alternar(id: string) {
		const i = d.propriedades.findIndex((p) => p.id === id);
		if (i >= 0) d.propriedades.splice(i, 1);
		else d.propriedades.push({ id, detalhe: '' });
	}
</script>

<section id="forja-1" class="flex scroll-mt-4 flex-col gap-3">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">1 · CONCEITO E APARÊNCIA</span>
	<Campo id="arma-nome" rotulo="Nome" obrigatorio><input id="arma-nome" class="campo" maxlength="60" placeholder="Presa do Trovão" readonly={ro} bind:value={d.nome} /></Campo>
	<Campo id="arma-aparencia" rotulo="Formato, material e estilo"><textarea id="arma-aparencia" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" readonly={ro} bind:value={d.aparencia}></textarea></Campo>
</section>

<section id="forja-2" class="flex scroll-mt-4 flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">2 · CATEGORIA BASE</span>
	<select class="campo pr-8" aria-label="Arma base" disabled={ro} value={d.base ?? ''} onchange={(e) => (d.base = e.currentTarget.value || null)}>
		<option value="">Escolha uma arma do catálogo (cap. 12)…</option>
		{#each categorias as cat (cat)}
			<optgroup label={cat}>{#each armas.filter((a) => a.categoria === cat) as a (a.slug)}<option value={a.slug}>{a.nome} · {a.dano} · {ryo(a.preco)}</option>{/each}</optgroup>
		{/each}
	</select>
	{#if base}
		<div class="flex items-center gap-3 border-2 border-frame bg-b2 px-3 py-2">
			<Icone id={base.icone} />
			<span class="flex-1 text-[15px] leading-5 font-semibold">{base.nome} · {base.dano} · {base.alcance} · {base.peso}{base.propriedades.length ? ` · ${base.propriedades.join(', ')}` : ''}</span>
			<span class="t-num text-[15px]">{ryo(base.preco).toUpperCase()}</span>
		</div>
	{/if}
</section>

<section id="forja-3" class="flex scroll-mt-4 flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">3 · QUALIDADE</span>
	<div class="grid grid-cols-2 gap-2 lg:grid-cols-5" role="radiogroup" aria-label="Qualidade">
		{#each QUALIDADES as q (q.id)}
			{@const on = d.qualidade === q.id}
			<button type="button" role="radio" aria-checked={on} disabled={ro} class="flex flex-col gap-1.5 border-2 p-2.5 text-left {on ? 'border-vermelhao bg-grena text-papel shadow-[4px_4px_0_var(--vermelhao-lo)]' : 'border-frame bg-b2'}" style:border-top="6px solid {COR_QUALIDADE[q.id]}" onclick={() => (d.qualidade = q.id)}>
				<span class="font-mincho text-base leading-[22px] font-bold">{q.nome}</span>
				<span class="t-num text-[13px]">{q.pfo} PFO</span>
				<span class="text-xs leading-4 opacity-80">{q.ryo ? `+${ryo(q.ryo)} · ${q.tempo}` : 'Arma de mercado'}</span>
				<span class="text-xs leading-4 font-semibold">{q.efeito}</span>
			</button>
		{/each}
	</div>
</section>

<section id="forja-4" class="flex scroll-mt-4 flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">4 · PROPRIEDADES</span>
	<div class="grid gap-1.5 md:grid-cols-2">
		{#each PROPRIEDADES_FORJA as p (p.id)}
			{@const sel = d.propriedades.find((x) => x.id === p.id)}
			{@const naBase = !!base?.propriedades.includes(p.id)}
			<div class="flex flex-col border-2 bg-b2 {sel ? 'border-vermelhao' : 'border-b3'}" class:opacity-50={naBase && !sel}>
				<label class="flex min-h-12 cursor-pointer items-center gap-2.5 px-2.5 py-1" title={naBase ? 'Já vem na arma base' : undefined}>
					<input type="checkbox" class="caixa h-5 w-5" checked={!!sel} disabled={ro || (naBase && !sel)} onchange={() => alternar(p.id)} />
					<span class="flex flex-1 flex-col gap-0.5"><span class="text-sm leading-[18px] font-semibold">{p.id}</span><span class="text-xs leading-4 text-mut">{p.efeito}</span></span>
					<b class="t-num text-sm">{p.pfo} PFO</b>
				</label>
				{#if sel && 'detalhe' in p}
					{#if p.id === 'Elemental'}
						<select class="campo mx-2.5 mb-2 h-9 w-[calc(100%-20px)] pr-8 text-sm" aria-label="Elemento" disabled={ro} bind:value={sel.detalhe}>
							<option value="">Elemento…</option>
							{#each ELEMENTOS as e (e.id)}<option value={e.nome}>{e.nome}</option>{/each}
						</select>
					{:else}
						<input class="campo mx-2.5 mb-2 h-9 w-[calc(100%-20px)] text-sm" aria-label="{p.id}: {p.detalhe}" placeholder={p.detalhe} maxlength="60" readonly={ro} bind:value={sel.detalhe} />
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</section>

<section id="forja-5" class="flex scroll-mt-4 flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">5 · FORJADOR</span>
	<div class="flex flex-wrap self-start border-2 border-frame" role="radiogroup" aria-label="Forjador">
		{#each FORJADORES as f (f.id)}
			{@const on = d.forjador === f.id}
			<button type="button" role="radio" aria-checked={on} disabled={ro} class="flex min-h-12 flex-col justify-center gap-1 border-r-2 border-frame px-4 last:border-r-0 {on ? 'bg-vermelhao text-white' : ''}" onclick={() => (d.forjador = f.id)}>
				<span class="text-sm font-semibold">{f.nome}</span><span class="t-num text-xs">ATÉ {f.limite} PFO</span>
			</button>
		{/each}
	</div>
	{#if pfo.usados > pfo.limite}
		<div role="alert" class="flex items-center gap-2.5 border-2 border-err py-1 pr-3 pl-1 text-sm font-semibold" style:background="color-mix(in srgb, var(--err) 12%, transparent)">
			<Icone id="status/ic-status-rejeitado" />{pfo.usados} PFo excedem o limite do {FORJADORES.find((f) => f.id === d.forjador)?.nome} ({pfo.limite}).
		</div>
	{/if}
</section>

<section id="forja-6" class="flex scroll-mt-4 flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">6 · HISTÓRICO</span>
	<Campo id="arma-historico" rotulo="Por que foi forjada, quem morreu por ela, qual o propósito" obrigatorio={d.qualidade === 'mestre' || d.qualidade === 'lendaria'} ajuda="Obrigatório em armas de qualidade Mestre ou superior.">
		<textarea id="arma-historico" class="campo h-auto min-h-[88px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="1200" readonly={ro} bind:value={d.historico}></textarea>
	</Campo>
</section>
