<script lang="ts">
	// Prévia do clã no K2: "página do livro" (no formato dos clãs do cap. 8.3) ou o resumo dos números.
	import { nomeVila, picDoStatus, rotuloKkg, textoKkg, textosBonus } from '#lib/clas/regras.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import { PATRIMONIO } from '#lib/clas/dados.ts';
	import Icone from '../ui/Icone.svelte';
	import Brasao from './Brasao.svelte';

	let { c }: { c: CriadorCla } = $props();
	let aba = $state<'pagina' | 'resumo'>('pagina');
	const d = $derived(c.dados);
	const k = $derived(d.conceito);
	const bonus = $derived(textosBonus(d));
	const kkg = $derived(rotuloKkg(d));
	const vila = $derived(nomeVila(k.vila).replace(/gakure$/, ''));
	const obrigacoes = $derived([...d.obrigacoes, d.obrigacaoPropria.trim()].filter(Boolean));
</script>

<div class="flex border-b-2 border-ink" role="tablist" aria-label="Prévia">
	<button type="button" role="tab" aria-selected={aba === 'pagina'} class="flex-1 p-3 text-center font-pixel text-xs font-bold {aba === 'pagina' ? 'bg-vermelhao text-white' : 'text-mut'}" onclick={() => (aba = 'pagina')}>PÁGINA DO LIVRO</button>
	<button type="button" role="tab" aria-selected={aba === 'resumo'} class="flex-1 p-3 text-center font-pixel text-xs font-bold {aba === 'resumo' ? 'bg-vermelhao text-white' : 'text-mut'}" onclick={() => (aba = 'resumo')}>RESUMO</button>
</div>

<div class="flex items-center gap-3 border-b-2 border-ink bg-grena p-4 text-papel">
	<span class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-[var(--vermelhao-lo)] bg-carvao"><Brasao kamon={k.kamon} cor={k.cor} tamanho={64} /></span>
	<span class="flex min-w-0 flex-col gap-0.5">
		<span class="font-mincho text-[22px] leading-7 font-bold">Clã {k.nome.trim() || 'sem nome'}</span>
		<span class="text-[13px] leading-[18px] text-[#E6D2BF] italic">{[k.significado.trim(), vila].filter(Boolean).join(' · ') || 'Significado · vila'}</span>
	</span>
</div>

{#if aba === 'pagina'}
	<div class="flex flex-col gap-2.5 px-4 py-3.5">
		{#if k.historia.trim()}<p class="m-0 text-[13px] leading-[19px]">{k.historia.trim()}</p>{/if}
		<span class="mt-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">BÔNUS HEREDITÁRIO</span>
		<div class="flex flex-wrap gap-1.5">
			{#each bonus as b (b)}<span class="border-2 border-[rgba(217,168,43,.55)] bg-[rgba(217,168,43,.14)] px-[7px] py-1.5 font-pixel text-xs leading-none font-bold uppercase">{b}</span>{:else}<span class="text-[13px] text-mut">Nenhuma compra ainda.</span>{/each}
		</div>
		<span class="mt-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">KEKKEI GENKAI</span>
		{#if kkg}
			<span class="chip self-start border-2 border-[var(--vermelhao-lo)] bg-grena text-[13px] font-semibold text-papel"><Icone id="kkg/ic-kkg-{d.kekkei.tipo ?? 'hibrido'}" />{kkg}</span>
			<span class="text-[13px] leading-[19px]">{textoKkg(d)}</span>
		{:else}
			<span class="text-[13px] text-mut">Nenhum.</span>
		{/if}
		<span class="mt-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">MARCOS</span>
		<ol class="m-0 flex list-none flex-col p-0 text-[13px] leading-[19px]">
			{#each c.marcos as m (m.nivel)}<li class="flex gap-2"><b class="t-num w-6 flex-none text-right">{m.nivel}</b><span class:text-mut={!m.completo}>{m.texto}</span></li>{/each}
		</ol>
		{#if k.filosofia.trim()}
			<span class="mt-1.5 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">FILOSOFIA</span>
			<span class="font-mincho text-[15px] leading-[23px] font-semibold italic">{k.filosofia.trim()}</span>
		{/if}
	</div>
{:else}
	<dl class="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 px-4 py-3.5 text-[13px] leading-[19px]">
		<dt class="font-semibold text-mut">PB</dt><dd class="m-0"><b class="t-num">{c.pb.usados}/{c.pb.limite}</b></dd>
		{#if d.kkg}<dt class="font-semibold text-mut">PKG</dt><dd class="m-0"><b class="t-num">{c.pkg.beneficios} de {c.pkg.disponiveis}</b> (5 + {c.pkg.limitacoes} de limitações)</dd>{/if}
		<dt class="font-semibold text-mut">Marcos</dt><dd class="m-0"><b class="t-num">{c.analise.marcosCompletos}/20</b></dd>
		<dt class="font-semibold text-mut">Cartas</dt><dd class="m-0">{d.cartas.filter((x) => x.tipo === 'jutsu').length} jutsus · {d.cartas.filter((x) => x.tipo === 'habilidade').length} habilidades</dd>
		<dt class="font-semibold text-mut">PIC</dt><dd class="m-0">{picDoStatus(d) ? `${picDoStatus(d)} por arco (+1 no nível 1)` : 'defina o status'}</dd>
		<dt class="font-semibold text-mut">Patrimônio</dt><dd class="m-0">{d.patrimonio.map((p) => PATRIMONIO.find((x) => x.id === p)?.nome).join(' · ') || '—'}</dd>
		<dt class="font-semibold text-mut">Aliado</dt><dd class="m-0">{d.politica.aliado || '—'}</dd>
		<dt class="font-semibold text-mut">Rival</dt><dd class="m-0">{d.politica.rival || '—'}</dd>
		<dt class="font-semibold text-mut">Obrigação</dt><dd class="m-0">{obrigacoes.join(' · ') || '—'}</dd>
		{#if d.companheiro.ativo}<dt class="font-semibold text-mut">Companheiro</dt><dd class="m-0">{d.companheiro.criatura || 'a definir'} · nível {d.companheiro.nivel}</dd>{/if}
		<dt class="font-semibold text-mut">Bloqueios</dt><dd class="m-0" style:color={c.analise.bloqueios ? 'var(--err)' : 'var(--ok)'}>{c.analise.bloqueios || 'nenhum'}</dd>
	</dl>
{/if}
