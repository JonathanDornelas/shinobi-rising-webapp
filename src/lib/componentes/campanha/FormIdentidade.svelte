<script lang="ts">
	// C2 passo 1 / C7 Identidade: nome, premissa e capa.
	import { CAPAS, urlCapa, type DadosCampanha, type ErrosCampanha } from '#lib/campanhas/dominio.ts';
	import Campo from '../ui/Campo.svelte';

	let { dados = $bindable(), erros = {} }: { dados: DadosCampanha; erros?: ErrosCampanha } = $props();
</script>

<div class="flex flex-col gap-5">
	<Campo id="cp-nome" rotulo="Nome da campanha" obrigatorio erro={erros.nome} ajuda="De 3 a 60 caracteres. Os jogadores veem no convite.">
		<input
			id="cp-nome"
			class="campo"
			maxlength="60"
			autocomplete="off"
			placeholder="Sombras sobre a Névoa"
			bind:value={dados.nome}
			aria-invalid={!!erros.nome || undefined}
			aria-describedby={erros.nome ? 'cp-nome-erro' : 'cp-nome-ajuda'}
			style:border-color={erros.nome ? 'var(--err)' : undefined}
		/>
	</Campo>
	<Campo id="cp-premissa" rotulo="Premissa" erro={erros.premissa} ajuda="Um ou dois parágrafos sobre o ponto de partida. Aparece no convite e no painel.">
		<textarea
			id="cp-premissa"
			class="campo h-auto min-h-[120px] resize-y py-2.5 leading-[24px]"
			maxlength="2000"
			placeholder="Uma vila na névoa esconde um tratado que pode reacender a guerra…"
			bind:value={dados.premissa}
			aria-invalid={!!erros.premissa || undefined}
			aria-describedby={erros.premissa ? 'cp-premissa-erro' : 'cp-premissa-ajuda'}
		></textarea>
	</Campo>
	<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
		<legend class="mb-2 text-sm leading-5 font-semibold">Capa</legend>
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each CAPAS as capa (capa.id)}
				{@const on = dados.capa === capa.id}
				<label class="relative cursor-pointer border-2 bg-b1 {on ? 'border-vermelhao' : 'border-b3 hover:border-mut'}">
					<input type="radio" name="capa" value={capa.id} bind:group={dados.capa} class="sr-only" />
					<img src={urlCapa(capa.id)} alt="" class="aspect-[256/96] w-full object-cover [image-rendering:pixelated]" />
					<span class="flex min-h-9 items-center gap-1.5 px-2 text-[13px] font-semibold {on ? 'bg-grena text-papel' : ''}">{on ? '▸ ' : ''}{capa.nome}</span>
				</label>
			{/each}
		</div>
	</fieldset>
</div>

<style>
	label:has(input:focus-visible) {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
