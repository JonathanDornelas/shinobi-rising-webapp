<script lang="ts">
	// O painel do objeto selecionado (alfinete, imagem ou texto): editar o texto, a cor e a fonte, empilhar, esconder do
	// grupo, travar, duplicar e excluir. O Mestre mexe em tudo; cada pessoa, nos próprios alfinetes e textos.
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import { camadasDaCena } from '#lib/mesa/camadas.ts';
	import { CORES_OBJETO, FONTES, TAMANHOS_TEXTO } from '#lib/mesa/objetos.ts';

	let { mesa, ui, classe = '' }: { mesa: Mesa; ui: UiMesa; classe?: string } = $props();
	const o = $derived(ui.objSel ? (mesa.objetos.find((x) => x.id === ui.objSel) ?? null) : null);
	const pode = $derived(!!o && mesa.podeMexerObjeto(o));
	/** As camadas de imagens da cena, de cima para baixo (a dos tokens não recebe imagem). */
	const camadasDeImagens = $derived(camadasDaCena(mesa.cena?.camadas).filter((c) => c.tipo !== 'tokens').reverse());
	const nomeTipo = { alfinete: 'Alfinete', imagem: 'Imagem', texto: 'Texto' } as const;
	const topo = $derived(mesa.objetos.reduce((m, x) => Math.max(m, x.ordem), 0));
	const fundo = $derived(mesa.objetos.reduce((m, x) => Math.min(m, x.ordem), 0));
	const btn = 'min-h-9 border-2 border-b3 px-2.5 font-pixel text-[11px] leading-none font-bold disabled:opacity-40';
	const dono = $derived(o ? (mesa.membro(o.autor_id)?.nome ?? '?') : '');

	async function duplicar() {
		if (!o) return;
		const { id: _i, criado_em: _c, campanha_id: _k, cena_id: _s, autor_id: _a, ...resto } = o;
		const novo = await mesa.colocarObjeto({ ...resto, x: o.x + 1, y: o.y + 1 });
		if (novo) ui.objSel = novo.id;
	}
	async function excluir() {
		if (!o) return;
		const id = o.id;
		ui.objSel = null;
		await mesa.removerObjeto(id);
	}
</script>

{#if o && pode}
	<div role="group" aria-label="{nomeTipo[o.tipo]} selecionado" class="pointer-events-auto flex w-[420px] max-w-full flex-col gap-2 border-2 border-b3 bg-sup p-2.5 shadow-[4px_4px_0_var(--sombra)] {classe}">
		<div class="flex items-center gap-2">
			<span class="flex-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">{nomeTipo[o.tipo].toUpperCase()}{mesa.mestre && o.autor_id !== mesa.eu ? ` DE ${dono.toUpperCase()}` : ''}</span>
			<button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-xs" aria-label="Fechar o painel" onclick={() => (ui.objSel = null)}>✕</button>
		</div>

		{#if o.tipo === 'alfinete'}
			<label class="flex flex-col gap-1 text-xs font-semibold text-mut">Nome do alfinete
				<input class="h-9 border-2 border-b3 bg-b1 px-2 text-sm font-medium text-fg" maxlength="40" placeholder="Armadilha, cofre, saída…" value={o.texto ?? ''} onchange={(e) => mesa.atualizarObjeto(o.id, { texto: e.currentTarget.value.trim() || null })} />
			</label>
		{:else if o.tipo === 'texto'}
			<label class="flex flex-col gap-1 text-xs font-semibold text-mut">Texto
				<textarea class="min-h-14 resize-y border-2 border-b3 bg-b1 px-2 py-1.5 text-sm font-medium text-fg" maxlength="300" rows="2" value={o.texto ?? ''} onchange={(e) => e.currentTarget.value.trim() && mesa.atualizarObjeto(o.id, { texto: e.currentTarget.value.trim() })}></textarea>
			</label>
			<div role="radiogroup" aria-label="Fonte" class="grid grid-cols-4 gap-1">
				{#each Object.entries(FONTES) as [k, f] (k)}
					<button type="button" role="radio" aria-checked={o.fonte === k} class="min-h-9 border-2 px-1 text-xs {o.fonte === k ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" style="font-family: {f.familia}; font-weight: {f.peso}" onclick={() => mesa.atualizarObjeto(o.id, { fonte: k as keyof typeof FONTES })}>{f.nome}</button>
				{/each}
			</div>
			<div role="radiogroup" aria-label="Tamanho" class="flex border-2 border-b3">
				{#each TAMANHOS_TEXTO as [t, n] (t)}
					<button type="button" role="radio" aria-checked={Math.abs((o.tamanho ?? 1) - t) < 0.05} class="min-h-9 flex-1 font-pixel text-[11px] font-bold {Math.abs((o.tamanho ?? 1) - t) < 0.05 ? 'bg-grena text-papel' : ''}" onclick={() => mesa.atualizarObjeto(o.id, { tamanho: t })}>{n}</button>
				{/each}
			</div>
		{/if}

		{#if o.tipo !== 'imagem'}
			<div role="radiogroup" aria-label="Cor" class="flex flex-wrap gap-1.5">
				{#each CORES_OBJETO as c (c)}
					<button type="button" role="radio" aria-checked={o.cor === c} aria-label={c} class="h-7 w-7 border-2 {o.cor === c ? 'border-fg' : 'border-b3'}" style="background: {c}" onclick={() => mesa.atualizarObjeto(o.id, { cor: c })}></button>
				{/each}
			</div>
		{/if}

		{#if o.tipo === 'imagem'}
			<div class="flex flex-wrap items-center gap-1.5 text-xs text-mut">
				<span class="font-semibold">Tamanho</span><span class="font-pixel font-bold text-fg">{o.largura} × {o.altura} {mesa.cena?.visao === 'isometrica' ? 'quadr.' : 'm'}</span>
<span class="ml-auto">{mesa.cena?.visao === 'isometrica' ? 'Na vista isométrica a imagem fica de pé sobre o ponto de apoio: arraste para mover e o quadrado de baixo para redimensionar.' : 'Arraste o canto para redimensionar e a bolinha para girar (Shift trava de 15 em 15°).'}</span>
			</div>
		{/if}

		<div class="flex flex-wrap gap-1.5">
			{#if mesa.mestre}
				<button type="button" role="switch" aria-checked={o.visivel} class="{btn} {o.visivel ? '' : 'border-warn text-warn'}" title={o.visivel ? 'O grupo vê este objeto' : 'Só o Mestre vê este objeto'} onclick={() => mesa.atualizarObjeto(o.id, { visivel: !o.visivel })}>{o.visivel ? 'VISÍVEL' : 'ESCONDIDO'}</button>
				<button type="button" role="switch" aria-checked={o.travado} class="{btn} {o.travado ? 'border-[var(--vermelhao)]' : ''}" title="Travado: só o Mestre mexe, e o dono não" onclick={() => mesa.atualizarObjeto(o.id, { travado: !o.travado })}>{o.travado ? 'TRAVADO' : 'TRAVAR'}</button>
			{/if}
		{#if mesa.mestre && o.tipo === 'imagem'}
			<label class="flex items-center gap-3 text-xs font-semibold text-mut">Camada
				<select class="h-9 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2 text-sm font-medium text-fg" aria-label="Camada da imagem" onchange={(e) => mesa.atualizarObjeto(o.id, { camada: e.currentTarget.value })}>
					{#if !camadasDeImagens.some((c) => c.id === o.camada)}<option value={o.camada} selected>Sem camada (logo abaixo dos tokens)</option>{/if}
					{#each camadasDeImagens as c (c.id)}<option value={c.id} selected={c.id === o.camada}>{c.nome}</option>{/each}
				</select>
			</label>
		{/if}
		{#if mesa.mestre && o.tipo === 'imagem'}
<button type="button" class={btn} disabled={o.ordem >= topo && mesa.objetos.filter((x) => x.ordem === topo).length === 1} title="Põe por cima das outras imagens" onclick={() => mesa.atualizarObjeto(o.id, { ordem: Math.min(1000, topo + 1) })}>PARA FRENTE</button>
				<button type="button" class={btn} disabled={o.ordem <= fundo && mesa.objetos.filter((x) => x.ordem === fundo).length === 1} title="Põe por baixo das outras imagens" onclick={() => mesa.atualizarObjeto(o.id, { ordem: Math.max(-1000, fundo - 1) })}>PARA TRÁS</button>
			{/if}
			<button type="button" class={btn} onclick={duplicar}>DUPLICAR</button>
			<button type="button" class="{btn} ml-auto border-err text-err" onclick={excluir}>EXCLUIR</button>
		</div>
	</div>
{/if}
