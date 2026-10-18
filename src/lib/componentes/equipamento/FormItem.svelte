<script lang="ts">
	// E2 · Item utilitário em edição ou leitura (o modal da E1 cria; aqui se ajusta e envia).
	import { CATEGORIAS_ITEM, ICONES_ITEM, PESOS_ITEM } from '#lib/equipamentos/dados.ts';
	import type { ItemDados } from '#lib/equipamentos/regras.ts';
	import Campo from '../ui/Campo.svelte';
	import Icone from '../ui/Icone.svelte';

	let { d = $bindable(), ro }: { d: ItemDados; ro: boolean } = $props();
</script>

<div class="flex flex-col gap-3">
	<Campo id="item-nome" rotulo="Nome" obrigatorio><input id="item-nome" class="campo" maxlength="60" readonly={ro} bind:value={d.nome} /></Campo>
	<div class="flex flex-col gap-1.5">
		<span class="text-sm leading-5 font-semibold" id="item-cat">Categoria</span>
		<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="item-cat">
			{#each CATEGORIAS_ITEM as cat (cat)}
				<button type="button" role="radio" aria-checked={d.categoria === cat} disabled={ro} class="min-h-9 border-2 px-2.5 text-[13px] font-semibold {d.categoria === cat ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}" onclick={() => (d.categoria = cat)}>{cat}</button>
			{/each}
		</div>
	</div>
	<div class="grid gap-2.5 sm:grid-cols-2">
		<Campo id="item-preco" rotulo="Preço (ryo)"><input id="item-preco" class="campo" type="number" min="0" step="100" readonly={ro} bind:value={d.preco} /></Campo>
		<Campo id="item-peso" rotulo="Peso">
			<select id="item-peso" class="campo pr-8" disabled={ro} bind:value={d.peso}>
				{#each PESOS_ITEM as p (p.id)}<option value={p.id}>{p.nome} · {p.carga.toLocaleString('pt-BR')}</option>{/each}
			</select>
		</Campo>
	</div>
	<Campo id="item-efeito" rotulo="Efeito" obrigatorio><textarea id="item-efeito" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" readonly={ro} bind:value={d.efeito}></textarea></Campo>
	<Campo id="item-desc" rotulo="Descrição"><textarea id="item-desc" class="campo h-auto min-h-[56px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" readonly={ro} bind:value={d.descricao}></textarea></Campo>
	<label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-medium"><input type="checkbox" class="caixa" disabled={ro} bind:checked={d.consumivel} />Consumível pequeno (5 = 0,5 de carga)</label>
	<div class="flex flex-col gap-1.5">
		<span class="text-sm leading-5 font-semibold" id="item-icone">Ícone</span>
		<div class="flex flex-wrap gap-1" role="radiogroup" aria-labelledby="item-icone">
			{#each ICONES_ITEM as ic (ic)}
				<button type="button" role="radio" aria-checked={d.icone === ic} disabled={ro} aria-label={ic.split('/')[1]} class="flex h-[52px] w-[52px] items-center justify-center border-2 bg-b1 {d.icone === ic ? 'border-vermelhao' : 'border-b3'}" onclick={() => (d.icone = ic)}><Icone id={ic} /></button>
			{/each}
		</div>
	</div>
</div>
