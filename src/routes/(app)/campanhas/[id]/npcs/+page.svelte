<script lang="ts">
	// N1 · NPCs da campanha. Mestre: cards com visibilidade, bloco de combate com PV clicável (tropas por membro) e o
	// editor da ficha resumida (N2). Jogadores: os NPCs que o Mestre revelou.
	import { onMount } from 'svelte';
	import { goto, refreshAll, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { npcDoVerbete } from '#lib/bestiario/npc.ts';
	import BuscaBestiario from '#lib/componentes/npc/BuscaBestiario.svelte';
	import EditorNpc from '#lib/componentes/npc/EditorNpc.svelte';
	import PastasNpcs from '#lib/componentes/npc/PastasNpcs.svelte';
	import BarraRolagem from '#lib/componentes/rolagens/BarraRolagem.svelte';
	import BotaoRolar from '#lib/componentes/rolagens/BotaoRolar.svelte';
	import SeloStatus from '#lib/componentes/personagem/SeloStatus.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import Retrato from '#lib/componentes/ui/Retrato.svelte';
	import { nomeRank, pvDosMembros, RANKS_NPC, TAGS_NPC } from '#lib/npcs/dados.ts';
	import { ataqueNpc, gerarNpc } from '#lib/npcs/gerador.ts';
	import { fichaVazia, resumoFicha } from '#lib/personagem/regras.ts';
	import { hrefEditar, hrefFicha } from '#lib/personagem/status.ts';
	import { teste } from '#lib/rolagens/expressoes.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json, Npc } from '#lib/supabase/banco.ts';
	import type { Bestiario, Criatura } from '#lib/livro/tipos.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const k = $derived(data.campanha);
	const mestre = $derived(data.papel === 'mestre');
	const ativa = $derived(!k.arquivada_em);

	// estado local para o combate responder na hora; o banco é atualizado logo depois
	// svelte-ignore state_referenced_locally
	let npcs = $state<Npc[]>(structuredClone(data.npcs));
	$effect(() => {
		npcs = structuredClone(data.npcs);
	});

	// pastas (as mesmas da Mesa): clicar filtra; arrastar um card para a pasta move o NPC
	// svelte-ignore state_referenced_locally
	let pastas = $state(data.pastas);
	let pastaSel = $state('todas');
	const descendentes = (id: string): string[] => pastas.filter((p) => p.pai_id === id).flatMap((p) => [p.id, ...descendentes(p.id)]);
	const naPasta = (n: Npc, sel: string) =>
		sel === 'todas' || (sel === 'sem' ? !n.pasta_id || !pastas.some((p) => p.id === n.pasta_id) : !!n.pasta_id && [sel, ...descendentes(sel)].includes(n.pasta_id));
	const contar = (sel: string) => npcs.filter((n) => naPasta(n, sel)).length;
	async function moverNpc(id: string, pasta: string | null) {
		// pasta excluída: o banco já subiu o conteúdo; aqui só acompanha
		if (id.startsWith('pasta:')) {
			const velha = id.slice(6);
			for (const n of npcs) if (n.pasta_id === velha) n.pasta_id = pasta;
			return;
		}
		const n = npcs.find((x) => x.id === id);
		if (!n || n.pasta_id === pasta) return;
		const antes = n.pasta_id;
		n.pasta_id = pasta;
		const { error } = await supabase().from('npcs').update({ pasta_id: pasta }).eq('id', id);
		if (error) {
			n.pasta_id = antes;
			toasts.mostrar('Não foi possível mover o NPC.', 'erro');
		}
	}

	// importar do bestiário pela busca: o NPC entra na pasta aberta, com jutsus, acerto, DT e arte
	let buscandoBestiario = $state(false);
	let importando = $state(false);
	async function importar(c: Criatura, estagio: number) {
		importando = true;
		const pasta = pastaSel !== 'todas' && pastaSel !== 'sem' ? pastaSel : null;
		const { data: criado, error } = await supabase()
			.from('npcs')
			.insert({ campanha_id: k.id, ...npcDoVerbete(c, estagio), pasta_id: pasta })
			.select('*')
			.single();
		importando = false;
		if (error || !criado) return void toasts.mostrar('Não foi possível importar o NPC.', 'erro');
		npcs = [...npcs, criado as Npc];
		toasts.mostrar(`${(criado as Npc).nome} entrou na lista de NPCs.`, 'sucesso');
	}

	let filtroRank = $state('');
	let filtroTag = $state('');
	let filtroVisivel = $state<'' | 'revelado' | 'privado'>('');
	const visiveis = $derived(
		npcs.filter((n) => naPasta(n, pastaSel) && (!filtroRank || n.rank === filtroRank) && (!filtroTag || n.tags.includes(filtroTag)) && (!filtroVisivel || (filtroVisivel === 'revelado') === n.revelado))
	);

	// ---------------------------------------------------------------- editar, criar, excluir
	let editando = $state<Npc | null>(null);
	let salvando = $state(false);
	async function novo(tropa: boolean) {
		escolhendo = false;
		const r = RANKS_NPC.find((x) => x.id === (tropa ? 'genin' : 'chunin'))!;
		const { data: criado, error } = await supabase()
			.from('npcs')
			.insert({ campanha_id: k.id, nome: tropa ? 'Tropa' : '', rank: r.id, pv: tropa ? 15 : r.pv, pc: r.pc, defesa: tropa ? 11 : r.defesa, membros: tropa ? 4 : 1 })
			.select('*')
			.single();
		if (error || !criado) return toasts.mostrar('Não foi possível criar o NPC.', 'erro');
		npcs = [...npcs, criado as Npc];
		editando = criado as Npc;
	}
	// gerador rápido: um NPC completo (nome, função, combate, tags e ganchos), já salvo e aberto no editor
	let rankGerado = $state<Npc['rank'] | ''>('');
	/** Modal do NOVO NPC: ficha resumida, gerada ou completa. */
	let escolhendo = $state(false);
	async function gerar() {
		escolhendo = false;
		const g = gerarNpc(rankGerado || undefined);
		const { data: criado, error } = await supabase()
			.from('npcs')
			.insert({ campanha_id: k.id, ...g })
			.select('*')
			.single();
		if (error || !criado) return toasts.mostrar('Não foi possível gerar o NPC.', 'erro');
		npcs = [...npcs, criado as Npc];
		editando = criado as Npc;
	}
	// "Usar na campanha" no bestiário: ?bestiario=<verbete> cria o NPC com os números do verbete e abre o editor.
	// O parâmetro sai da URL antes de criar, para recarregar a página não duplicar o NPC.
	onMount(async () => {
		const slug = page.url.searchParams.get('bestiario');
		if (!slug) return;
		const estagio = +(page.url.searchParams.get('estagio') ?? 0) || 0;
		const url = new URL(page.url.href);
		url.searchParams.delete('bestiario');
		url.searchParams.delete('estagio');
		replaceState(url, {});
		if (!mestre || !ativa) return toasts.mostrar('Só o Mestre de uma campanha ativa cria NPCs do bestiário.', 'aviso');
		const { default: b } = await import('#lib/livro/gerado/bestiario.json');
		const verbete = (b as Bestiario).criaturas.find((c) => c.slug === slug);
		if (!verbete) return toasts.mostrar('Verbete do bestiário não encontrado.', 'erro');
		const { data: criado, error } = await supabase()
			.from('npcs')
			.insert({ campanha_id: k.id, ...npcDoVerbete(verbete, estagio) })
			.select('*')
			.single();
		if (error || !criado) return toasts.mostrar('Não foi possível criar o NPC.', 'erro');
		npcs = [...npcs, criado as Npc];
		editando = criado as Npc;
		toasts.mostrar(`${verbete.nome} entrou na lista de NPCs.`, 'sucesso');
	});
	// NPC com ficha completa: uma ficha do Mestre no mesmo criador dos jogadores, fora do grupo
	let criandoFicha = $state(false);
	async function novaFichaNpc() {
		criandoFicha = true;
		const dados = fichaVazia();
		const { data: nova, error } = await supabase()
			.from('personagens')
			.insert({ campanha_id: k.id, jogador_id: data.usuario!.id, nome: '', npc: true, dados: dados as unknown as Json, resumo: resumoFicha(dados) as unknown as Json })
			.select('id')
			.single();
		criandoFicha = false;
		if (error || !nova) return toasts.mostrar('Não foi possível criar a ficha do NPC.', 'erro');
		await goto(hrefEditar(k.id, nova.id));
	}
	const fichasNpc = $derived(data.npcFichas ?? []);
	async function salvar(n: Npc) {
		salvando = true;
		const { id, campanha_id, criado_em, atualizado_em, ...campos } = n;
		void campanha_id;
		void criado_em;
		void atualizado_em;
		const { error } = await supabase()
			.from('npcs')
			.update({ ...campos, pv_atual: campos.pv_atual.slice(0, campos.membros).map((v) => Math.min(v, campos.pv)) })
			.eq('id', id);
		salvando = false;
		if (error) return toasts.mostrar('Não foi possível salvar o NPC.', 'erro');
		editando = null;
		await refreshAll();
	}
	async function excluir() {
		if (!editando) return;
		// a foto sai do Storage antes (depois, a política não acha mais o NPC)
		const foto = npcs.find((x) => x.id === editando!.id)?.retrato;
		if (foto) await supabase().storage.from('retratos').remove([foto]);
		const { error } = await supabase().from('npcs').delete().eq('id', editando.id);
		if (error) return toasts.mostrar('Não foi possível excluir.', 'erro');
		editando = null;
		await refreshAll();
	}
	async function alternarVisivel(n: Npc) {
		n.revelado = !n.revelado;
		const { error } = await supabase().from('npcs').update({ revelado: n.revelado }).eq('id', n.id);
		if (error) {
			n.revelado = !n.revelado;
			return toasts.mostrar('Não foi possível mudar a visibilidade.', 'erro');
		}
		toasts.mostrar(n.revelado ? `${n.nome} agora aparece para o grupo.` : `${n.nome} voltou a ser privado.`, 'info');
	}

	// ---------------------------------------------------------------- combate: PV por membro
	const temporizadores = new Map<string, ReturnType<typeof setTimeout>>();
	function ajustarPv(n: Npc, membro: number, delta: number | 'cheio') {
		const atuais = pvDosMembros(n);
		atuais[membro] = delta === 'cheio' ? n.pv : Math.min(n.pv, Math.max(0, atuais[membro] + delta));
		n.pv_atual = atuais;
		clearTimeout(temporizadores.get(n.id));
		temporizadores.set(
			n.id,
			setTimeout(async () => {
				const { error } = await supabase().from('npcs').update({ pv_atual: n.pv_atual }).eq('id', n.id);
				if (error) toasts.mostrar('Não foi possível salvar o PV.', 'erro');
			}, 600)
		);
	}
	const restaurar = (n: Npc) => {
		n.pv_atual = [];
		n.pc_atual = [];
		n.pe_atual = [];
		clearTimeout(temporizadores.get(n.id));
		supabase().from('npcs').update({ pv_atual: [], pc_atual: [], pe_atual: [] }).eq('id', n.id).then();
	};
</script>

<main class="flex min-w-0 flex-col gap-3.5 p-4 md:p-6">
	<div class="flex flex-wrap items-center gap-2">
		<h1 class="m-0 flex-1 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">{mestre ? 'NPCs' : 'NPCs conhecidos'}</h1>
		{#if mestre && ativa}
			<button type="button" class="btn-jogo btn-contorno text-[13px]" onclick={() => (buscandoBestiario = true)}>DO BESTIÁRIO</button>
			<button type="button" class="btn-jogo btn-contorno text-[13px]" onclick={() => novo(true)}>NOVA TROPA GENÉRICA</button>
			<button type="button" class="btn-jogo btn-primario com-icone text-[13px]" aria-haspopup="dialog" onclick={() => (escolhendo = true)}><Icone id="acao/ic-acao-novo-npc" />NOVO NPC</button>
		{/if}
	</div>
	{#if mestre && ativa && (npcs.length || fichasNpc.length)}<BarraRolagem registro="/campanhas/{k.id}/rolagens" />{/if}

	{#if mestre && fichasNpc.length}
		<section class="flex flex-col gap-2" aria-labelledby="npc-fichas">
			<h2 id="npc-fichas" class="t-rotulo m-0">Com ficha completa · {fichasNpc.length}</h2>
			<ul class="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
				{#each fichasNpc as p (p.id)}
					<li>
						<a href={p.status === 'aprovada' ? hrefFicha(k.id, p.id) : hrefEditar(k.id, p.id)} class="painel-sombra cartao-link flex items-center gap-3 p-3 text-fg">
							<Retrato nome={p.nome || '?'} foto={p.retrato} tamanho={64} />
							<span class="flex min-w-0 flex-1 flex-col gap-1">
								<span class="truncate font-mincho text-lg leading-6 font-bold">{p.nome || 'NPC sem nome'}</span>
								<span class="text-[13px] text-mut">Nível {p.nivel}{p.resumo.claNome ? ` · Clã ${p.resumo.claNome}` : ''}{p.situacao !== 'ativo' ? ` · ${p.situacao}` : ''}</span>
							</span>
							<SeloStatus status={p.status} />
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if mestre}
		<div class="flex flex-col gap-3.5 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
		<PastasNpcs campanha={k.id} bind:pastas bind:sel={pastaSel} {contar} {ativa} onMoverNpc={moverNpc} />
		<div class="flex min-w-0 flex-col gap-3.5">
		{#if pastaSel !== 'todas'}
			<span class="text-[13px] font-semibold text-mut">NPCs › {pastaSel === 'sem' ? 'Sem pasta' : (pastas.find((p) => p.id === pastaSel)?.nome ?? '')} <button type="button" class="link ml-2 text-xs" onclick={() => (pastaSel = 'todas')}>ver todos</button></span>
		{/if}
		{#if npcs.length}
			<div class="flex flex-wrap gap-2">
				<select class="campo h-10 w-auto pr-8 text-[13px]" aria-label="Rank" bind:value={filtroRank}>
					<option value="">Rank</option>
					{#each RANKS_NPC as r (r.id)}<option value={r.id}>{r.nome}</option>{/each}
				</select>
				<select class="campo h-10 w-auto pr-8 text-[13px]" aria-label="Tags" bind:value={filtroTag}>
					<option value="">Tags</option>
					{#each TAGS_NPC as t (t.id)}<option value={t.id}>{t.id}</option>{/each}
				</select>
				<select class="campo h-10 w-auto pr-8 text-[13px]" aria-label="Visibilidade" bind:value={filtroVisivel}>
					<option value="">Visibilidade</option>
					<option value="revelado">Revelados</option>
					<option value="privado">Privados</option>
				</select>
			</div>
		{/if}
		{#if visiveis.length}
			<ul class="m-0 grid list-none gap-3.5 p-0 md:grid-cols-2 xl:grid-cols-3">
				{#each visiveis as n (n.id)}
					{@const pvs = pvDosMembros(n)}
					<li class="flex flex-col border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]" draggable={ativa} ondragstart={(e) => e.dataTransfer?.setData('text/x-npc', n.id)} title="Arraste para uma pasta">
						<div class="flex items-start gap-2.5 border-b-2 border-b3 px-3.5 py-3">
							<Retrato nome={n.nome || '?'} foto={n.retrato} tamanho={40} />
							<button type="button" class="flex min-w-0 flex-1 flex-col gap-0.5 text-left" onclick={() => (editando = n)}>
								<span class="font-mincho text-lg leading-6 font-bold">{n.nome || 'Sem nome'}{n.membros > 1 ? ` · ${n.membros}` : ''}</span>
								<span class="truncate text-[13px] leading-[18px] text-mut">{n.funcao || 'Sem função definida'}</span>
							</button>
							<button
								type="button"
								aria-pressed={n.revelado}
								title={n.revelado ? 'Revelado aos jogadores' : 'Privado: só o Mestre vê'}
								aria-label={n.revelado ? 'Revelado aos jogadores' : 'Privado'}
								disabled={!ativa}
								class="flex h-11 w-11 flex-none items-center justify-center border-2 {n.revelado ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}"
								onclick={() => alternarVisivel(n)}
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
									<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
									{#if n.revelado}<circle cx="12" cy="12" r="3" />{:else}<path d="M3 3l18 18" />{/if}
								</svg>
							</button>
						</div>
						<div class="flex flex-col gap-2 px-3.5 py-2.5">
							<div class="flex flex-wrap gap-1.5">
								<span class="border-2 border-[var(--vermelhao-lo)] bg-grena px-[7px] py-1.5 font-pixel text-xs leading-none font-bold tracking-[0.06em] text-papel">{nomeRank(n.rank).toUpperCase()}</span>
								{#each n.tags as t (t)}<span class="border-2 border-b3 px-[7px] py-[5px] text-xs leading-none font-semibold">{t}</span>{/each}
							</div>
							<div class="flex gap-3 font-pixel text-[13px] font-bold"><span>PV {n.pv}</span><span class="text-mut">DEF {n.defesa}</span><span class="text-mut">INIC {n.iniciativa >= 0 ? '+' : ''}{n.iniciativa}</span></div>
							{#if n.ataque}<span class="text-[13px] leading-[18px]">{n.ataque}</span>{/if}
							{#if ativa}
								{@const atk = ataqueNpc(n.ataque)}
								<div class="flex flex-wrap gap-1.5" aria-label="Rolagens de {n.nome}">
									<BotaoRolar texto="INICIATIVA" expressao={teste(n.iniciativa)} rotulo="Iniciativa" npc={n.id} d20 tipo="iniciativa" origem="Ficha de NPC" />
									{#if atk.acerto}<BotaoRolar texto="ATAQUE" expressao={atk.acerto} rotulo="Ataque" npc={n.id} d20 tipo="ataque" origem="Ficha de NPC" />{/if}
									{#if atk.dano}<BotaoRolar texto="DANO" expressao={atk.dano} rotulo="Dano" npc={n.id} tipo="dano" origem="Ficha de NPC" /><BotaoRolar texto="CRÍTICO" expressao={atk.dano} rotulo="Dano crítico" npc={n.id} critico tipo="dano" origem="Ficha de NPC" />{/if}
								</div>
							{/if}
							<div class="flex flex-col gap-1.5" aria-label="PV em combate">
								{#each pvs as pv, m (m)}
									<div class="flex items-center gap-1.5">
										{#if n.membros > 1}<span class="t-num w-7 text-xs">#{m + 1}</span>{/if}
										<button type="button" class="relative h-4 flex-1 border-2 border-ink bg-b3" title="Clique: −5 PV" aria-label="{n.nome}{n.membros > 1 ? ` #${m + 1}` : ''}: PV {pv} de {n.pv}. Tirar 5" disabled={!ativa} onclick={() => ajustarPv(n, m, -5)}>
											<span class="absolute inset-y-0 left-0 bg-vermelhao shadow-[inset_0_3px_0_#E07A5F]" style:width="{(pv / n.pv) * 100}%"></span>
										</button>
										<button type="button" class="h-7 w-7 border-2 border-b3 font-pixel text-xs font-bold" aria-label="Tirar 1 PV" disabled={!ativa} onclick={() => ajustarPv(n, m, -1)}>−</button>
										<button type="button" class="h-7 w-7 border-2 border-b3 font-pixel text-xs font-bold" aria-label="Devolver 1 PV" disabled={!ativa} onclick={() => ajustarPv(n, m, 1)}>+</button>
										<span class="t-num w-14 text-right text-xs" aria-live="polite">{pv}/{n.pv}</span>
									</div>
								{/each}
							</div>
							<div class="flex items-center gap-2">
								<button type="button" class="link text-xs font-semibold" onclick={() => (editando = n)}>Editar ficha</button>
								{#if pastas.length && ativa}
									<select class="campo h-8 w-auto max-w-[150px] pr-7 text-xs" aria-label="Mover para pasta" value={n.pasta_id ?? ''} onchange={(e) => moverNpc(n.id, e.currentTarget.value || null)}>
										<option value="">Sem pasta</option>
										{#each pastas as p (p.id)}<option value={p.id}>{p.nome}</option>{/each}
									</select>
								{/if}
								<span class="flex-1"></span>
								{#if n.pv_atual.length}<button type="button" class="btn-jogo btn-fantasma min-h-8 text-xs" disabled={!ativa} onclick={() => restaurar(n)}>RESTAURAR</button>{/if}
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
				<Icone id="nav/ic-nav-npcs" tamanho={64} />
				<span class="text-[15px] font-semibold">{npcs.length ? 'Nenhum NPC com esses filtros.' : 'Nenhum NPC ainda.'}</span>
				<span class="text-sm text-mut">A ficha resumida (cap. 23.2) se preenche em 2 minutos: identidade, combate, tags e ganchos.</span>
			</div>
		{/if}
		</div>
		</div>
	{:else if data.revelados.length}
		<ul class="m-0 grid list-none gap-3.5 p-0 md:grid-cols-2 xl:grid-cols-3">
			{#each data.revelados as n (n.id)}
				<li class="flex flex-col gap-2 border-2 border-frame bg-b2 px-3.5 py-3 shadow-[4px_4px_0_var(--ink)]">
					<span class="flex items-center gap-3">
						<Retrato nome={n.nome || '?'} foto={n.retrato} tamanho={64} />
						<span class="flex min-w-0 flex-col gap-0.5">
							<span class="font-mincho text-lg leading-6 font-bold">{n.nome}</span>
							<span class="text-[13px] leading-[18px] text-mut">{[n.funcao, n.origem].filter(Boolean).join(' · ')}</span>
						</span>
					</span>
					{#if n.aparencia}<span class="text-sm leading-[21px]">{n.aparencia}</span>{/if}
					<div class="flex flex-wrap gap-1.5">
						<span class="border-2 border-[var(--vermelhao-lo)] bg-grena px-[7px] py-1.5 font-pixel text-xs leading-none font-bold text-papel">{nomeRank(n.rank).toUpperCase()}</span>
						{#each n.tags as t (t)}<span class="border-2 border-b3 px-[7px] py-[5px] text-xs leading-none font-semibold">{t}</span>{/each}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="painel flex flex-col items-center gap-3 px-6 py-8 text-center">
			<Icone id="nav/ic-nav-npcs" tamanho={64} />
			<span class="text-[15px] font-semibold">O Mestre ainda não revelou nenhum NPC.</span>
		</div>
	{/if}
</main>

{#if escolhendo}
	<Modal rotulo="Novo NPC" largura={760} aoFechar={() => !criandoFicha && (escolhendo = false)}>
		<div class="flex flex-col gap-4 p-5 md:p-6">
			<div class="flex items-start gap-3">
				<div class="flex flex-1 flex-col gap-1">
					<h2 class="t-h3 m-0">Novo NPC</h2>
					<p class="m-0 text-sm text-mut">Escolha como criar. Dá para editar tudo depois.</p>
				</div>
				<button type="button" class="btn-icone h-10 w-10 flex-none" aria-label="Fechar" disabled={criandoFicha} onclick={() => (escolhendo = false)}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
				</button>
			</div>
			<div class="grid gap-3 md:grid-cols-3">
				<button type="button" class="painel-sombra cartao-link flex flex-col items-start gap-2 p-3.5 text-left text-fg" onclick={() => novo(false)}>
					<Icone id="acao/ic-acao-novo-npc" tamanho={64} />
					<span class="font-mincho text-lg leading-6 font-bold">Ficha resumida</span>
					<span class="text-[13px] leading-[19px] text-mut">Você preenche identidade, combate, tags e ganchos em 2 minutos (cap. 23.2).</span>
				</button>
				<div class="painel-sombra flex flex-col items-start gap-2 p-3.5">
					<Icone id="dado/ic-dado-d20" tamanho={64} />
					<span class="font-mincho text-lg leading-6 font-bold">Gerar automaticamente</span>
					<span class="text-[13px] leading-[19px] text-mut">Nome, função, origem, aparência, combate, tags e ganchos sorteados. Abre no editor para ajustar.</span>
					<label class="mt-auto flex w-full flex-col gap-1 text-xs font-semibold">
						Rank
						<select class="campo h-10 text-[13px]" bind:value={rankGerado}>
							<option value="">Aleatório</option>
							{#each RANKS_NPC as r (r.id)}<option value={r.id}>{r.nome}</option>{/each}
						</select>
					</label>
					<button type="button" class="btn-jogo btn-primario w-full text-[13px]" onclick={gerar}>GERAR NPC</button>
				</div>
				<button type="button" class="painel-sombra cartao-link flex flex-col items-start gap-2 p-3.5 text-left text-fg disabled:opacity-60" disabled={criandoFicha} aria-busy={criandoFicha} onclick={novaFichaNpc}>
					<Icone id="acao/ic-acao-criar-personagem" tamanho={64} />
					<span class="font-mincho text-lg leading-6 font-bold">Ficha completa</span>
					<span class="text-[13px] leading-[19px] text-mut">Uma ficha como a de um jogador, no criador de personagem: atributos, perícias, jutsus e inventário. Para vilões e aliados centrais.</span>
				</button>
			</div>
			<button type="button" class="painel cartao-link flex items-center gap-3 p-3 text-left text-fg" onclick={() => ((escolhendo = false), (buscandoBestiario = true))}>
				<Icone id="nav/ic-nav-npcs" />
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="font-mincho text-[17px] leading-6 font-bold">Do bestiário</span>
					<span class="text-[13px] leading-[19px] text-mut">Busque um adversário pronto e importe com um clique: números, jutsus, ganchos e a arte.</span>
				</span>
				<span class="font-pixel text-sm font-bold text-mut">▸</span>
			</button>
		</div>
	</Modal>
{/if}

{#if buscandoBestiario}
	<Modal rotulo="Importar do bestiário" largura={560} aoFechar={() => (buscandoBestiario = false)}>
		<div class="flex flex-col gap-3 p-5">
			<h2 class="t-h3 m-0">Importar do bestiário</h2>
			<p class="m-0 text-sm text-mut">Clique num adversário para criar o NPC{pastaSel !== 'todas' && pastaSel !== 'sem' ? ` na pasta “${pastas.find((p) => p.id === pastaSel)?.nome ?? ''}”` : ''}. Dá para importar vários seguidos.</p>
			<BuscaBestiario onEscolher={importar} onFechar={() => (buscandoBestiario = false)} ocupado={importando} />
		</div>
	</Modal>
{/if}

{#if editando}
	<EditorNpc npc={editando} catalogo={data.catalogoJutsus} {salvando} aoSalvar={salvar} aoExcluir={excluir} aoFechar={() => (editando = null)} />
{/if}
