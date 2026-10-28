// A lista de faixas de uma playlist, álbum, podcast ou artista do Spotify, lida da página de incorporação pública
// (open.spotify.com/embed/…). O Spotify não tem API aberta para isso sem login, então o servidor lê o JSON que a
// própria página carrega; se o formato mudar, a leitura falha e o jukebox toca a lista pelo player do Spotify, sem
// os botões de próxima e anterior.

export interface FaixaSpotify {
	uri: string;
	titulo: string;
	artista: string;
	/** em milissegundos */
	duracao: number;
}

export interface ListaSpotify {
	titulo: string;
	faixas: FaixaSpotify[];
}

/** Só estes ids vão ao servidor (nada de URL livre). */
export const REF_LISTA_SPOTIFY = /^(playlist|album|show|artist)\/[A-Za-z0-9]{10,40}$/;

export function lerEmbedSpotify(html: string): ListaSpotify | null {
	const m = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
	if (!m) return null;
	let entidade: { name?: string; title?: string; trackList?: unknown } | undefined;
	try {
		entidade = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
	} catch {
		return null;
	}
	if (!entidade || !Array.isArray(entidade.trackList)) return null;
	const faixas: FaixaSpotify[] = [];
	for (const t of entidade.trackList as Record<string, unknown>[]) {
		const uri = typeof t?.uri === 'string' ? t.uri : '';
		if (!/^spotify:(track|episode):[A-Za-z0-9]{10,40}$/.test(uri)) continue;
		faixas.push({
			uri,
			titulo: String(t.title ?? '').slice(0, 160) || 'Sem título',
			artista: String(t.subtitle ?? '').slice(0, 160),
			duracao: Number.isFinite(Number(t.duration)) ? Math.max(0, Math.round(Number(t.duration))) : 0
		});
		if (faixas.length >= 300) break;
	}
	return { titulo: String(entidade.name ?? entidade.title ?? '').slice(0, 160), faixas };
}
