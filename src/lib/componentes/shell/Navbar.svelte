<script lang="ts">
	// Navbar (G1): desktop 64 · tablet 64 compacta · mobile 56 mínima.
	// Fase da documentação: só "Regras", busca e tema (conta e campanhas chegam na próxima fase).
	import { page } from '$app/state';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { preferencias } from '#lib/estado/preferencias.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import Traco from '../ui/Traco.svelte';

	let titulo = $derived((page.data.navTitulo as string | undefined) ?? 'SHINOBI NO MICHI');
	let regrasAtivo = $derived(page.url.pathname.startsWith('/regras') || page.url.pathname.startsWith('/busca'));
	const rotuloTema = $derived(preferencias.tema === 'sumi' ? 'Mudar para o tema claro (washi)' : 'Mudar para o tema escuro (sumi)');
</script>

<header class="flex h-14 items-center print:hidden gap-2.5 border-b-2 border-ink bg-b0 pr-1.5 pl-3 md:h-16 md:gap-4 md:px-5 lg:gap-6 lg:px-6">
	<a href="/" class="flex items-center gap-2.5" aria-label="Shinobi no Michi, página inicial">
		<Icone id="marca/ic-marca" />
		<span class="hidden font-pixel text-[17px] leading-none font-bold tracking-[.08em] whitespace-nowrap text-b0fg lg:inline">SHINOBI NO MICHI</span>
	</a>

	<span class="min-w-0 flex-1 truncate font-pixel text-sm leading-none font-bold tracking-[.06em] text-b0fg md:hidden">{titulo}</span>

	<nav class="hidden gap-1 font-pixel text-[15px] leading-none font-semibold tracking-[.06em] md:flex" aria-label="Seções">
		<a
			href="/regras"
			class="p-3 {regrasAtivo ? 'text-b0fg shadow-[inset_0_-3px_0_#C44536]' : 'text-b0mut hover:text-b0fg'}"
			aria-current={regrasAtivo ? 'page' : undefined}>REGRAS</a
		>
	</nav>

	<div class="hidden flex-1 md:block"></div>

	<button
		type="button"
		class="hidden h-10 w-[340px] items-center gap-2.5 border-2 border-[#2E2420] bg-[#16110F] pr-1.5 pl-3 text-left text-sm text-[#B5A797] hover:border-[#5C524A] lg:flex"
		onclick={() => paleta.abrir()}
		aria-label="Buscar regras, jutsus, clãs e itens (Ctrl+K)"
	>
		<Traco nome="buscar" />
		<span class="flex-1">Buscar regras, jutsus, clãs, itens…</span>
		<span class="kbd-jogo border-[#2E2420] text-[#EFE3D3]">CTRL K</span>
	</button>
	<button
		type="button"
		class="hidden h-11 w-11 items-center justify-center border-2 border-[#2E2420] text-b0fg md:flex lg:hidden"
		onclick={() => paleta.abrir()}
		aria-label="Buscar"
	>
		<Traco nome="buscar" />
	</button>

	<button
		type="button"
		class="flex h-11 w-11 items-center justify-center text-b0fg hover:bg-[#2E2420]"
		onclick={() => preferencias.alternarTema()}
		aria-label={rotuloTema}
		title={rotuloTema}
	>
		<Traco nome={preferencias.tema === 'sumi' ? 'sumi' : 'washi'} />
	</button>
</header>
