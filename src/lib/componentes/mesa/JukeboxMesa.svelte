<script lang="ts">
	// Jukebox da Mesa: o Mestre cola um link do YouTube ou do Spotify e todos ouvem igual. Nenhum vídeo ou player aparece:
	// cada navegador toca o player oficial escondido (reprodutor/) e o cartão mostra só a faixa, a barra, os botões e o
	// volume. O estado vive na campanha (tocar, pausar, posição, faixa da lista) com a hora do servidor, então quem
	// entra depois acerta sozinho; o Mestre controla, cada pessoa liga e desliga o próprio som ("OUVIR").
	import { onMount, untrack } from 'svelte';
	import { ler, gravar as guardar } from '#lib/estado/armazenamento.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { desvioDoRelogio, lerLink, limitarPosicao, linkDe, posicaoAgora, precisaAcertar, vizinho, type FonteMusica } from '#lib/mesa/musica.ts';
	import { criarReprodutor } from '#lib/mesa/reprodutor/fabrica.ts';
	import { relogio, type EstadoReprodutor, type FaixaInfo, type EventoReprodutor, type Reprodutor } from '#lib/mesa/reprodutor/tipos.ts';
	import type { UiMesa } from '#lib/mesa/ui.svelte.ts';
	import type { MesaJukebox } from '#lib/supabase/banco.ts';
	import { supabase } from '#lib/supabase/cliente.ts';

	let { mesa, ui, classe = '' }: { mesa: Mesa; ui: UiMesa; classe?: string } = $props();

	const j = $derived(mesa.jukebox);
	const aberto = $derived(ui.pop === 'musica');
	const prefs = ler<{ ouvindo?: boolean; volume?: number }>('musica-mesa', {});
	let ouvindo = $state(prefs.ouvindo ?? false);
	let volume = $state(Math.min(100, Math.max(0, prefs.volume ?? 60)));
	let link = $state('');
	let erroLink = $state('');
	let bloqueado = $state(false);
	let falha = $state('');
	let carregando = $state(false);
	let fila = $state<FaixaInfo[]>([]);
	const vazio: EstadoReprodutor = { pronto: false, tocando: false, posicao: 0, duracao: 0, indice: 0, total: 0, titulo: null, artista: null, aoVivo: false, erro: null };
	let est = $state<EstadoReprodutor>(vazio);
	let alvoEl = $state<HTMLDivElement>();

	// a hora do servidor menos a deste navegador, em ms
	let desvio = 0;
	const agora = () => Date.now() + desvio;
	onMount(async () => {
		const a = Date.now();
		const { data } = await supabase().rpc('agora_servidor');
		if (data) desvio = desvioDoRelogio(data, a, Date.now());
	});

	// o reprodutor muda de mãos sem ser observado por dentro: só a troca dele avisa a tela
	let r = $state.raw<Reprodutor | null>(null);
	let chave = '';
	// o que o nosso próprio comando causa no player não volta para o banco como "o Mestre mexeu"
	let silencio = 0;
	const silenciar = (ms = 2500) => (silencio = Date.now() + ms);
	// um temporizador por tipo de aviso: um "estado" logo depois de um "fim" não pode engolir o fim
	const esperas: Record<string, ReturnType<typeof setTimeout>> = {};
	let bloqueio: ReturnType<typeof setTimeout> | undefined;

	/** Onde a música está, no que o banco guarda (ao vivo vale 0). */
	const posDe = (s: EstadoReprodutor) => limitarPosicao(s.posicao, s.aoVivo);
	const atual = () => (j ? (r ? posDe(r.estado()) : j.tocando ? posicaoAgora(j, agora()) : j.posicao) : 0);
	/** Grava no banco; sem posição no pedido, leva a de agora (cada gravação carimba a hora do servidor). */
	const mudar = (p: Partial<MesaJukebox>) => mesa.mudarJukebox({ posicao: j ? (j.tocando ? posicaoAgora(j, agora()) : j.posicao) : 0, ...p });

	function destruir() {
		Object.values(esperas).forEach(clearTimeout);
		r?.destruir();
		r = null;
		chave = '';
		est = vazio;
		fila = [];
		bloqueado = false;
	}

	async function montar(nova: string, el: HTMLDivElement | undefined) {
		if (!nova || !el || !j) return destruir();
		if (nova === chave && r) return;
		destruir();
		chave = nova;
		falha = '';
		carregando = true;
		const x = j;
		const fonte: FonteMusica = { fonte: x.fonte, ref: x.ref, lista: x.lista, indice: x.indice };
		try {
			const novo = await criarReprodutor({
				alvo: el,
				fonte,
				inicio: { indice: x.indice, posicao: posicaoAgora(x, agora()), tocando: x.tocando },
				volume,
				aoEvento: aoEvento
			});
			if (chave !== nova) return novo.destruir();
			r = novo;
			fila = novo.faixas();
			carregando = false;
			atualizar();
			sincronizar();
		} catch (e) {
			if (chave !== nova) return;
			carregando = false;
			chave = '';
			falha = e instanceof Error ? e.message : 'Não foi possível carregar a música.';
		}
	}

	function atualizar() {
		if (!r) return;
		est = r.estado();
		if (!fila.length) fila = r.faixas();
	}

	/** O que o player oficial avisou. O Mestre repassa o que mudou para o banco; os outros só acompanham. */
	function aoEvento(e: EventoReprodutor) {
		atualizar();
		if (e === 'bloqueado') return void (bloqueado = true);
		if (e === 'erro' && est.erro && mesa.mestre) toasts.mostrar(est.erro, 'aviso');
		if (!mesa.mestre || Date.now() < silencio || !r || !j) return;
		clearTimeout(esperas[e]);
		esperas[e] = setTimeout(() => {
			const s = r?.estado();
			const x = j;
			if (!s || !x) return;
			if (e === 'fim') return void avancar(true);
			if (e === 'faixa' && s.indice !== x.indice) void mudar({ indice: s.indice, posicao: 0, tocando: true });
			else if (e === 'estado' && s.tocando !== x.tocando) void mudar({ tocando: s.tocando, posicao: posDe(s) });
		}, 300);
	}

	/** O player segue o banco: a faixa, a posição e tocar ou pausar. */
	function sincronizar() {
		const x = j;
		if (!x || !r || !r.estado().pronto) return;
		const s = r.estado();
		const esperado = x.tocando ? posicaoAgora(x, agora()) : x.posicao;
		silenciar();
		// primeiro o querer (tocar ou pausar), depois a faixa: o reprodutor decide o que fazer ao trocar com base nele
		x.tocando ? r.tocar() : r.pausar();
		if (x.lista && s.indice !== x.indice) r.irPara(x.indice, esperado);
		else if (!s.aoVivo && precisaAcertar(s.posicao, esperado)) r.buscar(esperado);
		clearTimeout(bloqueio);
		if (x.tocando) bloqueio = setTimeout(() => r && !r.estado().tocando && j?.tocando && !r.estado().erro && (bloqueado = true), 5000);
	}

	// o Mestre: tocar, pausar, faixas e posição
	async function alternar() {
		if (!j) return;
		ouvindo = true;
		await mudar({ tocando: !j.tocando, posicao: atual() });
	}
	/** Termina uma faixa (ou a lista): vai para a próxima, ou para ao fim. */
	function avancar(automatico = false) {
		if (!j) return;
		const total = r?.estado().total ?? 0;
		const n = j.lista ? vizinho(j.indice, total, 1) : null;
		if (n === null) return void mudar({ tocando: false, posicao: 0, indice: 0 });
		void mudar({ indice: n, posicao: 0, tocando: automatico ? true : true });
	}
	function proxima() {
		ouvindo = true;
		avancar();
	}
	function anterior() {
		if (!j) return;
		ouvindo = true;
		if (atual() > 3 || !j.lista) return void mudar({ posicao: 0 });
		void mudar({ indice: vizinho(j.indice, 0, -1) ?? 0, posicao: 0, tocando: true });
	}
	function irParaFaixa(i: number) {
		ouvindo = true;
		void mudar({ indice: i, posicao: 0, tocando: true });
	}
	function aoClicarBarra(e: MouseEvent) {
		if (!mesa.mestre || !est.duracao || est.aoVivo) return;
		const b = (e.currentTarget as HTMLElement).getBoundingClientRect();
		void mudar({ posicao: Math.round(Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)) * est.duracao) });
	}

	async function buscarTitulo(f: FonteMusica): Promise<string | null> {
		try {
			const alvo = linkDe(f);
			const resp = await fetch(f.fonte === 'youtube' ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(alvo)}` : `https://open.spotify.com/oembed?url=${encodeURIComponent(alvo)}`);
			if (!resp.ok) return null;
			const d = (await resp.json()) as { title?: string };
			return d.title ? String(d.title).slice(0, 120) : null;
		} catch {
			return null;
		}
	}
	async function tocar() {
		const f = lerLink(link);
		if (!f) return void (erroLink = 'Cole um link do YouTube (vídeo ou lista) ou do Spotify.');
		erroLink = '';
		const ok = await mesa.mudarJukebox({ fonte: f.fonte, ref: f.ref, lista: f.lista, indice: f.indice, posicao: 0, tocando: true, titulo: null });
		if (!ok) return;
		link = '';
		ouvindo = true;
		const titulo = await buscarTitulo(f);
		if (titulo && j?.ref === f.ref) void mudar({ titulo });
	}
	function ouvir(ligado: boolean) {
		ouvindo = ligado;
		bloqueado = false;
	}

	// o reprodutor nasce e morre com o que o banco diz (fonte, link, lista) e com o "OUVIR"
	$effect(() => {
		const nova = ouvindo && j ? `${j.fonte}:${j.ref}:${j.lista}` : '';
		const el = alvoEl;
		untrack(() => void montar(nova, el));
	});
	// e segue o estado: tocar, pausar, posição, faixa
	$effect(() => {
		const x = j;
		if (!x) return;
		void [x.tocando, x.posicao, x.desde, x.indice, r];
		untrack(sincronizar);
	});
	$effect(() => {
		void volume;
		untrack(() => r?.volume(volume));
	});
	$effect(() => {
		guardar('musica-mesa', { ouvindo, volume });
	});
	// o relógio da barra: só enquanto toca para você
	$effect(() => {
		if (!ouvindo || !j) return;
		const i = setInterval(atualizar, 500);
		return () => clearInterval(i);
	});
	onMount(() => () => destruir());

	/** A faixa atual aparece na lista mesmo quando ela é longa. */
	function seguir(no: HTMLElement, ativo: boolean) {
		if (ativo) no.scrollIntoView({ block: 'nearest' });
		return { update: (a: boolean) => a && no.scrollIntoView({ block: 'nearest' }) };
	}
	const titulo = $derived(est.titulo || j?.titulo || (j ? (j.fonte === 'spotify' ? 'Spotify' : 'YouTube') : 'Sem música'));
	const quemToca = $derived(j && ouvindo ? (j.tocando ? est.tocando || carregando : false) : false);
	const visivel = $derived(aberto || !!j);
	const pct = $derived(est.duracao > 0 ? Math.min(100, (est.posicao / est.duracao) * 100) : 0);
	const btn = 'flex min-h-9 flex-1 items-center justify-center border-2 border-b3 font-pixel text-sm font-bold disabled:opacity-40';
</script>

<!-- o player oficial fica fora da tela: só o som e os controles do site aparecem -->
<div bind:this={alvoEl} aria-hidden="true" style="position: fixed; top: 0; left: -2000px; width: 320px; height: 180px; overflow: hidden; pointer-events: none"></div>

{#if visivel}
	<section aria-label="Música da mesa" class="pointer-events-auto flex flex-col border-2 border-b3 bg-b0 shadow-[4px_4px_0_#000] {classe}" style="width: {aberto ? 320 : 260}px; max-width: calc(100vw - 16px)">
		<div class="flex items-center gap-1.5 border-b-2 border-b3 bg-b2 py-1 pr-1 pl-2.5">
			<span aria-hidden="true" class="font-pixel text-sm font-bold {quemToca ? 'text-ok' : 'text-mut'}">♪</span>
			<span class="min-w-0 flex-1 truncate text-xs leading-4 font-semibold" title={titulo}>{titulo}{j && !j.tocando ? ' · pausada' : ''}</span>
			{#if j}<button type="button" role="switch" aria-checked={ouvindo} class="min-h-8 border-2 px-2 font-pixel text-[11px] font-bold {ouvindo ? 'border-ok text-ok' : 'border-b3 text-mut'}" title={ouvindo ? 'Parar de ouvir (só para você)' : 'Ouvir a música da mesa'} onclick={() => ouvir(!ouvindo)}>{ouvindo ? 'OUVINDO' : 'OUVIR'}</button>{/if}
			<button type="button" class="h-8 w-8 font-pixel text-xs" aria-label={aberto ? 'Recolher' : 'Abrir o controle da música'} onclick={() => (ui.pop = aberto ? null : 'musica')}>{aberto ? '▾' : '▴'}</button>
		</div>

		<div class="flex flex-col gap-2 p-2.5">
			{#if !j}
				<span class="text-xs leading-4 text-mut">{mesa.mestre ? 'Cole um link do YouTube (vídeo ou lista) ou do Spotify (faixa, álbum, lista ou podcast) e todos ouvem junto.' : 'Nenhuma música por enquanto. O Mestre escolhe e ela toca para todos.'}</span>
			{:else if !ouvindo}
				<span class="text-xs leading-4 text-mut">{j.tocando ? 'Está tocando para a mesa.' : 'A música está pausada.'} Aperte OUVIR para tocar aqui; só você ouve.</span>
			{:else}
				<div class="flex flex-col gap-0.5">
					<span class="truncate text-sm leading-5 font-semibold" title={titulo}>{carregando ? 'Carregando…' : titulo}</span>
					<span class="truncate text-xs leading-4 text-mut">{[est.artista, j.lista && est.total ? `faixa ${est.indice + 1} de ${est.total}` : j.lista ? `faixa ${est.indice + 1}` : null].filter(Boolean).join(' · ') || (j.fonte === 'spotify' ? 'Spotify' : 'YouTube')}</span>
				</div>
				<!-- a barra: o Mestre clica para pular; os outros só acompanham -->
				<div class="flex items-center gap-2 font-pixel text-[11px] font-bold text-mut">
					<span class="w-10 text-right">{relogio(est.posicao)}</span>
					{#if est.aoVivo}
						<span class="flex-1 text-center text-err">AO VIVO</span>
					{:else}
						{#if mesa.mestre && est.duracao}
							<div class="relative h-3 flex-1 cursor-pointer border-2 border-b3 bg-b1" role="slider" aria-label="Posição da música" aria-valuemin={0} aria-valuemax={Math.round(est.duracao)} aria-valuenow={Math.round(est.posicao)} tabindex="0" onclick={aoClicarBarra} onkeydown={(e) => (e.key === 'ArrowRight' ? mudar({ posicao: Math.min(est.duracao, est.posicao + 10) }) : e.key === 'ArrowLeft' ? mudar({ posicao: Math.max(0, est.posicao - 10) }) : null)}>
								<div class="h-full bg-[var(--vermelhao)]" style="width: {pct}%"></div>
							</div>
						{:else}
							<div class="relative h-3 flex-1 border-2 border-b3 bg-b1" role="progressbar" aria-label="Posição da música" aria-valuemin={0} aria-valuemax={Math.round(est.duracao)} aria-valuenow={Math.round(est.posicao)}>
								<div class="h-full bg-[var(--vermelhao)]" style="width: {pct}%"></div>
							</div>
						{/if}
					{/if}
					<span class="w-10">{est.duracao ? relogio(est.duracao) : ''}</span>
				</div>
				{#if mesa.mestre && !mesa.somenteLeitura}
					<div class="flex gap-1.5">
						<button type="button" class={btn} aria-label="Faixa anterior ou recomeçar" title="Faixa anterior (ou recomeçar)" onclick={anterior}>⏮</button>
						<button type="button" class="{btn} flex-[1.4] {j.tocando ? '' : 'bg-grena text-papel'}" aria-label={j.tocando ? 'Pausar' : 'Tocar'} onclick={alternar}>{j.tocando ? '⏸' : '▶'}</button>
						<button type="button" class={btn} aria-label="Próxima faixa" title="Próxima faixa" disabled={!j.lista} onclick={proxima}>⏭</button>
					</div>
				{/if}
				{#if bloqueado && j.tocando}
					<button type="button" class="min-h-9 border-2 border-warn px-2 font-pixel text-[11px] font-bold text-warn" onclick={() => ((bloqueado = false), sincronizar())}>TOQUE PARA OUVIR · o navegador pede um clique</button>
				{/if}
				{#if est.erro || falha}<span role="alert" class="text-xs leading-4 font-semibold text-err">{est.erro ?? falha}</span>{/if}
			{/if}

			{#if aberto}
				{#if j && ouvindo}
					{#if r?.temVolume}
						<label class="flex items-center gap-2 text-xs font-semibold text-mut">Volume<input type="range" min="0" max="100" step="5" bind:value={volume} class="min-w-0 flex-1" aria-label="Volume da música" /><span class="w-8 text-right font-pixel">{volume}</span></label>
					{:else if j.fonte === 'spotify'}
						<span class="text-xs leading-4 text-mut">O Spotify não deixa o site mudar o volume: use o volume do sistema. Sem entrar no Spotify neste navegador, ele toca só trechos de 30 segundos.</span>
					{/if}
					{#if fila.length > 1}
						<div class="flex max-h-44 flex-col overflow-y-auto border-2 border-b3 bg-b1" role="list" aria-label="Faixas da lista">
							{#each fila as f, i (i)}
								<div role="listitem" use:seguir={i === est.indice}><button type="button" disabled={!mesa.mestre} class="flex w-full items-center gap-2 border-b border-b3 px-2 py-1.5 text-left text-xs leading-4 disabled:cursor-default {i === est.indice ? 'bg-grena text-papel' : mesa.mestre ? 'hover:bg-b2' : ''}" onclick={() => irParaFaixa(i)}>
									<span class="w-5 font-pixel text-[11px] font-bold text-mut">{i === est.indice && est.tocando ? '♪' : i + 1}</span>
									<span class="min-w-0 flex-1"><span class="block truncate font-semibold">{f.titulo}</span>{#if f.artista}<span class="block truncate text-mut">{f.artista}</span>{/if}</span>
									{#if f.duracao}<span class="font-pixel text-[11px] text-mut">{relogio(f.duracao)}</span>{/if}
								</button></div>
							{/each}
						</div>
					{/if}
				{/if}

				{#if mesa.mestre && !mesa.somenteLeitura}
					<div class="flex gap-1.5">
						<input
							class="h-9 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2 text-sm text-fg"
							placeholder="Link do YouTube ou do Spotify"
							aria-label="Link da música"
							aria-invalid={!!erroLink}
							bind:value={link}
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), void tocar())}
						/>
						<button type="button" class="btn-jogo btn-primario min-h-9 px-3" disabled={!link.trim()} onclick={tocar}>TOCAR</button>
					</div>
					{#if erroLink}<span role="alert" class="text-xs leading-4 font-semibold text-err">{erroLink}</span>{/if}
					{#if j}
						<div class="flex flex-wrap gap-1.5">
							<a class="flex min-h-9 items-center border-2 border-b3 px-2.5 font-pixel text-[11px] font-bold" href={linkDe(j)} target="_blank" rel="noopener">ABRIR ↗</a>
							<button type="button" class="ml-auto min-h-9 border-2 border-b3 px-2.5 font-pixel text-[11px] font-bold text-err" onclick={() => mesa.tirarJukebox()}>TIRAR</button>
						</div>
					{/if}
				{:else if j}
					<span class="text-xs leading-4 text-mut">O Mestre controla a música. O som é só seu.</span>
					<a class="self-start text-xs font-semibold text-link underline underline-offset-[3px]" href={linkDe(j)} target="_blank" rel="noopener">Abrir {j.fonte === 'spotify' ? 'no Spotify' : 'no YouTube'} ↗</a>
				{/if}
			{/if}
		</div>
	</section>
{/if}
