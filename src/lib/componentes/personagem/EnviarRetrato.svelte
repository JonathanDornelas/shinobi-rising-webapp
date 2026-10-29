<script lang="ts">
	// Foto: escolhe a imagem (um arquivo do aparelho ou uma arte do bestiário), enquadra no quadrado (arrastar e zoom) e
	// envia 256×256 em webp para o Storage, em retratos/<ficha>/… (o padrão, gravado por definir_retrato). NPCs e o avatar
	// do perfil passam a pasta e o salvar. A arte do bestiário abre enquadrada no foco dela e é recortada sem suavizar.
	import { refreshAll } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { enquadramentoDoFoco, focoPadrao } from '#lib/bestiario/foco.ts';
	import type { Criatura } from '#lib/livro/tipos.ts';
	import { caminhoRetrato, LIMITE_ORIGINAL, limitar, recortar, type Enquadramento } from '#lib/personagem/retrato.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import BuscaBestiario from '../npc/BuscaBestiario.svelte';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		/** Pasta no bucket: o id da ficha, do NPC ou da conta. */
		ficha: string;
		atual: string | null;
		aoMudar?: (caminho: string | null) => void;
		/** Rótulos curtos no celular (cabeçalho da ficha). */
		compacto?: boolean;
		/** Grava o caminho escolhido (sem ele, definir_retrato da ficha). */
		salvar?: (caminho: string | null) => PromiseLike<{ error: unknown }>;
	}
	let { ficha, atual, aoMudar, compacto = false, salvar }: Props = $props();
	const gravar = (caminho: string | null) => (salvar ? salvar(caminho) : supabase().rpc('definir_retrato', { ficha, caminho }));

	const VISOR = 256;
	let entrada = $state<HTMLInputElement>();
	let fonte = $state<string | null>(null);
	let img = $state<HTMLImageElement>();
	/** Tamanho natural da imagem, lido no onload (naturalWidth não é reativo). */
	let natural = $state<{ naturalWidth: number; naturalHeight: number } | null>(null);
	let e = $state<Enquadramento>({ zoom: 1, x: 0, y: 0 });
	let enviando = $state(false);
	let arrasto = $state<{ px: number; py: number; x: number; y: number } | null>(null);
	/** Escolhendo uma arte do bestiário; a escolhida é pixel art (recorte sem suavizar) e abre no foco dela. */
	let galeria = $state(false);
	let pixelado = $state(false);
	let arte = $state<string | null>(null);

	function escolher(ev: Event) {
		const arq = (ev.currentTarget as HTMLInputElement).files?.[0];
		(ev.currentTarget as HTMLInputElement).value = '';
		if (!arq) return;
		if (!arq.type.startsWith('image/')) return toasts.mostrar('Escolha uma imagem (PNG, JPG ou WEBP).', 'erro');
		if (arq.size > LIMITE_ORIGINAL) return toasts.mostrar('Imagem grande demais (máximo 15 MB).', 'erro');
		natural = null;
		pixelado = false;
		arte = null;
		fonte = URL.createObjectURL(arq);
		e = { zoom: 1, x: 0, y: 0 };
	}
	function usarArte(c: Criatura, estagio: number) {
		const arquivo = (c.estagios[estagio]?.arte ?? c.arte)?.arquivo;
		if (!arquivo) return void toasts.mostrar('Essa criatura ainda não tem arte.', 'aviso');
		galeria = false;
		natural = null;
		pixelado = true;
		arte = arquivo;
		fonte = arquivo;
		e = { zoom: 1, x: 0, y: 0 };
	}
	function fechar() {
		if (enviando) return;
		if (fonte?.startsWith('blob:')) URL.revokeObjectURL(fonte);
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
		// o salvar pode mudar `atual` na hora (avatar na sessão): guarda o caminho da foto que sai
		const anterior = atual;
		enviando = true;
		try {
			const blob = await recortar(img, e, pixelado);
			const caminho = caminhoRetrato(ficha);
			const sb = supabase();
			const up = await sb.storage.from('retratos').upload(caminho, blob, { contentType: 'image/webp', upsert: false });
			if (up.error) throw up.error;
			const { error } = await gravar(caminho);
			if (error) {
				await sb.storage.from('retratos').remove([caminho]);
				throw error;
			}
			if (anterior) await sb.storage.from('retratos').remove([anterior]);
			aoMudar?.(caminho);
			toasts.mostrar('Foto atualizada.', 'sucesso');
			enviando = false;
			fechar();
			await refreshAll();
		} catch {
			enviando = false;
			toasts.mostrar('Não foi possível enviar a foto. Tente outra imagem.', 'erro');
		}
	}

	async function remover() {
		const anterior = atual;
		if (!anterior) return;
		const sb = supabase();
		const { error } = await gravar(null);
		if (error) return toasts.mostrar('Não foi possível remover a foto.', 'erro');
		await sb.storage.from('retratos').remove([anterior]);
		aoMudar?.(null);
		toasts.mostrar('Foto removida.', 'info');
		await refreshAll();
	}
</script>

<div class="flex flex-wrap gap-2 {compacto ? 'max-sm:gap-1' : ''}">
	<button type="button" class="btn-jogo btn-contorno min-h-9 text-xs {compacto ? 'max-sm:min-h-8 max-sm:px-2' : ''}" aria-label={atual ? 'Trocar foto' : 'Enviar foto'} onclick={() => entrada?.click()}>
		{#if compacto}<span class="sm:hidden">{atual ? 'TROCAR' : 'FOTO'}</span><span class="max-sm:hidden">{atual ? 'TROCAR FOTO' : 'ENVIAR FOTO'}</span>{:else}{atual ? 'TROCAR FOTO' : 'ENVIAR FOTO'}{/if}
	</button>
	<button type="button" class="btn-jogo btn-contorno min-h-9 text-xs {compacto ? 'max-sm:min-h-8 max-sm:px-2' : ''}" aria-label="Escolher uma arte do bestiário" onclick={() => (galeria = true)}>
		{#if compacto}<span class="sm:hidden">BESTIÁRIO</span><span class="max-sm:hidden">DO BESTIÁRIO</span>{:else}DO BESTIÁRIO{/if}
	</button>
	{#if atual}<button type="button" class="btn-jogo btn-fantasma min-h-9 text-xs {compacto ? 'max-sm:min-h-8 max-sm:px-2' : ''}" aria-label="Remover foto" onclick={remover}>{#if compacto}<span class="sm:hidden">✕</span><span class="max-sm:hidden">REMOVER</span>{:else}REMOVER{/if}</button>{/if}
	<input bind:this={entrada} type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="sr-only" tabindex="-1" aria-hidden="true" onchange={escolher} />
</div>

{#if galeria}
	<Modal rotulo="Escolher uma arte do bestiário" largura={560} aoFechar={() => (galeria = false)}>
		<div class="flex flex-col gap-3 p-6">
			<h2 class="t-h3 m-0">Arte do bestiário</h2>
			<p class="m-0 text-sm text-mut">Escolha uma arte para o retrato. Depois dá para enquadrar antes de usar.</p>
			<BuscaBestiario onEscolher={usarArte} onFechar={() => (galeria = false)} />
		</div>
	</Modal>
{/if}

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
					class="pointer-events-none absolute max-w-none {pixelado ? '[image-rendering:pixelated]' : ''}"
					style:width={dims ? `${dims.w}px` : '100%'}
					style:height={dims ? `${dims.h}px` : 'auto'}
					style:left={dims ? `${(VISOR - dims.w) / 2 + e.x * VISOR}px` : '0'}
					style:top={dims ? `${(VISOR - dims.h) / 2 + e.y * VISOR}px` : '0'}
					onload={(ev) => {
						const i = ev.currentTarget as HTMLImageElement;
						natural = { naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight };
						const f = arte ? focoPadrao(arte) : null;
						ajustar(f ? enquadramentoDoFoco(f, natural) : { ...e });
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
