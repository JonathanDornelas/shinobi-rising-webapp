// Reprodutor do Spotify: o player incorporado mora fora da tela e o site decide a faixa. Para uma lista, o servidor traz as
// faixas (embed-spotify.ts) e cada uma é carregada pelo URI dela, então "próxima" e "anterior" são nossos e não voltam
// para a primeira como acontecia quando o botão do player incorporado mexia na lista. Sem login no Spotify o player só
// toca trechos de 30 s; o volume é o do sistema (o Spotify não deixa o site mudar).
import { uriSpotify } from '../musica.ts';
import type { ListaSpotify } from './embed-spotify.ts';
import type { EstadoReprodutor, FaixaInfo, OpcoesReprodutor, Reprodutor } from './tipos.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
let api: Promise<any> | null = null;
export function carregarApiSpotify(): Promise<any> {
	return (api ??= new Promise((ok, falha) => {
		const w = window as any;
		w.onSpotifyIframeApiReady = (a: any) => ok(a);
		const s = Object.assign(document.createElement('script'), { src: 'https://open.spotify.com/embed/iframe-api/v1', async: true });
		s.onerror = () => {
			api = null;
			falha(new Error('Não consegui falar com o Spotify. Confira a conexão.'));
		};
		document.head.append(s);
	}));
}

const listas = new Map<string, Promise<ListaSpotify>>();
/** As faixas de uma playlist, álbum, podcast ou artista (vazio quando o servidor não consegue ler). */
export function buscarListaSpotify(ref: string): Promise<ListaSpotify> {
	let p = listas.get(ref);
	if (!p) {
		p = fetch(`/api/spotify/faixas?ref=${encodeURIComponent(ref)}`)
			.then((r) => (r.ok ? (r.json() as Promise<ListaSpotify>) : { titulo: '', faixas: [] }))
			.catch(() => ({ titulo: '', faixas: [] }));
		listas.set(ref, p);
		// uma falha não fica guardada: da próxima vez tenta de novo
		void p.then((l) => !l.faixas.length && listas.delete(ref));
	}
	return p;
}

export async function criarSpotify(o: OpcoesReprodutor): Promise<Reprodutor> {
	const f = o.fonte;
	const [Spotify, lista] = await Promise.all([carregarApiSpotify(), f.lista ? buscarListaSpotify(f.ref) : Promise.resolve<ListaSpotify>({ titulo: '', faixas: [] })]);
	const faixas = lista.faixas;
	const porFaixa = f.lista && faixas.length > 0;
	const uriDe = (i: number) => (porFaixa ? (faixas[Math.min(Math.max(0, i), faixas.length - 1)]?.uri ?? uriSpotify(f.ref)) : uriSpotify(f.ref));

	const no = document.createElement('div');
	o.alvo.replaceChildren(no);
	let morto = false;
	let quer = o.inicio.tocando;
	let indice = porFaixa ? Math.min(Math.max(0, o.inicio.indice), faixas.length - 1) : 0;
	let pronto = false;
	let tocando = false;
	let posicao = 0;
	let duracao = 0;
	let erro: string | null = null;
	// o que o nosso próprio comando causa no player não vira "alguém mexeu"
	let ignorarAte = 0;
	let pedidoEm = Date.now();
	const timers: ReturnType<typeof setTimeout>[] = [];
	const depois = (fn: () => void, ms: number) => timers.push(setTimeout(() => !morto && fn(), ms));

	const ctrl: any = await new Promise((ok, falha) => {
		const limite = setTimeout(() => falha(new Error('O player do Spotify não respondeu.')), 20000);
		// 80 px de altura é o menor player que o Spotify aceita; ele fica fora da tela
		Spotify.createController(no, { uri: uriDe(indice), width: 320, height: 80 }, (c: any) => (clearTimeout(limite), ok(c)));
	});

	let ultimaPosicao = 0;
	// ao terminar a faixa o player para de mandar atualizações, com a posição igual à duração e sem marcar pausa
	let fimAvisado = false;
	ctrl.addListener('ready', () => {
		pronto = true;
		if (o.inicio.posicao > 1) ctrl.seek(o.inicio.posicao);
		if (quer) comando(() => ctrl.play());
	});
	ctrl.addListener('playback_update', (e: { data: { isPaused: boolean; isBuffering: boolean; duration: number; position: number } }) => {
		const d = e.data;
		const antes = tocando;
		tocando = !d.isPaused;
		posicao = (d.position ?? 0) / 1000;
		duracao = (d.duration ?? 0) / 1000;
		if (tocando) erro = null;
		const passou = Date.now() < ignorarAte;
		const noFim = duracao > 0 && posicao >= duracao - 0.6;
		const pausouNoFim = antes && d.isPaused && duracao > 0 && ultimaPosicao >= duracao - 2.5;
		ultimaPosicao = posicao;
		if (!noFim) fimAvisado = false;
		if (passou || d.isBuffering) return;
		if ((noFim && !fimAvisado) || (pausouNoFim && !fimAvisado)) {
			fimAvisado = true;
			quer = false;
			tocando = false;
			o.aoEvento('fim');
		} else if (antes !== tocando && !noFim) {
			quer = tocando;
			o.aoEvento('estado');
		}
	});
	ctrl.addListener('autoplay_failed', () => o.aoEvento('bloqueado'));

	/** Um comando nosso: o player confirma com atualizações que não devem voltar como "alguém mexeu". */
	function comando(fn: () => void, folga = 1500) {
		ignorarAte = Date.now() + folga;
		try {
			fn();
		} catch {
			// o player ainda não está pronto
		}
	}
	const relogio = setInterval(() => {
		if (morto) return;
		if (quer && !tocando && pronto && Date.now() - pedidoEm > 5000) {
			pedidoEm = Date.now();
			o.aoEvento('bloqueado');
		}
	}, 800);

	const r: Reprodutor = {
		fonte: 'spotify',
		temVolume: false,
		estado(): EstadoReprodutor {
			const fx = porFaixa ? faixas[indice] : undefined;
			return {
				pronto,
				tocando,
				posicao,
				duracao: duracao || (fx?.duracao ?? 0) / 1000,
				indice: porFaixa ? indice : 0,
				total: porFaixa ? faixas.length : f.lista ? 0 : 1,
				titulo: fx?.titulo ?? (lista.titulo || null),
				artista: fx?.artista ?? null,
				aoVivo: false,
				erro
			};
		},
		faixas: (): FaixaInfo[] => faixas.map((x) => ({ titulo: x.titulo, artista: x.artista, duracao: x.duracao / 1000 })),
		tocar() {
			quer = true;
			pedidoEm = Date.now();
			// a faixa terminou e voltou a ser pedida: começa de novo
			comando(() => (duracao > 0 && posicao >= duracao - 1 ? (ctrl.seek(0), ctrl.play()) : ctrl.play()));
		},
		pausar() {
			quer = false;
			comando(() => ctrl.pause());
		},
		buscar(s) {
			comando(() => ctrl.seek(Math.max(0, s)));
		},
		irPara(i, s = 0) {
			if (!porFaixa) return this.buscar(s);
			if (i >= faixas.length) {
				quer = false;
				comando(() => ctrl.pause());
				return o.aoEvento('fim');
			}
			const alvo = Math.max(0, i);
			if (alvo === indice) return this.buscar(s);
			indice = alvo;
			posicao = 0;
			duracao = 0;
			fimAvisado = false;
			erro = null;
			pedidoEm = Date.now();
			// loadUri troca a faixa; o play vem logo depois (o player ignora o pedido enquanto carrega)
			comando(() => ctrl.loadUri(uriDe(alvo), false, Math.max(0, s)), 3000);
			if (quer) depois(() => comando(() => ctrl.play(), 2000), 500);
		},
		volume() {
			// o Spotify não deixa o site mudar o volume
		},
		destruir() {
			morto = true;
			clearInterval(relogio);
			timers.forEach(clearTimeout);
			try {
				ctrl.destroy?.();
			} catch {
				// já saiu da página
			}
			o.alvo.replaceChildren();
		}
	};
	return r;
}
