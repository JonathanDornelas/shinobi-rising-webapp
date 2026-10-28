// As faixas de uma lista do Spotify para o jukebox da Mesa (ver reprodutor/embed-spotify.ts). Só para quem está logado,
// só ids de playlist, álbum, podcast ou artista, e o navegador guarda a resposta por uma hora.
import { error, json } from '@sveltejs/kit';
import { REF_LISTA_SPOTIFY, lerEmbedSpotify } from '#lib/mesa/reprodutor/embed-spotify.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!(await locals.usuarioAtual())) error(401, 'Entre para ouvir a música da mesa.');
	const ref = url.searchParams.get('ref') ?? '';
	if (!REF_LISTA_SPOTIFY.test(ref)) error(400, 'Lista do Spotify inválida.');
	let html = '';
	try {
		const r = await fetch(`https://open.spotify.com/embed/${ref}`, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; ShinobiNoMichi)', 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' }, signal: AbortSignal.timeout(8000) });
		if (!r.ok) return json({ titulo: '', faixas: [] }, { headers: { 'cache-control': 'private, max-age=60' } });
		html = await r.text();
	} catch {
		return json({ titulo: '', faixas: [] }, { headers: { 'cache-control': 'private, max-age=30' } });
	}
	const lista = lerEmbedSpotify(html) ?? { titulo: '', faixas: [] };
	return json(lista, { headers: { 'cache-control': lista.faixas.length ? 'private, max-age=3600' : 'private, max-age=60' } });
};
