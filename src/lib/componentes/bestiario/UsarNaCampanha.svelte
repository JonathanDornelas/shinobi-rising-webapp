<script lang="ts">
	// "Usar na campanha": leva o estágio escolhido do verbete para a lista de NPCs de uma campanha em que a pessoa é
	// Mestre (a página de NPCs cria a ficha resumida com os números dele).
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	let { slug, estagio = 0, nomeEstagio = null }: { slug: string; estagio?: number; nomeEstagio?: string | null } = $props();
	const minhas = $derived(rolador.campanhas.filter((k) => !k.arquivada && k.mestreId && k.mestreId === sessao.usuario?.id));
</script>

<div class="painel flex flex-col gap-2 p-3">
	<span class="flex items-center gap-2 font-mincho text-[17px] leading-6 font-bold"><Icone id="nav/ic-nav-npcs" />Usar na campanha</span>
	{#if !sessao.usuario}
		<p class="m-0 text-sm leading-5 text-mut">Entre na sua conta para levar este adversário para uma campanha em que você é Mestre.</p>
	{:else if !minhas.length}
		<p class="m-0 text-sm leading-5 text-mut">Só o Mestre de uma campanha ativa pode criar NPCs a partir do bestiário.</p>
	{:else}
		<p class="m-0 text-sm leading-5 text-mut">Cria o NPC {nomeEstagio ? `(${nomeEstagio})` : ''} com estes números na lista do Mestre.</p>
		<div class="flex flex-wrap gap-2">
			{#each minhas as k (k.id)}
				<a href="/campanhas/{k.id}/npcs?bestiario={slug}&estagio={estagio}" class="btn-jogo btn-contorno">{k.nome}</a>
			{/each}
		</div>
	{/if}
</div>
