<script lang="ts">
	// Botão de rolar da ficha: manda a expressão para o rolador (teste com d20 usa o modo da barra).
	import { page } from '$app/state';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		expressao: string;
		rotulo: string;
		personagem: string;
		/** Teste com d20 (perícia, atributo, iniciativa, ataque). */
		d20?: boolean;
		critico?: boolean;
		/** Texto visível ao lado do dado (ex.: DANO); sem texto, só o ícone. */
		texto?: string;
		class?: string;
	}
	let { expressao, rotulo, personagem, d20 = false, critico = false, texto, class: classe = '' }: Props = $props();
	const titulo = $derived(`Rolar ${rotulo}: ${expressao}${critico ? ' (crítico: dados dobrados)' : d20 && rolador.modo !== 'normal' ? ` com ${rolador.modo}` : ''}`);
</script>

<button
	type="button"
	class="inline-flex min-h-9 flex-none items-center gap-1 border-2 border-b3 bg-b1 font-pixel text-xs font-bold tracking-[0.04em] text-fg hover:border-mut disabled:opacity-60 {texto ? 'pr-2' : 'justify-center'} {classe}"
	title={titulo}
	aria-label={titulo}
	disabled={!!rolador.rolando}
	onclick={() => rolador.rolar({ campanha: page.params.id!, expressao, rotulo, personagem, d20, critico })}
>
	<Icone id="dado/ic-dado-d20" />{#if texto}<span>{texto}</span>{/if}
</button>
