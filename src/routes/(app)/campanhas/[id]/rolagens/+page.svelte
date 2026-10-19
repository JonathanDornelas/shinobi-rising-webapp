<script lang="ts">
	// Registro de rolagens da campanha, ao vivo, e o rolador livre (qualquer expressão: 1d20+5, 2d6+1d4+3).
	import BarraRolagem from '#lib/componentes/rolagens/BarraRolagem.svelte';
	import DadoGirando from '#lib/componentes/rolagens/DadoGirando.svelte';
	import ListaRolagens from '#lib/componentes/rolagens/ListaRolagens.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { expressaoValida } from '#lib/rolagens/expressoes.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const mestre = $derived(data.papel === 'mestre');
	let apagadas = $state<string[]>([]);
	// as do servidor e as que chegaram nesta sessão (minhas e ao vivo), sem repetir
	const lista = $derived.by(() => {
		const vistos = new Set<string>();
		return [...rolador.recentes.filter((r) => r.campanha_id === data.campanha.id), ...data.rolagens].filter((r) => {
			if (vistos.has(r.id) || apagadas.includes(r.id)) return false;
			vistos.add(r.id);
			return true;
		});
	});

	let expressao = $state('1d20');
	let rotulo = $state('');
	// svelte-ignore state_referenced_locally
	let personagem = $state(data.fichas.length === 1 ? data.fichas[0].id : '');
	const valida = $derived(expressaoValida(expressao));
	const temD20 = $derived(/(^|[+-])1d20($|[+-])/i.test(expressao.replace(/\s+/g, '')));

	async function rolar() {
		if (!valida) return;
		await rolador.rolar({ campanha: data.campanha.id, expressao: expressao.replace(/\s+/g, ''), rotulo: rotulo.trim() || 'Rolagem livre', personagem: personagem || null, d20: temD20 });
	}
	function dado(lados: number) {
		expressao = `1d${lados}`;
		rolar();
	}
	async function apagar(id: string) {
		const { error } = await supabase().from('rolagens').delete().eq('id', id);
		if (error) return toasts.mostrar('Não foi possível apagar a rolagem.', 'erro');
		apagadas = [...apagadas, id];
		rolador.esquecer(id);
	}
</script>

<main class="grid min-w-0 items-start gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_400px]">
	<div class="flex min-w-0 flex-col gap-3">
		<div class="flex flex-wrap items-center gap-3">
			<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Rolagens</h1>
			<span class="flex items-center gap-1.5 text-[13px] text-mut"><span class="h-2.5 w-2.5 bg-ok" aria-hidden="true"></span>Ao vivo</span>
		</div>
		{#if lista.length}
			<ListaRolagens {lista} aoApagar={mestre ? apagar : undefined} />
		{:else}
			<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
				<DadoGirando tamanho={96} />
				<span class="text-[15px] font-semibold">Nenhuma rolagem ainda.</span>
				<span class="text-sm text-mut">Role pela ficha (perícias, atributos, iniciativa, ataque e dano dos jutsus) ou pelo rolador livre. A mesa vê cada rolagem na hora.</span>
			</div>
		{/if}
	</div>

	<section class="flex flex-col gap-3.5 border-2 border-frame bg-b2 p-4 shadow-[4px_4px_0_var(--ink)] xl:sticky xl:top-4" aria-labelledby="livre-titulo">
		<h2 id="livre-titulo" class="t-h3 m-0 flex items-center gap-2"><Icone id="dado/ic-dado-d20" />Rolador livre</h2>
		{#if data.campanha.arquivada_em}
			<p class="m-0 text-sm text-mut">Campanha arquivada: não dá para rolar.</p>
		{:else}
			<div class="grid grid-cols-7 gap-1.5" role="group" aria-label="Dados rápidos">
				{#each [4, 6, 8, 10, 12, 20, 100] as l (l)}
					<button type="button" class="flex min-h-10 flex-col items-center justify-center gap-0.5 border-2 border-b3 bg-b1 py-1 font-pixel text-xs font-bold hover:border-mut disabled:opacity-60" disabled={!!rolador.rolando} aria-label="Rolar 1d{l}" onclick={() => dado(l)}><DadoGirando tamanho={32} lados={l} />d{l}</button>
				{/each}
			</div>
			<form
				class="flex flex-col gap-3"
				onsubmit={(e) => {
					e.preventDefault();
					rolar();
				}}
			>
				<Campo id="expr" rotulo="Expressão" ajuda="Dados de 2 a 100 lados e modificadores: 1d20+5, 2d6+1d4-1." erro={expressao && !valida ? 'Use algo como 1d20+5 ou 2d6+3.' : undefined}>
					<input id="expr" class="campo t-num" maxlength="60" autocomplete="off" spellcheck="false" bind:value={expressao} aria-invalid={!!expressao && !valida} />
				</Campo>
				<Campo id="rotulo" rotulo="Rótulo (opcional)">
					<input id="rotulo" class="campo" maxlength="80" placeholder="Furtividade na ponte" bind:value={rotulo} />
				</Campo>
				{#if data.fichas.length}
					<Campo id="quem" rotulo="Rolar como">
						<select id="quem" class="campo" bind:value={personagem}>
							<option value="">Eu ({mestre ? 'Mestre' : 'jogador'})</option>
							{#each data.fichas as f (f.id)}<option value={f.id}>{f.nome}</option>{/each}
						</select>
					</Campo>
				{/if}
				<BarraRolagem />
				{#if !temD20 && rolador.modo !== 'normal'}<p class="m-0 text-xs text-mut">Vantagem e desvantagem valem para um 1d20 sozinho na expressão.</p>{/if}
				<button type="submit" class="btn-jogo btn-primario com-icone justify-center" disabled={!valida || !!rolador.rolando}><Icone id="dado/ic-dado-d20" />ROLAR</button>
			</form>
		{/if}
	</section>
</main>
