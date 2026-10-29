<script lang="ts">
	// Configurações da cena (só o Mestre). O modal tem tamanho fixo e o conteúdo de cada aba rola por dentro, então ele não
	// muda de tamanho de uma aba para outra. Abas: geral, tamanho (e ajustar à imagem), vista, imagens e camadas.
	import { tick } from 'svelte';
	import { fatorDosQuadrados, fundoPorFator, larguraPadraoDoFundo, type CenaParaFundo } from '#lib/mesa/fundo.ts';
	import { urlImagemMesa } from '#lib/mesa/imagens.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { MAX_CAMADAS, adicionar, alternarEmPe, camadasDaCena, indiceDaCamada, mover, remover, renomear, type Camada } from '#lib/mesa/camadas.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import type { MesaCena, MesaObjeto } from '#lib/supabase/banco.ts';

	let {
		mesa,
		ui,
		cena,
		quemJoga,
		podeColocarGrupo,
		aoParticipantes,
		aoColocarGrupo
	}: {
		mesa: Mesa;
		ui: UiMesa;
		cena: MesaCena;
		/** "todos" ou "2 de 4": o que a linha de quem joga mostra */
		quemJoga: string;
		podeColocarGrupo: boolean;
		aoParticipantes: () => void;
		aoColocarGrupo: () => void;
	} = $props();

	const ABAS = [
		{ id: 'geral', nome: 'Geral', icone: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4' },
		{ id: 'tamanho', nome: 'Tamanho', icone: 'M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6' },
		{ id: 'vista', nome: 'Vista', icone: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5' },
		{ id: 'imagens', nome: 'Imagens', icone: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9h.01' },
		{ id: 'camadas', nome: 'Camadas', icone: 'M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5' }
	] as const;
	type AbaId = (typeof ABAS)[number]['id'];
	const TITULOS: Record<AbaId, [string, string]> = {
		geral: ['Geral', 'Como a mesa se comporta e o que o grupo vê.'],
		tamanho: ['Tamanho da cena', 'Cada quadrado vale 1 m.'],
		vista: ['Vista', 'Como o quadro é desenhado. Os dados seguem na grade, então régua, jutsus, névoa e terreno funcionam igual nas duas vistas.'],
		imagens: ['Imagens', 'O modo da cena, a imagem da narrativa e o fundo do quadro.'],
		camadas: ['Camadas', 'Monte a pilha: o que está mais acima cobre o que está abaixo. Os tokens ficam numa camada da pilha, então podem passar à frente do chão e atrás da árvore.']
	};
	let aba = $state<AbaId>('geral');
	const iso = $derived(cena.visao === 'isometrica');
	const paraFundo = $derived<CenaParaFundo>({ largura: cena.largura, altura: cena.altura, iso, razao: cena.iso_razao ?? 2 });
	/** A largura do fundo que cobre a cena inteira (100% de tamanho dos quadrados). */
	const larguraPadrao = $derived(larguraPadraoDoFundo(paraFundo));
	let painel = $state<HTMLDivElement>();
	$effect(() => {
		void aba;
		if (painel) painel.scrollTop = 0;
	});

	/** Setas movem entre as abas (o foco acompanha). */
	async function teclado(e: KeyboardEvent) {
		const passo = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
		if (!passo) return;
		e.preventDefault();
		const i = ABAS.findIndex((a) => a.id === aba);
		aba = ABAS[(i + passo + ABAS.length) % ABAS.length].id;
		await tick();
		document.getElementById(`aba-${aba}`)?.focus();
	}

	// ------------------------------------------------------------------ geral
	let limparConfirma = $state(false);

	// ------------------------------------------------------------------ tamanho
	// svelte-ignore state_referenced_locally
	let largura = $state(cena.largura);
	// svelte-ignore state_referenced_locally
	let altura = $state(cena.altura);
	let pxPorQuadrado = $state<number | null>(null);
	let medindo = $state(false);
	const L = $derived(Math.min(200, Math.max(5, Math.round(+largura || 0))));
	const A = $derived(Math.min(200, Math.max(5, Math.round(+altura || 0))));
	const fora = $derived(mesa.tokens.filter((t) => t.x + t.tamanho > L || t.y + t.tamanho > A).length);
	const mudou = $derived(L !== cena.largura || A !== cena.altura);

	async function aplicarTamanho() {
		if (!mudou) return;
		if (await mesa.redimensionarCena(L, A)) {
			largura = L;
			altura = A;
			ui.avisar(`A cena agora tem ${L} × ${A} m.`);
		}
	}
	/** O tamanho natural da imagem do fundo. */
	function tamanhoDaImagem(url: string) {
		return new Promise<{ w: number; h: number }>((ok, falha) => {
			const im = new Image();
			im.onload = () => ok({ w: im.naturalWidth, h: im.naturalHeight });
			im.onerror = () => falha(new Error('imagem'));
			im.src = url;
		});
	}
	/**
	 * Vista de cima: a cena ganha a proporção da imagem (a largura continua, a altura acompanha) ou, com "pixels por
	 * quadrado", o tamanho exato (imagem ÷ pixels). O fundo estica na cena inteira. Isométrica: a imagem é encaixada na
	 * grade (a largura dela vale a soma dos dois lados do mapa), sem mexer no tamanho.
	 */
	async function ajustarAImagem() {
		const url = urlImagemMesa(cena.fundo);
		if (!url) return;
		medindo = true;
		try {
			if (iso) {
				await mesa.patchCena({ fundo_escala: larguraPadrao, fundo_x: 0, fundo_y: 0 });
				ui.avisar('Imagem encaixada na grade isométrica.');
				return;
			}
			const { w, h } = await tamanhoDaImagem(url);
			let novaL = cena.largura;
			let novaA = Math.round((cena.largura * h) / w);
			if (pxPorQuadrado && pxPorQuadrado >= 1) {
				novaL = Math.round(w / pxPorQuadrado);
				novaA = Math.round(h / pxPorQuadrado);
			}
			// o maior lado cabe em 200: a cena encolhe junto, sem deformar
			const k = Math.min(1, 200 / Math.max(novaL, novaA));
			novaL = Math.max(5, Math.round(novaL * k));
			novaA = Math.max(5, Math.round(novaA * k));
			if (await mesa.redimensionarCena(novaL, novaA)) {
				await mesa.patchCena({ fundo_escala: null, fundo_x: 0, fundo_y: 0 });
				largura = novaL;
				altura = novaA;
				ui.avisar(`Cena ajustada à imagem: ${novaL} × ${novaA} m.`);
			}
		} catch {
			ui.avisar('Não consegui ler o tamanho da imagem.');
		} finally {
			medindo = false;
		}
	}

	// ------------------------------------------------------------------ tamanho dos quadrados (em relação ao mapa)
	/** altura ÷ largura da imagem do fundo (para manter a proporção ao mudar o tamanho) */
	let proporcaoImagem = $state<number | null>(null);
	$effect(() => {
		const url = urlImagemMesa(cena.fundo);
		proporcaoImagem = null;
		if (!url) return;
		let vivo = true;
		tamanhoDaImagem(url).then(({ w, h }) => vivo && (proporcaoImagem = h / w), () => {});
		return () => (vivo = false);
	});
	const fator = $derived(fatorDosQuadrados(cena.fundo_escala, paraFundo));
	const fundoNoPadrao = $derived(!cena.fundo_escala && !cena.fundo_x && !cena.fundo_y);
	const paraFator = (f: number) => fundoPorFator(f, proporcaoImagem ?? 1, paraFundo);
	/** Voltar ao padrão: o fundo cobre a cena inteira, como antes de mexer. */
	const quadradosPadrao = () => mesa.patchCena({ fundo_escala: null, fundo_x: 0, fundo_y: 0 });

	// ------------------------------------------------------------------ camadas
	/** A pilha, de baixo para cima (o índice 0 é o fundo). Na tela vai de cima para baixo. */
	const camadas = $derived(camadasDaCena(cena.camadas));
	const pilhaDeCima = $derived([...camadas].reverse());
	const camadasDeImagens = $derived(pilhaDeCima.filter((c) => c.tipo !== 'tokens'));
	const imagens = $derived(mesa.objetos.filter((o) => o.tipo === 'imagem').sort((a, b) => indiceDaCamada(b.camada, camadas) - indiceDaCamada(a.camada, camadas) || b.ordem - a.ordem));
	const imagensDa = (id: string) => imagens.filter((o) => o.camada === id);
	const gravarCamadas = (l: Camada[]) => mesa.patchCena({ camadas: l });
	let nomeNova = $state('');
	let arrastando = $state<string | null>(null);
	let sobre = $state<string | null>(null);
	let apagando = $state<string | null>(null);

	function criarCamada() {
		const l = adicionar(camadas, nomeNova);
		if (!l) return;
		nomeNova = '';
		void gravarCamadas(l);
	}
	/** Soltar uma camada sobre outra: ela ocupa o lugar da outra e as demais se ajeitam. */
	function soltarEm(alvo: string) {
		const id = arrastando;
		arrastando = null;
		sobre = null;
		if (!id || id === alvo) return;
		void gravarCamadas(mover(camadas, id, camadas.findIndex((c) => c.id === alvo)));
	}
	/** Sobe (+1) ou desce (−1) uma camada na pilha. */
	const andar = (id: string, passo: 1 | -1) => gravarCamadas(mover(camadas, id, camadas.findIndex((c) => c.id === id) + passo));
	/** Apaga a camada; as imagens dela vão para a vizinha de imagens. */
	async function apagarCamada(id: string) {
		const r = remover(camadas, id);
		apagando = null;
		if (!r) return;
		for (const o of imagensDa(id)) await mesa.atualizarObjeto(o.id, { camada: r.destino });
		await gravarCamadas(r.lista);
	}
	const nomeDaCamada = (id: string) => camadas.find((c) => c.id === id)?.nome ?? id;
	const nomeDaImagem = (o: MesaObjeto) => (o.imagem ?? '').split('/').pop()?.replace(/\.(webp|png)$/, '') ?? 'imagem';
	function escolher(o: MesaObjeto) {
		ui.objSel = o.id;
		ui.escolher('objeto');
		ui.modal = null;
	}

	const input = 'h-10 border-2 border-b3 bg-b1 px-2.5 text-sm font-medium text-fg';
	const botao = 'min-h-10 border-2 border-b3 bg-b1 px-3.5 font-pixel text-xs font-bold tracking-[0.06em] uppercase disabled:opacity-50';
</script>

<!-- um interruptor com o nome e a dica -->
{#snippet opcao(titulo: string, dica: string, ativo: boolean, mudar: () => void)}
	<label class="flex min-h-[60px] cursor-pointer items-center gap-4 border-t-2 border-b2 py-2.5 first:border-t-0">
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="text-sm leading-5 font-semibold">{titulo}</span>
			<span class="text-xs leading-4 text-mut">{dica}</span>
		</span>
		<input type="checkbox" role="switch" class="interruptor" checked={ativo} onchange={mudar} aria-label={titulo} />
	</label>
{/snippet}

<!-- uma escolha entre poucas, em segmentos -->
{#snippet segmentos(nome: string, itens: readonly (readonly [string | number, string])[], atual: string | number, escolha: (v: never) => void)}
	<div role="radiogroup" aria-label={nome} class="flex border-2 border-b3">
		{#each itens as [v, rotulo] (v)}
			<button type="button" role="radio" aria-checked={atual === v} class="min-h-10 flex-1 px-3 font-pixel text-xs font-bold tracking-[0.06em] uppercase {atual === v ? 'bg-grena text-papel' : 'text-mut hover:text-fg'}" onclick={() => (escolha as (v: string | number) => void)(v)}>{rotulo}</button>
		{/each}
	</div>
{/snippet}

<!-- uma imagem da cena: miniatura, o que é e o botão -->
{#snippet imagemDaCena(titulo: string, dica: string, caminho: string | null, acao: string, abrir: () => void)}
	{@const url = urlImagemMesa(caminho)}
	<div class="flex min-h-[72px] items-center gap-4 border-t-2 border-b2 py-3 first:border-t-0">
		<span class="flex h-12 w-16 flex-none items-center justify-center overflow-hidden border-2 border-b3 bg-b1">
			{#if url}<img src={url} alt="" class="h-full w-full object-cover [image-rendering:pixelated]" />{:else}<span class="font-pixel text-[10px] tracking-[0.06em] text-mut uppercase" aria-hidden="true">vazio</span>{/if}
		</span>
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="text-sm leading-5 font-semibold">{titulo}</span>
			<span class="text-xs leading-4 text-mut">{dica}</span>
		</span>
		<button type="button" class={botao} onclick={abrir}>{acao}</button>
	</div>
{/snippet}

<div class="flex min-h-0 flex-1 flex-col">
	<!-- cabeçalho -->
	<div class="flex h-14 flex-none items-center gap-3 border-b-2 border-[var(--vermelhao-lo)] bg-b0 pr-2 pl-5">
		<h2 class="m-0 font-mincho text-lg leading-6 font-bold">Configurações da cena</h2>
		<span class="min-w-0 flex-1 truncate text-sm text-mut" title={cena.nome}>{cena.nome}</span>
		<button type="button" class="flex h-10 w-10 flex-none items-center justify-center border-2 border-transparent font-pixel text-sm hover:border-b3" aria-label="Fechar" onclick={() => (ui.modal = null)}>✕</button>
	</div>

	<div class="flex min-h-0 flex-1 flex-col sm:flex-row">
		<!-- abas: coluna à esquerda, faixa no topo no celular -->
		<div role="tablist" aria-label="Tipos de configuração" aria-orientation="vertical" tabindex="-1" class="flex flex-none gap-0 overflow-x-auto border-b-2 border-b3 bg-b0 sm:w-[184px] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:border-r-2 sm:border-b-0 sm:py-2" onkeydown={teclado}>
			{#each ABAS as a (a.id)}
				<button
					type="button"
					role="tab"
					id="aba-{a.id}"
					aria-selected={aba === a.id}
					aria-controls="painel-config"
					tabindex={aba === a.id ? 0 : -1}
					class="flex min-h-12 flex-none items-center gap-2.5 border-b-[3px] px-4 text-sm font-semibold sm:border-b-0 sm:border-l-[3px] {aba === a.id ? 'border-[var(--vermelhao)] bg-b1 text-fg' : 'border-transparent text-mut hover:text-fg'}"
					onclick={() => (aba = a.id)}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" class="flex-none fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d={a.icone} /></svg>
					{a.nome}
				</button>
			{/each}
		</div>

		<!-- o painel: altura fixa, rola por dentro -->
		<div bind:this={painel} role="tabpanel" id="painel-config" aria-labelledby="aba-{aba}" tabindex="-1" class="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-7">
			<div class="mb-5 flex flex-col gap-1">
				<h3 class="m-0 font-mincho text-[22px] leading-7 font-bold">{TITULOS[aba][0]}</h3>
				<p class="m-0 max-w-[60ch] text-[13px] leading-[18px] text-mut">{TITULOS[aba][1]}</p>
			</div>

			{#if aba === 'geral'}
				<div class="flex flex-col">
					{@render opcao('Travar a mesa', 'Só o Mestre move os tokens.', cena.travada, () => mesa.patchCena({ travada: !cena.travada }))}
					{@render opcao('Mostrar PV ao grupo', 'Os jogadores veem os números de PV dos tokens.', cena.mostrar_pv, () => mesa.patchCena({ mostrar_pv: !cena.mostrar_pv }))}
					{@render opcao('Mostrar a grade', 'As linhas de 1 m e de 5 m sobre o mapa.', cena.grade, () => mesa.patchCena({ grade: !cena.grade }))}
					{@render opcao('Coordenadas nas bordas', 'Letras e números ao longo das bordas (só na vista de cima).', cena.coordenadas, () => mesa.patchCena({ coordenadas: !cena.coordenadas }))}
				</div>
				<div class="mt-6 flex flex-col gap-4 border-t-2 border-b2 pt-5">
					<label class="flex flex-col gap-1.5 text-sm font-semibold">Nome que o grupo vê
						<input class="{input} w-full max-w-[420px] font-medium" maxlength="60" placeholder="Em branco: o grupo vê “Cena”" value={cena.nome_publico ?? ''} onchange={(e) => mesa.patchCena({ nome_publico: e.currentTarget.value.trim() || null })} />
						<span class="text-xs font-normal text-mut">Útil para não entregar o nome de um lugar antes da hora.</span>
					</label>
					<div class="flex min-h-[52px] items-center gap-4">
						<span class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="text-sm leading-5 font-semibold">Quem joga nesta cena</span>
							<span class="text-xs leading-4 text-mut">Hoje: {quemJoga}. Quem fica de fora assiste, mas não entra com o personagem.</span>
						</span>
						<button type="button" class={botao} onclick={aoParticipantes}>Escolher</button>
					</div>
					<div class="flex min-h-[52px] items-center gap-4">
						<span class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="text-sm leading-5 font-semibold">Colocar o grupo na cena</span>
							<span class="text-xs leading-4 text-mut">Põe os personagens de quem joga no quadro.</span>
						</span>
						<button type="button" class={botao} disabled={!podeColocarGrupo} onclick={aoColocarGrupo}>Colocar</button>
					</div>
					<div class="flex min-h-[52px] items-center gap-4">
						<span class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="text-sm leading-5 font-semibold">Limpar os traços</span>
							<span class="text-xs leading-4 text-mut">Apaga todos os traços do lápis desta cena, de todo mundo.</span>
						</span>
						<button
							type="button"
							class="{botao} {limparConfirma ? 'border-err text-err' : ''}"
							onclick={() => {
								if (!limparConfirma) return void (limparConfirma = true);
								mesa.limparTracos(true);
								limparConfirma = false;
							}}>{limparConfirma ? 'Confirmar' : 'Limpar'}</button>
					</div>
				</div>
			{:else if aba === 'tamanho'}
				<div class="grid gap-6 md:grid-cols-[1fr_190px]">
					<div class="flex flex-col gap-4">
						<div class="flex flex-wrap items-end gap-3">
							<label class="flex flex-col gap-1.5 text-sm font-semibold">Largura
								<span class="flex items-center gap-2"><input type="number" min="5" max="200" step="1" bind:value={largura} class="{input} w-24" aria-label="Largura da cena em metros" /><span class="text-sm font-normal text-mut">m</span></span>
							</label>
							<label class="flex flex-col gap-1.5 text-sm font-semibold">Altura
								<span class="flex items-center gap-2"><input type="number" min="5" max="200" step="1" bind:value={altura} class="{input} w-24" aria-label="Altura da cena em metros" /><span class="text-sm font-normal text-mut">m</span></span>
							</label>
						</div>
						<p class="m-0 text-xs leading-4 text-mut">De 5 a 200 m de lado. Quem ficaria fora do novo tamanho é puxado para dentro.</p>
						{#if fora && mudou}<p role="status" class="m-0 border-l-[3px] border-warn bg-b1 py-1.5 pr-2 pl-3 text-xs leading-4 font-semibold text-warn">{fora} {fora === 1 ? 'token fica' : 'tokens ficam'} fora e {fora === 1 ? 'será puxado' : 'serão puxados'} para dentro.</p>{/if}
						<button type="button" class="btn-jogo btn-primario min-h-10 self-start" disabled={!mudou} onclick={aplicarTamanho}>Aplicar {L} × {A}</button>
					</div>
					<!-- a proporção da cena, para enxergar o formato antes de aplicar -->
					<div class="flex h-[150px] items-center justify-center border-2 border-b3 bg-b1 p-3" aria-hidden="true">
						<div class="relative flex max-h-full max-w-full items-center justify-center border-2 border-[var(--vermelhao)] bg-b2 font-pixel text-xs font-bold" style="aspect-ratio: {L} / {A}; {L >= A ? 'width: 100%' : 'height: 100%'}">{L} × {A}</div>
					</div>
				</div>

				<div class="mt-6 flex flex-col gap-3 border-t-2 border-b2 pt-5">
					<h4 class="m-0 font-mincho text-base leading-6 font-bold">Tamanho dos quadrados</h4>
					{#if !cena.fundo}
						<p class="m-0 text-sm leading-5 text-mut">O tamanho dos quadrados é em relação ao mapa: escolha um fundo na aba Imagens para ajustar.</p>
					{:else}
						<p class="m-0 max-w-[60ch] text-sm leading-5 text-mut">Aumente ou diminua os quadrados da grade até casarem com os quadrados desenhados no mapa, {iso ? 'na vista isométrica' : 'na vista de cima'}. 100% é o padrão: o mapa cobre a cena inteira.</p>
						<div class="flex items-center gap-3">
							<button type="button" class="h-10 w-10 flex-none border-2 border-b3 bg-b1 font-pixel text-base font-bold disabled:opacity-50" aria-label="Quadrados menores" disabled={fator <= 0.25} onclick={() => mesa.patchCena(paraFator(Math.round(fator * 20 - 1) / 20))}>−</button>
							<input
								type="range"
								min="25"
								max="400"
								step="5"
								value={Math.round(fator * 100)}
								oninput={(e) => mesa.previa(paraFator(+e.currentTarget.value / 100))}
								onchange={(e) => mesa.patchCena(paraFator(+e.currentTarget.value / 100))}
								class="min-w-0 flex-1"
								aria-label="Tamanho dos quadrados em relação ao mapa"
							/>
							<button type="button" class="h-10 w-10 flex-none border-2 border-b3 bg-b1 font-pixel text-base font-bold disabled:opacity-50" aria-label="Quadrados maiores" disabled={fator >= 4} onclick={() => mesa.patchCena(paraFator(Math.round(fator * 20 + 1) / 20))}>+</button>
							<span class="w-14 flex-none text-right font-pixel text-sm font-bold" aria-live="polite">{Math.round(fator * 100)}%</span>
							<button type="button" class={botao} disabled={fundoNoPadrao} title="Volta o mapa a cobrir a cena inteira" onclick={quadradosPadrao}>Padrão</button>
						</div>
					{/if}
				</div>

				<div class="mt-6 flex flex-col gap-3 border-t-2 border-b2 pt-5">
					<h4 class="m-0 font-mincho text-base leading-6 font-bold">Ajustar à imagem do fundo</h4>
					{#if !cena.fundo}
						<p class="m-0 text-sm leading-5 text-mut">A cena ainda não tem fundo. Escolha um na aba Imagens.</p>
					{:else if iso}
						<p class="m-0 max-w-[60ch] text-sm leading-5 text-mut">Na vista isométrica a imagem se encaixa na grade pela largura (os dois lados do mapa somados), sem mudar o tamanho da cena.</p>
						<button type="button" class="{botao} self-start" disabled={medindo} onclick={ajustarAImagem}>Encaixar a imagem na grade</button>
					{:else}
						<p class="m-0 max-w-[60ch] text-sm leading-5 text-mut">A cena ganha a proporção da imagem e o fundo estica nela. Com “pixels por quadrado”, o tamanho sai exato (imagem ÷ pixels); em branco, a largura de hoje fica e a altura acompanha.</p>
						<div class="flex flex-wrap items-end gap-3">
							<label class="flex flex-col gap-1.5 text-sm font-semibold">Pixels por quadrado
								<input type="number" min="1" max="1000" step="1" bind:value={pxPorQuadrado} placeholder="opcional, ex.: 70" class="{input} w-44" aria-label="Pixels por quadrado da imagem" />
							</label>
							<button type="button" class={botao} disabled={medindo} onclick={ajustarAImagem}>{medindo ? 'Lendo a imagem…' : 'Ajustar à imagem'}</button>
						</div>
					{/if}
				</div>
			{:else if aba === 'vista'}
				<!-- só com a migração da vista isométrica aplicada (sem a coluna, salvar a cena falharia) -->
				{#if cena.visao === undefined}
					<p class="m-0 text-sm leading-5 text-mut">A vista isométrica ainda não está disponível neste banco.</p>
				{:else}
					<div role="radiogroup" aria-label="Vista da cena" class="grid gap-3 sm:grid-cols-2">
						{#each [['topo', 'De cima', 'O quadro de sempre: a grade vista de cima.'], ['isometrica', 'Isométrica', 'A grade em losangos, com tokens e objetos de pé.']] as const as [v, nome, dica] (v)}
							{@const on = (cena.visao ?? 'topo') === v}
							<button type="button" role="radio" aria-checked={on} class="flex flex-col gap-3 border-2 p-3 text-left {on ? 'border-[var(--vermelhao)] bg-b1' : 'border-b3 hover:border-mut'}" onclick={() => mesa.patchCena({ visao: v })}>
								<span class="flex h-[84px] items-center justify-center border-2 border-b3 bg-b2" aria-hidden="true">
									<svg width="96" height="72" viewBox="0 0 96 72" class="fill-none stroke-current stroke-[1.5] {on ? 'text-fg' : 'text-mut'}">
										{#if v === 'topo'}
											<path d="M24 6h48v60H24zM40 6v60M56 6v60M24 26h48M24 46h48" />
										{:else}
											<path d="M48 4l40 20-40 20L8 24zM28 14l40 20M68 14L28 34M8 24v10l40 20 40-20V24M48 44v10" />
										{/if}
									</svg>
								</span>
								<span class="flex flex-col gap-0.5">
									<span class="text-sm leading-5 font-semibold">{nome}{on ? ' · em uso' : ''}</span>
									<span class="text-xs leading-4 text-mut">{dica}</span>
								</span>
							</button>
						{/each}
					</div>
					{#if iso}
						<div class="mt-6 flex flex-col gap-5 border-t-2 border-b2 pt-5">
							<div class="flex flex-col gap-2">
								<span class="text-sm leading-5 font-semibold">Proporção do quadrado</span>
								<span class="text-xs leading-4 text-mut">Largura dividida pela altura do losango. 2:1 é o padrão da pixel art.</span>
								<div class="max-w-[360px]">{@render segmentos('Proporção do losango', [[2, '2:1'], [1.75, '1,75:1'], [1.5, '1,5:1']], cena.iso_razao, (v: number) => mesa.patchCena({ iso_razao: v }))}</div>
							</div>
							<div class="flex items-center gap-4">
								<span class="flex min-w-0 flex-1 flex-col gap-0.5">
									<span class="text-sm leading-5 font-semibold">Canto da vista ao abrir · {cena.iso_rotacao}°</span>
									<span class="text-xs leading-4 text-mut">{cena.fundo ? 'Com fundo na cena a vista não gira: a arte existe de um canto só.' : 'Cada pessoa também pode girar a própria vista pelo quadro (teclas [ e ]).'}</span>
								</span>
								<span class="flex flex-none gap-2">
									<button type="button" class="h-10 w-10 border-2 border-b3 bg-b1 font-pixel text-base font-bold" aria-label="Girar o canto inicial para a esquerda" onclick={() => mesa.patchCena({ iso_rotacao: ((cena.iso_rotacao + 270) % 360) as 0 | 90 | 180 | 270 })}>⟲</button>
									<button type="button" class="h-10 w-10 border-2 border-b3 bg-b1 font-pixel text-base font-bold" aria-label="Girar o canto inicial para a direita" onclick={() => mesa.patchCena({ iso_rotacao: ((cena.iso_rotacao + 90) % 360) as 0 | 90 | 180 | 270 })}>⟳</button>
								</span>
							</div>
						</div>
					{/if}
				{/if}
			{:else if aba === 'imagens'}
				<div class="flex flex-col gap-2 pb-5">
					<span class="text-sm leading-5 font-semibold">Modo da cena</span>
					<span class="text-xs leading-4 text-mut">Tática mostra o quadro. Narrativa mostra a imagem da cena para todos, com o chat ao lado.</span>
					<div class="max-w-[360px]">{@render segmentos('Modo da cena', [['tatica', 'Tática'], ['narrativa', 'Narrativa']], cena.modo, (v: 'tatica' | 'narrativa') => mesa.patchCena({ modo: v }))}</div>
				</div>
				<div class="flex flex-col border-t-2 border-b2">
					{@render imagemDaCena('Imagem da narrativa', 'Aparece para todos no modo Narrativa.', cena.imagem, cena.imagem ? 'Trocar' : 'Escolher', () => (ui.modal = { tipo: 'imagem', alvo: 'imagem' }))}
					{@render imagemDaCena('Fundo do quadro', 'O mapa sob a grade, no modo Tática.', cena.fundo, cena.fundo ? 'Trocar' : 'Escolher', () => (ui.modal = { tipo: 'imagem', alvo: 'fundo' }))}
				</div>
				{#if cena.fundo}
					<div class="mt-5 flex flex-col gap-1 border-t-2 border-b2 pt-5">
						<h4 class="m-0 mb-2 font-mincho text-base leading-6 font-bold">Ajustes do fundo</h4>
						<label class="flex min-h-12 items-center gap-4 text-sm font-semibold"><span class="w-32 flex-none">Opacidade</span>
							<input type="range" min="10" max="100" step="5" value={Math.round(cena.fundo_opacidade * 100)} onchange={(e) => mesa.patchCena({ fundo_opacidade: +e.currentTarget.value / 100 })} class="min-w-0 flex-1" aria-label="Opacidade do fundo" />
							<span class="w-12 flex-none text-right font-pixel text-xs">{Math.round(cena.fundo_opacidade * 100)}%</span>
						</label>
						{@render opcao('Esticar o fundo na cena', 'Ligado, a imagem cobre a cena inteira. Desligado, você escolhe a largura e arrasta o fundo sob a grade.', !cena.fundo_escala, () => mesa.patchCena(cena.fundo_escala ? { fundo_escala: null, fundo_x: 0, fundo_y: 0 } : { fundo_escala: larguraPadrao, fundo_x: 0, fundo_y: 0 }))}
						{#if cena.fundo_escala}
							<label class="flex min-h-12 items-center gap-4 border-t-2 border-b2 text-sm font-semibold"><span class="w-32 flex-none">Largura</span>
								<input type="range" min="5" max={Math.max(200, larguraPadrao * 3)} step={iso ? 0.25 : 1} value={cena.fundo_escala} onchange={(e) => mesa.patchCena({ fundo_escala: +e.currentTarget.value })} class="min-w-0 flex-1" aria-label="Largura do fundo" />
								<span class="w-12 flex-none text-right font-pixel text-xs">{cena.fundo_escala}{iso ? ' q' : ' m'}</span>
							</label>
							<div class="border-t-2 border-b2 pt-3">
								<button type="button" class={botao} onclick={() => ((ui.modal = null), ui.escolher('fundo'), ui.avisar('Arraste para mover o fundo; Esc volta a mover os tokens.'))}>Mover o fundo no quadro</button>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- a pilha de camadas, de cima para baixo: o que está mais acima cobre o que está abaixo -->
				<form
					class="flex gap-2"
					onsubmit={(e) => {
						e.preventDefault();
						criarCamada();
					}}
				>
					<input class="{input} min-w-0 flex-1" bind:value={nomeNova} maxlength="40" placeholder="Nome da nova camada, por exemplo: Árvores" aria-label="Nome da nova camada" />
					<button type="submit" class="btn-jogo btn-primario min-h-10" disabled={!nomeNova.trim() || camadas.length >= MAX_CAMADAS}>Nova camada</button>
				</form>
				<p class="m-0 mt-2 text-xs leading-4 text-mut">A camada nova entra no topo. Arraste pelo <b class="font-pixel">⋮⋮</b> ou use as setas para mudar a ordem. Vale até {MAX_CAMADAS} camadas; o fundo do mapa fica sempre sob todas.</p>

				<ol class="m-0 mt-4 flex list-none flex-col gap-1.5 p-0" aria-label="Camadas, de cima para baixo">
					{#each pilhaDeCima as c, i (c.id)}
						{@const indice = camadas.length - 1 - i}
						{@const tokens = c.tipo === 'tokens'}
						{@const doGrupo = imagensDa(c.id)}
						<li
							class="flex flex-col border-2 {tokens ? 'border-[var(--vermelhao)] bg-grena text-papel' : sobre === c.id && arrastando !== c.id ? 'border-fg bg-b1' : 'border-b3 bg-b1'} {arrastando === c.id ? 'opacity-50' : ''}"
							ondragover={(e) => {
								if (!arrastando) return;
								e.preventDefault();
								sobre = c.id;
							}}
							ondragleave={() => sobre === c.id && (sobre = null)}
							ondrop={(e) => {
								e.preventDefault();
								soltarEm(c.id);
							}}
						>
							<div class="flex min-h-12 flex-wrap items-center gap-x-2.5 gap-y-1.5 px-2 py-1.5">
								<span
									role="img"
									aria-label="Arrastar a camada {c.nome}"
									title="Arraste para mudar a ordem"
									draggable="true"
									class="flex h-9 w-7 flex-none cursor-grab items-center justify-center font-pixel text-sm font-bold select-none {tokens ? 'text-papel' : 'text-mut'}"
									ondragstart={(e) => {
										arrastando = c.id;
										e.dataTransfer?.setData('text/plain', c.id);
										if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
										const linha = (e.currentTarget as HTMLElement).closest('li');
										if (linha && e.dataTransfer) e.dataTransfer.setDragImage(linha, 12, 12);
									}}
									ondragend={() => ((arrastando = null), (sobre = null))}>⋮⋮</span
								>
								{#if tokens}
									<span class="flex min-w-0 flex-1 flex-col"><b class="text-sm leading-5">{c.nome}</b><span class="text-xs leading-4">Os personagens e NPCs ficam aqui. Esta camada não se apaga.</span></span>
								{:else}
									<input class="{input} h-9 min-w-[120px] flex-1" maxlength="40" value={c.nome} aria-label="Nome da camada {c.nome}" onchange={(e) => gravarCamadas(renomear(camadas, c.id, e.currentTarget.value))} />
									<span class="w-16 flex-none text-right text-xs text-mut">{doGrupo.length} {doGrupo.length === 1 ? 'imagem' : 'imagens'}</span>
									<label class="flex flex-none cursor-pointer items-center gap-2 text-xs font-semibold" title="Na vista isométrica, as imagens desta camada passam à frente ou atrás de cada token, conforme a posição. Desligado, a camada fica no lugar dela na pilha.">
										<input type="checkbox" role="switch" class="interruptor" checked={!!c.em_pe} onchange={() => gravarCamadas(alternarEmPe(camadas, c.id))} aria-label="Em pé na vista isométrica: {c.nome}" />Em pé
									</label>
								{/if}
								<span class="flex flex-none gap-1">
									<button type="button" class="h-9 w-9 border-2 {tokens ? 'border-papel/40' : 'border-b3'} font-pixel text-xs font-bold disabled:opacity-30" aria-label="Subir {c.nome}" title="Subir na pilha" disabled={indice >= camadas.length - 1} onclick={() => andar(c.id, 1)}>▲</button>
									<button type="button" class="h-9 w-9 border-2 {tokens ? 'border-papel/40' : 'border-b3'} font-pixel text-xs font-bold disabled:opacity-30" aria-label="Descer {c.nome}" title="Descer na pilha" disabled={indice <= 0} onclick={() => andar(c.id, -1)}>▼</button>
									{#if !tokens}<button type="button" class="h-9 w-9 border-2 border-b3 font-pixel text-xs font-bold text-err disabled:opacity-30" aria-label="Apagar {c.nome}" title="Apagar a camada" disabled={camadasDeImagens.length < 2} onclick={() => (apagando = apagando === c.id ? null : c.id)}>✕</button>{/if}
								</span>
							</div>
							{#if apagando === c.id && !tokens}
								{@const r = remover(camadas, c.id)}
								<div class="flex flex-wrap items-center gap-2 border-t-2 border-b3 bg-b2 px-3 py-2" role="alert">
									<span class="min-w-0 flex-1 text-xs leading-4">{doGrupo.length ? `Apagar “${c.nome}”? ${doGrupo.length === 1 ? 'A imagem dela vai' : `As ${doGrupo.length} imagens dela vão`} para “${r ? nomeDaCamada(r.destino) : ''}”.` : `Apagar a camada “${c.nome}”?`}</span>
									<button type="button" class="{botao} border-err text-err" onclick={() => apagarCamada(c.id)}>Apagar</button>
									<button type="button" class={botao} onclick={() => (apagando = null)}>Cancelar</button>
								</div>
							{/if}
						</li>
					{/each}
					<li class="flex items-center gap-2.5 border-2 border-dashed border-b3 px-3 py-2 text-xs text-mut"><span class="w-7 flex-none text-center font-pixel text-sm font-bold" aria-hidden="true">▭</span>Fundo do mapa · sob todas as camadas</li>
				</ol>

				<div class="mt-6 flex flex-col border-t-2 border-b2">
					<h4 class="m-0 mt-5 mb-2 font-mincho text-base leading-6 font-bold">Imagens desta cena</h4>
					{#each imagens as o (o.id)}
						<div class="flex flex-wrap items-center gap-3 border-t-2 border-b2 py-2.5 first:border-t-0">
							<img src={urlImagemMesa(o.imagem)} alt="" class="h-11 w-11 flex-none border-2 border-b3 bg-b1 object-contain [image-rendering:pixelated]" />
							<span class="min-w-[120px] flex-1 truncate text-sm font-semibold" title={o.imagem ?? ''}>{nomeDaImagem(o)}{o.visivel ? '' : ' · escondida'}</span>
							<select class="{input} h-10 w-[200px] max-w-full" aria-label="Camada de {nomeDaImagem(o)}" onchange={(e) => mesa.atualizarObjeto(o.id, { camada: e.currentTarget.value })}>
								{#if !camadasDeImagens.some((c) => c.id === o.camada)}<option value={o.camada} selected>Sem camada (abaixo dos tokens)</option>{/if}
								{#each camadasDeImagens as c (c.id)}<option value={c.id} selected={c.id === o.camada}>{c.nome}</option>{/each}
							</select>
							<button type="button" class="{botao} px-3" title="Fecha e seleciona a imagem no quadro" onclick={() => escolher(o)}>Ver</button>
						</div>
					{:else}
						<p class="m-0 py-3 text-sm leading-5 text-mut">Nenhuma imagem nesta cena. Ponha uma pela Biblioteca de artes (ferramenta Objeto) e volte aqui para escolher a camada.</p>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- rodapé -->
	<div class="flex h-16 flex-none items-center gap-3 border-t-2 border-b3 bg-b0 px-5">
		<span class="min-w-0 flex-1 text-xs leading-4 text-mut">As mudanças valem na hora, para todos na mesa.</span>
		<button type="button" class="btn-jogo btn-primario min-h-11" onclick={() => (ui.modal = null)}>Pronto</button>
	</div>
</div>
