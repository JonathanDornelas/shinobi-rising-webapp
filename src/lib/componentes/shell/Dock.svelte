<script lang="ts">
	// Dock inferior do mobile (G1). Logado: Regras · Campanhas · Busca · Avisos · Perfil.
	// Visitante: Regras · Jutsus · Busca · Clãs · Tabelas (atalhos da documentação).
	import { page } from '$app/state';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import Traco from '../ui/Traco.svelte';

	interface Item {
		rotulo: string;
		href: string | null;
		icone: string | null;
		marca?: string;
	}

	const itens = $derived<Item[]>(
		sessao.usuario
			? [
					{ rotulo: 'REGRAS', href: '/regras', icone: 'nav/ic-nav-regras' },
					{ rotulo: 'CAMPANHAS', href: '/campanhas', icone: 'nav/ic-nav-campanhas' },
					{ rotulo: 'BUSCA', href: null, icone: null },
					{ rotulo: 'AVISOS', href: '/notificacoes', icone: 'nav/ic-nav-notificacoes', marca: sessao.naoLidas ? (sessao.naoLidas > 9 ? '9+' : String(sessao.naoLidas)) : '' },
					{ rotulo: 'PERFIL', href: '/perfil', icone: 'nav/ic-nav-perfil' }
				]
			: [
					{ rotulo: 'REGRAS', href: '/regras', icone: 'nav/ic-nav-regras' },
					{ rotulo: 'JUTSUS', href: '/regras/jutsus', icone: 'nav/ic-nav-jutsus' },
					{ rotulo: 'BUSCA', href: null, icone: null },
					{ rotulo: 'CLÃS', href: '/regras/clas', icone: 'nav/ic-nav-clas' },
					{ rotulo: 'TABELAS', href: '/regras/referencia-rapida', icone: 'nav/ic-nav-referencia' }
				]
	);

	function ativo(href: string | null) {
		const p = page.url.pathname;
		if (href === null) return paleta.aberta || p.startsWith('/busca');
		if (href === '/regras') return p === '/regras' || (p.startsWith('/regras/') && !itens.some((i) => i.href && i.href !== '/regras' && p.startsWith(i.href)));
		return p.startsWith(href) || (href === '/campanhas' && p.startsWith('/convite'));
	}
</script>

<nav aria-label="Navegação principal" class="fixed right-0 bottom-0 left-0 z-40 grid h-16 grid-cols-5 border-t-2 border-ink bg-b0 pb-[env(safe-area-inset-bottom)] md:hidden print:hidden">
	{#each itens as item (item.rotulo)}
		{@const on = ativo(item.href)}
		{#if item.href}
			<a href={item.href} class="relative flex flex-col items-center justify-center gap-0.5 {on ? 'bg-[#16110F] text-b0fg shadow-[inset_0_3px_0_var(--vermelhao)]' : 'text-b0mut'}" aria-current={on ? 'page' : undefined}>
				<Icone id={item.icone!} />
				<span class="font-pixel text-xs leading-none font-semibold tracking-[.04em]">{item.rotulo}</span>
				{#if item.marca}<span class="absolute top-1.5 left-[calc(50%+8px)] h-4 min-w-4 bg-vermelhao px-[3px] text-center font-pixel text-xs leading-4 font-bold text-white" aria-label="{item.marca} não lidas">{item.marca}</span>{/if}
			</a>
		{:else}
			<button type="button" class="flex flex-col items-center justify-center gap-0.5 {on ? 'bg-[#16110F] text-b0fg shadow-[inset_0_3px_0_var(--vermelhao)]' : 'text-b0mut'}" onclick={() => paleta.abrir()}>
				<span class="flex h-8 w-8 items-center justify-center"><Traco nome="buscar" /></span>
				<span class="font-pixel text-xs leading-none font-semibold tracking-[.04em]">{item.rotulo}</span>
			</button>
		{/if}
	{/each}
</nav>
