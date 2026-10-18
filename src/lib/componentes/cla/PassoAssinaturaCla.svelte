<script lang="ts">
	// K2 · Passo 4 · Jutsu assinatura (Componente 3): o jutsu que todo membro aprende no nível 1, Rank D ou C.
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import ItemCarta from './ItemCarta.svelte';
	import NovaCarta from './NovaCarta.svelte';

	let { c }: { c: CriadorCla } = $props();
	const opcoes = $derived(c.dados.cartas.filter((x) => x.tipo === 'jutsu' && (x.rank === 'D' || x.rank === 'C')));
</script>

<p class="m-0 text-[15px] leading-[23px]">Escolha o jutsu que todo membro aprende no nível 1, geralmente o mais icônico do clã. Ele é o primeiro marco da tabela e vai junto da ficha de quem nasce no clã.</p>

<div class="border-2 border-frame bg-b2 px-3 shadow-[4px_4px_0_var(--ink)]">
	{#each opcoes as carta (carta.id)}
		<ItemCarta {c} {carta} escolhida={c.dados.assinatura === carta.id} aoEscolher={() => (c.dados.assinatura = carta.id)} />
	{:else}
		<p class="m-0 py-4 text-sm text-mut">Nenhum jutsu Rank D ou C no clã ainda. Adicione abaixo.</p>
	{/each}
</div>

{#if c.editavel}
	<NovaCarta {c} tipo="jutsu" ranks={['D', 'C']} rotulo="Novo jutsu para a assinatura" aoCriar={(id) => (c.dados.assinatura = id)} />
{/if}
<span class="text-[13px] leading-[18px] text-mut">Travado em Rank D ou C. Os outros jutsus do clã ficam no passo 7.</span>
