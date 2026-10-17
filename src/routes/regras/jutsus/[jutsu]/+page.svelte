<script lang="ts">
	// D5 · Detalhe do jutsu em página cheia (acesso direto pela URL e no mobile).
	import DetalheJutsu from '#lib/componentes/regras/DetalheJutsu.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="mx-auto box-border flex w-full max-w-[768px] flex-col gap-4 px-4 pt-5 pb-12 md:px-6 md:pt-8 md:pb-14">
	<nav aria-label="Trilha" class="flex flex-wrap items-center gap-2 text-sm leading-5 font-medium">
		<a href="/regras" class="link">Regras</a><span class="font-pixel text-xs text-mut">▸</span>
		<a href="/regras/jutsus" class="link">Jutsus</a><span class="font-pixel text-xs text-mut">▸</span>
		<span aria-current="page">{data.jutsu.nome}</span>
	</nav>
	<h1 class="sr-only">{data.jutsu.nome}</h1>
	<DetalheJutsu jutsu={data.jutsu} nomeCla={data.nomeCla} />
</main>

<Rodape />
