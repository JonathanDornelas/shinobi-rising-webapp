<script lang="ts">
	// E2 · Novo item utilitário: nome, categoria, preço, peso, efeito, consumível e ícone. Salva o rascunho ou envia.
	import { goto } from '$app/navigation';
	import { CATEGORIAS_ITEM, ICONES_ITEM, PESOS_ITEM } from '#lib/equipamentos/dados.ts';
	import { analisarItem, itemVazio, resumoEquipamento } from '#lib/equipamentos/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json } from '#lib/supabase/banco.ts';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';

	let { campanha, eu, direto, aoFechar }: { campanha: string; eu: string; direto: boolean; aoFechar: () => void } = $props();
	const d = $state(itemVazio());
	let ocupado = $state(false);
	let tentou = $state(false);
	const analise = $derived(analisarItem(d));

	async function salvar(enviar: boolean) {
		tentou = true;
		if (!d.nome.trim() || (enviar && analise.bloqueios)) return;
		ocupado = true;
		const dados = $state.snapshot(d);
		const r = resumoEquipamento('item', dados);
		const { data, error } = await supabase()
			.from('equipamentos_criados')
			.insert({ campanha_id: campanha, autor_id: eu, tipo: 'item', nome: dados.nome.trim(), custo: r.custo, dados: dados as unknown as Json, resumo: r as unknown as Json })
			.select('id')
			.single();
		if (error || !data) {
			ocupado = false;
			return toasts.mostrar('Não foi possível salvar o item.', 'erro');
		}
		if (enviar) {
			const { data: st, error: e2 } = await supabase().rpc('enviar_equipamento', { equipamento: data.id });
			if (e2) toasts.mostrar('Salvo como rascunho; o envio falhou.', 'erro', 6000);
			else toasts.mostrar(st === 'aprovado' ? 'Item aprovado: já está na loja da campanha.' : 'Item enviado ao Mestre.', 'sucesso');
		} else toasts.mostrar('Rascunho salvo.', 'info');
		ocupado = false;
		await goto(`/campanhas/${campanha}/equipamentos/${data.id}`, { refreshAll: true });
	}
</script>

<Modal rotulo="Novo item" largura={820} topo={80} aoFechar={() => !ocupado && aoFechar()}>
	<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">Novo item</h2></div>
	<div class="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_240px]">
		<div class="flex flex-col gap-3">
			<Campo id="item-nome" rotulo="Nome" obrigatorio erro={tentou && !d.nome.trim() ? 'Dê um nome ao item.' : null}>
				<input id="item-nome" class="campo" maxlength="60" placeholder="Pó de Brasa" bind:value={d.nome} />
			</Campo>
			<div class="flex flex-col gap-1.5">
				<span class="text-sm leading-5 font-semibold" id="item-cat">Categoria</span>
				<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="item-cat">
					{#each CATEGORIAS_ITEM as cat (cat)}
						<button type="button" role="radio" aria-checked={d.categoria === cat} class="min-h-9 border-2 px-2.5 text-[13px] font-semibold {d.categoria === cat ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}" onclick={() => (d.categoria = cat)}>{cat}</button>
					{/each}
				</div>
			</div>
			<div class="grid gap-2.5 sm:grid-cols-2">
				<Campo id="item-preco" rotulo="Preço (ryo)"><input id="item-preco" class="campo" type="number" min="0" step="100" bind:value={d.preco} /></Campo>
				<Campo id="item-peso" rotulo="Peso">
					<select id="item-peso" class="campo pr-8" bind:value={d.peso}>
						{#each PESOS_ITEM as p (p.id)}<option value={p.id}>{p.nome} · {p.carga.toLocaleString('pt-BR')}</option>{/each}
					</select>
				</Campo>
			</div>
			<Campo id="item-efeito" rotulo="Efeito" obrigatorio erro={tentou && !d.efeito.trim() ? 'Informe o efeito para enviar.' : null}>
				<textarea id="item-efeito" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" placeholder="Descreva o que o item faz." bind:value={d.efeito}></textarea>
			</Campo>
			<label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-medium"><input type="checkbox" class="caixa" bind:checked={d.consumivel} />Consumível pequeno (5 = 0,5 de carga)</label>
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-sm leading-5 font-semibold" id="item-icone">Ícone</span>
			<div class="grid grid-cols-[repeat(4,52px)] gap-1" role="radiogroup" aria-labelledby="item-icone">
				{#each ICONES_ITEM as ic (ic)}
					<button type="button" role="radio" aria-checked={d.icone === ic} aria-label={ic.split('/')[1].replace(/^ic-(item|equip)-/, '')} class="flex h-[52px] w-[52px] items-center justify-center border-2 bg-b1 {d.icone === ic ? 'border-vermelhao' : 'border-b3'}" onclick={() => (d.icone = ic)}><Icone id={ic} /></button>
				{/each}
			</div>
		</div>
	</div>
	<div class="flex flex-wrap justify-end gap-2 border-t-2 border-b3 px-5 py-3">
		<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={aoFechar}>CANCELAR</button>
		<button type="button" class="btn-jogo btn-contorno" disabled={ocupado} onclick={() => salvar(false)}>SALVAR RASCUNHO</button>
		<button type="button" class="btn-jogo {analise.bloqueios ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={ocupado} onclick={() => salvar(true)}>{#if ocupado}<Girando />{/if}{direto ? 'CONCLUIR' : 'ENVIAR PARA REVISÃO'}</button>
	</div>
</Modal>
