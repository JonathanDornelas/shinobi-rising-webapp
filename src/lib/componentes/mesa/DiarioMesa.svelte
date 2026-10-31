<script lang="ts">
	// Diário do grupo (planos/mesa-ferramentas-qol.md): missões, NPCs conhecidos, pistas e notas da campanha, que todos
	// escrevem durante a sessão. Entrada pública: o grupo inteiro lê e edita; privada: só quem escreveu. Chega ao vivo.
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { EntradaDiario } from '#lib/supabase/banco.ts';

	let { mesa, aoFechar }: { mesa: Mesa; aoFechar: () => void } = $props();

	type Tipo = EntradaDiario['tipo'];
	const ABAS: [Tipo, string, string][] = [
		['missao', 'Missões', 'Missão nova'],
		['npc', 'NPCs', 'NPC conhecido'],
		['pista', 'Pistas', 'Pista nova'],
		['nota', 'Notas', 'Nota nova']
	];
	let aba = $state<Tipo>('missao');
	/** a entrada sendo escrita (nova, sem id) ou editada */
	let rascunho = $state<{ id?: string; titulo: string; texto: string; privado: boolean } | null>(null);
	let salvando = $state(false);

	const entradas = $derived(
		(Array.isArray(mesa.diario) ? mesa.diario : [])
			.filter((e) => e.tipo === aba)
			// missões abertas primeiro; dentro de cada grupo, as mais novas em cima
			.sort((a, b) => Number(a.feito) - Number(b.feito) || b.criado_em.localeCompare(a.criado_em))
	);
	const contagem = (t: Tipo) => (Array.isArray(mesa.diario) ? mesa.diario.filter((e) => e.tipo === t && !e.feito).length : 0);
	const nomeDe = (id: string) => mesa.membro(id)?.nome ?? 'Alguém';
	const podeApagar = (e: EntradaDiario) => !mesa.somenteLeitura && (e.autor_id === mesa.eu || (mesa.mestre && !e.privado));

	async function salvar() {
		const r = rascunho;
		if (!r || !r.titulo.trim() || salvando) return;
		salvando = true;
		const feito = r.id ? (Array.isArray(mesa.diario) ? mesa.diario.find((e) => e.id === r.id)?.feito : false) : false;
		const ok = await mesa.salvarEntrada({ id: r.id, tipo: aba, titulo: r.titulo.trim().slice(0, 80), texto: r.texto.slice(0, 4000), privado: r.privado, feito: !!feito });
		salvando = false;
		if (ok) rascunho = null;
	}
</script>

<div role="dialog" aria-label="Diário do grupo" class="pointer-events-auto flex max-h-full w-[360px] max-w-[calc(100vw-24px)] flex-col border-2 border-[var(--vermelhao-lo)] bg-b2 shadow-[6px_6px_0_var(--sombra)]">
	<header class="flex flex-none items-center gap-2 border-b-2 border-b3 bg-b0 py-1.5 pr-1 pl-3">
		<h2 class="m-0 flex-1 font-mincho text-[17px] leading-6 font-bold">Diário do grupo</h2>
		<button type="button" class="h-8 w-8 font-pixel text-sm" aria-label="Fechar o diário" onclick={aoFechar}>✕</button>
	</header>
	<div role="tablist" aria-label="Partes do diário" class="flex flex-none border-b-2 border-b3 bg-b0">
		{#each ABAS as [id, nome] (id)}
			{@const n = contagem(id)}
			<button type="button" role="tab" aria-selected={aba === id} class="flex min-h-9 flex-1 items-center justify-center gap-1 text-xs font-semibold {aba === id ? 'bg-b2 text-title shadow-[inset_0_-3px_0_var(--vermelhao)]' : 'text-mut hover:text-fg'}" onclick={() => ((aba = id), (rascunho = null))}>
				{nome}{#if n}<span class="font-pixel text-[10px] text-mut">{n}</span>{/if}
			</button>
		{/each}
	</div>

	<div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5">
		{#if mesa.diario === null}
			<p class="m-0 text-sm text-mut">Abrindo o diário…</p>
		{:else}
			{#if rascunho && !rascunho.id}
				{@render formulario()}
			{:else if !mesa.somenteLeitura}
				<button type="button" class="btn-jogo min-h-9 border-2 border-dashed border-b3 text-xs hover:border-mut" onclick={() => (rascunho = { titulo: '', texto: '', privado: false })}>+ {ABAS.find((a) => a[0] === aba)?.[2].toUpperCase()}</button>
			{/if}
			{#each entradas as e (e.id)}
				{#if rascunho?.id === e.id}
					{@render formulario()}
				{:else}
					<article class="flex flex-col gap-1 border-2 border-b3 bg-b1 px-2.5 py-2 {e.feito ? 'opacity-60' : ''}">
						<div class="flex items-start gap-2">
							{#if e.tipo === 'missao'}
								<input type="checkbox" class="mt-1 flex-none" checked={e.feito} aria-label="Missão cumprida: {e.titulo}" disabled={mesa.somenteLeitura} onchange={(ev) => mesa.salvarEntrada({ ...e, feito: ev.currentTarget.checked })} />
							{/if}
							<h3 class="m-0 min-w-0 flex-1 text-sm leading-5 font-semibold {e.feito ? 'line-through' : ''}">{e.titulo}</h3>
							{#if e.privado}<span class="flex-none border-2 border-b3 px-1 py-0.5 font-pixel text-[10px] leading-none text-mut" title="Só você vê">SÓ VOCÊ</span>{/if}
						</div>
						{#if e.texto}<p class="m-0 text-[13px] leading-[18px] whitespace-pre-line">{e.texto}</p>{/if}
						<div class="flex items-center gap-3 text-xs text-mut">
							<span class="flex-1 truncate">{nomeDe(e.autor_id)}</span>
							{#if !mesa.somenteLeitura && (!e.privado || e.autor_id === mesa.eu)}<button type="button" class="font-semibold text-link underline underline-offset-2" onclick={() => (rascunho = { id: e.id, titulo: e.titulo, texto: e.texto, privado: e.privado })}>Editar</button>{/if}
							{#if podeApagar(e)}<button type="button" class="font-semibold text-link underline underline-offset-2" onclick={() => mesa.apagarEntrada(e.id)}>Apagar</button>{/if}
						</div>
					</article>
				{/if}
			{:else}
				<p class="m-0 text-[13px] leading-[18px] text-mut">
					{aba === 'missao' ? 'Nenhuma missão anotada. O que o grupo precisa fazer?' : aba === 'npc' ? 'Nenhum NPC anotado. Quem o grupo já conheceu?' : aba === 'pista' ? 'Nenhuma pista ainda. O que vocês descobriram?' : 'Nenhuma nota. Anote o que não pode ser esquecido.'}
				</p>
			{/each}
		{/if}
	</div>
</div>

{#snippet formulario()}
	{#if rascunho}
		<form class="flex flex-col gap-2 border-2 border-[var(--acc)] bg-b1 p-2.5" onsubmit={(ev) => (ev.preventDefault(), void salvar())}>
			<!-- svelte-ignore a11y_autofocus -->
			<input bind:value={rascunho.titulo} maxlength="80" placeholder={aba === 'npc' ? 'Nome do NPC' : 'Título'} aria-label="Título" autofocus class="h-9 border-2 border-b3 bg-b2 px-2 text-sm font-semibold text-fg" />
			<textarea bind:value={rascunho.texto} maxlength="4000" rows="4" placeholder="Detalhes (opcional)" aria-label="Texto" class="resize-y border-2 border-b3 bg-b2 p-2 text-[13px] leading-[18px] text-fg"></textarea>
			<label class="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" bind:checked={rascunho.privado} disabled={!!rascunho.id && (Array.isArray(mesa.diario) ? mesa.diario.find((e) => e.id === rascunho?.id)?.autor_id !== mesa.eu : false)} />Só eu vejo</label>
			<span class="flex gap-1.5">
				<button type="submit" class="btn-jogo btn-primario min-h-8 px-3 text-xs" disabled={!rascunho.titulo.trim() || salvando}>{rascunho.id ? 'SALVAR' : 'ANOTAR'}</button>
				<button type="button" class="btn-jogo min-h-8 border-2 border-b3 px-3 text-xs" onclick={() => (rascunho = null)}>CANCELAR</button>
			</span>
		</form>
	{/if}
{/snippet}
