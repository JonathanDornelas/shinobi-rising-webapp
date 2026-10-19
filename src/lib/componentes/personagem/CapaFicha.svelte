<script lang="ts">
	// Paisagem no topo da ficha: a da vila do personagem, ou a que o dono escolheu (definir_capa_ficha).
	// A escolha abre num modal (rola no celular e fecha com Esc), fora do banner, que corta o que transborda.
	import { invalidateAll } from '$app/navigation';
	import { CAPAS, capaDaVila, urlCapa } from '#lib/campanhas/dominio.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Girando from '../ui/Girando.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		ficha: string;
		capa: string | null;
		vila: string | null | undefined;
		podeTrocar?: boolean;
	}
	let { ficha, capa, vila, podeTrocar = false }: Props = $props();
	const url = $derived(capa ? urlCapa(capa) : capaDaVila(vila));
	let aberto = $state(false);
	let salvando = $state<string | null | false>(false);

	async function escolher(nova: string | null) {
		salvando = nova;
		const { error } = await supabase().rpc('definir_capa_ficha', { ficha, capa: nova });
		salvando = false;
		if (error) return toasts.mostrar('Não foi possível trocar a paisagem.', 'erro');
		aberto = false;
		await invalidateAll();
	}
</script>

<div class="relative h-[120px] overflow-hidden border-b-2 border-ink bg-b1 md:h-[168px]">
	<img src={url} alt="" class="h-full w-full object-cover [image-rendering:pixelated]" />
	<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,var(--b1))]"></div>
	{#if podeTrocar}
		<button type="button" class="absolute top-2 right-2 flex min-h-9 items-center gap-1.5 border-2 border-ink bg-b2/90 px-2.5 font-pixel text-xs font-bold hover:bg-b3" aria-haspopup="dialog" onclick={() => (aberto = true)}>PAISAGEM</button>
	{/if}
</div>

{#if aberto}
	<Modal rotulo="Escolher a paisagem da ficha" largura={720} aoFechar={() => salvando === false && (aberto = false)}>
		<div class="flex flex-col gap-4 p-5 md:p-6">
			<div class="flex items-start gap-3">
				<div class="flex flex-1 flex-col gap-1">
					<h2 class="t-h3 m-0">Paisagem da ficha</h2>
					<p class="m-0 text-sm text-mut">Aparece no topo da ficha, para você e para o grupo.</p>
				</div>
				<button type="button" class="btn-icone h-10 w-10 flex-none" aria-label="Fechar" disabled={salvando !== false} onclick={() => (aberto = false)}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
				</button>
			</div>
			<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Paisagens">
				<button
					type="button"
					role="radio"
					aria-checked={!capa}
					class="col-span-2 flex items-center gap-3 border-2 p-1.5 text-left sm:col-span-3 {!capa ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}"
					disabled={salvando !== false}
					onclick={() => escolher(null)}
				>
					<img src={capaDaVila(vila)} alt="" class="aspect-[256/96] w-32 flex-none object-cover [image-rendering:pixelated]" />
					<span class="flex-1 text-sm font-semibold">Da vila do personagem{!capa ? ' ✓' : ''}</span>
					{#if salvando === null}<Girando />{/if}
				</button>
				{#each CAPAS as c (c.id)}
					{@const on = capa === c.id}
					<button type="button" role="radio" aria-checked={on} class="flex flex-col border-2 text-left {on ? 'border-vermelhao' : 'border-b3 hover:border-mut'}" disabled={salvando !== false} onclick={() => escolher(c.id)}>
						<img src={urlCapa(c.id)} alt="" class="aspect-[256/96] w-full object-cover [image-rendering:pixelated]" loading="lazy" />
						<span class="flex items-center gap-1.5 px-2 py-1.5 text-[13px] font-semibold {on ? 'bg-grena text-papel' : ''}">{c.nome}{on ? ' ✓' : ''}{#if salvando === c.id}<Girando />{/if}</span>
					</button>
				{/each}
			</div>
		</div>
	</Modal>
{/if}
