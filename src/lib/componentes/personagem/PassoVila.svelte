<script lang="ts">
	// Passo 3 · Vila (cap. 7): só as vilas liberadas pela campanha podem ser escolhidas.
	import { VILAS } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import EscolhaPericia from './EscolhaPericia.svelte';
	import Opcao from './Opcao.svelte';

	let { c }: { c: Criador } = $props();
	const vila = $derived(VILAS.find((v) => v.id === c.ficha.vila.id));
	const lista = $derived([...VILAS].sort((a, b) => Number(c.ctx.vilas.includes(b.id)) - Number(c.ctx.vilas.includes(a.id))));
</script>

<div role="radiogroup" aria-label="Vila" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
	{#each lista as v (v.id)}
		<Opcao
			rotulo={v.nome}
			selecionado={c.ficha.vila.id === v.id}
			desabilitado={c.ctx.vilas.includes(v.id) ? '' : 'Esta vila não está liberada na campanha'}
			somenteLeitura={!c.editavel}
			aoEscolher={() => (c.ficha.vila = { id: v.id, escolha: null })}
		>
			<Icone id="vila/ic-vila-{v.id}" tamanho={64} />
			<span class="font-mincho text-[17px] leading-[22px] font-bold">{v.nome}</span>
			<span class="text-xs leading-4 text-mut">{v.elemento} · {v.foco}</span>
			<span class="font-pixel text-xs leading-4 font-bold tracking-[0.04em] text-title uppercase">{v.bonus}</span>
		</Opcao>
	{/each}
</div>
{#if vila?.ganho.escolhaPericia}
	<div class="painel p-3">
		<EscolhaPericia id="vila-escolha" rotulo="+1 de {vila.nome} em:" valor={c.ficha.vila.escolha} desabilitado={!c.editavel} aoMudar={(p) => (c.ficha.vila.escolha = p)} />
	</div>
{/if}
{#if vila?.traco}<p class="m-0 text-sm text-mut">Traço da vila: {vila.traco}.</p>{/if}
