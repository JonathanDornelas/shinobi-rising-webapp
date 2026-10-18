<script lang="ts">
	// P4 · Subir de nível: passos dinâmicos conforme o nível (cap. 17) e os marcos do clã (cap. 8.3),
	// com o "antes → depois" sempre à vista e a comemoração no fim.
	import { goto } from '$app/navigation';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Brasao from '#lib/componentes/cla/Brasao.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import { rankSugerido } from '#lib/campanhas/dominio.ts';
	import { ATRIBUTOS, CUSTO_JUTSU, ELEMENTOS, ESPECIALIZACOES, PERICIAS, PROGRESSAO, type Atributo, type Pericia } from '#lib/personagem/dados.ts';
	import {
		aplicarNivel,
		aplicarTreinos,
		atributosLivres,
		ficha,
		NOME_PASSO_NIVEL,
		nomeElemento,
		periciasLivres,
		planoNivel,
		type EstadoJogo
	} from '#lib/personagem/progressao.ts';
	import { especializacoes, normalizarFicha, resumoFicha, sinal, treinoPericia, type FichaDados, type GanhoMarco, type ItemLoja } from '#lib/personagem/regras.ts';
	import { hrefFicha } from '#lib/personagem/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json } from '#lib/supabase/banco.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const p = data.personagem;
	// svelte-ignore state_referenced_locally
	const cat = data.catalogo;
	const loja = cat.loja as ItemLoja[];
	const antes = normalizarFicha(p.dados as Partial<FichaDados>);
	const novo = p.nivel + 1;
	const plano = planoNivel(antes, novo, cat.cla?.marcos ?? [], cat.jutsusDoCla);
	const fAntes = ficha(antes, loja);
	const ptMarco = plano.marco?.pt ?? 0;
	const ptDepois = p.pt + PROGRESSAO.porNivel.pt + ptMarco;

	let passo = $state(0);
	let atributo = $state<Atributo | null>(null);
	let pericia = $state<Pericia | null>(null);
	let especializacao = $state<string | null>(null);
	let espElemento = $state<string | null>(null);
	let elemento = $state<string | null>(null);
	let escolhaMarco = $state<Pericia | null>(null);
	let confirmando = $state(false);
	let celebrar = $state(false);
	let falha = $state('');

	const marco = $derived<GanhoMarco | undefined>(
		plano.marco ? { ...plano.marco, pericias: [...(plano.marco.pericias ?? []), ...(escolhaMarco ? [escolhaMarco] : [])] } : undefined
	);
	const depois = $derived.by(() => {
		const d = aplicarNivel(antes, {
			nivel: novo,
			...(atributo ? { atributo } : {}),
			...(pericia ? { pericia } : {}),
			...(especializacao ? { especializacao: { id: especializacao, elemento: espElemento } } : {}),
			...(marco ? { marco } : {})
		});
		return elemento ? aplicarTreinos(d, [{ tipo: 'elemento', id: elemento, pt: plano.elemento!.pt }]) : d;
	});
	const fDepois = $derived(ficha(depois, loja));

	const passoAtual = $derived(plano.passos[passo]);
	const pendente = $derived(
		(plano.passos.includes('atributo') && !atributo) ||
			(plano.passos.includes('pericia') && !pericia) ||
			(plano.passos.includes('especializacao') && (!especializacao || (ESPECIALIZACOES[especializacao]?.escolheElemento && !espElemento))) ||
			(!!plano.marco?.escolhaPericia && !escolhaMarco)
	);
	const espsDisponiveis = $derived(cat.especializacoes.filter((e) => !e.bloqueio && !especializacoes(antes).some((x) => x.id === e.id)));
	const atributosOk = atributosLivres(antes);
	const periciasOk = periciasLivres(antes);

	const linhas = $derived([
		{ icone: 'recurso/ic-recurso-xp', rotulo: 'Nível', a: String(p.nivel), b: String(novo) },
		{ icone: 'recurso/ic-recurso-pv', rotulo: 'PV', a: String(fAntes.recursos.pv), b: String(fDepois.recursos.pv) },
		{ icone: 'recurso/ic-recurso-pc', rotulo: 'PC', a: String(fAntes.recursos.pc), b: String(fDepois.recursos.pc) },
		{ icone: 'recurso/ic-recurso-pe', rotulo: 'PE', a: String(fAntes.recursos.pe), b: String(fDepois.recursos.pe) },
		{ icone: 'recurso/ic-recurso-pt', rotulo: 'PT', a: String(p.pt), b: String(ptDepois - (elemento ? plano.elemento!.pt : 0)) },
		{ icone: 'elemento/ic-elemento-katon', rotulo: 'Elementos', a: String(fAntes.elementos.length), b: String(fDepois.elementos.length) },
		...ATRIBUTOS.filter((a) => fAntes.atributos[a.id] !== fDepois.atributos[a.id]).map((a) => ({
			icone: `atributo/ic-atributo-${a.id.toLowerCase()}`,
			rotulo: a.id,
			a: sinal(fAntes.atributos[a.id]),
			b: sinal(fDepois.atributos[a.id])
		})),
		{ icone: 'recurso/ic-recurso-pic', rotulo: 'PIC por arco', a: String(fAntes.pic), b: String(fDepois.pic) }
	]);

	async function confirmar() {
		if (pendente) return;
		confirmando = true;
		falha = '';
		const sb = supabase();
		const semElemento = aplicarNivel(antes, {
			nivel: novo,
			...(atributo ? { atributo } : {}),
			...(pericia ? { pericia } : {}),
			...(especializacao ? { especializacao: { id: especializacao, elemento: espElemento } } : {}),
			...(marco ? { marco } : {})
		});
		// os recursos atuais sobem junto com os máximos
		const est = (p.estado ?? {}) as EstadoJogo;
		const fN = ficha(semElemento, loja);
		const estado: EstadoJogo = {
			...est,
			...(est.pv !== undefined ? { pv: est.pv + (fN.recursos.pv - fAntes.recursos.pv) } : {}),
			...(est.pc !== undefined ? { pc: est.pc + (fN.recursos.pc - fAntes.recursos.pc) } : {}),
			...(est.pe !== undefined ? { pe: est.pe + (fN.recursos.pe - fAntes.recursos.pe) } : {})
		};
		const { error } = await sb.rpc('subir_nivel', {
			ficha: p.id,
			dados: semElemento as unknown as Json,
			resumo: resumoFicha(semElemento, loja) as unknown as Json,
			estado: estado as unknown as Json,
			pt_marcos: ptMarco
		});
		if (error) {
			confirmando = false;
			falha = 'Não foi possível subir de nível agora. Nada foi alterado; tente de novo.';
			return;
		}
		if (elemento && plano.elemento) {
			const comElemento = aplicarTreinos(semElemento, [{ tipo: 'elemento', id: elemento, pt: plano.elemento.pt }]);
			const r = await sb.rpc('treinar', {
				ficha: p.id,
				dados: comElemento as unknown as Json,
				resumo: resumoFicha(comElemento, loja) as unknown as Json,
				custo: plano.elemento.pt,
				descricao: `${plano.elemento.ordem}º elemento: ${nomeElemento(elemento)}`
			});
			if (r.error) toasts.mostrar('Nível alcançado, mas o elemento não foi registrado. Treine-o pela ficha.', 'aviso', 7000);
		}
		confirmando = false;
		celebrar = true;
	}
	const proximoRank = Object.entries(PROGRESSAO.rankPorNivel).find(([, n]) => n > novo);
</script>

<div class="flex flex-1 flex-col">
	<div class="flex min-h-16 items-center gap-3 border-b-2 border-ink bg-b0 px-4 md:px-6">
		<Icone id="acao/ic-acao-subir-nivel" />
		<h1 class="m-0 flex-1 font-mincho text-xl leading-[26px] font-bold text-b0fg max-sm:text-base">{p.nome} · Nível {p.nivel} → {novo}</h1>
		<a href={hrefFicha(data.campanha.id, p.id)} class="btn-jogo min-h-11 px-3 text-[13px] text-b0mut hover:text-b0fg">SAIR SEM SALVAR</a>
	</div>

	<div class="grid flex-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_340px]">
		<nav aria-label="Passos" class="flex flex-col border-r-2 border-b3 bg-b2 py-3 max-lg:hidden">
			<ol class="m-0 list-none p-0">
				{#each plano.passos as s, i (s)}
					{@const atual = passo === i}
					{@const feito = i < passo}
					<li>
						<button type="button" aria-current={atual ? 'step' : undefined} class="flex min-h-12 w-full items-center gap-2.5 px-3.5 text-left {atual ? 'bg-grena text-papel shadow-[inset_4px_0_0_#C44536]' : 'text-fg hover:bg-b3'}" onclick={() => (passo = i)}>
							<span class="t-num flex h-7 w-7 items-center justify-center border-2 text-[13px] {atual ? 'border-ink bg-vermelhao text-white' : feito ? 'border-ink bg-ok text-okfg' : 'border-b3 text-mut'}">{feito ? '✓' : i + 1}</span>
							<span class="text-[15px] leading-5 font-semibold">{NOME_PASSO_NIVEL[s]}</span>
						</button>
					</li>
				{/each}
			</ol>
			<span class="flex-1"></span>
			<p class="m-3 border-2 border-dashed border-b3 p-2.5 text-xs leading-[17px] text-mut">Promoção de rank narrativo (Exame Chunin, Jounin) não é automática: o Mestre define o rank.</p>
		</nav>

		<div class="flex min-w-0 flex-col">
			<main class="flex flex-1 flex-col gap-[18px] px-4 py-6 md:px-9 md:py-7">
				<div class="flex flex-col gap-1">
					<span class="t-rotulo text-mut">Passo {passo + 1} de {plano.passos.length}</span>
					<h2 class="m-0 font-mincho text-[30px] leading-[38px] font-bold max-md:text-2xl">{NOME_PASSO_NIVEL[passoAtual]}</h2>
				</div>
				{#if falha}<Alerta tipo="erro" titulo={falha} />{/if}

				{#if passoAtual === 'recursos'}
					<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
						{#each [['recurso/ic-recurso-pv', 'PV', PROGRESSAO.porNivel.pv, fAntes.recursos.pv], ['recurso/ic-recurso-pc', 'PC', PROGRESSAO.porNivel.pc, fAntes.recursos.pc], ['recurso/ic-recurso-pe', 'PE', PROGRESSAO.porNivel.pe, fAntes.recursos.pe], ['recurso/ic-recurso-pt', 'PT', PROGRESSAO.porNivel.pt + ptMarco, p.pt]] as const as [icone, k, g, a] (k)}
							<div class="painel-sombra flex flex-col items-start gap-2 p-3.5">
								<Icone id={icone} />
								<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.08em] text-mut">{k}</span>
								<span class="t-num text-[26px] leading-none text-ok">+{g}</span>
								<span class="text-[13px] leading-[18px] font-semibold">{a} → {a + g}</span>
							</div>
						{/each}
					</div>
					<p class="m-0 text-sm leading-[21px] text-mut">Automático. Nada para escolher neste passo{ptMarco ? ` (os PT incluem +${ptMarco} do marco do clã)` : ''}.</p>
				{:else if passoAtual === 'atributo'}
					<p class="m-0 text-sm leading-[21px] text-mut">Nível {novo}: +1 ponto de atributo. Limite +8; o atributo do clã sobe com os marcos (cap. 17).</p>
					<div role="radiogroup" aria-label="Atributo" class="grid grid-cols-2 gap-3 md:grid-cols-3">
						{#each ATRIBUTOS as a (a.id)}
							{@const livre = atributosOk.includes(a.id)}
							{@const on = atributo === a.id}
							<button type="button" role="radio" aria-checked={on} disabled={!livre} title={livre ? undefined : 'No limite atual'} class="relative flex flex-col gap-1.5 border-2 bg-b2 p-3 text-left disabled:opacity-50 {on ? 'border-vermelhao shadow-[4px_4px_0_#8B2E20]' : 'border-frame hover:border-mut'}" onclick={() => (atributo = a.id)}>
								<Icone id="atributo/ic-atributo-{a.id.toLowerCase()}" />
								<span class="font-pixel text-sm font-bold">{a.id} <span class="font-sans text-xs font-normal text-mut">{a.nome}</span></span>
								<span class="t-num text-xl">{sinal(fAntes.atributos[a.id])} → <span class="text-ok">{sinal(fAntes.atributos[a.id] + 1)}</span></span>
								{#if on}<span class="t-num absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center border-2 border-ink bg-vermelhao text-sm text-white">✓</span>{/if}
							</button>
						{/each}
					</div>
				{:else if passoAtual === 'pericia'}
					<p class="m-0 text-sm leading-[21px] text-mut">Nível {novo}: +1 ponto de treino em uma perícia (limite de treino +5).</p>
					<div role="radiogroup" aria-label="Perícia" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
						{#each PERICIAS as pr (pr.id)}
							{@const livre = periciasOk.includes(pr.id)}
							{@const on = pericia === pr.id}
							<button type="button" role="radio" aria-checked={on} disabled={!livre} class="flex min-h-12 items-center gap-2 border-2 bg-b2 py-1 pr-3 pl-1 text-left disabled:opacity-50 {on ? 'border-vermelhao bg-grena text-papel' : 'border-frame hover:border-mut'}" onclick={() => (pericia = pr.id)}>
								<Icone id="pericia/ic-pericia-{pr.id}" /><span class="flex-1 text-sm font-semibold">{pr.nome}</span><span class="t-num text-sm">+{treinoPericia(antes, pr.id)} → +{treinoPericia(antes, pr.id) + 1}</span>
							</button>
						{/each}
					</div>
				{:else if passoAtual === 'especializacao'}
					<p class="m-0 text-sm leading-[21px] text-mut">Nível {novo}: uma nova especialização, no nível 1 (cap. 19).</p>
					<div role="radiogroup" aria-label="Especialização" class="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
						{#each espsDisponiveis as e (e.id)}
							{@const on = especializacao === e.id}
							<button type="button" role="radio" aria-checked={on} class="relative flex flex-col gap-1.5 border-2 bg-b2 p-2.5 text-left {on ? 'border-vermelhao shadow-[4px_4px_0_#8B2E20]' : 'border-frame hover:border-mut'}" onclick={() => ((especializacao = e.id), (espElemento = null))}>
								<Icone id={e.icone} /><span class="font-mincho text-sm font-bold">{e.nome}</span><span class="text-xs leading-4 text-mut">{e.niveis[0]?.texto}</span>
							</button>
						{/each}
					</div>
					{#if especializacao && ESPECIALIZACOES[especializacao]?.escolheElemento}
						<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Elemento da especialização">
							{#each ELEMENTOS as e (e.id)}
								<button type="button" role="radio" aria-checked={espElemento === e.id} class="inline-flex h-11 items-center gap-1 border-2 pr-3 pl-1 text-sm font-semibold" style:border-color={espElemento === e.id ? '#C44536' : 'var(--b3)'} onclick={() => (espElemento = e.id)}>
									<Icone id="elemento/ic-elemento-{e.id}" />{e.nome}
								</button>
							{/each}
						</div>
					{/if}
				{:else if passoAtual === 'elemento' && plano.elemento}
					<div class="flex items-center gap-2.5 border-2 border-acc bg-[rgba(217,168,43,.12)] py-1.5 pr-3 pl-1.5 text-sm leading-5 font-semibold">
						<Icone id="recurso/ic-recurso-pt" />Nível {novo} libera o {plano.elemento.ordem}º elemento por {plano.elemento.pt} PT. {p.nome} terá {ptDepois} PT depois deste nível.
					</div>
					<div class="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Elemento">
						{#each ELEMENTOS as e (e.id)}
							{@const meu = fAntes.elementos.includes(e.id)}
							{@const on = elemento === e.id}
							<button
								type="button"
								role="radio"
								aria-checked={on}
								disabled={meu || ptDepois < plano.elemento.pt}
								class="flex min-h-[52px] items-center gap-1.5 border-2 pr-4 pl-1.5 text-[15px] font-semibold disabled:opacity-50"
								style:background="color-mix(in srgb, {e.cor} 12%, transparent)"
								style:border-color={on ? '#C44536' : `color-mix(in srgb, ${e.cor} 55%, transparent)`}
								onclick={() => (elemento = on ? null : e.id)}
							>
								<Icone id="elemento/ic-elemento-{e.id}" />{e.nome}<span class="text-xs font-semibold text-mut">{meu ? 'já tem' : on ? `−${plano.elemento.pt} PT` : ''}</span>
							</button>
						{/each}
					</div>
					<button type="button" class="link self-start text-sm font-semibold" onclick={() => ((elemento = null), passo++)}>Guardar os PT e escolher depois no treino</button>
				{:else if passoAtual === 'marco' && plano.marco}
					<div class="painel-sombra">
						<div class="flex items-center gap-3 border-b-2 border-b3 px-3.5 py-3">
							<span class="t-num flex h-9 w-9 items-center justify-center border-2 border-ink bg-vermelhao text-base text-white">{novo}</span>
							{#if cat.cla}<Brasao slug={cat.cla.slug} kamon={cat.cla.brasao?.kamon} cor={cat.cla.brasao?.cor} />{/if}
							<span class="flex-1 text-[15px] leading-[22px] font-medium">{plano.marco.texto}</span>
						</div>
						<ul class="m-0 flex list-none flex-col gap-1 px-3.5 py-3 text-sm">
							{#each Object.entries(plano.marco.atributos ?? {}) as [a, v] (a)}<li>+{v} {a}</li>{/each}
							{#each Object.entries(plano.marco.limites ?? {}) as [a, v] (a)}<li>Limite de {a} passa a +{v}</li>{/each}
							{#each plano.marco.pericias ?? [] as pr (pr)}<li>+1 em {PERICIAS.find((x) => x.id === pr)?.nome}</li>{/each}
							{#if plano.marco.pt}<li>+{plano.marco.pt} PT</li>{/if}
							{#if plano.marco.pic}<li>+{plano.marco.pic} PIC por arco</li>{/if}
							{#each plano.marco.jutsus ?? [] as j (j)}<li>Aprende {cat.jutsus.find((x) => x.slug === j)?.nome ?? j}</li>{/each}
						</ul>
						{#if plano.marco.escolhaPericia}
							<div class="flex flex-wrap gap-2 border-t-2 border-b3 px-3.5 py-3" role="radiogroup" aria-label="Perícia do marco">
								{#each plano.marco.escolhaPericia as pr (pr)}
									<button type="button" role="radio" aria-checked={escolhaMarco === pr} class="min-h-11 border-2 px-3 text-sm font-semibold {escolhaMarco === pr ? 'border-vermelhao bg-grena text-papel' : 'border-b3'}" onclick={() => (escolhaMarco = pr)}>+1 em {PERICIAS.find((x) => x.id === pr)?.nome}</button>
								{/each}
							</div>
						{/if}
					</div>
					<p class="m-0 text-[13px] text-mut">Habilidades e criações do clã descritas no marco ficam registradas na ficha; as regras completas estão na página do clã.</p>
				{:else if passoAtual === 'rank' && plano.rank}
					<div class="painel-sombra flex items-center gap-4 p-4">
						<Icone id="rank/ic-rank-{plano.rank.toLowerCase()}" tamanho={64} alt="Rank {plano.rank}" />
						<div class="flex flex-col gap-1">
							<span class="font-mincho text-lg leading-6 font-bold">Jutsus Rank {plano.rank} liberados</span>
							<span class="text-sm leading-[21px] text-mut">A partir do nível {novo}, aprender um jutsu Rank {plano.rank} custa {CUSTO_JUTSU[plano.rank]} PT no treino.{proximoRank ? ` Rank ${proximoRank[0]} no nível ${proximoRank[1]}.` : ''}</span>
						</div>
					</div>
				{:else if passoAtual === 'resumo'}
					<dl class="painel m-0 flex flex-col">
						{#each [['Nível', `${p.nivel} → ${novo} · ${rankSugerido(novo)}`], ['PV / PC / PE', `${fDepois.recursos.pv} / ${fDepois.recursos.pc} / ${fDepois.recursos.pe}`], ['PT', `${ptDepois}${elemento ? ` − ${plano.elemento?.pt} = ${ptDepois - (plano.elemento?.pt ?? 0)}` : ''}`], ...(atributo ? [['Atributo', `+1 ${atributo}`]] : []), ...(pericia ? [['Perícia', `+1 de treino em ${PERICIAS.find((x) => x.id === pericia)?.nome}`]] : []), ...(especializacao ? [['Especialização', cat.especializacoes.find((e) => e.id === especializacao)?.nome ?? '']] : []), ...(plano.elemento ? [['Elemento', elemento ? nomeElemento(elemento) : 'escolher depois no treino']] : []), ...(plano.marco ? [['Marco', plano.marco.texto]] : [])] as [k, v] (k)}
							<div class="flex gap-3 border-b-2 border-b3 px-3.5 py-2.5 text-[15px] leading-[22px] last:border-b-0">
								<dt class="flex-1 font-medium">{k}</dt><dd class="t-num m-0 text-right text-base">{v}</dd>
							</div>
						{/each}
					</dl>
					{#if pendente}<Alerta tipo="aviso" titulo="Falta escolher algo nos passos anteriores." />{/if}
				{/if}
			</main>

			<!-- mobile: antes → depois logo abaixo -->
			<section class="border-t-2 border-b3 bg-b2 px-4 py-3 xl:hidden" aria-label="Antes e depois">
				<span class="t-rotulo text-xs">Resumo</span>
				{#each linhas as r (r.rotulo)}
					<div class="flex items-center gap-2 border-b-2 border-b3 py-1 text-sm font-semibold last:border-b-0">
						<span class="flex-1">{r.rotulo}</span><span class="t-num text-mut">{r.a} →</span><span class="t-num" style:color={r.a !== r.b ? 'var(--ok)' : undefined}>{r.b}</span>
					</div>
				{/each}
			</section>

			<div class="sticky bottom-16 flex items-center gap-3.5 border-t-2 border-ink bg-b2 px-4 py-2.5 md:bottom-0 md:px-5">
				<button type="button" class="btn-jogo btn-fantasma" disabled={passo === 0} onclick={() => passo--}>◂ VOLTAR</button>
				<span class="flex-1"></span>
				{#if passo < plano.passos.length - 1}
					<button type="button" class="btn-jogo btn-primario" onclick={() => passo++}>PRÓXIMO ▸</button>
				{:else}
					<button type="button" class="btn-jogo {pendente ? 'bg-b3 text-mut' : 'btn-primario'}" disabled={pendente || confirmando} aria-busy={confirmando} onclick={confirmar}>
						{#if confirmando}<Girando />{/if}CONFIRMAR NÍVEL {novo}
					</button>
				{/if}
			</div>
		</div>

		<aside class="flex flex-col gap-2.5 border-l-2 border-b3 bg-b2 p-4 max-xl:hidden" aria-label="Antes e depois">
			<span class="t-rotulo">Antes → depois</span>
			{#each linhas as r (r.rotulo)}
				<div class="flex items-center gap-2 border-b-2 border-b3 py-1.5">
					<Icone id={r.icone} /><span class="flex-1 text-[13px] leading-[18px] font-semibold">{r.rotulo}</span>
					<span class="t-num text-[15px] text-mut">{r.a}</span><span class="t-num text-[13px] text-mut">→</span>
					<span class="t-num text-lg" style:color={r.a !== r.b ? 'var(--ok)' : undefined}>{r.b}</span>
				</div>
			{/each}
		</aside>
	</div>
</div>

{#if celebrar}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(14,11,10,.86)] px-4" role="dialog" aria-modal="true" aria-label="Nível alcançado">
		<div class="flex w-full max-w-[560px] flex-col items-center gap-3 border-2 border-[#BF9000] bg-b2 p-8 text-center shadow-[8px_8px_0_#5C4600] outline-2 outline-offset-[6px] outline-[#8B2E20]">
			<Icone id="acao/ic-acao-subir-nivel" tamanho={96} class="subir-nivel" />
			<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.14em] text-title">NÍVEL ALCANÇADO</span>
			<span class="t-num text-[64px] leading-none">{novo}</span>
			<span class="font-mincho text-2xl leading-8 font-bold">{p.nome} ficou mais forte</span>
			<span class="text-[15px] leading-[23px] text-mut">
				+5 PV, +3 PC, +3 PE e +{PROGRESSAO.porNivel.pt + ptMarco} PT.{plano.rank ? ` Jutsus Rank ${plano.rank} liberados.` : ''}{plano.elemento && !elemento ? ` O ${plano.elemento.ordem}º elemento já pode ser treinado.` : ''}
			</span>
			<div class="mt-1.5 flex flex-wrap justify-center gap-2">
				<button type="button" class="btn-jogo btn-primario min-h-12" onclick={() => goto(hrefFicha(data.campanha.id, p.id), { refreshAll: true })}>VER FICHA</button>
				<button type="button" class="btn-jogo btn-contorno min-h-12" onclick={() => goto(`${hrefFicha(data.campanha.id, p.id)}?treino=1`, { refreshAll: true })}>IR PARA O TREINO</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.subir-nivel) {
		animation: subir 400ms ease-out both;
	}
</style>
