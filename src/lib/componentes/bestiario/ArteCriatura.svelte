<script lang="ts">
	// Arte do verbete (PixelLab, static/bestiario): pixels nítidos em qualquer escala. Na página do monstro a arte vem
	// "pintada" no papel, com a borda irregular de uma pincelada seca de nanquim em vez de um quadro reto; a pincelada
	// muda de arte para arte (variante), como num livro ilustrado à mão. Na lista, a arte sai solta e cortada na caixa.
	// A arte pintada amplia com um clique (ZoomImagem); a solta da lista não, porque ela já é o link do verbete.
	import type { Criatura } from '#lib/livro/tipos.ts';
	import ZoomImagem from '../ui/ZoomImagem.svelte';

	interface Props {
		criatura: Pick<Criatura, 'nome' | 'arte'>;
		moldura?: 'pintura' | 'solta';
		/** Qual das pinceladas usar (0, 1 ou 2; números maiores dão a volta). */
		variante?: number;
		/** Na lista: a arte preenche a caixa e é cortada nas bordas. */
		cobrir?: boolean;
		carregar?: 'lazy' | 'eager';
		/** Abre a arte em tela cheia ao clicar (padrão: só a arte pintada; nunca dentro de um link). */
		ampliar?: boolean;
		class?: string;
	}
	let { criatura, moldura = 'pintura', variante = 0, cobrir = false, carregar = 'lazy', ampliar, class: classe = '' }: Props = $props();
	const a = $derived(criatura.arte);
	const comZoom = $derived(ampliar ?? (moldura === 'pintura' && !cobrir));
	let aberta = $state(false);
</script>

{#snippet imagem()}
	<img
		src={a.arquivo}
		width={a.largura}
		height={a.altura}
		alt="{criatura.nome}, arte do bestiário"
		loading={carregar}
		class="block max-w-full [image-rendering:pixelated] {cobrir ? 'h-full w-full object-cover' : 'h-auto'} {moldura === 'pintura' && !cobrir ? `pintura pintura-${variante % 3}` : ''} {classe}"
	/>
{/snippet}

{#if a.arquivo && comZoom}
	<button type="button" class="ampliar block w-full cursor-zoom-in p-0" aria-label="Ampliar a arte: {criatura.nome}" onclick={() => (aberta = true)}>
		{@render imagem()}
	</button>
	{#if aberta}<ZoomImagem src={a.arquivo} largura={a.largura} altura={a.altura} rotulo={criatura.nome} aoFechar={() => (aberta = false)} />{/if}
{:else if a.arquivo}
	{@render imagem()}
{:else}
	<div
		class="flex items-center justify-center border-2 border-dashed border-b3 bg-b2 text-center {cobrir ? 'h-full w-full' : ''} {classe}"
		style:aspect-ratio={cobrir ? undefined : `${a.largura} / ${a.altura}`}
		role="img"
		aria-label="{criatura.nome}: arte ainda não feita"
	>
		{#if cobrir}
			<span class="block h-full w-full bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--color-b3)_6px_8px)] opacity-60" aria-hidden="true"></span>
		{:else}
			<span class="px-3 font-pixel text-xs leading-4 font-bold tracking-[.12em] text-mut">ARTE EM BREVE</span>
		{/if}
	</div>
{/if}

<style>
	/* O botão em volta da arte não tem cara de botão: só o cursor de lupa e, no foco do teclado, um contorno ouro. */
	.ampliar {
		background: none;
		border: 0;
	}
	.ampliar:focus-visible {
		outline: 2px solid #d9a82b;
		outline-offset: 4px;
	}
	/* A pincelada: um retângulo com a borda deslocada por ruído (feTurbulence), que deixa as fibras do pincel nas
	   bordas; esticado no tamanho da arte. Cada variante muda a semente e o sentido das fibras. */
	.pintura {
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
	}
	.pintura-0 {
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' preserveAspectRatio='none'%3E%3Cfilter id='p' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.025 .09' numOctaves='4' seed='3'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='15' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect x='9' y='9' width='182' height='182' fill='white' filter='url(%23p)'/%3E%3C/svg%3E");
	}
	.pintura-1 {
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' preserveAspectRatio='none'%3E%3Cfilter id='p' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.09 .025' numOctaves='4' seed='11'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='15' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect x='9' y='9' width='182' height='182' fill='white' filter='url(%23p)'/%3E%3C/svg%3E");
	}
	.pintura-2 {
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' preserveAspectRatio='none'%3E%3Cfilter id='p' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.05 .05' numOctaves='5' seed='27'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='18' xChannelSelector='G' yChannelSelector='R'/%3E%3C/filter%3E%3Crect x='10' y='10' width='180' height='180' fill='white' filter='url(%23p)'/%3E%3C/svg%3E");
	}
</style>
