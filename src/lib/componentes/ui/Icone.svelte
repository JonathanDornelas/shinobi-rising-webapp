<script lang="ts">
	// Ícone PixelLab: só escalas inteiras de 32 (32, 64, 96), sempre pixelado.
	import { iconeUrl } from '#lib/livro/dominio.ts';

	interface Props {
		id: string;
		tamanho?: 32 | 64 | 96;
		alt?: string;
		class?: string;
		style?: string;
	}
	let { id, tamanho = 32, alt = '', class: classe = '', style = '' }: Props = $props();
</script>

<img
	src={iconeUrl(id)}
	width={tamanho}
	height={tamanho}
	{alt}
	class="block flex-none [image-rendering:pixelated] {classe}"
	{style}
	loading="lazy"
	decoding="async"
/>
