<script lang="ts">
	// Linha do tempo de marcos por nível (CMP-17), com alternância para tabela.
	import type { Jutsu } from '#lib/livro/tipos.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		marcos: { nivel: number; texto: string }[];
		cla: string;
		jutsus: Jutsu[];
		modo?: 'linha' | 'tabela';
	}
	let { marcos, cla, jutsus, modo = 'linha' }: Props = $props();

	/** Níveis em que um novo rank de jutsu é liberado (cap. 17): B no 6, A no 11, S no 15. */
	const LIMIAR: Record<number, string> = { 6: 'B', 11: 'A', 15: 'S' };
	const ATRIBUTOS = ['for', 'agi', 'vig', 'int', 'ctr', 'esp'];

	function icone(texto: string): string {
		const t = normalizar(texto);
		const attr = t.match(/^\+\d+ (for|agi|vig|int|ctr|esp)\b/);
		if (attr && ATRIBUTOS.includes(attr[1])) return `atributo/ic-atributo-${attr[1]}`;
		if (/criar jutsu/.test(t)) return 'acao/ic-acao-criar-jutsu';
		if (/^habilidade|habilidade:/.test(t)) return 'acao/ic-acao-criar-personagem';
		const rank = t.match(/rank ([bas]) (liberado|desbloqueado)/);
		if (rank) return `rank/ic-rank-${rank[1]}`;
		if (/^\+\d+ pt\b/.test(t)) return 'recurso/ic-recurso-pt';
		if (/^\+\d+ pic\b/.test(t)) return 'recurso/ic-recurso-pic';
		if (/^\+\d+ pv\b/.test(t)) return 'recurso/ic-recurso-pv';
		if (/^\+\d+ pc\b/.test(t)) return 'recurso/ic-recurso-pc';
		if (/^\+\d+ pe\b/.test(t)) return 'recurso/ic-recurso-pe';
		return `cla/ic-cla-${cla}`;
	}

	/** Jutsus do clã citados no marco, para os atalhos. */
	function citados(texto: string) {
		const t = normalizar(texto);
		return jutsus.filter((j) => t.includes(normalizar(j.nome)));
	}
</script>

{#if modo === 'linha'}
	<ol class="m-0 flex list-none flex-col p-0">
		{#each marcos as m, i (m.nivel)}
			{@const rank = LIMIAR[m.nivel]}
			{@const js = citados(m.texto)}
			<li class="grid grid-cols-[40px_32px_minmax(0,1fr)] items-start gap-3 pr-2.5 pl-1" style:background={rank ? 'rgba(217,168,43,.10)' : undefined}>
				<div class="flex flex-col items-center self-stretch">
					<span
						class="t-num mt-2 flex h-9 w-9 flex-none items-center justify-center border-2 border-ink text-base"
						style:background={rank ? 'var(--acc)' : '#C44536'}
						style:color={rank ? 'var(--accfg)' : '#FFFFFF'}
						aria-label="Nível {m.nivel}">{m.nivel}</span
					>
					{#if i < marcos.length - 1}<span class="min-h-2.5 w-1 flex-1 bg-b3"></span>{/if}
				</div>
				<Icone id={icone(m.texto)} class="mt-2.5" />
				<div class="flex flex-col gap-1.5 pt-3.5 pb-3">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-[15px] leading-5 font-medium">{m.texto}</span>
						{#if rank}<span class="t-rotulo-sm bg-acc px-1.5 py-1 text-accfg">Limiar de rank · {rank}</span>{/if}
					</div>
					{#if js.length}
						<div class="flex flex-wrap gap-1.5">
							{#each js as j (j.slug)}
								<a href="/regras/jutsus/{j.slug}" class="chip bg-b2 text-fg hover:border-mut" data-sveltekit-noscroll>
									<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" alt="Rank {j.rank}" />{j.nome}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
{:else}
	<table class="w-full border-collapse border-2 border-frame text-[15px] leading-[22px]">
		<thead>
			<tr class="bg-vermelhao text-left font-pixel text-[13px] leading-[18px] font-bold tracking-[.06em] text-white">
				<th class="w-20 px-3 py-2.5">NÍVEL</th>
				<th class="px-3 py-2.5">GANHO AUTOMÁTICO</th>
			</tr>
		</thead>
		<tbody>
			{#each marcos as m, i (m.nivel)}
				<tr class={i % 2 ? 'bg-b2' : 'bg-b1'}>
					<td class="t-num px-3 py-2">{m.nivel}</td>
					<td class="px-3 py-2">{m.texto}{#if LIMIAR[m.nivel]}<span class="t-rotulo-sm ml-2 bg-acc px-1.5 py-0.5 text-accfg">Rank {LIMIAR[m.nivel]}</span>{/if}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
