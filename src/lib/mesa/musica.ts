// Jukebox da Mesa: o Mestre cola um link do YouTube ou do Spotify e todos ouvem igual. Aqui ficam a leitura do link
// (só ids conhecidos entram no banco e no player) e a conta de onde a música está agora.
import type { MesaJukebox } from '#lib/supabase/banco.ts';

export interface FonteMusica {
	fonte: 'youtube' | 'spotify';
	/** youtube: id do vídeo (11) ou da lista; spotify: "tipo/id" */
	ref: string;
	lista: boolean;
	/** item da lista (começando em 0), quando o link aponta um */
	indice: number;
}

const ID_VIDEO = /^[A-Za-z0-9_-]{11}$/;
const ID_LISTA = /^[A-Za-z0-9_-]{12,64}$/;
const ID_SPOTIFY = /^[A-Za-z0-9]{10,40}$/;
const TIPOS_SPOTIFY = ['track', 'album', 'playlist', 'episode', 'show', 'artist'];
const LISTAS_SPOTIFY = ['album', 'playlist', 'show', 'artist'];

/** Lê um link (ou URI) do YouTube ou do Spotify; null quando não é um dos dois ou o id não confere. */
export function lerLink(texto: string): FonteMusica | null {
	const t = texto.trim();
	if (!t || t.length > 300) return null;
	const uri = /^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]+)$/.exec(t);
	if (uri) return spotify(uri[1], uri[2]);
	let u: URL;
	try {
		u = new URL(/^[a-z]+:\/\//i.test(t) ? t : `https://${t}`);
	} catch {
		return null;
	}
	const host = u.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, '');
	if (host === 'open.spotify.com' || host === 'spotify.link') {
		const p = u.pathname.split('/').filter(Boolean).filter((s) => !/^intl-/.test(s));
		return p.length >= 2 ? spotify(p[0], p[1]) : null;
	}
	if (host === 'youtu.be') return video(u.pathname.split('/')[1], u);
	if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
		const lista = u.searchParams.get('list');
		const v = u.searchParams.get('v');
		if (lista && ID_LISTA.test(lista) && !/^(RD|UL)/.test(lista)) {
			const i = Math.max(0, (parseInt(u.searchParams.get('index') ?? '1', 10) || 1) - 1);
			return { fonte: 'youtube', ref: lista, lista: true, indice: Math.min(i, 999) };
		}
		if (v) return video(v, u);
		const p = u.pathname.split('/').filter(Boolean);
		if (['embed', 'shorts', 'live', 'v'].includes(p[0])) return video(p[1], u);
	}
	return null;
}

function video(id: string | null | undefined, _u: URL): FonteMusica | null {
	return id && ID_VIDEO.test(id) ? { fonte: 'youtube', ref: id, lista: false, indice: 0 } : null;
}
function spotify(tipo: string, id: string): FonteMusica | null {
	return TIPOS_SPOTIFY.includes(tipo) && ID_SPOTIFY.test(id) ? { fonte: 'spotify', ref: `${tipo}/${id}`, lista: LISTAS_SPOTIFY.includes(tipo), indice: 0 } : null;
}

/** A URI que o player do Spotify carrega ("spotify:track:ID"). */
export const uriSpotify = (ref: string) => `spotify:${ref.replace('/', ':')}`;
/** O link para abrir fora da mesa (o título da música, quando o player não diz). */
export const linkDe = (j: Pick<MesaJukebox, 'fonte' | 'ref' | 'lista'>) =>
	j.fonte === 'spotify' ? `https://open.spotify.com/${j.ref}` : j.lista ? `https://www.youtube.com/playlist?list=${j.ref}` : `https://www.youtube.com/watch?v=${j.ref}`;

/** Onde a música está agora, em segundos: a posição guardada mais o tempo corrido no relógio do servidor, se toca. */
export function posicaoAgora(j: Pick<MesaJukebox, 'tocando' | 'posicao' | 'desde'>, agoraServidorMs: number): number {
	if (!j.tocando) return j.posicao;
	const passou = (agoraServidorMs - Date.parse(j.desde)) / 1000;
	return Math.max(0, j.posicao + (Number.isFinite(passou) ? Math.min(passou, 86400) : 0));
}

/** Diferença do relógio do servidor para o deste navegador (somar ao Date.now() dá a hora do servidor). */
export const desvioDoRelogio = (servidorIso: string, antesMs: number, depoisMs: number) => Date.parse(servidorIso) - (antesMs + depoisMs) / 2;

/** Vale corrigir? Passou de 3 s de diferença, a música salta; menos que isso, deixa tocar (a rede oscila). */
export const precisaAcertar = (atual: number, esperado: number, folga = 3) => Math.abs(atual - esperado) > folga;
