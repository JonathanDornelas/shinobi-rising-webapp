<script lang="ts">
	// C1 · Minhas campanhas: abas por papel, convites pendentes, código de convite e primeiro uso.
	import { goto, refreshAll } from '$app/navigation';
	import CartaoCampanha from '#lib/componentes/campanha/CartaoCampanha.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { nomeEra, urlCapa } from '#lib/campanhas/dominio.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Aba = 'mestre' | 'jogador' | 'arquivadas';
	const grupos = $derived({
		mestre: data.campanhas.filter((c) => c.papel === 'mestre' && !c.arquivada_em),
		jogador: data.campanhas.filter((c) => c.papel === 'jogador' && !c.arquivada_em),
		arquivadas: data.campanhas.filter((c) => !!c.arquivada_em)
	});
	let escolhida = $state<Aba | null>(null);
	const aba = $derived<Aba>(escolhida ?? (grupos.mestre.length || !grupos.jogador.length ? 'mestre' : 'jogador'));
	const ABAS: { id: Aba; nome: string; curto: string }[] = [
		{ id: 'mestre', nome: 'Como Mestre', curto: 'Mestre' },
		{ id: 'jogador', nome: 'Como Jogador', curto: 'Jogador' },
		{ id: 'arquivadas', nome: 'Arquivadas', curto: 'Arquivadas' }
	];
	const VAZIO: Record<Aba, string> = {
		mestre: 'Você ainda não é Mestre de nenhuma campanha.',
		jogador: 'Você ainda não joga em nenhuma campanha. Peça o código do convite ao Mestre.',
		arquivadas: 'Nenhuma campanha arquivada.'
	};
	const primeiroUso = $derived(!data.campanhas.length && !data.convites.length);

	// ---------------------------------------------------------------- convites pendentes
	let respondendo = $state<string | null>(null);
	async function aceitar(token: string) {
		respondendo = token;
		const { data: id, error } = await supabase().rpc('aceitar_convite', { chave: token });
		respondendo = null;
		if (error || !id) {
			toasts.mostrar('Este convite não está mais disponível.', 'erro');
			await refreshAll();
			return;
		}
		toasts.mostrar('Você entrou na campanha.', 'sucesso');
		await goto(`/campanhas/${id}`, { refreshAll: true });
	}
	async function recusar(token: string) {
		respondendo = token;
		const { error } = await supabase().rpc('recusar_convite', { chave: token });
		respondendo = null;
		if (error) toasts.mostrar('Não foi possível recusar agora. Tente de novo.', 'erro');
		else toasts.mostrar('Convite recusado.', 'info');
		await refreshAll();
	}

	// ---------------------------------------------------------------- código
	let codigo = $state('');
	let erroCodigo = $state('');
	function entrarComCodigo(e: SubmitEvent) {
		e.preventDefault();
		const c = codigo.trim().toUpperCase().replace(/\s+/g, '');
		erroCodigo = /^[A-Z]{3}-?[A-Z0-9]{3}$/.test(c) ? '' : 'O código tem 6 caracteres, como KNH-4F2.';
		if (erroCodigo) return;
		goto(`/convite/${encodeURIComponent(c.includes('-') ? c : `${c.slice(0, 3)}-${c.slice(3)}`)}`);
	}
</script>

{#snippet campoCodigo(id: string, grande = false)}
	<form class="flex flex-col gap-1.5 {grande ? 'w-full' : ''}" novalidate onsubmit={entrarComCodigo}>
		<div class="flex items-center gap-2 {grande ? '' : 'max-md:flex-col max-md:items-stretch'}">
			<label for={id} class="text-sm leading-5 font-semibold {grande ? 'sr-only' : ''}">Tem um código de convite?</label>
			<div class="flex gap-2">
				<input
					{id}
					class="campo font-pixel font-semibold tracking-[0.08em] uppercase {grande ? 'h-12 flex-1' : 'h-11 w-[140px] max-md:h-12 max-md:flex-1'}"
					placeholder={grande ? 'Código do convite' : 'KNH-4F2'}
					maxlength="8"
					autocomplete="off"
					autocapitalize="characters"
					spellcheck="false"
					bind:value={codigo}
					aria-invalid={!!erroCodigo || undefined}
					aria-describedby={erroCodigo ? `${id}-erro` : undefined}
					style:border-color={erroCodigo ? 'var(--err)' : undefined}
				/>
				<button type="submit" class="btn-jogo btn-contorno px-3 text-[13px] {grande ? 'min-h-12' : 'min-h-11 max-md:min-h-12'}">ENTRAR</button>
			</div>
		</div>
		{#if erroCodigo}<span id="{id}-erro" class="text-[13px] leading-[18px] font-semibold text-err" role="alert">{erroCodigo}</span>{/if}
	</form>
{/snippet}

<main class="mx-auto flex w-full max-w-[1280px] flex-col gap-6 pb-14 md:px-6 md:pt-8">
	{#if primeiroUso}
		<div class="flex flex-col items-center gap-3 px-4 py-12 text-center md:py-20">
			<img src="/illustrations/il-boas-vindas-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
			<h1 class="m-0 font-mincho text-[26px] leading-[34px] font-bold">Comece sua jornada</h1>
			<p class="m-0 max-w-[44ch] text-[15px] leading-[23px] text-mut">Crie uma campanha como Mestre ou entre na de um amigo com o código do convite.</p>
			<div class="mt-3 flex w-full max-w-[420px] flex-col gap-2">
				<a href="/campanhas/nova" class="btn-jogo btn-primario min-h-[52px] text-[15px]">CRIAR MINHA PRIMEIRA CAMPANHA</a>
				{@render campoCodigo('codigo-primeiro', true)}
			</div>
		</div>
	{:else}
		<div class="flex items-end gap-4 max-md:hidden">
			<div class="flex flex-1 flex-col gap-1.5">
				<span class="t-rotulo">Mesa</span>
				<h1 class="t-h1 m-0">Minhas campanhas</h1>
			</div>
			<a href="/campanhas/nova" class="btn-jogo btn-primario com-icone min-h-12"><Icone id="nav/ic-nav-campanhas" />CRIAR CAMPANHA</a>
		</div>

		{#each data.convites as cv (cv.token)}
			<div class="mx-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-[var(--vermelhao-lo)] bg-grena px-3 py-2.5 text-papel sombra-painel md:mx-0">
				<img src={urlCapa(cv.capa)} width="128" height="48" alt="" class="h-12 w-32 border-2 border-carvao object-cover [image-rendering:pixelated] max-sm:hidden" />
				<div class="flex min-w-[200px] flex-1 flex-col gap-0.5">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-[#F2C14E]">CONVITE PENDENTE</span>
					<span class="text-[15px] leading-[22px] font-semibold">{cv.convidado_por ?? 'O Mestre'} convidou você para <b>{cv.campanha}</b> · {nomeEra(cv)}</span>
				</div>
				<div class="flex gap-2 max-sm:w-full max-sm:justify-end">
					<button type="button" class="btn-jogo min-h-11 px-3 text-[13px] text-papel hover:bg-[#2E2420]" disabled={respondendo === cv.token} onclick={() => recusar(cv.token)}>RECUSAR</button>
					<button type="button" class="btn-jogo btn-primario min-h-11 px-4 text-[13px]" disabled={respondendo === cv.token} aria-busy={respondendo === cv.token} onclick={() => aceitar(cv.token)}>
						{#if respondendo === cv.token}<Girando />{/if}ACEITAR
					</button>
				</div>
			</div>
		{/each}

		<div class="flex flex-wrap items-center gap-4">
			<div role="tablist" aria-label="Campanhas por papel" class="flex w-full border-y-2 border-ink bg-b2 md:w-auto">
				{#each ABAS as a (a.id)}
					{@const on = aba === a.id}
					<button
						type="button"
						role="tab"
						aria-selected={on}
						class="flex items-center gap-2 font-pixel text-[13px] leading-none font-semibold tracking-[0.04em] uppercase max-md:flex-1 max-md:justify-center max-md:px-2 max-md:py-[15px] md:px-[18px] md:py-4 md:text-[15px] md:tracking-[0.06em] {on
							? 'bg-vermelhao text-white'
							: 'text-mut hover:text-fg'}"
						onclick={() => (escolhida = a.id)}
					>
						{on ? '▸ ' : ''}<span class="max-md:hidden">{a.nome}</span><span class="md:hidden">{a.curto}</span>
						<span class="border-2 px-[5px] py-[3px] text-xs font-bold {on ? 'border-[var(--vermelhao-lo)]' : 'border-b3'}">{grupos[a.id].length}</span>
					</button>
				{/each}
			</div>
			<span class="flex-1 max-md:hidden"></span>
			<div class="max-md:order-last max-md:w-full max-md:px-4">{@render campoCodigo('codigo-convite')}</div>
		</div>

		<div class="px-4 md:px-0" role="tabpanel" aria-label={ABAS.find((a) => a.id === aba)?.nome}>
			{#if grupos[aba].length}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each grupos[aba] as c (c.id)}<CartaoCampanha {c} />{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center gap-2.5 border-2 border-dashed border-b3 p-10 text-center">
					<span class="text-base leading-[22px] font-semibold">{VAZIO[aba]}</span>
					{#if aba === 'mestre'}<a href="/campanhas/nova" class="link text-sm font-semibold">Criar campanha</a>{/if}
				</div>
			{/if}
		</div>

		<div class="sticky bottom-16 border-t-2 border-ink bg-b2 px-4 py-2 md:hidden">
			<a href="/campanhas/nova" class="btn-jogo btn-primario min-h-12 w-full">CRIAR CAMPANHA</a>
		</div>
	{/if}
</main>
