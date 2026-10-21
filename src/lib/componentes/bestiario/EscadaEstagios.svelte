<script lang="ts">
	// Escada de estágios (como as idades de um dragão): todos os estágios do verbete numa tabela curta, do menor ao
	// maior, para o Mestre ver como o adversário escala. Cada linha é um botão que troca o quadro de combate.
	import type { EstagioCriatura } from '#lib/livro/tipos.ts';

	let { estagios, ativo = $bindable(0) }: { estagios: EstagioCriatura[]; ativo?: number } = $props();
</script>

<div class="sombra-painel border-2 border-frame bg-b1">
	<div class="flex items-center gap-2 border-b-[3px] border-[var(--vermelhao)] bg-b0 px-3 py-1.5">
		<span class="font-pixel text-[11px] leading-none font-bold tracking-[.16em] text-[#D9A82B]">ESTÁGIOS</span>
		<span class="text-[13px] leading-[18px] text-b0fg">escolha um para ver a ficha</span>
	</div>
	<table class="w-full border-collapse text-sm leading-5">
		<thead>
			<tr class="text-left text-mut">
				<th class="t-rotulo-sm px-3 py-1.5 font-bold">Estágio</th>
				<th class="t-rotulo-sm px-1.5 py-1.5 text-center font-bold">Ameaça</th>
				<th class="t-rotulo-sm px-1.5 py-1.5 text-center font-bold">PV</th>
				<th class="t-rotulo-sm px-1.5 py-1.5 text-center font-bold">Def.</th>
				<th class="t-rotulo-sm py-1.5 pr-3 pl-1.5 text-center font-bold">Ataque</th>
			</tr>
		</thead>
		<tbody>
			{#each estagios as e, i (e.nome)}
				<tr class="cursor-pointer border-t border-b3 {i === ativo ? 'bg-grena text-papel' : 'hover:bg-b2'}" onclick={() => (ativo = i)}>
					<td class="px-3 py-1.5">
						<button type="button" class="text-left font-semibold" aria-pressed={i === ativo} onclick={(ev) => (ev.stopPropagation(), (ativo = i))}>{e.nome}</button>
					</td>
					<td class="t-num px-1.5 py-1.5 text-center font-bold">{e.ameacaRotulo}</td>
					<td class="t-num px-1.5 py-1.5 text-center">{e.combate.pv}{e.membros > 1 ? `×${e.membros}` : ''}</td>
					<td class="t-num px-1.5 py-1.5 text-center">{e.combate.defesa}</td>
					<td class="t-num py-1.5 pr-3 pl-1.5 text-center whitespace-nowrap">+{e.combate.ataques[0]?.acerto} · {e.combate.ataques[0]?.dano}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
