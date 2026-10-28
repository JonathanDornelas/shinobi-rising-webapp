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
	// Faces dos dados de uma rolagem (L10), no visual do HUD: a arte do dado com o número por cima e o dano na cor do
	// elemento; o d20 que caiu em 20 em dourado, em 1 em vermelho; as descartadas apagadas e riscadas.
	import { temArte } from '#lib/mesa/hud.ts';

	let { detalhe, tamanho = 28, cor = null }: { detalhe: TermoRolagem[]; tamanho?: 22 | 26 | 28; cor?: string | null } = $props();
	const faces = $derived(facesDe(detalhe));
	const MAX = 12;
	const fonte = $derived(tamanho === 22 ? 'text-xs' : tamanho === 26 ? 'text-[13px]' : 'text-[15px]');
</script>

{#each faces.slice(0, MAX) as f, i (i)}
	{@const ouro = f.lados === 20 && f.mantido && f.v === 20}
	{@const falha = f.lados === 20 && f.mantido && f.v === 1}
	{#if temArte(f.lados)}
		<span title="d{f.lados}: {f.v}{f.mantido ? '' : ' (descartado)'}" class="relative inline-flex flex-none items-center justify-center" style:width="{tamanho}px" style:height="{tamanho}px" style:opacity={f.mantido ? undefined : '.4'}>
			<img src="/dados/d{f.lados}.png" width={tamanho} height={tamanho} alt="" class="absolute inset-0 [image-rendering:pixelated]" style:filter={ouro ? 'drop-shadow(0 0 3px var(--acc))' : undefined} />
			<b class="t-num relative leading-none {fonte} [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]" style:color={ouro ? 'var(--acc)' : falha ? 'var(--err)' : (cor ?? '#fff')} style:text-decoration={f.mantido ? undefined : 'line-through'}>{f.v}</b>
		</span>
	{:else}
		<span
			title="d{f.lados}: {f.v}{f.mantido ? '' : ' (descartado)'}"
			class="t-num inline-flex flex-none items-center justify-center border-2 bg-b1 px-1 leading-none {fonte}"
			style:min-width="{tamanho}px"
			style:height="{tamanho}px"
			style:border-color={ouro ? 'var(--acc)' : falha ? 'var(--err)' : 'var(--b3)'}
			style:color={cor ?? undefined}
			style:opacity={f.mantido ? undefined : '.45'}
			style:text-decoration={f.mantido ? undefined : 'line-through'}>{f.v}</span
		>
	{/if}
{/each}
{#if faces.length > MAX}<span class="t-num text-xs text-mut">+{faces.length - MAX}</span>{/if}
