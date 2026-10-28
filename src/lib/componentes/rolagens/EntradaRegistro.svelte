<script lang="ts" module>
	/** Rosto da entrada: foto e clã da ficha, quando o grupo pode ver. */
	export interface AvatarRolagem {
		retrato: string | null;
		resumo: ResumoClaFicha | null;
	}
</script>

<script lang="ts">
	// Uma rolagem no registro (L10 · R1, e compacta na janela R2): quem rolou, campanha, quem vê, o quê, as faces, o total e a
	// hora. Na página, abre a conta parcela por parcela e os detalhes; quem rolou pela ficha pode gastar um Ponto de Destino.
	import IconeCla, { type ResumoClaFicha } from '../cla/IconeCla.svelte';
	import { urlRetrato } from '#lib/personagem/retrato.ts';
	import { serializar, termos } from '#lib/rolagens/expressoes.ts';
	import { corDaRolagem, dataHora, dataLonga, iniciaisQuem, marcas, NOME_TIPO, relativo, ROTULO_MARCA, type Marca } from '#lib/rolagens/registro.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import FacesDados, { modificadorDe } from './FacesDados.svelte';

	interface Props {
		r: Rolagem;
		campanha: string;
		vis: 'todos' | 'eu' | 'mestre';
		/** Rolei eu (borda vermelha no rosto). */
		minha: boolean;
		/** Rolagem do Mestre ou de NPC (borda grená). */
		doMestre: boolean;
		avatar?: AvatarRolagem | null;
		compacta?: boolean;
		aberta?: boolean;
		aoAlternar?: () => void;
		/** Quem rolou pela própria ficha, logo depois: re-rolar ou +5 com 1 PD. */
		aoPd?: ((acao: 'rerrolar' | 'mais5') => void) | null;
		aoApagar?: (() => void) | null;
		agora?: Date;
	}
	let { r, campanha, vis, minha, doMestre, avatar = null, compacta = false, aberta = false, aoAlternar, aoPd = null, aoApagar = null, agora = new Date() }: Props = $props();

	const VIS = { todos: { t: 'TODOS VEEM', bd: 'var(--b3)', c: 'var(--mut)' }, eu: { t: 'EU E O MESTRE', bd: 'var(--info)', c: 'var(--info)' }, mestre: { t: 'SÓ O MESTRE', bd: 'var(--vermelhao-lo)', c: 'var(--link)' } } as const;
	const MARCA: Record<Marca, { bg: string; fg: string; bd: string }> = {
		critico: { bg: 'color-mix(in srgb, var(--acc) 16%, transparent)', fg: 'var(--title)', bd: 'var(--acc)' },
		falha: { bg: 'color-mix(in srgb, var(--err) 14%, transparent)', fg: 'var(--err)', bd: 'var(--err)' },
		pd: { bg: 'transparent', fg: 'var(--fg)', bd: 'var(--acc)' }
	};
	const ms = $derived(marcas(r));
	const formula = $derived.by(() => {
		const t = termos(r.expressao);
		return t ? serializar(t) : r.expressao;
	});
	const corDados = $derived(corDaRolagem(r));
	const corTotal = $derived(r.d20 === 20 ? 'var(--title)' : r.d20 === 1 ? 'var(--err)' : undefined);
	const rosto = $derived(minha ? 'var(--vermelhao)' : doMestre ? 'var(--vermelhao-lo)' : 'var(--b3)');
	const foto = $derived(urlRetrato(avatar?.retrato));
	const MODO = { normal: '', vantagem: 'Vantagem', desvantagem: 'Desvantagem', critico: 'Crítico (dados de dano dobrados)' } as const;

	// a conta: cada termo de dados com o que caiu, depois as parcelas que a ficha mandou (ou o modificador da expressão)
	const conta = $derived.by(() => {
		const linhas: { k: string; v: string }[] = [];
		for (const t of r.detalhe) {
			if (!('lados' in t)) continue;
			const nome = `${t.sinal < 0 ? '−' : ''}${t.valores.length}d${t.lados}${t.manter ? `k${t.manter}${t.k}` : ''}`;
			linhas.push({ k: nome, v: t.usados.join(' + ') || '0' });
		}
		if (r.partes.length) for (const [k, v] of r.partes) linhas.push({ k, v });
		else {
			const m = modificadorDe(r.detalhe);
			if (m) linhas.push({ k: 'Modificador', v: m });
		}
		return linhas;
	});
	const detalhes = $derived(
		[
			['Data', dataLonga(r.criada_em)],
			['Campanha', campanha],
			['Tipo', NOME_TIPO[r.tipo] ?? r.tipo],
			r.origem ? ['Origem', r.origem] : null,
			MODO[r.modo] ? ['Modo', MODO[r.modo]] : null,
			['Quem vê', VIS[vis].t.toLowerCase()],
			r.pd ? ['PD', r.pd === 'mais5' ? `+5 no resultado (era ${r.anterior_total})` : `re-rolada (antes ${r.anterior_total})`] : null,
			r.substituida ? ['PD', 're-rolada com Ponto de Destino; vale a rolagem seguinte'] : null,
			['Registro', `#R-${r.id.slice(0, 6).toUpperCase()}`]
		].filter((x): x is string[] => !!x)
	);
</script>

{#if compacta}
	<div class="relative grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 border-2 bg-b1 px-2 pt-1.5 pb-4" style:border-color={r.substituida ? 'var(--b3)' : 'var(--frame)'} style:opacity={r.substituida ? '.6' : undefined}>
		{#if foto}<img src={foto} alt="" class="h-8 w-8 border-2 object-cover" style:border-color={rosto} />{:else}<span class="flex h-8 w-8 items-center justify-center border-2 font-pixel text-xs font-bold text-mut" style:border-color={rosto}>{iniciaisQuem(r.quem)}</span>{/if}
		<div class="flex min-w-0 flex-col gap-[3px]">
			<div class="flex min-w-0 items-center gap-1.5">
				<span class="min-w-0 truncate font-mincho text-sm leading-[18px] font-bold" title={r.quem}>{r.quem}</span>
				<span class="font-pixel text-xs leading-none font-semibold whitespace-nowrap text-mut">{campanha}</span>
			</div>
			<span class="text-[13px] leading-[17px] font-medium">{r.rotulo}</span>
			<div class="flex flex-wrap items-center gap-1">
				<span class="font-pixel text-xs leading-none font-bold text-mut">{formula}</span>
				<FacesDados detalhe={r.detalhe} tamanho={22} cor={corDados} />
				{#each ms as m (m)}<span class="border-2 px-1 py-0.5 font-pixel text-xs leading-none font-bold" style:background={MARCA[m].bg} style:color={MARCA[m].fg} style:border-color={MARCA[m].bd}>{ROTULO_MARCA[m]}</span>{/each}
				{#if vis !== 'todos'}<span class="border-2 px-1 py-0.5 font-pixel text-xs leading-none font-bold" style:border-color={VIS[vis].bd} style:color={VIS[vis].c}>{VIS[vis].t}</span>{/if}
			</div>
		</div>
		<div class="flex flex-col items-end gap-1">
			<span class="t-num text-2xl leading-none" style:color={corTotal} style:text-decoration={r.substituida ? 'line-through' : undefined}>{r.total}</span>
		</div>
		<span class="absolute right-2 bottom-1 text-[11px] leading-none text-mut">{dataHora(r.criada_em)}</span>
	</div>
{:else}
	<div class="relative border-2 bg-b2 shadow-[4px_4px_0_var(--ink)]" style:border-color={aberta ? 'var(--mut)' : 'var(--frame)'} style:opacity={r.substituida ? '.65' : undefined}>
		<button type="button" class="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-3 pt-2.5 pb-5 text-left text-fg md:grid-cols-[48px_minmax(0,1fr)_120px] md:gap-3.5 md:px-3.5" aria-expanded={aberta} onclick={aoAlternar}>
			<span class="relative flex h-10 w-10 items-center justify-center border-2 bg-b1 font-pixel text-sm font-bold text-mut md:h-12 md:w-12 md:text-base" style:border-color={rosto}>
				{#if foto}<img src={foto} alt="" class="h-full w-full object-cover" />{:else}{iniciaisQuem(r.quem)}{/if}
				{#if avatar?.resumo}<span class="absolute -right-2.5 -bottom-2.5 h-6 w-6 overflow-hidden"><IconeCla resumo={avatar.resumo} class="h-6! w-6!" /></span>{/if}
			</span>
			<span class="flex min-w-0 flex-col gap-1.5">
				<span class="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span class="max-w-full min-w-0 truncate font-mincho text-base leading-[22px] font-bold md:max-w-[60%] md:text-[17px]" title={r.quem}>{r.quem}</span>
					{#if r.jogador && r.jogador !== r.quem}<span class="text-[13px] leading-[18px] font-medium text-mut">{r.npc_id ? `NPC · ${r.jogador}` : r.jogador}</span>{/if}
					<span class="max-w-full truncate border-2 border-b3 bg-b1 px-1.5 py-1 text-xs leading-none font-semibold">{campanha}</span>
					<!-- no celular, só as rolagens restritas mostram quem vê (o padrão é todos) -->
					<span class="border-2 px-1 py-[3px] font-pixel text-xs leading-none font-bold tracking-[0.06em] {vis === 'todos' ? 'max-sm:hidden' : ''}" style:border-color={VIS[vis].bd} style:color={VIS[vis].c}>{VIS[vis].t}</span>
				</span>
				<span class="text-[15px] leading-5 font-semibold">{r.rotulo}</span>
				<span class="flex flex-wrap items-center gap-1.5">
					<span class="mr-1 font-pixel text-[13px] leading-none font-bold text-mut">{formula}</span>
					<FacesDados detalhe={r.detalhe} cor={corDados} />
					{#each ms as m (m)}<span class="inline-flex items-center border-2 px-1.5 py-[3px] font-pixel text-xs leading-none font-bold tracking-[0.05em]" style:background={MARCA[m].bg} style:color={MARCA[m].fg} style:border-color={MARCA[m].bd}>{ROTULO_MARCA[m]}</span>{/each}
					{#if r.anterior_total !== null}<span title="Resultado antes do Ponto de Destino" class="text-[13px] leading-none font-medium text-mut line-through">{r.anterior_total}</span>{/if}
					{#if r.substituida}<span class="font-pixel text-xs leading-none font-bold text-mut">RE-ROLADA COM PD</span>{/if}
				</span>
			</span>
			<span class="flex flex-col items-end gap-1.5">
				<span class="t-num text-[28px] leading-none md:text-4xl" style:color={corTotal} style:text-decoration={r.substituida ? 'line-through' : undefined}>{r.total}</span>
				{#if relativo(r.criada_em, agora)}<span class="text-xs leading-none font-medium text-mut">{relativo(r.criada_em, agora)}</span>{/if}
			</span>
			<span class="absolute right-3 bottom-1.5 text-[11px] leading-none text-mut md:right-3.5">{dataHora(r.criada_em)}</span>
		</button>
		{#if aberta}
			<div class="grid gap-5 border-t-2 border-b3 px-3.5 pt-3 pb-3.5 md:grid-cols-2 md:pl-[76px]">
				<div class="flex flex-col gap-1.5">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">CONTA</span>
					{#each conta as p, i (i)}
						<div class="flex items-center gap-2 text-sm leading-5"><span class="flex-1">{p.k}</span><span class="t-num text-[15px] leading-none">{p.v}</span></div>
					{/each}
					<div class="flex items-center gap-2 border-t-2 border-b3 pt-1.5 text-sm leading-5 font-semibold"><span class="flex-1">Total</span><span class="t-num text-lg leading-none">{r.total}</span></div>
				</div>
				<div class="flex flex-col gap-1.5">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">DETALHES</span>
					{#each detalhes as [k, v] (k + v)}
						<div class="grid grid-cols-[110px_minmax(0,1fr)] gap-2 text-sm leading-5"><span class="text-mut">{k}</span><span>{v}</span></div>
					{/each}
					{#if aoPd || aoApagar}
						<div class="mt-1.5 flex flex-wrap gap-2">
							{#if aoPd}
								<button type="button" class="btn-jogo btn-contorno com-icone min-h-9 text-xs" title="Gasta 1 Ponto de Destino da ficha (cap. 2)" onclick={() => aoPd?.('rerrolar')}><img src="/icons/recurso/ic-recurso-pd-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />RE-ROLAR · 1 PD</button>
								<button type="button" class="btn-jogo btn-contorno com-icone min-h-9 text-xs" title="Gasta 1 Ponto de Destino da ficha (cap. 2)" onclick={() => aoPd?.('mais5')}><img src="/icons/recurso/ic-recurso-pd-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />+5 · 1 PD</button>
							{/if}
							{#if aoApagar}<button type="button" class="btn-jogo btn-fantasma min-h-9 text-xs text-err" onclick={aoApagar}>APAGAR</button>{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}
