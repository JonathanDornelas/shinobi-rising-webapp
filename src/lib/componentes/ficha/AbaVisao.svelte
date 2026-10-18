<script lang="ts">
	// P3 · Visão geral: atributos, valores derivados, condições ativas, elemento e especialização, jutsus e arma em mãos.
	import { ATRIBUTOS, CONDICOES, ELEMENTOS, PROGRESSAO } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { regrasCla, sinal } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';

	let { f, aoAbrirJutsus }: { f: FichaJogo; aoAbrirJutsus: () => void } = $props();
	const r = $derived(f.calc.recursos);
	const nomeEsp = (id: string) => f.catalogo.especializacoes.find((e) => e.id === id)?.nome ?? id;
	const destaque = $derived(f.calc.jutsus.map((s) => f.catalogo.jutsus.find((j) => j.slug === s)).filter((j) => !!j && j.rank !== 'E').slice(0, 3));
	// a arma em mãos é a que tem proficiência; senão, a primeira do inventário
	const emMaos = $derived(
		f.inventario.find((i) => i.grupo === 'Armas' && f.calc.proficiencias.some((p) => p.tipo === 'arma' && p.alvo === i.nome)) ?? f.inventario.find((i) => i.grupo === 'Armas')
	);
	const profArma = $derived(emMaos ? f.calc.proficiencias.find((p) => p.tipo === 'arma' && p.alvo === emMaos.nome) : undefined);
</script>

<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
	<div class="flex min-w-0 flex-col gap-5">
		<div class="grid grid-cols-3 gap-2.5 md:grid-cols-6">
			{#each ATRIBUTOS as a (a.id)}
				{@const doCla = f.calc.atributoDoCla === a.id}
				<div class="flex flex-col gap-1.5 border-2 bg-b2 p-2.5 sombra-painel {doCla ? 'border-[#8B2E20]' : 'border-frame'}" title="{a.nome} · limite atual {doCla ? '+8 (o marco do clã leva a +10)' : `+${PROGRESSAO.atributoMax}`}">
					<Icone id="atributo/ic-atributo-{a.id.toLowerCase()}" />
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">{a.id}</span>
					<span class="t-num text-[32px] leading-none">{sinal(f.calc.atributos[a.id])}</span>
					{#if doCla}<span class="font-pixel text-xs leading-none font-bold text-title uppercase">+1 {regrasCla(f.dados)?.nome}</span>{/if}
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
			{#each [['recurso/ic-recurso-defesa', 'DEFESA', '10 + Acrobacia', String(r.defesa)], ['recurso/ic-recurso-defesa-mental', 'DEF. MENTAL', '10 + Percepção', String(r.defesaMental)], ['recurso/ic-recurso-iniciativa', 'INICIATIVA', r.formulas.iniciativa, sinal(r.iniciativa)], ['recurso/ic-recurso-carga', 'CARGA', `máx. ${r.cargaMax}`, String(f.carga).replace('.', ',')]] as [icone, rotulo, conta, valor] (rotulo)}
				<div class="flex items-center gap-2 border-2 border-frame bg-b2 px-3 py-2.5" title={conta}>
					<Icone id={icone} />
					<div class="flex min-w-0 flex-1 flex-col gap-1">
						<span class="font-pixel text-xs leading-none font-bold tracking-[0.06em] text-mut">{rotulo}</span>
						<span class="truncate text-xs leading-4 text-mut">{conta}</span>
					</div>
					<span class="t-num text-[26px] leading-none">{valor}</span>
				</div>
			{/each}
		</div>
		<section class="painel-sombra" aria-labelledby="cond-titulo">
			<div class="flex items-center border-b-2 border-b3 px-3.5 py-3">
				<h3 id="cond-titulo" class="t-rotulo m-0 flex-1">Condições ativas · {f.atual.condicoes.length}</h3>
				{#if f.editavel}<span class="text-xs text-mut">Toque para alternar</span>{/if}
			</div>
			<div class="grid grid-cols-4 gap-2 p-3.5 sm:grid-cols-6">
				{#each CONDICOES as cnd (cnd.id)}
					{@const on = f.atual.condicoes.includes(cnd.id)}
					<button
						type="button"
						class="flex flex-col items-center gap-1 border-2 px-0.5 py-1.5 text-fg disabled:cursor-default {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 bg-b1 opacity-60'}"
						aria-pressed={on}
						title="{cnd.nome}: {cnd.efeito}"
						disabled={!f.editavel}
						onclick={() => f.alternarCondicao(cnd.id)}
					>
						<Icone id="estado/ic-estado-{cnd.id}" /><span class="text-xs leading-[14px] font-semibold">{cnd.nome}</span>
					</button>
				{/each}
			</div>
		</section>
	</div>

	<div class="flex min-w-0 flex-col gap-4">
		<section class="painel-sombra flex flex-col gap-2.5 px-3.5 py-3">
			<h3 class="t-rotulo m-0">Elemento e especialização</h3>
			<div class="flex flex-wrap gap-2">
				{#each f.calc.elementos as e (e)}
					{@const el = ELEMENTOS.find((x) => x.id === e)}
					<span class="inline-flex h-9 items-center gap-1 border-2 pr-2.5 text-[13px] font-semibold" style:background="color-mix(in srgb, {el?.cor} 12%, transparent)" style:border-color="color-mix(in srgb, {el?.cor} 55%, transparent)">
						<Icone id="elemento/ic-elemento-{e}" />{el?.nome ?? e}
					</span>
				{/each}
				{#each f.calc.especializacoes as e (e.id)}
					<span class="inline-flex h-9 items-center gap-1 border-2 border-b3 pr-2.5 text-[13px] font-semibold">
						<Icone id="esp/ic-esp-{e.id}" />{nomeEsp(e.id)}{e.elemento ? ` (${ELEMENTOS.find((x) => x.id === e.elemento)?.nome})` : ''} · NV {e.nivel}
					</span>
				{/each}
			</div>
		</section>
		<section class="painel-sombra">
			<div class="flex items-center border-b-2 border-b3 px-3.5 py-3">
				<h3 class="t-rotulo m-0 flex-1">Jutsus em destaque</h3>
				<button type="button" class="link text-[13px] font-semibold" onclick={aoAbrirJutsus}>Ver todos</button>
			</div>
			<div class="flex flex-wrap gap-2 p-3.5">
				{#each destaque as j (j!.slug)}
					{@const c = f.custo(j!)}
					<button type="button" title="{j!.nome} · {c.final} {c.unidade}" class="relative flex h-[72px] w-[72px] items-center justify-center border-2 border-b3 bg-b1 hover:border-mut" onclick={aoAbrirJutsus}>
						<Icone id="rank/ic-rank-{j!.rank.toLowerCase()}" tamanho={64} alt={j!.nome} />
						<span class="t-num absolute -right-0.5 -bottom-0.5 bg-b0 px-1 py-0.5 text-xs text-b0fg">{c.final} {c.unidade}</span>
					</button>
				{:else}
					<span class="text-sm text-mut">Só técnicas de Rank E por enquanto.</span>
				{/each}
			</div>
		</section>
		{#if emMaos}
			<section class="painel-sombra flex items-center gap-3 px-3.5 py-3">
				<div class="flex h-[72px] w-[72px] items-center justify-center border-2 border-b3 bg-b1"><Icone id={emMaos.icone} tamanho={64} /></div>
				<div class="flex flex-1 flex-col gap-1">
					<span class="t-rotulo text-xs">Em mãos</span>
					<span class="font-mincho text-[17px] leading-[22px] font-bold">{emMaos.nome}</span>
					<span class="t-num text-[15px]">×{emMaos.qtd}</span>
					{#if profArma}<span class="text-xs leading-4 text-mut">Proficiência: +1 de dano com esta arma</span>{/if}
				</div>
			</section>
		{/if}
	</div>
</div>
