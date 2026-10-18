<script lang="ts">
	// K2 · Passo 11 · Revisão: verificações automáticas com atalho para o passo, e a mensagem para o Mestre.
	import { PASSOS_CLA } from '#lib/clas/dados.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import Campo from '../ui/Campo.svelte';
	import Icone from '../ui/Icone.svelte';

	let { c, irPara, leitura = false }: { c: CriadorCla; irPara: (p: number) => void; leitura?: boolean } = $props();
	const NIVEL = {
		ok: { rotulo: 'Ok', cor: 'var(--ok)', fundo: 'color-mix(in srgb, var(--ok) 10%, transparent)', icone: 'status/ic-status-aprovado' },
		aviso: { rotulo: 'Aviso', cor: 'var(--warn)', fundo: 'color-mix(in srgb, var(--warn) 10%, transparent)', icone: 'callout/ic-callout-atencao' },
		bloqueio: { rotulo: 'Bloqueio', cor: 'var(--err)', fundo: 'color-mix(in srgb, var(--err) 10%, transparent)', icone: 'status/ic-status-rejeitado' }
	} as const;
	const ordem = { bloqueio: 0, aviso: 1, ok: 2 } as const;
	const lista = $derived([...c.analise.verificacoes].sort((a, b) => ordem[a.nivel] - ordem[b.nivel] || a.passo - b.passo));
</script>

<ul class="m-0 flex list-none flex-col gap-2 p-0">
	{#each lista as v, i (i)}
		{@const n = NIVEL[v.nivel]}
		<li class="flex items-center gap-2 border-2 py-1 pr-3 pl-1" style:border-color={n.cor} style:background={n.fundo}>
			<Icone id={n.icone} alt={n.rotulo} />
			<span class="flex-1 text-sm leading-5 font-semibold">{n.rotulo} · {v.texto}</span>
			{#if v.nivel !== 'ok'}
				<button type="button" class="link text-[13px] font-semibold" onclick={() => irPara(v.passo)}>Ir para {PASSOS_CLA[v.passo].toLowerCase()}</button>
			{/if}
		</li>
	{/each}
</ul>

{#if !leitura}
	<Campo id="cla-mensagem" rotulo="Mensagem para o Mestre" ajuda="Opcional. Explique escolhas incomuns.">
		<textarea id="cla-mensagem" class="campo h-auto min-h-[88px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" bind:value={c.dados.mensagem}></textarea>
	</Campo>
{:else if c.dados.mensagem.trim()}
	<div class="painel flex flex-col gap-1 p-3.5 text-[15px] leading-[23px]"><span class="t-rotulo text-xs">Mensagem para o Mestre</span><span>“{c.dados.mensagem.trim()}”</span></div>
{/if}
