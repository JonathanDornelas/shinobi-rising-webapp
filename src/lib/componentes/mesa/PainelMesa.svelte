<script lang="ts">
	// L11 · M7 · Painel da Mesa: o chat de rolagem (o mesmo registro do L10, só desta campanha, ao vivo) com o rolador no
	// rodapé, e a aba de iniciativa, que é a mesma para todos na cena.
	import { ajustarDado, contarDados, erroExpressao } from '#lib/rolagens/expressoes.ts';
	import { ordemIniciativa } from '#lib/rolagens/registro.ts';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import { corCss } from '#lib/mesa/cores.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import { corElemento, temArte } from '#lib/mesa/hud.ts';
	import Icone from '../ui/Icone.svelte';

	let {
		mesa,
		ui,
		rolagens,
		comoQuem,
		celular = false,
		onRolar,
		onFechar
	}: {
		mesa: Mesa;
		ui: UiMesa;
		rolagens: Rolagem[];
		/** Em nome de quem sai a rolagem livre (a ficha do jogador, ou o NPC selecionado pelo Mestre). */
		comoQuem: { nome: string; personagem: string | null; npc: string | null };
		celular?: boolean;
		onRolar: (expr: string, oculta: boolean) => void;
		onFechar?: () => void;
	} = $props();

	const FILTROS = [
		['TODAS', null],
		['ATAQUES', ['ataque']],
		['DANO', ['dano', 'cura']],
		['TESTES', ['teste', 'save']],
		['INICIATIVA', ['iniciativa']]
	] as const;
	let filtro = $state<(typeof FILTROS)[number][0]>('TODAS');
	let expr = $state('1d20');
	let segredo = $state(false);
	const erro = $derived(expr.trim() ? erroExpressao(expr) : null);
	const lista = $derived.by(() => {
		const tipos = FILTROS.find((f) => f[0] === filtro)![1] as readonly string[] | null;
		return rolagens.filter((r) => !tipos || tipos.includes(r.tipo));
	});
	const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	const DADOS = [4, 6, 8, 10, 12, 20];

	function rolar() {
		if (!expr.trim() || erro) return;
		onRolar(expr, mesa.mestre && segredo);
	}
	function marcar(r: Rolagem) {
		const t = mesa.tokens.find((k) => (r.personagem_id && k.personagem_id === r.personagem_id) || (r.npc_id && k.npc_id === r.npc_id));
		if (!t) return;
		mesa.pulso = { token: t.id, t: Date.now() };
		mesa.enviar('pulso', { token: t.id }, true);
	}
	const corDoAutor = (r: Rolagem) => corCss(mesa.corDe(r.autor_id));
	const sigla = (n: string) => n.split(/\s+/).filter((w) => w.length > 1).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || n.slice(0, 2).toUpperCase();

	// iniciativa: a ordem salva na cena, ou a prévia das rolagens recentes
	const ordem = $derived(
		mesa.iniciativa.ativa && mesa.iniciativa.ordem?.length
			? mesa.iniciativa.ordem.map((o, i) => ({ nome: o.nome, valor: o.valor, vez: i === (mesa.iniciativa.vez ?? 0) }))
			: ordemIniciativa(rolagens, mesa.campanha, 6, new Date(), mesa.iniciativa.limpa_em ?? null).map((o) => ({ nome: o.quem, valor: o.total, vez: false }))
	);
	const btn = 'min-h-8 border-2 px-1.5 font-pixel text-[11px] leading-none font-bold';
</script>

<aside aria-label="Rolagens e iniciativa" class="flex min-h-0 flex-col bg-b2 {celular ? 'h-full' : 'w-[360px] flex-none border-l-2 border-b3'}">
	<div role="tablist" class="flex h-11 flex-none items-stretch border-b-2 border-b3 bg-b0">
		{#each [['rolagens', 'ROLAGENS'], ['iniciativa', 'INICIATIVA']] as const as [id, n] (id)}
			<button type="button" role="tab" aria-selected={ui.abaPainel === id} class="flex-1 font-pixel text-xs leading-none font-bold tracking-[0.08em] {ui.abaPainel === id ? 'bg-b2 text-title shadow-[inset_0_-3px_0_var(--vermelhao)]' : 'text-mut'}" onclick={() => (ui.abaPainel = id)}>{n}</button>
		{/each}
		<button type="button" class="w-10 border-l-2 border-b3 font-pixel text-sm" aria-label={celular ? 'Fechar' : 'Recolher painel'} title={celular ? 'Fechar' : 'Recolher'} onclick={() => (onFechar ? onFechar() : (ui.painelAberto = false))}>{celular ? '✕' : '»'}</button>
	</div>

	{#if ui.abaPainel === 'rolagens'}
		<div class="flex flex-none flex-wrap gap-1 border-b-2 border-b3 px-2.5 py-2">
			{#each FILTROS as [n] (n)}
				<button type="button" aria-pressed={filtro === n} class="{btn} {filtro === n ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3 text-fg'}" onclick={() => (filtro = n)}>{n}</button>
			{/each}
		</div>
		<div aria-live="polite" class="flex min-h-0 flex-1 flex-col gap-1.5 overflow-auto px-2.5 py-2">
			{#if !rolagens.length}
				<div class="flex flex-col items-center gap-2 border-2 border-dashed border-b3 px-3 py-6 text-center">
					<Icone id="dado/ic-dado-d20" tamanho={64} />
					<span class="text-sm leading-5 text-mut">Nenhuma rolagem nesta sessão. Os dados estão no rodapé.</span>
				</div>
			{:else if !lista.length}
				<span class="px-0.5 py-2 text-[13px] leading-[18px] text-mut">Nada com esse filtro.</span>
			{/if}
			{#each lista as r (r.id)}
				{@const crit = r.d20 === 20}
				{@const falha = r.d20 === 1}
				{@const el = r.tipo === 'dano' ? corElemento(null, r.rotulo) : null}
				<div class="border-2 bg-b1 {r.substituida ? 'opacity-60' : ''}" style="border-color: {crit ? 'var(--acc)' : falha ? 'var(--err)' : 'var(--b3)'}">
					<button type="button" class="grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 px-2 py-1.5 text-left" aria-label="{r.quem}: {r.rotulo}, total {r.total}" onclick={() => marcar(r)}>
						<span class="flex h-8 w-8 items-center justify-center border-2 font-pixel text-[11px] font-bold" style="border-color: {corDoAutor(r)}">{sigla(r.quem)}</span>
						<span class="flex min-w-0 flex-col gap-[3px]">
							<span class="font-mincho text-sm leading-[18px] font-bold">{r.quem}</span>
							<span class="text-[13px] leading-[17px] font-medium">{r.rotulo}</span>
							<span class="flex flex-wrap items-center gap-1">
								<span class="font-pixel text-xs leading-none font-bold text-mut">{r.expressao}</span>
								<!-- cada dado rolado como o próprio dado (HUD), com o número por cima; o dano na cor do elemento -->
								{#each r.detalhe as d, i (i)}
									{#if 'valores' in d}
										{#each d.valores as v, j (j)}
											{@const usado = d.usados.includes(v)}
											{@const cor = d.lados === 20 && v === 20 ? 'var(--acc)' : d.lados === 20 && v === 1 ? 'var(--err)' : r.tipo === 'cura' ? '#7FB069' : (el?.cor ?? '#fff')}
											{#if temArte(d.lados)}
												<span class="relative inline-flex h-7 w-7 items-center justify-center {usado ? '' : 'opacity-40'}" title="d{d.lados}: {v}{usado ? '' : ' (descartado)'}">
													<img src="/dados/d{d.lados}.png" width="28" height="28" alt="" class="absolute inset-0 [image-rendering:pixelated]" />
													<b class="relative font-pixel text-[13px] leading-none [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000] {usado ? '' : 'line-through'}" style:color={cor}>{v}</b>
												</span>
											{:else}
												<span class="inline-flex h-[22px] min-w-[22px] items-center justify-center border-2 px-[3px] font-pixel text-xs leading-none font-bold {usado ? '' : 'text-mut line-through'}" style="border-color: {!usado ? 'var(--b3)' : 'var(--field)'}">{v}</span>
											{/if}
										{/each}
									{/if}
								{/each}
								{#if el}<span class="text-xs leading-none font-semibold" style:color={el.cor}>{el.nome}</span>{/if}
							</span>
							{#if crit || falha || r.pd || r.oculta}
								<span class="flex flex-wrap gap-1">
									{#if crit}<span class="border-2 border-acc px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-acc">★ CRÍTICO</span>{/if}
									{#if falha}<span class="border-2 border-err px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-err">✖ FALHA CRÍTICA</span>{/if}
									{#if r.pd}<span class="border-2 border-warn px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-warn">PD GASTO</span>{/if}
									{#if r.oculta}<span class="border-2 border-mut px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-mut">SEGREDO</span>{/if}
								</span>
							{/if}
							{#if r.origem?.startsWith('Mesa · alvos:')}<span class="text-xs leading-4 text-mut">{r.origem.replace('Mesa · ', '')}</span>{/if}
						</span>
						<span class="flex flex-col items-end gap-1">
							<span class="t-num font-pixel text-2xl leading-none font-bold" style="color: {crit ? 'var(--acc)' : falha ? 'var(--err)' : 'var(--fg)'}">{r.total}</span>
							<span class="font-pixel text-xs leading-none font-semibold text-mut">{hora(r.criada_em)}</span>
						</span>
					</button>
					{#if r.autor_id === mesa.eu && r.d20 != null && !r.pd && !r.substituida && r.personagem_id}
						<div class="pr-2 pb-1.5 pl-12">
							<button type="button" class="min-h-7 border-2 border-warn px-1.5 font-pixel text-[11px] leading-none font-bold text-warn" onclick={() => rolador.usarPd(r, 'rerrolar')}>★ USAR PD · ROLAR DE NOVO</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<div class="flex flex-none flex-col gap-1.5 border-t-2 border-[var(--vermelhao-lo)] bg-b2 px-2.5 pt-2 pb-2.5">
			<span class="text-xs leading-none font-medium text-mut">Rolando como {comoQuem.nome}</span>
			{#if !celular}
				<div class="grid grid-cols-6 gap-[3px]">
					{#each DADOS as f (f)}
						{@const n = contarDados(expr, f)}
						<button
							type="button"
							class="relative flex flex-col items-center gap-px border-2 bg-b1 pt-0.5 pb-1 {n ? 'border-[var(--vermelhao)]' : 'border-b3'}"
							aria-label="Adicionar 1d{f}"
							title="Clique adiciona · botão direito tira"
							onclick={() => (expr = ajustarDado(expr, f, 1))}
							oncontextmenu={(e) => {
								e.preventDefault();
								expr = ajustarDado(expr, f, -1);
							}}
						>
							<img src="/dados/d{f}.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />
							<span class="font-pixel text-[11px] leading-none font-bold">d{f}</span>
							{#if n}<span aria-hidden="true" class="absolute -top-0.5 -right-0.5 bg-[var(--vermelhao)] px-[3px] py-0.5 font-pixel text-[11px] leading-none font-bold text-white">{n}</span>{/if}
						</button>
					{/each}
				</div>
			{/if}
			<div class="flex gap-1">
				<input
					bind:value={expr}
					onkeydown={(e) => e.key === 'Enter' && rolar()}
					aria-label="Expressão de dados"
					spellcheck="false"
					placeholder="1d20 + 3"
					class="h-10 min-w-0 flex-1 border-2 bg-b1 px-2.5 font-pixel text-base leading-none font-bold text-fg {erro ? 'border-err' : 'border-b3'}"
				/>
				<button type="button" class="btn-jogo btn-primario flex h-10 items-center gap-1 pr-2.5 pl-1" disabled={!!erro} onclick={rolar}><Icone id="dado/ic-dado-d20" />ROLAR</button>
			</div>
			{#if erro}<span role="alert" class="text-xs leading-4 font-semibold text-err">✖ {erro}</span>{/if}
			{#if !celular}
				<div class="flex items-center gap-1">
					{#each [['vantagem', 'VANTAGEM'], ['desvantagem', 'DESVANT.']] as const as [m, n] (m)}
						<button type="button" aria-pressed={rolador.modo === m} class="{btn} flex-1 {rolador.modo === m ? 'border-[var(--vermelhao)] bg-grena text-papel' : 'border-b3 text-fg'}" onclick={() => (rolador.modo = rolador.modo === m ? 'normal' : m)}>{n}</button>
					{/each}
					{#if mesa.mestre}
						<button type="button" role="checkbox" aria-checked={segredo} class="min-h-8 flex-[1.3] border-2 border-b3 text-xs font-semibold" onclick={() => (segredo = !segredo)}><span class="font-pixel text-xs font-bold text-[var(--vermelhao)]">{segredo ? '☒' : '☐'}</span> Rolar em segredo</button>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col overflow-auto">
			<div class="flex items-center gap-2 border-b-2 border-b3 px-3 py-2.5">
				<Icone id="recurso/ic-recurso-iniciativa" />
				<span class="text-sm leading-5 font-semibold">{mesa.iniciativa.ativa ? `Rodada ${mesa.iniciativa.rodada ?? 1} · ordem da cena` : mesa.iniciativa.limpa_em ? 'Prévia: iniciativas roladas depois da limpeza' : 'Prévia: iniciativas roladas nas últimas horas'}</span>
			</div>
			{#each ordem as o, i (i)}
				<div class="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2.5 border-b-2 border-b1 px-3 py-2.5 {o.vez ? 'bg-grena' : ''}">
					<span class="font-pixel text-sm leading-none font-bold {o.vez ? 'text-acc' : 'text-mut'}">{o.vez ? '▶' : i + 1}</span>
					<span class="flex items-center gap-2 text-sm leading-5 font-semibold">{o.nome}{#if o.vez}<span class="bg-acc px-1 py-0.5 font-pixel text-[11px] leading-none font-bold text-[var(--accfg)]">VEZ</span>{/if}</span>
					<span class="flex items-center gap-1">
						<span class="font-pixel text-lg leading-none font-bold">{o.valor}</span>
						{#if mesa.mestre && mesa.iniciativa.ativa && !mesa.somenteLeitura}
							<button type="button" class="h-7 w-7 border-2 border-b3 font-pixel text-xs font-bold disabled:opacity-40" aria-label="Subir {o.nome} na ordem" disabled={i === 0} onclick={() => mesa.moverNaOrdem(i, -1)}>▲</button>
							<button type="button" class="h-7 w-7 border-2 border-b3 font-pixel text-xs font-bold disabled:opacity-40" aria-label="Descer {o.nome} na ordem" disabled={i === ordem.length - 1} onclick={() => mesa.moverNaOrdem(i, 1)}>▼</button>
						{/if}
					</span>
				</div>
			{:else}
				<span class="px-3 py-3 text-[13px] leading-[18px] text-mut">Ninguém rolou iniciativa ainda. Cada um rola pela ficha rápida (Iniciativa).</span>
			{/each}
			<span class="px-3 py-2.5 text-xs leading-[17px] text-mut">A ordem sai das rolagens de iniciativa e é a mesma para todos na cena. O token da vez ganha o halo ouro e o contador de movimento dele zera.{mesa.mestre ? ' Durante o combate, ▲ e ▼ mudam a ordem; LIMPAR começa do zero.' : ''}</span>
			{#if mesa.mestre && !mesa.somenteLeitura}
				<div class="flex flex-wrap gap-1.5 px-3 pb-3">
					{#if mesa.iniciativa.ativa}
						<button type="button" class="btn-jogo btn-primario min-h-11 flex-1" onclick={() => mesa.proximoTurno()}>PRÓXIMO TURNO · N</button>
						<button type="button" class="btn-jogo min-h-11" onclick={() => mesa.encerrarCombate()}>ENCERRAR</button>
					{:else}
						<button type="button" class="btn-jogo btn-primario min-h-11 flex-1" onclick={() => mesa.comecarCombate(rolagens)}>COMEÇAR COMBATE</button>
					{/if}
					<button type="button" class="btn-jogo min-h-11" title="Apaga a ordem: valem só as iniciativas roladas daqui em diante" onclick={() => mesa.limparIniciativa()}>LIMPAR</button>
				</div>
			{/if}
		</div>
	{/if}
</aside>
