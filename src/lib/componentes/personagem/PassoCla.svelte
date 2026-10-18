<script lang="ts">
	// Passo 4 · Clã (cap. 8): catálogo da campanha, clã criado (com ou sem KKG, cap. 8.4) ou sem clã.
	import { CLAS, nomePericia } from '#lib/personagem/dados.ts';
	import type { Criador } from '#lib/personagem/criador.svelte.ts';
	import type { TipoCla } from '#lib/personagem/regras.ts';
	import { claVazio, resumoCla, type ResumoCla } from '#lib/clas/regras.ts';
	import { hrefCla, STATUS_CLA } from '#lib/clas/status.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Json } from '#lib/supabase/banco.ts';
	import Brasao from '../cla/Brasao.svelte';
	import Icone from '../ui/Icone.svelte';
	import EscolhaPericia from './EscolhaPericia.svelte';
	import Opcao from './Opcao.svelte';

	interface Props {
		c: Criador;
		campanhaId: string;
		fichaId: string;
		eu: string;
		/** Salva a ficha e vai para outra tela (o criador de clã). */
		irPara: (destino: string) => Promise<void>;
	}
	let { c, campanhaId, fichaId, eu, irPara }: Props = $props();
	const opcoes = $derived<{ id: TipoCla; nome: string; texto: string; icone: string; selo?: string; bloqueio: string }[]>([
		{ id: 'catalogo', nome: 'Clã do catálogo', texto: 'Clãs oficiais permitidos na campanha', icone: 'nav/ic-nav-clas', bloqueio: c.catalogo.clas.length ? '' : 'A campanha não permite clãs do catálogo' },
		{ id: 'novo-sem-kkg', nome: 'Criar clã sem KKG', texto: '4 PB para distribuir · cap. 8.4', icone: 'acao/ic-acao-criar-cla', bloqueio: c.ctx.clasSemKkg ? '' : 'A campanha não permite clãs personalizados sem KKG' },
		{ id: 'novo-com-kkg', nome: 'Criar clã com KKG', texto: 'Balança de PKG · cap. 8.4', icone: 'kkg/ic-kkg-combinacao', selo: 'EXIGE APROVAÇÃO DO MESTRE', bloqueio: c.ctx.clasComKkg ? '' : 'A campanha não permite clãs personalizados com KKG' },
		{ id: 'sem', nome: 'Sem clã', texto: '+2 pontos de perícia e +5 PT iniciais', icone: 'vila/ic-vila-sem', bloqueio: '' }
	]);
	const cla = $derived(c.catalogo.clas.find((x) => x.slug === c.ficha.cla.slug));
	const regras = $derived(c.ficha.cla.tipo === 'catalogo' && c.ficha.cla.slug ? CLAS[c.ficha.cla.slug] : null);
	const novo = $derived(c.ficha.cla.tipo === 'novo-sem-kkg' || c.ficha.cla.tipo === 'novo-com-kkg');
	const comKkg = $derived(c.ficha.cla.tipo === 'novo-com-kkg');
	const criados = $derived(c.clasCriados.filter((x) => x.kkg === comKkg));
	const escolhido = $derived(c.clasCriados.find((x) => x.id === c.ficha.cla.id) ?? null);
	const meu = (autor: string) => autor === eu;

	function tipo(t: TipoCla) {
		c.ficha.cla = { tipo: t, slug: t === 'catalogo' ? (c.ficha.cla.slug ?? c.catalogo.clas[0]?.slug ?? null) : null, escolha: null, id: null, criado: null };
		c.aviso = t === 'sem' ? 'Sem clã: os passos 5 e 6 ganharam pontos extras (+2 perícia, +5 PT).' : '';
		if (t === 'catalogo') escolherCla(c.ficha.cla.slug);
		else if (t !== 'sem') {
			// com um único clã criado do tipo, já escolhe
			const lista = c.clasCriados.filter((x) => x.kkg === (t === 'novo-com-kkg'));
			if (lista.length === 1) c.usarClaCriado(lista[0].id);
		}
	}
	function escolherCla(slug: string | null) {
		c.ficha.cla = { tipo: 'catalogo', slug, escolha: null, id: null, criado: null };
		const el = slug ? CLAS[slug]?.elemento : undefined;
		if (el) c.ficha.elemento = el;
		if (!slug || !CLAS[slug]?.segundoElemento) c.ficha.segundoElemento = null;
	}

	let criando = $state(false);
	async function criarCla() {
		criando = true;
		const dados = claVazio(comKkg);
		const { data, error } = await supabase()
			.from('clas')
			.insert({ campanha_id: campanhaId, autor_id: eu, nome: '', kkg: comKkg, dados: dados as unknown as Json, resumo: resumoCla(dados) as unknown as Json })
			.select('id')
			.single();
		criando = false;
		if (error || !data) return toasts.mostrar('Não foi possível criar o clã. Tente de novo.', 'erro');
		await irPara(hrefCla(campanhaId, data.id, fichaId));
	}
</script>

<div role="radiogroup" aria-label="Origem do clã" class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
	{#each opcoes as o (o.id)}
		<Opcao rotulo={o.nome} selecionado={c.ficha.cla.tipo === o.id} desabilitado={o.bloqueio} somenteLeitura={!c.editavel} sombra={false} aoEscolher={() => tipo(o.id)}>
			<Icone id={o.icone} />
			<span class="font-mincho text-[15px] leading-5 font-bold">{o.nome}</span>
			<span class="text-xs leading-4 text-mut">{o.texto}</span>
			{#if o.selo}<span class="self-start bg-warn px-1.5 py-1 font-pixel text-xs leading-none font-bold tracking-[0.04em] text-warnfg">{o.selo}</span>{/if}
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
{:else if novo}
	<div class="flex flex-col gap-2">
		<span class="t-rotulo text-xs">Clãs {comKkg ? 'com' : 'sem'} KKG disponíveis · seus e aprovados na campanha</span>
		{#if criados.length}
			<div role="radiogroup" aria-label="Clã criado" class="grid gap-2.5 sm:grid-cols-2">
				{#each criados as x (x.id)}
					{@const r = x.resumo as Partial<ResumoCla> | null}
					{@const st = STATUS_CLA[x.status]}
					<Opcao rotulo="Clã {x.nome || 'sem nome'}" selecionado={c.ficha.cla.id === x.id} somenteLeitura={!c.editavel} sombra={false} aoEscolher={() => c.usarClaCriado(x.id)}>
						<span class="flex items-center gap-3">
							<span class="flex h-12 w-12 flex-none items-center justify-center border-2 border-b3 bg-b1"><Brasao kamon={r?.kamon} cor={r?.cor} /></span>
							<span class="flex min-w-0 flex-col">
								<span class="truncate font-mincho text-[15px] leading-5 font-bold">Clã {x.nome || 'sem nome'}{x.versao > 1 ? ` · v${x.versao}` : ''}</span>
								<span class="truncate text-xs leading-4 text-mut">{r?.significado || (meu(x.autor_id) ? 'Sua criação' : 'Da campanha')}{r?.kkg ? ` · ${r.kkg}` : ''}</span>
							</span>
						</span>
						<span class="inline-flex h-8 items-center gap-0.5 self-start border-2 border-ink pr-2 text-xs leading-none font-semibold {st.classe}"><Icone id={st.icone} />{st.rotulo}</span>
					</Opcao>
				{/each}
			</div>
		{:else}
			<div class="border-2 border-dashed border-b3 p-5 text-center text-sm text-mut">Nenhum clã {comKkg ? 'com' : 'sem'} KKG ainda. Crie o seu: o criador abre com a volta para este passo.</div>
		{/if}
		{#if c.editavel}
			<div class="flex flex-wrap items-center gap-2.5">
				<button type="button" class="btn-jogo btn-contorno com-icone text-[13px]" disabled={criando} aria-busy={criando} onclick={criarCla}><Icone id="acao/ic-acao-criar-cla" />CRIAR CLÃ {comKkg ? 'COM' : 'SEM'} KKG</button>
				{#if escolhido}
					{#if meu(escolhido.autor_id) && (escolhido.status === 'rascunho' || escolhido.status === 'ajustes')}
						<button type="button" class="btn-jogo btn-primario text-[13px]" onclick={() => irPara(hrefCla(campanhaId, escolhido.id, fichaId))}>EDITAR O CLÃ {escolhido.nome ? escolhido.nome.toUpperCase() : ''}</button>
					{:else}
						<a href={hrefCla(campanhaId, escolhido.id)} target="_blank" rel="noopener" class="link text-[13px] font-semibold">Ver o clã</a>
					{/if}
				{/if}
			</div>
		{/if}
		{#if escolhido && c.ficha.cla.criado}
			{@const r = c.ficha.cla.criado}
			<div class="painel flex flex-col gap-1.5 px-3.5 py-3 text-sm leading-[21px]">
				<span><b>Bônus:</b> {[r.ganho.atributo ? `+1 ${r.ganho.atributo}` : '', ...(r.ganho.pericias ?? []).map((p) => `+1 ${nomePericia(p)}`), r.ganho.pv ? `+${r.ganho.pv} PV` : '', r.ganho.pc ? `+${r.ganho.pc} PC` : '', r.ganho.pt ? `+${r.ganho.pt} PT` : ''].filter(Boolean).join(' · ') || 'nenhum'}</span>
				<span><b>Marco do nível 1:</b> {r.marco}</span>
				{#if r.extras.length}<span><b>Extras:</b> {r.extras.join(' · ')}</span>{/if}
				{#if escolhido.status === 'rascunho' || escolhido.status === 'ajustes'}<span class="font-semibold text-warn">Envie o clã para a revisão do Mestre antes de enviar a ficha.</span>{/if}
			</div>
		{/if}
	</div>
{:else if c.ficha.cla.tipo === 'sem'}
	<div class="painel px-3.5 py-3 text-[15px] leading-[22px] font-semibold">Sem clã: +2 pontos de perícia e +5 PT iniciais. Os passos 5 e 6 já contam com eles.</div>
{/if}
