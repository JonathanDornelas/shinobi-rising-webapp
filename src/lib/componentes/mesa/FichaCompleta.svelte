<script lang="ts" module>
	import type { JutsuMesa } from '#lib/mesa/tipos.ts';

	/** O que a Mesa oferece à aba de jutsus da ficha completa (medir com a régua, usar com alvos). */
	export interface JutsusNaMesa {
		medir: (slug: string) => void;
		usar: (slug: string) => Promise<boolean>;
		podeMedir: (slug: string) => boolean;
		hud: (slug: string) => JutsuMesa | null;
	}
</script>

<script lang="ts">
	// L11 · Ficha completa dentro da Mesa: janela grande, arrastável pelo topo, redimensionável e minimizável (fica montada
	// enquanto minimizada). O jogador abre só a dele; o Mestre, qualquer uma. As abas são as da página da ficha.
	// O estado (PV, PC, PE, estados) é o mesmo da ficha rápida: o que muda numa aparece na outra.
	import { untrack } from 'svelte';
	import AbaAnotacoes from '../ficha/AbaAnotacoes.svelte';
	import AbaCla from '../ficha/AbaCla.svelte';
	import AbaEquipamento from '../ficha/AbaEquipamento.svelte';
	import AbaHistoria from '../ficha/AbaHistoria.svelte';
	import AbaJutsus from '../ficha/AbaJutsus.svelte';
	import AbaPericias from '../ficha/AbaPericias.svelte';
	import AbaProgressao from '../ficha/AbaProgressao.svelte';
	import AbaRegistro from '../ficha/AbaRegistro.svelte';
	import AbaVisao from '../ficha/AbaVisao.svelte';
	import BarraRecursos from '../ficha/BarraRecursos.svelte';
	import Icone from '../ui/Icone.svelte';
	import Retrato from '../ui/Retrato.svelte';
	import VerImagem from '../ui/VerImagem.svelte';
	import { urlRetrato } from '#lib/personagem/retrato.ts';
	import Girando from '../ui/Girando.svelte';
	import { rankSugerido } from '#lib/campanhas/dominio.ts';
	import { VILAS } from '#lib/personagem/dados.ts';
	import { FichaJogo } from '#lib/personagem/ficha.svelte.ts';
	import type { FichaCompletaCarregada } from '#lib/personagem/ficha-completa.server.ts';
	import type { EstadoJogo, ItemInventario } from '#lib/personagem/progressao.ts';
	import { normalizarFicha, type FichaDados } from '#lib/personagem/regras.ts';

	let {
		campanha,
		pid,
		min,
		celular = false,
		estado = null,
		naMesa,
		aoEstado,
		aoMinimizar,
		aoFechar,
		aoCarregar
	}: {
		campanha: string;
		pid: string;
		min: boolean;
		celular?: boolean;
		/** o estado da ficha rápida (FichaMesa), para as duas mostrarem o mesmo */
		estado?: EstadoJogo | null;
		naMesa: JutsusNaMesa;
		aoEstado: (estado: EstadoJogo) => void;
		aoMinimizar: () => void;
		aoFechar: () => void;
		aoCarregar?: (nome: string) => void;
	} = $props();

	type Dados = FichaCompletaCarregada & { arquivada: boolean };
	let dados = $state<Dados | null>(null);
	let erro = $state<string | null>(null);
	$effect(() => {
		const id = pid;
		dados = null;
		erro = null;
		fetch(`/campanhas/${campanha}/mesa/ficha/${id}`)
			.then(async (r) => {
				if (id !== pid) return;
				if (!r.ok) return void (erro = r.status === 403 ? 'Só o dono e o Mestre abrem esta ficha.' : 'Não foi possível abrir a ficha.');
				dados = (await r.json()) as Dados;
				aoCarregar?.(dados.completa.nome);
			})
			.catch(() => (erro = 'Sem conexão para abrir a ficha.'));
	});

	const p = $derived(dados?.completa ?? null);
	const f = $derived(
		dados && p
			? new FichaJogo(
					{ id: p.id, dados: normalizarFicha(p.dados as Partial<FichaDados>), estado: (p.estado ?? {}) as EstadoJogo, inventario: p.inventario as ItemInventario[] | null, ryo: p.ryo },
					dados.catalogo,
					p.status === 'aprovada' && p.situacao === 'ativo' && !dados.arquivada && (p.dono || p.mestre)
				)
			: null
	);
	const vila = $derived(f ? VILAS.find((v) => v.id === f.dados.vila.id) : null);

	// as duas fichas mostram o mesmo estado: a rápida chega aqui sem salvar de novo, e o que muda aqui vai para a rápida
	const igual = (a: unknown, b: unknown) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
	$effect(() => {
		const e = estado;
		const ficha = f;
		if (!e || !ficha) return;
		untrack(() => {
			if (!igual(e, $state.snapshot(ficha.estado))) ficha.estado = $state.snapshot(e) as EstadoJogo;
		});
	});
	$effect(() => {
		const ficha = f;
		if (!ficha) return;
		const e = ficha.estado;
		untrack(() => {
			if (!igual(e, estado)) aoEstado($state.snapshot(e) as EstadoJogo);
		});
	});

	type Aba = 'visao' | 'pericias' | 'jutsus' | 'cla' | 'equip' | 'prog' | 'hist' | 'notas' | 'log';
	const ABAS: [Aba, string][] = [
		['visao', 'VISÃO GERAL'],
		['pericias', 'PERÍCIAS'],
		['jutsus', 'JUTSUS'],
		['cla', 'CLÃ'],
		['equip', 'EQUIPAMENTO'],
		['prog', 'PROGRESSÃO'],
		['hist', 'HISTÓRIA'],
		['notas', 'ANOTAÇÕES'],
		['log', 'REGISTRO']
	];
	let aba = $state<Aba>('visao');
	let ampliada = $state(false);

	// a janela: começa grande e centrada; o topo arrasta, o canto redimensiona
	const largura = Math.min(940, (typeof innerWidth === 'number' ? innerWidth : 1200) - 64);
	let x = $state(Math.max(16, ((typeof innerWidth === 'number' ? innerWidth : 1200) - largura) / 2));
	let y = $state(56);
	let arrasto: { x: number; y: number; jx: number; jy: number } | null = null;
	function pegar(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button, a')) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		arrasto = { x: e.clientX, y: e.clientY, jx: x, jy: y };
	}
	function arrastar(e: PointerEvent) {
		if (!arrasto) return;
		x = Math.max(0, Math.min(innerWidth - 120, arrasto.jx + e.clientX - arrasto.x));
		y = Math.max(0, Math.min(innerHeight - 48, arrasto.jy + e.clientY - arrasto.y));
	}
	const botao = 'flex h-9 min-w-9 items-center justify-center border-2 border-b3 px-2 font-pixel text-xs font-bold';
</script>

<div
	role="dialog"
	aria-label="Ficha completa{p ? ` de ${p.nome}` : ''}"
	class={celular
		? 'fixed inset-0 z-[56] flex flex-col bg-b1'
		: 'fixed z-50 flex h-[calc(100dvh-80px)] min-h-[320px] w-[940px] max-w-[calc(100vw-32px)] min-w-[420px] resize flex-col overflow-hidden border-2 border-[var(--vermelhao-lo)] bg-b1 shadow-[8px_8px_0_#000]'}
	style:left={celular ? undefined : `${x}px`}
	style:top={celular ? undefined : `${y}px`}
	style:width={celular ? undefined : `${largura}px`}
	style:display={min ? 'none' : undefined}
>
	<div class="flex flex-none cursor-move touch-none items-center gap-2.5 border-b-2 border-b3 bg-b0 py-1.5 pr-1.5 pl-2 select-none" role="presentation" onpointerdown={pegar} onpointermove={arrastar} onpointerup={() => (arrasto = null)}>
		{#if p}<button type="button" class="flex-none cursor-zoom-in p-0 disabled:cursor-default" disabled={!p.retrato} title={p.retrato ? 'Ver o retrato inteiro' : undefined} aria-label="Ver o retrato de {p.nome} inteiro" onclick={() => (ampliada = true)}><Retrato nome={p.nome || '?'} foto={p.retrato} tamanho={40} /></button>{/if}
		<div class="flex min-w-0 flex-1 flex-col">
			<span class="truncate font-mincho text-lg leading-6 font-bold">{p?.nome ?? 'Ficha completa'}</span>
			{#if p && f}<span class="truncate text-xs leading-4 text-mut">{[dados?.catalogo.cla ? `Clã ${dados.catalogo.cla.nome}` : null, vila?.nome.replace(/gakure$/, ''), `Nível ${p.nivel}`, rankSugerido(p.nivel).split(' ')[0]].filter(Boolean).join(' · ')}</span>{/if}
		</div>
		<a class={botao} href="/campanhas/{campanha}/personagens/{pid}" target="_blank" rel="noopener" title="Abrir a página da ficha (treino, nível, impressão) numa aba nova">PÁGINA ↗</a>
		<button type="button" class={botao} aria-label="Minimizar" title="Minimizar" onclick={aoMinimizar}>–</button>
		<button type="button" class={botao} aria-label="Fechar" title="Fechar" onclick={aoFechar}>✕</button>
	</div>

	{#if erro}
		<p class="m-4 text-sm text-err">{erro}</p>
	{:else if !p || !f}
		<div class="flex flex-1 items-center justify-center gap-2 text-sm text-mut"><Girando />Abrindo a ficha…</div>
	{:else}
		<div class="min-h-0 flex-1 overflow-y-auto">
			<BarraRecursos {f} />
			<div role="tablist" aria-label="Seções da ficha" class="mx-3 mt-3 flex overflow-x-auto border-y-2 border-ink bg-b2">
				{#each ABAS as [id, nome] (id)}
					<button type="button" role="tab" aria-selected={aba === id} class="px-3 py-3 font-pixel text-xs leading-none font-semibold tracking-[0.05em] whitespace-nowrap {aba === id ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}" onclick={() => (aba = id)}>
						{nome}{#if id === 'jutsus'}<span class="ml-1 border-2 px-1 py-0.5 text-[11px] {aba === id ? 'border-[var(--vermelhao-lo)]' : 'border-b3'}">{f.calc.jutsus.length}</span>{/if}
					</button>
				{/each}
			</div>
			<div class="flex flex-col gap-5 px-3 pt-4 pb-6" role="tabpanel">
				{#if aba === 'visao'}<AbaVisao {f} aoAbrirJutsus={() => (aba = 'jutsus')} />
				{:else if aba === 'pericias'}<AbaPericias {f} />
				{:else if aba === 'jutsus'}<AbaJutsus {f} mesa={{ medir: (j) => naMesa.medir(j.slug), usar: (j) => naMesa.usar(j.slug), podeMedir: (j) => naMesa.podeMedir(j.slug), hud: (j) => naMesa.hud(j.slug) }} />
				{:else if aba === 'cla'}<AbaCla {f} />
				{:else if aba === 'equip'}<AbaEquipamento {f} />
				{:else if aba === 'prog'}<AbaProgressao {f} pt={p.pt} xp={p.xp} registros={dados!.registros} pedidos={dados!.pedidos} aoTreinar={() => window.open(`/campanhas/${campanha}/personagens/${pid}?treino=1`, '_blank')} />
				{:else if aba === 'hist'}<AbaHistoria {f} />
				{:else if aba === 'notas'}<AbaAnotacoes ficha={p.id} inicial={p.anotacoes ?? ''} editavel={p.dono && !dados!.arquivada} />
				{:else}<AbaRegistro registros={dados!.registros} />{/if}
			</div>
		</div>
		{#if f.ultimo}
			<div role="status" class="flex flex-none items-center gap-2.5 border-t-2 border-b3 bg-b2 py-1.5 pr-1.5 pl-2.5">
				<Icone id={f.ultimo.icone} />
				<span class="min-w-0 flex-1 truncate text-sm leading-5 font-medium">{f.ultimo.texto}</span>
				{#if f.podeDesfazer}<button type="button" class={botao} onclick={() => f.desfazer()}>DESFAZER</button>{/if}
			</div>
		{/if}
	{/if}
</div>

{#if ampliada && p?.retrato}<VerImagem src={urlRetrato(p.retrato)!} alt={p.nome} aoFechar={() => (ampliada = false)} />{/if}
