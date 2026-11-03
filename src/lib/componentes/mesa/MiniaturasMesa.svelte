<script lang="ts">
	// A caixa de miniaturas: todas as peças do catálogo em prateleiras (uma por clã ou criatura do bestiário), a escolhida
	// girando num pedestal pelas 8 direções, na escala do quadro (com a régua de 1 m ao lado). Aberta pelo painel de um
	// token, escolhe a peça do personagem ou do NPC dele (fica salva nele); o Mestre ainda ajusta o tamanho de todas as
	// miniaturas da campanha e o de cada uma.
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { ALTURA_DA_FIGURA, LIMITE_ESCALA, PRATELEIRAS, RUMOS, estagioDe, miniaturaPorId, type AjusteMiniaturas } from '#lib/mesa/miniaturas.ts';
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
		/** o token que abriu a caixa: a escolha vale para o personagem ou o NPC dele */
		foco?: string | null;
		aoFechar: () => void;
	} = $props();

	const token = $derived(foco ? (mesa.tokens.find((t) => t.id === foco) ?? null) : null);
	/** De quem é a escolha: o personagem ou o NPC do token (salva nele), ou só o token (clone, token livre). */
	const alvo = $derived.by(() => {
		const t = token;
		if (!t || t.miniatura === undefined) return null;
		if (t.personagem_id && (mesa.mestre || t.dono_id === mesa.eu)) return { tipo: 'personagem' as const, id: t.personagem_id, t };
		if (!mesa.mestre) return null;
		if (t.npc_id) return { tipo: 'npc' as const, id: t.npc_id, t };
		return { tipo: 'token' as const, id: t.id, t };
	});
	const nomeAlvo = $derived(alvo ? alvo.t.nome.split(' ')[0] : '');

	// a peça no pedestal: a do token, senão a do estágio do NPC, senão a primeira
	// svelte-ignore state_referenced_locally
	let escolhida = $state<string>(token?.miniatura ?? (token && PRATELEIRAS.flatMap((p) => p.minis).find((m) => m.verbete === verbeteDe(token))?.id) ?? PRATELEIRAS[0]?.minis[0]?.id ?? '');
	const mini = $derived(miniaturaPorId(escolhida));

	// ------------------------------------------------------------------ prateleiras: busca e grupo
	let busca = $state('');
	let grupo = $state<string | null>(null);
	const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
	const prateleiras = $derived.by(() => {
		const q = sem(busca.trim());
		return PRATELEIRAS.filter((p) => !grupo || p.chave === grupo)
			.map((p) => ({ ...p, minis: q ? p.minis.filter((m) => sem(`${m.nome} ${m.estilo}`).includes(q)) : p.minis }))
			.filter((p) => p.minis.length);
	});
	let virada = $state<string | null>(null);

	// ------------------------------------------------------------------ o pedestal gira sozinho (menos com movimento reduzido)
	let quadro = $state(0);
	let girando = $state(typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches);
	let parado = $state(false);
	$effect(() => {
		if (!girando || parado) return;
		const id = setInterval(() => (quadro = (quadro + 1) % 8), 650);
		return () => clearInterval(id);
	});
	const girar = (d: number) => (quadro = (quadro + d + 8) % 8);

	// ------------------------------------------------------------------ o tamanho (só o Mestre): rascunho ao arrastar, grava ao soltar
	// o de todas fica na cena (cada mapa tem a sua escala); o de cada miniatura, na campanha
	let rascunho = $state<AjusteMiniaturas | null>(null);
	let rascunhoCena = $state<number | null>(null);
	const ajuste = $derived(rascunho ?? mesa.miniaturasAjuste);
	const temCena = $derived(mesa.cena?.miniaturas !== undefined);
	const escalaCena = $derived(rascunhoCena ?? mesa.miniaturasCena.escala);
	const escalaAqui = $derived(mini ? Math.round(escalaCena * (ajuste?.ajustes[mini.id] ?? 1) * 1000) / 1000 : 1);
	const pct = (v: number) => `${Math.round(v * 100)}%`;
	function mexer(qual: 'cena' | 'esta', v: number, gravar: boolean) {
		if (qual === 'cena') {
			rascunhoCena = v;
			if (gravar) void mesa.definirMiniaturasCena({ escala: v }).then(() => (rascunhoCena = null));
			return;
		}
		const a = ajuste;
		if (!a || !mini) return;
		const novo: AjusteMiniaturas = { ...a, ajustes: { ...a.ajustes, [mini.id]: v } };
		if (v === 1) delete novo.ajustes[mini.id];
		rascunho = novo;
		if (gravar) void mesa.definirAjusteMiniaturas(novo).then(() => (rascunho = null));
	}

	// pixels de tela por metro no pedestal: a régua e a figura na mesma conta do quadro (cabe até o dobro do tamanho)
	const METRO = 64;
	const CHAO = 92;
	const k = $derived(mini ? (METRO * ALTURA_DA_FIGURA * escalaAqui) / mini.altura : 1);

	// ------------------------------------------------------------------ escolher
	let ocupado = $state(false);
	const usando = $derived(alvo?.t.miniatura ?? null);
	async function usar(id: string | null, soEste = false) {
		const a = alvo;
		if (!a) return;
		ocupado = true;
		if (a.tipo === 'token' || soEste) await mesa.trocarMiniatura([a.t], id);
		else await mesa.escolherMiniatura(a.tipo, a.id, id);
		ocupado = false;
	}
</script>

<div class="flex items-center border-b-2 border-[var(--vermelhao-lo)] bg-b0 py-1.5 pr-1.5 pl-3.5">
	<span class="flex-1 font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">MINIATURAS</span>
	<button type="button" class="flex h-8 w-8 items-center justify-center font-pixel text-sm text-mut hover:text-fg" aria-label="Fechar" onclick={aoFechar}>✕</button>
</div>

{#if !PRATELEIRAS.length}
	<p class="p-4 text-sm leading-5 text-mut">Ainda não há miniaturas. Elas chegam com os inimigos do bestiário.</p>
{:else}
	<div class="grid min-h-0 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_300px]">
		<!-- o pedestal e as ações (no celular, em cima) -->
		<div class="flex flex-col gap-3 sm:order-2">
			{#if mini}
				<div
					class="pedestal relative h-[330px] overflow-hidden border-2 border-b3"
					role="group"
					aria-label="{mini.nome}, virada para {RUMOS[quadro]}"
					onpointerenter={() => (parado = true)}
					onpointerleave={() => (parado = false)}
					onfocusin={() => (parado = true)}
					onfocusout={() => (parado = false)}
					style:--metro="{METRO}px"
					style:--chao="{CHAO}px"
				>
					{#if !mini.base}<span class="absolute left-1/2 h-[24px] w-[72px] -translate-x-1/2 rounded-[50%] border-2 border-[var(--mut)] bg-b2" style:bottom="{CHAO - 12}px"></span>{/if}
					<span class="absolute" style:left="calc(50% - {mini.pe[0] * k}px)" style:bottom="{CHAO - (mini.h - mini.pe[1]) * k}px"><FiguraMiniatura {mini} {quadro} altura={METRO * ALTURA_DA_FIGURA * escalaAqui} /></span>
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
				<div class="flex flex-col">
					<span class="text-[15px] leading-5 font-semibold">{mini.nome}</span>
					{#if mini.estilo !== 'Fiel à arte'}<span class="text-xs leading-4 text-mut">{mini.estilo}</span>{/if}
				</div>
			{/if}

			{#if alvo && mini}
				<div class="flex flex-col gap-2 border-t-2 border-b3 pt-3">
					<span class="text-sm leading-5">
						{#if usando === mini.id}{nomeAlvo} usa esta miniatura.{:else if usando}{nomeAlvo} usa outra: {miniaturaPorId(usando)?.nome ?? 'uma que saiu do catálogo'}.{:else}{nomeAlvo} está de token redondo.{/if}
					</span>
					<div class="flex flex-wrap gap-1.5">
						<button type="button" class="btn-jogo btn-primario min-h-10" disabled={ocupado || usando === mini.id} onclick={() => usar(mini.id)}>USAR EM {nomeAlvo.toUpperCase()}</button>
						{#if alvo.tipo === 'npc' && mesa.tokens.filter((t) => t.npc_id === alvo.id).length > 1}
							<button type="button" class="btn-jogo min-h-10" disabled={ocupado || usando === mini.id} title="Os outros tokens deste NPC ficam como estão" onclick={() => usar(mini.id, true)}>SÓ NESTE TOKEN</button>
						{/if}
						<button type="button" class="btn-jogo min-h-10" disabled={ocupado || !usando} onclick={() => usar(null)}>VOLTAR AO TOKEN REDONDO</button>
					</div>
					{#if alvo.tipo !== 'token'}<span class="text-xs leading-4 text-mut">A escolha fica salva {alvo.tipo === 'personagem' ? 'no personagem' : 'no NPC'}: vale para os tokens dele em todas as cenas.</span>{/if}
				</div>
			{:else if !foco && mesa.mestre}
				<p class="border-t-2 border-b3 pt-3 text-xs leading-4 text-mut">Para escolher a peça de um personagem ou NPC, abra o painel do token dele e toque em Caixa de miniaturas.</p>
			{/if}

			{#if mesa.mestre && !mesa.somenteLeitura && (ajuste || temCena) && mini}
				<!-- o tamanho: o de todas as miniaturas da campanha e o desta; o pedestal mostra na hora, contra a régua -->
				<fieldset class="flex flex-col gap-2 border-t-2 border-b3 pt-3">
					<legend class="sr-only">Tamanho no quadro</legend>
					{#each [...(temCena ? [['cena', 'Todas nesta cena', escalaCena] as const] : []), ...(ajuste ? [['esta', `Só ${estagioDe(mini) === mini.nome ? 'esta' : `${mini.nome.split(',')[0]}, ${estagioDe(mini)}`}`, ajuste.ajustes[mini.id] ?? 1] as const] : [])] as [qual, rotulo, v] (qual)}
						<div class="flex flex-col gap-0.5">
							<div class="flex items-baseline gap-2">
								<label for="tam-{qual}" class="flex-1 truncate text-sm font-semibold">{rotulo}</label>
								<output for="tam-{qual}" class="font-pixel text-sm font-bold">{pct(v)}</output>
								{#if v !== 1}<button type="button" class="text-xs font-semibold text-mut underline decoration-dotted underline-offset-2 hover:text-fg" onclick={() => mexer(qual, 1, true)}>Padrão</button>{/if}
							</div>
							<input
								id="tam-{qual}"
								type="range"
								class="tamanho w-full"
								min={LIMITE_ESCALA.min}
								max={LIMITE_ESCALA.max}
								step={LIMITE_ESCALA.passo}
								value={v}
								oninput={(e) => mexer(qual, Number(e.currentTarget.value), false)}
								onchange={(e) => mexer(qual, Number(e.currentTarget.value), true)}
							/>
						</div>
					{/each}
					<span class="text-xs leading-4 text-mut">O tamanho de todas vale para esta cena; o de cada miniatura, para a campanha toda. Quem está na mesa vê na hora.</span>
					{#if temCena}
						{@const sombra = mesa.miniaturasCena.sombra}
						<button type="button" role="switch" aria-checked={sombra} class="flex min-h-10 items-center gap-2.5 border-2 px-2.5 text-left text-sm font-semibold {sombra ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3'}" onclick={() => mesa.definirMiniaturasCena({ sombra: !sombra })}>
							<span class="font-pixel text-sm font-bold">{sombra ? '☒' : '☐'}</span>Sombra no chão
						</button>
						<span class="text-xs leading-4 text-mut">Com a luz dinâmica, a sombra foge da luz acesa mais perto e cresce com a distância.</span>
					{/if}
				</fieldset>
			{/if}
		</div>

		<!-- as prateleiras -->
		<div class="flex min-h-0 flex-col gap-2 sm:order-1">
			<input type="search" bind:value={busca} placeholder="Buscar por clã, criatura ou estágio" aria-label="Buscar miniatura" class="h-10 w-full border-2 border-b3 bg-b1 px-2.5 text-sm font-medium text-fg" />
			{#if PRATELEIRAS.length > 1}
				<div role="radiogroup" aria-label="Grupo" class="flex gap-1 overflow-x-auto pb-1">
					{#each [{ chave: null, nome: 'Todos' }, ...PRATELEIRAS] as p (p.chave ?? '')}
						<button type="button" role="radio" aria-checked={grupo === p.chave} class="min-h-8 shrink-0 border-2 px-2 text-xs font-semibold {grupo === p.chave ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3 hover:border-mut'}" onclick={() => (grupo = p.chave)}>{p.nome}</button>
					{/each}
				</div>
			{/if}
			<div class="flex max-h-[min(56dvh,520px)] min-h-0 flex-col gap-3 overflow-y-auto pr-1">
				{#each prateleiras as p (p.chave)}
					<section class="flex flex-col gap-1">
						<h3 class="text-sm leading-5 font-semibold">{p.nome}</h3>
						<div role="radiogroup" aria-label={p.nome} class="flex flex-wrap items-end">
							{#each p.minis as m (m.id)}
								{@const sel = m.id === escolhida}
								{@const usada = alvo?.t.miniatura === m.id}
								<button
									type="button"
									role="radio"
									aria-checked={sel}
									aria-label="{m.nome}{m.estilo !== 'Fiel à arte' ? `, ${m.estilo}` : ''}{usada ? ', em uso' : ''}"
									class="figura flex w-[68px] flex-col items-center pt-1 {sel ? 'escolhida' : ''}"
									onclick={() => (escolhida = m.id)}
									onpointerenter={() => (virada = m.id)}
									onpointerleave={() => (virada = null)}
								>
									<span class="flex h-[60px] items-end"><FiguraMiniatura mini={m} quadro={virada === m.id ? 1 : 0} altura={54} /></span>
									<span class="tabua"></span>
									<span class="mt-1 max-w-full truncate px-0.5 text-[11px] leading-3 {sel ? 'font-bold' : 'text-mut'}">{estagioDe(m)}</span>
									{#if m.estilo !== 'Fiel à arte'}<span class="max-w-full truncate px-0.5 text-[10px] leading-3 text-mut">{m.estilo}</span>{/if}
									{#if usada}<span class="mt-0.5 font-pixel text-[10px] leading-3 font-bold text-[var(--acc)]">EM USO</span>{/if}
								</button>
							{/each}
						</div>
					</section>
				{:else}
					<p class="border-2 border-dashed border-b3 p-3 text-sm leading-5 text-mut">Nenhuma miniatura com “{busca}”. Tente o nome do clã ou o estágio (Genin, Chunin, Jounin).</p>
				{/each}
			</div>
		</div>
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
	/* a prateleira: cada figura fica de pé numa tábua; lado a lado, as tábuas viram uma prateleira só */
	.tabua {
		display: block;
		align-self: stretch;
		height: 6px;
		background: var(--b3);
		box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--b0) 60%, transparent);
	}
	.figura > span:first-child {
		transition: transform 120ms steps(2);
	}
	.figura:hover > span:first-child,
	.figura.escolhida > span:first-child {
		transform: translateY(-3px);
	}
	.figura.escolhida .tabua {
		background: var(--vermelhao);
	}
	.figura:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.figura > span:first-child {
			transition: none;
		}
	}
	.tamanho {
		accent-color: var(--vermelhao);
	}
</style>
