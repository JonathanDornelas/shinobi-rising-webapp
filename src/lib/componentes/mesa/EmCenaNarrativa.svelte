<script lang="ts">
	// Quem está em cena na narrativa: os retratos que o Mestre traz para cima da imagem, um a um (lib/mesa/narrativa.ts).
	// Cada um entra saindo de um desfoque, sobe um pouco e ganha um brilho que corre pela moldura uma vez; ao sair, se
	// desfaz no ar. Os outros escorregam para o lugar (flip). Quem pede menos movimento vê só o aparecer e sumir.
	import { flip } from 'svelte/animate';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import type { EmCena } from '#lib/mesa/narrativa.ts';

	let {
		lista,
		mestre,
		foto,
		nomeReal,
		aoTirar,
		aoNome
	}: {
		lista: EmCena[];
		mestre: boolean;
		foto: (e: EmCena) => string | null;
		/** o Mestre vê o nome verdadeiro de quem está com o nome escondido */
		nomeReal?: (chave: string) => string | null;
		aoTirar?: (chave: string) => void;
		/** esconde ou mostra o nome para o grupo */
		aoNome?: (chave: string) => void;
	} = $props();

	const calmo = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	function entrar(_: Element) {
		return {
			duration: calmo ? 200 : 1100,
			easing: cubicOut,
			css: (t: number) => (calmo ? `opacity: ${t}` : `opacity: ${t}; filter: blur(${(1 - t) * 10}px) brightness(${0.6 + 0.4 * t}); transform: translateY(${(1 - t) * 18}px) scale(${0.95 + 0.05 * t})`)
		};
	}
	function sair(_: Element) {
		return {
			duration: calmo ? 150 : 700,
			easing: cubicIn,
			css: (t: number) => (calmo ? `opacity: ${t}` : `opacity: ${t}; filter: blur(${(1 - t) * 8}px); transform: translateY(${(t - 1) * 10}px) scale(${1 + (1 - t) * 0.03})`)
		};
	}
	const iniciais = (n: string | null) => (n ? n.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() : '?');
	/** os retratos encolhem para caber todos lado a lado */
	const largura = $derived(`min(clamp(92px, 13vw, 196px), calc((100% - ${(lista.length - 1) * 22}px) / ${Math.max(1, lista.length)}))`);
</script>

<div class="pointer-events-none absolute inset-x-4 bottom-[92px] z-[5] flex items-end justify-center gap-[22px] max-md:bottom-16" aria-label="Em cena">
	{#each lista as e (e.chave)}
		{@const src = foto(e)}
		{@const nome = e.nome ?? (mestre ? nomeReal?.(e.chave) : null)}
		<figure class="carta pointer-events-auto relative m-0" aria-label={e.nome ?? "Nome escondido"} style:width={largura} in:entrar out:sair animate:flip={{ duration: calmo ? 0 : 600, easing: cubicOut }}>
			<div class="moldura" class:sem-anim={calmo}>
				{#if src}
					<img
						{src}
						alt=""
						class="absolute inset-0 h-full w-full object-cover"
						style:object-position={e.foco ? `${e.foco.x * 100}% ${e.foco.y * 100}%` : '50% 22%'}
						style:transform={e.foco && e.foco.zoom > 1 ? `scale(${Math.min(e.foco.zoom, 2.5)})` : undefined}
						style:transform-origin={e.foco ? `${e.foco.x * 100}% ${e.foco.y * 100}%` : undefined}
						style:image-rendering={e.retrato?.startsWith('/') ? 'pixelated' : 'auto'}
					/>
				{:else}
					<span class="absolute inset-0 flex items-center justify-center font-mincho text-[clamp(28px,4vw,52px)] font-bold text-papel/70">{iniciais(nome ?? null)}</span>
				{/if}
				<span class="canto tl"></span><span class="canto tr"></span><span class="canto bl"></span><span class="canto br"></span>
				<div class="legenda absolute inset-x-0 bottom-0 px-2 pb-2 text-center">
					<span class="nome block truncate font-mincho text-[clamp(12px,1.25vw,17px)] leading-tight font-bold" class:oculto={!e.nome}>{e.nome ?? '???'}</span>
					{#if mestre && !e.nome && nome}<span class="block truncate text-[10px] leading-3 text-papel/60">{nome} (escondido)</span>{/if}
				</div>
			</div>
			{#if mestre}
				<!-- só o Mestre: esconder o nome do grupo e tirar de cena -->
				<div class="controles absolute -top-3 right-1 flex gap-1">
					{#if aoNome && (e.chave.startsWith('npc:') || e.chave.startsWith('ficha:'))}<button type="button" class="h-7 min-w-7 border border-[rgba(201,162,92,.6)] bg-[rgba(14,11,10,.88)] px-1 font-pixel text-[11px] font-bold text-papel" title={e.nome ? 'Esconder o nome do grupo' : 'Mostrar o nome ao grupo'} aria-label={e.nome ? `Esconder o nome de ${e.nome}` : 'Mostrar o nome'} onclick={() => aoNome(e.chave)}>{e.nome ? '?' : 'Aa'}</button>{/if}
					{#if aoTirar}<button type="button" class="h-7 w-7 border border-[rgba(201,162,92,.6)] bg-[rgba(14,11,10,.88)] font-pixel text-xs font-bold text-papel" title="Tirar de cena" aria-label="Tirar {nome ?? 'o personagem'} de cena" onclick={() => aoTirar(e.chave)}>✕</button>{/if}
				</div>
			{/if}
		</figure>
	{/each}
</div>

<style>
	.carta {
		filter: drop-shadow(0 18px 26px rgba(0, 0, 0, 0.55));
	}
	/* moldura em três finos: a borda de papel, o vão escuro e o fio dourado, com o retrato escurecendo embaixo para o nome */
	.moldura {
		position: relative;
		aspect-ratio: 3 / 4;
		overflow: hidden;
		background: #1b1210;
		border: 1px solid rgba(244, 228, 214, 0.55);
		box-shadow:
			0 0 0 3px rgba(14, 11, 10, 0.88),
			0 0 0 4px rgba(201, 162, 92, 0.55),
			inset 0 0 22px rgba(0, 0, 0, 0.55);
	}
	.moldura::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, transparent 52%, rgba(14, 11, 10, 0.88) 100%);
		pointer-events: none;
	}
	/* o brilho que corre pela moldura uma vez, logo depois de entrar */
	.moldura::before {
		content: '';
		position: absolute;
		inset: -40%;
		z-index: 2;
		background: linear-gradient(115deg, transparent 42%, rgba(255, 236, 200, 0.28) 50%, transparent 58%);
		transform: translateX(-70%);
		animation: brilho 1.6s 0.7s ease-out forwards;
		pointer-events: none;
	}
	.moldura.sem-anim::before {
		animation: none;
		opacity: 0;
	}
	@keyframes brilho {
		to {
			transform: translateX(70%);
		}
	}
	/* os cantos: pequenos colchetes dourados por dentro do fio, à moda dos pergaminhos */
	.canto {
		position: absolute;
		z-index: 3;
		width: 12px;
		height: 12px;
		border-color: rgba(222, 186, 116, 0.85);
		border-style: solid;
		border-width: 0;
		pointer-events: none;
	}
	.tl {
		top: 5px;
		left: 5px;
		border-top-width: 2px;
		border-left-width: 2px;
	}
	.tr {
		top: 5px;
		right: 5px;
		border-top-width: 2px;
		border-right-width: 2px;
	}
	.bl {
		bottom: 5px;
		left: 5px;
		border-bottom-width: 2px;
		border-left-width: 2px;
	}
	.br {
		bottom: 5px;
		right: 5px;
		border-bottom-width: 2px;
		border-right-width: 2px;
	}
	.legenda {
		z-index: 3;
	}
	.nome {
		color: #f4e4d6;
		letter-spacing: 0.03em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
	}
	.nome.oculto {
		color: rgba(244, 228, 214, 0.7);
		letter-spacing: 0.2em;
	}
	.controles {
		opacity: 0;
		transition: opacity 0.2s;
	}
	.carta:hover .controles,
	.carta:focus-within .controles {
		opacity: 1;
	}
	@media (hover: none) {
		.controles {
			opacity: 1;
		}
	}
</style>
