<script lang="ts">
	// K2 · Passo 3 · Kekkei Genkai (Componente 2): tipo, combinação de elementos e a balança de PKG
	// (5 iniciais + limitações = benefícios). Clãs sem KKG mostram o que ganharam no lugar.
	import { BENEFICIOS_KKG, LIMITACOES_KKG, PKG_INICIAIS, TIPOS_KKG, type BeneficioKkg, type LimitacaoKkg } from '#lib/clas/dados.ts';
	import type { CriadorCla } from '#lib/clas/criador.svelte.ts';
	import { ELEMENTOS } from '#lib/personagem/dados.ts';
	import Alerta from '../ui/Alerta.svelte';
	import Campo from '../ui/Campo.svelte';
	import Icone from '../ui/Icone.svelte';

	let { c }: { c: CriadorCla } = $props();
	const d = $derived(c.dados);
	const k = $derived(c.dados.kekkei);
	const ro = $derived(!c.editavel);
	const bal = $derived(c.pkg);
	const estado = $derived(
		bal.saldo === 0
			? { titulo: 'Equilibrado', classe: 'bg-ok text-okfg', icone: 'status/ic-status-aprovado', nota: `${bal.beneficios} = ${PKG_INICIAIS} + ${bal.limitacoes}` }
			: bal.saldo > 0
				? { titulo: `Sobram ${bal.saldo} PKG · aviso`, classe: 'bg-warn text-warnfg', icone: 'callout/ic-callout-atencao', nota: 'Gaste em benefícios ou tire uma limitação' }
				: { titulo: `Faltam ${-bal.saldo} PKG · bloqueio`, classe: 'bg-err text-errfg', icone: 'status/ic-status-rejeitado', nota: 'Some limitações ou corte benefícios · cap. 8.4' }
	);
	const combina = $derived(k.beneficios.some((b) => b.id === 'combinacao'));

	function alternarBeneficio(id: BeneficioKkg) {
		if (ro) return;
		const i = k.beneficios.findIndex((b) => b.id === id);
		if (i >= 0) c.dados.kekkei.beneficios.splice(i, 1);
		else c.dados.kekkei.beneficios.push({ id, detalhe: '' });
	}
	function alternarLimitacao(id: LimitacaoKkg) {
		if (ro) return;
		const i = k.limitacoes.findIndex((b) => b.id === id);
		if (i >= 0) return void c.dados.kekkei.limitacoes.splice(i, 1);
		const exclui = LIMITACOES_KKG.find((x) => x.id === id && 'exclui' in x) as { exclui?: string } | undefined;
		if (exclui?.exclui) c.dados.kekkei.limitacoes = k.limitacoes.filter((b) => b.id !== exclui.exclui);
		c.dados.kekkei.limitacoes.push({ id, detalhe: '' });
	}
</script>

{#if !d.kkg}
	<div class="painel flex flex-col gap-2 p-4">
		<span class="flex items-center gap-2 text-[15px] font-semibold"><Icone id="status/ic-status-aprovado" />Este clã não tem Kekkei Genkai.</span>
		<span class="text-sm leading-[21px] text-mut">
			No lugar, ganhou {d.bonus.extraSemKkg === 'pb' ? '+1 PB no bônus hereditário (passo 2)' : '+1 jutsu hereditário extra, aprendido no nível 1 (passo 7)'}. A escolha de ter ou não KKG não muda depois de criado.
		</span>
	</div>
{:else}
	<Alerta tipo="aviso" titulo="Exige aprovação do Mestre." />
	<div class="grid gap-3 sm:grid-cols-2">
		<Campo id="kkg-nome" rotulo="Nome do KKG" obrigatorio>
			<input id="kkg-nome" class="campo" maxlength="40" placeholder="Shakuton" readonly={ro} bind:value={c.dados.kekkei.nome} />
		</Campo>
		<div class="flex flex-col gap-1.5">
			<span class="text-sm leading-5 font-semibold" id="kkg-comb">Combinação{combina ? '' : ' (só com o benefício de combinação)'}</span>
			<div class="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby="kkg-comb">
				{#each [0, 1] as i (i)}
					{#if i}<span class="font-pixel text-base font-bold">+</span>{/if}
					<select class="campo h-11 w-32 pr-7 text-sm" aria-label="Elemento {i + 1}" disabled={ro || !combina} bind:value={c.dados.kekkei.elementos[i]}>
						<option value={null}>Elemento…</option>
						{#each ELEMENTOS as e (e.id)}<option value={e.id}>{e.nome}</option>{/each}
					</select>
				{/each}
				<span class="font-pixel text-base font-bold">=</span>
				<input class="campo h-11 w-36 text-sm" aria-label="Nome do novo elemento" placeholder="Novo elemento" maxlength="30" readonly={ro} disabled={!combina} bind:value={c.dados.kekkei.elementoNovo} />
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-5" role="radiogroup" aria-label="Tipo de Kekkei Genkai">
		{#each TIPOS_KKG as t (t.id)}
			{@const on = k.tipo === t.id}
			<button
				type="button"
				role="radio"
				aria-checked={on}
				title="{t.descricao} · ex.: {t.exemplos}"
				disabled={ro}
				class="flex flex-col items-center gap-1 border-2 bg-b2 p-2 text-center {on ? 'border-vermelhao' : 'border-frame hover:border-mut'}"
				onclick={() => (c.dados.kekkei.tipo = t.id)}
			>
				<Icone id="kkg/ic-kkg-{t.id}" /><span class="text-xs leading-4 font-semibold">{t.nome}</span>
			</button>
		{/each}
	</div>

	<Campo id="kkg-descricao" rotulo="Como o KKG se manifesta">
		<textarea id="kkg-descricao" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="800" readonly={ro} bind:value={c.dados.kekkei.descricao}></textarea>
	</Campo>

	<div class="grid items-start gap-3 lg:grid-cols-2">
		{#each [{ titulo: 'BENEFÍCIOS', total: `−${bal.beneficios}`, lista: BENEFICIOS_KKG, escolhidos: k.beneficios, alternar: alternarBeneficio, sinal: '−' }, { titulo: `${PKG_INICIAIS} INICIAIS + LIMITAÇÕES`, total: String(bal.disponiveis), lista: LIMITACOES_KKG, escolhidos: k.limitacoes, alternar: alternarLimitacao, sinal: '+' }] as col (col.titulo)}
			<div class="border-2 border-frame bg-b2">
				<div class="flex border-b-2 border-b3 px-3 py-2.5">
					<span class="flex-1 font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">{col.titulo}</span>
					<span class="t-num text-[13px]">{col.total}</span>
				</div>
				{#each col.lista as item (item.id)}
					{@const sel = col.escolhidos.find((b) => b.id === item.id)}
					<div class="border-b-2 border-b3">
						<label class="flex min-h-10 cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm leading-5 font-medium" title={item.nota}>
							<input type="checkbox" class="caixa h-5 w-5" checked={!!sel} disabled={ro} onchange={() => col.alternar(item.id as never)} />
							<span class="flex flex-1 flex-col"><span>{item.nome}</span><span class="text-xs leading-4 text-mut">{item.nota}</span></span>
							<b class="t-num text-sm">{col.sinal}{item.pkg}</b>
						</label>
						{#if sel && 'detalhe' in item}
							<input
								class="campo mx-3 mb-2 h-9 w-[calc(100%-24px)] text-sm"
								aria-label="{item.nome}: {item.detalhe}"
								placeholder={item.detalhe}
								maxlength="60"
								readonly={ro}
								bind:value={sel.detalhe}
								aria-invalid={!sel.detalhe.trim() || undefined}
							/>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<div role="status" class="flex flex-wrap items-center gap-2.5 border-2 border-ink py-1 pr-3.5 pl-1.5 {estado.classe}">
		<Icone id={estado.icone} />
		<span class="text-[15px] leading-5 font-bold">{estado.titulo}</span>
		<span class="flex-1"></span>
		<span class="text-[13px] leading-[18px] font-medium">{estado.nota}</span>
	</div>
{/if}
