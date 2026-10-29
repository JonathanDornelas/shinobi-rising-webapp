<script lang="ts">
	// Configurações da cena (só o Mestre), em abas: o geral (travar, coordenadas, grade, PV, nome público, quem joga), o
	// tamanho (e ajustar a cena à imagem), a vista (de cima ou isométrica), as imagens (modo, narrativa e fundo) e as
	// camadas das imagens (chão, meio e acima dos tokens).
	import { urlImagemMesa } from '#lib/mesa/imagens.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { camadaRank } from '#lib/mesa/objetos.ts';
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
		/** "todos" ou "2 de 4": o que o botão de quem joga mostra */
		quemJoga: string;
		podeColocarGrupo: boolean;
		aoParticipantes: () => void;
		aoColocarGrupo: () => void;
	} = $props();

	const ABAS = [
		['geral', 'GERAL'],
		['tamanho', 'TAMANHO'],
		['vista', 'VISTA'],
		['imagens', 'IMAGENS'],
		['camadas', 'CAMADAS']
	] as const;
	let aba = $state<(typeof ABAS)[number][0]>('geral');
	const iso = $derived(cena.visao === 'isometrica');

	const linha = 'flex min-h-11 items-center gap-2.5 border-t-2 border-b2 px-3 text-left text-sm font-semibold';
	const rotulo = 'font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title';
	const chip = 'min-h-9 border-2 px-2.5 font-pixel text-[11px] font-bold';

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
				await mesa.patchCena({ fundo_escala: cena.largura + cena.altura, fundo_x: 0, fundo_y: 0 });
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

	// ------------------------------------------------------------------ camadas
	const imagens = $derived(mesa.objetos.filter((o) => o.tipo === 'imagem').sort((a, b) => camadaRank(b) - camadaRank(a) || b.ordem - a.ordem));
	const CAMADAS = [
		['acima', 'ACIMA'],
		['meio', 'MEIO'],
		['chao', 'CHÃO']
	] as const;
	const nomeDaImagem = (o: MesaObjeto) => (o.imagem ?? '').split('/').pop()?.replace(/\.(webp|png)$/, '') ?? 'imagem';
	function escolher(o: MesaObjeto) {
		ui.objSel = o.id;
		ui.escolher('objeto');
		ui.modal = null;
	}
</script>

<div class="flex items-center gap-2 border-b-2 border-[var(--vermelhao-lo)] bg-b0 px-3.5 py-2.5">
	<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">CONFIGURAÇÕES DA CENA</span>
	<span class="max-w-[220px] truncate text-xs font-semibold text-mut">{cena.nome}</span>
	<button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-xs" aria-label="Fechar" onclick={() => (ui.modal = null)}>✕</button>
</div>

<div role="tablist" aria-label="Tipos de configuração" class="flex border-b-2 border-b3 bg-b0">
	{#each ABAS as [id, nome] (id)}
		<button type="button" role="tab" id="aba-{id}" aria-selected={aba === id} aria-controls="painel-{id}" class="min-h-11 flex-1 border-b-[3px] font-pixel text-[11px] font-bold {aba === id ? 'border-[var(--vermelhao)] bg-b1 text-fg' : 'border-transparent text-mut'}" onclick={() => (aba = id)}>{nome}</button>
	{/each}
</div>

<div role="tabpanel" id="painel-{aba}" aria-labelledby="aba-{aba}" class="flex min-h-[340px] flex-col overflow-y-auto">
	{#if aba === 'geral'}
		{#each [['travada', 'Travar a mesa (só o Mestre move)'], ['coordenadas', 'Coordenadas nas bordas'], ['mostrar_pv', 'Mostrar PV ao grupo'], ['grade', 'Mostrar a grade']] as const as [k, n] (k)}
			<button type="button" role="checkbox" aria-checked={cena[k]} class={linha} onclick={() => mesa.patchCena({ [k]: !cena[k] })}>
				<span class="font-pixel text-sm font-bold {cena[k] ? 'text-ok' : 'text-mut'}">{cena[k] ? '☒' : '☐'}</span>{n}
			</button>
		{/each}
		<label class="flex flex-col gap-1 border-t-2 border-b2 px-3 py-2.5 text-xs font-semibold text-mut">Nome que o grupo vê
			<input class="h-10 border-2 border-b3 bg-b1 px-2 text-sm font-medium text-fg" maxlength="60" placeholder="Em branco: o grupo vê “Cena”" value={cena.nome_publico ?? ''} onchange={(e) => mesa.patchCena({ nome_publico: e.currentTarget.value.trim() || null })} />
		</label>
		<button type="button" class={linha} onclick={aoParticipantes}><span class="font-pixel text-sm font-bold text-mut">☰</span>Quem joga nesta cena · {quemJoga}</button>
		<button type="button" class={linha} disabled={!podeColocarGrupo} onclick={aoColocarGrupo}><span class="font-pixel text-sm font-bold text-mut">▸</span>Colocar o grupo na cena</button>
		<button
			type="button"
			class="min-h-11 border-t-2 border-b2 px-3 text-left text-sm font-semibold text-link"
			onclick={() => {
				if (!limparConfirma) return void (limparConfirma = true);
				mesa.limparTracos(true);
				limparConfirma = false;
			}}>{limparConfirma ? 'Confirmar: limpar todos os traços' : 'Limpar todos os traços'}</button>
	{:else if aba === 'tamanho'}
		<div class="flex flex-col gap-3 p-4">
			<span class="text-sm leading-5 text-mut">Cada quadrado vale 1 m. A cena vai de 5 a 200 m de lado. Quem ficaria fora do novo tamanho é puxado para dentro.</span>
			<div class="flex flex-wrap items-end gap-3">
				<label class="flex flex-col gap-1 text-xs font-semibold text-mut">Largura (m)
					<input type="number" min="5" max="200" step="1" bind:value={largura} class="h-10 w-28 border-2 border-b3 bg-b1 px-2 text-sm font-medium text-fg" aria-label="Largura da cena em metros" />
				</label>
				<label class="flex flex-col gap-1 text-xs font-semibold text-mut">Altura (m)
					<input type="number" min="5" max="200" step="1" bind:value={altura} class="h-10 w-28 border-2 border-b3 bg-b1 px-2 text-sm font-medium text-fg" aria-label="Altura da cena em metros" />
				</label>
				<button type="button" class="btn-jogo btn-primario min-h-10" disabled={!mudou} onclick={aplicarTamanho}>APLICAR {L} × {A}</button>
			</div>
			{#if fora && mudou}<span role="status" class="text-xs leading-4 font-semibold text-warn">{fora} {fora === 1 ? 'token fica' : 'tokens ficam'} fora e {fora === 1 ? 'será puxado' : 'serão puxados'} para dentro.</span>{/if}
		</div>
		<div class="flex flex-col gap-2.5 border-t-2 border-b2 p-4">
			<span class={rotulo}>AJUSTAR À IMAGEM DO FUNDO</span>
			{#if !cena.fundo}
				<span class="text-sm leading-5 text-mut">A cena ainda não tem fundo. Escolha um na aba Imagens.</span>
			{:else if iso}
				<span class="text-sm leading-5 text-mut">Na vista isométrica a imagem se encaixa na grade pela largura (os dois lados do mapa somados), sem mudar o tamanho da cena.</span>
				<button type="button" class="btn-jogo min-h-10 self-start" disabled={medindo} onclick={ajustarAImagem}>ENCAIXAR A IMAGEM NA GRADE</button>
			{:else}
				<span class="text-sm leading-5 text-mut">A cena ganha a proporção da imagem e o fundo estica nela. Com “pixels por quadrado”, o tamanho sai exato (imagem ÷ pixels); em branco, a largura de hoje fica e a altura acompanha.</span>
				<div class="flex flex-wrap items-end gap-3">
					<label class="flex flex-col gap-1 text-xs font-semibold text-mut">Pixels por quadrado (opcional)
						<input type="number" min="1" max="1000" step="1" bind:value={pxPorQuadrado} placeholder="ex.: 70" class="h-10 w-44 border-2 border-b3 bg-b1 px-2 text-sm font-medium text-fg" aria-label="Pixels por quadrado da imagem" />
					</label>
					<button type="button" class="btn-jogo min-h-10" disabled={medindo} onclick={ajustarAImagem}>{medindo ? 'LENDO A IMAGEM…' : 'AJUSTAR À IMAGEM'}</button>
				</div>
			{/if}
		</div>
	{:else if aba === 'vista'}
		<div class="flex flex-col gap-2 p-4">
			<span class="text-sm leading-5 text-mut">Os dados seguem na grade quadrada de 1 m: régua, jutsus, névoa e terreno funcionam igual nas duas vistas. A isométrica só muda o desenho, e a arte do mapa e dos objetos é a que você subir.</span>
		</div>
		<!-- só com a migração da vista isométrica aplicada (sem a coluna, salvar a cena falharia) -->
		{#if cena.visao !== undefined}
			<button type="button" role="checkbox" aria-checked={iso} class={linha} onclick={() => mesa.patchCena({ visao: iso ? 'topo' : 'isometrica' })}>
				<span class="font-pixel text-sm font-bold {iso ? 'text-ok' : 'text-mut'}">{iso ? '☒' : '☐'}</span>Vista isométrica
			</button>
			{#if iso}
				<div role="radiogroup" aria-label="Proporção do losango" class="flex items-center gap-1.5 border-t-2 border-b2 px-3 py-2">
					<span class="mr-auto text-xs font-semibold text-mut">Proporção do quadrado</span>
					{#each [[2, '2:1'], [1.75, '1,75:1'], [1.5, '1,5:1']] as const as [v, n] (v)}
						<button type="button" role="radio" aria-checked={cena.iso_razao === v} class="{chip} {cena.iso_razao === v ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => mesa.patchCena({ iso_razao: v })}>{n}</button>
					{/each}
				</div>
				<div class="flex items-center gap-1.5 border-t-2 border-b2 px-3 py-2">
					<span class="mr-auto text-xs font-semibold text-mut">Canto da vista ao abrir · {cena.iso_rotacao}°{cena.fundo ? ' (com fundo a vista não gira)' : ''}</span>
					<button type="button" class="h-9 w-9 border-2 border-b3 font-pixel text-base font-bold" aria-label="Girar o canto inicial para a esquerda" onclick={() => mesa.patchCena({ iso_rotacao: ((cena.iso_rotacao + 270) % 360) as 0 | 90 | 180 | 270 })}>⟲</button>
					<button type="button" class="h-9 w-9 border-2 border-b3 font-pixel text-base font-bold" aria-label="Girar o canto inicial para a direita" onclick={() => mesa.patchCena({ iso_rotacao: ((cena.iso_rotacao + 90) % 360) as 0 | 90 | 180 | 270 })}>⟳</button>
				</div>
			{/if}
		{:else}
			<span class="border-t-2 border-b2 p-4 text-sm leading-5 text-mut">A vista isométrica ainda não está disponível neste banco.</span>
		{/if}
	{:else if aba === 'imagens'}
		<div class="flex flex-col gap-2 p-4 pb-2">
			<span class={rotulo}>MODO DA CENA</span>
			<div role="radiogroup" aria-label="Modo da cena" class="flex border-2 border-b3">
				{#each [['tatica', 'TÁTICA'], ['narrativa', 'NARRATIVA']] as const as [m, n] (m)}
					<button type="button" role="radio" aria-checked={cena.modo === m} class="min-h-9 flex-1 font-pixel text-[11px] font-bold {cena.modo === m ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => mesa.patchCena({ modo: m })}>{n}</button>
				{/each}
			</div>
		</div>
		<button type="button" class={linha} onclick={() => (ui.modal = { tipo: 'imagem', alvo: 'imagem' })}><span class="font-pixel text-sm font-bold text-mut">▣</span>Imagem da narrativa · {cena.imagem ? 'trocar' : 'nenhuma'}</button>
		<button type="button" class={linha} onclick={() => (ui.modal = { tipo: 'imagem', alvo: 'fundo' })}><span class="font-pixel text-sm font-bold text-mut">▦</span>Fundo do quadro · {cena.fundo ? 'trocar' : 'nenhum'}</button>
		{#if cena.fundo}
			<label class="{linha} cursor-default">Opacidade do fundo<input type="range" min="10" max="100" step="5" value={Math.round(cena.fundo_opacidade * 100)} onchange={(e) => mesa.patchCena({ fundo_opacidade: +e.currentTarget.value / 100 })} class="min-w-0 flex-1" /></label>
			<!-- tamanho e posição do fundo: esticado na cena, ou com a largura em metros (em quadrados, na isométrica) e arrastado sob a grade -->
			<label class="{linha} cursor-pointer"><input type="checkbox" checked={!cena.fundo_escala} onchange={(e) => mesa.patchCena(e.currentTarget.checked ? { fundo_escala: null, fundo_x: 0, fundo_y: 0 } : { fundo_escala: iso ? cena.largura + cena.altura : cena.largura, fundo_x: 0, fundo_y: 0 })} />Esticar o fundo na cena</label>
			{#if cena.fundo_escala}
				<label class="flex min-h-10 items-center gap-2.5 px-3 text-sm font-semibold">Largura<input type="range" min="5" max={Math.max(200, (iso ? cena.largura + cena.altura : cena.largura) * 3)} step={iso ? 0.25 : 1} value={cena.fundo_escala} onchange={(e) => mesa.patchCena({ fundo_escala: +e.currentTarget.value })} class="min-w-0 flex-1" /><span class="font-pixel text-xs">{cena.fundo_escala} {iso ? 'quadr.' : 'm'}</span></label>
				<button type="button" class="mx-3 mb-3 min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => ((ui.modal = null), ui.escolher('fundo'), ui.avisar('Arraste para mover o fundo; Esc volta a mover os tokens.'))}>MOVER O FUNDO</button>
			{/if}
		{/if}
	{:else}
		<div class="flex flex-col gap-3 p-4">
			<span class="text-sm leading-5 text-mut">Cada imagem fica numa camada. O token vive entre elas: dá para ele ficar à frente do chão e atrás da árvore ao mesmo tempo.</span>
			<ol class="m-0 flex list-none flex-col gap-1 p-0 text-xs leading-4" aria-label="Ordem das camadas, de cima para baixo">
				<li class="border-2 border-b3 px-2.5 py-1.5"><b class="font-pixel">ACIMA</b> · sobre os tokens (a copa da árvore, o telhado)</li>
				<li class="border-2 border-[var(--vermelhao)] bg-grena px-2.5 py-1.5 text-papel"><b class="font-pixel">TOKENS</b> e o que fica em pé com eles</li>
				<li class="border-2 border-b3 px-2.5 py-1.5"><b class="font-pixel">MEIO</b> · {iso ? 'na vista isométrica passa à frente ou atrás de cada token, conforme a posição' : 'sob os tokens (na isométrica entra na ordem com eles)'}</li>
				<li class="border-2 border-b3 px-2.5 py-1.5"><b class="font-pixel">CHÃO</b> · sob tudo (o piso, o tapete)</li>
				<li class="border-2 border-b3 px-2.5 py-1.5"><b class="font-pixel">FUNDO</b> · o mapa da cena, sob todas as camadas</li>
			</ol>
		</div>
		<div class="flex flex-col border-t-2 border-b2">
			{#each imagens as o (o.id)}
				<div class="flex flex-wrap items-center gap-2 border-b-2 border-b2 px-3 py-2">
					<img src={urlImagemMesa(o.imagem)} alt="" class="h-10 w-10 flex-none border-2 border-b3 bg-b1 object-contain [image-rendering:pixelated]" />
					<span class="min-w-0 flex-1 truncate text-sm font-semibold" title={o.imagem ?? ''}>{nomeDaImagem(o)}{o.visivel ? '' : ' · escondida'}</span>
					<div role="radiogroup" aria-label="Camada de {nomeDaImagem(o)}" class="flex border-2 border-b3">
						{#each CAMADAS as [c, n] (c)}
							<button type="button" role="radio" aria-checked={(o.camada ?? 'meio') === c} class="min-h-9 px-2.5 font-pixel text-[11px] font-bold {(o.camada ?? 'meio') === c ? 'bg-grena text-papel' : 'text-mut'}" onclick={() => mesa.atualizarObjeto(o.id, { camada: c })}>{n}</button>
						{/each}
					</div>
					<button type="button" class="min-h-9 border-2 border-b3 px-2.5 font-pixel text-[11px] font-bold" title="Fecha e seleciona a imagem no quadro" onclick={() => escolher(o)}>VER</button>
				</div>
			{:else}
				<span class="p-4 text-sm leading-5 text-mut">Nenhuma imagem nesta cena. Ponha uma pela Biblioteca de artes (ferramenta Objeto) e volte aqui para escolher a camada.</span>
			{/each}
		</div>
	{/if}
</div>

<div class="flex justify-end gap-2 border-t-2 border-b3 px-4 py-3">
	<button type="button" class="btn-jogo btn-primario min-h-11" onclick={() => (ui.modal = null)}>PRONTO</button>
</div>
