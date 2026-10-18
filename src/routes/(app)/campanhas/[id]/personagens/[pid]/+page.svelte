<script lang="ts">
	// P3 · Ficha do personagem: cabeçalho com nível e XP, barra de recursos, abas e ações (subir de nível, treinar,
	// imprimir, memorial). Dono e Mestre ajustam o estado em jogo; os outros membros veem só o resumo público.
	import { untrack } from 'svelte';
	import { goto, refreshAll } from '$app/navigation';
	import { page } from '$app/state';
	import AbaCla from '#lib/componentes/ficha/AbaCla.svelte';
	import AbaEquipamento from '#lib/componentes/ficha/AbaEquipamento.svelte';
	import AbaJutsus from '#lib/componentes/ficha/AbaJutsus.svelte';
	import AbaPericias from '#lib/componentes/ficha/AbaPericias.svelte';
	import AbaProgressao from '#lib/componentes/ficha/AbaProgressao.svelte';
	import AbaVisao from '#lib/componentes/ficha/AbaVisao.svelte';
	import BarraRecursos from '#lib/componentes/ficha/BarraRecursos.svelte';
	import GavetaTreino from '#lib/componentes/ficha/GavetaTreino.svelte';
	import SeloStatus from '#lib/componentes/personagem/SeloStatus.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Brasao from '#lib/componentes/cla/Brasao.svelte';
	import IconeCla from '#lib/componentes/cla/IconeCla.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import { APROVACAO_PADRAO, rankSugerido } from '#lib/campanhas/dominio.ts';
	import { BACKGROUNDS, ELEMENTOS, VILAS } from '#lib/personagem/dados.ts';
	import { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { progressoXp, type EstadoJogo, type ItemInventario } from '#lib/personagem/progressao.ts';
	import { normalizarFicha, type FichaDados } from '#lib/personagem/regras.ts';
	import { hrefEditar, hrefNivel } from '#lib/personagem/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta, numero, tempoRelativo } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const k = $derived(data.campanha);
	const p = $derived(data.completa);
	const aprovacao = $derived({ ...APROVACAO_PADRAO, ...k.aprovacao });

	// A ficha em jogo é recriada quando a página recarrega (depois de treinar ou subir de nível).
	const f = $derived(
		p && data.catalogo
			? new FichaJogo(
					{ id: p.id, dados: normalizarFicha(p.dados as Partial<FichaDados>), estado: (p.estado ?? {}) as EstadoJogo, inventario: p.inventario as ItemInventario[] | null, ryo: p.ryo },
					data.catalogo,
					p.status === 'aprovada' && p.situacao === 'ativo' && !data.arquivada && (p.dono || p.mestre)
				)
			: null
	);
	// encomendas aprovadas (armas, marionetes) entram no inventário assim que a ficha abre
	const entregues = new Set<string>();
	$effect(() => {
		const pendentes = (data.entregas ?? []).filter((e) => !entregues.has(e.id));
		if (!f?.editavel || !pendentes.length) return;
		for (const e of pendentes) entregues.add(e.id);
		untrack(() => f.receberEntregas(pendentes));
	});
	let itensRecebidos = false;
	$effect(() => {
		const itens = (p?.entregas ?? []) as unknown as ItemInventario[];
		if (!f?.editavel || !itens.length || itensRecebidos) return;
		itensRecebidos = true;
		untrack(() => f.receberItens(itens));
	});
	const xp = $derived(p ? progressoXp(p.nivel, p.xp) : null);
	const vila = $derived(f ? VILAS.find((v) => v.id === f.dados.vila.id) : null);
	const falecido = $derived(p?.situacao === 'falecido');

	type Aba = 'visao' | 'pericias' | 'jutsus' | 'cla' | 'equip' | 'prog' | 'hist' | 'log';
	const ABAS: { id: Aba; nome: string }[] = [
		{ id: 'visao', nome: 'VISÃO GERAL' },
		{ id: 'pericias', nome: 'PERÍCIAS' },
		{ id: 'jutsus', nome: 'JUTSUS' },
		{ id: 'cla', nome: 'CLÃ' },
		{ id: 'equip', nome: 'EQUIPAMENTO' },
		{ id: 'prog', nome: 'PROGRESSÃO' },
		{ id: 'hist', nome: 'HISTÓRIA' },
		{ id: 'log', nome: 'REGISTRO' }
	];
	let aba = $state<Aba>('visao');
	// "IR PARA O TREINO" (P4) abre a gaveta direto
	// svelte-ignore state_referenced_locally
	let treinando = $state(page.url.searchParams.get('treino') === '1' && !!data.completa?.dono);
	let menu = $state(false);

	// toast do último ajuste (com Desfazer)
	let toastVisivel = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		if (!f?.ultimo) return;
		void f.ultimo;
		toastVisivel = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toastVisivel = false), 5000);
	});

	// situação (memorial / arquivar)
	let situacao = $state<'falecido' | 'arquivado' | 'ativo' | null>(null);
	let epitafio = $state('');
	let mudando = $state(false);
	async function mudarSituacao() {
		if (!p || !situacao) return;
		mudando = true;
		const { error } = await supabase().rpc('definir_situacao', { ficha: p.id, situacao, epitafio: epitafio.trim() || null });
		mudando = false;
		if (error) return toasts.mostrar('Não foi possível mudar a situação da ficha.', 'erro');
		toasts.mostrar(situacao === 'falecido' ? `${p.nome} entrou para o memorial.` : situacao === 'arquivado' ? 'Ficha arquivada.' : 'Ficha reativada.', 'info');
		situacao = null;
		await refreshAll();
	}
	async function retirar() {
		if (!p) return;
		const { error } = await supabase().rpc('retirar_ficha', { ficha: p.id });
		if (error) return toasts.mostrar('Não foi possível retirar. O Mestre pode já ter decidido.', 'erro');
		await goto(hrefEditar(k.id, p.id), { refreshAll: true });
	}
</script>

<svelte:window onclick={(e) => menu && !(e.target as HTMLElement).closest('[data-menu]') && (menu = false)} />

{#if data.publico}
	{@const g = data.publico}
	<main class="flex flex-col gap-5 p-4 md:p-6">
		<header class="flex items-start gap-5 border-b-2 border-b3 pb-5">
			<Retrato nome={g.nome} tamanho={128} class="max-sm:hidden" />
			<div class="flex flex-col gap-2">
				<h1 class="m-0 font-mincho text-4xl leading-[44px] font-bold max-md:text-[28px]">{g.nome}</h1>
				{#if g.resumo.conceito}<span class="text-base leading-6 text-mut">{g.resumo.conceito}</span>{/if}
				<span class="flex items-center gap-2 text-sm font-semibold">
					<IconeCla resumo={g.resumo} />
					{#if g.resumo.vila}<Icone id="vila/ic-vila-{g.resumo.vila}" />{/if}Nível {g.nivel} · {rankSugerido(g.nivel)}{g.situacao === 'falecido' ? ' · Memorial' : ''}
				</span>
			</div>
		</header>
		<div class="grid gap-5 lg:grid-cols-2">
			<section class="painel-sombra flex flex-col gap-2.5 p-4">
				<h2 class="t-rotulo m-0">Resumo público</h2>
				{#if g.resumo.time || g.resumo.sensei}<p class="m-0 text-[15px] leading-[23px]">{[g.resumo.time && `Time: ${g.resumo.time}`, g.resumo.sensei && `Sensei: ${g.resumo.sensei}`].filter(Boolean).join(' · ')}</p>{/if}
				<p class="m-0 text-[15px] leading-[23px]">Elemento: {(g.resumo.elementos ?? []).map((e) => ELEMENTOS.find((x) => x.id === e)?.nome ?? e).join(', ') || '—'}</p>
			</section>
			<div class="flex items-center gap-3 border-2 border-dashed border-b3 p-4">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" class="flex-none" aria-hidden="true"><rect x="5" y="11" width="14" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
				<span class="text-sm leading-[21px] text-mut">Atributos, recursos, jutsus e inventário são visíveis só para quem joga com a ficha e para o Mestre.</span>
			</div>
		</div>
	</main>
{:else if p && f && xp}
	<main class="flex min-w-0 flex-col">
		{#if p.status === 'em_revisao'}
			<div role="status" class="flex flex-wrap items-center gap-2.5 border-b-2 border-ink bg-warn py-0.5 pr-6 pl-4 text-sm leading-5 font-semibold text-warnfg">
				<Icone id="status/ic-status-em-revisao" />Ficha em revisão: somente leitura{p.enviada_em ? ` desde ${dataCurta(p.enviada_em)}` : ''}.
				<span class="flex-1"></span>
				{#if p.dono}<button type="button" class="min-h-9 border-2 border-warnfg px-2.5 font-pixel text-xs font-bold tracking-[0.06em]" onclick={retirar}>RETIRAR DA REVISÃO</button>{/if}
				{#if p.mestre}<a href={hrefEditar(k.id, p.id)} class="min-h-9 border-2 border-warnfg px-2.5 py-2 font-pixel text-xs font-bold tracking-[0.06em]">REVISAR FICHA</a>{/if}
			</div>
		{:else if p.status === 'ajustes'}
			<div role="alert" class="flex flex-wrap items-start gap-2.5 border-b-2 border-info bg-[rgba(91,155,213,.14)] pt-2 pr-6 pb-2.5 pl-4">
				<Icone id="status/ic-status-ajustes" />
				<div class="flex min-w-[200px] flex-1 flex-col gap-1 text-sm leading-[21px]"><b>O Mestre pediu ajustes</b>{#if p.comentario_mestre}<span>“{p.comentario_mestre}”</span>{/if}</div>
				{#if p.dono}<a href={hrefEditar(k.id, p.id)} class="btn-jogo btn-secundario text-[13px]">EDITAR E REENVIAR</a>{/if}
			</div>
		{/if}

		<header class="flex flex-wrap items-start gap-5 border-b-2 border-b3 px-4 py-5 md:px-6" class:grayscale={falecido}>
			<div class="relative flex-none max-sm:hidden">
				<Retrato nome={p.nome || '?'} tamanho={128} />
				{#if falecido}<span class="absolute inset-x-[-2px] bottom-3 border-y-2 border-[#5E6B73] bg-[#1A1A1A] py-[5px] text-center font-pixel text-xs font-bold tracking-[0.1em] text-papel">MEMORIAL</span>{/if}
			</div>
			<div class="flex min-w-[240px] flex-1 flex-col gap-2">
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="m-0 font-mincho text-4xl leading-[44px] font-bold max-md:text-[28px] max-md:leading-9">{p.nome}</h1>
					{#if falecido}
						<span class="inline-flex h-9 items-center gap-1 border-2 border-[#5E6B73] pr-2.5 text-[13px] font-semibold"><Icone id="status/ic-status-revogado" />Falecido</span>
					{:else if p.situacao === 'arquivado'}
						<span class="inline-flex h-9 items-center gap-1 border-2 border-b3 pr-2.5 text-[13px] font-semibold text-mut"><Icone id="status/ic-status-rascunho" />Arquivado</span>
					{:else}<SeloStatus status={p.status} />{/if}
				</div>
				{#if f.dados.conceito.conceito}<span class="text-base leading-6 text-mut">{f.dados.conceito.conceito}</span>{/if}
				<div class="flex flex-wrap gap-2">
					{#if data.catalogo?.cla}<span class="inline-flex h-9 items-center gap-1 border-2 border-b3 pr-2.5 text-[13px] font-semibold"><Brasao slug={data.catalogo.cla.slug} kamon={data.catalogo.cla.brasao?.kamon} cor={data.catalogo.cla.brasao?.cor} />Clã {data.catalogo.cla.nome}</span>{/if}
					{#if vila}<span class="inline-flex h-9 items-center gap-1 border-2 border-b3 pr-2.5 text-[13px] font-semibold"><Icone id="vila/ic-vila-{vila.id}" />{vila.nome.replace(/gakure$/, '')}</span>{/if}
					<span class="inline-flex h-9 items-center border-2 border-[#8B2E20] bg-grena px-2.5 font-pixel text-xs font-bold tracking-[0.06em] text-papel uppercase">{rankSugerido(p.nivel).split(' ')[0]}</span>
				</div>
				{#if falecido && p.epitafio}<span class="font-mincho text-base leading-6 font-semibold text-mut italic">“{p.epitafio}”{p.falecido_em ? ` · ${dataCurta(p.falecido_em)}` : ''}</span>{/if}
			</div>
			<div class="flex w-full flex-col gap-2.5 sm:w-[300px] sm:flex-none">
				<div class="flex items-baseline gap-2">
					<span class="t-rotulo text-mut">Nível</span><span class="t-num text-4xl leading-none">{p.nivel}</span><span class="flex-1"></span>
					<span class="t-num text-sm">{numero(p.xp)} / {numero(xp.alvo)} XP</span>
				</div>
				<div class="h-3 border-2 border-ink bg-b3" role="progressbar" aria-label="XP até o próximo nível" aria-valuenow={Math.round(xp.fracao * 100)} aria-valuemin={0} aria-valuemax={100}>
					<div class="h-full" style:width="{xp.fracao * 100}%" style="background: var(--acc); box-shadow: inset 0 2px 0 #F2C14E"></div>
				</div>
				<div class="flex flex-wrap justify-end gap-2" data-menu>
					{#if f.editavel && p.dono}
						{#if xp.podeSubir}
							<a href={hrefNivel(k.id, p.id)} class="btn-jogo btn-primario com-icone pulso-nivel text-[13px]"><Icone id="acao/ic-acao-subir-nivel" />SUBIR DE NÍVEL</a>
						{/if}
						<button type="button" class="btn-jogo btn-contorno com-icone text-[13px]" onclick={() => (treinando = true)}><Icone id="recurso/ic-recurso-pt" />TREINAR · {p.pt} PT</button>
					{/if}
					<a href="/campanhas/{k.id}/personagens/{p.id}/imprimir" class="btn-jogo border-2 border-b3 text-[13px] hover:border-mut">IMPRIMIR</a>
					<div class="relative">
						<button type="button" class="btn-icone" aria-label="Mais ações" aria-haspopup="menu" aria-expanded={menu} onclick={() => (menu = !menu)}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="10" width="4" height="4" /><rect x="10" y="10" width="4" height="4" /><rect x="17" y="10" width="4" height="4" /></svg>
						</button>
						{#if menu}
							<div role="menu" class="camada absolute top-12 right-0 z-30 flex w-64 flex-col py-1.5">
								<a role="menuitem" href={hrefEditar(k.id, p.id)} class="flex min-h-11 items-center px-3.5 text-[15px] hover:bg-b3">Ver a criação passo a passo</a>
								{#if p.status === 'aprovada' && !data.arquivada}
									{#if p.situacao === 'ativo'}
										<button type="button" role="menuitem" class="flex min-h-11 items-center px-3.5 text-left text-[15px] hover:bg-b3" onclick={() => ((situacao = 'arquivado'), (menu = false))}>Arquivar ficha</button>
										{#if p.mestre}<button type="button" role="menuitem" class="flex min-h-11 items-center px-3.5 text-left text-[15px] text-err hover:bg-b3" onclick={() => ((situacao = 'falecido'), (menu = false))}>Marcar como falecido</button>{/if}
									{:else if p.situacao === 'arquivado' || p.mestre}
										<button type="button" role="menuitem" class="flex min-h-11 items-center px-3.5 text-left text-[15px] hover:bg-b3" onclick={() => ((situacao = 'ativo'), (menu = false))}>Reativar ficha</button>
									{/if}
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</header>

		<BarraRecursos {f} />
		{#if p?.excecao}<div class="mx-4 mt-4 md:mx-6"><Alerta tipo="aviso" titulo="Exceção do Mestre"><span>“{p.excecao}”</span></Alerta></div>{/if}

		{#if f.atual.situacao !== 'bem' && f.editavel}
			<div role="alert" class="mx-4 mt-4 flex flex-wrap items-center gap-3 border-2 border-err bg-[rgba(229,83,75,.14)] py-2 pr-3 pl-1.5 md:mx-6">
				<Icone id="estado/ic-estado-caido" />
				<span class="min-w-[200px] flex-1 text-[15px] leading-[22px] font-semibold">
					{#if f.atual.situacao === 'morte'}PV na metade negativa do máximo: morte imediata (cap. 4). O Mestre decide o desfecho.{:else}Inconsciente · Save de Morte por turno: 1d20{f.calc.atributos.ESP > 0 ? ` + ${f.calc.atributos.ESP} (ESP)` : ''} ≥ 10.{/if}
				</span>
				{#if f.atual.situacao === 'caido'}
					{#each [['sucessos', 'SUCESSOS', 'var(--ok)'], ['falhas', 'FALHAS', 'var(--err)']] as const as [t, rotulo, cor] (t)}
						<div class="flex items-center gap-1 font-pixel text-xs font-bold" role="group" aria-label="{rotulo}: {f.atual.saves[t]} de 3">
							<span class="mr-1">{rotulo}</span>
							{#each [1, 2, 3] as n (n)}
								<button type="button" class="h-5 w-5 border-2" style:background={n <= f.atual.saves[t] ? cor : 'transparent'} style:border-color={n <= f.atual.saves[t] ? 'var(--ink)' : 'var(--b3)'} aria-label="{rotulo} {n}" onclick={() => f.save(t, n <= f.atual.saves[t] ? -1 : 1)}></button>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
		{/if}

		<div role="tablist" aria-label="Seções da ficha" class="mx-4 mt-4 flex overflow-x-auto border-y-2 border-ink bg-b2 md:mx-6">
			{#each ABAS as a (a.id)}
				<button
					type="button"
					role="tab"
					aria-selected={aba === a.id}
					class="flex items-center gap-1.5 px-3.5 py-[15px] font-pixel text-sm leading-none font-semibold tracking-[0.05em] whitespace-nowrap {aba === a.id ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}"
					onclick={() => (aba = a.id)}
				>
					{aba === a.id ? '▸ ' : ''}{a.nome}{#if a.id === 'jutsus'}<span class="border-2 px-1 py-0.5 text-xs {aba === a.id ? 'border-[#8B2E20]' : 'border-b3'}">{f.calc.jutsus.length}</span>{/if}
				</button>
			{/each}
		</div>

		<div class="flex flex-col gap-5 px-4 pt-5 pb-8 md:px-6" role="tabpanel">
			{#if aba === 'visao'}<AbaVisao {f} aoAbrirJutsus={() => (aba = 'jutsus')} />
			{:else if aba === 'pericias'}<AbaPericias {f} />
			{:else if aba === 'jutsus'}<AbaJutsus {f} />
			{:else if aba === 'cla'}<AbaCla {f} />
			{:else if aba === 'equip'}<AbaEquipamento {f} />
			{:else if aba === 'prog'}<AbaProgressao {f} pt={p.pt} xp={p.xp} registros={data.registros} pedidos={data.pedidos} aoTreinar={() => (treinando = true)} />
			{:else if aba === 'hist'}
				{@const bg = BACKGROUNDS.find((b) => b.id === f.dados.background.id)}
				<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,760px)_minmax(0,1fr)]">
					<div class="flex flex-col gap-3.5">
						<span class="t-rotulo text-xs">Background · {f.dados.background.id === 'proprio' ? f.dados.background.proprio.nome : (bg?.nome ?? '—')}</span>
						<p class="m-0 text-[17px] leading-[29px]">{f.dados.background.id === 'proprio' ? f.dados.background.proprio.traco : `${bg?.bonus ?? ''}. ${bg?.traco ?? ''}`}</p>
						{#if f.dados.conceito.aparencia}<span class="t-rotulo mt-1.5 text-xs">Aparência</span><p class="m-0 text-[17px] leading-[29px]">{f.dados.conceito.aparencia}</p>{/if}
						{#if f.dados.conceito.origem || f.dados.conceito.idade}
							<span class="t-rotulo mt-1.5 text-xs">Origem</span>
							<p class="m-0 text-[17px] leading-[29px]">{[f.dados.conceito.origem, f.dados.conceito.idade ? `${f.dados.conceito.idade} anos` : ''].filter(Boolean).join(' · ')}</p>
						{/if}
					</div>
					<div class="flex flex-col gap-2.5">
						<div class="painel flex flex-col gap-1 px-3.5 py-3"><span class="t-rotulo text-xs">Time</span><span class="text-[15px] font-semibold">{f.dados.time || '—'}</span></div>
						<div class="painel flex flex-col gap-1 px-3.5 py-3"><span class="t-rotulo text-xs">Sensei</span><span class="text-[15px] font-semibold">{f.dados.sensei || '—'}</span></div>
					</div>
				</div>
			{:else}
				<ul class="painel-sombra m-0 list-none p-0">
					{#each data.registros as r (r.id)}
						<li class="grid grid-cols-[32px_minmax(0,140px)_minmax(0,1fr)_auto] items-center gap-3 border-b-2 border-b3 px-3.5 py-1.5 last:border-b-0 max-md:grid-cols-[32px_minmax(0,1fr)_auto]">
							<Icone id={r.icone} />
							<span class="truncate text-sm font-semibold max-md:hidden">{r.ator?.nome ?? '—'}</span>
							<span class="text-sm leading-5"><span class="font-semibold md:hidden">{r.ator?.nome ?? '—'}: </span>{r.texto}</span>
							<span class="text-xs whitespace-nowrap text-mut">{tempoRelativo(r.criado_em)}</span>
						</li>
					{:else}
						<li class="p-3.5 text-sm text-mut">Nada registrado ainda.</li>
					{/each}
				</ul>
			{/if}
		</div>
	</main>

	{#if toastVisivel && f.ultimo}
		<div role="status" class="fixed right-4 bottom-20 z-50 flex w-[420px] max-w-[calc(100vw-32px)] items-center gap-2.5 border-2 border-frame bg-b2 py-2 pr-2 pl-2.5 sombra-painel md:right-6 md:bottom-6">
			<Icone id={f.ultimo.icone} />
			<span class="flex-1 text-sm leading-5 font-medium">{f.ultimo.texto}</span>
			{#if f.podeDesfazer}<button type="button" class="min-h-9 border-2 border-mut px-2.5 font-pixel text-xs font-bold tracking-[0.08em]" onclick={() => f.desfazer()}>DESFAZER</button>{/if}
		</div>
	{/if}

	{#if treinando}<GavetaTreino {f} pt={p.pt} aprovacaoTreino={aprovacao.treino} aoFechar={() => (treinando = false)} />{/if}

	{#if situacao}
		<Modal rotulo="Situação da ficha" largura={480} aoFechar={() => !mudando && (situacao = null)}>
			<div class="flex flex-col gap-4 p-6">
				<h2 class="t-h3 m-0">{situacao === 'falecido' ? `${p.nome} faleceu?` : situacao === 'arquivado' ? 'Arquivar a ficha?' : 'Reativar a ficha?'}</h2>
				<p class="m-0 text-[15px] leading-[23px] text-mut">
					{situacao === 'falecido'
						? 'A ficha vai para o memorial: fica só para leitura e o jogador pode criar outro personagem.'
						: situacao === 'arquivado'
							? 'A ficha sai de jogo e fica só para leitura. O jogador pode criar outro personagem; dá para reativar depois.'
							: 'A ficha volta para a mesa. O jogador só pode ter uma ficha ativa por campanha.'}
				</p>
				{#if situacao === 'falecido'}
					<Campo id="epitafio" rotulo="Epitáfio (opcional)">
						<input id="epitafio" class="campo" maxlength="300" placeholder="Caiu protegendo o time na ponte de Kiri." bind:value={epitafio} />
					</Campo>
				{/if}
				<div class="flex flex-wrap justify-end gap-2.5">
					<button type="button" class="btn-jogo btn-fantasma" disabled={mudando} onclick={() => (situacao = null)}>CANCELAR</button>
					<button type="button" class="btn-jogo {situacao === 'falecido' ? 'bg-err text-errfg' : 'btn-primario'}" disabled={mudando} aria-busy={mudando} onclick={mudarSituacao}>
						{#if mudando}<Girando />{/if}{situacao === 'falecido' ? 'IR PARA O MEMORIAL' : situacao === 'arquivado' ? 'ARQUIVAR' : 'REATIVAR'}
					</button>
				</div>
			</div>
		</Modal>
	{/if}
{/if}

<style>
	:global(.pulso-nivel) {
		animation: pulso-nivel 1.4s steps(1) infinite;
	}
	@keyframes pulso-nivel {
		0%,
		49% {
			box-shadow:
				inset 0 -4px 0 #8b2e20,
				0 0 0 2px #f2c14e;
		}
		50%,
		100% {
			box-shadow:
				inset 0 -4px 0 #8b2e20,
				0 0 0 2px transparent;
		}
	}
</style>
