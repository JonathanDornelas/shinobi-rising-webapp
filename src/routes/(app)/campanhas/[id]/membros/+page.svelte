<script lang="ts">
	// C5 · Membros e convites: lista do grupo, modal Convidar e tabela de convites (Mestre).
	import { onMount } from 'svelte';
	import { invalidateAll, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import ModalConvidar from '#lib/componentes/campanha/ModalConvidar.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import { PAPEL } from '#lib/campanhas/dominio.ts';
	import { copiarConvite, destinoConvite, reenviarConvite, revogarConvite, situacaoConvite } from '#lib/campanhas/convites.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { dataCurta } from '#lib/formatar.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.campanha);
	const mestre = $derived(data.papel === 'mestre');
	const podeConvidar = $derived(mestre && !c.arquivada_em);

	let convidando = $state(false);
	onMount(() => {
		if (page.url.searchParams.get('convidar') && podeConvidar) {
			convidando = true;
			const url = new URL(page.url.href);
			url.searchParams.delete('convidar');
			replaceState(url, {});
		}
	});

	// menu ⋯ de cada jogador
	let menu = $state<string | null>(null);
	let removendo = $state<{ id: string; nome: string } | null>(null);
	let ocupado = $state(false);

	async function remover() {
		if (!removendo) return;
		ocupado = true;
		const { error } = await supabase().from('membros').delete().eq('campanha_id', c.id).eq('usuario_id', removendo.id);
		ocupado = false;
		if (error) toasts.mostrar('Não foi possível remover. Tente de novo.', 'erro');
		else toasts.mostrar(`${removendo.nome} saiu da campanha.`, 'info');
		removendo = null;
		await invalidateAll();
	}

	const ST = {
		pendente: { nome: 'PENDENTE', classe: 'bg-warn text-warnfg border-ink' },
		aceito: { nome: 'ACEITO', classe: 'bg-ok text-okfg border-ink' },
		recusado: { nome: 'RECUSADO', classe: 'border-b3 text-fg' },
		expirado: { nome: 'EXPIRADO', classe: 'border-b3 text-mut' },
		esgotado: { nome: 'ESGOTADO', classe: 'border-b3 text-mut' },
		revogado: { nome: 'REVOGADO', classe: 'border-[#5E6B73] text-mut line-through' }
	} as const;
	const convites = $derived(data.convites.map((cv) => ({ ...cv, situacao: situacaoConvite(cv) })));
</script>

<svelte:window onclick={(e) => menu && !(e.target as HTMLElement).closest('[data-menu]') && (menu = null)} />

<main class="flex min-w-0 flex-col gap-4 p-4 md:p-6">
	<div class="flex items-center gap-3">
		<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Membros · {data.membros.length}</h1>
		{#if podeConvidar}
			<button type="button" class="btn-jogo btn-primario com-icone" onclick={() => (convidando = true)}><Icone id="acao/ic-acao-convidar" />CONVIDAR</button>
		{/if}
	</div>

	<ul class="painel m-0 flex list-none flex-col p-0" aria-label="Membros">
		{#each data.membros as m (m.id)}
			<li class="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b-2 border-b3 px-3.5 py-2 last:border-b-0 md:grid-cols-[40px_minmax(0,1fr)_140px_200px_150px_44px]">
				<Retrato nome={m.nome} tamanho={40} />
				<span class="flex min-w-0 flex-col">
					<span class="truncate text-[15px] leading-5 font-semibold">{m.nome}{m.id === sessao.usuario?.id ? ' (você)' : ''}</span>
					<span class="text-xs leading-4 text-mut md:hidden">{PAPEL[m.papel].nome} · {m.papel === 'mestre' ? 'criou' : 'entrou'} em {dataCurta(m.entrou_em)}</span>
				</span>
				<span
					class="inline-flex h-9 items-center gap-1 justify-self-start border-2 pr-2.5 text-[13px] leading-none font-semibold max-md:hidden {m.papel === 'mestre'
						? 'border-[#8B2E20] bg-grena text-papel'
						: 'border-mut bg-b2'}"><Icone id={PAPEL[m.papel].icone} />{PAPEL[m.papel].nome}</span
				>
				<span class="text-sm leading-5 text-mut max-md:hidden">{m.papel === 'mestre' ? '—' : 'Sem personagem'}</span>
				<span class="text-[13px] leading-[18px] text-mut max-md:hidden">{m.papel === 'mestre' ? 'criou' : 'entrou'} em {dataCurta(m.entrou_em)}</span>
				<div class="relative justify-self-end" data-menu>
					{#if mestre && m.papel === 'jogador' && !c.arquivada_em}
						<button type="button" class="btn-icone" aria-label="Ações para {m.nome}" aria-haspopup="menu" aria-expanded={menu === m.id} onclick={() => (menu = menu === m.id ? null : m.id)}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="10" width="4" height="4" /><rect x="10" y="10" width="4" height="4" /><rect x="17" y="10" width="4" height="4" /></svg>
						</button>
						{#if menu === m.id}
							<div role="menu" class="camada absolute top-12 right-0 z-20 flex w-60 flex-col py-1.5">
								<a role="menuitem" href="/campanhas/{c.id}/configuracoes#perigo" class="flex min-h-11 items-center px-3.5 text-[15px] hover:bg-b3">Passar o papel de Mestre</a>
								<button type="button" role="menuitem" class="flex min-h-11 items-center px-3.5 text-left text-[15px] text-err hover:bg-b3" onclick={() => ((removendo = { id: m.id, nome: m.nome }), (menu = null))}>
									Remover da campanha
								</button>
							</div>
						{/if}
					{/if}
				</div>
			</li>
		{/each}
	</ul>

	{#if mestre}
		<section class="flex flex-col gap-2.5" aria-labelledby="titulo-convites">
			<h2 id="titulo-convites" class="t-rotulo m-0 mt-4">Convites</h2>
			{#if !convites.length}
				<div class="flex flex-col items-center gap-2 border-2 border-dashed border-b3 p-8 text-center">
					<span class="text-[15px] font-semibold">Nenhum convite ainda.</span>
					{#if podeConvidar}<button type="button" class="link text-sm font-semibold" onclick={() => (convidando = true)}>Convidar jogadores</button>{/if}
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full min-w-[640px] border-collapse border-2 border-frame bg-b1 text-[15px] leading-[22px]">
						<thead>
							<tr class="bg-vermelhao font-pixel text-[13px] leading-[18px] tracking-[0.06em] text-white">
								<th class="px-3 py-2.5 text-left font-bold">DESTINO</th>
								<th class="px-3 py-2.5 text-left font-bold">ENVIADO</th>
								<th class="px-3 py-2.5 text-left font-bold">EXPIRA</th>
								<th class="px-3 py-2.5 text-left font-bold">STATUS</th>
								<th class="px-3 py-2.5"><span class="sr-only">Ações</span></th>
							</tr>
						</thead>
						<tbody>
							{#each convites as cv, i (cv.id)}
								<tr style:background={i % 2 ? 'var(--b2)' : undefined}>
									<td class="px-3 py-2 font-semibold">{destinoConvite(cv)}</td>
									<td class="px-3 py-2">{dataCurta(cv.criado_em)}</td>
									<td class="px-3 py-2">{cv.expira_em && cv.situacao === 'pendente' ? dataCurta(cv.expira_em) : '—'}</td>
									<td class="px-3 py-2">
										<span class="border-2 px-[7px] py-[5px] font-pixel text-xs leading-none font-bold tracking-[0.06em] {ST[cv.situacao].classe}">{ST[cv.situacao].nome}</span>
									</td>
									<td class="px-3 py-2 text-right">
										<div class="flex justify-end gap-3 text-[13px] leading-[18px] font-semibold">
											{#if cv.situacao === 'pendente' && !c.arquivada_em}
												{#if cv.tipo === 'email'}
													<button type="button" class="link" onclick={() => reenviarConvite(cv.id)}>Reenviar</button>
												{:else}
													<button type="button" class="link" onclick={() => copiarConvite(cv)}>Copiar</button>
												{/if}
												<button type="button" class="link text-err" onclick={() => revogarConvite(cv.id)}>Revogar</button>
											{:else if cv.situacao === 'expirado' && cv.tipo === 'email' && !c.arquivada_em}
												<button type="button" class="link" onclick={() => reenviarConvite(cv.id)}>Reenviar</button>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{/if}
</main>

{#if convidando}
	<ModalConvidar campanhaId={c.id} pessoas={data.membros.length} convites={data.convites} aoFechar={() => (convidando = false)} />
{/if}

{#if removendo}
	<Modal rotulo="Remover jogador" largura={480} aoFechar={() => !ocupado && (removendo = null)}>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="t-h3 m-0">Remover {removendo.nome}?</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">{removendo.nome} deixa de ver a campanha. Para voltar, vai precisar de um novo convite.</p>
			<div class="flex flex-wrap justify-end gap-2.5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={() => (removendo = null)}>CANCELAR</button>
				<button type="button" class="btn-jogo bg-err text-errfg" disabled={ocupado} aria-busy={ocupado} onclick={remover}>{#if ocupado}<Girando />{/if}REMOVER</button>
			</div>
		</div>
	</Modal>
{/if}
