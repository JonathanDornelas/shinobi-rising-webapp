<script lang="ts">
	// Regularizar (temporário): a ficha da escala antiga passa para a regra nova numa tela só.
	//  1. atributos pela compra nova (5 pontos, custo crescente, teto +3; o +1 do clã por cima);
	//  2. os aprimoramentos dos níveis já alcançados (4, 8, 12, 16 e 20), sem passar do teto;
	//  3. as perícias treinadas da criação (4, ou 5 sem clã), fora as que vila, clã e background já treinam.
	// Ao lado, a ficha antes (convertida) e depois. Confirmar grava tudo (regularizar_ficha) e não volta mais.
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ATRIBUTOS, CRIACAO, ESCALA_ATRIBUTOS, PERICIAS, PROGRESSAO, custoAtributo, descPericia, type Atributo, type Pericia } from '#lib/personagem/dados.ts';
	import { atributoDoCla, atributosTotais, limiteAtributo, normalizarFicha, orcamentoAtributos, periciasDaCriacao, periciasTreinadas, pontosPericia, recursos, sinal, type FichaDados } from '#lib/personagem/regras.ts';
	import { hrefFicha } from '#lib/personagem/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const antes: FichaDados = normalizarFicha(data.completa.dados as Partial<FichaDados>);
	const nivel = data.completa.nivel as number;
	const vagas = (PROGRESSAO.niveisAtributo as readonly number[]).filter((n) => n <= nivel);
	const doCla = atributoDoCla(antes);

	// o ponto de partida: a ficha convertida pela proporção (sem o +1 do clã, que entra por cima), cabendo nos 5 pontos
	const convertidos = atributosTotais(antes);
	let atributos = $state<Record<Atributo, number>>(Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0])) as Record<Atributo, number>);
	let aprimoramentos = $state<(Atributo | '')[]>(vagas.map(() => ''));
	let pericias = $state<Pericia[]>(periciasDaCriacao(antes));
	let salvando = $state(false);

	/** A ficha como ficará: a escala nova com as escolhas desta tela. */
	const depois = $derived<FichaDados>({
		...antes,
		escala: ESCALA_ATRIBUTOS,
		atributos,
		aprimoramentos: aprimoramentos.filter((a): a is Atributo => !!a),
		regularizadaNoNivel: nivel,
		pericias: Object.fromEntries(pericias.map((p) => [p, 1])),
		carismaDecidido: true
	});
	const orc = $derived(orcamentoAtributos(depois));
	const totais = $derived(atributosTotais(depois));
	// só a criação: sem aprimoramentos, para os limites do passo 1
	const soCriacao = $derived<FichaDados>({ ...depois, aprimoramentos: [] });
	function mudar(a: Atributo, delta: 1 | -1) {
		if (limiteAtributo(soCriacao, a, delta)) return;
		atributos = { ...atributos, [a]: atributos[a] + delta };
	}
	// as perícias: as da criação, fora as que vila, clã e background já treinam
	const deOutros = $derived(new Map([...periciasTreinadas({ ...depois, pericias: {} }).fontes].filter(([, f]) => !f.includes('Criação'))));
	const limitePericias = $derived(pontosPericia(depois).limite);
	function alternarPericia(p: Pericia) {
		if (pericias.includes(p)) pericias = pericias.filter((x) => x !== p);
		else if (pericias.length < limitePericias) pericias = [...pericias, p];
	}
	// o aprimoramento não passa do teto: conta os escolhidos antes dele
	function podeAprimorar(i: number, a: Atributo) {
		const base = atributosTotais({ ...depois, aprimoramentos: aprimoramentos.slice(0, i).filter((x): x is Atributo => !!x) });
		return base[a] < PROGRESSAO.atributoMax;
	}

	const rAntes = recursos(antes);
	const rDepois = $derived(recursos(depois));
	const problemas = $derived(
		[
			orc.restantes < 0 ? `${-orc.restantes} ponto(s) de atributo acima dos ${CRIACAO.pontosAtributo}` : '',
			orc.restantes > 0 ? `${orc.restantes} ponto(s) de atributo por gastar` : '',
			aprimoramentos.some((a) => !a) ? 'Escolha todos os aprimoramentos' : '',
			pericias.length !== limitePericias ? `Escolha ${limitePericias} perícias treinadas da criação` : '',
			pericias.some((p) => deOutros.has(p)) ? 'Uma perícia escolhida já é treinada por outra fonte; troque-a' : ''
		].filter(Boolean)
	);

	async function confirmar() {
		if (problemas.length) return;
		salvando = true;
		const { error } = await supabase().rpc('regularizar_ficha', { ficha: data.completa.id, atributos, aprimoramentos: aprimoramentos as string[], pericias });
		salvando = false;
		if (error) return void toasts.mostrar(error.message.length < 160 ? error.message : 'Não foi possível regularizar.', 'erro');
		toasts.mostrar('Ficha regularizada.', 'sucesso');
		await goto(hrefFicha(page.params.id!, data.completa.id), { refreshAll: true });
	}
</script>

<main class="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-4 py-6 md:px-8">
	<header class="flex flex-col gap-1.5">
		<span class="t-rotulo text-xs text-mut">Regularizar · temporário</span>
		<h1 class="m-0 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">{data.completa.nome}</h1>
		<p class="m-0 max-w-[70ch] text-[15px] leading-[23px] text-mut">
			As regras mudaram: os atributos agora vão até +3 (com custo crescente na criação) e as perícias treinadas valem +2. Esta ficha foi convertida automaticamente; aqui você a refaz do seu jeito. Confirmar grava as escolhas e não dá para regularizar de novo.
		</p>
	</header>

	<div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
		<div class="flex flex-col gap-5">
			<!-- 1 · atributos -->
			<section class="painel-sombra flex flex-col" aria-labelledby="reg-atr">
				<div class="flex flex-wrap items-center gap-2 border-b-2 border-b3 px-3.5 py-3">
					<h2 id="reg-atr" class="t-rotulo m-0 flex-1">1 · Atributos da criação</h2>
					<span class="t-num text-sm" style:color={orc.restantes < 0 ? 'var(--err)' : orc.restantes === 0 ? 'var(--ok)' : undefined}>{orc.usados}/{CRIACAO.pontosAtributo} pontos</span>
				</div>
				<p class="m-0 px-3.5 pt-2.5 text-xs leading-4 text-mut">+1 custa 1, +2 custa 3, +3 custa 6; −1 e −2 devolvem 1 e 2 (no máximo dois). O teto é +3, já com o bônus do clã. Convertido da regra antiga, ficaria assim: {ATRIBUTOS.map((a) => `${a.id} ${sinal(convertidos[a.id])}`).join(' · ')}.</p>
				<div class="grid gap-2 p-3.5 sm:grid-cols-2">
					{#each ATRIBUTOS as a (a.id)}
						{@const v = atributos[a.id]}
						<div class="flex items-center gap-2 border-2 border-b3 bg-b1 px-2 py-1.5" title="{a.nome}: {a.uso}">
							<Icone id="atributo/ic-atributo-{a.id.toLowerCase()}" />
							<span class="flex min-w-0 flex-1 flex-col"><span class="font-pixel text-xs font-bold">{a.id} <span class="font-sans font-normal text-mut">{a.nome}</span></span>{#if doCla === a.id}<span class="text-[11px] font-semibold text-title">+1 do clã</span>{/if}</span>
							<button type="button" class="btn-icone h-9 w-9 font-pixel text-lg font-bold" aria-label="Diminuir {a.nome}" title={limiteAtributo(soCriacao, a.id, -1) || undefined} disabled={!!limiteAtributo(soCriacao, a.id, -1)} onclick={() => mudar(a.id, -1)}>−</button>
							<span class="t-num w-9 text-center text-lg">{sinal(v)}</span>
							<button type="button" class="btn-icone h-9 w-9 font-pixel text-lg font-bold" aria-label="Aumentar {a.nome}" title={limiteAtributo(soCriacao, a.id, 1) || undefined} disabled={!!limiteAtributo(soCriacao, a.id, 1)} onclick={() => mudar(a.id, 1)}>+</button>
						</div>
					{/each}
				</div>
			</section>

			<!-- 2 · aprimoramentos -->
			{#if vagas.length}
				<section class="painel-sombra flex flex-col gap-2.5 p-3.5" aria-labelledby="reg-apr">
					<h2 id="reg-apr" class="t-rotulo m-0">2 · Aprimoramentos já ganhos (nível {nivel})</h2>
					<p class="m-0 text-xs leading-4 text-mut">+1 num atributo abaixo de +3, um por nível: {vagas.join(', ')}.</p>
					<div class="flex flex-wrap gap-2">
						{#each vagas as nv, i (nv)}
							<label class="flex items-center gap-1.5 border-2 border-b3 bg-b1 px-2 py-1 text-[13px] font-semibold">
								NV {nv}
								<select class="bg-transparent font-semibold text-fg outline-none" bind:value={aprimoramentos[i]} aria-label="Aprimoramento do nível {nv}">
									<option value="" class="bg-b2">Escolha…</option>
									{#each ATRIBUTOS as a (a.id)}<option value={a.id} disabled={!podeAprimorar(i, a.id) && aprimoramentos[i] !== a.id} class="bg-b2">+1 {a.id}</option>{/each}
								</select>
							</label>
						{/each}
					</div>
				</section>
			{/if}

			<!-- 3 · perícias -->
			<section class="painel-sombra flex flex-col gap-2.5 p-3.5" aria-labelledby="reg-per">
				<div class="flex items-center gap-2">
					<h2 id="reg-per" class="t-rotulo m-0 flex-1">{vagas.length ? 3 : 2} · Perícias treinadas da criação</h2>
					<span class="t-num text-sm">{pericias.length}/{limitePericias}</span>
				</div>
				<p class="m-0 text-xs leading-4 text-mut">Cada uma vale +2. As que vila, clã, background e níveis já treinam aparecem em dourado e não contam aqui.</p>
				<div class="flex flex-wrap gap-1.5">
					{#each PERICIAS as p (p.id)}
						{@const on = pericias.includes(p.id)}
						{@const outro = deOutros.get(p.id)}
						<button type="button" aria-pressed={on} disabled={!on && (!!outro || pericias.length >= limitePericias)} title={outro ? `Já treinada por ${outro.join(', ')}` : descPericia(p.id)} class="flex min-h-9 items-center gap-1 border-2 py-0.5 pr-2.5 pl-0.5 text-[13px] font-semibold disabled:cursor-default {on ? 'border-vermelhao bg-grena text-papel' : outro ? 'border-[rgba(217,168,43,.6)] bg-[rgba(217,168,43,.14)]' : 'border-b3 bg-b1 hover:border-mut disabled:opacity-50'}" onclick={() => alternarPericia(p.id)}><Icone id="pericia/ic-pericia-{p.id}" />{p.nome}</button>
					{/each}
				</div>
			</section>
		</div>

		<!-- antes e depois -->
		<aside class="painel-sombra flex flex-col gap-3 p-3.5 lg:sticky lg:top-4" aria-label="Antes e depois">
			<h2 class="t-rotulo m-0">Antes (convertida) → depois</h2>
			<div class="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-sm">
				{#each ATRIBUTOS as a (a.id)}
					<span class="font-pixel text-xs font-bold">{a.id}</span><span class="t-num text-mut">{sinal(convertidos[a.id])}</span><span class="t-num" style:color={totais[a.id] !== convertidos[a.id] ? 'var(--title)' : undefined}>{sinal(totais[a.id])}</span>
				{/each}
				{#each [['PV', rAntes.pv, rDepois.pv], ['PC', rAntes.pc, rDepois.pc], ['PE', rAntes.pe, rDepois.pe], ['Defesa', rAntes.defesa, rDepois.defesa], ['Iniciativa', rAntes.iniciativa, rDepois.iniciativa]] as [n, x, y] (n)}
					<span class="text-xs font-semibold">{n}</span><span class="t-num text-mut">{x}</span><span class="t-num" style:color={x !== y ? 'var(--title)' : undefined}>{y}</span>
				{/each}
			</div>
			{#if problemas.length}
				<ul class="m-0 flex list-none flex-col gap-1 p-0 text-xs leading-4 text-warn">{#each problemas as p (p)}<li>• {p}</li>{/each}</ul>
			{/if}
			<button type="button" class="btn-jogo {problemas.length ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={!!problemas.length || salvando} aria-busy={salvando} onclick={confirmar}>{#if salvando}<Girando />{/if}CONFIRMAR</button>
			<a class="link text-center text-[13px] font-semibold" href={hrefFicha(page.params.id!, data.completa.id)}>Voltar para a ficha sem regularizar</a>
		</aside>
	</div>
</main>
