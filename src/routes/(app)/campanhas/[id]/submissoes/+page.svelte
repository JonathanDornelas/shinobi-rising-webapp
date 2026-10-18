<script lang="ts">
	// R3 · Minhas submissões: lista à esquerda, a submissão aberta à direita com a linha do tempo e as ações
	// (retirar da revisão, editar e reenviar).
	import { refreshAll } from '$app/navigation';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { STATUS_CRIACAO } from '#lib/jutsus/status.ts';
	import { STATUS_FICHA } from '#lib/personagem/status.ts';
	import { dataCurta, tempoRelativo } from '#lib/formatar.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { StatusCriacao, StatusFicha } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';
	import type { Submissao } from './+page.server.ts';

	let { data }: PageProps = $props();
	const lista = $derived(data.submissoes as Submissao[]);
	let selecionado = $state<string | null>(null);
	const atual = $derived(lista.find((s) => s.chave === selecionado) ?? lista[0] ?? null);
	const badge = (s: Submissao) => (s.tipo === 'ficha' ? STATUS_FICHA[s.status as StatusFicha] : STATUS_CRIACAO[s.status as StatusCriacao]) ?? STATUS_CRIACAO.rascunho;
	const COR = { ok: 'var(--ok)', info: 'var(--info)', err: 'var(--err)', pendente: 'transparent' } as const;
	const quando = (d: string) => (/^\d{4}-/.test(d) ? dataCurta(d) : d);
	let ocupado = $state(false);

	async function retirar(s: Submissao) {
		ocupado = true;
		const rpc =
			s.tipo === 'ficha'
				? supabase().rpc('retirar_ficha', { ficha: s.id })
				: s.tipo === 'cla'
					? supabase().rpc('retirar_cla', { cla: s.id })
					: s.tipo === 'jutsu' || s.tipo === 'habilidade'
						? supabase().rpc('retirar_jutsu', { jutsu: s.id })
						: supabase().rpc('retirar_equipamento', { equipamento: s.id });
		const { error } = await rpc;
		ocupado = false;
		if (error) return toasts.mostrar('Não foi possível retirar. O Mestre pode já ter decidido.', 'erro');
		toasts.mostrar('De volta para rascunho.', 'info');
		await refreshAll();
	}
	const hrefEdicao = (s: Submissao) => (s.tipo === 'ficha' ? `${s.href}/editar` : s.href);
</script>

<main class="grid min-w-0 items-start gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_520px]">
	<div class="flex min-w-0 flex-col gap-3">
		<h1 class="m-0 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Minhas submissões</h1>
		{#if lista.length}
			<ul class="m-0 list-none border-2 border-frame bg-b2 p-0">
				{#each lista as s (s.chave)}
					{@const on = atual?.chave === s.chave}
					{@const b = badge(s)}
					<li>
						<button type="button" class="flex w-full items-center gap-2.5 border-b-2 border-b3 px-3 py-2 text-left {on ? 'bg-grena text-papel shadow-[inset_4px_0_0_var(--vermelhao)]' : 'hover:bg-b3'}" aria-current={on || undefined} onclick={() => (selecionado = s.chave)}>
							<Icone id={s.icone} />
							<span class="flex min-w-0 flex-1 flex-col">
								<span class="truncate text-[15px] leading-5 font-semibold">{s.titulo}</span>
								<span class="text-xs leading-4 opacity-75">{s.rotuloTipo}{s.versao > 1 ? ` · v${s.versao}` : ''} · {tempoRelativo(s.quando)}</span>
							</span>
							{#if s.status === 'ajustes' && s.comentario}<span class="bg-vermelhao px-1.5 py-1 font-pixel text-xs font-bold text-white" title="Comentário do Mestre">1</span>{/if}
							<span class="inline-flex h-8 items-center gap-0.5 border-2 border-ink pr-1.5 text-xs leading-none font-semibold {b.classe}"><Icone id={b.icone} class="h-7 w-7" />{b.rotulo}</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
				<Icone id="nav/ic-nav-submissoes" tamanho={64} />
				<span class="text-[15px] font-semibold">Você ainda não enviou nada nesta campanha.</span>
				<span class="text-sm text-mut">Fichas, clãs, jutsus, equipamentos e pedidos de PT aparecem aqui com o andamento da revisão.</span>
			</div>
		{/if}
	</div>

	{#if atual}
		{@const s = atual}
		<section class="flex flex-col border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)] xl:sticky xl:top-4" aria-label="Detalhe da submissão">
			<header class="flex flex-col gap-1 border-b-2 border-b3 px-4 py-3.5">
				<span class="font-mincho text-xl leading-[26px] font-bold">{s.titulo}</span>
				<span class="text-[13px] leading-[18px] text-mut">{s.rotuloTipo}{s.versao > 1 ? ` · v${s.versao}` : ''}</span>
			</header>
			<div class="flex flex-col gap-3 px-4 py-3.5">
				{#if s.excecao}<Alerta tipo="aviso" titulo="Exceção do Mestre"><span>“{s.excecao}”</span></Alerta>{/if}
				{#if s.comentario && (s.status === 'ajustes' || s.status === 'rejeitado' || s.status === 'rejeitada')}<Alerta tipo={s.status === 'ajustes' ? 'info' : 'erro'} titulo="Comentário do Mestre"><span>“{s.comentario}”</span></Alerta>{/if}
				<ol class="m-0 list-none p-0">
					{#each s.eventos as e, n (n)}
						{@const [data_, texto] = e.detalhe.split('|')}
						<li class="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
							<span class="flex flex-col items-center">
								<span class="mt-0.5 h-5 w-5 border-2" style:background={COR[e.cor]} style:border-color={e.cor === 'pendente' ? 'var(--b3)' : 'var(--ink)'}></span>
								{#if n < s.eventos.length - 1}<span class="min-h-3.5 w-1 flex-1 bg-b3"></span>{/if}
							</span>
							<span class="flex flex-col gap-0.5 pb-3">
								<span class="text-sm leading-5 font-semibold" class:text-mut={e.cor === 'pendente'}>{e.nome}</span>
								<span class="text-xs leading-4 text-mut">{quando(data_)}{texto ? ` · ${texto}` : ''}</span>
							</span>
						</li>
					{/each}
				</ol>
			</div>
			<footer class="flex flex-wrap justify-end gap-2 border-t-2 border-b3 px-4 py-3">
				{#if s.status === 'em_revisao' && s.tipo !== 'pt'}<button type="button" class="btn-jogo btn-fantasma text-[13px]" disabled={ocupado} onclick={() => retirar(s)}>RETIRAR</button>{/if}
				{#if s.href && (s.status === 'ajustes' || s.status === 'rascunho')}<a href={hrefEdicao(s)} class="btn-jogo btn-secundario text-[13px]">{s.status === 'ajustes' ? 'EDITAR E REENVIAR' : 'CONTINUAR'}</a>{:else if s.href}<a href={s.href} class="btn-jogo btn-contorno text-[13px]">ABRIR</a>{/if}
			</footer>
		</section>
	{/if}
</main>
