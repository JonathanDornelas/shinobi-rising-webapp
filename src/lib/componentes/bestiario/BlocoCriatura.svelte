<script lang="ts">
	// Quadro de combate de um estágio do verbete, no espírito do "Na mesa": a barra escura com a ameaça, os números
	// grandes, os atributos, as perícias, especializações e proficiências, os ataques prontos para rolar (chips de dado),
	// os jutsus lado a lado e os traços. Atributos, perícias e jutsus abrem o cartão do léxico no hover, como no livro.
	import { ATRIBUTOS, ESTILOS, NIVEIS_PROFICIENCIA, PERFIS } from '#lib/bestiario/ficha.ts';
	import { PAPEIS, TAMANHOS } from '#lib/bestiario/npc.ts';
	import type { Criatura, EstagioCriatura } from '#lib/livro/tipos.ts';
	import DadoInline from '../leitura/DadoInline.svelte';
	import Termo from '../leitura/Termo.svelte';
	import Texto from '../leitura/Texto.svelte';
	import Glosa from '../regras/Glosa.svelte';
	import SeloDt from '../regras/SeloDt.svelte';
	import SeloRank from '../regras/SeloRank.svelte';
	import { dtNaFichaDaCriatura } from '#lib/jutsus/dt.ts';
	import Icone from '../ui/Icone.svelte';

	let { criatura, estagio }: { criatura: Pick<Criatura, 'nome' | 'tags'>; estagio: EstagioCriatura } = $props();
	const k = $derived(estagio.combate);
	const fc = $derived(k.ficha);
	const sinal = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
	const CAP3 = '/regras/atributos-pericias-e-proficiencias';
	// "Usos de jutsu" das invocações (cap. 14) não é um jutsu: vai numa linha à parte, embaixo da lista
	const jutsus = $derived(k.jutsus.filter((j) => j.slug || j.rank));
	const usos = $derived(k.jutsus.filter((j) => !j.slug && !j.rank));
	// a proficiência no jutsu marcante repete o nome dele: a tradução vem da lista de jutsus do estágio
	const traducaoDe = (slug: string) => k.jutsus.find((j) => j.slug === slug)?.traducao ?? null;
	const perfil = $derived(estagio.perfil && estagio.perfil !== 'equilibrado' ? PERFIS[estagio.perfil] : null);
	const estilo = $derived(estagio.estilo ? ESTILOS[estagio.estilo] : null);
	const fator = (n: number) => n.toLocaleString('pt-BR');
	const troca = (e: NonNullable<typeof estilo>) =>
		(
			[
				['Defesa', e.defesa],
				['Iniciativa', e.iniciativa],
				['DT', e.dt]
			] as const
		)
			.filter(([, v]) => v)
			.map(([nome, v]) => `${nome} ${v > 0 ? '+' : '−'}${Math.abs(v)}`)
			.join(', ');
	// cada número contra o de um adversário comum da mesma ameaça (a tabela do Como usar): a seta diz onde ele é mais
	// forte (▲) ou mais fraco (▼); o papel, o perfil e a ficha explicam o porquê
	const r = $derived(k.referencia);
	const numeros = $derived(
		(
			[
				['PV', k.pv, r.pv],
				['PC', k.pc, r.pc],
				...(k.pe !== null ? [['PE', k.pe, r.pe]] : []),
				['Defesa', k.defesa, r.defesa],
				['Iniciativa', k.iniciativa, r.iniciativa],
				['DT', k.dt, r.dt],
				...(k.rd ? [['RD', k.rd, null]] : [])
			] as [string, number | null, number | null][]
		).map(([rotulo, valor, ref]) => {
			const mostrar = (n: number) => (rotulo === 'Iniciativa' ? (n < 0 ? `−${-n}` : `+${n}`) : String(n));
			return {
				rotulo,
				texto: valor === null ? '—' : mostrar(valor),
				lado: valor === null || ref === null || valor === ref ? null : valor > ref ? ('acima' as const) : ('abaixo' as const),
				comum: ref === null ? null : mostrar(ref)
			};
		})
	);
</script>

<aside class="sombra-painel border-2 border-frame bg-b1" aria-label="Combate: {estagio.nome}">
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1 border-b-[3px] border-[var(--vermelhao)] bg-b0 py-1.5 pr-3 pl-1.5">
		<Icone id="dado/ic-dado-d20" />
		<span class="font-pixel text-[11px] leading-none font-bold tracking-[.16em] text-[#D9A82B]">AMEAÇA {estagio.ameacaRotulo}</span>
		<span class="h-3.5 w-0.5 flex-none bg-[#D9A82B] opacity-50" aria-hidden="true"></span>
		<span class="font-mincho text-[15px] leading-5 font-bold text-b0fg">{estagio.nome !== criatura.nome ? `${estagio.nome} · ` : ''}{PAPEIS[estagio.papel]}{estagio.membros > 1 ? ` · ${estagio.membros} membros` : ''}{estagio.tamanho && estagio.tamanho !== 'medio' ? ` · ${TAMANHOS[estagio.tamanho].rotulo}` : ''}</span>
		{#if perfil || estilo}
			<span class="ml-auto flex flex-wrap gap-x-1.5 text-[13px] leading-5 text-[#D9A82B]">
				{#if perfil}<a class="underline decoration-dotted underline-offset-2 hover:text-b0fg" href="/regras/bestiario/como-usar#perfis" title="PV ×{fator(perfil.pv)} e PC ×{fator(perfil.pc)} da tabela de ameaça">{perfil.nome}</a>{/if}
				{#if perfil && estilo}<span aria-hidden="true">·</span>{/if}
				{#if estilo}<a class="underline decoration-dotted underline-offset-2 hover:text-b0fg" href="/regras/bestiario/como-usar#estilos" title={troca(estilo)}>{estilo.nome}</a>{/if}
			</span>
		{/if}
	</div>
	{#if estagio.resumo}<p class="m-0 border-b border-b3 px-3 py-2 text-sm leading-5 text-pretty text-mut italic"><Texto trechos={estagio.resumo} /></p>{/if}

	<dl class="m-0 grid grid-cols-3 border-b-2 border-b3">
		{#each numeros as { rotulo, texto, lado, comum }, i (rotulo)}
			<div class="flex flex-col items-center gap-0.5 px-1 py-2 {i % 2 ? 'bg-b2' : ''}" title={comum === null ? undefined : `Um adversário comum de ameaça ${estagio.ameacaRotulo} tem ${comum}`}>
				<dt class="t-rotulo-sm text-mut">
					{rotulo}{#if lado}<span class="ml-0.5 {lado === 'acima' ? 'text-[var(--vermelhao)]' : 'text-mut'}" aria-hidden="true">{lado === 'acima' ? '▲' : '▼'}</span><span class="sr-only"> ({lado} do comum da ameaça, {comum})</span>{/if}
				</dt>
				<dd class="t-num m-0 text-[22px] leading-6 font-bold text-title">{texto}</dd>
			</div>
		{/each}
	</dl>

	<dl class="m-0 grid grid-cols-6 border-b-2 border-b3" aria-label="Atributos">
		{#each ATRIBUTOS as a (a)}
			<div class="flex flex-col items-center gap-1 px-0.5 py-1.5">
				<dt class="text-[13px] leading-4"><Termo id="atributo:{a}" texto={a.toUpperCase()} href="{CAP3}#atributos" /></dt>
				<dd class="t-num m-0 text-[15px] leading-5 font-bold">{sinal(fc.atributos[a])}</dd>
			</div>
		{/each}
	</dl>

	<div class="flex flex-col gap-3 px-3 py-3 text-[15px] leading-[22px]">
		{#if k.nota}<p class="m-0 text-sm leading-5 text-mut italic">{k.nota}</p>{/if}

		<dl class="m-0 flex flex-col gap-1 text-sm leading-5">
			<div>
				<dt class="inline font-semibold text-title">Perícias</dt>
				<dd class="m-0 inline">
					{#each fc.pericias as p, i (p.id)}<Termo id="pericia:{p.id}" texto={p.nome} href="{CAP3}#pericia-{p.id}" /> {sinal(p.total)}{i < fc.pericias.length - 1 ? ', ' : ''}{/each}
				</dd>
			</div>
			{#if fc.especializacoes.length}
				<div>
					<dt class="inline font-semibold text-title">Especializações</dt>
					<dd class="m-0 inline">
						{#each fc.especializacoes as s, i (s.nome)}<a class="link" href="/regras/especializacoes#{s.ancora}">{s.nome}</a> (nível {s.nivel}){i < fc.especializacoes.length - 1 ? ', ' : ''}{/each}
					</dd>
				</div>
			{/if}
			{#if fc.proficiencias.length}
				<div>
					<dt class="inline font-semibold text-title">Proficiências</dt>
					<dd class="m-0 inline">
						{#each fc.proficiencias as p, i (p.nome)}{#if p.jutsu}<Termo id="jutsu:{p.jutsu}" texto={p.nome} href="/regras/jutsus/{p.jutsu}" /> <Glosa texto={traducaoDe(p.jutsu)} emLinha />{:else}{p.nome}{/if} ({NIVEIS_PROFICIENCIA[p.bonus]}, {sinal(p.bonus)}){i < fc.proficiencias.length - 1 ? ', ' : ''}{/each}
					</dd>
				</div>
			{/if}
		</dl>

		<section class="flex flex-col gap-2" aria-label="Ataques">
			<h3 class="t-rotulo m-0 text-title">Ataques</h3>
			{#each k.ataques as a, i (`${a.nome}-${i}`)}
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
			<section class="flex flex-col gap-2 border-t border-b3 pt-3" aria-label="Jutsus">
				<h3 class="t-rotulo m-0 text-title">Jutsus</h3>
				{#if jutsus.length}
					<!-- lado a lado; o nome abre o cartão do jutsu no hover, como no livro -->
					<ul class="m-0 flex list-none flex-wrap gap-1.5 p-0">
						{#each jutsus as j, i (`${j.slug ?? j.nome}-${i}`)}
							<li class="inline-flex items-center gap-1.5 border border-b3 bg-b2 py-0.5 pr-2 pl-1 text-sm leading-5">
								{#if j.rank}<SeloRank rank={j.rank} />{/if}
								<span class="flex flex-col">
									{#if j.slug}<Termo id="jutsu:{j.slug}" texto={j.nome} href="/regras/jutsus/{j.slug}" />{:else}<span class="font-semibold">{j.nome}</span>{/if}
									<Glosa texto={j.traducao} class="text-xs leading-4" />
								</span>
								{#if j.custo}<span class="text-xs whitespace-nowrap text-mut">{j.custo}</span>{/if}
								{#if fc && j.rank}{@const dt = dtNaFichaDaCriatura(fc, j)}{#if dt}<SeloDt {dt} />{/if}{/if}
							</li>
						{/each}
					</ul>
					{#each jutsus.filter((j) => j.nota) as j, i (`${j.nome}-${i}`)}<p class="m-0 text-sm leading-5 text-mut"><b class="font-semibold">{j.nome}:</b> {j.nota}</p>{/each}
				{/if}
				{#each usos as u, i (`${u.nome}-${i}`)}
					<p class="m-0 text-sm leading-5"><b class="font-semibold">{u.nome}.</b> <span class="text-mut">{u.nota}</span></p>
				{/each}
			</section>
		{/if}

		{#if k.tracos.length}
			<section class="flex flex-col gap-1.5 border-t border-b3 pt-3" aria-label="Traços">
				<h3 class="t-rotulo m-0 text-title">Traços</h3>
				{#each k.tracos as t, i (`${t.nome}-${i}`)}
					<p class="m-0 text-pretty"><b class="font-semibold">{t.nome}.</b> <Texto trechos={t.efeito} /></p>
				{/each}
			</section>
		{/if}

		<p class="m-0 flex flex-wrap gap-1.5 border-t border-b3 pt-3" aria-label="Tags de comportamento">
			{#each criatura.tags as t (t)}<span class="chip sem-icone cursor-default">{t}</span>{/each}
		</p>
	</div>
</aside>
