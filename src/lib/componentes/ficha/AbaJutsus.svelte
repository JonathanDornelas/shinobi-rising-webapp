<script lang="ts">
	// P3 · Jutsus conhecidos com o custo real (reduções do cap. 9) e GASTAR, que debita PC/PE com Desfazer.
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import type { TipoJutsu } from '#lib/livro/tipos.ts';
	import type { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import { page } from '$app/state';
	import { NIVEIS_PROFICIENCIA } from '#lib/personagem/dados.ts';
	import type { JutsuFicha } from '#lib/personagem/progressao.ts';
	import { linhasPericia } from '#lib/personagem/regras.ts';
	import { curaDoEfeito, danoDoEfeito, periciaDoAtaque, somar, teste, totalPericia } from '#lib/rolagens/expressoes.ts';
	import Icone from '../ui/Icone.svelte';
	import BotaoRolar from '../rolagens/BotaoRolar.svelte';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';

	let { f }: { f: FichaJogo } = $props();
	const lista = $derived(f.calc.jutsus.map((s) => f.catalogo.jutsus.find((j) => j.slug === s)).filter((j) => !!j));
	const tipos = $derived([...new Set(lista.map((j) => j!.tipo))]);
	let filtro = $state('Todos');
	let aberto = $state<string | null>(null);
	const visiveis = $derived(lista.filter((j) => filtro === 'Todos' || j!.tipo === filtro || filtro === `Rank ${j!.rank}`));
	const ctrFino = $derived(f.calc.atributos.CTR >= 3);
	const exausto = $derived(f.atual.fadiga >= 2);
	const esgotado = $derived(f.atual.fadiga >= 3);
	const linhas = $derived(linhasPericia(f.dados));

	// rolagens do jutsu: ataque (1d20 + perícia do tipo + proficiência, cap. 4 e 9) e dano/cura lidos do efeito
	function rolagens(j: JutsuFicha) {
		const pericia = periciaDoAtaque(j.info);
		const base = pericia ? totalPericia(linhas, pericia) : null;
		const prof = f.calc.proficiencias.find((p) => p.tipo === 'jutsu' && p.alvo === j.slug);
		const bonusProf = prof ? NIVEIS_PROFICIENCIA[prof.nivel - 1].bonus : 0;
		// jutsu criado: os dados vêm do criador; do livro: lidos do texto do efeito
		const dano = j.rolagem ? (j.rolagem.modo === 'dano' ? j.rolagem : null) : danoDoEfeito(j.efeito);
		const atributo = dano?.atributo as keyof typeof f.calc.atributos | null | undefined;
		return {
			ataque: base === null ? null : { expr: teste(base + bonusProf), rotulo: `${j.nome} · ataque (${pericia}${bonusProf ? ` + ${bonusProf} prof.` : ''})` },
			dano: dano ? { expr: somar(dano.dados, atributo ? f.calc.atributos[atributo] : 0), rotulo: `${j.nome} · dano${atributo ? ` (${dano.dados} + ${atributo})` : ''}` } : null,
			cura: j.rolagem ? (j.rolagem.modo === 'cura' ? j.rolagem.dados : null) : curaDoEfeito(j.efeito)
		};
	}

	// usar o jutsu: debita PC/PE e já rola o ataque e o dano (ou a cura)
	async function usar(j: JutsuFicha) {
		f.gastarJutsu(j);
		const r = rolagens(j);
		const campanha = page.params.id!;
		if (r.ataque) await rolador.rolar({ campanha, expressao: r.ataque.expr, rotulo: r.ataque.rotulo, personagem: f.id, d20: true });
		if (r.dano) await rolador.rolar({ campanha, expressao: r.dano.expr, rotulo: r.dano.rotulo, personagem: f.id });
		else if (r.cura) await rolador.rolar({ campanha, expressao: r.cura, rotulo: `${j.nome} · cura`, personagem: f.id });
	}
</script>

<div class="flex flex-wrap items-center gap-2.5">
	{#each ['Todos', ...tipos, 'Rank E'] as n (n)}
		<button type="button" class="min-h-10 border-2 px-3 text-[13px] font-semibold {filtro === n ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" aria-pressed={filtro === n} onclick={() => (filtro = n)}>{n}</button>
	{/each}
	<span class="flex-1"></span>
	{#if f.editavel && page.data.completa?.dono}
		<form method="POST" action="/campanhas/{page.params.id}/jutsus?/criar">
			<input type="hidden" name="personagem" value={f.id} />
			<input type="hidden" name="volta" value={page.url.pathname} />
			<button type="submit" class="btn-jogo btn-contorno com-icone min-h-10 text-xs" title="Criar um jutsu original para esta ficha (cap. 20); depois de aprovado, aprende no treino"><Icone id="acao/ic-acao-criar-jutsu" />CRIAR JUTSU</button>
		</form>
	{/if}
	{#if f.calc.especializacoes.some((e) => e.id === 'controle-chakra')}
		<span class="flex items-center gap-1.5 text-[13px] leading-[18px] text-mut"><Icone id="esp/ic-esp-controle-chakra" />Reduções de especialização aplicadas</span>
	{/if}
</div>

<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
	{#each visiveis as j (j!.slug)}
		{@const t = TIPO_JUTSU[j!.tipo as TipoJutsu] ?? TIPO_JUTSU.Ninjutsu}
		{@const c = f.custo(j!)}
		{@const k = c.unidade === 'PE' ? 'pe' : 'pc'}
		{@const falta = c.final - f.atual[k]}
		{@const bloqueadoRank = esgotado && ['B', 'A', 'S'].includes(j!.rank)}
		{@const aberta = aberto === j!.slug}
		<li class="border-2 bg-b2 sombra-painel" style:border-color={aberta ? 'var(--mut)' : 'var(--frame)'}>
			<div class="grid grid-cols-[4px_32px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2 pr-3 md:grid-cols-[4px_32px_minmax(0,1fr)_auto_120px_130px]">
				<div class="-my-2 self-stretch max-md:row-span-2" style:background={t.cor}></div>
				<Icone id="rank/ic-rank-{j!.rank.toLowerCase()}" alt="Rank {j!.rank}" />
				<button type="button" class="flex min-w-0 flex-col gap-0.5 text-left text-fg" aria-expanded={aberta} onclick={() => (aberto = aberta ? null : j!.slug)}>
					<span class="font-mincho text-[17px] leading-[22px] font-bold">{j!.nome} <span class="font-pixel text-xs text-mut">{aberta ? '▾' : '▸'}</span></span>
					<span class="truncate text-[13px] leading-[18px] text-mut">{j!.origem} · {j!.efeito}</span>
				</button>
				<span class="inline-flex h-9 items-center gap-1 border-2 border-ink pr-2.5 text-[13px] font-semibold max-md:hidden" style:background={t.cor} style:color={t.texto}><Icone id={t.icone} />{j!.tipo}</span>
				<div class="flex items-baseline justify-end gap-1.5" title={c.notas.join(' · ') || undefined}>
					{#if c.final !== c.base}<span class="t-num text-sm text-mut line-through">{c.base}</span>{/if}
					<span class="t-num text-[22px] leading-none" style:color={c.final < c.base ? '#7FD3E6' : c.final > c.base ? 'var(--warn)' : undefined}>{c.final} {c.unidade}</span>
				</div>
				<button
					type="button"
					class="btn-jogo min-h-9 px-3 text-xs max-md:col-span-2 max-md:col-start-3 {!f.editavel || falta > 0 || bloqueadoRank ? 'bg-b3 text-mut' : 'btn-primario'}"
					disabled={!f.editavel || falta > 0 || bloqueadoRank}
					title={bloqueadoRank ? 'Esgotado: sem jutsus de Rank B ou superior' : falta > 0 ? `Faltam ${falta} ${c.unidade}` : !f.editavel ? 'Ficha somente leitura' : 'Gasta o custo e já rola o ataque e o dano'}
					onclick={() => usar(j!)}>USAR · {c.final} {c.unidade}</button
				>
			</div>
			{#if aberta}
				<div class="flex flex-col gap-2.5 border-t-2 border-b3 py-3 pr-3.5 pl-[18px]">
					<dl class="m-0 grid grid-cols-2 border-t-2 border-l-2 border-b3 md:grid-cols-3 xl:grid-cols-6">
						{#each j!.info as i (i.k)}
							<div class="flex flex-col gap-1 border-r-2 border-b-2 border-b3 bg-b1 px-2 py-1.5">
								<dt class="font-pixel text-xs leading-none font-semibold tracking-[0.06em] text-mut uppercase">{i.k}</dt>
								<dd class="m-0 text-[13px] leading-[18px] font-semibold">{i.v}</dd>
							</div>
						{/each}
					</dl>
					<p class="m-0 text-sm leading-[21px]"><b>Efeito.</b> {j!.efeito}</p>
					{#if f.editavel}
						{@const rr = rolagens(j!)}
						{#if rr.ataque || rr.dano || rr.cura}
							<div class="flex flex-wrap items-center gap-2">
								{#if rr.ataque}<BotaoRolar texto="ATAQUE {rr.ataque.expr}" expressao={rr.ataque.expr} rotulo={rr.ataque.rotulo} personagem={f.id} d20 />{/if}
								{#if rr.dano}
									<BotaoRolar texto="DANO {rr.dano.expr}" expressao={rr.dano.expr} rotulo={rr.dano.rotulo} personagem={f.id} />
									<BotaoRolar texto="CRÍTICO" expressao={rr.dano.expr} rotulo="{rr.dano.rotulo} · crítico" personagem={f.id} critico />
								{/if}
								{#if rr.cura}<BotaoRolar texto="CURA {rr.cura}" expressao={rr.cura} rotulo="{j!.nome} · cura" personagem={f.id} />{/if}
							</div>
						{/if}
					{/if}
					{#if c.notas.length}<p class="m-0 text-[13px] text-mut">Custo: {c.base} {c.unidade} base · {c.notas.join(' · ')}</p>{/if}
				</div>
			{/if}
		</li>
	{/each}
</ul>
<p class="m-0 text-[13px] leading-[18px] text-mut">
	Reduções de especializações diferentes não se somam: vale a maior, mais −1 da proficiência; custo mínimo 1 e nunca abaixo da metade (cap. 9).
	{#if exausto}Exausto: jutsus custam +1.{/if}
	{#if ctrFino}Controle Fino (CTR +3): gaste um turno preparando para reduzir 1 PC.{/if}
</p>
