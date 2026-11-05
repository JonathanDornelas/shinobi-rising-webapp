<script lang="ts">
	import { SITE } from '#lib/site.ts';
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import PaletaBusca from '#lib/componentes/busca/PaletaBusca.svelte';
	import CartaoTermo from '#lib/componentes/leitura/CartaoTermo.svelte';
	import Dock from '#lib/componentes/shell/Dock.svelte';
	import FaixaOffline from '#lib/componentes/shell/FaixaOffline.svelte';
	import Navbar from '#lib/componentes/shell/Navbar.svelte';
	import Toaster from '#lib/componentes/ui/Toaster.svelte';
	import MesaRolagens from '#lib/componentes/rolagens/MesaRolagens.svelte';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { favoritos } from '#lib/estado/favoritos.svelte.ts';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { preferencias } from '#lib/estado/preferencias.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	onMount(() => {
		preferencias.iniciar();
		paleta.iniciar();
		favoritos.iniciar();
		sessao.iniciar(data.usuario);
		rolador.iniciar();
	});

	function atalho(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			if (paleta.aberta) paleta.fechar();
			else paleta.abrir();
		}
	}

	const titulo = $derived(page.data.titulo ? `${page.data.titulo} · Rising Shinobi` : 'Rising Shinobi · RPG de mesa no universo shinobi');
	const descricao = $derived((page.data.descricao as string | undefined) ?? 'RPG de mesa ambientado no universo shinobi, de Genin a lenda: o livro de regras completo, com fichas, clãs, jutsus, campanhas e mesa tática online.');
</script>

<svelte:window onkeydown={atalho} />
<svelte:head>
	<title>{titulo}</title>
	<meta name="description" content={descricao} />
	<link rel="canonical" href="{SITE}{page.url.pathname === '/' ? '' : page.url.pathname}" />
	<meta property="og:site_name" content="Rising Shinobi" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={page.data.titulo ?? 'Rising Shinobi'} />
	<meta property="og:description" content={descricao} />
	<meta property="og:image" content="{SITE}/marca/compartilhar.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
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
<MesaRolagens />
<CartaoTermo />
{#if paleta.aberta}<PaletaBusca />{/if}
