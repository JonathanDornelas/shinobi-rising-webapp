<script lang="ts">
	// O painel de rede do Mestre. Só mede enquanto está aberto: a sonda custa uma mensagem de cada pessoa a cada 5 s, e ninguém precisa dela o tempo todo.
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { emMs, textoDaRede, type ResumoDaRede } from '#lib/mesa/rede.ts';

	let { mesa, class: classe = '' }: { mesa: Mesa; class?: string } = $props();

	let resumo = $state<ResumoDaRede>();
	let copiado = $state(false);
	$effect(() => {
		const atualizar = () => (resumo = mesa.rede.resumo(Date.now()));
		mesa.medirRede(true);
		atualizar();
		const relogio = setInterval(atualizar, 1000);
		return () => {
			clearInterval(relogio);
			mesa.medirRede(false);
		};
	});

	const nome = (usuario: string) => mesa.membro(usuario)?.nome ?? 'Alguém';
	async function copiar() {
		if (!resumo) return;
		await navigator.clipboard.writeText(textoDaRede(resumo, nome));
		copiado = true;
		setTimeout(() => (copiado = false), 1800);
	}
</script>

{#snippet titulo(texto: string)}
	<span class="px-3 pt-2.5 pb-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">{texto}</span>
{/snippet}
{#snippet linha(rotulo: string, valor: string, dica: string)}
	<div class="flex items-baseline justify-between gap-4 px-3 py-0.5" title={dica}>
		<dt class="truncate text-[13px] leading-[18px] text-mut">{rotulo}</dt>
		<dd class="flex-none font-pixel text-xs leading-[18px] font-bold whitespace-nowrap tabular-nums">{valor}</dd>
	</div>
{/snippet}

<div role="dialog" aria-label="Rede da mesa" class={classe}>
	{#if resumo}
	{@render titulo('CANAL')}
	<dl>
		{@render linha('Até o servidor', emMs(resumo.servidor), 'Ida e volta até o servidor do tempo real. Chega um número novo a cada 25 s.')}
		{#each resumo.pessoas as p (p.usuario)}
			{@render linha(nome(p.usuario), emMs(p.ms), 'Ida e volta pelo canal até esta pessoa: o que ela faz leva metade disso para chegar aqui.')}
		{:else}
			<p class="px-3 py-0.5 text-[13px] leading-[18px] text-mut">Esperando resposta de quem está na mesa.</p>
		{/each}
	</dl>
	{@render titulo('BANCO')}
	<dl>
		{@render linha('Confirmação', emMs(resumo.confirmacao.mediana), 'Quanto o banco leva para confirmar o que o canal já mostrou. Metade das vezes é menos que isso.')}
		{@render linha('Nas piores vezes', emMs(resumo.confirmacao.p95), `95% das confirmações ficam abaixo disso. ${resumo.confirmacao.quantas} medidas até agora.`)}
	</dl>
	{@render titulo('ENVIO E PERDAS')}
	<dl>
		{@render linha('Mensagens por segundo', resumo.porSegundo.toFixed(1), 'O que esta tela manda. Cada mensagem conta uma vez para cada pessoa no limite do canal.')}
		{@render linha('Seguradas pelo teto', String(resumo.recusadas), 'Passaram do limite de 8 por segundo e chegaram pelo aviso do banco.')}
		{@render linha('Perdidas', String(resumo.perdidas), 'Mensagens que não chegaram aqui. Cada falta dispara uma releitura do banco.')}
		{@render linha('Fora de ordem', String(resumo.foraDeOrdem), 'Chegaram depois de uma mais nova e foram ignoradas.')}
		{@render linha('Releituras', String(resumo.releituras), 'Vezes que esta tela releu o banco porque faltou mensagem.')}
		{@render linha('Quedas da conexão', String(resumo.quedas), 'Vezes que o canal caiu e voltou.')}
	</dl>
	<div class="px-3 pt-2 pb-3">
		<button type="button" class="min-h-9 w-full border-2 border-b3 bg-b2 px-2 font-pixel text-xs font-bold" onclick={copiar}>{copiado ? 'COPIADO' : 'COPIAR NÚMEROS'}</button>
	</div>
	{/if}
</div>
