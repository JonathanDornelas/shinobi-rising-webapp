<script lang="ts">
	// Indicador de carregamento (DS 5 · 5.1): shuriken girando em 4 passos, até existir o sprite an-carregando.
	interface Props {
		tamanho?: 32 | 64;
		rotulo?: string;
	}
	let { tamanho = 32, rotulo = '' }: Props = $props();
</script>

<img src="/icons/arma/ic-arma-shuriken-32.png" width={tamanho} height={tamanho} alt={rotulo} class="giro block flex-none [image-rendering:pixelated]" />
