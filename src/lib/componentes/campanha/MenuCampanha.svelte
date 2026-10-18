<script lang="ts">
	// Campanha Nav: menu lateral de 240 (recolhível em trilho de 64; trilho fixo no tablet) e abas no mobile.
	// Seções que chegam nos próximos lotes aparecem desabilitadas, com o motivo.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Papel } from '#lib/supabase/banco.ts';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import Icone from '../ui/Icone.svelte';

	let { id, papel, parte, pendentes = 0 }: { id: string; papel: Papel; parte: 'lateral' | 'abas'; pendentes?: number } = $props();

	type Item = { chave: string; nome: string; curto: string; icone: string; href?: string; recuo?: boolean; contagem?: number } | { grupo: string };
	const mestre = $derived(papel === 'mestre');
	const base = $derived(`/campanhas/${id}`);
	const itens = $derived<Item[]>(
		([
			{ chave: 'visao', nome: 'Visão geral', curto: 'VISÃO', icone: 'campanhas', href: base },
			{ chave: 'personagens', nome: 'Personagens', curto: 'PERSONAGENS', icone: 'personagens', href: `${base}/personagens` },
			{ grupo: 'BIBLIOTECA' },
			{ chave: 'clas', nome: 'Clãs', curto: 'CLÃS', icone: 'clas', href: `${base}/clas`, recuo: true },
			{ chave: 'jutsus', nome: 'Jutsus', curto: 'JUTSUS', icone: 'jutsus', href: `${base}/jutsus`, recuo: true },
			{ chave: 'equip', nome: 'Equipamentos', curto: 'EQUIPAMENTOS', icone: 'equipamentos', href: `${base}/equipamentos`, recuo: true },
			{ grupo: 'MESA' },
			{ chave: 'npcs', nome: mestre ? 'NPCs' : 'NPCs conhecidos', curto: 'NPCS', icone: 'npcs', href: `${base}/npcs` },
			mestre
				? { chave: 'aprovacoes', nome: 'Aprovações', curto: 'APROVAÇÕES', icone: 'aprovacoes', href: `${base}/aprovacoes`, contagem: pendentes }
				: { chave: 'submissoes', nome: 'Minhas submissões', curto: 'SUBMISSÕES', icone: 'submissoes', href: `${base}/submissoes` },
			{ chave: 'membros', nome: 'Membros', curto: 'MEMBROS', icone: 'membros', href: `${base}/membros` },
			mestre ? { chave: 'config', nome: 'Configurações', curto: 'CONFIG.', icone: 'configuracoes', href: `${base}/configuracoes` } : null
		] as (Item | null)[]).filter((i): i is Item => !!i)
	);
	const links = $derived(itens.filter((i): i is Exclude<Item, { grupo: string }> => !('grupo' in i)));
	// a visão geral só acende na própria página; as outras seções também nas subpáginas (ex.: uma ficha em Personagens)
	const ativo = (href?: string) => !!href && (page.url.pathname === href || (href !== base && page.url.pathname.startsWith(`${href}/`)));
	const EM_BREVE = 'Chega em um próximo lote';

	let recolhido = $state(false);
	onMount(() => (recolhido = ler('menu-campanha-recolhido', false)));
	function alternar() {
		recolhido = !recolhido;
		gravar('menu-campanha-recolhido', recolhido);
	}
</script>

{#if parte === 'lateral'}
	<!-- menu completo: só no desktop, quando aberto -->
	<nav aria-label="Menu da campanha" class="w-60 flex-none flex-col border-r-2 border-b3 bg-b2 py-2 max-lg:hidden {recolhido ? 'hidden' : 'flex'}">
		<div class="sticky top-0 flex flex-col">
			{#each itens as i, n (n)}
				{#if 'grupo' in i}
					<span class="px-3.5 pt-4 pb-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">{i.grupo}</span>
				{:else if i.href}
					{@const on = ativo(i.href)}
					<a
						href={i.href}
						aria-current={on ? 'page' : undefined}
						class="flex min-h-11 items-center gap-2.5 pr-3 text-[15px] leading-5 {i.recuo ? 'pl-5' : 'pl-3'} {on
							? 'bg-grena font-semibold text-papel shadow-[inset_4px_0_0_#C44536]'
							: 'font-medium text-fg hover:bg-b3'}"
					>
						<Icone id="nav/ic-nav-{i.icone}" /><span class="min-w-0 flex-1 truncate">{i.nome}</span>{#if i.contagem}<span class="t-num flex-none bg-vermelhao px-1.5 py-1 text-xs text-white" aria-label="{i.contagem} pendentes">{i.contagem}</span>{/if}
					</a>
				{:else}
					<span class="flex min-h-11 cursor-not-allowed items-center gap-2.5 pr-3 text-[15px] leading-5 font-medium text-mut {i.recuo ? 'pl-5' : 'pl-3'}" aria-disabled="true" title={EM_BREVE}>
						<Icone id="nav/ic-nav-{i.icone}" class="opacity-50" /><span class="min-w-0 flex-1 truncate">{i.nome}</span><span class="flex-none font-pixel text-[10px] tracking-[0.04em] whitespace-nowrap">EM BREVE</span>
					</span>
				{/if}
			{/each}
		</div>
		<span class="flex-1"></span>
		<button type="button" class="flex min-h-11 items-center gap-2 border-t-2 border-b3 px-3.5 font-pixel text-[13px] font-bold tracking-[0.06em] text-mut hover:text-fg" onclick={alternar}>
			◂ RECOLHER
		</button>
	</nav>
	<!-- trilho: tablet sempre; desktop quando recolhido -->
	<nav aria-label="Menu da campanha" class="w-16 flex-none flex-col items-center gap-1 border-r-2 border-b3 bg-b2 py-1.5 max-md:hidden {recolhido ? 'flex' : 'flex lg:hidden'}">
		{#each links as i (i.chave)}
			{#if i.href}
				{@const on = ativo(i.href)}
				<a
					href={i.href}
					title={i.nome}
					aria-label={i.nome}
					aria-current={on ? 'page' : undefined}
					class="relative flex h-[52px] w-[52px] items-center justify-center border-2 {on ? 'border-vermelhao bg-grena' : 'border-transparent hover:border-b3'}"
				>
					<Icone id="nav/ic-nav-{i.icone}" />
					{#if i.contagem}<span class="t-num absolute -top-1 -right-1 bg-vermelhao px-1 text-[11px] text-white">{i.contagem}</span>{/if}
				</a>
			{:else}
				<span title="{i.nome}: {EM_BREVE.toLowerCase()}" aria-label="{i.nome} (em breve)" aria-disabled="true" class="flex h-[52px] w-[52px] cursor-not-allowed items-center justify-center opacity-40">
					<Icone id="nav/ic-nav-{i.icone}" />
				</span>
			{/if}
		{/each}
		<span class="flex-1"></span>
		<button type="button" class="flex h-11 w-[52px] items-center justify-center border-t-2 border-b3 font-pixel text-sm font-bold text-mut hover:text-fg max-lg:hidden" aria-label="Expandir menu" onclick={alternar}>▸</button>
	</nav>
{:else}
	<nav aria-label="Menu da campanha" class="overflow-x-auto border-b-2 border-ink bg-b2 md:hidden">
		<ul class="m-0 flex w-max list-none p-0">
			{#each links as i (i.chave)}
				<li>
					{#if i.href}
						{@const on = ativo(i.href)}
						<a
							href={i.href}
							aria-current={on ? 'page' : undefined}
							class="flex items-center gap-1.5 px-3.5 py-[15px] font-pixel text-sm leading-none font-semibold tracking-[0.06em] whitespace-nowrap {on ? 'bg-vermelhao text-white' : 'text-mut'}"
							>{on ? '▸ ' : ''}{i.curto}{i.contagem ? ` · ${i.contagem}` : ''}</a
						>
					{:else}
						<span aria-disabled="true" title={EM_BREVE} class="flex items-center px-3.5 py-[15px] font-pixel text-sm leading-none font-semibold tracking-[0.06em] whitespace-nowrap text-mut opacity-50">{i.curto}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
{/if}
