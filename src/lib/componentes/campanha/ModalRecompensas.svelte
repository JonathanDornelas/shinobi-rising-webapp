<script lang="ts">
	// C8 · Conceder recompensas: XP por rank de missão (cap. 17), PT bônus (cap. 18), ryo, motivo,
	// PD da sessão e PIC do arco, com prévia de quem alcança um nível novo.
	import { refreshAll } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { numero } from '#lib/formatar.ts';
	import { xpDoNivel } from '#lib/personagem/progressao.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import IconeCla from '../cla/IconeCla.svelte';
	import Campo from '../ui/Campo.svelte';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Ficha {
		id: string;
		nome: string;
		nivel: number;
		xp: number;
		cla: string | null | undefined;
		claNome?: string | null;
		claBrasao?: { kamon: string; cor: string } | null;
	}
	let { campanha, fichas, aoFechar }: { campanha: string; fichas: Ficha[]; aoFechar: () => void } = $props();

	const RANKS = [
		{ r: 'E', xp: 50 },
		{ r: 'D', xp: 100 },
		{ r: 'C', xp: 200 },
		{ r: 'B', xp: 400 },
		{ r: 'A', xp: 800 },
		{ r: 'S', xp: 1500 }
	];
	// svelte-ignore state_referenced_locally
	let selecionadas = $state<string[]>(fichas.map((f) => f.id));
	let rank = $state<string | null>('C');
	let xp = $state(200);
	let pt = $state(1);
	let ryo = $state<number | null>(null);
	let motivo = $state('');
	let pd = $state(true);
	let pic = $state(false);
	let enviando = $state(false);
	let erro = $state('');

	function escolherRank(r: (typeof RANKS)[number]) {
		rank = r.r;
		xp = r.xp;
		pt = ['C', 'B', 'A', 'S'].includes(r.r) ? 1 : 0;
		if (!motivo.trim() || /^Missão Rank [EDCBAS]/.test(motivo)) motivo = `Missão Rank ${r.r}`;
	}
	const alternar = (id: string) => (selecionadas = selecionadas.includes(id) ? selecionadas.filter((x) => x !== id) : [...selecionadas, id]);
	const nivelDoXp = (total: number) => {
		let n = 1;
		for (let i = 1; i <= 20; i++) if (total >= xpDoNivel(i)) n = i;
		return n;
	};
	const previa = $derived(
		fichas
			.filter((f) => selecionadas.includes(f.id))
			.map((f) => ({ ...f, depois: f.xp + (xp || 0), alcanca: nivelDoXp(f.xp + (xp || 0)) > Math.max(f.nivel, nivelDoXp(f.xp)) ? nivelDoXp(f.xp + (xp || 0)) : null }))
	);
	const nada = $derived(!xp && !pt && !ryo && !pd && !pic);

	async function conceder(e: SubmitEvent) {
		e.preventDefault();
		erro = '';
		if (!selecionadas.length) return (erro = 'Selecione ao menos um personagem.');
		if (!motivo.trim()) return (erro = 'Diga o motivo da recompensa.');
		if (nada) return (erro = 'Nada para conceder.');
		enviando = true;
		const { error } = await supabase().rpc('conceder_recompensa', {
			campanha,
			fichas: selecionadas,
			xp: Math.max(0, Math.round(xp || 0)),
			pt: Math.max(0, Math.round(pt || 0)),
			ryo: Math.max(0, Math.round(ryo || 0)),
			motivo: motivo.trim(),
			restaurar_pd: pd,
			renovar_pic: pic
		});
		enviando = false;
		if (error) return (erro = 'Não foi possível conceder agora. Tente de novo.');
		toasts.mostrar(`Recompensas concedidas a ${selecionadas.length} ${selecionadas.length === 1 ? 'personagem' : 'personagens'}.`, 'sucesso');
		await refreshAll();
		aoFechar();
	}
</script>

<Modal rotulo="Conceder recompensas" largura={760} topo={80} {aoFechar}>
	<div class="flex items-center gap-2.5 bg-grena py-3 pr-3 pl-5">
		<Icone id="acao/ic-acao-conceder" />
		<h2 class="m-0 flex-1 font-mincho text-[22px] leading-7 font-bold text-papel">Conceder recompensas</h2>
		<button type="button" class="flex h-11 w-11 items-center justify-center text-papel" aria-label="Fechar" onclick={aoFechar}>✕</button>
	</div>
	<form class="flex flex-col" onsubmit={conceder} novalidate>
		<div class="grid gap-5 p-5 md:grid-cols-2">
			<fieldset class="m-0 flex flex-col gap-2 border-0 p-0">
				<legend class="sr-only">Personagens</legend>
				<div class="flex items-center">
					<span class="t-rotulo flex-1 text-xs" aria-hidden="true">Personagens</span>
					<button type="button" class="link text-[13px] font-semibold" onclick={() => (selecionadas = fichas.map((f) => f.id))}>Todos</button>
				</div>
				{#each fichas as f (f.id)}
					{@const on = selecionadas.includes(f.id)}
					<label class="flex min-h-12 cursor-pointer items-center gap-2.5 border-2 bg-b1 px-2.5 {on ? 'border-vermelhao' : 'border-b3'}">
						<input type="checkbox" class="caixa" checked={on} onchange={() => alternar(f.id)} />
						<IconeCla resumo={f} />
						<span class="flex-1 text-[15px] leading-5 font-semibold">{f.nome}</span>
						<span class="t-num text-[13px] text-mut">NV {f.nivel}</span>
					</label>
				{:else}
					<p class="m-0 text-sm text-mut">Nenhuma ficha aprovada e ativa ainda.</p>
				{/each}
			</fieldset>
			<div class="flex flex-col gap-3">
				<span class="t-rotulo text-xs" id="rot-rank">XP por rank de missão</span>
				<div class="grid grid-cols-6 border-2 border-frame" role="group" aria-labelledby="rot-rank">
					{#each RANKS as r, i (r.r)}
						<button type="button" aria-pressed={rank === r.r} class="flex min-h-[52px] flex-col items-center justify-center gap-1 {i ? 'border-l-2 border-frame' : ''} {rank === r.r ? 'bg-vermelhao text-white' : ''}" onclick={() => escolherRank(r)}>
							<span class="t-num text-[15px]">{r.r}</span><span class="t-num text-xs">{r.xp}</span>
						</button>
					{/each}
				</div>
				<div class="grid grid-cols-3 gap-2">
					<Campo id="rc-xp" rotulo="XP"><input id="rc-xp" type="number" min="0" class="campo t-num" bind:value={xp} oninput={() => (rank = null)} /></Campo>
					<Campo id="rc-pt" rotulo="PT bônus"><input id="rc-pt" type="number" min="0" max="100" class="campo t-num" bind:value={pt} /></Campo>
					<Campo id="rc-ryo" rotulo="Ryo"><input id="rc-ryo" type="number" min="0" step="100" class="campo t-num" placeholder="0" bind:value={ryo} /></Campo>
				</div>
				<Campo id="rc-motivo" rotulo="Motivo" obrigatorio>
					<input id="rc-motivo" class="campo" maxlength="200" placeholder="Missão Rank C: escolta ao País das Ondas" bind:value={motivo} />
				</Campo>
				<label class="flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium"><input type="checkbox" class="caixa h-5 w-5" bind:checked={pd} />Nova sessão: restaurar 1 PD de todos</label>
				<label class="flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium"><input type="checkbox" class="caixa h-5 w-5" bind:checked={pic} />Novo arco: renovar PIC</label>
			</div>
		</div>
		<section class="mx-5 border-2 border-b3 bg-b1" aria-label="Prévia">
			<h3 class="t-rotulo m-0 border-b-2 border-b3 px-3 py-2.5 text-xs">Prévia</h3>
			{#each previa as x (x.id)}
				<div class="flex flex-wrap items-center gap-2.5 border-b-2 border-b3 px-3 py-2 last:border-b-0" style:background={x.alcanca ? 'rgba(217,168,43,.10)' : undefined}>
					<span class="flex-1 text-sm leading-5 font-medium"><b>{x.nome.split(' ')[0]}:</b> {numero(x.xp)} → {numero(x.depois)} XP</span>
					{#if x.alcanca}
						<span class="inline-flex items-center gap-1 bg-acc py-1 pr-2 pl-0.5 font-pixel text-xs leading-none font-bold tracking-[0.06em] text-accfg"><Icone id="acao/ic-acao-subir-nivel" />ALCANÇA O NÍVEL {x.alcanca}!</span>
					{/if}
				</div>
			{:else}
				<p class="m-0 px-3 py-3.5 text-sm text-mut">Selecione ao menos um personagem.</p>
			{/each}
		</section>
		{#if erro}<p class="m-0 mx-5 mt-3 text-[13px] font-semibold text-err" role="alert">{erro}</p>{/if}
		<div class="flex flex-wrap items-center justify-end gap-2 px-5 py-4">
			<button type="button" class="btn-jogo btn-fantasma" disabled={enviando} onclick={aoFechar}>CANCELAR</button>
			<button type="submit" class="btn-jogo {selecionadas.length && !nada ? 'btn-primario' : 'bg-b3 text-mut'}" disabled={enviando || !selecionadas.length || nada} aria-busy={enviando}>
				{#if enviando}<Girando />{/if}{selecionadas.length ? `CONCEDER A ${selecionadas.length} ${selecionadas.length === 1 ? 'PERSONAGEM' : 'PERSONAGENS'}` : 'CONCEDER'}
			</button>
		</div>
	</form>
</Modal>
