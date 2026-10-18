<script lang="ts">
	// Foto do ninja: escolhe a imagem, enquadra no quadrado (arrastar e zoom) e envia 256×256 em webp para o Storage.
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { caminhoRetrato, LIMITE_ORIGINAL, limitar, recortar, type Enquadramento } from '#lib/personagem/retrato.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	let { ficha, atual, aoMudar }: { ficha: string; atual: string | null; aoMudar?: (caminho: string | null) => void } = $props();

	const VISOR = 256;
	let entrada = $state<HTMLInputElement>();
	let fonte = $state<string | null>(null);
	let img = $state<HTMLImageElement>();
	/** Tamanho natural da imagem, lido no onload (naturalWidth não é reativo). */
	let natural = $state<{ naturalWidth: number; naturalHeight: number } | null>(null);
	let e = $state<Enquadramento>({ zoom: 1, x: 0, y: 0 });
	let enviando = $state(false);
	let arrasto = $state<{ px: number; py: number; x: number; y: number } | null>(null);

	function escolher(ev: Event) {
		const arq = (ev.currentTarget as HTMLInputElement).files?.[0];
		(ev.currentTarget as HTMLInputElement).value = '';
		if (!arq) return;
		if (!arq.type.startsWith('image/')) return toasts.mostrar('Escolha uma imagem (PNG, JPG ou WEBP).', 'erro');
		if (arq.size > LIMITE_ORIGINAL) return toasts.mostrar('Imagem grande demais (máximo 15 MB).', 'erro');
		natural = null;
		fonte = URL.createObjectURL(arq);
		e = { zoom: 1, x: 0, y: 0 };
	}
	function fechar() {
		if (enviando) return;
		if (fonte) URL.revokeObjectURL(fonte);
		fonte = null;
	}
	const ajustar = (n: Enquadramento) => (e = natural ? limitar(natural, n) : n);

	// tamanho da imagem no visor, para posicionar com CSS do mesmo jeito que o recorte no canvas
	const dims = $derived.by(() => {
		const z = e.zoom;
		if (!natural) return null;
		const escala = (VISOR / Math.min(natural.naturalWidth, natural.naturalHeight)) * z;
		return { w: natural.naturalWidth * escala, h: natural.naturalHeight * escala };
	});

	async function enviar() {
		if (!img) return;
		enviando = true;
		try {
			const blob = await recortar(img, e);
			const caminho = caminhoRetrato(ficha);
			const sb = supabase();
			const up = await sb.storage.from('retratos').upload(caminho, blob, { contentType: 'image/webp', upsert: false });
			if (up.error) throw up.error;
			const { error } = await sb.rpc('definir_retrato', { ficha, caminho });
			if (error) {
				await sb.storage.from('retratos').remove([caminho]);
				throw error;
			}
			if (atual) await sb.storage.from('retratos').remove([atual]);
			aoMudar?.(caminho);
			toasts.mostrar('Retrato atualizado.', 'sucesso');
			enviando = false;
			fechar();
			await invalidateAll();
		} catch {
			enviando = false;
			toasts.mostrar('Não foi possível enviar o retrato. Tente outra imagem.', 'erro');
		}
	}

	async function remover() {
		if (!atual) return;
		const sb = supabase();
		const { error } = await sb.rpc('definir_retrato', { ficha, caminho: null });
		if (error) return toasts.mostrar('Não foi possível remover o retrato.', 'erro');
		await sb.storage.from('retratos').remove([atual]);
		aoMudar?.(null);
		toasts.mostrar('Retrato removido.', 'info');
		await invalidateAll();
	}
</script>

<div class="flex flex-wrap gap-2">
	<button type="button" class="btn-jogo btn-contorno min-h-9 text-xs" onclick={() => entrada?.click()}>{atual ? 'TROCAR FOTO' : 'ENVIAR FOTO'}</button>
	{#if atual}<button type="button" class="btn-jogo btn-fantasma min-h-9 text-xs" onclick={remover}>REMOVER</button>{/if}
	<input bind:this={entrada} type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="sr-only" tabindex="-1" aria-hidden="true" onchange={escolher} />
</div>

{#if fonte}
	<Modal rotulo="Enquadrar o retrato" largura={420} aoFechar={fechar}>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="t-h3 m-0">Enquadrar o retrato</h2>
			<p class="m-0 text-sm text-mut">Arraste para posicionar e use o zoom. A foto fica quadrada, em 256 × 256.</p>
			<div
				class="relative mx-auto touch-none overflow-hidden border-2 border-ink bg-b1 select-none"
				style:width="{VISOR}px"
				style:height="{VISOR}px"
				role="presentation"
				style:cursor={arrasto ? 'grabbing' : 'grab'}
				onpointerdown={(ev) => {
					(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
					arrasto = { px: ev.clientX, py: ev.clientY, x: e.x, y: e.y };
				}}
				onpointermove={(ev) => arrasto && ajustar({ zoom: e.zoom, x: arrasto.x + (ev.clientX - arrasto.px) / VISOR, y: arrasto.y + (ev.clientY - arrasto.py) / VISOR })}
				onpointerup={() => (arrasto = null)}
				onpointercancel={() => (arrasto = null)}
				onwheel={(ev) => {
					ev.preventDefault();
					ajustar({ ...e, zoom: Math.min(4, Math.max(1, e.zoom - ev.deltaY / 500)) });
				}}
			>
				<img
					bind:this={img}
					src={fonte}
					alt="Prévia do retrato"
					draggable="false"
					class="pointer-events-none absolute max-w-none"
					style:width={dims ? `${dims.w}px` : '100%'}
					style:height={dims ? `${dims.h}px` : 'auto'}
					style:left={dims ? `${(VISOR - dims.w) / 2 + e.x * VISOR}px` : '0'}
					style:top={dims ? `${(VISOR - dims.h) / 2 + e.y * VISOR}px` : '0'}
					onload={(ev) => {
						const i = ev.currentTarget as HTMLImageElement;
						natural = { naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight };
						ajustar({ ...e });
					}}
				/>
			</div>
			<label class="flex items-center gap-3 text-sm font-semibold">
				Zoom
				<input type="range" min="1" max="4" step="0.01" class="range range-sm flex-1" value={e.zoom} oninput={(ev) => ajustar({ ...e, zoom: Number(ev.currentTarget.value) })} />
			</label>
			<div class="flex flex-wrap justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={fechar}>CANCELAR</button>
				<button type="button" class="btn-jogo btn-primario" disabled={enviando || !dims} aria-busy={enviando} onclick={enviar}>{#if enviando}<Girando />{/if}USAR ESTA FOTO</button>
			</div>
		</div>
	</Modal>
{/if}
