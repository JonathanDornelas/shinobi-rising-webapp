<script lang="ts">
	// Passo 7 · Especialização inicial: 1 especialização no nível 1 (cap. 19).
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { ELEMENTOS, ESPECIALIZACOES } from '#lib/personagem/dados.ts';
	import Icone from '../ui/Icone.svelte';
	import Opcao from './Opcao.svelte';

	let { c }: { c: Criador } = $props();
	const escolhida = $derived(c.catalogo.especializacoes.find((e) => e.id === c.ficha.especializacao));
	let todos = $state(false);
</script>

<div role="radiogroup" aria-label="Especialização" class="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
	{#each c.catalogo.especializacoes as e (e.id)}
		<Opcao
			rotulo={e.nome}
			selecionado={c.ficha.especializacao === e.id}
			desabilitado={e.bloqueio ?? ''}
			somenteLeitura={!c.editavel}
			sombra={false}
			class="p-2.5"
			aoEscolher={() => {
				c.ficha.especializacao = e.id;
				if (!ESPECIALIZACOES[e.id]?.escolheElemento) c.ficha.especializacaoElemento = null;
				if (c.ficha.equipamento.pacote === 'marionetista' && e.id !== 'marionete') c.ficha.equipamento.pacote = null;
			}}
		>
			<Icone id={e.icone} />
			<span class="font-mincho text-sm leading-[18px] font-bold">{e.nome}</span>
			{#if e.bloqueio}<span class="text-xs leading-4 font-semibold">Pré-requisitos do cap. 15</span>{/if}
		</Opcao>
	{/each}
</div>
{#if c.ficha.especializacao && ESPECIALIZACOES[c.ficha.especializacao]?.escolheElemento}
	<div class="painel flex flex-wrap items-center gap-2 p-3" role="radiogroup" aria-label="Elemento da especialização">
		<span class="text-sm font-semibold">Elemento da especialização:</span>
		{#each ELEMENTOS as e (e.id)}
			{@const on = c.ficha.especializacaoElemento === e.id}
			<button
				type="button"
				role="radio"
				aria-checked={on}
				disabled={!c.editavel}
				class="inline-flex h-11 items-center gap-1 border-2 pr-3 pl-1 text-sm font-semibold text-fg"
				style:border-color={on ? '#C44536' : `color-mix(in srgb, ${e.cor} 55%, transparent)`}
				style:background="color-mix(in srgb, {e.cor} 12%, transparent)"
				onclick={() => (c.ficha.especializacaoElemento = e.id)}><Icone id="elemento/ic-elemento-{e.id}" />{e.nome}{on ? ' ✓' : ''}</button
			>
		{/each}
	</div>
{/if}
{#if escolhida}
	<div class="painel flex flex-col gap-2 px-3.5 py-3 text-sm leading-[21px]">
		<p class="m-0"><b>{escolhida.nome} · Nível 1.</b> {escolhida.niveis[0]?.texto}</p>
		{#if todos}
			{#each escolhida.niveis.slice(1) as n (n.nivel)}<p class="m-0 text-mut"><b>Nível {n.nivel}.</b> {n.texto}</p>{/each}
		{/if}
		<button type="button" class="link self-start text-[13px] font-semibold" onclick={() => (todos = !todos)}>{todos ? 'Esconder os outros níveis' : 'Ver os 3 níveis'}</button>
	</div>
{/if}
