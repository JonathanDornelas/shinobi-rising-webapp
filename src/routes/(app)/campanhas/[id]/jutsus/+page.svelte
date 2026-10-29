<script lang="ts">
	// J1 · Biblioteca de jutsus da campanha: oficiais do livro, criados aprovados, em revisão (Mestre) e minhas criações,
	// no mesmo explorador do catálogo (filtros, busca, quatro visualizações). Os filtros valem para todas as abas.
	// Os criados abrem no criador (J2), com status, conceder e excluir; daqui também sai o criador de habilidade (J3).
	import { invalidateAll } from '$app/navigation';
	import ModalConceder, { type Concessao } from '#lib/componentes/campanha/ModalConceder.svelte';
	import ModalExcluirCriacao, { type CriacaoExcluir } from '#lib/componentes/campanha/ModalExcluirCriacao.svelte';
	import ModalHabilidade from '#lib/componentes/jutsu/ModalHabilidade.svelte';
	import ExploradorJutsus, { type GrupoFiltro } from '#lib/componentes/regras/ExploradorJutsus.svelte';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { tempoRelativo } from '#lib/formatar.ts';
	import { normalizarJutsu, paraJutsuLivro, type JutsuDados } from '#lib/jutsus/regras.ts';
	import { hrefJutsu, STATUS_CRIACAO } from '#lib/jutsus/status.ts';
	import { acaoDe } from '#lib/livro/filtros-jutsu.ts';
	import type { Jutsu } from '#lib/livro/tipos.ts';
	import { CUSTO_JUTSU } from '#lib/personagem/dados.ts';
	import type { StatusCriacao } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const k = $derived(data.campanha);
	const eu = $derived(data.usuario?.id ?? '');
	const mestre = $derived(data.papel === 'mestre');
	const ativa = $derived(!k.arquivada_em);
	const nomeMembro = (id: string) => data.membros.find((m) => m.id === id)?.nome ?? 'Ex-membro';
	const nomeFicha = (id: string | null) => (id ? (data.personagens.find((p) => p.id === id)?.nome ?? data.grupo.find((g) => g.id === id)?.nome ?? null) : null);
	const minhasFichas = $derived(data.personagens.filter((p) => p.jogador_id === eu && p.situacao === 'ativo').map((p) => ({ id: p.id, nome: p.nome })));

	type Criado = (typeof data.criados)[number];
	const origemDe = (c: Criado) => nomeFicha(c.personagem_id) ?? (c.cla_id && data.nomesClas[c.cla_id] ? `Clã ${data.nomesClas[c.cla_id]}` : 'Criação da campanha');
	/** Os criados no formato do livro (slug jc-<id>), para os filtros e as visualizações do catálogo. */
	const comoLivro = (c: Criado): Jutsu => paraJutsuLivro(`jc-${c.id}`, normalizarJutsu(c.dados as Partial<JutsuDados>), origemDe(c));
	const porSlug = $derived(new Map(data.criados.map((c) => [`jc-${c.id}`, c])));

	type Aba = 'oficiais' | 'campanha' | 'revisao' | 'minhas';
	// numa cadeia de versões aprovadas, a biblioteca mostra só a mais nova
	const substituidos = $derived(new Set(data.criados.filter((c) => c.status === 'aprovado' && c.anterior_id).map((c) => c.anterior_id)));
	const criadosDa = $derived<Record<Exclude<Aba, 'oficiais'>, Criado[]>>({
		campanha: data.criados.filter((c) => c.status === 'aprovado' && !substituidos.has(c.id)),
		revisao: data.criados.filter((c) => c.status === 'em_revisao' && c.autor_id !== eu),
		minhas: data.criados.filter((c) => c.autor_id === eu)
	});
	const jutsusDa = $derived<Record<Aba, Jutsu[]>>({
		oficiais: data.oficiais as Jutsu[],
		campanha: criadosDa.campanha.filter((c) => c.tipo === 'jutsu').map(comoLivro),
		revisao: criadosDa.revisao.filter((c) => c.tipo === 'jutsu').map(comoLivro),
		minhas: criadosDa.minhas.filter((c) => c.tipo === 'jutsu').map(comoLivro)
	});
	const habilidadesDa = (a: Aba) => (a === 'oficiais' ? [] : criadosDa[a].filter((c) => c.tipo === 'habilidade'));
	const ABAS = $derived<{ id: Aba; nome: string; n: number }[]>([
		{ id: 'oficiais', nome: 'OFICIAIS', n: jutsusDa.oficiais.length },
		{ id: 'campanha', nome: 'DA CAMPANHA', n: criadosDa.campanha.length },
		...(mestre ? [{ id: 'revisao' as const, nome: 'EM REVISÃO', n: criadosDa.revisao.length }] : []),
		{ id: 'minhas', nome: 'MINHAS CRIAÇÕES', n: criadosDa.minhas.length }
	]);
	// svelte-ignore state_referenced_locally
	let aba = $state<Aba>(mestre && criadosDa.revisao.length ? 'revisao' : criadosDa.campanha.length ? 'campanha' : 'oficiais');
	const VAZIO: Record<Aba, string> = {
		oficiais: 'Nenhum jutsu do livro.',
		campanha: 'Nenhum jutsu criado e aprovado nesta campanha ainda.',
		revisao: 'Nada esperando sua revisão.',
		minhas: 'Você ainda não criou jutsus. Comece pelo botão Criar jutsu.'
	};

	// filtros só dos criados (os oficiais não têm valor neles, e o grupo some na aba Oficiais)
	const EXTRAS: GrupoFiltro[] = [
		{ id: 'status', rotulo: 'Status', obter: (j) => porSlug.get(j.slug)?.status ?? null, ordem: ['rascunho', 'em_revisao', 'ajustes', 'aprovado', 'rejeitado'], nome: (v) => STATUS_CRIACAO[v as StatusCriacao]?.rotulo ?? v, aberto: true },
		{ id: 'autor', rotulo: 'Autor', obter: (j) => { const c = porSlug.get(j.slug); return c ? nomeMembro(c.autor_id) : null; } }
	];
	const linhaCriado = (c: Criado) =>
		[nomeMembro(c.autor_id), origemDe(c), `v${c.versao}`, c.status === 'rascunho' ? `rascunho ${tempoRelativo(c.atualizado_em)}` : c.status === 'em_revisao' && c.enviado_em ? `enviado ${tempoRelativo(c.enviado_em)}` : ''].filter(Boolean).join(' · ');

	// ---------------------------------------------------------------- conceder e excluir
	const concessao = (j: Jutsu): Concessao | null => {
		const c = porSlug.get(j.slug);
		if (c) return c.status === 'aprovado' ? { tipo: 'jutsu', slug: j.slug, nome: c.nome, custo: CUSTO_JUTSU[c.rank ?? 'C'] ?? 0 } : null;
		return j.cla ? null : { tipo: 'jutsu', slug: j.slug, nome: j.nome, custo: CUSTO_JUTSU[j.rank] ?? 0 };
	};
	const podeExcluir = (c: Criado) => c.autor_id === eu || mestre;
	const paraExcluir = (c: Criado): CriacaoExcluir => ({
		tipo: 'jutsu',
		id: c.id,
		nome: c.nome,
		rotulo: c.tipo === 'habilidade' ? 'habilidade' : 'jutsu',
		aprovada: c.status === 'aprovado',
		versaoNova: !!c.anterior_id && c.status !== 'aprovado'
	});
	let modal = $state<'jutsu' | 'habilidade' | null>(null);
	let concedendo = $state<Concessao | null>(null);
	let excluindo = $state<CriacaoExcluir | null>(null);
	const fichasAtivas = $derived([...data.personagens, ...(data.npcFichas ?? [])].filter((p) => p.status === 'aprovada' && p.situacao === 'ativo' && !p.pre_gerado).map((p) => ({ id: p.id, nome: p.nome, pt: p.pt, ryo: p.ryo, npc: p.npc })));
	let paraFicha = $state('');
</script>

{#snippet seloStatus(status: StatusCriacao)}
	{@const st = STATUS_CRIACAO[status]}
	<span class="inline-flex h-8 items-center gap-0.5 border-2 border-ink pr-1.5 text-xs leading-none font-semibold whitespace-nowrap max-sm:pr-0 {st.classe}" title={st.rotulo}><Icone id={st.icone} class="h-7 w-7" /><span class="max-sm:sr-only">{st.rotulo}</span></span>
{/snippet}

{#snippet botaoConceder(alvo: Concessao, nome: string, sobreFaixa: boolean)}
	<button type="button" class="relative z-10 flex h-10 w-10 flex-none items-center justify-center {sobreFaixa ? 'hover:bg-[var(--vermelhao-lo)]' : 'hover:bg-b3'}" title="Conceder a uma ficha" aria-label="Conceder {nome} a uma ficha" onclick={() => (concedendo = alvo)}><Icone id="acao/ic-acao-conceder" /></button>
{/snippet}

{#snippet botaoExcluir(c: Criado, sobreFaixa: boolean)}
	<button type="button" class="relative z-10 flex h-10 w-10 flex-none items-center justify-center {sobreFaixa ? 'text-papel-2 hover:text-papel' : 'text-mut hover:text-err'}" title="Excluir" aria-label="Excluir {c.nome || 'sem nome'}" onclick={() => (excluindo = paraExcluir(c))}><Traco nome="lixeira" /></button>
{/snippet}

{#snippet selo(j: Jutsu)}
	{@const c = porSlug.get(j.slug)}
	{#if c}{@render seloStatus(c.status)}{/if}
{/snippet}

{#snippet acoes(j: Jutsu, sobreFaixa: boolean)}
	{@const c = porSlug.get(j.slug)}
	{@const alvo = mestre && ativa ? concessao(j) : null}
	{#if alvo}{@render botaoConceder(alvo, j.nome, sobreFaixa)}{/if}
	{#if c && podeExcluir(c)}{@render botaoExcluir(c, sobreFaixa)}{/if}
{/snippet}

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
				{on ? '▸ ' : ''}{a.nome}<span class="border-2 px-1 py-0.5 text-xs font-bold {on ? 'border-[var(--vermelhao-lo)]' : 'border-b3'}">{a.n}</span>
			</button>
		{/each}
	</div>

	<div role="tabpanel" class="flex flex-col gap-6">
		<ExploradorJutsus
			jutsus={jutsusDa[aba]}
			nomesCla={data.nomesClaLivro}
			extras={EXTRAS}
			href={(j) => { const c = porSlug.get(j.slug); return c ? hrefJutsu(k.id, c.id) : `/regras/jutsus/${j.slug}`; }}
			emModal={(j) => !porSlug.has(j.slug)}
			favoritavel={(j) => !porSlug.has(j.slug)}
			linha={(j) => { const c = porSlug.get(j.slug); return c ? linhaCriado(c) : `${j.origem} · ${acaoDe(j)}`; }}
			selo={aba === 'oficiais' ? undefined : selo}
			{acoes}
			vazio={habilidadesDa(aba).length ? 'Nenhum jutsu aqui; as habilidades estão logo abaixo.' : VAZIO[aba]}
			chaveVisao="jutsus-campanha-visao"
		/>

		{#if habilidadesDa(aba).length}
			<section class="flex flex-col gap-2.5" aria-labelledby="titulo-habilidades">
				<h2 id="titulo-habilidades" class="m-0 font-mincho text-xl leading-[26px] font-bold">Habilidades <span class="t-num text-base text-mut">{habilidadesDa(aba).length}</span></h2>
				<ul class="m-0 grid list-none gap-2 p-0 md:gap-3 xl:grid-cols-2">
					{#each habilidadesDa(aba) as c (c.id)}
						<li class="painel cartao-link relative grid grid-cols-[4px_32px_minmax(0,1fr)_auto_auto] items-center gap-2.5 py-1 pr-1 md:sombra-painel md:gap-3 md:py-1.5">
							<span class="-my-1 self-stretch bg-b3 md:-my-1.5"></span>
							<Icone id="acao/ic-acao-criar-jutsu" alt="Habilidade" />
							<span class="flex min-w-0 flex-col gap-0.5">
								<a href={hrefJutsu(k.id, c.id)} class="truncate font-mincho text-[15px] leading-5 font-bold after:absolute after:inset-0 md:text-[17px] md:leading-[22px]">{c.nome || 'Sem nome'}</a>
								<span class="truncate text-xs leading-4 text-mut md:text-[13px] md:leading-[18px]">{linhaCriado(c)}</span>
							</span>
							<span>{#if aba !== 'campanha'}{@render seloStatus(c.status)}{/if}</span>
							<span class="flex min-w-10 items-center justify-end">{#if podeExcluir(c)}{@render botaoExcluir(c, false)}{/if}</span>
						</li>
					{/each}
				</ul>
			</section>
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
{:else if excluindo}
	<ModalExcluirCriacao
		alvo={excluindo}
		aoFechar={() => (excluindo = null)}
		aoExcluir={async () => {
			excluindo = null;
			await invalidateAll();
		}}
	/>
{:else if modal === 'habilidade'}
	<ModalHabilidade campanha={k.id} {eu} fichas={minhasFichas} clas={data.meusClas} {mestre} aoFechar={() => (modal = null)} />
{/if}
