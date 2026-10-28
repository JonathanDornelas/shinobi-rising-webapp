<script lang="ts">
	// N2 · Ficha resumida de NPC (cap. 23.2): identidade rápida, bloco de combate com a sugestão do livro por rank,
	// até 3 tags comportamentais, ganchos e notas. Tropa genérica: vários membros com as mesmas estatísticas.
	import { MAX_TAGS, RANKS_NPC, TAGS_NPC } from '#lib/npcs/dados.ts';
	import type { Npc } from '#lib/supabase/banco.ts';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';
	import Retrato from '../ui/Retrato.svelte';
	import EnviarRetrato from '../personagem/EnviarRetrato.svelte';
	import EnquadrarArte from './EnquadrarArte.svelte';
	import { focoPadrao } from '#lib/bestiario/foco.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import { normalizar } from '#lib/livro/texto.ts';

	export interface JutsuCatalogoNpc {
		slug: string;
		nome: string;
		traducao: string;
		rank: string;
		tipo: string;
		elemento: string | null;
		custo: string;
	}
	interface Props {
		npc: Npc;
		/** os jutsus do livro, para escolher os do NPC (a Mesa usa o acerto e a DT abaixo para rolar) */
		catalogo?: JutsuCatalogoNpc[];
		salvando: boolean;
		aoSalvar: (n: Npc) => void;
		aoExcluir: () => void;
		aoFechar: () => void;
	}
	let { npc, catalogo = [], salvando, aoSalvar, aoExcluir, aoFechar }: Props = $props();
	// svelte-ignore state_referenced_locally
	const n = $state(structuredClone($state.snapshot(npc)) as Npc);
	const sugestao = $derived(RANKS_NPC.find((r) => r.id === n.rank)!);
	const usarSugestao = () => Object.assign(n, { pv: sugestao.pv, pc: sugestao.pc, defesa: sugestao.defesa });
	function alternarTag(t: string) {
		if (n.tags.includes(t)) n.tags = n.tags.filter((x) => x !== t);
		else if (n.tags.length < MAX_TAGS) n.tags = [...n.tags, t];
	}
	let confirmar = $state(false);
	// jutsus do NPC: busca por nome ou tradução (sem acento), no máximo 30 por NPC
	let buscaJutsu = $state('');
	const escolhidos = $derived((n.jutsus ?? []).map((s) => catalogo.find((j) => j.slug === s)).filter((j): j is JutsuCatalogoNpc => !!j));
	const achados = $derived.by(() => {
		const q = normalizar(buscaJutsu.trim());
		if (q.length < 2) return [];
		return catalogo.filter((j) => !(n.jutsus ?? []).includes(j.slug) && (normalizar(j.nome).includes(q) || normalizar(j.traducao ?? '').includes(q))).slice(0, 8);
	});
	const adicionarJutsu = (slug: string) => ((n.jutsus = [...(n.jutsus ?? []), slug].slice(0, 30)), (buscaJutsu = ''));
	const tirarJutsu = (slug: string) => (n.jutsus = (n.jutsus ?? []).filter((s) => s !== slug));
</script>

<Modal rotulo="Editar NPC" largura={780} topo={56} aoFechar={() => !salvando && aoFechar()}>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			aoSalvar(n);
		}}
	>
		<div class="flex items-center gap-2.5 border-b-2 border-b3 px-[18px] py-3.5">
			<Icone id="acao/ic-acao-novo-npc" />
			<span class="flex-1 font-mincho text-[22px] leading-7 font-bold">{n.nome.trim() || 'Novo NPC'}</span>
			<label class="flex items-center gap-2 text-[13px] font-semibold"><input type="checkbox" role="switch" class="interruptor" bind:checked={n.revelado} />{n.revelado ? 'Revelado ao grupo' : 'Privado'}</label>
		</div>
		<div class="flex flex-col gap-3.5 px-[18px] py-4">
			<div class="flex items-center gap-3">
				<Retrato nome={n.nome || '?'} foto={n.retrato} tamanho={64} />
				<div class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold">Foto do NPC</span>
					<EnviarRetrato ficha={n.id} atual={n.retrato} salvar={(caminho) => supabase().from('npcs').update({ retrato: caminho }).eq('id', n.id)} aoMudar={(c) => (n.retrato = c)} />
				</div>
			</div>
			<!-- sem foto, o token usa a arte do bestiário: o Mestre ajusta o recorte -->
			{#if !n.retrato && n.arte && focoPadrao(n.arte)}<EnquadrarArte arte={n.arte} valor={n.enquadramento} aoMudar={(f) => (n.enquadramento = f)} />{/if}
			<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">IDENTIDADE RÁPIDA</span>
			<div class="grid gap-2.5 sm:grid-cols-2">
				<Campo id="npc-nome" rotulo="Nome" obrigatorio><input id="npc-nome" class="campo" maxlength="60" bind:value={n.nome} /></Campo>
				<Campo id="npc-funcao" rotulo="Função na cena"><input id="npc-funcao" class="campo" maxlength="120" placeholder="Ronin contratado pelo daimyō" bind:value={n.funcao} /></Campo>
				<Campo id="npc-origem" rotulo="Vila ou origem"><input id="npc-origem" class="campo" maxlength="60" bind:value={n.origem} /></Campo>
				<div class="flex flex-col gap-1.5">
					<span class="text-sm leading-5 font-semibold" id="npc-rank">Rank de poder</span>
					<div class="flex border-2 border-frame" role="radiogroup" aria-labelledby="npc-rank">
						{#each RANKS_NPC as r (r.id)}
							<button type="button" role="radio" aria-checked={n.rank === r.id} class="min-h-10 flex-1 border-r-2 border-frame font-pixel text-xs font-bold last:border-r-0 {n.rank === r.id ? 'bg-vermelhao text-white' : ''}" onclick={() => (n.rank = r.id)}>{r.nome.toUpperCase()}</button>
						{/each}
					</div>
				</div>
			</div>
			<Campo id="npc-aparencia" rotulo="Aparência marcante (1 frase)"><input id="npc-aparencia" class="campo" maxlength="300" bind:value={n.aparencia} /></Campo>

			<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">BLOCO DE COMBATE</span>
			<div class="flex flex-wrap items-center gap-1.5">
				<span class="text-[13px] font-semibold text-mut">Sugestão do livro:</span>
				{#each [`PV ${sugestao.pv}`, `PC ${sugestao.pc}`, `DEF ${sugestao.defesa}`] as g (g)}<span class="inline-flex min-h-8 items-center border-2 border-dashed border-acc px-2.5 font-pixel text-xs font-bold">{g}</span>{/each}
				<button type="button" class="link text-[13px] font-semibold" onclick={usarSugestao}>Usar sugestão</button>
			</div>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">PV</span><input class="campo t-num" type="number" min="1" max="9999" bind:value={n.pv} /></label>
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">PC</span><input class="campo t-num" type="number" min="0" max="9999" bind:value={n.pc} /></label>
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">DEFESA</span><input class="campo t-num" type="number" min="0" max="99" bind:value={n.defesa} /></label>
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">INICIATIVA 1d20 +</span><input class="campo t-num" type="number" min="-10" max="50" bind:value={n.iniciativa} /></label>
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">MEMBROS (TROPA)</span><input class="campo t-num" type="number" min="1" max="20" bind:value={n.membros} /></label>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">ACERTO 1d20 +</span><input class="campo t-num" type="number" min="-10" max="50" bind:value={n.acerto} /></label>
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">DT DOS JUTSUS</span><input class="campo t-num" type="number" min="5" max="40" bind:value={n.dt} /></label>
				<label class="flex flex-col gap-1.5"><span class="font-pixel text-xs font-bold text-mut">PE</span><input class="campo t-num" type="number" min="0" max="9999" bind:value={n.pe} /></label>
			</div>
			<div class="grid gap-2.5 sm:grid-cols-2">
				<Campo id="npc-ataque" rotulo="Ataque principal"><input id="npc-ataque" class="campo" maxlength="120" placeholder="katana 1d20 + 7 → 1d8 + 4" bind:value={n.ataque} /></Campo>
				<Campo id="npc-especial" rotulo="Habilidade ou jutsu marcante"><input id="npc-especial" class="campo" maxlength="300" placeholder="Kirigakure no Jutsu, 6 PC" bind:value={n.especial} /></Campo>
			</div>

			{#if catalogo.length}
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">JUTSUS · {escolhidos.length}</span>
				{#if escolhidos.length}
					<div class="flex flex-wrap gap-1.5">
						{#each escolhidos as j (j.slug)}
							<span class="inline-flex min-h-9 items-center gap-1.5 border-2 border-b3 bg-b1 pl-1 text-[13px] font-semibold">
								<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" />{j.nome}<span class="text-xs font-medium text-mut">{j.custo}</span>
								<button type="button" class="h-8 w-8 font-pixel text-xs" aria-label="Tirar {j.nome}" onclick={() => tirarJutsu(j.slug)}>✕</button>
							</span>
						{/each}
					</div>
				{/if}
				<div class="relative">
					<input class="campo w-full" placeholder="Buscar jutsu do livro para o NPC (nome ou tradução)" aria-label="Buscar jutsu para o NPC" bind:value={buscaJutsu} onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), achados[0] && adicionarJutsu(achados[0].slug))} />
					{#if achados.length}
						<ul class="absolute inset-x-0 top-full z-10 m-0 flex max-h-72 list-none flex-col overflow-y-auto border-2 border-frame bg-b2 p-0 shadow-[4px_4px_0_#000]" role="listbox" aria-label="Jutsus encontrados">
							{#each achados as j (j.slug)}
								<li><button type="button" role="option" aria-selected="false" class="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-b3" onclick={() => adicionarJutsu(j.slug)}>
									<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" />
									<span class="flex min-w-0 flex-1 flex-col"><span class="truncate text-sm font-semibold">{j.nome}</span><span class="truncate text-xs text-mut">{j.traducao} · {j.tipo}{j.elemento ? ` · ${j.elemento}` : ''}</span></span>
									<span class="font-pixel text-xs font-bold text-mut">{j.custo}</span>
								</button></li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">TAGS · {n.tags.length} / {MAX_TAGS}</span>
			<div class="flex flex-wrap gap-1.5">
				{#each TAGS_NPC as t (t.id)}
					{@const on = n.tags.includes(t.id)}
					{@const cheio = !on && n.tags.length >= MAX_TAGS}
					<button type="button" aria-pressed={on} disabled={cheio} title={cheio ? 'No máximo 3 tags' : t.nota} class="min-h-10 border-2 px-3 text-[13px] font-semibold disabled:opacity-45 {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}" onclick={() => alternarTag(t.id)}>{t.id}</button>
				{/each}
			</div>
			<div class="grid gap-2.5 sm:grid-cols-2">
				<Campo id="npc-quer" rotulo="O que quer"><textarea id="npc-quer" class="campo h-auto min-h-[56px] resize-y py-2 text-sm leading-[21px]" maxlength="300" bind:value={n.quer}></textarea></Campo>
				<Campo id="npc-segredo" rotulo="Segredo ou conexão" ajuda="Nunca aparece para o grupo."><textarea id="npc-segredo" class="campo h-auto min-h-[56px] resize-y py-2 text-sm leading-[21px]" maxlength="300" bind:value={n.segredo}></textarea></Campo>
			</div>
			<Campo id="npc-notas" rotulo="Notas do Mestre"><textarea id="npc-notas" class="campo h-auto min-h-[56px] resize-y py-2 text-sm leading-[21px]" maxlength="2000" bind:value={n.notas}></textarea></Campo>
		</div>
		<div class="flex flex-wrap items-center gap-2 border-t-2 border-b3 px-[18px] py-3">
			{#if confirmar}
				<span class="text-[13px] font-semibold text-err">Excluir {n.nome || 'este NPC'}?</span>
				<button type="button" class="btn-jogo min-h-10 bg-err text-xs text-errfg" onclick={aoExcluir}>EXCLUIR</button>
				<button type="button" class="btn-jogo btn-fantasma min-h-10 text-xs" onclick={() => (confirmar = false)}>NÃO</button>
			{:else}
				<button type="button" class="link text-[13px] font-semibold text-err" onclick={() => (confirmar = true)}>Excluir NPC</button>
			{/if}
			<span class="flex-1"></span>
			<button type="button" class="btn-jogo btn-fantasma" disabled={salvando} onclick={aoFechar}>CANCELAR</button>
			<button type="submit" class="btn-jogo btn-primario" disabled={salvando || !n.nome.trim()}>{#if salvando}<Girando />{/if}SALVAR</button>
		</div>
	</form>
</Modal>
