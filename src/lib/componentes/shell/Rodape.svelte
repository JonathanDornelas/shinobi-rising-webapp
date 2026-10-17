<script lang="ts">
	// Rodapé das páginas públicas (6.2): "Livro de Regras v18.0", links da documentação e 「忍道」.
	interface Props {
		/** Variante curta usada no fim dos capítulos. */
		leitura?: boolean;
	}
	let { leitura = false }: Props = $props();
</script>

<footer class="border-t-2 border-ink bg-b0 px-4 py-5 text-sm leading-5 font-medium text-[#D9C2A7] md:px-6 md:py-7">
	{#if leitura}
		<div class="flex items-center gap-4">
			<span class="font-jp text-xl leading-none font-extrabold text-vermelhao" title="Shinobi no Michi: o caminho do ninja">「忍道」</span>
			<span>Que o seu Caminho do Ninja seja repleto de aventuras!</span>
		</div>
	{:else}
		<div class="mx-auto flex max-w-[1280px] flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-7">
			<span class="font-pixel text-sm leading-none font-bold tracking-[.08em] text-b0fg">LIVRO DE REGRAS V18.0</span>
			<nav class="flex flex-wrap gap-x-5 gap-y-2" aria-label="Documentação">
				<a class="link text-[#D9C2A7]" href="/regras/introducao">Parte I · Fundamentos</a>
				<a class="link text-[#D9C2A7]" href="/regras/criacao-de-personagem">Criação de Personagem</a>
				<a class="link text-[#D9C2A7]" href="/regras/glossario">Glossário</a>
				<a class="link text-[#D9C2A7]" href="/regras/referencia-rapida">Referência rápida</a>
			</nav>
			<span class="hidden flex-1 md:block"></span>
			<span class="font-jp text-[22px] leading-none font-extrabold text-vermelhao" title="Shinobi no Michi: o caminho do ninja">「忍道」</span>
		</div>
	{/if}
</footer>
