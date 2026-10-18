<script lang="ts">
	// Passo 6 · Proficiências: 4 PT (+5 sem clã, +2 Perdedor) em até 5 proficiências (cap. 3).
	import {
		AMBIENTES,
		CATEGORIAS_ARMA,
		CRIACAO,
		custoProficiencia,
		EQUIPAMENTOS_PROFICIENCIA,
		NIVEIS_PROFICIENCIA,
		TIPOS_PROFICIENCIA,
		type TipoProficiencia
	} from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import { jutsusConhecidos } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';
	import Orcamento from './Orcamento.svelte';

	let { c }: { c: Criador } = $props();

	const nomeJutsu = (slug: string) => c.catalogo.conhecidos[slug]?.nome ?? [...c.catalogo.jutsusE, ...c.catalogo.jutsusD].find((j) => j.slug === slug)?.nome ?? slug;
	const alvos = (tipo: TipoProficiencia): { valor: string; nome: string }[] => {
		const simples = (l: string[]) => l.map((x) => ({ valor: x, nome: x }));
		if (tipo === 'arma') return simples(c.catalogo.armas);
		if (tipo === 'categoria') return simples(CATEGORIAS_ARMA);
		if (tipo === 'ambiente') return simples(AMBIENTES);
		if (tipo === 'equipamento') return simples(EQUIPAMENTOS_PROFICIENCIA);
		return jutsusConhecidos(c.ficha).map((s) => ({ valor: s, nome: nomeJutsu(s) }));
	};
	const ICONE: Record<TipoProficiencia, string> = {
		arma: 'arma/ic-arma-kunai',
		categoria: 'equip/ic-equip-arma-distancia',
		jutsu: 'rank/ic-rank-e',
		ambiente: 'callout/ic-callout-destaque',
		equipamento: 'equip/ic-equip-kit'
	};

	function adicionar() {
		c.ficha.proficiencias = [...c.ficha.proficiencias, { tipo: 'arma', alvo: '', nivel: 1 }];
	}
	function remover(i: number) {
		c.ficha.proficiencias = c.ficha.proficiencias.filter((_, j) => j !== i);
	}
</script>

<div class="grid gap-3 sm:grid-cols-2">
	<Orcamento rotulo="PT de proficiência" usados={c.pt.gastos} limite={c.pt.total} fixo={false} />
	<div class="painel flex flex-col gap-2 px-3 py-2.5">
		<span class="t-rotulo">Proficiências</span>
		<span class="t-num text-[28px] leading-none">{c.ficha.proficiencias.length}<span class="text-base text-mut"> / {CRIACAO.proficienciasMax}</span></span>
		<span class="text-xs leading-4 text-mut">Máx. 3 em Mestre e 1 em Lendário no jogo</span>
	</div>
</div>

{#each c.ficha.proficiencias as p, i (i)}
	{@const tipo = TIPOS_PROFICIENCIA.find((t) => t.id === p.tipo)!}
	{@const nivel = NIVEIS_PROFICIENCIA.find((n) => n.id === p.nivel)!}
	<div class="painel-sombra flex flex-wrap items-end gap-3 px-3 py-2.5">
		<Icone id={ICONE[p.tipo]} class="self-center" />
		<label class="flex min-w-[160px] flex-col gap-1 text-[13px] font-semibold">
			Tipo
			<select class="campo h-10 text-[15px]" disabled={!c.editavel} bind:value={p.tipo} onchange={() => (p.alvo = '')}>
				{#each TIPOS_PROFICIENCIA as t (t.id)}<option value={t.id}>{t.nome}</option>{/each}
			</select>
		</label>
		<label class="flex min-w-[200px] flex-1 flex-col gap-1 text-[13px] font-semibold">
			{p.tipo === 'jutsu' ? 'Jutsu (só os já conhecidos)' : 'Alvo'}
			<select class="campo h-10 text-[15px]" disabled={!c.editavel} bind:value={p.alvo} aria-invalid={!p.alvo || undefined} style:border-color={!p.alvo ? 'var(--warn)' : undefined}>
				<option value="">Escolha…</option>
				{#each alvos(p.tipo) as a (a.valor)}<option value={a.valor}>{a.nome}</option>{/each}
			</select>
		</label>
		<label class="flex min-w-[150px] flex-col gap-1 text-[13px] font-semibold">
			Nível
			<select class="campo h-10 text-[15px]" disabled={!c.editavel} bind:value={p.nivel}>
				{#each NIVEIS_PROFICIENCIA as n (n.id)}<option value={n.id}>{n.nome} (+{n.bonus}) · {custoProficiencia(p.tipo, n.id)} PT</option>{/each}
			</select>
		</label>
		<span class="border-2 border-[var(--vermelhao-lo)] bg-grena px-2 py-1.5 font-pixel text-[13px] leading-none font-bold tracking-[0.06em] text-papel uppercase">{nivel.nome}</span>
		<span class="t-num text-lg">{custoProficiencia(p.tipo, p.nivel)} PT</span>
		{#if c.editavel}<button type="button" class="link self-center text-[13px] font-semibold text-err" onclick={() => remover(i)}>Remover</button>{/if}
		<span class="w-full text-[13px] leading-[18px] text-mut">{tipo.beneficio}{p.tipo === 'categoria' ? ' · categorias custam +1 PT por nível' : ''}</span>
	</div>
{/each}

{#if c.editavel}
	<button
		type="button"
		class="btn-jogo self-start border-2 border-dashed border-mut text-[13px]"
		disabled={c.ficha.proficiencias.length >= CRIACAO.proficienciasMax}
		onclick={adicionar}>+ ADICIONAR PROFICIÊNCIA</button
	>
{/if}
<p class="m-0 text-[13px] leading-[18px] text-mut">
	“Jutsu específico” só lista jutsus já conhecidos: os da Academia, os do clã e os escolhidos no passo 9. PT não gastos ficam para treinos futuros (cap. 18).
</p>
