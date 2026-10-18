<script lang="ts">
	// D1 · Início da documentação.
	import { onMount } from 'svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { lerProgresso, type Progresso } from '#lib/estado/progresso.ts';
	import indiceJson from '#lib/livro/gerado/indice.json';
	import type { IndiceLivro } from '#lib/livro/tipos.ts';

	const indice = indiceJson as IndiceLivro;
	const cap = (n: number) => indice.capitulos.find((c) => c.numero === n)!;

	let progresso = $state<Progresso | null>(null);
	onMount(() => (progresso = lerProgresso()));

	const inicios = [
		{ icone: 'papel/ic-papel-jogador', titulo: 'Novo jogador', texto: 'Partes I, II e a metade inicial da III antes da primeira sessão. O resto você consulta durante o jogo.', link: 'Começar pelo cap. 1', href: '/regras/introducao' },
		{ icone: 'papel/ic-papel-mestre', titulo: 'Mestre', texto: 'Leia tudo, com atenção à Parte I (Combate e Furtividade) e ao cap. 8 (Clãs).', link: 'Ver a sugestão do cap. 1', href: '/regras/introducao#como-ler-este-livro' }
	];
	const catalogos = [
		{ icone: 'nav/ic-nav-jutsus', titulo: 'Jutsus', href: '/regras/jutsus' },
		{ icone: 'nav/ic-nav-clas', titulo: 'Clãs', href: '/regras/clas' },
		{ icone: 'nav/ic-nav-equipamentos', titulo: 'Armas e equipamentos', href: '/regras/equipamentos' },
		{ icone: 'esp/ic-esp-controle-chakra', titulo: 'Especializações', href: '/regras/especializacoes' },
		{ icone: 'nav/ic-nav-referencia', titulo: 'Glossário', href: '/regras/glossario' }
	];
	const tabelas = [
		{ icone: 'dado/ic-dado-d20', titulo: 'DT', href: '/regras/referencia-rapida#dt' },
		{ icone: 'estado/ic-estado-atordoado', titulo: 'Estados Especiais', href: '/regras/referencia-rapida#estados' },
		{ icone: 'recurso/ic-recurso-fadiga', titulo: 'Fadiga', href: '/regras/referencia-rapida#fadiga' },
		{ icone: 'rank/ic-rank-c', titulo: 'PJ → Rank', href: '/regras/referencia-rapida#pj-rank' },
		{ icone: 'recurso/ic-recurso-pt', titulo: 'Custos de PT', href: '/regras/referencia-rapida#custos-pt' }
	];
</script>

<header class="border-b-2 border-ink bg-b0 px-4 py-6 md:px-6 md:py-12">
	<div class="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] items-end gap-3 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-12">
		<div class="flex flex-col gap-2.5 md:gap-3">
			<span class="hidden font-pixel text-[13px] leading-none font-bold tracking-[.14em] text-[#D9A82B] md:block">REGRAS</span>
			<h1 class="m-0 font-mincho text-[30px] leading-[38px] font-extrabold text-papel md:text-5xl md:leading-[56px]">Livro de Regras — Versão 18.0</h1>
			<p class="m-0 text-[15px] leading-[23px] text-areia md:text-[17px] md:leading-[27px]">Edição com Dōjutsus: Mangekyou Eterno, Transferência de Olhos, Tabelas Compatíveis</p>
		</div>
		<button
			type="button"
			onclick={() => paleta.abrir()}
			class="mt-1.5 flex h-12 items-center gap-3 border-2 border-[var(--vermelhao-lo)] bg-[#16110F] px-3 text-left text-base text-[#B5A797] md:h-14 md:pr-2 md:pl-4 md:text-[17px] lg:mt-0 lg:shadow-[4px_4px_0_#000]"
		>
			<Traco nome="buscar" />
			<span class="flex-1">Buscar regras, jutsus, clãs, itens…</span>
			<span class="kbd-jogo hidden border-[#2E2420] text-[#EFE3D3] md:inline-block">CTRL K</span>
		</button>
	</div>
</header>

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-8 px-4 pt-4 pb-10 md:gap-10 md:px-6 md:pt-10 md:pb-16">
	<div class="grid grid-cols-[minmax(0,1fr)] gap-3.5 md:gap-5 {progresso ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]' : 'md:grid-cols-2'}">
		{#if progresso}
			<a href={progresso.secao ? `${progresso.href}#${progresso.secao}` : progresso.href} class="cartao-link flex flex-col gap-1.5 border-2 border-[var(--vermelhao-lo)] bg-grena p-3.5 text-papel md:gap-2.5 md:p-[18px] md:sombra-painel">
				<span class="t-rotulo-sm text-ouro">▸ Continuar leitura</span>
				<span class="font-mincho text-xl leading-[26px] font-bold md:text-2xl md:leading-8">Cap. {progresso.capitulo} · {progresso.titulo}</span>
				<span class="text-[13px] leading-[19px] text-papel-2 md:text-sm md:leading-[21px]">{progresso.secaoTitulo ? `Parou em ${progresso.secaoTitulo}` : 'Início do capítulo'}<span class="hidden md:inline"> · salvo neste dispositivo</span></span>
				<div class="hidden h-2.5 border-2 border-carvao bg-grena-fundo md:block" role="progressbar" aria-valuenow={progresso.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso no capítulo">
					<div class="h-full bg-ouro" style:width="{progresso.pct}%"></div>
				</div>
			</a>
		{/if}
		{#each inicios as c (c.titulo)}
			<div class="painel-sombra hidden flex-col gap-2 p-[18px] md:flex">
				<div class="flex items-center gap-2"><Icone id={c.icone} /><span class="font-mincho text-xl leading-7 font-bold">{c.titulo}</span></div>
				<span class="text-sm leading-[21px]">{c.texto}</span>
				<a href={c.href} class="link self-start text-sm leading-5 font-semibold">{c.link}</a>
			</div>
		{/each}
	</div>

	<section class="flex flex-col gap-3.5 md:gap-4">
		<h2 class="t-rotulo m-0 md:text-sm">Partes do livro</h2>
		<!-- desktop/tablet: grade de cards com os capítulos -->
		<div class="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4">
			{#each indice.partes as p (p.numero)}
				<div class="painel-sombra flex flex-col">
					<div class="flex items-center gap-3 border-b-2 border-b3 p-3.5">
						<div class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-b3 bg-b1"><Icone id={p.icone} tamanho={64} /></div>
						<div class="flex min-w-0 flex-col gap-1">
							<span class="t-rotulo-sm text-mut">{p.rotulo}</span>
							<span class="font-mincho text-lg leading-6 font-bold">{p.titulo}</span>
						</div>
					</div>
					<ul class="m-0 flex list-none flex-col px-3.5 pt-2 pb-3">
						{#each p.capitulos as n (n)}
							<li>
								<a href={cap(n).href} class="flex min-h-8 items-center gap-2.5 py-1 text-sm leading-5 font-medium hover:text-link">
									<span class="t-num w-[22px] flex-none text-[13px] text-mut">{n}</span>{cap(n).titulo}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
		<!-- mobile: lista expansível -->
		<div class="flex flex-col gap-2.5 md:hidden">
			{#each indice.partes as p (p.numero)}
				<details class="group painel">
					<summary class="flex min-h-14 cursor-pointer list-none items-center gap-3 py-1.5 pr-2.5 pl-1.5 [&::-webkit-details-marker]:hidden">
						<Icone id={p.icone} />
						<span class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="t-rotulo-sm text-mut">{p.rotulo}</span>
							<span class="font-mincho text-base leading-[22px] font-bold">{p.titulo}</span>
						</span>
						<span class="font-pixel text-sm font-bold text-mut group-open:rotate-90">▸</span>
					</summary>
					<ul class="m-0 flex list-none flex-col border-t-2 border-b3 px-3 py-1">
						{#each p.capitulos as n (n)}
							<li><a href={cap(n).href} class="flex min-h-11 items-center gap-2.5 text-[15px] leading-5 font-medium"><span class="t-num w-[22px] text-[13px] text-mut">{n}</span>{cap(n).titulo}</a></li>
						{/each}
					</ul>
				</details>
			{/each}
		</div>
	</section>

	<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2">
		<section class="flex flex-col gap-4">
			<h2 class="t-rotulo m-0 md:text-sm">Catálogos</h2>
			<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
				{#each catalogos as c (c.href)}
					<a href={c.href} class="painel cartao-link flex flex-col items-center gap-2 px-2 py-3 text-center">
						<Icone id={c.icone} />
						<span class="text-[13px] leading-[18px] font-semibold">{c.titulo}</span>
					</a>
				{/each}
			</div>
		</section>
		<section class="flex flex-col gap-4">
			<h2 class="t-rotulo m-0 md:text-sm">Tabelas rápidas · Referência</h2>
			<div class="flex flex-wrap gap-2">
				{#each tabelas as t (t.href)}
					<a href={t.href} class="painel cartao-link inline-flex h-11 items-center gap-1.5 pr-3.5 pl-1.5 text-sm font-semibold">
						<Icone id={t.icone} />{t.titulo}
					</a>
				{/each}
			</div>
		</section>
	</div>
</main>

<Rodape />
