<script lang="ts">
	// Termo do léxico no texto das regras (estilo D&D Beyond): cor e sublinhado pelo tipo; hover/foco abre o cartão com o
	// resumo e o clique leva à regra. No celular, o 1º toque abre o cartão e o 2º segue o link. Na tabela que define o
	// termo (def), vira só o ícone e o nome, sem link.
	import { page } from '$app/state';
	import { cartao } from '#lib/estado/cartao.svelte.ts';
	import { ELEMENTO } from '#lib/livro/dominio.ts';
	import { corDoTermo, slugDe, tipoDe } from '#lib/livro/lexico.ts';
	import { irPara } from './espiao.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		id: string;
		texto: string;
		href?: string;
		def?: boolean;
		negrito?: boolean;
		italico?: boolean;
	}
	let { id, texto, href, def = false, negrito = false, italico = false }: Props = $props();

	const tipo = $derived(tipoDe(id));
	const cor = $derived(corDoTermo(id, tipo === 'elemento' ? ELEMENTO[slugDe(id)]?.cor : undefined));
	const ESTILO: Record<string, string> = {
		recurso: 'font-semibold underline decoration-2 underline-offset-[3px]',
		atributo: 'border-2 border-current px-[3px] font-pixel text-[0.8em] font-bold tracking-[.04em] no-underline',
		condicao: 'font-semibold underline decoration-dotted decoration-2 underline-offset-4',
		regra: 'font-semibold underline decoration-mut decoration-dotted decoration-[1.5px] underline-offset-4',
		pericia: 'font-semibold underline decoration-dashed decoration-[1.5px] underline-offset-4',
		jutsu: 'font-semibold italic underline decoration-dotted decoration-[1.5px] underline-offset-4',
		habilidade: 'font-semibold italic underline decoration-dotted decoration-[1.5px] underline-offset-4',
		cla: 'font-semibold underline decoration-dotted decoration-[1.5px] underline-offset-4',
		arma: 'font-semibold underline decoration-dotted decoration-[1.5px] underline-offset-4',
		elemento: 'font-semibold underline decoration-2 underline-offset-[3px]',
		rank: 'font-semibold whitespace-nowrap underline decoration-dotted decoration-[1.5px] underline-offset-4'
	};
	const ICONE_DEF: Record<string, (s: string) => string> = { condicao: (s) => `estado/ic-estado-${s}`, pericia: (s) => `pericia/ic-pericia-${s}` };

	let el: HTMLAnchorElement | undefined = $state();
	/** O último toque/clique foi de dedo ou caneta (sem hover): o 1º toque abre o cartão. */
	let toque = false;

	function clicar(e: MouseEvent) {
		if (!el || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
		// celular: o 1º toque mostra o cartão
		if (toque && !cartao.aberto(el)) {
			e.preventDefault();
			cartao.abrir(el, { tipo: 'termo', id, href: href ?? null }, { fixo: true });
			return;
		}
		cartao.fechar();
		// mesma página: realça o destino depois do salto
		const url = new URL(el.href);
		if (url.pathname === page.url.pathname && url.hash)
			setTimeout(() => irPara(decodeURIComponent(url.hash.slice(1)), false), 60);
	}
</script>

{#if def}
	<span class="inline-flex items-center gap-1.5 align-middle font-semibold" style:color={cor}>
		{#if ICONE_DEF[tipo]}<Icone id={ICONE_DEF[tipo](slugDe(id))} />{/if}<span class={italico ? 'italic' : ''}>{texto}</span>
	</span>
{:else}
	<a
		bind:this={el}
		href={href ?? '#'}
		data-termo={tipo}
		class="rounded-[1px] {ESTILO[tipo] ?? ESTILO.regra} {negrito ? 'font-bold' : ''} {italico ? 'italic' : ''} hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] focus-visible:bg-[color-mix(in_srgb,currentColor_14%,transparent)]"
		style:color={cor}
		aria-describedby={cartao.alvo && cartao.ancora === el ? 'cartao-termo' : undefined}
		onpointerdown={(e) => (toque = e.pointerType !== 'mouse')}
		onpointerenter={(e) => el && e.pointerType === 'mouse' && cartao.abrir(el, { tipo: 'termo', id, href: href ?? null }, { atraso: 220 })}
		onpointerleave={(e) => e.pointerType === 'mouse' && cartao.fecharDepois()}
		onfocus={() => el && !toque && cartao.abrir(el, { tipo: 'termo', id, href: href ?? null })}
		onblur={() => cartao.fecharDepois()}
		onclick={clicar}>{texto}</a
	>
{/if}
