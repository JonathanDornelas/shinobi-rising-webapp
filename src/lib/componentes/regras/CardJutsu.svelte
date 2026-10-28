<script lang="ts">
	// Card de jutsu (CMP-01): faixa grená, borda na cor do tipo, linha de info 3×2, Efeito e conta de PJ.
	// Idêntico em todas as telas.
	import type { Snippet } from 'svelte';
	import type { Jutsu } from '#lib/livro/tipos.ts';
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import Texto from '../leitura/Texto.svelte';
	import BadgeTipo from './BadgeTipo.svelte';
	import ChipElemento from './ChipElemento.svelte';
	import SeloRank from './SeloRank.svelte';
	import DadoHud from '../mesa/DadoHud.svelte';
	import { corElemento, lerDados } from '#lib/mesa/hud.ts';
	import { curaDoEfeito, danoDoEfeito } from '#lib/rolagens/expressoes.ts';

	interface Props {
		jutsu: Jutsu;
		/** Mostra a origem (livro, capítulo) no rodapé do card. */
		rodape?: boolean;
		semSombra?: boolean;
		/** Botões no fim da faixa (favorito, abrir). */
		acoes?: Snippet;
	}
	let { jutsu, rodape = true, semSombra = false, acoes }: Props = $props();
	const cor = $derived(TIPO_JUTSU[jutsu.tipo].cor);
	// HUD: o dano (ou a cura) do efeito com o dado na cor do elemento e a faixa "4~14 de dano"
	const efeitoTxt = $derived((jutsu.efeito ?? []).map((t) => t.t).join(''));
	const dano = $derived(danoDoEfeito(efeitoTxt));
	const cura = $derived(dano ? null : curaDoEfeito(efeitoTxt));
	const faixa = $derived(lerDados(dano?.dados ?? cura ?? ''));
	const el = $derived(corElemento(jutsu.elemento, jutsu.nome));
</script>

<article id="jutsu-{jutsu.slug}" class="@container flex scroll-mt-20 border-2 border-[var(--vermelhao-lo)] bg-b2" class:sombra-painel={!semSombra}>
	<div class="w-1 flex-none" style:background={cor}></div>
	<div class="min-w-0 flex-1">
		<header class="flex flex-col gap-2.5 bg-grena px-3.5 py-3 @[520px]:flex-row @[520px]:items-start @[520px]:gap-3.5 @[520px]:px-4 @[520px]:py-3.5">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<h3 class="m-0 font-mincho text-[22px] leading-7 font-bold text-papel @[520px]:text-2xl @[520px]:leading-[30px]">{jutsu.nome}</h3>
				<span class="text-sm leading-5 text-papel-2 italic">{jutsu.traducao}{#if jutsu.origem}<span class="not-italic">{' · '}</span>{jutsu.origem}{/if}</span>
			</div>
			<div class="flex flex-none items-center gap-2.5">
				<BadgeTipo tipo={jutsu.tipo} sobreFaixa />
				<SeloRank rank={jutsu.rank} />
				<span class="flex-1 @[520px]:hidden"></span>
				<span class="t-num text-[22px] leading-none whitespace-nowrap text-papel @[520px]:text-2xl">{jutsu.custo}</span>
				{#if acoes}<span class="-my-2 -mr-2 flex">{@render acoes()}</span>{/if}
			</div>
		</header>
		<div class="flex flex-col gap-3 p-3.5 @[520px]:gap-3.5 @[520px]:p-4">
			{#if jutsu.elemento || faixa}
				<div class="flex flex-wrap items-center gap-x-3.5 gap-y-2">
					{#if jutsu.elemento}<ChipElemento elemento={jutsu.elemento} />{/if}
					{#if faixa}
						<span class="flex flex-wrap items-center gap-2">
							<b class="font-mincho text-[17px] leading-6" style:color={cura ? '#7FB069' : undefined}>{faixa.min}~{faixa.max}{dano?.atributo ? ` + ${dano.atributo}` : ''} de {cura ? 'cura' : 'dano'}</b>
							<DadoHud expr={dano?.dados ?? cura ?? ''} cor={cura ? '#7FB069' : el?.cor} tipo={cura ? null : (el?.nome ?? null)} />
						</span>
					{/if}
				</div>
			{/if}
			{#each jutsu.descricao as p, i (i)}
				<p class="m-0 text-[15px] leading-[23px] text-pretty"><Texto trechos={p} /></p>
			{/each}
			{#if jutsu.info.length}
				<dl class="m-0 grid grid-cols-2 border-t-2 border-l-2 border-b3 @[520px]:grid-cols-3">
					{#each jutsu.info as item (item.k)}
						<div class="flex flex-col gap-[5px] border-r-2 border-b-2 border-b3 bg-b1 px-2.5 py-2">
							<dt class="t-rotulo-sm text-mut">{item.k}</dt>
							<dd class="m-0 text-sm leading-5 font-semibold">{item.v}</dd>
						</div>
					{/each}
				</dl>
			{/if}
			{#if jutsu.efeito}
				<p class="m-0 text-[15px] leading-[23px] text-pretty"><b>Efeito.</b> <Texto trechos={jutsu.efeito} /></p>
			{/if}
			{#each jutsu.notas as n, i (i)}
				<p class="m-0 text-sm leading-[21px] text-pretty text-mut"><Texto trechos={n} /></p>
			{/each}
			{#if jutsu.pj || rodape}
				<div class="flex flex-col gap-1 border-t-2 border-b3 pt-2.5 text-[13px] leading-[18px] text-mut">
					{#if jutsu.pj}<span><b class="font-semibold text-fg">PJ:</b> {jutsu.pj}</span>{/if}
					{#if rodape}<span>Jutsu oficial · cap. {jutsu.capitulo}{jutsu.origem ? ` · ${jutsu.origem}` : ''}</span>{/if}
				</div>
			{/if}
		</div>
	</div>
</article>
