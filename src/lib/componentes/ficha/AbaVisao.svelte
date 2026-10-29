<script lang="ts">
	// P3 · Visão geral: atributos, valores derivados, condições ativas, elemento e especialização, jutsus e arma em mãos.
	import { ATRIBUTOS, CONDICOES, ELEMENTOS, PROGRESSAO } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { regrasCla, sinal } from '#lib/personagem/regras.ts';
	import { teste } from '#lib/rolagens/expressoes.ts';
	import { partesAtributo, partesIniciativa } from '#lib/rolagens/partes.ts';
	import Icone from '../ui/Icone.svelte';
	import BotaoRolar from '../rolagens/BotaoRolar.svelte';
	import CartaoKkg from './CartaoKkg.svelte';

	let { f, aoAbrirJutsus }: { f: FichaJogo; aoAbrirJutsus: () => void } = $props();
	const r0 = $derived(f.calc.recursos);
	// a KKG ligada soma na Defesa (Sharingan) e na Percepção (Byakugan, Sharingan)
	const r = $derived(f.kkg?.ligada ? { ...r0, defesa: r0.defesa + f.kkg.efeito.defesa, defesaMental: r0.defesaMental + (f.kkg.efeito.pericias.percepcao ?? 0) } : r0);
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
				<div class="relative flex flex-col gap-1.5 border-2 bg-b2 p-2.5 sombra-painel {doCla ? 'border-[var(--vermelhao-lo)]' : 'border-frame'}" title="{a.nome} · limite atual {doCla ? '+8 (o marco do clã leva a +10)' : `+${PROGRESSAO.atributoMax}`}">
					<Icone id="atributo/ic-atributo-{a.id.toLowerCase()}" />
					{#if f.editavel}<BotaoRolar class="absolute top-1.5 right-1.5 w-9" expressao={teste(f.calc.atributos[a.id])} rotulo="Atributo · {a.nome}" personagem={f.id} d20 tipo="teste" origem="Ficha · Visão geral" partes={partesAtributo(a.id, f.calc.atributos[a.id])} />{/if}
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">{a.id}</span>
					<span class="t-num text-[32px] leading-none">{sinal(f.calc.atributos[a.id])}</span>
					{#if doCla}<span class="font-pixel text-xs leading-none font-bold text-title uppercase">+1 {regrasCla(f.dados)?.nome}</span>{/if}
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-2 gap-2.5">
			<!-- para que serve cada número, em vez da fórmula (a conta fica no hover) -->
			{#each [['recurso/ic-recurso-defesa', 'DEFESA', 'contra ataques', f.kkg?.ligada && f.kkg.efeito.defesa ? `10 + Acrobacia + ${f.kkg.efeito.defesa} (${f.kkg.def.nome})` : '10 + Acrobacia', String(r.defesa)], ['recurso/ic-recurso-defesa-mental', 'DEF. MENTAL', 'contra Genjutsu', '10 + Percepção', String(r.defesaMental)], ['recurso/ic-recurso-iniciativa', 'INICIATIVA', 'ordem no combate', r.formulas.iniciativa, sinal(r.iniciativa)], ['recurso/ic-recurso-carga', 'CARGA', '', `${String(f.carga).replace('.', ',')} de ${r.cargaMax}`, String(f.carga).replace('.', ',')]] as [icone, rotulo, uso, conta, valor] (rotulo)}
				<div class="flex items-center gap-2 border-2 border-frame bg-b2 px-3 py-2.5 {rotulo === 'INICIATIVA' || rotulo === 'CARGA' ? 'max-sm:col-span-2' : ''}" title={conta}>
					<Icone id={icone} />
					<div class="flex min-w-0 flex-1 flex-col gap-1">
						<span class="font-pixel text-xs leading-none font-bold tracking-[0.06em] text-mut max-sm:leading-[14px]">{rotulo}</span>
						{#if rotulo === 'CARGA'}
							<span class="relative h-2.5 border-2 border-ink bg-b3" aria-hidden="true"><span class="absolute inset-y-0 left-0" style:width="{Math.min(100, (f.carga / r.cargaMax) * 100)}%" style:background={f.carga > r.cargaMax ? 'var(--warn)' : 'var(--acc)'}></span></span>
						{:else}
							<span class="truncate text-xs leading-4 text-mut">{uso}</span>
						{/if}
					</div>
					<span class="t-num text-[26px] leading-none">{valor}{#if rotulo === 'CARGA'}<span class="text-sm text-mut">/{r.cargaMax}</span>{/if}</span>
					{#if rotulo === 'INICIATIVA' && f.editavel}<BotaoRolar class="w-9" expressao={teste(r.iniciativa)} rotulo="Iniciativa" personagem={f.id} d20 tipo="iniciativa" origem="Ficha · Visão geral" partes={partesIniciativa(f.calc.atributos.AGI, r.iniciativa)} />{/if}
				</div>
			{/each}
		</div>
		{#if f.kkg}<CartaoKkg {f} />{/if}
		<section class="painel-sombra" aria-labelledby="cond-titulo">
			<div class="flex items-center border-b-2 border-b3 px-3.5 py-3">
				<h3 id="cond-titulo" class="t-rotulo m-0 flex-1">Condições ativas · {f.atual.condicoes.length}</h3>
				{#if f.editavel}<span class="text-xs text-mut">Toque para alternar</span>{/if}
			</div>
			<div class="grid grid-cols-3 gap-2 p-3 min-[440px]:grid-cols-4 sm:grid-cols-6 sm:p-3.5">
				{#each CONDICOES as cnd (cnd.id)}
					{@const on = f.atual.condicoes.includes(cnd.id)}
					<button
						type="button"
						class="flex min-w-0 flex-col items-center gap-1 border-2 px-0.5 py-1.5 text-fg disabled:cursor-default {on ? 'border-vermelhao bg-grena text-papel' : 'border-b3 bg-b1 opacity-60'}"
						aria-pressed={on}
						title="{cnd.nome}: {cnd.efeito}"
						disabled={!f.editavel}
						onclick={() => f.alternarCondicao(cnd.id)}
					>
						<Icone id="estado/ic-estado-{cnd.id}" /><span class="max-w-full text-xs leading-[14px] font-semibold break-words">{cnd.nome}</span>
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
			<div class="flex flex-col">
				{#each destaque as j (j!.slug)}
					{@const c = f.custo(j!)}
					<button type="button" class="flex min-h-12 items-center gap-2.5 border-b-2 border-b3 px-3.5 py-1.5 text-left last:border-b-0 hover:bg-b3" onclick={aoAbrirJutsus}>
						<Icone id="rank/ic-rank-{j!.rank.toLowerCase()}" alt="Rank {j!.rank}" />
						<span class="flex min-w-0 flex-1 flex-col">
							<span class="truncate font-mincho text-[15px] leading-5 font-bold">{j!.nome}</span>
							<span class="truncate text-xs leading-4 text-mut">{j!.tipo} · {j!.origem}</span>
						</span>
						<span class="t-num text-base whitespace-nowrap">{c.final} {c.unidade}</span>
					</button>
				{:else}
					<span class="p-3.5 text-sm text-mut">Só técnicas de Rank E por enquanto.</span>
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
