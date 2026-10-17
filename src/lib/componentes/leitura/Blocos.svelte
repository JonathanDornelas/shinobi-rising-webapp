<script lang="ts">
	// Renderiza os blocos de conteúdo do livro (D2 e trechos em catálogos e clãs).
	import type { Bloco, ClaResumo, Habilidade, ItemLista, Jutsu } from '#lib/livro/tipos.ts';
	import CardHabilidade from '../regras/CardHabilidade.svelte';
	import CardJutsu from '../regras/CardJutsu.svelte';
	import CardCla from '../regras/CardCla.svelte';
	import Icone from '../ui/Icone.svelte';
	import Blocos from './Blocos.svelte';
	import Destaque from './Destaque.svelte';
	import Epigrafe from './Epigrafe.svelte';
	import Tabela from './Tabela.svelte';
	import Texto from './Texto.svelte';
	import Titulo from './Titulo.svelte';

	interface Props {
		blocos: Bloco[];
		jutsus?: Record<string, Jutsu>;
		habilidades?: Record<string, Habilidade>;
		clas?: ClaResumo[];
		/** Texto menor (caixas de destaque, painéis de catálogo). */
		compacto?: boolean;
		/** Títulos viram texto simples, sem âncora (blocos dentro de cards). */
		semAncoras?: boolean;
	}
	let { blocos, jutsus = {}, habilidades = {}, clas = [], compacto = false, semAncoras = false }: Props = $props();

	const corpo = $derived(compacto ? 'text-[15px] leading-[23px]' : 'text-[length:var(--leitura)] leading-[var(--leitura-linha)]');
</script>

{#snippet itens(lista: ItemLista[], ordenada: boolean)}
	<svelte:element this={ordenada ? 'ol' : 'ul'} class="m-0 flex list-none flex-col gap-1.5 p-0 {corpo}">
		{#each lista as it, i (i)}
			<li class="relative pl-6 text-pretty">
				{#if ordenada}
					<span class="t-num absolute top-0 left-0 text-[0.85em] text-mut">{i + 1}.</span>
				{:else}
					<span
						class="absolute left-1 h-1.5 w-1.5 bg-vermelhao"
						style:top={compacto ? '8.5px' : 'calc(var(--leitura-linha) / 2 - 3px)'}
						aria-hidden="true"
					></span>
				{/if}
				<Texto trechos={it.c} />
				{#if it.sub}<div class="mt-1.5">{@render itens(it.sub, false)}</div>{/if}
			</li>
		{/each}
	</svelte:element>
{/snippet}

{#each blocos as b, i (i)}
	{#if b.tipo === 'p'}
		<p class="m-0 text-pretty {corpo}"><Texto trechos={b.c} /></p>
	{:else if b.tipo === 'h'}
		{#if semAncoras}
			<h4 class="m-0 mt-1 text-sm leading-5 font-bold tracking-[.06em] uppercase">{b.texto}</h4>
		{:else}
			<Titulo nivel={b.nivel} id={b.id} texto={b.texto} />
		{/if}
	{:else if b.tipo === 'lista'}
		{@render itens(b.itens, b.ordenada)}
	{:else if b.tipo === 'formula'}
		<div class="flex items-center justify-center gap-3 border-2 border-frame bg-b2 px-4 py-3.5 text-center">
			<Icone id="dado/ic-dado-d20" />
			<span class="text-base leading-6 font-semibold md:text-[17px]">{b.texto}</span>
		</div>
	{:else if b.tipo === 'epigrafe'}
		<Epigrafe texto={b.texto} autor={b.autor} />
	{:else if b.tipo === 'destaque'}
		<Destaque variante={b.variante} titulo={b.titulo}>
			<Blocos blocos={b.blocos} {jutsus} {habilidades} compacto semAncoras />
		</Destaque>
	{:else if b.tipo === 'tabela'}
		<Tabela cab={b.cab} linhas={b.linhas} />
	{:else if b.tipo === 'jutsu' && jutsus[b.slug]}
		<CardJutsu jutsu={jutsus[b.slug]} rodape={false} />
	{:else if b.tipo === 'habilidade' && habilidades[b.slug]}
		<CardHabilidade habilidade={habilidades[b.slug]} />
	{:else if b.tipo === 'clas'}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each clas as c (c.slug)}<CardCla cla={c} />{/each}
		</div>
	{/if}
{/each}
