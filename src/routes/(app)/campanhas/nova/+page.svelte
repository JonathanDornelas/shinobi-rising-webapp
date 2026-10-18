<script lang="ts">
	// C2 · Criar campanha: assistente de 3 passos + revisão, sem painel lateral de app. Rascunho salvo neste dispositivo.
	import { onMount } from 'svelte';
	import FormAmbientacao from '#lib/componentes/campanha/FormAmbientacao.svelte';
	import FormAprovacao from '#lib/componentes/campanha/FormAprovacao.svelte';
	import FormIdentidade from '#lib/componentes/campanha/FormIdentidade.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import IndicadorSalvo, { type EstadoSalvo } from '#lib/componentes/ui/IndicadorSalvo.svelte';
	import {
		APROVACOES,
		CAPAS,
		urlCapa,
		dadosPadrao,
		nomeCla,
		nomeEra,
		PACOTES,
		paraRegistro,
		rankSugerido,
		STATUS_VILA,
		validarAmbientacao,
		validarIdentidade,
		VILAS,
		type DadosCampanha,
		type ErrosCampanha
	} from '#lib/campanhas/dominio.ts';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';

	const PASSOS = ['Identidade', 'Ambientação e regras', 'Aprovação', 'Revisão'];
	const CHAVE = 'rascunho-campanha';

	let passo = $state(0);
	let dados = $state<DadosCampanha>(dadosPadrao());
	let erros = $state<ErrosCampanha>({});
	let salvo = $state<EstadoSalvo>({ tipo: 'ocioso' });
	let criando = $state(false);
	let falha = $state('');
	let criada = $state<{ id: string; nome: string; capa: string } | null>(null);
	let titulo: HTMLHeadingElement | undefined = $state();
	let carregado = false;

	onMount(() => {
		const r = ler<{ dados?: DadosCampanha; passo?: number } | null>(CHAVE, null);
		if (r?.dados) {
			dados = { ...dadosPadrao(), ...r.dados };
			passo = Math.min(Math.max(r.passo ?? 0, 0), 3);
		}
		carregado = true;
	});

	// Salva o rascunho a cada mudança (depois de ler o anterior).
	$effect(() => {
		const copia = $state.snapshot(dados);
		const p = passo;
		if (!carregado || criada) return;
		gravar(CHAVE, { dados: copia, passo: p });
		salvo = { tipo: 'salvo', em: Date.now() };
	});

	function validar(p: number): boolean {
		erros = p === 0 ? validarIdentidade(dados) : p === 1 ? validarAmbientacao(dados) : {};
		return Object.keys(erros).length === 0;
	}

	function irPara(p: number) {
		// Só deixa pular para frente se os passos anteriores estão válidos.
		for (let i = 0; i < p; i++) {
			if (!validar(i)) {
				passo = i;
				focarTitulo();
				return;
			}
		}
		erros = {};
		passo = p;
		focarTitulo();
	}

	function focarTitulo() {
		queueMicrotask(() => {
			titulo?.focus();
			window.scrollTo({ top: 0 });
		});
	}

	async function criar() {
		if (!validar(0) || !validar(1)) return irPara(3);
		if (!sessao.usuario) return;
		criando = true;
		falha = '';
		const { data, error } = await supabase()
			.from('campanhas')
			.insert({ ...paraRegistro(dados), mestre_id: sessao.usuario.id })
			.select('id, nome, capa')
			.single();
		criando = false;
		if (error || !data) {
			falha = 'Não foi possível criar a campanha. Confira a conexão e tente de novo; o rascunho continua salvo.';
			return;
		}
		gravar(CHAVE, null);
		criada = data;
	}

	const nomeVila = (id: string) => VILAS.find((v) => v.id === id)?.nome ?? id;
	const nomeStatus = (s: string | null) => (s ? STATUS_VILA.find((x) => x.id === s)?.nome : '');
</script>

{#if criada}
	<main class="flex flex-1 items-start justify-center px-4 py-10 md:items-center">
		<div class="camada flex w-full max-w-[560px] flex-col" role="status">
			<img src={urlCapa(criada.capa)} alt="" class="h-[208px] w-full border-b-2 border-carvao object-cover [image-rendering:pixelated]" />
			<div class="flex items-center gap-5 p-6">
				<img src="/illustrations/il-aprovado-96.png" width="96" height="96" alt="Selo de aprovado" class="carimbo flex-none [image-rendering:pixelated]" />
				<div class="flex flex-col gap-1.5">
					<h1 class="m-0 font-mincho text-2xl leading-8 font-bold">Campanha criada</h1>
					<p class="m-0 text-[15px] leading-[23px] text-mut"><b class="text-fg">{criada.nome}</b> está pronta. Agora chame o grupo.</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2 px-6 pb-6">
				<a href="/campanhas/{criada.id}/membros?convidar=1" class="btn-jogo btn-primario com-icone min-h-12 flex-1"><Icone id="acao/ic-acao-convidar" />CONVIDE SEUS JOGADORES</a>
				<a href="/campanhas/{criada.id}" class="btn-jogo btn-contorno min-h-12 max-sm:flex-1">IR PARA O PAINEL</a>
			</div>
		</div>
	</main>
{:else}
	<div class="grid flex-1 md:grid-cols-[240px_minmax(0,1fr)]">
		<nav aria-label="Passos" class="flex flex-col border-r-2 border-b3 bg-b2 py-4 max-md:hidden">
			<span class="t-rotulo px-4 pt-1.5 pb-3">Nova campanha</span>
			<ol class="m-0 flex list-none flex-col p-0">
				{#each PASSOS as nome, i (nome)}
					{@const atual = i === passo}
					{@const feito = i < passo}
					<li>
						<button
							type="button"
							class="flex min-h-12 w-full items-center gap-2.5 px-3.5 text-left {atual ? 'bg-grena text-papel shadow-[inset_4px_0_0_var(--vermelhao)]' : 'text-fg hover:bg-b3'}"
							aria-current={atual ? 'step' : undefined}
							onclick={() => irPara(i)}
						>
							<span
								class="t-num flex h-7 w-7 flex-none items-center justify-center border-2 text-[13px] {feito
									? 'border-ink bg-ok text-okfg'
									: atual
										? 'border-ink bg-vermelhao text-white'
										: 'border-b3 text-mut'}">{feito ? '✓' : i + 1}</span
							>
							<span class="text-[15px] leading-5 font-semibold">{nome}</span>
						</button>
					</li>
				{/each}
			</ol>
		</nav>

		<div class="flex min-w-0 flex-col">
			<main class="flex w-full max-w-[860px] flex-1 flex-col gap-[22px] px-4 py-6 md:px-10 md:py-7">
				<div class="flex flex-col gap-1">
					<span class="t-rotulo text-mut">Passo {passo + 1} de {PASSOS.length}</span>
					<div class="flex gap-1 md:hidden" aria-hidden="true">
						{#each PASSOS as _, i (i)}<span class="h-2 flex-1 border-2 border-ink" style:background={i <= passo ? 'var(--vermelhao)' : 'var(--b3)'}></span>{/each}
					</div>
					<h1 class="m-0 font-mincho text-[30px] leading-[38px] font-bold outline-none max-md:text-2xl" tabindex="-1" bind:this={titulo}>{PASSOS[passo]}</h1>
				</div>

				{#if passo === 0}
					<FormIdentidade bind:dados {erros} />
				{:else if passo === 1}
					<FormAmbientacao bind:dados {erros} />
				{:else if passo === 2}
					<FormAprovacao bind:dados />
				{:else}
					{@render revisao()}
				{/if}
			</main>

			<div class="sticky bottom-16 flex items-center gap-4 border-t-2 border-ink bg-b2 px-4 py-2.5 md:bottom-0 md:px-6">
				{#if passo > 0}
					<button type="button" class="btn-jogo btn-fantasma" onclick={() => irPara(passo - 1)}>◂ VOLTAR</button>
				{:else}
					<a href="/campanhas" class="btn-jogo btn-fantasma">CANCELAR</a>
				{/if}
				<span class="flex-1"></span>
				<span class="max-sm:hidden"><IndicadorSalvo estado={salvo} /></span>
				{#if passo < 3}
					<button type="button" class="btn-jogo btn-primario" onclick={() => irPara(passo + 1)}>PRÓXIMO ▸</button>
				{:else}
					<button type="button" class="btn-jogo btn-primario" disabled={criando} aria-busy={criando} onclick={criar}>
						{#if criando}<Girando />CRIANDO…{:else}CRIAR CAMPANHA{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#snippet secao(rotulo: string, alvo: number, conteudo: import('svelte').Snippet)}
	<section class="painel">
		<div class="flex items-center border-b-2 border-b3 px-3.5 py-2.5">
			<h2 class="t-rotulo m-0 flex-1">{rotulo}</h2>
			<button type="button" class="link text-[13px] font-semibold" onclick={() => irPara(alvo)}>Editar</button>
		</div>
		<dl class="m-0 grid gap-x-6 gap-y-2.5 p-3.5 text-[15px] leading-[22px] sm:grid-cols-[180px_minmax(0,1fr)]">{@render conteudo()}</dl>
	</section>
{/snippet}

{#snippet revisao()}
	{#if falha}<Alerta tipo="erro" titulo={falha} />{/if}
	{#snippet identidade()}
		<dt class="font-semibold text-mut">Nome</dt>
		<dd class="m-0 font-mincho text-lg font-bold">{dados.nome || '—'}</dd>
		<dt class="font-semibold text-mut">Premissa</dt>
		<dd class="m-0 whitespace-pre-line">{dados.premissa.trim() || 'Sem premissa.'}</dd>
		<dt class="font-semibold text-mut">Capa</dt>
		<dd class="m-0">{CAPAS.find((c) => c.id === dados.capa)?.nome}</dd>
	{/snippet}
	{#snippet ambientacao()}
		<dt class="font-semibold text-mut">Período</dt>
		<dd class="m-0">{nomeEra(dados)}</dd>
		<dt class="font-semibold text-mut">Nível inicial</dt>
		<dd class="m-0">{dados.nivel_inicial} · {rankSugerido(dados.nivel_inicial)}</dd>
		<dt class="font-semibold text-mut">Tamanho do grupo</dt>
		<dd class="m-0">{dados.tamanho_grupo} pessoas</dd>
		<dt class="font-semibold text-mut">Vilas</dt>
		<dd class="m-0">{dados.vilas.map((v) => nomeVila(v.id) + (v.status ? ` (${nomeStatus(v.status)})` : '')).join(', ')}</dd>
		<dt class="font-semibold text-mut">Clãs oficiais</dt>
		<dd class="m-0">{dados.clas_permitidos.length === 13 ? 'Todos os 13' : dados.clas_permitidos.map(nomeCla).join(', ') || 'Nenhum'}</dd>
		<dt class="font-semibold text-mut">Clãs personalizados</dt>
		<dd class="m-0">
			{[dados.clas_sem_kkg && 'sem KKG', dados.clas_com_kkg && 'com KKG'].filter(Boolean).join(' e ') || 'Não permitidos'}
		</dd>
		<dt class="font-semibold text-mut">Pacotes</dt>
		<dd class="m-0">{dados.pacotes.map((p) => PACOTES.find((x) => x.id === p)?.nome).join(', ')}</dd>
	{/snippet}
	{#snippet aprovacao()}
		<dt class="font-semibold text-mut">Exigem aprovação</dt>
		<dd class="m-0">
			{APROVACOES.filter((a) => a.id !== 'mestre_edita_aprovadas' && (a.travado || dados.aprovacao[a.id as 'fichas']))
				.map((a) => a.nome)
				.join(', ')}
		</dd>
		<dt class="font-semibold text-mut">Fichas aprovadas</dt>
		<dd class="m-0">{dados.aprovacao.mestre_edita_aprovadas ? 'O Mestre pode editar direto' : 'Só o jogador edita, com nova revisão'}</dd>
	{/snippet}
	{@render secao('Identidade', 0, identidade)}
	{@render secao('Ambientação e regras', 1, ambientacao)}
	{@render secao('Aprovação', 2, aprovacao)}
	<p class="m-0 text-sm leading-5 text-mut">Tudo isso pode ser mudado depois em Configurações. Mudanças não afetam fichas já aprovadas.</p>
{/snippet}
