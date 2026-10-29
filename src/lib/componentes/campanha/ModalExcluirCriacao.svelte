<script lang="ts" module>
	export type TipoCriacao = 'cla' | 'jutsu' | 'equipamento';
	export interface CriacaoExcluir {
		tipo: TipoCriacao;
		id: string;
		nome: string;
		/** Aprovada: sai da biblioteca com todas as versões. Senão, só esta versão. */
		aprovada: boolean;
		/** "jutsu", "habilidade", "arma", "item", "marionete", "clã": só para o texto. */
		rotulo: string;
		/** Versão nova de algo já aprovado (v2 em rascunho, em revisão…): a aprovada continua valendo. */
		versaoNova?: boolean;
	}
</script>

<script lang="ts">
	// Confirma a exclusão de uma criação da campanha (clã, jutsu ou habilidade, arma, item, marionete) pelo autor ou
	// pelo Mestre. Antes de confirmar, lista as fichas que perdem algo com isso (excluir_criacao, fichas_que_usam).
	import { onMount } from 'svelte';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		alvo: CriacaoExcluir;
		aoFechar: () => void;
		/** Depois de excluir (navegar de volta, recarregar a lista). */
		aoExcluir: () => void | Promise<void>;
	}
	let { alvo, aoFechar, aoExcluir }: Props = $props();

	let fichas = $state<string[] | null>(null);
	let excluindo = $state(false);
	onMount(async () => {
		const { data } = await supabase().rpc('fichas_que_usam', { tipo: alvo.tipo, alvo: alvo.id });
		fichas = data ?? [];
	});

	const PERDA: Record<TipoCriacao, string> = {
		cla: 'ficam sem clã',
		jutsu: 'perdem o jutsu',
		equipamento: 'não recebem a encomenda (o que já está no inventário fica)'
	};
	const nome = $derived(alvo.nome.trim() || 'sem nome');
	const titulo = $derived(alvo.versaoNova ? 'Excluir esta versão?' : `Excluir ${nome}?`);

	async function excluir() {
		excluindo = true;
		const { error } = await supabase().rpc('excluir_criacao', { tipo: alvo.tipo, alvo: alvo.id });
		if (error) {
			excluindo = false;
			return toasts.mostrar(error.code === '42501' ? 'Só quem criou ou o Mestre podem excluir.' : 'Não foi possível excluir. Tente de novo.', 'erro');
		}
		toasts.mostrar(alvo.versaoNova ? 'Versão excluída.' : `Excluído: ${nome}.`, 'info');
		await aoExcluir();
	}
</script>

<Modal rotulo="Excluir {alvo.rotulo}" largura={500} topo={150} aoFechar={() => !excluindo && aoFechar()}>
	<div class="flex flex-col gap-4 p-6">
		<h2 class="t-h3 m-0">{titulo}</h2>
		<p class="m-0 text-[15px] leading-[23px]">
			{#if alvo.aprovada}
				Sai da biblioteca da campanha junto com as versões anteriores{alvo.tipo === 'cla' ? ' e os jutsus das cartas do clã' : ''}. Não dá para desfazer.
			{:else if alvo.versaoNova}
				Só esta versão é apagada; a versão aprovada continua valendo. Não dá para desfazer.
			{:else}
				Não dá para desfazer.
			{/if}
		</p>
		{#if fichas === null}
			<span class="inline-flex items-center gap-2 text-sm text-mut"><Girando />Conferindo as fichas que usam…</span>
		{:else if fichas.length}
			<div class="flex flex-col gap-1.5 border-2 border-warn bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] px-3.5 py-3 text-sm leading-5">
				<b>{fichas.length === 1 ? 'Uma ficha usa isto e' : `${fichas.length} fichas usam isto e`} {PERDA[alvo.tipo]}:</b>
				<span>{fichas.join(', ')}</span>
			</div>
		{/if}
		<div class="flex justify-end gap-2.5">
			<button type="button" class="btn-jogo btn-fantasma" disabled={excluindo} onclick={aoFechar}>CANCELAR</button>
			<button type="button" class="btn-jogo bg-err text-errfg" disabled={excluindo || fichas === null} aria-busy={excluindo} onclick={excluir}>{#if excluindo}<Girando />{/if}EXCLUIR</button>
		</div>
	</div>
</Modal>
