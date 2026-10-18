<script lang="ts">
	// R1 · Fila e R2 · Revisão (Mestre-detalhe): pendentes, aguardando o autor e histórico à esquerda; a submissão aberta à
	// direita com as verificações, o que acontece ao aprovar, comentários e as decisões. A fila avança sozinha.
	import { refreshAll } from '$app/navigation';
	import Alerta from '#lib/componentes/ui/Alerta.svelte';
	import Campo from '#lib/componentes/ui/Campo.svelte';
	import Girando from '#lib/componentes/ui/Girando.svelte';
	import Icone from '#lib/componentes/ui/Icone.svelte';
	import Modal from '#lib/componentes/ui/Modal.svelte';
	import type { EstadoFila, ItemFila, TipoFila } from '#lib/aprovacoes/tipos.ts';
	import { dataCurta, tempoRelativo } from '#lib/formatar.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import { supabase } from '#lib/supabase/cliente.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const fila = $derived(data.fila as ItemFila[]);

	let aba = $state<EstadoFila>('pendente');
	let filtroTipo = $state<TipoFila | ''>('');
	let filtroAutor = $state('');
	let ordem = $state<'antigos' | 'recentes'>('antigos');
	const TIPOS: { id: TipoFila; nome: string }[] = [
		{ id: 'ficha', nome: 'Fichas' },
		{ id: 'cla', nome: 'Clãs' },
		{ id: 'jutsu', nome: 'Jutsus' },
		{ id: 'habilidade', nome: 'Habilidades' },
		{ id: 'arma', nome: 'Armas' },
		{ id: 'marionete', nome: 'Marionetes' },
		{ id: 'item', nome: 'Itens' },
		{ id: 'pt', nome: 'PT de treino' }
	];
	const autores = $derived([...new Map(fila.filter((i) => i.autorId).map((i) => [i.autorId!, i.autor.split(' · ')[0]])).entries()]);
	const contagem = (e: EstadoFila) => fila.filter((i) => i.estado === e).length;
	const lista = $derived.by(() => {
		let l = fila.filter((i) => i.estado === aba && (!filtroTipo || i.tipo === filtroTipo) && (!filtroAutor || i.autorId === filtroAutor));
		if (aba === 'decidido') l = [...l].sort((a, b) => (b.decidido ?? '').localeCompare(a.decidido ?? '')).slice(0, 60);
		else if (ordem === 'recentes') l = [...l].reverse();
		return l;
	});
	let selecionado = $state<string | null>(null);
	const atual = $derived(lista.find((i) => i.chave === selecionado) ?? lista[0] ?? null);
	const bloqueios = (i: ItemFila) => i.verificacoes.filter((v) => v.nivel === 'bloqueio').length;
	const avisos = (i: ItemFila) => i.verificacoes.filter((v) => v.nivel === 'aviso').length;
	const dependencia = $derived(atual?.dependeDe ? (fila.find((i) => i.chave === atual!.dependeDe && i.estado === 'pendente') ?? null) : null);
	const semAlertas = $derived(fila.filter((i) => i.estado === 'pendente' && !bloqueios(i) && !avisos(i) && !i.dependeDe));

	// ---------------------------------------------------------------- decisões
	let comentario = $state('');
	let erroComentario = $state('');
	let ocupado = $state(false);
	let carimbo = $state(0);
	let modalExcecao = $state(false);
	let justificativa = $state('');

	async function decidirUm(i: ItemFila, decisao: 'aprovado' | 'ajustes' | 'rejeitado', texto: string | null) {
		const c = texto?.trim() || null;
		if (i.tipo === 'ficha') return supabase().rpc('decidir_ficha', { ficha: i.id, decisao: decisao === 'aprovado' ? 'aprovada' : decisao === 'rejeitado' ? 'rejeitada' : 'ajustes', comentario: c });
		if (i.tipo === 'cla') return supabase().rpc('decidir_cla', { cla: i.id, decisao, comentario: c });
		if (i.tipo === 'jutsu' || i.tipo === 'habilidade') return supabase().rpc('decidir_jutsu', { jutsu: i.id, decisao, comentario: c });
		if (i.tipo === 'pt') return supabase().rpc('decidir_pedido_pt', { pedido: i.id, aprovar: decisao === 'aprovado', comentario: c });
		return supabase().rpc('decidir_equipamento', { equipamento: i.id, decisao, comentario: c });
	}
	const tipoExcecao = (i: ItemFila) => (i.tipo === 'ficha' ? 'ficha' : i.tipo === 'cla' ? 'cla' : i.tipo === 'jutsu' || i.tipo === 'habilidade' ? 'jutsu' : 'equipamento');

	async function decidir(decisao: 'aprovado' | 'ajustes' | 'rejeitado', excecao = false) {
		const i = atual;
		if (!i) return;
		if (decisao !== 'aprovado' && !comentario.trim()) return (erroComentario = decisao === 'ajustes' ? 'Escreva um comentário para solicitar ajustes.' : 'Informe o motivo para rejeitar.');
		if (excecao && !justificativa.trim()) return;
		ocupado = true;
		const indice = lista.findIndex((x) => x.chave === i.chave);
		const { error } = await decidirUm(i, decisao, comentario);
		if (!error && excecao) {
			const { error: e2 } = await supabase().rpc('registrar_excecao', { tipo: tipoExcecao(i), alvo: i.id, justificativa: justificativa.trim() });
			if (e2) toasts.mostrar('Aprovado, mas a justificativa não foi registrada.', 'erro');
		}
		ocupado = false;
		if (error) return toasts.mostrar(error.message.length < 140 ? error.message : 'Não foi possível registrar a decisão.', 'erro', 7000);
		modalExcecao = false;
		comentario = '';
		erroComentario = '';
		justificativa = '';
		carimbo++;
		toasts.mostrar(
			decisao === 'aprovado' ? `${excecao ? 'Aprovado com exceção' : 'Selo aplicado'}: “${i.titulo}” agora faz parte da campanha.` : decisao === 'ajustes' ? 'Ajustes enviados ao autor.' : 'Submissão rejeitada.',
			'sucesso',
			5000
		);
		await refreshAll();
		// avança para o próximo da fila
		selecionado = lista[Math.min(indice, lista.length - 1)]?.chave ?? null;
	}

	async function aprovarAmbos() {
		if (!atual || !dependencia) return;
		ocupado = true;
		const r1 = await decidirUm(dependencia, 'aprovado', null);
		const r2 = r1.error ? r1 : await decidirUm(atual, 'aprovado', null);
		ocupado = false;
		if (r2.error) return toasts.mostrar(r2.error.message, 'erro', 7000);
		carimbo++;
		toasts.mostrar(`${dependencia.titulo} e ${atual.titulo} aprovados juntos.`, 'sucesso', 5000);
		await refreshAll();
		selecionado = lista[0]?.chave ?? null;
	}

	async function aprovarLote() {
		if (!semAlertas.length) return;
		ocupado = true;
		let ok = 0;
		for (const i of semAlertas) {
			const { error } = await decidirUm(i, 'aprovado', null);
			if (!error) ok++;
		}
		ocupado = false;
		carimbo++;
		toasts.mostrar(`${ok} ${ok === 1 ? 'item aprovado' : 'itens aprovados'}.`, 'sucesso', 5000);
		await refreshAll();
		selecionado = null;
	}

	const NIVEL = {
		ok: { rotulo: 'Ok', cor: 'var(--ok)', icone: 'status/ic-status-aprovado' },
		aviso: { rotulo: 'Aviso', cor: 'var(--warn)', icone: 'callout/ic-callout-atencao' },
		bloqueio: { rotulo: 'Bloqueio', cor: 'var(--err)', icone: 'status/ic-status-rejeitado' }
	} as const;
	const ROTULO_DECISAO: Record<string, { texto: string; cor: string }> = {
		aprovado: { texto: 'APROVADO', cor: 'var(--ok)' },
		aprovada: { texto: 'APROVADO', cor: 'var(--ok)' },
		rejeitado: { texto: 'REJEITADO', cor: 'var(--err)' },
		rejeitada: { texto: 'REJEITADO', cor: 'var(--err)' },
		ajustes: { texto: 'AJUSTES', cor: 'var(--info)' }
	};
	let detalhe: HTMLElement | undefined = $state();
	function abrir(chave: string) {
		selecionado = chave;
		comentario = '';
		erroComentario = '';
		if (window.matchMedia('(max-width: 1023px)').matches) setTimeout(() => detalhe?.scrollIntoView({ behavior: 'smooth' }), 50);
	}
</script>

<div class="flex min-h-0 flex-1 max-lg:flex-col">
	<!-- R1 · fila -->
	<section class="flex w-full flex-none flex-col border-b3 bg-b2 lg:w-[400px] lg:border-r-2" aria-label="Fila de aprovações">
		<div class="flex border-b-2 border-ink font-pixel text-xs leading-none font-bold tracking-[0.04em]" role="tablist">
			{#each [['pendente', 'PENDENTES'], ['aguardando', 'AGUARDANDO'], ['decidido', 'HISTÓRICO']] as [e, n] (e)}
				<button type="button" role="tab" aria-selected={aba === e} class="flex-1 px-1.5 py-3.5 text-center {aba === e ? 'bg-vermelhao text-white' : 'text-mut hover:text-fg'}" onclick={() => ((aba = e as EstadoFila), (selecionado = null))}>
					{aba === e ? '▸ ' : ''}{n}{e !== 'decidido' ? ` ${contagem(e as EstadoFila)}` : ''}
				</button>
			{/each}
		</div>
		<div class="flex flex-wrap items-center gap-1.5 border-b-2 border-b3 px-3 py-2">
			<select class="campo h-9 w-auto pr-7 text-[13px]" aria-label="Tipo" bind:value={filtroTipo}>
				<option value="">Tipo</option>
				{#each TIPOS as t (t.id)}<option value={t.id}>{t.nome}</option>{/each}
			</select>
			<select class="campo h-9 w-auto pr-7 text-[13px]" aria-label="Jogador" bind:value={filtroAutor}>
				<option value="">Jogador</option>
				{#each autores as [id, n] (id)}<option value={id}>{n}</option>{/each}
			</select>
			<span class="flex-1"></span>
			{#if aba !== 'decidido'}
				<select class="campo h-9 w-auto border-0 bg-transparent pr-7 text-xs text-mut" aria-label="Ordem" bind:value={ordem}>
					<option value="antigos">Mais antigos</option>
					<option value="recentes">Mais recentes</option>
				</select>
			{/if}
		</div>
		<ul class="m-0 flex-1 list-none overflow-auto p-0 lg:max-h-[calc(100vh-260px)]">
			{#each lista as i (i.chave)}
				{@const on = atual?.chave === i.chave}
				{@const dec = i.estado === 'decidido' ? ROTULO_DECISAO[i.status] : null}
				<li>
					<button type="button" class="flex w-full items-start gap-2.5 border-b-2 border-b3 px-3 py-2.5 text-left {on ? 'bg-grena text-papel shadow-[inset_4px_0_0_#C44536]' : 'hover:bg-b3'}" aria-current={on || undefined} onclick={() => abrir(i.chave)}>
						<Icone id={i.icone} />
						<span class="flex min-w-0 flex-1 flex-col gap-[3px]">
							<span class="flex items-center gap-1.5"><span class="truncate text-[15px] leading-5 font-semibold">{i.titulo}</span>{#if i.versao > 1}<span class="border-2 border-b3 px-1 py-0.5 font-pixel text-xs leading-none font-bold">V{i.versao}</span>{/if}</span>
							<span class="text-xs leading-4 opacity-75">{i.rotuloTipo} · {i.autor}{i.enviado ? ` · ${tempoRelativo(i.enviado)}` : ''}</span>
							{#if i.dependeDe && i.estado === 'pendente'}<span class="text-xs leading-4 font-semibold text-warn">depende de: {fila.find((x) => x.chave === i.dependeDe)?.titulo}</span>{/if}
							{#if dec}<span class="font-pixel text-xs font-bold" style:color={dec.cor}>{dec.texto}{i.excecao ? ' · EXCEÇÃO' : ''}{i.decidido ? ` · ${dataCurta(i.decidido)}` : ''}</span>{/if}
						</span>
						<span class="flex items-center gap-1 font-pixel text-xs font-bold">
							{#if i.estado !== 'decidido'}
								{#if avisos(i)}<span class="text-warn" title="{avisos(i)} aviso(s)">⚠ {avisos(i)}</span>{/if}
								{#if bloqueios(i)}<span class="text-err" title="{bloqueios(i)} bloqueio(s)">✖ {bloqueios(i)}</span>{/if}
							{/if}
						</span>
					</button>
				</li>
			{:else}
				<li class="px-4 py-8 text-center text-sm text-mut">{aba === 'pendente' ? 'Nada pendente.' : aba === 'aguardando' ? 'Ninguém está ajustando nada agora.' : 'Nenhuma decisão ainda.'}</li>
			{/each}
		</ul>
		{#if aba === 'pendente'}
			<div class="flex items-center gap-2 border-t-2 border-ink px-3 py-2.5">
				<span class="flex-1 text-[13px] leading-[18px] text-mut">{semAlertas.length ? `${semAlertas.length} sem alertas` : 'Nenhum item sem alertas'}</span>
				<button type="button" class="btn-jogo btn-contorno min-h-10 text-xs" disabled={!semAlertas.length || ocupado} onclick={aprovarLote}>APROVAR SEM ALERTAS</button>
			</div>
		{/if}
	</section>

	<!-- R2 · revisão -->
	<section bind:this={detalhe} class="flex min-w-0 flex-1 flex-col" aria-label="Revisão">
		{#if atual}
			{@const i = atual}
			<header class="flex flex-wrap items-center gap-3.5 border-b-2 border-b3 px-4 py-4 md:px-6">
				<Icone id={i.icone} />
				<span class="flex min-w-0 flex-1 flex-col gap-1">
					<span class="font-mincho text-2xl leading-[30px] font-bold">{i.titulo}</span>
					<span class="text-[13px] leading-[18px] text-mut">{i.rotuloTipo} · {i.autor}{i.enviado ? ` · enviado ${tempoRelativo(i.enviado)}` : ''}</span>
				</span>
				{#if i.versao > 1}<span class="border-2 border-frame px-2.5 py-2 font-pixel text-xs font-bold">V{i.versao}</span>{/if}
				{#if i.href}<a href={i.href} class="btn-jogo btn-contorno min-h-10 text-xs">ABRIR COMPLETO</a>{/if}
			</header>
			<div class="grid flex-1 items-start gap-5 px-4 py-5 md:px-6 xl:grid-cols-[minmax(0,1fr)_340px]">
				<div class="flex min-w-0 flex-col gap-4">
					{#if i.excecao}<Alerta tipo="aviso" titulo="Exceção do Mestre"><span>“{i.excecao}”</span></Alerta>{/if}
					<article class="flex border-2 border-[#8B2E20] bg-b2 shadow-[4px_4px_0_var(--ink)]">
						<div class="w-1 flex-none" style:background={i.cor}></div>
						<div class="min-w-0 flex-1">
							<div class="flex items-start gap-2.5 bg-grena px-4 py-3">
								<span class="flex flex-1 flex-col gap-0.5"><span class="font-mincho text-[22px] leading-7 font-bold text-papel">{i.titulo}</span>{#if i.subtitulo}<span class="text-[13px] leading-[18px] text-papel-2 italic">{i.subtitulo}</span>{/if}</span>
								{#if i.rank}<Icone id="rank/ic-rank-{i.rank.toLowerCase()}" alt="Rank {i.rank}" />{/if}
								{#if i.custo}<span class="t-num text-[22px] leading-none text-papel">{i.custo}</span>{/if}
							</div>
							<div class="flex flex-col gap-2 px-4 py-3.5 text-[15px] leading-[23px]">{#each i.corpo as b (b)}<p class="m-0">{b}</p>{/each}</div>
						</div>
					</article>
					<div class="flex flex-col gap-2">
						<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">VERIFICAÇÃO DE REGRAS</span>
						{#each [...i.verificacoes].sort((a, b) => ['bloqueio', 'aviso', 'ok'].indexOf(a.nivel) - ['bloqueio', 'aviso', 'ok'].indexOf(b.nivel)) as v, n (n)}
							{@const nv = NIVEL[v.nivel]}
							<div class="flex items-center gap-2 border-2 py-1 pr-3 pl-1" style:border-color={nv.cor} style:background="color-mix(in srgb, {nv.cor} 10%, transparent)">
								<Icone id={nv.icone} alt={nv.rotulo} /><span class="flex-1 text-sm leading-5 font-semibold">{nv.rotulo} · {v.texto}</span><span class="text-xs text-mut">{v.ref}</span>
							</div>
						{:else}
							<span class="text-sm text-mut">Sem verificações automáticas.</span>
						{/each}
					</div>
					{#if i.estado === 'pendente'}
						<div class="flex flex-col gap-1.5 border-2 border-frame bg-b2 px-3.5 py-3">
							<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">AO APROVAR</span>
							{#each i.efeitos as e (e)}<span class="text-sm leading-[21px]">▸ {e}</span>{/each}
						</div>
					{/if}
					{#if dependencia}
						<div class="flex flex-wrap items-center gap-2.5 border-2 border-warn py-1.5 pr-3 pl-1.5 text-sm font-semibold" style:background="color-mix(in srgb, var(--warn) 12%, transparent)">
							<Icone id="status/ic-status-em-revisao" /><span class="flex-1">Aprove primeiro o {dependencia.titulo}.</span>
							<button type="button" class="btn-jogo btn-contorno min-h-10 border-warn text-xs" disabled={ocupado || !!bloqueios(dependencia)} title={bloqueios(dependencia) ? 'O clã tem bloqueios: revise-o antes' : undefined} onclick={aprovarAmbos}>APROVAR AMBOS</button>
						</div>
					{/if}
				</div>
				<div class="flex flex-col gap-2.5">
					<span class="font-pixel text-xs leading-none font-bold tracking-[0.1em] text-title">COMENTÁRIOS</span>
					{#each i.comentarios as c, n (n)}
						<div class="flex flex-col gap-1 border-2 border-frame bg-b2 p-2.5"><span class="text-[13px] leading-[18px] font-semibold">{c.autor === 'Autor' ? i.autor.split(' · ')[0] : 'Você (Mestre)'}</span><span class="text-sm leading-[21px]">{c.texto}</span></div>
					{:else}
						<span class="text-[13px] text-mut">Sem comentários.</span>
					{/each}
					{#if i.estado === 'pendente'}
						<Campo id="r2-comentario" rotulo="Comentário para o autor" erro={erroComentario}>
							<textarea id="r2-comentario" class="campo h-auto min-h-[96px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="2000" placeholder="Explique o que precisa mudar e por quê." bind:value={comentario} oninput={() => (erroComentario = '')}></textarea>
						</Campo>
					{/if}
				</div>
			</div>
			{#if i.estado === 'pendente'}
				<footer class="sticky bottom-16 flex flex-wrap items-center gap-2.5 border-t-2 border-ink bg-b0 px-4 py-2.5 md:bottom-0 md:px-6">
					<span class="text-sm font-semibold text-b0fg">{avisos(i)} aviso{avisos(i) === 1 ? '' : 's'} · {bloqueios(i)} bloqueio{bloqueios(i) === 1 ? '' : 's'}</span>
					<span class="flex-1"></span>
					<button type="button" class="btn-jogo min-h-11 border-2 border-err bg-transparent text-err" disabled={ocupado} onclick={() => decidir('rejeitado')}>REJEITAR</button>
					{#if i.tipo !== 'pt'}<button type="button" class="btn-jogo btn-secundario" disabled={ocupado} onclick={() => decidir('ajustes')}>SOLICITAR AJUSTES</button>{/if}
					{#if bloqueios(i)}
						<button type="button" class="btn-jogo com-icone bg-acc text-accfg" disabled={ocupado || !!dependencia} title={dependencia ? 'Aprove primeiro a dependência' : undefined} onclick={() => (modalExcecao = true)}><Icone id="status/ic-status-excecao-mestre" />APROVAR COM EXCEÇÃO</button>
					{:else}
						<button type="button" class="btn-jogo btn-primario com-icone" disabled={ocupado || !!dependencia} title={dependencia ? 'Aprove primeiro a dependência' : undefined} onclick={() => decidir('aprovado')}>{#if ocupado}<Girando />{:else}<Icone id="status/ic-status-aprovado" />{/if}APROVAR</button>
					{/if}
				</footer>
			{/if}
		{:else}
			<div class="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
				<img src="/illustrations/il-cha-96.png" width="96" height="96" alt="" class="[image-rendering:pixelated]" />
				<span class="font-mincho text-2xl leading-8 font-bold">{aba === 'pendente' ? 'Nada para revisar. Hora do chá, Mestre.' : 'Nada por aqui.'}</span>
			</div>
		{/if}
	</section>
</div>

{#key carimbo}
	{#if carimbo}<img src="/illustrations/il-aprovado-96.png" width="96" height="96" alt="" class="carimbo pointer-events-none fixed right-8 bottom-24 z-40 [image-rendering:pixelated]" aria-hidden="true" />{/if}
{/key}

{#if modalExcecao && atual}
	<Modal rotulo="Aprovar com exceção" largura={520} topo={140} aoFechar={() => !ocupado && (modalExcecao = false)}>
		<div class="flex items-center gap-2 bg-grena px-4 py-3"><Icone id="status/ic-status-excecao-mestre" /><h2 class="m-0 font-mincho text-xl leading-[26px] font-bold text-papel">Aprovar com exceção</h2></div>
		<form
			class="flex flex-col gap-3 p-4"
			onsubmit={(e) => {
				e.preventDefault();
				decidir('aprovado', true);
			}}
		>
			<p class="m-0 text-sm leading-[21px]">“{atual.titulo}” tem {bloqueios(atual)} bloqueio{bloqueios(atual) > 1 ? 's' : ''}: {atual.verificacoes.filter((v) => v.nivel === 'bloqueio').map((v) => v.texto).join('; ')}.</p>
			<Campo id="exc-just" rotulo="Justificativa" obrigatorio ajuda="O badge “Exceção do Mestre” mostra esta justificativa a todos.">
				<textarea id="exc-just" class="campo h-auto min-h-[72px] resize-y py-2.5 text-[15px] leading-[22px]" maxlength="500" bind:value={justificativa}></textarea>
			</Campo>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn-jogo btn-fantasma" disabled={ocupado} onclick={() => (modalExcecao = false)}>CANCELAR</button>
				<button type="submit" class="btn-jogo bg-acc text-accfg" disabled={ocupado || !justificativa.trim()}>{#if ocupado}<Girando />{/if}APROVAR COM EXCEÇÃO</button>
			</div>
		</form>
	</Modal>
{/if}
