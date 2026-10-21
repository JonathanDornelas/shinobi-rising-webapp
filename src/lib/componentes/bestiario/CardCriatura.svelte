<script lang="ts">
	// Card do verbete no índice do bestiário: a arte ocupa o card (o tamanho dele na grade segue o formato da arte).
	import { PAPEIS } from '#lib/bestiario/npc.ts';
	import type { Criatura, PapelCriatura } from '#lib/livro/tipos.ts';
	import Icone from '../ui/Icone.svelte';
	import ArteCriatura from './ArteCriatura.svelte';

	interface Props {
		criatura: Pick<Criatura, 'slug' | 'nome' | 'tipo' | 'ameacaFaixa' | 'vila' | 'arte'> & { papel: PapelCriatura | null; nEstagios: number };
		class?: string;
	}
	let { criatura, class: classe = '' }: Props = $props();
</script>

<a href="/regras/bestiario/{criatura.slug}" class="cartao-link group flex min-h-0 flex-col border-2 border-frame bg-b2 sombra-painel {classe}">
	<span class="relative block min-h-0 flex-1 overflow-hidden border-b-2 border-ink bg-b0">
		<ArteCriatura {criatura} moldura="solta" cobrir />
		<span class="absolute top-1.5 left-1.5 border-2 border-ink bg-b0 px-1.5 py-0.5 font-pixel text-[11px] leading-none font-bold tracking-[.1em] text-[#D9A82B]">AMEAÇA {criatura.ameacaFaixa.toUpperCase()}</span>
	</span>
	<span class="flex items-center gap-2 px-2.5 py-2">
		{#if criatura.vila}<Icone id={criatura.vila.icone} />{/if}
		<span class="flex min-w-0 flex-col">
			<span class="font-mincho text-[15px] leading-5 font-bold group-hover:text-link">{criatura.nome}</span>
			<span class="truncate text-[13px] leading-[18px] text-mut">{criatura.papel ? PAPEIS[criatura.papel] : `${criatura.nEstagios} estágios`} · {criatura.tipo}</span>
		</span>
	</span>
</a>
