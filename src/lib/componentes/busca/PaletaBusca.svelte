<script lang="ts">
	// Busca global (G2 · CMP-35). Ctrl/⌘ + K abre; ↑/↓ navegam; Tab alterna grupos; Enter abre; Esc fecha.
	import { goto } from '$app/navigation';
	import { agrupar, buscar, GRUPOS, trecho, type Resultado } from '#lib/busca/motor.ts';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import type { TipoDocBusca } from '#lib/livro/tipos.ts';
	import { prenderFoco } from '../ui/foco';
	import Icone from '../ui/Icone.svelte';
	import Traco from '../ui/Traco.svelte';

	const ATALHOS = [
		{ titulo: 'Criação de Personagem', icone: 'acao/ic-acao-criar-personagem', href: '/regras/criacao-de-personagem' },
		{ titulo: 'Tabela de PJ', icone: 'rank/ic-rank-c', href: '/regras/criacao-de-jutsus#passo-3-verificar-o-rank' },
		{ titulo: 'Estados Especiais', icone: 'estado/ic-estado-atordoado', href: '/regras/combate#estados-especiais' },
		{ titulo: 'Fadiga', icone: 'recurso/ic-recurso-fadiga', href: '/regras/combate#fadiga' }
	];

	let consulta = $state('');
	let estado = $state<'vazio' | 'carregando' | 'pronto' | 'erro'>('vazio');
	let resultados = $state<Resultado[]>([]);
	let sugestao = $state<string | null>(null);
	let selecao = $state(0);
	let filtro = $state<TipoDocBusca | null>(null);
	let lista: HTMLDivElement | undefined = $state();
	let tentativa = $state(0);

	const grupos = $derived(agrupar(filtro ? resultados.filter((r) => r.tipo === filtro) : resultados, filtro ? 30 : 4));
	const planos = $derived(grupos.flatMap((g) => g.itens));
	const contagem = $derived(Object.fromEntries(GRUPOS.map((g) => [g.tipo, resultados.filter((r) => r.tipo === g.tipo).length])));

	let pedido = 0;
	let atraso: ReturnType<typeof setTimeout>;
	$effect(() => {
		const q = consulta;
		void tentativa;
		clearTimeout(atraso);
		if (!q.trim()) {
			estado = 'vazio';
			resultados = [];
			return;
		}
		const meu = ++pedido;
		atraso = setTimeout(async () => {
			if (estado !== 'pronto') estado = 'carregando';
			try {
				const r = await buscar(q);
				if (meu !== pedido) return;
				resultados = r.resultados;
				sugestao = r.sugestao;
				selecao = 0;
				estado = 'pronto';
			} catch {
				if (meu === pedido) estado = 'erro';
			}
		}, 120);
	});

	function fechar() {
		paleta.fechar();
	}

	function abrir(href: string) {
		paleta.lembrar(consulta);
		fechar();
		goto(href);
	}

	function verTodos() {
		abrir(`/busca?q=${encodeURIComponent(consulta.trim())}`);
	}

	function rolarParaSelecao() {
		queueMicrotask(() => lista?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
	}

	function tecla(e: KeyboardEvent) {
		if (!planos.length) {
			if (e.key === 'Enter' && consulta.trim()) verTodos();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selecao = (selecao + 1) % planos.length;
			rolarParaSelecao();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selecao = (selecao - 1 + planos.length) % planos.length;
			rolarParaSelecao();
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const inicios = grupos.map((g) => planos.indexOf(g.itens[0]));
			const atual = inicios.findLastIndex((i) => i <= selecao);
			const prox = e.shiftKey ? (atual - 1 + inicios.length) % inicios.length : (atual + 1) % inicios.length;
			selecao = inicios[prox];
			rolarParaSelecao();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			abrir(planos[selecao].href);
		}
	}
</script>

<div
	class="fixed inset-0 z-[55] flex justify-center bg-[rgba(14,11,10,.78)] md:pt-[72px]"
	role="presentation"
	onclick={(e) => e.target === e.currentTarget && fechar()}
	style:animation="surgir 150ms ease-out"
>
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Buscar"
		tabindex="-1"
		class="flex h-full w-full flex-col bg-b2 outline-none md:h-auto md:border-2 md:border-[#8B2E20] md:shadow-[8px_8px_0_#000] md:max-h-[calc(100vh-120px)] md:w-[640px] md:self-start"
		{@attach prenderFoco(fechar)}
	>
		<div class="flex h-[60px] flex-none items-center gap-1.5 border-b-2 border-b3 bg-b0 px-1.5 md:gap-3 md:bg-transparent md:px-3.5">
			<button class="flex h-11 w-11 items-center justify-center text-b0fg md:hidden" aria-label="Voltar" onclick={fechar}><Traco nome="voltar" /></button>
			<span class="hidden text-fg md:block"><Traco nome="buscar" /></span>
			<input
				bind:value={consulta}
				onkeydown={tecla}
				data-autofoco
				type="search"
				role="combobox"
				aria-expanded={planos.length > 0}
				aria-controls="paleta-resultados"
				aria-activedescendant={planos[selecao] ? `res-${planos[selecao].id}` : undefined}
				aria-label="Buscar regras, jutsus, clãs, itens"
				placeholder="Buscar regras, jutsus, clãs, itens…"
				autocomplete="off"
				spellcheck="false"
				class="h-11 min-w-0 flex-1 border-2 border-[#2E2420] bg-[#16110F] px-2.5 text-base text-[#EFE3D3] outline-none md:h-full md:border-0 md:bg-transparent md:px-0 md:text-lg md:text-fg [&::-webkit-search-cancel-button]:hidden"
			/>
			{#if consulta}
				<button class="flex h-11 w-11 items-center justify-center text-b0fg md:text-mut" aria-label="Limpar" onclick={() => (consulta = '')}><Traco nome="fechar" /></button>
			{/if}
			<button class="kbd-jogo hidden md:inline-block" onclick={fechar} aria-label="Fechar (Esc)">ESC</button>
		</div>

		{#if estado === 'pronto' && resultados.length}
			<div class="flex flex-none gap-1.5 overflow-x-auto border-b-2 border-b3 px-4 py-2.5 md:hidden">
				<button class="chip sem-icone font-pixel text-xs font-bold tracking-[.06em] whitespace-nowrap {filtro === null ? 'border-vermelhao bg-vermelhao text-white' : ''}" onclick={() => (filtro = null)}>TUDO {resultados.length}</button>
				{#each GRUPOS.filter((g) => contagem[g.tipo]) as g (g.tipo)}
					<button
						class="chip sem-icone font-pixel text-xs font-bold tracking-[.06em] whitespace-nowrap uppercase {filtro === g.tipo ? 'border-vermelhao bg-vermelhao text-white' : ''}"
						onclick={() => ((filtro = g.tipo), (selecao = 0))}>{g.curto} {contagem[g.tipo]}</button
					>
				{/each}
			</div>
		{/if}

		<div bind:this={lista} id="paleta-resultados" role="listbox" class="min-h-0 flex-1 overflow-y-auto py-1 md:max-h-[480px]">
			{#if estado === 'vazio'}
				{#if paleta.recentes.length}
					<span class="t-rotulo-sm block px-3.5 pt-3.5 pb-1.5 text-title">Buscas recentes</span>
					{#each paleta.recentes as r (r)}
						<button class="flex min-h-11 w-full items-center gap-2.5 px-3.5 text-left text-[15px] leading-5 font-medium hover:bg-b3" onclick={() => (consulta = r)}>
							<span class="text-mut"><Traco nome="recente" /></span>{r}
						</button>
					{/each}
				{/if}
				<span class="t-rotulo-sm block px-3.5 pt-3.5 pb-1.5 text-title">Atalhos populares</span>
				<div class="grid grid-cols-1 gap-2 px-3.5 pb-4 sm:grid-cols-2">
					{#each ATALHOS as a (a.href)}
						<button class="flex min-h-11 items-center gap-2 border-2 border-b3 bg-b1 py-1 pr-2.5 pl-1 text-left text-sm leading-5 font-semibold hover:border-mut" onclick={() => abrir(a.href)}>
							<Icone id={a.icone} />{a.titulo}
						</button>
					{/each}
				</div>
			{:else if estado === 'carregando'}
				<div class="pulso flex flex-col gap-2.5 p-3.5" aria-busy="true" aria-label="Carregando resultados">
					<div class="esqueleto h-2.5 w-20"></div>
					{#each [60, 52, 66] as w (w)}
						<div class="flex items-center gap-2.5">
							<div class="esqueleto h-8 w-8"></div>
							<div class="flex flex-1 flex-col gap-1.5"><div class="esqueleto h-3" style:width="{w}%"></div><div class="esqueleto h-2.5" style:width="{w - 20}%"></div></div>
						</div>
					{/each}
				</div>
			{:else if estado === 'erro'}
				<div class="flex items-center gap-2.5 px-3.5 py-4 text-sm leading-5 font-semibold">
					<Icone id="status/ic-status-rejeitado" />Busca indisponível.<span class="flex-1"></span>
					<button class="btn-jogo btn-erro" onclick={() => tentativa++}>Tentar de novo</button>
				</div>
			{:else if !resultados.length}
				<div class="flex items-center gap-4 p-6">
					<Icone id="illustrations/il-sem-resultados" tamanho={96} />
					<div class="flex flex-col gap-1.5">
						<span class="text-base leading-[22px] font-semibold">Nenhum resultado para “{consulta.trim()}”</span>
						{#if sugestao}
							<span class="text-sm leading-[21px] text-mut">Você quis dizer <button class="link font-semibold" onclick={() => (consulta = sugestao ?? '')}>{sugestao}</button>?</span>
						{:else}
							<span class="text-sm leading-[21px] text-mut">Tente o nome em rōmaji ou a sigla (PC, PJ, KKG).</span>
						{/if}
					</div>
				</div>
			{:else}
				{#each grupos as g (g.tipo)}
					<span class="t-rotulo-sm block px-3.5 pt-3 pb-1.5 text-title">{g.rotulo}</span>
					{#each g.itens as r (r.id)}
						{@const i = planos.indexOf(r)}
						{@const t = r.tipo === 'secao' ? trecho(r.texto, consulta) : null}
						<button
							id="res-{r.id}"
							role="option"
							aria-selected={i === selecao}
							class="flex w-full items-start gap-2.5 border-b-2 border-b3 px-3.5 py-2 text-left md:border-b-0"
							style:background={i === selecao ? '#5C1E15' : undefined}
							style:box-shadow={i === selecao ? 'inset 4px 0 0 #C44536' : undefined}
							style:color={i === selecao ? '#F4E4D6' : undefined}
							onmouseenter={() => (selecao = i)}
							onclick={() => abrir(r.href)}
						>
							<Icone id={r.icone} />
							<span class="flex min-w-0 flex-1 flex-col gap-0.5">
								<span class="text-[15px] leading-5 font-semibold">{r.titulo}</span>
								<span class="truncate text-xs leading-4 {i === selecao ? 'text-papel-2' : 'text-mut'}">{r.caminho}</span>
								{#if t}<span class="line-clamp-2 text-[13px] leading-[19px] {i === selecao ? 'text-papel-2' : 'text-mut'}">{t.pre}<mark>{t.hit}</mark>{t.pos}</span>{/if}
							</span>
							{#if r.rank}<Icone id="rank/ic-rank-{r.rank.toLowerCase()}" alt="Rank {r.rank}" />{/if}
							{#if i === selecao}<span class="kbd-jogo hidden self-center border-[#8B2E20] text-papel md:inline-block">ENTER</span>{/if}
						</button>
					{/each}
				{/each}
			{/if}
		</div>

		<div class="hidden flex-none items-center gap-4 border-t-2 border-b3 px-3.5 py-2.5 text-xs leading-4 text-mut md:flex">
			<span class="flex items-center gap-1"><span class="kbd-jogo">↑</span><span class="kbd-jogo">↓</span>navegar</span>
			<span class="flex items-center gap-1"><span class="kbd-jogo">TAB</span>grupos</span>
			<span class="flex items-center gap-1"><span class="kbd-jogo">ENTER</span>abrir</span>
			<span class="flex-1"></span>
			{#if estado === 'pronto' && resultados.length}
				<button class="link text-[13px] leading-[18px] font-semibold" onclick={verTodos}>Ver todos os resultados ({resultados.length})</button>
			{/if}
		</div>
	</div>
</div>
