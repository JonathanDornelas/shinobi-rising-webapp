<script lang="ts">
	// Rolar dados (L10): expressão livre (2d6 + 1d4 − 1, 4d6kh3), botões dos 7 dados (clique soma um; botão direito ou o
	// contador tira um), vantagem/desvantagem (com 1d20), modificadores rápidos, quem pode ver e a campanha onde a rolagem entra. Sai no nome da ficha
	// ativa da pessoa naquela campanha (o Mestre rola como Mestre).
	import { untrack } from 'svelte';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { ajustarDado, contarDados, DADOS, erroExpressao, serializar, somarModificador, termos } from '#lib/rolagens/expressoes.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { ROTULO_MARCA, marcas } from '#lib/rolagens/registro.ts';
	import FacesDados from './FacesDados.svelte';
	import EscolhaDados from './EscolhaDados.svelte';

	let { compacto = false, campanhaInicial = null }: { compacto?: boolean; campanhaInicial?: string | null } = $props();

	const ativas = $derived(rolador.campanhas.filter((k) => !k.arquivada));
	// svelte-ignore state_referenced_locally
	let escolhida = $state<string | null>(campanhaInicial);
	const campanha = $derived(ativas.find((k) => k.id === escolhida) ?? ativas.find((k) => k.id === rolador.mesa?.id) ?? ativas[0] ?? null);
	const mestre = $derived(!!campanha && rolador.souMestre(campanha.id));
	const comoQuem = $derived(!campanha ? '' : mestre ? `como ${sessao.nome || 'Mestre'} · Mestre` : `como ${campanha.ficha?.nome ?? sessao.nome}`);

	let expressao = $state('1d20');
	// dado clicado no texto das regras
	$effect(() => {
		const s = rolador.sugestao;
		if (s) untrack(() => trocar(s.expr));
	});
	let erro = $state('');
	let oculta = $state(false);
	/** Vantagem ou desvantagem (cap. 2): o d20 duas vezes, fica o maior ou o menor. Volta para Normal depois de rolar. */
	let modo = $state<'normal' | 'vantagem' | 'desvantagem'>('normal');
	/** Um único 1d20 (sem kh/kl) na expressão: é nele que a vantagem vale. */
	const umD20 = (e: string) => {
		const dados = (termos(e) ?? []).filter((x) => 'lados' in x);
		return dados.length === 1 && 'lados' in dados[0] && dados[0].lados === 20 && dados[0].n === 1 && !dados[0].manter;
	};
	const temD20 = $derived(umD20(expressao));
	const MODOS_LIVRE = [
		['normal', 'NORMAL'],
		['vantagem', 'VANTAGEM'],
		['desvantagem', 'DESVANT.']
	] as const;
	const ultima = $derived(rolador.ultima && (!campanha || rolador.ultima.campanha_id === campanha.id) ? rolador.ultima : null);

	function trocar(e: string) {
		expressao = e;
		erro = '';
	}
	async function rolar() {
		const problema = erroExpressao(expressao);
		if (problema) return (erro = problema);
		if (!campanha) return (erro = 'Entre numa campanha para rolar dados.');
		const d20 = umD20(expressao);
		const r = await rolador.rolar({
			campanha: campanha.id,
			expressao,
			rotulo: 'Rolagem livre',
			personagem: mestre ? null : (campanha.ficha?.id ?? null),
			d20,
			modo: d20 ? modo : 'normal',
			tipo: 'livre',
			origem: compacto ? 'Janela de rolagens' : 'Registro · Rolar dados',
			oculta
		});
		if (r) {
			erro = '';
			modo = 'normal';
		}
	}
	const MODS = [-1, 1, 2, 5];
</script>

<div class="flex flex-col {compacto ? 'gap-1.5' : 'gap-3'}">
	{#if !compacto && ativas.length > 1}
		<div class="flex flex-col gap-1.5">
			<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut" id="rd-camp">REGISTRAR EM</span>
			<div class="flex flex-wrap border-2 border-frame" role="radiogroup" aria-labelledby="rd-camp">
				{#each ativas as k (k.id)}
					{@const on = campanha?.id === k.id}
					<button type="button" role="radio" aria-checked={on} class="min-h-10 flex-1 border-r-2 border-frame px-1.5 text-xs leading-4 font-semibold last:border-r-0 {on ? 'bg-vermelhao text-white' : 'text-mut hover:bg-b3'}" onclick={() => (escolhida = k.id)}>{k.nome}</button>
				{/each}
			</div>
		</div>
	{/if}

	<label class="flex flex-col gap-1.5">
		{#if !compacto}<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">EXPRESSÃO</span>{/if}
		<span class="flex">
			<input
				class="t-num min-w-0 flex-1 border-2 border-r-0 bg-b1 px-3 text-fg outline-focus {compacto ? 'h-10 text-base' : 'h-12 text-xl'}"
				style:border-color={erro ? 'var(--err)' : 'var(--field)'}
				aria-label="Expressão de dados"
				aria-invalid={!!erro}
				aria-describedby={compacto ? undefined : 'rd-ajuda'}
				spellcheck="false"
				autocomplete="off"
				maxlength="60"
				placeholder="2d6 + 3"
				value={expressao}
				oninput={(e) => trocar(e.currentTarget.value)}
				onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), rolar())}
			/>
			{#if compacto}
				<button type="button" class="btn-jogo btn-primario com-icone h-10 min-h-10 px-2.5 text-xs" disabled={!!rolador.rolando} onclick={rolar}><img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />ROLAR</button>
			{:else}
				<button type="button" class="h-12 w-11 border-2 bg-b1 font-pixel text-base text-mut hover:text-fg" style:border-color={erro ? 'var(--err)' : 'var(--field)'} aria-label="Limpar expressão" onclick={() => trocar('')}>✕</button>
			{/if}
		</span>
	</label>
	{#if erro}<span role="alert" class="flex items-start gap-1.5 text-[13px] leading-[18px] font-semibold text-err"><span aria-hidden="true">✖</span>{erro}</span>{/if}
	{#if !compacto}<span id="rd-ajuda" class="text-xs leading-[17px] text-mut">Clique num dado para somar mais um; o botão direito (ou o contador) tira um. Também dá para digitar: 2d6 + 1d4 − 1, ou kh/kl para manter os maiores ou menores (2d20kh1, 4d6kh3).</span>{/if}

	<div class="grid grid-cols-7 {compacto ? 'gap-[3px]' : 'gap-1'}" role="group" aria-label="Dados">
		{#each DADOS as d (d)}
			{@const n = contarDados(expressao, d)}
			<button
				type="button"
				class="relative flex flex-col items-center gap-px border-2 pt-0.5 pb-1 text-fg hover:border-vermelhao"
				style:border-color={n > 0 ? 'var(--vermelhao)' : 'var(--b3)'}
				style:background={n > 0 ? 'color-mix(in srgb, var(--vermelhao) 12%, var(--b1))' : 'var(--b1)'}
				aria-label="Adicionar 1d{d} (na expressão: {n})"
				title="Clique adiciona · botão direito remove"
				onclick={() => trocar(ajustarDado(expressao, d, 1))}
				oncontextmenu={(e) => (e.preventDefault(), trocar(ajustarDado(expressao, d, -1)))}
			>
				<img src="/dados/d{d}.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />
				<span class="font-pixel text-xs leading-none font-bold">d{d}</span>
				{#if n > 0}
					<span
						role="button"
						tabindex="-1"
						aria-hidden="true"
						class="absolute -top-0.5 -right-0.5 bg-vermelhao px-[3px] py-0.5 font-pixel text-xs leading-none font-bold text-white"
						onclick={(e) => (e.stopPropagation(), trocar(ajustarDado(expressao, d, -1)))}
						onkeydown={() => {}}>×{n}</span
					>
				{/if}
			</button>
		{/each}
	</div>

	<div class="flex border-2 border-frame" role="radiogroup" aria-label="Modo da rolagem" title={temD20 ? 'Vantagem: o d20 duas vezes, fica o maior. Desvantagem: fica o menor.' : 'Vantagem e desvantagem valem numa rolagem com 1d20'}>
		{#each MODOS_LIVRE as [m, n] (m)}
			{@const on = (temD20 ? modo : 'normal') === m}
			<button type="button" role="radio" aria-checked={on} disabled={!temD20 && m !== 'normal'} class="flex-1 border-r-2 border-frame font-pixel text-xs font-bold tracking-[0.04em] last:border-r-0 disabled:cursor-not-allowed disabled:opacity-40 {compacto ? 'min-h-8' : 'min-h-9'} {on ? 'bg-grena text-papel' : 'text-mut hover:bg-b3'}" onclick={() => (modo = m)}>{n}</button>
		{/each}
	</div>

	{#if !compacto}
		<div class="flex gap-1">
			{#each MODS as m (m)}
				<button type="button" class="min-h-9 flex-1 border-2 border-b3 font-pixel text-[13px] font-bold hover:border-mut" onclick={() => trocar(somarModificador(expressao, m))}>{m > 0 ? '+' : '−'}{Math.abs(m)}</button>
			{/each}
		</div>
		<div class="flex flex-col gap-1.5">
			<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut" id="rd-vis">QUEM PODE VER</span>
			<div role="radiogroup" aria-labelledby="rd-vis" class="flex border-2 border-frame">
				{#each [[false, 'TODOS VEEM'], [true, mestre ? 'SÓ O MESTRE' : 'EU E O MESTRE']] as const as [v, n] (n)}
					<button type="button" role="radio" aria-checked={oculta === v} class="min-h-10 flex-1 border-r-2 border-frame font-pixel text-xs font-bold tracking-[0.04em] last:border-r-0 {oculta === v ? 'bg-vermelhao text-white' : 'text-mut hover:bg-b3'}" onclick={() => (oculta = v)}>{n}</button>
				{/each}
			</div>
		</div>
		<button type="button" class="btn-jogo btn-primario com-icone min-h-[52px] justify-center text-[15px]" disabled={!!rolador.rolando || !campanha} onclick={rolar}><img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />ROLAR</button>
		{#if campanha}<span class="text-xs text-mut">{comoQuem} · {campanha.nome}</span>{:else}<span class="text-xs text-mut">Entre numa campanha para rolar dados.</span>{/if}
	{/if}

	<EscolhaDados {compacto} />

	{#if ultima}
		{@const m = marcas(ultima)[0]}
		{@const cor = ultima.d20 === 20 ? 'var(--title)' : ultima.d20 === 1 ? 'var(--err)' : undefined}
		{@const borda = ultima.d20 === 20 ? 'var(--acc)' : ultima.d20 === 1 ? 'var(--err)' : 'var(--b3)'}
		{#if compacto}
			<div role="status" class="flex items-center gap-2 border-2 bg-b1 px-1.5 py-1" style:border-color={borda}>
				<span class="t-num text-[26px] leading-none" style:color={cor}>{ultima.total}</span>
				<span class="min-w-0 flex-1 truncate font-pixel text-xs leading-4 font-bold text-mut">{serializar(termos(ultima.expressao) ?? [])}</span>
				{#if m}<span class="border-2 px-1 py-0.5 font-pixel text-xs leading-none font-bold" style:color={cor} style:border-color={borda}>{ROTULO_MARCA[m]}</span>{/if}
			</div>
		{:else}
			<div role="status" aria-live="polite" class="flex flex-col gap-2.5 border-2 bg-b1 p-3" style:border-color={borda}>
				<div class="flex items-center gap-2.5">
					<span class="t-num text-5xl leading-none" style:color={cor}>{ultima.total}</span>
					<span class="flex min-w-0 flex-col gap-1">
						<span class="font-pixel text-sm leading-none font-bold text-mut">{serializar(termos(ultima.expressao) ?? [])}</span>
						{#if m}<span class="self-start border-2 px-1.5 py-[3px] font-pixel text-xs leading-none font-bold" style:color={cor} style:border-color={borda}>{ROTULO_MARCA[m]}</span>{/if}
					</span>
				</div>
				{#each ultima.detalhe as t, i (i)}
					<div class="flex flex-wrap items-center gap-1.5">
						{#if 'lados' in t}
							<span class="min-w-14 font-pixel text-xs font-bold text-mut">{t.sinal < 0 ? '−' : ''}{t.valores.length}d{t.lados}{t.manter ? `k${t.manter}${t.k}` : ''}</span>
							<FacesDados detalhe={[t]} tamanho={26} />
							<span class="t-num ml-auto text-[13px]">{t.sinal < 0 ? '−' : ''}{t.usados.reduce((s, v) => s + v, 0)}</span>
						{:else}
							<span class="min-w-14 font-pixel text-xs font-bold text-mut">{t.sinal < 0 ? '−' : '+'}{t.valor}</span>
							<span class="t-num ml-auto text-[13px]">{t.sinal < 0 ? '−' : '+'}{t.valor}</span>
						{/if}
					</div>
				{/each}
				<span class="text-xs leading-4 text-mut">Entrou no registro de {rolador.campanha(ultima.campanha_id)?.nome ?? 'campanha'}.</span>
			</div>
		{/if}
	{/if}
</div>
