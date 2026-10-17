<script lang="ts">
	// Badge de tipo de jutsu (CMP-04): cor do tipo + ícone da perícia + nome.
	import type { TipoJutsu } from '#lib/livro/tipos.ts';
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		tipo: TipoJutsu;
		/** Sobre a faixa grená o badge ganha contorno #2B1A14 para não se fundir. */
		sobreFaixa?: boolean;
		semIcone?: boolean;
	}
	let { tipo, sobreFaixa = false, semIcone = false }: Props = $props();
	const t = $derived(TIPO_JUTSU[tipo]);
</script>

{#if semIcone}
	<span class="inline-block border-2 px-1.5 py-1 text-xs leading-none font-semibold" style:background={t.cor} style:color={t.texto} style:border-color={sobreFaixa ? '#2B1A14' : 'var(--ink)'}>{tipo}</span>
{:else}
	<span class="chip" style:background={t.cor} style:color={t.texto} style:border-color={sobreFaixa ? '#2B1A14' : 'var(--ink)'}>
		<Icone id={t.icone} />{tipo}
	</span>
{/if}
