<script lang="ts">
	// Kekkei Genkai na ficha completa: ATIVAR paga o custo da cena em PC e liga os bônus (Percepção, Defesa) até desativar;
	// CENA NOVA paga de novo. O Sharingan escolhe o estágio de tomoe (o despertar é narrativo). Ativa, a borda e o brilho
	// tomam a cor da linhagem.
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	let { f }: { f: FichaJogo } = $props();
	const k = $derived(f.kkg!);
	const cor = $derived(k.def.cor);
	const semDespertar = $derived(!!k.def.estagios && k.estagio < 1);
	const custoTexto = $derived(k.def.sempre ? 'Sempre ativa' : k.custo ? `${k.custo} PC por cena` : 'Sem custo');
</script>

<section
	class="painel-sombra flex flex-col transition-[border-color,box-shadow] duration-200"
	style:border-color={k.ligada ? cor : undefined}
	style:box-shadow={k.ligada ? `4px 4px 0 var(--ink), inset 0 0 0 1px ${cor}, inset 0 0 28px color-mix(in srgb, ${cor} 22%, transparent)` : undefined}
	aria-labelledby="kkg-titulo"
>
	<div class="flex items-center gap-2.5 border-b-2 border-b3 px-3.5 py-2.5">
		<Icone id={k.def.icone} />
		<div class="flex min-w-0 flex-1 flex-col">
			<h3 id="kkg-titulo" class="m-0 font-mincho text-lg leading-6 font-bold">{k.def.nome}</h3>
			<span class="text-xs leading-4 text-mut">Kekkei Genkai · {k.def.tipo}</span>
		</div>
		<span class="flex flex-col items-end gap-0.5">
			<span class="font-pixel text-xs leading-none font-bold whitespace-nowrap" style:color={k.ligada ? cor : undefined}>{k.ligada ? 'ATIVA' : semDespertar ? 'ADORMECIDA' : 'INATIVA'}</span>
			<span class="text-xs leading-4 whitespace-nowrap text-mut" title={k.reducao ? `Reduzido pelo marco ${k.reducao}` : undefined}>{custoTexto}{k.reducao ? ` · ${k.reducao}` : ''}</span>
		</span>
	</div>

	{#if k.def.estagios}
		<div class="flex flex-wrap items-center gap-2 border-b-2 border-b3 px-3.5 py-2.5">
			<span class="font-pixel text-xs leading-none font-bold tracking-[0.06em] text-mut">ESTÁGIO</span>
			<div class="flex border-2 border-frame" role="radiogroup" aria-label="Estágio do {k.def.nome}">
				{#each [0, ...k.def.estagios.map((_, i) => i + 1)] as n (n)}
					{@const on = k.estagio === n}
					<button
						type="button"
						role="radio"
						aria-checked={on}
						disabled={!f.editavel}
						class="flex min-h-9 items-center gap-1 border-r-2 border-frame px-2.5 text-xs font-semibold last:border-r-0 disabled:cursor-default {on ? 'text-white' : 'text-mut hover:text-fg'}"
						style:background={on ? (n ? cor : 'var(--b3)') : undefined}
						title={n ? k.def.estagios[n - 1].efeitos.join(' · ') : 'O despertar vem com um trauma: decisão do Mestre'}
						onclick={() => f.estagioKkg(n)}
					>
						{#if n}{#each { length: n } as _, i (i)}<span class="h-2 w-2 rounded-full border border-ink {on ? 'bg-ink' : 'bg-[#D8342C]'}" aria-hidden="true"></span>{/each}<span class="sr-only">{n} tomoe</span>{:else}Não despertou{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex flex-col gap-2 px-3.5 py-3">
		{#if !k.def.sempre}<span class="text-xs leading-4 font-semibold text-mut">{k.ligada ? 'Valendo agora:' : `Com o ${k.def.nome} ativo:`}</span>{/if}
		<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm leading-5 {k.ligada || k.def.sempre ? '' : 'text-mut'}">
			{#each k.efeito.textos as t (t)}
				<li class="flex gap-2"><span class="mt-[7px] h-1.5 w-1.5 flex-none" style:background={k.ligada ? cor : 'var(--b3)'} aria-hidden="true"></span>{t}</li>
			{/each}
		</ul>
	</div>

	{#if f.editavel && !k.def.sempre}
		<div class="flex flex-wrap items-center gap-2 border-t-2 border-b3 px-3.5 py-2.5">
			{#if k.ativa}
				<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" title="Numa cena nova, manter ativo custa de novo" disabled={f.atual.pc < k.custo} onclick={() => f.novaCenaKkg()}>CENA NOVA{k.custo ? ` · −${k.custo} PC` : ''}</button>
				<span class="flex-1"></span>
				<button type="button" class="btn-jogo btn-fantasma min-h-10 text-xs" onclick={() => f.desativarKkg()}>DESATIVAR</button>
			{:else}
				<span class="flex-1 text-xs leading-4 text-mut">{semDespertar ? 'Escolha o estágio quando o Sharingan despertar.' : f.atual.pc < k.custo ? `Faltam ${k.custo - f.atual.pc} PC.` : 'Paga o custo da cena e liga os bônus.'}</span>
				<button type="button" class="btn-jogo btn-primario com-icone min-h-10 text-xs" disabled={semDespertar || f.atual.pc < k.custo} onclick={() => f.ativarKkg()}><Icone id="recurso/ic-recurso-pc" />ATIVAR{k.custo ? ` · −${k.custo} PC` : ''}</button>
			{/if}
		</div>
	{/if}
</section>
