<script lang="ts">
	// Atributo novo, o Carisma (cap. 3): a ficha de antes dele está com CAR 0. O dono pode mover 1 ponto de outro atributo
	// para CAR, uma vez, ou manter como está (corrigir_carisma grava a decisão; depois não se muda mais).
	import { ATRIBUTOS, CRIACAO, type Atributo } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { carismaPendente, sinal } from '#lib/personagem/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Icone from '../ui/Icone.svelte';

	let { f }: { f: FichaJogo } = $props();
	let salvando = $state(false);
	const outros = ATRIBUTOS.filter((a) => a.id !== 'CAR');

	async function decidir(de: Atributo | null) {
		salvando = true;
		const { error } = await supabase().rpc('corrigir_carisma', { ficha: f.id, de });
		salvando = false;
		if (error) return void toasts.mostrar(error.message.length < 140 ? error.message : 'Não foi possível salvar.', 'erro');
		if (de) f.dados.atributos = { ...f.dados.atributos, [de]: (f.dados.atributos[de] ?? 0) - 1, CAR: 1 };
		f.dados.carismaDecidido = true;
		toasts.mostrar(de ? `1 ponto de ${de} foi para Carisma.` : 'Carisma fica em 0.', 'sucesso');
	}
</script>

{#if carismaPendente(f.dados)}
	<section class="flex flex-col gap-2.5 border-2 border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_10%,transparent)] p-3.5" aria-labelledby="carisma-titulo">
		<div class="flex items-start gap-2">
			<Icone id="atributo/ic-atributo-car" />
			<div class="flex flex-col gap-1">
				<h3 id="carisma-titulo" class="m-0 text-[15px] leading-5 font-semibold">Atributo novo: Carisma (CAR)</h3>
				<p class="m-0 text-[13px] leading-[18px] text-mut">
					O Carisma agora move Persuasão, Enganação, Intimidação e Atuação. Esta ficha veio de antes dele e está com CAR 0.
					{f.editavel ? 'Se quiser, mova 1 ponto de outro atributo para o Carisma. Vale uma vez: depois de escolher, não muda mais.' : 'O dono da ficha decide se move 1 ponto para o Carisma.'}
				</p>
			</div>
		</div>
		{#if f.editavel}
			<div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Mover 1 ponto para Carisma">
				{#each outros as a (a.id)}
					{@const v = f.dados.atributos[a.id] ?? 0}
					<button type="button" class="min-h-9 border-2 border-b3 bg-b1 px-2.5 text-[13px] font-semibold hover:border-mut disabled:opacity-50" disabled={salvando || v <= CRIACAO.atributoMin} title={v <= CRIACAO.atributoMin ? `${a.nome} já está no mínimo` : `${a.nome} ${sinal(v)} → ${sinal(v - 1)}; Carisma +1`} onclick={() => decidir(a.id)}>−1 {a.id} → +1 CAR</button>
				{/each}
				<span class="flex-1"></span>
				<button type="button" class="btn-jogo btn-fantasma min-h-9 text-xs" disabled={salvando} onclick={() => decidir(null)}>MANTER CAR 0</button>
			</div>
		{/if}
	</section>
{/if}
