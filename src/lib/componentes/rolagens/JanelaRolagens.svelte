<script lang="ts">
	// R2 · Janela de rolagens (L10): abre em qualquer tela pelo botão do canto ou pela tecla R. No desktop é uma janela
	// arrastável pela barra (ou pelas setas, com a barra em foco) e redimensionável pelo canto; no celular vira um painel
	// inferior com a alça para mudar a altura. Mostra as rolagens de todas as campanhas, ao vivo, e um rolador rápido.
	import { onMount, untrack } from 'svelte';
	import { rolador } from '#lib/rolagens/rolador.svelte.ts';
	import { diasAtras, separadorDia } from '#lib/rolagens/registro.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { Rolagem } from '#lib/supabase/banco.ts';
	import EntradaRegistro from './EntradaRegistro.svelte';
	import RoladorDados from './RoladorDados.svelte';

	const j = $derived(rolador.janela);
	let largura = $state(1440);
	let altura = $state(900);
	const desktop = $derived(largura >= 768);
	let carregadas = $state<Rolagem[]>([]);
	let ocultas = $state<{ id: string; campanha_id: string; criada_em: string; mestre: string }[]>([]);
	let carregado = false;
	let periodo = $state<'hoje' | 'd7' | 'tudo'>('tudo');
	let soMinhas = $state(false);

	async function carregar() {
		if (carregado) return;
		carregado = true;
		const desde = new Date(Date.now() - 30 * 864e5).toISOString();
		const sb = supabase();
		const [{ data }, { data: avisos }] = await Promise.all([
			sb.from('rolagens').select('*').gte('criada_em', desde).order('criada_em', { ascending: false }).limit(120),
			sb.rpc('rolagens_ocultas_do_mestre', { desde })
		]);
		carregadas = (data ?? []) as Rolagem[];
		ocultas = avisos ?? [];
	}
	$effect(() => {
		if (j.aberta && rolador.usuario) untrack(carregar);
	});

	type Item = { tipo: 'dia'; rotulo: string; hoje: boolean } | { tipo: 'oculta'; id: string; mestre: string; criada_em: string } | { tipo: 'rolagem'; r: Rolagem };
	const itens = $derived.by<Item[]>(() => {
		const vistos = new Set<string>();
		const rs = [...rolador.recentes, ...carregadas].filter((r) => !vistos.has(r.id) && !!vistos.add(r.id));
		const filtro = (iso: string) => periodo === 'tudo' || (periodo === 'hoje' ? diasAtras(iso) === 0 : diasAtras(iso) <= 6);
		const todas: (Item & { quando: string })[] = [
			...rs.filter((r) => filtro(r.criada_em) && (!soMinhas || r.autor_id === rolador.usuario)).map((r) => ({ tipo: 'rolagem' as const, r, quando: r.criada_em })),
			...(soMinhas ? [] : ocultas.filter((o) => filtro(o.criada_em)).map((o) => ({ tipo: 'oculta' as const, id: o.id, mestre: o.mestre, criada_em: o.criada_em, quando: o.criada_em })))
		].sort((a, b) => b.quando.localeCompare(a.quando));
		const saida: Item[] = [];
		let dia = '';
		for (const x of todas) {
			const d = separadorDia(x.quando);
			if (d !== dia) {
				dia = d;
				saida.push({ tipo: 'dia', rotulo: d, hoje: diasAtras(x.quando) === 0 });
			}
			saida.push(x);
		}
		return saida;
	});

	// ---------------------------------------------------------------- posição, arrasto e tamanho
	const W_MIN = 340;
	const H_MIN = 260;
	const BARRA = 48;
	const caixa = $derived.by(() => {
		const w = Math.min(Math.max(j.w, W_MIN), largura - 16);
		const h = Math.min(Math.max(j.h, H_MIN), altura - 16);
		const x = Math.min(Math.max(j.x ?? largura - w - 16, 0), Math.max(0, largura - w));
		const y = Math.min(Math.max(j.y ?? 76, 0), Math.max(0, altura - BARRA));
		return { x, y, w, h };
	});
	let arrasto = $state<'mover' | 'tamanho' | 'altura' | null>(null);
	function pegar(e: PointerEvent, modo: 'mover' | 'tamanho' | 'altura') {
		if (e.button > 0) return;
		e.preventDefault();
		const inicio = { px: e.clientX, py: e.clientY, ...caixa, alt: j.alturaMovel };
		arrasto = modo;
		const mover = (ev: PointerEvent) => {
			const dx = ev.clientX - inicio.px;
			const dy = ev.clientY - inicio.py;
			if (modo === 'mover') rolador.moverJanela(inicio.x + dx, inicio.y + dy);
			else if (modo === 'tamanho') rolador.redimensionarJanela(Math.max(W_MIN, Math.min(largura - inicio.x, inicio.w + dx)), Math.max(H_MIN, Math.min(altura - inicio.y, inicio.h + dy)));
			else rolador.alturaMovel(Math.max(140, Math.min(altura - 120, inicio.alt - dy)));
		};
		const soltar = () => {
			window.removeEventListener('pointermove', mover);
			window.removeEventListener('pointerup', soltar);
			arrasto = null;
			if (modo === 'mover') rolador.moverJanela(caixa.x, caixa.y, true);
			else if (modo === 'tamanho') rolador.redimensionarJanela(caixa.w, caixa.h, true);
			else rolador.alturaMovel(j.alturaMovel, true);
		};
		window.addEventListener('pointermove', mover);
		window.addEventListener('pointerup', soltar);
	}
	function teclasBarra(e: KeyboardEvent) {
		const d = ({ ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] } as Record<string, [number, number]>)[e.key];
		if (!d) return;
		e.preventDefault();
		rolador.moverJanela(caixa.x + d[0], caixa.y + d[1], true);
	}
	const naoArrastar = (e: Event) => e.stopPropagation();

	// tecla R abre e fecha (fora de campos de texto)
	onMount(() => {
		const tecla = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			if (e.key.toLowerCase() !== 'r' || e.metaKey || e.ctrlKey || e.altKey) return;
			if (t && (t.closest('input, textarea, select, [contenteditable="true"]') || t.isContentEditable)) return;
			rolador.alternarJanela();
		};
		window.addEventListener('keydown', tecla);
		return () => window.removeEventListener('keydown', tecla);
	});
</script>

<svelte:window bind:innerWidth={largura} bind:innerHeight={altura} />

{#if !j.aberta}
	<button
		type="button"
		class="fixed right-4 bottom-[76px] z-[46] flex min-h-[52px] items-center gap-1.5 bg-vermelhao pr-3.5 pl-2 font-pixel text-sm font-bold tracking-[0.06em] text-white shadow-[inset_0_-4px_0_var(--vermelhao-lo),4px_4px_0_var(--ink)] md:right-6 md:bottom-6"
		aria-label="Abrir rolagens (R){rolador.naoVistas ? `, ${rolador.naoVistas} novas` : ''}"
		title="Abrir rolagens (R)"
		onclick={() => rolador.alternarJanela(true)}
	>
		<img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" /><span class="max-md:sr-only">ROLAGENS</span>
		{#if rolador.naoVistas}<span class="bg-ink px-[5px] py-[3px] font-pixel text-xs leading-none text-papel">{rolador.naoVistas > 99 ? '99+' : rolador.naoVistas}</span>{/if}
	</button>
{:else}
	<div
		role="dialog"
		aria-label="Rolagens"
		class="fixed z-[45] flex flex-col border-[var(--vermelhao-lo)] bg-b2 {desktop ? 'border-2 shadow-[8px_8px_0_#000]' : 'inset-x-0 bottom-16 border-t-2 shadow-[0_-4px_0_#000]'}"
		style:left={desktop ? `${caixa.x}px` : undefined}
		style:top={desktop ? `${caixa.y}px` : undefined}
		style:width={desktop ? `${caixa.w}px` : undefined}
		style:height={desktop ? (j.minimizada ? 'auto' : `${caixa.h}px`) : j.minimizada ? 'auto' : `${Math.min(j.alturaMovel, altura - 120)}px`}
	>
		{#if !desktop}
			<div role="separator" aria-label="Arraste para mudar a altura" class="flex h-7 flex-none cursor-ns-resize touch-none items-center justify-center" onpointerdown={(e) => pegar(e, 'altura')}><span class="h-1 w-12 bg-mut"></span></div>
		{/if}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			tabindex={desktop ? 0 : -1}
			role={desktop ? 'toolbar' : undefined}
			aria-label={desktop ? 'Barra da janela de rolagens. Use as setas para mover.' : undefined}
			class="flex flex-none touch-none items-center gap-1.5 border-b-2 border-[var(--vermelhao-lo)] bg-b0 py-1 pr-1 pl-2 text-b0fg outline-focus select-none {desktop ? (arrasto === 'mover' ? 'cursor-grabbing' : 'cursor-grab') : ''}"
			onpointerdown={(e) => desktop && pegar(e, 'mover')}
			onkeydown={teclasBarra}
		>
			{#if desktop}<svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true" class="flex-none fill-b0mut"><rect x="0" y="2" width="4" height="4" /><rect x="8" y="2" width="4" height="4" /><rect x="0" y="8" width="4" height="4" /><rect x="8" y="8" width="4" height="4" /><rect x="0" y="14" width="4" height="4" /><rect x="8" y="14" width="4" height="4" /></svg>{/if}
			<img src="/icons/dado/ic-dado-d20-32.png" width="32" height="32" alt="" class="[image-rendering:pixelated]" />
			<span class="font-pixel text-sm leading-none font-bold tracking-[0.1em] text-[#D9A82B]">ROLAGENS</span>
			<span class="inline-flex items-center gap-1 font-pixel text-xs leading-none font-bold text-b0mut"><span class="h-2 w-2 bg-ok"></span>AO VIVO</span>
			{#if j.minimizada && rolador.naoVistas}<span class="bg-vermelhao px-[5px] py-[3px] font-pixel text-xs leading-none font-bold text-white">{rolador.naoVistas} NOVA{rolador.naoVistas > 1 ? 'S' : ''}</span>{/if}
			<span class="flex-1"></span>
			<button type="button" class="h-9 w-9 font-pixel text-base text-b0fg hover:bg-[#2E2420]" aria-label={j.minimizada ? 'Restaurar' : 'Minimizar'} title={j.minimizada ? 'Restaurar' : 'Minimizar'} onpointerdown={naoArrastar} onclick={() => rolador.alternarMinimizada()}>{j.minimizada ? '▢' : '—'}</button>
			<a href="/rolagens" class="flex h-9 w-9 items-center justify-center font-pixel text-base text-b0fg no-underline hover:bg-[#2E2420]" aria-label="Abrir a página do registro" title="Abrir a página do registro" onpointerdown={naoArrastar}>↗</a>
			<button type="button" class="h-9 w-9 font-pixel text-base text-b0fg hover:bg-[#2E2420]" aria-label="Fechar (R)" title="Fechar (R)" onpointerdown={naoArrastar} onclick={() => rolador.alternarJanela(false)}>✕</button>
		</div>
		{#if !j.minimizada}
			<div class="flex flex-none flex-wrap gap-1.5 border-b-2 border-b3 px-2.5 py-2">
				{#each [['hoje', 'HOJE'], ['d7', '7 DIAS'], ['tudo', 'TUDO']] as const as [p, n] (p)}
					<button type="button" aria-pressed={periodo === p} class="min-h-8 border-2 px-2 font-pixel text-xs font-bold {periodo === p ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" onclick={() => (periodo = p)}>{n}</button>
				{/each}
				<span class="flex-1"></span>
				<button type="button" aria-pressed={soMinhas} class="min-h-8 border-2 px-2 text-xs font-semibold {soMinhas ? 'border-vermelhao bg-grena text-papel' : 'border-b3 hover:border-mut'}" onclick={() => (soMinhas = !soMinhas)}>Só as minhas</button>
			</div>
			<div class="flex-none border-b-2 border-b3 bg-b2 px-2.5 py-2"><RoladorDados compacto /></div>
			<div aria-live="polite" class="flex min-h-0 flex-1 flex-col gap-1.5 overflow-auto px-2.5 py-2">
				{#each itens as it, i (it.tipo === 'rolagem' ? it.r.id : it.tipo === 'oculta' ? `o${it.id}` : `d${i}`)}
					{#if it.tipo === 'dia'}
						<div class="mt-1 flex items-center gap-2"><span class="font-pixel text-xs leading-none font-bold tracking-[0.1em]" style:color={it.hoje ? 'var(--title)' : 'var(--mut)'}>{it.rotulo}</span><span class="h-0.5 flex-1 bg-b3"></span></div>
					{:else if it.tipo === 'oculta'}
						<div class="border-2 border-dashed border-b3 px-2 py-1.5 text-xs leading-4 text-mut"><b class="text-fg">{it.mestre}</b> fez uma rolagem oculta · {new Date(it.criada_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
					{:else}
						<EntradaRegistro r={it.r} compacta campanha={rolador.campanha(it.r.campanha_id)?.nome ?? ''} vis={rolador.visibilidade(it.r)} minha={it.r.autor_id === rolador.usuario} doMestre={!!it.r.npc_id || rolador.campanha(it.r.campanha_id)?.mestreId === it.r.autor_id} />
					{/if}
				{:else}
					<span class="px-1 py-4 text-[13px] leading-[18px] text-mut">Nenhuma rolagem neste período.</span>
				{/each}
			</div>
			<div class="flex flex-none items-center gap-2 border-t-2 border-b3 bg-b1 py-1.5 pr-7 pl-2.5">
				<span class="flex-1 text-xs leading-4 text-mut">{desktop ? 'Arraste pela barra · R abre e fecha' : 'Arraste a alça para mudar a altura'}</span>
				<a href="/rolagens" class="link text-xs font-semibold">Ver registro completo</a>
			</div>
			{#if desktop}
				<div role="presentation" title="Redimensionar" class="absolute right-0 bottom-0 flex h-[22px] w-[22px] cursor-nwse-resize touch-none items-end justify-end p-[3px]" onpointerdown={(e) => pegar(e, 'tamanho')}>
					<svg width="12" height="12" viewBox="0 0 12 12" class="fill-mut" aria-hidden="true"><rect x="8" y="0" width="4" height="4" /><rect x="4" y="4" width="4" height="4" /><rect x="8" y="4" width="4" height="4" /><rect x="0" y="8" width="4" height="4" /><rect x="4" y="8" width="4" height="4" /><rect x="8" y="8" width="4" height="4" /></svg>
				</div>
			{/if}
		{/if}
	</div>
{/if}
