<script lang="ts">
	// C3 · Painel do Mestre e C4 · Painel do Jogador. Widgets que dependem de fichas, submissões e NPCs
	// mostram o estado vazio até os próximos lotes.
	import { goto, invalidateAll } from '$app/navigation';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import { nomeEra, rankSugerido } from '#lib/campanhas/dominio.ts';
	import { regrasEmHtml } from '#lib/campanhas/texto.ts';
	import { copiarConvite, destinoConvite, reenviarConvite, revogarConvite, validadeConvite } from '#lib/campanhas/convites.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { tempoRelativo } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.campanha);
	const mestre = $derived(data.papel === 'mestre');
	const jogadores = $derived(data.membros.filter((m) => m.papel === 'jogador'));
	const arquivada = $derived(!!c.arquivada_em);
	const SEM_FICHAS = 'Chega com as fichas de personagem, no próximo lote';

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
		await invalidateAll();
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
		await goto('/campanhas', { invalidateAll: true });
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
			<img src="/covers/{c.capa}-256.png" width="512" height="192" alt="" class="flex-none border-r-2 border-ink [image-rendering:pixelated] max-xl:w-[384px] max-xl:object-cover" />
			<div class="flex flex-1 flex-col gap-2.5 py-[18px] pr-[18px]">
				<span class="font-mincho text-[30px] leading-[38px] font-bold">{c.nome}</span>
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm leading-5 font-semibold text-mut">
					<span>{nomeEra(c)}</span>
					<span>{jogadores.length === 1 ? '1 jogador' : `${jogadores.length} jogadores`}</span>
					<span>Nível inicial <b class="t-num text-[15px] text-fg">{c.nivel_inicial}</b> · {rankSugerido(c.nivel_inicial)}</span>
				</div>
				<span class="flex-1"></span>
				<div class="flex flex-wrap gap-2">
					<button type="button" class="btn-jogo btn-primario com-icone text-[13px]" disabled title={SEM_FICHAS}><Icone id="acao/ic-acao-conceder" />CONCEDER RECOMPENSAS</button>
					{#if !arquivada}<a href="/campanhas/{c.id}/membros?convidar=1" class="btn-jogo btn-contorno com-icone text-[13px]"><Icone id="acao/ic-acao-convidar" />CONVIDAR</a>{/if}
					<a href="/campanhas/{c.id}/configuracoes" class="btn-jogo btn-fantasma com-icone text-[13px]"><Icone id="nav/ic-nav-configuracoes" />CONFIGURAÇÕES</a>
				</div>
			</div>
		</div>
		<button type="button" class="btn-jogo btn-primario com-icone md:hidden" disabled title={SEM_FICHAS}><Icone id="acao/ic-acao-conceder" />CONCEDER RECOMPENSAS</button>

		<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
			<div class="flex min-w-0 flex-col gap-5">
				<section class="border-2 border-[#8B2E20] bg-b2 sombra-painel" aria-label="Aguardando sua revisão">
					<div class="flex items-center gap-2.5 bg-grena px-3.5 py-2.5 text-papel">
						<Icone id="nav/ic-nav-aprovacoes" />
						<h2 class="m-0 flex-1 font-pixel text-sm leading-none font-bold tracking-[0.1em]">AGUARDANDO SUA REVISÃO · 0</h2>
					</div>
					<div class="flex flex-col items-center gap-2.5 p-6 text-center">
						<img src="/illustrations/il-cha-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
						<span class="text-base leading-[22px] font-semibold">Nada para revisar. Hora do chá, Mestre.</span>
						<span class="text-[13px] leading-[18px] text-mut">Fichas, clãs, jutsus e pedidos de treino aparecem aqui quando os jogadores enviarem.</span>
					</div>
				</section>

				<section class="painel-sombra" aria-label="Grupo">
					{@render cabeca('Grupo')}
					{#if jogadores.length}
						<ul class="m-0 flex list-none flex-col p-0">
							{#each jogadores as j, i (j.id)}
								<li class="flex items-center gap-2.5 border-b-2 border-b3 px-3.5 py-2 last:border-b-0" style:background={i % 2 ? 'var(--b1)' : undefined}>
									<Retrato nome={j.nome} tamanho={40} />
									<div class="flex min-w-0 flex-1 flex-col">
										<span class="truncate text-[15px] leading-5 font-semibold">{j.nome}</span>
										<span class="text-xs leading-4 text-mut">Entrou {tempoRelativo(j.entrou_em)}</span>
									</div>
									<span class="text-[13px] leading-[18px] text-mut">Ficha ainda não criada</span>
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
				<div class="flex items-center gap-5 p-5 max-sm:flex-col max-sm:items-start md:p-7">
					<Icone id="acao/ic-acao-criar-personagem" tamanho={96} />
					<div class="flex flex-col gap-2">
						<h3 class="m-0 font-mincho text-2xl leading-8 font-bold">Crie seu personagem</h3>
						<p class="m-0 text-[15px] leading-[23px] text-mut">11 passos com as contas feitas para você. O Mestre revisa antes da primeira sessão.</p>
						<button type="button" class="btn-jogo btn-primario mt-1 min-h-12 self-start" disabled aria-describedby="cp-breve">CRIAR PERSONAGEM</button>
						<span id="cp-breve" class="text-xs leading-4 text-mut">A criação de personagem chega no próximo lote.</span>
					</div>
				</div>
			</section>

			<section class="painel-sombra" aria-label="Grupo">
				{@render cabeca('Grupo')}
				<ul class="m-0 grid list-none gap-2.5 p-3.5 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.membros as m (m.id)}
						<li class="flex items-center gap-2.5 border-2 border-b3 bg-b1 p-2.5">
							<Retrato nome={m.nome} tamanho={40} />
							<div class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate font-mincho text-[15px] leading-5 font-bold">{m.nome}{m.id === sessao.usuario?.id ? ' (você)' : ''}</span>
								<span class="text-xs leading-4 text-mut">{m.papel === 'mestre' ? 'Mestre' : 'Sem personagem ainda'}</span>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		</div>

		<div class="flex min-w-0 flex-col gap-5">
			<section class="painel-sombra" aria-label="Minhas submissões">
				{@render cabeca('Minhas submissões')}
				<ul class="m-0 flex list-none flex-col p-0">
					{#each [['status/ic-status-rascunho', 'Rascunhos'], ['status/ic-status-em-revisao', 'Em revisão'], ['status/ic-status-ajustes', 'Ajustes solicitados'], ['status/ic-status-aprovado', 'Aprovadas']] as [icone, nome] (nome)}
						<li class="flex items-center gap-2.5 border-b-2 border-b3 px-3.5 py-1.5 last:border-b-0">
							<Icone id={icone} /><span class="flex-1 text-sm leading-5 font-medium">{nome}</span><span class="t-num text-base">0</span>
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
