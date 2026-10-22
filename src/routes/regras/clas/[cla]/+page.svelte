<script lang="ts">
	// D3 · Página do clã: faixa grená, abas-âncora fixas na ordem canônica e as seções do livro.
	import { afterNavigate } from '$app/navigation';
	import Blocos from '#lib/componentes/leitura/Blocos.svelte';
	import Destaque from '#lib/componentes/leitura/Destaque.svelte';
	import Epigrafe from '#lib/componentes/leitura/Epigrafe.svelte';
	import { EspiaoSecoes, realcar } from '#lib/componentes/leitura/espiao.svelte.ts';
	import Texto from '#lib/componentes/leitura/Texto.svelte';
	import CardHabilidade from '#lib/componentes/regras/CardHabilidade.svelte';
	import CardJutsu from '#lib/componentes/regras/CardJutsu.svelte';
	import Glosa from '#lib/componentes/regras/Glosa.svelte';
	import LinhaTempoMarcos from '#lib/componentes/regras/LinhaTempoMarcos.svelte';
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { RELACAO, RANKS } from '#lib/livro/dominio.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { Bloco, Rank } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const cla = $derived(data.cla);
	const jutsusDoCla = $derived(Object.values(data.jutsus));
	const habilidadesDoCla = $derived(Object.values(data.habilidades));

	const tipoSecao = (titulo: string) => {
		const t = normalizar(titulo);
		if (t.startsWith('bonus')) return 'bonus';
		if (t.startsWith('kekkei genkai')) return 'kkg';
		if (t.startsWith('marcos')) return 'marcos';
		if (t.startsWith('jutsus e habilidades')) return 'jutsus';
		if (t.startsWith('politica')) return 'politica';
		return 'texto';
	};
	const rotuloAba = (titulo: string) => titulo.split(' — ')[0].replace(/ do Clã$/, '').toUpperCase();

	// abas fixas com destaque da seção visível
	const espiao = new EspiaoSecoes();
	let corpo: HTMLElement | undefined = $state();
	$effect(() => {
		if (corpo) return espiao.observar(corpo, cla.secoes.map((s) => s.id));
	});
	let abas: HTMLElement | undefined = $state();
	$effect(() => {
		const ativa = abas?.querySelector(`[data-aba="${espiao.ativa}"]`);
		ativa?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});
	afterNavigate(() => {
		const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
		if (el) realcar(el);
	});

	let modoMarcos = $state<'linha' | 'tabela'>('linha');
	let filtroRank = $state<Rank | 'hab' | null>(null);
	/** Cards da seção "Jutsus e Habilidades" (os de outras seções, como o Mangekyou, ficam no lugar). */
	const secaoJutsus = $derived(cla.secoes.find((s) => tipoSecao(s.titulo) === 'jutsus'));
	const slugsGrade = $derived(new Set((secaoJutsus?.blocos ?? []).flatMap((b) => (b.tipo === 'jutsu' || b.tipo === 'habilidade' ? [b.slug] : []))));
	const jutsusGrade = $derived(jutsusDoCla.filter((j) => slugsGrade.has(j.slug)));
	const habilidadesGrade = $derived(habilidadesDoCla.filter((h) => slugsGrade.has(h.slug)));
	const ranksPresentes = $derived(RANKS.filter((r) => jutsusGrade.some((j) => j.rank === r)));

	const PERICIAS = ['acrobacia', 'atletismo', 'bukijutsu', 'furtividade', 'genjutsu', 'investigacao', 'kugutsu', 'medicina', 'ninjutsu', 'percepcao', 'persuasao', 'rastreamento', 'selamento', 'sobrevivencia', 'taijutsu'];
	function iconeBonus(texto: string) {
		const t = normalizar(texto);
		const attr = t.match(/^\+\d+ (for|agi|vig|int|ctr|esp)\b/);
		if (attr) return `atributo/ic-atributo-${attr[1]}`;
		const rec = t.match(/^\+\d+ (pv|pc|pe|pt|pic)\b/);
		if (rec) return `recurso/ic-recurso-${rec[1]}`;
		const per = PERICIAS.find((p) => t.includes(p));
		if (per) return `pericia/ic-pericia-${per}`;
		if (/cao|companheir|colonia|inseto/.test(t)) return 'modulo/ic-modulo-companheiro';
		return 'callout/ic-callout-destaque';
	}

	/** Na seção de Política, o parágrafo "Obrigação:" vira caixa de destaque. */
	const semObrigacao = (bs: Bloco[]) => bs.filter((b) => !(b.tipo === 'p' && /^Obriga/.test(b.c.map((x) => x.t).join(''))));
	/** Na seção de jutsus, os cards são mostrados em grade filtrável; o texto antes deles continua. */
	const semCards = (bs: Bloco[]) => bs.filter((b) => b.tipo !== 'jutsu' && b.tipo !== 'habilidade');
</script>

<header class="border-b-2 border-carvao bg-grena text-papel">
	<div class="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-[18px] md:px-6 md:py-7 lg:flex-row lg:items-center lg:gap-6">
		<div class="flex items-center gap-3.5 md:gap-6">
			<div class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-[var(--vermelhao-lo)] bg-[#16110F] md:h-24 md:w-24 md:shadow-[4px_4px_0_#0E0B0A]">
				<Icone id="cla/ic-cla-{cla.slug}" tamanho={64} alt="Kamon do clã {cla.nome}" />
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-1 md:gap-2">
				<nav aria-label="Trilha" class="hidden items-center gap-2 text-[13px] leading-[18px] font-medium md:flex">
					<a href="/regras" class="text-ouro underline-offset-2 hover:underline">Regras</a><span class="font-pixel text-xs">▸</span>
					<a href="/regras/clas" class="text-ouro underline-offset-2 hover:underline">Clãs</a>
				</nav>
				<h1 class="m-0 font-mincho text-[26px] leading-8 font-bold md:text-[40px] md:leading-[48px]">Clã {cla.nome}</h1>
				<span class="text-sm leading-5 text-papel-2 italic md:text-[17px] md:leading-6">{cla.epiteto}</span>
				<div class="mt-1 hidden flex-wrap gap-2 md:flex">
					<span class="chip border-[var(--vermelhao-lo)] {cla.vila.icone ? '' : 'sem-icone'}">{#if cla.vila.icone}<Icone id={cla.vila.icone} />{/if}{cla.vila.nome}{#if cla.vila.nota}<span class="font-normal text-papel-2">· {cla.vila.nota}</span>{/if}</span>
					{#if cla.kkg}
						<span class="chip border-[var(--vermelhao)] bg-[#16110F]"><Icone id={cla.kkg.icone} />{cla.kkg.nome} · {cla.kkg.tipo}</span>
					{:else}
						<span class="chip sem-icone border-dashed border-[var(--vermelhao-lo)]">Sem Kekkei Genkai</span>
					{/if}
					{#if cla.status}
						<span class="chip border-[var(--vermelhao-lo)]"><Icone id="recurso/ic-recurso-pic" />{cla.status.rotulo}{#if cla.status.pic !== null} · {cla.status.pic} PIC{/if}</span>
					{/if}
				</div>
			</div>
		</div>
		<div class="flex flex-wrap gap-2 md:hidden">
			<span class="chip border-[var(--vermelhao-lo)] text-xs {cla.vila.icone ? '' : 'sem-icone'}">{#if cla.vila.icone}<Icone id={cla.vila.icone} />{/if}{cla.vila.nome}</span>
			{#if cla.kkg}<span class="chip border-[var(--vermelhao)] bg-[#16110F] text-xs"><Icone id={cla.kkg.icone} />{cla.kkg.nome} · {cla.kkg.tipo}</span>{:else}<span class="chip sem-icone border-dashed border-[var(--vermelhao-lo)] text-xs">Sem Kekkei Genkai</span>{/if}
		</div>
		{#if cla.epigrafe}
			<div class="lg:w-[360px] lg:flex-none"><Epigrafe texto={cla.epigrafe.texto} autor={cla.epigrafe.autor} sobreFaixa /></div>
		{/if}
	</div>
</header>

<nav aria-label="Seções do clã" class="sticky top-0 z-20 border-b-2 border-ink bg-b2">
	<div bind:this={abas} class="mx-auto flex max-w-[1280px] overflow-x-auto font-pixel text-[13px] leading-none font-semibold tracking-[.04em] md:px-6 md:text-sm">
		{#each cla.secoes as s (s.id)}
			{@const on = espiao.ativa === s.id}
			<a href="#{s.id}" data-aba={s.id} class="flex-none px-3 py-4 whitespace-nowrap {on ? 'bg-vermelhao text-white' : 'text-mut hover:bg-b3 hover:text-fg'}" aria-current={on ? 'location' : undefined}
				>{on ? '▸ ' : ''}{rotuloAba(s.titulo)}</a
			>
		{/each}
	</div>
</nav>

<div class="mx-auto box-border grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] items-start gap-10 px-4 pt-6 pb-14 md:px-6 md:pt-8 lg:grid-cols-[minmax(0,760px)_minmax(0,1fr)]">
	<article bind:this={corpo} class="flex min-w-0 flex-col gap-5">
		{#if cla.descricao.length}
			<Blocos blocos={cla.descricao} jutsus={data.jutsus} habilidades={data.habilidades} />
		{/if}

		{#each cla.secoes as s (s.id)}
			{@const tipo = tipoSecao(s.titulo)}
			<section id={s.id} class="flex scroll-mt-16 flex-col gap-4" aria-labelledby="t-{s.id}">
				<div class="mt-3 flex flex-wrap items-center gap-3">
					<h2 id="t-{s.id}" class="t-h2 m-0 flex-1">{s.titulo}</h2>
					{#if tipo === 'marcos' && cla.marcos.length}
						<div class="alternancia">
							<button type="button" aria-pressed={modoMarcos === 'linha'} onclick={() => (modoMarcos = 'linha')}>Linha do tempo</button>
							<button type="button" aria-pressed={modoMarcos === 'tabela'} onclick={() => (modoMarcos = 'tabela')}>Tabela</button>
						</div>
					{/if}
				</div>

				{#if tipo === 'bonus' && cla.bonus.length}
					<div class="flex flex-wrap gap-2">
						{#each cla.bonus as b (b.texto)}
							<span class="inline-flex min-h-11 items-center gap-1 border-2 border-[rgba(217,168,43,.55)] bg-[rgba(217,168,43,.14)] py-1 pr-3.5">
								<Icone id={iconeBonus(b.texto)} />
								<span class="flex flex-col">
									<span class="t-num text-[15px] leading-5 uppercase">{b.texto.replace(/^(\+\d+) em /, '$1 ')}</span>
									{#if b.nota}<span class="text-xs leading-4 text-mut">{b.nota}</span>{/if}
								</span>
							</span>
						{/each}
					</div>
				{:else if tipo === 'kkg'}
					{#if cla.kkg}
						<span class="chip self-start border-[var(--vermelhao-lo)] bg-grena text-papel"><Icone id={cla.kkg.icone} />{cla.kkg.nome} · {cla.kkg.tipo}</span>
						<Blocos blocos={s.blocos} jutsus={data.jutsus} habilidades={data.habilidades} />
						{#if cla.kkg.tipo === 'Dōjutsu'}
							<Destaque variante="atencao">
								<p class="m-0 text-[15px] leading-[23px]">
									Dōjutsus podem ser perdidos ou transplantados. Veja <a class="link" href={data.links.perdaOlho}>Perda de Um Olho</a> e
									<a class="link" href={data.links.transferencia}>Transferência de Olhos</a> no <a class="link" href={data.links.dojutsu}>Sistema de Dōjutsu (cap. 8.4)</a>.
								</p>
							</Destaque>
						{/if}
					{:else}
						<div class="flex flex-col gap-3 border-2 border-dashed border-b3 p-3.5 text-mut">
							<Blocos blocos={s.blocos} compacto />
						</div>
					{/if}
				{:else if tipo === 'marcos' && cla.marcos.length}
					<LinhaTempoMarcos marcos={cla.marcos} cla={cla.slug} jutsus={jutsusDoCla} modo={modoMarcos} />
				{:else if tipo === 'jutsus'}
					<Blocos blocos={semCards(s.blocos)} />
					<div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar jutsus do clã">
						<span class="t-rotulo-sm text-mut">Filtrar</span>
						<button type="button" class="chip sem-icone {filtroRank === null ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={filtroRank === null} onclick={() => (filtroRank = null)}>Todos</button>
						{#each ranksPresentes as r (r)}
							<button type="button" class="chip {filtroRank === r ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={filtroRank === r} onclick={() => (filtroRank = filtroRank === r ? null : r)}>
								<Icone id="rank/ic-rank-{r.toLowerCase()}" alt="" />Rank {r}
							</button>
						{/each}
						{#if habilidadesGrade.length}
							<button type="button" class="chip sem-icone {filtroRank === 'hab' ? 'border-vermelhao bg-grena text-papel' : ''}" aria-pressed={filtroRank === 'hab'} onclick={() => (filtroRank = filtroRank === 'hab' ? null : 'hab')}>Habilidades</button>
						{/if}
					</div>
					<div class="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
						{#if filtroRank !== 'hab'}
							{#each jutsusGrade.filter((j) => !filtroRank || j.rank === filtroRank) as j (j.slug)}<CardJutsu jutsu={j} rodape={false} />{/each}
						{/if}
						{#if filtroRank === null || filtroRank === 'hab'}
							{#each habilidadesGrade as h (h.slug)}<CardHabilidade habilidade={h} />{/each}
						{/if}
					</div>
				{:else if tipo === 'politica'}
					{#if cla.relacoes.length}
						<div class="flex flex-wrap gap-2">
							{#each cla.relacoes as r (r.cla)}
								<a href="/regras/clas/{r.cla}" class="painel inline-flex min-h-11 items-center gap-1.5 py-1 pr-2.5 pl-1 text-sm font-semibold hover:border-mut">
									<Icone id="cla/ic-cla-{r.cla}" />{r.nome}
									<span class="t-rotulo-sm border-2 border-ink px-1.5 py-1 tracking-[.06em]" style:background={RELACAO[r.relacao].bg} style:color={RELACAO[r.relacao].fg}>{r.relacao}</span>
								</a>
							{/each}
						</div>
					{/if}
					<Blocos blocos={semObrigacao(s.blocos)} />
					{#if cla.obrigacao}
						<Destaque variante="destaque" rotulo="Obrigação"><p class="m-0 text-[15px] leading-[23px]"><Texto trechos={cla.obrigacao} /></p></Destaque>
					{/if}
				{:else}
					<Blocos blocos={s.blocos} jutsus={data.jutsus} habilidades={data.habilidades} />
				{/if}
			</section>
		{/each}

		<nav aria-label="Clãs vizinhos" class="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 border-t-2 border-b3 pt-5 sm:grid-cols-2">
			{#if data.anterior}
				<a href="/regras/clas/{data.anterior.slug}" class="painel cartao-link flex items-center gap-3 px-3.5 py-3">
					<Icone id="cla/ic-cla-{data.anterior.slug}" />
					<span class="flex flex-col gap-1"><span class="t-rotulo-sm text-mut">◂ Anterior</span><span class="font-mincho text-[17px] leading-6 font-bold">Clã {data.anterior.nome}</span></span>
				</a>
			{:else}<span></span>{/if}
			{#if data.proximo}
				<a href="/regras/clas/{data.proximo.slug}" class="painel cartao-link flex items-center justify-end gap-3 px-3.5 py-3 text-right">
					<span class="flex flex-col gap-1"><span class="t-rotulo-sm text-mut">Próximo ▸</span><span class="font-mincho text-[17px] leading-6 font-bold">Clã {data.proximo.nome}</span></span>
					<Icone id="cla/ic-cla-{data.proximo.slug}" />
				</a>
			{/if}
		</nav>
	</article>

	<aside class="flex flex-col gap-3 lg:sticky lg:top-16">
		{#if jutsusDoCla.length || habilidadesDoCla.length}
			<div class="painel flex flex-col gap-2 p-3.5">
				<span class="t-rotulo">Jutsus do clã · {jutsusDoCla.length}</span>
				{#each jutsusDoCla as j (j.slug)}
					<a href="#jutsu-{j.slug}" onclick={() => (filtroRank = null)} class="flex min-h-10 items-center gap-2 border-b-2 border-b3 text-sm leading-5 font-semibold hover:text-link">
						<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" alt="Rank {j.rank}" /><span class="flex flex-1 flex-col py-1">{j.nome}<Glosa texto={j.traducao} class="text-xs leading-4" /></span><span class="t-num text-sm">{j.custo}</span>
					</a>
				{/each}
				{#if habilidadesDoCla.length}
					<span class="t-rotulo mt-2">Habilidades · {habilidadesDoCla.length}</span>
					{#each habilidadesDoCla as h (h.slug)}
						<a href="#habilidade-{h.slug}" onclick={() => (filtroRank = null)} class="flex min-h-10 items-center border-b-2 border-b3 text-sm leading-5 font-semibold hover:text-link">{h.nome}</a>
					{/each}
				{/if}
			</div>
		{/if}
		<div class="painel flex flex-col gap-1.5 p-3.5 text-sm leading-5">
			<span class="t-rotulo">No livro</span>
			<span>Cap. {cla.numero} · <a class="link" href={data.links.catalogo}>Catálogo de Clãs</a></span>
			<a class="link self-start" href="/regras/clas">Todos os clãs</a>
		</div>
	</aside>
</div>

<Rodape />
