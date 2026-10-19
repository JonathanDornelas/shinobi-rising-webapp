<script lang="ts">
	// Botão de rolar da ficha: manda a expressão para o rolador (teste com d20 usa o modo da barra), com o tipo, a origem e
	// as parcelas do modificador, que aparecem na conta do registro (L10).
	import { page } from '$app/state';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import type { TipoRolagem } from '#lib/supabase/banco.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		expressao: string;
		/** Como aparece no registro ("Perícia · Percepção", "Ataque · Kunai"). */
		rotulo: string;
		personagem?: string | null;
		npc?: string | null;
		/** Teste com d20 (perícia, atributo, iniciativa, ataque). */
		d20?: boolean;
		critico?: boolean;
		tipo?: TipoRolagem;
		origem?: string;
		partes?: [string, string][];
		/** Texto visível ao lado do dado (ex.: DANO); sem texto, só o ícone. */
		texto?: string;
		class?: string;
	}
	let { expressao, rotulo, personagem = null, npc = null, d20 = false, critico = false, tipo = 'livre', origem, partes = [], texto, class: classe = '' }: Props = $props();
	const titulo = $derived(`Rolar ${rotulo}: ${expressao}${critico ? ' (crítico: dados dobrados)' : d20 && rolador.modo !== 'normal' ? ` com ${rolador.modo}` : ''}`);
</script>

<button
	type="button"
	class="inline-flex min-h-9 flex-none items-center gap-1 border-2 border-b3 bg-b1 font-pixel text-xs font-bold tracking-[0.04em] text-fg hover:border-mut disabled:opacity-60 {texto ? 'pr-2' : 'justify-center'} {classe}"
	title={titulo}
	aria-label={titulo}
	disabled={!!rolador.rolando}
	onclick={() => rolador.rolar({ campanha: page.params.id!, expressao, rotulo, personagem, npc, d20, critico, tipo, origem, partes })}
>
	<Icone id="dado/ic-dado-d20" />{#if texto}<span>{texto}</span>{/if}
</button>
