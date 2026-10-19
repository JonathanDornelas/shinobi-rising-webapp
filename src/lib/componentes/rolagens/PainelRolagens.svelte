<script lang="ts">
	// Registro de rolagens em painel flutuante: fica aberto em qualquer tela (regras, ficha, biblioteca) e acompanha a
	// campanha ao vivo; embaixo, um rolador rápido.
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
</script>

<section
	class="camada fixed inset-x-2 bottom-[72px] z-[45] flex max-h-[70vh] flex-col md:inset-x-auto md:top-[76px] md:right-4 md:bottom-auto md:max-h-[calc(100vh-100px)] md:w-[400px]"
	aria-label="Registro de rolagens de {mesa.nome}"
	style:animation="surgir 150ms ease-out"
>
	<header class="flex items-center gap-2 border-b-2 border-b3 py-1.5 pr-1.5 pl-3">
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
