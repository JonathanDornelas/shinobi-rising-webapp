<script lang="ts">
	// Imagem ampliada (retrato da ficha rápida e da completa, arte do bestiário): ocupa a tela, com zoom pela roda, pelos
	// botões ou pinça, e arrastar para mover. Esc ou clique fora fecha. A arte em pixel não borra no zoom.
	import { prenderFoco } from './foco';

	let { src, alt, aoFechar }: { src: string; alt: string; aoFechar: () => void } = $props();

	let zoom = $state(1);
	let px = $state(0);
	let py = $state(0);
	const pixel = $derived(/\/bestiario\/|\/covers\/|\/capitulos\/|\/molduras\//.test(src));
	const limitar = (z: number) => Math.max(1, Math.min(8, z));
	function zoomEm(fator: number) {
		zoom = limitar(zoom * fator);
		if (zoom === 1) [px, py] = [0, 0];
	}
	let arrasto: { x: number; y: number; px: number; py: number } | null = null;
	const toques = new Map<number, { x: number; y: number }>();
	let pinca: { d: number; zoom: number } | null = null;
	function baixar(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (toques.size === 2) {
			const [a, b] = [...toques.values()];
			pinca = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom };
			arrasto = null;
		} else arrasto = { x: e.clientX, y: e.clientY, px, py };
	}
	function mover(e: PointerEvent) {
		if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pinca && toques.size === 2) {
			const [a, b] = [...toques.values()];
			zoom = limitar((pinca.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinca.d);
			return;
		}
		if (arrasto && zoom > 1) {
			px = arrasto.px + e.clientX - arrasto.x;
			py = arrasto.py + e.clientY - arrasto.y;
		}
	}
	function soltar(e: PointerEvent) {
		toques.delete(e.pointerId);
		if (toques.size < 2) pinca = null;
		arrasto = null;
	}
	const botao = 'flex h-10 min-w-10 items-center justify-center border-2 border-b3 bg-b0 px-2 font-pixel text-sm font-bold text-fg';
</script>

<div class="fixed inset-0 z-[80] flex flex-col bg-[rgba(10,8,7,.9)]" role="presentation" onclick={(e) => e.target === e.currentTarget && aoFechar()}>
	<div role="dialog" aria-modal="true" aria-label={alt} tabindex="-1" class="flex min-h-0 flex-1 flex-col outline-none" {@attach prenderFoco(aoFechar)}>
		<div class="flex flex-none items-center gap-2 p-3">
			<span class="min-w-0 flex-1 truncate font-mincho text-lg font-bold text-papel">{alt}</span>
			<button type="button" class={botao} aria-label="Diminuir zoom" onclick={() => zoomEm(1 / 1.4)}>−</button>
			<span class="min-w-[52px] text-center font-pixel text-sm font-bold text-papel">{Math.round(zoom * 100)}%</span>
			<button type="button" class={botao} aria-label="Aumentar zoom" onclick={() => zoomEm(1.4)}>+</button>
			<button type="button" class={botao} onclick={() => ((zoom = 1), (px = 0), (py = 0))}>1:1</button>
			<button type="button" class={botao} aria-label="Fechar" onclick={aoFechar}>✕</button>
		</div>
		<div
			class="relative min-h-0 flex-1 touch-none overflow-hidden select-none"
			style:cursor={zoom > 1 ? 'grab' : 'zoom-in'}
			role="presentation"
			onwheel={(e) => (e.preventDefault(), zoomEm(e.deltaY < 0 ? 1.15 : 1 / 1.15))}
			onpointerdown={baixar}
			onpointermove={mover}
			onpointerup={soltar}
			onpointercancel={soltar}
			ondblclick={() => (zoom > 1 ? ((zoom = 1), (px = 0), (py = 0)) : (zoom = 2.5))}
		>
			<img {src} {alt} draggable="false" class="absolute inset-0 m-auto max-h-full max-w-full object-contain" style:transform="translate({px}px, {py}px) scale({zoom})" style:image-rendering={pixel ? 'pixelated' : 'auto'} />
		</div>
	</div>
</div>
