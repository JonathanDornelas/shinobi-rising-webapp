<script lang="ts">
	// Dados no texto das regras ("1d20", "2d6+3"): chip com o d20; hover mostra a faixa (mín., média, máx.) e o clique
	// abre a janela de rolagens com a expressão pronta (para quem joga numa campanha). No celular, o 1º toque mostra a faixa.
	import { cartao } from '#lib/estado/cartao.svelte.ts';
	import { sessao } from '#lib/estado/sessao.svelte.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';

	let { expr, texto }: { expr: string; texto: string } = $props();
	let el: HTMLButtonElement | undefined = $state();
	const podeRolar = $derived(!!sessao.usuario && rolador.campanhas.some((k) => !k.arquivada));
	let toque = false;

	function clicar() {
		if (!el) return;
		if (podeRolar && (!toque || cartao.aberto(el))) {
			cartao.fechar();
			rolador.sugerir(expr);
		} else cartao.abrir(el, { tipo: 'dado', expr }, { fixo: true });
	}
</script>

<button
	bind:this={el}
	type="button"
	class="mx-px inline-flex items-baseline gap-1 border-2 border-b3 bg-b1 px-1 align-baseline font-pixel text-[0.86em] leading-[1.15] font-bold whitespace-nowrap text-fg hover:border-[var(--vermelhao)] focus-visible:border-[var(--vermelhao)]"
	aria-label="{texto}: {podeRolar ? 'rolar na janela de rolagens' : 'ver a faixa de resultados'}"
	onpointerdown={(e) => (toque = e.pointerType !== 'mouse')}
	onpointerenter={(e) => el && e.pointerType === 'mouse' && cartao.abrir(el, { tipo: 'dado', expr }, { atraso: 220 })}
	onpointerleave={(e) => e.pointerType === 'mouse' && cartao.fecharDepois()}
	onfocus={() => el && !toque && cartao.abrir(el, { tipo: 'dado', expr })}
	onblur={() => cartao.fecharDepois()}
	onclick={clicar}
	><img src="/icons/dado/ic-dado-d20-32.png" width="16" height="16" alt="" class="self-center [image-rendering:pixelated]" />{texto}</button
>
