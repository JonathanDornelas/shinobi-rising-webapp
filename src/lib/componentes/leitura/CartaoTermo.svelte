<script lang="ts">
	// O cartão dos termos e dados das regras (um só, no layout raiz): ícone, tipo, nome, resumo e o link para a regra.
	// Jutsus mostram rank, tipo, custo e ação; armas, dano e alcance; dados, a faixa de resultados e o botão de rolar.
	import { cartao, LARGURA_CARTAO } from '#lib/estado/cartao.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { carregarLexico, faixaDado, ROTULO_LINK, ROTULO_TIPO, tipoDe } from '#lib/livro/lexico.ts';
	import type { TermoLexico, TipoJutsu } from '#lib/livro/tipos.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	let lexico = $state<Map<string, TermoLexico> | null>(null);
	$effect(() => {
		if (cartao.alvo?.tipo === 'termo' && !lexico) carregarLexico().then((m) => (lexico = m));
	});
	const alvo = $derived(cartao.alvo);
	const termo = $derived(alvo?.tipo === 'termo' ? (lexico?.get(alvo.id) ?? null) : null);
	const faixa = $derived(alvo?.tipo === 'dado' ? faixaDado(alvo.expr) : null);
	const podeRolar = $derived(!!sessao.usuario && rolador.campanhas.some((k) => !k.arquivada));
	const fmt = (n: number) => String(n).replace('.', ',');

	// fecha ao tocar fora (cartão fixo), com Esc e ao rolar a página
	function fora(e: PointerEvent) {
		if (!cartao.alvo) return;
		const t = e.target as HTMLElement;
		if (t.closest('#cartao-termo') || (cartao.ancora && cartao.ancora.contains(t))) return;
		cartao.fechar();
	}
</script>

<svelte:window onpointerdown={fora} onkeydown={(e) => e.key === 'Escape' && cartao.fechar()} onscroll={() => !cartao.fixo && cartao.alvo && cartao.fechar()} />

{#if alvo && cartao.pos}
	<div
		id="cartao-termo"
		role="tooltip"
		class="camada fixed z-[80] flex flex-col text-left font-normal not-italic"
		style:width="{LARGURA_CARTAO}px"
		style:max-width="calc(100vw - 24px)"
		style:left="{cartao.pos.left}px"
		style:top="{cartao.pos.top}px"
		onpointerenter={() => cartao.manter()}
		onpointerleave={(e) => e.pointerType === 'mouse' && cartao.fecharDepois()}
	>
		{#if alvo.tipo === 'dado'}
			<div class="flex items-center gap-2.5 border-b-2 border-b3 px-3 py-2.5">
				<img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />
				<span class="flex flex-col gap-1">
					<span class="t-rotulo-sm text-mut">ROLAGEM</span>
					<span class="t-num text-xl leading-none text-fg">{alvo.expr}</span>
				</span>
			</div>
			{#if faixa}
				<div class="grid grid-cols-3 border-b-2 border-b3 text-center">
					{#each [['MÍN.', faixa.min], ['MÉDIA', faixa.media], ['MÁX.', faixa.max]] as [r, v] (r)}
						<span class="flex flex-col gap-1 py-2"><span class="t-rotulo-sm text-mut">{r}</span><span class="t-num text-lg leading-none">{fmt(v as number)}</span></span>
					{/each}
				</div>
			{/if}
			<div class="px-3 py-2.5">
				{#if podeRolar}
					<button type="button" class="btn-jogo btn-primario min-h-9 w-full text-xs" onclick={() => (rolador.sugerir(alvo.expr), cartao.fechar())}>ROLAR {alvo.expr}</button>
				{:else}
					<span class="text-[13px] leading-[18px] text-mut">Entre numa campanha para rolar direto daqui.</span>
				{/if}
			</div>
		{:else if termo}
			{@const tipo = tipoDe(termo.id)}
			<div class="flex items-center gap-2.5 border-b-2 border-b3 px-3 py-2.5">
				{#if termo.icone}<Icone id={termo.icone} />{/if}
				<span class="flex min-w-0 flex-col gap-1">
					<span class="t-rotulo-sm text-mut">{ROTULO_TIPO[tipo].toUpperCase()}</span>
					<span class="font-mincho text-lg leading-6 font-bold text-fg">{termo.rotulo}</span>
				</span>
			</div>
			{#if termo.nome !== termo.rotulo || termo.extra}
				<div class="flex flex-wrap items-center gap-x-2 gap-y-1 border-b-2 border-b3 bg-b1 px-3 py-1.5 text-[13px] leading-[18px] font-semibold text-mut">
					{#if tipo === 'jutsu' && termo.extra}
						{@const t = TIPO_JUTSU[termo.extra.tipo as TipoJutsu]}
						<span class="border-2 border-ink px-1 text-xs leading-4" style:background={t?.cor} style:color={t?.texto}>{termo.extra.tipo}</span>
						<span>Rank {termo.extra.rank}</span>·<span class="t-num">{termo.extra.custo}</span>{#if termo.extra.acao}·<span>{termo.extra.acao}</span>{/if}
					{:else if tipo === 'arma' && termo.extra}
						<span>{termo.nome}</span>·<span class="t-num">{termo.extra.dano}</span>{#if termo.extra.alcance}·<span>{termo.extra.alcance}</span>{/if}
					{:else if tipo === 'pericia' && termo.extra}
						<span>Atributo: {termo.extra.atributo}</span>
					{:else}
						<span class="italic">{termo.nome}</span>
					{/if}
				</div>
			{/if}
			<p class="m-0 px-3 py-2.5 text-sm leading-[21px] text-fg">{termo.resumo}</p>
			<a href={termo.href} class="link self-start px-3 pb-2.5 text-[13px] leading-[18px] font-semibold" onclick={() => cartao.fechar()}>{ROTULO_LINK[tipo] ?? 'Ver a regra'} →</a>
		{:else}
			<div class="px-3 py-4 text-sm text-mut">Carregando…</div>
		{/if}
	</div>
{/if}
