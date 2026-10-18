<script lang="ts" module>
	/** O que o resumo da ficha guarda sobre o clã (src/lib/personagem/regras.ts, resumoFicha). */
	export interface ResumoClaFicha {
		cla?: string | null;
		claNome?: string | null;
		claBrasao?: { kamon: string; cor: string } | null;
	}
	const SEM_ICONE = ['sem', 'novo-sem-kkg', 'novo-com-kkg'];
	/** A ficha tem um clã com brasão (do catálogo ou criado)? */
	export const temIconeCla = (r: ResumoClaFicha | null | undefined) => !!r && ((!!r.cla && !SEM_ICONE.includes(r.cla)) || !!r.claBrasao);
	/** Nome do clã para textos ("Clã Nara", "Clã Kasai Joushou"). */
	export const nomeClaFicha = (r: ResumoClaFicha | null | undefined) =>
		r?.claNome ?? (r?.cla && !SEM_ICONE.includes(r.cla) ? r.cla.charAt(0).toUpperCase() + r.cla.slice(1) : null);
</script>

<script lang="ts">
	// Brasão do clã de uma ficha a partir do resumo: ícone oficial ou kamon tingido do clã criado.
	import Brasao from './Brasao.svelte';

	let { resumo, tamanho = 32, class: classe = '' }: { resumo: ResumoClaFicha | null | undefined; tamanho?: 32 | 64 | 96; class?: string } = $props();
	const oficial = $derived(resumo?.cla && !SEM_ICONE.includes(resumo.cla) ? resumo.cla : null);
</script>

{#if temIconeCla(resumo)}
	<Brasao slug={oficial} kamon={resumo?.claBrasao?.kamon} cor={resumo?.claBrasao?.cor} {tamanho} alt={nomeClaFicha(resumo) ? `Clã ${nomeClaFicha(resumo)}` : ''} class={classe} />
{/if}
