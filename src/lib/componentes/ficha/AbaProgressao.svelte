<script lang="ts">
	// P3 · Progressão: tabela de níveis com o que cada um traz (cap. 17), saldo e extrato de PT, especializações e pedidos de treino.
	import { tempoRelativo } from '#lib/formatar.ts';
	import { CUSTO_ESPECIALIZACAO, PROGRESSAO, SESSOES_TREINO } from '#lib/personagem/dados.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { xpDoNivel } from '#lib/personagem/progressao.ts';
	import { numero } from '#lib/formatar.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		f: FichaJogo;
		pt: number;
		xp: number;
		registros: { id: number; tipo: string; texto: string; criado_em: string }[];
		pedidos: { id: string; sessao: string; semanas: number; pt: number; descricao: string; status: string; criado_em: string; comentario: string | null }[];
		aoTreinar: () => void;
	}
	let { f, pt, xp, registros, pedidos, aoTreinar }: Props = $props();
	const nivel = $derived(f.calc.nivel);
	const ganhos = (n: number) => {
		const g = ['+5 PV, +3 PC, +3 PE, +3 PT'];
		if ((PROGRESSAO.niveisAtributo as readonly number[]).includes(n)) g.push('+1 atributo');
		if ((PROGRESSAO.niveisPericia as readonly number[]).includes(n)) g.push('+1 perícia · nova especialização');
		if (n === 5) g.push('2º elemento liberado (10 PT)');
		if (n === 8) g.push('3º elemento liberado (20 PT)');
		for (const [r, min] of Object.entries(PROGRESSAO.rankPorNivel)) if (min === n) g.push(`Rank ${r} liberado`);
		const marco = f.catalogo.cla?.marcos.find((m) => m.nivel === n);
		if (marco) g.push(`Clã: ${marco.texto}`);
		return g.join(' · ');
	};
	const niveis = $derived(Array.from({ length: Math.min(20, nivel + 5) - Math.max(1, nivel - 1) + 1 }, (_, i) => Math.max(1, nivel - 1) + i));
	const extrato = $derived(registros.filter((r) => ['treino', 'pt', 'nivel', 'recompensa'].includes(r.tipo)).slice(0, 12));
	const nomeEsp = (id: string) => f.catalogo.especializacoes.find((e) => e.id === id)?.nome ?? id;
	const SESSAO = Object.fromEntries(SESSOES_TREINO.map((s) => [s.id, s.nome]));
</script>

<div class="grid items-start gap-5 lg:grid-cols-2">
	<section class="painel-sombra" aria-label="Níveis">
		<h3 class="t-rotulo m-0 border-b-2 border-b3 px-3.5 py-3">Níveis · {numero(xp)} XP</h3>
		{#each niveis as n (n)}
			<div
				class="grid grid-cols-[52px_84px_minmax(0,1fr)] items-center gap-3 border-b-2 border-b3 px-3.5 py-[7px] last:border-b-0"
				style:background={n === nivel ? 'rgba(196,69,54,.10)' : n === nivel + 1 && xp >= xpDoNivel(n) ? 'rgba(217,168,43,.12)' : undefined}
			>
				<span class="t-num text-base">NV {n}</span>
				<span class="font-pixel text-[13px] font-semibold text-mut">{numero(xpDoNivel(n))} XP</span>
				<span class="text-[13px] leading-[18px]">
					{#if n === nivel}<b>Atual</b>{:else if n < nivel}Alcançado{:else}{ganhos(n)}{/if}{#if n === nivel + 1 && xp >= xpDoNivel(n)} · <b>disponível agora</b>{/if}
				</span>
			</div>
		{/each}
	</section>
	<div class="flex flex-col gap-3.5">
		<section class="painel-sombra" aria-label="PT">
			<div class="flex items-center gap-2 border-b-2 border-b3 px-3.5 py-3">
				<Icone id="recurso/ic-recurso-pt" /><h3 class="t-rotulo m-0 flex-1">PT · extrato</h3><span class="t-num text-[22px]">{pt}</span>
			</div>
			{#each extrato as r (r.id)}
				<div class="flex gap-2.5 border-b-2 border-b3 px-3.5 py-2 text-sm leading-5 last:border-b-0">
					<span class="flex-1">{r.texto}</span><span class="text-xs whitespace-nowrap text-mut">{tempoRelativo(r.criado_em)}</span>
				</div>
			{:else}
				<p class="m-0 px-3.5 py-3 text-sm text-mut">Sem movimentações ainda.</p>
			{/each}
			{#if f.editavel}
				<div class="border-t-2 border-b3 p-3"><button type="button" class="btn-jogo btn-contorno com-icone min-h-10 text-xs" onclick={aoTreinar}><Icone id="recurso/ic-recurso-pt" />TREINAR</button></div>
			{/if}
		</section>
		<section class="painel flex flex-col gap-2 px-3.5 py-3">
			<span class="t-rotulo text-xs">Especializações · {f.calc.especializacoes.length} / 7</span>
			{#each f.calc.especializacoes as e (e.id)}
				{@const prox = CUSTO_ESPECIALIZACAO[e.nivel + 1]}
				<div class="flex items-center gap-2">
					<Icone id="esp/ic-esp-{e.id}" />
					<span class="flex-1 text-sm leading-5 font-semibold">{nomeEsp(e.id)} · NV {e.nivel}</span>
					{#if prox}<span class="font-pixel text-xs text-mut" title="Exige nível {prox.nivelMin}">SUBIR: {prox.pt} PT{nivel < prox.nivelMin ? ` · NV ${prox.nivelMin}+` : ''}</span>{/if}
				</div>
			{/each}
			<span class="text-xs leading-4 text-mut">Novas especializações nos níveis 4, 7, 10, 13, 16 e 19.</span>
		</section>
		{#if pedidos.length}
			<section class="painel" aria-label="Pedidos de PT">
				<h3 class="t-rotulo m-0 border-b-2 border-b3 px-3.5 py-3">Pedidos de PT de treino</h3>
				{#each pedidos as d (d.id)}
					<div class="flex flex-col gap-0.5 border-b-2 border-b3 px-3.5 py-2 text-sm last:border-b-0">
						<span><b>+{d.pt} PT</b> · {SESSAO[d.sessao]} · {d.semanas} {d.semanas === 1 ? 'semana' : 'semanas'} · {d.descricao}</span>
						<span class="text-xs text-mut">{d.status === 'pendente' ? 'Aguardando o Mestre' : d.status === 'aprovado' ? 'Aprovado' : 'Recusado'}{d.comentario ? ` · “${d.comentario}”` : ''} · {tempoRelativo(d.criado_em)}</span>
					</div>
				{/each}
			</section>
		{/if}
	</div>
</div>
