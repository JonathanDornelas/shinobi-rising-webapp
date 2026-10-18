<script lang="ts">
	// Card de clã (CMP-16).
	import type { ClaResumo } from '#lib/livro/tipos.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		cla: ClaResumo;
		/** Mostra a linha de bônus e o rodapé (versão completa do CMP-16). */
		completo?: boolean;
	}
	let { cla, completo = true }: Props = $props();
</script>

<a href="/regras/clas/{cla.slug}" class="painel-sombra cartao-link flex flex-col">
	<div class="flex items-center gap-3 border-b-2 border-b3 p-3">
		<div class="flex h-[72px] w-[72px] flex-none items-center justify-center border-2 border-b3 bg-b1">
			<Icone id="cla/ic-cla-{cla.slug}" tamanho={64} alt="Kamon do clã {cla.nome}" />
		</div>
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="font-mincho text-lg leading-6 font-bold">Clã {cla.nome}</span>
			<span class="text-[13px] leading-[18px] text-mut italic">{cla.epiteto}</span>
		</div>
	</div>
	<div class="flex flex-1 flex-col gap-2.5 px-3 py-2.5">
		<div class="flex flex-wrap gap-1.5">
			<span class="chip text-xs {cla.vila.icone ? '' : 'sem-icone'}">
				{#if cla.vila.icone}<Icone id={cla.vila.icone} />{/if}{cla.vila.nome}
			</span>
			{#if cla.kkg}
				<span class="chip border-[var(--vermelhao-lo)] bg-grena text-xs text-papel"><Icone id={cla.kkg.icone} />{cla.kkg.nome} · {cla.kkg.tipo}</span>
			{:else}
				<span class="chip sem-icone border-dashed text-xs text-mut">Sem KKG</span>
			{/if}
		</div>
		{#if completo}
			<span class="text-sm leading-[21px]">{cla.bonus.map((b) => b.texto).join(' · ')}</span>
			<span class="flex-1"></span>
			<span class="text-xs leading-4 text-mut">Clã oficial · cap. 8</span>
		{/if}
	</div>
</a>
