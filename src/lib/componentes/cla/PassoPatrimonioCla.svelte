<script lang="ts">
	// K2 · Passo 8 · Dōjō e patrimônio (Componente 7): 2 recursos da seção 8.2; nômade ou extinto, 1 (móvel ou em ruínas).
	import { PATRIMONIO } from '#lib/clas/dados.ts';
	import { limitePatrimonio, nomade } from '#lib/clas/regras.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import Icone from '../ui/Icone.svelte';
	import Opcao from '../personagem/Opcao.svelte';

	let { c }: { c: CriadorCla } = $props();
	const lim = $derived(limitePatrimonio(c.dados));
	const escolhidos = $derived(c.dados.patrimonio);

	function alternar(id: string) {
		if (escolhidos.includes(id)) c.dados.patrimonio = escolhidos.filter((x) => x !== id);
		else if (escolhidos.length < lim) c.dados.patrimonio = [...escolhidos, id];
		else if (lim === 1) c.dados.patrimonio = [id];
	}
</script>

<p class="m-0 text-[15px] leading-[23px]">
	Escolha {lim} de 6{nomade(c.dados) ? ': clãs nômades ou extintos têm 1 recurso, móvel ou em ruínas' : ''}. Quem passa o tempo ocioso ali ganha o benefício.
	<b class="t-num">{escolhidos.length}/{lim}</b>
</p>
<div class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
	{#each PATRIMONIO as p (p.id)}
		{@const on = escolhidos.includes(p.id)}
		<Opcao rotulo={p.nome} selecionado={on} desabilitado={!on && escolhidos.length >= lim && lim > 1 ? `Já há ${lim} recursos; tire um antes` : ''} somenteLeitura={!c.editavel} sombra={false} aoEscolher={() => alternar(p.id)}>
			<Icone id={p.icone} />
			<span class="font-mincho text-[15px] leading-5 font-bold">{p.nome}</span>
			<span class="text-xs leading-4 text-mut">{p.efeito}</span>
		</Opcao>
	{/each}
</div>
