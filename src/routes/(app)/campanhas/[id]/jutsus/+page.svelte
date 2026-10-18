<script lang="ts">
	// J1 · Biblioteca de jutsus da campanha: oficiais do livro, criados aprovados, em revisão (Mestre) e minhas criações.
	// Daqui saem o criador de jutsu (J2) e o de habilidade (J3, modal).
	import ModalConceder, { type Concessao } from '#lib/componentes/campanha/ModalConceder.svelte';
	import ModalHabilidade from '#lib/componentes/jutsu/ModalHabilidade.svelte';
	import { CUSTO_JUTSU } from '#lib/personagem/dados.ts';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import type { ResumoJutsu } from '#lib/jutsus/regras.ts';
	import { hrefJutsu, STATUS_CRIACAO } from '#lib/jutsus/status.ts';
	import { TIPOS } from '#lib/jutsus/dados.ts';
	import { tempoRelativo } from '#lib/formatar.ts';
	import type { StatusCriacao } from '#lib/supabase/banco.ts';
	import type { TipoJutsu } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const k = $derived(data.campanha);
	const eu = $derived(data.usuario?.id ?? '');
	const mestre = $derived(data.papel === 'mestre');
	const nomeMembro = (id: string) => data.membros.find((m) => m.id === id)?.nome ?? 'Ex-membro';
	const nomeFicha = (id: string | null) => (id ? (data.personagens.find((p) => p.id === id)?.nome ?? data.grupo.find((g) => g.id === id)?.nome ?? null) : null);
	const minhasFichas = $derived(data.personagens.filter((p) => p.jogador_id === eu && p.situacao === 'ativo').map((p) => ({ id: p.id, nome: p.nome })));

	type Aba = 'oficiais' | 'campanha' | 'revisao' | 'minhas';
	interface Card {
		chave: string;
		nome: string;
		linha: string;
		rank: string;
		tipo: TipoJutsu | null;
		custo: string;
		habilidade: boolean;
		status: StatusCriacao | null;
		href: string;
		externo: boolean;
		conceder?: Concessao;
	}
	const criados = $derived(data.criados.map((c) => ({ ...c, resumo: c.resumo as Partial<ResumoJutsu> & { origem?: string } })));
	const substituidos = $derived(new Set(criados.filter((c) => c.status === 'aprovado' && c.anterior_id).map((c) => c.anterior_id)));
	const cardCriado = (c: (typeof criados)[number]): Card => ({
		chave: c.id,
		nome: c.nome || 'Sem nome',
		linha: [nomeMembro(c.autor_id), nomeFicha(c.personagem_id) ?? (c.cla_id && data.nomesClas[c.cla_id] ? `Clã ${data.nomesClas[c.cla_id]}` : c.resumo.origem), `v${c.versao}`, c.status === 'rascunho' ? `rascunho ${tempoRelativo(c.atualizado_em)}` : c.status === 'em_revisao' && c.enviado_em ? `enviado ${tempoRelativo(c.enviado_em)}` : '']
			.filter(Boolean)
			.join(' · '),
		rank: c.tipo === 'habilidade' ? '' : (c.rank ?? c.resumo.rank ?? 'E'),
		tipo: (c.resumo.tipo as TipoJutsu | null) ?? null,
		custo: c.tipo === 'habilidade' ? '' : (c.resumo.custo ?? ''),
		habilidade: c.tipo === 'habilidade',
		status: c.status,
		href: hrefJutsu(k.id, c.id),
		externo: false,
		conceder: c.tipo === 'jutsu' && c.status === 'aprovado' ? { tipo: 'jutsu', slug: `jc-${c.id}`, nome: c.nome, custo: CUSTO_JUTSU[c.rank ?? 'C'] ?? 0 } : undefined
	});

	let busca = $state('');
	let filtroTipo = $state<TipoJutsu | ''>('');
	const oficiais = $derived(
		data.oficiais
			.filter((j) => (!filtroTipo || j.tipo === filtroTipo) && (!busca.trim() || `${j.nome} ${j.origem}`.toLowerCase().includes(busca.trim().toLowerCase())))
			.map<Card>((j) => ({ chave: j.slug, nome: j.nome, linha: j.origem || j.tipo, rank: j.rank, tipo: j.tipo, custo: j.custo, habilidade: false, status: null, href: `/regras/jutsus/${j.slug}`, externo: true, conceder: j.cla ? undefined : ({ tipo: 'jutsu', slug: j.slug, nome: j.nome, custo: CUSTO_JUTSU[j.rank] ?? 0 } as Concessao) }))
	);
	const listas = $derived<Record<Aba, Card[]>>({
		oficiais,
		campanha: criados.filter((c) => c.status === 'aprovado' && !substituidos.has(c.id)).map(cardCriado),
		revisao: criados.filter((c) => c.status === 'em_revisao' && c.autor_id !== eu).map(cardCriado),
		minhas: criados.filter((c) => c.autor_id === eu).map(cardCriado)
	});
	const ABAS = $derived<{ id: Aba; nome: string; n: number }[]>([
		{ id: 'oficiais', nome: 'OFICIAIS', n: data.oficiais.length },
		{ id: 'campanha', nome: 'DA CAMPANHA', n: listas.campanha.length },
		...(mestre ? [{ id: 'revisao' as const, nome: 'EM REVISÃO', n: listas.revisao.length }] : []),
		{ id: 'minhas', nome: 'MINHAS CRIAÇÕES', n: listas.minhas.length }
	]);
	// svelte-ignore state_referenced_locally
	let aba = $state<Aba>(mestre && listas.revisao.length ? 'revisao' : listas.campanha.length ? 'campanha' : 'oficiais');
	const VAZIO: Record<Aba, string> = {
		oficiais: 'Nenhum jutsu do livro com esse filtro.',
		campanha: 'Nenhum jutsu criado e aprovado nesta campanha ainda.',
		revisao: 'Nada esperando sua revisão.',
		minhas: 'Você ainda não criou jutsus nem habilidades.'
	};
	const ativa = $derived(!k.arquivada_em);
	let modal = $state<'jutsu' | 'habilidade' | null>(null);
	let concedendo = $state<Concessao | null>(null);
	const fichasAtivas = $derived(data.personagens.filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && !p.pre_gerado).map((p) => ({ id: p.id, nome: p.nome, pt: p.pt })));
	let paraFicha = $state('');
</script>

<main class="flex min-w-0 flex-col gap-3.5 p-4 md:p-6">
	<div class="flex flex-wrap items-center gap-2">
		<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Jutsus</h1>
		{#if ativa}
			<button type="button" class="btn-jogo btn-contorno text-[13px]" onclick={() => (modal = 'habilidade')}>CRIAR HABILIDADE</button>
			<button type="button" class="btn-jogo btn-primario com-icone text-[13px]" onclick={() => (modal = 'jutsu')}><Icone id="acao/ic-acao-criar-jutsu" />CRIAR JUTSU</button>
		{/if}
	</div>
	{#if form?.erro}<Alerta tipo="erro" titulo={form.erro} />{/if}

	<div role="tablist" aria-label="Jutsus" class="flex self-start overflow-x-auto border-y-2 border-ink bg-b2 max-md:self-stretch">
		{#each ABAS as a (a.id)}
			{@const on = aba === a.id}
			<button type="button" role="tab" aria-selected={on} class="flex items-center gap-1.5 px-4 py-[15px] font-pixel text-sm leading-none font-semibold tracking-[0.05em] whitespace-nowrap {on ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}" onclick={() => (aba = a.id)}>
				{on ? '▸ ' : ''}{a.nome}<span class="border-2 px-1 py-0.5 text-xs font-bold {on ? 'border-[#8B2E20]' : 'border-b3'}">{a.n}</span>
			</button>
		{/each}
	</div>

	{#if aba === 'oficiais'}
		<div class="flex flex-wrap gap-2">
			<input class="campo h-10 w-64 text-sm max-sm:w-full" type="search" placeholder="Buscar por nome ou origem…" aria-label="Buscar jutsu" bind:value={busca} />
			<select class="campo h-10 pr-8 text-sm" aria-label="Tipo" bind:value={filtroTipo}>
				<option value="">Todos os tipos</option>
				{#each TIPOS as t (t)}<option value={t}>{t}</option>{/each}
			</select>
		</div>
	{/if}

	<div role="tabpanel">
		{#if listas[aba].length}
			<ul class="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
				{#each listas[aba] as j (j.chave)}
					{@const st = j.status ? STATUS_CRIACAO[j.status] : null}
					<li class="relative">
						<a
							href={j.href}
							target={j.externo ? '_blank' : undefined}
							rel={j.externo ? 'noopener' : undefined}
							class="cartao-link grid grid-cols-[4px_32px_minmax(0,1fr)_auto] items-center gap-3 border-2 bg-b2 py-2.5 pr-3.5 text-fg shadow-[4px_4px_0_var(--ink)] {j.status === 'rascunho' ? 'border-dashed border-frame' : j.status === 'em_revisao' ? 'border-warn' : 'border-frame'}"
						>
							<span class="-my-2.5 self-stretch" style:background={j.tipo ? TIPO_JUTSU[j.tipo].cor : 'var(--b3)'}></span>
							{#if j.habilidade}<Icone id="acao/ic-acao-criar-jutsu" alt="Habilidade" />{:else}<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" alt="Rank {j.rank}" />{/if}
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate font-mincho text-[17px] leading-[22px] font-bold">{j.nome}</span>
								<span class="truncate text-[13px] leading-[18px] text-mut">{j.habilidade ? 'Habilidade' : (j.tipo ?? 'Sem tipo')}{j.linha ? ` · ${j.linha}` : ''}</span>
							</span>
							<span class="flex flex-col items-end gap-1.5">
								{#if j.custo}<span class="t-num text-lg leading-none">{j.custo}</span>{/if}
								{#if st}<span class="inline-flex h-8 items-center gap-0.5 border-2 border-ink pr-1.5 text-xs leading-none font-semibold {st.classe}"><Icone id={st.icone} class="h-7 w-7" />{st.rotulo}</span>{/if}
							</span>
						</a>
						{#if mestre && ativa && j.conceder}
							<button type="button" class="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center border-2 border-ink bg-b2 hover:bg-b3" title="Conceder a uma ficha" aria-label="Conceder {j.nome} a uma ficha" onclick={() => (concedendo = j.conceder!)}><Icone id="acao/ic-acao-conceder" /></button>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<div class="flex flex-col items-center gap-2.5 border-2 border-dashed border-b3 p-10 text-center">
				<Icone id="nav/ic-nav-jutsus" tamanho={64} />
				<span class="text-base leading-[22px] font-semibold">{VAZIO[aba]}</span>
			</div>
		{/if}
	</div>
</main>

{#if modal === 'jutsu'}
	<Modal rotulo="Criar jutsu" largura={520} topo={120} aoFechar={() => (modal = null)}>
		<div class="bg-grena px-5 py-3.5"><h2 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel">Criar jutsu</h2></div>
		<form method="POST" action="?/criar" class="flex flex-col gap-4 p-5">
			<p class="m-0 text-[15px] leading-[23px]">O criador soma os PJ de cada escolha e mostra rank e custo ao vivo (cap. 20). Todo jutsu passa pelo Mestre{mestre ? ' (os seus entram aprovados)' : ''}.</p>
			<label class="flex flex-col gap-1.5 text-sm font-semibold">
				Para qual ficha?
				<select name="personagem" class="campo pr-8 font-normal" bind:value={paraFicha}>
					<option value="">Nenhuma (só para a biblioteca)</option>
					{#each minhasFichas as f (f.id)}<option value={f.id}>{f.nome || 'Personagem sem nome'}</option>{/each}
				</select>
				<span class="text-[13px] font-normal text-mut">Com a ficha, o criador confere o nível e o chakra dela; depois de aprovado, ela aprende com PT no treino.</span>
			</label>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn-jogo btn-fantasma" onclick={() => (modal = null)}>CANCELAR</button>
				<button type="submit" class="btn-jogo btn-primario">ABRIR O CRIADOR</button>
			</div>
		</form>
	</Modal>
{:else if concedendo}
	<ModalConceder alvo={concedendo} fichas={fichasAtivas} aoFechar={() => (concedendo = null)} />
{:else if modal === 'habilidade'}
	<ModalHabilidade campanha={k.id} {eu} fichas={minhasFichas} clas={data.meusClas} {mestre} aoFechar={() => (modal = null)} />
{/if}
