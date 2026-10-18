<script lang="ts">
	// D9 · Resultados de busca: contagem por tipo, filtro por tipo de conteúdo e lista paginada (estrutura do G2).
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { buscar, GRUPOS, trecho, type Resultado } from '#lib/busca/motor.ts';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import type { TipoDocBusca } from '#lib/livro/tipos.ts';

	const POR_PAGINA = 20;
	let consulta = $state('');
	let estado = $state<'vazio' | 'carregando' | 'pronto' | 'erro'>('vazio');
	let resultados = $state<Resultado[]>([]);
	let sugestao = $state<string | null>(null);
	let tipo = $state<TipoDocBusca | null>(null);
	let pagina = $state(1);
	let tentativa = $state(0);
	let pronto = $state(false);

	const filtrados = $derived(tipo ? resultados.filter((r) => r.tipo === tipo) : resultados);
	const paginas = $derived(Math.max(1, Math.ceil(filtrados.length / POR_PAGINA)));
	const visiveis = $derived(filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA));
	const contagem = (t: TipoDocBusca) => resultados.filter((r) => r.tipo === t).length;

	onMount(() => {
		consulta = new URLSearchParams(location.search).get('q') ?? '';
		pronto = true;
	});

	let pedido = 0;
	$effect(() => {
		const q = consulta.trim();
		void tentativa;
		if (!pronto) return;
		replaceState(`/busca${q ? `?q=${encodeURIComponent(q)}` : ''}`, {});
		if (!q) {
			estado = 'vazio';
			resultados = [];
			return;
		}
		const meu = ++pedido;
		estado = 'carregando';
		const t = setTimeout(async () => {
			try {
				const r = await buscar(q);
				if (meu !== pedido) return;
				resultados = r.resultados;
				sugestao = r.sugestao;
				pagina = 1;
				estado = 'pronto';
				paleta.lembrar(q);
			} catch {
				if (meu === pedido) estado = 'erro';
			}
		}, 200);
		return () => clearTimeout(t);
	});
</script>

<main class="mx-auto box-border grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] items-start gap-5 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
	<h1 class="sr-only">Busca</h1>
	<aside class="painel hidden flex-col lg:flex" aria-label="Tipo de conteúdo">
		<span class="t-rotulo border-b-2 border-b3 px-3.5 py-3">Tipo de conteúdo</span>
		{#each [{ tipo: null, rotulo: 'Todos', n: resultados.length }, ...GRUPOS.map((g) => ({ tipo: g.tipo, rotulo: g.rotulo, n: contagem(g.tipo) }))] as g (g.rotulo)}
			{@const on = tipo === g.tipo}
			<button
				type="button"
				class="flex min-h-11 items-center gap-2.5 border-b-2 border-b3 px-3.5 text-left text-sm leading-5 last:border-b-0 {on ? 'bg-grena font-semibold text-papel shadow-[inset_4px_0_0_var(--vermelhao)]' : g.n ? 'font-medium hover:bg-b3' : 'font-medium text-mut'}"
				aria-pressed={on}
				onclick={() => ((tipo = g.tipo), (pagina = 1))}
			>
				<span class="flex-1">{g.rotulo}</span><span class="t-num text-[13px]">{g.n}</span>
			</button>
		{/each}
	</aside>

	<div class="flex min-w-0 flex-col gap-3.5">
		<label class="flex h-14 items-center gap-3 border-2 border-vermelhao bg-b1 px-3.5 shadow-[inset_0_3px_0_var(--b3)]">
			<Traco nome="buscar" />
			<input bind:value={consulta} type="search" placeholder="Buscar regras, jutsus, clãs, itens…" aria-label="Buscar" class="min-w-0 flex-1 bg-transparent text-lg text-fg outline-none" />
		</label>

		{#if estado === 'pronto' && resultados.length}
			<div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:hidden">
				<button type="button" class="chip sem-icone flex-none font-pixel text-xs font-bold {tipo === null ? 'border-vermelhao bg-vermelhao text-white' : ''}" onclick={() => (tipo = null)}>TUDO {resultados.length}</button>
				{#each GRUPOS.filter((g) => contagem(g.tipo)) as g (g.tipo)}
					<button type="button" class="chip sem-icone flex-none font-pixel text-xs font-bold uppercase {tipo === g.tipo ? 'border-vermelhao bg-vermelhao text-white' : ''}" onclick={() => ((tipo = g.tipo), (pagina = 1))}>{g.curto} {contagem(g.tipo)}</button>
				{/each}
			</div>
		{/if}

		{#if estado === 'vazio'}
			<div class="painel flex flex-col gap-3 p-4">
				<span class="text-[15px]">Digite o que procura: uma regra, um jutsu, um clã, uma arma ou um termo do glossário.</span>
				{#if paleta.recentes.length}
					<span class="t-rotulo-sm text-title">Buscas recentes</span>
					<div class="flex flex-wrap gap-2">
						{#each paleta.recentes as r (r)}<button type="button" class="chip sem-icone" onclick={() => (consulta = r)}>{r}</button>{/each}
					</div>
				{/if}
			</div>
		{:else if estado === 'carregando'}
			<div class="pulso painel flex flex-col gap-4 p-4" aria-busy="true" aria-label="Carregando resultados">
				{#each [70, 55, 62, 48] as w (w)}
					<div class="flex gap-3"><div class="esqueleto h-8 w-8"></div><div class="flex flex-1 flex-col gap-1.5"><div class="esqueleto h-3.5" style:width="{w}%"></div><div class="esqueleto h-2.5 w-[30%]"></div><div class="esqueleto h-3" style:width="{w + 20}%"></div></div></div>
				{/each}
			</div>
		{:else if estado === 'erro'}
			<div class="painel flex items-center gap-2.5 p-4 text-sm font-semibold">
				<Icone id="status/ic-status-rejeitado" />Busca indisponível.<span class="flex-1"></span>
				<button type="button" class="btn-jogo btn-erro" onclick={() => tentativa++}>Tentar de novo</button>
			</div>
		{:else if !resultados.length}
			<div class="painel-sombra flex flex-col items-center gap-3 px-6 py-8 text-center">
				<Icone id="illustrations/il-sem-resultados" tamanho={96} />
				<span class="font-mincho text-[22px] leading-[30px] font-bold">Nenhum resultado para “{consulta.trim()}”</span>
				{#if sugestao}
					<span class="text-[15px] text-mut">Você quis dizer <button type="button" class="link font-semibold" onclick={() => (consulta = sugestao ?? '')}>{sugestao}</button>?</span>
				{:else}
					<span class="text-[15px] text-mut">Tente o nome em rōmaji ou a sigla (PC, PJ, KKG).</span>
				{/if}
			</div>
		{:else}
			<span class="text-sm leading-5 font-semibold text-mut" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'} para “{consulta.trim()}”</span>
			<ol class="m-0 flex list-none flex-col border-2 border-frame bg-b2 p-0">
				{#each visiveis as r (r.id)}
					{@const t = trecho(r.texto, consulta)}
					<li class="border-b-2 border-b3 last:border-b-0">
						<a href={r.href} class="flex items-start gap-3 px-3.5 py-3 hover:bg-b3">
							<Icone id={r.icone} />
							<span class="flex min-w-0 flex-1 flex-col gap-0.5">
								<span class="text-base leading-[22px] font-semibold">{r.titulo}</span>
								<span class="text-xs leading-4 text-mut">{r.caminho}</span>
								{#if t}<span class="line-clamp-2 text-sm leading-[21px] text-mut">{t.pre}<mark>{t.hit}</mark>{t.pos}</span>{/if}
							</span>
							{#if r.rank}<Icone id="rank/ic-rank-{r.rank.toLowerCase()}" alt="Rank {r.rank}" />{/if}
						</a>
					</li>
				{/each}
			</ol>
			{#if paginas > 1}
				<nav aria-label="Páginas" class="flex self-start border-2 border-frame font-pixel text-[15px] font-bold">
					<button type="button" class="flex h-11 w-11 items-center justify-center disabled:text-mut" disabled={pagina === 1} aria-label="Página anterior" onclick={() => (pagina--, scrollTo({ top: 0 }))}>◂</button>
					{#each Array.from({ length: paginas }, (_, i) => i + 1) as n (n)}
						<button
							type="button"
							class="flex h-11 w-11 items-center justify-center border-l-2 border-frame"
							style:background={n === pagina ? 'var(--vermelhao)' : undefined}
							style:color={n === pagina ? '#FFFFFF' : undefined}
							aria-current={n === pagina ? 'page' : undefined}
							onclick={() => ((pagina = n), scrollTo({ top: 0 }))}>{n}</button
						>
					{/each}
					<button type="button" class="flex h-11 w-11 items-center justify-center border-l-2 border-frame disabled:text-mut" disabled={pagina === paginas} aria-label="Próxima página" onclick={() => (pagina++, scrollTo({ top: 0 }))}>▸</button>
				</nav>
			{/if}
		{/if}
	</div>
</main>

<Rodape />
