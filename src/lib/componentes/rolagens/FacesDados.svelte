<script lang="ts" module>
	import type { TermoRolagem } from '#lib/supabase/banco.ts';

	export interface Face {
		v: number;
		lados: number;
		mantido: boolean;
	}
	/** Faces de cada dado sorteado; as descartadas (vantagem, kh/kl) ficam com mantido = false. */
	export function facesDe(detalhe: TermoRolagem[]): Face[] {
		const saida: Face[] = [];
		for (const t of detalhe) {
			if (!('lados' in t)) continue;
			const resta = [...t.usados];
			for (const v of t.valores) {
				const i = resta.indexOf(v);
				if (i >= 0) resta.splice(i, 1);
				saida.push({ v, lados: t.lados, mantido: i >= 0 });
			}
		}
		return saida;
	}
	/** Soma dos números da expressão ("+5", "−1"); vazio se não há. */
	export function modificadorDe(detalhe: TermoRolagem[]): string {
		const m = detalhe.reduce((s, t) => s + ('valor' in t ? t.sinal * t.valor : 0), 0);
		return m ? `${m > 0 ? '+' : '−'}${Math.abs(m)}` : '';
	}
</script>

<script lang="ts">
	// Faces dos dados de uma rolagem (L10): o d20 que caiu em 20 em dourado, em 1 em vermelho; descartadas riscadas.
	let { detalhe, tamanho = 28 }: { detalhe: TermoRolagem[]; tamanho?: 22 | 26 | 28 } = $props();
	const faces = $derived(facesDe(detalhe));
	const MAX = 12;
</script>

{#each faces.slice(0, MAX) as f, i (i)}
	{@const ouro = f.lados === 20 && f.mantido && f.v === 20}
	{@const falha = f.lados === 20 && f.mantido && f.v === 1}
	<span
		title="d{f.lados}: {f.v}{f.mantido ? '' : ' (descartado)'}"
		class="t-num inline-flex flex-none items-center justify-center border-2 bg-b1 px-1 leading-none {tamanho === 22 ? 'text-xs' : tamanho === 26 ? 'text-[13px]' : 'text-[15px]'}"
		style:min-width="{tamanho}px"
		style:height="{tamanho}px"
		style:border-color={ouro ? 'var(--acc)' : falha ? 'var(--err)' : 'var(--b3)'}
		style:color={ouro ? 'var(--title)' : falha ? 'var(--err)' : undefined}
		style:opacity={f.mantido ? undefined : '.45'}
		style:text-decoration={f.mantido ? undefined : 'line-through'}>{f.v}</span
	>
{/each}
{#if faces.length > MAX}<span class="t-num text-xs text-mut">+{faces.length - MAX}</span>{/if}
