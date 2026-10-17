<script lang="ts">
	// Título de seção com âncora no hover: clicar no # copia o link da seção.
	import { toasts } from '#lib/estado/toasts.svelte.ts';

	interface Props {
		nivel: 2 | 3 | 4;
		id: string;
		texto: string;
	}
	let { nivel, id, texto }: Props = $props();

	async function copiar(e: MouseEvent) {
		e.preventDefault();
		const url = `${location.origin}${location.pathname}#${id}`;
		history.replaceState(history.state, '', `#${id}`);
		try {
			await navigator.clipboard.writeText(url);
			toasts.mostrar('Link da seção copiado.', 'sucesso');
		} catch {
			toasts.mostrar('Não foi possível copiar. O link está na barra de endereço.', 'aviso');
		}
	}

	const CLASSE = {
		2: 'mt-3 font-mincho text-2xl leading-8 font-bold md:text-[28px] md:leading-9',
		3: 'mt-2 font-mincho text-xl leading-7 font-semibold md:text-[22px] md:leading-[30px]',
		4: 'mt-1 text-sm leading-5 font-bold tracking-[.06em] uppercase'
	};
</script>

<svelte:element this={`h${nivel}`} {id} class="group m-0 flex scroll-mt-20 items-baseline gap-2.5 {CLASSE[nivel]}" data-secao={nivel}>
	<span>{texto}</span>
	<a
		href="#{id}"
		onclick={copiar}
		class="font-pixel text-base leading-none font-bold text-mut opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
		aria-label="Copiar link da seção {texto}">#</a
	>
</svelte:element>
