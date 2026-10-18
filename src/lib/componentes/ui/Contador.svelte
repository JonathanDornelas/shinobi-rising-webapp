<script lang="ts">
	// CMP-08 · Contador − valor + (nível inicial, tamanho do grupo).
	interface Props {
		id: string;
		rotulo: string;
		valor: number;
		min: number;
		max: number;
		/** Destaca o número em amarelo quando há aviso. */
		aviso?: boolean;
		descricao?: string;
	}
	let { id, rotulo, valor = $bindable(), min, max, aviso = false, descricao }: Props = $props();
	const passo = (d: number) => (valor = Math.min(max, Math.max(min, valor + d)));
</script>

<div class="flex items-center gap-2" role="group" aria-labelledby="{id}-rotulo" aria-describedby={descricao}>
	<span id="{id}-rotulo" class="sr-only">{rotulo}</span>
	<button type="button" class="btn-icone font-pixel text-[22px] font-bold" aria-label="Diminuir {rotulo.toLowerCase()}" disabled={valor <= min} onclick={() => passo(-1)}>−</button>
	<output {id} class="t-num w-14 text-center text-[32px] leading-none" style:color={aviso ? 'var(--warn)' : undefined} aria-live="polite">{valor}</output>
	<button type="button" class="btn-icone font-pixel text-[22px] font-bold" aria-label="Aumentar {rotulo.toLowerCase()}" disabled={valor >= max} onclick={() => passo(1)}>+</button>
</div>
