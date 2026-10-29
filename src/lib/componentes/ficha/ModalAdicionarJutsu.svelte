<script lang="ts">
	// O Mestre dá um jutsu a um NPC de ficha completa, de graça (conceder_jutsu): qualquer jutsu do livro, de qualquer
	// clã, ou criado e aprovado na campanha. A janela fica aberta para dar vários; o que entra some da lista.
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { TIPO_JUTSU } from '#lib/livro/dominio.ts';
	import { normalizar } from '#lib/livro/texto.ts';
	import type { TipoJutsu } from '#lib/livro/tipos.ts';
	import type { JutsuFicha } from '#lib/personagem/progressao.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import Girando from '../ui/Girando.svelte';
	import Icone from '../ui/Icone.svelte';
	import Modal from '../ui/Modal.svelte';
	import Traco from '../ui/Traco.svelte';

	interface Props {
		ficha: string;
		nome: string;
		/** Jutsus que o NPC ainda não conhece. */
		opcoes: JutsuFicha[];
		aoFechar: () => void;
	}
	let { ficha, nome, opcoes, aoFechar }: Props = $props();

	const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
	let busca = $state('');
	let rank = $state('');
	let tipo = $state('');
	let dando = $state<string | null>(null);
	const tipos = $derived([...new Set(opcoes.map((j) => j.tipo))].sort((a, b) => Object.keys(TIPO_JUTSU).indexOf(a) - Object.keys(TIPO_JUTSU).indexOf(b)));
	const visiveis = $derived.by(() => {
		const q = normalizar(busca);
		return opcoes
			.filter((j) => (!rank || j.rank === rank) && (!tipo || j.tipo === tipo) && (!q || normalizar(`${j.nome} ${j.traducao ?? ''} ${j.origem}`).includes(q)))
			.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || a.nome.localeCompare(b.nome, 'pt-BR'));
	});
	const LIMITE = 80;

	async function dar(j: JutsuFicha) {
		dando = j.slug;
		const { error } = await supabase().rpc('conceder_jutsu', { ficha, slug: j.slug, nome: j.nome, custo_pt: 0 });
		if (error) {
			dando = null;
			return toasts.mostrar(error.message.length < 140 ? error.message : 'Não foi possível dar o jutsu.', 'erro', 6000);
		}
		await invalidateAll();
		dando = null;
		toasts.mostrar(`${j.nome} entrou na ficha de ${nome}.`, 'sucesso');
	}
</script>

<Modal rotulo="Dar um jutsu a {nome}" largura={640} topo={72} aoFechar={() => !dando && aoFechar()}>
	<div class="flex items-center gap-2 bg-grena py-2 pr-2 pl-5">
		<Icone id="acao/ic-acao-conceder" />
		<h2 class="m-0 flex-1 font-mincho text-[22px] leading-7 font-bold text-papel">Dar um jutsu a {nome}</h2>
		<button type="button" class="flex h-11 w-11 items-center justify-center text-papel" aria-label="Fechar" onclick={aoFechar}><Traco nome="fechar" /></button>
	</div>
	<div class="flex flex-col gap-3 p-4 md:p-5">
		<p class="m-0 text-sm leading-5 text-mut">Entra como aprendido, sem gastar PT. Vale qualquer jutsu do livro, de qualquer clã, e os criados e aprovados na campanha.</p>
		<div class="flex flex-wrap gap-2">
			<label class="campo flex h-11 min-w-0 flex-1 basis-56 items-center gap-2.5">
				<span class="text-mut"><Traco nome="buscar" /></span>
				<!-- svelte-ignore a11y_autofocus -->
				<input bind:value={busca} type="search" autofocus placeholder="Nome, tradução ou origem" aria-label="Buscar jutsu" class="min-w-0 flex-1 bg-transparent text-base text-fg outline-none" />
			</label>
			<select class="campo h-11 pr-8 text-sm" aria-label="Tipo" bind:value={tipo}>
				<option value="">Todos os tipos</option>
				{#each tipos as t (t)}<option value={t}>{t}</option>{/each}
			</select>
			<select class="campo h-11 pr-8 text-sm" aria-label="Rank" bind:value={rank}>
				<option value="">Todos os ranks</option>
				{#each RANKS as r (r)}<option value={r}>Rank {r}</option>{/each}
			</select>
		</div>
		<span class="text-[13px] font-semibold text-mut" aria-live="polite">{visiveis.length} {visiveis.length === 1 ? 'jutsu' : 'jutsus'}{visiveis.length > LIMITE ? ` · mostrando ${LIMITE}, refine a busca` : ''}</span>
		<ul class="m-0 flex max-h-[min(56vh,520px)] list-none flex-col gap-1.5 overflow-y-auto p-0 pr-1">
			{#each visiveis.slice(0, LIMITE) as j (j.slug)}
				{@const t = TIPO_JUTSU[j.tipo as TipoJutsu] ?? TIPO_JUTSU.Ninjutsu}
				<li class="grid grid-cols-[4px_32px_minmax(0,1fr)_auto_auto] items-center gap-2.5 border-2 border-b3 bg-b2 py-1 pr-1">
					<span class="-my-1 self-stretch" style:background={t.cor}></span>
					<Icone id="rank/ic-rank-{j.rank.toLowerCase()}" alt="Rank {j.rank}" />
					<span class="flex min-w-0 flex-col">
						<span class="truncate font-mincho text-[15px] leading-5 font-bold">{j.nome}</span>
						<span class="truncate text-xs leading-4 text-mut">{j.tipo} · {j.origem}</span>
					</span>
					<span class="t-num text-sm whitespace-nowrap">{j.custo}</span>
					<button type="button" class="btn-jogo btn-contorno min-h-9 px-2.5 text-xs" disabled={!!dando} aria-busy={dando === j.slug} aria-label="Dar {j.nome}" onclick={() => dar(j)}>{#if dando === j.slug}<Girando />{/if}DAR</button>
				</li>
			{:else}
				<li class="border-2 border-dashed border-b3 p-6 text-center text-sm font-semibold">Nenhum jutsu com essa busca.</li>
			{/each}
		</ul>
	</div>
</Modal>
