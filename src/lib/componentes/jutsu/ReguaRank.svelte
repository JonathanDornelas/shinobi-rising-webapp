<script lang="ts">
	// Régua de rank: as faixas de PJ do cap. 20 (E 1–2 … S 31+) com o marcador no total atual.
	import { RANKS } from '#lib/jutsus/dados.ts';

	let { pj }: { pj: number } = $props();
	// larguras proporcionais às faixas, com S limitado a 6 para caber
	const LARGURA = [2, 3, 5, 8, 12, 6];
	const total = LARGURA.reduce((a, b) => a + b, 0);
	const posicao = $derived.by(() => {
		let acc = 0;
		for (const [i, r] of RANKS.entries()) {
			if (pj <= r.ate) {
				const fim = Math.min(r.ate, r.de + LARGURA[i] - 1);
				return ((acc + Math.min(1, (pj - r.de + 0.5) / (fim - r.de + 1)) * LARGURA[i]) / total) * 100;
			}
			acc += LARGURA[i];
		}
		return 100;
	});
	const atual = $derived(RANKS.find((r) => pj >= r.de && pj <= r.ate)?.rank);
</script>

<div class="relative pt-3" role="img" aria-label="Régua de rank: {pj} PJ, Rank {atual}">
	<div class="flex border-2 border-ink">
		{#each RANKS as r, i (r.rank)}
			{@const on = r.rank === atual}
			<div class="flex h-9 flex-col items-center justify-center gap-0.5 border-r-2 border-ink last:border-r-0 {on ? 'bg-vermelhao text-white' : 'bg-b3 text-mut'}" style:flex="{LARGURA[i]} 1 0">
				<span class="t-num text-[13px]">{r.rank}</span>
				<span class="font-pixel text-[11px] leading-none">{r.rank === 'S' ? '31+' : `${r.de}–${r.ate}`}</span>
			</div>
		{/each}
	</div>
	<div class="absolute top-0 -bottom-1.5 w-1 bg-fg" style:left="calc({posicao}% - 2px)"></div>
</div>
