<script lang="ts">
	// Quadro de combate de um estágio do verbete, no espírito do "Na mesa": a barra escura com a ameaça, os números
	// grandes, os ataques prontos para rolar (chips de dado), os jutsus com link para o catálogo e os traços.
	import { PAPEIS } from '#lib/bestiario/npc.ts';
	import type { Criatura, EstagioCriatura } from '#lib/livro/tipos.ts';
	import DadoInline from '../leitura/DadoInline.svelte';
	import Texto from '../leitura/Texto.svelte';
	import SeloRank from '../regras/SeloRank.svelte';
	import Icone from '../ui/Icone.svelte';

	let { criatura, estagio }: { criatura: Pick<Criatura, 'nome' | 'tags'>; estagio: EstagioCriatura } = $props();
	const k = $derived(estagio.combate);
	const numeros = $derived(
		[
			['PV', k.pv],
			['PC', k.pc ?? '—'],
			['Defesa', k.defesa],
			['Iniciativa', `+${k.iniciativa}`],
			['DT', k.dt],
			...(k.rd ? [['RD', k.rd]] : [])
		] as [string, string | number][]
	);
</script>

<aside class="sombra-painel border-2 border-frame bg-b1" aria-label="Combate: {estagio.nome}">
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1 border-b-[3px] border-[var(--vermelhao)] bg-b0 py-1.5 pr-3 pl-1.5">
		<Icone id="dado/ic-dado-d20" />
		<span class="font-pixel text-[11px] leading-none font-bold tracking-[.16em] text-[#D9A82B]">AMEAÇA {estagio.ameacaRotulo}</span>
		<span class="h-3.5 w-0.5 flex-none bg-[#D9A82B] opacity-50" aria-hidden="true"></span>
		<span class="font-mincho text-[15px] leading-5 font-bold text-b0fg">{estagio.nome !== criatura.nome ? `${estagio.nome} · ` : ''}{PAPEIS[estagio.papel]}{estagio.membros > 1 ? ` · ${estagio.membros} membros` : ''}</span>
	</div>
	{#if estagio.resumo}<p class="m-0 border-b border-b3 px-3 py-2 text-sm leading-5 text-pretty text-mut italic"><Texto trechos={estagio.resumo} /></p>{/if}

	<dl class="m-0 grid grid-cols-3 border-b-2 border-b3">
		{#each numeros as [rotulo, valor], i (rotulo)}
			<div class="flex flex-col items-center gap-0.5 px-1 py-2 {i % 2 ? 'bg-b2' : ''}">
				<dt class="t-rotulo-sm text-mut">{rotulo}</dt>
				<dd class="t-num m-0 text-[22px] leading-6 font-bold text-title">{valor}</dd>
			</div>
		{/each}
	</dl>

	<div class="flex flex-col gap-3 px-3 py-3 text-[15px] leading-[22px]">
		{#if k.nota}<p class="m-0 text-sm leading-5 text-mut italic">{k.nota}</p>{/if}

		<section class="flex flex-col gap-2" aria-label="Ataques">
			<h3 class="t-rotulo m-0 text-title">Ataques</h3>
			{#each k.ataques as a (a.nome)}
				<div class="flex flex-col gap-1">
					<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
						<span class="font-semibold">{a.nome}</span>
						<span class="text-sm text-mut">{a.alcance}</span>
						<span class="ml-auto inline-flex items-baseline gap-1.5 text-sm">
							acerto <DadoInline expr="1d20+{a.acerto}" texto="1d20+{a.acerto}" />
							dano <DadoInline expr={a.dano} texto={a.dano} />
						</span>
					</div>
					{#if a.efeito}<p class="m-0 text-sm leading-5 text-pretty"><Texto trechos={a.efeito} /></p>{/if}
				</div>
			{/each}
		</section>

		{#if k.jutsus.length}
			<section class="flex flex-col gap-1.5 border-t border-b3 pt-3" aria-label="Jutsus">
				<h3 class="t-rotulo m-0 text-title">Jutsus</h3>
				<ul class="m-0 flex list-none flex-col gap-1.5 p-0">
					{#each k.jutsus as j (j.nome)}
						<li class="flex items-center gap-2">
							{#if j.rank}<SeloRank rank={j.rank} />{/if}
							<span class="min-w-0 flex-1">
								{#if j.slug}<a class="link font-semibold" href="/regras/jutsus/{j.slug}">{j.nome}</a>{:else}<span class="font-semibold">{j.nome}</span>{/if}
								{#if j.custo}<span class="text-sm text-mut"> · {j.custo}</span>{/if}
								{#if j.nota}<span class="block text-sm leading-5 text-mut">{j.nota}</span>{/if}
							</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if k.tracos.length}
			<section class="flex flex-col gap-1.5 border-t border-b3 pt-3" aria-label="Traços">
				<h3 class="t-rotulo m-0 text-title">Traços</h3>
				{#each k.tracos as t (t.nome)}
					<p class="m-0 text-pretty"><b class="font-semibold">{t.nome}.</b> <Texto trechos={t.efeito} /></p>
				{/each}
			</section>
		{/if}

		<p class="m-0 flex flex-wrap gap-1.5 border-t border-b3 pt-3" aria-label="Tags de comportamento">
			{#each criatura.tags as t (t)}<span class="chip sem-icone cursor-default">{t}</span>{/each}
		</p>
	</div>
</aside>
