<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import PaletaBusca from '#lib/componentes/busca/PaletaBusca.svelte';
	import Dock from '#lib/componentes/shell/Dock.svelte';
	import FaixaOffline from '#lib/componentes/shell/FaixaOffline.svelte';
	import Navbar from '#lib/componentes/shell/Navbar.svelte';
	import Toaster from '#lib/componentes/ui/Toaster.svelte';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { preferencias } from '#lib/estado/preferencias.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	onMount(() => {
		preferencias.iniciar();
		paleta.iniciar();
		sessao.iniciar(data.usuario);
	});

	function atalho(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			if (paleta.aberta) paleta.fechar();
			else paleta.abrir();
		}
	}

	const titulo = $derived(page.data.titulo ? `${page.data.titulo} · Shinobi no Michi` : 'Shinobi no Michi — O Caminho do Ninja');
</script>

<svelte:window onkeydown={atalho} />
<svelte:head>
	<title>{titulo}</title>
	{#if page.data.descricao}<meta name="description" content={page.data.descricao} />{/if}
</svelte:head>

<a href="#conteudo" class="sr-only z-[80] bg-vermelhao px-4 py-3 font-pixel font-bold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">PULAR PARA O CONTEÚDO</a>

<div class="flex min-h-screen flex-col overflow-x-clip pb-16 md:pb-0">
	<Navbar />
	<FaixaOffline />
	<div id="conteudo" class="flex flex-1 flex-col">
		{@render children()}
	</div>
</div>

<Dock />
<Toaster />
{#if paleta.aberta}<PaletaBusca />{/if}
