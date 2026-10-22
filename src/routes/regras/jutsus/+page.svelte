<script lang="ts">
	// D4 · Catálogo de jutsus: filtros (coluna de 260 no desktop, bottom sheet no mobile) em grupos recolhíveis,
	// busca no nome (e, se pedir, no efeito), favoritos e quatro visualizações: lista, cards, livro (card completo) e tabela.
	// Abrir um jutsu mostra o D5 em modal com URL própria (shallow routing).
	import { onMount, untrack } from 'svelte';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import BadgeTipo from '#lib/componentes/regras/BadgeTipo.svelte';
	import BotaoFavorito from '#lib/componentes/regras/BotaoFavorito.svelte';
	import CardJutsu from '#lib/componentes/regras/CardJutsu.svelte';
	import ChipElemento from '#lib/componentes/regras/ChipElemento.svelte';
	import DetalheJutsu from '#lib/componentes/regras/DetalheJutsu.svelte';
	import Glosa from '#lib/componentes/regras/Glosa.svelte';
	import SeloRank from '#lib/componentes/regras/SeloRank.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Folha from '#lib/componentes/ui/Folha.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Traco, { type NomeTraco } from '#lib/componentes/ui/Traco.svelte';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { favoritos } from '#lib/estado/favoritos.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { ELEMENTO, RANK, RANKS, TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { acaoDe, alcanceAlvo, ataqueDe, DURACOES, duracaoDe, EFEITOS, efeitosJutsu, FAIXAS_CUSTO, faixaCusto, info, nomeEfeito, resistenciaDe, textoEfeito } from '#lib/livro/filtros-jutsu.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { Jutsu } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const todos = $derived(data.jutsus as Jutsu[]);

	interface Grupo {
		id: string;
		rotulo: string;
		/** Valor (ou valores, num grupo como Efeito) do jutsu neste grupo. */
		obter: (j: Jutsu) => string | string[] | null;
		ordem?: string[];
		nome?: (v: string) => string;
		/** Aberto quando a página carrega. */
		aberto?: boolean;
	}
	const GRUPOS: Grupo[] = [
		{ id: 'tipo', rotulo: 'Tipo', obter: (j) => j.tipo, ordem: Object.keys(TIPO_JUTSU), aberto: true },
		{ id: 'rank', rotulo: 'Rank', obter: (j) => j.rank, ordem: RANKS, nome: (v) => `Rank ${v}`, aberto: true },
		{ id: 'efeito', rotulo: 'O que faz', obter: efeitosJutsu, ordem: [...EFEITOS.map((e) => e.id), 'outros'], nome: nomeEfeito, aberto: true },
		{ id: 'origem', rotulo: 'Origem', obter: (j) => j.origem },
		{ id: 'elemento', rotulo: 'Elemento', obter: (j) => j.elemento, nome: (v) => ELEMENTO[v]?.nome ?? v },
		{ id: 'custo', rotulo: 'Custo', obter: faixaCusto, ordem: FAIXAS_CUSTO.map((f) => f.id), nome: (v) => FAIXAS_CUSTO.find((f) => f.id === v)!.rotulo },
		{ id: 'acao', rotulo: 'Ação', obter: acaoDe, ordem: ['Primária', 'Secundária', 'Reação', 'Completa'] },
		{ id: 'ataque', rotulo: 'Rolagem de ataque', obter: ataqueDe, ordem: ['Ninjutsu', 'Taijutsu', 'Genjutsu', 'Bukijutsu', 'Percepção', 'Automático', 'Sem rolagem (área)', 'Sem rolagem'] },
		{ id: 'resistencia', rotulo: 'Resistência do alvo', obter: resistenciaDe, ordem: ['Acrobacia', 'FOR', 'VIG', 'ESP', 'Percepção', 'Sem resistência'] },
		{ id: 'duracao', rotulo: 'Duração', obter: duracaoDe, ordem: DURACOES },
		{ id: 'alvo', rotulo: 'Área × alvo único', obter: alcanceAlvo }
	];
	const lista = (v: string | string[] | null) => (v === null ? [] : Array.isArray(v) ? v : [v]);

	/** Valores de cada grupo e o texto de busca, calculados uma vez por jutsu. */
	const indice = $derived(
		new Map(
			todos.map((j) => [
				j.slug,
				{
					grupos: Object.fromEntries(GRUPOS.map((g) => [g.id, lista(g.obter(j))])) as Record<string, string[]>,
					nome: normalizar(`${j.nome} ${j.traducao}`),
					efeito: normalizar(`${textoEfeito(j)} ${j.descricao.flat().map((t) => t.t).join(' ')}`)
				}
			])
		)
	);

	type Visao = 'lista' | 'cards' | 'livro' | 'tabela';
	const VISOES: { id: Visao; rotulo: string; icone: NomeTraco }[] = [
		{ id: 'lista', rotulo: 'Lista', icone: 'lista' },
		{ id: 'cards', rotulo: 'Cards', icone: 'cards' },
		{ id: 'livro', rotulo: 'Livro', icone: 'livro' },
		{ id: 'tabela', rotulo: 'Tabela', icone: 'tabela' }
	];

	let busca = $state('');
	let noEfeito = $state(false);
	let soFavoritos = $state(false);
	let sel = $state<Record<string, string[]>>({});
	let ordem = $state<'nome' | 'rank' | 'custo'>('rank');
	let visao = $state<Visao>('lista');
	let filtrosAbertos = $state(false);
	let abertos = $state<Record<string, boolean>>(Object.fromEntries(GRUPOS.map((g) => [g.id, !!g.aberto])));

	const passa = (j: Jutsu, ignorar?: string) => {
		const x = indice.get(j.slug)!;
		if (soFavoritos && !favoritos.tem(j.slug)) return false;
		if (!GRUPOS.every((g) => g.id === ignorar || !sel[g.id]?.length || sel[g.id].some((v) => x.grupos[g.id].includes(v)))) return false;
		const q = normalizar(busca);
		return !q || x.nome.includes(q) || (noEfeito && x.efeito.includes(q));
	};

	const filtrados = $derived.by(() => {
		const r = todos.filter((j) => passa(j));
		const ri = (x: Jutsu) => RANKS.indexOf(x.rank);
		if (ordem === 'nome') r.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
		else if (ordem === 'rank') r.sort((a, b) => ri(a) - ri(b) || a.custoNum - b.custoNum || a.nome.localeCompare(b.nome, 'pt-BR'));
		else r.sort((a, b) => a.custoNum - b.custoNum || a.nome.localeCompare(b.nome, 'pt-BR'));
		return r;
	});

	/** Opções de cada grupo com a contagem que resultaria ao marcá-las (respeitando os outros filtros). */
	const opcoes = $derived(
		GRUPOS.map((g) => {
			const valores = [...new Set(todos.flatMap((j) => indice.get(j.slug)!.grupos[g.id]))];
			if (g.ordem) valores.sort((a, b) => (g.ordem!.indexOf(a) + 1 || 99) - (g.ordem!.indexOf(b) + 1 || 99));
			else valores.sort((a, b) => a.localeCompare(b, 'pt-BR'));
			const n = (v: string) => todos.filter((j) => indice.get(j.slug)!.grupos[g.id].includes(v) && passa(j, g.id)).length;
			return { ...g, marcados: sel[g.id]?.length ?? 0, valores: valores.map((v) => ({ v, nome: g.nome?.(v) ?? v, n: n(v) })) };
		})
	);
	const ativos = $derived(GRUPOS.flatMap((g) => (sel[g.id] ?? []).map((v) => ({ g: g.id, v, nome: g.nome?.(v) ?? v }))));
	const nFavoritos = $derived(todos.filter((j) => favoritos.tem(j.slug)).length);

	function alternar(g: string, v: string) {
		const atual = sel[g] ?? [];
		sel = { ...sel, [g]: atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v] };
	}
	function limpar() {
		sel = {};
		busca = '';
		soFavoritos = false;
	}
	function definirVisao(v: Visao) {
		visao = v;
		gravar('jutsus-visao', v);
	}

	// filtros na URL (?tipo=Ninjutsu&rank=C&q=fogo&texto=1&fav=1), para links compartilháveis; a visão fica no navegador
	onMount(() => {
		const p = new URLSearchParams(location.search);
		const lidos: Record<string, string[]> = {};
		for (const g of GRUPOS) if (p.getAll(g.id).length) lidos[g.id] = p.getAll(g.id);
		sel = lidos;
		abertos = { ...abertos, ...Object.fromEntries(Object.keys(lidos).map((g) => [g, true])) };
		busca = p.get('q') ?? '';
		noEfeito = p.get('texto') === '1';
		soFavoritos = p.get('fav') === '1';
		const v = ler<string>('jutsus-visao', 'lista');
		if (VISOES.some((x) => x.id === v)) visao = v as Visao;
	});
	let montado = false;
	$effect(() => {
		const p = new URLSearchParams();
		if (busca.trim()) p.set('q', busca.trim());
		if (noEfeito) p.set('texto', '1');
		if (soFavoritos) p.set('fav', '1');
		for (const a of ativos) p.append(a.g, a.v);
		const qs = p.toString();
		if (!montado) {
			montado = true;
			return;
		}
		// sem rastrear page.state: o replaceState troca o page.state e o efeito rodaria de novo, sem fim
		untrack(() => {
			if (!page.state.jutsu) replaceState(`/regras/jutsus${qs ? '?' + qs : ''}`, {});
		});
	});

	// D5 em modal
	const aberto = $derived(page.state.jutsu ? todos.find((j) => j.slug === page.state.jutsu) : null);
	function abrir(e: MouseEvent, j: Jutsu) {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();
		pushState(`/regras/jutsus/${j.slug}`, { jutsu: j.slug });
	}
	async function copiarLink(j: Jutsu) {
		try {
			await navigator.clipboard.writeText(`${location.origin}/regras/jutsus/${j.slug}`);
			toasts.mostrar('Link do jutsu copiado.', 'sucesso');
		} catch {
			toasts.mostrar('Não foi possível copiar o link.', 'erro');
		}
	}
	const iconeJ = (j: Jutsu) => `rank/ic-rank-${j.rank.toLowerCase()}`;
</script>

{#snippet painelFiltros(toque: boolean)}
	{#each opcoes as g (g.id)}
		<details class="group border-b-2 border-b3 last:border-b-0" bind:open={abertos[g.id]}>
			<summary class="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3.5 py-2 [&::-webkit-details-marker]:hidden">
				<span class="t-rotulo-sm flex-1 tracking-[.08em] text-mut">{g.rotulo}</span>
				{#if g.marcados}<span class="t-num border-2 border-ink bg-vermelhao px-1.5 text-xs leading-4 text-white">{g.marcados}</span>{/if}
				<Traco nome="baixo" tamanho={16} class="text-mut transition-transform group-open:rotate-180" />
			</summary>
			<div class="px-3.5 pb-3" role="group" aria-label={g.rotulo}>
				{#if toque}
					<div class="flex flex-wrap gap-1.5">
						{#each g.valores as o (o.v)}
							{@const on = sel[g.id]?.includes(o.v)}
							<button type="button" class="chip sem-icone min-h-10 {on ? 'border-vermelhao bg-grena text-papel' : o.n ? '' : 'text-mut'}" aria-pressed={on} onclick={() => alternar(g.id, o.v)}>{o.nome} <span class="t-num text-xs opacity-70">{o.n}</span></button>
						{/each}
					</div>
				{:else}
					<div class="flex max-h-[232px] flex-col overflow-y-auto">
						{#each g.valores as o (o.v)}
							{@const on = !!sel[g.id]?.includes(o.v)}
							<label class="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm leading-5 font-medium {o.n || on ? '' : 'text-mut'}">
								<input type="checkbox" class="peer sr-only" checked={on} onchange={() => alternar(g.id, o.v)} />
								<span class="flex h-5 w-5 flex-none items-center justify-center border-2 font-pixel text-xs font-bold text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" style:background={on ? 'var(--vermelhao)' : 'var(--b1)'} style:border-color={on ? 'var(--ink)' : 'var(--field)'}>{on ? '✓' : ''}</span>
								<span class="flex-1">{o.nome}</span>
								<span class="t-num text-xs text-mut">{o.n}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>
		</details>
	{/each}
{/snippet}

{#snippet chipsEfeito(j: Jutsu)}
	<span class="flex flex-wrap gap-1">
		{#each indice.get(j.slug)!.grupos.efeito.filter((e) => e !== 'outros') as e (e)}
			<span class="border-2 border-b3 bg-b1 px-1.5 py-0.5 font-pixel text-[11px] leading-none font-semibold tracking-[.04em] text-mut uppercase">{nomeEfeito(e)}</span>
		{/each}
	</span>
{/snippet}

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-4 px-4 pt-4 pb-12 md:px-6 md:pt-8 md:pb-14">
	<div class="hidden flex-col gap-1.5 md:flex">
		<a href="/regras/jutsus-e-elementos#catalogo-de-jutsus" class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title hover:underline">CAP. 8 E 10</a>
		<h1 class="t-h1 m-0">Jutsus</h1>
	</div>
	<h1 class="sr-only md:hidden">Jutsus</h1>

	<div class="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
		<aside class="painel hidden flex-col lg:sticky lg:top-4 lg:flex lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto" aria-label="Filtros">
			<div class="sticky top-0 z-10 flex items-center border-b-2 border-b3 bg-b2 px-3.5 py-3">
				<span class="t-rotulo flex-1">Filtros</span>
				<button type="button" class="link text-[13px] leading-[18px] font-semibold" onclick={limpar}>Limpar</button>
			</div>
			{@render painelFiltros(false)}
		</aside>

		<div class="flex min-w-0 flex-col gap-3.5">
			<div class="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
				<label class="campo flex h-12 min-w-0 flex-1 items-center gap-2.5 pr-1 md:h-11 md:min-w-[280px]">
					<span class="text-mut"><Traco nome="buscar" /></span>
					<input bind:value={busca} type="search" placeholder={noEfeito ? 'Nome, tradução ou efeito' : 'Nome ou tradução'} aria-label="Buscar jutsu" class="min-w-0 flex-1 bg-transparent text-base text-fg outline-none" />
					<button
						type="button"
						class="flex-none border-2 px-2 py-1.5 font-pixel text-[11px] leading-none font-bold tracking-[.06em] {noEfeito ? 'border-ink bg-fg text-b1' : 'border-b3 text-mut hover:text-fg'}"
						aria-pressed={noEfeito}
						title="Buscar também no texto do efeito e da descrição"
						onclick={() => (noEfeito = !noEfeito)}>+ EFEITO</button
					>
				</label>
				<div class="flex flex-wrap gap-2 md:contents">
					<button type="button" class="btn-jogo btn-primario min-h-11 flex-1 px-3 text-[13px] lg:hidden" onclick={() => (filtrosAbertos = true)}>Filtros{ativos.length ? ` (${ativos.length})` : ''}</button>
					<button
						type="button"
						class="flex min-h-11 flex-1 items-center justify-center gap-1.5 border-2 px-3 text-sm font-semibold md:flex-none {soFavoritos ? 'border-ink bg-grena text-papel' : 'border-b3 hover:border-mut'}"
						aria-pressed={soFavoritos}
						title={nFavoritos ? 'Mostrar só os favoritos' : 'Marque jutsus com a estrela para encontrá-los aqui'}
						onclick={() => (soFavoritos = !soFavoritos)}
					>
						<Traco nome="estrela" tamanho={18} class={soFavoritos || nFavoritos ? 'estrela-on' : ''} />Favoritos <span class="t-num text-xs opacity-80">{nFavoritos}</span>
					</button>
					<label class="flex h-11 flex-1 items-center gap-2 border-2 border-b3 px-3 text-sm font-semibold md:flex-none">
						<span class="hidden sm:inline">Ordenar:</span>
						<select bind:value={ordem} class="flex-1 bg-transparent text-sm font-semibold text-fg outline-none" aria-label="Ordenar por">
							<option value="rank" class="bg-b2">Rank</option>
							<option value="nome" class="bg-b2">Nome</option>
							<option value="custo" class="bg-b2">Custo</option>
						</select>
					</label>
				</div>
				<div class="alternancia self-start md:self-auto" role="group" aria-label="Visualização">
					{#each VISOES as v (v.id)}
						<button type="button" class="flex min-h-10 flex-1 items-center justify-center gap-1.5" aria-pressed={visao === v.id} aria-label={v.rotulo} title={v.rotulo} onclick={() => definirVisao(v.id)}>
							<Traco nome={v.icone} tamanho={16} /><span class="max-sm:hidden xl:inline md:max-xl:hidden">{v.rotulo}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<span class="text-sm leading-5 font-semibold text-mut" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'jutsu' : 'jutsus'}</span>
				{#if soFavoritos}
					<span class="chip sem-icone gap-1.5 border-mut bg-b2 pr-1">
						Só favoritos
						<button type="button" class="flex h-7 w-7 items-center justify-center" aria-label="Mostrar todos, não só os favoritos" onclick={() => (soFavoritos = false)}><Traco nome="fechar" tamanho={16} espessura={2.5} /></button>
					</span>
				{/if}
				{#each ativos as a (a.g + a.v)}
					<span class="chip sem-icone gap-1.5 border-mut bg-b2 pr-1">
						{a.nome}
						<button type="button" class="flex h-7 w-7 items-center justify-center" aria-label="Remover filtro {a.nome}" onclick={() => alternar(a.g, a.v)}><Traco nome="fechar" tamanho={16} espessura={2.5} /></button>
					</span>
				{/each}
				{#if ativos.length || soFavoritos}<button type="button" class="link text-sm font-semibold" onclick={limpar}>Limpar filtros</button>{/if}
			</div>

			{#if !filtrados.length}
				<div class="painel-sombra flex flex-col items-center gap-3 px-6 py-8 text-center">
					<Icone id="illustrations/il-sem-resultados" tamanho={96} />
					{#if soFavoritos && !nFavoritos}
						<span class="font-mincho text-[22px] leading-[30px] font-bold">Nenhum favorito ainda</span>
						<span class="max-w-[42ch] text-sm text-mut">Toque na estrela de um jutsu para guardá-lo aqui{favoritos.jutsus.length ? '' : '. Com a conta conectada, os favoritos valem em qualquer aparelho'}.</span>
					{:else}
						<span class="font-mincho text-[22px] leading-[30px] font-bold">Nenhum jutsu com esses filtros</span>
					{/if}
					<button type="button" class="btn-jogo btn-contorno mt-1.5" onclick={limpar}>Limpar filtros</button>
				</div>
			{:else if visao === 'lista'}
				<div class="grid grid-cols-[minmax(0,1fr)] gap-2 md:gap-3 xl:grid-cols-2">
					{#each filtrados as j (j.slug)}
						{@const t = TIPO_JUTSU[j.tipo]}
						<div class="painel cartao-link relative grid grid-cols-[4px_32px_minmax(0,1fr)_auto_40px] items-center gap-2.5 py-1 pr-1 md:sombra-painel md:gap-3 md:py-1.5">
							<span class="-my-1 self-stretch md:-my-1.5" style:background={t.cor}></span>
							<Icone id={iconeJ(j)} alt="Rank {j.rank}" />
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="flex min-w-0 flex-col">
									<a href="/regras/jutsus/{j.slug}" onclick={(e) => abrir(e, j)} class="truncate font-mincho text-[15px] leading-5 font-bold after:absolute after:inset-0 md:text-[17px] md:leading-[22px]">{j.nome}</a>
									<Glosa texto={j.traducao} class="truncate text-xs leading-4 md:text-[13px] md:leading-[18px]" />
								</span>
								<span class="truncate text-xs leading-4 text-mut md:text-[13px] md:leading-[18px]"><span class="md:hidden">{j.tipo}{' · '}</span>{j.origem} · {acaoDe(j)}</span>
							</span>
							<span class="flex flex-col items-end gap-1.5">
								<span class="t-num text-[17px] leading-none whitespace-nowrap md:text-xl">{j.custo}</span>
								<span class="hidden md:block"><BadgeTipo tipo={j.tipo} semIcone /></span>
							</span>
							<BotaoFavorito slug={j.slug} nome={j.nome} class="relative z-10" />
						</div>
					{/each}
				</div>
			{:else if visao === 'cards'}
				<div class="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
					{#each filtrados as j (j.slug)}
						{@const t = TIPO_JUTSU[j.tipo]}
						<article class="cartao-link relative flex flex-col border-2 border-[var(--vermelhao-lo)] bg-b2 sombra-painel">
							<header class="flex items-start gap-1 bg-grena py-2 pr-1 pl-3.5" style:box-shadow="inset 4px 0 0 {t.cor}">
								<div class="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
									<a href="/regras/jutsus/{j.slug}" onclick={(e) => abrir(e, j)} class="font-mincho text-lg leading-6 font-bold text-papel after:absolute after:inset-0">{j.nome}</a>
									<span class="truncate text-[13px] leading-[18px] text-papel-2 italic">{j.traducao}</span>
								</div>
								<BotaoFavorito slug={j.slug} nome={j.nome} sobreFaixa class="relative z-10" />
							</header>
							<div class="flex flex-1 flex-col gap-2.5 p-3">
								<div class="flex flex-wrap items-center gap-2">
									<BadgeTipo tipo={j.tipo} semIcone />
									<SeloRank rank={j.rank} />
									{#if j.elemento}<ChipElemento elemento={j.elemento} />{/if}
									<span class="flex-1"></span>
									<span class="t-num text-xl leading-none whitespace-nowrap">{j.custo}</span>
								</div>
								<dl class="m-0 grid grid-cols-3 border-t-2 border-l-2 border-b3 text-[13px] leading-[17px]">
									{#each ['Alcance', 'Duração', 'Ação'] as k (k)}
										<div class="flex min-w-0 flex-col gap-1 border-r-2 border-b-2 border-b3 bg-b1 px-2 py-1.5">
											<dt class="t-rotulo-sm text-mut">{k}</dt>
											<dd class="m-0 font-semibold break-words">{info(j, k) || '—'}</dd>
										</div>
									{/each}
								</dl>
								<p class="m-0 line-clamp-3 text-sm leading-5 text-pretty">{textoEfeito(j)}</p>
								<div class="mt-auto">{@render chipsEfeito(j)}</div>
							</div>
						</article>
					{/each}
				</div>
			{:else if visao === 'livro'}
				<div class="flex flex-col gap-4">
					{#each filtrados as j (j.slug)}
						<CardJutsu jutsu={j}>
							{#snippet acoes()}
								<BotaoFavorito slug={j.slug} nome={j.nome} sobreFaixa />
								<a href="/regras/jutsus/{j.slug}" onclick={(e) => abrir(e, j)} class="flex h-10 w-10 items-center justify-center text-papel-2 hover:text-papel" aria-label="Abrir {j.nome}" title="Abrir em detalhe"><Traco nome="chevron" /></a>
							{/snippet}
						</CardJutsu>
					{/each}
				</div>
			{:else}
				<div class="overflow-x-auto border-2 border-frame sombra-painel">
					<table class="w-full border-collapse text-sm leading-5">
						<thead>
							<tr class="bg-vermelhao text-left font-pixel text-[13px] leading-[18px] font-bold tracking-[.06em] whitespace-nowrap text-white">
								<th class="sticky left-0 z-10 bg-vermelhao py-2.5 pr-3 pl-11">NOME</th>
								<th class="px-2 py-2.5">RANK</th><th class="px-2 py-2.5 text-right">CUSTO</th><th class="px-2 py-2.5">TIPO</th><th class="px-2 py-2.5">AÇÃO</th><th class="px-2 py-2.5">ALCANCE</th><th class="px-2 py-2.5">DURAÇÃO</th><th class="px-2 py-2.5" title="Resistência do alvo">RESIST.</th><th class="px-2 py-2.5">ORIGEM</th>
							</tr>
						</thead>
						<tbody>
							{#each filtrados as j, i (j.slug)}
								<tr class={i % 2 ? 'bg-b2' : 'bg-b1'}>
									<td class="sticky left-0 z-10 py-0 pr-3 {i % 2 ? 'bg-b2' : 'bg-b1'}">
										<span class="flex items-center"><BotaoFavorito slug={j.slug} nome={j.nome} tamanho={18} /><span class="flex flex-col py-1"><a href="/regras/jutsus/{j.slug}" onclick={(e) => abrir(e, j)} class="text-[15px] leading-5 font-semibold whitespace-nowrap hover:text-link">{j.nome}</a><Glosa texto={j.traducao} class="text-xs leading-4 whitespace-nowrap" /></span></span>
									</td>
									<td class="px-2 py-1.5"><span title="Rank {j.rank} · {RANK[j.rank].pj} PJ"><Icone id={iconeJ(j)} alt="Rank {j.rank}" /></span></td>
									<td class="t-num px-2 py-1.5 text-right text-[15px] whitespace-nowrap">{j.custo}</td>
									<td class="px-2 py-1.5"><BadgeTipo tipo={j.tipo} semIcone /></td>
									<td class="px-2 py-1.5">{acaoDe(j)}</td>
									<td class="min-w-[90px] px-2 py-1.5">{info(j, 'Alcance')}</td>
									<td class="min-w-[110px] px-2 py-1.5">{info(j, 'Duração')}</td>
									<td class="px-2 py-1.5 whitespace-nowrap">{resistenciaDe(j) === 'Sem resistência' ? '—' : resistenciaDe(j)}</td>
									<td class="min-w-[120px] px-2 py-1.5">{j.origem}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</main>

<Rodape />

{#if filtrosAbertos}
	<Folha rotulo="Filtros" topo="120px" aoFechar={() => (filtrosAbertos = false)}>
		<div class="flex items-center px-4 pt-1.5 pb-2.5">
			<span class="flex-1 font-mincho text-xl leading-[26px] font-bold">Filtros</span>
			<button type="button" class="link text-sm font-semibold" onclick={limpar}>Limpar</button>
		</div>
		<div class="border-t-2 border-b3">{@render painelFiltros(true)}</div>
		{#snippet rodape()}
			<button type="button" class="btn-jogo btn-primario min-h-[52px] w-full text-[15px]" onclick={() => (filtrosAbertos = false)}>Aplicar · {filtrados.length} {filtrados.length === 1 ? 'jutsu' : 'jutsus'}</button>
		{/snippet}
	</Folha>
{/if}

{#if aberto}
	<Modal rotulo={aberto.nome} largura={720} topo={40} aoFechar={() => history.back()}>
		<div class="flex items-center border-b-2 border-b3 py-2 pr-2 pl-4">
			<span class="t-rotulo-sm flex-1 truncate tracking-[.1em] text-mut">/REGRAS/JUTSUS/{aberto.slug.toUpperCase()}</span>
			<BotaoFavorito slug={aberto.slug} nome={aberto.nome} class="h-11! w-11!" />
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Copiar link" onclick={() => copiarLink(aberto)}><Traco nome="link" /></button>
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Fechar" onclick={() => history.back()}><Traco nome="fechar" /></button>
		</div>
		<div class="p-4 md:p-5">
			<DetalheJutsu jutsu={aberto} nomeCla={aberto.cla ? data.nomesCla[aberto.cla] : null} />
		</div>
	</Modal>
{/if}
