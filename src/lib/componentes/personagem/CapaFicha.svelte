<script lang="ts">
	// Paisagem no topo da ficha: a da vila do personagem, ou a que o dono escolheu (definir_capa_ficha).
	import { invalidateAll } from '$app/navigation';
	import { CAPAS, capaDaVila, urlCapa } from '#lib/campanhas/dominio.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';

	interface Props {
		ficha: string;
		capa: string | null;
		vila: string | null | undefined;
		podeTrocar?: boolean;
	}
	let { ficha, capa, vila, podeTrocar = false }: Props = $props();
	const url = $derived(capa ? urlCapa(capa) : capaDaVila(vila));
	let aberto = $state(false);
	let salvando = $state(false);

	async function escolher(nova: string | null) {
		salvando = true;
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
		<div class="absolute top-2 right-2" data-menu>
			<button type="button" class="flex min-h-9 items-center gap-1.5 border-2 border-ink bg-b2/90 px-2.5 font-pixel text-xs font-bold hover:bg-b3" aria-expanded={aberto} onclick={() => (aberto = !aberto)}>PAISAGEM</button>
			{#if aberto}
				<div role="dialog" aria-label="Escolher a paisagem da ficha" class="camada absolute top-11 right-0 z-30 grid w-[min(92vw,420px)] grid-cols-3 gap-2 p-2.5">
					<button type="button" class="col-span-3 min-h-9 border-2 px-2 text-left text-[13px] font-semibold {!capa ? 'border-vermelhao' : 'border-b3 hover:border-mut'}" disabled={salvando} onclick={() => escolher(null)}>
						Da vila do personagem{!capa ? ' ✓' : ''}
					</button>
					{#each CAPAS as c (c.id)}
						{@const on = capa === c.id}
						<button type="button" class="flex flex-col border-2 text-left {on ? 'border-vermelhao' : 'border-b3 hover:border-mut'}" disabled={salvando} aria-pressed={on} onclick={() => escolher(c.id)}>
							<img src={urlCapa(c.id)} alt="" class="aspect-[256/96] w-full object-cover [image-rendering:pixelated]" loading="lazy" />
							<span class="px-1.5 py-1 text-xs font-semibold">{c.nome}{on ? ' ✓' : ''}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
