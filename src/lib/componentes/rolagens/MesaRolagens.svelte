<script lang="ts">
	// Montado no layout raiz: com sessão, as rolagens de todas as campanhas chegam ao vivo em qualquer tela (aviso no
	// canto) e a janela de rolagens (L10 · R2) abre pelo botão do canto ou pela tecla R.
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import AvisoRolagem from './AvisoRolagem.svelte';
	import JanelaRolagens from './JanelaRolagens.svelte';

	$effect(() => {
		rolador.conectar(sessao.usuario?.id ?? null);
	});
</script>

{#if sessao.usuario}
	<AvisoRolagem />
	<JanelaRolagens />
{/if}
