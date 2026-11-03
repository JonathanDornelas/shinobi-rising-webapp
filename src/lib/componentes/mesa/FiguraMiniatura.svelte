<script lang="ts">
	// Uma direção da miniatura (um quadro da tira), na escala pedida: a figura de `altura` pixels de tela, ou, com
	// `caixa`, cabendo inteira nela. É só imagem: quem usa diz o que ela é.
	import { urlMiniatura, type Miniatura } from '#lib/mesa/miniaturas.ts';

	let { mini, quadro = 0, altura, caixa, class: cls = '' }: { mini: Miniatura; quadro?: number; altura?: number; caixa?: number; class?: string } = $props();
	const k = $derived(altura ? altura / mini.altura : caixa ? caixa / Math.max(mini.w, mini.h) : 1);
</script>

<span
	aria-hidden="true"
	class="inline-block shrink-0 {cls}"
	style:width="{mini.w * k}px"
	style:height="{mini.h * k}px"
	style:background-image="url({urlMiniatura(mini)})"
	style:background-size="{mini.w * 8 * k}px {mini.h * 2 * k}px"
	style:background-position="{-quadro * mini.w * k}px 0"
	style:background-repeat="no-repeat"
	style:image-rendering="pixelated"
></span>
