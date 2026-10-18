<script lang="ts">
	// C2 passo 2 / C7 Ambientação e regras: período, nível, grupo, vilas, clãs e pacotes.
	import {
		avisoGrupo,
		CLAS,
		ERAS,
		nomeCla,
		PACOTES,
		rankSugerido,
		STATUS_VILA,
		VILAS,
		type DadosCampanha,
		type ErrosCampanha
	} from '#lib/campanhas/dominio.ts';
	import type { VilaCampanha } from '#lib/supabase/banco.ts';
	import Campo from '../ui/Campo.svelte';
	import Contador from '../ui/Contador.svelte';
	import Icone from '../ui/Icone.svelte';

	let { dados = $bindable(), erros = {} }: { dados: DadosCampanha; erros?: ErrosCampanha } = $props();

	const aviso = $derived(avisoGrupo(dados.tamanho_grupo));
	const vila = (id: string) => dados.vilas.find((v) => v.id === id);

	function alternarVila(id: string) {
		dados.vilas = vila(id) ? dados.vilas.filter((v) => v.id !== id) : [...dados.vilas, { id, status: null }];
	}
	function statusVila(id: string, status: string) {
		dados.vilas = dados.vilas.map((v) => (v.id === id ? { ...v, status: (status || null) as VilaCampanha['status'] } : v));
	}
	function alternarCla(slug: string) {
		dados.clas_permitidos = dados.clas_permitidos.includes(slug) ? dados.clas_permitidos.filter((c) => c !== slug) : [...dados.clas_permitidos, slug];
	}
	function alternarPacote(id: string) {
		dados.pacotes = dados.pacotes.includes(id) ? dados.pacotes.filter((p) => p !== id) : [...dados.pacotes, id];
	}
</script>

<div class="flex flex-col gap-[22px]">
	<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
		<legend class="mb-2 text-sm leading-5 font-semibold">Período</legend>
		<div class="flex flex-wrap gap-2">
			{#each ERAS as era (era.id)}
				{@const on = dados.era === era.id}
				<label class="inline-flex min-h-11 cursor-pointer items-center border-2 px-3.5 text-sm font-semibold {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}">
					<input type="radio" name="era" value={era.id} bind:group={dados.era} class="sr-only" />{era.nome}
				</label>
			{/each}
		</div>
		{#if dados.era === 'alternativa'}
			<Campo id="cp-era-alt" rotulo="Nome da linha do tempo" erro={erros.era_alternativa} class="mt-2 max-w-[420px]">
				<input
					id="cp-era-alt"
					class="campo"
					maxlength="80"
					placeholder="E se Minato tivesse sobrevivido?"
					bind:value={dados.era_alternativa}
					aria-invalid={!!erros.era_alternativa || undefined}
					style:border-color={erros.era_alternativa ? 'var(--err)' : undefined}
				/>
			</Campo>
		{/if}
	</fieldset>

	<div class="flex flex-wrap items-start gap-x-6 gap-y-4">
		<div class="flex flex-col gap-1.5">
			<span class="text-sm leading-5 font-semibold">Nível inicial</span>
			<Contador id="cp-nivel" rotulo="Nível inicial" bind:valor={dados.nivel_inicial} min={1} max={20} descricao="cp-nivel-rank" />
			<span id="cp-nivel-rank" class="text-[13px] leading-[18px] text-mut">Rank sugerido: {rankSugerido(dados.nivel_inicial)}</span>
		</div>
		<div class="flex min-w-[240px] flex-1 flex-col gap-1.5">
			<span class="text-sm leading-5 font-semibold">Tamanho do grupo</span>
			<Contador id="cp-grupo" rotulo="Tamanho do grupo" bind:valor={dados.tamanho_grupo} min={1} max={20} aviso={!!aviso} descricao="cp-grupo-aviso" />
			<span id="cp-grupo-aviso" class="flex items-center gap-1 text-[13px] leading-[18px] {aviso ? 'font-semibold' : 'text-mut'}">
				{#if aviso}<Icone id="callout/ic-callout-atencao" />Aviso: {aviso}{:else}Pessoas na mesa, contando o Mestre.{/if}
			</span>
		</div>
	</div>

	<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
		<legend class="mb-2 text-sm leading-5 font-semibold">Vilas disponíveis</legend>
		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each VILAS as v (v.id)}
				{@const atual = vila(v.id)}
				<div class="flex min-h-12 items-center gap-2 border-2 bg-b2 py-1 pr-2.5 pl-1 {atual ? 'border-frame' : 'border-b3'}">
					<label class="flex flex-1 cursor-pointer items-center gap-2">
						<input type="checkbox" class="caixa order-last ml-auto" checked={!!atual} onchange={() => alternarVila(v.id)} />
						<Icone id="vila/ic-vila-{v.id}" />
						<span class="text-sm leading-5 font-semibold {atual ? '' : 'text-mut'}">{v.nome}</span>
					</label>
					{#if atual && v.id !== 'sem'}
						<select
							class="h-9 border-2 border-b3 bg-b1 px-1.5 text-xs font-semibold text-fg"
							aria-label="Relação de {v.nome} com o grupo"
							value={atual.status ?? ''}
							onchange={(e) => statusVila(v.id, e.currentTarget.value)}
						>
							{#each STATUS_VILA as s (s.id)}<option value={s.id ?? ''}>{s.nome}</option>{/each}
						</select>
					{/if}
				</div>
			{/each}
		</div>
		{#if erros.vilas}<span class="text-[13px] font-semibold text-err" role="alert">{erros.vilas}</span>{/if}
	</fieldset>

	<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
		<legend class="mb-2 text-sm leading-5 font-semibold">Clãs oficiais permitidos · {dados.clas_permitidos.length} de {CLAS.length}</legend>
		<div class="flex flex-wrap gap-1">
			{#each CLAS as slug (slug)}
				{@const on = dados.clas_permitidos.includes(slug)}
				<label title={nomeCla(slug)} class="flex h-[52px] w-[52px] cursor-pointer items-center justify-center border-2 bg-b1 {on ? 'border-vermelhao' : 'border-b3 opacity-50'}">
					<input type="checkbox" class="sr-only" checked={on} onchange={() => alternarCla(slug)} aria-label="Clã {nomeCla(slug)}" />
					<Icone id="cla/ic-cla-{slug}" alt="" />
				</label>
			{/each}
		</div>
		<div class="flex gap-4 text-[13px] font-semibold">
			<button type="button" class="link" onclick={() => (dados.clas_permitidos = [...CLAS])}>Todos</button>
			<button type="button" class="link" onclick={() => (dados.clas_permitidos = [])}>Nenhum</button>
		</div>
	</fieldset>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="flex flex-col gap-1.5">
			<span class="text-sm leading-5 font-semibold">Clãs personalizados</span>
			<label class="flex min-h-11 cursor-pointer items-center gap-2.5">
				<input type="checkbox" role="switch" class="interruptor" bind:checked={dados.clas_sem_kkg} />
				<span class="text-[15px] leading-5 font-medium">Permitir sem KKG</span>
			</label>
			<label class="flex min-h-11 cursor-pointer items-center gap-2.5">
				<input type="checkbox" role="switch" class="interruptor" bind:checked={dados.clas_com_kkg} />
				<span class="text-[15px] leading-5 font-medium">Permitir com KKG</span>
			</label>
		</div>
		<fieldset class="m-0 flex flex-col gap-1.5 border-0 p-0">
			<legend class="mb-1.5 text-sm leading-5 font-semibold">Pacotes de equipamento</legend>
			<div class="flex flex-wrap gap-2">
				{#each PACOTES as p (p.id)}
					{@const on = dados.pacotes.includes(p.id)}
					<label title={p.ajuda} class="inline-flex min-h-11 cursor-pointer items-center border-2 px-3 text-sm font-semibold {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}">
						<input type="checkbox" class="sr-only" checked={on} onchange={() => alternarPacote(p.id)} />{p.nome}{on ? ' ✓' : ''}
					</label>
				{/each}
			</div>
			{#if erros.pacotes}<span class="text-[13px] font-semibold text-err" role="alert">{erros.pacotes}</span>{:else}<span class="text-[13px] leading-[18px] text-mut">Cap. 11: A é o equipamento da vila; B, 14.000 ryo.</span>{/if}
		</fieldset>
	</div>
</div>

<style>
	label:has(input.sr-only:focus-visible) {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
