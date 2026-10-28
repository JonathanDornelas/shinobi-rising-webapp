<script lang="ts">
	// D6 · Armas e equipamentos: abas Armas · Itens · Venenos · Pergaminhos · Marionetes · Qualidade e propriedades.
	import { onMount, tick } from 'svelte';
	import { replaceState } from '$app/navigation';
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import { realcar } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Dica from '#lib/componentes/ui/Dica.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import DadoHud from '#lib/componentes/mesa/DadoHud.svelte';
	import { lerDados } from '#lib/mesa/hud.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const eq = $derived(data.equipamentos);

	const abas = $derived([{ id: 'armas', titulo: 'Armas' }, ...eq.abas.map((a) => ({ id: a.id, titulo: a.titulo }))]);
	let aba = $state('armas');
	let categoria = $state<string | null>(null);
	const abaAtual = $derived(eq.abas.find((a) => a.id === aba));
	const categorias = $derived(eq.categorias.filter((c) => !categoria || c.id === categoria));
	const propriedade = (nome: string) => eq.propriedades.find((p) => normalizar(p.nome) === normalizar(nome))?.efeito ?? '';
	const peso = (p: string) => {
		const nome = p.charAt(0).toUpperCase() + p.slice(1);
		const c = data.carga[normalizar(p)];
		return c ? `${nome} · ${c}` : nome;
	};

	onMount(async () => {
		const p = new URLSearchParams(location.search);
		if (p.get('aba') && abas.some((a) => a.id === p.get('aba'))) aba = p.get('aba')!;
		const cat = p.get('categoria');
		if (cat && (cat === 'espadas' || eq.categorias.some((c) => c.id === cat))) categoria = cat;
		await tick();
		const el = location.hash && document.getElementById(location.hash.slice(1));
		if (el) {
			el.scrollIntoView({ block: 'center' });
			realcar(el);
		}
	});

	function escolherAba(id: string) {
		aba = id;
		replaceState(`/regras/equipamentos${id === 'armas' ? '' : `?aba=${id}`}`, {});
	}
	function escolherCategoria(id: string | null) {
		categoria = id;
		replaceState(`/regras/equipamentos${id ? `?aba=armas&categoria=${id}` : ''}`, {});
	}
</script>

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-14">
	<div class="flex flex-col gap-1.5">
		<span class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title">CAP. 11 A 13</span>
		<h1 class="t-h1 m-0">Armas e equipamentos</h1>
	</div>

	<div class="-mx-4 overflow-x-auto border-y-2 border-ink bg-b2 md:mx-0" role="tablist" aria-label="Categorias de equipamento">
		<div class="flex font-pixel text-[13px] leading-none font-semibold tracking-[.04em] md:text-sm">
			{#each abas as a (a.id)}
				{@const on = aba === a.id}
				<button type="button" role="tab" aria-selected={on} class="flex-none px-3.5 py-[15px] whitespace-nowrap uppercase {on ? 'bg-vermelhao text-white' : 'text-mut hover:bg-b3 hover:text-fg'}" onclick={() => escolherAba(a.id)}>
					{on ? '▸ ' : ''}{a.titulo}
				</button>
			{/each}
		</div>
	</div>

	{#if aba === 'armas'}
		<div class="flex flex-wrap gap-2" role="group" aria-label="Tipo de arma">
			<button type="button" class="chip sem-icone min-h-10 {categoria === null ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={categoria === null} onclick={() => escolherCategoria(null)}>Todas</button>
			{#each eq.categorias as c (c.id)}
				<button type="button" class="chip min-h-10 pr-3 {categoria === c.id ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={categoria === c.id} onclick={() => escolherCategoria(c.id)}><Icone id={c.icone} />{c.titulo}</button>
			{/each}
			<button type="button" class="chip min-h-10 pr-3 {categoria === 'espadas' ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={categoria === 'espadas'} onclick={() => escolherCategoria('espadas')}><Icone id="equip/ic-equip-sete-espadas" />Sete Espadas da Névoa</button>
		</div>

		{#if categoria !== 'espadas'}
			{#each categorias as c (c.id)}
				<section class="flex flex-col gap-2.5" aria-labelledby="cat-{c.id}">
					<div class="flex items-center gap-2"><Icone id={c.icone} /><h2 id="cat-{c.id}" class="t-h3 m-0 flex-1">{c.titulo}</h2><a href={c.ancora} class="link text-[13px] font-semibold">cap. 12</a></div>
					<div class="relative overflow-x-auto">
						<table class="sombra-painel w-full min-w-[760px] border-collapse border-2 border-frame text-[15px] leading-[22px]">
							<thead>
								<tr class="bg-vermelhao text-left font-pixel text-[13px] leading-[18px] font-bold tracking-[.06em] text-white">
									<th class="sticky left-0 z-[1] bg-vermelhao px-3 py-2.5 shadow-[2px_0_0_var(--vermelhao-lo)] md:static md:shadow-none">ARMA</th><th class="px-3 py-2.5">DANO</th><th class="px-3 py-2.5">ALCANCE</th><th class="px-3 py-2.5">PESO</th><th class="px-3 py-2.5">PROPRIEDADES</th><th class="px-3 py-2.5 text-right">PREÇO</th>
								</tr>
							</thead>
							<tbody>
								{#each c.armas as a, i (a.slug)}
									{@const fundo = i % 2 ? 'bg-b2' : 'bg-b1'}
									<tr id={a.slug} class="scroll-mt-24 {fundo}">
										<td class="sticky left-0 z-[1] px-3 py-1.5 shadow-[2px_0_0_var(--b3)] md:static md:shadow-none {fundo}"><span class="flex items-center gap-2 font-semibold"><Icone id={a.icone} />{a.nome}</span></td>
										<td class="px-3 py-1.5">{@render danoHud(a.dano)}</td>
										<td class="px-3 py-1.5">{a.alcance}</td>
										<td class="px-3 py-1.5"><span class="inline-block border-2 border-b3 px-1.5 py-1 text-xs leading-none font-semibold whitespace-nowrap">{peso(a.peso)}</span></td>
										<td class="px-3 py-1.5">
											<span class="flex flex-wrap gap-1">
												{#each a.propriedades as p (p)}
													<Dica texto={propriedade(p) || p} class="border-2 border-b3 px-1.5 py-1 text-xs leading-none font-semibold underline decoration-dotted underline-offset-[3px]">{p}</Dica>
												{/each}
											</span>
										</td>
										<td class="t-num px-3 py-1.5 text-right whitespace-nowrap">{a.preco}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			{/each}
		{/if}

		{#if categoria === null || categoria === 'espadas'}
			<section class="mt-3 flex flex-col gap-3" aria-labelledby="sete-espadas">
				<div class="flex items-center gap-2">
					<h2 id="sete-espadas" class="t-rotulo m-0 flex-1 text-[13px]">Sete Espadas da Névoa · qualidade lendária</h2>
					<a href={data.hrefEspadas} class="link text-[13px] font-semibold">cap. 12</a>
				</div>
				<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
					{#each eq.espadas as e (e.slug)}
						<a href="#{e.slug}" class="flex flex-col items-center gap-2 border-2 border-[#BF9000] bg-b2 px-2 py-3 text-center shadow-[4px_4px_0_#5C4600]">
							<Icone id={e.icone} tamanho={64} />
							<span class="font-mincho text-[15px] leading-5 font-bold">{e.nome}</span>
							<span class="text-xs leading-4 text-mut italic">{e.traducao}</span>
							<span class="t-rotulo-sm tracking-[.06em] text-title">Lendária</span>
						</a>
					{/each}
				</div>
				<div class="overflow-x-auto">
					<table class="sombra-painel w-full min-w-[760px] border-collapse border-2 border-frame text-[15px] leading-[22px]">
						<thead>
							<tr class="bg-vermelhao text-left font-pixel text-[13px] leading-[18px] font-bold tracking-[.06em] text-white">
								<th class="px-3 py-2.5">ESPADA</th><th class="px-3 py-2.5">TRADUÇÃO</th><th class="px-3 py-2.5">DANO</th><th class="px-3 py-2.5">PESO</th><th class="px-3 py-2.5">HABILIDADE ESPECIAL</th>
							</tr>
						</thead>
						<tbody>
							{#each eq.espadas as e, i (e.slug)}
								<tr id={e.slug} class="scroll-mt-24 {i % 2 ? 'bg-b2' : 'bg-b1'}">
									<td class="px-3 py-1.5"><span class="flex items-center gap-2 font-semibold"><Icone id={e.icone} />{e.nome}</span></td>
									<td class="px-3 py-1.5 italic">{e.traducao}</td>
									<td class="px-3 py-1.5">{@render danoHud(e.dano)}</td>
									<td class="px-3 py-1.5"><span class="inline-block border-2 border-b3 px-1.5 py-1 text-xs leading-none font-semibold whitespace-nowrap">{peso(e.peso)}</span></td>
									<td class="px-3 py-1.5">{e.habilidade}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	{:else if abaAtual}
		{#each abaAtual.secoes as s (s.titulo)}
			<section class="flex max-w-[960px] flex-col gap-4">
				<div class="flex items-baseline gap-3"><h2 class="t-h2 m-0 flex-1">{s.titulo}</h2><a href={s.href} class="link text-[13px] font-semibold whitespace-nowrap">Ler no capítulo</a></div>
				<Blocos blocos={s.blocos} semAncoras />
			</section>
		{/each}
	{/if}
</main>

<Rodape />

<!-- HUD: o dano da arma com a arte do dado e a faixa (1~6) -->
{#snippet danoHud(dano: string)}
	{@const f = lerDados(dano.replace(/\s+/g, ''))}
	{#if f}
		<span class="inline-flex items-center gap-2 whitespace-nowrap"><DadoHud expr={dano.replace(/\s+/g, '')} tamanho={20} /><span class="text-xs text-mut">{f.min}~{f.max}</span></span>
	{:else}<span class="t-num">{dano}</span>{/if}
{/snippet}
