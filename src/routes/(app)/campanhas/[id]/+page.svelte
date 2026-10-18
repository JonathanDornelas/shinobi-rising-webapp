<script lang="ts">
	// C3 · Painel do Mestre e C4 · Painel do Jogador. Widgets que dependem de fichas, submissões e NPCs
	// mostram o estado vazio até os próximos lotes.
	import { goto, refreshAll } from '$app/navigation';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import IconeCla, { temIconeCla } from '#lib/componentes/cla/IconeCla.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import SeloStatus from '#lib/componentes/personagem/SeloStatus.svelte';
	import ModalRecompensas from '#lib/componentes/campanha/ModalRecompensas.svelte';
	import { progressoXp } from '#lib/personagem/progressao.ts';
	import { SESSOES_TREINO } from '#lib/personagem/dados.ts';
	import { numero } from '#lib/formatar.ts';
	import { hrefEditar, hrefFicha, hrefNivel } from '#lib/personagem/status.ts';
	import { sinal } from '#lib/personagem/regras.ts';
	import { nomeEra, rankSugerido, urlCapa } from '#lib/campanhas/dominio.ts';
	import { regrasEmHtml } from '#lib/campanhas/texto.ts';
	import { copiarConvite, destinoConvite, reenviarConvite, revogarConvite, validadeConvite } from '#lib/campanhas/convites.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta, tempoRelativo } from '#lib/formatar.ts';
	import { APROVACAO_PADRAO } from '#lib/campanhas/dominio.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.campanha);
	const mestre = $derived(data.papel === 'mestre');
	const jogadores = $derived(data.membros.filter((m) => m.papel === 'jogador'));
	const arquivada = $derived(!!c.arquivada_em);
	// ---------------------------------------------------------------- fichas
	/** A ficha ativa do jogador (falecidas e arquivadas ficam na lista de Personagens). */
	const fichaDe = (jogador: string) => data.personagens.find((p) => p.jogador_id === jogador && p.situacao === 'ativo');
	const ativas = $derived(data.personagens.filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && !p.pre_gerado));
	let recompensando = $state(false);
	const SEM_FICHAS = 'Nenhuma ficha aprovada e ativa para receber recompensas';

	// pedidos de PT de treino (cap. 18) esperando o Mestre
	let decidindo = $state<string | null>(null);
	async function decidirPedido(id: string, aprovar: boolean) {
		decidindo = id;
		const { error } = await supabase().rpc('decidir_pedido_pt', { pedido: id, aprovar });
		decidindo = null;
		if (error) return toasts.mostrar('Não foi possível registrar a decisão.', 'erro');
		toasts.mostrar(aprovar ? 'PT de treino aprovados.' : 'Pedido recusado.', aprovar ? 'sucesso' : 'info');
		await refreshAll();
	}
	const nomeFicha = (id: string) => data.personagens.find((p) => p.id === id)?.nome ?? 'Personagem';
	const eu = $derived(data.usuario?.id ?? sessao.usuario?.id ?? '');
	const minha = $derived(fichaDe(eu));
	const contagem = (s: string) => data.personagens.filter((p) => p.jogador_id === eu && p.status === s).length;
	const emRevisao = $derived(data.personagens.filter((p) => p.status === 'em_revisao'));
	let criando = $state(false);
	async function criarPersonagem() {
		if (!sessao.usuario) return;
		criando = true;
		const { data: nova, error } = await supabase().from('personagens').insert({ campanha_id: c.id, jogador_id: sessao.usuario.id }).select('id').single();
		criando = false;
		if (error || !nova) return toasts.mostrar('Não foi possível começar a ficha. Tente de novo.', 'erro');
		await goto(hrefEditar(c.id, nova.id));
	}
	const barra = (valor: number | undefined, cor: string, brilho: string) => ({ valor: valor ?? 0, cor, brilho });
	const aprovacaoFichas = $derived({ ...APROVACAO_PADRAO, ...c.aprovacao }.fichas);

	// Primeiros passos (C3 recém-criada): some quando o que dá para fazer agora está feito.
	const passos = $derived([
		{ nome: 'Convidar jogadores', feito: jogadores.length > 0 || data.convites.length > 0, href: `/campanhas/${c.id}/membros?convidar=1` },
		{ nome: 'Revisar configurações', feito: new Date(c.atualizada_em).getTime() - new Date(c.criada_em).getTime() > 2000, href: `/campanhas/${c.id}/configuracoes` },
		{ nome: 'Criar conteúdo da campanha', feito: false },
		{ nome: 'Criar NPCs', feito: false }
	]);
	const mostrarPassos = $derived(mestre && !arquivada && !(passos[0].feito && passos[1].feito));

	let tentando = $state(false);
	async function tentarDeNovo() {
		tentando = true;
		await refreshAll();
		tentando = false;
	}

	// Jogador: sair da campanha
	let saindo = $state(false);
	let confirmandoSaida = $state(false);
	async function sair() {
		if (!sessao.usuario) return;
		saindo = true;
		const { error } = await supabase().from('membros').delete().eq('campanha_id', c.id).eq('usuario_id', sessao.usuario.id);
		saindo = false;
		if (error) return toasts.mostrar('Não foi possível sair agora. Tente de novo.', 'erro');
		toasts.mostrar(`Você saiu de ${c.nome}.`, 'info');
		await goto('/campanhas', { refreshAll: true });
	}
</script>

{#snippet cabeca(rotulo: string, acao?: import('svelte').Snippet)}
	<div class="flex items-center border-b-2 border-b3 px-3.5 py-3">
		<h2 class="t-rotulo m-0 flex-1">{rotulo}</h2>
		{#if acao}{@render acao()}{/if}
	</div>
{/snippet}

{#snippet atividade()}
	<section class="painel-sombra" aria-label="Atividade recente">
		{@render cabeca('Atividade recente')}
		{#if data.atividades === null}
			<div class="flex flex-wrap items-center gap-2.5 px-3.5 py-4 text-sm leading-5 font-semibold">
				<Icone id="status/ic-status-rejeitado" />Não foi possível carregar a atividade.<span class="flex-1"></span>
				<button type="button" class="btn-jogo btn-erro" disabled={tentando} onclick={tentarDeNovo}>TENTAR</button>
			</div>
			<p class="m-0 px-3.5 pb-3.5 text-xs leading-4 text-mut">Os outros widgets continuam funcionando.</p>
		{:else if !data.atividades.length}
			<p class="m-0 p-3.5 text-sm text-mut">Nada por aqui ainda.</p>
		{:else}
			<ul class="m-0 flex list-none flex-col px-3.5 pt-2 pb-3">
				{#each data.atividades as a (a.id)}
					<li class="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-2.5 py-1.5">
						<Icone id={a.icone} />
						<div class="flex flex-col gap-0.5">
							<span class="text-sm leading-5 font-medium">{a.texto}</span>
							<span class="text-xs leading-4 text-mut">{tempoRelativo(a.criada_em)}</span>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/snippet}

{#if mestre}
	<!-- ================================================================ C3 · Mestre -->
	<main class="flex min-w-0 flex-col gap-5 p-4 md:p-6">
		<div class="painel-sombra flex items-stretch gap-5 max-md:hidden">
			<img src={urlCapa(c.capa)} width="512" height="192" alt="" class="flex-none border-r-2 border-ink [image-rendering:pixelated] max-xl:w-[384px] max-xl:object-cover" />
			<div class="flex flex-1 flex-col gap-2.5 py-[18px] pr-[18px]">
				<span class="font-mincho text-[30px] leading-[38px] font-bold">{c.nome}</span>
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm leading-5 font-semibold text-mut">
					<span>{nomeEra(c)}</span>
					<span>{jogadores.length === 1 ? '1 jogador' : `${jogadores.length} jogadores`}</span>
					<span>Nível inicial <b class="t-num text-[15px] text-fg">{c.nivel_inicial}</b> · {rankSugerido(c.nivel_inicial)}</span>
				</div>
				<span class="flex-1"></span>
				<div class="flex flex-wrap gap-2">
					<button type="button" class="btn-jogo btn-primario com-icone text-[13px]" disabled={arquivada || !ativas.length} title={ativas.length ? undefined : SEM_FICHAS} onclick={() => (recompensando = true)}><Icone id="acao/ic-acao-conceder" />CONCEDER RECOMPENSAS</button>
					{#if !arquivada}<a href="/campanhas/{c.id}/membros?convidar=1" class="btn-jogo btn-contorno com-icone text-[13px]"><Icone id="acao/ic-acao-convidar" />CONVIDAR</a>{/if}
					<a href="/campanhas/{c.id}/configuracoes" class="btn-jogo btn-fantasma com-icone text-[13px]"><Icone id="nav/ic-nav-configuracoes" />CONFIGURAÇÕES</a>
				</div>
			</div>
		</div>
		<button type="button" class="btn-jogo btn-primario com-icone md:hidden" disabled={arquivada || !ativas.length} title={ativas.length ? undefined : SEM_FICHAS} onclick={() => (recompensando = true)}><Icone id="acao/ic-acao-conceder" />CONCEDER RECOMPENSAS</button>

		<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
			<div class="flex min-w-0 flex-col gap-5">
				<section class="border-2 border-[var(--vermelhao-lo)] bg-b2 sombra-painel" aria-label="Aguardando sua revisão">
					<div class="flex items-center gap-2.5 bg-grena px-3.5 py-2.5 text-papel">
						<Icone id="nav/ic-nav-aprovacoes" />
						<h2 class="m-0 flex-1 font-pixel text-sm leading-none font-bold tracking-[0.1em]">AGUARDANDO SUA REVISÃO · {emRevisao.length + data.pedidosPt.length}</h2>
					</div>
					{#if emRevisao.length || data.pedidosPt.length}
						<ul class="m-0 flex list-none flex-col p-0">
							{#each data.pedidosPt as d (d.id)}
								<li class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-b3 px-3.5 py-2">
									<Icone id="recurso/ic-recurso-pt" />
									<span class="flex min-w-[200px] flex-1 flex-col gap-0.5">
										<span class="text-[15px] leading-5 font-semibold">Treino: +{d.pt} PT para {nomeFicha(d.personagem_id)}</span>
										<span class="text-[13px] leading-[18px] text-mut">{SESSOES_TREINO.find((s) => s.id === d.sessao)?.nome} · {d.semanas} {d.semanas === 1 ? 'semana' : 'semanas'} · {d.descricao}</span>
									</span>
									<span class="text-xs leading-4 font-semibold whitespace-nowrap text-mut">{tempoRelativo(d.criado_em)}</span>
									<span class="flex gap-1.5">
										<button type="button" class="btn-jogo btn-fantasma min-h-9 px-2.5 text-xs" disabled={decidindo === d.id} onclick={() => decidirPedido(d.id, false)}>RECUSAR</button>
										<button type="button" class="btn-jogo btn-primario min-h-9 px-2.5 text-xs" disabled={decidindo === d.id} onclick={() => decidirPedido(d.id, true)}>APROVAR</button>
									</span>
								</li>
							{/each}
							{#each emRevisao as p (p.id)}
								<li>
									<a href={hrefEditar(c.id, p.id)} class="flex items-center gap-3 border-b-2 border-b3 px-3.5 py-2 text-fg last:border-b-0 hover:bg-b3">
										<Icone id="acao/ic-acao-criar-personagem" />
										<span class="flex min-w-0 flex-1 flex-col gap-0.5">
											<span class="text-[15px] leading-5 font-semibold">Ficha de {p.nome || 'personagem sem nome'}</span>
											<span class="text-[13px] leading-[18px] text-mut">{data.membros.find((m) => m.id === p.jogador_id)?.nome ?? 'Jogador'} · nível {p.nivel}</span>
										</span>
										<span class="text-xs leading-4 font-semibold whitespace-nowrap text-mut">{tempoRelativo(p.enviada_em ?? p.atualizada_em)}</span>
									</a>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="flex flex-col items-center gap-2.5 p-6 text-center">
							<img src="/illustrations/il-cha-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
							<span class="text-base leading-[22px] font-semibold">Nada para revisar. Hora do chá, Mestre.</span>
							<span class="text-[13px] leading-[18px] text-mut">Fichas e pedidos de PT de treino aparecem aqui. Clãs e jutsus criados chegam nos próximos lotes.</span>
						</div>
					{/if}
				</section>

				<section class="painel-sombra" aria-label="Grupo">
					{@render cabeca('Grupo')}
					{#if jogadores.length}
						<ul class="m-0 flex list-none flex-col p-0">
							{#each jogadores as j, i (j.id)}
								{@const f = fichaDe(j.id)}
								<li style:background={i % 2 ? 'var(--b1)' : undefined}>
									<svelte:element
										this={f ? 'a' : 'div'}
										href={f ? hrefFicha(c.id, f.id) : undefined}
										class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b-2 border-b3 px-3.5 py-2 text-fg {f ? 'hover:bg-b3' : ''}"
									>
										{#if f?.resumo && !f.retrato && f.status === 'aprovada' && temIconeCla(f.resumo)}
											<IconeCla resumo={f.resumo} />
										{:else}
											<Retrato nome={f?.nome || j.nome} foto={f?.retrato} tamanho={32} />
										{/if}
										<span class="flex min-w-[140px] flex-1 flex-col">
											<span class="truncate font-mincho text-[15px] leading-5 font-bold">{f?.nome || 'Sem ficha ainda'}</span>
											<span class="text-xs leading-4 text-mut">{j.nome}</span>
										</span>
										{#if f?.status === 'aprovada'}
											<span class="t-num text-lg">NV {f.nivel}</span>
											<span class="text-xs leading-4 max-lg:hidden">{rankSugerido(f.nivel)}</span>
											<span class="t-num flex gap-3 text-xs">
												<span>PV {f.resumo.pv ?? '—'}</span><span>PC {f.resumo.pc ?? '—'}</span><span>PE {f.resumo.pe ?? '—'}</span>
											</span>
										{/if}
										{#if f}<SeloStatus status={f.status} />{:else}<span class="text-[13px] text-mut">Entrou {tempoRelativo(j.entrou_em)}</span>{/if}
									</svelte:element>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="flex flex-col items-center gap-2 p-6 text-center">
							<span class="text-[15px] font-semibold">Nenhum jogador ainda.</span>
							{#if !arquivada}<a href="/campanhas/{c.id}/membros?convidar=1" class="link text-sm font-semibold">Convidar o grupo</a>{/if}
						</div>
					{/if}
				</section>
			</div>

			<div class="flex min-w-0 flex-col gap-5">
				{#if mostrarPassos}
					<section class="painel-sombra" aria-label="Primeiros passos">
						{@render cabeca(`Primeiros passos · ${passos.filter((p) => p.feito).length} de ${passos.length}`)}
						<ul class="m-0 flex list-none flex-col p-0">
							{#each passos as p (p.nome)}
								<li>
									{#if p.href}
										<a href={p.href} class="flex min-h-12 items-center gap-2.5 border-b-2 border-b3 px-3.5 hover:bg-b3">
											{@render marca(p.feito)}
											<span class="flex-1 text-[15px] leading-5 font-medium" class:line-through={p.feito} class:text-mut={p.feito}>{p.nome}</span>
											<span class="font-pixel text-sm font-bold text-mut" aria-hidden="true">▸</span>
										</a>
									{:else}
										<div class="flex min-h-12 items-center gap-2.5 border-b-2 border-b3 px-3.5 last:border-b-0" title="Chega em um próximo lote">
											{@render marca(false)}
											<span class="flex-1 text-[15px] leading-5 font-medium text-mut">{p.nome}</span>
											<span class="font-pixel text-[11px] tracking-[0.06em] text-mut">EM BREVE</span>
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if data.convites.length}
					<section class="painel-sombra" aria-label="Convites pendentes">
						{@render cabeca(`Convites pendentes · ${data.convites.length}`)}
						<ul class="m-0 flex list-none flex-col p-0">
							{#each data.convites as cv (cv.id)}
								<li class="flex items-center gap-2 border-b-2 border-b3 px-3.5 py-2.5 last:border-b-0">
									<span class="flex min-w-0 flex-1 flex-col">
										<span class="truncate text-sm leading-5 font-semibold">{destinoConvite(cv)}</span>
										<span class="text-xs leading-4 text-mut">{validadeConvite(cv)}</span>
									</span>
									{#if cv.tipo === 'email'}
										<button type="button" class="link text-[13px] font-semibold" onclick={() => reenviarConvite(cv.id)}>Reenviar</button>
									{:else}
										<button type="button" class="link text-[13px] font-semibold" onclick={() => copiarConvite(cv)}>Copiar</button>
									{/if}
									<button type="button" class="link text-[13px] font-semibold text-err" onclick={() => revogarConvite(cv.id)}>Revogar</button>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{@render atividade()}

				<section class="painel-sombra" aria-label="NPCs recentes">
					{@render cabeca('NPCs recentes')}
					<p class="m-0 p-3.5 text-sm leading-5 text-mut">Os NPCs da campanha chegam em um próximo lote.</p>
				</section>
			</div>
		</div>
	</main>
{:else}
	<!-- ================================================================ C4 · Jogador -->
	<main class="grid min-w-0 items-start gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
		<div class="flex min-w-0 flex-col gap-5">
			<section class="painel-sombra" aria-label="Meu personagem">
				{@render cabeca('Meu personagem')}
				{#if !minha}
					<div class="flex items-center gap-5 p-5 max-sm:flex-col max-sm:items-start md:p-7">
						<Icone id="acao/ic-acao-criar-personagem" tamanho={96} />
						<div class="flex flex-col gap-2">
							<h3 class="m-0 font-mincho text-2xl leading-8 font-bold">Crie seu personagem</h3>
							<p class="m-0 text-[15px] leading-[23px] text-mut">12 passos com as contas feitas para você. {aprovacaoFichas ? 'O Mestre revisa antes da primeira sessão.' : 'Nesta campanha a ficha entra direto na mesa.'}</p>
							<button type="button" class="btn-jogo btn-primario mt-1 min-h-12 self-start" disabled={arquivada || criando} aria-busy={criando} onclick={criarPersonagem}>
								{#if criando}<Girando />{/if}CRIAR PERSONAGEM
							</button>
						</div>
					</div>
				{:else}
					{@const r = minha.resumo}
					<div class="flex items-start gap-[18px] p-4 max-sm:flex-col">
						<Retrato nome={minha.nome || '?'} foto={minha.retrato} tamanho={128} class="max-sm:hidden" />
						<div class="flex min-w-0 flex-1 flex-col gap-2">
							<div class="flex flex-wrap items-center gap-2.5">
								<span class="font-mincho text-[28px] leading-9 font-bold max-sm:text-2xl">{minha.nome || 'Personagem sem nome'}</span>
								<SeloStatus status={minha.status} />
							</div>
							<span class="flex items-center gap-2 text-sm leading-5 font-semibold">
								<IconeCla resumo={r} />
								{#if r.vila}<Icone id="vila/ic-vila-{r.vila}" alt="Vila" />{/if}
								Nível {minha.nivel} · {rankSugerido(minha.nivel)}
							</span>
							{#if r.pv}
								{@const est = (minha.estado ?? {}) as { pv?: number; pc?: number; pe?: number }}
								<div class="mt-1 grid grid-cols-3 gap-3">
									{#each [barra(r.pv, 'var(--vermelhao)', '#E07A5F'), barra(r.pc, '#2D7FB8', '#7FD3E6'), barra(r.pe, '#D29A1E', '#F2C14E')] as b, i (i)}
										{@const atual = [est.pv, est.pc, est.pe][i] ?? b.valor}
										<div class="flex flex-col gap-1">
											<span class="t-num text-[13px]">{['PV', 'PC', 'PE'][i]} {atual}/{b.valor}</span>
											<div class="h-3 border-2 border-ink bg-b3"><div class="h-full" style:width="{Math.max(0, Math.min(100, (atual / Math.max(1, b.valor)) * 100))}%" style:background={b.cor} style:box-shadow="inset 0 2px 0 {b.brilho}"></div></div>
										</div>
									{/each}
								</div>
							{/if}
							{#if minha.status === 'aprovada'}<span class="t-num text-[13px] text-mut">{numero(minha.xp)} XP · {minha.pt} PT</span>{/if}
						</div>
					</div>
					{#if minha.status === 'em_revisao'}
						<ol class="m-0 mx-4 mb-4 flex list-none flex-wrap items-center gap-y-2 p-0 text-xs leading-4 font-semibold">
							{#each [['Enviada · ' + dataCurta(minha.enviada_em ?? minha.atualizada_em), 'var(--ok)', ''], ['Em revisão pelo Mestre', 'var(--warn)', ''], ['Aprovação', 'transparent', 'text-mut']] as [t, cor, classe], i (i)}
								<li class="flex flex-1 items-center gap-1.5">
									<span class="h-6 w-6 flex-none border-2 border-ink" style:background={cor}></span><span class={classe}>{t}</span>
									{#if i < 2}<span class="mx-2 h-1 flex-1 bg-b3"></span>{/if}
								</li>
							{/each}
						</ol>
					{:else if minha.status === 'ajustes'}
						<div class="mx-4 mb-4">
							<Alerta tipo="info" titulo="{data.membros.find((m) => m.papel === 'mestre')?.nome ?? 'O Mestre'} pediu ajustes">
								{#if minha.comentario_mestre}<span>“{minha.comentario_mestre}”</span>{/if}
							</Alerta>
						</div>
					{:else if minha.status === 'aprovada' && progressoXp(minha.nivel, minha.xp).podeSubir && !arquivada}
						<div class="mx-4 mb-4 flex flex-wrap items-center gap-3 border-2 border-acc bg-[rgba(217,168,43,.14)] py-2 pr-3 pl-1.5">
							<Icone id="acao/ic-acao-subir-nivel" />
							<span class="min-w-[200px] flex-1 text-[15px] leading-[22px] font-semibold">Nível {minha.nivel + 1} disponível · +5 PV, +3 PC, +3 PE, +3 PT</span>
							<a href={hrefNivel(c.id, minha.id)} class="btn-jogo btn-primario text-[13px]">SUBIR DE NÍVEL</a>
						</div>
					{/if}
					<div class="flex justify-end border-t-2 border-b3 px-4 py-3">
						<a href={minha.status === 'rascunho' || minha.status === 'ajustes' ? hrefEditar(c.id, minha.id) : hrefFicha(c.id, minha.id)} class="btn-jogo {minha.status === 'ajustes' ? 'btn-secundario' : 'btn-primario'}">
							{minha.status === 'rascunho' ? 'CONTINUAR FICHA' : minha.status === 'ajustes' ? 'REVISAR FICHA' : 'ABRIR FICHA'}
						</a>
					</div>
				{/if}
			</section>

			<section class="painel-sombra" aria-label="Grupo">
				{@render cabeca('Grupo')}
				<ul class="m-0 grid list-none gap-2.5 p-3.5 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.membros.filter((m) => m.id !== eu) as m (m.id)}
						{@const f = m.papel === 'jogador' ? data.grupo.find((g) => g.jogador_id === m.id && g.situacao === 'ativo') : undefined}
						<li class="flex items-center gap-2.5 border-2 border-b3 bg-b1 p-2.5">
							<Retrato nome={f?.nome || m.nome} foto={f?.retrato} tamanho={40} />
							<div class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate font-mincho text-[15px] leading-5 font-bold">{f?.nome || m.nome}</span>
								<span class="flex items-center gap-1 text-xs leading-4 text-mut">
									{#if m.papel === 'mestre'}Mestre · {m.nome}{:else if f}
										<IconeCla resumo={f.resumo} />NV {f.nivel} · {m.nome}
									{:else}{m.nome} · sem ficha aprovada{/if}
								</span>
							</div>
						</li>
					{:else}
						<li class="text-sm text-mut">Só você por enquanto.</li>
					{/each}
				</ul>
			</section>
		</div>

		<div class="flex min-w-0 flex-col gap-5">
			<section class="painel-sombra" aria-label="Minhas submissões">
				{@render cabeca('Minhas submissões')}
				<ul class="m-0 flex list-none flex-col p-0">
					{#each [['status/ic-status-rascunho', 'Rascunhos', 'rascunho'], ['status/ic-status-em-revisao', 'Em revisão', 'em_revisao'], ['status/ic-status-ajustes', 'Ajustes solicitados', 'ajustes'], ['status/ic-status-aprovado', 'Aprovadas', 'aprovada']] as [icone, nome, s] (nome)}
						<li class="flex items-center gap-2.5 border-b-2 border-b3 px-3.5 py-1.5 last:border-b-0">
							<Icone id={icone} /><span class="flex-1 text-sm leading-5 font-medium">{nome}</span><span class="t-num text-base">{contagem(s)}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="painel-sombra flex flex-col gap-2 p-3.5" aria-label="Sobre a campanha">
				<h2 class="t-rotulo m-0">Sobre a campanha</h2>
				<p class="m-0 text-sm leading-[21px] whitespace-pre-line">{c.premissa || 'O Mestre ainda não escreveu a premissa.'}</p>
				<span class="mt-1.5 font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">REGRAS DA MESA</span>
				{#if c.regras_mesa.trim()}
					<div class="texto-regras text-sm leading-[21px]">{@html regrasEmHtml(c.regras_mesa)}</div>
				{:else}
					<p class="m-0 text-sm leading-[21px] text-mut">Sem regras da mesa por enquanto.</p>
				{/if}
				<span class="mt-1.5 text-[13px] text-mut">{nomeEra(c)} · nível inicial {c.nivel_inicial} · Mestre: {data.membros.find((m) => m.papel === 'mestre')?.nome ?? '—'}</span>
			</section>

			<nav aria-label="Biblioteca" class="grid grid-cols-3 gap-2">
				{#each [['/regras/clas', 'nav/ic-nav-clas', 'Clãs'], ['/regras/jutsus', 'nav/ic-nav-jutsus', 'Jutsus'], ['/regras/equipamentos', 'nav/ic-nav-equipamentos', 'Equipamentos']] as [href, icone, nome] (href)}
					<a {href} class="painel cartao-link flex flex-col items-center gap-1.5 px-1.5 py-3 text-fg">
						<Icone id={icone} /><span class="text-[13px] leading-[18px] font-semibold">{nome}</span>
					</a>
				{/each}
			</nav>

			{#if !arquivada}
				<button type="button" class="link self-start text-[13px] font-semibold text-err" onclick={() => (confirmandoSaida = true)}>Sair da campanha</button>
			{/if}
		</div>
	</main>
{/if}

{#snippet marca(feito: boolean)}
	<span class="t-num flex h-6 w-6 flex-none items-center justify-center border-2 text-[13px] {feito ? 'border-ink bg-ok text-okfg' : 'border-field bg-b1'}" aria-label={feito ? 'Feito' : 'A fazer'}>{feito ? '✓' : ''}</span>
{/snippet}

{#if recompensando}
	<ModalRecompensas campanha={c.id} fichas={ativas.map((p) => ({ id: p.id, nome: p.nome, nivel: p.nivel, xp: p.xp, cla: p.resumo.cla, claNome: p.resumo.claNome, claBrasao: p.resumo.claBrasao }))} aoFechar={() => (recompensando = false)} />
{/if}

{#if confirmandoSaida}
	<Modal rotulo="Sair da campanha" largura={480} aoFechar={() => !saindo && (confirmandoSaida = false)}>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="t-h3 m-0">Sair de {c.nome}?</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">Você deixa de ver a campanha. Para voltar, vai precisar de um novo convite do Mestre.</p>
			<Alerta tipo="aviso" titulo="Personagens e criações nesta campanha ficam com o Mestre." />
			<div class="flex flex-wrap justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={saindo} onclick={() => (confirmandoSaida = false)}>CANCELAR</button>
				<button type="button" class="btn-jogo bg-err text-errfg" disabled={saindo} aria-busy={saindo} onclick={sair}>{#if saindo}<Girando />{/if}SAIR</button>
			</div>
		</div>
	</Modal>
{/if}
