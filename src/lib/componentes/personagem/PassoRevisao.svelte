<script lang="ts">
	// Passo 12 · Revisão: verificações (ok, aviso, bloqueio) com atalho para o passo, mensagem e o que depende de aprovação.
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import Icone from '../ui/Icone.svelte';

	interface Props {
		c: Criador;
		mensagem: string;
		/** Mestre revisando: a mensagem é só leitura. */
		leitura?: boolean;
	}
	let { c, mensagem = $bindable(), leitura = false }: Props = $props();

	const ESTILO = {
		ok: { rotulo: 'Ok', cor: 'var(--ok)', icone: 'status/ic-status-aprovado' },
		aviso: { rotulo: 'Aviso', cor: 'var(--warn)', icone: 'callout/ic-callout-atencao' },
		bloqueio: { rotulo: 'Bloqueio', cor: 'var(--err)', icone: 'status/ic-status-rejeitado' }
	} as const;
	const ordem = { bloqueio: 0, aviso: 1, ok: 2 };
	const lista = $derived([...c.analise.verificacoes].sort((a, b) => ordem[a.nivel] - ordem[b.nivel] || a.passo - b.passo));
</script>

<div class="grid items-start gap-4 lg:grid-cols-2">
	<section class="flex flex-col gap-2" aria-labelledby="rev-verif">
		<h2 id="rev-verif" class="t-rotulo m-0">Verificação</h2>
		{#each lista as v, i (i)}
			{@const e = ESTILO[v.nivel]}
			<div class="flex items-start gap-2 border-2 py-1 pr-2.5 pb-1.5 pl-1" style:border-color={e.cor} style:background="color-mix(in srgb, {e.cor} 10%, transparent)">
				<Icone id={e.icone} alt={e.rotulo} />
				<div class="flex flex-col gap-0.5 text-sm leading-5">
					<b>{e.rotulo} · {v.texto}</b>
					<span class="text-xs text-mut">{v.ref}</span>
					{#if v.nivel !== 'ok' && c.editavel}<button type="button" class="link self-start text-[13px] font-semibold" onclick={() => c.irPara(v.passo)}>Ir para o campo</button>{/if}
				</div>
			</div>
		{/each}
	</section>
	<section class="flex flex-col gap-2">
		<label for="rev-msg" class="t-rotulo">Mensagem para o Mestre</label>
		{#if leitura}
			<p class="m-0 min-h-[60px] border-2 border-field bg-b1 px-3 py-2.5 text-[15px] leading-[22px] whitespace-pre-line">{mensagem || 'Sem mensagem.'}</p>
		{:else}
			<textarea
				id="rev-msg"
				class="campo h-auto min-h-[110px] resize-y py-2.5 text-[15px] leading-[22px]"
				maxlength="2000"
				placeholder="Pensei na Hana como a estrategista do time. Se o Kage Mane Treinado for demais para o nível 1, posso trocar por Kunai."
				disabled={!c.editavel}
				bind:value={mensagem}
			></textarea>
		{/if}
		<span class="t-rotulo mt-2">Dependem de aprovação</span>
		<p class="m-0 text-sm leading-5 text-mut">
			{#if c.analise.dependencias.length}{c.analise.dependencias.join('; ')}, junto com a ficha.{:else if c.ctx.aprovacao.fichas}Nada além da ficha. Clã, jutsus e background vêm do livro.{:else}Esta campanha não exige aprovação de fichas: ao enviar, a ficha entra direto na mesa.{/if}
		</p>
	</section>
</div>
