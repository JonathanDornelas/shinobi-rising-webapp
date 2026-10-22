<script lang="ts">
	// Arte em tela cheia, para ver os pixels de perto: abre ajustada à tela na maior escala inteira que cabe (pixels
	// nítidos, sem borrar; na tela pequena, onde a inteira seria menor que 2×, a escala exata) e amplia ou reduz de uma
	// em uma; maior que a tela, rola. A barra escura com o filete vermelhão
	// é a mesma do quadro de combate. Esc, o ✕ ou um clique fora da arte fecham; + e − mudam a escala, 0 volta a ajustar.
	// Vai para o <body> ao abrir, para que nenhuma moldura da página (máscara, sticky, transform) prenda a camada fixa.
	import type { Attachment } from 'svelte/attachments';
	import { prenderFoco } from './foco';

	interface Props {
		src: string;
		largura: number;
		altura: number;
		rotulo: string;
		aoFechar: () => void;
	}
	let { src, largura, altura, rotulo, aoFechar }: Props = $props();

	// medido dentro da camada, sem o respiro: com a escala de interface do perfil (zoom no body), a janela mente o tamanho
	let palco = $state<DOMRectReadOnly>();
	const exato = $derived(palco ? Math.min(palco.width / largura, palco.height / altura) : 0);
	const ajuste = $derived(exato >= 2 ? Math.floor(exato) : Math.max(1, Math.floor(exato * 10) / 10));
	const maximo = $derived(Math.max(Math.ceil(ajuste) * 3, 8));
	let escolhida = $state<number | null>(null);
	const escala = $derived(Math.min(escolhida ?? ajuste, maximo));
	// os passos caem sempre nos inteiros: de 1,7× o + vai a 2×, e o − volta a 1×
	const mudar = (passo: number) => (escolhida = Math.max(1, Math.min(maximo, passo > 0 ? Math.floor(escala) + 1 : Math.ceil(escala) - 1)));
	const rotuloEscala = $derived(`${escala.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}×`);

	// vai para o <body> antes de prender o foco: mover um elemento focado no DOM tira o foco dele
	const camada: Attachment<HTMLElement> = (no) => {
		document.body.appendChild(no);
		const soltar = prenderFoco(aoFechar)(no.querySelector<HTMLElement>('[role="dialog"]')!);
		return () => {
			soltar?.();
			no.remove();
		};
	};
	function tecla(e: KeyboardEvent) {
		if (e.key === '+' || e.key === '=') mudar(1);
		else if (e.key === '-') mudar(-1);
		else if (e.key === '0') escolhida = null;
		else return;
		e.preventDefault();
	}
	const fora = (e: MouseEvent) => e.target === e.currentTarget && aoFechar();
</script>

<div class="fixed inset-0 z-[60] bg-[rgba(14,11,10,.94)]" style:animation="surgir 160ms ease-out" {@attach camada}>
	<div role="dialog" aria-modal="true" aria-label="Arte ampliada: {rotulo}" tabindex="-1" class="flex h-full flex-col outline-none" onkeydown={tecla}>
		<div class="flex flex-none items-center gap-2 border-b-[3px] border-[var(--vermelhao)] bg-b0 py-1 pr-1 pl-3">
			<p class="m-0 min-w-0 flex-1 truncate font-mincho text-[15px] leading-5 font-bold text-b0fg">{rotulo}</p>
			<span class="t-num w-12 text-right text-[15px] leading-none font-bold text-[#D9A82B]" aria-live="polite" aria-label="Escala {rotuloEscala}">{rotuloEscala}</span>
			<button type="button" class="botao flex" aria-label="Reduzir" disabled={escala <= 1} onclick={() => mudar(-1)}>−</button>
			<button type="button" class="botao flex" aria-label="Aumentar" disabled={escala >= maximo} onclick={() => mudar(1)}>+</button>
			<button type="button" class="botao hidden px-2 text-[13px] sm:flex" aria-label="Ajustar à tela" disabled={escolhida === null || escala === ajuste} onclick={() => (escolhida = null)}>Ajustar</button>
			<button type="button" class="botao flex" aria-label="Fechar" data-autofoco onclick={aoFechar}>✕</button>
		</div>
		<!-- o palco rola quando a arte passa da tela; a margem automática a centraliza quando cabe -->
		<div class="flex min-h-0 flex-1 overflow-auto p-3 sm:p-6" bind:contentRect={palco} role="presentation" onclick={fora}>
			{#if palco}
				<img
					{src}
					alt={rotulo}
					width={Math.floor(largura * escala)}
					height={Math.floor(altura * escala)}
					class="m-auto block max-w-none flex-none border-2 border-ink bg-b0 shadow-[8px_8px_0_#000] [image-rendering:pixelated]"
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.botao {
		height: 44px;
		min-width: 44px;
		align-items: center;
		justify-content: center;
		color: var(--color-b0fg);
		font-size: 20px;
		line-height: 1;
	}
	.botao:hover:not(:disabled) {
		background: #2e2420;
	}
	.botao:disabled {
		opacity: 0.35;
	}
	.botao:focus-visible {
		outline: 2px solid #d9a82b;
		outline-offset: -2px;
	}
</style>
