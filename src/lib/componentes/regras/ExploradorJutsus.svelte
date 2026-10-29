<script lang="ts" module>
	import type { Jutsu } from '#lib/livro/tipos.ts';

	export interface GrupoFiltro {
		id: string;
		rotulo: string;
		/** Valor (ou valores, num grupo como Efeito) do jutsu neste grupo. */
		obter: (j: Jutsu) => string | string[] | null;
		ordem?: string[];
		nome?: (v: string) => string;
		/** Aberto quando a página carrega. */
		aberto?: boolean;
	}
</script>

<script lang="ts">
	// D4 · Explorador de jutsus: filtros (coluna de 260 no desktop, bottom sheet no mobile) em grupos recolhíveis,
	// busca no nome (e, se pedir, no efeito), favoritos e quatro visualizações: lista, cards, livro (card completo) e
	// tabela. Serve o catálogo (/regras/jutsus, filtros na URL) e a aba Jutsus da campanha (oficiais e criados, com
	// status e ações por jutsu). Um jutsu "em modal" abre o D5 por cima, com shallow routing.
	import { onMount, untrack, type Snippet } from 'svelte';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { favoritos } from '#lib/estado/favoritos.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { ELEMENTO, RANK, RANKS, TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { acaoDe, alcanceAlvo, ataqueDe, DURACOES, duracaoDe, EFEITOS, efeitosJutsu, FAIXAS_CUSTO, faixaCusto, info, nomeEfeito, resistenciaDe, textoEfeito } from '#lib/livro/filtros-jutsu.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import Folha from '../ui/Folha.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';
	import Traco, { type NomeTraco } from '../ui/Traco.svelte';
	import BadgeTipo from './BadgeTipo.svelte';
	import BotaoFavorito from './BotaoFavorito.svelte';
	import CardJutsu from './CardJutsu.svelte';
	import ChipElemento from './ChipElemento.svelte';
	import DetalheJutsu from './DetalheJutsu.svelte';
	import Glosa from './Glosa.svelte';
	import SeloRank from './SeloRank.svelte';

	interface Props {
		jutsus: Jutsu[];
		nomesCla: Record<string, string>;
		/** Grupos de filtro antes dos do livro (status, autor…). */
		extras?: GrupoFiltro[];
		/** Caminho do catálogo: filtros na URL e o modal em <url>/<slug>. Sem ele, os filtros ficam só na tela. */
		url?: string | null;
		/** Link de cada jutsu (padrão: a página dele no catálogo). */
		href?: (j: Jutsu) => string;
		/** Abre o D5 em modal em vez de seguir o link (padrão: todos). */
		emModal?: (j: Jutsu) => boolean;
		/** Mostra a estrela de favorito (padrão: todos). */
		favoritavel?: (j: Jutsu) => boolean;
		/** Linha abaixo do nome na lista (padrão: origem · ação). */
		linha?: (j: Jutsu) => string;
		/** Selo ao lado do custo (status de uma criação). */
		selo?: Snippet<[Jutsu]>;
		/** Botões do jutsu; o segundo argumento diz se estão sobre a faixa grená. */
		acoes?: Snippet<[Jutsu, boolean]>;
		/** Texto quando não há jutsu nenhum (sem contar filtros). */
		vazio?: string;
		/** Chave da visualização guardada no navegador. */
		chaveVisao?: string;
	}
	let {
		jutsus: todos,
		nomesCla,
		extras = [],
		url = null,
		href = (j) => `/regras/jutsus/${j.slug}`,
		emModal = () => true,
		favoritavel = () => true,
		linha = (j) => `${j.origem} · ${acaoDe(j)}`,
		selo,
		acoes,
		vazio = 'Nenhum jutsu aqui ainda.',
		chaveVisao = 'jutsus-visao'
	}: Props = $props();

	const GRUPOS_LIVRO: GrupoFiltro[] = [
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
	const GRUPOS = $derived([...extras, ...GRUPOS_LIVRO]);
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
	// svelte-ignore state_referenced_locally
	let abertos = $state<Record<string, boolean>>(Object.fromEntries([...extras, ...GRUPOS_LIVRO].map((g) => [g.id, !!g.aberto])));

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
			// um filtro marcado continua visível mesmo se a lista atual não tem esse valor (trocar de aba, por exemplo)
			for (const v of sel[g.id] ?? []) if (!valores.includes(v)) valores.push(v);
			return { ...g, marcados: sel[g.id]?.length ?? 0, valores: valores.map((v) => ({ v, nome: g.nome?.(v) ?? v, n: n(v) })) };
		}).filter((g) => g.valores.length)
	);
	const ativos = $derived(GRUPOS.flatMap((g) => (sel[g.id] ?? []).map((v) => ({ g: g.id, v, nome: g.nome?.(v) ?? v }))));
	const nFavoritos = $derived(todos.filter((j) => favoritavel(j) && favoritos.tem(j.slug)).length);
	const algumFavoritavel = $derived(todos.some((j) => favoritavel(j)));

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
		gravar(chaveVisao, v);
	}

	// filtros na URL (?tipo=Ninjutsu&rank=C&q=fogo&texto=1&fav=1), para links compartilháveis; a visão fica no navegador
	onMount(() => {
		const v = ler<string>(chaveVisao, 'lista');
		if (VISOES.some((x) => x.id === v)) visao = v as Visao;
		if (!url) return;
		const p = new URLSearchParams(location.search);
		const lidos: Record<string, string[]> = {};
		for (const g of GRUPOS) if (p.getAll(g.id).length) lidos[g.id] = p.getAll(g.id);
		sel = lidos;
		abertos = { ...abertos, ...Object.fromEntries(Object.keys(lidos).map((g) => [g, true])) };
		busca = p.get('q') ?? '';
		noEfeito = p.get('texto') === '1';
		soFavoritos = p.get('fav') === '1';
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
		if (!url) return;
		// sem rastrear page.state: o replaceState troca o page.state e o efeito rodaria de novo, sem fim
		untrack(() => {
			if (!page.state.jutsu) replaceState(`${url}${qs ? '?' + qs : ''}`, {});
		});
	});

	// D5 em modal
	const aberto = $derived(page.state.jutsu ? todos.find((j) => j.slug === page.state.jutsu) : null);
	function abrir(e: MouseEvent, j: Jutsu) {
		if (!emModal(j) || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();
		pushState(url ? `${url}/${j.slug}` : '', { jutsu: j.slug });
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

{#snippet botoes(j: Jutsu, sobreFaixa: boolean, tamanho = 20)}
	{#if favoritavel(j)}<BotaoFavorito slug={j.slug} nome={j.nome} {sobreFaixa} {tamanho} class="relative z-10" />{/if}
	{#if acoes}{@render acoes(j, sobreFaixa)}{/if}
{/snippet}

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
				{#if algumFavoritavel}
					<button
						type="button"
						class="flex min-h-11 flex-1 items-center justify-center gap-1.5 border-2 px-3 text-sm font-semibold md:flex-none {soFavoritos ? 'border-ink bg-grena text-papel' : 'border-b3 hover:border-mut'}"
						aria-pressed={soFavoritos}
						title={nFavoritos ? 'Mostrar só os favoritos' : 'Marque jutsus com a estrela para encontrá-los aqui'}
						onclick={() => (soFavoritos = !soFavoritos)}
					>
						<Traco nome="estrela" tamanho={18} class={soFavoritos || nFavoritos ? 'estrela-on' : ''} />Favoritos <span class="t-num text-xs opacity-80">{nFavoritos}</span>
					</button>
				{/if}
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

		{#if !todos.length}
			<div class="flex flex-col items-center gap-2.5 border-2 border-dashed border-b3 p-10 text-center">
				<Icone id="nav/ic-nav-jutsus" tamanho={64} />
				<span class="max-w-[46ch] text-base leading-[22px] font-semibold">{vazio}</span>
			</div>
		{:else if !filtrados.length}
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
					<div class="painel cartao-link relative grid grid-cols-[4px_32px_minmax(0,1fr)_auto_auto] items-center gap-2.5 py-1 pr-1 md:sombra-painel md:gap-3 md:py-1.5">
						<span class="-my-1 self-stretch md:-my-1.5" style:background={t.cor}></span>
						<Icone id={iconeJ(j)} alt="Rank {j.rank}" />
						<span class="flex min-w-0 flex-col gap-0.5">
							<span class="flex min-w-0 flex-col">
								<a href={href(j)} onclick={(e) => abrir(e, j)} class="truncate font-mincho text-[15px] leading-5 font-bold after:absolute after:inset-0 md:text-[17px] md:leading-[22px]">{j.nome}</a>
								<Glosa texto={j.traducao} class="truncate text-xs leading-4 md:text-[13px] md:leading-[18px]" />
							</span>
							<span class="truncate text-xs leading-4 text-mut md:text-[13px] md:leading-[18px]"><span class="md:hidden">{j.tipo}{' · '}</span>{linha(j)}</span>
						</span>
						<span class="flex flex-col items-end gap-1.5">
							<span class="t-num text-[17px] leading-none whitespace-nowrap md:text-xl">{j.custo}</span>
							{#if selo}{@render selo(j)}{:else}<span class="hidden md:block"><BadgeTipo tipo={j.tipo} semIcone /></span>{/if}
						</span>
						<span class="flex min-w-10 items-center justify-end">{@render botoes(j, false)}</span>
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
								<a href={href(j)} onclick={(e) => abrir(e, j)} class="font-mincho text-lg leading-6 font-bold text-papel after:absolute after:inset-0">{j.nome}</a>
								<span class="truncate text-[13px] leading-[18px] text-papel-2 italic">{j.traducao}</span>
							</div>
							{@render botoes(j, true)}
						</header>
						<div class="flex flex-1 flex-col gap-2.5 p-3">
							<div class="flex flex-wrap items-center gap-2">
								<BadgeTipo tipo={j.tipo} semIcone />
								<SeloRank rank={j.rank} />
								{#if j.elemento}<ChipElemento elemento={j.elemento} />{/if}
								{#if selo}{@render selo(j)}{/if}
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
					<CardJutsu jutsu={j} rodape={!selo}>
						{#snippet acoes()}
							{@render botoes(j, true)}
							<a href={href(j)} onclick={(e) => abrir(e, j)} class="flex h-10 w-10 items-center justify-center text-papel-2 hover:text-papel" aria-label="Abrir {j.nome}" title="Abrir em detalhe"><Traco nome="chevron" /></a>
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
							{#if selo}<th class="px-2 py-2.5">STATUS</th>{/if}
							{#if acoes}<th class="px-2 py-2.5"><span class="sr-only">Ações</span></th>{/if}
						</tr>
					</thead>
					<tbody>
						{#each filtrados as j, i (j.slug)}
							<tr class={i % 2 ? 'bg-b2' : 'bg-b1'}>
								<td class="sticky left-0 z-10 py-0 pr-3 {i % 2 ? 'bg-b2' : 'bg-b1'}">
									<span class="flex items-center">
										{#if favoritavel(j)}<BotaoFavorito slug={j.slug} nome={j.nome} tamanho={18} />{:else}<span class="w-10 flex-none"></span>{/if}
										<span class="flex flex-col py-1"><a href={href(j)} onclick={(e) => abrir(e, j)} class="text-[15px] leading-5 font-semibold whitespace-nowrap hover:text-link">{j.nome}</a><Glosa texto={j.traducao} class="text-xs leading-4 whitespace-nowrap" /></span>
									</span>
								</td>
								<td class="px-2 py-1.5"><span title="Rank {j.rank} · {RANK[j.rank].pj} PJ"><Icone id={iconeJ(j)} alt="Rank {j.rank}" /></span></td>
								<td class="t-num px-2 py-1.5 text-right text-[15px] whitespace-nowrap">{j.custo}</td>
								<td class="px-2 py-1.5"><BadgeTipo tipo={j.tipo} semIcone /></td>
								<td class="px-2 py-1.5">{acaoDe(j)}</td>
								<td class="min-w-[90px] px-2 py-1.5">{info(j, 'Alcance')}</td>
								<td class="min-w-[110px] px-2 py-1.5">{info(j, 'Duração')}</td>
								<td class="px-2 py-1.5 whitespace-nowrap">{resistenciaDe(j) === 'Sem resistência' ? '—' : resistenciaDe(j)}</td>
								<td class="min-w-[120px] px-2 py-1.5">{j.origem}</td>
								{#if selo}<td class="px-2 py-1.5 whitespace-nowrap">{@render selo(j)}</td>{/if}
								{#if acoes}<td class="px-1 py-1"><span class="flex items-center justify-end">{@render acoes(j, false)}</span></td>{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

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
			{#if favoritavel(aberto)}<BotaoFavorito slug={aberto.slug} nome={aberto.nome} class="h-11! w-11!" />{/if}
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Copiar link" onclick={() => copiarLink(aberto)}><Traco nome="link" /></button>
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Fechar" onclick={() => history.back()}><Traco nome="fechar" /></button>
		</div>
		<div class="p-4 md:p-5">
			<DetalheJutsu jutsu={aberto} nomeCla={aberto.cla ? nomesCla[aberto.cla] : null} />
		</div>
	</Modal>
{/if}
