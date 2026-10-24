<script lang="ts">
	// P3 · Jutsus conhecidos com o custo real (reduções do cap. 9) e USAR, que debita PC/PE e já rola ataque e dano.
	// Busca, filtros (tipo, rank, o que faz, ação, só os que dá para usar agora), favoritos no topo e duas visões: lista e cards.
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { acaoDe, EFEITOS, efeitosDe, info, nomeEfeito } from '#lib/livro/filtros-jutsu.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { TipoJutsu } from '#lib/livro/tipos.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { favoritos } from '#lib/estado/favoritos.svelte.ts';
	import { NIVEIS_PROFICIENCIA } from '#lib/personagem/dados.ts';
	import type { JutsuFicha } from '#lib/personagem/progressao.ts';
	import { linhasPericia } from '#lib/personagem/regras.ts';
	import { curaDoEfeito, danoDoEfeito, periciaDoAtaque, somar, teste, totalPericia } from '#lib/rolagens/expressoes.ts';
	import Icone from '../ui/Icone.svelte';
	import Traco from '../ui/Traco.svelte';
	import BotaoFavorito from '../regras/BotaoFavorito.svelte';
	import Glosa from '../regras/Glosa.svelte';
	import BotaoRolar from '../rolagens/BotaoRolar.svelte';
	import { partesAtaqueJutsu, partesDanoAtributo, type Parte } from '#lib/rolagens/partes.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import type { JutsuMesa } from '#lib/mesa/tipos.ts';
	import TooltipAcao from '../mesa/TooltipAcao.svelte';

	/**
	 * Dentro da Mesa: MEDIR liga a régua do jutsu (e a janela da ficha minimiza), e USAR vai pelo caminho da Mesa
	 * (alvos na régua, crescer o token); usar devolve false quando o personagem não está na cena.
	 */
	interface NaMesa {
		medir: (j: JutsuFicha) => void;
		usar: (j: JutsuFicha) => Promise<boolean>;
		podeMedir: (j: JutsuFicha) => boolean;
		/** o jutsu como a Mesa o vê, para o tooltip de ação (HUD) */
		hud: (j: JutsuFicha) => JutsuMesa | null;
	}
	let { f, mesa }: { f: FichaJogo; mesa?: NaMesa } = $props();
	// tooltip de ação na Mesa: ao lado da linha, depois de um instante com o mouse parado
	let dica = $state<{ acao: JutsuMesa; ancora: DOMRect } | null>(null);
	let dicaTimer: ReturnType<typeof setTimeout> | undefined;
	function mostrarDica(j: JutsuFicha, linha: HTMLElement) {
		const acao = mesa?.hud(j);
		if (!acao || matchMedia('(hover: none)').matches) return;
		clearTimeout(dicaTimer);
		dicaTimer = setTimeout(() => (dica = { acao, ancora: linha.getBoundingClientRect() }), 400);
	}
	function esconderDica() {
		clearTimeout(dicaTimer);
		dica = null;
	}
	const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
	const lista = $derived(f.calc.jutsus.map((s) => f.catalogo.jutsus.find((j) => j.slug === s)).filter((j): j is JutsuFicha => !!j));
	const tipos = $derived([...new Set(lista.map((j) => j.tipo))]);
	const ranks = $derived(RANKS.filter((r) => lista.some((j) => j.rank === r)));
	const efeitosDaFicha = $derived(new Map(lista.map((j) => [j.slug, efeitosDe(j.efeito)])));
	const efeitosPresentes = $derived([...EFEITOS.map((e) => e.id), 'outros'].filter((e) => lista.some((j) => efeitosDaFicha.get(j.slug)!.includes(e))));
	const acoes = $derived(['Primária', 'Secundária', 'Reação', 'Completa'].filter((a) => lista.some((j) => acaoDe(j) === a)));

	let busca = $state('');
	let tipo = $state('Todos');
	let rank = $state('');
	let efeito = $state('');
	let acao = $state('');
	let soUsaveis = $state(false);
	let soFavoritos = $state(false);
	let ordem = $state<'rank' | 'custo' | 'nome'>('rank');
	let visao = $state<'lista' | 'cards'>('lista');
	onMount(() => {
		if (ler<string>('ficha-jutsus-visao', 'lista') === 'cards') visao = 'cards';
	});
	let aberto = $state<string | null>(null);
	/** No celular, Rank/Faz/Ação/Ordem ficam recolhidos atrás do botão Filtros. */
	let maisFiltros = $state(false);

	const ctrFino = $derived(f.calc.atributos.CTR >= 3);
	const exausto = $derived(f.atual.fadiga >= 2);
	const esgotado = $derived(f.atual.fadiga >= 3);
	const linhas = $derived(linhasPericia(f.dados));

	/** Custo, quanto falta do recurso e se o rank está bloqueado (Esgotado). */
	function situacao(j: JutsuFicha) {
		const c = f.custo(j);
		const falta = c.final - f.atual[c.unidade === 'PE' ? 'pe' : 'pc'];
		const bloqueadoRank = esgotado && ['B', 'A', 'S'].includes(j.rank);
		return { c, falta, bloqueadoRank, usavel: f.editavel && falta <= 0 && !bloqueadoRank };
	}

	const visiveis = $derived.by(() => {
		const q = normalizar(busca);
		const r = lista.filter(
			(j) =>
				(tipo === 'Todos' || j.tipo === tipo) &&
				(!rank || j.rank === rank) &&
				(!efeito || efeitosDaFicha.get(j.slug)!.includes(efeito)) &&
				(!acao || acaoDe(j) === acao) &&
				(!soFavoritos || favoritos.tem(j.slug)) &&
				(!soUsaveis || situacao(j).usavel) &&
				(!q || normalizar(`${j.nome} ${j.efeito}`).includes(q))
		);
		const fav = (j: JutsuFicha) => (favoritos.tem(j.slug) ? 0 : 1);
		const ri = (j: JutsuFicha) => RANKS.indexOf(j.rank);
		const por = {
			rank: (a: JutsuFicha, b: JutsuFicha) => ri(a) - ri(b) || f.custo(a).final - f.custo(b).final,
			custo: (a: JutsuFicha, b: JutsuFicha) => f.custo(a).final - f.custo(b).final,
			nome: () => 0
		}[ordem];
		// favoritos sempre no topo, para achar rápido no meio do combate
		return r.sort((a, b) => fav(a) - fav(b) || por(a, b) || a.nome.localeCompare(b.nome, 'pt-BR'));
	});
	const nMaisFiltros = $derived([rank, efeito, acao].filter(Boolean).length + (soUsaveis ? 1 : 0));
	const filtrando = $derived(tipo !== 'Todos' || !!rank || !!efeito || !!acao || soUsaveis || soFavoritos || !!busca.trim());
	const nFavoritos = $derived(lista.filter((j) => favoritos.tem(j.slug)).length);

	function limpar() {
		tipo = 'Todos';
		rank = efeito = acao = busca = '';
		soUsaveis = soFavoritos = false;
	}
	function definirVisao(v: 'lista' | 'cards') {
		visao = v;
		gravar('ficha-jutsus-visao', v);
	}

	// rolagens do jutsu: ataque (1d20 + perícia do tipo + proficiência, cap. 4 e 9) e dano/cura lidos do efeito
	function rolagens(j: JutsuFicha) {
		const pericia = periciaDoAtaque(j.info);
		const base = pericia ? totalPericia(linhas, pericia) : null;
		const prof = f.calc.proficiencias.find((p) => p.tipo === 'jutsu' && p.alvo === j.slug);
		const bonusProf = prof ? NIVEIS_PROFICIENCIA[prof.nivel - 1].bonus : 0;
		// jutsu criado: os dados vêm do criador; do livro: lidos do texto do efeito
		const dano = j.rolagem ? (j.rolagem.modo === 'dano' ? j.rolagem : null) : danoDoEfeito(j.efeito);
		const atributo = dano?.atributo as keyof typeof f.calc.atributos | null | undefined;
		return {
			ataque: base === null ? null : { expr: teste(base + bonusProf), rotulo: `Ataque · ${j.nome}`, partes: partesAtaqueJutsu(pericia!, base, bonusProf) as Parte[] },
			dano: dano ? { expr: somar(dano.dados, atributo ? f.calc.atributos[atributo] : 0), rotulo: `Dano · ${j.nome}`, partes: partesDanoAtributo(atributo, atributo ? f.calc.atributos[atributo] : 0) } : null,
			cura: j.rolagem ? (j.rolagem.modo === 'cura' ? j.rolagem.dados : null) : curaDoEfeito(j.efeito)
		};
	}

	// usar o jutsu: debita PC/PE e já rola o ataque e o dano (ou a cura)
	async function usar(j: JutsuFicha) {
		f.gastarJutsu(j);
		const r = rolagens(j);
		const campanha = page.params.id!;
		const origem = 'Ficha · Jutsus';
		if (r.ataque) await rolador.rolar({ campanha, expressao: r.ataque.expr, rotulo: r.ataque.rotulo, personagem: f.id, d20: true, tipo: 'ataque', origem, partes: r.ataque.partes });
		if (r.dano) await rolador.rolar({ campanha, expressao: r.dano.expr, rotulo: r.dano.rotulo, personagem: f.id, tipo: 'dano', origem, partes: r.dano.partes });
		else if (r.cura) await rolador.rolar({ campanha, expressao: r.cura, rotulo: `Cura · ${j.nome}`, personagem: f.id, tipo: 'cura', origem });
	}
</script>

{#snippet custo(j: JutsuFicha, grande: boolean)}
	{@const c = f.custo(j)}
	<span class="flex items-baseline justify-end gap-1.5 whitespace-nowrap" title={c.notas.join(' · ') || undefined}>
		{#if c.final !== c.base}<span class="t-num text-sm text-mut line-through">{c.base}</span>{/if}
		<span class="t-num leading-none {grande ? 'text-[22px]' : 'text-lg'}" style:color={c.final < c.base ? '#7FD3E6' : c.final > c.base ? 'var(--warn)' : undefined}>{c.final} {c.unidade}</span>
	</span>
{/snippet}

{#snippet botaoUsar(j: JutsuFicha, classe: string)}
	{#if mesa}
		<div class="flex flex-col gap-1 {classe}">
			{#if mesa.podeMedir(j)}<button type="button" class="btn-jogo min-h-8 w-full border-2 border-b3 px-3 text-xs" title="Liga a régua do jutsu no quadro e minimiza a ficha" onclick={() => mesa.medir(j)}>MEDIR</button>{/if}
			{@render usarBotao(j, 'w-full')}
		</div>
	{:else}{@render usarBotao(j, classe)}{/if}
{/snippet}

{#snippet usarBotao(j: JutsuFicha, classe: string)}
	{@const s = situacao(j)}
	<button
		type="button"
		class="btn-jogo min-h-9 px-3 text-xs {classe} {s.usavel ? 'btn-primario' : 'bg-b3 text-mut'}"
		disabled={!s.usavel}
		title={s.bloqueadoRank ? 'Esgotado: sem jutsus de Rank B ou superior' : s.falta > 0 ? `Faltam ${s.falta} ${s.c.unidade}` : !f.editavel ? 'Ficha somente leitura' : 'Gasta o custo e já rola o ataque e o dano'}
		onclick={async () => (mesa && (await mesa.usar(j))) || usar(j)}>USAR · {s.c.final} {s.c.unidade}</button
	>
{/snippet}

{#snippet botoesRolar(j: JutsuFicha)}
	{#if f.editavel}
		{@const rr = rolagens(j)}
		{#if rr.ataque || rr.dano || rr.cura}
			<div class="flex flex-wrap items-center gap-2">
				{#if rr.ataque}<BotaoRolar texto="ATAQUE {rr.ataque.expr}" expressao={rr.ataque.expr} rotulo={rr.ataque.rotulo} personagem={f.id} d20 tipo="ataque" origem="Ficha · Jutsus" partes={rr.ataque.partes} />{/if}
				{#if rr.dano}
					<BotaoRolar texto="DANO {rr.dano.expr}" expressao={rr.dano.expr} rotulo={rr.dano.rotulo} personagem={f.id} tipo="dano" origem="Ficha · Jutsus" partes={rr.dano.partes} />
					<BotaoRolar texto="CRÍTICO" expressao={rr.dano.expr} rotulo="Dano crítico · {j.nome}" personagem={f.id} critico tipo="dano" origem="Ficha · Jutsus" partes={rr.dano.partes} />
				{/if}
				{#if rr.cura}<BotaoRolar texto="CURA {rr.cura}" expressao={rr.cura} rotulo="Cura · {j.nome}" personagem={f.id} tipo="cura" origem="Ficha · Jutsus" />{/if}
			</div>
		{/if}
	{/if}
{/snippet}

{#snippet seletor(rotulo: string, valor: string, opcoes: { v: string; n: string }[], mudar: (v: string) => void, destacar = !!valor)}
	<label class="flex h-10 min-w-0 items-center gap-1.5 border-2 px-2.5 text-[13px] font-semibold {destacar ? 'border-vermelhao' : 'border-b3'}">
		<span class="text-mut">{rotulo}:</span>
		<select class="min-w-0 flex-1 bg-transparent font-semibold text-fg outline-none" value={valor} onchange={(e) => mudar(e.currentTarget.value)} aria-label={rotulo}>
			{#each opcoes as o (o.v)}<option value={o.v} class="bg-b2">{o.n}</option>{/each}
		</select>
	</label>
{/snippet}

<div class="flex flex-col gap-2.5">
	<div class="flex flex-wrap items-center gap-2">
		<label class="campo flex h-10 min-w-[180px] flex-1 items-center gap-2">
			<span class="text-mut"><Traco nome="buscar" tamanho={18} /></span>
			<input bind:value={busca} type="search" placeholder="Buscar jutsu ou efeito" aria-label="Buscar jutsu" class="min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none" />
		</label>
		<button
			type="button"
			class="flex min-h-10 items-center gap-1.5 border-2 px-3 text-[13px] font-semibold {soFavoritos ? 'border-ink bg-grena text-papel' : 'border-b3 hover:border-mut'}"
			aria-pressed={soFavoritos}
			title="Só os favoritos (eles já ficam no topo da lista)"
			onclick={() => (soFavoritos = !soFavoritos)}><Traco nome="estrela" tamanho={16} class={nFavoritos ? 'estrela-on' : ''} />Favoritos <span class="t-num text-xs opacity-80">{nFavoritos}</span></button
		>
		<button type="button" class="flex min-h-10 items-center gap-1.5 border-2 px-3 text-[13px] font-semibold sm:hidden {maisFiltros || nMaisFiltros ? 'border-vermelhao' : 'border-b3'}" aria-expanded={maisFiltros} aria-controls="filtros-jutsus" onclick={() => (maisFiltros = !maisFiltros)}>
			Filtros{nMaisFiltros ? ` (${nMaisFiltros})` : ''}<Traco nome="baixo" tamanho={14} class={maisFiltros ? 'rotate-180' : ''} />
		</button>
		<div class="alternancia" role="group" aria-label="Visualização">
			<button type="button" class="flex items-center gap-1.5" aria-pressed={visao === 'lista'} aria-label="Lista" title="Lista" onclick={() => definirVisao('lista')}><Traco nome="lista" tamanho={16} /><span class="max-sm:hidden">Lista</span></button>
			<button type="button" class="flex items-center gap-1.5" aria-pressed={visao === 'cards'} aria-label="Cards" title="Cards" onclick={() => definirVisao('cards')}><Traco nome="cards" tamanho={16} /><span class="max-sm:hidden">Cards</span></button>
		</div>
		{#if f.editavel && page.data.completa?.dono}
			<form method="POST" action="/campanhas/{page.params.id}/jutsus?/criar">
				<input type="hidden" name="personagem" value={f.id} />
				<input type="hidden" name="volta" value={page.url.pathname} />
				<button type="submit" class="btn-jogo btn-contorno com-icone min-h-10 text-xs" title="Criar um jutsu original para esta ficha (cap. 20); depois de aprovado, aprende no treino"><Icone id="acao/ic-acao-criar-jutsu" />CRIAR JUTSU</button>
			</form>
		{/if}
	</div>

	<div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible" role="group" aria-label="Tipo">
		{#each ['Todos', ...tipos] as n (n)}
			{@const t = TIPO_JUTSU[n as TipoJutsu]}
			<button type="button" class="flex min-h-10 flex-none items-center gap-1.5 border-2 px-3 text-[13px] font-semibold whitespace-nowrap {tipo === n ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" aria-pressed={tipo === n} onclick={() => (tipo = n)}>
				{#if t}<span class="h-2.5 w-2.5 flex-none border border-ink" style:background={t.cor}></span>{/if}{n}
				<span class="t-num text-xs opacity-70">{n === 'Todos' ? lista.length : lista.filter((j) => j.tipo === n).length}</span>
			</button>
		{/each}
	</div>

	<div id="filtros-jutsus" class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center {maisFiltros ? '' : 'max-sm:hidden'}">
		{@render seletor('Rank', rank, [{ v: '', n: 'Todos' }, ...ranks.map((r) => ({ v: r, n: r }))], (v) => (rank = v))}
		{@render seletor('Faz', efeito, [{ v: '', n: 'Tudo' }, ...efeitosPresentes.map((e) => ({ v: e, n: nomeEfeito(e) }))], (v) => (efeito = v))}
		{@render seletor('Ação', acao, [{ v: '', n: 'Todas' }, ...acoes.map((a) => ({ v: a, n: a }))], (v) => (acao = v))}
		{@render seletor('Ordem', ordem, [{ v: 'rank', n: 'Rank' }, { v: 'custo', n: 'Custo' }, { v: 'nome', n: 'Nome' }], (v) => (ordem = v as typeof ordem), false)}
		{#if f.editavel}
			<label class="col-span-2 flex min-h-10 cursor-pointer items-center gap-2 text-[13px] font-semibold">
				<input type="checkbox" class="h-4 w-4 accent-[var(--vermelhao)]" bind:checked={soUsaveis} />Só os que dá para usar agora
			</label>
		{/if}
		{#if filtrando}<button type="button" class="link text-[13px] font-semibold max-sm:col-span-2 max-sm:justify-self-start" onclick={limpar}>Limpar filtros</button>{/if}
		{#if f.calc.especializacoes.some((e) => e.id === 'controle-chakra')}
			<span class="flex items-center gap-1.5 text-[13px] leading-[18px] text-mut max-sm:col-span-2 sm:ml-auto"><Icone id="esp/ic-esp-controle-chakra" />Reduções de especialização aplicadas</span>
		{/if}
	</div>
</div>

{#if !visiveis.length}
	<div class="painel flex flex-col items-center gap-2 px-4 py-6 text-center">
		<span class="font-mincho text-lg font-bold">{lista.length ? 'Nenhum jutsu com esses filtros' : 'Nenhum jutsu conhecido ainda'}</span>
		{#if filtrando}<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" onclick={limpar}>Limpar filtros</button>{/if}
	</div>
{:else if visao === 'lista'}
	<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
		{#each visiveis as j (j.slug)}
			{@const t = TIPO_JUTSU[j.tipo as TipoJutsu] ?? TIPO_JUTSU.Ninjutsu}
			{@const ab = aberto === j.slug}
			<li class="border-2 bg-b2 sombra-painel" style:border-color={ab ? 'var(--mut)' : 'var(--frame)'} onmouseenter={(e) => mesa && mostrarDica(j, e.currentTarget)} onmouseleave={esconderDica}>
				<div class="grid grid-cols-[4px_32px_minmax(0,1fr)_auto_36px] items-center gap-x-2.5 gap-y-2 py-2 pr-1.5 md:grid-cols-[4px_32px_minmax(0,1fr)_auto_120px_130px_40px] md:gap-x-3">
					<div class="-my-2 self-stretch max-md:row-span-2" style:background={t.cor}></div>
					<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" alt="Rank {j.rank}" />
					<button type="button" class="flex min-w-0 flex-col gap-0.5 text-left text-fg" aria-expanded={ab} onclick={() => (aberto = ab ? null : j.slug)}>
						<span class="flex flex-col">
							<span class="font-mincho text-[17px] leading-[22px] font-bold">{j.nome} <span class="font-pixel text-xs text-mut max-sm:hidden">{ab ? "▾" : "▸"}</span></span>
							<Glosa texto={j.traducao} class="text-[13px] leading-[18px]" />
						</span>
						<span class="truncate text-[13px] leading-[18px] text-mut">{j.origem} · {j.efeito}</span>
					</button>
					<span class="inline-flex h-9 items-center gap-1 border-2 border-ink pr-2.5 text-[13px] font-semibold max-md:hidden" style:background={t.cor} style:color={t.texto}><Icone id={t.icone} />{j.tipo}</span>
					{@render custo(j, true)}
					{@render botaoUsar(j, 'max-md:col-span-2 max-md:col-start-3')}
					<BotaoFavorito slug={j.slug} nome={j.nome} class="max-md:col-start-5 max-md:row-start-1 max-md:h-9! max-md:w-9!" />
				</div>
				{#if ab}
					<div class="flex flex-col gap-2.5 border-t-2 border-b3 py-3 pr-3.5 pl-[18px]">
						<dl class="m-0 grid grid-cols-2 border-t-2 border-l-2 border-b3 md:grid-cols-3 xl:grid-cols-6">
							{#each j.info as i (i.k)}
								<div class="flex flex-col gap-1 border-r-2 border-b-2 border-b3 bg-b1 px-2 py-1.5">
									<dt class="font-pixel text-xs leading-none font-semibold tracking-[0.06em] text-mut uppercase">{i.k}</dt>
									<dd class="m-0 text-[13px] leading-[18px] font-semibold">{i.v}</dd>
								</div>
							{/each}
						</dl>
						<p class="m-0 text-sm leading-[21px]"><b>Efeito.</b> {j.efeito}</p>
						{@render botoesRolar(j)}
						{#if f.custo(j).notas.length}<p class="m-0 text-[13px] text-mut">Custo: {f.custo(j).base} {f.custo(j).unidade} base · {f.custo(j).notas.join(' · ')}</p>{/if}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<ul class="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-3 p-0 sm:grid-cols-2 2xl:grid-cols-3">
		{#each visiveis as j (j.slug)}
			{@const t = TIPO_JUTSU[j.tipo as TipoJutsu] ?? TIPO_JUTSU.Ninjutsu}
			{@const ab = aberto === j.slug}
			<li class="flex flex-col border-2 border-frame bg-b2 sombra-painel">
				<div class="flex items-start gap-2 py-2 pr-1 pl-3" style:box-shadow="inset 4px 0 0 {t.cor}">
					<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" alt="Rank {j.rank}" />
					<span class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="font-mincho text-[17px] leading-[22px] font-bold">{j.nome}</span>
						<Glosa texto={j.traducao} class="text-[13px] leading-[18px]" />
						<span class="truncate text-xs leading-4 text-mut">{j.tipo} · {j.origem}</span>
					</span>
					{@render custo(j, false)}
					<BotaoFavorito slug={j.slug} nome={j.nome} class="-my-1" />
				</div>
				<div class="flex flex-1 flex-col gap-2.5 border-t-2 border-b3 p-3">
					<dl class="m-0 grid grid-cols-3 border-t-2 border-l-2 border-b3 text-xs leading-4">
						{#each ['Alcance', 'Ação', 'Ataque'] as k (k)}
							<div class="flex min-w-0 flex-col gap-1 border-r-2 border-b-2 border-b3 bg-b1 px-1.5 py-1">
								<dt class="font-pixel text-[11px] leading-none font-semibold tracking-[0.06em] text-mut uppercase">{k}</dt>
								<dd class="m-0 font-semibold break-words">{info(j, k) || '—'}</dd>
							</div>
						{/each}
					</dl>
					<p class="m-0 text-sm leading-5 {ab ? '' : 'line-clamp-4'}">{j.efeito}</p>
					{#if ab}
						<dl class="m-0 flex flex-col gap-0.5 text-[13px] leading-[18px]">
							{#each j.info.filter((i) => !['Alcance', 'Ação', 'Ataque'].includes(i.k)) as i (i.k)}
								<div><dt class="inline font-semibold text-mut">{i.k}:</dt> <dd class="m-0 inline">{i.v}</dd></div>
							{/each}
						</dl>
					{/if}
					<button type="button" class="link self-start text-[13px] font-semibold" aria-expanded={ab} onclick={() => (aberto = ab ? null : j.slug)}>{ab ? 'Menos' : 'Ver tudo e rolar'}</button>
					{#if ab}{@render botoesRolar(j)}{/if}
					<div class="mt-auto pt-1">{@render botaoUsar(j, 'w-full')}</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}
<p class="m-0 text-[13px] leading-[18px] text-mut">
	Favoritos ficam no topo. Reduções de especializações diferentes não se somam: vale a maior, mais −1 da proficiência; custo mínimo 1 e nunca abaixo da metade (cap. 9).
	{#if exausto}Exausto: jutsus custam +1.{/if}
	{#if ctrFino}Controle Fino (CTR +3): gaste um turno preparando para reduzir 1 PC.{/if}
</p>

{#if dica}<TooltipAcao acao={dica.acao} ancora={dica.ancora} />{/if}
