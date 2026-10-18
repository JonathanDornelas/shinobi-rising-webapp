<script lang="ts">
	// Lista de componentes com PJ (efeitos, apoio, modificadores): liga/desliga, quantidade ou valor escolhido.
	import type { Componente } from '#lib/jutsus/dados.ts';
	import type { CriadorJutsu } from '#lib/jutsus/criador.svelte.ts';
	import { pjDoComponente } from '#lib/jutsus/regras.ts';

	let { c, titulo, itens }: { c: CriadorJutsu; titulo: string; itens: Componente[] } = $props();
	const ro = $derived(!c.editavel);
	const sinal = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
	const valor = (id: string) => c.dados.componentes[id] ?? 0;
	const bloqueado = (x: Componente) => (x.requer && !valor(x.requer) ? `Exige: ${itens.find((i) => i.id === x.requer)?.nome ?? x.requer}` : '');
</script>

<div class="flex flex-col gap-2">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.08em] text-mut">{titulo}</span>
	<div class="grid gap-1.5 md:grid-cols-2">
		{#each itens as x (x.id)}
			{@const v = valor(x.id)}
			{@const motivo = bloqueado(x)}
			<div class="flex min-h-10 items-center gap-2.5 border-2 bg-b1 px-2.5 py-1 {v ? 'border-vermelhao' : 'border-b3'}" title={motivo || undefined}>
				{#if x.tipo === 'liga'}
					<label class="flex flex-1 cursor-pointer items-center gap-2.5 text-sm leading-[18px] font-medium" class:opacity-50={!!motivo && !v}>
						<input type="checkbox" class="caixa h-5 w-5" checked={!!v} disabled={ro || (!!motivo && !v)} onchange={(e) => c.definir(x.id, e.currentTarget.checked ? 1 : 0)} />
						<span class="flex-1">{x.nome}</span>
					</label>
					<b class="t-num text-[13px]">{sinal(x.pj)}</b>
				{:else if x.tipo === 'qtd'}
					<span class="flex-1 text-sm leading-[18px] font-medium">{x.nome}<span class="text-xs text-mut"> · por {x.unidade}</span></span>
					<span class="flex items-center gap-1">
						<button type="button" class="h-8 w-8 border-2 border-b3 bg-b2 font-pixel font-bold disabled:text-b3" aria-label="Menos {x.nome}" disabled={ro || !v} onclick={() => c.definir(x.id, v - 1)}>−</button>
						<span class="t-num w-5 text-center" aria-live="polite">{v}</span>
						<button type="button" class="h-8 w-8 border-2 border-b3 bg-b2 font-pixel font-bold disabled:text-b3" aria-label="Mais {x.nome}" disabled={ro || v >= (x.max ?? 99)} onclick={() => c.definir(x.id, v + 1)}>+</button>
					</span>
					<b class="t-num w-8 text-right text-[13px]">{sinal(pjDoComponente(x, v) || x.pj)}</b>
				{:else}
					<span class="flex-1 text-sm leading-[18px] font-medium">{x.nome}</span>
					<select class="campo h-8 w-[86px] pr-6 text-sm" aria-label={x.nome} disabled={ro} value={String(v)} onchange={(e) => c.definir(x.id, Number(e.currentTarget.value))}>
						<option value="0">Não</option>
						{#each x.opcoes ?? [] as o (o)}<option value={String(o)}>{sinal(o)} PJ</option>{/each}
					</select>
				{/if}
			</div>
		{/each}
	</div>
</div>
