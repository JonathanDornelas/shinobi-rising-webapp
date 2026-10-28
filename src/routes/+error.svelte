<script lang="ts">
	// G4 · Páginas de erro: ilustração, título, explicação e uma saída clara.
	import { page } from '$app/state';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Traco from '#lib/componentes/ui/Traco.svelte';
	import { paleta } from '#lib/estado/paleta.svelte.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';

	const e404 = $derived(page.status === 404);
	const codigo = $derived(`ERR-${page.status}-${(page.url.pathname.length * 7919).toString(16).toUpperCase().padStart(4, '0')}`);

	async function copiar() {
		try {
			await navigator.clipboard.writeText(page.error?.detalhe ? `${codigo} · ${page.error.detalhe}` : codigo);
			toasts.mostrar('Código copiado.', 'sucesso');
		} catch {
			toasts.mostrar('Não foi possível copiar o código.', 'erro');
		}
	}
</script>

<svelte:head><title>{e404 ? 'Página não encontrada' : 'Erro'} · Shinobi no Michi</title></svelte:head>

<main class="flex flex-1 items-start justify-center px-4 py-10 md:items-center md:p-6">
	<div class="painel-sombra flex w-full max-w-[560px] flex-col">
		<div class="flex items-center border-b-2 border-ink bg-b0 px-4 py-2.5">
			<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[.12em] text-[#D9A82B]">ERRO {page.status}</span>
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[.06em] text-[#B5A797]">{e404 ? 'PÁGINA NÃO ENCONTRADA' : 'FALHA AO CARREGAR'}</span>
		</div>
		<div class="flex flex-col items-center gap-4 px-5 pt-7 pb-6 text-center md:flex-row md:items-start md:gap-6 md:px-7 md:text-left">
			<Icone id={e404 ? 'illustrations/il-404' : 'illustrations/il-erro'} tamanho={96} />
			<div class="flex w-full flex-1 flex-col gap-2.5">
				<h1 class="m-0 font-mincho text-[26px] leading-[34px] font-bold md:text-[28px] md:leading-9">{e404 ? 'Este caminho não existe' : 'Algo deu errado do nosso lado'}</h1>
				<p class="m-0 text-[15px] leading-[23px] text-mut">
					{e404 ? 'O endereço pode estar errado ou a página mudou de lugar. Busque o que procura:' : 'Tente de novo em instantes. Se continuar, envie este código para o suporte.'}
				</p>
				{#if e404}
					<button type="button" class="campo mt-1 flex items-center gap-2.5 text-left text-mut" onclick={() => paleta.abrir()}>
						<Traco nome="buscar" />Buscar regras, jutsus, clãs, itens…
					</button>
					<a href="/" class="btn-jogo btn-primario mt-2 self-stretch md:self-start">Voltar ao início</a>
				{:else}
					<div class="mt-1 flex items-center gap-2 border-2 border-b3 bg-b1 py-1.5 pr-1.5 pl-2.5">
						<span class="t-num flex-1 text-left text-sm">{codigo}</span>
						<button type="button" class="btn-jogo btn-contorno min-h-9 px-2.5 text-xs" onclick={copiar}>Copiar</button>
					</div>
					{#if page.error?.detalhe}<span class="text-left text-xs leading-4 break-all text-mut">{page.error.detalhe}</span>{/if}
					<button type="button" class="btn-jogo btn-primario mt-2 self-stretch md:self-start" onclick={() => location.reload()}>Tentar de novo</button>
				{/if}
			</div>
		</div>
	</div>
</main>
