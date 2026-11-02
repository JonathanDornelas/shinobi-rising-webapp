<script lang="ts">
	// As opções da ferramenta que está na mão: cor do alfinete, fonte, cor e tamanho do texto, o pincel da névoa, a arte
	// pronta para pôr no quadro e a luz dinâmica (paredes, luz do ambiente e fontes de luz). Aparece ao lado do trilho (desktop) e na gaveta de ferramentas (celular).
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import { tudo } from '#lib/mesa/nevoa.ts';
	import { CORES_OBJETO, FONTES, TAMANHOS_TEXTO } from '#lib/mesa/objetos.ts';
	import { urlImagemMesa } from '#lib/mesa/imagens.ts';
	import { AMBIENTES, FONTES_DE_LUZ } from '#lib/mesa/luz.ts';

	let { mesa, ui, abrirBiblioteca }: { mesa: Mesa; ui: UiMesa; abrirBiblioteca: () => void } = $props();
	const cena = $derived(mesa.cena);
	const chip = 'min-h-9 flex-1 font-pixel text-[11px] leading-none font-bold';
	const rotulo = 'font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title';
	const recentes = $derived(mesa.artes.filter((a) => a.tipo === 'objeto').slice(0, 6));
	const luzSel = $derived(mesa.luzes.find((l) => l.id === ui.luzSel) ?? null);
	const portas = $derived(mesa.paredes.filter((p) => p[4] >= 1 && p[4] <= 3).length);
	let confirmarLimpar = $state(false);
	/** Liga a luz dinâmica com a névoa junto: o que ninguém viu ainda fica coberto. */
	const alternarLuz = () => mesa.patchCena(cena?.luz_dinamica ? { luz_dinamica: false } : { luz_dinamica: true, nevoa: true });
	const ambienteAtual = $derived(cena?.luz_ambiente ?? 'claro');
	const memoria = $derived(cena?.luz_memoria !== false);
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
{:else if (ui.pop === 'paredes' || ui.pop === 'luz') && !mesa.temLuzDinamica}
	<span class={rotulo}>{ui.pop === 'luz' ? 'LUZ' : 'PAREDES'}</span>
	<span class="text-xs leading-4 text-mut">A luz dinâmica ainda espera a atualização do banco da Mesa.</span>
{:else if ui.pop === 'paredes' || ui.pop === 'luz'}
	<span class={rotulo}>{ui.pop === 'luz' ? 'LUZ' : 'PAREDES'}</span>
	<button type="button" role="switch" aria-checked={!!cena?.luz_dinamica} class="flex min-h-10 items-center gap-2.5 border-2 px-2.5 text-left text-sm font-semibold {cena?.luz_dinamica ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={alternarLuz}>
		<span class="font-pixel text-sm font-bold">{cena?.luz_dinamica ? '☒' : '☐'}</span>{cena?.luz_dinamica ? 'Luz dinâmica ligada' : 'Ligar a luz dinâmica'}
	</button>
	{#if cena?.luz_dinamica && cena.luz_memoria !== undefined}
		<button type="button" role="switch" aria-checked={memoria} class="flex min-h-10 items-center gap-2.5 border-2 px-2.5 text-left text-sm font-semibold {memoria ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => mesa.patchCena({ luz_memoria: !memoria })}>
			<span class="font-pixel text-sm font-bold">{memoria ? '☒' : '☐'}</span>Memória do explorado
		</button>
		<span class="text-xs leading-4 text-mut">{memoria ? 'O que o grupo já viu fica esmaecido, como lembrança, sem os inimigos.' : 'Sem memória: fora do que o grupo vê agora, tudo fica no breu. O que já foi explorado volta se religar.'}</span>
	{/if}
	{#if ui.pop === 'paredes'}
		<span class="text-xs leading-4 text-mut">Arraste para traçar: a ponta encaixa nos cantos da grade e nas pontas que já existem (Shift solta). Parede e porta fechada cortam a visão, a luz e o passo; a janela deixa ver, mas não passar.</span>
		<div role="radiogroup" aria-label="O que o arrasto faz" class="grid grid-cols-3 gap-1">
			{#each [['parede', 'PAREDE'], ['porta', 'PORTA'], ['janela', 'JANELA'], ['mover', 'PONTAS'], ['apagar', 'APAGAR']] as const as [m, n] (m)}
				<button type="button" role="radio" aria-checked={ui.paredeModo === m} title={m === 'mover' ? 'Arraste uma ponta: as paredes emendadas nela vão junto' : m === 'apagar' ? 'Clique ou passe por cima das paredes para apagar' : m === 'porta' ? 'Arraste para pôr uma porta; um clique numa porta alterna fechada, aberta e trancada' : undefined} class="min-h-9 border-2 font-pixel text-[11px] font-bold {ui.paredeModo === m ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => (ui.paredeModo = m)}>{n}</button>
			{/each}
		</div>
		<span class="text-xs leading-4 text-mut">{mesa.paredes.length} {mesa.paredes.length === 1 ? 'trecho' : 'trechos'}, {portas} {portas === 1 ? 'porta' : 'portas'}. Com a ferramenta Mover, um clique no marcador abre e fecha a porta (o jogador, com o token ao lado; a trancada, só você).</span>
		{#if mesa.paredes.length}
			<button type="button" class="min-h-9 border-2 font-pixel text-[11px] font-bold {confirmarLimpar ? 'border-[var(--vermelhao)] text-[var(--vermelhao)]' : 'border-b3'}" onclick={() => (confirmarLimpar ? (mesa.definirParedes([]), (confirmarLimpar = false)) : (confirmarLimpar = true))} onblur={() => (confirmarLimpar = false)}>{confirmarLimpar ? 'CLIQUE DE NOVO PARA APAGAR TODAS' : 'APAGAR TODAS AS PAREDES'}</button>
		{/if}
	{:else}
		<span class="text-xs font-semibold text-mut">Luz do ambiente</span>
		<div role="radiogroup" aria-label="Luz do ambiente" class="flex border-2 border-b3">
			{#each AMBIENTES as a (a.id)}
				<button type="button" role="radio" aria-checked={ambienteAtual === a.id} title={a.dica} class="{chip} {ambienteAtual === a.id ? 'bg-grena text-papel' : ''}" onclick={() => mesa.patchCena({ luz_ambiente: a.id })}>{a.nome.toUpperCase()}</button>
			{/each}
		</div>
		<span class="text-xs leading-4 text-mut">{AMBIENTES.find((a) => a.id === ambienteAtual)?.dica}</span>
		<span class="text-xs font-semibold text-mut">O clique põe</span>
		<div role="radiogroup" aria-label="Fonte de luz" class="grid grid-cols-2 gap-1">
			{#each FONTES_DE_LUZ as f (f.id)}
				<button type="button" role="radio" aria-checked={ui.luzFonte === f.id} class="flex min-h-9 flex-col items-start justify-center border-2 px-2 text-left {ui.luzFonte === f.id ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => (ui.luzFonte = f.id)}><span class="text-sm leading-4 font-semibold">{f.nome}</span><span class="text-[11px] leading-4 opacity-80">{f.plena} m + {f.penumbra} m</span></button>
			{/each}
		</div>
		{#if luzSel}
			<div class="flex flex-col gap-1.5 border-2 border-b3 p-2">
				<span class="text-xs leading-4 font-semibold">Luz selecionada: {luzSel.plena} m de luz plena e {luzSel.penumbra} m de penumbra</span>
				<span class="text-xs leading-4 text-mut">Arraste a chama para mover; o quadrado cheio muda a luz plena, o vazado, a penumbra.</span>
				<div class="grid grid-cols-2 gap-1">
					<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => mesa.definirLuzes(mesa.luzes.map((l) => (l.id === luzSel.id ? { ...l, acesa: !l.acesa } : l)))}>{luzSel.acesa ? 'APAGAR' : 'ACENDER'}</button>
					<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={() => (mesa.definirLuzes(mesa.luzes.filter((l) => l.id !== luzSel.id)), (ui.luzSel = null))}>TIRAR</button>
				</div>
			</div>
		{:else}
			<span class="text-xs leading-4 text-mut">Clique no quadro para pôr a luz; clique numa luz para mexer nela. Os tokens carregam a própria luz (tocha, lampião) pela ficha rápida.</span>
		{/if}
	{/if}
	{#if cena?.luz_dinamica}
		<button type="button" role="switch" aria-checked={ui.verComoGrupo} class="flex min-h-10 items-center gap-2.5 border-2 px-2.5 text-left text-sm font-semibold {ui.verComoGrupo ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => (ui.verComoGrupo = !ui.verComoGrupo)}>
			<span class="font-pixel text-sm font-bold">{ui.verComoGrupo ? '☒' : '☐'}</span>Ver como o grupo vê
		</button>
		<button type="button" class="min-h-9 border-2 border-b3 font-pixel text-[11px] font-bold" hidden={!memoria} title="Cobre de novo o mapa inteiro: o grupo volta a explorar do zero" onclick={() => mesa.patchCena({ nevoa: true, reveladas: [] })}>ESQUECER O QUE O GRUPO EXPLOROU</button>
	{/if}
{:else if ui.pop === 'objeto'}
	<span class={rotulo}>IMAGENS NO QUADRO</span>
	{#if ui.armada}
		<div class="flex items-center gap-2 border-2 border-[var(--vermelhao)] bg-grena p-1.5">
			<img src={urlImagemMesa(ui.armada.caminho)} alt="" class="h-10 w-10 border-2 border-b3 bg-b1 object-contain" />
			<span class="min-w-0 flex-1 text-sm leading-5 font-semibold text-fg"><span class="block truncate">{ui.armada.nome}</span><span class="block text-xs font-normal">Clique no quadro para pôr</span></span>
			<button type="button" class="h-8 w-8 border-2 border-b3 font-pixel text-xs text-fg" aria-label="Soltar a arte" onclick={() => (ui.armada = null)}>✕</button>
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
