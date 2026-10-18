<script lang="ts">
	// Excluir a ficha (dono, em qualquer status, ou o Mestre): confirma pelo nome, apaga o retrato e chama excluir_ficha.
	import { goto } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Alerta from '../ui/Alerta.svelte';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		ficha: { id: string; nome: string; retrato: string | null; campanha_id: string };
		/** A ficha é de outro jogador (o Mestre excluindo). */
		deOutro?: boolean;
		aoFechar: () => void;
	}
	let { ficha, deOutro = false, aoFechar }: Props = $props();
	const nome = $derived(ficha.nome.trim() || 'sem nome');
	let confirmacao = $state('');
	let ocupado = $state(false);
	let falha = $state('');
	const confere = $derived(confirmacao.trim().toLowerCase() === nome.toLowerCase());

	async function excluir() {
		if (!confere) return;
		ocupado = true;
		falha = '';
		const sb = supabase();
		// o arquivo sai antes: depois da ficha excluída, a política do Storage não acha mais o dono
		if (ficha.retrato) await sb.storage.from('retratos').remove([ficha.retrato]);
		const { error } = await sb.rpc('excluir_ficha', { ficha: ficha.id });
		ocupado = false;
		if (error) {
			falha = /arquivada/.test(error.message) ? 'Campanha arquivada é somente leitura.' : 'Não foi possível excluir agora. Tente de novo.';
			return;
		}
		toasts.mostrar(`Ficha de ${nome} excluída.`, 'info');
		await goto(`/campanhas/${ficha.campanha_id}/personagens`, { refreshAll: true });
	}
</script>

<Modal rotulo="Excluir a ficha" largura={480} aoFechar={() => !ocupado && aoFechar()}>
	<form
		class="flex flex-col gap-4 p-6"
		onsubmit={(e) => {
			e.preventDefault();
			excluir();
		}}
	>
		<h2 class="t-h3 m-0">Excluir a ficha de {nome}?</h2>
		<p class="m-0 text-[15px] leading-[23px] text-mut">
			A ficha, o retrato, o registro e os pedidos de PT somem para sempre. Jutsus e equipamentos criados continuam na biblioteca, e as rolagens continuam no registro.
			{#if deOutro}O jogador recebe um aviso.{:else}Para tirar o personagem de jogo sem perder nada, prefira arquivar.{/if}
		</p>
		<Campo id="confirma-ficha" rotulo="Digite o nome do personagem para confirmar" ajuda={nome}>
			<input id="confirma-ficha" class="campo" autocomplete="off" bind:value={confirmacao} />
		</Campo>
		{#if falha}<Alerta tipo="erro" titulo={falha} />{/if}
		<div class="flex flex-wrap justify-end gap-2.5">
			<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={aoFechar}>CANCELAR</button>
			<button type="submit" class="btn-jogo bg-err text-errfg" disabled={ocupado || !confere} aria-busy={ocupado}>{#if ocupado}<Girando />{/if}EXCLUIR FICHA</button>
		</div>
	</form>
</Modal>
