<script lang="ts">
	// Dock inferior do mobile (G1). Na fase da documentação: Regras · Jutsus · Busca · Clãs · Referência.
	import { page } from '$app/state';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import Traco from '../ui/Traco.svelte';

	const itens = [
		{ rotulo: 'REGRAS', href: '/regras', icone: 'nav/ic-nav-regras' },
		{ rotulo: 'JUTSUS', href: '/regras/jutsus', icone: 'nav/ic-nav-jutsus' },
		{ rotulo: 'BUSCA', href: null, icone: null },
		{ rotulo: 'CLÃS', href: '/regras/clas', icone: 'nav/ic-nav-clas' },
		{ rotulo: 'TABELAS', href: '/regras/referencia-rapida', icone: 'nav/ic-nav-referencia' }
	];

	function ativo(href: string | null) {
		const p = page.url.pathname;
		if (href === null) return paleta.aberta || p.startsWith('/busca');
		if (href === '/regras') return p === '/regras' || (p.startsWith('/regras/') && !itens.some((i) => i.href && i.href !== '/regras' && p.startsWith(i.href)));
		return p.startsWith(href);
	}
</script>

<nav
	aria-label="Navegação principal"
	class="fixed right-0 bottom-0 left-0 z-40 grid h-16 print:hidden grid-cols-5 border-t-2 border-ink bg-b0 pb-[env(safe-area-inset-bottom)] md:hidden"
>
	{#each itens as item (item.rotulo)}
		{@const on = ativo(item.href)}
		{#if item.href}
			<a
				href={item.href}
				class="flex flex-col items-center justify-center gap-0.5 {on ? 'bg-[#16110F] text-b0fg shadow-[inset_0_3px_0_#C44536]' : 'text-b0mut'}"
				aria-current={on ? 'page' : undefined}
			>
				<Icone id={item.icone!} />
				<span class="font-pixel text-xs leading-none font-semibold tracking-[.04em]">{item.rotulo}</span>
			</a>
		{:else}
			<button
				type="button"
				class="flex flex-col items-center justify-center gap-0.5 {on ? 'bg-[#16110F] text-b0fg shadow-[inset_0_3px_0_#C44536]' : 'text-b0mut'}"
				onclick={() => paleta.abrir()}
			>
				<span class="flex h-8 w-8 items-center justify-center"><Traco nome="buscar" /></span>
				<span class="font-pixel text-xs leading-none font-semibold tracking-[.04em]">{item.rotulo}</span>
			</button>
		{/if}
	{/each}
</nav>
