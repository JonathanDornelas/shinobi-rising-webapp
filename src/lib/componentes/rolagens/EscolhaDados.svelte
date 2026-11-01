<script lang="ts">
	// Como as rolagens aparecem para esta pessoa: o aviso em pixel no canto ou os dados 3D na tela inteira (com som).
	// Com os dados 3D, ela escolhe a cor e o estilo dos próprios dados (ficam no perfil: todos na mesa os veem assim).
	import { rolador, type EstiloDados } from '#lib/rolagens/rolador.svelte.ts';
	import { CORES_DADO, ESTILOS_DADO, corDosNumeros, estiloDado } from '#lib/rolagens/aparencia-dados.ts';

	let { compacto = false }: { compacto?: boolean } = $props();
	const OPCOES: [EstiloDados, string, string][] = [
		['pixel', 'PIXEL', 'Aviso no canto com a arte dos dados'],
		['3d', '3D', 'Os dados rolam na tela inteira, para todos verem cair']
	];
	let aberto = $state(false);
	const meu = $derived(rolador.meuDado);
	const propria = $derived(!CORES_DADO.some(([c]) => c === rolador.meuDado.cor));
	const tamanho = $derived(compacto ? 'h-8 w-8' : 'h-9 w-9');
</script>

<!-- a amostra do dado: um d20 visto de frente, na cor e com a textura do estilo -->
{#snippet amostra(cor: string, estilo: string, px: number)}
	{@const e = estiloDado(estilo)}
	<span
		class="amostra flex flex-none items-center justify-center font-pixel leading-none font-bold"
		style:width="{px}px"
		style:height="{px}px"
		style:font-size="{Math.round(px * 0.36)}px"
		style:background-color={cor}
		style:background-image={e.amostra ? `url(/dados-3d/textures/${e.amostra})` : undefined}
		style:color={corDosNumeros(cor).letra}
		aria-hidden="true">20</span
	>
{/snippet}

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-1.5">
		<span class="font-pixel text-[11px] leading-none font-bold tracking-[0.06em] text-mut" id="escolha-dados">DADOS</span>
		<div role="radiogroup" aria-labelledby="escolha-dados" class="flex flex-1 border-2 border-b3">
			{#each OPCOES as [v, n, dica] (v)}
				<button type="button" role="radio" aria-checked={rolador.estilo === v} title={dica} class="flex-1 font-pixel text-[11px] font-bold {compacto ? 'min-h-8' : 'min-h-9'} {rolador.estilo === v ? 'bg-grena text-papel' : 'text-mut hover:text-fg'}" onclick={() => rolador.escolherEstilo(v)}>{n}</button>
			{/each}
		</div>
		{#if rolador.estilo === '3d'}
			<button
				type="button"
				aria-expanded={aberto}
				aria-label="Cor e estilo dos seus dados"
				title="Cor e estilo dos seus dados (todos na mesa veem assim)"
				class="flex flex-none items-center justify-center border-2 {tamanho} {aberto ? 'border-[var(--vermelhao)]' : 'border-b3 hover:border-fg'}"
				onclick={() => (aberto = !aberto)}>{@render amostra(meu.cor, meu.estilo, compacto ? 22 : 24)}</button
			>
			<button
				type="button"
				role="switch"
				aria-checked={rolador.som}
				aria-label="Som dos dados"
				title={rolador.som ? 'Som das batidas ligado' : 'Som das batidas desligado'}
				class="flex flex-none items-center justify-center border-2 {tamanho} {rolador.som ? 'border-[var(--vermelhao)] text-fg' : 'border-b3 text-mut'}"
				onclick={() => rolador.alternarSom()}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
					<path d="M2 6h3l4-3v10l-4-3H2z" />
					{#if rolador.som}<path d="M11 5h1v6h-1zM13 3h1v10h-1z" />{:else}<path d="M11 6l1-1 3 3-1 1zM11 10l3-3 1 1-3 3z" />{/if}
				</svg>
			</button>
		{/if}
	</div>

	{#if aberto && rolador.estilo === '3d'}
		<div class="flex flex-col gap-2.5 border-2 border-b3 bg-b1 p-2.5">
			<div class="flex items-center gap-2.5">
				{@render amostra(meu.cor, meu.estilo, 44)}
				<p class="min-w-0 flex-1 text-xs leading-4 text-mut">Seus dados caem assim na tela de todos da mesa.</p>
				<button type="button" class="flex-none border-2 border-b3 px-2 font-pixel text-[11px] font-bold hover:border-fg {compacto ? 'min-h-8' : 'min-h-9'}" disabled={!!rolador.lance} title="Joga um d20 só na sua tela" onclick={() => rolador.previa()}>TESTAR</button>
			</div>

			<div role="radiogroup" aria-label="Estilo dos dados" class="grid grid-cols-3 gap-1">
				{#each ESTILOS_DADO as e (e.id)}
					{@const sel = meu.estilo === e.id}
					<button type="button" role="radio" aria-checked={sel} title={e.dica} class="flex min-w-0 items-center gap-1.5 border-2 px-1 py-1 text-left text-xs font-semibold {sel ? 'border-[var(--vermelhao)] bg-b2' : 'border-transparent text-mut hover:text-fg'}" onclick={() => rolador.escolherDado({ estilo: e.id })}>
						{@render amostra(meu.cor, e.id, 20)}<span class="truncate">{e.nome}</span>
					</button>
				{/each}
			</div>

			<div role="radiogroup" aria-label="Cor dos dados" class="flex flex-wrap items-center gap-1">
				{#each CORES_DADO as [c, nome] (c)}
					{@const sel = meu.cor === c}
					<button type="button" role="radio" aria-checked={sel} aria-label={nome} title={nome} class="h-6 w-6 border-2 {sel ? 'border-fg outline-2 outline-offset-1 outline-[var(--vermelhao)]' : 'border-b3'}" style:background-color={c} onclick={() => rolador.escolherDado({ cor: c })}></button>
				{/each}

				<label class="relative flex h-6 min-w-6 cursor-pointer items-center justify-center border-2 px-1 font-pixel text-[11px] font-bold {propria ? 'border-fg outline-2 outline-offset-1 outline-[var(--vermelhao)]' : 'border-b3 text-mut hover:text-fg'}" style:background-color={propria ? meu.cor : undefined} style:color={propria ? corDosNumeros(meu.cor).letra : undefined} title="Outra cor">
					+<input type="color" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={meu.cor} aria-label="Outra cor" onchange={(ev) => rolador.escolherDado({ cor: ev.currentTarget.value.toLowerCase() })} />
				</label>
			</div>

			<button type="button" role="checkbox" aria-checked={meu.elemento} class="flex items-start gap-1.5 text-left text-xs leading-4" onclick={() => rolador.escolherDado({ elemento: !meu.elemento })}>
				<span class="font-pixel text-xs leading-4 font-bold text-[var(--vermelhao)]">{meu.elemento ? '☒' : '☐'}</span>
				<span>Dano na cor do elemento e cura em verde <span class="text-mut">(no seu estilo)</span></span>
			</button>
		</div>
	{/if}
</div>

<style>
	/* o d20 de frente é um hexágono; a textura escurece a cor como no dado 3D */
	.amostra {
		clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
		background-size: cover;
		background-blend-mode: multiply;
		image-rendering: auto;
	}
</style>
