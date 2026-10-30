<script lang="ts" module>
	export interface ItemNpc {
		/** id do NPC rápido, ou da ficha de NPC completa */
		id: string;
		tipo: 'npc' | 'ficha';
		nome: string;
		rank: string;
		membros: number;
		pastaId: string | null;
	}
</script>

<script lang="ts">
	// L11 · M2 · CMP-43 · Elenco: quem está em cena (com o olho para esconder e revelar), os personagens para arrastar ao
	// quadro e, para o Mestre, os NPCs em pastas (até 3 níveis), com busca, filtro "na cena" e arrastar e soltar.
	import { onMount } from 'svelte';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { MesaToken, NpcPasta } from '#lib/supabase/banco.ts';
	import { corCss } from '#lib/mesa/cores.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';

	let {
		mesa,
		ui,
		personagens,
		npcs,
		pastas = $bindable(),
		subDe,
		celular = false,
		embutido = false,
		onAbrir,
		onColocar,
		onMoverNpc,
		onBestiario,
		onFechar
	}: {
		mesa: Mesa;
		ui: UiMesa;
		personagens: { id: string; jogadorId: string; nome: string; sub: string }[];
		npcs: ItemNpc[];
		pastas: NpcPasta[];
		subDe: (t: MesaToken) => string;
		celular?: boolean;
		/** Dentro do painel da esquerda com as abas Elenco e Cena: sem cabeçalho e ocupando a largura dele. */
		embutido?: boolean;
		onAbrir: (t: MesaToken) => void;
		/** Põe na cena um personagem, NPC ou pasta inteira (sem posição: perto do centro da vista). */
		onColocar: (dados: string, x?: number, y?: number) => void;
		onMoverNpc: (n: ItemNpc, pasta: string | null) => void;
		/** Abre a busca no bestiário (importar e pôr na cena). */
		onBestiario: () => void;
		onFechar?: () => void;
	} = $props();

	let busca = $state('');
	let soNaCena = $state(false);
	let abertas = $state<Record<string, boolean>>({});
	let renomeando = $state<{ id: string; nome: string } | null>(null);
	let menu = $state<string | null>(null);
	let destino = $state<string | null>(null);
	let aviso = $state('');
	onMount(() => (abertas = ler<Record<string, boolean>>('mesa-pastas-abertas', {})));

	const emCena = $derived(mesa.tokens.filter((t) => t.visivel || mesa.mestre || t.dono_id === mesa.eu));
	const pcsEmCena = $derived(emCena.filter((t) => t.personagem_id || t.ligado_a || (!t.npc_id && t.dono_id)));
	const npcsEmCena = $derived(emCena.filter((t) => t.npc_id || (!t.personagem_id && !t.ligado_a && !t.dono_id)));
	const naCena = (n: ItemNpc) => mesa.tokens.some((t) => (n.tipo === 'npc' ? t.npc_id === n.id : t.personagem_id === n.id));
	const foraDaCena = $derived(personagens.filter((p) => !mesa.tokens.some((t) => t.personagem_id === p.id) && (mesa.mestre || p.jogadorId === mesa.eu)));

	type Linha = { tipo: 'pasta'; p: NpcPasta; nivel: number; qtd: number } | { tipo: 'npc'; n: ItemNpc; nivel: number } | { tipo: 'vazia'; nivel: number; texto: string };
	const filtrado = $derived(npcs.filter((n) => (!busca.trim() || normalizar(n.nome).includes(normalizar(busca))) && (!soNaCena || naCena(n))));
	const descendentes = (id: string): string[] => pastas.filter((p) => p.pai_id === id).flatMap((p) => [p.id, ...descendentes(p.id)]);
	const arvore = $derived.by(() => {
		const linhas: Linha[] = [];
		const filtrando = !!busca.trim() || soNaCena;
		const ramo = (pai: string | null, nivel: number) => {
			for (const p of pastas.filter((x) => x.pai_id === pai)) {
				const ids = [p.id, ...descendentes(p.id)];
				const qtd = filtrado.filter((n) => n.pastaId && ids.includes(n.pastaId)).length;
				if (filtrando && !qtd) continue;
				linhas.push({ tipo: 'pasta', p, nivel, qtd });
				if (abertas[p.id] || filtrando) {
					const antes = linhas.length;
					ramo(p.id, nivel + 1);
					for (const n of filtrado.filter((x) => x.pastaId === p.id)) linhas.push({ tipo: 'npc', n, nivel: nivel + 1 });
					if (linhas.length === antes) linhas.push({ tipo: 'vazia', nivel: nivel + 1, texto: 'Arraste NPCs para cá.' });
				}
			}
		};
		ramo(null, 0);
		const soltos = filtrado.filter((n) => !n.pastaId || !pastas.some((p) => p.id === n.pastaId));
		if (soltos.length) {
			linhas.push({ tipo: 'vazia', nivel: 0, texto: 'Sem pasta' });
			for (const n of soltos) linhas.push({ tipo: 'npc', n, nivel: 0 });
		}
		return linhas;
	});

	function alternar(id: string) {
		abertas = { ...abertas, [id]: !abertas[id] };
		gravar('mesa-pastas-abertas', abertas);
	}

	// ------------------------------------------------------------------ pastas (Mestre)
	const nivelDe = (id: string | null): number => (id ? 1 + nivelDe(pastas.find((p) => p.id === id)?.pai_id ?? null) : 0);
	async function novaPasta(pai: string | null) {
		if (pai && nivelDe(pai) >= 3) {
			toasts.mostrar('As pastas vão até 3 níveis.', 'aviso');
			return;
		}
		const { data, error } = await supabase().from('npc_pastas').insert({ campanha_id: mesa.campanha, nome: 'Nova pasta', pai_id: pai, ordem: pastas.length }).select('*').single();
		if (error || !data) return void toasts.mostrar('Não foi possível criar a pasta.', 'erro');
		pastas = [...pastas, data as NpcPasta];
		if (pai) abertas = { ...abertas, [pai]: true };
		renomeando = { id: data.id, nome: data.nome };
	}
	async function renomear() {
		const r = renomeando;
		renomeando = null;
		if (!r || !r.nome.trim()) return;
		const nome = r.nome.trim().slice(0, 60);
		pastas = pastas.map((p) => (p.id === r.id ? { ...p, nome } : p));
		const { error } = await supabase().from('npc_pastas').update({ nome }).eq('id', r.id);
		if (error) toasts.mostrar('Não foi possível renomear a pasta.', 'erro');
	}
	async function excluir(p: NpcPasta) {
		menu = null;
		const ids = [p.id, ...descendentes(p.id)];
		const qtd = npcs.filter((n) => n.pastaId && ids.includes(n.pastaId)).length;
		const { error } = await supabase().from('npc_pastas').delete().eq('id', p.id);
		if (error) return void toasts.mostrar('Não foi possível excluir a pasta.', 'erro');
		// o banco sobe o conteúdo para a pasta de cima; aqui também
		pastas = pastas.filter((x) => x.id !== p.id).map((x) => (x.pai_id === p.id ? { ...x, pai_id: p.pai_id } : x));
		for (const n of npcs.filter((x) => x.pastaId === p.id)) n.pastaId = p.pai_id;
		const cima = p.pai_id ? (pastas.find((x) => x.id === p.pai_id)?.nome ?? 'a pasta de cima') : 'Sem pasta';
		aviso = qtd ? `Os ${qtd} NPCs voltam para “${cima}”. Nenhum NPC é apagado.` : `Pasta “${p.nome}” excluída.`;
	}
	async function moverPasta(id: string, pai: string | null) {
		if (id === pai || (pai && descendentes(id).includes(pai))) return;
		const antes = pastas;
		pastas = pastas.map((p) => (p.id === id ? { ...p, pai_id: pai } : p));
		const { error } = await supabase().from('npc_pastas').update({ pai_id: pai }).eq('id', id);
		if (error) {
			pastas = antes;
			toasts.mostrar(/3 níveis/.test(error.message) ? 'As pastas vão até 3 níveis.' : 'Não foi possível mover a pasta.', 'erro');
		}
	}

	// ------------------------------------------------------------------ arrastar
	const arrastar = (e: DragEvent, dados: object) => {
		e.dataTransfer?.setData('text/x-mesa', JSON.stringify(dados));
		if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
	};
	function soltarNaPasta(e: DragEvent, pasta: string | null) {
		destino = null;
		const d = e.dataTransfer?.getData('text/x-mesa');
		if (!d) return;
		e.preventDefault();
		const x = JSON.parse(d) as { tipo: string; id: string };
		if (x.tipo === 'npc' || x.tipo === 'ficha') {
			const n = npcs.find((k) => k.id === x.id);
			if (n) onMoverNpc(n, pasta);
		} else if (x.tipo === 'pasta') moverPasta(x.id, pasta);
	}

	const olho = (t: MesaToken) => mesa.atualizarToken(t.id, { visivel: !t.visivel });
	const RANK: Record<string, string> = { genin: 'GENIN', chunin: 'CHUNIN', jounin: 'JOUNIN', anbu: 'ANBU', lendario: 'LENDÁRIO' };
	const sigla = (n: string) => n.split(/\s+/).filter((w) => w.length > 2).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || n.slice(0, 2).toUpperCase();
	const pequeno = 'font-pixel text-[11px] leading-none font-bold tracking-[0.08em] text-mut';
</script>

{#snippet olhoSvg(escondido: boolean)}
	<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" class="fill-none stroke-current stroke-2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><rect x="10" y="10" width="4" height="4" />{#if escondido}<path d="M3 21L21 3" />{/if}</svg>
{/snippet}

{#snippet linhaToken(t: MesaToken)}
	<div class="flex min-h-11 items-center gap-1.5 py-0.5 pr-2 pl-3" style="opacity: {t.visivel ? 1 : 0.6}">
		<button type="button" class="flex min-w-0 flex-1 items-center gap-2 text-left" title="Centralizar e abrir ficha" onclick={() => onAbrir(t)}>
			<span class="flex h-8 w-8 flex-none items-center justify-center border-2 bg-b1 font-pixel text-xs font-bold" style="border-color: {corCss(mesa.corDe(mesa.donoDe(t)))}">{t.sigla || sigla(t.nome)}</span>
			<span class="flex min-w-0 flex-col gap-0.5"><span class="truncate text-sm leading-[18px] font-semibold">{t.nome}{t.membro ? ` ${t.membro}` : ''}</span><span class="text-xs leading-4 text-mut">{subDe(t)}</span></span>
		</button>
		{#if mesa.daVez.has(t.id)}<span class="bg-acc px-1 py-[3px] font-pixel text-[11px] leading-none font-bold text-[var(--accfg)]">VEZ</span>{/if}
		{#if mesa.mestre && !t.personagem_id}
			<button type="button" class="flex h-9 w-9 flex-none items-center justify-center border-2 border-b3" aria-label={t.visivel ? 'Esconder' : 'Revelar'} title="{t.visivel ? 'Esconder' : 'Revelar'} (H)" onclick={() => olho(t)}>{@render olhoSvg(!t.visivel)}</button>
		{/if}
	</div>
{/snippet}

<aside aria-label="Elenco" class="flex min-h-0 flex-col bg-b2 {celular || embutido ? 'h-full w-full flex-1' : 'w-[280px] flex-none border-r-2 border-b3'}">
	<div class="{embutido ? 'hidden' : 'flex'} h-11 flex-none items-center gap-2 border-b-2 border-b3 bg-b0 pr-1.5 pl-3">
		<img src="/icons/nav/ic-nav-npcs-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />
		<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">ELENCO</span>
		<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label={celular ? 'Fechar Elenco' : 'Recolher Elenco'} title={celular ? 'Fechar' : 'Recolher'} onclick={() => (onFechar ? onFechar() : (ui.elencoAberto = false))}>{celular ? '✕' : '«'}</button>
	</div>
	<div class="flex min-h-0 flex-1 flex-col overflow-auto">
		<div class="px-3 pt-2.5 pb-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">EM CENA ({emCena.length})</div>
		{#if !emCena.length}<span class="px-3 pt-1 pb-2.5 text-[13px] leading-[18px] text-mut">Ninguém no quadro ainda.</span>{/if}
		{#if pcsEmCena.length}<span class="px-3 pt-1.5 pb-0.5 {pequeno}">PERSONAGENS</span>{/if}
		{#each pcsEmCena as t (t.id)}{@render linhaToken(t)}{/each}
		{#if npcsEmCena.length}<span class="px-3 pt-2 pb-0.5 {pequeno}">NPCS</span>{/if}
		{#each npcsEmCena as t (t.id)}{@render linhaToken(t)}{/each}

		{#if foraDaCena.length && !mesa.somenteLeitura}
			<div class="mt-2 border-t-2 border-b3 px-3 pt-2.5 pb-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">{mesa.mestre ? 'PERSONAGENS' : 'FORA DA CENA'}</div>
			{#each foraDaCena as p (p.id)}
				<div class="flex min-h-10 cursor-grab items-center gap-2 px-3 py-1" draggable="true" role="listitem" title="Arraste para o quadro" ondragstart={(e) => arrastar(e, { tipo: 'pc', id: p.id })}>
					<span class="flex h-7 w-7 flex-none items-center justify-center border-2 font-pixel text-[11px] font-bold" style="border-color: {corCss(mesa.corDe(p.jogadorId))}">{sigla(p.nome)}</span>
					<span class="flex min-w-0 flex-1 flex-col gap-0.5"><span class="text-[13px] leading-[17px] font-semibold">{p.nome}</span><span class="text-xs leading-4 text-mut">{p.sub}</span></span>
					<button type="button" class="min-h-8 border-2 border-b3 px-1.5 font-pixel text-[11px] font-bold" onclick={() => onColocar(JSON.stringify({ tipo: 'pc', id: p.id }))}>{mesa.mestre ? 'PÔR' : 'ENTRAR'}</button>
				</div>
			{/each}
		{/if}

		{#if mesa.mestre}
			<div class="mt-2 flex flex-col gap-2 border-t-2 border-b3 px-3 pt-2.5 pb-2">
				<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">NPCS</span>
				<div class="flex gap-1.5">
					<input bind:value={busca} placeholder="Buscar NPC" aria-label="Buscar NPC" class="h-9 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2 text-[13px] font-medium text-fg" />
					<button type="button" aria-pressed={soNaCena} class="min-h-9 border-2 px-2 font-pixel text-[11px] font-bold {soNaCena ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => (soNaCena = !soNaCena)}>NA CENA</button>
				</div>
				<div class="flex gap-1">
					<button type="button" class="min-h-9 flex-1 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => novaPasta(null)}>+ PASTA</button>
					<a class="flex min-h-9 flex-1 items-center justify-center border-2 border-b3 font-pixel text-[11px] font-bold" href="/campanhas/{mesa.campanha}/npcs" target="_blank" rel="noopener">+ NPC</a>
					<button type="button" class="flex min-h-9 flex-[1.4] items-center justify-center border-2 border-b3 font-pixel text-[11px] font-bold" onclick={onBestiario}>DO BESTIÁRIO</button>
				</div>
			</div>
			{#if aviso}
				<div role="status" class="mx-3 mb-2 flex items-start gap-2 border-2 border-info px-2.5 py-2 text-xs leading-[17px]"><span class="flex-1">{aviso}</span><button type="button" class="font-pixel text-xs" aria-label="Fechar aviso" onclick={() => (aviso = '')}>✕</button></div>
			{/if}
			{#if !pastas.length}
				<div class="mx-3 mb-2 flex flex-col items-start gap-2 border-2 border-dashed border-b3 p-3">
					<span class="text-[13px] leading-[18px] text-mut">Organize seus NPCs em pastas, por arco, lugar ou facção.</span>
					<button type="button" class="btn-jogo btn-primario min-h-9" onclick={() => novaPasta(null)}>CRIAR PASTA</button>
				</div>
			{/if}
			<div role="tree" tabindex="-1" aria-label="Pastas de NPCs" class="flex flex-col pb-4" ondragover={(e) => e.preventDefault()} ondrop={(e) => soltarNaPasta(e, null)}>
				{#each arvore as l, i (i)}
					{@const pad = `${12 + l.nivel * 16}px`}
					{#if l.tipo === 'pasta'}
						{#if renomeando?.id === l.p.id}
							<div class="py-1 pr-2" style="padding-left: {pad}">
								<!-- svelte-ignore a11y_autofocus -->
								<input bind:value={renomeando.nome} autofocus aria-label="Nome da pasta" class="h-9 w-full border-2 border-[var(--vermelhao)] bg-b1 px-2 text-[13px] font-semibold text-fg" onkeydown={(e) => (e.key === 'Enter' ? renomear() : e.key === 'Escape' && (renomeando = null))} onblur={renomear} />
							</div>
						{:else}
							<div
								role="treeitem"
								aria-selected="false"
								aria-expanded={!!abertas[l.p.id]}
								tabindex="-1"
								draggable="true"
								class="flex min-h-10 items-center gap-0.5 border-t-2 pr-1.5 {destino === l.p.id ? 'border-[var(--vermelhao)] bg-b3' : 'border-transparent'}"
								style="padding-left: {pad}"
								ondragstart={(e) => arrastar(e, { tipo: 'pasta', id: l.p.id })}
								ondragover={(e) => {
									e.preventDefault();
									e.stopPropagation();
									destino = l.p.id;
								}}
								ondragleave={() => destino === l.p.id && (destino = null)}
								ondrop={(e) => {
									e.stopPropagation();
									soltarNaPasta(e, l.p.id);
								}}
							>
								<button type="button" class="flex min-h-9 min-w-0 flex-1 items-center gap-1.5 text-left" title="Clique abre · clique duplo renomeia" onclick={() => alternar(l.p.id)} ondblclick={() => (renomeando = { id: l.p.id, nome: l.p.nome })} onkeydown={(e) => e.key === 'F2' && (renomeando = { id: l.p.id, nome: l.p.nome })}>
									<span class="w-3 font-pixel text-xs font-bold text-mut">{abertas[l.p.id] ? '▾' : '▸'}</span>
									<span class="truncate text-[13px] leading-[17px] font-semibold">{l.p.nome}</span>
									<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-mut">{l.qtd}</span>
								</button>
								<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label="Menu da pasta {l.p.nome}" onclick={() => (menu = menu === l.p.id ? null : l.p.id)}>⋯</button>
							</div>
							{#if menu === l.p.id}
								<div role="menu" class="mr-2 mb-1 flex flex-col border-2 border-b3 bg-sup shadow-[4px_4px_0_var(--sombra)]" style="margin-left: {pad}">
									{#each [['Renomear', () => ((renomeando = { id: l.p.id, nome: l.p.nome }), (menu = null))], ['Nova subpasta', () => ((menu = null), novaPasta(l.p.id))], ['Colocar todos na cena', () => ((menu = null), onColocar(JSON.stringify({ tipo: 'pasta', id: l.p.id })))], ['Excluir', () => excluir(l.p)]] as const as [n, f] (n)}
										<button type="button" role="menuitem" class="min-h-9 border-b-2 border-b2 px-2.5 text-left text-[13px] font-medium" onclick={f}>{n}</button>
									{/each}
								</div>
							{/if}
						{/if}
					{:else if l.tipo === 'npc'}
						{@const dentro = naCena(l.n)}
						{@const escondido = !!mesa.ocultos[l.n.id]}
						{@const t = mesa.tokens.find((k) => (l.n.tipo === 'npc' ? k.npc_id === l.n.id : k.personagem_id === l.n.id))}
						<div role="treeitem" aria-selected="false" tabindex="-1" draggable="true" class="flex min-h-10 cursor-grab items-center gap-1.5 py-0.5 pr-1.5" style="padding-left: {pad}" title="Arraste para o quadro ou para outra pasta" ondragstart={(e) => arrastar(e, { tipo: l.n.tipo, id: l.n.id })}>
							<button type="button" class="flex min-w-0 flex-1 items-center gap-2 text-left" onclick={() => (t ? onAbrir(t) : onColocar(JSON.stringify({ tipo: l.n.tipo, id: l.n.id })))}>
								<span class="relative flex h-7 w-7 flex-none items-center justify-center border-2 font-pixel text-[11px] font-bold" style="border-color: {corCss(mesa.corDe(mesa.eu))}">
									{sigla(l.n.nome)}
									{#if dentro}<span title="Na cena" class="absolute -top-1 -right-1 h-2 w-2 border-2 border-b2 bg-ok"></span>{/if}
								</span>
								<span class="flex min-w-0 flex-col gap-0.5">
									<span class="flex items-center gap-1.5 text-[13px] leading-[17px] font-semibold"><span class="truncate">{l.n.nome}</span>{#if l.n.membros > 1}<span class="font-pixel text-[11px] text-mut">×{l.n.membros}</span>{/if}</span>
									<span class="flex items-center gap-1.5"><span class="border-2 border-field px-[3px] py-0.5 font-pixel text-[10px] leading-none font-bold tracking-[0.05em] text-mut">{RANK[l.n.rank] ?? l.n.rank.toUpperCase()}</span><span class="text-[11px] leading-[14px] text-mut">{dentro ? 'na cena' : ''}</span></span>
								</span>
							</button>
							<button type="button" aria-pressed={escondido} class="flex h-8 w-8 flex-none items-center justify-center border-2 font-pixel text-[11px] leading-none font-bold {escondido ? 'border-warn text-warn' : 'border-b3 text-mut'}" aria-label={escondido ? 'Mostrar o nome aos jogadores' : 'Esconder o nome dos jogadores'} title={escondido ? 'Nome escondido: os jogadores veem ???. Clique para mostrar.' : 'Esconder o nome dos jogadores (???)'} onclick={() => mesa.definirNomeOculto(l.n.tipo, l.n.id, !escondido)}>???</button>
							{#if t}
								<button type="button" class="flex h-8 w-8 flex-none items-center justify-center border-2 border-b3" aria-label={t.visivel ? 'Esconder' : 'Revelar'} onclick={() => olho(t)}>{@render olhoSvg(!t.visivel)}</button>
							{/if}
						</div>
					{:else}
						<span class="py-1.5 pr-2 text-xs leading-4 text-mut italic" style="padding-left: {pad}">{l.texto}</span>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</aside>
