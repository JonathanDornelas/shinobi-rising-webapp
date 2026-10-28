import { describe, expect, it } from 'vitest';
import { REF_LISTA_SPOTIFY, lerEmbedSpotify } from './embed-spotify.ts';

const pagina = (entidade: unknown) => `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { state: { data: { entity: entidade } } } } })}</script></body></html>`;

describe('faixas do embed do Spotify', () => {
	it('lê título, artista e duração de cada faixa', () => {
		const l = lerEmbedSpotify(
			pagina({
				name: 'Tema da vila',
				trackList: [
					{ uri: 'spotify:track:2sFepQNyl1WjpROruP8bJ0', title: 'Housewife', subtitle: 'Tate McRae', duration: 208810 },
					{ uri: 'spotify:episode:4rOoJ6Egrf8K2IrywzwOMk', title: 'Episódio 2', subtitle: 'Podcast', duration: 1000 }
				]
			})
		);
		expect(l?.titulo).toBe('Tema da vila');
		expect(l?.faixas).toEqual([
			{ uri: 'spotify:track:2sFepQNyl1WjpROruP8bJ0', titulo: 'Housewife', artista: 'Tate McRae', duracao: 208810 },
			{ uri: 'spotify:episode:4rOoJ6Egrf8K2IrywzwOMk', titulo: 'Episódio 2', artista: 'Podcast', duracao: 1000 }
		]);
	});

	it('ignora o que não é faixa e limita o tamanho', () => {
		const l = lerEmbedSpotify(
			pagina({
				name: 'x',
				trackList: [{ uri: 'spotify:artist:abc' }, { uri: 'https://x.com' }, null, { uri: 'spotify:track:2sFepQNyl1WjpROruP8bJ0' }, ...Array.from({ length: 400 }, () => ({ uri: 'spotify:track:2sFepQNyl1WjpROruP8bJ0', title: 't'.repeat(500) }))]
			})
		);
		expect(l?.faixas).toHaveLength(300);
		expect(l?.faixas[0]).toMatchObject({ titulo: 'Sem título', artista: '', duracao: 0 });
		expect(l?.faixas[1].titulo).toHaveLength(160);
	});

	it('devolve nulo quando o formato mudou ou a página não tem os dados', () => {
		expect(lerEmbedSpotify('<html></html>')).toBeNull();
		expect(lerEmbedSpotify('<script id="__NEXT_DATA__" type="application/json">{quebrado</script>')).toBeNull();
		expect(lerEmbedSpotify(pagina({ name: 'sem lista' }))).toBeNull();
	});

	it('só aceita ids de playlist, álbum, podcast e artista', () => {
		for (const ok of ['playlist/37i9dQZF1DXcBWIGoYBM5M', 'album/1DFixLWuPkv3KT3TnV35m3', 'show/4rOoJ6Egrf8K2IrywzwOMk', 'artist/0TnOYISbd1XYRBk9myaseg']) expect(REF_LISTA_SPOTIFY.test(ok), ok).toBe(true);
		for (const ruim of ['track/2sFepQNyl1WjpROruP8bJ0', 'playlist/../etc', 'playlist/curto', 'https://x.com/a', 'playlist/37i9dQZF1DXcBWIGoYBM5M?x=1']) expect(REF_LISTA_SPOTIFY.test(ruim), ruim).toBe(false);
	});
});
