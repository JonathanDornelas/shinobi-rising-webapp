<script lang="ts">
	// Registro de rolagens em painel flutuante: fica aberto em qualquer tela (regras, ficha, biblioteca) e acompanha a
	// campanha ao vivo; embaixo, um rolador rápido. Arrasta pelo cabeçalho (mouse ou toque) para qualquer lugar da tela;
	// a posição fica lembrada neste aparelho. Pela alça, as setas do teclado também movem; dois cliques no cabeçalho
	// (ou Home na alça) devolvem o painel ao canto.
	import { onMount, untrack } from 'svelte';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { expressaoValida } from '#lib/rolagens/expressoes.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import Icone from '../ui/Icone.svelte';
	import ListaRolagens from './ListaRolagens.svelte';

	let { mesa }: { mesa: { id: string; nome: string } } = $props();
	let carregadas = $state<Rolagem[]>([]);
	let carregando = $state(true);
	let expressao = $state('1d20');

	$effect(() => {
		const id = mesa.id;
		carregando = true;
		supabase()
			.from('rolagens')
			.select('*')
			.eq('campanha_id', id)
			.order('criada_em', { ascending: false })
			.limit(60)
			.then(({ data }) => {
				if (mesa.id !== id) return;
				carregadas = (data ?? []) as Rolagem[];
				carregando = false;
			});
	});
	const lista = $derived.by(() => {
		const vistos = new Set<string>();
		return [...rolador.recentes.filter((r) => r.campanha_id === mesa.id), ...carregadas].filter((r) => !vistos.has(r.id) && !!vistos.add(r.id));
	});

	const valida = $derived(expressaoValida(expressao));
	function rolar(e = expressao) {
		const x = e.replace(/\s+/g, '');
		if (!expressaoValida(x)) return;
		rolador.rolar({ campanha: mesa.id, expressao: x, rotulo: 'Rolagem rápida', d20: /(^|[+-])1d20($|[+-])/.test(x) });
	}

	// ---------------------------------------------------------------- arrastar
	/** Canto superior esquerdo do painel; null = posição padrão (canto direito no desktop, embaixo no celular). */
	let pos = $state<{ x: number; y: number } | null>(null);
	let painel = $state<HTMLElement>();
	let largura = $state(1440);
	let altura = $state(900);
	let arrasto = $state<{ dx: number; dy: number } | null>(null);
	/** Parte do cabeçalho que sempre fica na tela, para dar para pegar o painel de volta. */
	const VISIVEL = 56;
	const larguraPainel = $derived(Math.min(400, largura - 16));

	onMount(() => {
		const salvo = ler<{ x: number; y: number } | null>('painel-rolagens-pos', null);
		if (salvo && Number.isFinite(salvo.x) && Number.isFinite(salvo.y)) pos = limitar(salvo);
	});

	function limitar(p: { x: number; y: number }) {
		return {
			x: Math.round(Math.min(Math.max(p.x, 0), Math.max(0, largura - larguraPainel))),
			y: Math.round(Math.min(Math.max(p.y, 0), Math.max(0, altura - VISIVEL)))
		};
	}
	// a janela mudou de tamanho (ou girou): o painel continua alcançável
	$effect(() => {
		void largura;
		void altura;
		untrack(() => {
			if (!pos) return;
			const l = limitar(pos);
			if (l.x !== pos.x || l.y !== pos.y) pos = l;
		});
	});

	function mover(p: { x: number; y: number } | null) {
		pos = p ? limitar(p) : null;
		gravar('painel-rolagens-pos', pos);
	}
	const atual = () => {
		const r = painel!.getBoundingClientRect();
		return { x: r.left, y: r.top };
	};

	// dois cliques (ou dois toques) no cabeçalho: volta ao canto. O dblclick do navegador não chega, porque o
	// pointerdown do arrasto é cancelado; por isso a contagem é feita aqui.
	let ultimoToque = 0;
	function pegar(e: PointerEvent) {
		// botões, links e campos do cabeçalho continuam clicáveis
		if (e.button !== 0 || (e.target as HTMLElement).closest('a, input, button:not([data-alca])')) return;
		if (e.timeStamp - ultimoToque < 350) {
			ultimoToque = 0;
			e.preventDefault();
			return mover(null);
		}
		ultimoToque = e.timeStamp;
		const p = atual();
		arrasto = { dx: e.clientX - p.x, dy: e.clientY - p.y };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function arrastar(e: PointerEvent) {
		if (!arrasto) return;
		pos = limitar({ x: e.clientX - arrasto.dx, y: e.clientY - arrasto.dy });
	}
	function soltar() {
		if (!arrasto) return;
		arrasto = null;
		gravar('painel-rolagens-pos', pos);
	}
	function teclado(e: KeyboardEvent) {
		const passo = e.shiftKey ? 96 : 24;
		const d: Record<string, [number, number]> = { ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] };
		if (e.key === 'Home') {
			e.preventDefault();
			return mover(null);
		}
		if (!d[e.key]) return;
		e.preventDefault();
		const p = pos ?? atual();
		mover({ x: p.x + d[e.key][0], y: p.y + d[e.key][1] });
	}
</script>

<svelte:window bind:innerWidth={largura} bind:innerHeight={altura} />

<section
	bind:this={painel}
	class="camada fixed z-[45] flex flex-col {pos ? '' : 'inset-x-2 bottom-[72px] max-h-[70vh] md:inset-x-auto md:top-[76px] md:right-4 md:bottom-auto md:max-h-[calc(100vh-100px)] md:w-[400px]'}"
	style:left={pos ? `${pos.x}px` : undefined}
	style:top={pos ? `${pos.y}px` : undefined}
	style:width={pos ? `${larguraPainel}px` : undefined}
	style:max-height={pos ? `${Math.max(VISIVEL, Math.min(altura * 0.7, altura - pos.y - 8))}px` : undefined}
	style:animation="surgir 150ms ease-out"
	aria-label="Registro de rolagens de {mesa.nome}"
>
	<header
		class="flex touch-none items-center gap-2 border-b-2 border-b3 py-1.5 pr-1.5 pl-1 select-none {arrasto ? 'cursor-grabbing' : 'cursor-grab'}"
		title="Arraste para mover · dois cliques para voltar ao canto"
		role="presentation"
		onpointerdown={pegar}
		onpointermove={arrastar}
		onpointerup={soltar}
		onpointercancel={soltar}
	>
		<button
			type="button"
			data-alca
			class="flex h-9 w-6 flex-none items-center justify-center text-mut hover:text-fg {arrasto ? 'cursor-grabbing' : 'cursor-grab'}"
			aria-label="Mover o painel de rolagens (setas; Shift move mais; Home volta ao canto)"
			onkeydown={teclado}
		>
			<svg width="10" height="18" viewBox="0 0 10 18" fill="currentColor" aria-hidden="true"><rect x="0" y="0" width="4" height="4" /><rect x="6" y="0" width="4" height="4" /><rect x="0" y="7" width="4" height="4" /><rect x="6" y="7" width="4" height="4" /><rect x="0" y="14" width="4" height="4" /><rect x="6" y="14" width="4" height="4" /></svg>
		</button>
		<Icone id="dado/ic-dado-d20" />
		<span class="flex min-w-0 flex-1 flex-col">
			<span class="font-pixel text-xs leading-4 font-bold tracking-[0.06em] text-mut">ROLAGENS · AO VIVO</span>
			<span class="truncate text-sm leading-5 font-semibold">{mesa.nome}</span>
		</span>
		<a href="/campanhas/{mesa.id}/rolagens" class="link text-xs font-semibold" onclick={() => rolador.alternarPainel(false)}>Registro completo</a>
		<button type="button" class="btn-icone h-9 w-9" aria-label="Fechar o painel de rolagens" onclick={() => rolador.alternarPainel(false)}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
		</button>
	</header>
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if lista.length}
			<ListaRolagens {lista} compacto />
		{:else}
			<p class="m-0 px-3 py-6 text-center text-sm text-mut">{carregando ? 'Carregando…' : 'Nenhuma rolagem ainda nesta campanha.'}</p>
		{/if}
	</div>
	<form
		class="flex items-center gap-1.5 border-t-2 border-b3 p-2"
		onsubmit={(e) => {
			e.preventDefault();
			rolar();
		}}
	>
		<input class="campo t-num h-10 min-w-0 flex-1 text-sm" aria-label="Expressão" maxlength="60" autocomplete="off" spellcheck="false" bind:value={expressao} aria-invalid={!!expressao && !valida} />
		<button type="submit" class="btn-jogo btn-primario min-h-10 px-3 text-xs" disabled={!valida || !!rolador.rolando}>ROLAR</button>
		<button type="button" class="min-h-10 border-2 border-b3 px-2 font-pixel text-xs font-bold hover:border-mut" disabled={!!rolador.rolando} onclick={() => rolar('1d20')}>d20</button>
	</form>
</section>
