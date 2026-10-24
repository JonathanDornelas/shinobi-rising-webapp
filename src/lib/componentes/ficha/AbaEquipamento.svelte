<script lang="ts">
	// P3 · Equipamento: inventário por grupo, carga (cap. 11), ryo, comprar (debita) e adicionar (espólio, não debita).
	// Pergaminhos de armazenamento: selar (1 PC) tira o item da mochila e ele deixa de pesar; invocar (1 PC) devolve.
	import { numero } from '#lib/formatar.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { capacidadePergaminho, conteudoPergaminho, ehPergaminhoMestre, livrePergaminho, type ItemInventario } from '#lib/personagem/progressao.ts';
	import type { ItemLoja } from '#lib/personagem/regras.ts';
	import { corQualidade } from '#lib/equipamentos/dados.ts';
	import { somar } from '#lib/rolagens/expressoes.ts';
	import Icone from '../ui/Icone.svelte';
	import BotaoRolar from '../rolagens/BotaoRolar.svelte';
	import Modal from '../ui/Modal.svelte';

	let { f }: { f: FichaJogo } = $props();
	const GRUPOS = [
		{ id: 'Armas', icone: 'equip/ic-equip-arma-curta' },
		{ id: 'Itens', icone: 'equip/ic-equip-kit' },
		{ id: 'Pergaminhos', icone: 'equip/ic-equip-pergaminho' },
		{ id: 'Outros', icone: 'equip/ic-equip-ferramenta' }
	] as const;
	const max = $derived(f.calc.recursos.cargaMax);
	const sobra = $derived(f.carga - max);
	const peso = (i: { qtd: number; peso: number; conjunto?: number }) => (i.conjunto ? Math.ceil(i.qtd / i.conjunto) * 0.5 : i.peso * i.qtd);
	const fmt = (n: number) => String(n).replace('.', ',');
	/** Pergaminhos que guardam itens (as pilhas aparecem uma vez; um sai da pilha ao selar). */
	const pergaminhos = $derived(f.inventario.filter((i) => !i.selado && capacidadePergaminho(i) != null));

	let loja = $state<'comprar' | 'adicionar' | null>(null);
	let filtro = $state('');
	let qtds = $state<Record<string, number>>({});
	const itens = $derived((f.catalogo.loja as ItemLoja[]).filter((i) => i.nome.toLowerCase().includes(filtro.trim().toLowerCase())));
	let ryoDelta = $state<number | null>(null);

	// arma: só o dano (cap. 11/12; arma forjada já traz a qualidade no dano) e +1 com proficiência
	function danoArma(i: ItemInventario): string | null {
		const base = i.dano ?? (f.catalogo.loja as ItemLoja[]).find((x) => x.id === i.id || x.nome === i.nome)?.dano;
		const limpo = base?.replace(/\s+/g, '') ?? '';
		if (!/^\d+d\d+([+-]\d+)?$/.test(limpo)) return null;
		return f.calc.proficiencias.some((p) => p.tipo === 'arma' && p.alvo === i.nome) ? somarDano(limpo, 1) : limpo;
	}
	// soma no modificador que já existe (1d8+1 com +1 → 1d8+2)
	const somarDano = (e: string, n: number) => {
		const m = /^(\d+d\d+)([+-]\d+)?$/.exec(e)!;
		return somar(m[1], Number(m[2] ?? 0) + n);
	};
</script>

<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
	<div class="flex flex-col gap-3.5">
		{#each GRUPOS as g (g.id)}
			{@const lista = f.inventario.filter((i) => i.grupo === g.id && !i.selado)}
			{#if lista.length}
				<section class="painel-sombra" aria-label={g.id}>
					<div class="flex items-center gap-2 border-b-2 border-b3 px-3.5 py-2.5">
						<Icone id={g.icone} />
						<h3 class="t-rotulo m-0 flex-1">{g.id}</h3>
						<span class="font-pixel text-xs font-semibold text-mut">{fmt(lista.reduce((t, i) => t + peso(i), 0))} DE CARGA</span>
					</div>
					<ul class="m-0 list-none p-0">
						{#each lista as i (i.id)}
							{@const cap = capacidadePergaminho(i)}
							{@const destinos = pergaminhos.filter((p) => p.id !== i.id && livrePergaminho(f.inventario, p) >= peso(i))}
							<li class="grid grid-cols-[32px_minmax(0,1fr)_auto_56px] items-center gap-3 border-b-2 border-b3 px-3.5 py-1 last:border-b-0" style:box-shadow={corQualidade(i.qualidade) ? `inset 4px 0 0 ${corQualidade(i.qualidade)}` : undefined} title={i.qualidade && i.qualidade !== 'Comum' ? `Qualidade ${i.qualidade}` : undefined}>
								<Icone id={i.icone} />
								<span class="flex min-w-0 flex-col gap-0.5">
									<span class="text-sm leading-5 font-semibold">{i.nome}</span>
									{#if i.nota}<span class="text-xs leading-4 text-mut">{i.nota}</span>{/if}
								</span>
								<span class="flex items-center gap-1">
									{#if f.editavel && g.id === 'Armas'}
										{@const dano = danoArma(i)}
										{#if dano}<BotaoRolar class="mr-1 w-9" expressao={dano} rotulo="Dano · {i.nome}" personagem={f.id} tipo="dano" origem="Ficha · Equipamento" partes={f.calc.proficiencias.some((p) => p.tipo === 'arma' && p.alvo === i.nome) ? [['Proficiência', '+1']] : []} />{/if}
									{/if}
									{#if f.editavel}<button type="button" class="btn-icone h-8 w-8 font-pixel" aria-label="Usar ou descartar 1 {i.nome}" onclick={() => f.alterarQtd(i.id, -1)}>−</button>{/if}
									<span class="t-num w-9 text-center text-[15px]">×{i.qtd}</span>
									{#if f.editavel}<button type="button" class="btn-icone h-8 w-8 font-pixel" aria-label="Mais 1 {i.nome} (sem custo)" onclick={() => f.alterarQtd(i.id, 1)}>+</button>{/if}
								</span>
									<span class="text-right text-[13px] font-semibold text-mut">{fmt(peso(i))}</span>
									{#if cap != null}
										{@const dentro = conteudoPergaminho(f.inventario, i.id)}
										{@const usado = cap - livrePergaminho(f.inventario, i)}
										<div class="col-span-4 mb-1.5 ml-11 flex flex-col gap-1.5 border-l-2 border-b3 pl-3">
											<div class="flex items-center gap-2">
												<span class="font-pixel text-[11px] font-bold tracking-[0.06em] text-mut">GUARDA {fmt(usado)} / {cap}{i.qtd > 1 ? ' (CADA)' : ''}</span>
												<div class="relative h-2.5 flex-1 border-2 border-b3 bg-b1" aria-hidden="true"><div class="absolute inset-y-0 left-0 bg-info" style:width="{Math.min(100, (usado / cap) * 100)}%"></div></div>
											</div>
											{#each dentro as d (d.id)}
												<div class="flex items-center gap-2 text-[13px]">
													<Icone id={d.icone} />
													<span class="min-w-0 flex-1 truncate font-medium">{d.nome} <span class="text-mut">×{d.qtd} · {fmt(peso(d))}</span></span>
													{#if f.editavel}<button type="button" class="btn-jogo btn-contorno min-h-8 px-2 text-[11px]" title="{ehPergaminhoMestre(i) ? 'Ação primária' : 'Ação secundária'} e 1 PC" disabled={f.atual.pc < 1} onclick={() => f.invocar(d.id)}>INVOCAR · 1 PC</button>{/if}
												</div>
											{:else}
												<span class="text-xs text-mut">Vazio. Selar custa {ehPergaminhoMestre(i) ? 'uma ação completa' : '1 ação'} e 1 PC; invocar, {ehPergaminhoMestre(i) ? 'a ação primária' : 'a ação secundária'} e 1 PC.</span>
											{/each}
										</div>
									{/if}
									{#if f.editavel && pergaminhos.some((p) => p.id !== i.id) && !(cap != null && conteudoPergaminho(f.inventario, i.id).length)}
										<div class="col-span-4 mb-1.5 ml-11 flex items-center gap-2">
											<select
												class="campo h-8 w-auto max-w-full pr-7 text-xs"
												aria-label="Selar {i.nome} num pergaminho"
												disabled={!destinos.length || f.atual.pc < 1}
												value=""
												onchange={(e) => {
													const p = e.currentTarget.value;
													e.currentTarget.value = '';
													if (p) f.selar(i.id, p);
												}}
											>
												<option value="">{destinos.length ? (f.atual.pc < 1 ? 'Sem PC para selar' : 'Selar em… (1 PC)') : 'Não cabe em nenhum pergaminho'}</option>
												{#each destinos as p (p.id)}<option value={p.id}>{p.nome} · {fmt(livrePergaminho(f.inventario, p))} livre</option>{/each}
											</select>
										</div>
									{/if}
								</li>
						{/each}
					</ul>
				</section>
			{/if}
		{:else}
			<p class="text-sm text-mut">Inventário vazio.</p>
		{/each}
	</div>
	<div class="flex flex-col gap-3.5">
		<div class="painel-sombra flex flex-col gap-2.5 p-3.5">
			<div class="flex items-center gap-2">
				<Icone id="recurso/ic-recurso-carga" /><span class="t-rotulo flex-1">Carga</span>
				<span class="t-num text-lg" style:color={sobra > 0 ? 'var(--warn)' : undefined}>{fmt(f.carga)} / {max}</span>
			</div>
			<div class="relative h-4 border-2 border-ink bg-b3" aria-hidden="true">
				<div class="absolute inset-y-0 left-0" style:width="{Math.min(100, (f.carga / max) * 100)}%" style:background={sobra > 0 ? 'var(--warn)' : 'var(--fg)'}></div>
			</div>
			<span class="text-[13px] leading-[18px] text-mut">
				{#if sobra > 10}Imobilizado: mais de 10 acima do limite.{:else if sobra > 5}Sobrecarregado: −3 em testes físicos e não pode correr.{:else if sobra > 0}Sobrecarregado: −1 em testes físicos.{:else}10 + 2 por FOR positiva. Acima do limite: −1 em testes físicos (cap. 11).{/if}
			</span>
		</div>
		<div class="painel-sombra flex flex-wrap items-center gap-2.5 p-3.5">
			<Icone id="recurso/ic-recurso-ryo" /><span class="t-rotulo flex-1">Ryo</span><span class="t-num text-2xl">{numero(f.ryo)}</span>
			{#if f.editavel}
				<form
					class="flex w-full gap-1.5"
					onsubmit={(e) => {
						e.preventDefault();
						if (ryoDelta) f.ajustarRyo(ryoDelta);
						ryoDelta = null;
					}}
				>
					<input type="number" class="campo t-num h-10 min-w-0 flex-1 text-[15px]" placeholder="−500 ou 1000" aria-label="Ajuste de ryo" bind:value={ryoDelta} />
					<button type="submit" class="btn-jogo btn-contorno min-h-10 px-3 text-xs">AJUSTAR</button>
				</form>
			{/if}
		</div>
		{#if f.editavel}
			<div class="flex gap-2">
				<button type="button" class="btn-jogo btn-primario min-h-11 flex-1 text-[13px]" onclick={() => (loja = 'comprar')}>COMPRAR</button>
				<button type="button" class="btn-jogo btn-contorno min-h-11 flex-1 text-[13px]" onclick={() => (loja = 'adicionar')}>ADICIONAR</button>
			</div>
			<span class="text-xs leading-4 text-mut">Adicionar não debita ryo: use para espólio entregue pelo Mestre.</span>
		{/if}
	</div>
</div>

{#if loja}
	<Modal rotulo={loja === 'comprar' ? 'Comprar' : 'Adicionar ao inventário'} largura={640} aoFechar={() => (loja = null)}>
		<div class="flex items-center bg-grena py-3 pr-3 pl-5">
			<h2 class="m-0 flex-1 font-mincho text-[22px] leading-7 font-bold text-papel">{loja === 'comprar' ? `Comprar · ${numero(f.ryo)} ryo` : 'Adicionar ao inventário'}</h2>
			<button type="button" class="flex h-11 w-11 items-center justify-center text-papel" aria-label="Fechar" onclick={() => (loja = null)}>✕</button>
		</div>
		<div class="flex flex-col gap-2 p-4">
			<input class="campo h-10 text-[15px]" placeholder="Filtrar itens…" aria-label="Filtrar itens" bind:value={filtro} />
			<ul class="m-0 flex max-h-[60vh] list-none flex-col overflow-y-auto p-0">
				{#each itens as i (i.id)}
					{@const q = qtds[i.id] ?? 1}
					<li class="flex items-center gap-2 border-b-2 border-b3 py-1.5">
						<Icone id={i.icone} />
						<span class="flex min-w-0 flex-1 flex-col"><span class="text-sm font-medium">{i.nome}</span><span class="text-xs text-mut">{i.grupo} · {numero(i.preco)} ryo</span></span>
						<input type="number" min="1" max="99" class="campo t-num h-9 w-16 px-2 text-sm" aria-label="Quantidade de {i.nome}" value={q} oninput={(e) => (qtds[i.id] = Math.max(1, Number(e.currentTarget.value) || 1))} />
						<button
							type="button"
							class="btn-jogo min-h-9 px-2.5 text-xs {loja === 'comprar' && i.preco * q > f.ryo ? 'bg-b3 text-mut' : 'btn-primario'}"
							disabled={loja === 'comprar' && i.preco * q > f.ryo}
							onclick={() => f.receber(i, q, loja === 'comprar')}>{loja === 'comprar' ? numero(i.preco * q) : '+'}</button
						>
					</li>
				{/each}
			</ul>
		</div>
	</Modal>
{/if}
