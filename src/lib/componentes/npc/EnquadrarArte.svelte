<script lang="ts">
	// Enquadramento da arte do bestiário no token: a prévia redonda mostra o que a Mesa vai mostrar.
	// Arrastar move o ponto central; o controle muda o zoom; "Padrão" volta ao foco do mapa (foco.json).
	import { focoDaArte, focoPadrao, retanguloFoco, type Foco } from '#lib/bestiario/foco.ts';

	let { arte, valor, aoMudar }: { arte: string; valor: Foco | null | undefined; aoMudar: (f: Foco | null) => void } = $props();

	const LADO = 112;
	const padrao = $derived(focoPadrao(arte)!);
	const foco = $derived(focoDaArte(arte, valor)!);
	const r = $derived(retanguloFoco(foco, LADO / 2, LADO / 2, LADO));
	const arred = (v: number) => Math.round(v * 1000) / 1000;
	const limitar = (v: number) => Math.max(0, Math.min(1, v));

	let arrasto: { px: number; py: number; x: number; y: number } | null = null;
	function baixar(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		arrasto = { px: e.clientX, py: e.clientY, x: foco.x, y: foco.y };
	}
	function mover(e: PointerEvent) {
		if (!arrasto) return;
		// arrastar a imagem para a direita mostra o que está à esquerda: o ponto anda ao contrário
		aoMudar({ zoom: foco.zoom, x: arred(limitar(arrasto.x - (e.clientX - arrasto.px) / r.w)), y: arred(limitar(arrasto.y - (e.clientY - arrasto.py) / r.h)) });
	}
	function teclar(e: KeyboardEvent) {
		const d = e.shiftKey ? 0.05 : 0.01;
		const passo: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
		const p = passo[e.key];
		if (!p) return;
		e.preventDefault();
		aoMudar({ zoom: foco.zoom, x: arred(limitar(foco.x + p[0])), y: arred(limitar(foco.y + p[1])) });
	}
</script>

<div class="flex items-center gap-3">
	<div
		class="relative flex-none cursor-grab touch-none overflow-hidden rounded-full border-2 border-b3 bg-b2 active:cursor-grabbing"
		style:width="{LADO}px"
		style:height="{LADO}px"
		role="slider"
		tabindex="0"
		aria-label="Enquadramento da arte no token (setas movem)"
		aria-valuetext="ponto {Math.round(foco.x * 100)}% × {Math.round(foco.y * 100)}%, zoom {foco.zoom.toFixed(1)}"
		aria-valuenow={Math.round(foco.x * 100)}
		onpointerdown={baixar}
		onpointermove={mover}
		onpointerup={() => (arrasto = null)}
		onpointercancel={() => (arrasto = null)}
		onkeydown={teclar}
	>
		<img src={arte} alt="" draggable="false" class="pointer-events-none absolute max-w-none select-none [image-rendering:pixelated]" style:left="{r.x}px" style:top="{r.y}px" style:width="{r.w}px" style:height="{r.h}px" />
	</div>
	<div class="flex min-w-0 flex-1 flex-col gap-1.5">
		<span class="text-sm font-semibold">Arte no token</span>
		<span class="text-xs text-mut">Arraste a imagem para centralizar o rosto ou o corpo.</span>
		<label class="flex items-center gap-2 text-xs font-semibold text-mut">
			Zoom
			<input type="range" class="range range-xs flex-1" min="1" max="4" step="0.05" value={foco.zoom} oninput={(e) => aoMudar({ x: foco.x, y: foco.y, zoom: +e.currentTarget.value })} />
		</label>
		{#if valor}<button type="button" class="link self-start text-xs font-semibold" onclick={() => aoMudar(null)}>Voltar ao padrão</button>{:else}<span class="text-xs text-mut">Enquadramento padrão da arte ({padrao.zoom.toFixed(1)}×).</span>{/if}
	</div>
</div>
