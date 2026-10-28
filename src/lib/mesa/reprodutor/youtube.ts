// Reprodutor do YouTube: o player oficial (IFrame API) mora fora da tela e só o som e os controles aparecem no site.
// Vídeos longos e transmissões ao vivo entram como qualquer vídeo; listas carregam pelo loadPlaylist (a fila só existe
// depois que o YouTube a entrega, então o total e a faixa atual vêm de uma checagem periódica, nunca do onReady).
import type { EstadoReprodutor, FaixaInfo, OpcoesReprodutor, Reprodutor } from './tipos.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
let api: Promise<any> | null = null;
export function carregarApiYouTube(): Promise<any> {
	return (api ??= new Promise((ok, falha) => {
		const w = window as any;
		if (w.YT?.Player) return ok(w.YT);
		const antes = w.onYouTubeIframeAPIReady;
		w.onYouTubeIframeAPIReady = () => (antes?.(), ok(w.YT));
		const s = Object.assign(document.createElement('script'), { src: 'https://www.youtube.com/iframe_api', async: true });
		s.onerror = () => {
			api = null;
			falha(new Error('Não consegui falar com o YouTube. Confira a conexão.'));
		};
		document.head.append(s);
	}));
}

/** O que cada código de erro do YouTube quer dizer, em português. */
export const ERROS_YOUTUBE: Record<number, string> = {
	2: 'O link do YouTube não é válido.',
	5: 'O YouTube não conseguiu tocar isto neste navegador.',
	100: 'O vídeo foi apagado ou é privado.',
	101: 'O dono deste vídeo bloqueou a reprodução fora do YouTube. Escolha outro.',
	150: 'O dono deste vídeo bloqueou a reprodução fora do YouTube. Escolha outro.'
};

export async function criarYouTube(o: OpcoesReprodutor): Promise<Reprodutor> {
	const YT = await carregarApiYouTube();
	const f = o.fonte;
	const lista = f.lista;
	const no = document.createElement('div');
	o.alvo.replaceChildren(no);

	let morto = false;
	let quer = o.inicio.tocando;
	let indice = Math.max(0, o.inicio.indice);
	let total = 0;
	let erro: string | null = null;
	let errosSeguidos = 0;
	let pedidoEm = Date.now();
	let ultimoEstado = -1;
	const timers: ReturnType<typeof setTimeout>[] = [];
	const depois = (fn: () => void, ms: number) => timers.push(setTimeout(() => !morto && fn(), ms));

	const player: any = await new Promise((ok, falha) => {
		const limite = setTimeout(() => falha(new Error('O player do YouTube não respondeu.')), 20000);
		const p = new YT.Player(no, {
			width: 320,
			height: 180,
			host: 'https://www.youtube-nocookie.com',
			// o vídeo ou a lista entra no onReady: no construtor a fila chegava tarde e o índice se perdia
			playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, rel: 0, playsinline: 1, origin: location.origin },
			events: {
				onReady: () => (clearTimeout(limite), ok(p)),
				onStateChange: (e: { data: number }) => aoMudar(e.data),
				onError: (e: { data: number }) => aoErrar(e.data),
				onAutoplayBlocked: () => o.aoEvento('bloqueado')
			}
		});
	});

	const lerEstado = (): number => {
		try {
			return player.getPlayerState?.() ?? -1;
		} catch {
			return -1;
		}
	};
	function sincronizarFila() {
		try {
			const fila: string[] | undefined = player.getPlaylist?.();
			if (lista && fila?.length) total = fila.length;
			const i = player.getPlaylistIndex?.();
			if (lista && typeof i === 'number' && i >= 0 && i !== indice && lerEstado() !== 5) {
				indice = i;
				erro = null;
				o.aoEvento('faixa');
			}
		} catch {
			// o player ainda não tem fila
		}
	}
	function aoMudar(s: number) {
		ultimoEstado = s;
		if (s === 1) {
			erro = null;
			errosSeguidos = 0;
		}
		sincronizarFila();
		if (s === 0) {
			// numa lista o YouTube passa sozinho para a próxima; só o fim da última (ou de um vídeo solto) é fim
			if (!lista || (total > 0 && indice >= total - 1)) {
				quer = false;
				o.aoEvento('fim');
			}
			return;
		}
		if (s === 1 || s === 2) o.aoEvento('estado');
	}
	function aoErrar(codigo: number) {
		// o erro 2 (parâmetro inválido) vem de pedir algo ao player antes de ele carregar e passa sozinho: não é do vídeo
		if (codigo === 2 && lista && lerEstado() !== -1) return;
		erro = ERROS_YOUTUBE[codigo] ?? 'O YouTube não conseguiu tocar isto.';
		o.aoEvento('erro');
		// numa lista, um vídeo apagado, privado ou bloqueado não trava a fila: pula para o próximo
		if (lista && [100, 101, 150].includes(codigo) && ++errosSeguidos < Math.max(3, total || 3)) depois(() => (quer ? player.nextVideo?.() : null), 900);
	}

	function comecar(i: number, s: number, tocar: boolean) {
		pedidoEm = Date.now();
		erro = null;
		if (lista) {
			const p = { listType: 'playlist', list: f.ref, index: Math.max(0, i), startSeconds: Math.max(0, s) };
			tocar ? player.loadPlaylist(p) : player.cuePlaylist(p);
		} else {
			const p = { videoId: f.ref, startSeconds: Math.max(0, s) };
			tocar ? player.loadVideoById(p) : player.cueVideoById(p);
		}
	}
	player.setVolume?.(o.volume);
	comecar(indice, o.inicio.posicao, quer);

	// a fila e a faixa atual vêm daqui; também avisa quando o navegador não deixa tocar sem clique
	const relogio = setInterval(() => {
		if (morto) return;
		sincronizarFila();
		const s = lerEstado();
		if (quer && s !== 1 && s !== 3 && !erro && Date.now() - pedidoEm > 4000 && ultimoEstado !== 0) {
			pedidoEm = Date.now();
			o.aoEvento('bloqueado');
		}
	}, 600);

	const r: Reprodutor = {
		fonte: 'youtube',
		temVolume: true,
		estado(): EstadoReprodutor {
			let dados: { title?: string; author?: string; isLive?: boolean } = {};
			let duracao = 0;
			let posicao = 0;
			try {
				dados = player.getVideoData?.() ?? {};
				duracao = player.getDuration?.() ?? 0;
				posicao = player.getCurrentTime?.() ?? 0;
			} catch {
				// ainda carregando
			}
			const s = lerEstado();
			// transmissões ao vivo contam a duração em milhões de segundos: acima de 2 dias não é um vídeo
			const aoVivo = !!dados.isLive || duracao > 172800;
			return {
				pronto: true,
				tocando: s === 1 || (s === 3 && quer),
				posicao: Number.isFinite(posicao) ? posicao : 0,
				duracao: aoVivo || !Number.isFinite(duracao) ? 0 : duracao,
				indice: lista ? indice : 0,
				total: lista ? total : 0,
				titulo: dados.title || null,
				artista: dados.author || null,
				aoVivo,
				erro
			};
		},
		faixas: (): FaixaInfo[] => [],
		tocar() {
			quer = true;
			pedidoEm = Date.now();
			const tentar = () => {
				try {
					const s = lerEstado();
					// a fila acabou e voltou a ser pedida: recomeça
					if (s === 0) comecar(0, 0, true);
					// carregando (sem estado ainda ou buffer): o carregamento já toca; pedir agora dava erro no YouTube
					else if (s === 2 || s === 5) player.playVideo();
					else if (s === -1 || s === 3) depois(() => quer && lerEstado() !== 1 && lerEstado() !== 3 && player.playVideo?.(), 1000);
				} catch {
					// sem player
				}
			};
			tentar();
		},
		pausar() {
			quer = false;
			try {
				player.pauseVideo();
			} catch {
				// sem player
			}
		},
		buscar(s) {
			try {
				player.seekTo(Math.max(0, s), true);
			} catch {
				// sem player
			}
		},
		irPara(i, s = 0) {
			const alvo = Math.max(0, i);
			if (!lista) return this.buscar(s);
			if (total > 0 && alvo >= total) {
				quer = false;
				player.pauseVideo?.();
				return o.aoEvento('fim');
			}
			if (alvo === indice && lerEstado() !== -1 && lerEstado() !== 5) return this.buscar(s);
			indice = alvo;
			erro = null;
			pedidoEm = Date.now();
			try {
				player.playVideoAt(alvo);
				// o YouTube começa do zero ao trocar de faixa: o ponto pedido entra assim que ela toca
				if (s > 1) depois(() => player.seekTo(s, true), 1200);
				if (!quer) depois(() => player.pauseVideo(), 700);
			} catch {
				// a fila ainda não está pronta: recomeça pelo índice
				comecar(alvo, s, quer);
			}
		},
		volume(v) {
			try {
				player.setVolume(Math.min(100, Math.max(0, v)));
			} catch {
				// sem player
			}
		},
		destruir() {
			morto = true;
			clearInterval(relogio);
			timers.forEach(clearTimeout);
			try {
				player.destroy();
			} catch {
				// já saiu da página
			}
			o.alvo.replaceChildren();
		}
	};
	return r;
}
