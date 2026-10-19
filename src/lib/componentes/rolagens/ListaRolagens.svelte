<script lang="ts">
	// Registro de rolagens separado por dia, como no Discord: a data uma vez e depois as rolagens daquele dia.
	import { porDia } from '#lib/formatar.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import LinhaRolagem from './LinhaRolagem.svelte';

	let { lista, aoApagar, compacto = false }: { lista: Rolagem[]; aoApagar?: (id: string) => void; compacto?: boolean } = $props();
	const grupos = $derived(porDia(lista, (r) => r.criada_em));
</script>

<div class="flex flex-col" aria-label="Rolagens recentes">
	{#each grupos as g (g.dia)}
		<div class="flex items-center gap-2.5 py-2 {compacto ? 'px-3' : ''}" role="separator" aria-label={g.dia}>
			<span class="h-0.5 flex-1 bg-b3"></span>
			<span class="font-pixel text-xs leading-none font-bold tracking-[0.06em] text-mut uppercase">{g.dia}</span>
			<span class="h-0.5 flex-1 bg-b3"></span>
		</div>
		<ul class="m-0 list-none p-0 {compacto ? '' : 'painel-sombra'}">
			{#each g.itens as r (r.id)}
				<LinhaRolagem {r} {compacto} aoApagar={aoApagar ? () => aoApagar(r.id) : undefined} />
			{/each}
		</ul>
	{/each}
</div>
