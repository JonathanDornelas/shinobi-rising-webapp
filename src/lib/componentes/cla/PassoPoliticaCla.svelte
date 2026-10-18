<script lang="ts">
	// K2 · Passo 9 · Política e conexões (Componente 8): status (define o PIC por arco), 1 aliado, 1 rival e a posição na vila.
	import { STATUS_CLA } from '#lib/clas/dados.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import Campo from '../ui/Campo.svelte';
	import Icone from '../ui/Icone.svelte';
	import Opcao from '../personagem/Opcao.svelte';

	let { c, outrosClas }: { c: CriadorCla; outrosClas: string[] } = $props();
	const ro = $derived(!c.editavel);
</script>

<div class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Status do clã">
	{#each STATUS_CLA as s (s.id)}
		<Opcao rotulo={s.nome} selecionado={c.dados.politica.status === s.id} somenteLeitura={ro} sombra={false} aoEscolher={() => (c.dados.politica.status = s.id)}>
			<span class="flex items-center gap-2"><Icone id="recurso/ic-recurso-pic" /><b class="t-num text-lg">{s.pic} PIC</b></span>
			<span class="font-mincho text-[15px] leading-5 font-bold">{s.nome}</span>
			<span class="text-xs leading-4 text-mut">{s.nota}</span>
		</Opcao>
	{/each}
</div>

<datalist id="lista-clas">
	{#each outrosClas as n (n)}<option value={n}></option>{/each}
</datalist>
<div class="grid gap-3 sm:grid-cols-2">
	<Campo id="pol-aliado" rotulo="Clã aliado" ajuda="Oficial ou criado na campanha. +1 em Persuasão com eles.">
		<input id="pol-aliado" class="campo" list="lista-clas" maxlength="40" readonly={ro} bind:value={c.dados.politica.aliado} />
	</Campo>
	<Campo id="pol-rival" rotulo="Clã rival" ajuda="−2 em Persuasão com eles; competição frequente.">
		<input id="pol-rival" class="campo" list="lista-clas" maxlength="40" readonly={ro} bind:value={c.dados.politica.rival} />
	</Campo>
</div>
<Campo id="pol-posicao" rotulo="Posição política na vila" ajuda="Prestígio? Marginalizado? Secreto?">
	<textarea id="pol-posicao" class="campo h-auto min-h-[64px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="400" readonly={ro} bind:value={c.dados.politica.posicao}></textarea>
</Campo>
