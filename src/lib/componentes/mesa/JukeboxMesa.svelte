<script lang="ts">
	// Jukebox da Mesa: o Mestre cola um link do YouTube ou do Spotify e todos ouvem igual. Cada navegador toca o player
	// oficial (visível no cartão) e segue o estado gravado na campanha: tocar, pausar, posição e item da lista. A hora
	// é a do servidor (cada mudança carimba `desde`), então quem entra depois acerta a posição sozinho. Quem joga liga e
	// desliga o próprio som ("OUVIR"); o navegador só deixa tocar depois de um clique, então um aviso pede o toque.
	import { onMount, untrack } from 'svelte';
	import { ler, gravar as guardar } from '#lib/estado/armazenamento.ts';
	import { toasts } from '#lib/estado/toasts.svelte.ts';
	import type { Mesa } from '#lib/mesa/mesa.svelte.ts';
	import { desvioDoRelogio, lerLink, linkDe, posicaoAgora, precisaAcertar, uriSpotify, type FonteMusica } from '#lib/mesa/musica.ts';
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
	let erro = $state('');
	let bloqueado = $state(false);
	let pronto = $state(false);
	let alvoEl = $state<HTMLDivElement>();

	// o relógio do servidor menos o deste navegador, em ms
	let desvio = 0;
	const agora = () => Date.now() + desvio;
	onMount(async () => {
		const a = Date.now();
		const { data } = await supabase().rpc('agora_servidor');
		if (data) desvio = desvioDoRelogio(data, a, Date.now());
	});

	/* eslint-disable @typescript-eslint/no-explicit-any */
	let player: any = null;
	let tipoPlayer: 'youtube' | 'spotify' | null = null;
	let chavePlayer = '';
	let emReproducao = false;
	let posSpotify = 0;
	// as mudanças que o nosso próprio comando causa no player não voltam para o banco
	let silencio = 0;
	const silenciar = (ms = 1200) => (silencio = Date.now() + ms);
	let espera: ReturnType<typeof setTimeout> | undefined;
	let bloqueio: ReturnType<typeof setTimeout> | undefined;

	const w = () => window as any;
	let apiYt: Promise<any> | null = null;
	const carregarYt = () =>
		(apiYt ??= new Promise((ok) => {
			if (w().YT?.Player) return ok(w().YT);
			const antes = w().onYouTubeIframeAPIReady;
			w().onYouTubeIframeAPIReady = () => (antes?.(), ok(w().YT));
			document.head.append(Object.assign(document.createElement('script'), { src: 'https://www.youtube.com/iframe_api', async: true }));
		}));
	let apiSp: Promise<any> | null = null;
	const carregarSp = () =>
		(apiSp ??= new Promise((ok) => {
			w().onSpotifyIframeApiReady = (api: any) => ok(api);
			document.head.append(Object.assign(document.createElement('script'), { src: 'https://open.spotify.com/embed/iframe-api/v1', async: true }));
		}));

	function destruir() {
		clearTimeout(bloqueio);
		try {
			player?.destroy?.();
		} catch {
			// o player já saiu da página
		}
		player = null;
		tipoPlayer = null;
		chavePlayer = '';
		pronto = false;
		emReproducao = false;
		alvoEl?.replaceChildren();
	}

	async function montar(chave: string, el: HTMLDivElement | undefined) {
		if (!chave || !el) return destruir();
		if (chave === chavePlayer && player) return;
		destruir();
		chavePlayer = chave;
		const x = j!;
		const no = document.createElement('div');
		el.replaceChildren(no);
		try {
			if (x.fonte === 'youtube') {
				const YT = await carregarYt();
				if (chavePlayer !== chave) return;
				tipoPlayer = 'youtube';
				player = new YT.Player(no, {
					width: '100%',
					height: '100%',
					host: 'https://www.youtube-nocookie.com',
					videoId: x.lista ? undefined : x.ref,
					playerVars: { autoplay: 0, controls: mesa.mestre ? 1 : 0, rel: 0, playsinline: 1, modestbranding: 1, disablekb: mesa.mestre ? 0 : 1, origin: location.origin, ...(x.lista ? { listType: 'playlist', list: x.ref, index: x.indice } : {}) },
					events: {
						onReady: () => {
							player?.setVolume?.(volume);
							pronto = true;
						},
						onStateChange: aoMudarYt,
						onAutoplayBlocked: () => (bloqueado = true)
					}
				});
			} else {
				const api = await carregarSp();
				if (chavePlayer !== chave) return;
				tipoPlayer = 'spotify';
				api.createController(no, { uri: uriSpotify(x.ref), width: '100%', height: x.lista ? 232 : 152 }, (ctrl: any) => {
					if (chavePlayer !== chave) return ctrl.destroy?.();
					player = ctrl;
					ctrl.addListener('ready', () => (pronto = true));
					ctrl.addListener('playback_update', aoMudarSp);
				});
			}
		} catch {
			toasts.mostrar('Não foi possível carregar o player de música.', 'erro');
			chavePlayer = '';
		}
	}

	// o player segue o banco: o que o Mestre gravou, na posição de agora
	function sincronizar() {
		const x = j;
		if (!x || !player || !pronto) return;
		const esperado = posicaoAgora(x, agora());
		silenciar();
		try {
			if (tipoPlayer === 'youtube') {
				if (x.lista && typeof player.getPlaylistIndex === 'function') {
					const i = player.getPlaylistIndex();
					if (i >= 0 && i !== x.indice) player.playVideoAt(x.indice);
				}
				const atual = player.getCurrentTime?.() ?? 0;
				if (x.tocando) {
					if (precisaAcertar(atual, esperado)) player.seekTo(esperado, true);
					player.playVideo();
				} else {
					player.pauseVideo();
					if (precisaAcertar(atual, x.posicao)) player.seekTo(x.posicao, true);
				}
			} else if (tipoPlayer === 'spotify') {
				if (x.tocando) {
					if (precisaAcertar(posSpotify, esperado)) player.seek(esperado);
					player.play();
				} else player.pause();
			}
		} catch {
			// o player ainda não está pronto para comandos
		}
		// o navegador só toca depois de um gesto: se nada tocou em 3 s, pede o toque
		clearTimeout(bloqueio);
		if (x.tocando) bloqueio = setTimeout(() => !emReproducao && j?.tocando && (bloqueado = true), 3000);
	}

	// o Mestre usa os controles do próprio player (pausar, pular, trocar de faixa): o banco acompanha
	function gravarDoPlayer(f: () => void) {
		clearTimeout(espera);
		espera = setTimeout(() => (mesa.mestre && Date.now() >= silencio ? f() : null), 350);
	}
	function aoMudarYt(e: { data: number }) {
		emReproducao = e.data === 1;
		if (e.data === 1) bloqueado = false;
		if (!mesa.mestre || Date.now() < silencio) return;
		gravarDoPlayer(() => {
			const x = j;
			if (!x || !player) return;
			const pos = player.getCurrentTime?.() ?? 0;
			const idx = x.lista ? (player.getPlaylistIndex?.() ?? x.indice) : 0;
			if (e.data === 1 && (!x.tocando || precisaAcertar(pos, posicaoAgora(x, agora())) || idx !== x.indice)) void mudar({ tocando: true, posicao: pos, indice: Math.max(0, idx) });
			else if (e.data === 2 && x.tocando) void mudar({ tocando: false, posicao: pos });
			else if (e.data === 0 && !x.lista) void mudar({ tocando: false, posicao: 0 });
		});
	}
	function aoMudarSp(ev: { data: { isPaused: boolean; isBuffering: boolean; position: number } }) {
		posSpotify = (ev.data.position ?? 0) / 1000;
		emReproducao = !ev.data.isPaused;
		if (emReproducao) bloqueado = false;
		if (!mesa.mestre || Date.now() < silencio || ev.data.isBuffering) return;
		gravarDoPlayer(() => {
			const x = j;
			if (!x) return;
			if (emReproducao !== x.tocando) void mudar({ tocando: emReproducao, posicao: posSpotify });
			else if (x.tocando && precisaAcertar(posSpotify, posicaoAgora(x, agora()))) void mudar({ posicao: posSpotify });
		});
	}

	/** Grava no banco; sem posição no pedido, leva a de agora (cada gravação carimba a hora do servidor). */
	const mudar = (p: Partial<MesaJukebox>) => mesa.mudarJukebox({ posicao: j ? posicaoAgora(j, agora()) : 0, ...p });

	async function buscarTitulo(f: FonteMusica): Promise<string | null> {
		try {
			const alvo = linkDe(f);
			const r = await fetch(f.fonte === 'youtube' ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(alvo)}` : `https://open.spotify.com/oembed?url=${encodeURIComponent(alvo)}`);
			if (!r.ok) return null;
			const d = (await r.json()) as { title?: string };
			return d.title ? String(d.title).slice(0, 120) : null;
		} catch {
			return null;
		}
	}
	async function tocar() {
		const f = lerLink(link);
		if (!f) return void (erro = 'Cole um link do YouTube (vídeo ou lista) ou do Spotify.');
		erro = '';
		const ok = await mesa.mudarJukebox({ fonte: f.fonte, ref: f.ref, lista: f.lista, indice: f.indice, posicao: 0, tocando: true, titulo: null });
		if (!ok) return;
		link = '';
		ouvindo = true;
		const titulo = await buscarTitulo(f);
		if (titulo && j?.ref === f.ref) void mudar({ titulo });
	}
	const alternar = () => mudar({ tocando: !j?.tocando });
	function ouvir(ligado: boolean) {
		ouvindo = ligado;
		bloqueado = false;
	}

	// o player nasce e morre com o que o banco diz (fonte, link) e com o "OUVIR"
	$effect(() => {
		const chave = ouvindo && j ? `${j.fonte}:${j.ref}:${j.lista}` : '';
		const el = alvoEl;
		untrack(() => void montar(chave, el));
	});
	// e segue o estado: tocar, pausar, posição, item da lista
	$effect(() => {
		const x = j;
		void pronto;
		if (!x) return;
		void [x.tocando, x.posicao, x.desde, x.indice];
		untrack(sincronizar);
	});
	$effect(() => {
		void volume;
		untrack(() => tipoPlayer === 'youtube' && player?.setVolume?.(volume));
	});
	$effect(() => {
		guardar('musica-mesa', { ouvindo, volume });
	});
	onMount(() => () => {
		clearTimeout(espera);
		destruir();
	});

	const alturaPlayer = $derived(!j ? 0 : j.fonte === 'spotify' ? (aberto ? (j.lista ? 232 : 152) : 80) : aberto ? 180 : 113);
	const larguraPlayer = $derived(j?.fonte === 'youtube' && !aberto ? 200 : 320);
	// com música na campanha o cartão fica à vista para todos (só a barra, se você não está ouvindo)
	const visivel = $derived(aberto || !!j);
</script>

{#if visivel}
	<section aria-label="Música da mesa" class="pointer-events-auto flex flex-col border-2 border-b3 bg-b0 shadow-[4px_4px_0_#000] {classe}" style="width: {Math.max(larguraPlayer, aberto ? 320 : 200)}px; max-width: calc(100vw - 16px)">
		<div class="flex items-center gap-1.5 border-b-2 border-b3 bg-b2 py-1 pr-1 pl-2.5">
			<span aria-hidden="true" class="font-pixel text-sm font-bold {j?.tocando && ouvindo ? 'text-ok' : 'text-mut'}">♪</span>
			<span class="min-w-0 flex-1 truncate text-xs leading-4 font-semibold" title={j?.titulo ?? ''}>{j ? (j.titulo ?? (j.fonte === 'spotify' ? 'Spotify' : 'YouTube')) : 'Sem música'}{j && !j.tocando ? ' · pausada' : ''}</span>
			{#if j}<button type="button" role="switch" aria-checked={ouvindo} class="min-h-8 border-2 px-2 font-pixel text-[11px] font-bold {ouvindo ? 'border-ok text-ok' : 'border-b3 text-mut'}" title={ouvindo ? 'Parar de ouvir (só para você)' : 'Ouvir a música da mesa'} onclick={() => ouvir(!ouvindo)}>{ouvindo ? 'OUVINDO' : 'OUVIR'}</button>{/if}
			<button type="button" class="h-8 w-8 font-pixel text-xs" aria-label={aberto ? 'Recolher' : 'Abrir o controle da música'} onclick={() => (ui.pop = aberto ? null : 'musica')}>{aberto ? '▾' : '▴'}</button>
		</div>

		{#if j && ouvindo}
			<div class="relative bg-black" style="height: {alturaPlayer}px; width: {larguraPlayer}px; max-width: 100%">
				<div bind:this={alvoEl} class="h-full w-full"></div>
				{#if bloqueado && j.tocando}
					<button type="button" class="absolute inset-0 flex items-center justify-center bg-b0/85 px-3 text-center font-pixel text-xs leading-5 font-bold text-papel" onclick={() => ((bloqueado = false), sincronizar())}>TOQUE PARA OUVIR<br />O navegador pede um clique</button>
				{/if}
			</div>
		{/if}

		{#if aberto}
			<div class="flex flex-col gap-2 p-2.5">
				{#if !j}
					<span class="text-xs leading-4 text-mut">{mesa.mestre ? 'Cole um link do YouTube (vídeo ou lista) ou do Spotify (faixa, álbum, lista ou podcast) e todos ouvem junto.' : 'Nenhuma música por enquanto. O Mestre escolhe e ela toca para todos.'}</span>
				{:else if !ouvindo}
					<span class="text-xs leading-4 text-mut">{j.tocando ? 'Está tocando para a mesa.' : 'A música está pausada.'} Aperte OUVIR para tocar aqui; só você ouve.</span>
				{:else if !mesa.mestre}
					<span class="text-xs leading-4 text-mut">O Mestre controla a música. O som é só seu: ajuste o volume {j.fonte === 'spotify' ? 'no próprio player' : 'abaixo'}.</span>
				{/if}

				{#if j && ouvindo && j.fonte === 'youtube'}
					<label class="flex items-center gap-2 text-xs font-semibold text-mut">Volume<input type="range" min="0" max="100" step="5" bind:value={volume} class="min-w-0 flex-1" aria-label="Volume da música" /><span class="w-8 text-right font-pixel">{volume}</span></label>
				{/if}

				{#if mesa.mestre && !mesa.somenteLeitura}
					<div class="flex gap-1.5">
						<input
							class="h-9 min-w-0 flex-1 border-2 border-b3 bg-b1 px-2 text-sm text-fg"
							placeholder="Link do YouTube ou do Spotify"
							aria-label="Link da música"
							aria-invalid={!!erro}
							bind:value={link}
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), void tocar())}
						/>
						<button type="button" class="btn-jogo btn-primario min-h-9 px-3" disabled={!link.trim()} onclick={tocar}>TOCAR</button>
					</div>
					{#if erro}<span role="alert" class="text-xs leading-4 font-semibold text-err">{erro}</span>{/if}
					{#if j}
						<div class="flex flex-wrap gap-1.5">
							<button type="button" class="min-h-9 flex-1 border-2 border-b3 font-pixel text-[11px] font-bold" onclick={alternar}>{j.tocando ? '⏸ PAUSAR' : '▶ TOCAR'}</button>
							<a class="flex min-h-9 items-center border-2 border-b3 px-2.5 font-pixel text-[11px] font-bold" href={linkDe(j)} target="_blank" rel="noopener">ABRIR ↗</a>
							<button type="button" class="min-h-9 border-2 border-b3 px-2.5 font-pixel text-[11px] font-bold text-err" onclick={() => mesa.tirarJukebox()}>TIRAR</button>
						</div>
					{/if}
				{:else if j}
					<a class="self-start text-xs font-semibold text-link underline underline-offset-[3px]" href={linkDe(j)} target="_blank" rel="noopener">Abrir {j.fonte === 'spotify' ? 'no Spotify' : 'no YouTube'} ↗</a>
				{/if}
			</div>
		{/if}
	</section>
{/if}
