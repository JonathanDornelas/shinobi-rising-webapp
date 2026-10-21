<script lang="ts">
	// Escada de estágios (como as idades de um dragão): todos os estágios do verbete numa tabela curta, do menor ao
	// maior, para o Mestre ver como o adversário escala. Cada linha leva à ficha separada daquele estágio, mais abaixo.
	import type { EstagioCriatura } from '#lib/livro/tipos.ts';

	let { estagios }: { estagios: EstagioCriatura[] } = $props();
</script>

<nav aria-label="Fichas deste verbete" class="sombra-painel border-2 border-frame bg-b1">
	<div class="flex items-center gap-2 border-b-[3px] border-[var(--vermelhao)] bg-b0 px-3 py-1.5">
		<span class="font-pixel text-[11px] leading-none font-bold tracking-[.16em] text-[#D9A82B]">FICHAS</span>
		<span class="text-[13px] leading-[18px] text-b0fg">{estagios.length} variações, da menor para a maior</span>
	</div>
	<table class="w-full border-collapse text-sm leading-5">
		<thead>
			<tr class="text-left text-mut">
				<th class="t-rotulo-sm px-3 py-1.5 font-bold">Ficha</th>
				<th class="t-rotulo-sm px-1.5 py-1.5 text-center font-bold">Ameaça</th>
				<th class="t-rotulo-sm px-1.5 py-1.5 text-center font-bold">PV</th>
				<th class="t-rotulo-sm px-1.5 py-1.5 text-center font-bold">Def.</th>
				<th class="t-rotulo-sm py-1.5 pr-3 pl-1.5 text-center font-bold">Ataque</th>
			</tr>
		</thead>
		<tbody>
			{#each estagios as e (e.slug)}
				<tr class="border-t border-b3 hover:bg-b2">
					<td class="px-3 py-1.5"><a href="#{e.slug}" class="link font-semibold">{e.nome}</a></td>
					<td class="t-num px-1.5 py-1.5 text-center font-bold">{e.ameacaRotulo}</td>
					<td class="t-num px-1.5 py-1.5 text-center">{e.combate.pv}{e.membros > 1 ? `×${e.membros}` : ''}</td>
					<td class="t-num px-1.5 py-1.5 text-center">{e.combate.defesa}</td>
					<td class="t-num py-1.5 pr-3 pl-1.5 text-center whitespace-nowrap">+{e.combate.ataques[0]?.acerto} · {e.combate.ataques[0]?.dano}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</nav>
