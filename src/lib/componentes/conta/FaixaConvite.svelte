<script lang="ts">
	// Faixa "Fulano convidou você para X" (A1/A2 vindo de /convite/...).
	import { onMount } from 'svelte';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { ConvitePublico } from '#lib/supabase/banco.ts';
	import Icone from '../ui/Icone.svelte';

	let { volta, acao = 'Entre para aceitar.' }: { volta: string; acao?: string } = $props();
	let convite = $state<ConvitePublico | null>(null);

	onMount(async () => {
		const chave = /^\/convite\/([^/?#]+)/.exec(volta)?.[1];
		if (!chave) return;
		const { data } = await supabase().rpc('ver_convite', { chave: decodeURIComponent(chave) });
		const c = data as ConvitePublico | null;
		if (c?.campanha) convite = c;
	});
</script>

{#if convite?.campanha}
	<div class="flex items-center gap-2.5 border-2 border-[#8B2E20] bg-grena py-1.5 pr-3 pl-1.5 text-papel">
		<Icone id="acao/ic-acao-convidar" />
		<span class="text-sm leading-5 font-medium">{convite.convidado_por ?? 'O Mestre'} convidou você para <i>{convite.campanha.nome}</i>. {acao}</span>
	</div>
{/if}
