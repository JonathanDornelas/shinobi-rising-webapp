<script lang="ts">
	// Como as rolagens aparecem para esta pessoa: o aviso em pixel no canto ou os dados 3D na tela inteira (com som).
	import { rolador, type EstiloDados } from '#lib/rolagens/rolador.svelte.ts';

	let { compacto = false }: { compacto?: boolean } = $props();
	const OPCOES: [EstiloDados, string, string][] = [
		['pixel', 'PIXEL', 'Aviso no canto com a arte dos dados'],
		['3d', '3D', 'Os dados rolam na tela inteira, para todos verem cair']
	];
</script>

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
			role="switch"
			aria-checked={rolador.som}
			aria-label="Som dos dados"
			title={rolador.som ? 'Som das batidas ligado' : 'Som das batidas desligado'}
			class="flex flex-none items-center justify-center border-2 {compacto ? 'h-8 w-8' : 'h-9 w-9'} {rolador.som ? 'border-[var(--vermelhao)] text-fg' : 'border-b3 text-mut'}"
			onclick={() => rolador.alternarSom()}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
				<path d="M2 6h3l4-3v10l-4-3H2z" />
				{#if rolador.som}<path d="M11 5h1v6h-1zM13 3h1v10h-1z" />{:else}<path d="M11 6l1-1 3 3-1 1zM11 10l3-3 1 1-3 3z" />{/if}
			</svg>
		</button>
	{/if}
</div>
