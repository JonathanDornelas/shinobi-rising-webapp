<script lang="ts">
	// Regra nova das perícias (cap. 3): na ficha que já existia, um bônus de vila, clã, background ou marco pode ter caído
	// numa perícia que já era treinada. Ele não soma e deixa uma perícia por escolher. O dono escolhe as que faltam uma
	// vez; depois de confirmar, não se muda mais (corrigir_pericias só acrescenta).
	import { PERICIAS, nomePericia, type Pericia } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { periciasTreinadas } from '#lib/personagem/regras.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Icone from '../ui/Icone.svelte';
	import Girando from '../ui/Girando.svelte';

	let { f }: { f: FichaJogo } = $props();
	const t = $derived(periciasTreinadas(f.dados));
	const livres = $derived(PERICIAS.filter((p) => !t.fontes.has(p.id)));
	let escolhas = $state<Pericia[]>([]);
	let salvando = $state(false);

	function alternar(p: Pericia) {
		if (escolhas.includes(p)) escolhas = escolhas.filter((x) => x !== p);
		else if (escolhas.length < t.faltam) escolhas = [...escolhas, p];
	}
	async function confirmar() {
		if (escolhas.length !== t.faltam) return;
		salvando = true;
		const { error } = await supabase().rpc('corrigir_pericias', { ficha: f.id, escolhas });
		salvando = false;
		if (error) return void toasts.mostrar(error.message.length < 140 ? error.message : 'Não foi possível salvar as perícias.', 'erro');
		f.dados.correcaoPericias = [...(f.dados.correcaoPericias ?? []), ...escolhas];
		escolhas = [];
		toasts.mostrar('Perícias corrigidas.', 'sucesso');
	}
</script>

{#if t.faltam > 0}
	<section class="flex flex-col gap-2.5 border-2 border-warn bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-3.5" aria-labelledby="correcao-titulo">
		<div class="flex items-start gap-2">
			<Icone id="callout/ic-callout-atencao" />
			<div class="flex flex-col gap-1">
				<h3 id="correcao-titulo" class="m-0 text-[15px] leading-5 font-semibold">{t.faltam === 1 ? 'Falta 1 perícia treinada' : `Faltam ${t.faltam} perícias treinadas`}</h3>
				<p class="m-0 text-[13px] leading-[18px] text-mut">
					Com a regra nova das perícias, {t.repetidas.map((r) => (r.pericia ? `${r.fonte} treinaria ${nomePericia(r.pericia)}, que já era treinada` : /^NV/.test(r.fonte) ? `o ${r.fonte} ainda não escolheu a perícia` : `o ${r.fonte} dá uma perícia para escolher`)).join('; ')}.
					{f.editavel ? `Escolha ${t.faltam === 1 ? 'a perícia' : `as ${t.faltam} perícias`} no lugar. Depois de confirmar, não dá para mudar.` : 'O dono da ficha escolhe no lugar.'}
				</p>
			</div>
		</div>
		{#if f.editavel}
			<div class="flex flex-wrap gap-1.5" role="group" aria-label="Perícias para treinar">
				{#each livres as p (p.id)}
					{@const on = escolhas.includes(p.id)}
					<button type="button" aria-pressed={on} disabled={!on && escolhas.length >= t.faltam} class="flex min-h-9 items-center gap-1 border-2 py-0.5 pr-2.5 pl-0.5 text-[13px] font-semibold disabled:opacity-50 {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 bg-b1 hover:border-mut'}" onclick={() => alternar(p.id)}><Icone id="pericia/ic-pericia-{p.id}" />{p.nome}</button>
				{/each}
			</div>
			<div class="flex items-center justify-end gap-2">
				<span class="text-xs text-mut">{escolhas.length}/{t.faltam}</span>
				<button type="button" class="btn-jogo {escolhas.length === t.faltam ? 'btn-primario' : 'bg-b3 text-mut'} min-h-10 text-xs" disabled={escolhas.length !== t.faltam || salvando} aria-busy={salvando} onclick={confirmar}>{#if salvando}<Girando />{/if}CONFIRMAR</button>
			</div>
		{/if}
	</section>
{/if}
