<script lang="ts">
	// O Mestre concede um jutsu ou um item a uma ficha: de graça (espólio, presente do sensei) ou cobrando o custo normal
	// (PT para o jutsu, ryo para o item), que ele pode ajustar.
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import type { ItemInventario } from '#lib/personagem/progressao.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json } from '#lib/supabase/banco.ts';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';

	export type Concessao = { tipo: 'jutsu'; slug: string; nome: string; custo: number } | { tipo: 'item'; item: ItemInventario; custo: number };
	interface Props {
		alvo: Concessao;
		fichas: { id: string; nome: string; pt: number; ryo?: number }[];
		aoFechar: () => void;
	}
	let { alvo, fichas, aoFechar }: Props = $props();
	// svelte-ignore state_referenced_locally
	let ficha = $state(fichas[0]?.id ?? '');
	let cobrar = $state(false);
	// svelte-ignore state_referenced_locally
	let custo = $state(alvo.custo);
	let ocupado = $state(false);
	const nome = $derived(alvo.tipo === 'jutsu' ? alvo.nome : alvo.item.nome);
	const unidade = $derived(alvo.tipo === 'jutsu' ? 'PT' : 'ryo');

	async function conceder() {
		if (!ficha) return;
		ocupado = true;
		const valor = cobrar ? Math.max(0, Math.round(custo)) : 0;
		const { error } =
			alvo.tipo === 'jutsu'
				? await supabase().rpc('conceder_jutsu', { ficha, slug: alvo.slug, nome: alvo.nome, custo_pt: valor })
				: await supabase().rpc('conceder_item', { ficha, item: alvo.item as unknown as Json, custo_ryo: valor });
		ocupado = false;
		if (error) return toasts.mostrar(error.message.length < 140 ? error.message : 'Não foi possível conceder.', 'erro', 6000);
		const quem = fichas.find((f) => f.id === ficha)?.nome ?? 'a ficha';
		toasts.mostrar(`${nome} concedido a ${quem}${valor ? ` (−${valor.toLocaleString('pt-BR')} ${unidade})` : ''}.`, 'sucesso', 5000);
		aoFechar();
	}
</script>

<Modal rotulo="Conceder {nome}" largura={480} topo={120} aoFechar={() => !ocupado && aoFechar()}>
	<div class="flex items-center gap-2 bg-grena px-5 py-3.5"><Icone id="acao/ic-acao-conceder" /><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">Conceder {nome}</h2></div>
	<form
		class="flex flex-col gap-4 p-5"
		onsubmit={(e) => {
			e.preventDefault();
			conceder();
		}}
	>
		{#if fichas.length}
			<Campo id="conc-ficha" rotulo="Para qual ficha">
				<select id="conc-ficha" class="campo pr-8" bind:value={ficha}>
					{#each fichas as f (f.id)}<option value={f.id}>{f.nome} · {alvo.tipo === 'jutsu' ? `${f.pt} PT` : `${(f.ryo ?? 0).toLocaleString('pt-BR')} ryo`}</option>{/each}
				</select>
			</Campo>
			<div class="flex flex-col gap-2" role="radiogroup" aria-label="Custo">
				<label class="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px]"><input type="radio" class="caixa" name="custo" checked={!cobrar} onchange={() => (cobrar = false)} />Grátis {alvo.tipo === 'jutsu' ? '(ensinado pelo Mestre ou pela história)' : '(espólio, presente)'}</label>
				<label class="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px]"><input type="radio" class="caixa" name="custo" checked={cobrar} onchange={() => (cobrar = true)} />Cobrar
					<input class="campo h-9 w-28 text-sm" type="number" min="0" aria-label="Custo em {unidade}" disabled={!cobrar} bind:value={custo} />{unidade}
				</label>
			</div>
			<p class="m-0 text-[13px] leading-[19px] text-mut">{alvo.tipo === 'jutsu' ? 'O jutsu entra na lista da ficha como aprendido (cap. 18: o custo normal é o PT do rank).' : 'O item entra no inventário quando a ficha abrir.'}</p>
		{:else}
			<p class="m-0 text-[15px]">Nenhuma ficha aprovada e ativa para receber.</p>
		{/if}
		<div class="flex justify-end gap-2">
			<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={aoFechar}>CANCELAR</button>
			<button type="submit" class="btn-jogo btn-primario" disabled={ocupado || !ficha}>{#if ocupado}<Girando />{/if}CONCEDER</button>
		</div>
	</form>
</Modal>
