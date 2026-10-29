<script lang="ts">
	// Tooltip de ação da Mesa (inspirado no Baldur's Gate 3): nome e tipo, a faixa de dano com o dado na cor do
	// elemento, o efeito, alcance/área/duração/resistência com ícones e, embaixo, a ação e o custo.
	import { ELEMENTO } from '#lib/livro/dominio.ts';
	import { corElemento, lerDados } from '#lib/mesa/hud.ts';
	import type { ArmaMesa, JutsuMesa } from '#lib/mesa/tipos.ts';
	import Icone from '../ui/Icone.svelte';
	import DadoHud from './DadoHud.svelte';

	let { acao, ancora }: { acao: JutsuMesa | ArmaMesa; ancora: DOMRect } = $props();

	const jutsu = $derived('regua' in acao ? acao : null);
	const arma = $derived('regua' in acao ? null : acao);
	const el = $derived(jutsu ? corElemento(jutsu.elemento, jutsu.nome) : null);
	const faixa = $derived(acao.dano ? lerDados(acao.dano.expr) : null);
	const cura = $derived(jutsu?.cura ? lerDados(jutsu.cura) : null);
	const subtitulo = $derived(
		jutsu
			? [jutsu.tipo, jutsu.rank ? `Rank ${jutsu.rank}` : 'Habilidade', jutsu.elemento && ELEMENTO[jutsu.elemento] ? ELEMENTO[jutsu.elemento].nome : null].filter(Boolean).join(' · ')
			: `Arma · ${arma!.rotuloAlcance}`
	);
	const acaoTxt = $derived(jutsu?.acao || (jutsu?.porCena ? 'Uma vez por cena' : 'Primária'));

	// ao lado da linha: à esquerda da ficha quando cabe, senão à direita; sem passar da tela
	const L = 340;
	const x = $derived(ancora.left - L - 12 > 8 ? ancora.left - L - 12 : Math.min(innerWidth - L - 8, ancora.right + 12));
	const y = $derived(Math.max(8, Math.min(innerHeight - 380, ancora.top - 8)));
</script>

<div role="tooltip" class="pointer-events-none fixed z-[75] flex w-[340px] flex-col border-2 border-b3 bg-b2 text-fg shadow-[6px_6px_0_var(--sombra)]" style:left="{x}px" style:top="{y}px">
	<div class="flex flex-col gap-0.5 border-b-2 border-b3 px-3.5 pt-3 pb-2.5" style:background={el ? `linear-gradient(90deg, ${el.cor}26, transparent 70%)` : undefined}>
		<span class="font-mincho text-[19px] leading-6 font-bold">{acao.nome}</span>
		<span class="text-xs leading-4 text-mut">{jutsu?.traducao ? `${jutsu.traducao} · ` : ''}{subtitulo}</span>
	</div>
	<div class="flex flex-col gap-2 px-3.5 py-2.5">
		{#if faixa}
			<span class="font-mincho text-lg leading-6 font-bold">{faixa.min}~{faixa.max} de dano</span>
			<DadoHud expr={acao.dano!.expr} cor={el?.cor ?? 'var(--fg)'} tipo={el?.nome ?? null} tamanho={26} />
		{:else if cura}
			<span class="font-mincho text-lg leading-6 font-bold text-ok">{cura.min}~{cura.max} de cura</span>
			<DadoHud expr={jutsu!.cura!} cor="#7fb069" tamanho={26} />
		{/if}
		{#if acao.ataque}<span class="flex items-center gap-2 text-xs text-mut">Ataque <DadoHud expr={acao.ataque.expr} tamanho={22} /></span>{/if}
		{#if jutsu?.efeito || jutsu?.texto}<p class="m-0 line-clamp-6 text-[13px] leading-[19px] text-fg">{jutsu.efeito || jutsu.texto}</p>{/if}
		{#if arma?.propriedades?.length}
			<span class="flex flex-wrap gap-1">{#each arma.propriedades as p (p)}<span class="border border-b3 px-1.5 py-0.5 text-[11px] font-semibold text-fg">{p}</span>{/each}</span>
		{/if}
	</div>
	<div class="flex flex-wrap items-center gap-x-3.5 gap-y-1 px-3.5 pb-2.5 text-xs text-mut">
		<span class="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" class="fill-none stroke-current stroke-[1.6]"><path d="M2 14L14 2 M10 2h4v4" stroke-dasharray="2 2" /></svg>{jutsu ? jutsu.regua.rotuloAlcance || jutsu.alcance : arma!.rotuloAlcance}</span>
		{#if jutsu?.area && jutsu.area !== 'Alvo único'}<span class="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" class="fill-none stroke-current stroke-[1.6]"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="1.5" /></svg>{jutsu.area}</span>{/if}
		{#if jutsu?.duracao && !/instant/i.test(jutsu.duracao)}<span class="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" class="fill-none stroke-current stroke-[1.6]"><path d="M4 2h8M4 14h8M5 2c0 4 6 4 6 6s-6 2-6 6M11 2c0 4-6 4-6 6s6 2 6 6" /></svg>{jutsu.duracao}</span>{/if}
		{#if jutsu?.resistencia}<span class="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" class="fill-none stroke-current stroke-[1.6]"><path d="M8 1l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V3z" /></svg>{jutsu.resistencia}</span>{/if}
	</div>
	<div class="flex items-center gap-3 border-t-2 border-b3 bg-b1 px-3.5 py-2 text-[13px] font-semibold">
		<span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full {/reação/i.test(acaoTxt) ? 'bg-[#e8692e]' : /secund/i.test(acaoTxt) ? 'bg-[#f2c14e]' : 'bg-[#7fb069]'}"></span>{acaoTxt}</span>
		{#if jutsu?.custo}<span class="flex items-center gap-1"><Icone id="recurso/ic-recurso-{jutsu.unidade === 'PE' ? 'pe' : 'pc'}" class="h-5 w-5" />{jutsu.custo} {jutsu.unidade}</span>{/if}
	</div>
</div>
