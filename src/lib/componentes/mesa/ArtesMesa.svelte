<script lang="ts">
	// A biblioteca de artes da campanha: o Mestre envia mapas e objetos (png, jpg, webp, gif e svg; tudo vira webp
	// minificado) e usa como fundo do quadro, imagem da cena narrativa ou objeto solto no quadro. Abre pela barra de
	// ferramentas (gerir) ou pelas configurações da cena (escolher o fundo ou a imagem da narrativa).
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { IMAGENS_DO_LIVRO, urlImagemMesa } from '#lib/mesa/imagens.ts';
	import { TIPOS_ACEITOS, apagarArte, enviarArte, tamanhoLegivel } from '#lib/mesa/artes.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { ArteArmada } from '#lib/mesa/ui.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { MesaArte } from '#lib/supabase/banco.ts';

	let {
		mesa,
		campanha,
		alvo = null,
		atual = null,
		aoEscolher,
		aoArmar,
		aoFechar
	}: {
		mesa: Mesa;
		campanha: string;
		/** O que a escolha vai preencher: o fundo, a imagem da narrativa, ou nada (só gerir e pôr no quadro). */
		alvo?: 'imagem' | 'fundo' | null;
		atual?: string | null;
		aoEscolher: (alvo: 'imagem' | 'fundo', caminho: string | null) => void;
		aoArmar: (arte: ArteArmada) => void;
		aoFechar: () => void;
	} = $props();

	let aba = $state<'campanha' | 'livro'>('campanha');
	// svelte-ignore state_referenced_locally
	let filtro = $state<'todas' | 'mapa' | 'objeto'>(alvo ? 'mapa' : 'todas');
	// svelte-ignore state_referenced_locally
	let tipoEnvio = $state<MesaArte['tipo']>(alvo ? 'mapa' : 'mapa');
	let andamento = $state<{ feitos: number; total: number } | null>(null);
	let sobre = $state(false);
	let selecionada = $state<string | null>(null);
	let confirmarExclusao = $state(false);

	const lista = $derived(mesa.artes.filter((a) => filtro === 'todas' || a.tipo === filtro));
	const sel = $derived(mesa.artes.find((a) => a.id === selecionada) ?? null);
	const emUso = (a: MesaArte) => mesa.cena?.fundo === a.caminho || mesa.cena?.imagem === a.caminho || mesa.objetos.some((o) => o.imagem === a.caminho);
	const nomes = { imagem: 'a imagem da narrativa', fundo: 'o fundo do quadro' } as const;

	async function enviar(arquivos: File[]) {
		const validos = arquivos.filter((f) => /^image\//.test(f.type) || /\.(svg|png|jpe?g|webp|gif)$/i.test(f.name));
		if (!validos.length) return void toasts.mostrar('Use imagens PNG, JPG, WebP, GIF ou SVG.', 'aviso');
		andamento = { feitos: 0, total: validos.length };
		let ultima: MesaArte | null = null;
		for (const f of validos) {
			try {
				ultima = await enviarArte(campanha, f, tipoEnvio);
				mesa.artes = [ultima, ...mesa.artes];
			} catch (e) {
				toasts.mostrar(e instanceof Error && /grande|abrir|300|guardar/i.test(e.message) ? `${f.name}: ${e.message}` : `Não foi possível enviar ${f.name}.`, 'erro');
			}
			andamento = { feitos: andamento.feitos + 1, total: andamento.total };
		}
		andamento = null;
		if (ultima) {
			selecionada = ultima.id;
			if (filtro !== 'todas' && filtro !== ultima.tipo) filtro = 'todas';
		}
	}
	async function aoEscolherArquivos(e: Event) {
		const entrada = e.currentTarget as HTMLInputElement;
		const arquivos = [...(entrada.files ?? [])];
		entrada.value = '';
		await enviar(arquivos);
	}
	function aoSoltar(e: DragEvent) {
		e.preventDefault();
		sobre = false;
		void enviar([...(e.dataTransfer?.files ?? [])]);
	}

	async function renomear(a: MesaArte, nome: string) {
		const n = nome.trim().slice(0, 60);
		if (!n || n === a.nome) return;
		const { error } = await supabase().from('mesa_artes').update({ nome: n }).eq('id', a.id);
		if (error) return void toasts.mostrar('Não foi possível renomear.', 'erro');
		mesa.artes = mesa.artes.map((x) => (x.id === a.id ? { ...x, nome: n } : x));
	}
	async function trocarTipo(a: MesaArte, tipo: MesaArte['tipo']) {
		const { error } = await supabase().from('mesa_artes').update({ tipo }).eq('id', a.id);
		if (error) return void toasts.mostrar('Não foi possível mudar o tipo.', 'erro');
		mesa.artes = mesa.artes.map((x) => (x.id === a.id ? { ...x, tipo } : x));
	}
	async function excluir(a: MesaArte) {
		if (!confirmarExclusao) return void (confirmarExclusao = true);
		confirmarExclusao = false;
		if (!(await apagarArte(a))) return void toasts.mostrar('Não foi possível apagar a arte.', 'erro');
		mesa.artes = mesa.artes.filter((x) => x.id !== a.id);
		// o banco tirou a arte de onde estava em uso; a tela acompanha
		if (mesa.cena?.fundo === a.caminho) mesa.cenas = mesa.cenas.map((c) => (c.id === mesa.cenaId ? { ...c, fundo: null } : c));
		if (mesa.cena?.imagem === a.caminho) mesa.cenas = mesa.cenas.map((c) => (c.id === mesa.cenaId ? { ...c, imagem: null } : c));
		mesa.objetos = mesa.objetos.filter((o) => o.imagem !== a.caminho);
		selecionada = null;
	}
	const armar = (a: MesaArte) => aoArmar({ caminho: a.caminho, nome: a.nome, w: a.largura, h: a.altura });
	$effect(() => {
		void selecionada;
		confirmarExclusao = false;
	});
</script>

<div class="flex items-center gap-2 border-b-2 border-[var(--vermelhao-lo)] bg-b0 py-1 pr-1 pl-3.5">
	<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">{alvo ? (alvo === 'imagem' ? 'IMAGEM DA NARRATIVA' : 'FUNDO DO QUADRO') : 'BIBLIOTECA DE ARTES'}</span>
	<button type="button" class="h-9 w-9 font-pixel text-sm" aria-label="Fechar" onclick={aoFechar}>✕</button>
</div>

<div class="flex flex-col gap-2.5 p-3.5">
	{#if alvo}
		<span class="text-sm leading-5 text-mut">Escolha {nomes[alvo]}. {alvo === 'fundo' ? 'Fica sob a grade; o tamanho, a posição e a opacidade ficam nas configurações da cena.' : 'Aparece para todos quando a cena está no modo narrativa, com o chat de rolagens ao lado.'}</span>
		<div role="tablist" class="flex border-2 border-b3">
			{#each [['campanha', `DA CAMPANHA · ${mesa.artes.length}`], ['livro', 'DO LIVRO']] as const as [id, n] (id)}
				<button type="button" role="tab" aria-selected={aba === id} class="min-h-9 flex-1 font-pixel text-[11px] font-bold {aba === id ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => (aba = id)}>{n}</button>
			{/each}
		</div>
	{/if}

	{#if aba === 'livro' && alvo}
		<div class="grid max-h-[360px] grid-cols-4 gap-1.5 overflow-y-auto">
			{#each IMAGENS_DO_LIVRO as im (im.caminho)}
				<button type="button" aria-pressed={atual === im.caminho} class="flex flex-col gap-1 border-2 p-1 text-left {atual === im.caminho ? 'border-fg bg-b3' : 'border-b3'}" onclick={() => aoEscolher(alvo, im.caminho)}>
					<img src={im.caminho} alt="" loading="lazy" class="aspect-[5/2] w-full object-cover" style="image-rendering: pixelated" />
					<span class="text-[11px] leading-none font-semibold">{im.nome}</span>
				</button>
			{/each}
		</div>
	{:else}
		<div class="flex flex-wrap items-center gap-2">
			<div role="radiogroup" aria-label="Filtro" class="flex border-2 border-b3">
				{#each [['todas', 'TODAS'], ['mapa', 'MAPAS'], ['objeto', 'OBJETOS']] as const as [f, n] (f)}
					<button type="button" role="radio" aria-checked={filtro === f} class="min-h-8 px-2.5 font-pixel text-[11px] font-bold {filtro === f ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => (filtro = f)}>{n}</button>
				{/each}
			</div>
			<span class="text-xs text-mut">{lista.length} {lista.length === 1 ? 'arte' : 'artes'} · {mesa.artes.length} de 300</span>
		</div>

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative flex max-h-[340px] min-h-[160px] flex-col overflow-y-auto border-2 {sobre ? 'border-[var(--vermelhao)] bg-grena/30' : 'border-b3'} bg-b1"
			ondragover={(e) => (e.preventDefault(), (sobre = true))}
			ondragleave={() => (sobre = false)}
			ondrop={aoSoltar}
		>
			{#if !lista.length}
				<span class="m-auto max-w-[320px] px-4 py-6 text-center text-sm leading-5 text-mut">{mesa.artes.length ? 'Nenhuma arte neste filtro.' : 'A biblioteca está vazia. Arraste imagens para cá ou use ENVIAR ARTES: elas viram webp leve e ficam aqui para todas as cenas.'}</span>
			{:else}
				<div class="grid grid-cols-4 gap-1.5 p-1.5">
					{#each lista as a (a.id)}
						<button type="button" aria-pressed={selecionada === a.id} class="relative flex flex-col gap-1 border-2 p-1 text-left {selecionada === a.id ? 'border-fg bg-b3' : atual === a.caminho ? 'border-ok' : 'border-b3'}" onclick={() => (selecionada = a.id)}>
							<img src={urlImagemMesa(a.miniatura ?? a.caminho)} alt="" loading="lazy" class="aspect-square w-full bg-b0 {a.tipo === 'objeto' ? 'object-contain' : 'object-cover'}" />
							<span class="truncate text-[11px] leading-none font-semibold" title={a.nome}>{a.nome}</span>
							{#if emUso(a)}<span class="absolute top-1.5 right-1.5 bg-ok px-1 py-0.5 font-pixel text-[10px] leading-none font-bold text-[var(--okfg)]">EM USO</span>{/if}
							<span class="absolute bottom-6 left-1.5 bg-b0/85 px-1 py-0.5 font-pixel text-[10px] leading-none font-bold text-mut">{a.tipo === 'mapa' ? 'MAPA' : 'OBJETO'}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if sel}
			<div class="flex flex-col gap-2 border-2 border-b3 bg-sup p-2.5">
				<div class="flex items-center gap-2">
					<input class="h-9 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2 text-sm font-semibold text-fg" maxlength="60" aria-label="Nome da arte" value={sel.nome} onchange={(e) => renomear(sel, e.currentTarget.value)} />
					<div role="radiogroup" aria-label="Tipo da arte" class="flex border-2 border-b3">
						{#each [['mapa', 'MAPA'], ['objeto', 'OBJETO']] as const as [t, n] (t)}
							<button type="button" role="radio" aria-checked={sel.tipo === t} class="min-h-9 px-2 font-pixel text-[11px] font-bold {sel.tipo === t ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => trocarTipo(sel, t)}>{n}</button>
						{/each}
					</div>
				</div>
				<span class="text-xs text-mut">{sel.largura} × {sel.altura} px · {tamanhoLegivel(sel.bytes)}</span>
				<div class="flex flex-wrap gap-1.5">
					{#if alvo}
						<button type="button" class="btn-jogo btn-primario min-h-10" onclick={() => aoEscolher(alvo, sel.caminho)}>USAR {alvo === 'fundo' ? 'COMO FUNDO' : 'NA NARRATIVA'}</button>
					{:else}
						<button type="button" class="btn-jogo btn-primario min-h-10" onclick={() => armar(sel)}>PÔR NO QUADRO</button>
						<button type="button" class="btn-jogo min-h-10" onclick={() => aoEscolher('fundo', sel.caminho)}>COMO FUNDO</button>
						<button type="button" class="btn-jogo min-h-10" onclick={() => aoEscolher('imagem', sel.caminho)}>NA NARRATIVA</button>
					{/if}
					<button type="button" class="btn-jogo ml-auto min-h-10 {confirmarExclusao ? 'border-err bg-err text-errfg' : ''}" onclick={() => excluir(sel)}>{confirmarExclusao ? (emUso(sel) ? 'CONFIRMAR (SAI DE ONDE ESTÁ)' : 'CONFIRMAR EXCLUSÃO') : 'EXCLUIR'}</button>
				</div>
			</div>
		{/if}
	{/if}
</div>

{#if aba === 'campanha'}
	<div class="flex flex-wrap items-center gap-2 border-t-2 border-b3 px-3.5 py-3">
		<div role="radiogroup" aria-label="Tipo das próximas artes" class="flex items-center gap-1.5">
			<span class="text-xs font-semibold text-mut">Enviar como</span>
			<span class="flex border-2 border-b3">
				{#each [['mapa', 'MAPA'], ['objeto', 'OBJETO']] as const as [t, n] (t)}
					<button type="button" role="radio" aria-checked={tipoEnvio === t} class="min-h-9 px-2 font-pixel text-[11px] font-bold {tipoEnvio === t ? 'bg-grena text-papel' : 'text-mut'}" title={t === 'mapa' ? 'Até 2048 px: fundos e cenas' : 'Até 1024 px, com transparência: tokens, móveis, efeitos'} onclick={() => (tipoEnvio = t)}>{n}</button>
				{/each}
			</span>
		</div>
		<label class="btn-jogo min-h-10 cursor-pointer" aria-busy={!!andamento}>
			{andamento ? `ENVIANDO ${andamento.feitos + 1}/${andamento.total}…` : 'ENVIAR ARTES'}
			<input type="file" multiple accept={TIPOS_ACEITOS} class="sr-only" disabled={!!andamento} onchange={aoEscolherArquivos} />
		</label>
		<span class="flex-1"></span>
		{#if alvo}<button type="button" class="btn-jogo min-h-10" disabled={!atual} onclick={() => aoEscolher(alvo, null)}>SEM IMAGEM</button>{/if}
		<button type="button" class="btn-jogo btn-primario min-h-10" onclick={aoFechar}>PRONTO</button>
	</div>
{:else}
	<div class="flex items-center gap-2 border-t-2 border-b3 px-3.5 py-3">
		<span class="flex-1"></span>
		<button type="button" class="btn-jogo min-h-10" disabled={!atual} onclick={() => alvo && aoEscolher(alvo, null)}>SEM IMAGEM</button>
		<button type="button" class="btn-jogo btn-primario min-h-10" onclick={aoFechar}>PRONTO</button>
	</div>
{/if}
