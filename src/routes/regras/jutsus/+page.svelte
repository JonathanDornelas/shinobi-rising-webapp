<script lang="ts">
	// D4 · Catálogo de jutsus: o explorador (filtros, busca, favoritos e quatro visualizações) com os filtros na URL.
	// Abrir um jutsu mostra o D5 em modal com URL própria (shallow routing).
	import ExploradorJutsus from '#lib/componentes/regras/ExploradorJutsus.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import type { Jutsu } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-4 px-4 pt-4 pb-12 md:px-6 md:pt-8 md:pb-14">
	<div class="hidden flex-col gap-1.5 md:flex">
		<a href="/regras/jutsus-e-elementos#catalogo-de-jutsus" class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title hover:underline">CAP. 8 E 10</a>
		<h1 class="t-h1 m-0">Jutsus</h1>
	</div>
	<h1 class="sr-only md:hidden">Jutsus</h1>

	<ExploradorJutsus jutsus={data.jutsus as Jutsu[]} nomesCla={data.nomesCla} url="/regras/jutsus" />
</main>

<Rodape />
