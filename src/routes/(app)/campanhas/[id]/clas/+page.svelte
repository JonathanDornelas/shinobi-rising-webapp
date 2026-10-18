<script lang="ts">
	// K1 · Biblioteca de clãs da campanha: oficiais (cap. 8.3), aprovados da campanha e as criações de cada jogador.
	import Brasao from '#lib/componentes/cla/Brasao.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { nomeVila, type ResumoCla } from '#lib/clas/regras.ts';
	import { hrefCla, STATUS_CLA } from '#lib/clas/status.ts';
	import { tempoRelativo } from '#lib/formatar.ts';
	import type { StatusCla } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const k = $derived(data.campanha);
	const eu = $derived(data.usuario?.id ?? '');
	const mestre = $derived(data.papel === 'mestre');
	const nomeMembro = (id: string) => data.membros.find((m) => m.id === id)?.nome ?? 'Ex-membro';

	type Aba = 'oficiais' | 'campanha' | 'revisao' | 'minhas';
	interface Card {
		chave: string;
		nome: string;
		epiteto: string;
		vila: string;
		kkg: string | null;
		slug: string | null;
		kamon: string | null;
		cor: string | null;
		status: StatusCla | null;
		rodape: string;
		href: string;
		externo: boolean;
	}

	const criados = $derived(data.criados.map((c) => ({ ...c, resumo: c.resumo as Partial<ResumoCla> })));
	// numa cadeia de versões aprovadas, a biblioteca mostra só a mais nova
	const substituidos = $derived(new Set(criados.filter((c) => c.status === 'aprovado' && c.anterior_id).map((c) => c.anterior_id)));
	const cardCriado = (c: (typeof criados)[number]): Card => ({
		chave: c.id,
		nome: `Clã ${c.nome || 'sem nome'}`,
		epiteto: c.resumo.significado || (c.kkg ? 'Com Kekkei Genkai' : 'Sem Kekkei Genkai'),
		vila: nomeVila(c.resumo.vila ?? null).replace(/gakure$/, '') || 'Sem vila',
		kkg: c.kkg ? c.resumo.kkg || 'KKG' : null,
		slug: null,
		kamon: c.resumo.kamon ?? '01',
		cor: c.resumo.cor ?? '#C44536',
		status: c.status,
		rodape: `${nomeMembro(c.autor_id)} · v${c.versao} · ${c.status === 'rascunho' ? 'rascunho' : c.status === 'em_revisao' ? 'enviado' : 'atualizado'} ${tempoRelativo(c.enviado_em && c.status === 'em_revisao' ? c.enviado_em : c.atualizado_em)}`,
		href: hrefCla(k.id, c.id),
		externo: false
	});
	const listas = $derived<Record<Aba, Card[]>>({
		oficiais: data.oficiais.map((o) => ({
			chave: o.slug,
			nome: `Clã ${o.nome}`,
			epiteto: o.epiteto,
			vila: o.vila ?? 'Sem vila',
			kkg: o.kkg,
			slug: o.slug,
			kamon: null,
			cor: null,
			status: null,
			rodape: 'Oficial · cap. 8',
			href: `/regras/clas/${o.slug}`,
			externo: true
		})),
		campanha: criados.filter((c) => c.status === 'aprovado' && !substituidos.has(c.id)).map(cardCriado),
		revisao: criados.filter((c) => c.status === 'em_revisao' && c.autor_id !== eu).map(cardCriado),
		minhas: criados.filter((c) => c.autor_id === eu).map(cardCriado)
	});
	const ABAS = $derived<{ id: Aba; nome: string }[]>([
		{ id: 'oficiais', nome: 'OFICIAIS' },
		{ id: 'campanha', nome: 'DA CAMPANHA' },
		...(mestre ? [{ id: 'revisao' as const, nome: 'EM REVISÃO' }] : []),
		{ id: 'minhas', nome: 'MINHAS CRIAÇÕES' }
	]);
	// svelte-ignore state_referenced_locally
	let aba = $state<Aba>(mestre && listas.revisao.length ? 'revisao' : 'oficiais');
	const VAZIO: Record<Aba, string> = {
		oficiais: 'A campanha não permite clãs do catálogo.',
		campanha: 'Nenhum clã criado nesta campanha ainda.',
		revisao: 'Nenhum clã esperando sua revisão.',
		minhas: 'Você ainda não criou um clã.'
	};

	const podeCriar = $derived(!k.arquivada_em && (k.clas_sem_kkg || k.clas_com_kkg));
	let criando = $state(false);
</script>

<main class="flex min-w-0 flex-col gap-4 p-4 md:p-6">
	<div class="flex flex-wrap items-center gap-3">
		<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Clãs</h1>
		{#if podeCriar}
			<button type="button" class="btn-jogo btn-primario com-icone text-[13px]" onclick={() => (criando = true)}><Icone id="acao/ic-acao-criar-cla" />CRIAR CLÃ</button>
		{:else}
			<span class="btn-jogo com-icone cursor-not-allowed border-2 border-b3 text-[13px] text-mut" aria-disabled="true" title={k.arquivada_em ? 'Campanha arquivada' : 'A campanha não permite clãs personalizados'}><Icone id="acao/ic-acao-criar-cla" class="opacity-60" />CRIAR CLÃ</span>
		{/if}
	</div>
	{#if form?.erro}<Alerta tipo="erro" titulo={form.erro} />{/if}

	<div role="tablist" aria-label="Clãs" class="flex self-start overflow-x-auto border-y-2 border-ink bg-b2 max-md:self-stretch">
		{#each ABAS as a (a.id)}
			{@const on = aba === a.id}
			<button
				type="button"
				role="tab"
				aria-selected={on}
				class="flex items-center gap-1.5 px-4 py-[15px] font-pixel text-sm leading-none font-semibold tracking-[0.05em] whitespace-nowrap {on ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}"
				onclick={() => (aba = a.id)}
			>
				{on ? '▸ ' : ''}{a.nome}<span class="border-2 px-1 py-0.5 text-xs font-bold {on ? 'border-[#8B2E20]' : 'border-b3'}">{listas[a.id].length}</span>
			</button>
		{/each}
	</div>

	{#if listas[aba].length}
		<div role="tabpanel"><ul class="m-0 grid list-none gap-3.5 p-0 sm:grid-cols-2 xl:grid-cols-3">
			{#each listas[aba] as c (c.chave)}
				{@const st = c.status ? STATUS_CLA[c.status] : null}
				<li>
					<a
						href={c.href}
						target={c.externo ? '_blank' : undefined}
						rel={c.externo ? 'noopener' : undefined}
						class="cartao-link flex h-full flex-col border-2 bg-b2 text-fg shadow-[4px_4px_0_var(--ink)] {c.status === 'rascunho' ? 'border-dashed border-frame' : c.status === 'em_revisao' ? 'border-warn' : 'border-frame'}"
					>
						<span class="flex items-center gap-3 border-b-2 border-b3 p-3">
							<span class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-b3 bg-b1"><Brasao slug={c.slug} kamon={c.kamon} cor={c.cor} tamanho={64} /></span>
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate font-mincho text-lg leading-6 font-bold">{c.nome}</span>
								<span class="truncate text-[13px] leading-[18px] text-mut italic">{c.epiteto}</span>
							</span>
						</span>
						<span class="flex flex-wrap items-center gap-1.5 px-3 py-2.5">
							<span class="border-2 border-b3 p-2 text-xs leading-none font-semibold">{c.vila}</span>
							<span class="border-2 p-2 text-xs leading-none font-semibold {c.kkg ? 'border-[#8B2E20] bg-grena text-papel' : 'border-b3 text-mut'}">{c.kkg ?? 'Sem KKG'}</span>
							{#if st}<span class="inline-flex h-9 items-center gap-0.5 border-2 border-ink pr-2 text-xs leading-none font-semibold {st.classe}"><Icone id={st.icone} />{st.rotulo}</span>{/if}
						</span>
						<span class="mt-auto px-3 pb-3 text-xs leading-4 text-mut">{c.rodape}</span>
					</a>
				</li>
			{/each}
		</ul></div>
	{:else}
		<div class="flex flex-col items-center gap-2.5 border-2 border-dashed border-b3 p-10 text-center" role="tabpanel">
			<Icone id="nav/ic-nav-clas" tamanho={64} />
			<span class="text-base leading-[22px] font-semibold">{VAZIO[aba]}</span>
			{#if aba === 'minhas' && podeCriar}<button type="button" class="btn-jogo btn-contorno mt-1 text-[13px]" onclick={() => (criando = true)}>CRIAR CLÃ</button>{/if}
		</div>
	{/if}
</main>

{#if criando}
	<Modal rotulo="Criar clã" largura={560} topo={120} aoFechar={() => (criando = false)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">Criar clã</h2></div>
		<p class="m-0 px-5 pt-4 text-[15px] leading-[23px]">Clãs criados seguem o molde do cap. 8.4 e passam pela revisão de {mestre ? 'você mesmo (entram aprovados)' : 'Mestre'}. A escolha do Kekkei Genkai não muda depois.</p>
		<form method="POST" action="?/criar" class="grid gap-2.5 p-5 sm:grid-cols-2">
			<button type="submit" name="kkg" value="nao" disabled={!k.clas_sem_kkg} title={k.clas_sem_kkg ? undefined : 'A campanha não permite clãs sem KKG'} class="flex flex-col gap-1.5 border-2 border-frame bg-b2 p-3 text-left shadow-[4px_4px_0_var(--ink)] hover:border-mut disabled:cursor-not-allowed disabled:opacity-50">
				<Icone id="acao/ic-acao-criar-cla" />
				<span class="font-mincho text-[15px] leading-5 font-bold">Sem Kekkei Genkai</span>
				<span class="text-xs leading-4 text-mut">4 PB, ou 3 PB e um jutsu hereditário extra</span>
			</button>
			<button type="submit" name="kkg" value="sim" disabled={!k.clas_com_kkg} title={k.clas_com_kkg ? undefined : 'A campanha não permite clãs com KKG'} class="flex flex-col gap-1.5 border-2 border-frame bg-b2 p-3 text-left shadow-[4px_4px_0_var(--ink)] hover:border-mut disabled:cursor-not-allowed disabled:opacity-50">
				<Icone id="kkg/ic-kkg-combinacao" />
				<span class="font-mincho text-[15px] leading-5 font-bold">Com Kekkei Genkai</span>
				<span class="text-xs leading-4 text-mut">3 PB e a balança de PKG · exige aprovação</span>
			</button>
		</form>
	</Modal>
{/if}
