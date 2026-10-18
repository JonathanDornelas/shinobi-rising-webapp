<script lang="ts">
	// Navbar (G1): desktop 64 · tablet 64 compacta · mobile 56 mínima.
	// Visitante: Entrar e Criar conta. Logado: Campanhas, sino de notificações (G3) e menu da conta.
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { preferencias } from '#lib/estado/preferencias.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import Retrato from '../ui/Retrato.svelte';
	import Traco from '../ui/Traco.svelte';
	import ListaNotificacoes from './ListaNotificacoes.svelte';

	let titulo = $derived((page.data.navTitulo as string | undefined) ?? 'SHINOBI NO MICHI');
	const caminho = $derived(page.url.pathname);
	const regrasAtivo = $derived(caminho.startsWith('/regras') || caminho.startsWith('/busca'));
	const campanhasAtivo = $derived(caminho.startsWith('/campanhas') || caminho.startsWith('/convite'));
	const rotuloTema = $derived(preferencias.aplicado === 'sumi' ? 'Mudar para o tema claro (washi)' : 'Mudar para o tema escuro (sumi)');
	const contador = $derived(sessao.naoLidas > 9 ? '9+' : String(sessao.naoLidas));
	const volta = $derived(caminho === '/' || caminho.startsWith('/entrar') || caminho.startsWith('/criar-conta') ? '' : `?volta=${encodeURIComponent(caminho)}`);

	let sinoAberto = $state(false);
	let menuAberto = $state(false);
	let raizSino: HTMLDivElement | undefined = $state();
	let raizMenu: HTMLDivElement | undefined = $state();

	function fora(e: MouseEvent) {
		if (sinoAberto && raizSino && !raizSino.contains(e.target as Node)) sinoAberto = false;
		if (menuAberto && raizMenu && !raizMenu.contains(e.target as Node)) menuAberto = false;
	}

	async function sair() {
		menuAberto = false;
		await sessao.sair();
		goto('/');
	}
</script>

<svelte:window onclick={fora} onkeydown={(e) => e.key === 'Escape' && ((sinoAberto = false), (menuAberto = false))} />

{#snippet item(href: string, rotulo: string, ativo: boolean)}
	<a {href} class="p-3 {ativo ? 'text-b0fg shadow-[inset_0_-3px_0_var(--vermelhao)]' : 'text-b0mut hover:text-b0fg'}" aria-current={ativo ? 'page' : undefined}>{rotulo}</a>
{/snippet}

<header class="relative z-40 flex h-14 items-center gap-2.5 border-b-2 border-ink bg-b0 pr-1.5 pl-3 md:h-16 md:gap-4 md:px-5 lg:gap-6 lg:px-6 print:hidden">
	<a href={sessao.usuario ? '/campanhas' : '/'} class="flex items-center gap-2.5" aria-label="Shinobi no Michi, página inicial">
		<Icone id="marca/ic-marca" />
		<span class="hidden font-pixel text-[17px] leading-none font-bold tracking-[.08em] whitespace-nowrap text-b0fg lg:inline">SHINOBI NO MICHI</span>
	</a>

	<span class="min-w-0 flex-1 truncate font-pixel text-sm leading-none font-bold tracking-[.06em] text-b0fg md:hidden">{titulo}</span>

	<nav class="hidden gap-1 font-pixel text-[15px] leading-none font-semibold tracking-[.06em] md:flex" aria-label="Seções">
		{@render item('/regras', 'REGRAS', regrasAtivo)}
		{#if sessao.usuario}{@render item('/campanhas', 'CAMPANHAS', campanhasAtivo)}{/if}
	</nav>

	<div class="hidden flex-1 md:block"></div>

	<button
		type="button"
		class="hidden h-10 w-[340px] items-center gap-2.5 border-2 border-[#2E2420] bg-[#16110F] pr-1.5 pl-3 text-left text-sm text-[#B5A797] hover:border-[#5C524A] lg:flex"
		onclick={() => paleta.abrir()}
		aria-label="Buscar regras, jutsus, clãs e itens (Ctrl+K)"
	>
		<Traco nome="buscar" />
		<span class="flex-1">Buscar regras, jutsus, clãs, itens…</span>
		<span class="kbd-jogo border-[#2E2420] text-[#EFE3D3]">CTRL K</span>
	</button>
	<button type="button" class="hidden h-11 w-11 items-center justify-center border-2 border-[#2E2420] text-b0fg md:flex lg:hidden" onclick={() => paleta.abrir()} aria-label="Buscar">
		<Traco nome="buscar" />
	</button>

	<button type="button" class="flex h-11 w-11 items-center justify-center text-b0fg hover:bg-[#2E2420]" onclick={() => preferencias.alternarTema()} aria-label={rotuloTema} title={rotuloTema}>
		<Traco nome={preferencias.aplicado === 'sumi' ? 'sumi' : 'washi'} />
	</button>

	{#if sessao.usuario}
		<div class="relative hidden md:block" bind:this={raizSino}>
			<button
				type="button"
				class="relative flex h-11 w-11 items-center justify-center hover:bg-[#2E2420]"
				style:background={sinoAberto ? '#2E2420' : undefined}
				aria-label={sessao.naoLidas ? `Notificações, ${sessao.naoLidas} não lidas` : 'Notificações'}
				aria-expanded={sinoAberto}
				onclick={() => ((sinoAberto = !sinoAberto), (menuAberto = false))}
			>
				<Icone id="nav/ic-nav-notificacoes" />
				{#if sessao.naoLidas}<span class="absolute top-0.5 right-0 h-5 min-w-5 bg-vermelhao px-1 text-center font-pixel text-xs leading-5 font-bold text-white">{contador}</span>{/if}
			</button>
			{#if sinoAberto}
				<div role="dialog" aria-label="Notificações" class="camada absolute top-[52px] right-[-60px] flex w-[400px] flex-col">
					<ListaNotificacoes aoAbrir={() => (sinoAberto = false)} />
					<div class="flex items-center gap-3 border-t-2 border-b3 px-3.5 py-2.5">
						<button type="button" class="link text-[13px] font-semibold" onclick={() => sessao.marcarTodasLidas()}>Marcar todas como lidas</button>
						<span class="flex-1"></span>
						<a href="/notificacoes" class="link text-[13px] font-semibold" onclick={() => (sinoAberto = false)}>Ver todas</a>
					</div>
				</div>
			{/if}
		</div>
		<div class="relative hidden md:block" bind:this={raizMenu}>
			<button
				type="button"
				class="flex items-center gap-1.5 py-1 text-b0fg"
				aria-label="Conta de {sessao.nome}"
				aria-expanded={menuAberto}
				onclick={() => ((menuAberto = !menuAberto), (sinoAberto = false))}
			>
				<Retrato nome={sessao.nome} />
				<Traco nome="baixo" />
			</button>
			{#if menuAberto}
				<div role="menu" class="camada absolute top-[52px] right-0 flex w-[240px] flex-col py-1.5">
					<span class="truncate border-b-2 border-b3 px-3.5 pt-1 pb-2.5 text-sm font-semibold">{sessao.nome}<span class="block text-xs font-normal text-mut">{sessao.usuario.email}</span></span>
					<a role="menuitem" href="/campanhas" class="flex min-h-11 items-center px-3.5 text-[15px] hover:bg-b3" onclick={() => (menuAberto = false)}>Minhas campanhas</a>
					<a role="menuitem" href="/perfil" class="flex min-h-11 items-center px-3.5 text-[15px] hover:bg-b3" onclick={() => (menuAberto = false)}>Perfil e preferências</a>
					<span class="my-1 h-0.5 bg-b3"></span>
					<button role="menuitem" type="button" class="flex min-h-11 items-center px-3.5 text-left text-[15px] hover:bg-b3" onclick={sair}>Sair</button>
				</div>
			{/if}
		</div>
	{:else if sessao.pronta}
		<div class="flex gap-2">
			<a href="/entrar{volta}" class="btn-jogo hidden px-3.5 text-b0fg hover:bg-[#2E2420] lg:inline-flex">Entrar</a>
			<a href="/criar-conta{volta}" class="btn-jogo btn-primario hidden lg:inline-flex">Criar conta</a>
			<a href="/entrar{volta}" class="btn-jogo btn-primario min-h-11 px-3 text-[13px] lg:hidden">Entrar</a>
		</div>
	{/if}
</header>
