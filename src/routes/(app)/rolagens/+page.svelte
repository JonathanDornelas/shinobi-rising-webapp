<script lang="ts">
	// L10 · R1 · Registro de rolagens: todas as campanhas de quem está logado, ao vivo. Filtros de período (com intervalo
	// de datas), campanha, tipo e quem; separador por dia com a contagem; cada rolagem abre a conta e os detalhes (e o PD
	// para quem rolou pela ficha). Ao lado: rolar dados, ordem de iniciativa e as legendas.
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import EntradaRegistro from '#lib/componentes/rolagens/EntradaRegistro.svelte';
	import OrdemIniciativa from '#lib/componentes/rolagens/OrdemIniciativa.svelte';
	import RoladorDados from '#lib/componentes/rolagens/RoladorDados.svelte';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { dataLonga, diaLocal, diasAtras, doTipo, noPeriodo, PERIODOS, ROTULO_MARCA, separadorDia, TIPOS, type FiltroTipo, type Periodo } from '#lib/rolagens/registro.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const campanhas = $derived(data.campanhas);
	const nomeCampanha = (id: string) => campanhas.find((k) => k.id === id)?.nome ?? '';
	const mestreDe = (id: string) => campanhas.find((k) => k.id === id)?.mestreId === data.eu;
	const souMestreEmAlguma = $derived(campanhas.some((k) => k.mestreId === data.eu));

	// ---------------------------------------------------------------- filtros
	let filtrosAbertos = $state(false);
	let periodo = $state<Periodo>('tudo');
	let de = $state('');
	let ate = $state('');
	// svelte-ignore state_referenced_locally
	let campanha = $state<string>(data.campanhaInicial ?? 'todas');
	let tipo = $state<FiltroTipo>('todas');
	let quem = $state<'todos' | 'meus' | 'outros'>('todos');
	const hoje = diaLocal(new Date());
	const QUEM = $derived([
		['todos', 'Todos'],
		['meus', souMestreEmAlguma ? 'Mestre, NPCs e meus' : 'Meus personagens'],
		['outros', 'Outros']
	] as const);
	const minha = (r: Rolagem) => r.autor_id === data.eu;
	const filtroAtivo = $derived(periodo !== 'tudo' || campanha !== 'todas' || tipo !== 'todas' || quem !== 'todos');
	const resumoFiltros = $derived(
		[
			periodo !== 'tudo' ? `Período: ${periodo === 'intervalo' ? `${de ? dataLonga(de + 'T12:00:00').split(' · ')[0] : 'início'} a ${ate ? dataLonga(ate + 'T12:00:00').split(' · ')[0] : 'hoje'}` : PERIODOS.find((p) => p.id === periodo)!.nome.toLowerCase()}` : null,
			campanha !== 'todas' ? `Campanha: ${nomeCampanha(campanha)}` : null,
			tipo !== 'todas' ? `Tipo: ${TIPOS.find((t) => t.id === tipo)!.nome.toLowerCase()}` : null,
			quem !== 'todos' ? `Quem: ${QUEM.find((q) => q[0] === quem)![1].toLowerCase()}` : null
		].filter(Boolean) as string[]
	);
	function limpar() {
		periodo = 'tudo';
		de = '';
		ate = '';
		campanha = 'todas';
		tipo = 'todas';
		quem = 'todos';
	}

	// ---------------------------------------------------------------- lista
	let apagadas = $state<string[]>([]);
	const todas = $derived.by(() => {
		const vistos = new Set<string>();
		return [...rolador.recentes, ...data.rolagens].filter((r) => campanhas.some((k) => k.id === r.campanha_id) && !apagadas.includes(r.id) && !vistos.has(r.id) && !!vistos.add(r.id));
	});
	const passa = (r: Pick<Rolagem, 'criada_em' | 'campanha_id'>) => noPeriodo(r, periodo, de, ate) && (campanha === 'todas' || r.campanha_id === campanha);
	type Item = { tipo: 'dia'; rotulo: string; hoje: boolean; n: number } | { tipo: 'oculta'; id: string; mestre: string; campanha_id: string; criada_em: string } | { tipo: 'rolagem'; r: Rolagem };
	const itens = $derived.by(() => {
		const rs = todas.filter((r) => passa(r) && doTipo(r, tipo) && (quem === 'todos' || (quem === 'meus') === (minha(r) || (mestreDe(r.campanha_id) && !!r.npc_id))));
		const os = quem === 'meus' || tipo !== 'todas' ? [] : data.ocultas.filter((o) => passa(o));
		const juntos: { quando: string; it: Item }[] = [
			...rs.map((r) => ({ quando: r.criada_em, it: { tipo: 'rolagem' as const, r } })),
			...os.map((o) => ({ quando: o.criada_em, it: { tipo: 'oculta' as const, ...o } }))
		].sort((a, b) => b.quando.localeCompare(a.quando));
		const saida: Item[] = [];
		let dia = { tipo: 'dia' as const, rotulo: '', hoje: false, n: 0 };
		for (const x of juntos) {
			const rotulo = separadorDia(x.quando);
			if (dia.rotulo !== rotulo) {
				dia = { tipo: 'dia', rotulo, hoje: diasAtras(x.quando) === 0, n: 0 };
				saida.push(dia);
			}
			dia.n++;
			saida.push(x.it);
		}
		return { saida, n: juntos.length };
	});
	let aberta = $state<string | null>(null);

	// iniciativa: a campanha filtrada, ou a última aberta
	const campIniciativa = $derived(campanha !== 'todas' ? campanha : (rolador.mesa?.id ?? campanhas[0]?.id ?? null));

	async function apagar(r: Rolagem) {
		const { error } = await supabase().from('rolagens').delete().eq('id', r.id);
		if (error) return toasts.mostrar('Não foi possível apagar a rolagem.', 'erro');
		apagadas = [...apagadas, r.id];
		rolador.esquecer(r.id);
	}
	const podePd = (r: Rolagem) => minha(r) && !!r.personagem_id && !r.pd && !r.substituida && Date.now() - new Date(r.criada_em).getTime() < 30 * 60000;

	let legendaCritico = $state(false);
	let legendaVis = $state(false);
	const chip = (on: boolean) => (on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut');
</script>

<main class="mx-auto grid w-full max-w-[1440px] min-w-0 items-start gap-6 px-4 pt-4 pb-10 md:px-8 md:pt-6 lg:grid-cols-[minmax(0,1fr)_380px]">
	<div class="flex min-w-0 flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">TODAS AS CAMPANHAS</span>
			<h1 class="m-0 font-mincho text-[32px] leading-10 font-bold max-md:text-[26px] max-md:leading-8">Registro de rolagens</h1>
			<span class="text-sm leading-5 text-mut">{itens.n} {itens.n === 1 ? 'rolagem' : 'rolagens'} · {souMestreEmAlguma ? 'campanhas em que você joga ou mestra' : 'campanhas em que você joga'}</span>
		</div>

		<div class="flex flex-wrap items-center gap-2.5">
			<button type="button" aria-expanded={filtrosAbertos} class="inline-flex min-h-10 items-center gap-2 border-2 px-3 font-pixel text-[13px] font-bold tracking-[0.06em] {filtrosAbertos ? 'border-vermelhao bg-grena text-papel' : 'border-mut'}" onclick={() => (filtrosAbertos = !filtrosAbertos)}>
				FILTROS{#if resumoFiltros.length}<span class="bg-vermelhao px-[5px] py-[3px] text-xs leading-none text-white">{resumoFiltros.length}</span>{/if}<span>{filtrosAbertos ? '▴' : '▾'}</span>
			</button>
			<span class="min-w-0 flex-1 text-sm leading-5 text-mut">{resumoFiltros.length ? resumoFiltros.join(' · ') : 'Mostrando tudo, da mais recente para a mais antiga.'}</span>
			{#if filtroAtivo}<button type="button" class="link min-h-10 px-2.5 text-[13px] font-semibold" onclick={limpar}>Limpar filtros</button>{/if}
		</div>

		{#if filtrosAbertos}
			<div class="flex flex-col border-2 border-frame bg-b2">
				<div class="flex flex-wrap items-center gap-3 border-b-2 border-b3 px-3 py-2.5" role="group" aria-label="Período">
					<span class="w-20 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">PERÍODO</span>
					<div class="flex flex-wrap gap-1.5">
						{#each PERIODOS as p (p.id)}
							<button type="button" aria-pressed={periodo === p.id} class="min-h-9 border-2 px-2.5 font-pixel text-xs font-bold tracking-[0.05em] {chip(periodo === p.id)}" onclick={() => ((periodo = p.id), (de = ''), (ate = ''))}>{p.nome}</button>
						{/each}
					</div>
					<span class="w-0.5 self-stretch bg-b3 max-sm:hidden"></span>
					<label class="flex items-center gap-1.5 text-[13px] font-semibold">De<input type="date" class="h-9 border-2 bg-b1 px-2 text-[13px] text-fg" style:border-color={periodo === 'intervalo' ? 'var(--vermelhao)' : 'var(--field)'} max={hoje} bind:value={de} onchange={() => (periodo = 'intervalo')} /></label>
					<label class="flex items-center gap-1.5 text-[13px] font-semibold">até<input type="date" class="h-9 border-2 bg-b1 px-2 text-[13px] text-fg" style:border-color={periodo === 'intervalo' ? 'var(--vermelhao)' : 'var(--field)'} max={hoje} bind:value={ate} onchange={() => (periodo = 'intervalo')} /></label>
				</div>
				{#if campanhas.length > 1}
					<div class="flex flex-wrap items-center gap-3 border-b-2 border-b3 px-3 py-2.5" role="group" aria-label="Campanha">
						<span class="w-20 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">CAMPANHA</span>
						<div class="flex flex-wrap gap-1.5">
							<button type="button" aria-pressed={campanha === 'todas'} class="min-h-9 border-2 px-2.5 text-[13px] font-semibold {chip(campanha === 'todas')}" onclick={() => (campanha = 'todas')}>Todas</button>
							{#each campanhas as k (k.id)}<button type="button" aria-pressed={campanha === k.id} class="min-h-9 border-2 px-2.5 text-[13px] font-semibold {chip(campanha === k.id)}" onclick={() => (campanha = k.id)}>{k.nome}</button>{/each}
						</div>
					</div>
				{/if}
				<div class="flex flex-wrap items-center gap-3 border-b-2 border-b3 px-3 py-2.5">
					<span class="w-20 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">TIPO</span>
					<div class="flex flex-wrap gap-1.5" role="group" aria-label="Tipo">
						{#each TIPOS as t (t.id)}<button type="button" aria-pressed={tipo === t.id} class="min-h-9 border-2 px-2.5 font-pixel text-xs font-bold tracking-[0.05em] {chip(tipo === t.id)}" onclick={() => (tipo = t.id)}>{t.nome}</button>{/each}
					</div>
				</div>
				<div class="flex flex-wrap items-center gap-3 px-3 py-2.5">
					<span class="w-20 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">QUEM</span>
					<div class="flex flex-wrap gap-1.5" role="group" aria-label="Quem rolou">
						{#each QUEM as [q, n] (q)}<button type="button" aria-pressed={quem === q} class="min-h-9 border-2 px-2.5 text-[13px] font-semibold {chip(quem === q)}" onclick={() => (quem = q)}>{n}</button>{/each}
					</div>
				</div>
			</div>
		{/if}

		<details class="border-2 border-[var(--vermelhao-lo)] bg-b2 lg:hidden">
			<summary class="flex min-h-12 cursor-pointer items-center gap-1.5 bg-b0 px-2 font-pixel text-[13px] font-bold tracking-[0.1em] text-[#D9A82B]"><img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />ROLAR DADOS</summary>
			<div class="p-3"><RoladorDados campanhaInicial={data.campanhaInicial} /></div>
		</details>

		<div aria-live="polite" class="flex flex-col gap-2.5">
			{#each itens.saida as it, i (it.tipo === 'rolagem' ? it.r.id : it.tipo === 'oculta' ? `o${it.id}` : `d${i}`)}
				{#if it.tipo === 'dia'}
					<div class="mt-2.5 flex items-center gap-2.5"><span class="font-pixel text-[13px] leading-none font-bold tracking-[0.1em]" style:color={it.hoje ? 'var(--title)' : 'var(--mut)'}>{it.rotulo}</span><span class="h-0.5 flex-1 bg-b3"></span><span class="font-pixel text-xs leading-none font-semibold text-mut">{it.n} {it.n === 1 ? 'rolagem' : 'rolagens'}</span></div>
				{:else if it.tipo === 'oculta'}
					<div class="flex items-center gap-3 border-2 border-dashed border-b3 px-3.5 py-2.5 text-mut">
						<svg width="20" height="20" viewBox="0 0 24 24" class="flex-none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><rect x="5" y="11" width="14" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
						<span class="flex-1 text-sm leading-5"><b class="text-fg">{it.mestre}</b> fez uma rolagem oculta · {nomeCampanha(it.campanha_id)}</span>
						<span class="font-pixel text-[13px] leading-none font-semibold">{new Date(it.criada_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
					</div>
				{:else}
					{@const r = it.r}
					<EntradaRegistro
						{r}
						campanha={nomeCampanha(r.campanha_id)}
						vis={!r.oculta ? 'todos' : campanhas.find((k) => k.id === r.campanha_id)?.mestreId === r.autor_id ? 'mestre' : 'eu'}
						minha={minha(r)}
						doMestre={!!r.npc_id || campanhas.find((k) => k.id === r.campanha_id)?.mestreId === r.autor_id}
						avatar={r.personagem_id ? (data.avatares[r.personagem_id] ?? null) : null}
						aberta={aberta === r.id}
						aoAlternar={() => (aberta = aberta === r.id ? null : r.id)}
						aoPd={podePd(r) ? (acao) => rolador.usarPd(r, acao) : null}
						aoApagar={mestreDe(r.campanha_id) ? () => apagar(r) : null}
					/>
				{/if}
			{:else}
				<div class="flex flex-col items-center gap-2 border-2 border-dashed border-b3 p-8 text-center">
					<img src="/dados/d20.png" width="64" height="64" alt="" class="[image-rendering:pixelated]" />
					<span class="font-mincho text-lg leading-6 font-bold">{todas.length ? 'Nenhuma rolagem neste período' : 'Nenhuma rolagem ainda'}</span>
					<span class="text-sm leading-5 text-mut">{todas.length ? 'Amplie o período ou limpe os filtros.' : 'As rolagens feitas na ficha, nos NPCs e aqui ao lado aparecem neste registro, ao vivo.'}</span>
				</div>
			{/each}
		</div>
	</div>

	<aside class="flex flex-col gap-4 max-lg:order-first max-lg:hidden">
		<section aria-label="Rolar dados" class="border-2 border-[var(--vermelhao-lo)] bg-b2 shadow-[4px_4px_0_var(--ink)]">
			<div class="flex items-center gap-1.5 border-b-2 border-[var(--vermelhao-lo)] bg-b0 py-1.5 pr-3.5 pl-2 text-b0fg">
				<img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />
				<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-[#D9A82B]">ROLAR DADOS</span>
			</div>
			<div class="px-3.5 py-3"><RoladorDados campanhaInicial={data.campanhaInicial} /></div>
		</section>
		{#if campIniciativa}<OrdemIniciativa rolagens={todas} campanha={campIniciativa} nome={nomeCampanha(campIniciativa)} />{/if}
		<section class="border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]">
			<button type="button" aria-expanded={legendaCritico} class="flex w-full items-center gap-2 px-3.5 py-3 text-left text-title" onclick={() => (legendaCritico = !legendaCritico)}><span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em]">MARCAS DE CRÍTICO</span><span class="font-pixel text-sm text-fg">{legendaCritico ? '▴' : '▾'}</span></button>
			{#if legendaCritico}
				<div class="flex flex-col gap-2.5 border-t-2 border-b3 px-3.5 py-3">
					<span class="flex flex-col gap-1"><span class="self-start border-2 border-acc bg-[color-mix(in_srgb,var(--acc)_16%,transparent)] px-1.5 py-[3px] font-pixel text-xs leading-none font-bold text-title">{ROTULO_MARCA.critico}</span><span class="text-[13px] leading-[18px] text-mut">O d20 caiu em 20 (no ataque, os dados de dano dobram).</span></span>
					<span class="flex flex-col gap-1"><span class="self-start border-2 border-err bg-[color-mix(in_srgb,var(--err)_14%,transparent)] px-1.5 py-[3px] font-pixel text-xs leading-none font-bold text-err">{ROTULO_MARCA.falha}</span><span class="text-[13px] leading-[18px] text-mut">O d20 caiu em 1.</span></span>
					<span class="flex flex-col gap-1"><span class="self-start border-2 border-acc px-1.5 py-[3px] font-pixel text-xs leading-none font-bold">{ROTULO_MARCA.pd}</span><span class="text-[13px] leading-[18px] text-mut">Um Ponto de Destino re-rolou ou somou +5 (cap. 2). O resultado de antes aparece riscado.</span></span>
				</div>
			{/if}
		</section>
		<section class="border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]">
			<button type="button" aria-expanded={legendaVis} class="flex w-full items-center gap-2 px-3.5 py-3 text-left text-title" onclick={() => (legendaVis = !legendaVis)}><span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em]">QUEM VÊ CADA ROLAGEM</span><span class="font-pixel text-sm text-fg">{legendaVis ? '▴' : '▾'}</span></button>
			{#if legendaVis}
				<div class="flex flex-col gap-2.5 border-t-2 border-b3 px-3.5 py-3">
					{#each [['TODOS VEEM', 'var(--b3)', 'var(--mut)', 'Aparece no registro de todos os membros da campanha.'], ['EU E O MESTRE', 'var(--info)', 'var(--info)', 'Quem rolou e o Mestre veem. Os outros jogadores não veem nada.'], ['SÓ O MESTRE', 'var(--vermelhao-lo)', 'var(--link)', 'Rolagem secreta do Mestre. Os jogadores veem só que houve uma rolagem.']] as [n, bd, c, d] (n)}
						<span class="flex flex-col gap-1"><span class="self-start border-2 px-1.5 py-[3px] font-pixel text-xs leading-none font-bold tracking-[0.06em]" style:border-color={bd} style:color={c}>{n}</span><span class="text-[13px] leading-[18px] text-mut">{d}</span></span>
					{/each}
				</div>
			{/if}
		</section>
		<div class="flex items-center gap-2.5 border-2 border-dashed border-b3 px-3.5 py-3">
			<span class="flex h-8 min-w-8 items-center justify-center border-2 border-mut font-pixel text-[15px] font-bold">R</span>
			<span class="text-[13px] leading-[18px] text-mut">Abre e fecha a janela de rolagens em qualquer tela do site.</span>
		</div>
	</aside>
</main>
