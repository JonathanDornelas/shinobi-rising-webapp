<script lang="ts">
	// As opções da ferramenta que está na mão: cor do alfinete, fonte, cor e tamanho do texto, o pincel da névoa e a arte
	// pronta para pôr no quadro. Aparece ao lado do trilho (desktop) e na gaveta de ferramentas (celular).
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import { tudo } from '#lib/mesa/nevoa.ts';
	import { CORES_OBJETO, FONTES, TAMANHOS_TEXTO } from '#lib/mesa/objetos.ts';
	import { urlImagemMesa } from '#lib/mesa/imagens.ts';

	let { mesa, ui, abrirBiblioteca }: { mesa: Mesa; ui: UiMesa; abrirBiblioteca: () => void } = $props();
	const cena = $derived(mesa.cena);
	const chip = 'min-h-9 flex-1 font-pixel text-[11px] leading-none font-bold';
	const rotulo = 'font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title';
	const recentes = $derived(mesa.artes.filter((a) => a.tipo === 'objeto').slice(0, 6));
</script>

{#snippet cores(atual: string, mudar: (c: string) => void, nome: string)}
	<div role="radiogroup" aria-label={nome} class="flex flex-wrap gap-1.5">
		{#each CORES_OBJETO as c (c)}
			<button type="button" role="radio" aria-checked={atual === c} aria-label={c} class="h-7 w-7 border-2 {atual === c ? 'border-fg' : 'border-b3'}" style="background: {c}" onclick={() => mudar(c)}></button>
		{/each}
	</div>
{/snippet}

{#if ui.pop === 'alfinete'}
	<span class={rotulo}>ALFINETE</span>
	<span class="text-xs leading-4 text-mut">Clique no quadro para fincar. Depois dê um nome a ele no painel que abre embaixo; arraste para mover.</span>
	<span class="text-xs font-semibold text-mut">Cor</span>
	{@render cores(ui.alfineteCor, (c) => (ui.alfineteCor = c), 'Cor do alfinete')}
{:else if ui.pop === 'texto'}
	<span class={rotulo}>TEXTO</span>
	<span class="text-xs leading-4 text-mut">Clique no quadro, digite e aperte Enter. Para mudar um texto, clique nele e use o painel de baixo.</span>
	<span class="text-xs font-semibold text-mut">Fonte</span>
	<div role="radiogroup" aria-label="Fonte" class="grid grid-cols-2 gap-1">
		{#each Object.entries(FONTES) as [k, f] (k)}
			<button type="button" role="radio" aria-checked={ui.textoNovo.fonte === k} class="min-h-9 border-2 px-2 text-sm {ui.textoNovo.fonte === k ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" style="font-family: {f.familia}; font-weight: {f.peso}" onclick={() => (ui.textoNovo = { ...ui.textoNovo, fonte: k as keyof typeof FONTES })}>{f.nome}</button>
		{/each}
	</div>
	<span class="text-xs font-semibold text-mut">Tamanho</span>
	<div role="radiogroup" aria-label="Tamanho" class="flex border-2 border-b3">
		{#each TAMANHOS_TEXTO as [t, n] (t)}
			<button type="button" role="radio" aria-checked={ui.textoNovo.tamanho === t} class="{chip} {ui.textoNovo.tamanho === t ? 'bg-grena text-papel' : ''}" onclick={() => (ui.textoNovo = { ...ui.textoNovo, tamanho: t })}>{n}</button>
		{/each}
	</div>
	<span class="text-xs font-semibold text-mut">Cor</span>
	{@render cores(ui.textoNovo.cor, (c) => (ui.textoNovo = { ...ui.textoNovo, cor: c }), 'Cor do texto')}
{:else if ui.pop === 'nevoa'}
	<span class={rotulo}>NÉVOA</span>
	<button type="button" role="switch" aria-checked={!!cena?.nevoa} class="flex min-h-10 items-center gap-2.5 border-2 px-2.5 text-left text-sm font-semibold {cena?.nevoa ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => mesa.alternarNevoa()}>
		<span class="font-pixel text-sm font-bold">{cena?.nevoa ? '☒' : '☐'}</span>{cena?.nevoa ? 'Névoa ligada: o grupo só vê o revelado' : 'Ligar a névoa neste mapa'}
	</button>
	<span class="text-xs leading-4 text-mut">Arraste no quadro para {ui.nevoaModo === 'revelar' ? 'revelar' : 'cobrir'}; Shift faz o contrário. Você vê tudo, esmaecido; o grupo vê só o que você revelou. Tokens e objetos cobertos somem para eles.</span>
	<div role="radiogroup" aria-label="Modo do pincel" class="flex border-2 border-b3">
		{#each [['revelar', 'REVELAR'], ['cobrir', 'COBRIR']] as const as [m, n] (m)}
			<button type="button" role="radio" aria-checked={ui.nevoaModo === m} class="{chip} {ui.nevoaModo === m ? 'bg-grena text-papel' : ''}" onclick={() => (ui.nevoaModo = m)}>{n}</button>
		{/each}
	</div>
	<span class="text-xs font-semibold text-mut">Pincel</span>
	<div role="radiogroup" aria-label="Tamanho do pincel" class="flex border-2 border-b3">
		{#each [1, 3, 5, 9, 15] as n (n)}
			<button type="button" role="radio" aria-checked={ui.nevoaPincel === n} class="{chip} {ui.nevoaPincel === n ? 'bg-grena text-papel' : ''}" onclick={() => (ui.nevoaPincel = n)}>{n}×{n}</button>
		{/each}
	</div>
	<div class="grid grid-cols-2 gap-1">
		<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => cena && mesa.patchCena({ nevoa: true, reveladas: tudo(cena.largura, cena.altura, true) })}>REVELAR TUDO</button>
		<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => mesa.patchCena({ nevoa: true, reveladas: [] })}>COBRIR TUDO</button>
	</div>
{:else if ui.pop === 'objeto'}
	<span class={rotulo}>IMAGENS NO QUADRO</span>
	{#if ui.armada}
		<div class="flex items-center gap-2 border-2 border-[var(--vermelhao)] bg-grena p-1.5">
			<img src={urlImagemMesa(ui.armada.caminho)} alt="" class="h-10 w-10 border-2 border-b3 bg-b1 object-contain" />
			<span class="min-w-0 flex-1 text-sm leading-5 font-semibold text-papel"><span class="block truncate">{ui.armada.nome}</span><span class="block text-xs font-normal">Clique no quadro para pôr</span></span>
			<button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-xs text-papel" aria-label="Soltar a arte" onclick={() => (ui.armada = null)}>✕</button>
		</div>
	{:else}
		<span class="text-xs leading-4 text-mut">Escolha uma arte da biblioteca e clique no quadro para pôr. Clique numa imagem para mover, girar ou redimensionar.</span>
	{/if}
	{#if recentes.length}
		<span class="text-xs font-semibold text-mut">Objetos da biblioteca</span>
		<div class="grid grid-cols-3 gap-1">
			{#each recentes as a (a.id)}
				<button type="button" title={a.nome} class="aspect-square border-2 p-0.5 {ui.armada?.caminho === a.caminho ? 'border-[var(--vermelhao)]' : 'border-b3'}" onclick={() => (ui.armada = { caminho: a.caminho, nome: a.nome, w: a.largura, h: a.altura })}>
					<img src={urlImagemMesa(a.miniatura ?? a.caminho)} alt={a.nome} loading="lazy" class="h-full w-full bg-b1 object-contain" />
				</button>
			{/each}
		</div>
	{/if}
	<button type="button" class="btn-jogo min-h-10" onclick={abrirBiblioteca}>ABRIR A BIBLIOTECA</button>
{/if}
