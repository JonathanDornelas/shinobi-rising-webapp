<script lang="ts">
	// K2 · Passo 6 · Companheiros (Componente 5, opcional): a criatura vinculada ao clã e o nível em que chega (cap. 14).
	import { qtdCompra } from '#lib/clas/regras.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import Campo from '../ui/Campo.svelte';
	import Icone from '../ui/Icone.svelte';

	let { c }: { c: CriadorCla } = $props();
	const comprado = $derived(qtdCompra(c.dados, 'companheiro') > 0);
	const ro = $derived(!c.editavel);
	$effect(() => {
		// a compra com PB já dá o companheiro no nível 1
		if (comprado && c.editavel && (!c.dados.companheiro.ativo || c.dados.companheiro.nivel !== 1)) {
			c.dados.companheiro.ativo = true;
			c.dados.companheiro.nivel = 1;
		}
	});
</script>

<label class="flex min-h-12 cursor-pointer items-center gap-3 border-2 border-frame bg-b2 px-3.5">
	<Icone id="modulo/ic-modulo-companheiro" />
	<span class="flex flex-1 flex-col">
		<span class="text-[15px] font-semibold">O clã tem companheiros vinculados</span>
		<span class="text-xs leading-4 text-mut">{comprado ? 'Comprado com PB no bônus hereditário: chega no nível 1.' : 'Animais ou criaturas ligados à linhagem.'}</span>
	</span>
	<input type="checkbox" role="switch" class="interruptor" disabled={ro || comprado} bind:checked={c.dados.companheiro.ativo} />
</label>

{#if c.dados.companheiro.ativo}
	<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
		<Campo id="comp-criatura" rotulo="Criatura" obrigatorio>
			<input id="comp-criatura" class="campo" maxlength="60" placeholder="Cão ninja, falcão, salamandra…" readonly={ro} bind:value={c.dados.companheiro.criatura} />
		</Campo>
		<Campo id="comp-nivel" rotulo="Recebe no nível">
			<input id="comp-nivel" class="campo" type="number" min="1" max="20" readonly={ro || comprado} bind:value={c.dados.companheiro.nivel} />
		</Campo>
	</div>
	<Campo id="comp-descricao" rotulo="Descrição" ajuda="Use as fichas-padrão de companheiros do cap. 14 como base.">
		<textarea id="comp-descricao" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="600" readonly={ro} bind:value={c.dados.companheiro.descricao}></textarea>
	</Campo>
	<a href="/regras/invocacao-e-companheiros" target="_blank" rel="noopener" class="link self-start text-[13px] font-semibold">Cap. 14 · Invocação e Companheiros</a>
{:else}
	<span class="text-[13px] leading-[18px] text-mut">Ligue para escolher a criatura e o nível em que o personagem a recebe.</span>
{/if}
