<script lang="ts">
	// Configurações da cena (só o Mestre), feitas para a bandeja estreita da esquerda da Mesa (280 px): seções empilhadas,
	// cada controle numa linha, textos curtos. No celular a mesma bandeja abre num modal. O conteúdo de cada aba rola por
	// dentro. Abas: geral, tamanho (quadrados e ajustar à imagem), vista, imagens e camadas.
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
		aoColocarGrupo,
		lateral = false
	}: {
		mesa: Mesa;
		ui: UiMesa;
		cena: MesaCena;
		/** "todos" ou "2 de 4": o que a linha de quem joga mostra */
		quemJoga: string;
		podeColocarGrupo: boolean;
		aoParticipantes: () => void;
		aoColocarGrupo: () => void;
		/** No painel da esquerda (o quadro fica à vista enquanto o Mestre ajusta): abas em faixa e uma coluna. */
		lateral?: boolean;
	} = $props();

	const ABAS = [
		{ id: 'geral', nome: 'Geral', icone: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4' },
		{ id: 'tamanho', nome: 'Tamanho', icone: 'M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6' },
		{ id: 'vista', nome: 'Vista', icone: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5' },
		{ id: 'imagens', nome: 'Imagens', icone: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9h.01' },
		{ id: 'camadas', nome: 'Camadas', icone: 'M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5' }
	] as const;
	type AbaId = (typeof ABAS)[number]['id'];
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
	// no painel da esquerda a configuração fica aberta: os campos acompanham a cena quando ela muda por fora (outra cena,
	// a grade redimensionada no quadro)
	$effect.pre(() => {
		largura = cena.largura;
		altura = cena.altura;
	});
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
	/**
	 * Redimensionar a grade: o quadro mostra uma grade de pré-visualização sobre o mapa parado, a partir de um quadrado no
	 * meio da cena; o Mestre puxa até casar com os quadrados desenhados e aplica. O fundo precisa estar em escala (com a
	 * proporção da imagem), não esticado na cena.
	 */
	async function alinharNoQuadro() {
		if (!cena.fundo_escala && !(await mesa.patchCena({ fundo_escala: larguraPadrao, fundo_x: 0, fundo_y: 0 }))) return;
		ui.modal = null;
		ui.escolher('fundo');
		ui.alinhar = { x: Math.floor(cena.largura / 2), y: Math.floor(cena.altura / 2), lado: 1 };
	}
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

	// a escala da bandeja: controles de 32 px, títulos de seção em Mincho 15 px, dicas em 11 px
	const input = 'h-8 border-2 border-b3 bg-b1 px-2 text-[13px] font-medium text-fg';
	const botao = 'h-8 flex-none border-2 border-b3 bg-b1 px-2.5 font-pixel text-[10px] font-bold tracking-[0.06em] uppercase hover:border-mut disabled:opacity-50 disabled:hover:border-b3';
	const quadradinho = 'flex h-8 w-8 flex-none items-center justify-center border-2 border-b3 bg-b1 font-pixel text-sm font-bold hover:border-mut disabled:opacity-40 disabled:hover:border-b3';
	const secao = 'flex flex-col gap-2 border-t-2 border-b3 px-3 pt-3 pb-3.5 first:border-t-0';
	const titulo = 'm-0 font-mincho text-[15px] leading-5 font-bold text-title';
	const dica = 'm-0 text-[11px] leading-[15px] text-mut';
	const nomeLinha = 'text-[13px] leading-4 font-semibold';
</script>

<!-- um interruptor: o nome, a dica curta e a chave à direita -->
{#snippet opcao(nome: string, explica: string, ativo: boolean, mudar: () => void)}
	<label class="flex min-h-9 cursor-pointer items-center gap-3">
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class={nomeLinha}>{nome}</span>
			<span class={dica}>{explica}</span>
		</span>
		<input type="checkbox" role="switch" class="interruptor pequeno" checked={ativo} onchange={mudar} aria-label={nome} />
	</label>
{/snippet}

<!-- uma linha com o nome, a dica e o botão que faz -->
{#snippet acao(nome: string, explica: string, rotulo: string, fazer: () => void, desligado: boolean)}
	<div class="flex min-h-9 items-center gap-3">
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class={nomeLinha}>{nome}</span>
			<span class={dica}>{explica}</span>
		</span>
		<button type="button" class={botao} disabled={desligado} onclick={fazer}>{rotulo}</button>
	</div>
{/snippet}

<!-- uma escolha entre poucas, em segmentos -->
{#snippet segmentos(nome: string, itens: readonly (readonly [string | number, string])[], atual: string | number, escolha: (v: never) => void)}
	<div role="radiogroup" aria-label={nome} class="flex border-2 border-b3">
		{#each itens as [v, rotulo] (v)}
			<button type="button" role="radio" aria-checked={atual === v} class="h-8 min-w-0 flex-1 px-1 font-pixel text-[10px] font-bold tracking-[0.06em] uppercase {atual === v ? 'bg-grena text-papel' : 'text-mut hover:text-fg'}" onclick={() => (escolha as (v: string | number) => void)(v)}>{rotulo}</button>
		{/each}
	</div>
{/snippet}

<!-- uma imagem da cena: miniatura, o que é e o botão -->
{#snippet imagemDaCena(nome: string, explica: string, caminho: string | null, rotulo: string, abrir: () => void)}
	{@const url = urlImagemMesa(caminho)}
	<div class="flex items-center gap-2.5">
		<span class="flex h-9 w-12 flex-none items-center justify-center overflow-hidden border-2 border-b3 bg-b1">
			{#if url}<img src={url} alt="" class="h-full w-full object-cover [image-rendering:pixelated]" />{:else}<span class="font-pixel text-[9px] text-mut" aria-hidden="true">vazio</span>{/if}
		</span>
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class={nomeLinha}>{nome}</span>
			<span class={dica}>{explica}</span>
		</span>
		<button type="button" class={botao} onclick={abrir}>{rotulo}</button>
	</div>
{/snippet}

<div class="flex min-h-0 flex-1 flex-col bg-b2">
	{#if !lateral}
		<!-- no modal (celular): o nome da cena e o fechar -->
		<div class="flex h-12 flex-none items-center gap-3 border-b-2 border-[var(--vermelhao-lo)] bg-b0 pr-1.5 pl-4">
			<h2 class="m-0 font-mincho text-base leading-6 font-bold">Cena</h2>
			<span class="min-w-0 flex-1 truncate text-[13px] text-mut" title={cena.nome}>{cena.nome}</span>
			<button type="button" class="flex h-10 w-10 flex-none items-center justify-center border-2 border-transparent font-pixel text-sm hover:border-b3" aria-label="Fechar" onclick={() => (ui.modal = null)}>✕</button>
		</div>
	{/if}

	<!-- as abas: ícone em cima e nome embaixo, as cinco cabendo na largura da bandeja -->
	<div role="tablist" aria-label="Configurações da cena" tabindex="-1" class="flex flex-none border-b-2 border-b3 bg-b0" onkeydown={teclado}>
		{#each ABAS as a (a.id)}
			{@const on = aba === a.id}
			<button
				type="button"
				role="tab"
				id="aba-{a.id}"
				aria-selected={on}
				aria-controls="painel-config"
				tabindex={on ? 0 : -1}
				class="-mb-0.5 flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 border-b-[3px] text-[10px] leading-none font-semibold {on ? 'border-[var(--vermelhao)] bg-b2 text-fg' : 'border-transparent text-mut hover:text-fg'}"
				onclick={() => (aba = a.id)}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" class="flex-none fill-none stroke-current stroke-2 [stroke-linecap:square]"><path d={a.icone} /></svg>
				{a.nome}
			</button>
		{/each}
	</div>

	<!-- o conteúdo da aba: seções empilhadas, rola por dentro -->
	<div bind:this={painel} role="tabpanel" id="painel-config" aria-labelledby="aba-{aba}" tabindex="-1" class="flex min-h-0 flex-1 flex-col overflow-y-auto">
		{#if aba === 'geral'}
			<section class={secao}>
				<h3 class={titulo}>Na mesa</h3>
				{@render opcao('Travar a mesa', 'Só o Mestre move os tokens.', cena.travada, () => mesa.patchCena({ travada: !cena.travada }))}
				{@render opcao('PV à vista', 'O grupo vê os números de PV.', cena.mostrar_pv, () => mesa.patchCena({ mostrar_pv: !cena.mostrar_pv }))}
				{@render opcao('Linhas da grade', 'As de 1 m e as de 5 m.', cena.grade, () => mesa.patchCena({ grade: !cena.grade }))}
				{@render opcao('Coordenadas', 'Letras e números nas bordas.', cena.coordenadas, () => mesa.patchCena({ coordenadas: !cena.coordenadas }))}
			</section>
			<section class={secao}>
				<h3 class={titulo}>O grupo</h3>
				<label class="flex flex-col gap-1">
					<span class={nomeLinha}>Nome que o grupo vê</span>
					<input class="{input} w-full" maxlength="60" placeholder="Em branco, aparece “Cena”" value={cena.nome_publico ?? ''} onchange={(e) => mesa.patchCena({ nome_publico: e.currentTarget.value.trim() || null })} />
					<span class={dica}>Para não entregar o lugar antes da hora.</span>
				</label>
				{@render acao('Quem joga', `Hoje: ${quemJoga}. Quem fica de fora só assiste.`, 'Escolher', aoParticipantes, false)}
				{@render acao('Colocar o grupo', 'Põe os personagens no quadro.', 'Colocar', aoColocarGrupo, !podeColocarGrupo)}
			</section>
			<section class={secao}>
				<h3 class={titulo}>Lápis</h3>
				<div class="flex min-h-9 items-center gap-1.5">
					<span class="mr-1.5 flex min-w-0 flex-1 flex-col gap-0.5">
						<span class={nomeLinha}>Limpar os traços</span>
						<span class={dica}>{limparConfirma ? 'Some com os traços de todo mundo.' : 'Apaga todos os traços desta cena.'}</span>
					</span>
					{#if limparConfirma}<button type="button" class={quadradinho} aria-label="Cancelar" onclick={() => (limparConfirma = false)}>✕</button>{/if}
					<button
						type="button"
						class="{botao} {limparConfirma ? 'border-err text-err' : ''}"
						onclick={() => {
							if (!limparConfirma) return void (limparConfirma = true);
							mesa.limparTracos(true);
							limparConfirma = false;
						}}>{limparConfirma ? 'Apagar' : 'Limpar'}</button>
				</div>
			</section>
		{:else if aba === 'tamanho'}
			<section class={secao}>
				<div class="flex items-baseline justify-between gap-2">
					<h3 class={titulo}>Tamanho da cena</h3>
					<span class={dica}>1 quadrado = 1 m</span>
				</div>
				<!-- a planta da cena: o retângulo na proporção dela, com a grade de 5 m, e as medidas editáveis nas bordas -->
				<div class="flex h-[150px] items-center justify-center border-2 border-b3 bg-b0 pt-5 pr-10 pb-3 pl-3">
					<div
						class="relative max-h-full max-w-full border-2 border-[var(--vermelhao)] bg-b1"
						style="aspect-ratio: {L} / {A}; {L / A >= 1.75 ? 'width: 100%' : 'height: 100%'}; background-image: linear-gradient(to right, color-mix(in srgb, var(--fg) 16%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--fg) 16%, transparent) 1px, transparent 1px); background-size: {500 / L}% {500 / A}%"
					>
						<input type="number" min="5" max="200" step="1" bind:value={largura} class="absolute top-0 left-1/2 h-7 w-12 -translate-x-1/2 -translate-y-1/2 border-2 border-[var(--vermelhao)] bg-b0 text-center font-pixel text-xs font-bold text-fg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" aria-label="Largura da cena em metros" title="Largura (m)" />
						<input type="number" min="5" max="200" step="1" bind:value={altura} class="absolute top-1/2 right-0 h-7 w-12 translate-x-1/2 -translate-y-1/2 border-2 border-[var(--vermelhao)] bg-b0 text-center font-pixel text-xs font-bold text-fg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" aria-label="Altura da cena em metros" title="Altura (m)" />
					</div>
				</div>
				{#if mudou}
					{#if fora}<p role="status" class="m-0 border-l-[3px] border-warn bg-b1 py-1 pr-2 pl-2.5 text-[11px] leading-[15px] font-semibold text-warn">{fora} {fora === 1 ? 'token fica' : 'tokens ficam'} fora e {fora === 1 ? 'vai' : 'vão'} para dentro.</p>{/if}
					<span class="flex gap-1.5">
						<button type="button" class="btn-jogo btn-primario min-h-9 flex-1 text-xs" onclick={aplicarTamanho}>Aplicar {L} × {A}</button>
						<button type="button" class="{quadradinho} h-9 w-9" aria-label="Desfazer as medidas" title="Voltar a {cena.largura} × {cena.altura}" onclick={() => ((largura = cena.largura), (altura = cena.altura))}>✕</button>
					</span>
				{:else}
					<p class={dica}>Mude as medidas nas bordas da planta, de 5 a 200 m. Quem ficar de fora é puxado para dentro.</p>
				{/if}
			</section>

			<section class={secao}>
				<h3 class={titulo}>Grade sobre o mapa</h3>
				{#if !cena.fundo}
					<p class={dica}>Escolha um fundo na aba Imagens para casar a grade com o mapa.</p>
				{:else}
					{#if !iso}
						<p class={dica}>Puxe a grade sobre o mapa até os quadrados dela casarem com os desenhados.</p>
						<!-- o jeito direto: puxar a grade com o mouse, em vez de adivinhar a porcentagem -->
						<button type="button" class="btn-jogo btn-primario min-h-9 w-full text-xs" onclick={alinharNoQuadro}>Redimensionar a grade</button>
					{/if}
					<div class="flex items-center justify-between gap-2 {iso ? '' : 'pt-1'}">
						<span class={dica}>{iso ? 'Aumente ou diminua até os losangos casarem com os do mapa.' : 'Ou na mão, em relação ao mapa:'}</span>
						<button type="button" class={botao} disabled={fundoNoPadrao} title="Volta o mapa a cobrir a cena inteira" onclick={quadradosPadrao}>Padrão</button>
					</div>
					<div class="flex items-center gap-1.5">
						<button type="button" class={quadradinho} aria-label="Quadrados menores" disabled={fator <= 0.25} onclick={() => mesa.patchCena(paraFator(Math.round(fator * 20 - 1) / 20))}>−</button>
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
						<button type="button" class={quadradinho} aria-label="Quadrados maiores" disabled={fator >= 4} onclick={() => mesa.patchCena(paraFator(Math.round(fator * 20 + 1) / 20))}>+</button>
						<span class="w-10 flex-none text-right font-pixel text-[11px] font-bold" aria-live="polite">{Math.round(fator * 100)}%</span>
					</div>
				{/if}
			</section>

			<section class={secao}>
				<h3 class={titulo}>Cena do tamanho da imagem</h3>
				{#if !cena.fundo}
					<p class={dica}>A cena ainda não tem fundo.</p>
				{:else if iso}
					<p class={dica}>A imagem encaixa na grade pela largura, sem mudar o tamanho da cena.</p>
					<button type="button" class="{botao} w-full" disabled={medindo} onclick={ajustarAImagem}>Encaixar a imagem</button>
				{:else}
					<p class={dica}>A cena ganha a proporção da imagem. Com os pixels de cada quadrado, o tamanho sai exato.</p>
					<div class="flex gap-1.5">
						<input type="number" min="1" max="1000" step="1" bind:value={pxPorQuadrado} placeholder="px por quadrado" class="{input} min-w-0 flex-1" aria-label="Pixels por quadrado da imagem (opcional)" />
						<button type="button" class={botao} disabled={medindo} onclick={ajustarAImagem}>{medindo ? 'Lendo…' : 'Ajustar'}</button>
					</div>
				{/if}
			</section>
		{:else if aba === 'vista'}
			<section class={secao}>
				<h3 class={titulo}>Como o quadro é desenhado</h3>
				<!-- só com a migração da vista isométrica aplicada (sem a coluna, salvar a cena falharia) -->
				{#if cena.visao === undefined}
					<p class={dica}>A vista isométrica ainda não está disponível neste banco.</p>
				{:else}
					<div role="radiogroup" aria-label="Vista da cena" class="grid grid-cols-2 gap-2">
						{#each [['topo', 'De cima'], ['isometrica', 'Isométrica']] as const as [v, nome] (v)}
							{@const on = (cena.visao ?? 'topo') === v}
							<button type="button" role="radio" aria-checked={on} class="flex flex-col items-center gap-1.5 border-2 px-1 pt-2 pb-1.5 {on ? 'border-[var(--vermelhao)] bg-b1 text-fg' : 'border-b3 text-mut hover:border-mut hover:text-fg'}" onclick={() => mesa.patchCena({ visao: v })}>
								<svg width="72" height="54" viewBox="0 0 96 72" aria-hidden="true" class="fill-none stroke-current stroke-[1.5]">
									{#if v === 'topo'}
										<path d="M24 6h48v60H24zM40 6v60M56 6v60M24 26h48M24 46h48" />
									{:else}
										<path d="M48 4l40 20-40 20L8 24zM28 14l40 20M68 14L28 34M8 24v10l40 20 40-20V24M48 44v10" />
									{/if}
								</svg>
								<span class="text-xs leading-4 font-semibold">{nome}</span>
							</button>
						{/each}
					</div>
					<p class={dica}>Só muda o desenho: régua, jutsus, névoa e terreno seguem a mesma grade.</p>
				{/if}
			</section>
			{#if iso}
				<section class={secao}>
					<h3 class={titulo}>Isométrica</h3>
					<span class={nomeLinha}>Proporção do losango</span>
					{@render segmentos('Proporção do losango', [[2, '2:1'], [1.75, '1,75:1'], [1.5, '1,5:1']], cena.iso_razao, (v: number) => mesa.patchCena({ iso_razao: v }))}
					<span class={dica}>Largura dividida pela altura. 2:1 é o padrão da pixel art.</span>
					<div class="flex items-center gap-1.5 pt-1">
						<span class="mr-1.5 flex min-w-0 flex-1 flex-col gap-0.5">
							<span class={nomeLinha}>Canto ao abrir: {cena.iso_rotacao}°</span>
							<span class={dica}>{cena.fundo ? 'Com fundo a vista não gira: a arte tem um canto só.' : 'Cada um também gira a própria vista (teclas [ e ]).'}</span>
						</span>
						<button type="button" class={quadradinho} aria-label="Girar o canto inicial para a esquerda" onclick={() => mesa.patchCena({ iso_rotacao: ((cena.iso_rotacao + 270) % 360) as 0 | 90 | 180 | 270 })}>⟲</button>
						<button type="button" class={quadradinho} aria-label="Girar o canto inicial para a direita" onclick={() => mesa.patchCena({ iso_rotacao: ((cena.iso_rotacao + 90) % 360) as 0 | 90 | 180 | 270 })}>⟳</button>
					</div>
				</section>
			{/if}
		{:else if aba === 'imagens'}
			<section class={secao}>
				<h3 class={titulo}>Modo da cena</h3>
				{@render segmentos('Modo da cena', [['tatica', 'Tática'], ['narrativa', 'Narrativa']], cena.modo, (v: 'tatica' | 'narrativa') => mesa.patchCena({ modo: v }))}
				<p class={dica}>{cena.modo === 'narrativa' ? 'Todos veem a imagem da cena, com o chat ao lado.' : 'Todos veem o quadro, com a grade e os tokens.'}</p>
			</section>
			<section class="{secao} gap-3">
				<h3 class={titulo}>Imagens</h3>
				{@render imagemDaCena('Narrativa', 'Aparece no modo Narrativa.', cena.imagem, cena.imagem ? 'Trocar' : 'Escolher', () => (ui.modal = { tipo: 'imagem', alvo: 'imagem' }))}
				{@render imagemDaCena('Fundo do quadro', 'O mapa sob a grade.', cena.fundo, cena.fundo ? 'Trocar' : 'Escolher', () => (ui.modal = { tipo: 'imagem', alvo: 'fundo' }))}
			</section>
			{#if cena.fundo}
				<section class={secao}>
					<h3 class={titulo}>Ajustes do fundo</h3>
					<label class="flex h-8 items-center gap-2">
						<span class="{nomeLinha} w-[76px] flex-none">Opacidade</span>
						<input type="range" min="10" max="100" step="5" value={Math.round(cena.fundo_opacidade * 100)} onchange={(e) => mesa.patchCena({ fundo_opacidade: +e.currentTarget.value / 100 })} class="min-w-0 flex-1" aria-label="Opacidade do fundo" />
						<span class="w-9 flex-none text-right font-pixel text-[10px]">{Math.round(cena.fundo_opacidade * 100)}%</span>
					</label>
					{@render opcao('Esticar na cena', 'A imagem cobre a cena inteira.', !cena.fundo_escala, () => mesa.patchCena(cena.fundo_escala ? { fundo_escala: null, fundo_x: 0, fundo_y: 0 } : { fundo_escala: larguraPadrao, fundo_x: 0, fundo_y: 0 }))}
					{#if cena.fundo_escala}
						<label class="flex h-8 items-center gap-2">
							<span class="{nomeLinha} w-[76px] flex-none">Largura</span>
							<input type="range" min="5" max={Math.max(200, larguraPadrao * 3)} step={iso ? 0.25 : 1} value={cena.fundo_escala} onchange={(e) => mesa.patchCena({ fundo_escala: +e.currentTarget.value })} class="min-w-0 flex-1" aria-label="Largura do fundo" />
							<span class="w-9 flex-none text-right font-pixel text-[10px]">{cena.fundo_escala}{iso ? ' q' : ' m'}</span>
						</label>
						<div class="flex flex-col gap-1.5 pt-1">
							<button type="button" class="{botao} w-full" onclick={() => ((ui.modal = null), ui.escolher('fundo'), ui.avisar('Arraste para mover o fundo; Esc volta a mover os tokens.'))}>Mover o fundo no quadro</button>
							{#if !iso}<button type="button" class="{botao} w-full" title="Puxe a grade com o mouse até casar com os quadrados desenhados no mapa" onclick={alinharNoQuadro}>Redimensionar a grade</button>{/if}
						</div>
					{/if}
				</section>
			{/if}
		{:else}
			<section class={secao}>
				<h3 class={titulo}>Pilha de camadas</h3>
				<p class={dica}>A de cima cobre a de baixo. Os tokens têm uma camada própria, então passam à frente do chão e atrás da árvore.</p>
				<form
					class="flex gap-1.5"
					onsubmit={(e) => {
						e.preventDefault();
						criarCamada();
					}}
				>
					<input class="{input} min-w-0 flex-1" bind:value={nomeNova} maxlength="40" placeholder="Nova camada, ex.: Árvores" aria-label="Nome da nova camada" />
					<button type="submit" class="btn-jogo btn-primario h-8 min-h-8 w-9 flex-none p-0 text-sm" aria-label="Criar a camada" title="Criar a camada (entra no topo)" disabled={!nomeNova.trim() || camadas.length >= MAX_CAMADAS}>+</button>
				</form>

				<!-- de cima para baixo: o que está mais acima cobre o que está abaixo -->
				<ol class="m-0 flex list-none flex-col gap-1 p-0" aria-label="Camadas, de cima para baixo">
					{#each pilhaDeCima as c, i (c.id)}
						{@const indice = camadas.length - 1 - i}
						{@const tokens = c.tipo === 'tokens'}
						{@const doGrupo = imagensDa(c.id)}
						{@const seta = `h-7 w-7 flex-none border-2 ${tokens ? 'border-papel/40' : 'border-b3'} font-pixel text-[10px] font-bold disabled:opacity-30`}
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
							<div class="flex items-center gap-1 py-1 pr-1">
								<span
									role="img"
									aria-label="Arrastar a camada {c.nome}"
									title="Arraste para mudar a ordem"
									draggable="true"
									class="flex h-7 w-5 flex-none cursor-grab items-center justify-center font-pixel text-xs font-bold select-none {tokens ? 'text-papel' : 'text-mut'}"
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
									<b class="min-w-0 flex-1 truncate pl-1 text-[13px] leading-4">{c.nome}</b>
								{:else}
									<input class="{input} h-7 min-w-0 flex-1 px-1.5" maxlength="40" value={c.nome} aria-label="Nome da camada {c.nome}" onchange={(e) => gravarCamadas(renomear(camadas, c.id, e.currentTarget.value))} />
								{/if}
								<button type="button" class={seta} aria-label="Subir {c.nome}" title="Subir na pilha" disabled={indice >= camadas.length - 1} onclick={() => andar(c.id, 1)}>▲</button>
								<button type="button" class={seta} aria-label="Descer {c.nome}" title="Descer na pilha" disabled={indice <= 0} onclick={() => andar(c.id, -1)}>▼</button>
								{#if !tokens}<button type="button" class="{seta} text-err" aria-label="Apagar {c.nome}" title="Apagar a camada" disabled={camadasDeImagens.length < 2} onclick={() => (apagando = apagando === c.id ? null : c.id)}>✕</button>{/if}
							</div>
							{#if tokens}
								<span class="pr-2 pb-1.5 pl-6 text-[11px] leading-[14px]">Personagens e NPCs. Esta não se apaga.</span>
							{:else}
								<div class="flex items-center gap-2 pr-1.5 pb-1.5 pl-6">
									<span class="min-w-0 flex-1 text-[11px] leading-[14px] text-mut">{doGrupo.length} {doGrupo.length === 1 ? 'imagem' : 'imagens'}</span>
									<label class="flex flex-none cursor-pointer items-center gap-1.5 text-[11px] font-semibold" title="Na vista isométrica, as imagens desta camada passam à frente ou atrás de cada token, conforme a posição. Desligado, a camada fica no lugar dela na pilha.">
										Em pé<input type="checkbox" role="switch" class="interruptor pequeno" checked={!!c.em_pe} onchange={() => gravarCamadas(alternarEmPe(camadas, c.id))} aria-label="Em pé na vista isométrica: {c.nome}" />
									</label>
								</div>
							{/if}
							{#if apagando === c.id && !tokens}
								{@const r = remover(camadas, c.id)}
								<div class="flex flex-col gap-1.5 border-t-2 border-b3 bg-b2 px-2 py-2" role="alert">
									<span class="text-[11px] leading-[15px]">{doGrupo.length ? `Apagar “${c.nome}”? ${doGrupo.length === 1 ? 'A imagem dela vai' : `As ${doGrupo.length} imagens dela vão`} para “${r ? nomeDaCamada(r.destino) : ''}”.` : `Apagar a camada “${c.nome}”?`}</span>
									<span class="flex gap-1.5">
										<button type="button" class="{botao} flex-1 border-err text-err" onclick={() => apagarCamada(c.id)}>Apagar</button>
										<button type="button" class="{botao} flex-1" onclick={() => (apagando = null)}>Cancelar</button>
									</span>
								</div>
							{/if}
						</li>
					{/each}
					<li class="flex h-8 items-center gap-1 border-2 border-dashed border-b3 px-1 text-[11px] text-mut"><span class="w-5 flex-none text-center font-pixel text-xs font-bold" aria-hidden="true">▭</span>Fundo do mapa, sob todas</li>
				</ol>
				<p class={dica}>Arraste pelo <b class="font-pixel">⋮⋮</b> ou use as setas. Até {MAX_CAMADAS} camadas.</p>
			</section>

			<section class={secao}>
				<h3 class={titulo}>Imagens da cena</h3>
				{#each imagens as o (o.id)}
					<div class="flex flex-col gap-1.5 border-t-2 border-b3 pt-2 first:border-t-0 first:pt-0">
						<div class="flex items-center gap-2">
							<img src={urlImagemMesa(o.imagem)} alt="" class="h-8 w-8 flex-none border-2 border-b3 bg-b1 object-contain [image-rendering:pixelated]" />
							<span class="min-w-0 flex-1 truncate text-[13px] font-semibold" title={o.imagem ?? ''}>{nomeDaImagem(o)}{o.visivel ? '' : ' (escondida)'}</span>
							<button type="button" class={botao} title="Seleciona a imagem no quadro" onclick={() => escolher(o)}>Ver</button>
						</div>
						<select class="{input} w-full" aria-label="Camada de {nomeDaImagem(o)}" onchange={(e) => mesa.atualizarObjeto(o.id, { camada: e.currentTarget.value })}>
							{#if !camadasDeImagens.some((c) => c.id === o.camada)}<option value={o.camada} selected>Sem camada (abaixo dos tokens)</option>{/if}
							{#each camadasDeImagens as c (c.id)}<option value={c.id} selected={c.id === o.camada}>{c.nome}</option>{/each}
						</select>
					</div>
				{:else}
					<p class={dica}>Nenhuma imagem. Ponha uma pela ferramenta Objeto e volte aqui para escolher a camada.</p>
				{/each}
			</section>
		{/if}
	</div>

	{#if !lateral}
		<!-- no modal: as mudanças já valem na hora; o Pronto só fecha -->
		<div class="flex h-14 flex-none items-center gap-3 border-t-2 border-b3 bg-b0 px-4">
			<span class="min-w-0 flex-1 text-[11px] leading-[15px] text-mut">As mudanças valem na hora, para todos.</span>
			<button type="button" class="btn-jogo btn-primario min-h-10" onclick={() => (ui.modal = null)}>Pronto</button>
		</div>
	{/if}
</div>
