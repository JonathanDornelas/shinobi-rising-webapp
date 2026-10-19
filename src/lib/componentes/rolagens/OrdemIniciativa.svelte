<script lang="ts">
	// Ordem de iniciativa (L10): a última rolagem de iniciativa de cada personagem ou NPC na campanha, nas últimas horas.
	// LIMPAR começa uma ordem nova (fim do combate): valem só as rolagens de iniciativa feitas depois. Fica guardado neste
	// navegador, por campanha.
	import { onMount } from 'svelte';
	import { gravar, ler } from '#lib/estado/armazenamento.ts';
	import { ordemIniciativa } from '#lib/rolagens/registro.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import Icone from '../ui/Icone.svelte';

	/** recolhivel: no celular, a ordem fica num bloco que abre e fecha (o cabeçalho mostra quantos estão na ordem). */
	let { rolagens, campanha, nome, recolhivel = false }: { rolagens: Rolagem[]; campanha: string; nome: string; recolhivel?: boolean } = $props();

	const CHAVE = 'iniciativa-limpa';
	let limpas = $state<Record<string, string>>({});
	onMount(() => (limpas = ler<Record<string, string>>(CHAVE, {})));
	const limpaEm = $derived(limpas[campanha] ?? null);
	const ordem = $derived(ordemIniciativa(rolagens, campanha, 6, new Date(), limpaEm));
	/** Marca anterior, para desfazer a última limpeza (undefined = nada a desfazer). */
	let anterior = $state<{ campanha: string; valor: string | null } | undefined>(undefined);

	function definir(valor: string | null) {
		const n = { ...limpas };
		if (valor) n[campanha] = valor;
		else delete n[campanha];
		limpas = n;
		gravar(CHAVE, n);
	}
	function limpar() {
		anterior = { campanha, valor: limpaEm };
		definir(new Date().toISOString());
	}
	function desfazer() {
		if (!anterior || anterior.campanha !== campanha) return;
		definir(anterior.valor);
		anterior = undefined;
	}
	const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
</script>

{#snippet cabecalho()}
	<Icone id="recurso/ic-recurso-iniciativa" />
	<span class="flex min-w-0 flex-1 flex-col gap-1">
		<span class="font-pixel text-[13px] leading-none font-bold tracking-[0.1em] text-title">ORDEM DE INICIATIVA{recolhivel && ordem.length ? ` · ${ordem.length}` : ''}</span>
		<span class="truncate text-xs leading-none text-mut">{nome}</span>
	</span>
	{#if ordem.length}
		<button
			type="button"
			class="min-h-9 border-2 border-b3 px-2.5 font-pixel text-xs font-bold tracking-[0.06em] hover:border-mut"
			title="Fim do combate: começa uma ordem nova com as próximas rolagens de iniciativa"
			onclick={(e) => {
				e.preventDefault();
				limpar();
			}}>LIMPAR</button
		>
	{/if}
{/snippet}

{#snippet corpo()}
	<div aria-live="polite">
		{#each ordem as o, i (o.chave)}
			<div class="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2.5 border-b-2 border-b1 px-3.5 py-2" class:bg-b1={i % 2 === 1}>
				<span class="t-num text-sm text-mut">{i + 1}</span>
				<span class="truncate text-sm leading-5 font-semibold">{o.quem}</span>
				<span class="t-num text-lg leading-none">{o.total}</span>
			</div>
		{:else}
			<p class="m-0 px-3.5 py-3 text-[13px] leading-[18px] text-mut">
				{#if limpaEm}Ordem limpa às {hora(limpaEm)}. As próximas rolagens de iniciativa montam a nova.{:else}Ninguém rolou iniciativa nas últimas horas.{/if}
				{#if anterior && anterior.campanha === campanha}<button type="button" class="link ml-1 font-semibold" onclick={desfazer}>Desfazer</button>{/if}
			</p>
		{/each}
	</div>
	<div class="px-3.5 py-2.5 text-xs leading-[17px] text-mut">Montada a partir da última rolagem de iniciativa de cada um. Limpar vale para este navegador.</div>
{/snippet}

{#if recolhivel}
	<details class="group border-2 border-frame bg-b2" aria-label="Ordem de iniciativa">
		<summary class="flex cursor-pointer list-none items-center gap-1.5 py-1.5 pr-2 pl-2 group-open:border-b-2 group-open:border-b3 [&::-webkit-details-marker]:hidden">
			{@render cabecalho()}
			<span class="font-pixel text-sm text-mut group-open:rotate-180">▾</span>
		</summary>
		{@render corpo()}
	</details>
{:else}
	<section class="border-2 border-frame bg-b2 shadow-[4px_4px_0_var(--ink)]" aria-label="Ordem de iniciativa">
		<div class="flex items-center gap-1.5 border-b-2 border-b3 py-1.5 pr-2 pl-2">{@render cabecalho()}</div>
		{@render corpo()}
	</section>
{/if}
