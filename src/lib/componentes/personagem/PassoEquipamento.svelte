<script lang="ts">
	// Passo 10 · Equipamento: Pacote A, Pacote B com mini loja (14.000 ryo) ou o pacote de marionetista (cap. 6 e 11).
	import { ESPECIALIZACOES, PACOTES, type Pacote } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { numero } from '#lib/formatar.ts';
	import Icone from '../ui/Icone.svelte';
	import Opcao from './Opcao.svelte';

	let { c }: { c: Criador } = $props();
	const marionetista = $derived(!!(c.ficha.especializacao && ESPECIALIZACOES[c.ficha.especializacao]?.pacoteMarionete));
	const OPCOES: { id: Pacote; icone: string; preco: string }[] = [
		{ id: 'A', icone: 'equip/ic-equip-kit', preco: '1.000 RYO' },
		{ id: 'B', icone: 'recurso/ic-recurso-ryo', preco: '14.000 RYO' },
		{ id: 'marionetista', icone: 'item/ic-item-kit-marionetista', preco: 'KIT' }
	];
	const motivo = (p: Pacote) =>
		!c.ctx.pacotes.includes(p) ? 'Pacote não liberado nesta campanha' : p === 'marionetista' && !marionetista ? 'Só com a especialização Marionete' : '';
	const grupos = $derived([...new Set(c.catalogo.loja.map((i) => i.grupo))]);
	const qtd = (id: string) => c.ficha.equipamento.compras.find((x) => x.id === id)?.qtd ?? 0;
	function comprar(id: string, delta: number) {
		const atual = qtd(id);
		const nova = Math.max(0, atual + delta);
		const resto = c.ficha.equipamento.compras.filter((x) => x.id !== id);
		c.ficha.equipamento.compras = nova ? [...resto, { id, qtd: nova }] : resto;
	}
	let filtro = $state('');
	const r = $derived(c.recursos);
	const ocupacao = $derived(Math.min(100, (r.carga / r.cargaMax) * 100));
</script>

<div role="radiogroup" aria-label="Pacote de equipamento" class="grid gap-3 md:grid-cols-3">
	{#each OPCOES as o (o.id)}
		{@const p = PACOTES[o.id]}
		<Opcao rotulo={p.nome} selecionado={c.ficha.equipamento.pacote === o.id} desabilitado={motivo(o.id)} somenteLeitura={!c.editavel} class="p-3.5" aoEscolher={() => (c.ficha.equipamento = { pacote: o.id, compras: o.id === 'B' ? c.ficha.equipamento.compras : [] })}>
			<div class="flex items-center gap-2">
				<Icone id={o.icone} /><span class="flex-1 font-mincho text-lg leading-6 font-bold">{p.nome}</span><span class="t-num text-[15px]">{o.preco}</span>
			</div>
			<span class="text-[13px] leading-[19px] text-mut">{p.itens.join(', ')}.</span>
			{#if motivo(o.id)}<span class="text-xs leading-4 font-semibold">{motivo(o.id)}</span>{/if}
		</Opcao>
	{/each}
</div>

{#if c.ficha.equipamento.pacote === 'B'}
	<section class="painel flex flex-col gap-2.5 p-3" aria-label="Mini loja">
		<span class="t-rotulo">Mini loja · 14.000 ryo</span>
		<div class="flex flex-wrap gap-3 text-sm leading-5 font-semibold">
			<span class="flex-1" style:color={r.ryo < 0 ? 'var(--err)' : undefined}>Ryo: {numero(r.ryo)} {r.ryo < 0 ? 'acima do orçamento' : 'restantes'}</span>
			<span style:color={r.carga > r.cargaMax ? 'var(--warn)' : undefined}>Carga: {numero(r.carga)} / {r.cargaMax}</span>
		</div>
		<div class="h-3 border-2 border-ink bg-b3" aria-hidden="true"><div class="h-full" style:width="{ocupacao}%" style:background={r.carga > r.cargaMax ? 'var(--warn)' : 'var(--acc)'}></div></div>
		<input class="campo h-10 text-[15px]" placeholder="Filtrar itens…" aria-label="Filtrar itens" bind:value={filtro} />
		{#each grupos as g (g)}
			{@const itens = c.catalogo.loja.filter((i) => i.grupo === g && i.nome.toLowerCase().includes(filtro.trim().toLowerCase()))}
			{#if itens.length}
				<span class="mt-1 font-pixel text-xs font-bold tracking-[0.08em] text-mut uppercase">{g}</span>
				<ul class="m-0 flex list-none flex-col p-0">
					{#each itens as i (i.id)}
						{@const n = qtd(i.id)}
						<li class="flex items-center gap-2 border-b-2 border-b3 py-1 last:border-b-0">
							<Icone id={i.icone} />
							<span class="flex min-w-0 flex-1 flex-col">
								<span class="text-sm leading-5 font-medium">{i.nome}</span>
								<span class="text-xs leading-4 text-mut">{numero(i.preco)} ryo{i.conjunto ? ` · 0,5 de carga a cada ${i.conjunto}` : ` · ${String(i.peso).replace('.', ',')} de carga`}</span>
							</span>
							<button type="button" class="btn-icone h-9 w-9 font-pixel text-lg font-bold" aria-label="Menos {i.nome}" disabled={!c.editavel || n <= 0} onclick={() => comprar(i.id, -1)}>−</button>
							<span class="t-num w-8 text-center">{n}</span>
							<button type="button" class="btn-icone h-9 w-9 font-pixel text-lg font-bold" aria-label="Mais {i.nome}" disabled={!c.editavel || i.preco > r.ryo} onclick={() => comprar(i.id, 1)}>+</button>
						</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</section>
{:else if c.ficha.equipamento.pacote}
	<p class="m-0 text-sm text-mut">Carga do pacote: {numero(r.carga)} de {r.cargaMax}. Ryo no bolso: {numero(r.ryo)}.</p>
{/if}
