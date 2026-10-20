<script lang="ts">
	// D5 · Detalhe do jutsu: card completo, "Onde aparece" e DT de referência.
	import indiceJson from '#lib/livro/gerado/indice.json';
	import { RANK } from '#lib/livro/dominio.ts';
	import type { IndiceLivro, Jutsu } from '#lib/livro/tipos.ts';
	import Icone from '../ui/Icone.svelte';
	import CardJutsu from './CardJutsu.svelte';

	interface Props {
		jutsu: Jutsu;
		nomeCla?: string | null;
	}
	let { jutsu, nomeCla = null }: Props = $props();

	const indice = indiceJson as IndiceLivro;
	const capitulo = $derived(indice.capitulos.find((c) => c.numero === jutsu.capitulo)!);
	const secao = $derived(capitulo.secoes.find((s) => s.id === jutsu.ancora));

	/** Atributo-chave da DT por tipo (cap. 2, DT do Jutsu). */
	const ATRIBUTO: Record<string, string> = {
		Ninjutsu: 'CTR',
		Genjutsu: 'CTR',
		Fuuinjutsu: 'CTR',
		Taijutsu: 'FOR',
		Bukijutsu: 'FOR ou AGI',
		Kugutsu: 'AGI'
	};
	const dt = $derived(`10 + ${RANK[jutsu.rank].dt} (rank ${jutsu.rank}) + ${ATRIBUTO[jutsu.tipo]} do lançador`);
</script>

<div class="flex flex-col gap-4">
	<CardJutsu {jutsu} semSombra rodape={false} />
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div class="flex flex-col gap-1.5 border-2 border-b3 bg-b1 p-3">
			<span class="t-rotulo-sm text-title">Onde aparece</span>
			{#if jutsu.cla}
				<a href="/regras/clas/{jutsu.cla}#jutsu-{jutsu.slug}" class="link flex items-center gap-1.5 text-sm leading-5 font-semibold">
					<Icone id="cla/ic-cla-{jutsu.cla}" />Clã {nomeCla ?? jutsu.origem.replace(/^Clã /, '')} · Jutsus e Habilidades
				</a>
			{:else}
				<a href="{capitulo.href}#jutsu-{jutsu.slug}" class="link flex items-center gap-1.5 text-sm leading-5 font-semibold">
					<Icone id={indice.partes[capitulo.parte - 1].icone} />Cap. {capitulo.numero} · {capitulo.titulo}{secao ? ` › ${secao.titulo}` : ''}
				</a>
			{/if}
		</div>
		<div class="flex flex-col gap-1.5 border-2 border-b3 bg-b1 p-3">
			<span class="t-rotulo-sm text-title">DT de referência</span>
			<span class="text-sm leading-5 font-semibold">{dt}</span>
			<span class="text-xs leading-4 text-mut">Quem tem proficiência no jutsu soma o bônus dela também.</span>
			<a href="/regras/mecanica-basica#tipos-de-teste-como-o-mestre-escolhe-o-que-rolar" class="link self-start text-xs leading-4">Regra da DT do Jutsu (cap. 2)</a>
		</div>
	</div>
</div>
