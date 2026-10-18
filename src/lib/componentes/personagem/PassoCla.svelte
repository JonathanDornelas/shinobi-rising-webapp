<script lang="ts">
	// Passo 4 · Clã (cap. 8): catálogo da campanha, clã novo (no lote de Clãs) ou sem clã.
	import { CLAS } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import type { TipoCla } from '#lib/personagem/regras.ts';
	import Icone from '../ui/Icone.svelte';
	import EscolhaPericia from './EscolhaPericia.svelte';
	import Opcao from './Opcao.svelte';

	let { c }: { c: Criador } = $props();
	const EM_BREVE = 'O criador de clãs chega no lote de Clãs';
	const opcoes = $derived<{ id: TipoCla; nome: string; texto: string; icone: string; selo?: string; bloqueio: string }[]>([
		{ id: 'catalogo', nome: 'Clã do catálogo', texto: 'Clãs oficiais permitidos na campanha', icone: 'nav/ic-nav-clas', bloqueio: c.catalogo.clas.length ? '' : 'A campanha não permite clãs do catálogo' },
		{ id: 'novo-sem-kkg', nome: 'Criar clã sem KKG', texto: '4 PB para distribuir · cap. 8.4', icone: 'acao/ic-acao-criar-cla', bloqueio: c.ctx.clasSemKkg ? EM_BREVE : 'A campanha não permite clãs personalizados sem KKG' },
		{ id: 'novo-com-kkg', nome: 'Criar clã com KKG', texto: 'Balança de PKG · cap. 8.4', icone: 'kkg/ic-kkg-combinacao', selo: 'EXIGE APROVAÇÃO DO MESTRE', bloqueio: c.ctx.clasComKkg ? EM_BREVE : 'A campanha não permite clãs personalizados com KKG' },
		{ id: 'sem', nome: 'Sem clã', texto: '+2 pontos de perícia e +5 PT iniciais', icone: 'vila/ic-vila-sem', bloqueio: '' }
	]);
	const cla = $derived(c.catalogo.clas.find((x) => x.slug === c.ficha.cla.slug));
	const regras = $derived(c.ficha.cla.slug ? CLAS[c.ficha.cla.slug] : null);

	function tipo(t: TipoCla) {
		c.ficha.cla = { tipo: t, slug: t === 'catalogo' ? (c.ficha.cla.slug ?? c.catalogo.clas[0]?.slug ?? null) : null, escolha: null };
		c.aviso = t === 'sem' ? 'Sem clã: os passos 5 e 6 ganharam pontos extras (+2 perícia, +5 PT).' : '';
		if (t === 'catalogo') escolherCla(c.ficha.cla.slug);
	}
	function escolherCla(slug: string | null) {
		c.ficha.cla = { tipo: 'catalogo', slug, escolha: null };
		const el = slug ? CLAS[slug]?.elemento : undefined;
		if (el) c.ficha.elemento = el;
		if (!slug || !CLAS[slug]?.segundoElemento) c.ficha.segundoElemento = null;
	}
</script>

<div role="radiogroup" aria-label="Origem do clã" class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
	{#each opcoes as o (o.id)}
		<Opcao rotulo={o.nome} selecionado={c.ficha.cla.tipo === o.id} desabilitado={o.bloqueio} somenteLeitura={!c.editavel} sombra={false} aoEscolher={() => tipo(o.id)}>
			<Icone id={o.icone} />
			<span class="font-mincho text-[15px] leading-5 font-bold">{o.nome}</span>
			<span class="text-xs leading-4 text-mut">{o.texto}</span>
			{#if o.selo}<span class="self-start bg-warn px-1.5 py-1 font-pixel text-xs leading-none font-bold tracking-[0.04em] text-warnfg">{o.selo}</span>{/if}
			{#if o.bloqueio === EM_BREVE}<span class="font-pixel text-[11px] tracking-[0.06em] text-mut">EM BREVE</span>{/if}
		</Opcao>
	{/each}
</div>

{#if c.ficha.cla.tipo === 'catalogo'}
	<div role="radiogroup" aria-label="Clã" class="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
		{#each c.catalogo.clas as k (k.slug)}
			{@const on = c.ficha.cla.slug === k.slug}
			<button
				type="button"
				role="radio"
				aria-checked={on}
				title="Clã {k.nome}"
				disabled={!c.editavel}
				class="flex h-[72px] flex-col items-center justify-center gap-1 border-2 text-fg {on ? 'border-vermelhao bg-grena text-papel' : 'border-frame bg-b2 hover:border-mut'}"
				onclick={() => escolherCla(k.slug)}
			>
				<Icone id="cla/ic-cla-{k.slug}" /><span class="text-xs leading-none font-semibold">{k.nome}</span>
			</button>
		{/each}
	</div>
	{#if cla && regras}
		<div class="flex border-2 border-[#8B2E20] bg-b2 sombra-painel max-sm:flex-col">
			<div class="flex w-28 flex-none items-center justify-center border-r-2 border-[#8B2E20] bg-grena py-3 max-sm:w-full max-sm:border-r-0 max-sm:border-b-2">
				<Icone id="cla/ic-cla-{cla.slug}" tamanho={64} />
			</div>
			<div class="flex flex-1 flex-col gap-2 p-3.5">
				<span class="font-mincho text-xl leading-[26px] font-bold">Clã {cla.nome} <span class="font-sans text-sm font-normal text-mut">· {cla.epiteto}</span></span>
				<div class="flex flex-wrap gap-1.5">
					{#each cla.bonus as b (b)}<span class="border-2 border-[rgba(217,168,43,.55)] bg-[rgba(217,168,43,.14)] px-2 py-[7px] font-pixel text-[13px] leading-none font-bold">{b}</span>{/each}
				</div>
				<span class="text-sm leading-[21px]"><b>KKG:</b> {cla.kkg ?? 'Nenhum'} · <b>Marco do nível 1:</b> {cla.marco}</span>
				{#if regras.ganho.escolhaPericia}
					<EscolhaPericia id="cla-escolha" rotulo="+1 do clã em:" opcoes={regras.ganho.escolhaPericia} valor={c.ficha.cla.escolha} desabilitado={!c.editavel} aoMudar={(p) => (c.ficha.cla.escolha = p)} />
				{/if}
				<a href="/regras/clas/{cla.slug}" target="_blank" rel="noopener" class="link self-start text-[13px] font-semibold">Ver a ficha completa do clã</a>
			</div>
		</div>
	{/if}
{:else if c.ficha.cla.tipo === 'sem'}
	<div class="painel px-3.5 py-3 text-[15px] leading-[22px] font-semibold">Sem clã: +2 pontos de perícia e +5 PT iniciais. Os passos 5 e 6 já contam com eles.</div>
{/if}
