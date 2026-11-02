<script lang="ts">
	// Regularizar (temporário): a ficha da escala antiga (atributos até +10) foi convertida pela proporção para o teto +3.
	// O aviso leva o dono à tela que refaz atributos, aprimoramentos e perícias pela regra nova, uma vez.
	import { page } from '$app/state';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { escalaNova } from '#lib/personagem/regras.ts';
	import { hrefRegularizar } from '#lib/personagem/status.ts';
	import Icone from '../ui/Icone.svelte';

	let { f }: { f: FichaJogo } = $props();
</script>

{#if !escalaNova(f.dados) && page.params.id}
	<section class="flex flex-wrap items-center gap-3 border-2 border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_10%,transparent)] p-3.5" aria-labelledby="regularizar-titulo">
		<Icone id="recurso/ic-recurso-pt" />
		<div class="flex min-w-[220px] flex-1 flex-col gap-1">
			<h3 id="regularizar-titulo" class="m-0 text-[15px] leading-5 font-semibold">Regras novas: atributos até +3</h3>
			<p class="m-0 text-[13px] leading-[18px] text-mut">
				Esta ficha foi convertida automaticamente pela proporção.
				{f.editavel ? 'Se quiser, refaça atributos, aprimoramentos e perícias treinadas do seu jeito. Vale uma vez.' : 'O dono da ficha pode regularizá-la, uma vez.'}
			</p>
		</div>
		{#if f.editavel}
			<a class="btn-jogo btn-primario min-h-9 text-xs" href={hrefRegularizar(page.params.id, f.id)} target={page.url.pathname.includes('/mesa') ? '_blank' : undefined}>REGULARIZAR</a>
		{/if}
	</section>
{/if}
