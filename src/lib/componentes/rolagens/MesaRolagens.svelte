<script lang="ts">
	// Montado no layout raiz: com sessão e uma campanha acompanhada, as rolagens da mesa chegam em qualquer tela
	// (aviso no canto) e o painel do registro abre por cima do que estiver aberto.
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import AvisoRolagem from './AvisoRolagem.svelte';
	import PainelRolagens from './PainelRolagens.svelte';
</script>

{#if sessao.usuario && rolador.mesa}
	{#key rolador.mesa.id}<AvisoRolagem campanha={rolador.mesa.id} />{/key}
	{#if rolador.painel}<PainelRolagens mesa={rolador.mesa} />{/if}
{/if}
