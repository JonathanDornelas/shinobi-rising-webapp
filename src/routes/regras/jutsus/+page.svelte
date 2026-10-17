<script lang="ts">
	// D4 · Catálogo de jutsus: filtros (coluna de 260 no desktop, bottom sheet no mobile), grade ou tabela.
	// Abrir um jutsu mostra o D5 em modal com URL própria (shallow routing).
	import { onMount } from 'svelte';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import BadgeTipo from '#lib/componentes/regras/BadgeTipo.svelte';
	import DetalheJutsu from '#lib/componentes/regras/DetalheJutsu.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Folha from '#lib/componentes/ui/Folha.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { ELEMENTO, RANK, RANKS, TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { acaoDe, alcanceAlvo, FAIXAS_CUSTO, faixaCusto } from '#lib/livro/filtros-jutsu.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { Jutsu } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const todos = $derived(data.jutsus as Jutsu[]);

	interface Grupo {
		id: string;
		rotulo: string;
		obter: (j: Jutsu) => string | null;
		ordem?: string[];
		nome?: (v: string) => string;
	}
	const GRUPOS: Grupo[] = [
		{ id: 'tipo', rotulo: 'Tipo', obter: (j) => j.tipo, ordem: Object.keys(TIPO_JUTSU) },
		{ id: 'rank', rotulo: 'Rank', obter: (j) => j.rank, ordem: RANKS, nome: (v) => `Rank ${v}` },
		{ id: 'origem', rotulo: 'Origem', obter: (j) => j.origem },
		{ id: 'elemento', rotulo: 'Elemento', obter: (j) => j.elemento, nome: (v) => ELEMENTO[v]?.nome ?? v },
		{ id: 'custo', rotulo: 'Custo', obter: faixaCusto, ordem: FAIXAS_CUSTO.map((f) => f.id), nome: (v) => FAIXAS_CUSTO.find((f) => f.id === v)!.rotulo },
		{ id: 'acao', rotulo: 'Ação', obter: acaoDe, ordem: ['Primária', 'Secundária', 'Reação', 'Completa'] },
		{ id: 'alvo', rotulo: 'Área × alvo único', obter: alcanceAlvo }
	];

	let busca = $state('');
	let sel = $state<Record<string, string[]>>({});
	let ordem = $state<'nome' | 'rank' | 'custo'>('rank');
	let visao = $state<'grade' | 'tabela'>('grade');
	let filtrosAbertos = $state(false);

	const passa = (j: Jutsu, ignorar?: string) =>
		GRUPOS.every((g) => g.id === ignorar || !sel[g.id]?.length || sel[g.id].includes(g.obter(j) ?? '')) &&
		(!busca.trim() || normalizar(`${j.nome} ${j.traducao}`).includes(normalizar(busca)));

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
			const valores = [...new Set(todos.map(g.obter).filter((v): v is string => !!v))];
			if (g.ordem) valores.sort((a, b) => g.ordem!.indexOf(a) - g.ordem!.indexOf(b));
			return { ...g, valores: valores.map((v) => ({ v, nome: g.nome?.(v) ?? v, n: todos.filter((j) => g.obter(j) === v && passa(j, g.id)).length })) };
		})
	);
	const ativos = $derived(GRUPOS.flatMap((g) => (sel[g.id] ?? []).map((v) => ({ g: g.id, v, nome: g.nome?.(v) ?? v }))));

	function alternar(g: string, v: string) {
		const atual = sel[g] ?? [];
		sel = { ...sel, [g]: atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v] };
	}
	function limpar() {
		sel = {};
		busca = '';
	}

	// filtros na URL (?tipo=Ninjutsu&rank=C), para links compartilháveis
	onMount(() => {
		const p = new URLSearchParams(location.search);
		const lidos: Record<string, string[]> = {};
		for (const g of GRUPOS) if (p.getAll(g.id).length) lidos[g.id] = p.getAll(g.id);
		sel = lidos;
		busca = p.get('q') ?? '';
	});
	let montado = false;
	$effect(() => {
		const p = new URLSearchParams();
		if (busca.trim()) p.set('q', busca.trim());
		for (const a of ativos) p.append(a.g, a.v);
		const qs = p.toString();
		if (!montado) {
			montado = true;
			return;
		}
		if (!page.state.jutsu) replaceState(`/regras/jutsus${qs ? '?' + qs : ''}`, {});
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
		<div class="flex flex-col gap-2 border-b-2 border-b3 px-3.5 py-3 last:border-b-0" role="group" aria-label={g.rotulo}>
			<span class="t-rotulo-sm tracking-[.08em] text-mut">{g.rotulo}</span>
			{#if toque}
				<div class="flex flex-wrap gap-1.5">
					{#each g.valores as o (o.v)}
						{@const on = sel[g.id]?.includes(o.v)}
						<button type="button" class="chip sem-icone min-h-10 {on ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={on} onclick={() => alternar(g.id, o.v)}>{o.nome}</button>
					{/each}
				</div>
			{:else}
				<div class="flex max-h-[232px] flex-col overflow-y-auto">
					{#each g.valores as o (o.v)}
						{@const on = !!sel[g.id]?.includes(o.v)}
						<label class="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm leading-5 font-medium {o.n || on ? '' : 'text-mut'}">
							<input type="checkbox" class="peer sr-only" checked={on} onchange={() => alternar(g.id, o.v)} />
							<span class="flex h-5 w-5 flex-none items-center justify-center border-2 font-pixel text-xs font-bold text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" style:background={on ? '#C44536' : 'var(--b1)'} style:border-color={on ? 'var(--ink)' : 'var(--field)'}>{on ? '✓' : ''}</span>
							<span class="flex-1">{o.nome}</span>
							<span class="t-num text-xs text-mut">{o.n}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
{/snippet}

<main class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-4 px-4 pt-4 pb-12 md:px-6 md:pt-8 md:pb-14">
	<div class="hidden flex-col gap-1.5 md:flex">
		<a href="/regras/jutsus-e-elementos#catalogo-de-jutsus" class="font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-title hover:underline">CAP. 8 E 10</a>
		<h1 class="t-h1 m-0">Jutsus</h1>
	</div>
	<h1 class="sr-only md:hidden">Jutsus</h1>

	<div class="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
		<aside class="painel hidden flex-col lg:flex" aria-label="Filtros">
			<div class="flex items-center border-b-2 border-b3 px-3.5 py-3">
				<span class="t-rotulo flex-1">Filtros</span>
				<button type="button" class="link text-[13px] leading-[18px] font-semibold" onclick={limpar}>Limpar</button>
			</div>
			{@render painelFiltros(false)}
		</aside>

		<div class="flex min-w-0 flex-col gap-3.5">
			<div class="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-3">
				<label class="campo flex h-12 flex-1 items-center gap-2.5 md:h-11">
					<span class="text-mut"><Traco nome="buscar" /></span>
					<input bind:value={busca} type="search" placeholder="Nome em rōmaji ou tradução" aria-label="Buscar jutsu pelo nome em rōmaji ou pela tradução" class="min-w-0 flex-1 bg-transparent text-base text-fg outline-none" />
				</label>
				<div class="flex gap-2 md:contents">
					<button type="button" class="btn-jogo btn-primario min-h-11 flex-1 px-3 text-[13px] lg:hidden" onclick={() => (filtrosAbertos = true)}>Filtros{ativos.length ? ` (${ativos.length})` : ''}</button>
					<label class="flex h-11 flex-1 items-center gap-2 border-2 border-b3 px-3 text-sm font-semibold md:flex-none">
						<span class="hidden sm:inline">Ordenar:</span>
						<select bind:value={ordem} class="flex-1 bg-transparent text-sm font-semibold text-fg outline-none" aria-label="Ordenar por">
							<option value="rank" class="bg-b2">Rank</option>
							<option value="nome" class="bg-b2">Nome</option>
							<option value="custo" class="bg-b2">Custo</option>
						</select>
					</label>
				</div>
				<div class="alternancia hidden md:flex">
					<button type="button" class="min-h-10" aria-pressed={visao === 'grade'} onclick={() => (visao = 'grade')}>Grade</button>
					<button type="button" class="min-h-10" aria-pressed={visao === 'tabela'} onclick={() => (visao = 'tabela')}>Tabela</button>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<span class="text-sm leading-5 font-semibold text-mut" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'jutsu' : 'jutsus'}</span>
				{#each ativos as a (a.g + a.v)}
					<span class="chip sem-icone gap-1.5 border-mut bg-b2 pr-1">
						{a.nome}
						<button type="button" class="flex h-7 w-7 items-center justify-center" aria-label="Remover filtro {a.nome}" onclick={() => alternar(a.g, a.v)}><Traco nome="fechar" tamanho={16} espessura={2.5} /></button>
					</span>
				{/each}
				{#if ativos.length}<button type="button" class="link text-sm font-semibold" onclick={limpar}>Limpar filtros</button>{/if}
			</div>

			{#if !filtrados.length}
				<div class="painel-sombra flex flex-col items-center gap-3 px-6 py-8 text-center">
					<Icone id="illustrations/il-sem-resultados" tamanho={96} />
					<span class="font-mincho text-[22px] leading-[30px] font-bold">Nenhum jutsu com esses filtros</span>
					<button type="button" class="btn-jogo btn-contorno mt-1.5" onclick={limpar}>Limpar filtros</button>
				</div>
			{:else if visao === 'grade'}
				<div class="grid grid-cols-[minmax(0,1fr)] gap-2 md:gap-3 xl:grid-cols-2">
					{#each filtrados as j (j.slug)}
						{@const t = TIPO_JUTSU[j.tipo]}
						<a
							href="/regras/jutsus/{j.slug}"
							onclick={(e) => abrir(e, j)}
							class="painel cartao-link grid grid-cols-[4px_32px_minmax(0,1fr)_auto] items-center gap-2.5 py-2 pr-3 md:sombra-painel md:gap-3 md:py-2.5 md:pr-3.5"
						>
							<span class="-my-2 self-stretch md:-my-2.5" style:background={t.cor}></span>
							<Icone id={iconeJ(j)} alt="Rank {j.rank}" />
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate font-mincho text-[15px] leading-5 font-bold md:text-[17px] md:leading-[22px]">{j.nome}</span>
								<span class="truncate text-xs leading-4 text-mut md:text-[13px] md:leading-[18px]"><span class="md:hidden">{j.tipo} · </span>{j.origem} · {acaoDe(j)}</span>
							</span>
							<span class="flex flex-col items-end gap-1.5">
								<span class="t-num text-[17px] leading-none whitespace-nowrap md:text-xl">{j.custo}</span>
								<span class="hidden md:block"><BadgeTipo tipo={j.tipo} semIcone /></span>
							</span>
						</a>
					{/each}
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="sombra-painel w-full border-collapse border-2 border-frame text-[15px] leading-[22px]">
						<thead>
							<tr class="bg-vermelhao text-left font-pixel text-[13px] leading-[18px] font-bold tracking-[.06em] text-white">
								<th class="px-3 py-2.5">NOME</th><th class="px-3 py-2.5">ORIGEM</th><th class="px-3 py-2.5">RANK</th><th class="px-3 py-2.5 text-right">CUSTO</th><th class="px-3 py-2.5">TIPO</th><th class="px-3 py-2.5">AÇÃO</th>
							</tr>
						</thead>
						<tbody>
							{#each filtrados as j, i (j.slug)}
								<tr class={i % 2 ? 'bg-b2' : 'bg-b1'}>
									<td class="px-3 py-1.5 font-semibold"><a href="/regras/jutsus/{j.slug}" onclick={(e) => abrir(e, j)} class="hover:text-link">{j.nome}</a></td>
									<td class="px-3 py-1.5">{j.origem}</td>
									<td class="px-3 py-1.5"><span title="Rank {j.rank} · {RANK[j.rank].pj} PJ"><Icone id={iconeJ(j)} alt="Rank {j.rank}" /></span></td>
									<td class="t-num px-3 py-1.5 text-right whitespace-nowrap">{j.custo}</td>
									<td class="px-3 py-1.5"><BadgeTipo tipo={j.tipo} semIcone /></td>
									<td class="px-3 py-1.5">{acaoDe(j)}</td>
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
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Copiar link" onclick={() => copiarLink(aberto)}><Traco nome="link" /></button>
			<button type="button" class="flex h-11 w-11 items-center justify-center" aria-label="Fechar" onclick={() => history.back()}><Traco nome="fechar" /></button>
		</div>
		<div class="p-4 md:p-5">
			<DetalheJutsu jutsu={aberto} nomeCla={aberto.cla ? data.nomesCla[aberto.cla] : null} />
		</div>
	</Modal>
{/if}
