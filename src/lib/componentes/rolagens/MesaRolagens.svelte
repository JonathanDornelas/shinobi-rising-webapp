<script lang="ts">
	// Montado no layout raiz: com sessão, as rolagens de todas as campanhas chegam ao vivo em qualquer tela (aviso no
	// canto) e a janela de rolagens (L10 · R2) abre pelo botão do canto ou pela tecla R.
	import { page } from '$app/state';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import AvisoRolagem from './AvisoRolagem.svelte';
	import Dados3D from './Dados3D.svelte';
	import JanelaRolagens from './JanelaRolagens.svelte';

	$effect(() => {
		rolador.conectar(sessao.usuario?.id ?? null);
	});
</script>

{#if sessao.usuario}
	<AvisoRolagem />
	<Dados3D />
	<!-- na Mesa, o painel de rolagens já fica na tela -->
	{#if !page.url.pathname.endsWith('/mesa')}<JanelaRolagens />{/if}
{/if}
