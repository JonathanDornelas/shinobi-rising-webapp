<script lang="ts">
	// K2 · Passo 5 · Marcos por nível (Componente 4): as 20 linhas do Esqueleto Padrão. As fixas vêm prontas; nas de
	// escolha, o jogador decide entre jutsu, +3 PT, Criar Jutsu do Clã ou habilidade, respeitando o rank do nível.
	import { ESQUELETO, NOME_OPCAO_MARCO, type OpcaoMarco } from '#lib/clas/dados.ts';
	import { cartasPara } from '#lib/clas/regras.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';

	let { c, irPara }: { c: CriadorCla; irPara: (p: number) => void } = $props();
	const d = $derived(c.dados);
	const ro = $derived(!c.editavel);
	const completos = $derived(c.marcos.filter((m) => m.completo).length);

	function escolherOpcao(nivel: number, opcao: OpcaoMarco) {
		const atual = d.marcos[nivel];
		c.dados.marcos[nivel] = { opcao, carta: atual?.opcao === opcao ? atual.carta : null };
	}
	function escolherCarta(nivel: number, opcao: OpcaoMarco, carta: string) {
		c.dados.marcos[nivel] = { opcao, carta: carta || null };
	}
</script>

<div class="flex items-center gap-3">
	<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">ESQUELETO PADRÃO</span>
	<div class="h-3 flex-1 border-2 border-ink bg-b3" role="progressbar" aria-valuemin={0} aria-valuemax={20} aria-valuenow={completos} aria-label="Marcos completos">
		<div class="h-full bg-acc" style:width="{(completos / 20) * 100}%"></div>
	</div>
	<span class="t-num text-sm">{completos} / 20 MARCOS</span>
</div>

<ol class="m-0 list-none border-2 border-frame bg-b2 p-0">
	{#each c.marcos as m, i (m.nivel)}
		{@const e = ESQUELETO[i]}
		{@const escolha = d.marcos[m.nivel]}
		{@const opcao = escolha?.opcao ?? (e.opcoes?.length === 1 ? e.opcoes[0] : null)}
		<li class="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3 border-b-2 border-b3 px-3 py-1.5 md:grid-cols-[44px_minmax(0,1fr)_minmax(0,300px)]" style:background={i % 2 ? 'var(--b1)' : 'var(--b2)'}>
			<span class="t-num mt-0.5 flex h-9 w-9 items-center justify-center border-2 border-ink text-[15px] {m.tipo === 'fixo' ? 'bg-b3 text-mut' : 'bg-vermelhao text-white'}">{m.nivel}</span>
			<span class="flex min-w-0 flex-col pt-1.5">
				<span class="text-sm leading-5 font-medium">{m.tipo === 'fixo' || m.nivel === 1 ? m.texto : e.texto}</span>
				{#if m.problema}<span class="text-xs leading-4 font-semibold text-warn">{m.problema}</span>{/if}
			</span>
			<span class="col-span-2 flex flex-col items-stretch gap-1.5 md:col-span-1 md:items-end md:pt-0.5">
				{#if m.nivel === 1}
					<button type="button" class="link self-start text-[13px] font-semibold md:self-end" onclick={() => irPara(3)}>{m.completo ? '✓ válido · trocar no passo 4' : 'Escolher no passo 4'}</button>
				{:else if m.tipo === 'fixo'}
					<span class="text-xs leading-4 font-semibold text-mut md:pt-2">linha fixa</span>
				{:else}
					{#if (e.opcoes?.length ?? 0) > 1}
						<div class="flex flex-wrap gap-1 md:justify-end" role="radiogroup" aria-label="Ganho do nível {m.nivel}">
							{#each e.opcoes! as o (o)}
								<button type="button" role="radio" aria-checked={opcao === o} disabled={ro} class="border-2 px-2 py-1 text-xs font-semibold {opcao === o ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" onclick={() => escolherOpcao(m.nivel, o)}>{NOME_OPCAO_MARCO[o]}</button>
							{/each}
						</div>
					{/if}
					{#if opcao === 'jutsu' || opcao === 'habilidade'}
						{@const lista = cartasPara(d, opcao, e.rank)}
						<select class="campo h-9 w-full pr-8 text-sm md:max-w-[300px]" aria-label="{opcao === 'jutsu' ? 'Jutsu' : 'Habilidade'} do nível {m.nivel}" disabled={ro} value={escolha?.carta ?? ''} onchange={(ev) => escolherCarta(m.nivel, opcao, ev.currentTarget.value)} style:border-color={m.completo ? undefined : 'var(--warn)'}>
							<option value="">{lista.length ? (opcao === 'jutsu' ? `Jutsu até Rank ${e.rank}…` : 'Habilidade…') : opcao === 'jutsu' ? `Nenhum jutsu até Rank ${e.rank}` : 'Nenhuma habilidade'}</option>
							{#each lista as x (x.id)}<option value={x.id}>{x.rank ? `Rank ${x.rank} · ` : ''}{x.nome}</option>{/each}
						</select>
						{#if !lista.length}<button type="button" class="link self-start text-xs font-semibold md:self-end" onclick={() => irPara(6)}>Criar no passo 7</button>{/if}
					{:else if opcao === 'criar'}
						<span class="text-xs leading-4 text-mut md:text-right">O personagem cria um jutsu do clã até Rank {e.rank} ao chegar aqui (cap. 20).</span>
					{:else if opcao === 'pt'}
						<span class="text-xs leading-4 text-mut md:pt-2">+3 PT ao alcançar o nível</span>
					{/if}
				{/if}
			</span>
		</li>
	{/each}
</ol>
<span class="text-[13px] leading-[18px] text-mut">Ranks respeitam o nível mínimo: B a partir do 6, A a partir do 11, S no 20 (criado pelo personagem).</span>
