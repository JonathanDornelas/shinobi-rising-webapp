<script lang="ts">
	// Referência cruzada (CMP-23): link com prévia do capítulo no hover e no foco.
	import indice from '#lib/livro/gerado/indice.json';
	import type { IndiceLivro } from '#lib/livro/tipos.ts';
	import { posicionar } from '../ui/posicao';

	interface Props {
		href: string;
		texto: string;
		negrito?: boolean;
	}
	let { href, texto, negrito = false }: Props = $props();

	const dados = indice as IndiceLivro;
	const previa = $derived.by(() => {
		if (href.startsWith('/regras/clas/')) return null;
		const [caminho, ancora] = href.split('#');
		const cap = dados.capitulos.find((c) => c.href === caminho);
		if (!cap) return null;
		const secao = ancora ? cap.secoes.find((s) => s.id === ancora) : null;
		const parte = dados.partes.find((p) => p.numero === cap.parte);
		return { rotulo: `CAP. ${cap.numero} · ${parte?.rotulo ?? ''}`, titulo: secao?.titulo ?? cap.titulo, sub: secao ? cap.titulo : null, resumo: cap.resumo };
	});

	let el: HTMLAnchorElement | undefined = $state();
	let pos = $state<{ left: number; top: number } | null>(null);
	let timer: ReturnType<typeof setTimeout>;
	function abrir() {
		if (!previa || matchMedia('(hover: none)').matches) return;
		clearTimeout(timer);
		timer = setTimeout(() => el && (pos = posicionar(el, 320, 150)), 300);
	}
	function fechar() {
		clearTimeout(timer);
		pos = null;
	}
</script>

<a
	bind:this={el}
	{href}
	class="link"
	class:font-bold={negrito}
	onmouseenter={abrir}
	onmouseleave={fechar}
	onfocus={abrir}
	onblur={fechar}>{texto}</a
>{#if pos && previa}<span
		role="tooltip"
		class="camada pointer-events-none fixed z-[70] block w-[320px] p-3 text-left not-italic"
		style:left="{pos.left}px"
		style:top="{pos.top}px"
	>
		<span class="t-rotulo-sm block text-title">{previa.rotulo}</span>
		<span class="mt-1.5 mb-1 block font-mincho text-[17px] leading-6 font-bold text-fg">{previa.titulo}</span>
		{#if previa.sub}<span class="mb-1 block text-xs leading-4 font-semibold text-mut">em {previa.sub}</span>{/if}
		<span class="line-clamp-3 text-sm leading-[21px] font-normal text-mut">{previa.resumo}</span>
	</span>{/if}
