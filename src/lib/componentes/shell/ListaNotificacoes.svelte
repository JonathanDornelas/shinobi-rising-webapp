<script lang="ts">
	// G3 · Lista de notificações (dropdown no desktop, página no mobile).
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { tempoRelativo } from '#lib/formatar.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		aoAbrir?: () => void;
		/** Itens maiores, para a página do mobile. */
		pagina?: boolean;
	}
	let { aoAbrir, pagina = false }: Props = $props();

	let filtro = $state<'todas' | 'naoLidas'>('todas');
	const lista = $derived(filtro === 'todas' ? sessao.notificacoes : sessao.notificacoes.filter((n) => !n.lida));
</script>

<div class="flex items-center gap-2.5 border-b-2 border-b3 {pagina ? 'px-4 py-2.5' : 'px-3.5 py-3'}">
	{#if !pagina}<span class="t-rotulo flex-1">Notificações</span>{/if}
	<div class="alternancia">
		<button type="button" class={pagina ? 'min-h-10' : 'min-h-8'} aria-pressed={filtro === 'todas'} onclick={() => (filtro = 'todas')}>Todas</button>
		<button type="button" class={pagina ? 'min-h-10' : 'min-h-8'} aria-pressed={filtro === 'naoLidas'} onclick={() => (filtro = 'naoLidas')}>Não lidas</button>
	</div>
	{#if pagina}
		<span class="flex-1"></span>
		<button type="button" class="link text-[13px] font-semibold" onclick={() => sessao.marcarTodasLidas()}>Marcar todas</button>
	{/if}
</div>

{#if sessao.carregandoNotificacoes && !sessao.notificacoes.length}
	<div class="pulso flex flex-col gap-3.5 px-3.5 py-3" aria-busy="true" aria-label="Carregando notificações">
		{#each [100, 80] as w (w)}
			<div class="flex gap-2.5"><div class="esqueleto h-8 w-8"></div><div class="flex flex-1 flex-col gap-1.5"><div class="esqueleto h-3" style:width="{w}%"></div><div class="esqueleto h-2.5 w-1/4"></div></div></div>
		{/each}
	</div>
{:else if sessao.notificacoesErro}
	<div class="flex items-center gap-2.5 px-3.5 py-4 text-sm font-semibold">
		<Icone id="status/ic-status-rejeitado" />Não foi possível carregar.<span class="flex-1"></span>
		<button type="button" class="btn-jogo btn-erro" onclick={() => sessao.carregarNotificacoes()}>Tentar de novo</button>
	</div>
{:else if !lista.length}
	<div class="flex flex-col items-center gap-2.5 px-5 py-7 text-center">
		<Icone id="nav/ic-nav-notificacoes" tamanho={96} />
		<span class="text-base leading-[22px] font-semibold">{filtro === 'todas' ? 'Nenhum corvo mensageiro por aqui.' : 'Nada novo. Tudo lido.'}</span>
	</div>
{:else}
	<ul class="m-0 flex list-none flex-col p-0 {pagina ? '' : 'max-h-[430px] overflow-y-auto'}">
		{#each lista as n (n.id)}
			<li class="border-b-2 border-b3 last:border-b-0">
				<a
					href={n.href ?? '/notificacoes'}
					class="flex items-start gap-2.5 hover:bg-b3 {pagina ? 'px-4 py-3' : 'px-3.5 py-2.5'}"
					style:background={n.lida ? undefined : 'rgba(196,69,54,.08)'}
					onclick={() => {
						sessao.marcarLida(n.id);
						aoAbrir?.();
					}}
				>
					<Icone id={n.icone} />
					<span class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="{pagina ? 'text-[15px] leading-[21px]' : 'text-sm leading-5'} {n.lida ? 'font-normal' : 'font-semibold'}">{n.texto}</span>
						<span class="text-xs leading-4 text-mut">{tempoRelativo(n.criada_em)}</span>
					</span>
					{#if !n.lida}<span class="mt-1.5 h-2.5 w-2.5 flex-none bg-vermelhao" aria-label="Não lida"></span>{/if}
				</a>
			</li>
		{/each}
	</ul>
{/if}
