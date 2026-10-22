<script lang="ts">
	// G5 · Página inicial — tela-título de jogo para visitantes.
	import Rodape from '#lib/componentes/shell/Rodape.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { goto } from '$app/navigation';
	import { sessao } from '#lib/estado/sessao.svelte.ts';

	// A home é estática; quem já entrou segue direto para as campanhas.
	$effect(() => {
		if (sessao.pronta && sessao.usuario) goto('/campanhas', { replace: true });
	});

	const recursos = [
		{ icone: 'nav/ic-nav-regras', titulo: 'Documentação navegável', texto: 'O livro inteiro com sumário, glossário, referências cruzadas e busca.', breve: false },
		{ icone: 'acao/ic-acao-criar-personagem', titulo: 'Criador de personagens em 11 passos', texto: 'Atributos, perícias, vila, clã e jutsus com as contas feitas para você.', breve: true },
		{ icone: 'kkg/ic-kkg-dojutsu', titulo: 'Clãs e Kekkei Genkai', texto: 'Use os clãs do livro ou crie o seu com a balança de PKG.', breve: false },
		{ icone: 'acao/ic-acao-criar-jutsu', titulo: 'Criação de jutsus por PJ', texto: 'Monte a técnica e veja rank e custo mudarem a cada escolha.', breve: true },
		{ icone: 'status/ic-status-aprovado', titulo: 'Campanhas e convites', texto: 'Crie a mesa, chame o grupo por link ou código e decida o que precisa de aprovação.', breve: false }
	];
	const inicios = [
		{ icone: 'papel/ic-papel-jogador', titulo: 'Novo jogador', texto: 'Leia as Partes I, II e a metade inicial da III antes da primeira sessão. O resto você consulta durante o jogo.', link: 'Começar pela Parte I', href: '/regras/introducao' },
		{ icone: 'papel/ic-papel-mestre', titulo: 'Mestre', texto: 'Leia tudo, com atenção especial à Parte I (Combate e Furtividade) e ao cap. 8 (Clãs).', link: 'Ver o sumário completo', href: '/regras' }
	];
</script>

{#snippet emBreve()}
	<span class="t-rotulo-sm bg-acc px-1.5 py-1 text-accfg">Em breve</span>
{/snippet}

<section class="flex flex-col items-center gap-5 border-b-2 border-ink bg-b0 px-4 pt-6 pb-8 md:gap-6 md:px-5 md:pt-10 md:pb-12 lg:gap-7 lg:px-6 lg:pt-16 lg:pb-[72px]">
	<div class="relative flex h-48 w-full max-w-[768px] justify-center overflow-hidden border-2 border-[#2E2420] md:h-auto md:overflow-visible md:shadow-[6px_6px_0_#000] lg:shadow-[8px_8px_0_#000]">
		<img src="/covers/capa-inicio.png" width="768" height="288" alt="Ninjas de Konoha saltando pelos telhados da vila ao pôr do sol, com a torre do Hokage e o monumento dos Hokage ao fundo" class="h-48 w-auto max-w-none flex-none md:h-auto md:w-full md:max-w-full" />
		<img
			src="/illustrations/il-boas-vindas-96.png"
			width="96"
			height="96"
			alt=""
			class="absolute bottom-[-48px] left-1/2 ml-[-48px] hidden border-2 border-[var(--vermelhao-lo)] bg-carvao md:block lg:shadow-[4px_4px_0_#000]"
		/>
	</div>
	<img src="/illustrations/il-boas-vindas-96.png" width="96" height="96" alt="" class="relative -mt-[68px] border-2 border-[var(--vermelhao-lo)] bg-carvao md:hidden" />
	<div class="flex flex-col items-center gap-2 text-center md:mt-8 md:gap-2.5">
		<span class="font-pixel text-xs leading-none font-bold tracking-[.14em] text-[#D9A82B] md:text-[13px]">LIVRO DE REGRAS V18.0</span>
		<h1 class="m-0 font-mincho text-[32px] leading-10 font-extrabold text-balance text-papel md:text-[40px] md:leading-[48px] lg:text-[56px] lg:leading-[64px]">Shinobi no Michi — O Caminho do Ninja</h1>
		<p class="m-0 text-base leading-[25px] text-areia md:text-[17px] md:leading-[27px] lg:text-[19px] lg:leading-[30px]">RPG de mesa ambientado no universo shinobi, de Genin a lenda</p>
	</div>

	<!-- CTAs: cards no tablet/desktop, botões no mobile -->
	<div class="flex w-full flex-col gap-2.5 md:hidden">
		<a href="/regras" class="btn-jogo btn-primario com-icone min-h-[52px] text-[15px]"><Icone id="nav/ic-nav-regras" />Ler as regras</a>
		<a href="/campanhas/nova" class="btn-jogo btn-contorno com-icone min-h-[52px] border-[#5C524A] text-[15px] text-b0fg hover:border-papel hover:bg-[#2E2420]"><Icone id="papel/ic-papel-mestre" />Criar uma campanha</a>
	</div>
	<div class="hidden w-full max-w-[780px] grid-cols-2 gap-4 md:grid lg:mt-2 lg:gap-5">
		<a href="/regras" class="cartao-link flex flex-col border-2 border-vermelhao bg-[#1F1815] shadow-[4px_4px_0_#000]">
			<span class="bg-vermelhao px-3.5 py-2.5 font-pixel text-sm leading-none font-bold tracking-[.1em] text-white">▸ LER AS REGRAS</span>
			<span class="flex items-center gap-3.5 p-4"><Icone id="nav/ic-nav-regras" tamanho={64} /><span class="text-[15px] leading-[23px] text-[#EFE3D3]">23 capítulos navegáveis, com glossário, tabelas e busca.</span></span>
		</a>
		<div class="flex flex-col border-2 border-[#2E2420] bg-[#1F1815] shadow-[4px_4px_0_#000]" aria-disabled="true">
			<span class="flex items-center gap-2 bg-[#2E2420] px-3.5 py-2 font-pixel text-sm leading-none font-bold tracking-[.1em] text-papel">CRIAR UMA CAMPANHA <span class="flex-1"></span>{@render emBreve()}</span>
			<span class="flex items-center gap-3.5 p-4"><Icone id="papel/ic-papel-mestre" tamanho={64} /><span class="text-[15px] leading-[23px] text-[#EFE3D3]">Convide o grupo, aprove fichas e criações e guarde tudo num lugar só.</span></span>
		</div>
	</div>
</section>

<section class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-3 px-4 pt-7 md:gap-5 md:px-5 md:pt-10 lg:gap-6 lg:px-6 lg:pt-16">
	<h2 class="t-rotulo m-0 text-sm">O que tem aqui</h2>
	<div class="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 md:gap-3.5 lg:grid-cols-5 lg:gap-4">
		{#each recursos as r (r.titulo)}
			<div class="painel flex items-center gap-3 px-3 py-2.5 md:sombra-painel md:items-start md:p-3.5 lg:flex-col lg:p-4">
				<div class="hidden h-[72px] w-[72px] flex-none items-center justify-center border-2 border-b3 bg-b1 lg:flex"><Icone id={r.icone} tamanho={64} /></div>
				<Icone id={r.icone} class="md:hidden" />
				<Icone id={r.icone} tamanho={64} class="hidden md:block lg:hidden" />
				<div class="flex min-w-0 flex-col gap-1 lg:gap-2.5">
					<span class="font-mincho text-base leading-[22px] font-bold md:text-[17px] md:leading-[23px] lg:text-lg lg:leading-6">{r.titulo}</span>
					<span class="text-[13px] leading-[19px] text-mut md:text-sm md:leading-[21px]">{r.texto}</span>
					{#if r.breve}<span class="self-start">{@render emBreve()}</span>{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="mx-auto box-border flex w-full max-w-[1280px] flex-col gap-3 px-4 pt-8 pb-8 md:gap-5 md:px-5 md:pb-10 lg:gap-6 lg:px-6 lg:pt-16 lg:pb-[72px]">
	<h2 class="t-rotulo m-0 text-sm">Por onde começar</h2>
	<div class="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2 lg:gap-5">
		{#each inicios as c (c.titulo)}
			<div class="painel-sombra flex">
				<div class="hidden w-28 flex-none items-center justify-center border-r-2 border-b3 bg-b1 lg:flex"><Icone id={c.icone} tamanho={64} /></div>
				<div class="flex flex-1 flex-col gap-1.5 p-3.5 md:gap-2 md:p-4 lg:px-5 lg:py-[18px]">
					<div class="flex items-center gap-2"><Icone id={c.icone} class="lg:hidden" /><span class="font-mincho text-lg leading-6 font-bold md:text-xl md:leading-7 lg:text-[22px] lg:leading-[30px]">{c.titulo}</span></div>
					<span class="text-[15px] leading-[23px]">{c.texto}</span>
					<a href={c.href} class="link self-start text-sm leading-5 font-semibold">{c.link}</a>
				</div>
			</div>
		{/each}
	</div>
</section>

<Rodape />
