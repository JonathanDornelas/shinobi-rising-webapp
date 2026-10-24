<script lang="ts">
	// N1 · Pastas de NPCs (as mesmas da Mesa): até 3 níveis, com contagem, criar, renomear, aninhar arrastando e excluir
	// (o conteúdo sobe para a pasta de cima). Clicar numa pasta filtra os cards; arrastar um card para ela o move.
	import { onMount } from 'svelte';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { NpcPasta } from '#lib/supabase/banco.ts';

	let {
		campanha,
		pastas = $bindable(),
		sel = $bindable(),
		contar,
		ativa,
		onMoverNpc
	}: {
		campanha: string;
		pastas: NpcPasta[];
		/** 'todas', 'sem' (sem pasta) ou o id da pasta */
		sel: string;
		/** NPCs numa pasta (com as subpastas), em "sem" ou em "todas" */
		contar: (pasta: string) => number;
		ativa: boolean;
		onMoverNpc: (npc: string, pasta: string | null) => void;
	} = $props();

	let abertas = $state<Record<string, boolean>>({});
	let renomeando = $state<{ id: string; nome: string } | null>(null);
	let menu = $state<string | null>(null);
	let destino = $state<string | null>(null);
	onMount(() => (abertas = ler<Record<string, boolean>>('npc-pastas-abertas', {})));

	const filhos = (pai: string | null) => pastas.filter((p) => p.pai_id === pai).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
	export const descendentes = (id: string): string[] => pastas.filter((p) => p.pai_id === id).flatMap((p) => [p.id, ...descendentes(p.id)]);
	const nivelDe = (id: string | null): number => (id ? 1 + nivelDe(pastas.find((p) => p.id === id)?.pai_id ?? null) : 0);
	const linhas = $derived.by(() => {
		const out: { p: NpcPasta; nivel: number }[] = [];
		const ramo = (pai: string | null, nivel: number) => {
			for (const p of filhos(pai)) {
				out.push({ p, nivel });
				if (abertas[p.id]) ramo(p.id, nivel + 1);
			}
		};
		ramo(null, 0);
		return out;
	});

	function alternar(id: string) {
		abertas = { ...abertas, [id]: !abertas[id] };
		gravar('npc-pastas-abertas', abertas);
	}
	async function nova(pai: string | null) {
		menu = null;
		if (pai && nivelDe(pai) >= 3) return void toasts.mostrar('As pastas vão até 3 níveis.', 'aviso');
		const { data, error } = await supabase().from('npc_pastas').insert({ campanha_id: campanha, nome: 'Nova pasta', pai_id: pai, ordem: pastas.length }).select('*').single();
		if (error || !data) return void toasts.mostrar('Não foi possível criar a pasta.', 'erro');
		pastas = [...pastas, data as NpcPasta];
		if (pai) abertas = { ...abertas, [pai]: true };
		renomeando = { id: data.id, nome: data.nome };
	}
	async function renomear() {
		const r = renomeando;
		renomeando = null;
		if (!r?.nome.trim()) return;
		const nome = r.nome.trim().slice(0, 60);
		pastas = pastas.map((p) => (p.id === r.id ? { ...p, nome } : p));
		const { error } = await supabase().from('npc_pastas').update({ nome }).eq('id', r.id);
		if (error) toasts.mostrar('Não foi possível renomear a pasta.', 'erro');
	}
	async function excluir(p: NpcPasta) {
		menu = null;
		const qtd = contar(p.id);
		const { error } = await supabase().from('npc_pastas').delete().eq('id', p.id);
		if (error) return void toasts.mostrar('Não foi possível excluir a pasta.', 'erro');
		pastas = pastas.filter((x) => x.id !== p.id).map((x) => (x.pai_id === p.id ? { ...x, pai_id: p.pai_id } : x));
		// os NPCs da pasta sobem junto (o banco faz o mesmo)
		onMoverNpc(`pasta:${p.id}`, p.pai_id);
		if (sel === p.id) sel = p.pai_id ?? 'todas';
		const cima = p.pai_id ? (pastas.find((x) => x.id === p.pai_id)?.nome ?? 'a pasta de cima') : 'Sem pasta';
		toasts.mostrar(qtd ? `Os ${qtd} NPCs voltam para “${cima}”. Nenhum NPC é apagado.` : `Pasta “${p.nome}” excluída.`, 'sucesso');
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
	function soltar(e: DragEvent, pasta: string | null) {
		destino = null;
		const npc = e.dataTransfer?.getData('text/x-npc');
		const p = e.dataTransfer?.getData('text/x-npc-pasta');
		if (!npc && !p) return;
		e.preventDefault();
		if (npc) onMoverNpc(npc, pasta);
		else if (p) moverPasta(p, pasta);
	}
	const sobre = (e: DragEvent, id: string) => {
		if (!ativa) return;
		e.preventDefault();
		destino = id;
	};
	const item = 'flex min-h-10 w-full items-center gap-1.5 border-t-2 pr-1 text-left text-[13px] leading-[17px] font-semibold';
</script>

<nav aria-label="Pastas de NPCs" class="flex flex-col border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]">
	<div class="flex items-center gap-2 border-b-2 border-b3 bg-b0 px-3 py-2">
		<span class="flex-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">PASTAS</span>
		{#if ativa}<button type="button" class="min-h-8 border-2 border-b3 px-2 font-pixel text-[11px] font-bold" onclick={() => nova(null)}>+ PASTA</button>{/if}
	</div>
	{#each [['todas', 'Todos os NPCs'], ['sem', 'Sem pasta']] as const as [id, n] (id)}
		<button
			type="button"
			aria-pressed={sel === id}
			class="{item} pl-3 {destino === id ? 'border-[var(--vermelhao)] bg-b3' : sel === id ? 'border-transparent bg-grena text-papel' : 'border-transparent'}"
			onclick={() => (sel = id)}
			ondragover={(e) => id === 'sem' && sobre(e, id)}
			ondragleave={() => destino === id && (destino = null)}
			ondrop={(e) => id === 'sem' && soltar(e, null)}
		>
			<span class="flex-1">{n}</span><span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold">{contar(id)}</span>
		</button>
	{/each}
	{#if !pastas.length}
		<span class="px-3 py-2.5 text-xs leading-4 text-mut">Organize os NPCs por arco, lugar ou facção. Arraste os cards para as pastas.</span>
	{/if}
	{#each linhas as { p, nivel } (p.id)}
		{#if renomeando?.id === p.id}
			<div class="py-1 pr-2" style="padding-left: {12 + nivel * 16}px">
				<!-- svelte-ignore a11y_autofocus -->
				<input bind:value={renomeando.nome} autofocus aria-label="Nome da pasta" class="h-9 w-full border-2 border-[var(--vermelhao)] bg-b1 px-2 text-[13px] font-semibold text-fg" onkeydown={(e) => (e.key === 'Enter' ? renomear() : e.key === 'Escape' && (renomeando = null))} onblur={renomear} />
			</div>
		{:else}
			<div
				role="presentation"
				draggable={ativa}
				class="flex items-center border-t-2 {destino === p.id ? 'border-[var(--vermelhao)] bg-b3' : sel === p.id ? 'border-transparent bg-grena text-papel' : 'border-transparent'}"
				style="padding-left: {8 + nivel * 16}px"
				ondragstart={(e) => e.dataTransfer?.setData('text/x-npc-pasta', p.id)}
				ondragover={(e) => sobre(e, p.id)}
				ondragleave={() => destino === p.id && (destino = null)}
				ondrop={(e) => soltar(e, p.id)}
			>
				<button type="button" class="w-5 font-pixel text-xs font-bold text-mut" aria-label={abertas[p.id] ? 'Fechar pasta' : 'Abrir pasta'} onclick={() => alternar(p.id)}>{filhos(p.id).length ? (abertas[p.id] ? '▾' : '▸') : '·'}</button>
				<button type="button" aria-pressed={sel === p.id} class="flex min-h-10 min-w-0 flex-1 items-center gap-1.5 text-left text-[13px] leading-[17px] font-semibold" title="Clique filtra · clique duplo renomeia" onclick={() => (sel = p.id)} ondblclick={() => ativa && (renomeando = { id: p.id, nome: p.nome })}>
					<span class="truncate">{p.nome}</span>
					<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-[11px] leading-none font-bold">{contar(p.id)}</span>
				</button>
				{#if ativa}<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label="Menu da pasta {p.nome}" onclick={() => (menu = menu === p.id ? null : p.id)}>⋯</button>{/if}
			</div>
			{#if menu === p.id}
				<div role="menu" class="mr-2 mb-1 flex flex-col border-2 border-b3 bg-b0 shadow-[4px_4px_0_#000]" style="margin-left: {12 + nivel * 16}px">
					<button type="button" role="menuitem" class="min-h-9 border-b-2 border-b2 px-2.5 text-left text-[13px] font-medium" onclick={() => ((renomeando = { id: p.id, nome: p.nome }), (menu = null))}>Renomear</button>
					<button type="button" role="menuitem" class="min-h-9 border-b-2 border-b2 px-2.5 text-left text-[13px] font-medium" onclick={() => nova(p.id)}>Nova subpasta</button>
					<button type="button" role="menuitem" class="min-h-9 px-2.5 text-left text-[13px] font-medium text-link" onclick={() => excluir(p)}>Excluir pasta</button>
				</div>
			{/if}
		{/if}
	{/each}
</nav>
