<script lang="ts">
	// P1 · Personagens da campanha. O Mestre vê todas as fichas; o jogador vê as próprias e o resumo público do grupo.
	import IconeCla, { nomeClaFicha, temIconeCla, type ResumoClaFicha } from '#lib/componentes/cla/IconeCla.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import { hrefEditar, hrefFicha, STATUS_FICHA } from '#lib/personagem/status.ts';
	import type { StatusFicha } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.campanha);
	const nomeJogador = (id: string) => data.membros.find((m) => m.id === id)?.nome ?? 'Jogador';

	type Filtro = 'Todos' | 'Ativo' | 'Em criação' | 'Em revisão' | 'Falecido' | 'Arquivado';
	interface Card {
		id: string;
		nome: string;
		jogador: string;
		nivel: number;
		cla: ResumoClaFicha;
		grupo: Exclude<Filtro, 'Todos'>;
		status: StatusFicha | null;
		situacao: string;
		meu: boolean;
		href: string;
	}
	const eu = $derived(data.usuario?.id ?? '');
	const cards = $derived.by<Card[]>(() => {
		const vistos = new Set<string>();
		const lista: Card[] = [];
		for (const p of data.personagens) {
			vistos.add(p.id);
			const grupo: Card['grupo'] =
				p.situacao === 'falecido' ? 'Falecido' : p.situacao === 'arquivado' ? 'Arquivado' : p.status === 'aprovada' ? 'Ativo' : p.status === 'em_revisao' ? 'Em revisão' : 'Em criação';
			const meu = p.jogador_id === eu;
			lista.push({
				id: p.id,
				nome: p.nome || 'Sem nome',
				jogador: nomeJogador(p.jogador_id),
				nivel: p.nivel,
				cla: p.resumo,
				grupo,
				status: p.status,
				situacao: p.situacao,
				meu,
				href: meu && (p.status === 'rascunho' || p.status === 'ajustes') ? hrefEditar(c.id, p.id) : hrefFicha(c.id, p.id)
			});
		}
		for (const g of data.grupo) {
			if (vistos.has(g.id)) continue;
			lista.push({
				id: g.id,
				nome: g.nome,
				jogador: nomeJogador(g.jogador_id),
				nivel: g.nivel,
				cla: g.resumo,
				grupo: g.situacao === 'falecido' ? 'Falecido' : g.situacao === 'arquivado' ? 'Arquivado' : 'Ativo',
				status: 'aprovada',
				situacao: g.situacao,
				meu: false,
				href: hrefFicha(c.id, g.id)
			});
		}
		return lista;
	});
	const FILTROS: Filtro[] = ['Todos', 'Ativo', 'Em criação', 'Em revisão', 'Falecido', 'Arquivado'];
	let filtro = $state<Filtro>('Todos');
	const visiveis = $derived(cards.filter((x) => filtro === 'Todos' || x.grupo === filtro));
	const conta = (f: Filtro) => (f === 'Todos' ? cards.length : cards.filter((x) => x.grupo === f).length);
	const ROTULO: Record<Card['grupo'], { classe: string; icone: string }> = {
		Ativo: { classe: 'bg-ok text-okfg border-ink', icone: 'status/ic-status-aprovado' },
		'Em criação': { classe: 'bg-[#5E6B73] text-white border-ink', icone: 'status/ic-status-rascunho' },
		'Em revisão': { classe: 'bg-warn text-warnfg border-ink', icone: 'status/ic-status-em-revisao' },
		Falecido: { classe: 'border-[#5E6B73] text-fg', icone: 'status/ic-status-revogado' },
		Arquivado: { classe: 'border-b3 text-mut', icone: 'status/ic-status-rascunho' }
	};
</script>

<main class="flex min-w-0 flex-col gap-4 p-4 md:p-6">
	<div class="flex flex-wrap items-center gap-3">
		<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">Personagens</h1>
		{#if data.papel === 'mestre'}
			<span class="btn-jogo com-icone cursor-not-allowed border-2 border-b3 text-[13px] text-mut" title="Pré-gerados chegam com os NPCs, no lote de Aprovações e NPCs" aria-disabled="true"><Icone id="acao/ic-acao-criar-personagem" class="opacity-60" />CRIAR PRÉ-GERADO · EM BREVE</span>
		{/if}
	</div>
	{#if cards.length}
		<div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
			{#each FILTROS as f (f)}
				<button type="button" aria-pressed={filtro === f} class="flex min-h-10 items-center gap-1.5 border-2 px-3 text-[13px] font-semibold {filtro === f ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" onclick={() => (filtro = f)}>
					{f}<b class="t-num">{conta(f)}</b>
				</button>
			{/each}
		</div>
		{#if visiveis.length}
			<ul class="m-0 grid list-none gap-3.5 p-0 sm:grid-cols-2 xl:grid-cols-3">
				{#each visiveis as x (x.id)}
					<li>
						<a href={x.href} class="painel-sombra cartao-link relative flex items-start gap-3 overflow-hidden p-3.5 text-fg" class:grayscale={x.grupo === 'Falecido'}>
							{#if temIconeCla(x.cla)}
								<span class="flex h-16 w-16 flex-none items-center justify-center border-2 border-[#8B2E20] bg-grena"><IconeCla resumo={x.cla} /></span>
							{:else}
								<Retrato nome={x.nome} tamanho={64} />
							{/if}
							<span class="flex min-w-0 flex-1 flex-col gap-1.5">
								<span class="truncate font-mincho text-lg leading-6 font-bold">{x.nome}{x.meu ? ' (sua)' : ''}</span>
								<span class="text-[13px] leading-[18px] text-mut">{x.jogador} · Nível {x.nivel}{nomeClaFicha(x.cla) ? ` · Clã ${nomeClaFicha(x.cla)}` : ''}</span>
								<span class="inline-flex h-9 items-center gap-0.5 self-start border-2 pr-2 text-xs leading-none font-semibold {ROTULO[x.grupo].classe}">
									<Icone id={ROTULO[x.grupo].icone} />{x.grupo === 'Em criação' && x.status ? STATUS_FICHA[x.status].rotulo : x.grupo}
								</span>
							</span>
							{#if x.grupo === 'Falecido'}
								<span class="absolute top-4 -right-[34px] rotate-45 border-y-2 border-[#5E6B73] bg-[#1A1A1A] px-10 py-1.5 font-pixel text-xs font-bold tracking-[0.1em] text-papel">MEMORIAL</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="border-2 border-dashed border-b3 p-8 text-center text-[15px] font-semibold text-mut">Nenhum personagem com este status.</div>
		{/if}
	{:else}
		<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
			<Icone id="nav/ic-nav-personagens" tamanho={96} />
			<h2 class="m-0 font-mincho text-[22px] leading-[30px] font-bold">Nenhum personagem ainda</h2>
			<p class="m-0 text-[15px] leading-[23px] text-mut">{data.papel === 'mestre' ? 'Os jogadores criam os seus depois de aceitar o convite.' : 'Crie o seu pelo painel da campanha.'}</p>
			{#if data.papel === 'mestre' && !c.arquivada_em}<a href="/campanhas/{c.id}/membros?convidar=1" class="btn-jogo btn-contorno mt-1.5 text-[13px]">CONVIDAR JOGADORES</a>{/if}
			{#if data.papel === 'jogador'}<a href="/campanhas/{c.id}" class="btn-jogo btn-contorno mt-1.5 text-[13px]">IR PARA O PAINEL</a>{/if}
		</div>
	{/if}
</main>
