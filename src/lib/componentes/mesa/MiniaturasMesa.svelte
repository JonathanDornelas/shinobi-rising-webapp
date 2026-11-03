<script lang="ts">
	// A caixa de miniaturas do Mestre: as peças de cada NPC do bestiário, girando num pedestal pelas 8 direções (na
	// proporção do quadro, com a régua de 1 m ao lado), as direções de arte de cada uma e a troca dos tokens da cena.
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { MINIATURAS, RUMOS, ALTURA_DA_FIGURA, type Miniatura } from '#lib/mesa/miniaturas.ts';
	import type { MesaToken } from '#lib/supabase/banco.ts';
	import FiguraMiniatura from './FiguraMiniatura.svelte';

	let {
		mesa,
		verbeteDe,
		foco = null,
		aoFechar
	}: {
		mesa: Mesa;
		/** o estágio do bestiário ("slug#estágio") do NPC do token, ou null */
		verbeteDe: (t: MesaToken) => string | null;
		/** o token que abriu a caixa (as ações começam por ele) */
		foco?: string | null;
		aoFechar: () => void;
	} = $props();

	const grupos = Object.values(
		MINIATURAS.reduce<Record<string, { verbete: string; nome: string; minis: Miniatura[] }>>((acc, m) => {
			(acc[m.verbete] ??= { verbete: m.verbete, nome: m.nome, minis: [] }).minis.push(m);
			return acc;
		}, {})
	);
	const tokenFoco = $derived(foco ? (mesa.tokens.find((t) => t.id === foco) ?? null) : null);
	// svelte-ignore state_referenced_locally
	let verbete = $state((tokenFoco && verbeteDe(tokenFoco)) || grupos[0]?.verbete || '');
	const grupo = $derived(grupos.find((g) => g.verbete === verbete) ?? grupos[0]);
	// svelte-ignore state_referenced_locally
	let escolhida = $state(tokenFoco?.miniatura ?? grupos.find((g) => g.verbete === verbete)?.minis[0]?.id ?? '');
	const mini = $derived(grupo?.minis.find((m) => m.id === escolhida) ?? grupo?.minis[0] ?? null);

	// o pedestal gira sozinho (menos para quem pediu menos movimento); passar o mouse ou focar para
	let quadro = $state(0);
	let girando = $state(typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches);
	let parado = $state(false);
	$effect(() => {
		if (!girando || parado) return;
		const id = setInterval(() => (quadro = (quadro + 1) % 8), 650);
		return () => clearInterval(id);
	});
	const girar = (d: number) => (quadro = (quadro + d + 8) % 8);

	// pixels de tela por metro no pedestal: a régua de 1 m e a figura na mesma conta do quadro
	const METRO = 96;
	/** a altura do chão (o meio do pedestal), acima da barra dos botões */
	const CHAO = 96;
	/** pixels de tela por pixel da miniatura, no pedestal (a mesma altura de figura do quadro) */
	const kPedestal = $derived(mini ? (METRO * (mini.base ? 1.95 : ALTURA_DA_FIGURA)) / mini.altura : 1);
	const tokensDoNpc = $derived(mesa.tokens.filter((t) => verbeteDe(t) === grupo?.verbete));
	const comEsta = $derived(tokensDoNpc.filter((t) => t.miniatura === mini?.id).length);
	const comMiniatura = $derived(tokensDoNpc.filter((t) => t.miniatura).length);
	const focoDoNpc = $derived(tokenFoco && verbeteDe(tokenFoco) === grupo?.verbete ? tokenFoco : null);
	let ocupado = $state(false);
	async function trocar(tokens: readonly MesaToken[], id: string | null) {
		ocupado = true;
		await mesa.trocarMiniatura(tokens, id);
		ocupado = false;
	}
</script>

<div class="flex items-center border-b-2 border-[var(--vermelhao-lo)] bg-b0 py-1.5 pr-1.5 pl-3.5">
	<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">MINIATURAS</span>
	<button type="button" class="flex h-8 w-8 items-center justify-center font-pixel text-sm text-mut hover:text-fg" aria-label="Fechar" onclick={aoFechar}>✕</button>
</div>

{#if !grupo || !mini}
	<p class="p-4 text-sm leading-5 text-mut">Ainda não há miniaturas. Elas chegam com os NPCs do bestiário, uma por estágio.</p>
{:else}
	<div class="flex flex-col gap-3 p-4">
		{#if grupos.length > 1}
			<div role="radiogroup" aria-label="NPC" class="flex flex-wrap gap-1">
				{#each grupos as g (g.verbete)}
					<button type="button" role="radio" aria-checked={g.verbete === grupo.verbete} class="min-h-9 border-2 px-2.5 text-sm font-semibold {g.verbete === grupo.verbete ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => ((verbete = g.verbete), (escolhida = g.minis[0].id))}>{g.nome}</button>
				{/each}
			</div>
		{:else}
			<p class="text-[15px] leading-5 font-semibold">{grupo.nome}<span class="font-normal text-mut">, {grupo.minis.length} {grupo.minis.length === 1 ? 'direção de arte' : 'direções de arte'}</span></p>
		{/if}

		<!-- o pedestal: a peça girando pelas 8 direções, no tamanho em que fica no quadro (a régua mede 1 m) -->
		<div
			class="pedestal relative h-[300px] overflow-hidden border-2 border-b3"
			role="group"
			aria-label="{mini.estilo}, virada para {RUMOS[quadro]}"
			onpointerenter={() => (parado = true)}
			onpointerleave={() => (parado = false)}
			onfocusin={() => (parado = true)}
			onfocusout={() => (parado = false)}
			style:--metro="{METRO}px"
			style:--chao="{CHAO}px"
		>
			{#if !mini.base}<span class="absolute left-1/2 h-[30px] w-[92px] -translate-x-1/2 rounded-[50%] border-2 border-[var(--mut)] bg-b2" style:bottom="{CHAO - 15}px"></span>{/if}
			<span class="absolute" style:left="calc(50% - {mini.pe[0] * kPedestal}px)" style:bottom="{CHAO - (mini.h - mini.pe[1]) * kPedestal}px"><FiguraMiniatura {mini} {quadro} altura={METRO * (mini.base ? 1.95 : ALTURA_DA_FIGURA)} /></span>
			<span class="absolute right-3 flex items-center gap-1" style:bottom="{CHAO}px" aria-hidden="true">
				<span class="text-[11px] text-mut">1 m</span>
				<span class="h-[var(--metro)] w-2 border-y-2 border-r-2 border-[var(--mut)]"></span>
			</span>
			<div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t-2 border-b3 bg-b1 px-1.5 py-1">
				<button type="button" class="flex h-9 w-9 items-center justify-center border-2 border-b3 font-pixel text-sm hover:border-mut" aria-label="Direção anterior" onclick={() => girar(-1)}>◀</button>
				<span class="flex-1 text-center text-sm font-semibold" aria-live="polite">{RUMOS[quadro]}</span>
				<button type="button" aria-pressed={girando} class="h-9 border-2 px-2 font-pixel text-[11px] font-bold {girando ? 'border-b3' : 'border-[var(--acc)]'}" onclick={() => (girando = !girando)}>{girando ? 'PARAR' : 'GIRAR'}</button>
				<button type="button" class="flex h-9 w-9 items-center justify-center border-2 border-b3 font-pixel text-sm hover:border-mut" aria-label="Próxima direção" onclick={() => girar(1)}>▶</button>
			</div>
		</div>

		<div role="radiogroup" aria-label="Direção de arte" class="grid grid-cols-3 gap-1.5">
			{#each grupo.minis as m (m.id)}
				{@const sel = m.id === mini.id}
				{@const usam = tokensDoNpc.filter((t) => t.miniatura === m.id).length}
				<button
					type="button"
					role="radio"
					aria-checked={sel}
					class="flex flex-col items-center gap-1 border-2 px-1 pt-1.5 pb-1 {sel ? 'border-[var(--vermelhao)] bg-[color-mix(in_srgb,var(--vermelhao)_12%,transparent)]' : 'border-b3 hover:border-mut'}"
					onclick={() => (escolhida = m.id)}
				>
					<span class="flex h-[58px] items-end"><FiguraMiniatura mini={m} altura={52 * (m.base ? 1.1 : 1)} /></span>
					<span class="text-xs leading-4 font-semibold">{m.estilo}</span>
					{#if usam}<span class="text-[11px] leading-3 text-mut">{usam === 1 ? '1 token' : `${usam} tokens`}</span>{/if}
				</button>
			{/each}
		</div>

		{#if !mesa.temMiniaturas}
			<p class="border-2 border-dashed border-b3 p-2.5 text-sm leading-5 text-mut">As miniaturas esperam a atualização do banco da Mesa.</p>
		{:else if !tokensDoNpc.length}
			<p class="border-2 border-dashed border-b3 p-2.5 text-sm leading-5 text-mut">Nenhum token deste NPC na cena. Ponha um pelo elenco e escolha a peça aqui ou no painel dele.</p>
		{:else}
			<div class="flex flex-col gap-2 border-t-2 border-b3 pt-3">
				<span class="text-sm leading-5">
					{tokensDoNpc.length === 1 ? 'Um token deste NPC na cena' : `${tokensDoNpc.length} tokens deste NPC na cena`}{comMiniatura ? (comMiniatura === tokensDoNpc.length ? ', todos de miniatura.' : `, ${comMiniatura} de miniatura.`) : ', todos de token redondo.'}
				</span>
				<div class="flex flex-wrap gap-1.5">
					{#if focoDoNpc}
						<button type="button" class="btn-jogo btn-primario min-h-10" disabled={ocupado || focoDoNpc.miniatura === mini.id} onclick={() => trocar([focoDoNpc], mini.id)}>{focoDoNpc.miniatura === mini.id ? 'NESTE TOKEN' : 'USAR NESTE TOKEN'}</button>
					{/if}
					{#if !focoDoNpc || tokensDoNpc.length > 1}
						<button type="button" class="btn-jogo min-h-10 {focoDoNpc ? '' : 'btn-primario'}" disabled={ocupado || comEsta === tokensDoNpc.length} onclick={() => trocar(tokensDoNpc, mini.id)}>{tokensDoNpc.length === 1 ? 'USAR NO TOKEN' : `USAR NOS ${tokensDoNpc.length}`}</button>
					{/if}
					<button type="button" class="btn-jogo min-h-10" disabled={ocupado || !comMiniatura} onclick={() => trocar(tokensDoNpc, null)}>VOLTAR AO TOKEN REDONDO</button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* o chão do pedestal: a grade da Mesa, de metro em metro, sumindo para o fundo */
	.pedestal {
		background:
			linear-gradient(to bottom, var(--b0) 0%, transparent 62%),
			repeating-linear-gradient(to right, color-mix(in srgb, var(--fg) 7%, transparent) 0 1px, transparent 1px var(--metro)),
			repeating-linear-gradient(to bottom, color-mix(in srgb, var(--fg) 7%, transparent) 0 1px, transparent 1px var(--metro)),
			var(--b0);
		background-position: 0 0, calc(50% - var(--metro) / 2) 0, 0 calc(100% - var(--chao));
	}
</style>
