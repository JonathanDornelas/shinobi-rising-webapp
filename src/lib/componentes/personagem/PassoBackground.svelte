<script lang="ts">
	// Passo 11 · Background (cap. 6): um dos 14 do livro ou um próprio (1 bônus pequeno + 1 traço), além de time e sensei.
	import { BACKGROUNDS, PERICIAS, type Pericia } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import Campo from '../ui/Campo.svelte';
	import EscolhaPericia from './EscolhaPericia.svelte';
	import Opcao from './Opcao.svelte';

	let { c }: { c: Criador } = $props();
	const bg = $derived(BACKGROUNDS.find((b) => b.id === c.ficha.background.id));
	const proprio = $derived(c.ficha.background.id === 'proprio');
	const escolher = (id: string) => (c.ficha.background = { ...c.ficha.background, id, escolha: null });
</script>

<div role="radiogroup" aria-label="Background" class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
	{#each BACKGROUNDS as b (b.id)}
		<Opcao rotulo={b.nome} selecionado={c.ficha.background.id === b.id} somenteLeitura={!c.editavel} sombra={false} aoEscolher={() => escolher(b.id)}>
			<span class="font-mincho text-base leading-[22px] font-bold">{b.nome}</span>
			<span class="font-pixel text-xs leading-4 font-bold tracking-[0.04em] text-title uppercase">{b.bonus}</span>
			<span class="text-xs leading-4 text-mut">{b.traco}</span>
		</Opcao>
	{/each}
	<Opcao rotulo="Criar background" selecionado={proprio} somenteLeitura={!c.editavel} sombra={false} class="items-center justify-center border-dashed text-center" aoEscolher={() => escolher('proprio')}>
		<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.06em]">+ CRIAR BACKGROUND</span>
		<span class="text-xs leading-4 text-mut">{c.ctx.aprovacao.backgrounds ? 'Exige aprovação do Mestre' : 'Combine com o Mestre'}</span>
	</Opcao>
</div>

{#if bg?.ganho.escolhaPericia}
	<div class="painel p-3">
		<EscolhaPericia id="bg-escolha" rotulo="+1 de {bg.nome} em:" opcoes={bg.ganho.escolhaPericia} valor={c.ficha.background.escolha} desabilitado={!c.editavel} aoMudar={(p) => (c.ficha.background.escolha = p)} />
	</div>
{/if}

{#if proprio}
	<div class="painel grid gap-3 p-3 md:grid-cols-2">
		<Campo id="bg-nome" rotulo="Nome do background" obrigatorio>
			<input id="bg-nome" class="campo" maxlength="60" placeholder="Pescador do Porto" disabled={!c.editavel} bind:value={c.ficha.background.proprio.nome} />
		</Campo>
		<div class="flex flex-col gap-1.5">
			<label for="bg-pericia" class="text-sm leading-5 font-semibold">Bônus: +1 em</label>
			<select
				id="bg-pericia"
				class="campo"
				disabled={!c.editavel}
				value={c.ficha.background.proprio.pericia ?? ''}
				onchange={(e) => (c.ficha.background.proprio.pericia = (e.currentTarget.value || null) as Pericia | null)}
			>
				<option value="">Sem bônus de perícia</option>
				{#each PERICIAS as p (p.id)}<option value={p.id}>{p.nome}</option>{/each}
			</select>
		</div>
		<Campo id="bg-traco" rotulo="Traço narrativo" obrigatorio class="md:col-span-2" ajuda="Siga o padrão do livro: 1 perícia ou bônus pequeno + 1 traço narrativo.">
			<textarea id="bg-traco" class="campo h-auto min-h-16 resize-y py-2.5 text-[15px] leading-[22px]" maxlength="400" disabled={!c.editavel} bind:value={c.ficha.background.proprio.traco}></textarea>
		</Campo>
	</div>
{/if}

<div class="grid gap-3 md:grid-cols-2">
	<Campo id="bg-time" rotulo="Time">
		<input id="bg-time" class="campo" maxlength="80" placeholder="Time 7 · com Ren e Sora" disabled={!c.editavel} bind:value={c.ficha.time} />
	</Campo>
	<Campo id="bg-sensei" rotulo="Sensei">
		<input id="bg-sensei" class="campo" maxlength="60" placeholder="Ayame Sasaki" disabled={!c.editavel} bind:value={c.ficha.sensei} />
	</Campo>
</div>
