<script lang="ts">
	// Foto: um botão só abre a janela do retrato, com três caminhos: enviar uma imagem do aparelho, escolher uma arte do
	// bestiário ou remover a foto. As duas primeiras passam pelo enquadramento (arrastar e zoom) e viram um webp
	// 256×256 no Storage, em retratos/<ficha>/… (o padrão, gravado por definir_retrato). NPCs e o avatar do perfil passam
	// a pasta e o salvar. A arte do bestiário abre centrada no foco dela e é recortada sem suavizar.
	import { refreshAll } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { enquadramentoDoFoco, focoPadrao } from '#lib/bestiario/foco.ts';
	import type { Criatura } from '#lib/livro/tipos.ts';
	import { caminhoRetrato, LIMITE_ORIGINAL, limitar, recortar, urlRetrato, type Enquadramento } from '#lib/personagem/retrato.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import BuscaBestiario from '../npc/BuscaBestiario.svelte';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		/** Pasta no bucket: o id da ficha, do NPC ou da conta. */
		ficha: string;
		atual: string | null;
		aoMudar?: (caminho: string | null) => void;
		/** Rótulo curto no celular (cabeçalho da ficha). */
		compacto?: boolean;
		/** Grava o caminho escolhido (sem ele, definir_retrato da ficha). */
		salvar?: (caminho: string | null) => PromiseLike<{ error: unknown }>;
	}
	let { ficha, atual, aoMudar, compacto = false, salvar }: Props = $props();
	const gravar = (caminho: string | null) => (salvar ? salvar(caminho) : supabase().rpc('definir_retrato', { ficha, caminho }));

	const VISOR = 256;
	/** A janela do retrato e a tela dentro dela. */
	let aberto = $state(false);
	let tela = $state<'inicio' | 'bestiario' | 'enquadrar'>('inicio');
	let entrada = $state<HTMLInputElement>();
	let fonte = $state<string | null>(null);
	let img = $state<HTMLImageElement>();
	/** Tamanho natural da imagem, lido no onload (naturalWidth não é reativo). */
	let natural = $state<{ naturalWidth: number; naturalHeight: number } | null>(null);
	let e = $state<Enquadramento>({ zoom: 1, x: 0, y: 0 });
	let ocupado = $state(false);
	let arrasto = $state<{ px: number; py: number; x: number; y: number } | null>(null);
	/** A arte do bestiário é pixel art (recorte sem suavizar) e abre no foco dela. */
	let pixelado = $state(false);
	let arte = $state<string | null>(null);
	let fotoQuebrada = $state(false);
	const urlAtual = $derived(urlRetrato(atual));
	$effect(() => {
		void urlAtual;
		fotoQuebrada = false;
	});

	function abrir() {
		tela = 'inicio';
		aberto = true;
	}
	function soltarFonte() {
		if (fonte?.startsWith('blob:')) URL.revokeObjectURL(fonte);
		fonte = null;
	}
	function fechar() {
		if (ocupado) return;
		soltarFonte();
		aberto = false;
	}
	function voltar() {
		if (ocupado) return;
		soltarFonte();
		tela = 'inicio';
	}
	function preparar(src: string, deArte: string | null) {
		soltarFonte();
		natural = null;
		pixelado = !!deArte;
		arte = deArte;
		e = { zoom: 1, x: 0, y: 0 };
		fonte = src;
		tela = 'enquadrar';
	}
	function escolher(ev: Event) {
		const arq = (ev.currentTarget as HTMLInputElement).files?.[0];
		(ev.currentTarget as HTMLInputElement).value = '';
		if (!arq) return;
		if (!arq.type.startsWith('image/')) return toasts.mostrar('Escolha uma imagem (PNG, JPG ou WEBP).', 'erro');
		if (arq.size > LIMITE_ORIGINAL) return toasts.mostrar('Imagem grande demais (máximo 15 MB).', 'erro');
		preparar(URL.createObjectURL(arq), null);
	}
	function usarArte(c: Criatura, estagio: number) {
		const arquivo = (c.estagios[estagio]?.arte ?? c.arte)?.arquivo;
		if (!arquivo) return void toasts.mostrar('Essa criatura ainda não tem arte.', 'aviso');
		preparar(arquivo, arquivo);
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
		ocupado = true;
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
			ocupado = false;
			fechar();
			await refreshAll();
		} catch {
			ocupado = false;
			toasts.mostrar('Não foi possível salvar a foto. Tente outra imagem.', 'erro');
		}
	}

	async function remover() {
		const anterior = atual;
		if (!anterior) return;
		ocupado = true;
		const sb = supabase();
		const { error } = await gravar(null);
		ocupado = false;
		if (error) return toasts.mostrar('Não foi possível remover a foto.', 'erro');
		await sb.storage.from('retratos').remove([anterior]);
		aoMudar?.(null);
		toasts.mostrar('Foto removida.', 'info');
		fechar();
		await refreshAll();
	}

	const opcao = 'group flex w-full items-center gap-3.5 border-2 border-b3 bg-b1 px-3.5 py-3 text-left transition-colors hover:border-[var(--vermelhao)] focus-visible:border-[var(--vermelhao)] disabled:opacity-60';
</script>

<button type="button" class="btn-jogo btn-contorno min-h-9 text-xs {compacto ? 'max-sm:min-h-8 max-sm:px-2' : ''}" aria-haspopup="dialog" onclick={abrir}>
	{#if compacto}<span class="sm:hidden">FOTO</span><span class="max-sm:hidden">{atual ? 'MUDAR FOTO' : 'ESCOLHER FOTO'}</span>{:else}{atual ? 'MUDAR FOTO' : 'ESCOLHER FOTO'}{/if}
</button>
<input bind:this={entrada} type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="sr-only" tabindex="-1" aria-hidden="true" onchange={escolher} />

{#snippet cabeca(titulo: string, comVolta: boolean)}
	<div class="flex items-center gap-2">
		{#if comVolta}
			<button type="button" class="-ml-1.5 flex h-9 w-9 flex-none items-center justify-center text-mut hover:text-fg disabled:opacity-50" aria-label="Voltar" disabled={ocupado} onclick={voltar}>
				<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" class="fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d="M11 3L5 9l6 6" /></svg>
			</button>
		{/if}
		<h2 class="t-h3 m-0 flex-1">{titulo}</h2>
	</div>
{/snippet}

{#if aberto}
	<Modal rotulo="Foto do retrato" largura={tela === 'bestiario' ? 600 : tela === 'enquadrar' ? 420 : 520} aoFechar={fechar}>
		<div class="flex flex-col gap-4 p-6 max-sm:p-4">
			{#if tela === 'inicio'}
				{@render cabeca('Foto do retrato', false)}
				<div class="grid items-start gap-5 sm:grid-cols-[136px_minmax(0,1fr)]">
					<!-- a foto de agora, na moldura do retrato -->
					<figure class="m-0 flex flex-col items-center gap-2 max-sm:flex-row max-sm:items-center max-sm:gap-3">
						<div class="relative h-[136px] w-[136px] flex-none border-2 border-[var(--vermelhao-lo)] bg-grena shadow-[4px_4px_0_var(--ink)] max-sm:h-20 max-sm:w-20">
							{#if urlAtual && !fotoQuebrada}
								<img src={urlAtual} alt="Foto atual" class="h-full w-full object-cover" onerror={() => (fotoQuebrada = true)} />
							{:else}
								<span class="absolute inset-0 flex items-center justify-center p-3 text-center text-xs leading-4 text-papel/80">Sem foto</span>
							{/if}
						</div>
						<figcaption class="text-xs text-mut">{atual ? 'Foto atual' : 'Nenhuma foto ainda'}</figcaption>
					</figure>
					<div class="flex flex-col gap-2.5">
						<button type="button" class={opcao} disabled={ocupado} onclick={() => entrada?.click()}>
							<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" class="flex-none fill-none stroke-current stroke-2 text-mut [stroke-linecap:square] group-hover:text-[var(--vermelhao)]"><path d="M14 18V5M8 11l6-6 6 6M4 17v6h20v-6" /></svg>
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="text-[15px] leading-5 font-semibold">Enviar uma imagem</span>
								<span class="text-xs leading-4 text-mut">Do seu aparelho: PNG, JPG ou WEBP, até 15 MB.</span>
							</span>
						</button>
						<button type="button" class={opcao} disabled={ocupado} onclick={() => (tela = 'bestiario')}>
							<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" class="flex-none fill-none stroke-current stroke-2 text-mut [stroke-linecap:square] group-hover:text-[var(--vermelhao)]"><path d="M5 4h14l4 4v16H5zM9 11h10M9 15h10M9 19h6" /></svg>
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="text-[15px] leading-5 font-semibold">Escolher no bestiário</span>
								<span class="text-xs leading-4 text-mut">Uma arte de ninja ou criatura do livro, já centrada no rosto.</span>
							</span>
						</button>
						<p class="m-0 text-xs leading-4 text-mut">Nos dois casos você enquadra num quadrado antes de salvar.</p>
					</div>
				</div>
				<div class="flex items-center gap-2.5 border-t-2 border-b3 pt-4">
					{#if atual}
						<button type="button" class="inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-err hover:underline disabled:opacity-60" disabled={ocupado} aria-busy={ocupado} onclick={remover}>
							{#if ocupado}<Girando />{:else}<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d="M3 4h10M6 4V2h4v2M4.5 4l.8 10h5.4l.8-10" /></svg>{/if}
							Remover foto
						</button>
					{/if}
					<span class="flex-1"></span>
					<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={fechar}>FECHAR</button>
				</div>
			{:else if tela === 'bestiario'}
				{@render cabeca('Escolher no bestiário', true)}
				<BuscaBestiario onEscolher={usarArte} />
			{:else if fonte}
				{@render cabeca('Enquadrar a foto', true)}
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
					<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={voltar}>VOLTAR</button>
					<button type="button" class="btn-jogo btn-primario" disabled={ocupado || !dims} aria-busy={ocupado} onclick={enviar}>{#if ocupado}<Girando />{/if}USAR ESTA FOTO</button>
				</div>
			{/if}
		</div>
	</Modal>
{/if}
