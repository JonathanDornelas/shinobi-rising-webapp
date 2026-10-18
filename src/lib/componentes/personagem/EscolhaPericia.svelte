<script lang="ts">
	// Escolha da perícia de um bônus "+1 em uma perícia à escolha" (vila, clã ou background).
	import { PERICIAS, type Pericia } from '#lib/personagem/dados.ts';

	interface Props {
		id: string;
		rotulo: string;
		valor: Pericia | null;
		opcoes?: Pericia[] | 'qualquer';
		desabilitado?: boolean;
		aoMudar: (p: Pericia | null) => void;
	}
	let { id, rotulo, valor, opcoes = 'qualquer', desabilitado = false, aoMudar }: Props = $props();
	const lista = $derived(opcoes === 'qualquer' ? PERICIAS : PERICIAS.filter((p) => opcoes.includes(p.id)));
</script>

<div class="flex flex-wrap items-center gap-2.5">
	<label for={id} class="text-sm leading-5 font-semibold">{rotulo}</label>
	<select
		{id}
		class="campo h-10 min-w-[200px] pr-8 text-[15px]"
		value={valor ?? ''}
		disabled={desabilitado}
		aria-invalid={!valor || undefined}
		style:border-color={!valor ? 'var(--warn)' : undefined}
		onchange={(e) => aoMudar((e.currentTarget.value || null) as Pericia | null)}
	>
		<option value="">Escolha a perícia…</option>
		{#each lista as p (p.id)}<option value={p.id}>{p.nome}</option>{/each}
	</select>
</div>
